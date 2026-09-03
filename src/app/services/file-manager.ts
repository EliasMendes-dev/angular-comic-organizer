/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Injectable, NgZone, signal } from '@angular/core';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { ComicEdition } from '../models/comic-edition';
import { ComicPage } from '../models/comic-page';
import { ConversionType } from '../models/conversion-type';
import { WebArchiveService } from './web-archive';
import { Subject } from 'rxjs';

// Compara nomes com numeros usando ordem natural: "10" vem depois de "2".
function naturalCompare(a: string, b: string): number {
  const regex = /(\d+)/g;
  const aParts = a.matchAll(regex);
  const bParts = b.matchAll(regex);

  const aTokens = Array.from(aParts, (match) => match[0]);
  const bTokens = Array.from(bParts, (match) => match[0]);

  const maxLength = Math.max(aTokens.length, bTokens.length);

  for (let index = 0; index < maxLength; index += 1) {
    const aToken = aTokens[index];
    const bToken = bTokens[index];

    if (aToken === undefined) return -1;
    if (bToken === undefined) return 1;

    const aIsNumber = /^\d+$/.test(aToken);
    const bIsNumber = /^\d+$/.test(bToken);

    if (aIsNumber && bIsNumber) {
      const diff = Number(aToken) - Number(bToken);
      if (diff !== 0) return diff;
      continue;
    }

    const diff = aToken.localeCompare(bToken);
    if (diff !== 0) return diff;
  }

  return a.localeCompare(b);
}

// Ajusta as edicoes vindas do backend para o formato esperado pela interface.
export function mapBackendEditionsToExplorerModel(editions: ComicEdition[]): ComicEdition[] {
  return editions
    .map((edition) => ({
      ...edition,
      pages: edition.pages.map((page) => ({
        ...page,
        selected: false,
      })),
    }))
    .sort((left, right) => naturalCompare(left.title, right.title));
}

// Estado principal da biblioteca carregada na tela de exploracao.
interface LibraryState {
  editions: ComicEdition[];
  activeEditionIds: ReadonlySet<number>;
}

@Injectable({
  providedIn: 'root',
})
export class FileManagerService {
  // Armazena as edicoes carregadas e quais delas estao selecionadas.
  readonly libraryState = signal<LibraryState>({
    editions: [],
    activeEditionIds: new Set<number>(),
  });
  // Evita reimportar os mesmos caminhos de origem duas vezes.
  selectedSourcePaths = new Map<string, string>();
  // Mantem arquivos do navegador para o modo web, onde nao existe backend nativo.
  readonly webFiles = new Map<string, File>();

  // Sinal discreto para avisar outros componentes que a lista mudou.
  private refresh$ = new Subject<void>();

  async saveOrder(editions: ComicEdition[]): Promise<void> {
    if (!isTauri()) return;

    try {
      await invoke('save_edition_order', { editions });
    } catch (error) {
      console.error('Erro ao salvar a ordem das edições:', error);
    }
  }

  async deleteEditionFromBackend(editionTitle: string): Promise<void> {
    if (!isTauri()) {
      // No modo web, limpamos as URLs de preview ao remover uma edicao.
      const edition = this.fileEditions.find((e) => e.title === editionTitle);
      if (edition) {
        edition.pages.forEach((p) => URL.revokeObjectURL(p.imagePath));
      }
      for (const [key, file] of Array.from(this.webFiles.entries())) {
        if (this.getEditionTitleFromPath(file.name) === editionTitle) {
          this.webFiles.delete(key);
        }
      }
      return;
    }

    try {
      await invoke('delete_edition_from_temp', { editionTitle });
    } catch (error) {
      console.error('Erro ao remover a edição do backend:', error);
    }
  }

  async clearAllTempEditions(): Promise<void> {
    if (!isTauri()) {
      // No modo web, liberamos tudo que foi criado em memoria.
      this.fileEditions.forEach((e) => {
        e.pages.forEach((p) => URL.revokeObjectURL(p.imagePath));
      });
      this.webFiles.clear();
      return;
    }

    try {
      await invoke('clear_all_temp_editions');
    } catch (error) {
      console.error('Erro ao limpar o diretório temporário:', error);
    }
  }

  constructor(
    private ngZone: NgZone,
    private webArchiveService: WebArchiveService,
  ) {}

  get refreshChanges() {
    // Expoe o observable usado pelos componentes para reagir a recarregamentos.
    return this.refresh$.asObservable();
  }

  get fileEditions(): ComicEdition[] {
    // Leitura direta da lista de edicoes carregadas.
    return this.libraryState().editions;
  }

  set fileEditions(editions: ComicEdition[]) {
    // Atualiza somente a lista de edicoes, preservando o resto do estado.
    this.libraryState.update((state) => ({ ...state, editions }));
  }

  get activeEditionIds(): ReadonlySet<number> {
    // Retorna os ids das edicoes que o usuario marcou para acao em lote.
    return this.libraryState().activeEditionIds;
  }

  toggleEditionSelection(editionId: number): void {
    // Alterna a selecao de uma edicao na lista.
    this.libraryState.update((state) => {
      const activeEditionIds = new Set(state.activeEditionIds);

      if (activeEditionIds.has(editionId)) {
        activeEditionIds.delete(editionId);
      } else {
        activeEditionIds.add(editionId);
      }

      return { ...state, activeEditionIds };
    });
  }

  clearEditionSelection(): void {
    // Remove todas as selecoes de uma vez.
    this.libraryState.update((state) => ({ ...state, activeEditionIds: new Set<number>() }));
  }

  removeEditionFromSelection(editionId: number): void {
    // Remove apenas uma edicao da selecao atual.
    this.libraryState.update((state) => {
      const activeEditionIds = new Set(state.activeEditionIds);
      activeEditionIds.delete(editionId);

      return { ...state, activeEditionIds };
    });
  }

  selectAllEditions(): void {
    // Marca todas as edicoes carregadas para operar em lote.
    this.libraryState.update((state) => ({
      ...state,
      activeEditionIds: new Set(state.editions.map((edition) => edition.id)),
    }));
  }

  loadEditionsFromBackend(editions: ComicEdition[]): void {
    this.ngZone.run(() => {
      // Normaliza o retorno e junta com o que ja existe na tela.
      const newEditions = mapBackendEditionsToExplorerModel(editions);
      const existingTitles = new Set(this.fileEditions.map((edition) => edition.title));

      this.fileEditions = [...this.fileEditions, ...newEditions.filter((edition) => !existingTitles.has(edition.title))].sort((left, right) =>
        naturalCompare(left.title, right.title),
      );
      this.clearEditionSelection();

      // Dispara uma atualizacao para forcar a interface a renderizar o novo estado.
      this.refresh$.next();
    });
  }

  getNewSourcePaths(paths: string[]): string[] {
    // Remove repeticoes e filtra o que ja foi importado anteriormente.
    const uniquePaths = Array.from(new Set(paths));
    return uniquePaths.filter((path) => !this.selectedSourcePaths.has(path));
  }

  addSourcePaths(paths: string[]): void {
    // Registra cada caminho original junto com o titulo derivado do arquivo.
    paths.forEach((path) => {
      const title = this.getEditionTitleFromPath(path);
      this.selectedSourcePaths.set(path, title);
    });
  }

  removeSourcePathsByTitle(title: string): void {
    // Remove caminhos e arquivos web associados ao titulo informado.
    for (const [path, storedTitle] of Array.from(this.selectedSourcePaths.entries())) {
      if (storedTitle === title) {
        this.selectedSourcePaths.delete(path);
        this.webFiles.delete(path);
      }
    }
  }

  clearSourcePaths(): void {
    // Limpa toda a memoria de caminhos de origem.
    this.selectedSourcePaths.clear();
    this.webFiles.clear();
  }

  private getEditionTitleFromPath(path: string): string {
    // Usa o nome do arquivo sem extensao como titulo base da edicao.
    const fileName = path.split(/[/\\]/).pop() ?? '';
    return fileName.replace(/\.[^.]+$/, '');
  }

  getWebFile(fileName: string): File | undefined {
    return this.webFiles.get(fileName);
  }

  async createWebEditions(fileNames: string[]): Promise<ComicEdition[]> {
    // No navegador, converte os arquivos selecionados em edicoes com paginas extraidas.
    const editions: ComicEdition[] = [];

    for (let index = 0; index < fileNames.length; index += 1) {
      const name = fileNames[index];
      const file = this.webFiles.get(name);
      const title = this.getEditionTitleFromPath(name);
      let pages: ComicPage[] = [];

      if (file) {
        try {
          pages = await this.webArchiveService.extractPages(file);
        } catch (error) {
          console.error(`Erro ao extrair páginas de ${name}:`, error);
        }
      }

      editions.push({
        id: Date.now() + index,
        title,
        pages,
        originalFile: file,
        selected: false,
        expanded: false,
      });
    }

    return editions;
  }

  async selectFiles(conversion: ConversionType): Promise<string[]> {
    // Filtra a extensao esperada conforme o fluxo escolhido.
    const extensions = conversion === 'cbr-to-cbz' ? ['cbr'] : ['cbz'];

    if (isTauri()) {
      try {
        // No app desktop usamos o seletor nativo de arquivos.
        const files = await open({
          multiple: true,
          filters: [
            {
              name: 'Comic Books',
              extensions,
            },
          ],
        });

        if (!files) return [];

        return Array.isArray(files) ? files : [files];
      } catch (err) {
        console.error('Erro ao selecionar arquivos no Tauri:', err);
        return [];
      }
    }

    return this.selectFilesFromBrowser(extensions);
  }

  private selectFilesFromBrowser(extensions: string[]): Promise<string[]> {
    // No navegador, criamos um input escondido para abrir o seletor de arquivos.
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = extensions.map((ext) => `.${ext}`).join(',');

      input.onchange = () => {
        const fileList = input.files;
        if (!fileList || fileList.length === 0) {
          resolve([]);
          return;
        }

        const files = Array.from(fileList);
        for (const file of files) {
          this.webFiles.set(file.name, file);
        }

        resolve(files.map((file) => file.name));
      };

      input.oncancel = () => {
        resolve([]);
      };

      input.click();
    });
  }
}

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

interface LibraryState {
  editions: ComicEdition[];
  activeEditionIds: ReadonlySet<number>;
}

@Injectable({
  providedIn: 'root',
})
export class FileManagerService {
  readonly libraryState = signal<LibraryState>({
    editions: [],
    activeEditionIds: new Set<number>(),
  });
  selectedSourcePaths = new Map<string, string>();
  readonly webFiles = new Map<string, File>();

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
    return this.refresh$.asObservable();
  }

  get fileEditions(): ComicEdition[] {
    return this.libraryState().editions;
  }

  set fileEditions(editions: ComicEdition[]) {
    this.libraryState.update((state) => ({ ...state, editions }));
  }

  get activeEditionIds(): ReadonlySet<number> {
    return this.libraryState().activeEditionIds;
  }

  toggleEditionSelection(editionId: number): void {
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
    this.libraryState.update((state) => ({ ...state, activeEditionIds: new Set<number>() }));
  }

  removeEditionFromSelection(editionId: number): void {
    this.libraryState.update((state) => {
      const activeEditionIds = new Set(state.activeEditionIds);
      activeEditionIds.delete(editionId);

      return { ...state, activeEditionIds };
    });
  }

  selectAllEditions(): void {
    this.libraryState.update((state) => ({
      ...state,
      activeEditionIds: new Set(state.editions.map((edition) => edition.id)),
    }));
  }

  loadEditionsFromBackend(editions: ComicEdition[]): void {
    this.ngZone.run(() => {
      const newEditions = mapBackendEditionsToExplorerModel(editions);
      const existingTitles = new Set(this.fileEditions.map((edition) => edition.title));

      this.fileEditions = [...this.fileEditions, ...newEditions.filter((edition) => !existingTitles.has(edition.title))].sort((left, right) =>
        naturalCompare(left.title, right.title),
      );
      this.clearEditionSelection();

      // 🔥 trigger correto
      this.refresh$.next();
    });
  }

  getNewSourcePaths(paths: string[]): string[] {
    const uniquePaths = Array.from(new Set(paths));
    return uniquePaths.filter((path) => !this.selectedSourcePaths.has(path));
  }

  addSourcePaths(paths: string[]): void {
    paths.forEach((path) => {
      const title = this.getEditionTitleFromPath(path);
      this.selectedSourcePaths.set(path, title);
    });
  }

  removeSourcePathsByTitle(title: string): void {
    for (const [path, storedTitle] of Array.from(this.selectedSourcePaths.entries())) {
      if (storedTitle === title) {
        this.selectedSourcePaths.delete(path);
        this.webFiles.delete(path);
      }
    }
  }

  clearSourcePaths(): void {
    this.selectedSourcePaths.clear();
    this.webFiles.clear();
  }

  private getEditionTitleFromPath(path: string): string {
    const fileName = path.split(/[/\\]/).pop() ?? '';
    return fileName.replace(/\.[^.]+$/, '');
  }

  getWebFile(fileName: string): File | undefined {
    return this.webFiles.get(fileName);
  }

  async createWebEditions(fileNames: string[]): Promise<ComicEdition[]> {
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
    const extensions = conversion === 'cbr-to-cbz' ? ['cbr'] : ['cbz'];

    if (isTauri()) {
      try {
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

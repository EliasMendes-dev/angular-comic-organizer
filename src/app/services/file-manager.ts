import { Injectable, NgZone } from '@angular/core';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { ComicEdition } from '../models/comic-edition';
import { ConversionType } from '../models/conversion-type';
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

@Injectable({
  providedIn: 'root',
})
export class FileManagerService {
  fileEditions: ComicEdition[] = [];
  activeEditionIds = new Set<number>();
  selectedSourcePaths = new Map<string, string>();

  private refresh$ = new Subject<void>();

  async saveOrder(editions: ComicEdition[]): Promise<void> {
    try {
      await invoke('save_edition_order', { editions });
    } catch (error) {
      console.error('Erro ao salvar a ordem das edições:', error);
    }
  }

  async deleteEditionFromBackend(editionTitle: string): Promise<void> {
    try {
      await invoke('delete_edition_from_temp', { editionTitle });
    } catch (error) {
      console.error('Erro ao remover a edição do backend:', error);
    }
  }

  async clearAllTempEditions(): Promise<void> {
    try {
      await invoke('clear_all_temp_editions');
    } catch (error) {
      console.error('Erro ao limpar o diretório temporário:', error);
    }
  }

  constructor(private ngZone: NgZone) {}

  get refreshChanges() {
    return this.refresh$.asObservable();
  }

  loadEditionsFromBackend(editions: ComicEdition[]): void {
    this.ngZone.run(() => {
      const newEditions = mapBackendEditionsToExplorerModel(editions);
      const existingTitles = new Set(this.fileEditions.map((edition) => edition.title));

      this.fileEditions = [...this.fileEditions, ...newEditions.filter((edition) => !existingTitles.has(edition.title))].sort((left, right) =>
        naturalCompare(left.title, right.title),
      );
      this.activeEditionIds.clear();

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
      }
    }
  }

  clearSourcePaths(): void {
    this.selectedSourcePaths.clear();
  }

  private getEditionTitleFromPath(path: string): string {
    const fileName = path.split(/[/\\]/).pop() ?? '';
    return fileName.replace(/\.[^.]+$/, '');
  }

  async selectFiles(conversion: ConversionType): Promise<string[]> {
    const extensions = conversion === 'cbr-to-cbz' ? ['cbr'] : ['cbz'];

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
      console.error('Erro ao selecionar arquivos:', err);
      return [];
    }
  }
}

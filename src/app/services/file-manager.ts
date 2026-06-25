import { Injectable } from '@angular/core';
import { open } from '@tauri-apps/plugin-dialog';
import { ComicEdition } from '../models/comic-edition';

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {

  fileEditions: ComicEdition[] = [];

  activeEditionIds = new Set<number>();

  constructor() {}

  async selectCbrFiles(): Promise<string[]> {
    try {
      const files = await open({
        multiple: true,
        filters: [
          {
            name: 'Comic Books',
            extensions: ['cbr']
          }
        ]
      });

      if (!files) return [];

      if (Array.isArray(files)) {
        return files;
      }

      return [files];
    } catch (err) {
      console.error('Erro ao selecionar arquivos:', err);
      return [];
    }
  }
}

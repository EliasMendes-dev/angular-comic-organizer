import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';

interface PageData {
  bytes: number[];
  mime: string;
}

@Injectable({
  providedIn: 'root',
})
export class PageLoaderService {
  private cache = new Map<string, string>();

  async load(path: string): Promise<string> {
    // 1. Se a imagem já foi aberta, retorna da RAM instantaneamente (Delay Zero)
    if (this.cache.has(path)) {
      return this.cache.get(path)!;
    }

    try {
      // 2. Se é a primeira vez, busca no Rust
      const page = await invoke<PageData>('load_page', { path });
      const blob = new Blob([new Uint8Array(page.bytes)], { type: page.mime });
      const url = URL.createObjectURL(blob);

      // 3. Salva no cache para a próxima vez
      this.cache.set(path, url);
      return url;
    } catch (error) {
      console.error('Erro ao carregar página do Rust:', error);
      return '';
    }
  }

  async preload(path: string): Promise<void> {
    if (this.cache.has(path)) {
      return;
    }

    try {
      const page = await invoke<PageData>('load_page', { path });
      const blob = new Blob([new Uint8Array(page.bytes)], { type: page.mime });
      this.cache.set(path, URL.createObjectURL(blob));
    } catch (error) {
      // Falhas no preload são ignoradas para não poluir o console
    }
  }

  clearCache(): void {
    this.cache.forEach(url => URL.revokeObjectURL(url));
    this.cache.clear();
  }
}

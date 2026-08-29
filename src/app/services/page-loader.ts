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
  private pendingLoads = new Map<string, Promise<string>>();
  private readonly maxCachedPages = 5;
  private cacheGeneration = 0;

  async load(path: string): Promise<string> {
    try {
      return await this.getOrLoad(path);
    } catch (error) {
      console.error('Erro ao carregar pagina do Rust:', error);
      return '';
    }
  }

  async preload(path: string): Promise<void> {
    try {
      await this.getOrLoad(path);
    } catch {
      // Preloading is best effort.
    }
  }

  clearCache(): void {
    this.cacheGeneration += 1;
    this.pendingLoads.clear();
    this.cache.forEach((url) => URL.revokeObjectURL(url));
    this.cache.clear();
  }

  private getOrLoad(path: string): Promise<string> {
    const cachedUrl = this.cache.get(path);
    if (cachedUrl) {
      this.touch(path, cachedUrl);
      return Promise.resolve(cachedUrl);
    }

    const pending = this.pendingLoads.get(path);
    if (pending) {
      return pending;
    }

    const request = this.loadAndCache(path, this.cacheGeneration);
    this.pendingLoads.set(path, request);

    const clearPending = (): void => {
      if (this.pendingLoads.get(path) === request) {
        this.pendingLoads.delete(path);
      }
    };

    request.then(clearPending, clearPending);
    return request;
  }

  private async loadAndCache(path: string, generation: number): Promise<string> {
    const page = await invoke<PageData>('load_page', { path });
    const blob = new Blob([new Uint8Array(page.bytes)], { type: page.mime });
    const url = URL.createObjectURL(blob);

    try {
      const image = new Image();
      image.src = url;
      await image.decode();

      if (generation !== this.cacheGeneration) {
        URL.revokeObjectURL(url);
        return '';
      }

      this.touch(path, url);
      this.evictOldPages();
      return url;
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
  }

  private touch(path: string, url: string): void {
    this.cache.delete(path);
    this.cache.set(path, url);
  }

  private evictOldPages(): void {
    while (this.cache.size > this.maxCachedPages) {
      const oldestPath = this.cache.keys().next().value as string | undefined;
      if (!oldestPath) {
        return;
      }

      const oldestUrl = this.cache.get(oldestPath);
      if (oldestUrl) {
        URL.revokeObjectURL(oldestUrl);
      }
      this.cache.delete(oldestPath);
    }
  }
}

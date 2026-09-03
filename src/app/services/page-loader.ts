/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Injectable } from '@angular/core';
import { invoke, isTauri } from '@tauri-apps/api/core';

interface PageData {
  bytes: number[];
  mime: string;
}

@Injectable({
  providedIn: 'root',
})
export class PageLoaderService {
  // Cache de URLs geradas para evitar recarregar a mesma imagem varias vezes.
  private cache = new Map<string, string>();
  // Mantem promessas em andamento para o mesmo arquivo sem duplicar requisicoes.
  private pendingLoads = new Map<string, Promise<string>>();
  // Limite simples para nao crescer a memoria sem controle.
  private readonly maxCachedPages = 5;
  // Sempre que o cache e limpo, aumentamos a geracao para invalidar loads antigos.
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
      // Precarregamento e apenas uma tentativa: nao bloqueia a interface.
    }
  }

  preloadAround(paths: string[], currentIndex: number): void {
    // Precarrega a pagina anterior e a proxima para deixar a navegacao mais fluida.
    for (const offset of [-1, 1]) {
      const adjacentPath = paths[currentIndex + offset];
      if (adjacentPath) {
        void this.preload(adjacentPath);
      }
    }
  }

  clearCache(): void {
    // Descarta URLs antigas e invalida cargas pendentes da geracao anterior.
    this.cacheGeneration += 1;
    this.pendingLoads.clear();
    this.cache.forEach((url) => URL.revokeObjectURL(url));
    this.cache.clear();
  }

  private getOrLoad(path: string): Promise<string> {
    // Se a pagina ja estiver em cache, reutiliza a mesma URL.
    const cachedUrl = this.cache.get(path);
    if (cachedUrl) {
      this.touch(path, cachedUrl);
      return Promise.resolve(cachedUrl);
    }

    // Se ja houver carregamento em andamento, reaproveita a mesma promessa.
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
    // Blob/data URLs e ambientes sem Tauri ja podem ser usados diretamente.
    if (path.startsWith('blob:') || path.startsWith('data:') || !isTauri()) {
      return path;
    }

    // O backend Rust devolve os bytes da pagina para montar uma URL local.
    const page = await invoke<PageData>('load_page', { path });
    const blob = new Blob([new Uint8Array(page.bytes)], { type: page.mime });
    const url = URL.createObjectURL(blob);

    try {
      // Forca o navegador a validar a imagem antes de colocar no cache.
      const image = new Image();
      image.src = url;
      await image.decode();

      if (generation !== this.cacheGeneration) {
        // Se o cache foi limpo no meio do processo, descartamos a URL criada.
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
    // Move o caminho acessado para o fim do Map, simulando LRU simples.
    this.cache.delete(path);
    this.cache.set(path, url);
  }

  private evictOldPages(): void {
    // Remove as paginas mais antigas quando o cache passa do limite.
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

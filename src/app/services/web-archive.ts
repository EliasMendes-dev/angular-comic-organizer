/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Injectable } from '@angular/core';
import JSZip from 'jszip';
import { createExtractorFromData } from 'node-unrar-js';
import { ComicPage } from '../models/comic-page';

function naturalCompare(a: string, b: string): number {
  const regex = /(\d+)/g;
  const aTokens = Array.from(a.matchAll(regex), (m) => m[0]);
  const bTokens = Array.from(b.matchAll(regex), (m) => m[0]);
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

function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'bmp':
      return 'image/bmp';
    case 'avif':
      return 'image/avif';
    default:
      return 'application/octet-stream';
  }
}

@Injectable({
  providedIn: 'root',
})
export class WebArchiveService {
  private cachedWasmBinary: ArrayBuffer | null = null;

  private async getWasmBinary(): Promise<ArrayBuffer> {
    if (this.cachedWasmBinary) {
      return this.cachedWasmBinary;
    }

    const response = await fetch('/unrar.wasm');
    if (!response.ok) {
      throw new Error(`Não foi possível carregar unrar.wasm: ${response.statusText}`);
    }

    this.cachedWasmBinary = await response.arrayBuffer();
    return this.cachedWasmBinary;
  }

  async extractPages(file: File): Promise<ComicPage[]> {
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.cbr') || lowerName.endsWith('.rar')) {
      return this.extractCbr(file);
    }
    return this.extractCbz(file);
  }

  private async extractCbr(file: File): Promise<ComicPage[]> {
    const wasmBinary = await this.getWasmBinary();
    const data = await file.arrayBuffer();
    const extractor = await createExtractorFromData({ data, wasmBinary });
    const extracted = extractor.extract();

    const rawFiles: { fileName: string; bytes: Uint8Array }[] = [];

    for (const item of extracted.files) {
      const name = item.fileHeader.name;
      if (item.fileHeader.flags.directory) continue;
      if (name.startsWith('__MACOSX') || name.startsWith('.')) continue;
      if (!/\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(name)) continue;

      if (item.extraction) {
        rawFiles.push({ fileName: name, bytes: item.extraction });
      }
    }

    rawFiles.sort((a, b) => naturalCompare(a.fileName, b.fileName));

    return rawFiles.map((item, index) => {
      const cleanName = item.fileName.split(/[/\\]/).pop() ?? item.fileName;
      const blob = new Blob([item.bytes as unknown as BlobPart], { type: getMimeType(cleanName) });
      const imagePath = URL.createObjectURL(blob);

      return {
        id: index + 1,
        fileName: cleanName,
        imagePath,
        pageNumber: index + 1,
      };
    });
  }

  private async extractCbz(file: File): Promise<ComicPage[]> {
    const data = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(data);
    const entries: { fileName: string; entry: JSZip.JSZipObject }[] = [];

    zip.forEach((relativePath, entry) => {
      if (entry.dir) return;
      if (relativePath.startsWith('__MACOSX') || relativePath.startsWith('.')) return;
      if (!/\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(relativePath)) return;

      entries.push({ fileName: relativePath, entry });
    });

    entries.sort((a, b) => naturalCompare(a.fileName, b.fileName));

    const pages: ComicPage[] = [];
    for (let index = 0; index < entries.length; index += 1) {
      const item = entries[index];
      const cleanName = item.fileName.split(/[/\\]/).pop() ?? item.fileName;
      const blob = await item.entry.async('blob');
      const imagePath = URL.createObjectURL(blob);

      pages.push({
        id: index + 1,
        fileName: cleanName,
        imagePath,
        pageNumber: index + 1,
      });
    }

    return pages;
  }

  async generateCbzBlob(
    pages: { fileName: string; imagePath: string }[],
    onProgress?: (percent: number, message: string) => void,
  ): Promise<Blob> {
    const zip = new JSZip();

    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index];
      onProgress?.(
        Math.round(((index + 1) / pages.length) * 50),
        `Empacotando página ${index + 1}/${pages.length}`,
      );

      const response = await fetch(page.imagePath);
      const blob = await response.blob();
      zip.file(page.fileName, blob);
    }

    onProgress?.(50, 'Compactando arquivo .cbz...');

    return await zip.generateAsync({ type: 'blob' }, (metadata) => {
      onProgress?.(
        50 + Math.round(metadata.percent / 2),
        `Compactando: ${Math.round(metadata.percent)}%`,
      );
    });
  }

  async exportToCbz(
    downloadFileName: string,
    pages: { fileName: string; imagePath: string }[],
    onProgress?: (percent: number, message: string) => void,
  ): Promise<void> {
    const zipBlob = await this.generateCbzBlob(pages, onProgress);
    const downloadUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = downloadFileName.endsWith('.cbz') ? downloadFileName : `${downloadFileName}.cbz`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }

  async exportEditionsToWebFolder(
    seriesName: string,
    editions: { fileName: string; pages: { fileName: string; imagePath: string }[] }[],
    onProgress?: (percent: number, message: string) => void,
  ): Promise<'folder' | 'zip' | 'cancelled'> {
    const hasDirectoryPicker = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

    if (hasDirectoryPicker) {
      try {
        const rootHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
        });
        const seriesFolder = await rootHandle.getDirectoryHandle(seriesName, { create: true });

        const total = editions.length;
        for (let i = 0; i < total; i++) {
          const edition = editions[i];
          const cbzBlob = await this.generateCbzBlob(edition.pages, (pct, msg) => {
            const overall = Math.round(((i + pct / 100) / total) * 100);
            onProgress?.(overall, `[${i + 1}/${total}] ${edition.fileName}: ${msg}`);
          });

          const fileHandle = await seriesFolder.getFileHandle(
            edition.fileName.endsWith('.cbz') ? edition.fileName : `${edition.fileName}.cbz`,
            { create: true },
          );
          const writable = await fileHandle.createWritable();
          await writable.write(cbzBlob);
          await writable.close();
        }

        return 'folder';
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return 'cancelled';
        }
        console.warn('showDirectoryPicker não pôde ser usado, usando ZIP como fallback:', err);
      }
    }

    // Fallback para ZIP contendo a pasta da série
    await this.exportAllAsZipBundle(seriesName, editions, onProgress);
    return 'zip';
  }

  async exportAllAsZipBundle(
    seriesName: string,
    editions: { fileName: string; pages: { fileName: string; imagePath: string }[] }[],
    onProgress?: (percent: number, message: string) => void,
  ): Promise<void> {
    const masterZip = new JSZip();
    const folder = masterZip.folder(seriesName) ?? masterZip;
    const total = editions.length;

    for (let i = 0; i < total; i++) {
      const edition = editions[i];
      const cbzBlob = await this.generateCbzBlob(edition.pages, (pct, msg) => {
        const overall = Math.round(((i + pct / 100) / total) * 80);
        onProgress?.(overall, `[${i + 1}/${total}] ${edition.fileName}: ${msg}`);
      });
      const cbzName = edition.fileName.endsWith('.cbz') ? edition.fileName : `${edition.fileName}.cbz`;
      folder.file(cbzName, cbzBlob);
    }

    onProgress?.(85, `Gerando pacote ${seriesName}.zip...`);

    const masterBlob = await masterZip.generateAsync({ type: 'blob' }, (metadata) => {
      onProgress?.(
        85 + Math.round(metadata.percent * 0.15),
        `Finalizando ZIP: ${Math.round(metadata.percent)}%`,
      );
    });

    const downloadUrl = URL.createObjectURL(masterBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${seriesName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }
}

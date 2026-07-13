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

  async load(path: string): Promise<string> {

    const page = await invoke<PageData>('load_page', {
      path,
    });

    const blob = new Blob(
      [new Uint8Array(page.bytes)],
      {
        type: page.mime,
      },
    );

    return URL.createObjectURL(blob);
  }
}

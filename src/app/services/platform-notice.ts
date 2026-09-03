/*
Required Notice: Copyright (C) 2026 Jose Elias Herminio Mendes - Projeto Comic Organizer
*/

import { Injectable, signal } from '@angular/core';

export type WebNoticeKind = 'cbr-export';

@Injectable({
  providedIn: 'root',
})
export class PlatformNoticeService {
  readonly activeNotice = signal<WebNoticeKind | null>(null);

  showCbrExportNotice(): void {
    this.activeNotice.set('cbr-export');
  }

  close(): void {
    this.activeNotice.set(null);
  }
}

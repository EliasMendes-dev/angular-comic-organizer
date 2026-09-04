/*
Required Notice: Copyright (C) 2026 Jose Elias Herminio Mendes - Projeto Comic Organizer
*/

import { Injectable, signal } from '@angular/core';

export type WebNoticeKind = 'cbr-export';

@Injectable({
  providedIn: 'root',
})
export class PlatformNoticeService {
  // Controla qual aviso deve aparecer na tela, se houver algum.
  readonly activeNotice = signal<WebNoticeKind | null>(null);
  readonly isMobile = this.detectMobileDevice();

  showCbrExportNotice(): void {
    // Exibe a mensagem explicando a limitacao do export para CBR no navegador.
    this.activeNotice.set('cbr-export');
  }

  close(): void {
    // Fecha o aviso e limpa o estado da notificação.
    this.activeNotice.set(null);
  }

  private detectMobileDevice(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }

    return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }
}

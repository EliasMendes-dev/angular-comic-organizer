/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Injectable, signal } from '@angular/core';
import { ComicPage } from '../models/comic-page';

@Injectable({
  providedIn: 'root',
})
export class ComicPreviewStateService {
  selectedPage = signal<ComicPage | null>(null);
  selectedEditionId = signal<number | null>(null);
  openedEditionId = signal<number | null>(null);

  setSelectedPage(page: ComicPage | null, editionId: number | null = null): void {
    this.selectedPage.set(page);
    this.selectedEditionId.set(page ? editionId : null);
  }

  clearSelectedPage(): void {
    this.selectedPage.set(null);
    this.selectedEditionId.set(null);
  }

  setOpenedEdition(editionId: number | null): void {
    this.openedEditionId.set(editionId);
  }
}

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
  // Guarda qual pagina esta aberta na area de preview.
  selectedPage = signal<ComicPage | null>(null);
  // Guarda de qual edicao a pagina selecionada veio.
  selectedEditionId = signal<number | null>(null);
  // Guarda qual edicao esta expandida na lista de arquivos.
  openedEditionId = signal<number | null>(null);

  setSelectedPage(page: ComicPage | null, editionId: number | null = null): void {
    // Atualiza a pagina ativa e amarra ela a edicao correspondente.
    this.selectedPage.set(page);
    this.selectedEditionId.set(page ? editionId : null);
  }

  clearSelectedPage(): void {
    // Limpa a selecao da pagina quando o usuario fecha a edicao.
    this.selectedPage.set(null);
    this.selectedEditionId.set(null);
  }

  setOpenedEdition(editionId: number | null): void {
    // Controla qual edicao esta expandida na interface.
    this.openedEditionId.set(editionId);
  }
}

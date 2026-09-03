/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Component, effect, HostListener, signal } from '@angular/core';
import { LucideEye, LucideImage, LucideX } from '@lucide/angular';
import { ComicPreviewStateService } from '../../services/comic-preview-state';
import { PageLoaderService } from '../../services/page-loader';
import { FileManagerService } from '../../services/file-manager';
import { ComicPage } from '../../models/comic-page';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-comic-preview',
  standalone: true,
  imports: [LucideEye, LucideImage, LucideX, TitleCasePipe],
  templateUrl: './comic-preview.html',
  styleUrls: ['./comic-preview.css', './comic-preview-responsive.css'],
})
export class ComicPreview {
  // URL da imagem atualmente carregada no preview.
  imageUrl = signal<string | null>(null);
  // Controla se o modal de leitura esta aberto.
  isModalOpen = false;
  // Zoom atual da imagem exibida.
  zoom = 1;
  // Deslocamento aplicado quando a imagem esta ampliada.
  dragOffset = { x: 0, y: 0 };
  // Numero de versao para ignorar carregamentos antigos.
  private loadVersion = 0;
  // Indica se o usuario esta arrastando a imagem ampliada.
  isDragging = false;
  private dragStart = { x: 0, y: 0 };
  private dragOrigin = { x: 0, y: 0 };

  // Limites de zoom usados pelo leitor.
  readonly minZoom = 0.5;
  readonly maxZoom = 3;
  readonly zoomStep = 0.25;

  constructor(
    public comicPreviewStateService: ComicPreviewStateService,
    private pageLoader: PageLoaderService,
    private fileManagerService: FileManagerService,
  ) {
    // Reage automaticamente a mudancas da pagina selecionada no estado compartilhado.
    effect(() => {
      const page = this.comicPreviewStateService.selectedPage();

      if (!page) {
        // Se nao ha pagina selecionada, limpamos tudo.
        this.loadVersion += 1;
        this.resetZoom();
        this.imageUrl.set(null);
        return;
      }

      // Cada nova selecao ganha uma versao nova para evitar corrida de carregamento.
      const version = ++this.loadVersion;
      this.imageUrl.set(null);
      void this.loadImage(page.imagePath, version);
    });
  }

  private async loadImage(path: string, version: number): Promise<void> {
    // Carrega a imagem e ignora o resultado se uma selecao nova tiver ocorrido depois.
    const imageUrl = await this.pageLoader.load(path);

    if (version !== this.loadVersion) {
      return;
    }

    this.resetZoom();
    this.imageUrl.set(imageUrl || null);
  }

  openModal(): void {
    // Abre o leitor ampliado apenas quando existe uma pagina ativa.
    if (this.comicPreviewStateService.selectedPage()) {
      this.isModalOpen = true;
    }
  }

  closeModal(): void {
    // Fecha o modal e cancela qualquer arraste em andamento.
    this.isModalOpen = false;
    this.stopDragging();
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event'])
  handleModalNavigation(event: KeyboardEvent): void {
    // Navegacao por teclado so faz sentido quando o modal esta aberto.
    if (!this.isModalOpen) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigatePage('next');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigatePage('previous');
    }
  }

  @HostListener('document:pointermove', ['$event'])
  handleDocumentPointerMove(event: PointerEvent): void {
    // Atualiza o arraste da imagem enquanto o usuario move o ponteiro.
    this.dragImage(event);
  }

  @HostListener('document:pointerup')
  handleDocumentPointerUp(): void {
    this.stopDragging();
  }

  @HostListener('document:pointercancel')
  handleDocumentPointerCancel(): void {
    this.stopDragging();
  }

  @HostListener('window:resize')
  handleWindowResize(): void {
    // Redimensionar a janela zera o arraste para evitar desalinhamento.
    if (!this.isModalOpen) {
      return;
    }

    this.dragOffset = { x: 0, y: 0 };
    this.stopDragging();
  }

  navigatePage(direction: 'next' | 'previous'): void {
    // Troca a pagina exibida respeitando a ordem da edicao atual.
    if (!this.isModalOpen) {
      return;
    }

    const editionId = this.comicPreviewStateService.selectedEditionId();
    const currentPage = this.comicPreviewStateService.selectedPage();
    const edition = this.fileManagerService.fileEditions.find((item) => item.id === editionId);

    if (!edition || !currentPage) {
      return;
    }

    const currentIndex = edition.pages.findIndex((page) => page.id === currentPage.id);
    if (currentIndex < 0) {
      return;
    }

    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    const targetPage: ComicPage | undefined = edition.pages[targetIndex];

    if (targetPage) {
      this.comicPreviewStateService.setSelectedPage(targetPage, edition.id);
      this.pageLoader.preloadAround(
        edition.pages.map((editionPage) => editionPage.imagePath),
        targetIndex,
      );
    }
  }

  get zoomPercent(): number {
    // Converte o zoom decimal em porcentagem para a interface.
    return Math.round(this.zoom * 100);
  }

  get imageTransform(): string {
    // Monta o transform CSS com translacao e escala.
    return `translate(${this.dragOffset.x}px, ${this.dragOffset.y}px) scale(${this.zoom})`;
  }

  zoomIn(): void {
    // Aumenta o zoom em passos pequenos.
    this.setZoom(this.zoom + this.zoomStep);
  }

  zoomOut(): void {
    // Diminui o zoom em passos pequenos.
    this.setZoom(this.zoom - this.zoomStep);
  }

  resetZoom(): void {
    // Restaura a imagem para o estado padrao.
    this.zoom = 1;
    this.dragOffset = { x: 0, y: 0 };
  }

  handleZoomWheel(event: WheelEvent): void {
    // O scroll do mouse tambem pode controlar o zoom.
    event.preventDefault();
    this.setZoom(this.zoom + (event.deltaY < 0 ? this.zoomStep : -this.zoomStep));
  }

  startDragging(event: PointerEvent): void {
    // Arrastar so faz sentido quando a imagem esta ampliada.
    if (this.zoom <= 1 || event.button !== 0) {
      return;
    }

    event.preventDefault();
    this.isDragging = true;
    this.dragStart = { x: event.clientX, y: event.clientY };
    this.dragOrigin = { ...this.dragOffset };
  }

  dragImage(event: PointerEvent): void {
    // Calcula o deslocamento relativo a posicao inicial do arraste.
    if (!this.isDragging) {
      return;
    }

    this.dragOffset = {
      x: this.dragOrigin.x + event.clientX - this.dragStart.x,
      y: this.dragOrigin.y + event.clientY - this.dragStart.y,
    };
  }

  stopDragging(): void {
    // Finaliza o arraste atual.
    this.isDragging = false;
  }

  private setZoom(value: number): void {
    // Mantem o zoom dentro dos limites definidos pelo componente.
    this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, value));

    if (this.zoom <= 1) {
      // Quando volta ao tamanho normal, centralizamos novamente.
      this.dragOffset = { x: 0, y: 0 };
    }
  }
}

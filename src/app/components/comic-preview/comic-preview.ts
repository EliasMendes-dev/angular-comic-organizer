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
  imageUrl = signal<string | null>(null);
  isModalOpen = false;
  zoom = 1;
  dragOffset = { x: 0, y: 0 };
  private loadVersion = 0;
  isDragging = false;
  private dragStart = { x: 0, y: 0 };
  private dragOrigin = { x: 0, y: 0 };

  readonly minZoom = 0.5;
  readonly maxZoom = 3;
  readonly zoomStep = 0.25;

  constructor(
    public comicPreviewStateService: ComicPreviewStateService,
    private pageLoader: PageLoaderService,
    private fileManagerService: FileManagerService,
  ) {
    effect(() => {
      const page = this.comicPreviewStateService.selectedPage();

      if (!page) {
        this.loadVersion += 1;
        this.resetZoom();
        this.imageUrl.set(null);
        return;
      }

      const version = ++this.loadVersion;
      this.imageUrl.set(null);
      void this.loadImage(page.imagePath, version);
    });
  }

  private async loadImage(path: string, version: number): Promise<void> {
    const imageUrl = await this.pageLoader.load(path);

    if (version !== this.loadVersion) {
      return;
    }

    this.resetZoom();
    this.imageUrl.set(imageUrl || null);
  }

  openModal(): void {
    if (this.comicPreviewStateService.selectedPage()) {
      this.isModalOpen = true;
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.stopDragging();
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    this.closeModal();
  }

  @HostListener('document:keydown', ['$event'])
  handleModalNavigation(event: KeyboardEvent): void {
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
    if (!this.isModalOpen) {
      return;
    }

    this.dragOffset = { x: 0, y: 0 };
    this.stopDragging();
  }

  navigatePage(direction: 'next' | 'previous'): void {
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
    return Math.round(this.zoom * 100);
  }

  get imageTransform(): string {
    return `translate(${this.dragOffset.x}px, ${this.dragOffset.y}px) scale(${this.zoom})`;
  }

  zoomIn(): void {
    this.setZoom(this.zoom + this.zoomStep);
  }

  zoomOut(): void {
    this.setZoom(this.zoom - this.zoomStep);
  }

  resetZoom(): void {
    this.zoom = 1;
    this.dragOffset = { x: 0, y: 0 };
  }

  handleZoomWheel(event: WheelEvent): void {
    event.preventDefault();
    this.setZoom(this.zoom + (event.deltaY < 0 ? this.zoomStep : -this.zoomStep));
  }

  startDragging(event: PointerEvent): void {
    if (this.zoom <= 1 || event.button !== 0) {
      return;
    }

    event.preventDefault();
    this.isDragging = true;
    this.dragStart = { x: event.clientX, y: event.clientY };
    this.dragOrigin = { ...this.dragOffset };
  }

  dragImage(event: PointerEvent): void {
    if (!this.isDragging) {
      return;
    }

    this.dragOffset = {
      x: this.dragOrigin.x + event.clientX - this.dragStart.x,
      y: this.dragOrigin.y + event.clientY - this.dragStart.y,
    };
  }

  stopDragging(): void {
    this.isDragging = false;
  }

  private setZoom(value: number): void {
    this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, value));

    if (this.zoom <= 1) {
      this.dragOffset = { x: 0, y: 0 };
    }
  }
}

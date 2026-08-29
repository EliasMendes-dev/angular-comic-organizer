import { Component, effect, ChangeDetectorRef, HostListener } from '@angular/core';
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
  imageUrl: string | null = null;
  isModalOpen = false;
  private loadVersion = 0;

  constructor(
    public comicPreviewStateService: ComicPreviewStateService,
    private pageLoader: PageLoaderService,
    private fileManagerService: FileManagerService,
    private cdr: ChangeDetectorRef,
  ) {
    effect(() => {
      const page = this.comicPreviewStateService.selectedPage();

      if (!page) {
        this.loadVersion += 1;
        this.imageUrl = null;
        return;
      }

      const version = ++this.loadVersion;
      void this.loadImage(page.imagePath, version);
    });
  }

  private async loadImage(path: string, version: number): Promise<void> {
    const imageUrl = await this.pageLoader.load(path);

    if (version !== this.loadVersion) {
      return;
    }

    this.imageUrl = imageUrl || null;
    this.cdr.detectChanges();
  }

  openModal(): void {
    if (this.comicPreviewStateService.selectedPage()) {
      this.isModalOpen = true;
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
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
    }
  }
}

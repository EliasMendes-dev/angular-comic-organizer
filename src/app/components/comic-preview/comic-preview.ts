import { Component, effect, ChangeDetectorRef } from '@angular/core';
import { LucideEye, LucideImage } from '@lucide/angular';
import { ComicPreviewStateService } from '../../services/comic-preview-state';
import { PageLoaderService } from '../../services/page-loader';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-comic-preview',
  standalone: true,
  imports: [LucideEye, LucideImage, TitleCasePipe],
  templateUrl: './comic-preview.html',
  styleUrls: ['./comic-preview.css', './comic-preview-responsive.css'],
})
export class ComicPreview {
  imageUrl: string | null = null;

  constructor(
    public comicPreviewStateService: ComicPreviewStateService,
    private pageLoader: PageLoaderService,
    private cdr: ChangeDetectorRef,
  ) {
    effect(() => {
      const page = this.comicPreviewStateService.selectedPage();

      if (!page) {
        this.imageUrl = null;
        return;
      }

      this.loadImage(page.imagePath);
    });
  }

  private async loadImage(path: string) {
    this.imageUrl = await this.pageLoader.load(path);
    this.cdr.detectChanges();
  }
}

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
  private loadVersion = 0;

  constructor(
    public comicPreviewStateService: ComicPreviewStateService,
    private pageLoader: PageLoaderService,
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
}

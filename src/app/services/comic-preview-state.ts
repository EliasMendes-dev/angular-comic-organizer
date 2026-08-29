import { Injectable, signal } from '@angular/core';
import { ComicPage } from '../models/comic-page';

@Injectable({
  providedIn: 'root',
})
export class ComicPreviewStateService {
  selectedPage = signal<ComicPage | null>(null);
  selectedEditionId = signal<number | null>(null);

  setSelectedPage(page: ComicPage | null, editionId: number | null = null): void {
    this.selectedPage.set(page);
    this.selectedEditionId.set(page ? editionId : null);
  }

  clearSelectedPage(): void {
    this.selectedPage.set(null);
    this.selectedEditionId.set(null);
  }
}

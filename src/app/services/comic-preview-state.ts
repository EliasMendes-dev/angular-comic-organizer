import { Injectable, signal } from '@angular/core';
import { ComicPage } from '../models/comic-page';

@Injectable({
  providedIn: 'root',
})
export class ComicPreviewStateService {
  selectedPage = signal<ComicPage | null>(null);

  setSelectedPage(page: ComicPage | null): void {
    this.selectedPage.set(page);
  }

  clearSelectedPage(): void {
    this.selectedPage.set(null);
  }
}

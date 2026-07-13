import { Injectable } from '@angular/core';
import { ComicPage } from '../models/comic-page';

@Injectable({
  providedIn: 'root',
})
export class ComicPreviewStateService {
  selectedPage: ComicPage | null = null;

  setSelectedPage(page: ComicPage | null): void {
    this.selectedPage = page;
  }

  clearSelectedPage(): void {
    this.selectedPage = null;
  }
}

import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { CdkDropList, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ConversionStateService } from '../../services/conversion-state';
import { FileManagerService } from '../../services/file-manager';
import { FileExplorerHeader } from './subcomponents/file-explorer-header/file-explorer-header';
import { FileExplorerEditionItem } from './subcomponents/file-explorer-edition-item/file-explorer-edition-item';
import { ComicEdition } from '../../models/comic-edition';
import { ComicPage } from '../../models/comic-page';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ComicPreviewStateService } from '../../services/comic-preview-state';
import { PageLoaderService } from '../../services/page-loader';

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [CdkDropList, FileExplorerHeader, FileExplorerEditionItem],
  templateUrl: './file-explorer.html',
  styleUrls: ['./file-explorer.css', './file-explorer-responsive.css'],
})
export class FileExplorer implements OnInit, OnDestroy {
  isActive = false;
  openEditionId: number | null = null;
  activePages = new Map<number, number>();
  private sub = new Subscription();

  constructor(
    private conversionStateService: ConversionStateService,
    public fileManagerService: FileManagerService,
    private cdr: ChangeDetectorRef,
    private comicPreviewStateService: ComicPreviewStateService,
    private pageLoader: PageLoaderService,
  ) {
    console.log('Explorer service', this.comicPreviewStateService);
  }

  drop(event: CdkDragDrop<any[]>): void {
    const updated = [...this.fileManagerService.fileEditions];
    moveItemInArray(updated, event.previousIndex, event.currentIndex);

    this.fileManagerService.fileEditions = updated;

    void this.fileManagerService.saveOrder(updated);
  }

  toggleFileEdition(editionId: number): void {
    if (this.openEditionId === editionId) {
      this.openEditionId = null;
      this.activePages.delete(editionId);
      this.comicPreviewStateService.clearSelectedPage();
      this.pageLoader.clearCache(); // Limpa a RAM aqui
      return;
    }

    if (this.openEditionId !== null) {
      this.pageLoader.clearCache();
    }

    this.openEditionId = editionId;

    const edition = this.fileManagerService.fileEditions.find((item) => item.id === editionId);

    if (edition?.pages.length) {
      this.selectPage(editionId, edition.pages[0]);
    }

    this.printSelectedItems();
  }

  isEditionOpen(editionId: number): boolean {
    return this.openEditionId === editionId;
  }

  togglePageSelection(editionId: number, page: ComicPage): void {
    this.selectPage(editionId, page);
  }

  private selectPage(editionId: number, page: ComicPage): void {
    this.activePages.set(editionId, page.id);
    this.comicPreviewStateService.setSelectedPage(page);

    // Otimização: Pré-carrega a próxima página e a anterior em background
    const edition = this.fileManagerService.fileEditions.find((item) => item.id === editionId);
    if (edition && edition.pages.length > 0) {
      const currentIndex = edition.pages.findIndex((p) => p.id === page.id);

      // Busca a próxima página
      if (currentIndex + 1 < edition.pages.length) {
        this.pageLoader.preload(edition.pages[currentIndex + 1].imagePath);
      }

      // Busca a página anterior (útil se o usuário voltar)
      if (currentIndex - 1 >= 0) {
        this.pageLoader.preload(edition.pages[currentIndex - 1].imagePath);
      }
    }
  }

  navigatePageSelection(
    editionId: number,
    direction: 'up' | 'down',
    currentPage?: ComicPage,
  ): void {
    const edition = this.fileManagerService.fileEditions.find((item) => item.id === editionId);

    if (!edition?.pages?.length) {
      return;
    }

    const pages = edition.pages;
    const selectedPage = pages.find((page) => this.isPageSelected(editionId, page));
    const currentIndex = currentPage ? pages.findIndex((page) => page.id === currentPage.id) : -1;
    const startIndex =
      selectedPage !== undefined
        ? pages.findIndex((page) => page.id === selectedPage.id)
        : currentIndex;

    if (startIndex < 0) {
      const fallbackIndex = direction === 'down' ? 0 : pages.length - 1;
      this.selectPage(editionId, pages[fallbackIndex]);

      return;
    }

    if (
      (direction === 'up' && startIndex === 0) ||
      (direction === 'down' && startIndex === pages.length - 1)
    ) {
      this.selectPage(editionId, pages[startIndex]);

      return;
    }

    const targetIndex = direction === 'down' ? startIndex + 1 : startIndex - 1;

    this.selectPage(editionId, pages[targetIndex]);
  }

  toggleEditionSelection(editionId: number): void {
    this.fileManagerService.toggleEditionSelection(editionId);
  }

  isEditionSelected(editionId: number): boolean {
    return this.fileManagerService.activeEditionIds.has(editionId);
  }

  isPageSelected(editionId: number, page: ComicPage): boolean {
    return this.activePages.get(editionId) === page.id;
  }

  getDisplayEdition(edition: ComicEdition): ComicEdition {
    return {
      ...edition,
      pages: edition.pages.map((page) => ({
        ...page,
        selected: this.isPageSelected(edition.id, page),
      })),
    };
  }

  getPageSelectionHandler(editionId: number): (page: ComicPage) => boolean {
    return (page: ComicPage) => this.isPageSelected(editionId, page);
  }

  toggleChooseAll(): void {
    if (this.fileManagerService.fileEditions.length < 2) {
      return;
    }

    this.isActive = !this.isActive;

    this.activePages.clear();

    if (!this.isActive) {
      this.fileManagerService.clearEditionSelection();
      return;
    }

    this.fileManagerService.selectAllEditions();
    this.fileManagerService.fileEditions.forEach((edition) => {
      if (edition.pages.length) {
        this.activePages.set(edition.id, edition.pages[0].id);
      } else {
        this.activePages.delete(edition.id);
      }
    });

    this.printSelectedItems();
  }

  async deleteEdition(editionId: number): Promise<void> {
    const edition = this.fileManagerService.fileEditions.find((item) => item.id === editionId);

    if (edition) {
      await this.fileManagerService.deleteEditionFromBackend(edition.title);
      this.fileManagerService.removeSourcePathsByTitle(edition.title);
    }

    this.fileManagerService.fileEditions = this.fileManagerService.fileEditions.filter(
      (item) => item.id !== editionId,
    );

    this.fileManagerService.removeEditionFromSelection(editionId);
    this.cdr.detectChanges();

    this.activePages.delete(editionId);

    if (this.openEditionId === editionId) {
      this.openEditionId = null;
      this.comicPreviewStateService.clearSelectedPage();
    }

    if (this.fileManagerService.fileEditions.length === 0) {
      this.isActive = false;

      this.conversionStateService.clearConversion();
      this.fileManagerService.clearSourcePaths();

      console.log('Conversao liberada novamente');
    }

    // Limpa a RAM após deletar a edição
    this.pageLoader.clearCache();
  }

  async deleteAll(): Promise<void> {
    await this.fileManagerService.clearAllTempEditions();

    this.fileManagerService.fileEditions = [];
    this.fileManagerService.clearSourcePaths();

    this.fileManagerService.clearEditionSelection();
    this.cdr.detectChanges();
    this.activePages.clear();
    this.comicPreviewStateService.clearSelectedPage();

    this.openEditionId = null;
    this.isActive = false;

    this.conversionStateService.clearConversion();

    // Limpa toda a RAM após deletar tudo
    this.pageLoader.clearCache();
  }

  printSelectedItems(): void {
    this.fileManagerService.fileEditions.forEach((edition) => {
      if (this.isEditionSelected(edition.id)) {
        console.log(`Titulo: ${edition.title}`);
      }
    });
  }

  ngOnInit(): void {
    this.sub.add(
      this.fileManagerService.refreshChanges.subscribe(() => {
        this.cdr.markForCheck();
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

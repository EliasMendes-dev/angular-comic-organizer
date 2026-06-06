import { Component, OnInit } from '@angular/core';
import { CdkDropList, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ConversionStateService } from '../../services/conversion-state';
import { FileManagerService } from '../../services/file-manager';
import { FileExplorerHeader } from './subcomponents/file-explorer-header/file-explorer-header';
import { FileExplorerEditionItem } from './subcomponents/file-explorer-edition-item/file-explorer-edition-item';

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [CdkDropList, FileExplorerHeader, FileExplorerEditionItem],
  templateUrl: './file-explorer.html',
  styleUrls: ['./file-explorer.css', './file-explorer-responsive.css'],
})
export class FileExplorer implements OnInit {
  isActive = false;
  openEditionId: number | null = null;
  activePageKeys = new Set<string>();

  constructor(
    private conversionStateService: ConversionStateService,
    public fileManagerService: FileManagerService,
  ) {}

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.fileManagerService.fileEditions, event.previousIndex, event.currentIndex);
  }

  toggleFileEdition(editionId: number): void {
    this.openEditionId = this.openEditionId === editionId ? null : editionId;
    this.printSelectedItems();
  }

  isEditionOpen(editionId: number): boolean {
    return this.openEditionId === editionId;
  }

  togglePageSelection(editionId: number, page: string): void {
    const pageKey = `${editionId}-${page}`;

    if (this.activePageKeys.has(pageKey)) {
      this.activePageKeys.delete(pageKey);
      return;
    }

    this.activePageKeys.add(pageKey);
  }

  toggleEditionSelection(editionId: number): void {
    if (this.fileManagerService.activeEditionIds.has(editionId)) {
      this.fileManagerService.activeEditionIds.delete(editionId);

      return;
    }

    this.fileManagerService.activeEditionIds.add(editionId);
  }

  isEditionSelected(editionId: number): boolean {
    return this.fileManagerService.activeEditionIds.has(editionId);
  }

  isPageSelected(editionId: number, page: string): boolean {
    return this.activePageKeys.has(`${editionId}-${page}`);
  }

  toggleChooseAll(): void {
    if (this.fileManagerService.fileEditions.length < 2) {
      return;
    }

    this.isActive = !this.isActive;

    this.fileManagerService.activeEditionIds.clear();
    this.activePageKeys.clear();

    if (!this.isActive) {
      return;
    }

    this.fileManagerService.fileEditions.forEach((edition) => {
      this.fileManagerService.activeEditionIds.add(edition.id);

      edition.pages.forEach((page) => {
        this.activePageKeys.add(`${edition.id}-${page}`);
      });
    });

    this.printSelectedItems();
  }

  deleteEdition(editionId: number): void {
    this.fileManagerService.fileEditions = this.fileManagerService.fileEditions.filter(
      (edition) => edition.id !== editionId,
    );

    this.fileManagerService.activeEditionIds.delete(editionId);

    this.activePageKeys.forEach((key) => {
      if (key.startsWith(`${editionId}-`)) {
        this.activePageKeys.delete(key);
      }
    });

    if (this.openEditionId === editionId) {
      this.openEditionId = null;
    }

    if (this.fileManagerService.fileEditions.length === 0) {
      this.isActive = false;

      this.conversionStateService.clearConversion();

      console.log('Conversao liberada novamente');
    }
  }

  deleteAll(): void {
    this.fileManagerService.fileEditions = [];

    this.fileManagerService.activeEditionIds.clear();
    this.activePageKeys.clear();

    this.openEditionId = null;
    this.isActive = false;

    this.conversionStateService.clearConversion();
  }

  printSelectedItems(): void {
    this.fileManagerService.fileEditions.forEach((edition) => {
      if (this.isEditionSelected(edition.id)) {
        console.log(`Titulo: ${edition.title}`);
      }

      edition.pages.forEach((page) => {
        if (this.isPageSelected(edition.id, page)) {
          console.log(`  Pagina: ${page}`);
        }
      });
    });
  }

  ngOnInit(): void {
    // debug placeholder
  }
}

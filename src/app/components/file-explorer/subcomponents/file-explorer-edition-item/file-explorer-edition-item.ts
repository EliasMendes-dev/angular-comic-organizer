import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  LucideTrash2,
  LucideSquareCheckBig,
  LucideSquare,
  LucideChevronUp,
  LucideChevronDown,
  LucideGrip,
} from '@lucide/angular';
import { CdkDrag, CdkDragHandle, CdkDragPreview } from '@angular/cdk/drag-drop';
import { ComicEdition } from '../../../../models/comic-edition';
import { ComicPage } from '../../../../models/comic-page';

@Component({
  selector: 'app-file-explorer-edition-item',
  standalone: true,
  imports: [
    LucideTrash2,
    LucideSquareCheckBig,
    LucideSquare,
    LucideChevronDown,
    LucideChevronUp,
    LucideGrip,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
  ],
  templateUrl: './file-explorer-edition-item.html',
  styleUrl: './file-explorer-edition-item.css',
})
export class FileExplorerEditionItem {
  @Input({ required: true }) edition!: ComicEdition;
  @Input() canDrag = true;
  @Input() isOpen = false;
  @Input() isSelected = false;

  @Output() openRequested = new EventEmitter<void>();
  @Output() selectionRequested = new EventEmitter<void>();
  @Output() deleteRequested = new EventEmitter<void>();
  @Output() pageRequested = new EventEmitter<ComicPage>();
  @Input() isPageSelectedFn: (page: ComicPage) => boolean = (page) =>
    (page as ComicPage & { selected?: boolean }).selected ?? false;

  isHoveringSelection = false;

  handleOpenRequested(): void {
    this.openRequested.emit();
  }

  handleSelectionRequested(): void {
    this.selectionRequested.emit();
  }

  handleDeleteRequested(): void {
    this.deleteRequested.emit();
  }

  handlePageRequested(page: ComicPage): void {
    this.pageRequested.emit(page);
  }
}

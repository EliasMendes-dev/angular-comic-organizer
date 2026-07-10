import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
  OnChanges,
} from '@angular/core';
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

export class FileExplorerEditionItem implements OnChanges {

ngOnChanges(changes: SimpleChanges): void {
  if (changes['isOpen']?.currentValue) {
    queueMicrotask(() => {
      this.pageElements.first?.nativeElement.focus();
    });
  }
}

  @Input({ required: true }) edition!: ComicEdition;
  @Input() canDrag = true;
  @Input() isOpen = false;
  @Input() isSelected = false;

  @ViewChildren('pageElement')
pageElements!: QueryList<ElementRef<HTMLDivElement>>;

  @Output() openRequested = new EventEmitter<void>();
  @Output() selectionRequested = new EventEmitter<void>();
  @Output() deleteRequested = new EventEmitter<void>();
  @Output() pageRequested = new EventEmitter<ComicPage>();
  @Output() pageNavigationRequested = new EventEmitter<{ page: ComicPage; direction: 'up' | 'down' }>();
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

  handlePageKeydown(page: ComicPage, event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.pageNavigationRequested.emit({ page, direction: 'down' });
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.pageNavigationRequested.emit({ page, direction: 'up' });
    }
  }
}

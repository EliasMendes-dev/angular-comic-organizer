/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

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
// Item individual da lista de edicoes, com expansao, selecao e arraste.
export class FileExplorerEditionItem implements OnChanges {

ngOnChanges(changes: SimpleChanges): void {
  if (changes['isOpen']?.currentValue) {
    // Quando a edicao abre, focamos a primeira pagina para facilitar a navegacao.
    queueMicrotask(() => {
      this.pageElements.first?.nativeElement.focus();
    });
  }
}

  // Dados principais da edicao exibida neste item.
  @Input({ required: true }) edition!: ComicEdition;
  @Input() canDrag = true;
  @Input() isOpen = false;
  @Input() isSelected = false;

  @ViewChildren('pageElement')
pageElements!: QueryList<ElementRef<HTMLDivElement>>;

  // Eventos enviados para o componente pai controlar a lista.
  @Output() openRequested = new EventEmitter<void>();
  @Output() selectionRequested = new EventEmitter<void>();
  @Output() deleteRequested = new EventEmitter<void>();
  @Output() pageRequested = new EventEmitter<ComicPage>();
  @Output() pageNavigationRequested = new EventEmitter<{ page: ComicPage; direction: 'up' | 'down' }>();
  @Input() isPageSelectedFn: (page: ComicPage) => boolean = (page) =>
    (page as ComicPage & { selected?: boolean }).selected ?? false;

  isHoveringSelection = false;

  handleOpenRequested(): void {
    // Dispara o pedido para abrir ou fechar a edicao.
    this.openRequested.emit();
  }

  handleSelectionRequested(): void {
    // Dispara o pedido para marcar ou desmarcar a edicao.
    this.selectionRequested.emit();
  }

  handleDeleteRequested(): void {
    // Dispara a remocao desta edicao.
    this.deleteRequested.emit();
  }

  handlePageRequested(page: ComicPage): void {
    // Dispara a selecao de uma pagina especifica.
    this.pageRequested.emit(page);
  }

  handlePageKeydown(page: ComicPage, event: KeyboardEvent): void {
    // Permite navegar entre paginas usando as setas do teclado.
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

import { Component, OnInit } from '@angular/core';
import {
  LucideFolder,
  LucideTrash2,
  LucideSquareCheckBig,
  LucideSquare,
  LucideChevronUp,
  LucideChevronDown,
  LucideSquareX,
  LucideGrip,
} from '@lucide/angular';
import {
  CdkDropList,
  CdkDrag,
  moveItemInArray,
  CdkDragHandle,
  CdkDragDrop,
  CdkDragPreview,
} from '@angular/cdk/drag-drop';
import { ConversionStateService } from '../../services/conversion-state';
import { FileManagerService } from '../../services/file-manager';

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [
    LucideFolder,
    LucideTrash2,
    LucideSquareCheckBig,
    LucideSquare,
    LucideChevronDown,
    LucideChevronUp,
    LucideSquareX,
    LucideGrip,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
  ],
  templateUrl: './file-explorer.html',
  styleUrls: ['./file-explorer.css', './file-explorer-responsive.css'],
})
export class FileExplorer implements OnInit {
  isHovering = false;
  hoveredEditionId: number | null = null;

  isActive = false;
  // openEditionId é usado para armazenar o ID da edição atualmente aberta. Se for null, significa que nenhuma edição está aberta.
  openEditionId: number | null = null;
  // activePageKeys é um Set para armazenar as chaves das páginas ativas, onde a chave é uma combinação do ID da edição e do nome da página
  activePageKeys = new Set<string>();

  constructor(
    private conversionStateService: ConversionStateService,
    public fileManagerService: FileManagerService,
  ) {}

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.fileManagerService.fileEditions, event.previousIndex, event.currentIndex);
  }

  // Alterna a edição aberta
  toggleFileEdition(editionId: number): void {
    this.openEditionId = this.openEditionId === editionId ? null : editionId;
    this.printSelectedItems();
  }

  // Verifica se a edição está aberta
  isEditionOpen(editionId: number): boolean {
    return this.openEditionId === editionId;
  }

  // Alterna a seleção da página
  togglePageSelection(editionId: number, page: string): void {
    const pageKey = `${editionId}-${page}`;

    if (this.activePageKeys.has(pageKey)) {
      this.activePageKeys.delete(pageKey);
      return;
    }

    this.activePageKeys.add(pageKey);
  }

  // Alterna seleção da edição
  toggleEditionSelection(editionId: number): void {
    if (this.fileManagerService.activeEditionIds.has(editionId)) {
      this.fileManagerService.activeEditionIds.delete(editionId);

      return;
    }

    this.fileManagerService.activeEditionIds.add(editionId);
  }

  // Verifica se a edição está ativa
  isEditionSelected(editionId: number): boolean {
    return this.fileManagerService.activeEditionIds.has(editionId);
  }

  // Verifica se a página está selecionada
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

  // Botão de delete excluir edição em especifico
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

    // Se não existir mais nenhuma edição
    if (this.fileManagerService.fileEditions.length === 0) {
      this.isActive = false;

      this.conversionStateService.clearConversion();

      console.log('Conversão liberada novamente');
    }
  }

  //Botão de delete do excluir tudo
  deleteAll(): void {
    this.fileManagerService.fileEditions = [];

    this.fileManagerService.activeEditionIds.clear();
    this.activePageKeys.clear();

    this.openEditionId = null;
    this.isActive = false;

    this.conversionStateService.clearConversion();
  }

  // Imprimir os ativos
  printSelectedItems(): void {
    this.fileManagerService.fileEditions.forEach((edition) => {
      if (this.isEditionSelected(edition.id)) {
        console.log(`Título: ${edition.title}`);
      }

      edition.pages.forEach((page) => {
        if (this.isPageSelected(edition.id, page)) {
          console.log(`  Página: ${page}`);
        }
      });
    });
  }

  ngOnInit(): void {
    // imprimir titulo e paginas no console para teste
  }
}

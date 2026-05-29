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
  // activeEditionIds é um Set para armazenar os IDs das edições ativas
  activeEditionIds = new Set<number>();

  fileEditions = [
    {
      id: 1,
      title: 'Batgirl (2000) - #01',
      pages: [
        'Batgirl (2000) #01 #001',
        'Batgirl (2000) #01 #002',
        'Batgirl (2000) #01 #003',
        'Batgirl (2000) #01 #004',
      ],
    },
    {
      id: 2,
      title: 'Batgirl (2000) - #02',
      pages: [
        'Batgirl (2000) #02 #001',
        'Batgirl (2000) #02 #002',
        'Batgirl (2000) #02 #003',
        'Batgirl (2000) #02 #004',
      ],
    },
    {
      id: 3,
      title: 'Batgirl (2000) - #03',
      pages: [
        'Batgirl (2000) #03 #001',
        'Batgirl (2000) #03 #002',
        'Batgirl (2000) #03 #003',
        'Batgirl (2000) #03 #004',
      ],
    },
    {
      id: 4,
      title: 'Batgirl (2000) - #04',
      pages: [
        'Batgirl (2000) #04 #001',
        'Batgirl (2000) #04 #002',
        'Batgirl (2000) #04 #003',
        'Batgirl (2000) #04 #004',
      ],
    },
    {
      id: 5,
      title: 'Batgirl (2000) - #05',
      pages: [
        'Batgirl (2000) #05 #001',
        'Batgirl (2000) #05 #002',
        'Batgirl (2000) #05 #003',
        'Batgirl (2000) #05 #004',
      ],
    },
    {
      id: 6,
      title: 'Batgirl (2000) - #06',
      pages: [
        'Batgirl (2000) #06 #001',
        'Batgirl (2000) #06 #002',
        'Batgirl (2000) #06 #003',
        'Batgirl (2000) #06 #004',
      ],
    },
    {
      id: 7,
      title: 'Batgirl (2000) - #07',
      pages: [
        'Batgirl (2000) #07 #001',
        'Batgirl (2000) #07 #002',
        'Batgirl (2000) #07 #003',
        'Batgirl (2000) #07 #004',
      ],
    },
    {
      id: 8,
      title: 'Batgirl (2000) - #08',
      pages: [
        'Batgirl (2000) #08 #001',
        'Batgirl (2000) #08 #002',
        'Batgirl (2000) #08 #003',
        'Batgirl (2000) #08 #004',
      ],
    },
    {
      id: 9,
      title: 'Batgirl (2000) - #09',
      pages: [
        'Batgirl (2000) #09 #001',
        'Batgirl (2000) #09 #002',
        'Batgirl (2000) #09 #003',
        'Batgirl (2000) #09 #004',
      ],
    },
    {
      id: 10,
      title: 'Batgirl (2000) - #10',
      pages: [
        'Batgirl (2000) #10 #001',
        'Batgirl (2000) #10 #002',
        'Batgirl (2000) #10 #003',
        'Batgirl (2000) #10 #004',
      ],
    },
    {
      id: 11,
      title: 'Batgirl (2000) - #11',
      pages: [
        'Batgirl (2000) #11 #001',
        'Batgirl (2000) #11 #002',
        'Batgirl (2000) #11 #003',
        'Batgirl (2000) #11 #004',
      ],
    },
    {
      id: 12,
      title: 'Batgirl (2000) - #12',
      pages: [
        'Batgirl (2000) #12 #001',
        'Batgirl (2000) #12 #002',
        'Batgirl (2000) #12 #003',
        'Batgirl (2000) #12 #004',
      ],
    },
  ];

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.fileEditions, event.previousIndex, event.currentIndex);
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
    if (this.activeEditionIds.has(editionId)) {
      this.activeEditionIds.delete(editionId);
      return;
    }

    this.activeEditionIds.add(editionId);
  }

  // Verifica se a edição está ativa
  isEditionSelected(editionId: number): boolean {
    return this.activeEditionIds.has(editionId);
  }

  // Verifica se a página está selecionada
  isPageSelected(editionId: number, page: string): boolean {
    return this.activePageKeys.has(`${editionId}-${page}`);
  }

  toggleChooseAll(): void {
    if (this.fileEditions.length < 2) {
      return;
    }

    this.isActive = !this.isActive;

    this.activeEditionIds.clear();
    this.activePageKeys.clear();

    if (!this.isActive) {
      return;
    }

    this.fileEditions.forEach((edition) => {
      this.activeEditionIds.add(edition.id);

      edition.pages.forEach((page) => {
        this.activePageKeys.add(`${edition.id}-${page}`);
      });
    });

    this.printSelectedItems();
  }

  // Botão de delete excluir edição em especifico
  deleteEdition(editionId: number): void {
    // Remove a edição do array
    this.fileEditions = this.fileEditions.filter((edition) => edition.id !== editionId);

    // Remove da seleção de edições
    this.activeEditionIds.delete(editionId);

    // Remove páginas selecionadas dessa edição
    this.activePageKeys.forEach((key) => {
      if (key.startsWith(`${editionId}-`)) {
        this.activePageKeys.delete(key);
      }
    });

    // Fecha caso esteja aberta
    if (this.openEditionId === editionId) {
      this.openEditionId = null;
    }
  }

  //Botão de delete do excluir tudo
  deleteAll(): void {
    this.fileEditions = [];
    this.activeEditionIds.clear();
    this.activePageKeys.clear();

    this.openEditionId = null;
    this.isActive = false;
  }

  // Imprimir os ativos
  printSelectedItems(): void {
    this.fileEditions.forEach((edition) => {
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

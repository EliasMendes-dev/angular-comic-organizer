/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  LucideFolder,
  LucideTrash2,
  LucideSquareCheckBig,
  LucideSquare,
  LucideSquareX,
} from '@lucide/angular';

@Component({
  selector: 'app-file-explorer-header',
  standalone: true,
  imports: [
    LucideFolder,
    LucideTrash2,
    LucideSquareCheckBig,
    LucideSquare,
    LucideSquareX,
  ],
  templateUrl: './file-explorer-header.html',
  styleUrl: './file-explorer-header.css',
})
export class FileExplorerHeader {
  // Indica se ha itens carregados e se a area esta em modo ativo.
  @Input() isActive = false;
  @Input() hasItems = false;

  @Output() chooseAll = new EventEmitter<void>();
  @Output() deleteAll = new EventEmitter<void>();

  isHovering = false;

  handleChooseAll(): void {
    // Evita disparar selecao geral quando a lista ainda esta vazia.
    if (!this.hasItems) {
      return;
    }

    this.chooseAll.emit();
  }

  handleDeleteAll(): void {
    // Encaminha a acao de remover todas as edicoes.
    this.deleteAll.emit();
  }
}

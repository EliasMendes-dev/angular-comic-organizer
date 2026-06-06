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
  @Input() isActive = false;
  @Input() hasItems = false;

  @Output() chooseAll = new EventEmitter<void>();
  @Output() deleteAll = new EventEmitter<void>();

  isHovering = false;

  handleChooseAll(): void {
    if (!this.hasItems) {
      return;
    }

    this.chooseAll.emit();
  }

  handleDeleteAll(): void {
    this.deleteAll.emit();
  }
}

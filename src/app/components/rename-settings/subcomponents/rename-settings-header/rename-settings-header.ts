/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Component, Output, EventEmitter } from '@angular/core';
import { LucideSettings, LucideTrash2 } from '@lucide/angular';

@Component({
  selector: 'app-rename-settings-header',
  imports: [LucideSettings, LucideTrash2],
  templateUrl: './rename-settings-header.html',
  styleUrl: './rename-settings-header.css',
})
export class RenameSettingsHeader {
  @Output() onClear = new EventEmitter<void>();

  handleClear(): void {
    this.onClear.emit();
  }
}

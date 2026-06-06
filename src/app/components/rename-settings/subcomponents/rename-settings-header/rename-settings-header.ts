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

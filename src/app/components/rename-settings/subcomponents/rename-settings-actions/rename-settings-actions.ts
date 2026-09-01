import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideEye, LucidePenLine } from '@lucide/angular';

@Component({
  selector: 'app-rename-settings-actions',
  standalone: true,
  imports: [LucideEye, LucidePenLine],
  templateUrl: './rename-settings-actions.html',
  styleUrl: './rename-settings-actions.css',
})
export class RenameSettingsActions {
  @Input() isPreviewDisabled = true;
  @Input() isRenameDisabled = true;
  @Input() showConvertButton = false;
  @Input() isConvertDisabled = true;
  @Input() convertButtonText = 'Converter';

  @Output() onPreview = new EventEmitter<void>();
  @Output() onRename = new EventEmitter<void>();
  @Output() onConvert = new EventEmitter<void>();

  handlePreview(): void {
    this.onPreview.emit();
  }

  handleRename(): void {
    this.onRename.emit();
  }

  handleConvert(): void {
    this.onConvert.emit();
  }
}

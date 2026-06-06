import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LucideEye, LucideFileArchive, LucidePenLine, LucideLayers } from '@lucide/angular';
import { ConversionStateService } from '../../../../services/conversion-state';

@Component({
  selector: 'app-rename-settings-actions',
  standalone: true,
  imports: [LucideEye, LucideFileArchive, LucidePenLine, LucideLayers],
  templateUrl: './rename-settings-actions.html',
  styleUrl: './rename-settings-actions.css',
})
export class RenameSettingsActions implements OnInit {
  @Input() isPreviewDisabled = true;
  @Input() isRenameDisabled = true;
  @Input() isConvertToDisabled = true;
  @Input() isOmnibusDisabled = true;

  @Output() onPreview = new EventEmitter<void>();
  @Output() onRename = new EventEmitter<void>();
  @Output() onConvertTo = new EventEmitter<void>();
  @Output() onOmnibus = new EventEmitter<void>();

  constructor(private conversionState: ConversionStateService) {}

  get choiceForConvertTo(): string {
    const conversion = this.conversionState.getConversion();

    if (conversion === 'cbr-to-cbz') {
      return 'CBZ';
    }

    if (conversion === 'cbz-to-cbr') {
      return 'CBR';
    }

    return '';
  }

  handlePreview(): void {
    this.onPreview.emit();
  }

  handleRename(): void {
    this.onRename.emit();
  }

  handleConvertTo(): void {
    this.onConvertTo.emit();
  }

  handleOmnibus(): void {
    this.onOmnibus.emit();
  }

  ngOnInit(): void {}
}

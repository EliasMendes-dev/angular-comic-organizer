import { Component, Input } from '@angular/core';
import { LucideSettings, LucideEye } from '@lucide/angular';

export interface PreviewPage {
  oldNamePage: string;
  newNamePage: string;
}

export interface PreviewEdition {
  oldNameEdition: string;
  newNameEdition: string;
  pages: PreviewPage[];
}

@Component({
  selector: 'app-rename-settings-preview',
  imports: [LucideSettings, LucideEye],
  templateUrl: './rename-settings-preview.html',
  styleUrl: './rename-settings-preview.css',
})
export class RenameSettingsPreview {
  @Input() showPreview: boolean = false;
  @Input() renamePreview: PreviewEdition[] = [];
  @Input() previewMessage: string = '';
}

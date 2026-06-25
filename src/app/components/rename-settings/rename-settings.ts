import { Component, OnInit } from '@angular/core';
import { FileManagerService } from '../../services/file-manager';
import { ConversionStateService } from '../../services/conversion-state';
import { RenameSettingsHeader } from './subcomponents/rename-settings-header/rename-settings-header';
import { RenameSettingsForm } from './subcomponents/rename-settings-form/rename-settings-form';
import { RenameSettingsActions } from './subcomponents/rename-settings-actions/rename-settings-actions';
import {
  RenameSettingsPreview,
  PreviewEdition,
  PreviewPage,
} from './subcomponents/rename-settings-preview/rename-settings-preview';
import { ComicPage } from '../../models/comic-page';

@Component({
  selector: 'app-rename-settings',
  standalone: true,
  imports: [RenameSettingsHeader, RenameSettingsForm, RenameSettingsActions, RenameSettingsPreview],
  templateUrl: './rename-settings.html',
  styleUrls: ['./rename-settings.css', './rename-settings-responsive.css'],
})
export class RenameSettings implements OnInit {
  title = '';
  year = '';
  edition = '';

  showPreview = false;

  titleError = '';
  yearError = '';
  editionError = '';

  hasTriedSubmit = false;

  constructor(
    public fileManagerService: FileManagerService,
    private conversionStateService: ConversionStateService,
  ) {}

  get selectedEditionsCount(): number {
    return this.fileManagerService.activeEditionIds.size;
  }

  get renamePreview(): PreviewEdition[] {
    if (!this.showPreview) return [];

    const selectedEditions = this.fileManagerService.fileEditions.filter((edition) =>
      this.fileManagerService.activeEditionIds.has(edition.id),
    );

    return selectedEditions.map((edition, index) => {
      let rawEdition = this.edition || '1';
      let startEdition = parseInt(rawEdition, 10);

      if (isNaN(startEdition)) startEdition = 1;

      const currentEdition = String(startEdition + index).padStart(3, '0');

      return {
        oldNameEdition: edition.title,
        newNameEdition:
          `${this.title || 'Sem titulo'} ` + `(${this.year || '0000'}) ` + `#${currentEdition}`,
        pages: edition.pages.map((page: ComicPage, pageIndex: number) => {
          const currentPage = String(pageIndex + 1).padStart(3, '0');

          return {
            oldNamePage: page.fileName,
            newNamePage:
              `${this.title || 'Sem titulo'} ` +
              `(${this.year || '0000'}) ` +
              `#${currentEdition} - ${currentPage}.jpg`,
          } satisfies PreviewPage;
        }),
      };
    });
  }

  get previewMessage(): string {
    if (!this.hasSelectedEditions()) {
      return 'Selecione ou envie uma edição para começar';
    }

    if (!this.title || !this.year || !this.edition) {
      return 'Preencha os campos de título, ano e edição';
    }

    if (!this.showPreview) {
      return 'Clique em "Visualizar" para gerar a prévia';
    }

    return '';
  }

  hasSelectedEditions(): boolean {
    return this.selectedEditionsCount > 0;
  }

  hasMultipleSelectedEditions(): boolean {
    return this.selectedEditionsCount > 1;
  }

  hasSelectedConvertTo(): boolean {
    return this.conversionStateService.getConversion() !== null;
  }

  get canUsePreviewAndRename(): boolean {
    return this.hasSelectedEditions();
  }

  get canUseConvertTo(): boolean {
    return this.hasSelectedEditions() && this.hasSelectedConvertTo();
  }

  get canUseOmnibus(): boolean {
    return (
      this.hasSelectedEditions() &&
      this.hasSelectedConvertTo() &&
      this.hasMultipleSelectedEditions()
    );
  }

  ngOnInit(): void {}

  validateRealtime(): void {
    if (!this.hasTriedSubmit) return;

    this.validateFields();
  }

  validateFields(): boolean {
    this.titleError = '';
    this.yearError = '';
    this.editionError = '';

    let valid = true;

    if (!this.title.trim()) {
      this.titleError = 'Digite um título';
      valid = false;
    }

    const yearNum = Number(this.year);

    if (!this.year.trim()) {
      this.yearError = 'Digite um ano';
      valid = false;
    } else if (isNaN(yearNum)) {
      this.yearError = 'Ano inválido';
      valid = false;
    } else if (yearNum < 1900) {
      this.yearError = 'Ano deve ser maior que 1900';
      valid = false;
    }

    const editionNum = Number(this.edition);

    if (!this.edition.trim()) {
      this.editionError = 'Digite uma edição';
      valid = false;
    } else if (isNaN(editionNum)) {
      this.editionError = 'Edição inválida';
      valid = false;
    } else if (editionNum < 0) {
      this.editionError = 'Edição deve ser igual ou maior que 0';
      valid = false;
    }

    return valid;
  }

  clearInputs(): void {
    this.title = '';
    this.year = '';
    this.edition = '';

    this.titleError = '';
    this.yearError = '';
    this.editionError = '';

    this.showPreview = false;
    this.hasTriedSubmit = false;
  }

  onPreviewClick(): void {
    this.hasTriedSubmit = true;
    this.showPreview = this.validateFields();
  }

  onRename(): void {
    // TODO: Implementar lógica de renomeação
  }

  onConvertTo(): void {
    // TODO: Implementar lógica de conversão
  }

  onOmnibus(): void {
    // TODO: Implementar lógica de omnibus
  }
}

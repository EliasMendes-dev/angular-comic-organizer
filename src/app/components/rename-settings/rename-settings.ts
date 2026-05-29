import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideSettings,
  LucideEye,
  LucideFileArchive,
  LucidePenLine,
  LucideLayers,
  LucideTrash2,
} from '@lucide/angular';
import { FileManagerService } from '../../services/file-manager';

@Component({
  selector: 'app-rename-settings',
  standalone: true,
  imports: [
    FormsModule,
    LucideSettings,
    LucideEye,
    LucideFileArchive,
    LucidePenLine,
    LucideLayers,
    LucideTrash2,
  ],
  templateUrl: './rename-settings.html',
  styleUrls: ['./rename-settings.css', './rename-settings-responsive.css'],
})
export class RenameSettings implements OnInit {
  title = '';
  year = '';
  edition = '';

  showPreview = false;

  // Estados de erro dos inputs
  titleError: string = '';
  yearError: string = '';
  editionError: string = '';

  hasTriedSubmit = false;

  constructor(public fileManagerService: FileManagerService) {}

  get selectedEditionsCount(): number {
    return this.fileManagerService.activeEditionIds.size;
  }

  // Preview só aparece se showPreview for true
  get renamePreview() {
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
          `${this.title || 'Sem título'} ` + `(${this.year || '0000'}) ` + `#${currentEdition}`,

        // páginas da edição
        pages: edition.pages.map((page: string, pageIndex: number) => {
          const currentPage = String(pageIndex + 1).padStart(3, '0');

          return {
            oldNamePage: page,

            newNamePage:
              `${this.title || 'Sem título'} ` +
              `(${this.year || '0000'}) ` +
              `#${currentEdition} - ${currentPage}.jpg`,
          };
        }),
      };
    });
  }

  get previewMessage(): string {
    // Nenhuma edição selecionada
    if (!this.hasSelectedEditions()) {
      return 'Selecione ou envie uma edição para começar';
    }

    // Campos vazios
    if (!this.title || !this.year || !this.edition) {
      return 'Preencha os campos de título, ano e edição';
    }

    // Ainda não clicou preview
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

  ngOnInit(): void {}

  validateRealtime(): void {
    if (!this.hasTriedSubmit) return;

    this.validateFields();
  }

  // Validação dos campos
  validateFields(): boolean {
    this.titleError = '';
    this.yearError = '';
    this.editionError = '';

    let valid = true;

    // TITLE
    if (!this.title.trim()) {
      this.titleError = 'Digite um título';
      valid = false;
    }

    // YEAR
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

    // EDITION
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

  // Handler do botão Visualizar
  onPreviewClick(): void {
    this.hasTriedSubmit = true;

    this.showPreview = this.validateFields();
  }
}

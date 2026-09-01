/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Component, effect, OnDestroy, signal } from '@angular/core';
import { listen } from '@tauri-apps/api/event';
import { FileManagerService } from '../../services/file-manager';
import {
  ConversionStateService,
  EXPORT_PROGRESS_EVENT,
  ExportProgress,
  getExportCommandName,
  getRenameCommandName,
} from '../../services/conversion-state';
import { RenameSettingsHeader } from './subcomponents/rename-settings-header/rename-settings-header';
import { RenameSettingsForm } from './subcomponents/rename-settings-form/rename-settings-form';
import { RenameSettingsActions } from './subcomponents/rename-settings-actions/rename-settings-actions';
import {
  RenameSettingsPreview,
  PreviewEdition,
  PreviewPage,
} from './subcomponents/rename-settings-preview/rename-settings-preview';
import { ComicPage } from '../../models/comic-page';
import { ComicEdition } from '../../models/comic-edition';
import { invoke } from '@tauri-apps/api/core';

@Component({
  selector: 'app-rename-settings',
  standalone: true,
  imports: [RenameSettingsHeader, RenameSettingsForm, RenameSettingsActions, RenameSettingsPreview],
  templateUrl: './rename-settings.html',
  styleUrls: ['./rename-settings.css', './rename-settings-responsive.css'],
})
export class RenameSettings implements OnDestroy {
  title = '';
  year = '';
  edition = '';

  showPreview = false;

  titleError = '';
  yearError = '';
  editionError = '';

  hasTriedSubmit = false;
  readonly isRenaming = signal(false);
  readonly progress = signal(0);
  readonly progressText = signal('');
  readonly feedbackMessage = signal('');
  readonly feedbackType = signal<'success' | 'error'>('success');
  private unlistenProgress?: () => void;
  private feedbackTimer?: ReturnType<typeof setTimeout>;

  constructor(
    public fileManagerService: FileManagerService,
    private conversionStateService: ConversionStateService,
  ) {
    void listen<ExportProgress>(EXPORT_PROGRESS_EVENT, ({ payload }) => {
      this.progress.set(payload.progress);
      this.progressText.set(`${payload.current}/${payload.total} ${payload.message}`);
    })
      .then((unlisten) => {
        this.unlistenProgress = unlisten;
      })
      .catch((error) => console.error('Erro ao acompanhar o progresso:', error));

    effect(() => {
      this.fileManagerService.libraryState();

      if (!this.hasSelectedEditions()) {
        this.clearInputs();
      } else if (this.showPreview) {
        this.showPreview = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.unlistenProgress?.();
    this.clearFeedbackTimer();
    document.body.classList.remove('is-processing');
  }

  get selectedEditionsCount(): number {
    return this.fileManagerService.activeEditionIds.size;
  }

  get renamePreview(): PreviewEdition[] {
    if (!this.showPreview) return [];

    const selectedEditions = this.getSelectedEditions();
    const seriesName = this.getSeriesName();
    const startingEdition = this.getStartingEdition();

    return selectedEditions.map((edition, index) => {
      const currentEdition = String(startingEdition + index).padStart(3, '0');
      const editionName = `${seriesName} #${currentEdition}`;

      return {
        oldNameEdition: edition.title,
        newNameEdition: editionName,
        pages: edition.pages.map((page: ComicPage, pageIndex: number) => {
          const currentPage = String(pageIndex + 1).padStart(3, '0');

          return {
            oldNamePage: page.fileName,
            newNamePage: `${editionName} - ${currentPage}.${this.getPageExtension(page.fileName)}`,
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

  get selectedConversion() {
    return this.conversionStateService.getConversion();
  }

  get convertButtonText(): string {
    if (this.selectedConversion === 'cbr-to-cbz') {
      return 'Converter para CBZ';
    }

    if (this.selectedConversion === 'cbz-to-cbr') {
      return 'Converter para CBR';
    }

    return 'Converter';
  }

  get showConvertButton(): boolean {
    return this.selectedConversion !== null;
  }

  hasSelectedEditions(): boolean {
    return this.selectedEditionsCount > 0;
  }

  hasMultipleSelectedEditions(): boolean {
    return this.selectedEditionsCount > 1;
  }

  get canUsePreviewAndRename(): boolean {
    return this.hasSelectedEditions();
  }

  validateRealtime(): void {
    if (!this.hasTriedSubmit) return;

    this.validateFields();
  }

  onInputChanged(): void {
    if (this.showPreview) {
      this.showPreview = false;
    }

    this.validateRealtime();
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
    this.exportSelectedEditions(getRenameCommandName(this.selectedConversion));
  }

  onConvertClick(): void {
    this.exportSelectedEditions(getExportCommandName(this.selectedConversion));
  }

  private exportSelectedEditions(command: 'export_renamed_cbrs' | 'export_renamed_cbzs'): void {
    this.hasTriedSubmit = true;

    if (!this.validateFields() || this.isRenaming()) {
      return;
    }

    this.runExport(command);
  }

  private runExport(command: 'export_renamed_cbrs' | 'export_renamed_cbzs'): void {
    const selectedEditions = this.getSelectedEditions();

    this.isRenaming.set(true);
    this.progress.set(0);
    this.progressText.set('Preparando arquivos...');
    this.clearFeedbackTimer();
    this.feedbackMessage.set('');
    document.body.classList.add('is-processing');
    void invoke<string[]>(command, {
      editions: selectedEditions,
      title: this.title.trim(),
      year: this.year.trim(),
      startingEdition: this.getStartingEdition(),
    })
      .then((paths) => {
        this.showFeedback(`${paths.length} arquivo(s) criado(s) em Downloads.`, 'success');
      })
      .catch((error) => {
        console.error(`Erro ao exportar arquivos do comando ${command}:`, error);
        this.showFeedback(`Nao foi possivel criar os arquivos: ${error}`, 'error');
      })
      .finally(() => {
        this.isRenaming.set(false);
        document.body.classList.remove('is-processing');
      });
  }

  private showFeedback(message: string, type: 'success' | 'error'): void {
    this.feedbackMessage.set(message);
    this.feedbackType.set(type);
    this.clearFeedbackTimer();
    this.feedbackTimer = setTimeout(() => {
      this.feedbackMessage.set('');
      this.feedbackTimer = undefined;
    }, 3000);
  }

  private clearFeedbackTimer(): void {
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = undefined;
    }
  }

  private getSelectedEditions(): ComicEdition[] {
    return this.fileManagerService.fileEditions.filter((edition) =>
      this.fileManagerService.activeEditionIds.has(edition.id),
    );
  }

  private getSeriesName(): string {
    return `${this.title || 'Sem titulo'} (${this.year || '0000'})`;
  }

  private getStartingEdition(): number {
    const parsed = Number.parseInt(this.edition || '1', 10);
    return Number.isNaN(parsed) ? 1 : parsed;
  }

  private getPageExtension(fileName: string): string {
    const extension = fileName.match(/\.([^.]+)$/)?.[1];
    return extension?.toLowerCase() || 'jpg';
  }
}

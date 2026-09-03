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
import { invoke, isTauri } from '@tauri-apps/api/core';
import { PlatformNoticeService } from '../../services/platform-notice';
import { WebArchiveService } from '../../services/web-archive';

@Component({
  selector: 'app-rename-settings',
  standalone: true,
  imports: [RenameSettingsHeader, RenameSettingsForm, RenameSettingsActions, RenameSettingsPreview],
  templateUrl: './rename-settings.html',
  styleUrls: ['./rename-settings.css', './rename-settings-responsive.css'],
})
export class RenameSettings implements OnDestroy {
  // Campos principais do formulario de renomeacao.
  title = '';
  year = '';
  edition = '';

  // Controla a visibilidade da pre-visualizacao.
  showPreview = false;

  // Mensagens de erro associadas a cada campo.
  titleError = '';
  yearError = '';
  editionError = '';

  // Marca se o usuario ja tentou submeter o formulario.
  hasTriedSubmit = false;
  // Estado reativo usado pelo loading, progresso e feedback final.
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
    private platformNotice: PlatformNoticeService,
    private webArchiveService: WebArchiveService,
  ) {
    if (isTauri()) {
      // No desktop, escutamos o evento de progresso emitido pelo backend Rust.
      void listen<ExportProgress>(EXPORT_PROGRESS_EVENT, ({ payload }) => {
        this.progress.set(payload.progress);
        this.progressText.set(`${payload.current}/${payload.total} ${payload.message}`);
      })
        .then((unlisten) => {
          this.unlistenProgress = unlisten;
        })
        .catch((error) => console.error('Erro ao acompanhar o progresso:', error));
    }

    // Mantem o formulario alinhado com a selecao atual de edicoes.
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
    // Limpa listeners, timers e classes globais quando o componente sai da tela.
    this.unlistenProgress?.();
    this.clearFeedbackTimer();
    document.body.classList.remove('is-processing');
  }

  get selectedEditionsCount(): number {
    // Quantidade de edicoes marcadas para a acao atual.
    return this.fileManagerService.activeEditionIds.size;
  }

  get renamePreview(): PreviewEdition[] {
    // Gera a lista de nomes novos apenas quando a pre-visualizacao esta aberta.
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
    // Mensagem de apoio quando o usuario ainda nao pode ver a pre-visualizacao.
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
    // Fluxo de conversao escolhido no menu superior.
    return this.conversionStateService.getConversion();
  }

  get convertButtonText(): string {
    // Ajusta o texto do botao conforme o fluxo selecionado.
    if (this.selectedConversion === 'cbr-to-cbz') {
      return 'Converter para CBZ';
    }

    if (this.selectedConversion === 'cbz-to-cbr') {
      return 'Converter para CBR';
    }

    return 'Converter';
  }

  get showConvertButton(): boolean {
    // O botao de conversao so aparece quando existe um fluxo ativo.
    return this.selectedConversion !== null;
  }

  hasSelectedEditions(): boolean {
    // Conveniencia para checar se existe pelo menos uma edicao marcada.
    return this.selectedEditionsCount > 0;
  }

  hasMultipleSelectedEditions(): boolean {
    // Usado quando a interface precisa lidar com mais de uma edicao.
    return this.selectedEditionsCount > 1;
  }

  get canUsePreviewAndRename(): boolean {
    // Pre-visualizar e renomear dependem de haver edicoes selecionadas.
    return this.hasSelectedEditions();
  }

  validateRealtime(): void {
    // Valida enquanto o usuario digita, mas apenas depois da primeira tentativa.
    if (!this.hasTriedSubmit) return;

    this.validateFields();
  }

  onInputChanged(): void {
    // Qualquer alteracao nos campos invalida a pre-visualizacao anterior.
    if (this.showPreview) {
      this.showPreview = false;
    }

    this.validateRealtime();
  }

  validateFields(): boolean {
    // Limpa os erros antes de reavaliar o formulario.
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
    // Reseta o formulario e elimina mensagens antigas.
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
    // Marca que o usuario tentou seguir adiante e gera a pre-visualizacao.
    this.hasTriedSubmit = true;
    this.showPreview = this.validateFields();
  }

  onRename(): void {
    // Dispara a exportacao com nomes novos sem trocar o formato final.
    this.exportSelectedEditions(getRenameCommandName(this.selectedConversion));
  }

  onConvertClick(): void {
    // Dispara a exportacao para o formato definido no menu superior.
    this.exportSelectedEditions(getExportCommandName(this.selectedConversion));
  }

  private exportSelectedEditions(command: 'export_renamed_cbrs' | 'export_renamed_cbzs'): void {
    // Valida o formulario e impede concorrencia com outra exportacao em andamento.
    this.hasTriedSubmit = true;

    if (!this.validateFields() || this.isRenaming()) {
      return;
    }

    if (command === 'export_renamed_cbrs' && !isTauri()) {
      this.platformNotice.showCbrExportNotice();
      return;
    }

    this.runExport(command);
  }

  private runExport(command: 'export_renamed_cbrs' | 'export_renamed_cbzs'): void {
    // Prepara o estado visual antes de iniciar a exportacao.
    const selectedEditions = this.getSelectedEditions();

    this.isRenaming.set(true);
    this.progress.set(0);
    this.progressText.set('Preparando arquivos...');
    this.clearFeedbackTimer();
    this.feedbackMessage.set('');
    document.body.classList.add('is-processing');

    if (!isTauri()) {
      // No navegador, a exportacao usa a implementacao em JavaScript.
      void this.runWebExport(selectedEditions);
      return;
    }

    // No desktop, chamamos o comando Rust que gera os arquivos.
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

  private async runWebExport(selectedEditions: ComicEdition[]): Promise<void> {
    // Monta nomes de edicoes e paginas antes de gerar o ZIP no navegador.
    const seriesName = this.getSeriesName();
    const startingEdition = this.getStartingEdition();
    const totalEditions = selectedEditions.length;

    try {
      const editionsToExport = selectedEditions.map((edition, i) => {
        const currentEditionNum = String(startingEdition + i).padStart(3, '0');
        const editionName = `${seriesName} #${currentEditionNum}`;

        const pages = edition.pages.map((page, pageIndex) => {
          const currentPageNum = String(pageIndex + 1).padStart(3, '0');
          const ext = this.getPageExtension(page.fileName);
          return {
            fileName: `${editionName} - ${currentPageNum}.${ext}`,
            imagePath: page.imagePath,
          };
        });

        return {
          fileName: editionName,
          pages,
        };
      });

      const result = await this.webArchiveService.exportEditionsToWebFolder(
        seriesName,
        editionsToExport,
        (percent, message) => {
          this.progress.set(percent);
          this.progressText.set(message);
        },
      );

      if (result === 'cancelled') {
        this.showFeedback('Operação cancelada pelo usuário.', 'error');
      } else if (result === 'folder') {
        this.showFeedback(`${totalEditions} arquivo(s) salvos na pasta '${seriesName}'.`, 'success');
      } else {
        this.showFeedback(`Pasta compactada '${seriesName}.zip' baixada com sucesso.`, 'success');
      }
    } catch (error) {
      console.error('Erro ao exportar arquivos na Web:', error);
      this.showFeedback(`Não foi possível gerar os arquivos: ${error}`, 'error');
    } finally {
      this.isRenaming.set(false);
      document.body.classList.remove('is-processing');
    }
  }

  private showFeedback(message: string, type: 'success' | 'error'): void {
    // Mostra uma mensagem temporaria de sucesso ou erro.
    this.feedbackMessage.set(message);
    this.feedbackType.set(type);
    this.clearFeedbackTimer();
    this.feedbackTimer = setTimeout(() => {
      this.feedbackMessage.set('');
      this.feedbackTimer = undefined;
    }, 3000);
  }

  private clearFeedbackTimer(): void {
    // Evita timers duplicados quando uma nova mensagem aparece.
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = undefined;
    }
  }

  private getSelectedEditions(): ComicEdition[] {
    // Filtra apenas as edicoes marcadas na lista principal.
    return this.fileManagerService.fileEditions.filter((edition) =>
      this.fileManagerService.activeEditionIds.has(edition.id),
    );
  }

  private getSeriesName(): string {
    // Monta o nome final da serie com titulo e ano informados.
    return `${this.title || 'Sem titulo'} (${this.year || '0000'})`;
  }

  private getStartingEdition(): number {
    // Define a primeira edicao da serie, com fallback seguro para 1.
    const parsed = Number.parseInt(this.edition || '1', 10);
    return Number.isNaN(parsed) ? 1 : parsed;
  }

  private getPageExtension(fileName: string): string {
    // Mantem a extensao original da pagina ao gerar o novo nome.
    const extension = fileName.match(/\.([^.]+)$/)?.[1];
    return extension?.toLowerCase() || 'jpg';
  }
}

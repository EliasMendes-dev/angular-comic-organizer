/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

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
  // Estado visual dos botoes e da barra de progresso vem do componente pai.
  @Input() isPreviewDisabled = true;
  @Input() isRenameDisabled = true;
  @Input() showConvertButton = false;
  @Input() isConvertDisabled = true;
  @Input() convertButtonText = 'Converter';
  @Input() isProcessing = false;
  @Input() progress = 0;
  @Input() progressText = '';
  @Input() feedbackMessage = '';
  @Input() feedbackType: 'success' | 'error' = 'success';

  @Output() onPreview = new EventEmitter<void>();
  @Output() onRename = new EventEmitter<void>();
  @Output() onConvert = new EventEmitter<void>();

  handlePreview(): void {
    // Dispara a acao de gerar pre-visualizacao.
    this.onPreview.emit();
  }

  handleRename(): void {
    // Dispara a acao de renomear os arquivos selecionados.
    this.onRename.emit();
  }

  handleConvert(): void {
    // Dispara a acao de conversao/exportacao conforme o fluxo escolhido.
    this.onConvert.emit();
  }
}

/*
Responsável por:

guardar formato escolhido
impedir troca após upload
salvar estado
compartilhar estado entre componentes
*/

import { Injectable } from '@angular/core';
import { ConversionType } from '../models/conversion-type';

export type ExportCommandName = 'export_renamed_cbrs' | 'export_renamed_cbzs';
export const EXPORT_PROGRESS_EVENT = 'export-progress';

// Estrutura padrao que o backend usa para reportar progresso de exportacao.
export interface ExportProgress {
  current: number;
  total: number;
  progress: number;
  message: string;
}

// Escolhe o comando de exportacao com base no fluxo selecionado pelo usuario.
export function getExportCommandName(
  conversion: ConversionType | null,
): ExportCommandName {
  return conversion === 'cbr-to-cbz' ? 'export_renamed_cbzs' : 'export_renamed_cbrs';
}

// Escolhe o comando de renomeacao, respeitando o tipo de conversao ativo.
export function getRenameCommandName(
  conversion: ConversionType | null,
): ExportCommandName {
  return conversion === 'cbz-to-cbr' ? 'export_renamed_cbzs' : 'export_renamed_cbrs';
}

@Injectable({
  providedIn: 'root',
})
export class ConversionStateService {
  // Guarda o fluxo ativo para impedir trocas inconsistentes no meio do processo.
  private selectedConversion: ConversionType | null = null;

  // ======================
  // Getter
  // ======================

  getConversion(): ConversionType | null {
    // Expõe o fluxo selecionado para outros componentes.
    return this.selectedConversion;
  }

  // ======================
  // Setter
  // ======================

  setConversion(type: ConversionType): void {
    // Registra o fluxo escolhido depois da primeira seleção de arquivos.
    this.selectedConversion = type;
  }

  // ======================
  // Clear
  // ======================

  clearConversion(): void {
    // Libera a tela para o usuario começar outro fluxo do zero.
    this.selectedConversion = null;
  }
}

/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

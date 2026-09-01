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

export function getExportCommandName(
  conversion: ConversionType | null,
): ExportCommandName {
  return conversion === 'cbr-to-cbz' ? 'export_renamed_cbzs' : 'export_renamed_cbrs';
}

@Injectable({
  providedIn: 'root',
})
export class ConversionStateService {
  private selectedConversion: ConversionType | null = null;

  // ======================
  // Getter
  // ======================

  getConversion(): ConversionType | null {
    return this.selectedConversion;
  }

  // ======================
  // Setter
  // ======================

  setConversion(type: ConversionType): void {
    this.selectedConversion = type;
  }

  // ======================
  // Clear
  // ======================

  clearConversion(): void {
    this.selectedConversion = null;
  }
}

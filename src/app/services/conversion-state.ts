/*
Responsável por:

guardar formato escolhido
impedir troca após upload
salvar estado
compartilhar estado entre componentes
*/

import { Injectable } from '@angular/core';
import { ConversionType } from '../models/conversion-type';

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

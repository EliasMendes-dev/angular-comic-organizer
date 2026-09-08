/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Component, Input } from '@angular/core';
import { LucideSettings, LucideEye } from '@lucide/angular';

export interface PreviewPage {
  oldNamePage: string;
  newNamePage: string;
}

// Estrutura usada para mostrar a pre-visualizacao do nome da edicao e das paginas.
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
  // O componente pai decide quando a pre-visualizacao pode ser mostrada.
  @Input() showPreview: boolean = false;
  @Input() renamePreview: PreviewEdition[] = [];
  @Input() previewMessage: string = '';
}

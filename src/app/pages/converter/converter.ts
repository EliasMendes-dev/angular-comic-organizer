/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Component, HostListener } from '@angular/core';
import { SplitAreaComponent, SplitComponent } from 'angular-split';
import { ComicPreview } from '../../components/comic-preview/comic-preview';
import { FileExplorer } from '../../components/file-explorer/file-explorer';
import { RenameSettings } from '../../components/rename-settings/rename-settings';

@Component({
  selector: 'app-converter',
  imports: [FileExplorer, ComicPreview, RenameSettings, SplitComponent, SplitAreaComponent],
  templateUrl: './converter.html',
  styleUrls: ['./converter.css', './converter-responsive.css'],
})
export class Converter {
  isDesktop = window.innerWidth > 1000;

  @HostListener('window:resize')
  onResize(): void {
    this.isDesktop = window.innerWidth > 1000;
  }
}

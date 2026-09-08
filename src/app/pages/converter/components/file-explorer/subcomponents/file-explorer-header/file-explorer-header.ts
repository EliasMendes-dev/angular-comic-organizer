/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  LucideChevronDown,
  LucideFolder,
  LucidePlus,
  LucideTrash2,
  LucideSquareCheckBig,
  LucideSquare,
  LucideSquareX,
} from '@lucide/angular';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { ConversionStateService } from '@app/services/conversion-state';
import { FileManagerService } from '@app/services/file-manager';
import { ConversionType } from '@app/models/conversion-type';
import { ComicEdition } from '@app/models/comic-edition';

@Component({
  selector: 'app-file-explorer-header',
  standalone: true,
  imports: [
    LucideFolder,
    LucidePlus,
    LucideChevronDown,
    LucideTrash2,
    LucideSquareCheckBig,
    LucideSquare,
    LucideSquareX,
  ],
  templateUrl: './file-explorer-header.html',
  styleUrl: './file-explorer-header.css',
})
export class FileExplorerHeader {
  // Indica se ha itens carregados e se a area esta em modo ativo.
  @Input() isActive = false;
  @Input() hasItems = false;

  @Output() chooseAll = new EventEmitter<void>();
  @Output() deleteAll = new EventEmitter<void>();

  isHovering = false;
  isFormatMenuActive = false;
  private pendingConversion: ConversionType | null = null;

  constructor(
    private conversionStateService: ConversionStateService,
    private fileManager: FileManagerService,
  ) {}

  handleChooseAll(): void {
    // Evita disparar selecao geral quando a lista ainda esta vazia.
    if (!this.hasItems) {
      return;
    }

    this.chooseAll.emit();
  }

  handleDeleteAll(): void {
    // Encaminha a acao de remover todas as edicoes.
    this.deleteAll.emit();
  }

  async selectConversion(type: ConversionType): Promise<void> {
    // Fecha o dropdown imediatamente e trava a outra opcao durante a selecao.
    this.isFormatMenuActive = false;

    const currentConversion = this.conversionStateService.getConversion();
    const hasLoadedEditions = this.fileManager.fileEditions.length > 0;

    if (currentConversion && currentConversion !== type) {
      return;
    }

    if (!currentConversion) {
      this.pendingConversion = type;
    }

    const paths = await this.fileManager.selectFiles(type);

    if (!paths.length) {
      this.resetConversionIfNeeded(currentConversion, hasLoadedEditions);
      return;
    }

    const newPaths = this.fileManager.getNewSourcePaths(paths);

    if (!newPaths.length) {
      console.warn('Nenhum arquivo novo selecionado. Os arquivos já foram adicionados.');
      this.resetConversionIfNeeded(currentConversion, hasLoadedEditions);
      return;
    }

    let editions: ComicEdition[];

    if (isTauri()) {
      try {
        const command = type === 'cbr-to-cbz' ? 'process_cbr_files' : 'process_cbz_files';
        editions = await invoke<ComicEdition[]>(command, { paths: newPaths });
      } catch (error) {
        console.error('Erro ao processar arquivos no backend:', error);
        this.resetConversionIfNeeded(currentConversion, hasLoadedEditions);
        return;
      }
    } else {
      editions = await this.fileManager.createWebEditions(newPaths);
    }

    if (!editions?.length) {
      this.resetConversionIfNeeded(currentConversion, hasLoadedEditions);
      return;
    }

    if (!currentConversion) {
      this.conversionStateService.setConversion(type);
    }

    this.pendingConversion = null;
    this.fileManager.addSourcePaths(newPaths);
    this.fileManager.loadEditionsFromBackend(editions);
    this.isFormatMenuActive = false;
  }

  get selectedConversion(): ConversionType | null {
    return this.conversionStateService.getConversion() ?? this.pendingConversion;
  }

  private resetConversionIfNeeded(
    currentConversion: ConversionType | null,
    hasLoadedEditions: boolean,
  ): void {
    if (!hasLoadedEditions && !currentConversion) {
      this.pendingConversion = null;
      this.conversionStateService.clearConversion();
    }
  }
}

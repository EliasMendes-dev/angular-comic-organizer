import { Component, OnInit } from '@angular/core';
import { LucidePlus, LucideChevronDown, LucideMoon, LucideSun } from '@lucide/angular';
import { ConversionStateService } from '../../../../services/conversion-state';
import { FileManagerService } from '../../../../services/file-manager';
import { ConversionType } from '../../../../models/conversion-type';
import { ComicEdition } from '../../../../models/comic-edition';
import { invoke } from '@tauri-apps/api/core';

@Component({
  selector: 'app-menu-bar-settings',
  imports: [LucidePlus, LucideChevronDown, LucideMoon, LucideSun],
  templateUrl: './menu-bar-settings.html',
  styleUrl: './menu-bar-settings.css',
})
export class MenuBarSettings implements OnInit {
  isActive = false;
  isDarkMode: boolean = true;

  constructor(
    private conversionStateService: ConversionStateService,
    private fileManager: FileManagerService,
  ) {}

  async selectConversion(type: ConversionType): Promise<void> {
    const currentConversion = this.conversionStateService.getConversion();
    const hasLoadedEditions = this.fileManager.fileEditions.length > 0;

    if (currentConversion && currentConversion !== type) {
      return;
    }

    const paths = await this.fileManager.selectFiles(type);

    if (!paths.length) {
      this.resetConversionIfNeeded(currentConversion, hasLoadedEditions);
      return;
    }

    const newPaths = this.fileManager.getNewSourcePaths(paths);

    if (!newPaths.length) {
      console.warn('Nenhum arquivo novo selecionado. Os arquivos já foram adicionados.');
      return;
    }

    console.log('📦 Paths recebidos do Tauri:');
    newPaths.forEach((p) => console.log(p));

    console.log('📤 Enviando paths para o backend...');

    let editions: ComicEdition[];

    try {
      const command = type === 'cbr-to-cbz' ? 'process_cbr_files' : 'process_cbz_files';
      editions = await invoke<ComicEdition[]>(command, {
        paths: newPaths,
      });
    } catch (error) {
      console.error('Erro ao processar arquivos no backend:', error);
      this.resetConversionIfNeeded(currentConversion, hasLoadedEditions);
      return;
    }

    if (!editions?.length) {
      this.resetConversionIfNeeded(currentConversion, hasLoadedEditions);
      return;
    }

    if (!currentConversion) {
      this.conversionStateService.setConversion(type);
    }

    this.fileManager.addSourcePaths(newPaths);
    this.fileManager.loadEditionsFromBackend(editions);

    console.log('✅ Backend respondeu');
  }

  get selectedConversion(): ConversionType | null {
    return this.conversionStateService.getConversion();
  }

  ngOnInit(): void {
    document.body.classList.add('dark-mode');
  }

  changeTheme(): void {
    document.body.classList.toggle('dark-mode');
    this.isDarkMode = !this.isDarkMode;
  }

  private resetConversionIfNeeded(
    currentConversion: ConversionType | null,
    hasLoadedEditions: boolean,
  ): void {
    if (!hasLoadedEditions && !currentConversion) {
      this.conversionStateService.clearConversion();
    }
  }
}

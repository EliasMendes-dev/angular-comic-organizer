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
    const hasLoadedEditions = this.fileManager.fileEditions.length > 0;

    if (this.conversionStateService.getConversion() && hasLoadedEditions) {
      return;
    }

    const paths = await this.fileManager.selectFiles(type);

    if (!paths.length) {
      if (!hasLoadedEditions) {
        this.conversionStateService.clearConversion();
      }
      return;
    }

    console.log('📦 Paths recebidos do Tauri:');
    paths.forEach((p) => console.log(p));

    console.log('📤 Enviando paths para o backend...');

    let editions: ComicEdition[];

    try {
      editions = await invoke<ComicEdition[]>('process_cbr_files', {
        paths,
      });
    } catch (error) {
      console.error('Erro ao processar arquivos no backend:', error);
      if (!hasLoadedEditions) {
        this.conversionStateService.clearConversion();
      }
      return;
    }

    if (!editions?.length) {
      if (!hasLoadedEditions) {
        this.conversionStateService.clearConversion();
      }
      return;
    }

    this.conversionStateService.setConversion(type);
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
}

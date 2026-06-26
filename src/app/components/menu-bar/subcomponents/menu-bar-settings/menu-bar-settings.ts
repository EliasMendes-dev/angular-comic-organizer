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
    if (this.conversionStateService.getConversion()) {
      return;
    }

    this.conversionStateService.setConversion(type);

    const paths = await this.fileManager.selectCbrFiles();

    console.log('📦 Paths recebidos do Tauri:');

    paths.forEach((p) => console.log(p));

    console.log('📤 Enviando paths para o backend...');

    const editions = await invoke<ComicEdition[]>('process_cbr_files', {
      paths,
    });

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

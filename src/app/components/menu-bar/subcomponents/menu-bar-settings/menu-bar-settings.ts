import { Component, OnInit } from '@angular/core';
import { LucidePlus, LucideChevronDown, LucideMoon, LucideSun } from '@lucide/angular';
import { ConversionStateService } from '../../../../services/conversion-state';
import { FileManagerService } from '../../../../services/file-manager';
import { ConversionType } from '../../../../models/conversion-type';

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
    private fileManager: FileManagerService
  ) {}

  async selectConversion(type: ConversionType): Promise<void> {
    if (this.conversionStateService.getConversion()) {
      return;
    }

    this.conversionStateService.setConversion(type);

    const paths = await this.fileManager.selectCbrFiles();

    console.log('📦 Paths recebidos do Tauri:');

    paths.forEach(p => console.log(p));
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

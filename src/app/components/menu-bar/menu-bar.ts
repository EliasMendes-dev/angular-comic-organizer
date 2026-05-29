import { Component, OnInit } from '@angular/core';
import {
  LucideBookOpen,
  LucidePlus,
  LucideChevronDown,
  LucideMoon,
  LucideSun,
} from '@lucide/angular';
import { ConversionStateService } from '../../services/conversion-state';
import { ConversionType } from '../../models/conversion-type';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [LucideBookOpen, LucidePlus, LucideChevronDown, LucideMoon, LucideSun],
  templateUrl: './menu-bar.html',
  styleUrls: ['./menu-bar.css', './menu-bar-responsive.css'],
})
export class MenuBar implements OnInit {
  isActive = false; // Controla a visibilidade do menu de opções de formato

  isDarkMode: boolean = true; // Observa tema atual para alternar o ícone do botão de tema

  constructor(private conversionStateService: ConversionStateService) {}

  selectConversion(type: ConversionType): void {
    if (this.conversionStateService.getConversion()) {
      return;
    }

    this.conversionStateService.setConversion(type);

    console.log('Conversão escolhida:', type);
  }

  get selectedConversion(): ConversionType | null {
    return this.conversionStateService.getConversion();
  }

  // Adiciona a classe 'dark-mode' ao corpo para aplicar o tema escuro por padrão
  ngOnInit(): void {
    document.body.classList.add('dark-mode');
  }

  // Alterna entre os temas claro e escuro, atualizando a classe do corpo e o estado do tema
  changeTheme(): void {
    document.body.classList.toggle('dark-mode');
    this.isDarkMode = !this.isDarkMode;
  }
}

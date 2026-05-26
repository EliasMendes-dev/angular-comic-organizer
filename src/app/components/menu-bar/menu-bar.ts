import { Component, OnInit } from '@angular/core';
import {
  LucideBookOpen,
  LucidePlus,
  LucideChevronDown,
  LucideMoon,
  LucideSun
} from '@lucide/angular';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [
    LucideBookOpen,
    LucidePlus,
    LucideChevronDown,
    LucideMoon,
    LucideSun
  ],
  templateUrl: './menu-bar.html',
  styleUrls: ['./menu-bar.css', './menu-bar-responsive.css'],
})

export class MenuBar implements OnInit {

  // Observa tema atual para alternar o ícone do botão de tema
  isDarkMode: boolean = true;

  constructor() {}

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

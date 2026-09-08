/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuBarLogo } from './subcomponents/menu-bar-logo/menu-bar-logo';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [MenuBarLogo, RouterLink, RouterLinkActive],
  templateUrl: './menu-bar.html',
  styleUrls: ['./menu-bar.css', './menu-bar-responsive.css'],
})
// Barra superior global com a identidade e a navegacao principal.
export class MenuBar {}

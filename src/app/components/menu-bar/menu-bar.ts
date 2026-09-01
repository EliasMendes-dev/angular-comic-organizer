/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Component } from '@angular/core';
import { MenuBarLogo } from './subcomponents/menu-bar-logo/menu-bar-logo';
import { MenuBarSettings } from './subcomponents/menu-bar-settings/menu-bar-settings';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [MenuBarLogo, MenuBarSettings],
  templateUrl: './menu-bar.html',
  styleUrls: ['./menu-bar.css', './menu-bar-responsive.css'],
})
export class MenuBar {}

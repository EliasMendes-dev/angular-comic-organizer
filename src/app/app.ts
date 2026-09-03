/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuBar} from './components/menu-bar/menu-bar';
import { FooterBar } from './components/footer-bar/footer-bar';
import { PlatformNotice } from './components/platform-notice/platform-notice';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuBar, FooterBar, PlatformNotice],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Titulo base da aplicacao, usado como referencia geral do app.
  protected readonly title = signal('angular_comic_organizer');
}

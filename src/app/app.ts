/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuBar} from '@app/components/menu-bar/menu-bar';
import { FooterBar } from '@app/components/footer-bar/footer-bar';
import { PlatformNotice } from '@app/components/platform-notice/platform-notice';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuBar, FooterBar, PlatformNotice],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}

/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FileManagerService } from '@app/services/file-manager';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css', './home-responsive.css'],
})
export class Home {
  private fileManager = inject(FileManagerService);
  readonly editions = computed(() => this.fileManager.fileEditions);
  readonly totalPages = computed(() => this.editions().reduce((total, edition) => total + edition.pages.length, 0));
}

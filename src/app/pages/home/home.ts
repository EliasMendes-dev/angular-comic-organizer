import { Component, OnInit, HostListener } from '@angular/core';
import { FileExplorer } from '../../components/file-explorer/file-explorer';
import { ComicPreview } from '../../components/comic-preview/comic-preview';
import { RenameSettings } from '../../components/rename-settings/rename-settings';
import { SplitComponent, SplitAreaComponent } from 'angular-split';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FileExplorer,
    ComicPreview,
    RenameSettings,
    SplitComponent,
    SplitAreaComponent
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css', './home-responsive.css'],
})
export class Home implements OnInit {
  isDesktop = window.innerWidth > 1000;

  /* Host listener vai atualizar o estado quando a janela for redimensionada, no geral ele serve para detectar mudanças no tamanho da janela */
  @HostListener('window:resize')
  onResize() {
    this.isDesktop = window.innerWidth > 1000;
  }

  constructor() {}

  ngOnInit(): void {}
}

import { Component, HostListener } from '@angular/core';
import { SplitAreaComponent, SplitComponent } from 'angular-split';
import { ComicPreview } from '../../components/comic-preview/comic-preview';
import { FileExplorer } from '../../components/file-explorer/file-explorer';
import { RenameSettings } from '../../components/rename-settings/rename-settings';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FileExplorer, ComicPreview, RenameSettings, SplitComponent, SplitAreaComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css', './home-responsive.css'],
})
export class Home {
  isDesktop = window.innerWidth > 1000;

  @HostListener('window:resize')
  onResize(): void {
    this.isDesktop = window.innerWidth > 1000;
  }
}

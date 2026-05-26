import { Component, OnInit } from '@angular/core';
import { FileExplorer } from '../../components/file-explorer/file-explorer';
import { ComicPreview } from '../../components/comic-preview/comic-preview';
import { RenameSettings } from '../../components/rename-settings/rename-settings';
import { SplitComponent, SplitAreaComponent } from 'angular-split';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FileExplorer, ComicPreview, RenameSettings, SplitComponent, SplitAreaComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css', './home-responsive.css'],
})
export class Home implements OnInit {
  constructor() {}
  ngOnInit(): void {}
}

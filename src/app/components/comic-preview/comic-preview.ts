import { Component } from '@angular/core';
import {LucideEye, LucideImage} from '@lucide/angular';
import { ComicPreviewStateService } from '../../services/comic-preview-state';

@Component({
  selector: 'app-comic-preview',
  standalone: true,
  imports: [LucideEye, LucideImage],
  templateUrl: './comic-preview.html',
  styleUrls: ['./comic-preview.css', './comic-preview-responsive.css'],
})
export class ComicPreview {
  constructor(
    public comicPreviewStateService: ComicPreviewStateService,
  ) {}

}

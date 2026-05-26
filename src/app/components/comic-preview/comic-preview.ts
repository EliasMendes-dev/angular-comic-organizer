import { Component, OnInit } from '@angular/core';
import {LucideEye, LucideImage} from '@lucide/angular';

@Component({
  selector: 'app-comic-preview',
  standalone: true,
  imports: [LucideEye, LucideImage],
  templateUrl: './comic-preview.html',
  styleUrls: ['./comic-preview.css', './comic-preview-responsive.css'],
})
export class ComicPreview implements OnInit {
  ngOnInit(): void {
  }
}

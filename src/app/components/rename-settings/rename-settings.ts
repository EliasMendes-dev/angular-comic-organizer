import { Component, OnInit } from '@angular/core';
import {LucideSettings, LucideEye, LucideFileArchive, LucidePenLine, LucideLayers, LucideTrash2} from '@lucide/angular';

@Component({
  selector: 'app-rename-settings',
  standalone: true,
  imports: [LucideSettings, LucideEye, LucideFileArchive, LucidePenLine, LucideLayers, LucideTrash2],
  templateUrl: './rename-settings.html',
  styleUrls: ['./rename-settings.css', './rename-settings-responsive.css'],
})
export class RenameSettings implements OnInit {
  ngOnInit(): void {
  }
}

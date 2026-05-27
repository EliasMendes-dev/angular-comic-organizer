import { Component, OnInit } from '@angular/core';
import { LucideFolder, LucideTrash2, LucideSquareCheckBig, LucideSquare } from '@lucide/angular';

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [LucideFolder, LucideTrash2, LucideSquareCheckBig, LucideSquare],
  templateUrl: './file-explorer.html',
  styleUrls: ['./file-explorer.css', './file-explorer-responsive.css'],
})
export class FileExplorer implements OnInit {
  isHovering = false;
  isActive = false;

  ngOnInit(): void {}
}

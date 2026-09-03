/*
Required Notice: Copyright (C) 2026 Jose Elias Herminio Mendes - Projeto Comic Organizer
*/

import { Component } from '@angular/core';
import { PlatformNoticeService } from '../../services/platform-notice';

@Component({
  selector: 'app-platform-notice',
  standalone: true,
  templateUrl: './platform-notice.html',
  styleUrl: './platform-notice.css',
})
export class PlatformNotice {
  constructor(public noticeService: PlatformNoticeService) {}

  close(): void {
    this.noticeService.close();
  }
}

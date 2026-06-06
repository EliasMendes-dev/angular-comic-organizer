import { Component, OnInit } from '@angular/core';
import { MenuBarLogo } from './subcomponents/menu-bar-logo/menu-bar-logo';
import { MenuBarSettings } from './subcomponents/menu-bar-settings/menu-bar-settings';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [MenuBarLogo, MenuBarSettings],
  templateUrl: './menu-bar.html',
  styleUrls: ['./menu-bar.css', './menu-bar-responsive.css'],
})
export class MenuBar implements OnInit {

  constructor() {}

  ngOnInit(): void {}
}

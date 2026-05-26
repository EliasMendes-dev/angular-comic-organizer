import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuBar} from './components/menu-bar/menu-bar';
import { FooterBar } from './components/footer-bar/footer-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuBar, FooterBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angular_comic_organizer');
}

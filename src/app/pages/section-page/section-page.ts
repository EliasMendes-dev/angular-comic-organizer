import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-section-page',
  imports: [RouterLink],
  templateUrl: './section-page.html',
  styleUrl: './section-page.css',
})
export class SectionPage {
  private route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.data['title'] as string;
  readonly eyebrow = this.route.snapshot.data['eyebrow'] as string;
  readonly description = this.route.snapshot.data['description'] as string;
}

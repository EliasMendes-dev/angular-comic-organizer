import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ComicEdition } from '@app/models/comic-edition';
import { FileManagerService } from '@app/services/file-manager';

@Component({
  selector: 'app-library',
  imports: [RouterLink],
  templateUrl: './library.html',
  styleUrl: './library.css',
})
export class Library {
  private fileManager = inject(FileManagerService);
  readonly search = signal('');
  readonly format = signal<'all' | 'cbz' | 'cbr'>('all');
  readonly status = signal<'all' | 'to-read' | 'reading' | 'read'>('all');
  readonly editions = computed(() => {
    const query = this.search().trim().toLowerCase();
    const selectedFormat = this.format();
    return this.fileManager.fileEditions.filter((edition) => {
      const name = edition.originalFile?.name.toLowerCase() ?? edition.title.toLowerCase();
      const matchesSearch = !query || edition.title.toLowerCase().includes(query);
      const matchesFormat = selectedFormat === 'all' || name.endsWith(`.${selectedFormat}`);
      return matchesSearch && matchesFormat;
    });
  });

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  setFormat(event: Event): void {
    this.format.set((event.target as HTMLSelectElement).value as 'all' | 'cbz' | 'cbr');
  }

  setStatus(event: Event): void {
    this.status.set((event.target as HTMLSelectElement).value as 'all' | 'to-read' | 'reading' | 'read');
  }

  async onFolderSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).filter((file) => /\.(cbz|cbr)$/i.test(file.name));
    if (!files.length) return;

    files.forEach((file) => this.fileManager.webFiles.set(file.name, file));
    const editions = await this.fileManager.createWebEditions(files.map((file) => file.name));
    this.fileManager.loadEditionsFromBackend(editions);
    input.value = '';
  }

  trackEdition(_index: number, edition: ComicEdition): number {
    return edition.id;
  }
}

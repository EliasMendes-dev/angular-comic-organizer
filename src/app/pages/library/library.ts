import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ComicEdition } from '@app/models/comic-edition';
import { ReadingStatus } from '@app/models/library-metadata';
import { FileManagerService } from '@app/services/file-manager';
import { LibraryMetadataService } from '@app/services/library-metadata';
import { LibrarySourcesService } from '@app/services/library-sources';

@Component({
  selector: 'app-library',
  imports: [RouterLink],
  templateUrl: './library.html',
  styleUrl: './library.css',
})
export class Library {
  private fileManager = inject(FileManagerService);
  readonly libraryMetadata = inject(LibraryMetadataService);
  readonly librarySources = inject(LibrarySourcesService);
  readonly search = signal('');
  readonly format = signal<'all' | 'cbz' | 'cbr'>('all');
  readonly status = signal<'all' | 'to-read' | 'reading' | 'read'>('all');
  readonly editions = computed(() => {
    const query = this.search().trim().toLowerCase();
    const selectedFormat = this.format();
    const selectedStatus = this.status();
    return this.fileManager.fileEditions.filter((edition) => {
      const name = edition.originalFile?.name.toLowerCase() ?? edition.title.toLowerCase();
      const matchesSearch = !query || edition.title.toLowerCase().includes(query);
      const matchesFormat = selectedFormat === 'all' || name.endsWith(`.${selectedFormat}`);
      const matchesStatus = selectedStatus === 'all' || this.libraryMetadata.getMetadata(edition).status === selectedStatus;
      return matchesSearch && matchesFormat && matchesStatus;
    });
  });

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  setFormat(event: Event): void {
    this.format.set((event.target as HTMLSelectElement).value as 'all' | 'cbz' | 'cbr');
  }

  setStatus(event: Event): void {
    this.status.set((event.target as HTMLSelectElement).value as 'all' | ReadingStatus);
  }

  toggleFavorite(edition: ComicEdition): void {
    this.libraryMetadata.setFavorite(edition);
  }

  toggleCollection(edition: ComicEdition, event: Event): void {
    const collectionId = (event.target as HTMLSelectElement).value;
    if (collectionId) this.libraryMetadata.toggleCollection(edition, collectionId);
    (event.target as HTMLSelectElement).value = '';
  }

  async onFolderSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).filter((file) => /\.(cbz|cbr)$/i.test(file.name));
    if (!files.length) return;

    const fileNames = files.map((file) => file.webkitRelativePath || file.name);
    files.forEach((file, index) => this.fileManager.webFiles.set(fileNames[index], file));
    this.librarySources.addLocalSource(fileNames[0]?.split('/')[0] ?? 'Pasta local', fileNames);
    const editions = await this.fileManager.createWebEditions(fileNames);
    editions.forEach((edition) => this.libraryMetadata.registerEdition(edition, edition.pages[0]?.imagePath));
    this.fileManager.loadEditionsFromBackend(editions);
    input.value = '';
  }

  trackEdition(_index: number, edition: ComicEdition): number {
    return edition.id;
  }
}

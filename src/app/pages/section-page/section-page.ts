import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ComicEdition } from '@app/models/comic-edition';
import { FileManagerService } from '@app/services/file-manager';
import { LibraryMetadataService } from '@app/services/library-metadata';
import { LibrarySourcesService } from '@app/services/library-sources';

@Component({
  selector: 'app-section-page',
  imports: [RouterLink],
  templateUrl: './section-page.html',
  styleUrl: './section-page.css',
})
export class SectionPage {
  private route = inject(ActivatedRoute);
  private fileManager = inject(FileManagerService);
  readonly libraryMetadata = inject(LibraryMetadataService);
  readonly librarySources = inject(LibrarySourcesService);
  readonly title = this.route.snapshot.data['title'] as string;
  readonly eyebrow = this.route.snapshot.data['eyebrow'] as string;
  readonly description = this.route.snapshot.data['description'] as string;
  readonly sectionType = this.route.snapshot.data['sectionType'] as string | undefined;
  readonly isFavorites = this.sectionType === 'favorites';
  readonly isCollections = this.sectionType === 'collections';
  readonly isSettings = this.sectionType === 'settings';
  readonly collectionName = signal('');
  readonly viewMode = signal<'normal' | 'compact' | 'list'>('normal');
  readonly favoriteEditions = computed(() =>
    this.fileManager.fileEditions.filter((edition) => this.libraryMetadata.isFavorite(edition)),
  );
  readonly collectionsWithItems = computed(() => {
    const currentKeys = new Set(this.fileManager.fileEditions.map((edition) => this.libraryMetadata.getEditionKey(edition)));
    const stored = new Map(this.libraryMetadata.getStoredMetadata().map((entry) => [entry.key, entry.metadata]));

    return this.libraryMetadata.collections().map((collection) => ({
      ...collection,
      items: collection.editionKeys.map((key) => ({
        key,
        metadata: stored.get(key),
        present: currentKeys.has(key) || stored.get(key)?.cover?.startsWith('/cassdadosmockados/') === true,
      })),
    }));
  });

  onCollectionName(event: Event): void {
    this.collectionName.set((event.target as HTMLInputElement).value);
  }

  createCollection(): void {
    this.libraryMetadata.createCollection(this.collectionName());
    this.collectionName.set('');
  }

  deleteCollection(collectionId: string): void {
    this.libraryMetadata.deleteCollection(collectionId);
  }

  removeSource(sourceId: string): void {
    const source = this.librarySources.removeSource(sourceId);
    if (source?.type === 'local') this.fileManager.removeWebSource(source.fileNames);
  }

  setViewMode(viewMode: 'normal' | 'compact' | 'list'): void {
    this.viewMode.set(viewMode);
  }

  trackEdition(_index: number, edition: ComicEdition): number {
    return edition.id;
  }
}

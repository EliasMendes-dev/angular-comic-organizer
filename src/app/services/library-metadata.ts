import { Injectable, signal } from '@angular/core';
import { ComicEdition } from '@app/models/comic-edition';
import { ComicCollection, LibraryMetadata, ReadingStatus } from '@app/models/library-metadata';

const METADATA_STORAGE_KEY = 'comic-organizer-library-metadata';
const COLLECTIONS_STORAGE_KEY = 'comic-organizer-collections';

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

@Injectable({
  providedIn: 'root',
})
export class LibraryMetadataService {
  readonly metadata = signal<Record<string, LibraryMetadata>>(
    readStorage<Record<string, LibraryMetadata>>(METADATA_STORAGE_KEY, {}),
  );
  readonly collections = signal<ComicCollection[]>(readStorage<ComicCollection[]>(COLLECTIONS_STORAGE_KEY, []));

  getEditionKey(edition: ComicEdition): string {
    const file = edition.originalFile;
    const sourcePath = edition.sourcePath ?? file?.name;
    if (!sourcePath) return `${edition.title}|mock`;

    const extension = sourcePath.split('.').pop()?.toLowerCase() ?? '';
    return `${sourcePath}|${file?.size ?? 0}|${extension}`;
  }

  getMetadata(edition: ComicEdition): LibraryMetadata {
    return (
      this.metadata()[this.getEditionKey(edition)] ?? {
        favorite: false,
        status: 'to-read',
        collectionIds: [],
      }
    );
  }

  ensureMetadata(edition: ComicEdition, initial: Partial<LibraryMetadata>): void {
    const key = this.getEditionKey(edition);
    if (this.metadata()[key]) return;

    this.metadata.update((metadata) => ({
      ...metadata,
      [key]: {
        favorite: initial.favorite ?? false,
        status: initial.status ?? 'to-read',
        collectionIds: initial.collectionIds ?? [],
        title: initial.title ?? edition.title,
        cover: initial.cover,
        fileName: initial.fileName ?? edition.sourcePath ?? edition.originalFile?.name,
        fileSize: initial.fileSize ?? edition.originalFile?.size,
        fileExtension: initial.fileExtension ?? edition.originalFile?.name.split('.').pop()?.toLowerCase(),
        readPageIds: initial.readPageIds ?? [],
        pageCount: initial.pageCount,
      },
    }));
    this.persist();
  }

  registerEdition(edition: ComicEdition, cover?: string): void {
    const key = this.getEditionKey(edition);
    const current = this.getMetadata(edition);
    const file = edition.originalFile;
    this.metadata.update((metadata) => ({
      ...metadata,
      [key]: {
        ...current,
        title: edition.title,
        cover: cover ?? current.cover,
        fileName: edition.sourcePath ?? file?.name ?? current.fileName,
        fileSize: file?.size ?? current.fileSize,
        fileExtension: file?.name.split('.').pop()?.toLowerCase() ?? current.fileExtension,
      },
    }));
    this.persist();
    if (cover && !cover.startsWith('data:')) void this.persistCoverSnapshot(key, cover);
  }

  getStoredMetadata(): Array<{ key: string; metadata: LibraryMetadata }> {
    return Object.entries(this.metadata()).map(([key, metadata]) => ({ key, metadata }));
  }

  isFavorite(edition: ComicEdition): boolean {
    return this.getMetadata(edition).favorite;
  }

  setFavorite(edition: ComicEdition): void {
    const key = this.getEditionKey(edition);
    this.updateMetadata(key, { favorite: !this.getMetadata(edition).favorite });
  }

  setStatus(edition: ComicEdition, status: ReadingStatus): void {
    this.updateMetadata(this.getEditionKey(edition), { status });
  }

  recordPageViewed(edition: ComicEdition, pageId: number, pageIndex: number): void {
    const key = this.getEditionKey(edition);
    const current = this.getMetadata(edition);
    const readPageIds = Array.from(new Set([...(current.readPageIds ?? []), pageId]));
    const pageCount = edition.pages.length;
    const status: ReadingStatus = readPageIds.length >= pageCount && pageCount > 0 ? 'read' : 'reading';

    this.updateMetadata(key, {
      status,
      readPageIds,
      pageCount,
      lastPageIndex: pageIndex,
    });
  }

  getReadingProgress(edition: ComicEdition): number {
    const metadata = this.getMetadata(edition);
    if (!metadata.pageCount) return 0;
    return Math.min(100, Math.round(((metadata.readPageIds?.length ?? 0) / metadata.pageCount) * 100));
  }

  createCollection(name: string): void {
    const normalizedName = name.trim();
    if (!normalizedName || this.collections().some((collection) => collection.name.toLowerCase() === normalizedName.toLowerCase())) {
      return;
    }

    this.collections.update((collections) => [
      ...collections,
      { id: crypto.randomUUID(), name: normalizedName, editionKeys: [] },
    ]);
    this.persistCollections();
  }

  deleteCollection(collectionId: string): void {
    this.collections.update((collections) => collections.filter((collection) => collection.id !== collectionId));
    const nextMetadata = Object.fromEntries(
      Object.entries(this.metadata()).map(([key, metadata]) => [
        key,
        { ...metadata, collectionIds: metadata.collectionIds.filter((id) => id !== collectionId) },
      ]),
    );
    this.metadata.set(nextMetadata);
    this.persist();
    this.persistCollections();
  }

  toggleCollection(edition: ComicEdition, collectionId: string): void {
    const key = this.getEditionKey(edition);
    const current = this.getMetadata(edition);
    const collectionIds = current.collectionIds.includes(collectionId)
      ? current.collectionIds.filter((id) => id !== collectionId)
      : [...current.collectionIds, collectionId];

    this.updateMetadata(key, { collectionIds });
    this.collections.update((collections) =>
      collections.map((collection) => {
        if (collection.id !== collectionId) return collection;
        const editionKeys = collection.editionKeys.includes(key)
          ? collection.editionKeys.filter((editionKey) => editionKey !== key)
          : [...collection.editionKeys, key];
        return { ...collection, editionKeys };
      }),
    );
    this.persistCollections();
  }

  private updateMetadata(key: string, changes: Partial<LibraryMetadata>): void {
    this.metadata.update((metadata) => ({
      ...metadata,
      [key]: { ...this.getMetadataByKey(metadata, key), ...changes },
    }));
    this.persist();
  }

  private getMetadataByKey(metadata: Record<string, LibraryMetadata>, key: string): LibraryMetadata {
    return metadata[key] ?? { favorite: false, status: 'to-read', collectionIds: [] };
  }

  private persist(): void {
    localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(this.metadata()));
  }

  private persistCollections(): void {
    localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(this.collections()));
  }

  private async persistCoverSnapshot(key: string, cover: string): Promise<void> {
    try {
      const response = await fetch(cover);
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });

      this.metadata.update((metadata) => ({
        ...metadata,
        [key]: { ...this.getMetadataByKey(metadata, key), cover: dataUrl },
      }));
      this.persist();
    } catch {
      // Keep the original path when the runtime cannot read the preview URL.
    }
  }
}

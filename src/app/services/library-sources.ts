import { Injectable, signal } from '@angular/core';
import { LibrarySource } from '@app/models/library-source';

const SOURCES_STORAGE_KEY = 'comic-organizer-library-sources';

function readSources(): LibrarySource[] {
  try {
    const value = localStorage.getItem(SOURCES_STORAGE_KEY);
    return value ? (JSON.parse(value) as LibrarySource[]) : [];
  } catch {
    return [];
  }
}

@Injectable({ providedIn: 'root' })
export class LibrarySourcesService {
  readonly sources = signal<LibrarySource[]>(readSources());

  addLocalSource(name: string, fileNames: string[]): void {
    const uniqueFileNames = Array.from(new Set(fileNames));
    if (!uniqueFileNames.length) return;

    const source: LibrarySource = {
      id: crypto.randomUUID(),
      name: name || 'Pasta local',
      type: 'local',
      fileNames: uniqueFileNames,
      addedAt: new Date().toISOString(),
    };

    this.sources.update((sources) => [...sources, source]);
    this.persist();
  }

  removeSource(sourceId: string): LibrarySource | undefined {
    const source = this.sources().find((item) => item.id === sourceId);
    this.sources.update((sources) => sources.filter((item) => item.id !== sourceId));
    this.persist();
    return source;
  }

  private persist(): void {
    localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(this.sources()));
  }
}

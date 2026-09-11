/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideBookOpen, LucideCloud, LucideFolderOpen, LucideHeart, LucidePlus, LucideSearch } from '@lucide/angular';
import { ComicEdition } from '@app/models/comic-edition';
import { FileManagerService } from '@app/services/file-manager';
import { LibraryMetadataService } from '@app/services/library-metadata';
import { LibrarySourcesService } from '@app/services/library-sources';

interface MockComic extends ComicEdition {
  cover: string;
  format: 'CBZ' | 'CBR';
}

@Component({
  selector: 'app-home',
  imports: [LucideBookOpen, LucideCloud, LucideFolderOpen, LucideHeart, LucidePlus, LucideSearch, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css', './home-responsive.css'],
})
export class Home {
  private fileManager = inject(FileManagerService);
  readonly libraryMetadata = inject(LibraryMetadataService);
  readonly librarySources = inject(LibrarySourcesService);
  readonly search = signal('');
  readonly filter = signal<'all' | 'favorites' | 'reading' | 'to-read' | 'read'>('all');
  readonly viewMode = signal<'normal' | 'compact' | 'list'>('normal');
  readonly mockEditions: MockComic[] = [
    { id: 1, title: 'Gotham Knights', pages: [], cover: '/cassdadosmockados/1.jpg', format: 'CBZ' },
    { id: 2, title: 'Batman: City of Shadows', pages: [], cover: '/cassdadosmockados/2.jpg', format: 'CBZ' },
    { id: 3, title: 'The City of Gotham', pages: [], cover: '/cassdadosmockados/3.jpg', format: 'CBR' },
    { id: 4, title: 'Batman Beyond', pages: [], cover: '/cassdadosmockados/4.jpg', format: 'CBZ' },
    { id: 5, title: 'Cassandra Cain', pages: [], cover: '/cassdadosmockados/5.jpg', format: 'CBZ' },
    { id: 6, title: 'Absolute Cassandra Cain', pages: [], cover: '/cassdadosmockados/6.jpg', format: 'CBZ' },
    { id: 7, title: 'Dark Knight Files', pages: [], cover: '/cassdadosmockados/7.jpg', format: 'CBR' },
    { id: 8, title: 'Gotham After Midnight', pages: [], cover: '/cassdadosmockados/1.jpg', format: 'CBR' },
    { id: 9, title: 'Shadow over Gotham', pages: [], cover: '/cassdadosmockados/2.jpg', format: 'CBZ' },
    { id: 10, title: 'Noir City', pages: [], cover: '/cassdadosmockados/3.jpg', format: 'CBZ' },
    { id: 11, title: 'Beyond the Night', pages: [], cover: '/cassdadosmockados/4.jpg', format: 'CBR' },
    { id: 12, title: 'Orphan: Silent Code', pages: [], cover: '/cassdadosmockados/5.jpg', format: 'CBZ' },
    { id: 13, title: 'Absolute: Year One', pages: [], cover: '/cassdadosmockados/6.jpg', format: 'CBR' },
    { id: 14, title: 'The Long Halloween Files', pages: [], cover: '/cassdadosmockados/7.jpg', format: 'CBZ' },
    { id: 15, title: 'Gotham Central', pages: [], cover: '/cassdadosmockados/1.jpg', format: 'CBZ' },
    { id: 16, title: 'City of Owls', pages: [], cover: '/cassdadosmockados/2.jpg', format: 'CBR' },
    { id: 17, title: 'Detective Stories', pages: [], cover: '/cassdadosmockados/3.jpg', format: 'CBZ' },
    { id: 18, title: 'Future State', pages: [], cover: '/cassdadosmockados/4.jpg', format: 'CBZ' },
    { id: 19, title: 'Batgirl: Rebirth', pages: [], cover: '/cassdadosmockados/5.jpg', format: 'CBR' },
    { id: 20, title: 'The Absolute Files', pages: [], cover: '/cassdadosmockados/6.jpg', format: 'CBZ' },
    { id: 21, title: 'Knightfall Archive', pages: [], cover: '/cassdadosmockados/7.jpg', format: 'CBR' },
  ];
  readonly editions = computed(() => this.fileManager.fileEditions);
  readonly totalPages = computed(() => this.editions().reduce((total, edition) => total + edition.pages.length, 0));
  readonly visibleMockEditions = computed(() => {
    const query = this.search().trim().toLowerCase();
    const filter = this.filter();
    return this.mockEditions.filter((edition) => {
      const metadata = this.libraryMetadata.getMetadata(edition);
      const matchesSearch = !query || edition.title.toLowerCase().includes(query);
      const matchesFilter = filter === 'all' || (filter === 'favorites' ? metadata.favorite : metadata.status === filter);
      return matchesSearch && matchesFilter;
    });
  });
  readonly favoriteCount = computed(() => this.mockEditions.filter((edition) => this.libraryMetadata.isFavorite(edition)).length);
  readonly readingCount = computed(() => this.mockEditions.filter((edition) => this.libraryMetadata.getMetadata(edition).status === 'reading').length);

  constructor() {
    this.mockEditions.forEach((edition, index) => {
      this.libraryMetadata.ensureMetadata(edition, {
        favorite: index % 4 !== 2,
        status: index % 5 === 0 ? 'reading' : index % 3 === 0 ? 'read' : 'to-read',
        title: edition.title,
        cover: edition.cover,
      });
    });
  }

  setFilter(filter: 'all' | 'favorites' | 'reading' | 'to-read' | 'read'): void {
    this.filter.set(filter);
  }

  setViewMode(viewMode: 'normal' | 'compact' | 'list'): void {
    this.viewMode.set(viewMode);
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  toggleFavorite(edition: MockComic): void {
    this.libraryMetadata.setFavorite(edition);
  }

  onLocalFolderSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).filter((file) => /\.(cbz|cbr)$/i.test(file.name));
    const fileNames = files.map((file) => file.webkitRelativePath || file.name);
    files.forEach((file, index) => this.fileManager.webFiles.set(fileNames[index], file));
    if (files.length) {
      this.librarySources.addLocalSource(fileNames[0]?.split('/')[0] ?? 'Pasta local', fileNames);
      void this.fileManager.createWebEditions(fileNames).then((editions) => {
        editions.forEach((edition) => this.libraryMetadata.registerEdition(edition, edition.pages[0]?.imagePath));
        this.fileManager.loadEditionsFromBackend(editions);
      });
    }
    input.value = '';
  }
}

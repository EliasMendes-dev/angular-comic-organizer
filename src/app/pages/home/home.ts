/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software e licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificacao e distribuicao sao permitidos apenas para fins NAO COMERCIAIS.
Para ler a licenca completa, veja o arquivo LICENSE.txt no diretorio raiz.
*/

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideBookOpen,
  LucideChevronDown,
  LucideChevronRight,
  LucideFolderPlus,
  LucideHeart,
  LucideHome,
  LucideLibrary,
  LucideListFilter,
  LucideMenu,
  LucideMoon,
  LucideMoreHorizontal,
  LucidePlus,
  LucideSearch,
  LucideSettings,
  LucideSparkles,
  LucideStar,
  LucideUpload,
  LucideX,
} from '@lucide/angular';

interface Comic {
  title: string;
  issue: string;
  format: 'CBZ' | 'CBR';
  status: 'Lendo' | 'Não lido' | 'Lido';
  cover: string;
  progress?: number;
  page?: string;
  favorite?: boolean;
}

interface Collection {
  name: string;
  count: number;
  covers: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    LucideBookOpen, LucideChevronDown, LucideChevronRight, LucideFolderPlus,
    FormsModule, LucideHeart, LucideHome, LucideLibrary, LucideListFilter, LucideMenu,
    LucideMoon, LucideMoreHorizontal, LucidePlus, LucideSearch, LucideSettings,
    LucideSparkles, LucideStar, LucideUpload, LucideX,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css', './home-responsive.css'],
})
export class Home {
  searchTerm = '';
  activeFilter = 'Todos';
  activeFormat = 'Todos';
  menuOpen = false;
  importMenuOpen = false;
  favorites = new Set(['Batman']);

  readonly comics: Comic[] = [
    { title: 'Batman', issue: '#42', format: 'CBZ', status: 'Lendo', cover: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?auto=format&fit=crop&w=500&q=85', progress: 67, page: '18 de 27', favorite: true },
    { title: 'Saga', issue: '#01', format: 'CBZ', status: 'Não lido', cover: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=500&q=85' },
    { title: 'One Piece', issue: '#1100', format: 'CBR', status: 'Não lido', cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&q=85' },
    { title: 'Watchmen', issue: '#03', format: 'CBZ', status: 'Lido', cover: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=500&q=85', favorite: true },
    { title: 'Monstress', issue: '#08', format: 'CBR', status: 'Não lido', cover: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?auto=format&fit=crop&w=500&q=85' },
    { title: 'Spider-Man', issue: '#01', format: 'CBZ', status: 'Lido', cover: 'https://images.unsplash.com/photo-1634071500422-2c2dd5a0be6b?auto=format&fit=crop&w=500&q=85', favorite: true },
  ];

  readonly collections: Collection[] = [
    { name: 'Marvel', count: 24, covers: [this.comics[5].cover, this.comics[2].cover] },
    { name: 'DC Comics', count: 18, covers: [this.comics[0].cover, this.comics[3].cover] },
    { name: 'Manga', count: 36, covers: [this.comics[2].cover, this.comics[4].cover] },
    { name: 'Favoritos', count: 12, covers: [this.comics[0].cover, this.comics[5].cover] },
  ];

  get filteredComics(): Comic[] {
    return this.comics.filter((comic) => {
      const matchesSearch = comic.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesFilter = this.activeFilter === 'Todos' || (this.activeFilter === 'Favoritos' ? this.favorites.has(comic.title) : comic.status === this.activeFilter);
      const matchesFormat = this.activeFormat === 'Todos' || comic.format === this.activeFormat;
      return matchesSearch && matchesFilter && matchesFormat;
    });
  }

  setFilter(filter: string): void { this.activeFilter = filter; }
  setFormat(format: string): void { this.activeFormat = format; }
  toggleFavorite(comic: Comic): void {
    comic.favorite = !comic.favorite;
    comic.favorite ? this.favorites.add(comic.title) : this.favorites.delete(comic.title);
  }
}

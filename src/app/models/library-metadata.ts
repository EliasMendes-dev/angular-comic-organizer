export type ReadingStatus = 'to-read' | 'reading' | 'read';

export interface LibraryMetadata {
  favorite: boolean;
  status: ReadingStatus;
  collectionIds: string[];
  title?: string;
  cover?: string;
  fileName?: string;
  fileSize?: number;
  fileExtension?: string;
  readPageIds?: number[];
  pageCount?: number;
  lastPageIndex?: number;
}

export interface ComicCollection {
  id: string;
  name: string;
  editionKeys: string[];
}

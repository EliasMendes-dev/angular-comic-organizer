export type LibrarySourceType = 'local' | 'google-drive';

export interface LibrarySource {
  id: string;
  name: string;
  type: LibrarySourceType;
  fileNames: string[];
  addedAt: string;
}

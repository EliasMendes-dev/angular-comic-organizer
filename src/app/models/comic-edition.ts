export interface ComicEdition {
  id: number;
  title: string;
  pages: string[];

  selected?: boolean;
  expanded?: boolean;

  originalFile?: File;

  converted?: boolean;

  outputPath?: string;
}

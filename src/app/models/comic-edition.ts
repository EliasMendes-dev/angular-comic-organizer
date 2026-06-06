import { ComicPage } from "./comic-page";

export interface ComicEdition {
  id: number;
  title: string;
  pages: ComicPage[];

  selected?: boolean;
  expanded?: boolean;

  originalFile?: File;

  converted?: boolean;

  outputPath?: string;
}

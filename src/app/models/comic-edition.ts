/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { ComicPage } from "./comic-page";

// Agrupa as paginas e metadados de uma edicao carregada no app.
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

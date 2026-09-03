/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

// Representa uma pagina individual de uma edicao de quadrinho.
export interface ComicPage {
  id: number;
  fileName: string;
  imagePath: string;
  pageNumber: number;
  selected?: boolean;
}

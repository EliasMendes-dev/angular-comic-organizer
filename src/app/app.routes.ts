/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
];

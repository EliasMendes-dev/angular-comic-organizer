/*
Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo LICENSE.txt no diretório raiz.
*/

import { Routes } from '@angular/router';
import { Home } from '@app/pages/home/home';
import { Library } from '@app/pages/library/library';
import { Converter } from '@app/pages/converter/converter';
import { SectionPage } from '@app/pages/section-page/section-page';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  { path: 'library', component: Library },
  { path: 'favorites', component: SectionPage, data: { title: 'Favorites', eyebrow: 'Sua seleção', description: 'Acesse rapidamente as edições que você marcou como favoritas.' } },
  { path: 'collections', component: SectionPage, data: { title: 'Collections', eyebrow: 'Organização', description: 'Crie coleções para organizar suas leituras por tema, arco ou autor.' } },
  { path: 'settings', component: SectionPage, data: { title: 'Settings', eyebrow: 'Preferências', description: 'As preferências da biblioteca e das fontes aparecerão aqui.' } },
  {
    path: 'converter',
    component: Converter,
  },
  { path: '**', redirectTo: '' },
];

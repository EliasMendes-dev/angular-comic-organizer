/*
Responsável futuramente por:

converter
renomear
compactar
extrair

Esse provavelmente vai conversar com:

Electron
Tauri
backend Node
API local
*/

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FileManagerService {
  
  fileEditions = [
    {
      id: 1,
      title: 'Batgirl (2000) - #01',
      pages: [
        'Batgirl (2000) #01 #001',
        'Batgirl (2000) #01 #002',
        'Batgirl (2000) #01 #003',
        'Batgirl (2000) #01 #004',
      ],
    },
    {
      id: 2,
      title: 'Batgirl (2000) - #02',
      pages: [
        'Batgirl (2000) #02 #001',
        'Batgirl (2000) #02 #002',
        'Batgirl (2000) #02 #003',
        'Batgirl (2000) #02 #004',
      ],
    },
    {
      id: 3,
      title: 'Batgirl (2000) - #03',
      pages: [
        'Batgirl (2000) #03 #001',
        'Batgirl (2000) #03 #002',
        'Batgirl (2000) #03 #003',
        'Batgirl (2000) #03 #004',
      ],
    },
    {
      id: 4,
      title: 'Batgirl (2000) - #04',
      pages: [
        'Batgirl (2000) #04 #001',
        'Batgirl (2000) #04 #002',
        'Batgirl (2000) #04 #003',
        'Batgirl (2000) #04 #004',
      ],
    },
    {
      id: 5,
      title: 'Batgirl (2000) - #05',
      pages: [
        'Batgirl (2000) #05 #001',
        'Batgirl (2000) #05 #002',
        'Batgirl (2000) #05 #003',
        'Batgirl (2000) #05 #004',
      ],
    },
    {
      id: 6,
      title: 'Batgirl (2000) - #06',
      pages: [
        'Batgirl (2000) #06 #001',
        'Batgirl (2000) #06 #002',
        'Batgirl (2000) #06 #003',
        'Batgirl (2000) #06 #004',
      ],
    },
    {
      id: 7,
      title: 'Batgirl (2000) - #07',
      pages: [
        'Batgirl (2000) #07 #001',
        'Batgirl (2000) #07 #002',
        'Batgirl (2000) #07 #003',
        'Batgirl (2000) #07 #004',
      ],
    },
    {
      id: 8,
      title: 'Batgirl (2000) - #08',
      pages: [
        'Batgirl (2000) #08 #001',
        'Batgirl (2000) #08 #002',
        'Batgirl (2000) #08 #003',
        'Batgirl (2000) #08 #004',
      ],
    },
    {
      id: 9,
      title: 'Batgirl (2000) - #09',
      pages: [
        'Batgirl (2000) #09 #001',
        'Batgirl (2000) #09 #002',
        'Batgirl (2000) #09 #003',
        'Batgirl (2000) #09 #004',
      ],
    },
    {
      id: 10,
      title: 'Batgirl (2000) - #10',
      pages: [
        'Batgirl (2000) #10 #001',
        'Batgirl (2000) #10 #002',
        'Batgirl (2000) #10 #003',
        'Batgirl (2000) #10 #004',
      ],
    },
    {
      id: 11,
      title: 'Batgirl (2000) - #11',
      pages: [
        'Batgirl (2000) #11 #001',
        'Batgirl (2000) #11 #002',
        'Batgirl (2000) #11 #003',
        'Batgirl (2000) #11 #004',
      ],
    },
    {
      id: 12,
      title: 'Batgirl (2000) - #12',
      pages: [
        'Batgirl (2000) #12 #001',
        'Batgirl (2000) #12 #002',
        'Batgirl (2000) #12 #003',
        'Batgirl (2000) #12 #004',
      ],
    },
  ];

  activeEditionIds = new Set<number>();
}

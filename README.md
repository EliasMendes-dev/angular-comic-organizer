# 📚 Comic Organizer

Aplicação para organização, renomeação, compactação e gerenciamento de coleções de quadrinhos digitais.

Atualmente o projeto utiliza Angular 21 como camada de interface, com arquitetura preparada para desktop utilizando Node.js + Electron.

> O objetivo final é oferecer uma ferramenta desktop capaz de organizar coleções de HQs, gerar arquivos compactados, renomear edições em massa e gerenciar bibliotecas pessoais de quadrinhos sem depender de servidores externos.

---

## 🚀 Funcionalidades Atuais

* 📂 Exibe edições de quadrinhos como coleções com páginas
* ✏️ Permite selecionar e remover edições ou páginas
* 🧠 Usa ordenação e seleção inteligente para listas de edições
* 🎛️ Interface responsiva com layout adaptável para desktop e mobile
* 🧩 Arquitetura baseada em componentes standalone do Angular
* 🧠 Suporte a drag & drop via Angular CDK
* 🎨 Ícones via `@lucide/angular`

---

## 🚧 Funcionalidades Planejadas

* 📦 Geração de arquivos `.cbz`
* 📦 Geração de arquivos `.cbr` compatíveis
* 🔄 Conversão entre formatos suportados
* 🖼️ Importação de imagens `.jpg`, `.png` e `.webp`
* 📚 Criação de omnibuses e coleções personalizadas
* 🏷️ Renomeação inteligente baseada em templates
* 💾 Persistência de configurações locais
* 🖥️ Aplicação desktop utilizando Node.js + Electron

---

## 🧱 Estrutura do Projeto Atual

```text
angular_comic_organizer/
│
├── angular.json
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.spec.json
├── public/
│   ├── favicon.ico
│   └── ...
├── src/
│   ├── main.ts
│   ├── styles.css
│   ├── app/
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── app.ts
│   │   ├── app.html
│   │   ├── app.css
│   │   ├── components/
│   │   │   ├── comic-preview/
│   │   │   ├── file-explorer/
│   │   │   ├── footer-bar/
│   │   │   ├── menu-bar/
│   │   │   └── rename-settings/
│   │   ├── pages/
│   │   │   └── home/
│   │   └── services/
│   │       ├── conversion-state.ts
│   │       └── file-manager.ts
└── README.md
```

---

## 🧠 Arquitetura Geral

### Frontend Angular 21

Este projeto utiliza uma arquitetura Angular moderna baseada em:

* Componentes `standalone`
* `bootstrapApplication()`
* `provideRouter()`
* Signals (`signal`)
* Angular CDK Drag & Drop
* Layout adaptativo com `angular-split`
* Ícones via `@lucide/angular`

### Componentes Principais

* `App` — componente raiz da aplicação
* `Home` — página principal com layout responsivo
* `FileExplorer` — gerenciamento de edições, páginas e seleção
* `ComicPreview` — preview visual das coleções
* `RenameSettings` — configurações de renomeação
* `MenuBar` — navegação principal
* `FooterBar` — informações e ações complementares

### Serviços Atuais

* `FileManagerService` — gerenciamento de estado das edições e páginas
* `ConversionStateService` — controle de processos de conversão e renomeação

### Camada Desktop Prevista

* `Electron Main Process` — acesso ao sistema de arquivos, leitura de pastas e execução das ações locais
* `Preload` — ponte segura entre Angular e Electron
* `IPC` — comunicação entre a interface e a camada desktop

> Atualmente os dados são simulados para desenvolvimento da interface. A lógica real de manipulação de arquivos será implementada na camada desktop do Electron, usando Node.js.

---

## ⚙️ Tecnologias Utilizadas

* Angular 21
* TypeScript 5.9
* Angular Router
* Angular CDK Drag & Drop
* Angular Signals
* Angular Split
* `@lucide/angular`
* Vitest
* Prettier

### Tecnologias Planejadas

* Node.js
* Electron
* SQLite
* Bibliotecas de ZIP/CBZ e manipulação de imagens
* Acesso local ao sistema de arquivos via `fs`, `path` e IPC

---

## 📦 Instalação

Clone o repositório e instale as dependências:

```bash
git clone <seu-repositorio>
cd angular_comic_organizer
npm install
```

---

## ▶️ Como Executar

Durante o desenvolvimento:

```bash
npm start
```

Acesse:

```text
http://localhost:4200
```

---

## 📂 Fluxo de Uso Atual

1. Abra o aplicativo no navegador
2. Navegue pelas edições disponíveis
3. Selecione páginas ou edições
4. Utilize as ações disponíveis para manipulação dos itens
5. Visualize as alterações em tempo real
6. O layout adapta-se automaticamente para diferentes tamanhos de tela

---

## 📁 Como os Arquivos Entram no App

No Electron, o equivalente ao "upload" não é enviar arquivos para um servidor. O fluxo correto é trabalhar com arquivos locais do usuário:

1. O usuário escolhe uma pasta ou arquivos pelo dialog nativo do sistema.
2. O Angular exibe a interface e envia o pedido para a camada desktop.
3. O processo principal do Electron usa Node.js para ler o disco e montar a lista de `.cbz`, `.cbr` ou imagens.
4. A interface recebe os metadados já organizados e atualiza o preview.

Isso significa que você pode trabalhar com uma pasta local de quadrinhos baixados no seu computador sem depender de site externo. Durante a fase atual, sem Electron, o projeto continua usando dados mockados para simular esse fluxo na UI.

---

## 📦 Sobre os Formatos Suportados

### CBZ

Formato principal do projeto.

Um arquivo `.cbz` consiste em um arquivo ZIP contendo imagens organizadas em sequência.

Exemplo:

```text
Batman (2016) #01.cbz
```

---

### CBR Compatível

O projeto prevê suporte à geração de arquivos `.cbr` compatíveis.

Nesse modo, o conteúdo é compactado utilizando ZIP e salvo com extensão `.cbr`.

Exemplo:

```text
Batman (2016) #01.cbr
```

Internamente:

```text
ZIP + extensão .cbr
```

Essa abordagem permite ampla compatibilidade com leitores de quadrinhos sem depender de bibliotecas proprietárias de compressão RAR.

> O formato CBR Compatível não é um arquivo RAR real. Trata-se de um arquivo ZIP salvo com extensão `.cbr`.

---

## 🔧 Roadmap para Node.js + Electron

O objetivo é evoluir o Comic Organizer para uma aplicação desktop independente.

Para o plano detalhado de implementação, veja `docs/node-electron-roadmap.md`.

### Fase 1 — Aplicação Desktop

* Configurar ambiente Electron
* Integrar Angular ao Electron
* Gerar executáveis desktop
* Eliminar dependência de `ng serve` para uso final

### Fase 2 — Backend de Organização e Compactação

* Implementar leitura de diretórios locais
* Desenvolver parser de coleções
* Criar sistema de renomeação inteligente
* Gerar arquivos `.cbz`
* Gerar arquivos `.cbr` compatíveis
* Importar arquivos `.cbz`
* Importar arquivos `.cbr`

### Fase 3 — Persistência e Biblioteca

* Salvar configurações locais
* Histórico de operações
* Catálogo de coleções
* Banco de dados local com SQLite

### Fase 4 — Recursos Avançados

* Suporte a `.jpg`
* Suporte a `.png`
* Suporte a `.webp`
* Criação de omnibuses
* Validação de arquivos corrompidos
* Otimização de compactação
* Processamento em lote

### Fase 5 — Distribuição

* Empacotamento para Windows
* Suporte experimental para Linux
* Suporte experimental para macOS
* Documentação de instalação
* Releases versionadas

---

## 🎯 Visão de Longo Prazo

O Comic Organizer pretende se tornar uma ferramenta desktop especializada em organização de quadrinhos digitais, permitindo:

* Organização de bibliotecas pessoais
* Renomeação inteligente em massa
* Compactação e exportação
* Criação de coleções completas
* Gerenciamento de páginas e edições
* Fluxo de trabalho independente de serviços online

---

## 📝 Notas de Desenvolvimento

* A interface atual é UI-first
* Não existe camada desktop/backend ativa neste repositório
* O componente `Home` utiliza detecção de tamanho de tela para responsividade
* Os serviços atuais utilizam dados simulados
* A futura camada Electron/Node será responsável pela manipulação real de arquivos
* A UI deve permanecer desacoplada da implementação de backend

---

## 🧩 Observações

* Este projeto é desenvolvido inicialmente para uso pessoal
* O foco atual é estabilizar a experiência de usuário e a arquitetura da interface
* O backend Node/Electron será implementado progressivamente conforme a evolução do projeto
* O formato principal de trabalho será CBZ, mantendo suporte a CBR Compatível para interoperabilidade

---

## 👨‍💻 Autor

Desenvolvido por **José Elias**

---

## 📄 Licença

Licenciado sob a licença MIT.

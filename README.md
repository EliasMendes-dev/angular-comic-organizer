# Comic Organizer

Aplicativo desktop para organizar, visualizar, renomear e converter arquivos de quadrinhos nos formatos CBZ e CBR.

O projeto usa Angular no frontend e Tauri/Rust para executar as operações de arquivos localmente no computador.

## Funcionalidades

- Importação de múltiplos arquivos CBR ou CBZ.
- Seleção de edições e páginas.
- Ordenação natural de edições e páginas.
- Visualização de páginas antes da exportação.
- Renomeação em lote de arquivos e páginas.
- Conversão CBR para CBZ e CBZ para CBR.
- Barra de progresso durante renomeação e conversão.
- Mensagens de sucesso e erro sem janelas modais do sistema.
- Tema claro/escuro e layout responsivo.
- Processamento local, sem envio de arquivos para serviços externos.

## Renomear e Converter

O formato escolhido no botão `+` define o tipo dos arquivos de entrada:

| Opção | Entrada | Renomear | Converter |
| --- | --- | --- | --- |
| CBR para CBZ | CBR | Mantém CBR | Gera CBZ |
| CBZ para CBR | CBZ | Mantém CBZ | Gera CBR |

As duas operações também renomeiam o arquivo e as páginas internas usando o título, ano e número inicial informados.

Os arquivos gerados são salvos em uma subpasta de `Downloads`, usando o nome da série.

## Requisitos

Para executar o frontend e o backend durante o desenvolvimento:

- Node.js e npm.
- Rust com o toolchain `stable-x86_64-pc-windows-msvc`.
- Microsoft Visual C++ Build Tools no Windows.
- WebView2 no Windows.
- Tauri CLI, instalado como dependência do projeto.

Para criar arquivos CBR, também é necessário ter o WinRAR instalado. O aplicativo procura `Rar.exe` nestes locais:

- Variáveis `COMIC_ORGANIZER_RAR` ou `RAR_EXE`.
- Diretórios presentes no `PATH`.
- `ProgramW6432`, `ProgramFiles` e `ProgramFiles(x86)`.
- Instalações por usuário em `AppData\Local\Programs\WinRAR`.

O `UnRAR.exe` usado para abrir CBR é incluído nos recursos do aplicativo. Ele é diferente do `Rar.exe`: o UnRAR extrai arquivos, enquanto o Rar cria arquivos CBR.

## Instalação

```bash
git clone https://github.com/EliasMendes-dev/angular-comic-organizer.git
cd angular-comic-organizer
npm install
```

## Desenvolvimento

Para executar apenas o frontend no navegador:

```bash
npm start
```

Para executar a aplicação desktop com Tauri:

```bash
npx tauri dev
```

O comando `npx tauri dev` inicia o Angular pelo `beforeDevCommand` configurado em `src-tauri/tauri.conf.json`.

## Testes e validação

Testes do frontend:

```bash
npm test
```

Testes do backend:

```bash
cd src-tauri
cargo test
```

Validação de tipos do Angular:

```bash
npx tsc -p tsconfig.app.json --noEmit
```

## Build do aplicativo

O build do Tauri executa automaticamente o build de produção do Angular por meio de `beforeBuildCommand`.

```bash
npx tauri build
```

Os instaladores e bundles são gerados em:

```text
src-tauri/target/release/bundle/
```

No Windows, os instaladores normalmente ficam nas pastas `nsis` e `msi`.

Antes de distribuir o aplicativo, teste o instalador em uma máquina limpa. Verifique especialmente:

- A abertura de CBR sem o WinRAR instalado.
- A conversão de CBZ para CBR com o WinRAR instalado.
- A mensagem exibida quando o `Rar.exe` não é encontrado.
- A presença do `UnRAR.exe` no bundle instalado.
- Arquivos com espaços, acentos e caracteres como `#` no nome.

## Formatos suportados

### CBZ

CBZ é um arquivo ZIP contendo imagens de páginas. A leitura e a criação são feitas diretamente pelo backend Rust, sem dependência externa.

### CBR

CBR é um arquivo RAR. A leitura usa `UnRAR.exe`; a criação usa `Rar.exe`, fornecido pelo WinRAR instalado no computador do usuário.

### Imagens

As páginas reconhecidas atualmente são:

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`

## Estrutura do projeto

```text
src/
  app/
    components/       Componentes da interface Angular
    pages/             Páginas da aplicação
    services/          Estado e comunicação com o Tauri
  styles.css           Tokens e estilos globais

src-tauri/
  src/                 Backend Rust e comandos Tauri
  resources/           Recursos incluídos no bundle, como UnRAR.exe
  tauri.conf.json      Configuração do aplicativo e empacotamento
  Cargo.toml           Dependências Rust
```

## Arquitetura resumida

- Angular gerencia a interface, o estado e as prévias.
- Tauri faz a ponte entre a interface e os comandos Rust.
- Rust realiza extração, compactação, renomeação e limpeza de arquivos temporários.
- CBZ usa a biblioteca ZIP integrada.
- CBR usa `UnRAR.exe` para leitura e `Rar.exe` para criação.

## Limitações atuais

- A criação de CBR depende do WinRAR instalado no computador.
- O processamento é local e não possui sincronização em nuvem.
- Apenas JPG, JPEG, PNG e WebP são tratados como páginas.
- O build para outras plataformas ainda não foi validado.

## Contribuição

Contribuições são bem-vindas, especialmente para:

- Melhorias de interface e acessibilidade.
- Suporte a novos formatos de imagem.
- Melhorias de desempenho.
- Testes de empacotamento em diferentes versões do Windows.
- Suporte a Linux e macOS.

## Licença

Required Notice: Copyright (C) 2026 José Elias Hermínio Mendes - Projeto Comic Organizer

Este software é licenciado sob a PolyForm Noncommercial License 1.0.0.
O uso, modificação e distribuição são permitidos apenas para fins NÃO COMERCIAIS.
Para ler a licença completa, veja o arquivo [LICENSE.txt](LICENSE.txt) no diretório raiz.

A licença do `UnRAR.exe` incluído continua disponível em [src-tauri/license.txt](src-tauri/license.txt).

O WinRAR e o `Rar.exe` não são distribuídos pelo projeto. Consulte os termos de licença do WinRAR antes de redistribuí-los.

## Autor

Desenvolvido por [Elias Mendes](https://github.com/EliasMendes-dev).

# 📘 Node.js + Electron Roadmap - Comic Organizer Desktop Application

## 📋 Índice
1. [Análise Inicial do Projeto](#análise-inicial-do-projeto)
2. [Parte 1: Node.js (Backend)](#parte-1-nodejs-backend)
3. [Parte 2: Electron (Desktop App)](#parte-2-electron-desktop-app)
4. [Estrutura Recomendada](#estrutura-recomendada)
5. [Plano de Implementação](#plano-de-implementação)
6. [Resultado Esperado](#resultado-esperado)
7. [Guia de Instalação com Prompts](#guia-de-instalação-com-prompts)

---

## 📊 Análise Inicial do Projeto

### Estado Atual

**Stack Frontend:**
- Angular 21 (Standalone Components)
- TypeScript 5.9
- Angular Router (Rotas)
- Angular CDK (Drag & Drop)
- Angular Signals (Reatividade)
- Lucide Angular (Ícones)
- Angular Split (Layout Split)

**Arquitetura Atual:**
```
Frontend (Angular 21)
    ├── Componentes Standalone
    ├── Serviços Injetáveis (Singleton)
    ├── Modelos/Interfaces
    ├── Páginas (Home)
    └── Layout Responsivo
```

**Componentes Principais:**
- `App` - Raiz da aplicação
- `Home` - Página principal com layout responsivo
- `FileExplorer` - Gerenciamento de edições
- `ComicPreview` - Preview visual
- `RenameSettings` - Configurações de renomeação
- `MenuBar` - Navegação
- `FooterBar` - Ações

**Serviços (Dados Simulados):**
- `FileManagerService` - Gerencia edições e páginas (dados mock)
- `ConversionStateService` - Controla estado de conversão
- `Conversion` - Será implementado

**Modelos:**
```typescript
ComicEdition {
  id: number
  title: string
  pages: string[]
  selected?: boolean
  expanded?: boolean
  originalFile?: File
  converted?: boolean
  outputPath?: string
}

ConversionType = 'cbr-to-cbz' | 'cbz-to-cbr'
```

**Funcionalidades Planejadas (Backend):**
- ✅ Leitura de diretórios locais
- ✅ Parsing de arquivos CBZ/CBR
- ✅ Renomeação inteligente
- ✅ Geração de arquivos CBZ/CBR
- ✅ Importação de arquivos
- ✅ Compactação
- ✅ Persistência local

---

## Parte 1: Node.js (Backend)

### 1. Node.js - Runtime JavaScript

**O que é:**
Node.js é um runtime que permite executar JavaScript/TypeScript fora do navegador, no servidor/desktop.

**Por que será necessário no Comic Organizer:**
- Executar lógica backend em TypeScript
- Acessar o sistema de arquivos
- Processar arquivos CBZ/CBR
- Gerenciar dependências via npm

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 1º

**Conceitos a Dominar:**
- Instalação e versão do Node.js
- npm (Node Package Manager)
- Arquivos `package.json` e `package-lock.json`
- CommonJS vs ES Modules
- Variáveis de ambiente
- Paths absolutos vs relativos

---

### 2. NPM - Package Manager

**O que é:**
npm é o gerenciador de pacotes padrão do Node.js, similar a pip (Python) ou cargo (Rust).

**Por que será necessário:**
- Gerenciar dependências do projeto
- Executar scripts de build
- Instalar ferramentas de desenvolvimento
- Publicar pacotes

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 2º

**Conceitos Essenciais:**

| Conceito | Descrição | Comando |
|----------|-----------|---------|
| `package.json` | Arquivo de configuração do projeto | `npm init` |
| `package-lock.json` | Lock file para versionamento | Automático |
| Dependências | Pacotes necessários para produção | `npm install --save` |
| DevDependencies | Pacotes para desenvolvimento | `npm install --save-dev` |
| Scripts | Comandos customizados | `npm run script-name` |
| Global | Instalação global no sistema | `npm install -g` |

**Exemplo de package.json:**

```json
{
  "name": "comic-organizer-backend",
  "version": "1.0.0",
  "description": "Backend desktop para organização de comics",
  "main": "dist/main.js",
  "type": "module",
  "scripts": {
    "start": "node dist/main.js",
    "dev": "ts-node-dev src/main.ts",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/",
    "convert": "ts-node src/commands/convert.ts"
  },
  "dependencies": {
    "archiver": "^6.0.0",
    "extract-zip": "^2.0.1",
    "sharp": "^0.33.0",
    "express": "^4.18.2",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.0",
    "ts-node-dev": "^2.0.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.10"
  }
}
```

---

### 3. TypeScript - Type Safety

**O que é:**
TypeScript adiciona tipagem estática ao JavaScript, compilando para JavaScript padrão.

**Por que será necessário:**
- Capturar erros em tempo de compilação
- Melhor autocompletar no editor
- Documentação automática via tipos
- Refatoração mais segura

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 3º

**Conceitos a Dominar:**
- Tipos primitivos (string, number, boolean)
- Interfaces e Types
- Tipos genéricos
- Enums
- Decoradores
- Modelos de módulos

**Exemplo de tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

---

### 4. Interfaces e Types - Estruturas de Dados

**O que é:**
Interfaces e Types definem estruturas de dados com tipos específicos.

**Por que será necessário:**
- Representar entidades do domínio (ComicEdition, ComicPage)
- Tipar dados de forma segura
- Facilitar serialização/desserialização
- Documentar estrutura de dados

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 3º

**Modelos para Comic Organizer:**

```typescript
// src/domain/types.ts

export interface ComicPage {
  id: string;
  pageNumber: number;
  filename: string;
  fileSize: number;
  width: number;
  height: number;
  format: ImageFormat;
}

export interface ComicEdition {
  id: string;
  title: string;
  pages: ComicPage[];
  format: ComicFormat;
  sourcePath: string;
  outputPath?: string;
  createdAt: string;
  modifiedAt: string;
  metadata?: Record<string, any>;
}

export type ComicFormat = 'CBZ' | 'CBR';
export type ImageFormat = 'JPEG' | 'PNG' | 'WEBP';
export type ConversionType = 'CBRToCBZ' | 'CBZToCBR' | 'ImportJPG' | 'ImportPNG';

export enum ProcessingStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

export interface ConversionStats {
  totalFiles: number;
  successful: number;
  failed: number;
  totalSizeBytes: number;
  processingTimeMs: number;
}

export interface ConversionResult {
  success: boolean;
  message: string;
  outputPath?: string;
  stats?: ConversionStats;
  error?: Error;
}

// DTOs para comunicação
export interface ConvertRequest {
  inputPath: string;
  outputFormat: ComicFormat;
  outputPath: string;
}

export interface ConvertResponse {
  success: boolean;
  message: string;
  outputPath?: string;
  stats?: ConversionStats;
}
```

---

### 5. Async/Await - Programação Assíncrona

**O que é:**
Mecanismo para executar código não-bloqueante usando Promises.

**Por que será necessário:**
- Operações de I/O são assíncronas por padrão
- Não travar interface enquanto processa
- Melhor performance geral
- Padrão padrão em Node.js

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 4º

**Padrões Async/Await:**

```typescript
// Função assíncrona básica
async function loadComicAsync(path: string): Promise<ComicEdition> {
  try {
    const content = await fs.promises.readFile(path);
    // Processar
    return comic;
  } catch (error) {
    throw new Error(`Falha ao carregar: ${error.message}`);
  }
}

// Aguardar múltiplas operações em paralelo
async function convertAllAsync(files: string[]): Promise<ConversionStats[]> {
  const promises = files.map(file => convertFile(file));
  const results = await Promise.all(promises);
  return results;
}

// Sequencialmente (se uma depender da outra)
async function convertSequentially(files: string[]): Promise<void> {
  for (const file of files) {
    const result = await convertFile(file);
    console.log(`✓ ${file}: ${result.success}`);
  }
}

// Com tratamento de erro
async function safeConvert(inputPath: string): Promise<ConvertResponse> {
  try {
    const result = await convertComic(inputPath, 'CBZ');
    return {
      success: true,
      message: 'Conversão concluída',
      outputPath: result.path,
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro: ${error.message}`,
    };
  }
}
```

---

### 6. Promises - Tratamento de Operações Assíncronas

**O que é:**
Promises representam um valor que pode estar disponível agora, ou no futuro, ou nunca.

**Por que será necessário:**
- Encadear operações assíncronas
- Tratamento de erros com .catch()
- Combinar múltiplas operações

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 4º

**Padrões de Promise:**

```typescript
// Promise básico
new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Feito!');
  }, 1000);
});

// .then() e .catch()
convertFile('file.cbz')
  .then(result => console.log('✓', result))
  .catch(error => console.error('✗', error));

// Promise.all() - aguardar todos
Promise.all([
  convertFile('file1.cbz'),
  convertFile('file2.cbz'),
  convertFile('file3.cbz'),
])
  .then(results => console.log('Todos concluídos:', results))
  .catch(error => console.error('Um ou mais falharam:', error));

// Promise.race() - primeiro a terminar
Promise.race([
  convertFile('file.cbz'),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 30000)
  ),
])
  .then(result => console.log('Concluído:', result))
  .catch(error => console.error('Erro ou timeout:', error));

// Promise.allSettled() - resultado de todos, com ou sem erro
const results = await Promise.allSettled([
  convertFile('file1.cbz'),
  convertFile('file2.cbz'),
]);

results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    console.log(`✓ Arquivo ${index + 1}: ${result.value}`);
  } else {
    console.log(`✗ Arquivo ${index + 1}: ${result.reason}`);
  }
});
```

---

### 7. File System - Manipulação de Arquivos

**O que é:**
API para leitura, escrita e gerenciamento de arquivos no sistema operacional.

**Por que será necessário:**
- Leitura de arquivos CBZ/CBR
- Criação de arquivos de saída
- Gerenciamento de diretórios
- Metadados de arquivo

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 5º

**Operações de File System:**

```typescript
import * as fs from 'fs';
import * as path from 'path';

// Ler arquivo completo (buffer)
async function readFileAsBuffer(filePath: string): Promise<Buffer> {
  return fs.promises.readFile(filePath);
}

// Ler arquivo como texto
async function readFileAsText(filePath: string): Promise<string> {
  return fs.promises.readFile(filePath, 'utf-8');
}

// Escrever arquivo
async function writeFile(filePath: string, content: Buffer | string): Promise<void> {
  return fs.promises.writeFile(filePath, content);
}

// Adicionar conteúdo ao final do arquivo
async function appendToFile(filePath: string, content: string): Promise<void> {
  return fs.promises.appendFile(filePath, content);
}

// Verificar se arquivo existe
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Obter informações do arquivo
async function getFileStats(filePath: string): Promise<fs.Stats> {
  return fs.promises.stat(filePath);
}

// Copiar arquivo
async function copyFile(source: string, destination: string): Promise<void> {
  return fs.promises.copyFile(source, destination);
}

// Deletar arquivo
async function deleteFile(filePath: string): Promise<void> {
  return fs.promises.unlink(filePath);
}

// Renomear arquivo
async function renameFile(oldPath: string, newPath: string): Promise<void> {
  return fs.promises.rename(oldPath, newPath);
}

// Ler arquivo em chunks (para arquivos grandes)
async function readFileChunked(filePath: string, chunkSize: number = 64 * 1024): Promise<void> {
  const stream = fs.createReadStream(filePath, { highWaterMark: chunkSize });
  
  for await (const chunk of stream) {
    // Processar chunk
    process(chunk);
  }
}
```

---

### 8. Path Manipulation - Navegação de Caminhos

**O que é:**
API para trabalhar com paths de forma cross-platform (Windows, Linux, macOS).

**Por que será necessário:**
- Criar paths cross-platform
- Normalizar paths
- Obter diretório de um arquivo
- Resolver paths relativos

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 5º

**Operações com Paths:**

```typescript
import * as path from 'path';

// Juntar componentes de path
const fullPath = path.join(__dirname, '..', 'files', 'comic.cbz');
// Resultado: /app/files/comic.cbz (em Linux)
// Resultado: C:\app\files\comic.cbz (em Windows)

// Obter diretório de um arquivo
const dir = path.dirname('/path/to/file.cbz');
// Resultado: /path/to

// Obter nome do arquivo
const filename = path.basename('/path/to/file.cbz');
// Resultado: file.cbz

// Obter extensão
const ext = path.extname('/path/to/file.cbz');
// Resultado: .cbz

// Separar caminho em componentes
const parsed = path.parse('/path/to/file.cbz');
// Resultado: { root: '/', dir: '/path/to', base: 'file.cbz', ... }

// Resolver caminho relativo para absoluto
const absolute = path.resolve('files', 'comic.cbz');
// Resultado: /current/working/directory/files/comic.cbz

// Normalizar path (remover .. e .)
const normalized = path.normalize('/path//to/./file.cbz');
// Resultado: /path/to/file.cbz
```

---

### 9. Manipulação de Diretórios

**O que é:**
APIs para navegar, listar e gerenciar diretórios.

**Por que será necessário:**
- Escaneamento de pastas com CBZ/CBR
- Criação de estrutura de saída
- Navegação em hierarquias de pastas

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 5º

**Operações com Diretórios:**

```typescript
import * as fs from 'fs';
import * as path from 'path';

// Listar arquivos em diretório
async function listFiles(dirPath: string): Promise<string[]> {
  const entries = await fs.promises.readdir(dirPath);
  const files: string[] = [];
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = await fs.promises.stat(fullPath);
    if (stat.isFile()) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Listar diretórios
async function listDirectories(dirPath: string): Promise<string[]> {
  const entries = await fs.promises.readdir(dirPath);
  const dirs: string[] = [];
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = await fs.promises.stat(fullPath);
    if (stat.isDirectory()) {
      dirs.push(fullPath);
    }
  }
  
  return dirs;
}

// Caminhada recursiva
async function findFiles(dirPath: string, pattern?: RegExp): Promise<string[]> {
  let files: string[] = [];
  const entries = await fs.promises.readdir(dirPath);
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = await fs.promises.stat(fullPath);
    
    if (stat.isDirectory()) {
      // Recursivo
      const subFiles = await findFiles(fullPath, pattern);
      files = files.concat(subFiles);
    } else if (!pattern || pattern.test(entry)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Encontrar arquivos CBZ/CBR
async function findComicFiles(dirPath: string): Promise<string[]> {
  return findFiles(dirPath, /\.(cbz|cbr)$/i);
}

// Criar diretório (recursivo)
async function createDirectory(dirPath: string): Promise<void> {
  return fs.promises.mkdir(dirPath, { recursive: true });
}

// Deletar diretório (recursivo)
async function deleteDirectory(dirPath: string): Promise<void> {
  const entries = await fs.promises.readdir(dirPath);
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = await fs.promises.stat(fullPath);
    
    if (stat.isDirectory()) {
      await deleteDirectory(fullPath);
    } else {
      await fs.promises.unlink(fullPath);
    }
  }
  
  return fs.promises.rmdir(dirPath);
}

// Ou mais simples (Node 14+):
async function deleteDirectorySimple(dirPath: string): Promise<void> {
  return fs.promises.rm(dirPath, { recursive: true, force: true });
}

// Verificar se caminho é diretório
async function isDirectory(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}
```

---

### 10. Streams - Processamento de Grandes Arquivos

**O que é:**
Streams permitem processar dados em chunks, sem carregar tudo em memória.

**Por que será necessário:**
- Arquivos CBZ/CBR podem ser grandes (>500MB)
- Copiar arquivos sem consumir toda RAM
- Processar dados em tempo real

**Nível de Importância:** **RECOMENDADO**

**Ordem de Aprendizado:** 10º

**Padrões de Stream:**

```typescript
import * as fs from 'fs';
import * as path from 'path';

// Ler arquivo em streams
async function readFileStream(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    
    stream.on('data', (chunk) => {
      // Processar chunk
      console.log(`Lido: ${chunk.length} bytes`);
    });
    
    stream.on('end', () => {
      console.log('Leitura completa');
      resolve();
    });
    
    stream.on('error', (error) => {
      reject(error);
    });
  });
}

// Copiar arquivo com progresso
async function copyFileWithProgress(
  source: string,
  destination: string,
  onProgress?: (bytes: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(source);
    const writeStream = fs.createWriteStream(destination);
    let totalBytes = 0;
    
    readStream.on('data', (chunk) => {
      totalBytes += chunk.length;
      onProgress?.(totalBytes);
    });
    
    readStream.on('error', reject);
    writeStream.on('error', reject);
    writeStream.on('finish', resolve);
    
    readStream.pipe(writeStream);
  });
}

// Usar for...await para iterar sobre stream
async function readFileWithAsync(filePath: string): Promise<void> {
  const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
  
  for await (const chunk of stream) {
    console.log(`Processando: ${chunk.length} bytes`);
  }
}
```

---

### 11. Archiver - Compressão e Criação de ZIP

**O que é:**
Biblioteca para criar arquivos ZIP/RAR programaticamente.

**Por que será necessário:**
- Criar arquivos CBZ (que são ZIPs com imagens)
- Empacotar conversões
- Compactação de saída

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 6º

**Uso de Archiver:**

```typescript
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';

// Criar arquivo ZIP
async function createZipFile(
  sourceDir: string,
  outputPath: string,
  onProgress?: (bytes: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 6 },
    });
    
    output.on('close', () => {
      console.log(`✓ Arquivo criado: ${archive.pointer()} bytes`);
      resolve();
    });
    
    archive.on('error', reject);
    archive.on('data', (data) => {
      onProgress?.(archive.pointer());
    });
    
    archive.pipe(output);
    
    // Adicionar diretório completo
    archive.directory(sourceDir, false);
    
    archive.finalize();
  });
}

// Criar CBZ (ZIP com imagens)
async function createCBZFile(
  imagesDir: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => resolve());
    archive.on('error', reject);
    archive.pipe(output);
    
    // Adicionar apenas imagens, ordenadas
    const files = fs.readdirSync(imagesDir)
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort();
    
    files.forEach((file, index) => {
      const filePath = path.join(imagesDir, file);
      archive.file(filePath, { name: `${String(index + 1).padStart(4, '0')}.jpg` });
    });
    
    archive.finalize();
  });
}

// Adicionar arquivos específicos
async function createCustomZip(
  files: string[],
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip');
    
    output.on('close', () => resolve());
    archive.on('error', reject);
    archive.pipe(output);
    
    files.forEach((filePath) => {
      archive.file(filePath, { name: path.basename(filePath) });
    });
    
    archive.finalize();
  });
}
```

---

### 12. Extract-Zip - Descompactação

**O que é:**
Biblioteca para extrair arquivos ZIP de forma assíncrona e segura.

**Por que será necessário:**
- Extrair conteúdo de arquivos CBZ/CBR (que são ZIPs)
- Processamento de conversões
- Leitura de estrutura interna

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 6º

**Uso de Extract-Zip:**

```typescript
import * as extractZip from 'extract-zip';
import * as fs from 'fs';
import * as path from 'path';

// Extrair arquivo ZIP
async function extractZipFile(
  zipPath: string,
  outputDir: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  try {
    await extractZip(zipPath, { dir: outputDir });
    console.log('✓ Extração completa');
  } catch (error) {
    console.error('✗ Erro na extração:', error);
    throw error;
  }
}

// Extrair e processar CBZ
async function extractAndProcessCBZ(
  cbzPath: string,
  tempDir: string
): Promise<string[]> {
  await extractZipFile(cbzPath, tempDir);
  
  // Listar e ordenar imagens
  const files = fs.readdirSync(tempDir)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  
  return files.map(f => path.join(tempDir, f));
}

// Listar conteúdo do ZIP
async function listZipContents(zipPath: string): Promise<string[]> {
  // Usando biblioteca adicional ou parseando com archiver
  // Para simples listagem, considere usar uma biblioteca como 'yauzl' ou 'unzipper'
  const files: string[] = [];
  // Implementação específica depende da biblioteca
  return files;
}
```

---

### 13. Sharp - Processamento de Imagens

**O que é:**
Biblioteca de alto desempenho para processamento de imagens (redimensionar, converter, optimizar).

**Por que será necessário:**
- Validar imagens em arquivos CBZ
- Criar thumbnails/previews
- Converter formatos de imagem
- Otimizar para compactação

**Nível de Importância:** **RECOMENDADO**

**Ordem de Aprendizado:** 11º

**Uso de Sharp:**

```typescript
import * as sharp from 'sharp';

// Obter informações de imagem
async function getImageInfo(imagePath: string) {
  const metadata = await sharp(imagePath).metadata();
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    size: metadata.size,
  };
}

// Criar thumbnail
async function createThumbnail(
  inputPath: string,
  outputPath: string,
  size: number = 200
): Promise<void> {
  await sharp(inputPath)
    .resize(size, size, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
}

// Converter para JPEG (para padronização)
async function convertToJpeg(
  inputPath: string,
  outputPath: string,
  quality: number = 85
): Promise<void> {
  await sharp(inputPath)
    .jpeg({ quality })
    .toFile(outputPath);
}

// Validar se arquivo é imagem válida
async function isValidImage(filePath: string): Promise<boolean> {
  try {
    const metadata = await sharp(filePath).metadata();
    return metadata.width !== undefined && metadata.height !== undefined;
  } catch {
    return false;
  }
}

// Obter dimensões
async function getImageDimensions(imagePath: string): Promise<{ width: number; height: number }> {
  const metadata = await sharp(imagePath).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}
```

---

### 14. Error Handling - Tratamento de Erros

**O que é:**
Técnicas para capturar, tratar e recuperar-se de erros.

**Por que será necessário:**
- Aplicação profissional requer tratamento de erros robusto
- Evitar crashes inesperados
- Fornecer mensagens úteis ao usuário
- Logging para debug

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 7º

**Padrões de Error Handling:**

```typescript
// Erro customizado
export class ComicOrganizerError extends Error {
  constructor(
    public code: string,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ComicOrganizerError';
  }
}

// Try-catch básico
try {
  const data = JSON.parse(jsonString);
  processData(data);
} catch (error) {
  console.error('Erro ao processar JSON:', error);
  // Recuperar ou lançar novamente
}

// Try-catch com async/await
async function convertSafely(inputPath: string): Promise<ConvertResponse> {
  try {
    const result = await convertComic(inputPath, 'CBZ');
    return {
      success: true,
      message: 'Conversão concluída',
      outputPath: result.path,
    };
  } catch (error) {
    if (error instanceof ComicOrganizerError) {
      return {
        success: false,
        message: error.message,
      };
    }
    
    throw new ComicOrganizerError(
      'UNKNOWN_ERROR',
      'Erro desconhecido',
      error as Error
    );
  }
}

// Validação de entrada
function validateConvertRequest(request: any): ConvertRequest {
  if (!request.inputPath || typeof request.inputPath !== 'string') {
    throw new ComicOrganizerError('INVALID_INPUT_PATH', 'Caminho de entrada inválido');
  }
  
  if (!['CBZ', 'CBR'].includes(request.outputFormat)) {
    throw new ComicOrganizerError('INVALID_FORMAT', 'Formato de saída inválido');
  }
  
  return request as ConvertRequest;
}

// Finally para limpeza
async function convertWithCleanup(inputPath: string, tempDir: string): Promise<void> {
  try {
    const extracted = await extractZipFile(inputPath, tempDir);
    await processPages(extracted);
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    // Sempre executado, com ou sem erro
    await deleteDirectory(tempDir);
  }
}
```

---

### 15. Logging - Rastreamento de Eventos

**O que é:**
Sistema para registrar eventos da aplicação (debug, info, warning, error).

**Por que será necessário:**
- Debug durante desenvolvimento
- Diagnosticar problemas em produção
- Auditoria de operações
- Performance monitoring

**Nível de Importância:** **RECOMENDADO**

**Ordem de Aprendizado:** 12º

**Bibliotecas de Logging:**

```typescript
import * as winston from 'winston';

// Configurar Winston
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Usar logging
logger.info('Iniciando conversão de ${path}');
logger.debug('Carregado: Batman #01 (24 páginas)');
logger.warn('Arquivo grande, pode demorar');
logger.error('Erro ao compactar arquivo', { error: err });

// Logging com contexto
const conversionLogger = logger.child({ context: 'conversion' });
conversionLogger.info('Conversão iniciada');
```

---

### 16. Testes - Garantir Qualidade

**O que é:**
Testes automatizados para validar que código funciona como esperado.

**Por que será necessário:**
- Evitar regressões
- Documentar comportamento esperado
- Confiança ao refatorar
- Requisito profissional

**Nível de Importância:** **RECOMENDADO**

**Ordem de Aprendizado:** 13º

**Exemplo com Jest:**

```typescript
import { convertComic, extractPages } from '../services/conversion';
import * as fs from 'fs';

describe('ComicConversion', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  test('deve converter CBR para CBZ', async () => {
    const result = await convertComic('test.cbr', 'CBZ');
    expect(result.success).toBe(true);
    expect(fs.existsSync(result.outputPath)).toBe(true);
  });

  test('deve extrair páginas corretamente', async () => {
    const pages = await extractPages('batman.cbz');
    expect(pages.length).toBeGreaterThan(0);
    expect(pages[0]).toMatch(/\.(jpg|png)$/i);
  });

  test('deve lançar erro para arquivo inválido', async () => {
    await expect(convertComic('invalid.txt', 'CBZ')).rejects.toThrow();
  });
});
```

---

### 17. Organização em Camadas - Arquitetura

**O que é:**
Padrão de organizar código em camadas horizontais, cada uma com responsabilidade específica.

**Por que será necessário:**
- Separar concerns (apresentação, lógica, persistência)
- Facilitar testes (mockar camadas)
- Escalabilidade
- Manutenção a longo prazo

**Nível de Importância:** **RECOMENDADO**

**Ordem de Aprendizado:** 14º

**Camadas em Comic Organizer:**

```
┌─────────────────────────────────────┐
│ Presentation Layer (IPC Handlers)   │
│ - Handlers de IPC                   │
│ - Validação de entrada              │
│ - Formatação de resposta             │
└─────────────────┬─────────────────────┘
                  │
┌─────────────────▼─────────────────────┐
│ Application Layer (Services)          │
│ - Use cases (Converter, Renomear)    │
│ - Orquestração de lógica             │
│ - Transações                         │
└─────────────────┬─────────────────────┘
                  │
┌─────────────────▼─────────────────────┐
│ Domain Layer (Business Logic)         │
│ - Interfaces e tipos                │
│ - Regras de negócio                 │
│ - Validações                        │
└─────────────────┬─────────────────────┘
                  │
┌─────────────────▼─────────────────────┐
│ Infrastructure Layer (I/O)            │
│ - File system operations             │
│ - ZIP/CBZ processing                 │
│ - Database/Persistence               │
│ - Configuration                      │
└─────────────────────────────────────┘
```

**Exemplo de Implementação:**

```typescript
// Domain
export interface IComicRepository {
  save(edition: ComicEdition): Promise<void>;
  load(id: string): Promise<ComicEdition>;
  findAll(): Promise<ComicEdition[]>;
}

// Infrastructure
export class FileSystemRepository implements IComicRepository {
  async save(edition: ComicEdition): Promise<void> {
    const path = path.join(this.basePath, `${edition.id}.json`);
    await fs.promises.writeFile(path, JSON.stringify(edition));
  }
  
  async load(id: string): Promise<ComicEdition> {
    const path = path.join(this.basePath, `${id}.json`);
    const content = await fs.promises.readFile(path, 'utf-8');
    return JSON.parse(content);
  }
}

// Application
export class ConversionService {
  constructor(private repository: IComicRepository) {}
  
  async convertAndSave(comic: ComicEdition): Promise<void> {
    const converted = await this.convertFormat(comic);
    await this.repository.save(converted);
  }
}

// Presentation
export async function handleConvertCommand(request: ConvertRequest): Promise<ConvertResponse> {
  try {
    const service = container.get(ConversionService);
    await service.convertAndSave(comic);
    
    return {
      success: true,
      message: 'Conversão concluída',
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}
```

---

## Parte 2: Electron (Desktop App)

### 1. O que é Electron

**O que é:**
Electron é um framework para construir aplicações desktop usando tecnologias web (HTML/CSS/JavaScript/TypeScript) com backend em Node.js.

**Por que será necessário:**
- Executar Angular + Node.js como desktop app
- Empacotar para Windows, macOS, Linux
- Acesso a APIs nativas do SO
- Persistência e instalador

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 15º

**Arquitetura Electron:**

```
┌──────────────────────────────────┐
│  Frontend Window (WebView)        │
│  - Angular 21                    │
│  - HTML/CSS/TypeScript           │
│  - Renderização UI               │
└──────────────┬───────────────────┘
               │ IPC (Inter-Process Communication)
               │
┌──────────────▼───────────────────┐
│  Main Process (Node.js)          │
│  - Window Management             │
│  - File System API               │
│  - Menu System                   │
│  - Application Lifecycle         │
└──────────────┬───────────────────┘
               │
┌──────────────▼───────────────────┐
│  Backend Services (Node.js)      │
│  - Business Logic                │
│ - File Processing               │
│ - Conversão de formato          │
│ - Persistence                   │
└──────────────────────────────────┘
```

**Vantagens:**
- ✅ Desenvolver com HTML/CSS/JavaScript
- ✅ Acesso direto a APIs nativas
- ✅ Single codebase para Windows/Mac/Linux
- ✅ Integração com npm packages
- ✅ DevTools integradas

**Desvantagens:**
- ❌ Arquivo executável grande (~150MB)
- ❌ Alto consumo de memória
- ❌ Performance inferior a aplicativos nativos

---

### 2. IPC - Inter-Process Communication

**O que é:**
Sistema de comunicação entre o processo principal (Electron/Node.js) e processo de renderização (HTML/Angular).

**Por que é necessário:**
- Frontend invoca operações do backend
- Backend envia resultados/eventos para frontend
- Segurança: IPC é mais seguro que expor Node APIs diretamente

**Padrão de IPC:**

```
┌─────────────────────────────────┐
│ Frontend (Angular)              │
│ ipcRenderer.invoke('cmd', ...)  │
│ → JSON serialization            │
└─────────────┬───────────────────┘
              │
              │ IPC Bridge
              │
┌─────────────▼───────────────────┐
│ Main Process (Node.js)          │
│ ipcMain.handle('cmd', ...)      │
│ → JSON deserialization          │
└─────────────┬───────────────────┘
              │
              │ Process Logic
              │ (Backend Services)
              │
┌─────────────▼───────────────────┐
│ Response via IPC                │
│ → JSON serialization            │
└─────────────────────────────────┘
```

**Implementação:**

```typescript
// Main Process (Electron)
import { app, BrowserWindow, ipcMain } from 'electron';

// Registrar handler
ipcMain.handle('convert-comic', async (event, request: ConvertRequest) => {
  try {
    const result = await conversionService.convert(request);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Frontend (Angular)
import { ipcRenderer } from 'electron';

@Injectable({ providedIn: 'root' })
export class ElectronService {
  async convertComic(request: ConvertRequest): Promise<ConvertResponse> {
    const response = await ipcRenderer.invoke('convert-comic', request);
    return response;
  }
}

// Usar em componente
export class ComicComponent {
  async handleConvert() {
    const result = await this.electronService.convertComic({
      inputPath: '/path/to/comic.cbz',
      outputFormat: 'CBR',
      outputPath: '/path/to/output.cbr',
    });
    
    if (result.success) {
      console.log('✓ Convertido:', result.outputPath);
    }
  }
}
```

---

### 3. Events - Comunicação Bidirecional

**O que é:**
Sistema de eventos para frontend e backend se comunicarem assincronamente.

**Por que é necessário:**
- Backend pode notificar frontend de progresso
- Frontend pode reagir a eventos do sistema
- Decoupling entre frontend e backend

**Padrão:**

```typescript
// Main Process - Emitir evento
import { BrowserWindow, ipcMain } from 'electron';

let mainWindow: BrowserWindow;

ipcMain.handle('convert-with-progress', async (event, request) => {
  for (let i = 0; i < 100; i++) {
    // Processar 1% do trabalho
    await processStep();
    
    // Emitir progresso
    mainWindow.webContents.send('conversion-progress', {
      current: i + 1,
      total: 100,
      percentage: ((i + 1) / 100) * 100,
    });
  }
  
  return { success: true };
});
```

```typescript
// Frontend - Escutar evento
import { ipcRenderer } from 'electron';

@Component({
  selector: 'app-conversion',
  template: `
    <progress [value]="progress" max="100"></progress>
    <p>{{ progress }}%</p>
  `,
})
export class ConversionComponent implements OnInit, OnDestroy {
  progress = 0;
  private unsubscribe: () => void;

  ngOnInit() {
    this.unsubscribe = ipcRenderer.on('conversion-progress', (event, data) => {
      this.progress = data.percentage;
    });
  }

  ngOnDestroy() {
    this.unsubscribe?.();
  }

  async startConversion() {
    await ipcRenderer.invoke('convert-with-progress', {
      inputPath: '/path/to/comic.cbz',
    });
  }
}
```

---

### 4. Preload Scripts - Segurança

**O que é:**
Scripts que rodam antes do processo de renderização, com acesso ao Node.js.

**Por que é necessário:**
- Expor APIs de IPC de forma segura
- Isolamento entre processos
- Proteger contra XSS

**Implementação:**

```typescript
// preload.ts
import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  // Expor métodos de IPC de forma controlada
  invoke: (channel: string, ...args: any[]) => {
    const validChannels = ['convert-comic', 'get-config', 'save-config'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
  },
  
  on: (channel: string, callback: Function) => {
    const validChannels = ['conversion-progress', 'config-updated'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, data) => callback(data));
    }
  },
};

// Expor API no contexto global
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Definir tipos para Angular
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
```

```typescript
// main.ts (Electron)
import { app, BrowserWindow } from 'electron';
import * as path from 'path';

function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.on('ready', createWindow);
```

---

### 5. Menu e System Integration

**O que é:**
Integração com menus nati vos do SO e componentes do sistema.

**Por que é necessário:**
- Menu File, Edit, Help (padrão)
- Shortcuts do teclado
- Tray icon (ícone na bandeja do Windows/Mac)
- Notificações

**Implementação:**

```typescript
import { app, Menu, MenuItem, BrowserWindow } from 'electron';

function createMenu(mainWindow: BrowserWindow) {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Sair',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
        {
          label: 'Abrir Arquivo',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('menu-open-file'),
        },
      ],
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'Ferramentas',
      submenu: [
        {
          label: 'Configurações',
          accelerator: 'CmdOrCtrl+,',
          click: () => mainWindow.webContents.send('menu-settings'),
        },
        {
          label: 'DevTools',
          accelerator: 'F12',
          click: () => mainWindow.webContents.toggleDevTools(),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.on('ready', () => {
  const mainWindow = new BrowserWindow({ /* ... */ });
  createMenu(mainWindow);
});
```

---

## Estrutura Recomendada

```
comic-organizer-electron/
├── src/
│   ├── main/
│   │   ├── main.ts                 # Electron main process
│   │   ├── preload.ts              # Preload script
│   │   ├── menu.ts                 # Menu configuration
│   │   └── services/               # Backend services
│   │       ├── conversion.service.ts
│   │       ├── file-manager.service.ts
│   │       └── rename.service.ts
│   │
│   ├── app/                        # Angular application
│   │   ├── app.component.ts
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── models/
│   │
│   └── shared/
│       ├── types/
│       │   └── comic.types.ts      # Interfaces compartilhadas
│       └── utils/
│
├── dist/
│   ├── main/                       # Main process compilado
│   └── app/                        # Angular compilado
│
├── package.json
├── tsconfig.json
├── tsconfig.main.json
├── tsconfig.app.json
└── electron-builder.json           # Configuração de build
```

---

## Guia de Instalação com Prompts

### 1. Script de Download Automático (Node.js)

```bash
#!/bin/bash
# install-dependencies.sh - Script com prompts interativos

#!/bin/bash

echo "=================================================="
echo "  Comic Organizer - Electron Setup"
echo "=================================================="
echo ""

# Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo ""
    read -p "Deseja instalar Node.js? (s/n): " install_node
    if [[ $install_node == "s" ]]; then
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install node
        elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
            echo "Por favor, baixe Node.js em https://nodejs.org"
            exit 1
        fi
    else
        echo "Node.js é obrigatório. Abortando."
        exit 1
    fi
else
    node_version=$(node -v)
    echo "✅ Node.js encontrado: $node_version"
fi

echo ""
echo "📚 Node.js versão mínima: v18.0.0"
node_major=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ $node_major -lt 18 ]; then
    echo "⚠️  Node.js versão antiga. Recomenda-se atualizar."
    read -p "Deseja continuar? (s/n): " continue_old_node
    if [[ $continue_old_node != "s" ]]; then
        exit 1
    fi
fi

echo ""
echo "📦 Instalando dependências do projeto..."
npm install

echo ""
echo "📦 Instalando dependências de desenvolvimento..."
npm install --save-dev

echo ""
read -p "Deseja compilar o projeto? (s/n): " compile_project
if [[ $compile_project == "s" ]]; then
    npm run build
fi

echo ""
read -p "Deseja iniciar a aplicação? (s/n): " start_app
if [[ $start_app == "s" ]]; then
    npm start
fi

echo ""
echo "✅ Setup completo!"
```

### 2. Script de Download com Menu (Node.js + Inquirer)

```typescript
// install.ts - Script interativo com Inquirer

import * as inquirer from 'inquirer';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function runSetup() {
  console.log('\n================================================');
  console.log('  Comic Organizer - Electron Setup');
  console.log('================================================\n');

  // Verificar Node.js
  try {
    const nodeVersion = execSync('node --version').toString().trim();
    console.log(`✅ Node.js encontrado: ${nodeVersion}\n`);
  } catch {
    console.error('❌ Node.js não encontrado. Instale em https://nodejs.org');
    process.exit(1);
  }

  // Menu principal
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'O que deseja fazer?',
      choices: [
        { name: '📦 Instalar dependências', value: 'install' },
        { name: '🔨 Build da aplicação', value: 'build' },
        { name: '▶️  Executar em desenvolvimento', value: 'dev' },
        { name: '📦 Criar installer', value: 'package' },
        { name: '🚀 Build para produção', value: 'release' },
      ],
    },
  ]);

  switch (action) {
    case 'install':
      await installDependencies();
      break;
    case 'build':
      await buildProject();
      break;
    case 'dev':
      await runDev();
      break;
    case 'package':
      await createPackage();
      break;
    case 'release':
      await buildRelease();
      break;
  }
}

async function installDependencies() {
  console.log('\n📦 Instalando dependências do projeto...\n');

  const { installType } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'installType',
      message: 'Selecione o que instalar:',
      choices: [
        { name: 'Dependências de produção', value: 'prod', checked: true },
        { name: 'Dependências de desenvolvimento', value: 'dev', checked: true },
      ],
    },
  ]);

  if (installType.includes('prod')) {
    console.log('📚 Instalando dependências de produção...');
    execSync('npm install', { stdio: 'inherit' });
  }

  if (installType.includes('dev')) {
    console.log('📚 Instalando dependências de desenvolvimento...');
    execSync('npm install --save-dev', { stdio: 'inherit' });
  }

  console.log('\n✅ Dependências instaladas com sucesso!');
}

async function buildProject() {
  console.log('\n🔨 Compilando projeto...\n');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n✅ Build concluído!');
}

async function runDev() {
  console.log('\n▶️  Iniciando modo desenvolvimento...\n');
  console.log('💡 Dica: Pressione Ctrl+C para parar\n');
  execSync('npm run dev', { stdio: 'inherit' });
}

async function createPackage() {
  console.log('\n📦 Criando installer...\n');

  const { platform } = await inquirer.prompt([
    {
      type: 'list',
      name: 'platform',
      message: 'Selecione a plataforma:',
      choices: [
        { name: 'Windows (.exe)', value: 'win' },
        { name: 'macOS (.dmg)', value: 'mac' },
        { name: 'Linux (.deb, .AppImage)', value: 'linux' },
        { name: 'Todas as plataformas', value: 'all' },
      ],
    },
  ]);

  console.log(`\n📦 Empacotando para ${platform}...\n`);
  
  let command = 'npm run package';
  if (platform !== 'all') {
    command += ` -- --${platform}`;
  }
  
  execSync(command, { stdio: 'inherit' });
  console.log('\n✅ Installer criado com sucesso!');
}

async function buildRelease() {
  console.log('\n🚀 Preparando build para produção...\n');
  
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Deseja continuar com o build de produção?',
      default: false,
    },
  ]);

  if (!confirm) {
    console.log('Abortado.');
    return;
  }

  execSync('npm run build:release', { stdio: 'inherit' });
  console.log('\n✅ Build de produção concluído!');
}

// Executar
runSetup().catch(console.error);
```

### 3. package.json com Scripts de Download

```json
{
  "name": "comic-organizer-electron",
  "version": "1.0.0",
  "scripts": {
    "install:all": "npm install && npm install --save-dev",
    "start": "electron dist/main/main.js",
    "dev": "concurrently \"npm run watch:main\" \"npm run watch:app\" \"npm run dev:electron\"",
    "dev:electron": "wait-on http://localhost:4200 && electron dist/main/main.js --dev",
    "watch:main": "tsc -p tsconfig.main.json --watch",
    "watch:app": "ng serve",
    "build": "npm run build:main && npm run build:app",
    "build:main": "tsc -p tsconfig.main.json",
    "build:app": "ng build",
    "build:release": "npm run build && npm run package",
    "package": "electron-builder",
    "package:win": "npm run build && electron-builder --win",
    "package:mac": "npm run build && electron-builder --mac",
    "package:linux": "npm run build && electron-builder --linux",
    "setup": "node dist/setup.js"
  },
  "dependencies": {
    "@angular/animations": "^21.0.0",
    "@angular/common": "^21.0.0",
    "@angular/compiler": "^21.0.0",
    "@angular/core": "^21.0.0",
    "@angular/forms": "^21.0.0",
    "@angular/platform-browser": "^21.0.0",
    "@angular/platform-browser-dynamic": "^21.0.0",
    "@angular/router": "^21.0.0",
    "archiver": "^6.0.0",
    "extract-zip": "^2.0.1",
    "sharp": "^0.33.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^21.0.0",
    "@angular/cli": "^21.0.0",
    "@angular/compiler-cli": "^21.0.0",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3",
    "electron": "^27.0.0",
    "electron-builder": "^24.6.4",
    "concurrently": "^8.2.2",
    "wait-on": "^7.0.1",
    "inquirer": "^9.2.10"
  }
}
```

---

## Plano de Implementação

### Fase 1: Fundação (Semana 1)
- [ ] Setup do projeto Node.js
- [ ] Configurar TypeScript
- [ ] Estrutura de pastas
- [ ] Setup do Electron básico

### Fase 2: Backend Core (Semanas 2-3)
- [ ] Modelos de dados (ComicEdition, ComicPage)
- [ ] File system operations
- [ ] ZIP/CBZ extraction
- [ ] File management service

### Fase 3: Conversão (Semanas 3-4)
- [ ] Conversion service
- [ ] CBR to CBZ
- [ ] CBZ to CBR
- [ ] Image processing

### Fase 4: Integração Electron (Semana 5)
- [ ] IPC communication
- [ ] Menu integration
- [ ] File dialogs
- [ ] Tray icon

### Fase 5: Teste e Polish (Semana 6)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Build e packaging
- [ ] Release

---

## Resultado Esperado

✅ Aplicação desktop funcional
✅ Suporte para Windows, macOS, Linux
✅ Interface Angular responsiva
✅ Backend robusto em Node.js
✅ Conversão de formatos de comics
✅ Gerenciamento de arquivos
✅ Installer para distribuição

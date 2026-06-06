# 📘 Rust + Tauri Roadmap - Comic Organizer Desktop Application

## 📋 Índice
1. [Análise Inicial do Projeto](#análise-inicial-do-projeto)
2. [Parte 1: Rust (Backend)](#parte-1-rust-backend)
3. [Parte 2: Tauri (Desktop App)](#parte-2-tauri-desktop-app)
4. [Estrutura Recomendada](#estrutura-recomendada)
5. [Plano de Implementação](#plano-de-implementação)
6. [Resultado Esperado](#resultado-esperado)

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

## Parte 1: Rust (Backend)

### 1. Cargo - Package Manager do Rust

**O que é:**
Cargo é o sistema de gerenciamento de pacotes, build e dependências do Rust. Equivalente ao npm/yarn do JavaScript.

**Por que será necessário no Comic Organizer:**
- Gerenciar dependências de bibliotecas Rust (crates)
- Compilar o código Rust para diferentes plataformas
- Executar testes automatizados
- Criar binários otimizados para produção

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 1º

**Conceitos a Dominar:**
- `Cargo.toml` - Arquivo de configuração (dependências, versões, metadata)
- `Cargo.lock` - Lock file para versionamento
- Comandos: `cargo new`, `cargo build`, `cargo run`, `cargo test`, `cargo check`
- Profiles: dev, release, test
- Workspaces (monorepos em Rust)

---

### 2. Crates - Bibliotecas Rust

**O que é:**
Crates são pacotes/bibliotecas Rust reutilizáveis, hospedadas em https://crates.io

**Por que será necessário:**
- Evitar reinventar a roda
- Usar soluções consolidadas e testadas
- Reduzir tempo de desenvolvimento

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 2º

**Crates Essenciais para Comic Organizer:**

| Crate | Versão | Propósito | Justificativa |
|-------|--------|----------|---------------|
| `serde` | ~1.0 | Serialização/Desserialização | Converter estruturas Rust → JSON/TOML |
| `serde_json` | ~1.0 | Processamento JSON | Comunicação com Frontend |
| `serde_toml` | ~0.8 | Processamento TOML | Arquivos de configuração |
| `tokio` | ~1.0 | Runtime async | Operações I/O não-bloqueantes |
| `tauri` | ~2.0 | Framework desktop | Core da aplicação desktop |
| `tauri-plugin-fs` | latest | Sistema de arquivos | Acesso ao file system local |
| `zip` | ~0.6 | Compressão ZIP | Criar/ler CBZ/CBR |
| `image` | ~0.25 | Processamento de imagens | Validar e processar páginas |
| `tracing` | ~0.1 | Logging estruturado | Debug e monitoramento |
| `anyhow` | ~1.0 | Error handling flexível | Tratamento de erros simplificado |
| `thiserror` | ~1.0 | Error handling customizado | Definir erros customizados |
| `walkdir` | ~2.0 | Traversar diretórios | Escaneamento de pastas |
| `regex` | ~1.0 | Expressões regulares | Pattern matching de nomes |
| `uuid` | ~1.0 | Geração de UUIDs | IDs únicos para transações |

**Exemplos de uso no Comic Organizer:**

```rust
// Leitura de arquivo CBZ (ZIP com imagens)
use zip::ZipArchive;
use std::fs::File;

let file = File::open("Batman.cbz")?;
let mut archive = ZipArchive::new(file)?;

// Serialização de dados
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct ComicLibrary {
    editions: Vec<ComicEdition>,
}

// Logging
use tracing::{info, debug, error};

info!("Iniciando conversão de {}", filename);
debug!("Arquivo contém {} páginas", page_count);
```

---

### 3. Modules - Organização de Código

**O que é:**
Sistema Rust de organização de código em módulos. Define namespaces e controla visibilidade.

**Por que será necessário:**
- Organizar código em camadas lógicas
- Controlar visibilidade de funções/structs
- Criar arquitetura escalável
- Facilitar manutenção e testes

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 3º

**Estrutura de Módulos Recomendada:**

```rust
// src/lib.rs ou src/main.rs
pub mod core;          // Lógica central de negócio
pub mod domain;        // Modelos de dados (ComicEdition, etc)
pub mod services;      // Serviços (conversão, renomeação)
pub mod handlers;      // Tauri command handlers
pub mod utils;         // Utilidades (I/O, parsing)
pub mod errors;        // Tipos de erro customizados
pub mod config;        // Configurações

// Dentro de cada módulo:
pub mod file_manager;  // Submodule
mod utils;             // Privado
```

**Declaração de Módulos:**

```rust
// src/lib.rs
pub mod domain {
    pub mod comic_edition;
    pub mod conversion_type;
    pub mod comic_page;
}

pub mod services {
    pub mod file_service;
    pub mod conversion_service;
    pub mod rename_service;
}
```

---

### 4. Structs - Estruturas de Dados

**O que é:**
Tipos de dados customizados que agrupam múltiplos campos com tipos específicos.

**Por que será necessário:**
- Representar entidades do domínio (ComicEdition, ComicPage)
- Tipar dados de forma segura
- Facilitar serialização/desserialização
- Implementar métodos e lógica de negócio

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 4º

**Structs Principais para Comic Organizer:**

```rust
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComicEdition {
    pub id: u64,
    pub title: String,
    pub pages: Vec<ComicPage>,
    pub format: ComicFormat,
    pub source_path: String,
    pub output_path: Option<String>,
    pub created_at: String,
    pub modified_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComicPage {
    pub id: u64,
    pub page_number: u32,
    pub filename: String,
    pub file_size: u64,
    pub width: u32,
    pub height: u32,
    pub format: ImageFormat,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct ConversionStats {
    pub total_files: u32,
    pub successful: u32,
    pub failed: u32,
    pub total_size_bytes: u64,
    pub processing_time_ms: u128,
}

// Implementar métodos
impl ComicEdition {
    pub fn new(title: String, source_path: String) -> Self {
        Self {
            id: uuid::Uuid::new_v4().as_u128() as u64,
            title,
            pages: Vec::new(),
            format: ComicFormat::CBZ,
            source_path,
            output_path: None,
            created_at: chrono::Local::now().to_rfc3339(),
            modified_at: chrono::Local::now().to_rfc3339(),
        }
    }

    pub fn add_page(&mut self, page: ComicPage) {
        self.pages.push(page);
    }

    pub fn total_size(&self) -> u64 {
        self.pages.iter().map(|p| p.file_size).sum()
    }
}
```

---

### 5. Enums - Tipos Enumerados

**O que é:**
Tipos que podem ter um entre diversos valores possíveis.

**Por que será necessário:**
- Representar estados (CBZ, CBR, Converting, Done)
- Tipar converters de formato
- Garantir que apenas valores válidos sejam usados
- Pattern matching para lógica condicional

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 5º

**Enums para Comic Organizer:**

```rust
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum ComicFormat {
    CBZ,           // ZIP com imagens
    CBR,           // RAR compatível (ZIP com .cbr)
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum ImageFormat {
    JPEG,
    PNG,
    WEBP,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum ConversionType {
    CBRToCBZ,      // CBR (ZIP) → CBZ
    CBZToCBR,      // CBZ → CBR (ZIP com .cbr)
    ImportJPG,     // Importar JPG → CBZ
    ImportPNG,     // Importar PNG → CBZ
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum ProcessingStatus {
    Pending,
    Processing,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConversionResult {
    Success {
        path: String,
        size: u64,
        duration_ms: u128,
    },
    Error {
        reason: String,
        file: String,
    },
}

// Pattern matching com Enums
match comic.format {
    ComicFormat::CBZ => {
        println!("Processando arquivo CBZ");
        // lógica específica
    },
    ComicFormat::CBR => {
        println!("Processando arquivo CBR (ZIP)");
        // lógica específica
    }
}
```

---

### 6. Traits - Interfaces/Contratos

**O que é:**
Traits definem um conjunto de métodos que tipos devem implementar. Similar a interfaces.

**Por que será necessário:**
- Abstrair funcionalidades comuns
- Permitir polimorfismo
- Criar componentes reutilizáveis
- Facilitar testes (mock objects)

**Nível de Importância:** **RECOMENDADO**

**Ordem de Aprendizado:** 8º

**Traits para Comic Organizer:**

```rust
pub trait ComicProcessor {
    fn process(&self, input: &str, output: &str) -> Result<ConversionStats>;
    fn validate(&self, path: &str) -> Result<bool>;
    fn get_pages_count(&self, path: &str) -> Result<u32>;
}

pub trait ComicRepository {
    fn save(&self, edition: ComicEdition) -> Result<()>;
    fn load(&self, id: u64) -> Result<ComicEdition>;
    fn list_all(&self) -> Result<Vec<ComicEdition>>;
    fn delete(&self, id: u64) -> Result<()>;
}

pub trait RenameStrategy {
    fn rename(&self, original: &str, edition: &ComicEdition) -> String;
}

// Implementação de Traits
struct CBZProcessor;

impl ComicProcessor for CBZProcessor {
    fn process(&self, input: &str, output: &str) -> Result<ConversionStats> {
        // Implementação específica para CBZ
    }

    fn validate(&self, path: &str) -> Result<bool> {
        // Validação de CBZ
    }

    fn get_pages_count(&self, path: &str) -> Result<u32> {
        // Contar páginas em CBZ
    }
}
```

---

### 7. Error Handling - Tratamento de Erros

**O que é:**
Sistema robusto para lidar com erros e situações inesperadas.

**Por que será necessário:**
- Aplicação profissional requer tratamento de erros confiável
- Evitar panics e crashes
- Fornecer mensagens úteis ao usuário
- Logging de erros para debug

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 6º

**Tipos de Erro em Comic Organizer:**

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ComicOrganizerError {
    #[error("Arquivo não encontrado: {0}")]
    FileNotFound(String),

    #[error("Formato de arquivo inválido: {0}")]
    InvalidFormat(String),

    #[error("Erro ao extrair arquivo: {0}")]
    ExtractionFailed(String),

    #[error("Erro ao compactar arquivo: {0}")]
    CompressionFailed(String),

    #[error("Caminho inválido: {0}")]
    InvalidPath(String),

    #[error("Permissão negada: {0}")]
    PermissionDenied(String),

    #[error("Espaço em disco insuficiente")]
    InsufficientDiskSpace,

    #[error("Página corrompida: {0}")]
    CorruptedPage(String),

    #[error("Erro I/O: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Erro JSON: {0}")]
    JsonError(#[from] serde_json::Error),

    #[error("Erro ZIP: {0}")]
    ZipError(#[from] zip::result::ZipError),

    #[error("Erro interno: {0}")]
    Internal(String),
}

// Type alias para simplificar
pub type Result<T> = std::result::Result<T, ComicOrganizerError>;
```

---

### 8. Result e Option - Tipos de Retorno

**O que é:**
`Result<T, E>` - Retorna sucesso (T) ou erro (E)
`Option<T>` - Retorna algo (Some(T)) ou nada (None)

**Por que será necessário:**
- Representar valores opcionais sem nullable
- Retornar resultados que podem falhar
- Evitar null pointer exceptions
- Força tratamento de casos extremos

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 6º (junto com Error Handling)

**Exemplos em Comic Organizer:**

```rust
// Result - para operações que podem falhar
pub fn load_comic(path: &str) -> Result<ComicEdition> {
    // Retorna ComicEdition ou ComicOrganizerError
}

pub fn convert_cbr_to_cbz(input: &str, output: &str) -> Result<ConversionStats> {
    // Sucesso retorna stats, falha retorna erro
}

// Option - para valores opcionais
pub fn find_comic_by_title(title: &str) -> Option<ComicEdition> {
    // Retorna Some(edition) ou None
}

pub fn get_next_page(current: u32, total: u32) -> Option<u32> {
    if current < total {
        Some(current + 1)
    } else {
        None
    }
}

// Usando Result e Option
match load_comic("Batman.cbz") {
    Ok(comic) => {
        println!("Carregado: {}", comic.title);
    },
    Err(e) => {
        eprintln!("Erro ao carregar: {}", e);
    }
}

// Encadeamento com ?
pub fn process_and_save(input: &str, output: &str) -> Result<()> {
    let comic = load_comic(input)?;  // Propaga erro se falhar
    let stats = convert_format(&comic, output)?;
    save_comic(&comic)?;
    Ok(())
}

// Tratando Option
if let Some(next) = get_next_page(5, 10) {
    println!("Próxima página: {}", next);
}
```

---

### 9. File System - Manipulação de Arquivos

**O que é:**
APIs para leitura, escrita e gerenciamento de arquivos no sistema operacional.

**Por que será necessário:**
- Comic Organizer trabalha com arquivos CBZ/CBR
- Precisa ler diretórios de entrada
- Criar arquivos de saída
- Gerenciar paths e permissões

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 7º

**Operações de File System:**

```rust
use std::fs;
use std::path::Path;

// Ler arquivo completo em memória
pub fn read_file_content(path: &str) -> Result<Vec<u8>> {
    fs::read(path)
        .map_err(|e| ComicOrganizerError::IoError(e))
}

// Ler arquivo como texto
pub fn read_file_text(path: &str) -> Result<String> {
    fs::read_to_string(path)
        .map_err(|e| ComicOrganizerError::IoError(e))
}

// Escrever arquivo
pub fn write_file(path: &str, content: &[u8]) -> Result<()> {
    fs::write(path, content)
        .map_err(|e| ComicOrganizerError::IoError(e))
}

// Verificar se arquivo existe
pub fn file_exists(path: &str) -> bool {
    Path::new(path).exists()
}

// Obter metadados do arquivo
pub fn get_file_size(path: &str) -> Result<u64> {
    fs::metadata(path)
        .map(|m| m.len())
        .map_err(|e| ComicOrganizerError::IoError(e))
}

// Copiar arquivo
pub fn copy_file(from: &str, to: &str) -> Result<()> {
    fs::copy(from, to)
        .map_err(|e| ComicOrganizerError::IoError(e))?;
    Ok(())
}

// Deletar arquivo
pub fn delete_file(path: &str) -> Result<()> {
    fs::remove_file(path)
        .map_err(|e| ComicOrganizerError::IoError(e))
}

// Criar arquivo vazio
pub fn touch_file(path: &str) -> Result<()> {
    fs::File::create(path)
        .map_err(|e| ComicOrganizerError::IoError(e))?;
    Ok(())
}
```

---

### 10. Manipulação de Diretórios

**O que é:**
APIs para navegar, listar e gerenciar diretórios.

**Por que será necessário:**
- Escaneamento de pastas com arquivos CBZ/CBR
- Criação de estrutura de saída
- Navegação em hierarquias de pastas

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 7º (junto com File System)

**Operações com Diretórios:**

```rust
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

// Listar arquivos em diretório
pub fn list_files(dir: &str) -> Result<Vec<String>> {
    let entries = fs::read_dir(dir)
        .map_err(|e| ComicOrganizerError::IoError(e))?;
    
    let files: Result<Vec<String>> = entries
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.path().is_file())
        .map(|entry| {
            entry.path()
                .to_str()
                .map(|s| s.to_string())
                .ok_or_else(|| ComicOrganizerError::InvalidPath("Invalid path".to_string()))
        })
        .collect();
    
    files
}

// Listar diretórios
pub fn list_directories(dir: &str) -> Result<Vec<String>> {
    let entries = fs::read_dir(dir)
        .map_err(|e| ComicOrganizerError::IoError(e))?;
    
    let dirs: Result<Vec<String>> = entries
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.path().is_dir())
        .map(|entry| {
            entry.path()
                .to_str()
                .map(|s| s.to_string())
                .ok_or_else(|| ComicOrganizerError::InvalidPath("Invalid path".to_string()))
        })
        .collect();
    
    dirs
}

// Caminhada recursiva (Recursive Directory Traversal)
pub fn find_cbz_files(root: &str) -> Result<Vec<String>> {
    let cbz_files: Vec<String> = WalkDir::new(root)
        .into_iter()
        .filter_map(|entry| entry.ok())
        .filter(|entry| {
            entry.path()
                .extension()
                .and_then(|ext| ext.to_str())
                .map(|ext| ext == "cbz" || ext == "cbr")
                .unwrap_or(false)
        })
        .filter_map(|entry| {
            entry.path()
                .to_str()
                .map(|s| s.to_string())
        })
        .collect();
    
    Ok(cbz_files)
}

// Criar diretório
pub fn create_directory(path: &str) -> Result<()> {
    fs::create_dir_all(path)
        .map_err(|e| ComicOrganizerError::IoError(e))
}

// Deletar diretório (recursivo)
pub fn delete_directory(path: &str) -> Result<()> {
    fs::remove_dir_all(path)
        .map_err(|e| ComicOrganizerError::IoError(e))
}

// Obter caminho absoluto
pub fn get_absolute_path(path: &str) -> Result<String> {
    std::fs::canonicalize(path)?
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| ComicOrganizerError::InvalidPath("Cannot convert to string".to_string()))
}

// Verificar se caminho é diretório
pub fn is_directory(path: &str) -> bool {
    Path::new(path).is_dir()
}
```

---

### 11. Leitura e Escrita de Arquivos

**O que é:**
APIs de I/O para trabalhar com conteúdo de arquivos.

**Por que será necessário:**
- Ler imagens dentro de arquivos CBZ
- Escrever metadados de edições
- Processar configurações
- Salvar estado da aplicação

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 7º

**Padrões de I/O para Comic Organizer:**

```rust
use std::fs::{File, OpenOptions};
use std::io::{Read, Write, BufReader};

// Ler arquivo em pequenos chunks (eficiente para arquivos grandes)
pub fn read_file_chunked(path: &str, chunk_size: usize) -> Result<()> {
    let file = File::open(path)?;
    let mut reader = BufReader::new(file);
    let mut buffer = vec![0; chunk_size];
    
    loop {
        let bytes_read = reader.read(&mut buffer)?;
        if bytes_read == 0 {
            break;
        }
        // Processar chunk
        process_chunk(&buffer[..bytes_read])?;
    }
    
    Ok(())
}

// Escrever arquivo com buffer
pub fn write_file_buffered(path: &str, content: &[u8]) -> Result<()> {
    let file = File::create(path)?;
    let mut writer = std::io::BufWriter::new(file);
    writer.write_all(content)?;
    writer.flush()?;
    Ok(())
}

// Append a arquivo existente
pub fn append_to_file(path: &str, content: &str) -> Result<()> {
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)?;
    
    file.write_all(content.as_bytes())?;
    Ok(())
}

// Copiar arquivo grande com progress
pub fn copy_file_with_progress(
    from: &str,
    to: &str,
    chunk_size: usize,
) -> Result<()> {
    let mut reader = BufReader::new(File::open(from)?);
    let mut writer = std::io::BufWriter::new(File::create(to)?);
    
    let mut buffer = vec![0; chunk_size];
    let mut total_bytes = 0;
    
    loop {
        let bytes_read = reader.read(&mut buffer)?;
        if bytes_read == 0 {
            break;
        }
        
        writer.write_all(&buffer[..bytes_read])?;
        total_bytes += bytes_read;
        
        // Notificar progresso
        eprintln!("Copiado: {} bytes", total_bytes);
    }
    
    writer.flush()?;
    Ok(())
}
```

---

### 12. Serialização (Serde)

**O que é:**
Serde (Serialize/Deserialize) é a biblioteca padrão Rust para converter estruturas entre diferentes formatos (JSON, TOML, YAML, etc).

**Por que será necessário:**
- Comunicação com frontend Angular via JSON
- Salvar/carregar configurações
- Persistência de dados locais
- Logging estruturado

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 9º

**Serialização em Comic Organizer:**

```rust
use serde::{Serialize, Deserialize};
use serde_json;

// Estrutura serializável
#[derive(Serialize, Deserialize, Debug)]
pub struct ComicEdition {
    pub id: u64,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub pages: Vec<ComicPage>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
}

// Serializar para JSON
pub fn comic_to_json(comic: &ComicEdition) -> Result<String> {
    serde_json::to_string_pretty(&comic)
        .map_err(|e| ComicOrganizerError::JsonError(e))
}

// Desserializar de JSON
pub fn json_to_comic(json: &str) -> Result<ComicEdition> {
    serde_json::from_str(json)
        .map_err(|e| ComicOrganizerError::JsonError(e))
}

// Serializar array
pub fn comics_to_json(comics: &[ComicEdition]) -> Result<String> {
    serde_json::to_string_pretty(&comics)
        .map_err(|e| ComicOrganizerError::JsonError(e))
}

// Customizar serialização
#[derive(Serialize, Deserialize)]
pub struct Config {
    #[serde(skip)]
    pub internal_state: String,  // Não serializar
    
    #[serde(default)]
    pub default_output: String,  // Usar valor padrão se não existir
    
    #[serde(alias = "outputDirectory")]
    pub output_dir: String,      // Aceitar nome alternativo
}
```

---

### 13. JSON - Formato de Dados

**O que é:**
JSON é formato de texto estruturado para representar dados. Padrão para APIs web.

**Por que será necessário:**
- Comunicação com frontend Angular
- APIs RESTful (se necessário)
- Configurações legíveis
- Logging estruturado

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 9º

**JSON em Comic Organizer:**

```rust
use serde_json::{json, Value};

// Criar JSON manualmente
pub fn create_response(success: bool, message: &str) -> Value {
    json!({
        "success": success,
        "message": message,
        "timestamp": chrono::Local::now().to_rfc3339()
    })
}

// Parsear JSON
pub fn parse_json_response(json_str: &str) -> Result<Value> {
    serde_json::from_str(json_str)
        .map_err(|e| ComicOrganizerError::JsonError(e))
}

// Exemplo de resposta JSON
// {
//   "success": true,
//   "data": {
//     "editions": [
//       {
//         "id": 1,
//         "title": "Batman #01",
//         "pageCount": 24,
//         "format": "CBZ"
//       }
//     ],
//     "total": 1
//   },
//   "errors": []
// }

// Serializar com customização
pub fn edition_response(edition: &ComicEdition) -> Value {
    json!({
        "id": edition.id,
        "title": edition.title,
        "pageCount": edition.pages.len(),
        "totalSize": edition.total_size(),
        "format": edition.format,
        "created": edition.created_at,
    })
}
```

---

### 14. TOML - Arquivo de Configuração

**O que é:**
TOML é formato de arquivo de configuração legível por humanos (similar a INI, mas melhor).

**Por que será necessário:**
- Arquivo Cargo.toml (obrigatório)
- Configurações persistentes da aplicação
- Perfis de renomeação
- Preferências do usuário

**Nível de Importância:** **RECOMENDADO**

**Ordem de Aprendizado:** 10º

**TOML em Comic Organizer:**

```rust
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct AppConfig {
    #[serde(rename = "app")]
    pub app_section: AppSettings,
    
    #[serde(rename = "conversion")]
    pub conversion: ConversionSettings,
    
    #[serde(rename = "rename")]
    pub rename_profiles: Vec<RenameProfile>,
}

#[derive(Serialize, Deserialize)]
pub struct AppSettings {
    pub version: String,
    pub name: String,
    pub data_dir: String,
}

#[derive(Serialize, Deserialize)]
pub struct ConversionSettings {
    pub default_format: String,
    pub compression_level: u8,
    pub auto_detect: bool,
}

#[derive(Serialize, Deserialize)]
pub struct RenameProfile {
    pub name: String,
    pub pattern: String,
    pub enabled: bool,
}

// Arquivo TOML de exemplo:
// [app]
// version = "0.1.0"
// name = "Comic Organizer"
// data_dir = "$HOME/.comic-organizer"
//
// [conversion]
// default_format = "CBZ"
// compression_level = 6
// auto_detect = true
//
// [[rename]]
// name = "Marvel Pattern"
// pattern = "{series} ({year}) #{issue:02d}"
// enabled = true

// Carregar config
pub fn load_config(path: &str) -> Result<AppConfig> {
    let content = std::fs::read_to_string(path)?;
    toml::from_str(&content)
        .map_err(|e| ComicOrganizerError::Internal(e.to_string()))
}

// Salvar config
pub fn save_config(path: &str, config: &AppConfig) -> Result<()> {
    let content = toml::to_string_pretty(&config)
        .map_err(|e| ComicOrganizerError::Internal(e.to_string()))?;
    std::fs::write(path, content)?;
    Ok(())
}
```

---

### 15. Async/Await - Programação Assíncrona

**O que é:**
Mecanismo para executar código não-bloqueante, permitindo que múltiplas operações aconteçam simultaneamente.

**Por que será necessário:**
- Tauri requer operações async
- Processamento de múltiplos arquivos em paralelo
- Não travar interface enquanto converte
- Melhor performance geral

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 11º

**Async em Comic Organizer:**

```rust
// Função async retorna Future
pub async fn load_comic_async(path: &str) -> Result<ComicEdition> {
    // Operação I/O assíncrona
    let content = tokio::fs::read(path).await?;
    // ... processar
    Ok(comic)
}

// Usar .await para aguardar resultado
pub async fn convert_all_async(files: Vec<String>) -> Result<Vec<ConversionStats>> {
    let mut tasks = vec![];
    
    for file in files {
        let task = tokio::spawn(async move {
            convert_file(&file).await
        });
        tasks.push(task);
    }
    
    // Aguardar todos os tasks
    let mut results = vec![];
    for task in tasks {
        match task.await {
            Ok(Ok(stats)) => results.push(stats),
            _ => {} // Tratar erro
        }
    }
    
    Ok(results)
}

// Pattern: async block
let result = async {
    let data = load_comic_async("file.cbz").await?;
    process_comic(&data)?;
    Ok::<_, ComicOrganizerError>(data)
}.await;

// Tauri command (deve ser async)
#[tauri::command]
pub async fn cmd_convert_comic(
    path: String,
    format: String,
) -> Result<ConversionStats, String> {
    match convert_comic_async(&path, &format).await {
        Ok(stats) => Ok(stats),
        Err(e) => Err(e.to_string()),
    }
}
```

---

### 16. Tokio - Runtime Assíncrono

**O que é:**
Tokio é o runtime async mais popular do Rust, gerencia threads e futures.

**Por que será necessário:**
- Tauri usa Tokio
- Processar múltiplos eventos simultaneamente
- Timers e delays
- Channels para comunicação entre threads

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 11º (junto com Async/Await)

**Tokio em Comic Organizer:**

```rust
use tokio::task;
use tokio::time::Duration;

// Spawn task
pub async fn process_comics_parallel(paths: Vec<String>) {
    let mut handles = vec![];
    
    for path in paths {
        let handle = task::spawn(async move {
            match convert_comic(&path).await {
                Ok(_) => println!("✓ {}", path),
                Err(e) => eprintln!("✗ {}: {}", path, e),
            }
        });
        handles.push(handle);
    }
    
    for handle in handles {
        let _ = handle.await;
    }
}

// Delay assíncrono
pub async fn conversion_with_timeout() -> Result<()> {
    tokio::select! {
        result = convert_comic_async("file.cbz") => result,
        _ = tokio::time::sleep(Duration::from_secs(300)) => {
            Err(ComicOrganizerError::Internal("Timeout".to_string()))
        }
    }
}

// Channels para comunicação
use tokio::sync::mpsc;

pub async fn producer_consumer_pattern() {
    let (tx, mut rx) = mpsc::channel::<String>(100);
    
    // Produtor
    task::spawn(async move {
        for i in 0..10 {
            let _ = tx.send(format!("Comic {}", i)).await;
        }
    });
    
    // Consumidor
    while let Some(msg) = rx.recv().await {
        println!("Processando: {}", msg);
    }
}
```

---

### 17. Logging - Rastreamento de Eventos

**O que é:**
Sistema para registrar eventos da aplicação (debug, info, warning, error).

**Por que será necessário:**
- Debug durante desenvolvimento
- Diagnosticar problemas em produção
- Auditoria de operações
- Performance monitoring

**Nível de Importância:** **RECOMENDADO**

**Ordem de Aprendizado:** 12º

**Logging em Comic Organizer:**

```rust
use tracing::{info, debug, warn, error, span, Level};

// Inicializar logger
pub fn init_logger() {
    tracing_subscriber::fmt()
        .with_max_level(Level::DEBUG)
        .with_file(true)
        .with_line_number(true)
        .init();
}

// Usar logging
pub async fn convert_comic_logged(path: &str) -> Result<()> {
    info!("Iniciando conversão de {}", path);
    
    match load_comic_async(path).await {
        Ok(comic) => {
            debug!("Carregado: {} ({} páginas)", comic.title, comic.pages.len());
            
            match compress_cbz(&comic).await {
                Ok(_) => info!("✓ Conversão concluída"),
                Err(e) => error!("✗ Erro na compressão: {}", e),
            }
        },
        Err(e) => {
            warn!("⚠ Falha ao carregar arquivo: {}", e);
        }
    }
    
    Ok(())
}

// Spans para rastrear contexto
pub async fn batch_conversion(files: Vec<String>) {
    let span = span!(Level::INFO, "batch_conversion", count = files.len());
    let _guard = span.enter();
    
    for file in files {
        info!("Processando: {}", file);
        // ...
    }
}
```

---

### 18. Testes - Garantir Qualidade

**O que é:**
Testes automatizados para validar que código funciona como esperado.

**Por que será necessário:**
- Evitar regressões
- Documentar comportamento esperado
- Confiança ao refatorar
- Requisito profissional

**Nível de Importância:** **RECOMENDADO**

**Ordem de Aprendizado:** 13º

**Testes em Comic Organizer:**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_comic_creation() {
        let comic = ComicEdition::new(
            "Batman #01".to_string(),
            "/path/to/batman.cbz".to_string(),
        );
        
        assert_eq!(comic.title, "Batman #01");
        assert_eq!(comic.pages.len(), 0);
    }

    #[test]
    fn test_add_page() {
        let mut comic = ComicEdition::new(
            "Batman #01".to_string(),
            "/path/to/batman.cbz".to_string(),
        );
        
        let page = ComicPage {
            id: 1,
            page_number: 1,
            filename: "page_001.jpg".to_string(),
            file_size: 1024,
            width: 1024,
            height: 1536,
            format: ImageFormat::JPEG,
        };
        
        comic.add_page(page);
        assert_eq!(comic.pages.len(), 1);
    }

    #[tokio::test]
    async fn test_convert_async() {
        let result = convert_comic_async("test.cbz", "cbr").await;
        assert!(result.is_ok());
    }

    #[test]
    #[should_panic]
    fn test_invalid_format() {
        let _comic = ComicEdition::new(
            "".to_string(),  // Inválido
            "".to_string(),
        );
    }
}
```

---

### 19. Organização em Camadas - Arquitetura

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
│ Presentation Layer (Tauri Commands)  │
│ - Handlers de Tauri                  │
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
│ - Entities (ComicEdition, ComicPage) │
│ - Traits e abstrações               │
│ - Regras de negócio                 │
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

```rust
// Domain Layer
pub struct ComicEdition {
    pub id: u64,
    pub title: String,
    pub pages: Vec<ComicPage>,
}

pub trait ComicRepository {
    fn save(&self, edition: &ComicEdition) -> Result<()>;
    fn load(&self, id: u64) -> Result<ComicEdition>;
}

// Infrastructure Layer
pub struct FileSystemRepository {
    base_path: String,
}

impl ComicRepository for FileSystemRepository {
    fn save(&self, edition: &ComicEdition) -> Result<()> {
        let path = format!("{}/{}.json", self.base_path, edition.id);
        let json = serde_json::to_string(edition)?;
        std::fs::write(path, json)?;
        Ok(())
    }

    fn load(&self, id: u64) -> Result<ComicEdition> {
        let path = format!("{}/{}.json", self.base_path, id);
        let content = std::fs::read_to_string(path)?;
        Ok(serde_json::from_str(&content)?)
    }
}

// Application Layer
pub struct ConversionService {
    repository: Box<dyn ComicRepository>,
}

impl ConversionService {
    pub fn convert_and_save(&self, comic: &ComicEdition) -> Result<()> {
        let converted = self.convert_format(comic)?;
        self.repository.save(&converted)?;
        Ok(())
    }

    fn convert_format(&self, _comic: &ComicEdition) -> Result<ComicEdition> {
        // Implementação de conversão
        todo!()
    }
}

// Presentation Layer
#[tauri::command]
pub async fn cmd_convert_and_save(
    service: tauri::State<'_, ConversionService>,
    comic_id: u64,
) -> Result<String, String> {
    let comic = service.repository.load(comic_id)
        .map_err(|e| e.to_string())?;
    
    service.convert_and_save(&comic)
        .map_err(|e| e.to_string())?;
    
    Ok("Conversão concluída".to_string())
}
```

---

### 20. Arquitetura Recomendada para Comic Organizer

**O que é:**
Estrutura específica de código para o projeto Comic Organizer.

**Por que será necessário:**
- Projeto precisa ser bem organizado desde o início
- Facilita colaboração
- Prepara para crescimento futuro

**Nível de Importância:** **OBRIGATÓRIO**

**Ordem de Aprendizado:** 15º

**Arquitetura Proposta:**

```rust
// src/lib.rs - Raiz da biblioteca
pub mod domain;          // Modelos de negócio
pub mod application;     // Services e use cases
pub mod infrastructure;  // I/O e persistência
pub mod handlers;        // Tauri command handlers
pub mod errors;          // Tipos de erro
pub mod config;          // Configurações

// src/domain/mod.rs
pub mod comic_edition;
pub mod comic_page;
pub mod conversion_type;
pub mod image_format;

// src/application/mod.rs
pub mod conversion_service;
pub mod rename_service;
pub mod file_service;

// src/infrastructure/mod.rs
pub mod file_system;
pub mod zip_processor;
pub mod repositories;

// src/handlers/mod.rs
pub mod comic_handlers;
pub mod conversion_handlers;
pub mod file_handlers;
```

**Fluxo de Requisição:**

```
Frontend Angular (Tauri Window)
    │
    └─> invoke("cmd_convert_comic", {...})
        │
        └─> handler: cmd_convert_comic
            (Presentation Layer)
            │
            └─> ConversionService.convert()
                (Application Layer)
                │
                └─> ZipProcessor.extract()
                    (Infrastructure Layer)
                    │
                    └─> File System I/O
                    
            ├─> ComicRepository.save()
            │   (Infrastructure Layer)
            │   │
            │   └─> File System Write
            │
            └─> Retorna JSON
        
        └─> Frontend recebe resultado
```

---

## Roadmap de Aprendizado Rust - Ordem Progressiva

### Fase 1: Fundações (Semanas 1-2)
1. ✅ **Cargo** - Setup de projetos
2. ✅ **Syntax básica** - Variáveis, tipos, funções
3. ✅ **Ownership** - Sistema central do Rust
4. ✅ **Result e Option** - Tratamento de valores
5. ✅ **Error Handling** - thiserror, anyhow

### Fase 2: Estruturas de Dados (Semanas 2-3)
6. ✅ **Structs** - Tipos customizados
7. ✅ **Enums** - Tipos discriminados
8. ✅ **Traits** - Abstrações e interfaces
9. ✅ **Pattern Matching** - Desestruturação

### Fase 3: I/O e Serialização (Semanas 3-4)
10. ✅ **File System** - Leitura/escrita de arquivos
11. ✅ **Manipulação de Diretórios** - Traversal e scanning
12. ✅ **Serde** - Serialização
13. ✅ **JSON** - Processamento JSON
14. ✅ **TOML** - Arquivos de configuração

### Fase 4: Programação Async (Semanas 4-5)
15. ✅ **Async/Await** - Conceitos assíncronnos
16. ✅ **Tokio** - Runtime async
17. ✅ **Channels** - Comunicação entre threads

### Fase 5: Qualidade e Organização (Semanas 5-6)
18. ✅ **Logging** - tracing
19. ✅ **Testes** - Unit tests e integração
20. ✅ **Modules** - Organização de código
21. ✅ **Arquitetura em Camadas** - Padrões

### Fase 6: Crates Específicas (Semanas 6-7)
22. 🔄 **zip** - Processamento CBZ/CBR
23. 🔄 **image** - Manipulação de imagens
24. 🔄 **walkdir** - Traversal avançado
25. 🔄 **regex** - Pattern matching avançado

### Fase 7: Tauri (Semanas 7-8)
26. 🔄 **Tauri Basics** - Setup e commands
27. 🔄 **Tauri IPC** - Comunicação frontend/backend
28. 🔄 **Tauri Plugins** - Extensões

---

## Parte 2: Tauri (Desktop App)

### 1. Como Tauri Funciona Internamente

**O que é Tauri:**
Tauri é um framework para construir aplicações desktop usando tecnologias web (HTML/CSS/JavaScript/TypeScript) com backend em Rust. Diferente de Electron, não empacota um navegador completo, apenas usa o navegador nativo do OS.

**Arquitetura Tauri:**

```
┌──────────────────────────────────┐
│  Frontend Window (WebView)        │
│  - Angular 21                    │
│  - HTML/CSS/TypeScript           │
│  - Renderização UI               │
└──────────────┬───────────────────┘
               │ IPC Bridge
               │ (JSON RPC)
┌──────────────▼───────────────────┐
│  Tauri Core (Rust)               │
│  - Event System                  │
│  - Command Handler               │
│  - Window Management             │
│  - File System API               │
│  - Menu System                   │
└──────────────┬───────────────────┘
               │
┌──────────────▼───────────────────┐
│  Application Backend (Rust)      │
│  - Business Logic                │
│  - File Processing               │
│  - Conversão de formato          │
│  - Persistence                   │
└──────────────────────────────────┘
```

**Vantagens do Tauri:**
- ✅ Menor tamanho (5-15MB vs 200MB do Electron)
- ✅ Menor consumo de RAM
- ✅ Melhor performance
- ✅ Backend em Rust (type-safe)
- ✅ Não depende de Node.js em produção
- ✅ Suporta Windows, macOS, Linux

**Desvantagens:**
- ❌ Comunidade menor que Electron
- ❌ Menos bibliotecas de terceiros
- ❌ Curva de aprendizado maior

---

### 2. Comunicação Frontend ↔ Backend

**O que é:**
Protocolo de comunicação entre a interface Angular e o backend Rust.

**Por que é necessário:**
- Frontend invoca operações do backend
- Backend envia resultados/eventos para frontend
- Tudo via JSON (serializado/desserializado automaticamente)

**Como funciona:**

```
┌─────────────────────────────────┐
│ Frontend (Angular/TypeScript)   │
│                                 │
│ invoke("cmd_name", {args})      │
│ → JSON serialization            │
└─────────────┬───────────────────┘
              │
              │ IPC Bridge (JSON RPC)
              │
┌─────────────▼───────────────────┐
│ Backend (Rust/Tauri)            │
│                                 │
│ #[tauri::command]               │
│ fn cmd_name(args) -> Result     │
│ → JSON deserialization          │
└─────────────┬───────────────────┘
              │
              │ JSON Response
              │
┌─────────────▼───────────────────┐
│ Frontend receives response       │
│ .then() / Promise handling      │
└─────────────────────────────────┘
```

---

### 3. Commands - Invocar Funções Rust

**O que é:**
Funções Rust que podem ser chamadas do frontend Angular.

**Por que é necessário:**
- Executar lógica no backend
- Acessar sistema de arquivos
- Realizar conversões

**Como implementar:**

```rust
// src-tauri/src/lib.rs
use tauri::State;
use serde::{Deserialize, Serialize};

// DTO - Data Transfer Object (para comunicação)
#[derive(Serialize, Deserialize)]
pub struct ConvertRequest {
    pub input_path: String,
    pub output_format: String,
    pub output_path: String,
}

#[derive(Serialize, Deserialize)]
pub struct ConvertResponse {
    pub success: bool,
    pub message: String,
    pub output_path: Option<String>,
}

// Command simples
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

// Command com estado compartilhado
#[tauri::command]
pub async fn cmd_convert_comic(
    request: ConvertRequest,
    app_state: State<'_, AppState>,
) -> Result<ConvertResponse, String> {
    match convert_comic(
        &request.input_path,
        &request.output_path,
        &request.output_format,
    ).await {
        Ok(path) => Ok(ConvertResponse {
            success: true,
            message: "Conversão concluída".to_string(),
            output_path: Some(path),
        }),
        Err(e) => Ok(ConvertResponse {
            success: false,
            message: format!("Erro: {}", e),
            output_path: None,
        }),
    }
}

// Setup function (registrar commands)
pub fn setup_commands(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    app.listen_global("conversion_progress", |event| {
        println!("Progress: {:?}", event.payload());
    });
    
    Ok(())
}
```

**Frontend (Angular) chamando comando:**

```typescript
// services/tauri.service.ts
import { invoke } from '@tauri-apps/api/core';

@Injectable({ providedIn: 'root' })
export class TauriService {
  async convertComic(inputPath: string, outputFormat: string): Promise<any> {
    try {
      const response = await invoke('cmd_convert_comic', {
        request: {
          inputPath: inputPath,
          outputFormat: outputFormat,
          outputPath: '/output/path.cbz',
        }
      });
      return response;
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  }
}

// Usar no componente
export class ComicPreviewComponent {
  async handleConvert() {
    const result = await this.tauri.convertComic(
      this.selectedComic.path,
      'CBZ'
    );
    
    if (result.success) {
      console.log('✓ Convertido:', result.output_path);
    } else {
      console.error('✗ Erro:', result.message);
    }
  }
}
```

---

### 4. Invoke - Chamadas Assíncronas

**O que é:**
Função que invoca um command Rust e aguarda o resultado.

**Por que é necessário:**
- Commands executam no backend (Rust)
- Operações podem demorar (arquivo grande)
- Promise-based para melhor UX

**Padrão de Uso:**

```typescript
// Simples
const result = await invoke('comando_simples');

// Com argumentos
const result = await invoke('comando_com_args', {
  arg1: 'valor1',
  arg2: 42,
});

// Com tratamento de erro
try {
  const result = await invoke('comando_que_pode_falhar', {
    path: '/arquivo.cbz',
  });
  console.log('Sucesso:', result);
} catch (error) {
  console.error('Erro:', error);
}

// Com Signal (Angular)
export class ComicComponent {
  result = signal<string>('');
  loading = signal(false);

  async loadComic(id: string) {
    this.loading.set(true);
    try {
      const comic = await invoke('cmd_get_comic', { id });
      this.result.set(comic);
    } finally {
      this.loading.set(false);
    }
  }
}
```

---

### 5. Events - Comunicação Bidirecional

**O que é:**
Sistema de pub/sub para frontend e backend se comunicarem assincronamente.

**Por que é necessário:**
- Backend precisa notificar frontend de progresso
- Frontend pode reagir a eventos do sistema
- Decoupling entre frontend e backend

**Padrão de Uso:**

```rust
// Backend (Rust) - Emitir evento
use tauri::Manager;

#[tauri::command]
pub async fn cmd_convert_with_progress(
    app: tauri::AppHandle,
    input_path: String,
) -> Result<String, String> {
    let total_pages = get_page_count(&input_path)?;
    
    for (i, page) in extract_pages(&input_path).enumerate() {
        // Processar página
        process_page(page)?;
        
        // Emitir progresso
        let progress = ((i + 1) as f32 / total_pages as f32) * 100.0;
        app.emit("conversion_progress", serde_json::json!({
            "current": i + 1,
            "total": total_pages,
            "percentage": progress,
        })).ok();
    }
    
    Ok("Conversão concluída".to_string())
}
```

```typescript
// Frontend (Angular) - Escutar evento
import { listen } from '@tauri-apps/api/event';

@Component({
  selector: 'app-conversion',
  template: `
    <div>
      <p>Progresso: {{ progress }}%</p>
      <progress [value]="progress" max="100"></progress>
    </div>
  `,
})
export class ConversionComponent implements OnInit {
  progress = 0;

  ngOnInit() {
    this.setupProgressListener();
  }

  async setupProgressListener() {
    await listen<any>('conversion_progress', (event) => {
      this.progress = event.payload.percentage;
    });
  }

  async startConversion() {
    await invoke('cmd_convert_with_progress', {
      inputPath: '/path/to/file.cbz',
    });
  }
}
```

---

### 6. Estado Compartilhado

**O que é:**
Dados que tanto frontend quanto backend precisam conhecer e manter sincronizados.

**Por que é necessário:**
- Configurações globais da app
- Estado de conversão em andamento
- Histórico de operações
- Preferências do usuário

**Padrão:**

```rust
// Backend - Estado compartilhado
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Mutex<AppConfig>>,
    pub conversions: Arc<Mutex<Vec<ConversionJob>>>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub default_format: String,
    pub auto_detect: bool,
    pub output_dir: String,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct ConversionJob {
    pub id: String,
    pub input: String,
    pub status: String,
    pub progress: f32,
}

// Command que acessa estado
#[tauri::command]
pub async fn cmd_get_config(
    state: State<'_, AppState>,
) -> Result<AppConfig, String> {
    let config = state.config.lock().await;
    Ok(config.clone())
}

#[tauri::command]
pub async fn cmd_update_config(
    state: State<'_, AppState>,
    new_config: AppConfig,
) -> Result<(), String> {
    let mut config = state.config.lock().await;
    *config = new_config;
    Ok(())
}

// Setup no main
#[cfg_attr(mobile, tauri::mobile::app)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            config: Arc::new(Mutex::new(AppConfig::default())),
            conversions: Arc::new(Mutex::new(Vec::new())),
        })
        .invoke_handler(tauri::generate_handler![
            cmd_get_config,
            cmd_update_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

```typescript
// Frontend - Usar estado
@Injectable({ providedIn: 'root' })
export class StateService {
  config$ = signal<AppConfig | null>(null);

  async loadConfig() {
    const config = await invoke('cmd_get_config') as AppConfig;
    this.config$.set(config);
  }

  async updateConfig(newConfig: AppConfig) {
    await invoke('cmd_update_config', { newConfig });
    this.config$.set(newConfig);
  }
}
```

---

### 7. Gerenciamento de Janelas

**O que é:**
Controle sobre as janelas da aplicação (criar, fechar, redimensionar, etc).

**Por que é necessário:**
- Abrir janelas secundárias (diálogos)
- Gerenciar múltiplas windows
- Fullscreen e modo kiosk

**Padrão:**

```rust
// Backend - Gerenciar janelas
use tauri::{Window, Manager};

#[tauri::command]
pub async fn cmd_open_settings(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(_window) = app.get_window("settings") {
        // Janela já existe
        return Ok(());
    }

    // Criar nova janela
    tauri::window::WindowBuilder::new(
        &app,
        "settings",
        tauri::window::WindowUrl::App("settings".into()),
    )
    .title("Configurações")
    .inner_size(600.0, 400.0)
    .resizable(true)
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn cmd_close_window(window: Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_maximize_window(window: Window) -> Result<(), String> {
    window.maximize().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn cmd_minimize_window(window: Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}
```

```typescript
// Frontend - Interagir com janelas
import { appWindow } from '@tauri-apps/api/window';

export class WindowService {
  async openSettings() {
    await invoke('cmd_open_settings');
  }

  async closeWindow() {
    await invoke('cmd_close_window');
  }

  async maximize() {
    await appWindow.maximize();
  }

  async minimize() {
    await appWindow.minimize();
  }

  async toggleFullscreen() {
    const isFullscreen = await appWindow.isFullscreen();
    await appWindow.setFullscreen(!isFullscreen);
  }
}
```

---

### 8. Menus - Barra de Menu da Aplicação

**O que é:**
Menu padrão do sistema operacional (Arquivo, Editar, Ver, Ajuda).

**Por que é necessário:**
- Acesso rápido a funções principais
- Padrão de UX esperado em desktop
- Suporte a atalhos de teclado

**Padrão:**

```rust
// src-tauri/src/main.rs
use tauri::{
    menu::{MenuBuilder, MenuItem},
    Builder,
};

fn main() {
    let menu = MenuBuilder::new()
        .items(&[
            // Menu Arquivo
            &MenuItem::with_id("arquivo", "Arquivo", true)
                .submenu(
                    MenuBuilder::new()
                        .items(&[
                            &MenuItem::with_id("abrir", "Abrir...", true),
                            &MenuItem::with_id("salvar", "Salvar", true),
                            &MenuItem::Separator,
                            &MenuItem::with_id("sair", "Sair", true),
                        ])
                        .build(tauri::generate_context!())
                        .unwrap()
                ),
            // Menu Editar
            &MenuItem::with_id("editar", "Editar", true)
                .submenu(
                    MenuBuilder::new()
                        .items(&[
                            &MenuItem::with_id("desfazer", "Desfazer", true),
                            &MenuItem::with_id("refazer", "Refazer", true),
                            &MenuItem::Separator,
                            &MenuItem::with_id("copiar", "Copiar", true),
                            &MenuItem::with_id("colar", "Colar", true),
                        ])
                        .build(tauri::generate_context!())
                        .unwrap()
                ),
        ])
        .build(tauri::generate_context!())
        .unwrap();

    Builder::default()
        .menu(menu)
        .on_menu_event(|app, event| {
            match event.id.as_str() {
                "sair" => app.exit(0),
                "abrir" => handle_open(),
                "salvar" => handle_save(),
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn handle_open() {
    println!("Menu: Abrir");
}

fn handle_save() {
    println!("Menu: Salvar");
}
```

---

### 9. Dialogs - Janelas de Diálogo

**O que é:**
Dialogs nativos do SO (file picker, message box, etc).

**Por que é necessário:**
- Selecionar arquivos/pastas
- Confirmar ações
- Mostrar mensagens

**Padrão:**

```rust
// Backend - Dialog handlers
use tauri::api::dialog;

#[tauri::command]
pub async fn cmd_select_folder() -> Result<Option<String>, String> {
    dialog::FileDialogBuilder::new()
        .pick_folder()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn cmd_select_file() -> Result<Option<String>, String> {
    dialog::FileDialogBuilder::new()
        .add_filter("Comics", &["cbz", "cbr", "zip"])
        .pick_file()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn cmd_confirm_action(message: String) -> Result<bool, String> {
    dialog::confirm(Some("Confirmação"), &message)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn cmd_show_message(title: String, message: String) -> Result<(), String> {
    dialog::message(Some(&title), &message)
        .await
        .map_err(|e| e.to_string())
}
```

```typescript
// Frontend - Usar dialogs
@Injectable({ providedIn: 'root' })
export class DialogService {
  async selectFolder(): Promise<string | null> {
    return await invoke('cmd_select_folder') as string | null;
  }

  async selectFile(): Promise<string | null> {
    return await invoke('cmd_select_file') as string | null;
  }

  async confirm(message: string): Promise<boolean> {
    return await invoke('cmd_confirm_action', { message }) as boolean;
  }

  async showMessage(title: string, message: string): Promise<void> {
    await invoke('cmd_show_message', { title, message });
  }
}
```

---

### 10. Sistema de Arquivos

**O que é:**
API para acessar sistema de arquivos do usuário.

**Por que é necessário:**
- Ler arquivos CBZ/CBR
- Salvar conversões
- Gerenciar diretórios

**Padrão:**

```rust
// Backend - File system operations
use tauri_plugin_fs::FsExt;

#[tauri::command]
pub async fn cmd_read_directory(path: String) -> Result<Vec<FileInfo>, String> {
    let entries = std::fs::read_dir(&path)
        .map_err(|e| e.to_string())?;
    
    let mut files = Vec::new();
    
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let metadata = entry.metadata()
            .map_err(|e| e.to_string())?;
        
        files.push(FileInfo {
            name: path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_string(),
            path: path.to_str()
                .unwrap_or("")
                .to_string(),
            is_dir: metadata.is_dir(),
            size: metadata.len(),
        });
    }
    
    Ok(files)
}

#[derive(serde::Serialize)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
}
```

```typescript
// Frontend - Navegar arquivos
@Component({
  selector: 'app-file-explorer',
  template: `
    <div>
      <button (click)="openFolder()">Selecionar Pasta</button>
      <div *ngFor="let file of files()">
        <span>{{ file.name }} ({{ file.size }} bytes)</span>
      </div>
    </div>
  `,
})
export class FileExplorerComponent {
  files = signal<FileInfo[]>([]);

  async openFolder() {
    const folderPath = await invoke('cmd_select_folder') as string;
    if (!folderPath) return;

    this.files.set(
      await invoke('cmd_read_directory', { path: folderPath }) as FileInfo[]
    );
  }
}
```

---

### 11. Empacotamento - Build para Produção

**O que é:**
Processo de compilar Angular + Rust em executável desktop.

**Por que é necessário:**
- Distribuir aplicação para usuários
- Otimizações de produção
- Assinatura de código

**Padrão:**

```bash
# Estrutura do projeto
comic-organizer/
├── src-tauri/          # Rust backend
│   ├── src/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                # Angular frontend
│   ├── app/
│   ├── main.ts
│   └── ...
├── angular.json
├── package.json
└── tauri.conf.json     # Configuração geral Tauri

# Comandos
npm run tauri dev       # Desenvolvimento
npm run tauri build     # Build para produção
```

**tauri.conf.json:**

```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm start",
    "devPath": "http://localhost:4200",
    "frontendDist": "../dist/angular_comic_organizer/browser"
  },
  "app": {
    "windows": [
      {
        "title": "Comic Organizer",
        "width": 1200,
        "height": 800,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": ["nsis", "msi"],
    "identifier": "com.comic-organizer.app",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

---

### 12. Instaladores

**O que é:**
Criação de instaladores `.exe`, `.msi`, `.dmg`, `.AppImage`.

**Por que é necessário:**
- Experiência padrão em desktop
- Fácil instalação para usuários não-técnicos
- Distribuição via website

**Windows NSIS:**

```
installer.nsi configurado automaticamente
- Creates Start Menu shortcuts
- Uninstall entry in Control Panel
- Desktop shortcut option
```

**Padrão de Build:**

```bash
# Build Windows
npm run tauri build -- --target x86_64-pc-windows-msvc

# Build macOS
npm run tauri build -- --target x86_64-apple-darwin
npm run tauri build -- --target aarch64-apple-darwin

# Build Linux
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

---

### 13. Atualizações - Auto-Update

**O que é:**
Sistema de atualização automática da aplicação.

**Por que é necessário:**
- Distribuir patches/features
- Segurança (correções de bugs)
- Experiência de usuário contínua

**Padrão:**

```rust
// Backend - Tauri Updater
use tauri_plugin_updater::UpdaterExt;

#[tauri::command]
pub async fn cmd_check_updates(app: tauri::AppHandle) -> Result<String, String> {
    match app.updater().check().await {
        Ok(Some(update)) => {
            println!("Update available: {}", update.version);
            match update.download_and_install().await {
                Ok(_) => Ok("Update installed, app will restart".to_string()),
                Err(e) => Err(e.to_string()),
            }
        }
        Ok(None) => Ok("No updates available".to_string()),
        Err(e) => Err(e.to_string()),
    }
}
```

```typescript
// Frontend - Notificar usuário
@Component({
  selector: 'app-root',
  template: `
    <div *ngIf="updateAvailable()" class="update-banner">
      <p>Atualização disponível!</p>
      <button (click)="checkUpdates()">Atualizar Agora</button>
    </div>
  `,
})
export class AppComponent {
  updateAvailable = signal(false);

  async checkUpdates() {
    try {
      const result = await invoke('cmd_check_updates') as string;
      console.log(result);
    } catch (error) {
      console.error('Update check failed:', error);
    }
  }
}
```

---

## Estrutura Recomendada

### Backend Rust - Organização de Pastas

```
src-tauri/
├── src/
│   ├── main.rs                    # Entry point
│   ├── lib.rs                     # Library exports
│   │
│   ├── domain/                    # Modelos de Negócio
│   │   ├── mod.rs
│   │   ├── comic_edition.rs       # Entity: ComicEdition
│   │   ├── comic_page.rs          # Entity: ComicPage
│   │   ├── conversion_type.rs     # Enum: ConversionType
│   │   ├── image_format.rs        # Enum: ImageFormat
│   │   ├── comic_format.rs        # Enum: ComicFormat
│   │   └── repository.rs          # Trait: ComicRepository
│   │
│   ├── application/               # Serviços e Use Cases
│   │   ├── mod.rs
│   │   ├── conversion_service.rs  # Converter CBZ/CBR
│   │   ├── rename_service.rs      # Renomear arquivos
│   │   ├── file_service.rs        # Gerenciar arquivos
│   │   └── library_service.rs     # Gerenciar biblioteca
│   │
│   ├── infrastructure/            # I/O e Persistência
│   │   ├── mod.rs
│   │   ├── file_system.rs         # Operações com arquivos
│   │   ├── zip_processor.rs       # Processar ZIP/CBZ/CBR
│   │   ├── image_processor.rs     # Validar/processar imagens
│   │   ├── file_repository.rs     # Implementar ComicRepository
│   │   └── config_manager.rs      # Gerenciar configurações
│   │
│   ├── handlers/                  # Tauri Command Handlers
│   │   ├── mod.rs
│   │   ├── comic_handlers.rs      # cmd_get_comic, cmd_list_comics
│   │   ├── conversion_handlers.rs # cmd_convert_comic
│   │   ├── rename_handlers.rs     # cmd_rename_comic
│   │   ├── file_handlers.rs       # cmd_select_folder
│   │   └── library_handlers.rs    # cmd_scan_library
│   │
│   ├── errors/                    # Tratamento de Erros
│   │   ├── mod.rs
│   │   ├── comic_error.rs         # ComicOrganizerError
│   │   └── response.rs            # Response<T>
│   │
│   ├── config/                    # Configurações
│   │   ├── mod.rs
│   │   ├── app_config.rs          # AppConfig
│   │   └── paths.rs               # Caminhos padrão
│   │
│   └── utils/                     # Utilidades
│       ├── mod.rs
│       ├── validation.rs          # Validar inputs
│       ├── paths.rs               # Manipular paths
│       └── logger.rs              # Logging setup
│
├── Cargo.toml                     # Dependencies
├── tauri.conf.json                # Tauri config
└── README.md
```

### Frontend Angular - Organização (Já Existente)

```
src/
├── main.ts
├── index.html
├── styles.css
│
├── app/
│   ├── app.ts                 # Root component
│   ├── app.html
│   ├── app.css
│   ├── app.config.ts
│   ├── app.routes.ts
│   │
│   ├── models/                # Tipos/Interfaces
│   │   ├── comic-edition.ts
│   │   ├── comic-page.ts
│   │   └── conversion-type.ts
│   │
│   ├── services/              # Serviços Angular
│   │   ├── file-manager.ts
│   │   ├── conversion-state.ts
│   │   ├── conversion.ts
│   │   ├── tauri.service.ts   # NOVO: Ponte com Tauri
│   │   └── dialog.service.ts  # NOVO: Dialogs
│   │
│   ├── pages/
│   │   └── home/
│   │
│   └── components/
│       ├── comic-preview/
│       ├── file-explorer/
│       ├── footer-bar/
│       ├── menu-bar/
│       └── rename-settings/
│
└── index.html
```

**Responsabilidade de Cada Pasta Backend:**

| Pasta | Responsabilidade | Exemplo de Arquivo |
|-------|-----------------|-------------------|
| `domain/` | Definições de tipos, entities, traits | `ComicEdition`, `ConversionType`, `Repository` |
| `application/` | Lógica de negócio, orquestração | `ConvertService.convert()` |
| `infrastructure/` | I/O, persistência, acesso externo | `ZipProcessor`, `FileSystem` |
| `handlers/` | Interface Tauri com commands | `#[tauri::command] fn cmd_convert()` |
| `errors/` | Tipos e tratamento de erro | `ComicOrganizerError`, `Result<T>` |
| `config/` | Gerenciamento de configurações | Paths, settings, preferences |
| `utils/` | Funções auxiliares compartilhadas | Validação, logging |

---

## Plano de Implementação

### ✅ Fase 1 - Preparação

**Objetivo:** Configurar ambiente e dependências

**Checklist:**

- [ ] Instalar Rust (rustup)
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  rustup update stable
  rustc --version && cargo --version
  ```

- [ ] Instalar Node.js 18+ e npm
  ```bash
  node --version && npm --version
  ```

- [ ] Instalar Tauri CLI
  ```bash
  npm i -g @tauri-apps/cli
  ```

- [ ] Instalar dependências do Tauri por SO

  **Windows:**
  ```bash
  # Visual Studio Build Tools ou Visual Studio Community
  # Download: https://visualstudio.microsoft.com/downloads/
  # Instalar "Desktop development with C++"
  ```

  **macOS:**
  ```bash
  xcode-select --install
  ```

  **Linux (Ubuntu/Debian):**
  ```bash
  sudo apt-get install \
    libssl-dev \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    libayatana-appindicator3-dev \
    librsvg2-dev
  ```

- [ ] Criar estrutura Tauri
  ```bash
  cd comic-organizer
  npm install
  npm install @tauri-apps/api @tauri-apps/cli
  ```

- [ ] Criar projeto Rust
  ```bash
  # Tauri cria automaticamente em src-tauri/
  cargo new --lib src-tauri
  ```

- [ ] Adicionar dependências Cargo
  ```toml
  [dependencies]
  tauri = { version = "2.0", features = ["shell-open"] }
  serde = { version = "1.0", features = ["derive"] }
  serde_json = "1.0"
  tokio = { version = "1", features = ["full"] }
  zip = "0.6"
  image = "0.25"
  walkdir = "2.0"
  tracing = "0.1"
  tracing-subscriber = "0.3"
  anyhow = "1.0"
  thiserror = "1.0"
  uuid = { version = "1.0", features = ["v4", "serde"] }
  chrono = { version = "0.4", features = ["serde"] }
  toml = "0.8"
  regex = "1.0"
  ```

---

### ✅ Fase 2 - Estruturação

**Objetivo:** Criar estrutura de diretórios e arquivos base

**Checklist:**

#### Backend Rust
- [ ] Criar pastas core
  ```bash
  mkdir -p src-tauri/src/{domain,application,infrastructure,handlers,errors,config,utils}
  ```

- [ ] Criar `src-tauri/src/main.rs`
  ```rust
  // Entry point da aplicação
  ```

- [ ] Criar `src-tauri/src/lib.rs`
  ```rust
  // Exports dos módulos
  ```

- [ ] Criar `src-tauri/src/domain/mod.rs`
  ```rust
  pub mod comic_edition;
  pub mod comic_page;
  pub mod conversion_type;
  pub mod image_format;
  pub mod comic_format;
  ```

- [ ] Criar `src-tauri/src/domain/comic_edition.rs`
  ```rust
  // ComicEdition entity
  ```

- [ ] Criar `src-tauri/src/application/mod.rs`
  ```rust
  pub mod conversion_service;
  pub mod rename_service;
  pub mod file_service;
  ```

- [ ] Criar `src-tauri/src/infrastructure/mod.rs`
  ```rust
  pub mod file_system;
  pub mod zip_processor;
  pub mod image_processor;
  pub mod file_repository;
  ```

- [ ] Criar `src-tauri/src/handlers/mod.rs`
  ```rust
  pub mod comic_handlers;
  pub mod conversion_handlers;
  ```

- [ ] Criar `src-tauri/src/errors/mod.rs`
  ```rust
  // Error types
  ```

- [ ] Criar `src-tauri/src/config/mod.rs`
  ```rust
  // Configuration
  ```

#### Frontend Angular (Updates)
- [ ] Criar `src/app/services/tauri.service.ts`
- [ ] Criar `src/app/services/dialog.service.ts`
- [ ] Atualizar `src/app/services/file-manager.ts`

---

### ✅ Fase 3 - Backend

**Objetivo:** Implementar lógica Rust

**Checklist:**

#### Domain Layer
- [ ] Implementar `domain/comic_edition.rs`
- [ ] Implementar `domain/comic_page.rs`
- [ ] Implementar `domain/conversion_type.rs`
- [ ] Implementar `domain/image_format.rs`
- [ ] Implementar `domain/comic_format.rs`
- [ ] Criar trait `domain/repository.rs`

#### Application Layer
- [ ] Implementar `application/conversion_service.rs`
  - `pub async fn convert_cbz_to_cbr()`
  - `pub async fn convert_cbr_to_cbz()`
  - `pub async fn import_images_to_cbz()`

- [ ] Implementar `application/rename_service.rs`
  - `pub fn apply_rename_pattern()`
  - `pub fn validate_pattern()`

- [ ] Implementar `application/file_service.rs`
  - `pub async fn scan_directory()`
  - `pub async fn get_comic_info()`

#### Infrastructure Layer
- [ ] Implementar `infrastructure/file_system.rs`
  - Wrapper para operações de arquivo
  
- [ ] Implementar `infrastructure/zip_processor.rs`
  - `pub fn extract_cbz()`
  - `pub fn create_cbz()`
  - `pub fn create_cbr()`

- [ ] Implementar `infrastructure/image_processor.rs`
  - `pub fn validate_image()`
  - `pub fn get_image_dimensions()`

- [ ] Implementar `infrastructure/file_repository.rs`
  - Implementar trait `ComicRepository`
  - Persistência em JSON/SQLite

#### Error Handling
- [ ] Criar enum `ComicOrganizerError`
- [ ] Implementar conversões de erro

#### Configuration
- [ ] Criar `AppConfig` struct
- [ ] Loader de config

---

### ✅ Fase 4 - Integração

**Objetivo:** Conectar Frontend e Backend via Tauri

**Checklist:**

#### Tauri Commands
- [ ] Implementar `handlers/comic_handlers.rs`
  ```rust
  #[tauri::command]
  pub async fn cmd_list_comics() -> Result<Vec<ComicEdition>, String>
  
  #[tauri::command]
  pub async fn cmd_get_comic(id: u64) -> Result<ComicEdition, String>
  ```

- [ ] Implementar `handlers/conversion_handlers.rs`
  ```rust
  #[tauri::command]
  pub async fn cmd_convert_comic(
      input: String,
      format: String,
  ) -> Result<ConversionResponse, String>
  ```

- [ ] Implementar `handlers/file_handlers.rs`
  ```rust
  #[tauri::command]
  pub async fn cmd_open_file_dialog() -> Result<Option<String>, String>
  
  #[tauri::command]
  pub async fn cmd_read_directory(path: String) -> Result<Vec<FileInfo>, String>
  ```

- [ ] Registrar commands em `main.rs`
  ```rust
  tauri::Builder::default()
      .invoke_handler(tauri::generate_handler![
          cmd_list_comics,
          cmd_convert_comic,
          cmd_open_file_dialog,
      ])
  ```

#### Frontend Integration
- [ ] Criar `tauri.service.ts`
  ```typescript
  @Injectable()
  export class TauriService {
    async listComics(): Promise<ComicEdition[]>
    async convertComic(input: string, format: string): Promise<void>
    async selectFolder(): Promise<string>
  }
  ```

- [ ] Atualizar `file-manager.service.ts`
  - Usar `TauriService` em vez de dados mock

- [ ] Atualizar componentes
  - `comic-preview.ts` - usar dados reais
  - `file-explorer.ts` - usar dados reais

#### Eventos Tauri
- [ ] Implementar emissão de progresso
  ```rust
  #[tauri::command]
  pub async fn cmd_convert_with_progress(
      app: AppHandle,
      input: String,
  ) -> Result<String, String>
  ```

- [ ] Implementar listener no Angular
  ```typescript
  async setupConversionListener() {
    await listen('conversion_progress', (event) => {
      this.progress.set(event.payload);
    });
  }
  ```

---

### ✅ Fase 5 - Build

**Objetivo:** Gerar executáveis para distribuição

**Checklist:**

#### Configuração
- [ ] Atualizar `tauri.conf.json`
  ```json
  {
    "build": {
      "beforeBuildCommand": "npm run build",
      "beforeDevCommand": "npm start",
      "devPath": "http://localhost:4200",
      "frontendDist": "../dist/angular_comic_organizer/browser"
    },
    "bundle": {
      "active": true,
      "targets": ["nsis", "msi"]
    }
  }
  ```

- [ ] Preparar ícones
  - `src-tauri/icons/` com resoluções: 32x32, 128x128, icon.icns, icon.ico

#### Desenvolvimento
- [ ] Testar em modo dev
  ```bash
  npm run tauri dev
  ```

- [ ] Testar commands básicos
- [ ] Testar integração frontend/backend

#### Build Windows
- [ ] Build para produção
  ```bash
  npm run tauri build
  ```

- [ ] Gerar `.exe` e `.msi`
- [ ] Testar instalação

#### Build Adicional (Opcional)
- [ ] Build macOS (se tiver Mac)
- [ ] Build Linux

#### Distribuição
- [ ] Criar releases no GitHub
- [ ] Fazer upload de executáveis
- [ ] Criar página de download

---

## Resultado Esperado

### Tabela de Funcionalidades

| Funcionalidade | Tecnologia | Arquivo Responsável | Status Esperado |
|---|---|---|---|
| **Leitura de CBZ** | Rust + `zip` crate | `infrastructure/zip_processor.rs` | ✅ Implementado |
| **Leitura de CBR** | Rust + `zip` crate | `infrastructure/zip_processor.rs` | ✅ Implementado |
| **Conversão CBZ → CBR** | Rust + Tauri | `application/conversion_service.rs` | ✅ Implementado |
| **Conversão CBR → CBZ** | Rust + Tauri | `application/conversion_service.rs` | ✅ Implementado |
| **Importação de JPG/PNG** | Rust + `image` crate | `infrastructure/image_processor.rs` | ✅ Implementado |
| **Validação de imagens** | Rust + `image` crate | `infrastructure/image_processor.rs` | ✅ Implementado |
| **Renomeação em massa** | Rust + regex | `application/rename_service.rs` | ✅ Implementado |
| **Busca recursiva de arquivos** | Rust + `walkdir` | `infrastructure/file_system.rs` | ✅ Implementado |
| **Seleção de pasta (Dialog)** | Tauri | `handlers/file_handlers.rs` | ✅ Implementado |
| **Progresso de conversão** | Tauri Events + Angular Signals | `handlers/conversion_handlers.rs` | ✅ Implementado |
| **Configurações persistentes** | Rust + TOML | `config/app_config.rs` | ✅ Implementado |
| **Logging estruturado** | Rust + `tracing` | `utils/logger.rs` | ✅ Implementado |
| **Gerenciamento de estado** | Tauri State + Angular Signals | `main.rs` + `*.service.ts` | ✅ Implementado |
| **Menu de aplicação** | Tauri Menu Builder | `main.rs` | ✅ Implementado |
| **Executável Windows (.exe)** | Tauri Bundle | `tauri.conf.json` | ✅ Gerado |
| **Instalador Windows (.msi)** | Tauri NSIS | `tauri.conf.json` | ✅ Gerado |
| **Auto-update** | Tauri Updater | `handlers/update_handlers.rs` | 🔄 Opcional |

---

### Stack Técnico Final

```
Comic Organizer Desktop v1.0
├── Frontend
│   ├── Angular 21 (Standalone Components)
│   ├── TypeScript 5.9
│   ├── Angular Signals (Reatividade)
│   ├── Angular CDK (Drag & Drop)
│   └── Lucide Icons
│
├── Desktop (Tauri 2.0)
│   ├── Tauri Commands (RPC)
│   ├── Tauri Events (Pub/Sub)
│   ├── File Dialogs
│   ├── Menu System
│   └── Window Management
│
└── Backend
    ├── Rust 1.75+
    ├── Tokio (Async Runtime)
    ├── Serde (Serialization)
    ├── Zip crate (CBZ/CBR)
    ├── Image crate (Validação)
    ├── Tracing (Logging)
    └── Regex (Renomeação)
```

---

## Próximos Passos Recomendados

1. **Estudar Rust** (1-2 semanas)
   - Ownership, Borrowing, Lifetimes
   - Pattern Matching, Error Handling
   - Async/Await com Tokio

2. **Setup do Projeto** (1 semana)
   - Criar estrutura de pastas
   - Adicionar dependências Cargo
   - Configurar Tauri

3. **Implementar Backend** (3-4 semanas)
   - Domain models
   - Services
   - ZIP processing
   - File system operations

4. **Integrar Frontend** (1-2 semanas)
   - Tauri commands
   - TauriService
   - Atualizar componentes

5. **Build e Teste** (1 semana)
   - Build para Windows
   - Testar instalador
   - Feedback de usuários

6. **Release** (1 semana)
   - GitHub releases
   - Website de download
   - Documentação

---

## Recursos de Aprendizado

**Rust:**
- https://doc.rust-lang.org/book/ (The Rust Programming Language)
- https://doc.rust-lang.org/std/ (Standard Library)
- https://crates.io (Package registry)

**Tauri:**
- https://tauri.app/docs/ (Official Docs)
- https://github.com/tauri-apps/tauri (GitHub)

**Comics/ZIP:**
- https://docs.rs/zip/ (zip crate docs)
- https://docs.rs/image/ (image crate docs)

---

**Documento gerado:** 2026-06-05
**Versão:** 1.0
**Status:** Pronto para implementação

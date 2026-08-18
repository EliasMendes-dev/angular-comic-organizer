# 📚 Comic Organizer

A powerful desktop utility for organizing and managing digital comic collections with batch processing, format conversion, and intelligent renaming—built with **Angular 22**, **Tauri**, and **Rust**.

---

## 🎯 Overview

**Comic Organizer** is a full-featured desktop application designed for comic book enthusiasts and collectors. It provides an intuitive interface for managing comic libraries, converting between CBZ and CBR formats, performing batch renaming operations, and organizing collections with standardized naming conventions.

### Key Highlights
- 📱 **Modern UI** – Angular 22 with standalone components and responsive design
- 🚀 **Desktop-Native Performance** – Tauri + Rust backend for fast, lightweight execution
- 📦 **Format Support** – CBZ/CBR conversion with batch processing capabilities
- 🏷️ **Smart Renaming** – Template-based batch renaming with intelligent file organization
- 🎨 **Visual Preview** – Real-time preview of comic collections with page-level management
- 💾 **Local-First** – All data stays on your machine; no cloud dependencies

---

## ✨ Current Features

- ✅ Browse and organize comic collections with visual previews
- ✅ Select and manage individual editions and pages
- ✅ Smart sorting and selection for large comic libraries
- ✅ Responsive interface with adaptive layouts (desktop/mobile)
- ✅ Standalone Angular components with modern architecture
- ✅ Drag & drop support via Angular CDK
- ✅ Lucide icons for intuitive visual feedback
- ✅ Tauri desktop integration with native file dialogs

---

## 🗂️ Planned Features

- 📦 CBZ file generation and packaging
- 📦 CBR format compatibility and conversion
- 🔄 Bidirectional format conversion (CBZ ↔ CBR)
- 🖼️ Image import support (.jpg, .png, .webp)
- 📚 Omnibus creation and custom collection building
- 🏷️ Intelligent batch renaming with custom templates
- 💾 Local configuration persistence
- 🧠 AI-powered metadata detection
- ⚡ Advanced batch processing with progress tracking
- 🔍 Library search and filtering
- 📊 Collection statistics and analytics

---

## 🏗️ Architecture

### Frontend Layer (TypeScript / Angular 22)
- **Framework:** Angular 22 with standalone components
- **Routing:** Angular Router for navigation
- **State Management:** Angular Signals for reactive state
- **UI Components:**
  - `FileExplorer` – Browse and select comics and pages
  - `ComicPreview` – Visual collection preview and management
  - `RenameSettings` – Configure batch renaming rules
  - `MenuBar` & `FooterBar` – Application navigation and actions
- **Dependencies:** Angular CDK, Angular Split, Lucide icons, RxJS

### Backend Layer (Rust / Tauri)
- **Desktop Runtime:** Tauri 2.x for cross-platform execution
- **Core Logic:** Rust backend for high-performance file operations
- **File Operations:**
  - Directory traversal and comic library detection
  - CBZ/CBR parsing and generation
  - Batch file processing and renaming
  - Image handling and compression
- **Libraries:** serde, rayon (parallel processing), unrar, mime_guess

### IPC Communication
- TypeScript frontend communicates with Rust backend via Tauri's command system
- Async message passing for non-blocking operations
- Native file dialogs for directory and file selection

---

## 💻 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Angular | 22.0.6 |
| **Language** | TypeScript | 6.0.3 |
| **Desktop Framework** | Tauri | 2.11.5 |
| **Backend** | Rust | 1.77.2+ |
| **UI Components** | Angular CDK | 22.0.4 |
| **Icons** | Lucide Angular | 1.23.0 |
| **Testing** | Vitest | 4.1.10 |
| **Formatting** | Prettier | 3.9.5 |

### Backend Dependencies
- `serde` / `serde_json` – Serialization framework
- `tauri-plugin-dialog` – Native file dialogs
- `tauri-plugin-log` – Structured logging
- `unrar` – RAR file handling
- `rayon` – Data parallelism
- `mime_guess` – File type detection

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ with npm 11+
- **Rust** 1.77.2+ (for backend development)
- **Tauri CLI** (installed via npm)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/EliasMendes-dev/angular-comic-organizer.git
   cd angular-comic-organizer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Tauri (if building desktop app):**
   ```bash
   npm install -D @tauri-apps/cli
   ```

### Development

#### Run in browser (Angular dev server):
```bash
npm start
```
Accessible at `http://localhost:4200`

#### Run as desktop app (Tauri):
```bash
npm run tauri dev
```
Or using the Tauri CLI directly:
```bash
npx tauri dev
```

### Build

#### Production Angular build:
```bash
npm run build
```

#### Production desktop application:
```bash
npm run tauri build
```

---

## 📁 Project Structure

```
angular-comic-organizer/
├── src/                          # Angular frontend source
│   ├── main.ts                   # Application bootstrap
│   ├── app/
│   │   ├── app.ts               # Root component
│   │   ├── app.routes.ts         # Route configuration
│   │   ├── components/           # Reusable UI components
│   │   │   ├── comic-preview/    # Collection preview
│   │   │   ├── file-explorer/    # File browser
│   │   │   ├── menu-bar/         # Navigation
│   │   │   ├── footer-bar/       # Status & actions
│   │   │   └── rename-settings/  # Rename configuration
│   │   ├── pages/
│   │   │   └── home/             # Main application page
│   │   └── services/
│   │       ├── file-manager.ts   # File operations service
│   │       └── conversion-state.ts # State management
│   └── styles/                   # Global styles
├── src-tauri/                    # Tauri backend (Rust)
│   ├── src/
│   │   ├── main.rs              # Tauri main process
│   │   ├── lib.rs               # Core library
│   │   └── commands/            # IPC command handlers
│   └── Cargo.toml               # Rust dependencies
├── angular.json                  # Angular configuration
├── package.json                  # Node dependencies
└── tsconfig.json                 # TypeScript config
```

---

## 🔄 Workflow

### Current Flow (Browser Mode)
1. Launch application in Angular dev server
2. Browse mock comic collection structure
3. Select editions and pages for management
4. Preview and test UI interactions
5. Layout automatically adapts to screen size

### Planned Flow (Desktop App)
1. Launch native desktop application
2. Use native file dialog to select local comic directory
3. Application scans and parses CBZ/CBR files and images
4. Metadata is extracted and displayed in organized interface
5. User performs operations (rename, convert, organize)
6. Backend processes files asynchronously with progress feedback
7. Library updates in real-time as operations complete

---

## 📊 Supported Formats

### CBZ (Comic Book Zip)
- **Format:** ZIP archive containing sequential images
- **Usage:** Primary format for this project
- **Example:** `Batman (2016) #001.cbz`

### CBR (Comic Book RAR - Compatible Mode)
- **Format:** ZIP archive with `.cbr` extension (not actual RAR compression)
- **Usage:** Cross-compatible format for broader reader support
- **Note:** Uses ZIP internally for simplicity and compatibility

### Image Imports (Planned)
- `.jpg` / `.jpeg` – JPEG images
- `.png` – PNG images with transparency
- `.webp` – Modern web image format

---

## 🗺️ Development Roadmap

### Phase 1: Desktop Foundation ✅ (In Progress)
- [x] Tauri integration and setup
- [x] Angular + Tauri communication
- [ ] Native window management
- [ ] File dialog integration

### Phase 2: Core Features 🔄
- [ ] Directory scanning and comic detection
- [ ] CBZ file parsing and extraction
- [ ] Image display and rendering
- [ ] Basic batch renaming

### Phase 3: Format Support
- [ ] CBZ generation from image sequences
- [ ] CBR compatibility mode
- [ ] Format conversion (CBZ ↔ CBR)
- [ ] Archive validation

### Phase 4: Advanced Features
- [ ] Omnibus/collection creation
- [ ] Metadata extraction and management
- [ ] Search and filtering system
- [ ] Collection statistics dashboard

### Phase 5: Optimization & Distribution
- [ ] Performance optimization
- [ ] Windows executable packaging
- [ ] Linux support (experimental)
- [ ] macOS support (experimental)
- [ ] Auto-update mechanism

---

## 🛠️ Development Guide

### Running Tests
```bash
npm test
```

### Code Formatting
```bash
npm run format  # Format with Prettier
npm run lint    # (if linter configured)
```

### Building for Production
```bash
npm run build          # Build Angular
npx tauri build        # Build desktop app
```

### Debugging
- **Frontend:** Chrome DevTools via Angular dev server
- **Backend:** Rust debug logging via `tauri-plugin-log`
- **Tauri Windows:** Use Tauri's webview developer tools

---

## 🤝 Contributing

This project is developed primarily for personal use, but contributions are welcome! 

Areas for contribution:
- UI/UX improvements
- Performance optimization
- Format support expansion
- Platform-specific fixes
- Documentation

---

## 📝 Notes

- **Current Status:** UI-first development with simulated data
- **Backend:** Real file operations will be handled by Tauri/Rust
- **UI Isolation:** Frontend remains decoupled from backend implementation
- **Data Security:** All files processed locally; no cloud services
- **Desktop-Only:** Optimized for desktop; mobile support secondary

---

## 📄 License

Licensed under the **MIT License** – see LICENSE file for details.

---

## 👨‍💻 Author

Developed by **José Elias**  
GitHub: [@EliasMendes-dev](https://github.com/EliasMendes-dev)

---

## 🔗 Resources

- [Angular Documentation](https://angular.io/docs)
- [Tauri Documentation](https://tauri.app/docs/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [CBZ Format Specification](https://en.wikipedia.org/wiki/Comic_book_archive)


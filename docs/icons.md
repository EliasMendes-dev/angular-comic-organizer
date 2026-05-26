# 📦 Lucide Angular Icons — Tutorial de Uso

Este projeto utiliza a biblioteca oficial do Lucide para Angular.

Os ícones são SVGs leves, customizáveis e tree-shakeable, compatíveis com Angular 17+ e Standalone Components.

---

# 🚀 Instalação

Instale o pacote:

```bash
npm install @lucide/angular
```

ou

```bash
yarn add @lucide/angular
```

ou

```bash
pnpm add @lucide/angular
```

---

# 📥 Importando Ícones

Os ícones são importados como componentes standalone diretamente do pacote:

```ts
import {
  LucideBookOpen,
  LucidePlus,
  LucideMoon,
  LucideSun
} from '@lucide/angular';
```

---

# 🧩 Como Usar (Standalone Components)

## Component

```ts
import { Component } from '@angular/core';
import {
  LucideBookOpen,
  LucidePlus,
} from '@lucide/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    LucideBookOpen,
    LucidePlus,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {}
```

---

## HTML

```html
<svg lucideBookOpen></svg>

<svg lucidePlus></svg>
```

---

# ⚙️ Inputs Disponíveis

| Input | Tipo | Padrão | Descrição |
|---|---|---|---|
| `size` | number | `24` | Define o tamanho do ícone |
| `color` | string | `currentColor` | Cor do ícone |
| `strokeWidth` | number | `2` | Espessura da linha |
| `absoluteStrokeWidth` | boolean | `false` | Usa stroke-width absoluto |
| `title` | string | `null` | Título para acessibilidade (atributo SVG) |

**Nota:** Todos os atributos SVG padrão também podem ser aplicados.

---

# 📚 Ícones Utilizados no Projeto

| Ícone | Import |
|---|---|
| `BookOpen` | `import { LucideBookOpen } from '@lucide/angular'` |
| `Plus` | `import { LucidePlus } from '@lucide/angular'` |
| `ChevronDown` | `import { LucideChevronDown } from '@lucide/angular'` |
| `Moon` | `import { LucideMoon } from '@lucide/angular'` |
| `Sun` | `import { LucideSun } from '@lucide/angular'` |
| `Folder` | `import { LucideFolder } from '@lucide/angular'` |
| `Trash2` | `import { LucideTrash2 } from '@lucide/angular'` |
| `CheckSquare` | `import { LucideCheckSquare } from '@lucide/angular'` |
| `Square` | `import { LucideSquare } from '@lucide/angular'` |
| `CloudUpload` | `import { LucideCloudUpload } from '@lucide/angular'` |
| `ImageIcon` | `import { LucideImageIcon } from '@lucide/angular'` |
| `Settings` | `import { LucideSettings } from '@lucide/angular'` |
| `Eye` | `import { LucideEye } from '@lucide/angular'` |
| `Edit3` | `import { LucideEdit3 } from '@lucide/angular'` |
| `FileArchive` | `import { LucideFileArchive } from '@lucide/angular'` |
| `Layers` | `import { LucideLayers } from '@lucide/angular'` |
| `ArrowRight` | `import { LucideArrowRight } from '@lucide/angular'` |
| `ChevronLeft` | `import { LucideChevronLeft } from '@lucide/angular'` |
| `ChevronRight` | `import { LucideChevronRight } from '@lucide/angular'` |
| `ZoomIn` | `import { LucideZoomIn } from '@lucide/angular'` |
| `ZoomOut` | `import { LucideZoomOut } from '@lucide/angular'` |
| `RotateCw` | `import { LucideRotateCw } from '@lucide/angular'` |

---

# 🖼️ Exemplos Reais do Projeto

## Menu Bar

### menu-bar.ts

```ts
import { Component } from '@angular/core';
import {
  LucideBookOpen,
  LucidePlus,
  LucideChevronDown
} from '@lucide/angular';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [
    LucideBookOpen,
    LucidePlus,
    LucideChevronDown
  ],
  templateUrl: './menu-bar.html',
  styleUrl: './menu-bar.css',
})
export class MenuBar {}
```

---

### menu-bar.html

```html
<header>
  <svg lucideBookOpen [size]="28"></svg>

  <button>
    <svg lucidePlus [size]="18"></svg>
    Add Folder
  </button>

  <svg lucideChevronDown [size]="16"></svg>
</header>
```

---

# 🌙 Theme Toggle

## theme-toggle.ts

```ts
import { Component, Input } from '@angular/core';
import {
  LucideMoon,
  LucideSun
} from '@lucide/angular';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [
    LucideMoon,
    LucideSun
  ],
  templateUrl: './theme-toggle.html',
})
export class ThemeToggleComponent {
  @Input() darkMode = false;
}
```

---

## theme-toggle.html

```html
<svg
  *ngIf="darkMode"
  lucideSun
  [size]="20">
</svg>

<svg
  *ngIf="!darkMode"
  lucideMoon
  [size]="20">
</svg>
```

---

# 📂 File Explorer

### file-explorer.ts

```ts
import { Component } from '@angular/core';
import {
  LucideFolder,
  LucideTrash2,
  LucideCheckSquare,
  LucideSquare,
  LucideCloudUpload,
} from '@lucide/angular';

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [
    LucideFolder,
    LucideTrash2,
    LucideCheckSquare,
    LucideSquare,
    LucideCloudUpload,
  ],
  templateUrl: './file-explorer.html',
})
export class FileExplorer {}
```

---

# 🖼️ Image Preview

### comic-preview.ts

```ts
import { Component } from '@angular/core';
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideZoomIn,
  LucideZoomOut,
  LucideRotateCw,
} from '@lucide/angular';

@Component({
  selector: 'app-comic-preview',
  standalone: true,
  imports: [
    LucideChevronLeft,
    LucideChevronRight,
    LucideZoomIn,
    LucideZoomOut,
    LucideRotateCw,
  ],
  templateUrl: './comic-preview.html',
})
export class ComicPreview {}
```

---

# 🎨 Exemplos de Uso

## Com Tamanho Customizado

```html
<svg lucideBookOpen [size]="48"></svg>
```

## Com Cor Customizada

```html
<svg lucideBookOpen color="red"></svg>
```

## Com Largura de Traço Customizada

```html
<svg lucideBookOpen [strokeWidth]="1.5"></svg>
```

## Com Título (Acessibilidade)

```html
<svg lucideBookOpen title="Ícone de livro aberto"></svg>
```

## Combinando Propriedades

```html
<svg
  lucidePlus
  [size]="24"
  color="green"
  [strokeWidth]="3"
  title="Adicionar item">
</svg>
```

---

# 🎨 Estilizando com CSS

```css
.icon {
  width: 20px;
  height: 20px;
  color: #ffffff;
}
```

Uso:

```html
<svg lucideBookOpen class="icon"></svg>
```

---

# 🌙 Compatibilidade com Dark Mode

Os ícones do Lucide utilizam `currentColor` por padrão, então acompanham automaticamente a cor do texto:

```css
button {
  color: white;
}
```

```html
<svg lucidePlus></svg>
```

O ícone será renderizado em branco!

---

# ⚠️ Importante Sobre Angular Standalone

Em aplicações Angular modernas (17+):

- Utilize `standalone: true`
- Importe os ícones diretamente como componentes
- Adicione-os à array `imports: []`
- Use a sintaxe `<svg lucideIconName></svg>`

Exemplo completo:

```ts
import { Component } from '@angular/core';
import { LucideBookOpen, LucidePlus } from '@lucide/angular';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [LucideBookOpen, LucidePlus],
  template: `
    <svg lucideBookOpen [size]="24"></svg>
    <svg lucidePlus [size]="20"></svg>
  `
})
export class ExampleComponent {}
```

---

# 📖 Documentação Oficial

- https://lucide.dev/guide/packages/lucide-angular
- https://lucide.dev/icons
- https://angular.dev/guide/components

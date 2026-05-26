# Angular Split — Guia Completo

Guia completo para instalar e utilizar a biblioteca angular-split no Angular.

---

# O que é?

`angular-split` é uma biblioteca Angular para criar layouts redimensionáveis com painéis arrastáveis (“split panes”).

Ela permite criar interfaces parecidas com:
- VS Code
- IDEs
- dashboards
- apps com sidebar
- layouts com divisões ajustáveis

Exemplo:

```text
┌──────────────┬──────────────┐
│              │              │
│   Sidebar    │   Conteúdo   │
│              │              │
├──────────────┴──────────────┤
│         Console             │
└─────────────────────────────┘
```

---

# Instalação

## 1. Instale a biblioteca

No terminal do projeto Angular:

```bash
npm install angular-split
```

---

# Configuração

## Standalone Components (Angular moderno)

No componente:

```ts
import { Component } from '@angular/core';
import {
  SplitComponent,
  SplitAreaComponent
} from 'angular-split';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    SplitComponent,
    SplitAreaComponent
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {}
```

---

## Angular com NgModule

No `app.module.ts`:

```ts
import { AngularSplitModule } from 'angular-split';

@NgModule({
  imports: [
    AngularSplitModule
  ]
})
export class AppModule {}
```

---

# Primeiro Exemplo

## HTML

```html
<as-split direction="horizontal">

  <as-split-area [size]="30">
    <div class="panel">
      Sidebar
    </div>
  </as-split-area>

  <as-split-area [size]="70">
    <div class="panel">
      Conteúdo
    </div>
  </as-split-area>

</as-split>
```

---

## CSS

```css
as-split {
  height: 100vh;
}

.panel {
  height: 100%;
  padding: 1rem;
  box-sizing: border-box;
}
```

---

# Resultado

- painel esquerdo: 30%
- painel direito: 70%
- usuário pode arrastar a barra
- tamanhos mudam dinamicamente

---

# Direções

## Horizontal

Painéis lado a lado:

```html
<as-split direction="horizontal">
```

Resultado:

```text
[A] | [B]
```

---

## Vertical

Painéis um acima do outro:

```html
<as-split direction="vertical">
```

Resultado:

```text
[A]
---
[B]
```

---

# Tamanho Inicial

Use `[size]`:

```html
<as-split-area [size]="40">
```

---

# Tamanho Mínimo

Evita que o painel fique pequeno demais:

```html
<as-split-area
  [size]="30"
  [minSize]="20"
>
```

---

# Tamanho Máximo

```html
<as-split-area
  [size]="30"
  [maxSize]="50"
>
```

---

# Trabalhando com 3 Componentes

## Exemplo simples

```html
<as-split direction="horizontal">

  <as-split-area [size]="20">
    <app-sidebar />
  </as-split-area>

  <as-split-area [size]="50">
    <app-main />
  </as-split-area>

  <as-split-area [size]="30">
    <app-chat />
  </as-split-area>

</as-split>
```

---

# Split dentro de Split (Nested Split)

Muito usado em interfaces complexas.

## Exemplo

```html
<as-split direction="horizontal">

  <as-split-area [size]="30">
    <app-sidebar />
  </as-split-area>

  <as-split-area [size]="70">

    <as-split direction="vertical">

      <as-split-area [size]="70">
        <app-editor />
      </as-split-area>

      <as-split-area [size]="30">
        <app-console />
      </as-split-area>

    </as-split>

  </as-split-area>

</as-split>
```

---

# Responsividade

Você pode mudar direção dependendo da tela.

## HTML

```html
<as-split [direction]="isMobile ? 'vertical' : 'horizontal'">
```

---

## TypeScript

```ts
isMobile = window.innerWidth < 768;
```

---

# Melhor Forma — BreakpointObserver

Instale Angular CDK:

```bash
npm install @angular/cdk
```

---

## TS

```ts
import { BreakpointObserver } from '@angular/cdk/layout';

constructor(private breakpoint: BreakpointObserver) {

  this.breakpoint
    .observe(['(max-width: 768px)'])
    .subscribe(result => {
      this.isMobile = result.matches;
    });

}
```

---

# Eventos

## Detectar redimensionamento

```html
<as-split
  (dragEnd)="onDragEnd($event)"
>
```

---

## TS

```ts
onDragEnd(event: any) {
  console.log(event);
}
```

---

# Estilizando a Barra

## CSS

```css
.as-split-gutter {
  background-color: #444;
}

.as-split-gutter:hover {
  background-color: #777;
}
```

---

# Definindo Altura Correta

MUITO importante.

Sem altura, o split pode não aparecer corretamente.

## Recomendado

```css
html,
body {
  height: 100%;
  margin: 0;
}

app-root {
  display: block;
  height: 100%;
}

as-split {
  height: 100%;
}
```

---

# Problemas Comuns

## Split não aparece

Normalmente:
- faltou altura (`height`)
- CSS do container está errado

---

## Não consigo arrastar

Verifique:
- se existe espaço suficiente
- `minSize`
- algum elemento cobrindo a gutter

---

## Painéis somem

Defina:
- `minSize`
- `overflow`

Exemplo:

```css
.panel {
  overflow: auto;
}
```

---

# Exemplo Completo

## HTML

```html
<as-split
  direction="horizontal"
  style="height: 100vh"
>

  <as-split-area
    [size]="25"
    [minSize]="15"
  >
    <div class="panel">
      Sidebar
    </div>
  </as-split-area>

  <as-split-area
    [size]="75"
    [minSize]="40"
  >

    <as-split direction="vertical">

      <as-split-area [size]="70">
        <div class="panel">
          Conteúdo
        </div>
      </as-split-area>

      <as-split-area [size]="30">
        <div class="panel">
          Console
        </div>
      </as-split-area>

    </as-split>

  </as-split-area>

</as-split>
```

---

# Links Oficiais

- https://angular-split.github.io/
- https://github.com/angular-split/angular-split
- https://www.npmjs.com/package/angular-split

---

# Vale a pena usar?

Sim, principalmente se você quer:
- layouts profissionais
- painéis redimensionáveis
- UX parecida com IDE
- dashboards complexos
- evitar implementar drag manualmente

Ela é bem mais limpa e robusta do que fazer tudo na mão com `mousemove`.

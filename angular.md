# 📚 Diretivas Angular

Projeto de estudos sobre Diretivas Angular, utilizando versões modernas e antigas das diretivas estruturais e de atributo.

---

# 🚀 Criando Projeto Angular

## ✅ Instalar Angular CLI

Instala a ferramenta global do Angular para criação e gerenciamento de projetos.

```bash
npm install -g @angular/cli
```

---

## ✅ Criar Projeto Angular

Cria um novo projeto Angular.

```bash
ng new diretivas-proj
```

---

## ✅ Entrar na Pasta do Projeto

Acessa a pasta do projeto criado.

```bash
cd diretivas-proj
```

---

## ✅ Rodar Projeto Angular

Inicia o servidor local de desenvolvimento.

```bash
ng serve
```

ou versão curta:

```bash
ng s
```

Projeto disponível em:

```text
http://localhost:4200
```

---

# 📦 Angular CLI

## ✅ Criar Componente

Cria um novo componente Angular.

```bash
ng g c components/comp-atributos
```

---

## ✅ Criar Service

Cria um service para lógica e comunicação de dados.

```bash
ng g s services/api
```

---

## ✅ Criar Interface

Cria uma interface TypeScript.

```bash
ng g interface models/user
```

---

## ✅ Criar Guard

Cria um guard para proteção de rotas.

```bash
ng g guard guards/auth
```

---

## ✅ Criar Pipe

Cria um pipe personalizado.

```bash
ng g pipe pipes/currency
```

---

## ✅ Criar Diretiva

Cria uma diretiva personalizada.

```bash
ng g directive directives/highlight
```

---

## ✅ Build de Produção

Gera a versão otimizada da aplicação para deploy.

```bash
ng build
```

---

## ✅ Build Otimizada

Executa build utilizando a configuração de produção.

```bash
ng build --configuration production
```

---

## ✅ Verificar Versão do Angular

Mostra a versão instalada do Angular CLI e do projeto.

```bash
ng version
```

ou:

```bash
ng v
```

---

# 🧱 Diretivas Estruturais

---

# ✅ ngIf (Angular Antigo)

Renderiza elementos condicionalmente.

```html
<div *ngIf="isLogged">
  Usuário logado
</div>
```

---

# ✅ @if (Angular Moderno 17+)

Nova sintaxe moderna que substitui `*ngIf`.

```html
@if (isLogged) {
  <div>Usuário logado</div>
}
```

---

# ✅ ngIf com else (Antigo)

Renderiza um bloco alternativo caso a condição seja falsa.

```html
<div *ngIf="isLogged; else loginTemplate">
  Bem-vindo
</div>

<ng-template #loginTemplate>
  Faça login
</ng-template>
```

---

# ✅ @if com else (Moderno)

Versão moderna do `ngIf else`.

```html
@if (isLogged) {
  <div>Bem-vindo</div>
} @else {
  <div>Faça login</div>
}
```

---

# ✅ ng-template

Cria templates ocultos reutilizáveis no Angular.

```html
<ng-template #meuTemplate>
  Conteúdo do template
</ng-template>
```

---

# ✅ ngFor (Angular Antigo)

Renderiza listas utilizando repetição.

```html
<li *ngFor="let item of items">
  {{ item }}
</li>
```

---

# ✅ @for (Angular Moderno 17+)

Nova sintaxe moderna para repetição.

```html
@for (item of items; track item) {
  <li>{{ item }}</li>
}
```

---

# ✅ ngFor com index (Antigo)

Obtém o índice do elemento durante a repetição.

```html
<li *ngFor="let item of items; let i = index">
  {{ i }} - {{ item }}
</li>
```

---

# ✅ @for com index (Moderno)

Versão moderna utilizando `$index`.

```html
@for (item of items; track item; let i = $index) {
  <li>{{ i }} - {{ item }}</li>
}
```

---

# ✅ ngSwitch (Antigo)

Renderiza elementos com base em múltiplas condições.

```html
<div [ngSwitch]="status">

  <p *ngSwitchCase="'loading'">
    Carregando...
  </p>

  <p *ngSwitchCase="'success'">
    Sucesso
  </p>

  <p *ngSwitchDefault>
    Erro
  </p>

</div>
```

---

# ✅ @switch (Angular Moderno 17+)

Nova sintaxe moderna do switch.

```html
@switch (status) {

  @case ('loading') {
    <p>Carregando...</p>
  }

  @case ('success') {
    <p>Sucesso</p>
  }

  @default {
    <p>Erro</p>
  }

}
```

---

# 🎨 Diretivas de Atributo

---

# ✅ ngClass

Adiciona ou remove classes CSS dinamicamente.

```html
<div [ngClass]="{
  active: isActive,
  disabled: isDisabled
}">
  Conteúdo
</div>
```

---

# ✅ ngStyle

Aplica estilos CSS dinamicamente.

```html
<div [ngStyle]="{
  'background-color': bgColor,
  color: textColor
}">
  Texto
</div>
```

---

# ✅ ngModel

Realiza two-way data binding entre HTML e TypeScript.

## app.config.ts

```ts
import { provideForms } from '@angular/forms';

export const appConfig: ApplicationConfig = {
  providers: [
    provideForms()
  ]
};
```

---

## HTML

```html
<input
  type="text"
  [(ngModel)]="name"
/>

<p>{{ name }}</p>
```

---

# ✅ ngTemplateOutlet

Renderiza templates dinamicamente.

```html
<ng-container
  *ngTemplateOutlet="meuTemplate">
</ng-container>

<ng-template #meuTemplate>
  <p>Template renderizado</p>
</ng-template>
```

---

# ✅ ng-content

Permite projeção de conteúdo entre componentes.

---

## Componente Filho

```html
<div class="card">
  <ng-content></ng-content>
</div>
```

---

## Componente Pai

```html
<app-card>
  <h1>Título</h1>
  <p>Descrição</p>
</app-card>
```

---

# ⚠️ CommonModule

Necessário para utilizar diretivas antigas como:

- `*ngIf`
- `*ngFor`
- `ngClass`
- `ngStyle`

## Exemplo

```ts
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule]
})
```

---

# 🚀 Angular Moderno

Angular 17+ introduziu:

- `@if`
- `@for`
- `@switch`

Vantagens:

- Melhor performance
- Sintaxe mais limpa
- Não precisa importar `CommonModule`
- Melhor legibilidade

---

# 📌 Observações

Projetos Angular modernos utilizam:

- Standalone Components
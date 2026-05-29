# @angular/cdk/drag-drop

Esta biblioteca do Angular CDK permite criar listas arrastáveis, reorderenação visual e previews customizados para explorar itens como arquivos, cards e edições.

---

## 1. Instalação

Adicione o pacote ao projeto Angular:

```bash
npm install @angular/cdk
```

Se o projeto já estiver usando o Angular CDK, a importação pode ser feita diretamente no componente.

---

## 2. Importação básica

```ts
import { CdkDrag, CdkDropList, CdkDragHandle, CdkDragPreview } from '@angular/cdk/drag-drop';
```

Exemplo de uso no componente:

```ts
@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CdkDragHandle, CdkDragPreview],
})
export class FileExplorer {}
```

---

## 3. Exemplo de uso

```html
<div class="file-explorer" cdkDropList (cdkDropListDropped)="drop($event)">
  <div class="file-edition" cdkDrag [cdkDragDisabled]="fileEditions.length < 2">
    <ng-template cdkDragPreview>
      <div class="drag-preview">{{ edition.title }}</div>
    </ng-template>

    <button class="file-grip" cdkDragHandle>☰</button>
    <span>{{ edition.title }}</span>
  </div>
</div>
```

---

## 4. Propriedades úteis

### cdkDropList
- `(cdkDropListDropped)`: dispara quando um item é solto.
- `cdkDropListSortingDisabled`: desativa a ordenação automática da lista.

### cdkDrag
- `cdkDragDisabled`: desativa o arraste de um item.
- `cdkDragPreview`: define um template visual customizado durante o arraste.

### cdkDragHandle
- Define a área que inicia o drag.
- Útil para manter o item arrastável apenas por um botão ou grip.

---

## 5. Configurações de estilo recomendadas

```css
.cdk-drag-placeholder {
  opacity: 0.25;
}

.cdk-drag-animating {
  transition: transform 200ms ease;
}

.drag-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--fundo-secundario);
  border: 1px solid var(--verde-primario);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}
```

---

## 6. Dicas de uso

- Use `cdkDragDisabled` quando a lista estiver com apenas um item.
- Use `cdkDragPreview` para mostrar um preview profissional enquanto arrasta.
- Combine `cdkDragHandle` com um grip visual para melhorar a usabilidade.

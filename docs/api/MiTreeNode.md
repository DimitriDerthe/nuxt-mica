# MiTreeNode

Internal recursive row of MiTree: one treeitem with its toggle, optional checkbox, icon and label, plus its animated child group.

Group: Content. Source: app/components/Content/MiTreeNode.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| item* | MiTreeItem |  | The item this row renders. |
| level* | number |  | One-based depth of the row. |
| ctx* | MiTreeContext |  | Shared state and handlers provided by the owning MiTree. |
| setSize* | number |  | Number of siblings, for `aria-setsize`. |
| posInSet* | number |  | One-based position among siblings, for `aria-posinset`. |

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiTreeItem { id: MiTreeId; label: string; icon?: MiIconName; children?: MiTreeItem[]; disabled?: boolean }
interface MiTreeContext { selected: Set<MiTreeId>; expanded: Set<MiTreeId>; checks: Map<MiTreeId, MiTreeCheck>; checkable: boolean; focusId: MiTreeId | null; focus: (id: MiTreeId) => void; toggle: (id: MiTreeId) => void; activate: (item: MiTreeItem) => void }
type MiTreeId = string | number
type MiIconName = 'widgets' | 'home' | 'folder' | 'folder-compact' | 'folder-plus' | 'tray' | 'calendar' | 'people' | 'settings' | 'billing' | 'search' | 'grid' | 'list-bullet' | 'list-dots' | 'bell' | 'plus' | 'minus' | 'dash' | 'star' | 'bookmark' | 'share' | 'sliders' | 'chevron-right' | 'chevron-left' | 'chevron-down' | 'chevron-up' | 'chevron-up-down' | 'trash' | 'heart' | 'close' | 'more' | 'sidebar' | 'columns' | 'align-left' | 'align-center' | 'align-right' | 'spinner-arc' | 'arc' | 'spinner' | 'arrow-up' | 'arrow-down' | 'arrow-left' | 'arrow-right' | 'moon' | 'sun' | 'desktop' | 'eye' | 'globe' | 'archive' | 'image' | 'check' | 'person' | 'person-fill' | 'document' | 'wifi' | 'bluetooth' | 'lock' | 'speaker' | 'speaker-wave' | 'copy' | 'pencil' | 'chat' | 'info-circle' | 'check-circle' | 'exclamation-circle' | 'warning' | 'check-circle-fill' | 'x-circle-fill'
type MiTreeCheck = 'checked' | 'mixed' | 'none'
```

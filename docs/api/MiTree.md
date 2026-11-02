# MiTree

Hierarchical tree view with expandable branches, single or multiple selection, optional checkboxes with mixed parents, and full WAI-ARIA keyboard support with type-ahead.

Group: Content. Source: app/components/Content/MiTree.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| items* | MiTreeItem[] |  | Root nodes. Each node has an `id`, a `label`, and optional `icon`, `children` and `disabled`. |
| multiple | boolean |  | Allow several selected nodes; the `selected` model is then an array. |
| checkable | boolean |  | Show a checkbox per node. Parents show a mixed state; the `selected` model (always an array) holds the checked leaves. |
| ariaLabel | string | "Tree" | Accessible name of the tree. |
| selected | null \| string \| number \| MiTreeId[] |  | Selected node id, or an array of ids with `multiple` or `checkable`. |
| expanded | MiTreeId[] | [] | Ids of the expanded branches. |

## Emits

- update:selected [value: MiTreeId | MiTreeId[] | null | undefined]
- update:expanded [value: MiTreeId[]]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiTreeItem { id: MiTreeId; label: string; icon?: MiIconName; children?: MiTreeItem[]; disabled?: boolean }
type MiTreeId = string | number
type MiIconName = 'widgets' | 'home' | 'folder' | 'folder-compact' | 'folder-plus' | 'tray' | 'calendar' | 'people' | 'settings' | 'billing' | 'search' | 'grid' | 'list-bullet' | 'list-dots' | 'bell' | 'plus' | 'minus' | 'dash' | 'star' | 'bookmark' | 'share' | 'sliders' | 'chevron-right' | 'chevron-left' | 'chevron-down' | 'chevron-up' | 'chevron-up-down' | 'trash' | 'heart' | 'close' | 'more' | 'sidebar' | 'columns' | 'align-left' | 'align-center' | 'align-right' | 'spinner-arc' | 'arc' | 'spinner' | 'arrow-up' | 'arrow-down' | 'arrow-left' | 'arrow-right' | 'moon' | 'sun' | 'desktop' | 'eye' | 'globe' | 'archive' | 'image' | 'check' | 'person' | 'person-fill' | 'document' | 'wifi' | 'bluetooth' | 'lock' | 'speaker' | 'speaker-wave' | 'copy' | 'pencil' | 'chat' | 'info-circle' | 'check-circle' | 'exclamation-circle' | 'warning' | 'check-circle-fill' | 'x-circle-fill'
```

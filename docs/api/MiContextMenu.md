# MiContextMenu

Action menu opened from right-click, long-press or keyboard on its default slot; `inline` renders it in place.

Group: Feedback. Source: app/components/Feedback/MiContextMenu.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| items* | { id: string; label?: string; icon?: MiFbIconName; shortcut?: string; type?: "separator" \| "item" \| "checkbox"; checked?: boolean; destructive?: boolean; disabled?: boolean; children?: MiContextMenuItem[] }[] |  | Menu entries; `disabled` entries are skipped by keyboard navigation. |
| label | string | "Menu" | Accessible name of the menu. |
| width | number | 260 | Menu width in px. |
| inline | boolean |  | Render the menu in place (no teleport, no trigger handling). |
| highlighted | string |  | Item id shown highlighted in `inline` mode. |
| disabled | boolean |  | Disable the contextmenu / long-press / keyboard trigger on the default slot. |
| modelValue | boolean | false | Whether the menu is open. |

## Slots

- default: Area that opens the menu on right-click, long-press or keyboard (Shift+F10 / context key).

## Emits

- update:modelValue [value: boolean]
- close []
- select [id: string, item: MiContextMenuItem]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiFbIconName = 'info' | 'success' | 'warning' | 'danger' | 'calendar' | 'comment' | 'bell' | 'folder' | 'folder-plus' | 'document' | 'eye' | 'duplicate' | 'pencil' | 'check' | 'chevron-right' | 'trash' | 'close' | 'inbox' | 'share' | 'search' | 'link'
interface MiContextMenuItem { id: string; label?: string; icon?: MiFbIconName; /** Right aligned hint such as `⌘D`; pressing it selects the item while the menu is open. Bare Enter, Space, Tab, Esc and arrows are ignored. */ shortcut?: string; type?: 'item' | 'checkbox' | 'separator'; checked?: boolean; destructive?: boolean; disabled?: boolean; /** Nested items open a submenu. */ children?: MiContextMenuItem[] }
```

## Exposed (template ref)

- openAt: (x: number, y: number, byKeyboard?: boolean) => void
- close: () => void

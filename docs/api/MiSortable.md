# MiSortable

Drag-and-drop reorderable list with no dependencies: pointer drag with a placeholder and auto-scroll, plus keyboard reordering with live announcements; v-model is the array of items.

Group: Content. Source: app/components/Content/MiSortable.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| itemKey | string | "id" | Field of each item used as its unique key (primitive items use themselves). |
| handle | boolean |  | Show a dedicated drag handle per row; only the handle starts a drag and takes keyboard focus. Recommended on touch screens. Without it the whole row drags. |
| orientation | "horizontal" \| "vertical" | "vertical" | `vertical` stacks rows, `horizontal` lays them out in a row. |
| gap | number | 8 | Gap between rows in px. |
| autoScroll | boolean | true | Scroll the nearest scrollable ancestor while dragging near its edge. |
| disabled | boolean |  | Turns off dragging and keyboard reordering. |
| bare | boolean |  | Rows without their card shell (no background, shadow or rounding) so the slot draws its own row; the dragged row still lifts. |
| ariaLabel | string | "Sortable list" | Accessible name of the list. |
| itemLabel | (item: MiSortableItem, index: number): string |  | Returns the spoken name of an item in announcements and handle labels. Defaults to "Item N". |
| modelValue | MiSortableItem[] | [] | The ordered items. Updated on drop (pointer) or on every step (keyboard). |

## Slots

- default `{ item: MiSortableItem; index: number; dragging: boolean }`: Row content for each item.
- handle `{ item: MiSortableItem; index: number; dragging: boolean }`: Replaces the grip glyph inside the drag handle (only with `handle`).

## Emits

- update:modelValue [value: MiSortableItem[]]
- reorder [move: { from: number; to: number; }]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiSortableItem = Record<string, any>
```

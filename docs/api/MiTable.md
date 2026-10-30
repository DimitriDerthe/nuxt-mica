# MiTable

Data table with sorting, row selection, sticky header, zebra rows and virtualization from 50 rows. Use for structured tabular data.

Group: Content. Source: app/components/Content/MiTable.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| columns* | { key: string; label: string; align?: "start" \| "center" \| "end"; sortable?: boolean; sortBy?: (row: Record<string, unknown>): string \| number; width?: string; muted?: boolean; numeric?: boolean }[] |  | Column definitions: key, label, alignment, sorting and width. |
| rows* | MiTableRow[] |  | Row objects; each column reads `row[key]`. |
| rowKey | string | "id" | Field holding a unique id for each row. |
| selectable | false \| "multiple" \| "single" | false | `single` or `multiple` row selection (checkbox column for multiple). `false` disables it. |
| zebra | boolean | true | Alternating row backgrounds. |
| stickyHeader | boolean | true | Keep the header visible while the body scrolls (requires `maxHeight`). |
| maxHeight | string |  | CSS max-height of the scroll area, e.g. `400px`. Needed for the sticky header. |
| density | "regular" \| "compact" \| "relaxed" | "regular" | Row height: compact 28px, regular 34px, relaxed 44px. |
| caption | string |  | Accessible table caption (visually hidden). |
| manualSort | boolean |  | Skip internal sorting and only emit `update:sort`. |
| emptyText | string | "No results" | Message shown when there are no rows. |
| virtualize | boolean |  | Force `content-visibility` on/off; by default enabled from 50 rows. |
| selected | string[] | [] | Selected row ids. |
| sort | null \| MiTableSort | null | Active sort. |

## Slots

- empty: Content shown instead of `emptyText` when there are no rows.
- cell `{ row: MiTableRow; column: MiTableColumn; value: unknown; selected: boolean; index: number }`: Custom cell content for every column without a specific `cell-<key>` slot.

## Emits

- update:selected [value: string[]]
- update:sort [value: MiTableSort | null]
- row-click [row: MiTableRow, ev: MouseEvent | KeyboardEvent]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiTableRow = Record<string, unknown>
interface MiTableSort { key: string; dir: 'asc' | 'desc' }
interface MiTableColumn { key: string; label: string; align?: 'start' | 'center' | 'end'; sortable?: boolean; /** Custom sort value extractor. Defaults to `row[key]`. */ sortBy?: (row: Record<string, unknown>) => string | number; /** CSS width of the column, e.g. `120px`. */ width?: string; /** Render the cells with the secondary label color. */ muted?: boolean; /** Use tabular figures (numbers). */ numeric?: boolean }
```

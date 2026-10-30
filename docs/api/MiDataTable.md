# MiDataTable

Data table with global filter, sortable columns, pagination and row selection, built on MiTable and MiPagination. Cells are customised with `cell-<key>` slots.

Group: Content. Source: app/components/Content/MiDataTable.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| columns* | { key: string; label: string; align?: "start" \| "center" \| "end"; sortable?: boolean; sortBy?: (row: Record<string, unknown>): string \| number; width?: string; muted?: boolean; numeric?: boolean }[] |  | Column definitions: key, label, alignment, sorting and width. |
| rows* | MiTableRow[] |  | Row objects; each column reads `row[key]`. |
| rowKey | string | "id" | Field holding a unique id for each row. |
| filterable | boolean | true | Show the filter input. |
| filterPlaceholder | string | "Filter..." | Placeholder of the filter input. |
| filterKey | string |  | Filter only this column key (shadcn column filter); overrides `filterKeys`. |
| columnToggle | boolean |  | Show a Columns menu to toggle column visibility. |
| filterKeys | string[] |  | Restrict filtering to these column keys (default: all columns). |
| pageSize | number | 10 | Rows per page. |
| selectable | false \| "multiple" \| "single" | false | Row selection mode. |
| emptyText | string | "No results" | Text shown when no row matches. |
| caption | string |  | Accessible table caption. |
| selected | string[] | [] | Selected row ids. |
| sort | null \| MiTableSort | null | Active sort. |
| filter | string | "" | Filter text. |
| page | number | 1 | Current page, 1-based. |
| hidden | string[] | [] | Keys of hidden columns. |

## Slots

- toolbar: Content placed in the toolbar beside the filter input.
- empty: Content shown instead of `emptyText` when no row matches.

## Emits

- update:selected [value: string[]]
- update:sort [value: MiTableSort | null]
- update:filter [value: string]
- update:page [value: number]
- update:hidden [value: string[]]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiTableRow = Record<string, unknown>
interface MiTableSort { key: string; dir: 'asc' | 'desc' }
```

# MiPagination

Page navigator with arrows, windowed page numbers and ellipses; v-model is the 1-based current page.

Group: Navigation. Source: app/components/Navigation/MiPagination.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| total* | number |  | Total number of pages. |
| siblings | number | 1 | Page numbers shown on each side of the current page before the rest collapse into ellipses. |
| summary | boolean | true | Show the "Page x of y" caption. |
| compact | boolean \| "auto" | "auto" | `auto` drops sibling pages, then switches to the "3 / 24" form, when the row does not fit its container. `true` always uses that form, `false` never adapts. |
| ariaLabel | string | "Pagination" | Accessible name of the pagination landmark. |
| modelValue | number | 1 | Current page, 1-based. |

## Emits

- update:modelValue [value: number]

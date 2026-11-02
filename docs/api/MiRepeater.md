# MiRepeater

Repeatable block of fields: add and remove rows, min and max rows, a row factory, focus management and stable keys; rows render through the default slot.

Group: Inputs. Source: app/components/Inputs/MiRepeater.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| min | number | 0 | Fewest rows allowed; remove buttons disable there and missing rows are created on mount. |
| max | number |  | Most rows allowed; the add button disables there. Unlimited when omitted. |
| addLabel | string | "Add row" | Text of the add button. |
| removeLabel | string | "Remove row" | Accessible name of each remove button; the row number is appended. |
| template | (): MiRepeaterRow |  | Factory returning a new row. Defaults to an empty object. |
| label | string | "Row" | Accessible name of the list and prefix of each row's group name. |
| disabled | boolean |  | Blocks adding and removing rows. |
| modelValue | MiRepeaterRow[] | [] | Rows of the repeater; each row is an object edited through the slot's `update`. |

## Slots

- default `{ row: MiRepeaterRow; index: number; update: (patch: Partial<MiRepeaterRow>) => void }`: Fields of one row.

## Emits

- remove [index: number, row: MiRepeaterRow]
- update:modelValue [value: MiRepeaterRow[]]
- add [index: number]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiRepeaterRow = Record<string, unknown>
```

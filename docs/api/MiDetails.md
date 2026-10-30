# MiDetails

Label/value definition list for key facts (order, profile, specs). Pass `items`; a value can be a link via `href`.

Group: Content. Source: app/components/Content/MiDetails.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| items* | { key: string; label: string; value?: string \| number; href?: string }[] |  | Label/value entries, in display order. |
| labelWidth | string | "140px" | Width of the label column. |

## Slots

- value `{ item: MiDetailsItem }`: Custom value for every item without a specific `value-<key>` slot.

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiDetailsItem { /** Unique key, also used for the `label-<key>` / `value-<key>` slots. */ key: string; label: string; value?: string | number; /** Renders the value as a link. */ href?: string }
```

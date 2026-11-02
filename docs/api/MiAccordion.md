# MiAccordion

Stacked expandable panels (disclosure). Use for FAQs or grouped settings; `single` or `multiple` open mode, optional `items` data.

Group: Content. Source: app/components/Content/MiAccordion.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| type | "multiple" \| "single" | "single" | `single`: one panel open at a time. `multiple`: any number. |
| collapsible | boolean | true | Single mode only: allow closing the open panel. |
| items | MiAccordionEntry[] |  | Convenience: render items from data instead of `MiAccordionItem` slots. |
| variant | "plain" \| "card" | "card" | `card`: surface with padding. `plain`: no surface. |
| headingLevel | 2 \| 3 \| 4 \| 5 \| 6 | 3 | Heading level of each panel trigger; keeps the page outline valid. |
| modelValue | null \| string \| string[] | null | Open panel value (single) or values (multiple). |

## Slots

- default: Panels, normally `MiAccordionItem` elements; replaces the `items` rendering.

## Emits

- update:modelValue [value: string | string[] | null]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiAccordionEntry { value: string; title: string; content: string; disabled?: boolean }
```

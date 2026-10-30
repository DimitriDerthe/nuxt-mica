# MiTabs

Tabbed panels: compose MiTabsList/MiTabsTrigger/MiTabsContent in the default slot, or pass `items` and fill panel slots named after each value; v-model is the selected tab value.

Group: Navigation. Source: app/components/Navigation/MiTabs.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| items | MiTabsItem[] |  | Tabs to render, in order. |
| orientation | "horizontal" \| "vertical" | "horizontal" | Layout of the tab list. |
| ariaLabel | string | "Tabs" | Accessible name of the tab list. |
| modelValue | string |  | Value of the active tab. |

## Slots

- default: Compound content: MiTabsList and MiTabsContent children.

## Emits

- update:modelValue [value: string | undefined]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiTabsItem { value: string; label: string; disabled?: boolean }
```

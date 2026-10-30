# MiMenu

Dropdown trigger with a floating panel: popup picks a value (listbox), pulldown runs actions; keyboard and typeahead support.

Group: Buttons. Source: app/components/Buttons/MiMenu.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| items* | { value?: string \| number; label?: string; shortcut?: string; disabled?: boolean; destructive?: boolean; checked?: boolean; separator?: boolean; heading?: string }[] |  | Entries of the menu as MiMenuItem objects. |
| variant | "pulldown" \| "popup" | "pulldown" | popup: shows the selected value (listbox); pulldown: shows an action menu. |
| label | string | "" | Trigger text (placeholder for popup when nothing is selected). |
| ariaLabel | string |  | Accessible name of the trigger and the menu. |
| placement | "bottom-start" \| "bottom-end" \| "top-start" \| "top-end" | "bottom-start" | Side and alignment of the panel relative to the trigger. |
| offset | number | 6 | Gap in px between the trigger and the panel. |
| disabled | boolean |  | Blocks opening and dims the trigger. |
| modelValue | string \| number |  | Value of the chosen item in `popup` mode. |
| open | boolean | false | Whether the menu panel is open. |

## Slots

- trigger `{ props: Record<string, unknown>; open: boolean }`: Custom trigger element; spread the given props on it so it opens the menu.
- icon `{ item: MiMenuItem }`: Icon shown before the text of each item.
- item `{ item: MiMenuItem }`: Custom content of each item; defaults to its label.

## Emits

- update:modelValue [value: string | number | undefined]
- update:open [value: boolean]
- select [item: MiMenuItem]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiMenuItem { /** Unique value. Required for actionable items. */ value?: string | number; label?: string; /** Keyboard shortcut hint, display only. */ shortcut?: string; disabled?: boolean; destructive?: boolean; /** Renders the item as a checkbox-like item. */ checked?: boolean; /** Renders a divider. */ separator?: boolean; /** Renders a non-interactive group heading. */ heading?: string }
```

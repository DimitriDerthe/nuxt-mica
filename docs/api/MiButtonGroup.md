# MiButtonGroup

Groups related buttons: attached strip, segmented selector bound to v-model, or split button with a primary action and menu.

Group: Buttons. Source: app/components/Buttons/MiButtonGroup.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| variant | "split" \| "attached" \| "segmented" | "attached" | attached: put MiButton or MiIconButton children in the default slot, they render as one bordered strip. segmented: pass `options` and v-model. split: a MiButton for the main action, then a MiMenu whose `#trigger="{ props }"` renders `<MiButton v-bind="props">` with a chevron. |
| label* | string |  | Accessible name of the group. |
| options | MiSegmentOption[] |  | Segmented only: renders the options as toggle buttons bound to v-model. |
| modelValue | string \| number |  | Value of the selected option in `segmented` mode. |

## Slots

- option `{ option: MiSegmentOption; selected: boolean }`: Custom content of each segmented option; defaults to its label.
- default: The buttons or menu to group, for the attached and split variants.

## Emits

- update:modelValue [value: string | number | undefined]
- change [value: string | number]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiSegmentOption { value: string | number; /** Visible text. Omit for icon-only options and provide `ariaLabel`. */ label?: string; ariaLabel?: string; disabled?: boolean }
```

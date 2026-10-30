# MiSwatch

Color swatch picker to choose one color from a palette via v-model. Defaults to brand and system colors; pass `options` for a custom set.

Group: Controls. Source: app/components/Controls/MiSwatch.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| options | MiSwatchOption[] | MI_SWATCH_DEFAULTS | Swatches to pick from. Defaults to the brand colors plus system colors. |
| label | string |  | Visible label; the selected color name is appended after a dot. |
| ariaLabel | string |  | Accessible name when there is no visible `label`. |
| showName | boolean | true | Append the selected color name to the label. |
| disabled | boolean |  | Blocks picking a color and dims the swatches. |
| modelValue | null \| string | null | Selected color as a CSS color, or null when none is. |

## Emits

- update:modelValue [value: string | null]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiSwatchOption { value: string; name: string; /** Any CSS color, including `var(--mi-p)` so the swatch follows runtime theming. */ color: string }
```

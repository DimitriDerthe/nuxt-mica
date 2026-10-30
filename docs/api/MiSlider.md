# MiSlider

Slider for a number or [low, high] range via tuple v-model. Keyboard and pointer input; use MiStepper for exact small changes.

Group: Controls. Source: app/components/Controls/MiSlider.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| min | number | 0 | Lowest selectable value. |
| max | number | 100 | Highest selectable value. |
| step | number | 1 | Increment; values snap to multiples of `step` counted from `min`. |
| label | string |  | Visible label above the track; also names the thumb(s). |
| ariaLabel | string |  | Accessible name when there is no visible `label`. |
| tone | "primary" \| "secondary" | "primary" | Fill color. |
| unit | string |  | Unit appended to the displayed value, e.g. `%`. |
| showValue | boolean |  | Show the value above the track. Defaults to true when a `label` is set. |
| format | (value: number): string |  | Custom value formatter, used for the visible value and `aria-valuetext`. |
| name | string |  | Form field name; a range submits two values under the same name. |
| disabled | boolean |  | Blocks interaction and dims the control. |
| modelValue | number \| [number, number] | 0 | A number for a single slider, or a `[low, high]` tuple for a range slider. |

## Slots

- start: Content on the left of the track, such as a min icon.
- end: Content on the right of the track, such as a max icon.

## Emits

- update:modelValue [value: MiSliderValue]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiSliderValue = number | [number, number]
```

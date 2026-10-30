# MiStepper

Numeric stepper with minus and plus buttons, press-and-hold repeat and keyboard support. Variants: `default` (pill) or `field` (value box).

Group: Controls. Source: app/components/Controls/MiStepper.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| variant | "default" \| "field" | "default" | `default` is the iOS plus/minus pill, `field` the desktop value box with stacked arrows. |
| min | number | 0 | Lowest allowed value; the decrement button disables there. |
| max | number | 100 | Highest allowed value; the increment button disables there. |
| step | number | 1 | Increment per press; values snap to multiples of `step` counted from `min`. |
| label | string |  | Accessible name of the control. |
| unit | string |  | Unit appended to the displayed value, e.g. `pt`. |
| showValue | boolean |  | Show the current value next to the pill (always shown by the `field` variant). |
| incrementLabel | string |  | Accessible name of the plus button. Defaults to "Increase <label>", or "Increase". |
| decrementLabel | string |  | Accessible name of the minus button. Defaults to "Decrease <label>", or "Decrease". |
| disabled | boolean |  | Blocks interaction and dims the control. |
| modelValue | number | 0 | Current number, kept within `min` and `max`. |

## Emits

- update:modelValue [value: number]

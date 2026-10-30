# MiSteps

Step progress indicator, vertical or horizontal; v-model is the zero-based current step (earlier steps show as done).

Group: Navigation. Source: app/components/Navigation/MiSteps.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| steps* | { label: string; description?: string }[] |  | Steps in order, each with a label and optional description. |
| orientation | "horizontal" \| "vertical" | "vertical" | `horizontal` takes its container's full width and condenses its labels when that width is small. |
| clickable | boolean | true | When false the markers are not interactive. |
| ariaLabel | string | "Progress" | Accessible name of the progress list. |
| modelValue | number | 0 | Zero-based index of the current step; earlier steps show as done. |

## Emits

- update:modelValue [value: number]

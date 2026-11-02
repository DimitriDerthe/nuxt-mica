# MiRating

Star rating slider with whole or half values, hover preview, keyboard control, optional clear on re-click, and read-only display.

Group: Controls. Source: app/components/Controls/MiRating.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| max | number | 5 | Number of stars, which is also the highest value. |
| half | boolean |  | Allow half-star values (step 0.5 instead of 1). |
| readonly | boolean |  | Shows the value without allowing changes; stays focusable. |
| disabled | boolean |  | Blocks interaction and dims the stars. |
| size | "sm" \| "lg" \| "md" | "md" | Star size. |
| clearable | boolean |  | Clicking the current value again resets the rating to 0. |
| label | string | "Rating" | Accessible name of the control. |
| showValue | boolean |  | Shows the numeric value after the stars. |
| modelValue | number | 0 | Current rating from 0 to `max`, in steps of 1 (0.5 with `half`). |

## Emits

- update:modelValue [value: number]

# MiCodeInput

One-time code input with one cell per character; numeric or alphanumeric mode, emits complete when every cell is filled.

Group: Inputs. Source: app/components/Inputs/MiCodeInput.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| length | number | 6 | Number of cells, and so the length of a complete code. |
| mode | "numeric" \| "alphanumeric" | "numeric" | `numeric` shows the digit keypad on touch devices. |
| mask | boolean |  | Hide entered characters. |
| autofocus | boolean |  | Focuses the first cell on mount so the user can type or paste right away. |
| invalid | boolean |  | Overrides the surrounding MiField or MiFormRow state when set; undefined inherits it. |
| disabled | boolean |  | Overrides the surrounding MiField or MiFormRow disabled state when set. |
| cellLabel | string | "Digit" | Prefix of each cell's accessible name, followed by its index. |
| label | string | "Verification code" | Accessible name of the whole cell group, announced before the individual cells. |
| modelValue | string | "" | Code entered so far, from 0 to `length` characters. |

## Emits

- update:modelValue [value: string]
- complete [code: string]

## Exposed (template ref)

- focus: () => void
- clear: () => void

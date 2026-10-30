# MiInput

Single-line text input with optional prefix and suffix add-ons, clear button and password reveal toggle; v-model is a string.

Group: Inputs. Source: app/components/Inputs/MiInput.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| type | string | "text" | Native input type such as `text`, `email` or `password`. |
| size | "sm" \| "md" | "md" | Field height: `sm` is compact, `md` the standard size. |
| prefix | string |  | Text add-on before the input (for example `https://`). |
| suffix | string |  | Text add-on after the input. |
| clearable | boolean |  | Shows a clear button; clicking it empties the model and emits clear. |
| passwordToggle | boolean |  | Show the reveal button. Defaults to true for `type="password"`. |
| invalid | boolean |  | Overrides the surrounding MiField or MiFormRow state when set; undefined inherits it. |
| success | boolean |  | Draws the success border and focus ring. |
| disabled | boolean |  | Overrides the surrounding MiField or MiFormRow disabled state when set. |
| showLabel | string | "Show password" | Accessible name of the button that reveals a password. |
| hideLabel | string | "Hide password" | Accessible name of the button that hides a revealed password. |
| clearLabel | string | "Clear" | Accessible name of the clear button. |
| modelValue | string | "" | Text value of the field. |

## Slots

- prefix: Replaces the text prefix add-on.
- leading: Icon or content shown inside the field before the text.
- suffix: Replaces the text suffix add-on.

## Emits

- update:modelValue [value: string]
- clear []

## Exposed (template ref)

- focus: () => void | undefined
- input: HTMLInputElement | null

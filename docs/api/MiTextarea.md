# MiTextarea

Multi-line text field that can auto-grow up to maxRows, with an optional character counter; v-model is a string.

Group: Inputs. Source: app/components/Inputs/MiTextarea.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| size | "sm" \| "md" | "md" | Field padding and type size: `sm` is compact, `md` the standard size. |
| rows | number | 3 | Minimum number of visible rows. |
| autoGrow | boolean | true | Grow with the content up to `maxRows`. |
| maxRows | number | 10 | Row cap for autoGrow; the field scrolls beyond it. |
| maxlength | number |  | Maximum number of characters; typing stops there and the counter uses it as its limit. |
| counter | boolean |  | Show a `n / max` counter under the field. |
| invalid | boolean |  | Overrides the surrounding MiField or MiFormRow state when set; undefined inherits it. |
| success | boolean |  | Draws the success border and focus ring. |
| disabled | boolean |  | Overrides the surrounding MiField or MiFormRow disabled state when set. |
| modelValue | string | "" | Text value of the field. |

## Emits

- update:modelValue [value: string]

## Exposed (template ref)

- focus: () => void | undefined
- textarea: HTMLTextAreaElement | null

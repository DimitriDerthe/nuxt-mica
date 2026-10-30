# MiInputGroup

Input or textarea with addons (icons, text, buttons) on any side, sharing one field surface.

Group: Inputs. Source: app/components/Inputs/MiInputGroup.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| multiline | boolean |  | Render a textarea instead of an input; use block-start / block-end addons with it. |
| rows | number | 3 | Textarea rows when multiline. |
| size | "sm" \| "md" | "md" | Field height: `sm` is compact, `md` the standard size. |
| invalid | boolean |  | Overrides the surrounding MiField state when set. |
| disabled | boolean |  | Overrides the surrounding MiField disabled state when set. |
| modelValue | string | "" | Text value of the field inside the group. |

## Slots

- inline-start: Addon at the start of the line (icon, text or button).
- leading: Alias of inline-start.
- inline-end: Addon at the end of the line (icon, text or button).
- trailing: Alias of inline-end.
- block-start: Bar above a multiline field, such as a toolbar.
- block-end: Bar below a multiline field, such as a send button row.

## Emits

- update:modelValue [value: string]

# MiFormRow

Label, hint and error wrapper around one form control, laid out on MiForm's two-column grid (use it inside MiForm); the label sits beside the control unless top is set.

Group: Inputs. Source: app/components/Inputs/MiFormRow.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| label | string |  | Label shown beside the control (above it when `top` is set). |
| for | string |  | Id of the control the label points to. Generated and provided to the control when omitted. |
| top | boolean |  | Align the label to the top (multi-line controls). |
| hint | string |  | Help text under the control. Replaced by `error` when there is one. |
| error | string |  | Error message. Sets the control to its invalid state. |
| required | boolean |  | Marks the label with an asterisk and flags the control as required. |

## Slots

- default `{ id: string }`: The control; receives the generated id to set on it.

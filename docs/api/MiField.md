# MiField

Field wrapper that renders the label, hint, error and success messages and provides id and state to the control inside it.

Group: Inputs. Source: app/components/Inputs/MiField.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| label | string |  | Label shown above the control and linked to it for assistive tech. |
| hint | string |  | Help text under the control. Replaced by `error` when there is one. |
| error | string |  | Error message. Sets the control into its invalid state. |
| success | string |  | Positive message, shown with a check mark. |
| required | boolean |  | Marks the label with an asterisk and flags the control as required. |
| disabled | boolean |  | Dims the label and disables the control inside the field. |
| for | string |  | Id of the control. Generated when omitted. |

## Slots

- default `{ id: string; describedBy: string | undefined }`: The control; receives the generated id and the aria-describedby value to wire onto it.
- label: Replaces the label text.
- label-end: Content placed at the end of the label row, such as a "Forgot?" link.
- message: Replaces the hint, error or success message text.

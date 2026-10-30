# MiForm

Form container with optional title and description; emits the native submit event. Its body is a label/control grid for MiFormRow rows; wrap MiField children in one element so they span both columns.

Group: Inputs. Source: app/components/Inputs/MiForm.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| title | string |  | Heading shown in the form header. Replaced by the `header` slot when given. |
| description | string |  | Supporting text under the title. Replaced by the `header` slot when given. |
| maxWidth | string | "760px" | Max width of the field grid. |

## Slots

- default: Form fields, typically MiFormRow rows.
- header: Replaces the title and description.
- header-end: Content aligned to the end of the header, such as a status badge.
- actions: Footer buttons such as Save and Cancel.

## Emits

- submit [event: SubmitEvent]

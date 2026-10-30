# MiList

Grouped list container with optional header and footer for MiListItem rows. Use for settings or menus; `grouped` false for a bare list.

Group: Content. Source: app/components/Content/MiList.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| header | string |  | Small uppercase heading above the list. |
| footer | string |  | Helper text below the list. |
| grouped | boolean | true | Grouped appearance: card surface with rounded corners. Disable for a bare list. |
| label | string |  | Accessible name for the list when no visible header exists. |

## Slots

- header: Custom heading replacing the `header` text.
- default: The list rows, normally `MiListItem` elements.
- footer: Custom helper text replacing the `footer` text.

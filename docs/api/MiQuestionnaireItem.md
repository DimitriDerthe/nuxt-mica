# MiQuestionnaireItem

One question step; only the active item is visible. Items register in render order.

Group: Ai. Source: app/components/Ai/MiQuestionnaireItem.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| name* | string |  | Answer key and form field name. |
| multiple | boolean |  | Allow several choices. |
| required | boolean |  | Block Next until answered; hides Skip. |

## Slots

- default: Title, description, choices and error of one question.

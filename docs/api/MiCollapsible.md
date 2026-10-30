# MiCollapsible

Show/hide a region with a trigger button. v-model `open`; `trigger` and default (content) slots; chevron and reveal animate with transform/opacity.

Group: Controls. Source: app/components/Controls/MiCollapsible.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| title | string |  | Text of the default trigger when the `trigger` slot is not used. |
| disabled | boolean |  | Blocks toggling; the content stays in its current state. |
| open | boolean | false | Whether the content is shown. |

## Slots

- trigger `{ open: boolean }`: Custom trigger content, given the open state; replaces the title and chevron.
- default: Content revealed when the section is open.

## Emits

- update:open [value: boolean]

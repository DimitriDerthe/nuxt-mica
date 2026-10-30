# MiAccordionItem

One panel of MiAccordion with its trigger and content. Use inside an accordion; standalone, it toggles on its own.

Group: Content. Source: app/components/Content/MiAccordionItem.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| value | string |  | Unique value within the accordion. Generated when omitted. |
| title | string |  | Text of the trigger button. |
| disabled | boolean |  | Blocks toggling and removes the panel from arrow-key navigation. |

## Slots

- title: Custom trigger content, replacing the `title` text.
- default: Panel content shown when the item is open.

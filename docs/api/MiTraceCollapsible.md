# MiTraceCollapsible

Expandable trace row; v-model:open for controlled state or defaultOpen for uncontrolled.

Group: Ai. Source: app/components/Ai/MiTraceCollapsible.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| defaultOpen | boolean | false | Initial open state when uncontrolled. |
| open | boolean |  | Whether the row is expanded. Leave unset to let `defaultOpen` and the trigger manage it. |

## Slots

- default: A MiTraceCollapsibleTrigger followed by a MiTraceCollapsibleContent.

## Emits

- update:open [value: boolean | undefined]

# MiKbdGroup

Groups several MiKbd keys in a row, e.g. a shortcut like Ctrl + K; with `shortcut` the whole group listens for the combination and presses down when it is hit.

Group: Base. Source: app/components/Base/MiKbdGroup.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| shortcut | string |  | Combination to listen for, such as `Ctrl K` or `⇧⌘P`. Leave unset for a purely visual group. |

## Slots

- default: MiKbd keys that form one shortcut.

## Emits

- press [event: KeyboardEvent]

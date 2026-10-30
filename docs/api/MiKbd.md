# MiKbd

Keyboard key or short keyboard input, rendered as a small keycap; with `shortcut` it also listens for that key and presses down when it is hit.

Group: Base. Source: app/components/Base/MiKbd.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| shortcut | string |  | Shortcut to listen for, such as `Esc`, `K` or `Ctrl K`. Leave unset for a purely visual keycap. |

## Slots

- default: Key name or symbol, such as Ctrl or Esc.

## Emits

- press [event: KeyboardEvent]

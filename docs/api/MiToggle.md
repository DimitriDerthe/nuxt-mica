# MiToggle

Two-state pressed button (bold, italic, mute) bound to a boolean v-model. Variants `default` or `outline`; sizes `sm`, `default`, `lg`.

Group: Controls. Source: app/components/Controls/MiToggle.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| variant | "default" \| "outline" | "default" | `outline` adds a hairline border. |
| size | "default" \| "sm" \| "lg" | "default" | Control height: 32px, 36px or 44px. |
| disabled | boolean |  | Blocks interaction and dims the control. |
| label | string |  | Accessible name, required for icon-only toggles. |
| pressed | boolean | false | Pressed state. |

## Slots

- default `{ pressed: boolean }`: Toggle content, given the pressed state so the icon or text can change.

## Emits

- update:pressed [value: boolean]

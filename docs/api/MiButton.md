# MiButton

Button for actions and CTAs: 6 variants (filled, tinted, gray, plain, bordered, destructive), renders an anchor when href is set.

Group: Buttons. Source: app/components/Buttons/MiButton.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| variant | "destructive" \| "plain" \| "bordered" \| "filled" \| "tinted" \| "gray" | "filled" | Visual style of the button, from the most to the least emphasized. |
| brand | "primary" \| "secondary" | "primary" | Color family used by the button: primary, secondary or a semantic one. |
| size | "small" \| "regular" \| "capsule" \| "large" \| "mini" \| "xlarge" | "regular" | Height and padding of the button. |
| loading | boolean |  | Shows a busy state, sets aria-busy and blocks clicks like disabled. |
| disabled | boolean |  | Blocks interaction and dims the button. |
| block | boolean |  | Stretches to the full width of the container. |
| soft | boolean |  | Destructive variant only: gray background with red text. |
| href | string |  | Renders an anchor instead of a button. |
| type | "submit" \| "button" \| "reset" | "button" | Native button type; use submit inside forms. Ignored when href is set. |
| pressed | boolean |  | Sets `aria-pressed` for toggle buttons. |
| state | "rest" \| "hover" \| "focus" | "rest" | Forces a visual state (docs and visual tests). |

## Slots

- leading: Icon shown before the label; replaced by the spinner while loading.
- default: Label of the button.
- trailing: Icon shown after the label.

## Emits

- click [event: MouseEvent]

# MiIconButton

Icon-only button, always labelled, for toolbars and compact actions: 4 variants, 4 sizes, optional pressed toggle.

Group: Buttons. Source: app/components/Buttons/MiIconButton.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| label* | string |  | Accessible name. Icon buttons are always labelled. |
| variant | "filled" \| "tinted" \| "gray" \| "plain" | "filled" | Visual style of the button, from the most to the least emphasized. |
| brand | "primary" \| "secondary" | "primary" | Color family used by the button: primary, secondary or a semantic one. |
| size | "small" \| "regular" \| "large" \| "toolbar" | "large" | Diameter or height of the button, including the toolbar size. |
| shape | "circle" \| "rounded" |  | Defaults to circle, or rounded for the toolbar size. |
| pressed | boolean |  | Sets `aria-pressed` and the pressed look (toolbar toggles). |
| disabled | boolean |  | Blocks interaction and dims the button. |
| type | "submit" \| "button" \| "reset" | "button" | Native button type; use submit inside forms. |
| state | "rest" \| "hover" \| "focus" | "rest" | Forces a visual state: rest, hover or focus (docs and visual tests). |

## Slots

- default: The icon to display.

## Emits

- click [event: MouseEvent]

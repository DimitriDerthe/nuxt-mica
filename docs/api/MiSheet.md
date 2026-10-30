# MiSheet

Bottom sheet with snap detents for drag-to-resize; modal by default, non-modal keeps the page usable, `inline` skips teleport.

Group: Feedback. Source: app/components/Feedback/MiSheet.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| title | string |  | Centred heading in the header bar (or use the `title` slot). |
| detents | MiSheetDetent[] | ["medium", "large"] | Heights as viewport fractions (0.1 to 1) or `medium` (50%) / `large` (92%), in ascending order. |
| cancelLabel | string |  | Text of the leading header button; it closes the sheet and emits `cancel`. |
| confirmLabel | string |  | Text of the trailing header button; it emits `confirm` and closes the sheet when `closeOnConfirm` is set. |
| dismissible | boolean | true | Show a grabber and allow dragging, flicking and Escape to dismiss. |
| grabber | boolean | true | Shows the drag handle bar at the top of the sheet. |
| modal | boolean | true | Dim the page, trap focus and lock scroll. Non-modal sheets leave the page interactive. |
| closeOnConfirm | boolean | true | Close after the confirm button is pressed. |
| inline | boolean |  | Render the card in place without teleport, scrim or drag (documentation and boards). |
| label | string |  | Accessible name when there is no title. |
| modelValue | boolean | false | Whether the sheet is open. |
| detent | number | 0 | Index of the active detent. |

## Slots

- leading `{ cancel: () => void }`: Replaces the leading header button; call `cancel` to close and emit `cancel`.
- title: Heading content; replaces the `title` prop.
- trailing `{ confirm: () => void }`: Replaces the trailing header button; call `confirm` to emit `confirm`.
- default: Sheet body.
- footer: Pinned footer below the body. Hidden when not provided.

## Emits

- update:modelValue [value: boolean]
- close [reason: "cancel" | "escape" | "backdrop" | "confirm" | "drag"]
- cancel []
- confirm []
- update:detent [value: number]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiSheetDetent = number | 'medium' | 'large'
```

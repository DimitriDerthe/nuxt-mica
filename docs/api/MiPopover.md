# MiPopover

Floating panel anchored to a trigger for rich contextual content; `click` or `manual` control, `inline` renders in flow.

Group: Feedback. Source: app/components/Feedback/MiPopover.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| placement | MiOverlayPlacement | "bottom-start" | Side and alignment of the panel relative to the trigger; flips when it would leave the viewport. |
| offset | number | 8 | Gap between the trigger and the panel, in px. |
| arrow | boolean | true | Shows a pointer from the panel to the trigger. |
| width | string \| number |  | Panel width in px (or any CSS length). Defaults to content width, capped at 280px. |
| flush | boolean |  | Remove the 16px panel padding. |
| label | string |  | Accessible name of the popover. |
| trigger | "click" \| "manual" | "click" | `click` toggles on any click inside the trigger slot, so do not also call the slot `toggle` there. `manual` leaves control to `v-model` or to the slot `toggle` (manual mode only). |
| closeOnOutside | boolean | true | Closes the panel when a pointer press lands outside it. |
| closeOnEscape | boolean | true | Closes the panel when Escape is pressed. |
| inline | boolean |  | Render the panel in flow under the trigger (documentation and boards). |
| arrowOffset | number | 30 | Arrow position from the panel's left edge in `inline` mode, in px. |
| disabled | boolean |  | Prevents the panel from opening and closes it if already open. |
| modelValue | boolean | false | Whether the panel is open. |

## Slots

- trigger `{ open: boolean; toggle: () => void; attrs: Record<string, unknown> }`: Element that anchors and opens the panel; bind `attrs` to the focusable control for ARIA, and call `toggle` in manual mode.
- default: Content of the panel.

## Emits

- update:modelValue [value: boolean]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiOverlayPlacement = MiOverlaySide | `${MiOverlaySide}-start` | `${MiOverlaySide}-end`
type MiOverlaySide = 'top' | 'bottom' | 'left' | 'right'
```

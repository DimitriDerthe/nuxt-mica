# MiTooltip

Hover and focus hint for an icon or short label, with optional shortcut text; opens after a delay, instant between neighbours.

Group: Feedback. Source: app/components/Feedback/MiTooltip.vue
Use with v-model.

## Props

| prop | type | default | notes |
|---|---|---|---|
| content | string |  | Tooltip text. Use the `content` slot for rich content. |
| shortcut | string |  | Keyboard shortcut such as `⌘D` or `E`: shown next to the text, and pressing it clicks the trigger (plain keys are ignored while typing in a field). |
| placement | MiOverlayPlacement | "top" | Side and alignment of the tooltip relative to the trigger; flips when it would leave the viewport. |
| delay | number | 500 | Delay before opening on hover, in ms. Focus opens immediately. |
| closeDelay | number | 0 | Delay before closing, in ms. |
| offset | number | 8 | Gap between trigger and tooltip, in px. |
| disabled | boolean |  | Prevents the tooltip from appearing. |
| modelValue | boolean | false | Force the tooltip open or closed. Leave unbound for hover / focus behaviour. |

## Slots

- default `{ id: string; open: boolean }`: Trigger element; bind `id` to its `aria-describedby` and read `open` for state.
- content: Rich tooltip content; replaces the `content` prop text.

## Emits

- update:modelValue [value: boolean]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
type MiOverlayPlacement = MiOverlaySide | `${MiOverlaySide}-start` | `${MiOverlaySide}-end`
type MiOverlaySide = 'top' | 'bottom' | 'left' | 'right'
```

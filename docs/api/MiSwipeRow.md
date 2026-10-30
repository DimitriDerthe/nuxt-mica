# MiSwipeRow

Row revealing trailing actions on swipe or arrow keys. Wrap a row; `action` is emitted with the chosen action id.

Group: Content. Source: app/components/Content/MiSwipeRow.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| actions* | { id: string; label: string; tone?: "primary" \| "secondary" \| "neutral" \| "danger"; icon?: string }[] |  | Trailing actions revealed on swipe; the chosen `id` is emitted on `action`. |
| actionWidth | number | 75 | Width of each action button in px. |
| disabled | boolean |  | Prevents swiping and keeps the actions hidden. |
| keepOpen | boolean |  | Keep the row open after an action is triggered. |
| open | boolean | false | Whether the actions are revealed. |

## Slots

- action `{ action: MiSwipeAction }`: Custom content of each action button, replacing the icon and label.
- default: Row content that slides to reveal the actions.

## Emits

- update:open [value: boolean]
- action [id: string]

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiSwipeAction { id: string; label: string; /** Visual tone of the action button. */ tone?: 'primary' | 'secondary' | 'danger' | 'neutral'; /** SVG path data (24x24 viewBox, stroked) for the default icon. */ icon?: string }
```

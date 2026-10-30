# MiSkeleton

Loading placeholder in `rect`, `circle` or `text` shape, with optional line list; shimmers unless `animated` is false.

Group: Feedback. Source: app/components/Feedback/MiSkeleton.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| variant | "circle" \| "rect" \| "text" | "rect" | Shape of the placeholder: block, circle or lines of text. |
| width | string \| number |  | Number is px, string is any CSS length. Defaults to 100%. |
| height | string \| number |  | Number is px, string is any CSS length. Defaults to 16px (10px for `text`). |
| radius | string \| number |  | Corner radius (px or CSS length). |
| lines | number \| (string \| number)[] |  | `text` only: number of lines, or explicit line widths such as `['88%', '70%']`. |
| animated | boolean | true | Plays the shimmer animation; turn off for a static placeholder. |
| label | string | "Loading content" | Accessible name when used as a container around other skeletons. |

## Slots

- default: Child skeletons grouped inside this container; the container carries the accessible `label`.

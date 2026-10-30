# MiProgress

Linear progress bar: determinate with `value`, indeterminate when `value` is null, or multi-part with `segments` and a legend.

Group: Feedback. Source: app/components/Feedback/MiProgress.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| value | null \| number | null | Current value. `null` or `undefined` renders the indeterminate bar. |
| max | number | 100 | Value that corresponds to a full bar. |
| label | string |  | Text on the left of the header; also the accessible name. |
| valueText | string |  | Text on the right of the header. Defaults to the percentage when `value` is set. |
| showValue | boolean |  | Show the header value. Defaults to true whenever a label or value text exists. |
| size | "sm" \| "lg" \| "md" | "md" | Bar thickness. |
| tone | "primary" \| "secondary" | "primary" | Fill colour of the bar. |
| segments | MiProgressSegment[] |  | Multi-part bar (such as storage by category). Overrides `value`. |
| legend | boolean | true | Show a legend below the segments. |

## Types

Named types used above (import with `import type { Name } from` the source file when needed).

```ts
interface MiProgressSegment { value: number; label?: string; tone?: 'primary' | 'secondary' | 'neutral' }
```

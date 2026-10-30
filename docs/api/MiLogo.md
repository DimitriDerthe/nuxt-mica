# MiLogo

Mica logo: lowercase "mica" wordmark, short "m." form or dot only; the full stop follows the brand color (--mi-p), optional breathing dot for loading states.

Group: Base. Source: app/components/Base/MiLogo.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| variant | "dot" \| "wordmark" \| "short" | "wordmark" | `wordmark` = "mica.", `short` = "m." for tight spaces and app icons, `dot` = the full stop alone. |
| size | string \| number | 24 | Rendered height: a number in px or a CSS length string (e.g. '1em'). Width follows the aspect ratio. |
| tone | "label" \| "inherit" \| "on-primary" | "label" | Letter color: `label` (default text color), `inherit` (currentColor) or `on-primary` for use on a --mi-p fill. |
| dot | "primary" \| "secondary" \| "inherit" | "primary" | Full stop color: `primary` (--mi-p), `secondary` (--mi-s) or `inherit` to match the letters (monochrome). |
| label | string | "Mica" | Accessible name. |
| decorative | boolean |  | Hide from assistive tech when the name is already visible next to the logo. |
| pulse | boolean |  | Breathing dot (transform/opacity only) for loading states; set aria-busy on the busy region yourself. |

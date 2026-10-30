# MiMeter

Linear progress meter for one value between min and max, such as quota or budget use, with optional caption and hint.

Group: Charts. Source: app/components/Charts/MiMeter.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| value* | number |  | Current value, clamped to the min to max range. |
| min | number | 0 | Value that maps to an empty track. |
| max | number | 100 | Value that maps to a full track. |
| label | string |  | Visible label above the track. |
| ariaLabel | string |  | Accessible name when no visible label is given. |
| caption | string |  | Text left of the footer, e.g. "82 % used". |
| hint | string |  | Text right of the footer, e.g. "$1,240 remaining". |
| color | string |  | Fill color. Defaults to series 1 (primary). |
| size | "sm" \| "lg" \| "md" | "md" | Track thickness: sm, md or lg. |
| valueText | string |  | Text for assistive tech, defaults to the percentage. |

## Slots

- default: Replaces the footer; defaults to the caption on the left and the hint on the right.

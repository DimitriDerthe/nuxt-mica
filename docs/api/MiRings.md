# MiRings

Concentric progress rings, one per item, with a legend. Rings are { label, sub?, value (0 to 1), color? }[].

Group: Charts. Source: app/components/Charts/MiRings.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| rings* | { label: string; sub?: string; value: number; color?: string }[] |  | Rings as { label, sub?, value (0 to 1), color? }[], outermost first. |
| title | string |  | Heading shown above the rings inside the card. |
| subtitle | string |  | Secondary line under the title. |
| card | boolean | true | Wrap in the elevated card surface. |
| size | number | 180 | Outer diameter of the ring stack in px. |
| strokeWidth | number | 14 | Thickness of each ring in px. |
| gap | number | 4 | Space between concentric rings. |
| legend | boolean | true | Shows a legend with each ring label and percentage beside the rings. |
| animate | boolean | true | Sweeps the rings to their values on mount. |
| ariaLabel | string |  | Accessible description of the rings; label and percentage of each ring are read when omitted. |
| active | number | -1 | Highlighted ring index (legend hover), -1 for none. |

## Slots

- default: Content centered inside the rings, such as a total.

## Emits

- update:active [value: number]

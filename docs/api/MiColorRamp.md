# MiColorRamp

Nine-step tonal ramp (50-800) generated from one base color; use it to preview or document a brand color scale.

Group: Base. Source: app/components/Base/MiColorRamp.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| color* | string |  | Base color (becomes step 500). Falls back to the default primary when invalid. |
| labels | boolean | true | Show the step labels (50-800) inside the cells. |
| height | number | 40 | Row height in px. |
| label | string | "Color ramp" | Accessible name of the ramp. |

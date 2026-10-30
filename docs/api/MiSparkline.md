# MiSparkline

Tiny inline line chart for trends inside text or tiles. Decorative unless label is set. Values are number[], oldest first.

Group: Charts. Source: app/components/Charts/MiSparkline.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| values* | number[] |  | Numbers drawn left to right, oldest first. |
| width | number | 84 | Width of the drawing in px. |
| height | number | 28 | Height of the drawing in px. |
| stroke | string |  | Line color. Defaults to the neutral chart gray. |
| color | string |  | End dot color. Defaults to series 1. |
| strokeWidth | number | 2 | Thickness of the line in px. |
| dot | boolean | true | Show the end dot. |
| animate | boolean | true | Draw the line in on mount. |
| label | string |  | Accessible description; the sparkline is decorative when omitted. |

# MiChartCard

Titled wrapper for any chart: heading, subtitle and an elevated card surface that can be turned off.

Group: Charts. Source: app/components/Charts/MiChartCard.vue

## Props

| prop | type | default | notes |
|---|---|---|---|
| title | string |  | Heading text; the header is hidden when no title, subtitle or actions are given. |
| subtitle | string |  | Muted line under the title. |
| surface | boolean | true | Render the elevated card surface. Turn off to embed the chart in your own container. |
| headingLevel | 2 \| 3 \| 4 \| 5 | 3 | Heading level of the title, h2 to h5. Pick it to fit the page outline. |

## Slots

- actions: Controls shown at the right of the header, such as a toggle or legend.
- default: The chart or content shown under the header.

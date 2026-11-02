# Charts

Thin marks, one axis, hover and keyboard reading on every chart. All charts take plain data props, render their SVG once and only animate `transform`, `opacity` and `stroke-dashoffset`. Hover uses one delegated pointer handler throttled with `requestAnimationFrame`.

Colors come from `app/utils/miChartPalette.ts`: series 1 and 2 follow `--mi-p` and `--mi-s` (so they change with the runtime brand colors), series 3 to 5 are fixed hues validated for contrast and color-blindness in both appearances. Assign series in order, never cycled (`miChartColor(i)` falls back to the neutral label color past 5).

Utilities (auto-imported): `miChartCategorical`, `miChartColor(i)`, `miChartSequential(steps?, base?)`, `miChartDiverging(low?, high?)`, `miChartHeat(base?)`, `miChartNeutral`, `miChartZebra`; geometry helpers in `miChartMath.ts` (`miNiceScale`, `miLinePath`, `miBarPath`, `miSparkPoints`, `miDodge`, `miLevel`).

## Components

### MiChartCard
Card surface with title, subtitle and an `actions` slot. Used internally by the charts (`card` prop) and usable for custom compositions.

| Prop | Type | Default |
| --- | --- | --- |
| `title`, `subtitle` | `string` | - |
| `surface` | `boolean` | `true` |
| `headingLevel` | `2 \| 3 \| 4 \| 5` | `3` |

Slots: default, `actions`.

### MiSparkline
| Prop | Type | Default |
| --- | --- | --- |
| `values` | `number[]` | required |
| `width`, `height` | `number` | `84`, `28` |
| `stroke` | `string` | neutral gray |
| `color` | `string` | series 1 (end dot) |
| `strokeWidth` | `number` | `2` |
| `dot`, `animate` | `boolean` | `true` |
| `label` | `string` | decorative when omitted |

### MiStatTile
| Prop | Type | Default |
| --- | --- | --- |
| `label`, `value` | `string` | required |
| `delta` | `string` | - |
| `trend` | `'up' \| 'down'` | `'up'` |
| `tone` | `'good' \| 'bad' \| 'neutral'` | `'good'` |
| `comparison` | `string` | `'vs last month'` |
| `spark` | `number[]` | - |
| `color` | `string` | series 1 |

Slot: default (between value and footer).

### MiLineChart
Multi-series line chart with optional area, end labels, crosshair tooltip, legend (from 2 series) and a chart/table toggle.

| Prop | Type | Default |
| --- | --- | --- |
| `categories` | `string[]` | required |
| `series` | `{ name, data, color?, area? }[]` | required |
| `title`, `subtitle`, `card` | | `card: true` |
| `unit` | `string` | `''` |
| `min`, `max`, `ticks` | `number` | auto, `4` intervals |
| `height` | `number` | `256` |
| `area` | `'first' \| 'all' \| 'none'` | `'first'` |
| `endLabels`, `toolbar`, `toggle`, `animate` | `boolean` | `true` |
| `categoryLabel`, `chartLabel`, `tableLabel` | `string` | `Category`, `Chart`, `Table` |
| `formatValue`, `formatCategory` | functions | `value + unit`, identity |

`v-model:view` (`'chart' | 'table'`). Event `hover(index)` (-1 on leave). Keyboard: focus the chart, Left/Right/Home/End to read points, Escape to clear; the toggle is a radio group with arrow keys.

### MiBarChart
| Prop | Type | Default |
| --- | --- | --- |
| `data` | `{ label, value, color? }[]` | required |
| `title`, `subtitle`, `card` | | `card: true` |
| `unit`, `max`, `ticks`, `height` | | `''`, auto, `2`, `216` |
| `maxBarWidth`, `radius` | `number` | `24`, `4` |
| `valueLabels` | `'peak' \| 'all' \| 'none'` | `'peak'` |
| `animate` | `boolean` | `true` |
| `formatValue` | function | `value + unit` |

Event `hover(index)`. Keyboard like the line chart.

### MiStackedBar
| Prop | Type | Default |
| --- | --- | --- |
| `segments` | `{ label, value, color? }[]` | required |
| `height` | `number` | `28` |
| `legend` | `boolean` | `true` |
| `legendColumns` | `number` | `2` |
| `formatShare` | `(pct, segment) => string` | `pct + '%'` |
| `ariaLabel`, `animate` | | auto, `true` |

`v-model:active` (hovered segment index, -1 for none). Arrow keys, Home/End, Escape.

### MiMeter
`role="meter"` progress bar whose fill moves with `transform`.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `number` | required |
| `min`, `max` | `number` | `0`, `100` |
| `label`, `ariaLabel` | `string` | - |
| `caption`, `hint` | `string` | footer left, right |
| `color` | `string` | series 1 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `valueText` | `string` | percentage |

Slot: default replaces the footer.

### MiRings
Concentric activity rings, `stroke-dashoffset` animated.

| Prop | Type | Default |
| --- | --- | --- |
| `rings` | `{ label, sub?, value (0-1), color? }[]` | required |
| `title`, `subtitle`, `card` | | `card: true` |
| `size`, `strokeWidth`, `gap` | `number` | `180`, `14`, `4` |
| `legend`, `animate` | `boolean` | `true` |

`v-model:active`; slot: default (center content).

### MiHeatmap
| Prop | Type | Default |
| --- | --- | --- |
| `data` | `number[]` (week-major, 7 per week) | required |
| `title`, `subtitle`, `card` | | `card: true` |
| `dayLabels`, `labelRows` | `string[]`, `number[]` | Mon..Sun, `[0, 2, 4]` |
| `unit` | `string` | `'events'` |
| `max` | `number` | data maximum |
| `cell`, `gap` | `number` | `14`, `3` |
| `legend`, `lessLabel`, `moreLabel` | | `true`, `Less`, `More` |
| `formatTip` | `(value, week, day) => string` | `Week n, Day: v unit` |

Event `hover({ week, day, value } | null)`. Arrow keys move across cells and are announced.

### MiChartLegend
| Prop | Type | Default |
| --- | --- | --- |
| `items` | `{ label, color, value?, sub?, shape? }[]` | required |
| `variant` | `'inline' \| 'list' \| 'stat' \| 'ramp'` | `'inline'` |
| `columns` | `number` | `2` (list) |
| `lessLabel`, `moreLabel` | `string` | `Less`, `More` (ramp) |

`v-model:active` for `list` and `stat`.

### MiChartTable
Accessible data table (table view of a chart).

| Prop | Type | Default |
| --- | --- | --- |
| `columns` | `{ key, label, align? }[]` | required |
| `rows` | `Record<string, string \| number>[]` | required |
| `caption` | `string` | visually hidden |
| `zebra` | `boolean` | `true` |

First column renders as row headers.

### MiDonutChart

Donut or pie chart. Hover or arrow keys highlight a segment; the legend, the center and the chart share that highlight. A chart/table toggle gives an accessible data table.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `data` | `{ label, value, color? }[]` | | negative / non-finite values count as 0, zero values get no segment |
| `variant` | `'donut' \| 'pie'` | `'donut'` | |
| `title`, `subtitle` | `string` | | card header |
| `card` | `boolean` | `true` | elevated surface |
| `size` | `number` | `240` | max width in px, shrinks with the container |
| `thickness` | `number` | `30` | ring width on a 220 grid (donut) |
| `gap` | `number` | `3` | px between segments |
| `valueLabels` | `'none' \| 'percent' \| 'value'` | `'none'` | drawn on segments of 7 % or more |
| `unit` | `string` | `''` | value suffix |
| `legend`, `toggle`, `animate` | `boolean` | `true` | |
| `totalLabel` | `string` | `'Total'` | caption under the center total |
| `categoryLabel`, `valueLabel`, `shareLabel`, `chartLabel`, `tableLabel` | `string` | English | table / toggle text |
| `formatValue` | `(value, datum) => string` | | |
| `ariaLabel` | `string` | generated | |
| `v-model:view` | `'chart' \| 'table'` | `'chart'` | |
| `v-model:active` | `number` | `-1` | highlighted segment |

Slot `center` (donut): `{ active, total, totalText }`. Event `hover(index)`. Palette: shared chart palette in order (primary, secondary, fixed hues).

### MiScatterChart

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `series` | `{ name, points: { x, y, r? }[], color? }[]` | | `r` turns it into a bubble chart (area scaled) |
| `title`, `subtitle`, `card` | | | as other charts |
| `xLabel`, `yLabel` | `string` | | axis titles, also table headers |
| `xUnit`, `yUnit` | `string` | `''` | |
| `sizeLabel` | `string` | `'Size'` | |
| `ticks` | `number` | `5` | |
| `height` | `number` | `300` | |
| `dotSize`, `maxRadius` | `number` | `5`, `22` | |
| `toolbar`, `toggle`, `animate` | `boolean` | `true` | |
| `formatValue` | `(value, 'x' \| 'y' \| 'r', series) => string` | | |
| `v-model:view` | `'chart' \| 'table'` | `'chart'` | |

Event `hover({ series, index } \| null)`. Keyboard: arrows read points left to right, Home / End, Escape clears.

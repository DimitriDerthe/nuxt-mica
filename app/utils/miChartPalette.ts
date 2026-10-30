/**
 * Chart palette. Colors are CSS values so they follow the runtime brand variables
 * and the light/dark appearance (through `light-dark()` + `color-scheme` set by the tokens).
 * Series 1 and 2 follow the primary and secondary brand colors; assign series in this order, never cycled.
 */

export type MiChartColor = string

const lighten = (v: string, pct: number): string => `color-mix(in srgb, ${v} ${100 - pct}%, #FFFFFF)`

/** Categorical order. 1 = primary, 2 = secondary, then fixed hues validated for contrast and color-blindness. */
export const miChartCategorical: readonly MiChartColor[] = [
  `light-dark(var(--mi-p, #0071E3), ${lighten('var(--mi-p, #0071E3)', 22)})`,
  `light-dark(var(--mi-s, #BF4800), ${lighten('var(--mi-s, #BF4800)', 25)})`,
  'light-dark(#008CA8, #1FA2BC)',
  'light-dark(#A87F00, #B08A00)',
  'light-dark(#A64DD6, #BF5AF2)'
]

/** Neutral stroke used for sparklines and crosshairs. */
export const miChartNeutral: MiChartColor = 'light-dark(#8E8E93, #7C7C80)'
/** Zebra row background for chart tables. */
export const miChartZebra: MiChartColor = 'light-dark(#F7F7F9, #232325)'

/** Color of the n-th series (0-based). Beyond the validated set the neutral label color is used, colors are never cycled. */
export function miChartColor(index: number): MiChartColor {
  return miChartCategorical[index] ?? 'var(--mi-label2)'
}

const mixOn = (color: string, pct: number): string => `color-mix(in srgb, ${color} ${pct}%, var(--mi-card))`

/** Single-hue sequential ramp, light to dark. */
export function miChartSequential(steps = 7, base: MiChartColor = miChartColor(0)): MiChartColor[] {
  const stops = [0.14, 0.3, 0.46, 0.62, 0.78, 0.9, 1]
  return Array.from({ length: steps }, (_, i) => {
    const t = steps === stops.length ? stops[i]! : 0.14 + (0.86 * i) / Math.max(1, steps - 1)
    return mixOn(base, Math.round(t * 100))
  })
}

/** Seven step diverging scale: series 2 hue, neutral midpoint, series 1 hue. */
export function miChartDiverging(low: MiChartColor = miChartColor(1), high: MiChartColor = miChartColor(0)): MiChartColor[] {
  return [
    low,
    mixOn(low, 66),
    mixOn(low, 33),
    'light-dark(#D1D1D6, #48484A)',
    mixOn(high, 33),
    mixOn(high, 66),
    high
  ]
}

/** Five level heatmap scale: empty cell then four steps of one hue. */
export function miChartHeat(base: MiChartColor = miChartColor(0)): MiChartColor[] {
  return ['var(--mi-fill4)', mixOn(base, 30), mixOn(base, 52), mixOn(base, 76), base]
}

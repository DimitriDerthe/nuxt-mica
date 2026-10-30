/** Pure geometry helpers shared by the chart components. */

export const miRound1 = (n: number): number => Math.round(n * 10) / 10

export interface MiNiceScale {
  min: number
  max: number
  step: number
  ticks: number[]
}

/** Rounds `maxValue` up to a readable axis maximum split in `intervals` equal steps. */
export function miNiceScale(maxValue: number, intervals = 4, min = 0): MiNiceScale {
  const n = Math.max(1, Math.floor(intervals))
  const span = Math.max(maxValue - min, 1e-9)
  const raw = span / n
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = ([1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw - 1e-9)) ?? 10 * mag
  const ticks = Array.from({ length: n + 1 }, (_, i) => miRound1(min + i * step))
  return { min, max: ticks[n]!, step, ticks }
}

/** `M x y L x y …` polyline path. */
export function miLinePath(points: ReadonlyArray<readonly [number, number]>): string {
  return points.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ')
}

/** Column path with a rounded data end (top) and a flat base. */
export function miBarPath(x: number, y: number, w: number, base: number, r = 4): string {
  const rr = Math.min(r, w / 2, Math.max(0, base - y))
  const x2 = miRound1(x + w)
  return `M${x} ${base} V${miRound1(y + rr)} Q${x} ${y} ${miRound1(x + rr)} ${y} H${miRound1(x2 - rr)} Q${x2} ${y} ${x2} ${miRound1(y + rr)} V${base} Z`
}

/** Sparkline points inside a `w` x `h` box with `pad` px of vertical breathing room. */
export function miSparkPoints(values: readonly number[], w: number, h: number, pad = 4): Array<[number, number]> {
  if (!values.length) return []
  const mn = Math.min(...values)
  const mx = Math.max(...values)
  const range = mx - mn || 1
  const last = Math.max(1, values.length - 1)
  return values.map((v, i) => [miRound1((i * w) / last), miRound1(h - pad - ((v - mn) / range) * (h - pad * 2))])
}

/** Pushes labels apart so neighbours keep at least `gap` px, preserving order, inside [lo, hi]. */
export function miDodge(ys: readonly number[], gap: number, lo: number, hi: number): number[] {
  const order = ys.map((y, i) => i).sort((a, b) => ys[a]! - ys[b]!)
  const out = ys.slice()
  let prev = lo - gap
  for (const i of order) {
    out[i] = Math.max(ys[i]!, prev + gap)
    prev = out[i]!
  }
  let next = hi + gap
  for (const i of order.slice().reverse()) {
    out[i] = Math.min(out[i]!, next - gap)
    next = out[i]!
  }
  return out
}

/** Heatmap level 0..levels for a value against a maximum. */
export function miLevel(value: number, max: number, levels = 4): number {
  if (!(value > 0) || !(max > 0)) return 0
  return Math.max(1, Math.min(levels, Math.ceil((value / max) * levels - 1e-9)))
}

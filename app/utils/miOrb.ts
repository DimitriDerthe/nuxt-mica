// Dotted "thinking orb" engine for MiOrb: pure point generators per state, a projection step and one
// shared requestAnimationFrame loop for every orb on the page. No DOM access outside the loop helpers.

export type MiOrbState = 'thinking' | 'searching' | 'working' | 'listening' | 'composing' | 'connecting' | 'idle'

export const MI_ORB_STATES: readonly MiOrbState[] = ['thinking', 'searching', 'working', 'listening', 'composing', 'connecting', 'idle']

/** One dot in model space: x, y, z on a unit sphere (|v| <= ~1.2) and a weight that scales size and ink. */
export interface MiOrbPoint { x: number, y: number, z: number, w: number }

/** A projected dot ready to draw, in canvas pixels; `a` is its alpha (0-1). */
export interface MiOrbDot { x: number, y: number, r: number, a: number }

const TAU = Math.PI * 2
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

/** Dot count for a rendered size: dense enough to read as a sphere at 64px, sparse enough to stay crisp at 20px. */
export function miOrbCount(size: number, density = 1): number {
  return Math.max(24, Math.min(240, Math.round(size * 2.1 * density)))
}

/** Point i of n on a Fibonacci sphere (even spread, no poles clumping). */
function fib(i: number, n: number) {
  const y = 1 - (2 * (i + 0.5)) / n
  const r = Math.sqrt(1 - y * y)
  const th = GOLDEN * i
  return { x: Math.cos(th) * r, y, z: Math.sin(th) * r }
}

interface RingSlot { k: number, j: number, count: number }
const ringTables = new Map<string, RingSlot[]>()

/** Splits n dots into `rings` latitude rings, more dots on the wider rings. Computed once per (n, rings), then read per frame. */
function ringOf(i: number, n: number, rings: number): RingSlot {
  const key = n + ':' + rings
  let table = ringTables.get(key)
  if (!table) {
    const weights = Array.from({ length: rings }, (_, k) => Math.sin(((k + 0.5) / rings) * Math.PI))
    const total = weights.reduce((a, b) => a + b, 0)
    const counts = weights.map(w => Math.max(3, Math.round((w / total) * n)))
    table = []
    let k = 0, j = 0
    for (let d = 0; d < n; d++) {
      // The last ring absorbs any rounding remainder.
      while (k < rings - 1 && j >= counts[k]!) { k++; j = 0 }
      table.push({ k, j, count: 0 })
      j++
    }
    for (const slot of table) slot.count = table.filter(s => s.k === slot.k).length
    ringTables.set(key, table)
  }
  return table[i] ?? { k: rings - 1, j: 0, count: 1 }
}

/** Deterministic pseudo-random in [0, 1) so every orb of a state looks the same on server and client. */
function hash(i: number) {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

/** Positions of dot i of n for a state at time t (seconds). Writes into `out` to avoid allocations per frame. */
export function miOrbPoint(state: MiOrbState, i: number, n: number, t: number, out: MiOrbPoint): MiOrbPoint {
  switch (state) {
    case 'thinking': {
      // Dotted lattice of latitude rings with a slow pressure wave rolling pole to pole; crests swell and glow.
      const { k, j, count } = ringOf(i, n, 11)
      const lat = ((k + 0.5) / 11 - 0.5) * Math.PI
      const lon = (j / count) * TAU + k * 0.35
      const wave = Math.sin(lat * 3.2 - t * 2.2)
      const crest = Math.max(0, wave) ** 2
      const r = 1 + 0.06 * wave
      const c = Math.cos(lat) * r
      out.x = Math.cos(lon) * c; out.y = Math.sin(lat) * r; out.z = Math.sin(lon) * c; out.w = 0.7 + 0.6 * crest
      return out
    }
    case 'searching': {
      // Dotted globe of latitude rings; a meridian sweeps around it and lights what it crosses.
      const { k, j, count } = ringOf(i, n, 9)
      const lat = ((k + 0.5) / 9 - 0.5) * Math.PI
      const lon = (j / count) * TAU
      const c = Math.cos(lat)
      out.x = Math.cos(lon) * c; out.y = Math.sin(lat); out.z = Math.sin(lon) * c
      const d = Math.atan2(Math.sin(lon - t * 1.6), Math.cos(lon - t * 1.6))
      out.w = 0.55 + 0.9 * Math.exp(-(d * d) * 6)
      return out
    }
    case 'working': {
      // Three tilted orbits; dots stream along each one at its own pace, the head of each stream brightest.
      const orbit = i % 3
      const j = Math.floor(i / 3)
      const per = Math.ceil(n / 3)
      const speed = [1.1, -0.8, 1.45][orbit]!
      const a = (j / per) * TAU + t * speed
      const tilt = [0.35, -0.9, 1.25][orbit]!
      const yaw = [0, 2.1, 4.2][orbit]!
      const x = Math.cos(a), z0 = Math.sin(a)
      const y = z0 * Math.sin(tilt), z1 = z0 * Math.cos(tilt)
      out.x = x * Math.cos(yaw) - z1 * Math.sin(yaw); out.y = y; out.z = x * Math.sin(yaw) + z1 * Math.cos(yaw)
      out.w = 0.45 + 0.8 * ((j / per + (speed > 0 ? 0 : 0.5)) % 1)
      return out
    }
    case 'listening': {
      // Latitude rings breathing in sequence, like a waveform rolling through the sphere.
      const { k, j, count } = ringOf(i, n, 7)
      const lat = ((k + 0.5) / 7 - 0.5) * Math.PI
      const lon = (j / count) * TAU
      const amp = Math.sin(t * 4.2 - k * 0.95)
      const r = 1 + 0.16 * amp
      const c = Math.cos(lat) * r
      out.x = Math.cos(lon) * c; out.y = Math.sin(lat) * (1 + 0.05 * amp); out.z = Math.sin(lon) * c
      out.w = 0.6 + 0.5 * Math.max(0, amp)
      return out
    }
    case 'composing': {
      // Three undulating strands wrapping the equator, like a pen line being drawn.
      const strand = i % 3
      const j = Math.floor(i / 3)
      const per = Math.ceil(n / 3)
      const lon = (j / per) * TAU + t * 0.9
      const lat = 0.42 * Math.sin(2 * lon + t * 1.7 + strand * 2.09) + (strand - 1) * 0.16
      const c = Math.cos(lat)
      out.x = Math.cos(lon) * c; out.y = Math.sin(lat); out.z = Math.sin(lon) * c
      out.w = 0.6 + 0.45 * Math.sin(j / per * TAU * 2 - t * 3) ** 2
      return out
    }
    case 'connecting': {
      // A few hub nodes and packets travelling the great-circle arcs between them.
      const hubs = Math.max(6, Math.round(n / 14))
      if (i < hubs) {
        const p = fib(i, hubs)
        out.x = p.x; out.y = p.y; out.z = p.z; out.w = 1.6 + 0.3 * Math.sin(t * 3 + i)
        return out
      }
      const e = i - hubs
      const from = fib(e % hubs, hubs)
      const to = fib((e * 3 + 1) % hubs, hubs)
      const phase = (hash(e) + t * (0.35 + hash(e + 9) * 0.4)) % 1
      const s = phase
      // Spherical interpolation, then lifted slightly off the surface so arcs read as connections.
      const dot = Math.max(-0.999, Math.min(0.999, from.x * to.x + from.y * to.y + from.z * to.z))
      const om = Math.acos(dot)
      const so = Math.sin(om) || 1
      const a = Math.sin((1 - s) * om) / so, b = Math.sin(s * om) / so
      const lift = 1 + 0.18 * Math.sin(s * Math.PI)
      out.x = (from.x * a + to.x * b) * lift; out.y = (from.y * a + to.y * b) * lift; out.z = (from.z * a + to.z * b) * lift
      out.w = 0.35 + 0.6 * Math.sin(s * Math.PI)
      return out
    }
    case 'idle':
    default: {
      // A face-on ring of dots, slowly breathing: calm, ready, waiting.
      const a = (i / n) * TAU
      const band = (i % 4) / 4
      const r = 0.82 + band * 0.16 + 0.04 * Math.sin(t * 1.4 + band * 3)
      out.x = Math.cos(a + t * 0.25) * r; out.y = Math.sin(a + t * 0.25) * r; out.z = 0
      out.w = 0.55 + 0.45 * band
      return out
    }
  }
}

/** Whole-orb rotation per state: yaw speed (rad/s) and a fixed pitch that shows the sphere from slightly above. */
const SPIN: Record<MiOrbState, { yaw: number, pitch: number }> = {
  thinking: { yaw: 0.55, pitch: 0.38 },
  searching: { yaw: 0.25, pitch: 0.42 },
  working: { yaw: 0.35, pitch: 0.3 },
  listening: { yaw: 0.3, pitch: 0.5 },
  composing: { yaw: 0.2, pitch: 0.45 },
  connecting: { yaw: 0.4, pitch: 0.35 },
  idle: { yaw: 0, pitch: 0 }
}

/** Ease for the state morph: smooth start and landing. */
export const miOrbEase = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k))

/**
 * Projects model points into canvas space. `size` is the CSS size; radius leaves room for the dots.
 * Far dots shrink and fade so the sphere reads in 3D with a single colour.
 */
export function miOrbProject(p: MiOrbPoint, state: MiOrbState, t: number, size: number, dotBase: number, out: MiOrbDot): MiOrbDot {
  const { yaw, pitch } = SPIN[state]
  const ay = t * yaw
  const cy = Math.cos(ay), sy = Math.sin(ay), cp = Math.cos(pitch), sp = Math.sin(pitch)
  const x1 = p.x * cy - p.z * sy
  const z1 = p.x * sy + p.z * cy
  const y2 = p.y * cp - z1 * sp
  const z2 = p.y * sp + z1 * cp
  const focal = 3.2
  const s = focal / (focal - z2)
  const radius = size * 0.4
  const depth = Math.max(0, Math.min(1, (z2 + 1.2) / 2.4))
  out.x = size / 2 + x1 * radius * s
  out.y = size / 2 + y2 * radius * s
  // Size follows depth (and only a little the weight) so the lattice stays even; ink carries the emphasis.
  out.r = Math.max(0.45, dotBase * (0.6 + 0.5 * depth) * (0.85 + 0.15 * Math.min(1.6, p.w)))
  out.a = Math.max(0.1, Math.min(1, (0.2 + 0.8 * depth) * (0.5 + 0.38 * Math.min(1.3, p.w))))
  return out
}

/** Number of alpha buckets the renderer batches dots into (one fill per bucket instead of one per dot). */
export const MI_ORB_ALPHA_STEPS = 6

/** Shared animation loop: every visible orb on the page draws in the same requestAnimationFrame callback. */
type FrameFn = (now: number) => void
const subscribers = new Set<FrameFn>()
let raf = 0

function tick(now: number) {
  for (const fn of subscribers) fn(now)
  raf = subscribers.size ? requestAnimationFrame(tick) : 0
}

export function miOrbSubscribe(fn: FrameFn): () => void {
  subscribers.add(fn)
  if (!raf && typeof requestAnimationFrame !== 'undefined') raf = requestAnimationFrame(tick)
  return () => {
    subscribers.delete(fn)
    if (!subscribers.size && raf) { cancelAnimationFrame(raf); raf = 0 }
  }
}

/** Number of orbs currently drawing (exposed for tests and debugging). */
export const miOrbActiveCount = () => subscribers.size

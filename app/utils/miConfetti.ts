/** Pure particle engine for the confetti burst. No DOM access: create particles, step them, query their opacity. */

export interface MiParticle {
  x: number
  y: number
  vx: number
  vy: number
  /** Rotation in radians. */
  rot: number
  /** Angular velocity in rad/s. */
  vr: number
  /** Phase of the flip (fake 3D tilt). */
  tilt: number
  tiltSpeed: number
  w: number
  h: number
  /** Seconds lived. */
  age: number
  /** Total lifetime in seconds. */
  life: number
  color: string
  shape: 'rect' | 'circle'
}

export interface MiBurstOptions {
  /** Origin in CSS px. */
  x: number
  y: number
  /** Number of particles. */
  count?: number
  /** Cone width in degrees around `angle`; 360 is a full circle. */
  spread?: number
  /** Direction of the burst in degrees, 0 = right, -90 = up. */
  angle?: number
  /** Initial speed in px/s (upper bound; each particle gets 45 to 100 percent of it). */
  speed?: number
  colors?: readonly string[]
  /** Lifetime in ms. */
  duration?: number
}

export const MI_CONFETTI_FALLBACK_COLORS: readonly string[] = ['#0A84FF', '#FF9F0A', '#30D158', '#BF5AF2', '#FFD60A', '#FF453A']
/** Downward acceleration in px/s². */
export const MI_CONFETTI_GRAVITY = 900
/** Fraction of velocity kept after one second of air drag. */
const DRAG = 0.2
const FADE_FROM = 0.7

/** Builds the particles of one burst. `rand` is injectable for deterministic tests. */
export function miCreateParticles(opts: MiBurstOptions, rand: () => number = Math.random): MiParticle[] {
  const count = Math.max(0, Math.min(500, Math.floor(opts.count ?? 80)))
  const spread = Math.max(0, Math.min(360, opts.spread ?? 70))
  const angle = ((opts.angle ?? -90) * Math.PI) / 180
  const speed = opts.speed ?? 720
  const colors = opts.colors?.length ? opts.colors : MI_CONFETTI_FALLBACK_COLORS
  const life = Math.max(100, opts.duration ?? 2600) / 1000
  const out: MiParticle[] = []
  for (let i = 0; i < count; i++) {
    const a = angle + ((rand() - 0.5) * spread * Math.PI) / 180
    const v = speed * (0.45 + rand() * 0.55)
    const round = rand() < 0.25
    const size = 6 + rand() * 6
    out.push({
      x: opts.x,
      y: opts.y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      rot: rand() * Math.PI * 2,
      vr: (rand() - 0.5) * 14,
      tilt: rand() * Math.PI * 2,
      tiltSpeed: 6 + rand() * 8,
      w: size,
      h: round ? size : size * (0.45 + rand() * 0.3),
      age: 0,
      life: life * (0.75 + rand() * 0.25),
      color: colors[Math.floor(rand() * colors.length) % colors.length]!,
      shape: round ? 'circle' : 'rect'
    })
  }
  return out
}

/** Advances one particle by `dt` seconds. Mutates and returns it. */
export function miStepParticle(p: MiParticle, dt: number, gravity = MI_CONFETTI_GRAVITY): MiParticle {
  const drag = Math.pow(DRAG, dt)
  p.vx *= drag
  p.vy = p.vy * drag + gravity * dt
  p.x += p.vx * dt
  p.y += p.vy * dt
  p.rot += p.vr * dt
  p.tilt += p.tiltSpeed * dt
  p.age += dt
  return p
}

/** Advances all particles and removes the dead ones in place (also those that left the viewport below). Returns the live count. */
export function miUpdateParticles(list: MiParticle[], dt: number, gravity = MI_CONFETTI_GRAVITY, floor = Infinity): number {
  const step = Math.min(Math.max(dt, 0), 0.05)
  let n = 0
  for (let i = 0; i < list.length; i++) {
    const p = miStepParticle(list[i]!, step, gravity)
    if (p.age < p.life && p.y < floor + 40) list[n++] = p
  }
  list.length = n
  return n
}

/** Opacity of a particle: 1, fading out over the last 30 percent of its life. */
export function miParticleAlpha(p: MiParticle): number {
  const t = p.age / p.life
  return t <= FADE_FROM ? 1 : Math.max(0, 1 - (t - FADE_FROM) / (1 - FADE_FROM))
}

/** Scale of the particle height from its flip phase, 0.15 to 1, so confetti looks like it tumbles. */
export function miParticleFlip(p: MiParticle): number {
  return 0.15 + 0.85 * Math.abs(Math.cos(p.tilt))
}

/** Converts an origin given as 0..1 ratios of the viewport into px; values outside 0..1 are clamped. */
export function miOriginToPx(origin: { x: number, y: number }, width: number, height: number): { x: number, y: number } {
  const c = (v: number) => Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0.5))
  return { x: c(origin.x) * width, y: c(origin.y) * height }
}

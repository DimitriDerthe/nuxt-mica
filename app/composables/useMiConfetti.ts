import { MI_CONFETTI_FALLBACK_COLORS, miCreateParticles, miOriginToPx } from '../utils/miConfetti'
import type { MiBurstOptions, MiParticle } from '../utils/miConfetti'

export interface MiConfettiOptions {
  /** Where the burst starts: ratios 0..1 of the viewport (default bottom center area) or an element, whose center is used. */
  origin?: { x: number, y: number } | HTMLElement | null
  /** Number of particles. */
  count?: number
  /** Cone width in degrees; 360 for a full circle. */
  spread?: number
  /** Burst direction in degrees, -90 is up. */
  angle?: number
  /** Initial speed in px/s. */
  speed?: number
  /** CSS colors; defaults to the brand colors read from `--mi-p` and `--mi-s`. */
  colors?: string[]
  /** Lifetime in ms. */
  duration?: number
  /** Downward acceleration in px/s². */
  gravity?: number
}

/** What a mounted `MiConfetti` registers so the composable can hand it particles. */
export interface MiConfettiHost {
  emit: (particles: MiParticle[], gravity?: number) => void
  size: () => { width: number, height: number }
}

let host: MiConfettiHost | null = null

/** Called by `MiConfetti` on mount (and with `null` on unmount). Only one host is active; the latest mounted wins. */
export function registerMiConfettiHost(h: MiConfettiHost | null, current?: MiConfettiHost): void {
  if (h === null && current && host !== current) return
  host = h
}

/** Brand colors from the runtime CSS variables, with a safe fallback. */
export function miConfettiBrandColors(): string[] {
  if (typeof document === 'undefined') return [...MI_CONFETTI_FALLBACK_COLORS]
  const cs = getComputedStyle(document.documentElement)
  const read = (n: string) => cs.getPropertyValue(n).trim()
  const brand = ['--mi-p', '--mi-s', '--mi-p-hover', '--mi-s-hover'].map(read).filter(Boolean)
  return brand.length ? [...brand, '#FFD60A', '#30D158', '#BF5AF2'] : [...MI_CONFETTI_FALLBACK_COLORS]
}

export function miPrefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Confetti bursts. Mount `<MiConfetti />` once, then call `fire()`. Does nothing on the server, under reduced motion or without a mounted host. */
export function useMiConfetti() {
  function fire(opts: MiConfettiOptions = {}): boolean {
    if (typeof window === 'undefined' || !host || miPrefersReducedMotion()) return false
    const { width, height } = host.size()
    let at: { x: number, y: number }
    if (opts.origin && 'getBoundingClientRect' in opts.origin) {
      const r = opts.origin.getBoundingClientRect()
      at = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    } else {
      at = miOriginToPx(opts.origin ?? { x: 0.5, y: 0.7 }, width, height)
    }
    const burst: MiBurstOptions = {
      x: at.x, y: at.y, count: opts.count, spread: opts.spread, angle: opts.angle, speed: opts.speed, duration: opts.duration,
      colors: opts.colors?.length ? opts.colors : miConfettiBrandColors()
    }
    host.emit(miCreateParticles(burst), opts.gravity)
    return true
  }
  return { fire }
}

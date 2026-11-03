<script setup lang="ts">
/** Dotted 3D thinking orb for AI and agent states (thinking, searching, working, listening, composing, connecting, idle); one shared canvas loop, paused offscreen, static under reduced motion. */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { MI_ORB_ALPHA_STEPS, miOrbCount, miOrbEase, miOrbPoint, miOrbProject, miOrbSubscribe } from '../../utils/miOrb'
import type { MiOrbDot, MiOrbPoint, MiOrbState } from '../../utils/miOrb'

const props = withDefaults(defineProps<{
  /** What the agent is doing; switching state morphs the dots into the new shape. */
  state?: MiOrbState
  /** Preset: sm 20px (inline with text), md 32px, lg 64px (avatar). A number is an exact size in px. */
  size?: 'sm' | 'md' | 'lg' | number
  /** Ink colour: brand `primary` or `secondary`, or `inherit` to follow the text colour. */
  tone?: 'primary' | 'secondary' | 'inherit'
  /** Animation speed multiplier. */
  speed?: number
  /** Dot density multiplier (1 is the tuned look). */
  density?: number
  /** Freeze on the current frame. */
  paused?: boolean
  /** Accessible name; defaults to the state name ("Thinking"). An empty string hides the orb from assistive tech. */
  label?: string
}>(), {
  state: 'thinking',
  size: 'md',
  tone: 'primary',
  speed: 1,
  density: 1,
  paused: false,
  label: undefined
})

const px = computed(() => (typeof props.size === 'number' ? props.size : ({ sm: 20, md: 32, lg: 64 } as const)[props.size]))
const name = computed(() => (props.label ?? props.state[0]!.toUpperCase() + props.state.slice(1)))
const color = computed(() => (props.tone === 'primary' ? 'var(--mi-p-text)' : props.tone === 'secondary' ? 'var(--mi-s-text)' : undefined))

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let dpr = 1
let ink = 'currentColor'
let frames = 0
let clock = 0
let last = 0
let stop: (() => void) | null = null
let visible = false
let reduced = false

const MORPH_MS = 650
let morphFrom: MiOrbDot[] = []
let morphStart = -1

let points: MiOrbPoint[] = []
let dots: MiOrbDot[] = []
const buckets: number[][] = Array.from({ length: MI_ORB_ALPHA_STEPS }, () => [])

function alloc() {
  const n = miOrbCount(px.value, props.density)
  points = Array.from({ length: n }, () => ({ x: 0, y: 0, z: 0, w: 1 }))
  dots = Array.from({ length: n }, () => ({ x: 0, y: 0, r: 0, a: 0 }))
  morphStart = -1
}

function resize() {
  const el = canvas.value
  if (!el) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  el.width = Math.round(px.value * dpr)
  el.height = Math.round(px.value * dpr)
}

/** Reads the resolved ink colour from CSS, so theme, brand and parent colour changes are picked up. */
function readInk() {
  if (canvas.value) ink = getComputedStyle(canvas.value).color || ink
}

function draw(now: number) {
  const el = canvas.value
  if (!ctx || !el) return
  const size = px.value
  const n = points.length
  // Small orbs get relatively bigger dots so they stay legible next to text.
  const dotBase = Math.max(0.95, size * 0.026)
  const k = morphStart < 0 ? 1 : miOrbEase((now - morphStart) / MORPH_MS)
  if (k >= 1) morphStart = -1
  for (const b of buckets) b.length = 0
  for (let i = 0; i < n; i++) {
    miOrbPoint(props.state, i, n, clock, points[i]!)
    const d = miOrbProject(points[i]!, props.state, clock, size, dotBase, dots[i]!)
    const from = morphStart >= 0 ? morphFrom[i] : undefined
    if (from) {
      d.x = from.x + (d.x - from.x) * k
      d.y = from.y + (d.y - from.y) * k
      d.r = from.r + (d.r - from.r) * k
      d.a = from.a + (d.a - from.a) * k
    }
    buckets[Math.min(MI_ORB_ALPHA_STEPS - 1, Math.floor(d.a * MI_ORB_ALPHA_STEPS))]!.push(i)
  }
  if (frames++ % 30 === 0) readInk()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = ink
  // One path and one fill per alpha bucket: a handful of draw calls per frame, whatever the dot count.
  for (let b = 0; b < MI_ORB_ALPHA_STEPS; b++) {
    const list = buckets[b]!
    if (!list.length) continue
    ctx.globalAlpha = (b + 0.5) / MI_ORB_ALPHA_STEPS
    ctx.beginPath()
    for (const i of list) {
      const d = dots[i]!
      ctx.moveTo(d.x + d.r, d.y)
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
    }
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function frame(now: number) {
  if (last) clock += Math.min(0.1, (now - last) / 1000) * props.speed
  last = now
  draw(now)
}

/** Draws only while the orb is on screen, not paused and motion is allowed; otherwise holds a still frame. */
function sync() {
  const run = visible && !props.paused && !reduced && !!ctx
  if (run && !stop) { last = 0; stop = miOrbSubscribe(frame) }
  else if (!run && stop) { stop(); stop = null }
  if (!run) draw(typeof performance !== 'undefined' ? performance.now() : 0)
}

let io: IntersectionObserver | null = null
let motion: MediaQueryList | null = null
const onMotion = () => { reduced = !!motion?.matches; sync() }

onMounted(() => {
  ctx = canvas.value?.getContext('2d') ?? null
  alloc()
  resize()
  readInk()
  if (typeof matchMedia !== 'undefined') {
    motion = matchMedia('(prefers-reduced-motion: reduce)')
    reduced = motion.matches
    motion.addEventListener?.('change', onMotion)
  }
  // Reduced motion: a recognisable still pose rather than the t=0 frame.
  if (reduced) clock = 1.2
  if (typeof IntersectionObserver !== 'undefined' && canvas.value) {
    io = new IntersectionObserver((entries) => { visible = entries.some(e => e.isIntersecting); sync() })
    io.observe(canvas.value)
  } else {
    visible = true
  }
  sync()
})

onBeforeUnmount(() => {
  stop?.()
  stop = null
  io?.disconnect()
  motion?.removeEventListener?.('change', onMotion)
})

watch(() => props.state, () => {
  // Morph from what is on screen now to the new state's shape.
  morphFrom = dots.map(d => ({ ...d }))
  morphStart = typeof performance !== 'undefined' ? performance.now() : 0
  sync()
})
watch([px, () => props.density], () => { alloc(); resize(); sync() })
watch(() => props.paused, sync)
watch(() => props.tone, () => { readInk(); sync() }, { flush: 'post' })
</script>

<template>
  <span
    class="mi-orb mi:align-middle" :data-state="state" :role="name ? 'status' : undefined" :aria-label="name || undefined"
    :aria-hidden="name ? undefined : 'true'" :style="{ color, width: px + 'px', height: px + 'px' }"
  >
    <canvas ref="canvas" class="mi-orb__canvas mi:block mi:w-full mi:h-full" :width="px" :height="px" aria-hidden="true" />
  </span>
</template>

<style scoped>
.mi-orb { display: inline-flex; flex: none; line-height: 0; }
</style>

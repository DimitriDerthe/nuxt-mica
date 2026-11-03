<script setup lang="ts">
/** Full-viewport, click-through canvas that draws confetti bursts fired with useMiConfetti(); mount it once near the app root. */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { registerMiConfettiHost } from '../../composables/useMiConfetti'
import type { MiConfettiHost } from '../../composables/useMiConfetti'
import { MI_CONFETTI_GRAVITY, miParticleAlpha, miParticleFlip, miUpdateParticles } from '../../utils/miConfetti'
import type { MiParticle } from '../../utils/miConfetti'

withDefaults(defineProps<{
  /** Stacking order of the canvas; it never receives pointer events. */
  zIndex?: number
}>(), { zIndex: 9999 })

const canvas = ref<HTMLCanvasElement | null>(null)
const particles: MiParticle[] = []
let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let last = 0
let gravity = MI_CONFETTI_GRAVITY
let w = 0
let h = 0
let dpr = 1

function resize() {
  const el = canvas.value
  if (!el) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  w = window.innerWidth
  h = window.innerHeight
  el.width = Math.round(w * dpr)
  el.height = Math.round(h * dpr)
}

function draw() {
  const el = canvas.value
  if (!ctx || !el) return
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, el.width, el.height)
  ctx.scale(dpr, dpr)
  for (const p of particles) {
    ctx.globalAlpha = miParticleAlpha(p)
    ctx.fillStyle = p.color
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rot)
    ctx.scale(1, miParticleFlip(p))
    if (p.shape === 'circle') {
      ctx.beginPath()
      ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
    }
    ctx.restore()
  }
  ctx.globalAlpha = 1
}

function frame(t: number) {
  const dt = last ? (t - last) / 1000 : 1 / 60
  last = t
  const alive = miUpdateParticles(particles, dt, gravity, h)
  draw()
  if (alive) raf = requestAnimationFrame(frame)
  else { raf = 0; last = 0; ctx?.clearRect(0, 0, canvas.value?.width ?? 0, canvas.value?.height ?? 0) }
}

const host: MiConfettiHost = {
  size: () => ({ width: w || window.innerWidth, height: h || window.innerHeight }),
  emit(list, g) {
    if (!ctx) return
    gravity = g ?? MI_CONFETTI_GRAVITY
    particles.push(...list)
    if (!raf) raf = requestAnimationFrame(frame)
  }
}

onMounted(() => {
  ctx = canvas.value?.getContext('2d') ?? null
  resize()
  window.addEventListener('resize', resize, { passive: true })
  registerMiConfettiHost(host)
})

onBeforeUnmount(() => {
  registerMiConfettiHost(null, host)
  if (typeof window !== 'undefined') window.removeEventListener('resize', resize)
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  particles.length = 0
})
</script>

<template>
  <canvas ref="canvas" class="mi-confetti mi:fixed mi:inset-0 mi:w-screen mi:h-screen mi:pointer-events-none" aria-hidden="true" :style="{ zIndex }" />
</template>

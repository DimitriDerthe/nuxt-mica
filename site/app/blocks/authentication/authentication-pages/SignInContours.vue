<template>
  <section class="sic mi:@container mi:grid mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]" aria-labelledby="sic-title">
    <div class="sic__in mi:grid mi:grid-rows-[auto_1fr] mi:@[760px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1.05fr)] mi:@[760px]:grid-rows-[none]">
    <div class="sic__form-side mi:grid mi:grid-rows-[auto_1fr_auto] mi:gap-7 mi:py-6 mi:px-5 mi:order-2 mi:@[760px]:order-1 mi:@[760px]:py-8 mi:@[760px]:px-11 mi:@[1040px]:px-18">
      <div class="sic__brand mi:flex mi:items-center mi:gap-2.5">
        <span class="sic__mark mi:w-5.5 mi:h-5.5 mi:rounded-[7px] mi:[background:conic-gradient(from_210deg,_var(--mi-p),_var(--mi-s),_var(--mi-p))] mi:shadow-[inset_0_0_0_5px_color-mix(in_srgb,_var(--mi-page)_70%,_transparent)]" aria-hidden="true" />
        <MiText as="span" variant="headline" weight="semibold">Northlight</MiText>
      </div>

      <div class="sic__form-wrap mi:grid mi:content-center mi:gap-2.5 mi:w-full mi:max-w-95 mi:justify-self-center">
        <MiText id="sic-title" as="h2" variant="title1" weight="bold" balance>Welcome back</MiText>
        <MiText variant="subheadline" tone="label2">Sign in to the survey workspace your crew shares.</MiText>

        <MiButton variant="bordered" size="large" block class="sic__passkey mi:mt-3.5" @click="passkey">
          <template #leading><MiIcon :svg="fingerprint" :size="18" /></template>
          Sign in with a passkey
        </MiButton>

        <div class="sic__or mi:flex mi:items-center mi:gap-3 mi:my-1.5 mi:mx-0 mi:text-label3 mi:text-[12px] mi:before:content-[''] mi:before:flex-1 mi:before:h-px mi:before:[background:var(--mi-sep)] mi:after:content-[''] mi:after:flex-1 mi:after:h-px mi:after:[background:var(--mi-sep)]"><span>or use your email</span></div>

        <form class="sic__form mi:grid mi:gap-3.5" novalidate @submit.prevent="submit">
          <MiField label="Work email" :error="errors.email">
            <template #default="{ id, describedBy }">
              <MiInput :id="id" v-model="email" type="email" autocomplete="username" :aria-describedby="describedBy" placeholder="you@company.com" />
            </template>
          </MiField>
          <MiField label="Password" :error="errors.password">
            <template #label-end><MiTextLink href="#">Forgot password?</MiTextLink></template>
            <template #default="{ id, describedBy }">
              <MiInput :id="id" v-model="password" type="password" autocomplete="current-password" :aria-describedby="describedBy" />
            </template>
          </MiField>
          <MiCheckbox v-model="remember" label="Keep me signed in for 30 days" />
          <MiButton type="submit" size="large" block :loading="busy">Sign in</MiButton>
        </form>

        <div class="sic__live mi:mt-1 mi:mx-0 mi:mb-0 mi:min-h-px" aria-live="polite">
          <MiAlert v-if="done" tone="success" :title="`Signed in to ${workspace}`" message="Opening your field boards…" />
        </div>
      </div>

      <MiText variant="footnote" tone="label2" class="sic__foot mi:justify-self-center mi:text-center">
        New crew member? <MiTextLink href="#">Ask your admin for an invite</MiTextLink>
      </MiText>
    </div>

    <!-- Generative contour map: seeded by the email domain, so every workspace gets its own terrain. -->
    <aside class="sic__art mi:relative mi:order-1 mi:min-h-42 mi:overflow-hidden mi:isolate mi:[background:radial-gradient(120%_80%_at_10%_0%,_color-mix(in_srgb,_var(--mi-p)_26%,_transparent),_transparent_60%),_radial-gradient(90%_70%_at_100%_100%,_color-mix(in_srgb,_var(--mi-s)_24%,_transparent),_transparent_65%),_color-mix(in_srgb,_var(--mi-p)_6%,_var(--mi-card))] mi:@[760px]:order-2 mi:@[760px]:min-h-0 mi:@[760px]:m-3 mi:@[760px]:rounded-[22px] mi:@[760px]:shadow-[inset_0_0_0_1px_var(--mi-sep)]" aria-label="Workspace pattern">
      <svg class="sic__svg mi:absolute mi:inset-0 mi:w-full mi:h-full mi:-z-1" viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g v-for="(peak, pi) in terrain.peaks" :key="seed + '-' + pi">
          <path
            v-for="(ring, ri) in peak.rings" :key="ri" :d="ring" class="sic__ring mi:fill-[color:none] mi:stroke-[color:color-mix(in_srgb,_var(--mi-p)_70%,_var(--mi-label2))] mi:[stroke-width:.8]"
            :class="ri % 3 === 0 ? 'sic__ring--major mi:stroke-s mi:[stroke-width:1.4]' : ''" :style="{ opacity: 0.9 - ri * 0.07 }"
          />
          <circle :cx="peak.x" :cy="peak.y" r="3.5" class="sic__peak mi:fill-p mi:stroke-card mi:[stroke-width:2]" />
          <text :x="peak.x + 8" :y="peak.y - 8" class="sic__elev mi:[font:600_10px/1_var(--mi-font)] mi:fill-label2 mi:tracking-[.04em]">{{ peak.elev }} m</text>
        </g>
      </svg>
      <div class="sic__art-meta mi:absolute mi:top-3.5 mi:right-3.5 mi:grid mi:justify-items-end mi:gap-1">
        <MiText as="span" variant="caption" weight="semibold" class="sic__chip mi:py-1 mi:px-2.5 mi:rounded-[999px] mi:[background:var(--mi-mat)] mi:shadow-[0_0_0_1px_var(--mi-sep)]">{{ workspace }}</MiText>
        <MiText as="span" variant="caption2" tone="label2">Pattern {{ seed.toString(16).slice(0, 6).toUpperCase() }}</MiText>
      </div>
      <figure class="sic__quote mi:hidden mi:@[760px]:absolute mi:@[760px]:left-5 mi:@[760px]:right-5 mi:@[760px]:bottom-5 mi:@[760px]:grid mi:@[760px]:gap-3.5 mi:@[760px]:m-0 mi:@[760px]:py-4.5 mi:@[760px]:px-5 mi:@[760px]:rounded-[18px] mi:@[760px]:[background:var(--mi-mat)] mi:@[760px]:shadow-[0_0_0_1px_var(--mi-sep),_var(--mi-sh2)]">
        <blockquote class="mi:@[760px]:[.sic__quote_blockquote&]:m-0 mi:@[760px]:[.sic__quote_blockquote&]:text-balance">We moved forty field crews off shared spreadsheets in a single week.</blockquote>
        <figcaption class="mi:@[760px]:[.sic__quote_figcaption&]:gap-2.5">
          <MiAvatar class="mi:@[760px]:[.sic__quote_blockquote&]:m-0 mi:@[760px]:[.sic__quote_blockquote&]:text-balance mi:@[760px]:[.sic__quote_figcaption&]:gap-2.5" name="Ines Okafor" size="sm" tone="auto" decorative />
          <span><strong>Ines Okafor</strong><br>Operations lead, Saltmarsh Survey</span>
        </figcaption>
      </figure>
    </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onBeforeUnmount } from 'vue'

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })

const fingerprint = '<path d="M12 11v3a8 8 0 0 1-1.2 4.2"/><path d="M8.5 13.5a3.5 3.5 0 0 1 7 0V15a12 12 0 0 1-.6 3.8"/><path d="M5.6 16A9 9 0 0 1 5 13a7 7 0 0 1 12.6-4.2"/><path d="M19 12.5V14a15 15 0 0 1-.4 3.4"/><path d="M8 4.3A9.5 9.5 0 0 1 20.5 9"/>'

const email = ref('ines@saltmarsh.co')
const password = ref('')
const remember = ref(true)
const busy = ref(false)
const done = ref(false)
const errors = reactive({ email: '', password: '' })

const domain = computed(() => email.value.split('@')[1]?.trim().toLowerCase() || 'northlight.app')
const workspace = computed(() => domain.value.split('.')[0] + '.northlight.app')

// FNV-1a hash then a tiny LCG: deterministic, so the same domain always draws the same map.
function hash(s: string) {
  let h = 2166136261
  for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) }
  return h >>> 0
}
const seed = computed(() => hash(domain.value))

function smoothClosed(pts: [number, number][]) {
  const n = pts.length
  const at = (i: number) => pts[(i + n) % n]!
  let d = `M${at(0)[0].toFixed(1)},${at(0)[1].toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${c1[0]!.toFixed(1)},${c1[1]!.toFixed(1)} ${c2[0]!.toFixed(1)},${c2[1]!.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d + 'Z'
}

const terrain = computed(() => {
  let s = seed.value || 1
  const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296 }
  const peaks = Array.from({ length: 3 }, (_, k) => {
    const x = 70 + rnd() * 260
    const y = 60 + k * 150 + rnd() * 80
    const ph = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28]
    const amp = [0.12 + rnd() * 0.12, 0.05 + rnd() * 0.08, 0.03 + rnd() * 0.04]
    const count = 6 + Math.floor(rnd() * 5)
    const rings = Array.from({ length: count }, (_, r) => {
      const base = 14 + r * (18 + k * 3)
      const pts: [number, number][] = []
      for (let i = 0; i < 40; i++) {
        const t = (i / 40) * Math.PI * 2
        const wob = 1 + amp[0]! * Math.sin(2 * t + ph[0]! + r * 0.25) + amp[1]! * Math.sin(3 * t + ph[1]!) + amp[2]! * Math.sin(5 * t + ph[2]! - r * 0.4)
        pts.push([x + Math.cos(t) * base * wob * 1.15, y + Math.sin(t) * base * wob])
      }
      return smoothClosed(pts)
    })
    return { x, y, rings, elev: 180 + Math.round(rnd() * 420) }
  })
  return { peaks }
})

function submit() {
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value) ? '' : 'Enter the email you use at work.'
  errors.password = password.value.length >= 8 ? '' : 'Your password has at least 8 characters.'
  if (errors.email || errors.password) return
  busy.value = true
  done.value = false
  // UI demo only: nothing is sent anywhere.
  later(() => { busy.value = false; done.value = true }, 900)
}
function passkey() {
  busy.value = true
  later(() => { busy.value = false; done.value = true }, 700)
}
</script>

<style scoped>
.sic__chip { -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }

@container (min-width: 760px) {
  .sic__quote {
    -webkit-backdrop-filter: blur(18px) saturate(160%); backdrop-filter: blur(18px) saturate(160%);
  }
  .sic__quote blockquote { font-size: 17px; line-height: 1.4; font-weight: 600; letter-spacing: -.015em; }
  .sic__quote figcaption { display: flex; align-items: center; font-size: 12px; line-height: 1.35; color: var(--mi-label2); }
  .sic__quote strong { color: var(--mi-label); font-weight: 600; }
}
</style>

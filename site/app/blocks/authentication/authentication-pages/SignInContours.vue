<template>
  <section class="sic" aria-labelledby="sic-title">
    <div class="sic__in">
    <div class="sic__form-side">
      <div class="sic__brand">
        <span class="sic__mark" aria-hidden="true" />
        <MiText as="span" variant="headline" weight="semibold">Northlight</MiText>
      </div>

      <div class="sic__form-wrap">
        <MiText id="sic-title" as="h2" variant="title1" weight="bold" balance>Welcome back</MiText>
        <MiText variant="subheadline" tone="label2">Sign in to the survey workspace your crew shares.</MiText>

        <MiButton variant="bordered" size="large" block class="sic__passkey" @click="passkey">
          <template #leading><MiIcon :svg="fingerprint" :size="18" /></template>
          Sign in with a passkey
        </MiButton>

        <div class="sic__or"><span>or use your email</span></div>

        <form class="sic__form" novalidate @submit.prevent="submit">
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

        <div class="sic__live" aria-live="polite">
          <MiAlert v-if="done" tone="success" :title="`Signed in to ${workspace}`" message="Opening your field boards…" />
        </div>
      </div>

      <MiText variant="footnote" tone="label2" class="sic__foot">
        New crew member? <MiTextLink href="#">Ask your admin for an invite</MiTextLink>
      </MiText>
    </div>

    <!-- Generative contour map: seeded by the email domain, so every workspace gets its own terrain. -->
    <aside class="sic__art" aria-label="Workspace pattern">
      <svg class="sic__svg" viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g v-for="(peak, pi) in terrain.peaks" :key="seed + '-' + pi">
          <path
            v-for="(ring, ri) in peak.rings" :key="ri" :d="ring" class="sic__ring"
            :class="ri % 3 === 0 ? 'sic__ring--major' : ''" :style="{ opacity: 0.9 - ri * 0.07 }"
          />
          <circle :cx="peak.x" :cy="peak.y" r="3.5" class="sic__peak" />
          <text :x="peak.x + 8" :y="peak.y - 8" class="sic__elev">{{ peak.elev }} m</text>
        </g>
      </svg>
      <div class="sic__art-meta">
        <MiText as="span" variant="caption" weight="semibold" class="sic__chip">{{ workspace }}</MiText>
        <MiText as="span" variant="caption2" tone="label2">Pattern {{ seed.toString(16).slice(0, 6).toUpperCase() }}</MiText>
      </div>
      <figure class="sic__quote">
        <blockquote>We moved forty field crews off shared spreadsheets in a single week.</blockquote>
        <figcaption>
          <MiAvatar name="Ines Okafor" size="sm" tone="auto" decorative />
          <span><strong>Ines Okafor</strong><br>Operations lead, Saltmarsh Survey</span>
        </figcaption>
      </figure>
    </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

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
  setTimeout(() => { busy.value = false; done.value = true }, 900)
}
function passkey() {
  busy.value = true
  setTimeout(() => { busy.value = false; done.value = true }, 700)
}
</script>

<style scoped>
.sic { container-type: inline-size; display: grid; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.sic__in { display: grid; }
.sic__form-side { display: grid; grid-template-rows: auto 1fr auto; gap: 28px; padding: 24px 20px; order: 2; }
.sic__brand { display: flex; align-items: center; gap: 10px; }
.sic__mark { width: 22px; height: 22px; border-radius: 7px; background: conic-gradient(from 210deg, var(--mi-p), var(--mi-s), var(--mi-p)); box-shadow: inset 0 0 0 5px color-mix(in srgb, var(--mi-page) 70%, transparent); }
.sic__form-wrap { display: grid; align-content: center; gap: 10px; width: 100%; max-width: 380px; justify-self: center; }
.sic__passkey { margin-top: 14px; }
.sic__or { display: flex; align-items: center; gap: 12px; margin: 6px 0; color: var(--mi-label3); font-size: 12px; }
.sic__or::before, .sic__or::after { content: ""; flex: 1; height: 1px; background: var(--mi-sep); }
.sic__form { display: grid; gap: 14px; }
.sic__live { margin: 4px 0 0; min-height: 1px; }
.sic__foot { justify-self: center; text-align: center; }

.sic__art {
  position: relative; order: 1; min-height: 168px; overflow: hidden; isolation: isolate;
  background:
    radial-gradient(120% 80% at 10% 0%, color-mix(in srgb, var(--mi-p) 26%, transparent), transparent 60%),
    radial-gradient(90% 70% at 100% 100%, color-mix(in srgb, var(--mi-s) 24%, transparent), transparent 65%),
    color-mix(in srgb, var(--mi-p) 6%, var(--mi-card));
}
.sic__svg { position: absolute; inset: 0; width: 100%; height: 100%; z-index: -1; }
.sic__ring { fill: none; stroke: color-mix(in srgb, var(--mi-p) 70%, var(--mi-label2)); stroke-width: .8; }
.sic__ring--major { stroke: var(--mi-s); stroke-width: 1.4; }
.sic__peak { fill: var(--mi-p); stroke: var(--mi-card); stroke-width: 2; }
.sic__elev { font: 600 10px/1 var(--mi-font); fill: var(--mi-label2); letter-spacing: .04em; }
.sic__art-meta { position: absolute; top: 14px; right: 14px; display: grid; justify-items: end; gap: 4px; }
.sic__chip { padding: 4px 10px; border-radius: 999px; background: var(--mi-mat); box-shadow: 0 0 0 1px var(--mi-sep); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
.sic__quote { display: none; }

@container (min-width: 760px) {
  .sic__in { grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); }
  .sic__form-side { order: 1; padding: 32px 44px; }
  .sic__art { order: 2; min-height: 0; margin: 12px; border-radius: 22px; box-shadow: inset 0 0 0 1px var(--mi-sep); }
  .sic__quote {
    position: absolute; left: 20px; right: 20px; bottom: 20px; display: grid; gap: 14px; margin: 0; padding: 18px 20px;
    border-radius: 18px; background: var(--mi-mat); box-shadow: 0 0 0 1px var(--mi-sep), var(--mi-sh2);
    -webkit-backdrop-filter: blur(18px) saturate(160%); backdrop-filter: blur(18px) saturate(160%);
  }
  .sic__quote blockquote { margin: 0; font-size: 17px; line-height: 1.4; font-weight: 600; letter-spacing: -.015em; text-wrap: balance; }
  .sic__quote figcaption { display: flex; align-items: center; gap: 10px; font-size: 12px; line-height: 1.35; color: var(--mi-label2); }
  .sic__quote strong { color: var(--mi-label); font-weight: 600; }
}
@container (min-width: 1040px) { .sic__form-side { padding-inline: 72px; } }
</style>

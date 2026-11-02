<template>
  <div class="ssf">
    <!-- Faux end of a dashboard page, so the footer is seen in place. -->
    <div class="ssf__page" aria-hidden="true">
      <span class="ssf__ghost" /><span class="ssf__ghost" /><span class="ssf__ghost is-wide" />
    </div>

    <footer class="ssf__foot" aria-labelledby="ssf-title">
      <h2 id="ssf-title" class="ssf__sr">Service status and app information</h2>

      <section class="ssf__status" aria-label="Uptime">
        <div class="ssf__status-head">
          <span class="ssf__beacon" :class="'is-' + overall.tone" aria-hidden="true" />
          <MiText variant="subheadline" weight="semibold">{{ overall.label }}</MiText>
          <MiText variant="caption" tone="label2" tabular class="ssf__avg">{{ average }}% over 60 days</MiText>
        </div>
        <!-- Uptime strip: one bar per day, roving focus with the arrow keys. -->
        <div class="ssf__strip" role="group" aria-label="Daily uptime, last 60 days" @keydown.left.prevent="move(-1)" @keydown.right.prevent="move(1)">
          <button
            v-for="(d, i) in days" :key="i" :ref="el => setBar(el, i)" type="button" class="ssf__bar"
            :class="['is-' + d.tone, { 'is-on': i === pick }]" :tabindex="i === pick ? 0 : -1" :aria-label="`${d.date}: ${d.uptime}% uptime`"
            :aria-pressed="i === pick" @click="pick = i"
          />
        </div>
        <p class="ssf__detail" aria-live="polite">
          <b>{{ day.date }}</b> · <span class="ssf__num">{{ day.uptime }}%</span> · {{ day.note }}
        </p>
      </section>

      <section class="ssf__meta" aria-label="Build and region">
        <div class="ssf__build">
          <MiText variant="caption" tone="label2">Version</MiText>
          <code class="ssf__code">v4.12.0 · 8f3c21e</code>
          <MiCopyButton value="4.12.0+8f3c21e" icon-only variant="ghost" label="Copy build id" copied-label="Build id copied" />
        </div>
        <div class="ssf__region">
          <MiText id="ssf-region" variant="caption" tone="label2">Region</MiText>
          <MiNativeSelect v-model="region" size="sm" :options="regions.map(r => ({ value: r.id, label: r.label }))" aria-labelledby="ssf-region" />
          <MiText variant="caption" tone="label2" tabular class="ssf__latency">{{ latency }} ms</MiText>
        </div>
      </section>

      <div class="ssf__bottom">
        <nav class="ssf__links" aria-label="Footer">
          <a href="#">Docs</a><a href="#">API reference</a><a href="#">Changelog</a><a href="#">Support</a>
        </nav>
        <MiText variant="caption" tone="label2" class="ssf__legal">
          Press <MiKbd>?</MiKbd> for shortcuts · © 2027 Parcelwise Ltd.
        </MiText>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// Sixty days ending on Monday 1 February 2027; incidents keyed by day index (oldest first).
const incidents: Record<number, [number, string]> = {
  9: [99.95, 'Dashboard sign-in slow for 4 minutes'],
  23: [98.91, 'Label API returned errors for 42 minutes in eu-west-3'],
  41: [99.82, 'Webhook deliveries delayed by up to 14 minutes'],
  57: [99.97, 'Tracking map tiles failed to load for 2 minutes']
}
const end = new Date(2027, 1, 1)
const fmt = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
const days = Array.from({ length: 60 }, (_, i) => {
  const d = new Date(end)
  d.setDate(end.getDate() - (59 - i))
  const hit = incidents[i]
  const uptime = hit ? hit[0] : 100
  return { date: fmt(d), uptime, note: hit ? hit[1] : 'No incidents', tone: uptime === 100 ? 'ok' : uptime >= 99.5 ? 'minor' : 'major' }
})

const pick = ref(41)
const bars: HTMLButtonElement[] = []
function setBar(el: unknown, i: number) { if (el instanceof HTMLButtonElement) bars[i] = el }
const day = computed(() => days[pick.value]!)
const average = computed(() => (days.reduce((a, d) => a + d.uptime, 0) / days.length).toFixed(2))
const overall = { label: 'All systems normal', tone: 'ok' }

function move(step: number) {
  pick.value = Math.min(days.length - 1, Math.max(0, pick.value + step))
  bars[pick.value]?.focus()
}

const regions = [
  { id: 'eu-west-3', label: 'eu-west-3 · Paris', ms: 38 },
  { id: 'us-east-1', label: 'us-east-1 · Virginia', ms: 112 },
  { id: 'ap-southeast-2', label: 'ap-southeast-2 · Sydney', ms: 286 }
]
const region = ref<string | number | null>('eu-west-3')
const latency = computed(() => regions.find(r => r.id === region.value)?.ms ?? 0)
</script>

<style scoped>
.ssf { container-type: inline-size; display: grid; gap: 0; font-family: var(--mi-font); color: var(--mi-label); border-radius: var(--mi-radius-xl); overflow: hidden; background: var(--mi-page); box-shadow: 0 0 0 1px var(--mi-sep); }
.ssf__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.ssf__page { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; padding: 18px; }
.ssf__ghost { height: 72px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ssf__ghost.is-wide { grid-column: 1 / -1; height: 44px; opacity: .6; }

.ssf__foot { display: grid; gap: 18px; padding: 18px; background: var(--mi-card); border-top: 1px solid var(--mi-sep); }

.ssf__status { display: grid; gap: 10px; min-width: 0; }
.ssf__status-head { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; }
.ssf__avg { margin-left: auto; }
.ssf__beacon { position: relative; width: 10px; height: 10px; border-radius: 50%; background: var(--mi-green); }
.ssf__beacon::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: inherit; animation: ssf-ping 2.4s var(--mi-ease) infinite; }
@keyframes ssf-ping { 0% { transform: scale(1); opacity: .6; } 70%, 100% { transform: scale(2.6); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .ssf__beacon::after { animation: none; } }

.ssf__strip { display: flex; align-items: stretch; gap: 2px; height: 28px; }
.ssf__bar { flex: 1 1 0; min-width: 0; padding: 0; border: 0; border-radius: 2px; background: var(--mi-green); opacity: .75; cursor: pointer; transform-origin: bottom; transition: transform var(--mi-dur-2) var(--mi-spring), opacity var(--mi-dur-1) linear; }
.ssf__bar.is-minor { background: var(--mi-orange); opacity: .9; }
.ssf__bar.is-major { background: var(--mi-red); opacity: .9; }
.ssf__bar:hover { opacity: 1; }
.ssf__bar.is-on { opacity: 1; transform: scaleY(1.18); }
.ssf__bar:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.ssf__detail { margin: 0; font-size: 13px; line-height: 1.4; color: var(--mi-label2); }
.ssf__detail b { color: var(--mi-label); font-weight: 600; }
.ssf__num { font-variant-numeric: tabular-nums; }

.ssf__meta { display: grid; gap: 12px; }
.ssf__build, .ssf__region { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.ssf__build > :first-child, .ssf__region > :first-child { width: 56px; }
.ssf__code { padding: 3px 8px; border-radius: 6px; background: var(--mi-fill4); font: 500 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; }
.ssf__region :deep(select) { max-width: 220px; }
.ssf__latency { min-width: 48px; }

.ssf__bottom { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 20px; padding-top: 14px; border-top: 1px solid var(--mi-sep); }
.ssf__links { display: flex; flex-wrap: wrap; gap: 6px 18px; }
.ssf__links a { color: var(--mi-label2); font-size: 13px; font-weight: 500; text-decoration: none; }
.ssf__links a:hover { color: var(--mi-label); }
.ssf__links a:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; border-radius: 4px; }
.ssf__legal { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 4px; }

@container (min-width: 760px) {
  .ssf__page { grid-template-columns: repeat(3, minmax(0, 1fr)); padding: 24px; }
  .ssf__ghost.is-wide { grid-column: auto; height: 72px; opacity: 1; }
  .ssf__foot { grid-template-columns: minmax(0, 1fr) auto; column-gap: 48px; padding: 20px 24px; }
  .ssf__bottom { grid-column: 1 / -1; }
  .ssf__meta { align-content: start; }
}
</style>

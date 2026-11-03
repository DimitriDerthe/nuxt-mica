<template>
  <div class="mi:@container mi:grid mi:content-start mi:gap-0 mi:font-mi mi:text-label mi:rounded-xl mi:overflow-hidden mi:bg-page mi:shadow-[0_0_0_1px_var(--mi-sep)]">
    <!-- Faux end of a dashboard page, so the footer is seen in place. -->
    <div class="mi:grid mi:grid-cols-2 mi:gap-3 mi:p-4.5 mi:@[760px]:grid-cols-3 mi:@[760px]:p-6" aria-hidden="true">
      <span class="mi:h-18 mi:rounded-lg mi:bg-card mi:shadow-1" /><span class="mi:h-18 mi:rounded-lg mi:bg-card mi:shadow-1" /><span class="mi:rounded-lg mi:bg-card mi:shadow-1 mi:col-span-full mi:h-11 mi:opacity-60 mi:@[760px]:col-[auto] mi:@[760px]:h-18 mi:@[760px]:opacity-100" />
    </div>

    <footer class="mi:grid mi:gap-4.5 mi:p-4.5 mi:bg-card mi:border-t mi:border-t-sep mi:@[760px]:grid-cols-[minmax(0,_1fr)_auto] mi:@[760px]:gap-x-12 mi:@[760px]:py-5 mi:@[760px]:px-6" aria-labelledby="ssf-title">
      <h2 id="ssf-title" class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Service status and app information</h2>

      <section class="mi:grid mi:gap-2.5 mi:min-w-0" aria-label="Uptime">
        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-1 mi:gap-x-2.5">
          <span class="mi:relative mi:w-2.5 mi:h-2.5 mi:rounded-[50%] mi:bg-green mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[50%] mi:after:bg-inherit mi:after:opacity-60 mi:after:[--mi-out-s:2.6] mi:after:animate-[out_2.4s_var(--mi-ease)_infinite] mi:motion-reduce:after:animate-none mi:motion-reduce:after:opacity-100" aria-hidden="true" />
          <MiText variant="subheadline" weight="semibold">{{ overall.label }}</MiText>
          <MiText variant="caption" tone="label2" tabular class="mi:ml-auto!">{{ average }}% over 60 days</MiText>
        </div>
        <!-- Uptime strip: one bar per day, roving focus with the arrow keys. -->
        <div class="mi:flex mi:items-stretch mi:gap-0.5 mi:h-7" role="group" aria-label="Daily uptime, last 60 days" @keydown.left.prevent="move(-1)" @keydown.right.prevent="move(1)">
          <button
            v-for="(d, i) in days" :key="i" :ref="el => setBar(el, i)" type="button" class="mi:flex-[1_1_0] mi:min-w-0 mi:p-0 mi:[border:0] mi:rounded-[2px] mi:cursor-pointer mi:origin-bottom mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring),_opacity_var(--mi-dur-1)_linear] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]"
            :class="[d.tone === 'minor' ? 'mi:bg-orange' : d.tone === 'major' ? 'mi:bg-red' : 'mi:bg-green', i === pick ? 'mi:opacity-100 mi:transform-[scaleY(1.18)]' : d.tone === 'ok' ? 'mi:opacity-75 mi:hover:opacity-100' : 'mi:opacity-90 mi:hover:opacity-100']" :tabindex="i === pick ? 0 : -1" :aria-label="`${d.date}: ${d.uptime}% uptime`"
            :aria-pressed="i === pick" @click="pick = i"
          />
        </div>
        <p class="mi:m-0 mi:text-[13px] mi:leading-[1.4] mi:text-label2" aria-live="polite">
          <b class="mi:text-label mi:font-semibold">{{ day.date }}</b> · <span class="mi:tabular-nums">{{ day.uptime }}%</span> · {{ day.note }}
        </p>
      </section>

      <section class="mi:grid mi:gap-3 mi:@[760px]:content-start" aria-label="Build and region">
        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2">
          <MiText variant="caption" tone="label2" class="mi:w-14!">Version</MiText>
          <code class="mi:py-[3px] mi:px-2 mi:rounded-[6px] mi:bg-fill4 mi:[font:500_12px/1.4_ui-monospace,_SFMono-Regular,_Menlo,_monospace]">v4.12.0 · 8f3c21e</code>
          <MiCopyButton value="4.12.0+8f3c21e" icon-only variant="ghost" label="Copy build id" copied-label="Build id copied" />
        </div>
        <div class="mi:[&_select]:max-w-55! mi:flex mi:flex-wrap mi:items-center mi:gap-2">
          <MiText id="ssf-region" variant="caption" tone="label2" class="mi:w-14!">Region</MiText>
          <MiNativeSelect v-model="region" size="sm" :options="regions.map(r => ({ value: r.id, label: r.label }))" aria-labelledby="ssf-region" />
          <MiText variant="caption" tone="label2" tabular class="mi:min-w-12">{{ latency }} ms</MiText>
        </div>
      </section>

      <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2.5 mi:gap-x-5 mi:pt-3.5 mi:border-t mi:border-t-sep mi:@[760px]:col-span-full">
        <nav class="mi:flex mi:flex-wrap mi:gap-y-1.5 mi:gap-x-4.5" aria-label="Footer">
          <a class="mi:text-label2 mi:text-[13px] mi:font-medium mi:[text-decoration:none] mi:hover:text-label mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px]" href="#">Docs</a><a class="mi:text-label2 mi:text-[13px] mi:font-medium mi:[text-decoration:none] mi:hover:text-label mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px]" href="#">API reference</a><a class="mi:text-label2 mi:text-[13px] mi:font-medium mi:[text-decoration:none] mi:hover:text-label mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px]" href="#">Changelog</a><a class="mi:text-label2 mi:text-[13px] mi:font-medium mi:[text-decoration:none] mi:hover:text-label mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px]" href="#">Support</a>
        </nav>
        <MiText variant="caption" tone="label2" class="mi:inline-flex! mi:flex-wrap mi:items-center mi:gap-1">
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

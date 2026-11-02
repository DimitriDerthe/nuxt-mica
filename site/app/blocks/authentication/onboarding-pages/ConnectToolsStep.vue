<template>
  <section class="cts" aria-labelledby="cts-title">
    <div class="cts__in">
      <header class="cts__head">
        <MiText variant="caption" weight="semibold" tone="primary" class="cts__kicker">Step 3 of 4 · Integrations</MiText>
        <MiText id="cts-title" as="h2" variant="title1" weight="bold" balance>Bring your tools along</MiText>
        <MiText variant="subheadline" tone="label2">Connect what Kestrel Labs already uses. Fernway only reads what each project needs, and you can disconnect any time.</MiText>
      </header>

      <!-- Hours meter: each connection adds its own segment, measured against a full workday. -->
      <aside class="cts__meter" aria-labelledby="cts-meter-title">
        <div class="cts__meter-top">
          <MiText id="cts-meter-title" as="h3" variant="footnote" weight="semibold" tone="label2">Estimated time saved</MiText>
          <p class="cts__hours" aria-live="polite"><span class="cts__hours-num">{{ hours.toFixed(1) }}</span><span class="cts__hours-unit">h / week</span></p>
        </div>
        <div
          class="cts__track" role="meter" aria-label="Hours saved per week" :aria-valuenow="+hours.toFixed(1)" aria-valuemin="0" :aria-valuemax="MAX"
          :aria-valuetext="`${hours.toFixed(1)} hours a week`"
        >
          <span
            v-for="(t, i) in tools" :key="t.id" class="cts__seg"
            :style="{ transform: `scaleX(${ends[i]! / MAX})`, zIndex: tools.length - i, background: t.color }"
          />
          <span v-for="(t, i) in tools" :key="'cut-' + t.id" class="cts__cut" :class="{ 'is-on': t.on }" :style="{ transform: `translateX(${ends[i]! / MAX * 100}%)` }" />
          <span class="cts__day" :style="{ transform: `translateX(${8 / MAX * 100}%)` }" />
        </div>
        <div class="cts__scale" aria-hidden="true">
          <span>0 h</span>
          <span class="cts__day-label" :style="{ transform: `translateX(${8 / MAX * 100}%)` }"><span>a full workday</span></span>
        </div>
        <ul v-if="connected.length" class="cts__legend">
          <li v-for="t in connected" :key="t.id"><i :style="{ background: t.color }" />{{ t.name }}<b>{{ t.hours.toFixed(1) }} h</b></li>
        </ul>
        <MiText v-else variant="caption" tone="label3">Turn on a tool to see what it gives back.</MiText>
        <div v-if="best" class="cts__best">
          <span class="cts__mark cts__mark--sm" :style="{ '--tint': best.color }" aria-hidden="true">{{ best.mark }}</span>
          <MiText as="span" variant="footnote" tone="label2" class="cts__best-copy">Biggest gain left: <strong>{{ best.name }}</strong>, +{{ best.hours.toFixed(1) }} h</MiText>
          <MiButton variant="tinted" size="small" :disabled="!!busy" @click="toggle(best.id, true)">Connect</MiButton>
        </div>
        <MiText variant="caption" tone="label3" class="cts__basis">Median for 2,400 teams of 2–10 people in their first month.</MiText>
      </aside>

      <ul class="cts__grid" aria-label="Integrations">
        <li v-for="t in tools" :key="t.id" class="cts__tool" :class="{ 'is-on': t.on }">
          <span class="cts__mark" :style="{ '--tint': t.color }" aria-hidden="true">{{ t.mark }}</span>
          <div class="cts__tool-copy">
            <span :id="'cts-n-' + t.id" class="cts__tool-name">{{ t.name }}</span>
            <span class="cts__tool-desc">{{ t.desc }}</span>
            <span class="cts__status" aria-live="polite">
              <template v-if="busy === t.id"><MiSpinner size="sm" label="" /> Connecting…</template>
              <template v-else-if="t.on"><i class="cts__ok" />{{ t.detail }}</template>
              <template v-else><span class="cts__gain">+{{ t.hours.toFixed(1) }} h a week</span></template>
            </span>
          </div>
          <MiSwitch
            :model-value="t.on || busy === t.id" size="compact" :disabled="!!busy && busy !== t.id"
            :label="`${t.on ? 'Disconnect' : 'Connect'} ${t.name}`" @update:model-value="toggle(t.id, $event)"
          />
        </li>
      </ul>

      <footer class="cts__foot">
        <MiButton variant="plain" @click="step = Math.max(0, step - 1)">
          <template #leading><MiIcon name="arrow-left" :size="15" /></template>
          Back
        </MiButton>
        <ol class="cts__dots" aria-label="Onboarding progress">
          <li v-for="n in 4" :key="n" :class="{ 'is-on': n - 1 === step, 'is-done': n - 1 < step }" :aria-current="n - 1 === step ? 'step' : undefined">
            <span class="sr-only">Step {{ n }} of 4</span>
          </li>
        </ol>
        <MiButton :variant="connected.length ? 'filled' : 'gray'" @click="step = Math.min(3, step + 1)">
          {{ connected.length ? `Continue with ${connected.length}` : 'Skip for now' }}
          <template #trailing><MiIcon name="arrow-right" :size="15" /></template>
        </MiButton>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

interface Tool { id: string, name: string, mark: string, color: string, desc: string, detail: string, hours: number, on: boolean }

const MAX = 9.5
const tools = ref<Tool[]>([
  { id: 'slack', name: 'Slack', mark: 'S', color: 'var(--mi-purple)', desc: 'Standups and launch digests post to your channels.', detail: '#launch-room, #eng', hours: 1.5, on: true },
  { id: 'github', name: 'GitHub', mark: 'Gh', color: 'var(--mi-label2)', desc: 'Pull requests link to tasks and close them on merge.', detail: 'kestrel-labs · 14 repos', hours: 2.5, on: true },
  { id: 'linear', name: 'Linear', mark: 'L', color: 'var(--mi-indigo)', desc: 'Two-way sync for issues, cycles and estimates.', detail: 'Team KES', hours: 1.0, on: false },
  { id: 'figma', name: 'Figma', mark: 'F', color: 'var(--mi-pink)', desc: 'Live frames inside specs, with comments kept in sync.', detail: '3 projects', hours: 1.5, on: false },
  { id: 'notion', name: 'Notion', mark: 'N', color: 'var(--mi-orange)', desc: 'Import the product wiki and keep its backlinks.', detail: 'Product wiki', hours: 0.8, on: false },
  { id: 'calendar', name: 'Google Calendar', mark: 'Ca', color: 'var(--mi-teal)', desc: 'Blocks focus time around milestones and reviews.', detail: 'amara@kestrel.dev', hours: 1.2, on: false }
])
const busy = ref<string | null>(null)
const step = ref(2)
let timer: ReturnType<typeof setTimeout> | undefined

const best = computed(() => tools.value.filter(t => !t.on && busy.value !== t.id).sort((a, b) => b.hours - a.hours)[0])
const connected = computed(() => tools.value.filter(t => t.on))
const hours = computed(() => connected.value.reduce((n, t) => n + t.hours, 0))
// Cumulative end of each tool's segment; unconnected tools end where the previous one did.
const ends = computed(() => {
  let sum = 0
  return tools.value.map(t => (sum += t.on ? t.hours : 0))
})

function toggle(id: string, on: boolean) {
  const t = tools.value.find(x => x.id === id)
  if (!t) return
  if (!on) { t.on = false; return }
  busy.value = id
  // UI demo only: nothing is sent anywhere.
  timer = setTimeout(() => { t.on = true; busy.value = null }, 700)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.cts { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.cts__in { display: grid; gap: 20px; grid-template-areas: "head" "meter" "grid" "foot"; }
.cts__head { grid-area: head; display: grid; gap: 6px; max-width: 620px; }
.cts__kicker { letter-spacing: .02em; }

/* Meter */
.cts__meter {
  grid-area: meter; display: grid; align-content: start; gap: 12px; padding: 18px; border-radius: var(--mi-radius-xl);
  background: radial-gradient(100% 90% at 100% 0%, var(--mi-p-tint), transparent 65%), var(--mi-card);
  box-shadow: 0 0 0 1px var(--mi-sep), var(--mi-sh1);
}
.cts__meter-top { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; }
.cts__hours { display: flex; align-items: baseline; gap: 6px; margin: 0; }
.cts__hours-num { font-size: 34px; line-height: 1; font-weight: 700; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.cts__hours-unit { font-size: 13px; font-weight: 500; color: var(--mi-label2); }
.cts__track { position: relative; height: 12px; border-radius: 6px; overflow: hidden; background: var(--mi-fill3); }
.cts__seg { position: absolute; inset: 0; transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.cts__cut { position: absolute; inset: 0; pointer-events: none; z-index: 20; opacity: 0; transition: transform var(--mi-dur-4) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease); }
.cts__cut.is-on { opacity: 1; }
.cts__cut::before { content: ""; position: absolute; top: 0; bottom: 0; left: -1px; width: 2px; background: var(--mi-card); }
.cts__day { position: absolute; inset: 0; z-index: 21; pointer-events: none; }
.cts__day::before { content: ""; position: absolute; top: 2px; bottom: 2px; left: -1px; width: 2px; border-radius: 1px; background: var(--mi-label); opacity: .55; }
.cts__scale { position: relative; display: flex; height: 16px; overflow: hidden; margin-top: -4px; font-size: 11px; color: var(--mi-label3); }
.cts__day-label { position: absolute; inset: 0; pointer-events: none; }
.cts__day-label span { position: absolute; right: 100%; margin-right: -1px; padding-right: 0; white-space: nowrap; transform: translateX(50%); }
.cts__legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin: 0; padding: 0; list-style: none; font-size: 12px; color: var(--mi-label2); }
.cts__legend li { display: inline-flex; align-items: center; gap: 6px; }
.cts__legend i { width: 8px; height: 8px; border-radius: 2px; }
.cts__legend b { font-weight: 600; color: var(--mi-label); font-variant-numeric: tabular-nums; }
.cts__basis { padding-top: 10px; border-top: 1px solid var(--mi-sep); }
.cts__best { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 10px 10px 10px 10px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.cts__best-copy strong { color: var(--mi-label); font-weight: 600; }
.cts__mark--sm { width: 26px; height: 26px; border-radius: 8px; font-size: 11px; }

/* Tools */
.cts__grid { grid-area: grid; display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; align-content: start; }
.cts__tool {
  position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: start; gap: 12px; padding: 14px;
  border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep);
}
.cts__tool::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0;
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--mi-green) 55%, transparent); transition: opacity var(--mi-dur-3) var(--mi-ease);
}
.cts__tool.is-on::after { opacity: 1; }
.cts__mark {
  display: grid; place-items: center; width: 38px; height: 38px; border-radius: 11px; font-size: 14px; font-weight: 700; letter-spacing: -.02em;
  color: var(--tint); background: color-mix(in srgb, var(--tint) 14%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tint) 22%, transparent);
}
.cts__tool-copy { display: grid; gap: 3px; min-width: 0; }
.cts__tool-name { font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
.cts__tool-desc { font-size: 13px; line-height: 1.4; color: var(--mi-label2); }
.cts__status { display: inline-flex; align-items: center; gap: 6px; min-height: 18px; margin-top: 4px; font-size: 12px; font-weight: 500; color: var(--mi-green-t, var(--mi-green)); }
.cts__ok { width: 6px; height: 6px; border-radius: 50%; background: var(--mi-green); }
.cts__gain { color: var(--mi-label3); font-variant-numeric: tabular-nums; }

/* Footer */
.cts__foot { grid-area: foot; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; padding-top: 16px; border-top: 1px solid var(--mi-sep); }
.cts__dots { display: flex; justify-content: center; gap: 6px; margin: 0; padding: 0; list-style: none; }
.cts__dots li { width: 7px; height: 7px; border-radius: 4px; background: var(--mi-fill); transition: transform var(--mi-dur-3) var(--mi-spring); }
.cts__dots li.is-done { background: color-mix(in srgb, var(--mi-p) 45%, var(--mi-fill)); }
.cts__dots li.is-on { width: 22px; background: var(--mi-p); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

@container (min-width: 560px) {
  .cts__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cts__meter { padding: 20px 22px; }
}
@container (min-width: 900px) {
  .cts__in { grid-template-columns: minmax(0, 1fr) 290px; grid-template-areas: "head head" "grid meter" "foot foot"; column-gap: 24px; row-gap: 22px; }
  .cts__meter { align-self: stretch; grid-template-rows: auto auto auto auto 1fr auto; padding: 22px; gap: 14px; }
  .cts__best { align-self: end; }
  .cts__hours { flex-basis: 100%; }
  .cts__hours-num { font-size: 44px; }
}
@container (min-width: 1100px) { .cts__in { grid-template-columns: minmax(0, 1fr) 320px; column-gap: 32px; } }
</style>

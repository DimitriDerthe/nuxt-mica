<template>
  <section class="sl" aria-labelledby="sl-title">
    <header class="sl__head">
      <div>
        <MiText id="sl-title" variant="title3" as="h2" weight="semibold">Support load by hour</MiText>
        <MiText variant="footnote" tone="label2">Helpdesk · tickets opened per 2-hour window, 4-week average</MiText>
      </div>
      <MiSegmented v-model="day" label="Days" :options="days" />
    </header>

    <div class="sl__filters" role="group" aria-label="Channels">
      <MiText variant="caption" tone="label2" weight="medium" as="span">Channels</MiText>
      <MiChip
        v-for="c in channels" :key="c.id" selectable size="small" tone="neutral"
        :label="c.label" :model-value="on[c.id]" @update:model-value="toggle(c.id, $event)"
      />
    </div>

    <div class="sl__body">
      <div class="sl__chart">
        <MiBarChart
          :data="bars" :card="false" :height="236" :max="scaleMax" :ticks="3" :max-bar-width="28"
          value-labels="peak" :format-value="(v) => v + ' tickets'"
          :aria-label="`Tickets per window, ${overCount} of 12 windows over staffed capacity`"
        />
        <MiChartLegend :items="legend" class="sl__legend" aria-label="Bar colors" />
      </div>

      <aside class="sl__side" aria-labelledby="sl-side-title">
        <MiText id="sl-side-title" variant="headline" as="h3" class="sl__sr">Summary</MiText>
        <dl class="sl__facts">
          <div>
            <dt>Tickets a day</dt>
            <dd>{{ total }}</dd>
          </div>
          <div>
            <dt>Busiest window</dt>
            <dd>{{ peak.label }}<small> · {{ peak.value }}</small></dd>
          </div>
          <div>
            <dt>Hours over capacity</dt>
            <dd :class="{ 'is-over': overCount > 0 }">{{ overCount * 2 }} h</dd>
          </div>
        </dl>

        <!-- The memorable bit: the chart turns into a staffing move you can act on. -->
        <article class="sl__tip" aria-live="polite">
          <div class="sl__tip-icon" aria-hidden="true">
            <MiIcon :svg="swapIcon" :size="18" />
          </div>
          <div class="sl__tip-copy">
            <MiText variant="subheadline" weight="semibold" as="h3">{{ advice.title }}</MiText>
            <MiText variant="footnote" tone="label2">{{ advice.body }}</MiText>
          </div>
          <MiButton v-if="advice.action" variant="tinted" size="small" @click="applied = advice.key">
            {{ applied === advice.key ? 'Drafted' : advice.action }}
          </MiButton>
        </article>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Channel = 'email' | 'chat' | 'phone'

const days = [{ value: 'weekdays', label: 'Weekdays' }, { value: 'weekend', label: 'Weekend' }]
const day = ref<string | number | null>('weekdays')

const channels: { id: Channel, label: string }[] = [
  { id: 'email', label: 'Email' }, { id: 'chat', label: 'Chat' }, { id: 'phone', label: 'Phone' }
]
const on = reactive<Record<Channel, boolean>>({ email: true, chat: true, phone: true })
// Keep at least one channel selected so the chart never goes blank.
function toggle (id: Channel, value: boolean) {
  if (!value && channels.filter(c => on[c.id]).length === 1) return
  on[id] = value
}

const windows = ['12a', '2a', '4a', '6a', '8a', '10a', '12p', '2p', '4p', '6p', '8p', '10p']
// One agent clears about 10 tickets per 2-hour window.
const PER_AGENT = 10

// Sample data; swap for your helpdesk export.
const load = {
  weekdays: {
    email: [4, 3, 2, 8, 22, 30, 28, 26, 22, 14, 9, 6],
    chat: [2, 1, 1, 6, 30, 44, 40, 46, 38, 20, 10, 5],
    phone: [0, 0, 0, 3, 18, 26, 22, 24, 20, 8, 0, 0],
    capacity: [10, 10, 10, 30, 80, 90, 110, 90, 90, 60, 30, 20]
  },
  weekend: {
    email: [3, 2, 1, 2, 6, 10, 12, 11, 9, 8, 6, 4],
    chat: [3, 2, 1, 3, 10, 18, 24, 22, 18, 14, 9, 5],
    phone: [0, 0, 0, 0, 4, 6, 6, 5, 4, 0, 0, 0],
    capacity: [10, 10, 10, 10, 30, 40, 30, 30, 40, 30, 20, 10]
  }
} as const

const set = computed(() => load[(day.value ?? 'weekdays') as keyof typeof load])
const sums = computed(() => windows.map((_, i) => channels.reduce((n, c) => n + (on[c.id] ? set.value[c.id][i]! : 0), 0)))

const under = 'color-mix(in srgb, var(--mi-p) 62%, var(--mi-card))'
const over = 'var(--mi-s)'
const legend = [
  { label: 'Within staffed capacity', color: under, shape: 'square' as const },
  { label: 'Over capacity', color: over, shape: 'square' as const }
]

const bars = computed(() => windows.map((label, i) => ({
  label, value: sums.value[i]!, color: sums.value[i]! > set.value.capacity[i]! ? over : under
})))
// Fixed scale per day type, so switching channels shows real change instead of a rescaled axis.
const scaleMax = computed(() => (day.value === 'weekend' ? 60 : 120))

const total = computed(() => sums.value.reduce((a, b) => a + b, 0).toLocaleString('en-US'))
const peak = computed(() => bars.value.reduce((a, b) => (b.value > a.value ? b : a)))
const overCount = computed(() => bars.value.filter(b => b.color === over).length)

const applied = ref('')
const advice = computed(() => {
  const gaps = windows.map((label, i) => ({ label, gap: set.value.capacity[i]! - sums.value[i]! }))
  const worst = gaps.reduce((a, b) => (b.gap < a.gap ? b : a))
  if (worst.gap >= 0) return { key: '', title: 'Staffing covers every window', body: 'No 2-hour window opens more tickets than the team can clear.', action: '' }
  const spare = gaps.reduce((a, b) => (b.gap > a.gap ? b : a))
  const need = Math.ceil(-worst.gap / PER_AGENT)
  const movable = Math.min(need, Math.floor(spare.gap / PER_AGENT))
  const plural = (n: number) => (n === 1 ? '1 agent' : n + ' agents')
  if (movable >= 1) {
    return {
      key: `${day.value}-${spare.label}-${worst.label}-${movable}`,
      title: `Move ${plural(movable)} from ${spare.label} to ${worst.label}`,
      body: `${worst.label} opens ${-worst.gap} more tickets than it can clear, while ${spare.label} has room for ${spare.gap}.`,
      action: 'Draft rota change'
    }
  }
  return {
    key: `${day.value}-add-${worst.label}-${need}`,
    title: `Add ${plural(need)} at ${worst.label}`,
    body: `${worst.label} runs ${-worst.gap} tickets over, and no other window has a full agent to spare.`,
    action: 'Request cover'
  }
})

const swapIcon = '<path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 4 4"/><path d="m17 20 4-4-4-4"/><path d="M21 16H8a4 4 0 0 1-4-4"/>'
</script>

<style scoped>
.sl { container-type: inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.sl__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.sl__filters { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.sl__body { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 820px) { .sl__body { grid-template-columns: minmax(0, 1fr) 300px; } }

.sl__chart { display: grid; gap: 10px; min-width: 0; padding: 18px 18px 14px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.sl__legend { justify-self: start; }

.sl__side { display: grid; gap: 12px; align-content: start; }
.sl__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.sl__facts { display: grid; grid-template-columns: minmax(0, 1fr); margin: 0; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.sl__facts > div { display: grid; gap: 4px; padding: 14px 16px; min-width: 0; }
.sl__facts > div + div { border-top: 1px solid var(--mi-sep); }
@container (min-width: 520px) and (max-width: 819px) {
  .sl__facts { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .sl__facts > div + div { border-top: 0; border-left: 1px solid var(--mi-sep); }
}
.sl__facts dt { font-size: 12px; font-weight: 500; color: var(--mi-label2); }
.sl__facts dd { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.sl__facts dd small { font-size: 13px; font-weight: 500; letter-spacing: 0; color: var(--mi-label2); }
.sl__facts dd.is-over { color: var(--mi-s-text); }

.sl__tip {
  display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px 12px; padding: 16px; border-radius: var(--mi-radius-l);
  background: color-mix(in srgb, var(--mi-s) 9%, var(--mi-card)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mi-s) 22%, transparent);
}
.sl__tip-icon { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 10px; background: var(--mi-s); color: var(--mi-s-on); }
.sl__tip-copy { display: grid; gap: 2px; }
.sl__tip > :nth-child(3) { grid-column: 2; justify-self: start; }
</style>

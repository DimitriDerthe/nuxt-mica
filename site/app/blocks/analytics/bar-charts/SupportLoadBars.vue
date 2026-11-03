<template>
  <section class="sl mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="sl-title">
    <header class="sl__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="sl-title" variant="title3" as="h2" weight="semibold">Support load by hour</MiText>
        <MiText variant="footnote" tone="label2">Helpdesk · tickets opened per 2-hour window, 4-week average</MiText>
      </div>
      <MiSegmented v-model="day" label="Days" :options="days" />
    </header>

    <div class="sl__filters mi:flex mi:flex-wrap mi:items-center mi:gap-2" role="group" aria-label="Channels">
      <MiText variant="caption" tone="label2" weight="medium" as="span">Channels</MiText>
      <MiChip
        v-for="c in channels" :key="c.id" selectable size="small" tone="neutral"
        :label="c.label" :model-value="on[c.id]" @update:model-value="toggle(c.id, $event)"
      />
    </div>

    <div class="sl__body mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[820px]:grid-cols-[minmax(0,_1fr)_300px]">
      <div class="sl__chart mi:grid mi:gap-2.5 mi:min-w-0 mi:pt-4.5 mi:px-4.5 mi:pb-3.5 mi:rounded-xl mi:bg-card mi:shadow-1">
        <MiBarChart
          :data="bars" :card="false" :height="236" :max="scaleMax" :ticks="3" :max-bar-width="28"
          value-labels="peak" :format-value="(v) => v + ' tickets'"
          :aria-label="`Tickets per window, ${overCount} of 12 windows over staffed capacity`"
        />
        <MiChartLegend :items="legend" class="sl__legend" aria-label="Bar colors" />
      </div>

      <aside class="sl__side mi:grid mi:gap-3 mi:content-start" aria-labelledby="sl-side-title">
        <MiText id="sl-side-title" variant="headline" as="h3" class="sl__sr mi:absolute mi:w-px mi:h-px mi:[clip-path:inset(50%)]">Summary</MiText>
        <dl class="sl__facts mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:m-0 mi:rounded-lg mi:bg-card mi:shadow-1 mi:[@container_(min-width:_520px)_and_(max-width:_819px)]:grid-cols-3">
          <div class="mi:[.sl__facts>&]:grid mi:[.sl__facts>&]:gap-1 mi:[.sl__facts>&]:py-3.5 mi:[.sl__facts>&]:px-4 mi:[.sl__facts>&]:min-w-0">
            <dt class="mi:[.sl__facts_&]:text-[12px] mi:[.sl__facts_&]:text-label2">Tickets a day</dt>
            <dd class="mi:[.sl__facts_&]:m-0 mi:[.sl__facts_&]:text-[22px] mi:[.sl__facts_&]:tracking-[-.03em] mi:[.sl__facts_&]:tabular-nums">{{ total }}</dd>
          </div>
          <div class="mi:[.sl__facts>&]:grid mi:[.sl__facts>&]:gap-1 mi:[.sl__facts>&]:py-3.5 mi:[.sl__facts>&]:px-4 mi:[.sl__facts>&]:min-w-0">
            <dt class="mi:[.sl__facts_&]:text-[12px] mi:[.sl__facts_&]:text-label2">Busiest window</dt>
            <dd class="mi:[.sl__facts_&]:m-0 mi:[.sl__facts_&]:text-[22px] mi:[.sl__facts_&]:tracking-[-.03em] mi:[.sl__facts_&]:tabular-nums">{{ peak.label }}<small class="mi:[.sl__facts_dd_&]:text-[13px] mi:[.sl__facts_dd_&]:tracking-[0] mi:[.sl__facts_dd_&]:text-label2"> · {{ peak.value }}</small></dd>
          </div>
          <div class="mi:[.sl__facts>&]:grid mi:[.sl__facts>&]:gap-1 mi:[.sl__facts>&]:py-3.5 mi:[.sl__facts>&]:px-4 mi:[.sl__facts>&]:min-w-0">
            <dt class="mi:[.sl__facts_&]:text-[12px] mi:[.sl__facts_&]:text-label2">Hours over capacity</dt>
            <dd class="mi:[.sl__facts_&]:m-0 mi:[.sl__facts_&]:text-[22px] mi:[.sl__facts_&]:tracking-[-.03em] mi:[.sl__facts_&]:tabular-nums" :class="{ 'is-over mi:[.sl__facts_&]:text-s-text': overCount > 0 }">{{ overCount * 2 }} h</dd>
          </div>
        </dl>

        <!-- The memorable bit: the chart turns into a staffing move you can act on. -->
        <article class="sl__tip mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:gap-y-2.5 mi:gap-x-3 mi:p-4 mi:rounded-lg mi:[background:color-mix(in_srgb,_var(--mi-s)_9%,_var(--mi-card))] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-s)_22%,_transparent)]" aria-live="polite">
          <div class="sl__tip-icon mi:grid mi:place-items-center mi:w-8 mi:h-8 mi:rounded-[10px] mi:bg-s mi:text-s-on" aria-hidden="true">
            <MiIcon :svg="swapIcon" :size="18" />
          </div>
          <div class="sl__tip-copy mi:grid mi:gap-0.5">
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
.sl__legend { justify-self: start; }
.sl__sr { overflow: hidden; white-space: nowrap; }
.sl__facts > div + div { border-top: 1px solid var(--mi-sep); }
@container (min-width: 520px) and (max-width: 819px) {
  .sl__facts > div + div { border-top: 0; border-left: 1px solid var(--mi-sep); }
}
.sl__facts dt { font-weight: 500; }
.sl__facts dd { font-weight: 700; }
.sl__facts dd small { font-weight: 500; }
.sl__tip > :nth-child(3) { grid-column: 2; justify-self: start; }
</style>

<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="lb-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="lb-title" variant="title3" as="h2" weight="semibold">Q3 sales leaderboard</MiText>
        <MiText variant="footnote" tone="label2">Closed-won from Jul 1 to Sep 30 · movement vs Q2</MiText>
      </div>
      <MiSegmented v-model="metric" label="Rank by" :options="metrics" />
    </header>

    <div class="mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[820px]:grid-cols-[300px_minmax(0,_1fr)] mi:@[820px]:items-start">
      <!-- The leader gets a card of their own, with the margin they hold. -->
      <article class="mi:relative mi:grid mi:gap-3 mi:justify-items-start mi:p-5.5 mi:rounded-xl mi:overflow-hidden mi:isolate mi:[background:var(--mi-card)] mi:shadow-1 mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:-z-1 mi:before:[background:radial-gradient(120%_80%_at_100%_0%,_var(--mi-p-tint),_transparent_60%),_radial-gradient(80%_60%_at_0%_100%,_var(--mi-s-tint),_transparent_70%)]" aria-labelledby="lb-leader-name">
        <span class="mi:absolute mi:-top-4.5 mi:right-2.5 mi:-z-1 mi:text-[150px] mi:leading-none mi:font-extrabold mi:tracking-[-.08em] mi:text-p/14 mi:tabular-nums" aria-hidden="true">1</span>
        <MiAvatar :name="leader.name" size="lg" tone="auto" decorative />
        <div class="mi:grid mi:gap-0.5">
          <MiText id="lb-leader-name" variant="title3" as="h3" weight="semibold">{{ leader.name }}</MiText>
          <MiText variant="footnote" tone="label2">{{ leader.region }}</MiText>
        </div>
        <p class="mi:mt-1 mi:mx-0 mi:mb-0 mi:text-[clamp(34px,_8cqi,_46px)] mi:leading-none mi:font-bold mi:tracking-[-.045em] mi:tabular-nums">{{ format(leader.value) }}</p>
        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-2 mi:gap-x-2.5">
          <MiBadge tone="success" variant="tint" :label="`Ahead by ${gapText(leader.value - (ranked[1]?.value ?? 0))}`" />
          <MiText variant="caption" tone="label2">{{ moveText(leader.move, true) }}</MiText>
        </div>
      </article>

      <ol class="mi:relative mi:grid mi:m-0 mi:p-1.5 mi:[list-style:none] mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" :aria-label="`Ranks 2 to ${ranked.length}`">
        <TransitionGroup move-class="mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:motion-reduce:[transition:none]">
          <li v-for="(r, i) in rest" :key="r.name" class="mi:first:border-t-transparent mi:grid mi:grid-cols-[30px_auto_minmax(0,_1fr)] mi:items-center mi:gap-3 mi:py-[11px] mi:px-2.5 mi:border-t" :class="r.you ? 'mi:border-t-transparent mi:rounded-lg mi:[background:color-mix(in_srgb,_var(--mi-p)_9%,_transparent)]' : rest[i - 1]?.you ? 'mi:border-t-transparent' : 'mi:border-t-sep'">
            <div class="mi:grid mi:justify-items-center mi:gap-0.5">
              <span class="mi:text-[17px] mi:font-bold mi:tabular-nums">{{ i + 2 }}</span>
              <span class="mi:inline-flex mi:items-center mi:gap-px mi:text-[11px] mi:font-semibold mi:tabular-nums" :class="r.move > 0 ? 'mi:text-green-t' : r.move < 0 ? 'mi:text-red-t' : 'mi:text-label3'" :aria-label="moveText(r.move)">
                <MiIcon v-if="r.move !== 0" :name="r.move > 0 ? 'arrow-up' : 'arrow-down'" :size="11" :weight="2.6" />
                <template v-if="r.move !== 0">{{ Math.abs(r.move) }}</template>
                <template v-else>–</template>
              </span>
            </div>
            <MiAvatar :name="r.name" size="sm" tone="auto" decorative />
            <div class="mi:grid mi:gap-[5px] mi:min-w-0">
              <div class="mi:flex mi:items-center mi:gap-2 mi:min-w-0">
                <span class="mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[15px] mi:font-semibold">{{ r.name }}</span>
                <MiBadge v-if="r.you" tone="primary" variant="solid" label="You" />
                <span class="mi:ml-auto mi:flex-[none] mi:text-[15px] mi:font-bold mi:tabular-nums">{{ format(r.value) }}</span>
              </div>
              <div class="mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" aria-hidden="true">
                <span class="mi:block mi:h-full mi:rounded-[inherit] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:motion-reduce:[transition:none]" :class="r.you ? 'mi:[background:var(--mi-p)]' : 'mi:[background:color-mix(in_srgb,_var(--mi-p)_70%,_var(--mi-card))]'" :style="{ transform: `scaleX(${r.value / leader.value})` }" />
              </div>
              <MiText variant="caption" tone="label2" :lines="1">
                {{ r.region }} · {{ gapText(r.gap) }} behind {{ firstName(r.ahead) }}
              </MiText>
            </div>
          </li>
        </TransitionGroup>
      </ol>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Metric = 'bookings' | 'deals' | 'winRate'

const metrics = [{ value: 'bookings', label: 'Bookings' }, { value: 'deals', label: 'Deals' }, { value: 'winRate', label: 'Win rate' }]
const metric = ref<string | number | null>('bookings')
const key = computed(() => (metric.value ?? 'bookings') as Metric)

// Sample team; `prev` is each rep's Q2 rank for that metric.
const reps = [
  { name: 'Hannah Lindqvist', region: 'Nordics · Enterprise', bookings: 451300, deals: 11, winRate: 52, prev: { bookings: 2, deals: 7, winRate: 1 } },
  { name: 'Priya Raman', region: 'EMEA · Enterprise', bookings: 412800, deals: 14, winRate: 38, prev: { bookings: 1, deals: 4, winRate: 5 } },
  { name: 'Tomás Herrera', region: 'LATAM · Mid-market', bookings: 386200, deals: 21, winRate: 44, prev: { bookings: 4, deals: 3, winRate: 4 } },
  { name: 'Aiko Tanaka', region: 'APAC · Enterprise', bookings: 344900, deals: 12, winRate: 47, prev: { bookings: 3, deals: 6, winRate: 2 } },
  { name: 'Malik Osei', region: 'UK · Mid-market', bookings: 298400, deals: 18, winRate: 41, you: true, prev: { bookings: 6, deals: 5, winRate: 7 } },
  { name: 'Daniel Brandt', region: 'DACH · Mid-market', bookings: 267100, deals: 19, winRate: 35, prev: { bookings: 5, deals: 2, winRate: 6 } },
  { name: 'Chloé Marchand', region: 'France · SMB', bookings: 221500, deals: 27, winRate: 49, prev: { bookings: 7, deals: 1, winRate: 3 } }
]

const ranked = computed(() => reps
  .map(r => ({ name: r.name, region: r.region, you: !!r.you, value: r[key.value], prev: r.prev[key.value] }))
  .sort((a, b) => b.value - a.value)
  .map((r, i) => ({ ...r, move: r.prev - (i + 1) })))
const leader = computed(() => ranked.value[0]!)
// Each row knows who is directly above it, for the "behind" line.
const rest = computed(() => ranked.value.slice(1).map((r, i) => ({ ...r, ahead: ranked.value[i]?.name ?? '', gap: (ranked.value[i]?.value ?? r.value) - r.value })))

function format (v: number) {
  if (key.value === 'bookings') return '$' + (v / 1000).toFixed(1) + 'k'
  if (key.value === 'deals') return v + ' deals'
  return v + '%'
}
function gapText (v: number) {
  if (key.value === 'bookings') return '$' + (v / 1000).toFixed(1) + 'k'
  if (key.value === 'deals') return v === 1 ? '1 deal' : v + ' deals'
  return v + ' pt'
}
function moveText (move: number, long = false) {
  if (move === 0) return long ? 'Held the top spot from Q2' : 'Same rank as Q2'
  const n = Math.abs(move)
  if (long) return `Was #${1 + move} in Q2`
  return `${move > 0 ? 'Up' : 'Down'} ${n} ${n === 1 ? 'place' : 'places'} since Q2`
}
const firstName = (n: string) => n.split(' ')[0] ?? n
</script>


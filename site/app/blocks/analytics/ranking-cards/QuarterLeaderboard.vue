<template>
  <section class="lb" aria-labelledby="lb-title">
    <header class="lb__head">
      <div>
        <MiText id="lb-title" variant="title3" as="h2" weight="semibold">Q3 sales leaderboard</MiText>
        <MiText variant="footnote" tone="label2">Closed-won from Jul 1 to Sep 30 · movement vs Q2</MiText>
      </div>
      <MiSegmented v-model="metric" label="Rank by" :options="metrics" />
    </header>

    <div class="lb__grid">
      <!-- The leader gets a card of their own, with the margin they hold. -->
      <article class="lb__leader" aria-labelledby="lb-leader-name">
        <span class="lb__crown" aria-hidden="true">1</span>
        <MiAvatar :name="leader.name" size="lg" tone="auto" decorative />
        <div class="lb__leader-text">
          <MiText id="lb-leader-name" variant="title3" as="h3" weight="semibold">{{ leader.name }}</MiText>
          <MiText variant="footnote" tone="label2">{{ leader.region }}</MiText>
        </div>
        <p class="lb__leader-value">{{ format(leader.value) }}</p>
        <div class="lb__leader-foot">
          <MiBadge tone="success" variant="tint" :label="`Ahead by ${gapText(leader.value - (ranked[1]?.value ?? 0))}`" />
          <MiText variant="caption" tone="label2">{{ moveText(leader.move, true) }}</MiText>
        </div>
      </article>

      <ol class="lb__list" :aria-label="`Ranks 2 to ${ranked.length}`">
        <TransitionGroup name="lb-row">
          <li v-for="(r, i) in rest" :key="r.name" class="lb__row" :class="{ 'is-you': r.you }">
            <div class="lb__rank">
              <span class="lb__num">{{ i + 2 }}</span>
              <span class="lb__move" :class="r.move > 0 ? 'is-up' : r.move < 0 ? 'is-down' : ''" :aria-label="moveText(r.move)">
                <MiIcon v-if="r.move !== 0" :name="r.move > 0 ? 'arrow-up' : 'arrow-down'" :size="11" :weight="2.6" />
                <template v-if="r.move !== 0">{{ Math.abs(r.move) }}</template>
                <template v-else>–</template>
              </span>
            </div>
            <MiAvatar :name="r.name" size="sm" tone="auto" decorative />
            <div class="lb__main">
              <div class="lb__line">
                <span class="lb__name">{{ r.name }}</span>
                <MiBadge v-if="r.you" tone="primary" variant="solid" label="You" />
                <span class="lb__value">{{ format(r.value) }}</span>
              </div>
              <div class="lb__bar" aria-hidden="true">
                <span :style="{ transform: `scaleX(${r.value / leader.value})` }" />
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

<style scoped>
.lb { container-type: inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.lb__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.lb__grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 820px) { .lb__grid { grid-template-columns: 300px minmax(0, 1fr); align-items: start; } }

.lb__leader {
  position: relative; display: grid; gap: 12px; justify-items: start; padding: 22px; border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate;
  background: var(--mi-card); box-shadow: var(--mi-sh1);
}
.lb__leader::before {
  content: ""; position: absolute; inset: 0; z-index: -1;
  background: radial-gradient(120% 80% at 100% 0%, var(--mi-p-tint), transparent 60%), radial-gradient(80% 60% at 0% 100%, var(--mi-s-tint), transparent 70%);
}
/* Oversized rank numeral as a quiet watermark. */
.lb__crown {
  position: absolute; top: -18px; right: 10px; z-index: -1; font-size: 150px; line-height: 1; font-weight: 800; letter-spacing: -.08em;
  color: color-mix(in srgb, var(--mi-p) 14%, transparent); font-variant-numeric: tabular-nums;
}
.lb__leader-text { display: grid; gap: 2px; }
.lb__leader-value { margin: 4px 0 0; font-size: clamp(34px, 8cqi, 46px); line-height: 1; font-weight: 700; letter-spacing: -.045em; font-variant-numeric: tabular-nums; }
.lb__leader-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; }

.lb__list { position: relative; display: grid; margin: 0; padding: 6px; list-style: none; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.lb__row { display: grid; grid-template-columns: 30px auto minmax(0, 1fr); align-items: center; gap: 12px; padding: 11px 10px; border-top: 1px solid var(--mi-sep); }
.lb__row:first-child { border-top-color: transparent; }
/* The viewer's own row: tinted and rounded, with the neighbouring rules hidden so it reads as one pill. */
.lb__row.is-you { border-top-color: transparent; border-radius: var(--mi-radius-l); background: color-mix(in srgb, var(--mi-p) 9%, transparent); }
.lb__row.is-you + .lb__row { border-top-color: transparent; }

.lb__rank { display: grid; justify-items: center; gap: 2px; }
.lb__num { font-size: 17px; font-weight: 700; font-variant-numeric: tabular-nums; }
.lb__move { display: inline-flex; align-items: center; gap: 1px; font-size: 11px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.lb__move.is-up { color: var(--mi-green-t); }
.lb__move.is-down { color: var(--mi-red-t); }

.lb__main { display: grid; gap: 5px; min-width: 0; }
.lb__line { display: flex; align-items: center; gap: 8px; min-width: 0; }
.lb__name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; font-weight: 600; }
.lb__value { margin-left: auto; flex: none; font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; }
.lb__bar { height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.lb__bar span { display: block; height: 100%; border-radius: inherit; background: color-mix(in srgb, var(--mi-p) 70%, var(--mi-card)); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.is-you .lb__bar span { background: var(--mi-p); }

/* Re-ranking slides rows to their new place with transform only. */
.lb-row-move { transition: transform var(--mi-dur-4) var(--mi-spring); }
@media (prefers-reduced-motion: reduce) { .lb-row-move, .lb__bar span { transition: none; } }
</style>

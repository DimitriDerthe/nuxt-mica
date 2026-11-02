<template>
  <section class="kbr" aria-labelledby="kbr-title">
    <div class="kbr__card">
      <header class="kbr__head">
        <div class="kbr__intro">
          <MiText id="kbr-title" variant="headline" as="h2" weight="semibold">Operating metrics</MiText>
          <p class="kbr__score" aria-live="polite">
            <span class="kbr__pips" aria-hidden="true">
              <i v-for="c in cells" :key="c.id" :class="c.hit ? 'is-hit' : 'is-miss'" />
            </span>
            <span><b>{{ hits }} of {{ cells.length }}</b> on target · {{ d.label }}</span>
          </p>
        </div>
        <MiSegmented v-model="period" label="Period" :options="periods" />
      </header>

      <ul class="kbr__row">
        <li v-for="c in cells" :key="c.id" class="kbr__cell">
          <div class="kbr__line1">
            <MiText variant="caption" weight="medium" tone="label2" as="h3" :lines="1">{{ c.label }}</MiText>
            <span v-if="c.better === 'down'" class="kbr__dir" title="Lower is better">↓ better</span>
          </div>
          <div class="kbr__line2">
            <span class="kbr__value">{{ c.value }}</span>
            <span class="kbr__chip" :class="`is-${c.tone}`" :aria-label="`${c.deltaText} versus previous ${d.unit}`">
              <MiIcon v-if="c.tone !== 'flat'" :name="c.up ? 'arrow-up' : 'arrow-down'" :size="10" :weight="2.6" />{{ c.deltaText }}
            </span>
          </div>

          <!-- Bullet: qualitative ranges, actual bar, target tick, last-period ring. -->
          <div
            class="kbr__bullet" role="meter" :aria-label="c.label" :aria-valuenow="c.actual" :aria-valuemin="0" :aria-valuemax="c.max"
            :aria-valuetext="`${c.value}, target ${c.targetText}, ${c.hit ? 'on target' : 'below target'}`"
          >
            <span class="kbr__zones" aria-hidden="true">
              <i v-for="(z, zi) in c.zones" :key="zi" :class="`is-${z.shade}`" :style="{ flexGrow: z.size }" />
            </span>
            <span class="kbr__bar" :class="{ 'is-miss': !c.hit }" :style="{ transform: `scaleX(${c.actual / c.max})` }" />
            <span class="kbr__mover" :style="{ transform: `translateX(${(c.previous / c.max) * 100}%)` }"><i class="kbr__prev" /></span>
            <span class="kbr__mover" :style="{ transform: `translateX(${(c.target / c.max) * 100}%)` }"><i class="kbr__tick" /></span>
          </div>
          <div class="kbr__foot">
            <span>Target {{ c.targetText }}</span>
            <span>was {{ c.prevText }}</span>
          </div>
        </li>
      </ul>

      <footer class="kbr__key" aria-hidden="true">
        <span><i class="kbr__k-bar" />Actual</span>
        <span><i class="kbr__k-tick" />Target</span>
        <span><i class="kbr__k-prev" />Previous {{ d.unit }}</span>
        <span><i class="kbr__k-zones"><b /><b /><b /></i>Poor · fair · good</span>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Fmt = 'money' | 'pct' | 'pct2' | 'hours' | 'score'
interface Def { id: string, label: string, fmt: Fmt, better: 'up' | 'down' }
// [actual, previous, target, fair from, good from (or fair up to for lower-is-better), axis max]
type Reading = [number, number, number, number, number, number]

const defs: Def[] = [
  { id: 'arr', label: 'Net new ARR', fmt: 'money', better: 'up' },
  { id: 'win', label: 'Win rate', fmt: 'pct', better: 'up' },
  { id: 'exp', label: 'Expansion revenue', fmt: 'money', better: 'up' },
  { id: 'churn', label: 'Gross churn', fmt: 'pct2', better: 'down' },
  { id: 'frt', label: 'First response', fmt: 'hours', better: 'down' },
  { id: 'nps', label: 'NPS', fmt: 'score', better: 'up' }
]

const periods = [{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'quarter', label: 'Quarter' }]
const period = ref<string | number | null>('month')

// Sample readings per period; swap for your API.
const data: Record<string, { label: string, unit: string, readings: Reading[] }> = {
  week: {
    label: 'week of Oct 26', unit: 'week',
    readings: [[31.4, 27.9, 30, 20, 30, 45], [24.6, 26.1, 28, 20, 28, 40], [12.8, 10.2, 11, 7, 11, 18], [0.31, 0.36, 0.35, 0.35, 0.5, 0.7], [5.3, 4.6, 4, 4, 6, 8], [47, 44, 45, 30, 45, 70]]
  },
  month: {
    label: 'October', unit: 'month',
    readings: [[134, 118, 120, 90, 120, 180], [26.8, 25.2, 28, 20, 28, 40], [51.2, 44.0, 45, 30, 45, 70], [1.24, 1.41, 1.5, 1.5, 2.2, 3], [4.4, 4.9, 4, 4, 6, 8], [46, 46, 45, 30, 45, 70]]
  },
  quarter: {
    label: 'Q3', unit: 'quarter',
    readings: [[362, 331, 380, 280, 380, 520], [27.4, 24.9, 28, 20, 28, 40], [139, 118, 130, 95, 130, 200], [4.1, 4.6, 4.5, 4.5, 6, 8], [4.8, 5.6, 4, 4, 6, 8], [44, 41, 45, 30, 45, 70]]
  }
}

const d = computed(() => data[String(period.value ?? 'month')]!)

const fmt = (f: Fmt, v: number) => {
  if (f === 'money') return `$${v >= 100 ? v.toFixed(0) : v.toFixed(1)}k`
  if (f === 'pct') return `${v.toFixed(1)}%`
  if (f === 'pct2') return `${v.toFixed(2)}%`
  if (f === 'hours') return `${v.toFixed(1)} h`
  return v.toFixed(0)
}
const deltaOf = (f: Fmt, a: number, p: number) => {
  if (f === 'money') return `${Math.abs((a / p - 1) * 100).toFixed(1)}%`
  if (f === 'pct' || f === 'pct2') return `${Math.abs(a - p).toFixed(f === 'pct2' ? 2 : 1)} pt`
  if (f === 'hours') return `${Math.abs(a - p).toFixed(1)} h`
  return `${Math.abs(a - p).toFixed(0)} pts`
}

const cells = computed(() => defs.map((def, i) => {
  const [actual, previous, target, a, b, max] = d.value.readings[i] ?? [0, 0, 0, 0, 0, 1]
  const up = actual > previous
  const flat = Math.abs(actual - previous) < 1e-9
  const good = def.better === 'up' ? up : !up
  // Darker zone means worse: the order flips for lower-is-better metrics.
  const shades = def.better === 'up' ? ['poor', 'fair', 'good'] : ['good', 'fair', 'poor']
  return {
    ...def, actual, previous, target, max, up,
    hit: def.better === 'up' ? actual >= target : actual <= target,
    value: fmt(def.fmt, actual),
    targetText: fmt(def.fmt, target),
    prevText: fmt(def.fmt, previous),
    deltaText: flat ? 'flat' : deltaOf(def.fmt, actual, previous),
    tone: flat ? 'flat' : good ? 'good' : 'bad',
    zones: [{ size: a, shade: shades[0] }, { size: b - a, shade: shades[1] }, { size: max - b, shade: shades[2] }]
  }
}))
const hits = computed(() => cells.value.filter(c => c.hit).length)
</script>

<style scoped>
.kbr { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.kbr__card { display: grid; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
.kbr__head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 20px; padding: 16px 18px 14px; }
.kbr__intro { display: grid; gap: 4px; }
.kbr__score { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.kbr__score b { font-weight: 650; color: var(--mi-label); }
.kbr__pips { display: inline-flex; gap: 3px; }
.kbr__pips i { width: 6px; height: 6px; border-radius: 50%; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.kbr__pips .is-hit { background: var(--mi-p); }
.kbr__pips .is-miss { background: var(--mi-fill); }

.kbr__row {
  display: grid; gap: 1px; margin: 0; padding: 0; list-style: none; grid-template-columns: repeat(2, minmax(0, 1fr));
  background: var(--mi-sep); border-top: 1px solid var(--mi-sep); border-bottom: 1px solid var(--mi-sep);
}
@container (min-width: 620px) { .kbr__row { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@container (min-width: 1040px) { .kbr__row { grid-template-columns: repeat(6, minmax(0, 1fr)); } }

.kbr__cell { display: grid; gap: 8px; align-content: start; min-width: 0; padding: 14px 16px 12px; background: var(--mi-card); }
.kbr__line1 { display: flex; align-items: center; justify-content: space-between; gap: 6px; min-width: 0; }
.kbr__dir { flex: none; font-size: 10px; font-weight: 600; letter-spacing: .02em; color: var(--mi-label3); }
.kbr__line2 { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 8px; }
.kbr__value { font-size: 22px; line-height: 1.05; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; white-space: nowrap; }
.kbr__chip {
  display: inline-flex; align-items: center; gap: 2px; padding: 2px 6px; border-radius: 6px; font-size: 11px; font-weight: 650;
  line-height: 15px; font-variant-numeric: tabular-nums; white-space: nowrap;
}
.kbr__chip.is-good { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 14%, transparent); }
.kbr__chip.is-bad { color: var(--mi-red-t); background: color-mix(in srgb, var(--mi-red) 13%, transparent); }
.kbr__chip.is-flat { color: var(--mi-label2); background: var(--mi-fill3); }

.kbr__bullet { position: relative; height: 18px; margin-top: 4px; overflow-x: clip; }
.kbr__zones { position: absolute; inset: 2px 0; display: flex; border-radius: 3px; overflow: hidden; }
.kbr__zones i { flex-basis: 0; }
.kbr__zones .is-poor, .kbr__k-zones b:nth-child(1) { background: var(--mi-fill); }
.kbr__zones .is-fair, .kbr__k-zones b:nth-child(2) { background: var(--mi-fill3); }
.kbr__zones .is-good, .kbr__k-zones b:nth-child(3) { background: var(--mi-fill4); }
.kbr__bar {
  position: absolute; left: 0; right: 0; top: 6px; height: 6px; border-radius: 0 2px 2px 0; background: var(--mi-p);
  transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring);
}
.kbr__bar.is-miss { background: color-mix(in srgb, var(--mi-p) 55%, var(--mi-label2)); }
.kbr__mover { position: absolute; inset: 0; pointer-events: none; transition: transform var(--mi-dur-4) var(--mi-spring); }
.kbr__tick { position: absolute; left: -1px; top: 0; width: 2px; height: 18px; border-radius: 1px; background: var(--mi-label); }
.kbr__prev { position: absolute; left: -4px; top: 5px; width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid var(--mi-label2); background: var(--mi-card); box-sizing: border-box; }
.kbr__foot { display: flex; justify-content: space-between; gap: 8px; font-size: 11px; color: var(--mi-label3); font-variant-numeric: tabular-nums; white-space: nowrap; }
.kbr__foot span:first-child { color: var(--mi-label2); }

.kbr__key { display: flex; flex-wrap: wrap; gap: 6px 18px; padding: 10px 18px 12px; font-size: 11px; color: var(--mi-label2); }
.kbr__key > span { display: inline-flex; align-items: center; gap: 6px; }
.kbr__k-bar { width: 14px; height: 5px; border-radius: 1px; background: var(--mi-p); }
.kbr__k-tick { width: 2px; height: 12px; border-radius: 1px; background: var(--mi-label); }
.kbr__k-prev { width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid var(--mi-label2); box-sizing: border-box; }
.kbr__k-zones { display: inline-flex; height: 8px; border-radius: 2px; overflow: hidden; }
.kbr__k-zones b { width: 7px; }

@media (prefers-reduced-motion: reduce) { .kbr__bar, .kbr__mover, .kbr__pips i { transition: none; } }
</style>

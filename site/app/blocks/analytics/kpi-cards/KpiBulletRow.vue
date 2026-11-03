<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="kbr-title">
    <div class="mi:grid mi:rounded-xl mi:bg-card mi:shadow-1 mi:overflow-hidden">
      <header class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-3 mi:gap-x-5 mi:pt-4 mi:px-4.5 mi:pb-3.5">
        <div class="mi:grid mi:gap-1">
          <MiText id="kbr-title" variant="headline" as="h2" weight="semibold">Operating metrics</MiText>
          <p class="mi:flex mi:items-center mi:gap-2 mi:m-0 mi:text-[12px] mi:text-label2 mi:tabular-nums" aria-live="polite">
            <span class="mi:inline-flex mi:gap-[3px]" aria-hidden="true">
              <i class="mi:w-1.5 mi:h-1.5 mi:rounded-[50%] mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:motion-reduce:[transition:none]" v-for="c in cells" :key="c.id" :class="c.hit ? 'mi:bg-p' : 'mi:bg-fill'" />
            </span>
            <span><b class="mi:font-650 mi:text-label">{{ hits }} of {{ cells.length }}</b> on target · {{ d.label }}</span>
          </p>
        </div>
        <MiSegmented v-model="period" label="Period" :options="periods" />
      </header>

      <ul class="mi:grid mi:gap-px mi:m-0 mi:p-0 mi:[list-style:none] mi:grid-cols-2 mi:bg-sep mi:border-t mi:border-t-sep mi:border-b mi:border-b-sep mi:@[620px]:grid-cols-3 mi:@[1040px]:grid-cols-6">
        <li v-for="c in cells" :key="c.id" class="mi:grid mi:gap-2 mi:content-start mi:min-w-0 mi:pt-3.5 mi:px-4 mi:pb-3 mi:bg-card">
          <div class="mi:flex mi:items-center mi:justify-between mi:gap-1.5 mi:min-w-0">
            <MiText variant="caption" weight="medium" tone="label2" as="h3" :lines="1">{{ c.label }}</MiText>
            <span v-if="c.better === 'down'" class="mi:flex-[none] mi:text-[10px] mi:font-semibold mi:tracking-[.02em] mi:text-label3" title="Lower is better">↓ better</span>
          </div>
          <div class="mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-y-1 mi:gap-x-2">
            <span class="mi:text-[22px] mi:leading-[1.05] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums mi:whitespace-nowrap">{{ c.value }}</span>
            <span class="mi:inline-flex mi:items-center mi:gap-0.5 mi:py-0.5 mi:px-1.5 mi:rounded-[6px] mi:text-[11px] mi:font-650 mi:leading-[15px] mi:tabular-nums mi:whitespace-nowrap" :class="c.tone === 'good' ? 'mi:text-green-t mi:bg-green/14' : c.tone === 'bad' ? 'mi:text-red-t mi:bg-red/13' : 'mi:text-label2 mi:bg-fill3'" :aria-label="`${c.deltaText} versus previous ${d.unit}`">
              <MiIcon v-if="c.tone !== 'flat'" :name="c.up ? 'arrow-up' : 'arrow-down'" :size="10" :weight="2.6" />{{ c.deltaText }}
            </span>
          </div>

          <!-- Bullet: qualitative ranges, actual bar, target tick, last-period ring. -->
          <div
            class="mi:relative mi:h-4.5 mi:mt-1 mi:overflow-x-clip" role="meter" :aria-label="c.label" :aria-valuenow="c.actual" :aria-valuemin="0" :aria-valuemax="c.max"
            :aria-valuetext="`${c.value}, target ${c.targetText}, ${c.hit ? 'on target' : 'below target'}`"
          >
            <span class="mi:absolute mi:inset-y-0.5 mi:inset-x-0 mi:flex mi:rounded-[3px] mi:overflow-hidden" aria-hidden="true">
              <i class="mi:basis-0" v-for="(z, zi) in c.zones" :key="zi" :class="z.shade === 'poor' ? 'mi:bg-fill' : z.shade === 'fair' ? 'mi:bg-fill3' : 'mi:bg-fill4'" :style="{ flexGrow: z.size }" />
            </span>
            <span class="mi:absolute mi:left-0 mi:right-0 mi:top-1.5 mi:h-1.5 mi:rounded-[0_2px_2px_0] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:motion-reduce:[transition:none]" :class="c.hit ? 'mi:bg-p' : 'mi:[background:color-mix(in_srgb,_var(--mi-p)_55%,_var(--mi-label2))]'" :style="{ transform: `scaleX(${c.actual / c.max})` }" />
            <span class="mi:absolute mi:inset-0 mi:pointer-events-none mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:motion-reduce:[transition:none]" :style="{ transform: `translateX(${(c.previous / c.max) * 100}%)` }"><i class="mi:absolute mi:-left-1 mi:top-[5px] mi:w-2 mi:h-2 mi:rounded-[50%] mi:border-[1.5px] mi:border-label2 mi:bg-card mi:box-border" /></span>
            <span class="mi:absolute mi:inset-0 mi:pointer-events-none mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:motion-reduce:[transition:none]" :style="{ transform: `translateX(${(c.target / c.max) * 100}%)` }"><i class="mi:absolute mi:-left-px mi:top-0 mi:w-0.5 mi:h-4.5 mi:rounded-[1px] mi:bg-label" /></span>
          </div>
          <div class="mi:flex mi:justify-between mi:gap-2 mi:text-[11px] mi:text-label3 mi:tabular-nums mi:whitespace-nowrap">
            <span class="mi:text-label2">Target {{ c.targetText }}</span>
            <span>was {{ c.prevText }}</span>
          </div>
        </li>
      </ul>

      <footer class="mi:flex mi:flex-wrap mi:gap-y-1.5 mi:gap-x-4.5 mi:pt-2.5 mi:px-4.5 mi:pb-3 mi:text-[11px] mi:text-label2" aria-hidden="true">
        <span class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:w-3.5 mi:h-[5px] mi:rounded-[1px] mi:bg-p" />Actual</span>
        <span class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:w-0.5 mi:h-3 mi:rounded-[1px] mi:bg-label" />Target</span>
        <span class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:w-2 mi:h-2 mi:rounded-[50%] mi:border-[1.5px] mi:border-label2 mi:box-border" />Previous {{ d.unit }}</span>
        <span class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:inline-flex mi:h-2 mi:rounded-[2px] mi:overflow-hidden"><b class="mi:w-[7px] mi:[&:nth-child(1)]:bg-fill mi:[&:nth-child(2)]:bg-fill3 mi:[&:nth-child(3)]:bg-fill4" /><b class="mi:w-[7px] mi:[&:nth-child(1)]:bg-fill mi:[&:nth-child(2)]:bg-fill3 mi:[&:nth-child(3)]:bg-fill4" /><b class="mi:w-[7px] mi:[&:nth-child(1)]:bg-fill mi:[&:nth-child(2)]:bg-fill3 mi:[&:nth-child(3)]:bg-fill4" /></i>Poor · fair · good</span>
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

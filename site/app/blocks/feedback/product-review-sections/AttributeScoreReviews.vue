<template>
  <section class="asr" aria-labelledby="asr-title">
    <div class="asr__wrap">
      <header class="asr__head">
        <div>
          <MiText id="asr-title" variant="title3" as="h2" weight="semibold">What teams say about Ledgerline</MiText>
          <MiText variant="footnote" tone="label2">Verified reviews from finance teams · compared with the expense software average</MiText>
        </div>
        <MiSegmented v-model="size" label="Company size" :options="SIZES" />
      </header>

      <div class="asr__layout">
        <aside class="asr__scores" aria-labelledby="asr-scores-title">
          <div class="asr__overall">
            <p class="asr__big">{{ seg.overall.toFixed(1) }}</p>
            <div>
              <MiRating :model-value="Math.round(seg.overall * 2) / 2" half readonly size="sm" :label="`Average ${seg.overall} out of 5`" />
              <MiText variant="caption" tone="label2">{{ seg.count }} reviews</MiText>
            </div>
          </div>
          <MiText id="asr-scores-title" variant="footnote" as="h3" weight="semibold">Scores by attribute</MiText>
          <MiText variant="caption" tone="label2">Pick one to rank reviews by it. The tick marks the category average.</MiText>

          <div class="asr__attrs" role="group" aria-label="Rank reviews by attribute">
            <button
              v-for="a in ATTRS" :key="a.id" type="button" class="asr__attr" :aria-pressed="focus === a.id"
              @click="focus = focus === a.id ? null : a.id"
            >
              <span class="asr__attr-top">
                <span>{{ a.label }}</span>
                <b :class="{ 'is-up': seg.scores[a.id] >= a.avg }">{{ seg.scores[a.id].toFixed(1) }}</b>
              </span>
              <span class="asr__track" role="img" :aria-label="`${seg.scores[a.id]} against a category average of ${a.avg}`">
                <span class="asr__fill" :style="{ transform: `scaleX(${seg.scores[a.id] / 5})` }" />
                <span class="asr__avg" :style="{ transform: `translateX(${(a.avg / 5) * 100}cqw)` }" />
              </span>
            </button>
          </div>
        </aside>

        <div class="asr__list">
          <MiText variant="caption" tone="label2" aria-live="polite">
            {{ reviews.length }} reviews{{ focus ? `, highest ${label(focus)} first` : ', most recent first' }}
          </MiText>
          <article v-for="r in reviews" :key="r.id" class="asr__review" :aria-labelledby="`asr-r-${r.id}`">
            <header class="asr__who">
              <MiAvatar :name="r.name" size="sm" tone="auto" decorative />
              <div class="asr__who-text">
                <MiText variant="footnote" weight="semibold">{{ r.name }}</MiText>
                <MiText variant="caption" tone="label2">{{ r.role }} · {{ r.employees }} employees</MiText>
              </div>
              <MiBadge v-if="focus" tone="primary" :label="`${label(focus)} ${r.scores[focus]}/5`" />
              <MiRating v-else :model-value="r.stars" readonly size="sm" :label="`${r.stars} out of 5`" />
            </header>
            <MiText :id="`asr-r-${r.id}`" variant="subheadline" as="h3" weight="semibold">{{ r.title }}</MiText>
            <dl class="asr__pc">
              <div><dt><MiIcon name="plus" :size="14" :weight="2.4" />Liked</dt><dd>{{ r.pro }}</dd></div>
              <div><dt><MiIcon name="minus" :size="14" :weight="2.4" />Disliked</dt><dd>{{ r.con }}</dd></div>
            </dl>
            <MiText v-if="r.from" variant="caption" tone="label2">Switched from {{ r.from }} · {{ r.date }}</MiText>
            <MiText v-else variant="caption" tone="label2">{{ r.date }}</MiText>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type AttrId = 'ease' | 'support' | 'value' | 'features'
type SizeId = 'all' | 'small' | 'mid' | 'large'
interface Segment { overall: number, count: number, scores: Record<AttrId, number> }
interface Review { id: number, size: Exclude<SizeId, 'all'>, name: string, role: string, employees: string, stars: number, title: string, pro: string, con: string, from?: string, date: string, scores: Record<AttrId, number> }

const SIZES = [{ value: 'all', label: 'All' }, { value: 'small', label: '1–50' }, { value: 'mid', label: '51–500' }, { value: 'large', label: '500+' }]
const ATTRS: { id: AttrId, label: string, avg: number }[] = [
  { id: 'ease', label: 'Ease of use', avg: 4.1 }, { id: 'support', label: 'Support', avg: 4.2 },
  { id: 'value', label: 'Value for money', avg: 3.9 }, { id: 'features', label: 'Features', avg: 4.0 }
]

// Sample aggregates per company size; swap for your review API.
const SEGMENTS: Record<SizeId, Segment> = {
  all: { overall: 4.5, count: 1284, scores: { ease: 4.6, support: 4.3, value: 4.4, features: 4.1 } },
  small: { overall: 4.7, count: 512, scores: { ease: 4.8, support: 4.5, value: 4.7, features: 3.9 } },
  mid: { overall: 4.4, count: 588, scores: { ease: 4.5, support: 4.2, value: 4.3, features: 4.2 } },
  large: { overall: 4.1, count: 184, scores: { ease: 4.2, support: 3.8, value: 3.9, features: 4.4 } }
}
const REVIEWS: Review[] = [
  { id: 1, size: 'small', name: 'Priya Raman', role: 'Founder, studio', employees: '12', stars: 5, title: 'Month-end went from two days to an afternoon', pro: 'Receipts match themselves to card lines; I barely touch them.', con: 'Mileage claims need a separate app.', from: 'spreadsheets', date: 'October 2026', scores: { ease: 5, support: 4, value: 5, features: 4 } },
  { id: 2, size: 'mid', name: 'Tomás Herrera', role: 'Finance manager', employees: '240', stars: 4, title: 'Approval chains finally fit our org chart', pro: 'Rules by department and amount, with a clear audit trail.', con: 'Reports export to CSV only, no live sheet link.', from: 'Expensify', date: 'September 2026', scores: { ease: 4, support: 4, value: 4, features: 5 } },
  { id: 3, size: 'large', name: 'Hannah Okafor', role: 'Controller', employees: '3,100', stars: 4, title: 'Strong policy engine, slower support at our tier', pro: 'Per-country VAT recovery is the best we have tested.', con: 'Tickets take a day to get past the first line.', from: 'SAP Concur', date: 'September 2026', scores: { ease: 4, support: 3, value: 4, features: 5 } },
  { id: 4, size: 'small', name: 'Luca Bianchi', role: 'Operations lead', employees: '34', stars: 5, title: 'Our team actually submits receipts now', pro: 'The phone capture is quick enough that people do it at the till.', con: 'Would like per-project budgets.', date: 'August 2026', scores: { ease: 5, support: 5, value: 5, features: 3 } },
  { id: 5, size: 'mid', name: 'Mei Lin', role: 'Accountant', employees: '410', stars: 4, title: 'Clean sync with our ledger', pro: 'Categories map once and stay mapped.', con: 'Bulk editing past expenses is clunky.', date: 'July 2026', scores: { ease: 4, support: 5, value: 4, features: 4 } }
]

const size = ref<string | number | null>('all')
const focus = ref<AttrId | null>(null)

const seg = computed(() => SEGMENTS[(size.value ?? 'all') as SizeId])
const reviews = computed(() => {
  const list = REVIEWS.filter(r => size.value === 'all' || r.size === size.value)
  const by = focus.value
  return by ? [...list].sort((a, b) => b.scores[by] - a.scores[by]) : list
})
const label = (id: AttrId) => ATTRS.find(a => a.id === id)?.label.toLowerCase() ?? ''
</script>

<style scoped>
.asr { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.asr__wrap { display: grid; gap: 18px; }
.asr__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.asr__layout { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 760px) { .asr__layout { grid-template-columns: 300px minmax(0, 1fr); align-items: start; } }

.asr__scores { display: grid; gap: 8px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.asr__overall { display: flex; align-items: center; gap: 14px; padding-bottom: 12px; margin-bottom: 4px; border-bottom: 1px solid var(--mi-sep); }
.asr__big { margin: 0; font-size: 48px; line-height: 1; font-weight: 700; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.asr__attrs { display: grid; gap: 4px; margin-top: 4px; }
.asr__attr {
  display: grid; gap: 6px; padding: 10px; border: 0; border-radius: var(--mi-radius-m); background: transparent;
  font: inherit; color: inherit; text-align: start; cursor: pointer;
}
.asr__attr:hover { background: var(--mi-fill4); }
.asr__attr[aria-pressed="true"] { background: var(--mi-p-tint); }
.asr__attr:focus-visible { outline: 3px solid color-mix(in srgb, var(--mi-p) 45%, transparent); outline-offset: 1px; }
.asr__attr-top { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; }
.asr__attr-top b { font-variant-numeric: tabular-nums; color: var(--mi-label2); }
.asr__attr-top b.is-up { color: var(--mi-green-t); }
.asr__track { position: relative; display: block; height: 8px; border-radius: 4px; background: var(--mi-fill3); container-type: inline-size; }
.asr__fill { position: absolute; inset: 0; border-radius: inherit; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.asr__avg { position: absolute; top: -3px; left: -1px; width: 2px; height: 14px; border-radius: 1px; background: var(--mi-label); transition: transform var(--mi-dur-4) var(--mi-spring); }

.asr__list { display: grid; gap: 10px; min-width: 0; }
.asr__review { display: grid; gap: 8px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.asr__who { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.asr__who-text { flex: 1; min-width: 140px; }
.asr__pc { display: grid; gap: 6px; margin: 0; font-size: 14px; }
@container (min-width: 1000px) { .asr__pc { grid-template-columns: 1fr 1fr; gap: 16px; } }
.asr__pc dt { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--mi-green-t); }
.asr__pc div + div dt { color: var(--mi-red-t); }
.asr__pc dd { margin: 2px 0 0; color: var(--mi-label2); }
</style>

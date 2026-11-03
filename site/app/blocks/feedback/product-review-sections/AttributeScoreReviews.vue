<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="asr-title">
    <div class="mi:grid mi:gap-4.5">
      <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
        <div>
          <MiText id="asr-title" variant="title3" as="h2" weight="semibold">What teams say about Ledgerline</MiText>
          <MiText variant="footnote" tone="label2">Verified reviews from finance teams · compared with the expense software average</MiText>
        </div>
        <MiSegmented v-model="size" label="Company size" :options="SIZES" />
      </header>

      <div class="mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:@[760px]:grid-cols-[300px_minmax(0,_1fr)] mi:@[760px]:items-start">
        <aside class="mi:grid mi:gap-2 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1" aria-labelledby="asr-scores-title">
          <div class="mi:flex mi:items-center mi:gap-3.5 mi:pb-3 mi:mb-1 mi:border-b mi:border-b-sep">
            <p class="mi:m-0 mi:text-[48px] mi:leading-none mi:font-bold mi:tracking-[-.04em] mi:tabular-nums">{{ seg.overall.toFixed(1) }}</p>
            <div>
              <MiRating :model-value="Math.round(seg.overall * 2) / 2" half readonly size="sm" :label="`Average ${seg.overall} out of 5`" />
              <MiText variant="caption" tone="label2">{{ seg.count }} reviews</MiText>
            </div>
          </div>
          <MiText id="asr-scores-title" variant="footnote" as="h3" weight="semibold">Scores by attribute</MiText>
          <MiText variant="caption" tone="label2">Pick one to rank reviews by it. The tick marks the category average.</MiText>

          <div class="mi:grid mi:gap-1 mi:mt-1" role="group" aria-label="Rank reviews by attribute">
            <button
              v-for="a in ATTRS" :key="a.id" type="button" class="mi:grid mi:gap-1.5 mi:p-2.5 mi:[border:0] mi:rounded-md mi:[font:inherit] mi:text-inherit mi:text-start mi:cursor-pointer mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_45%,_transparent)] mi:focus-visible:outline-offset-[1px]" :class="focus === a.id ? 'mi:bg-p-tint' : 'mi:bg-transparent mi:hover:bg-fill4'" :aria-pressed="focus === a.id"
              @click="focus = focus === a.id ? null : a.id"
            >
              <span class="mi:flex mi:justify-between mi:gap-2 mi:text-[13px]">
                <span>{{ a.label }}</span>
                <b class="mi:tabular-nums" :class="seg.scores[a.id] >= a.avg ? 'mi:text-green-t' : 'mi:text-label2'">{{ seg.scores[a.id].toFixed(1) }}</b>
              </span>
              <span class="mi:relative mi:block mi:h-2 mi:rounded-[4px] mi:bg-fill3 mi:@container" role="img" :aria-label="`${seg.scores[a.id]} against a category average of ${a.avg}`">
                <span class="mi:absolute mi:inset-0 mi:rounded-[inherit] mi:bg-p mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${seg.scores[a.id] / 5})` }" />
                <span class="mi:absolute mi:top-[-3px] mi:-left-px mi:w-0.5 mi:h-3.5 mi:rounded-[1px] mi:bg-label mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `translateX(${(a.avg / 5) * 100}cqw)` }" />
              </span>
            </button>
          </div>
        </aside>

        <div class="mi:grid mi:gap-2.5 mi:min-w-0">
          <MiText variant="caption" tone="label2" aria-live="polite">
            {{ reviews.length }} reviews{{ focus ? `, highest ${label(focus)} first` : ', most recent first' }}
          </MiText>
          <article v-for="r in reviews" :key="r.id" class="mi:grid mi:gap-2 mi:p-4 mi:rounded-lg mi:bg-card mi:shadow-1" :aria-labelledby="`asr-r-${r.id}`">
            <header class="mi:flex mi:items-center mi:gap-2.5 mi:flex-wrap">
              <MiAvatar :name="r.name" size="sm" tone="auto" decorative />
              <div class="mi:flex-1 mi:min-w-35">
                <MiText variant="footnote" weight="semibold">{{ r.name }}</MiText>
                <MiText variant="caption" tone="label2">{{ r.role }} · {{ r.employees }} employees</MiText>
              </div>
              <MiBadge v-if="focus" tone="primary" :label="`${label(focus)} ${r.scores[focus]}/5`" />
              <MiRating v-else :model-value="r.stars" readonly size="sm" :label="`${r.stars} out of 5`" />
            </header>
            <MiText :id="`asr-r-${r.id}`" variant="subheadline" as="h3" weight="semibold">{{ r.title }}</MiText>
            <dl class="mi:grid mi:gap-1.5 mi:m-0 mi:text-[14px] mi:@[1000px]:grid-cols-[1fr_1fr] mi:@[1000px]:gap-4">
              <div><dt class="mi:flex mi:text-green-t mi:items-center mi:gap-1 mi:text-[12px] mi:font-semibold"><MiIcon class="" name="plus" :size="14" :weight="2.4" />Liked</dt><dd class="mi:text-label2 mi:mt-0.5 mi:mx-0 mi:mb-0">{{ r.pro }}</dd></div>
              <div><dt class="mi:flex mi:text-red-t mi:items-center mi:gap-1 mi:text-[12px] mi:font-semibold"><MiIcon class="" name="minus" :size="14" :weight="2.4" />Disliked</dt><dd class="mi:text-label2 mi:mt-0.5 mi:mx-0 mi:mb-0">{{ r.con }}</dd></div>
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

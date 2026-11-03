<template>
  <div class="srj mi:@container mi:font-mi mi:text-label">
    <section class="srj__card mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[720px]:py-6 mi:@[720px]:px-7" aria-labelledby="srj-title">
      <header class="srj__head mi:grid mi:gap-3.5 mi:@[720px]:grid-cols-[minmax(0,_1fr)_240px] mi:@[720px]:items-end">
        <div class="srj__query mi:grid mi:gap-0.5">
          <MiText variant="caption" tone="label2" weight="semibold">Relevance review · help center search</MiText>
          <MiText id="srj-title" variant="title3" as="h2" weight="semibold">“refund a partial payment”</MiText>
        </div>
        <div class="srj__score" aria-live="polite">
          <MiMeter :value="precision" label="Judged precision" :caption="`${precision}%`" :hint="`${judged} of ${results.length} judged`" size="sm" />
        </div>
      </header>

      <ol class="srj__list mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
        <li v-for="(r, i) in results" :key="r.id" class="srj__row mi:relative mi:grid mi:grid-cols-[24px_minmax(0,_1fr)] mi:gap-y-2.5 mi:gap-x-3 mi:py-3.5 mi:px-0 mi:border-t mi:border-t-sep mi:@[720px]:grid-cols-[24px_minmax(0,_1fr)_auto] mi:@[720px]:items-start" :class="verdicts[r.id] ? 'is-' + verdicts[r.id] : ''">
          <span class="srj__rank mi:grid mi:place-items-center mi:w-6 mi:h-6 mi:rounded-[50%] mi:text-[12px] mi:font-semibold mi:bg-fill3 mi:text-label2 mi:[.srj__row.is-good_&]:[background:color-mix(in_srgb,_var(--mi-green)_18%,_transparent)] mi:[.srj__row.is-good_&]:text-green-t" aria-hidden="true">{{ i + 1 }}</span>
          <div class="srj__body mi:[.srj__row.is-off_&]:opacity-62 mi:grid mi:gap-1 mi:min-w-0 mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)]">
            <MiText variant="subheadline" weight="semibold" as="h3">{{ r.title }}</MiText>
            <MiText variant="caption" tone="label2" :lines="2">{{ r.snippet }}</MiText>
            <!-- Label group: where the result comes from and how fresh it is. -->
            <ul class="srj__labels mi:flex mi:flex-wrap mi:gap-1.5 mi:mt-1 mi:mx-0 mi:mb-0 mi:p-0 mi:[list-style:none]" :aria-label="`About ${r.title}`">
              <li><MiBadge variant="outline" tone="neutral" :label="r.source" /></li>
              <li><MiBadge variant="tint" :tone="r.stale ? 'warning' : 'neutral'" :label="r.updated" /></li>
              <li v-if="r.clicks"><MiBadge variant="tint" tone="primary" :label="`${r.clicks}% click rate`" /></li>
            </ul>
          </div>
          <MiToggleGroup
            v-model="verdicts[r.id]" :options="choices" size="sm" variant="outline" :spacing="0"
            :label="`Judge result ${i + 1}`" class="srj__vote mi:col-[2] mi:justify-self-start mi:@[720px]:col-[3]"
          />
        </li>
      </ol>

      <footer class="srj__foot mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2.5 mi:gap-x-4 mi:pt-3.5 mi:border-t mi:border-t-sep">
        <MiText variant="footnote" tone="label2" aria-live="polite">{{ footNote }}</MiText>
        <MiButton :disabled="judged < results.length || sent" @click="sent = true">
          {{ sent ? 'Judgements saved' : 'Save judgements' }}
        </MiButton>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Verdict = string | number | (string | number)[] | null
interface Result { id: string, title: string, snippet: string, source: string, updated: string, stale?: boolean, clicks?: number }

const choices = [{ value: 'good', label: 'Relevant' }, { value: 'part', label: 'Partly' }, { value: 'off', label: 'Off-topic' }]

const results: Result[] = [
  { id: 'r1', title: 'Issue a partial refund from the dashboard', snippet: 'Open the payment, choose Refund, then enter an amount lower than the original charge. Fees are returned pro rata.', source: 'Guide', updated: 'Updated 3 days ago', clicks: 41 },
  { id: 'r2', title: 'Refunds API: amount parameter', snippet: 'Pass amount in the smallest currency unit to refund part of a charge. Several partial refunds can add up to the total.', source: 'API reference', updated: 'Updated 2 weeks ago', clicks: 18 },
  { id: 'r3', title: 'Why a refund shows as pending', snippet: 'Card networks take 5 to 10 business days to return funds. Pending refunds can still be cancelled within one hour.', source: 'FAQ', updated: 'Updated 4 months ago', stale: true, clicks: 9 },
  { id: 'r4', title: 'Payment links now support tips', snippet: 'Customers can add an optional tip on hosted payment links, shown as a separate line on the receipt.', source: 'Changelog', updated: 'Updated last year', stale: true }
]

const verdicts = ref<Record<string, Verdict>>({ r1: 'good', r2: 'good', r3: 'part' })
const sent = ref(false)

const weight: Record<string, number> = { good: 1, part: 0.5, off: 0 }
const judged = computed(() => results.filter(r => typeof verdicts.value[r.id] === 'string').length)
const precision = computed(() => {
  const scores = results.map(r => verdicts.value[r.id]).filter((v): v is string => typeof v === 'string')
  return scores.length ? Math.round(scores.reduce((s, v) => s + (weight[v] ?? 0), 0) / scores.length * 100) : 0
})
const footNote = computed(() => {
  if (sent.value) return 'Thanks, these judgements will tune ranking in the next nightly run.'
  const left = results.length - judged.value
  return left ? `${left} ${left === 1 ? 'result' : 'results'} left to judge` : 'All results judged, ready to save'
})
</script>

<style scoped>
.srj__row.is-part .srj__rank { background: color-mix(in srgb, var(--mi-orange) 18%, transparent); color: var(--mi-orange-t); }
.srj__row.is-off .srj__rank { background: color-mix(in srgb, var(--mi-red) 16%, transparent); color: var(--mi-red-t); }
</style>

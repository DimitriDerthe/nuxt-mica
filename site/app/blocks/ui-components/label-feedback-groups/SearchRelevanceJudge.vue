<template>
  <div class="srj">
    <section class="srj__card" aria-labelledby="srj-title">
      <header class="srj__head">
        <div class="srj__query">
          <MiText variant="caption" tone="label2" weight="semibold">Relevance review · help center search</MiText>
          <MiText id="srj-title" variant="title3" as="h2" weight="semibold">“refund a partial payment”</MiText>
        </div>
        <div class="srj__score" aria-live="polite">
          <MiMeter :value="precision" label="Judged precision" :caption="`${precision}%`" :hint="`${judged} of ${results.length} judged`" size="sm" />
        </div>
      </header>

      <ol class="srj__list">
        <li v-for="(r, i) in results" :key="r.id" class="srj__row" :class="verdicts[r.id] ? 'is-' + verdicts[r.id] : ''">
          <span class="srj__rank" aria-hidden="true">{{ i + 1 }}</span>
          <div class="srj__body">
            <MiText variant="subheadline" weight="semibold" as="h3">{{ r.title }}</MiText>
            <MiText variant="caption" tone="label2" :lines="2">{{ r.snippet }}</MiText>
            <!-- Label group: where the result comes from and how fresh it is. -->
            <ul class="srj__labels" :aria-label="`About ${r.title}`">
              <li><MiBadge variant="outline" tone="neutral" :label="r.source" /></li>
              <li><MiBadge variant="tint" :tone="r.stale ? 'warning' : 'neutral'" :label="r.updated" /></li>
              <li v-if="r.clicks"><MiBadge variant="tint" tone="primary" :label="`${r.clicks}% click rate`" /></li>
            </ul>
          </div>
          <MiToggleGroup
            v-model="verdicts[r.id]" :options="choices" size="sm" variant="outline" :spacing="0"
            :label="`Judge result ${i + 1}`" class="srj__vote"
          />
        </li>
      </ol>

      <footer class="srj__foot">
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
.srj { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.srj__card { display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.srj__head { display: grid; gap: 14px; }
.srj__query { display: grid; gap: 2px; }

.srj__list { display: grid; margin: 0; padding: 0; list-style: none; }
.srj__row {
  position: relative; display: grid; grid-template-columns: 24px minmax(0, 1fr); gap: 10px 12px; padding: 14px 0;
  border-top: 1px solid var(--mi-sep);
}
/* A thin verdict mark on the rank; the colour is the only thing that changes. */
.srj__rank {
  display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; font-size: 12px; font-weight: 600;
  background: var(--mi-fill3); color: var(--mi-label2);
}
.srj__row.is-good .srj__rank { background: color-mix(in srgb, var(--mi-green) 18%, transparent); color: var(--mi-green-t); }
.srj__row.is-part .srj__rank { background: color-mix(in srgb, var(--mi-orange) 18%, transparent); color: var(--mi-orange-t); }
.srj__row.is-off .srj__rank { background: color-mix(in srgb, var(--mi-red) 16%, transparent); color: var(--mi-red-t); }
.srj__row.is-off .srj__body { opacity: .62; }
.srj__body { display: grid; gap: 4px; min-width: 0; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.srj__labels { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 0; padding: 0; list-style: none; }
.srj__vote { grid-column: 2; justify-self: start; }

.srj__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 16px; padding-top: 14px; border-top: 1px solid var(--mi-sep); }

@container (min-width: 720px) {
  .srj__card { padding: 24px 28px; }
  .srj__head { grid-template-columns: minmax(0, 1fr) 240px; align-items: end; }
  .srj__row { grid-template-columns: 24px minmax(0, 1fr) auto; align-items: start; }
  .srj__vote { grid-column: 3; }
}
</style>

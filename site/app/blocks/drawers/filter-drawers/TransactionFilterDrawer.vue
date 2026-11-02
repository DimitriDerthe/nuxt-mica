<template>
  <section class="tfd" aria-labelledby="tfd-title">
    <!-- Faux page: the list shows applied filters only; the drawer edits a draft. -->
    <div class="tfd__page" :inert="open || undefined">
      <div class="tfd__page-head">
        <div>
          <MiText id="tfd-title" variant="title3" as="h2" weight="semibold">Transactions</MiText>
          <MiText variant="footnote" tone="label2">Business account · {{ applied.length }} shown · {{ money(sum(applied)) }}</MiText>
        </div>
        <MiButton variant="gray" size="small" @click="openDrawer">
          <template #leading><MiIcon name="sliders" :size="16" /></template>
          Filters{{ activeCount(filters) ? ' · ' + activeCount(filters) : '' }}
        </MiButton>
      </div>
      <ul class="tfd__list">
        <li v-for="t in applied.slice(0, 7)" :key="t.id">
          <span class="tfd__cat" :style="{ background: CATS[t.cat]?.color }" aria-hidden="true">{{ t.merchant[0] }}</span>
          <span class="tfd__what"><b>{{ t.merchant }}</b><span>{{ t.day }} Oct · {{ t.cat }} · •• {{ t.card }}</span></span>
          <span class="tfd__amt" :class="{ 'is-in': t.amount > 0 }">{{ t.amount > 0 ? '+' : '−' }}{{ money(Math.abs(t.amount)) }}</span>
        </li>
        <li v-if="!applied.length" class="tfd__none">No transactions match these filters.</li>
      </ul>
    </div>

    <div class="tfd__scrim" :class="{ 'is-on': open }" aria-hidden="true" @click="open = false" />

    <div class="tfd__drawer" :class="{ 'is-closed': !open }" :inert="!open || undefined">
      <MiDrawer :model-value="true" inline swipe-direction="right" title="Filter transactions" description="Changes apply when you press Show.">
        <div class="tfd__body">
          <div class="tfd__group">
            <MiText variant="footnote" weight="semibold" aria-hidden="true">Period</MiText>
            <MiSegmented v-model="draft.days" label="Period" :options="[{ value: 7, label: '7 days' }, { value: 14, label: '14 days' }, { value: 31, label: 'October' }]" />
          </div>

          <MiSlider v-model="draft.amount" label="Amount" :min="0" :max="2000" :step="50" :format="v => (v >= 2000 ? '$2,000+' : money(v))" />

          <div class="tfd__group">
            <MiText variant="footnote" weight="semibold" aria-hidden="true">Type</MiText>
            <MiCheckboxGroup v-model="draft.types" label="Type" :options="TYPES.map(t => ({ value: t, label: t + ' (' + countType(t) + ')' }))" />
          </div>

          <div class="tfd__group">
            <MiText variant="footnote" weight="semibold" aria-hidden="true">Category</MiText>
            <div class="tfd__chips" role="group" aria-label="Category">
              <MiChip
                v-for="name in Object.keys(CATS)" :key="name" selectable size="small" tone="neutral" :label="name"
                :model-value="draft.cats.includes(name)" @update:model-value="on => (draft.cats = on ? [...draft.cats, name] : draft.cats.filter(x => x !== name))"
              />
            </div>
          </div>

          <div class="tfd__group">
            <MiText variant="footnote" weight="semibold" aria-hidden="true">Card</MiText>
            <MiToggleGroup v-model="draft.cards" multiple variant="outline" size="sm" label="Card" :options="[{ value: '4242', label: 'Visa •• 4242' }, { value: '8810', label: 'Mastercard •• 8810' }]" />
          </div>

          <div class="tfd__switch">
            <span id="tfd-receipt">Missing receipt only</span>
            <MiSwitch v-model="draft.missing" size="compact" aria-labelledby="tfd-receipt" />
          </div>

          <!-- What the draft would show, before applying it. -->
          <div class="tfd__preview" aria-live="polite">
            <div>
              <b>{{ preview.length }}</b> of {{ TX.length }} · {{ money(sum(preview)) }}
              <MiText variant="caption" tone="label2">Spend per day for this selection</MiText>
            </div>
            <MiSparkline :values="spark" :width="110" :height="32" :animate="false" color="var(--mi-p)" stroke="var(--mi-p)" />
          </div>
        </div>

        <template #footer>
          <div class="tfd__foot">
            <MiButton variant="plain" :disabled="!activeCount(draft)" @click="resetDraft">Reset</MiButton>
            <MiButton :disabled="!preview.length" @click="apply">Show {{ preview.length }} transactions</MiButton>
          </div>
        </template>
      </MiDrawer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const CATS: Record<string, { color: string }> = {
  Software: { color: 'var(--mi-indigo)' },
  Travel: { color: 'var(--mi-teal)' },
  Meals: { color: 'var(--mi-orange)' },
  Office: { color: 'var(--mi-pink)' },
  Ads: { color: 'var(--mi-purple)' }
}
const TYPES = ['Card payment', 'Transfer out', 'Transfer in', 'Refund']
const MERCHANTS: [string, string, string][] = [
  ['Figma', 'Software', 'Card payment'], ['Lufthansa', 'Travel', 'Card payment'], ['Pret A Manger', 'Meals', 'Card payment'], ['WeWork', 'Office', 'Transfer out'],
  ['Google Ads', 'Ads', 'Card payment'], ['Notion', 'Software', 'Card payment'], ['Booking.com', 'Travel', 'Card payment'], ['Client: Halden AB', 'Software', 'Transfer in'],
  ['Uber', 'Travel', 'Card payment'], ['LinkedIn Ads', 'Ads', 'Card payment'], ['Ikea Business', 'Office', 'Card payment'], ['Lufthansa refund', 'Travel', 'Refund']
]
// 48 deterministic sample transactions across October.
const TX = Array.from({ length: 48 }, (_, i) => {
  const [merchant, cat, type] = MERCHANTS[(i * 7) % MERCHANTS.length]!
  const base = ((i * 389) % 1700) + 18
  const amount = type === 'Transfer in' ? base * 2.4 : type === 'Refund' ? base * 0.6 : -base
  return { id: i, merchant, cat, type, card: i % 3 ? '4242' : '8810', day: 31 - Math.floor(i * 0.64), amount: Math.round(amount), receipt: i % 5 !== 0 }
})
type Tx = typeof TX[number]

interface Filters { days: string | number | null, amount: number | [number, number], types: (string | number)[], cats: string[], cards: string | number | (string | number)[] | null, missing: boolean }
const defaults = (): Filters => ({ days: 31, amount: [0, 2000], types: [], cats: [], cards: [], missing: false })

const filters = ref<Filters>({ ...defaults(), days: 14, cats: ['Software', 'Travel'] })
const draft = reactive<Filters>(defaults())
const open = ref(true)

function match(f: Filters, t: Tx, skip?: 'type') {
  const [lo, hi] = Array.isArray(f.amount) ? f.amount : [0, 2000]
  const abs = Math.abs(t.amount)
  const cards = Array.isArray(f.cards) ? f.cards : []
  return t.day > 31 - Number(f.days ?? 31)
    && abs >= lo && (hi >= 2000 || abs <= hi)
    && (skip === 'type' || !f.types.length || f.types.includes(t.type))
    && (!f.cats.length || f.cats.includes(t.cat))
    && (!cards.length || cards.includes(t.card))
    && (!f.missing || !t.receipt)
}
const applied = computed(() => TX.filter(t => match(filters.value, t)))
const preview = computed(() => TX.filter(t => match(draft, t)))
/** Count per type with every other draft filter applied. */
const countType = (v: string) => TX.filter(t => t.type === v && match(draft, t, 'type')).length
const spark = computed(() => Array.from({ length: 31 }, (_, d) => preview.value.filter(t => t.day === d + 1 && t.amount < 0).reduce((s, t) => s - t.amount, 0)))

function activeCount(f: Filters) {
  const a = Array.isArray(f.amount) && (f.amount[0] > 0 || f.amount[1] < 2000)
  const cards = Array.isArray(f.cards) && f.cards.length > 0
  return [f.days !== 31, a, f.types.length > 0, f.cats.length > 0, cards, f.missing].filter(Boolean).length
}
function copy(from: Filters, to: Filters) {
  Object.assign(to, { ...from, amount: Array.isArray(from.amount) ? [...from.amount] : from.amount, types: [...from.types], cats: [...from.cats], cards: Array.isArray(from.cards) ? [...from.cards] : from.cards })
}
copy(filters.value, draft)

function openDrawer() {
  copy(filters.value, draft)
  open.value = true
}
function apply() {
  const next = defaults()
  copy(draft, next)
  filters.value = next
  open.value = false
}
const resetDraft = () => copy(defaults(), draft)
const sum = (list: Tx[]) => list.reduce((s, t) => s + t.amount, 0)
const money = (n: number) => (n < 0 ? '−' : '') + '$' + Math.abs(n).toLocaleString('en-US')
</script>

<style scoped>
.tfd { container-type: inline-size; position: relative; display: grid; min-height: 680px; border-radius: var(--mi-radius-xl); overflow: hidden; background: var(--mi-page); box-shadow: 0 0 0 1px var(--mi-sep); font-family: var(--mi-font); color: var(--mi-label); }
.tfd__page, .tfd__scrim, .tfd__drawer { grid-area: 1 / 1; }
.tfd__page { display: grid; align-content: start; gap: 14px; padding: 20px; }
.tfd__page-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
.tfd__list { display: grid; margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.tfd__list li { display: flex; align-items: center; gap: 12px; padding: 11px 14px; }
.tfd__list li + li { border-top: 1px solid var(--mi-sep); }
.tfd__cat { display: grid; place-items: center; flex: none; width: 32px; height: 32px; border-radius: 9px; color: var(--mi-p-on); font-size: 13px; font-weight: 700; }
.tfd__what { display: grid; flex: 1; min-width: 0; font-size: 14px; }
.tfd__what b { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tfd__what span { font-size: 12px; color: var(--mi-label2); }
.tfd__amt { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
.tfd__amt.is-in { color: var(--mi-green-t); }
.tfd__list .tfd__none { justify-content: center; padding: 28px; color: var(--mi-label2); font-size: 14px; }

.tfd__scrim { background: var(--mi-scrim); opacity: 0; pointer-events: none; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.tfd__scrim.is-on { opacity: 1; pointer-events: auto; }
.tfd__drawer { justify-self: end; width: min(400px, calc(100% - 24px)); padding: 10px; transition: transform var(--mi-dur-4) var(--mi-spring); }
.tfd__drawer.is-closed { transform: translateX(105%); }

.tfd__body { display: grid; gap: 20px; }
.tfd__group { display: grid; gap: 8px; }
.tfd__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.tfd__switch { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 14px; }
.tfd__preview { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border-radius: var(--mi-radius-l); background: var(--mi-p-tint); font-size: 14px; font-variant-numeric: tabular-nums; }
.tfd__preview > div { display: grid; gap: 2px; }
.tfd__preview b { font-size: 18px; }
.tfd__foot { display: flex; justify-content: space-between; gap: 8px; }
</style>

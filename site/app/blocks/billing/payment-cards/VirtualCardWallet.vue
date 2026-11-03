<template>
  <section class="vcw" aria-labelledby="vcw-title">
    <header class="vcw__head">
      <div>
        <MiText id="vcw-title" as="h2" variant="title3" weight="bold">Virtual cards</MiText>
        <MiText variant="footnote" tone="label2">One card per vendor, each with its own monthly limit. {{ money(totalSpent) }} spent of {{ money(totalLimit) }}.</MiText>
      </div>
      <MiSegmented v-model="filter" label="Show cards" :options="filters" />
    </header>

    <ul class="vcw__grid" aria-live="polite">
      <li v-for="c in shown" :key="c.id" class="vcw__item">
        <!-- The card face: a token gradient that greys out when frozen. -->
        <div class="vcw__card" :class="{ 'is-frozen': c.frozen, 'is-alt': c.alt }" aria-hidden="true">
          <span class="vcw__chip" />
          <span class="vcw__vendor">{{ c.name }}</span>
          <span class="vcw__pan">•••• {{ c.last4 }}</span>
          <span v-if="c.singleUse" class="vcw__tag">Single use</span>
        </div>
        <div class="vcw__info">
          <div class="vcw__row">
            <MiAvatar :name="c.owner" size="xs" tone="auto" decorative />
            <MiText variant="footnote" weight="medium" :lines="1">{{ c.name }} · {{ c.owner }}</MiText>
          </div>
          <MiMeter
            :value="c.spent" :max="c.limit" size="sm" :aria-label="c.name + ' spend'" :caption="money(c.spent) + ' spent'" :hint="'of ' + money(c.limit)"
            :color="c.spent / c.limit > 0.85 ? 'var(--mi-orange)' : undefined" :value-text="money(c.spent) + ' of ' + money(c.limit)"
          />
          <div class="vcw__row vcw__row--end">
            <MiText variant="caption" tone="label2">{{ c.frozen ? 'Frozen, charges declined' : 'Active' }}</MiText>
            <MiSwitch v-model="c.frozen" size="compact" :label="'Freeze ' + c.name" />
          </div>
        </div>
      </li>
      <li v-if="!shown.length" class="vcw__empty">
        <MiText variant="footnote" tone="label2">No {{ filter }} cards.</MiText>
      </li>
    </ul>

    <!-- Issue a card in one line: vendor, limit, single use. -->
    <form class="vcw__issue" aria-labelledby="vcw-issue" novalidate @submit.prevent="issue">
      <MiText id="vcw-issue" as="h3" variant="subheadline" weight="semibold" class="vcw__issue-title">Issue a card</MiText>
      <MiInput v-model="draftName" size="sm" aria-label="Vendor or purpose" placeholder="Vendor, e.g. Event tickets" :invalid="tried && !draftName.trim()" />
      <MiNativeSelect v-model="draftLimit" size="sm" :options="limitOptions" aria-label="Monthly limit" />
      <MiCheckbox v-model="draftSingle" label="Single use" />
      <MiButton type="submit" size="small">Create card</MiButton>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Card { id: number, name: string, owner: string, last4: string, spent: number, limit: number, frozen: boolean, singleUse?: boolean, alt?: boolean }

const filters = [{ value: 'active', label: 'Active' }, { value: 'frozen', label: 'Frozen' }, { value: 'all', label: 'All' }]
const limitOptions = [100, 250, 500, 1000, 2500].map(v => ({ value: v, label: '$' + v.toLocaleString('en-US') + ' / month' }))

const cards = ref<Card[]>([
  { id: 1, name: 'Cloud hosting', owner: 'Priya Natarajan', last4: '2291', spent: 1840, limit: 2500, frozen: false },
  { id: 2, name: 'Ad campaigns', owner: 'Tomás Herrera', last4: '7710', spent: 920, limit: 1000, frozen: false, alt: true },
  { id: 3, name: 'Design tools', owner: 'Mei Lin Okafor', last4: '0453', spent: 186, limit: 500, frozen: false },
  { id: 4, name: 'Conference travel', owner: 'Jonah Weiss', last4: '6128', spent: 0, limit: 1000, frozen: true, alt: true }
])
const filter = ref<string | number | null>('active')
const draftName = ref('')
const draftLimit = ref<string | number | null>(250)
const draftSingle = ref(false)
const tried = ref(false)

const shown = computed(() => cards.value.filter(c => filter.value === 'all' || (filter.value === 'frozen') === c.frozen))
const totalSpent = computed(() => cards.value.reduce((s, c) => s + c.spent, 0))
const totalLimit = computed(() => cards.value.reduce((s, c) => s + c.limit, 0))
const money = (n: number) => '$' + n.toLocaleString('en-US')

let nextId = 5
function issue() {
  tried.value = true
  if (!draftName.value.trim()) return
  const id = nextId++
  cards.value.unshift({
    id, name: draftName.value.trim(), owner: 'You', last4: String(3000 + id * 137).slice(-4), spent: 0,
    limit: Number(draftLimit.value), frozen: false, singleUse: draftSingle.value, alt: id % 2 === 0
  })
  draftName.value = ''; draftSingle.value = false; tried.value = false; filter.value = 'active'
}
</script>

<style scoped>
.vcw { container-type: inline-size; display: flex; flex-direction: column; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }
.vcw__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }

.vcw__grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin: 0; padding: 0; list-style: none; }
@container (min-width: 560px) { .vcw__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 960px) { .vcw__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.vcw__item { display: grid; gap: 12px; padding: 12px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.vcw__empty { padding: 28px; text-align: center; border-radius: var(--mi-radius-l); box-shadow: inset 0 0 0 1px var(--mi-sep); }

.vcw__card {
  position: relative; display: grid; grid-template-rows: auto 1fr auto; aspect-ratio: 1.586; padding: 14px; border-radius: 12px; overflow: hidden; color: var(--mi-p-on);
  background: radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--mi-s) 55%, transparent), transparent 60%), linear-gradient(135deg, var(--mi-p), color-mix(in srgb, var(--mi-p) 55%, var(--mi-label)));
  transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-ease);
}
.vcw__card.is-alt { color: var(--mi-s-on); background: radial-gradient(120% 90% at 0% 100%, color-mix(in srgb, var(--mi-p) 50%, transparent), transparent 60%), linear-gradient(135deg, var(--mi-s), color-mix(in srgb, var(--mi-s) 55%, var(--mi-label))); }
/* Frost: a striped veil on top, plus a slight shrink. Opacity and transform only. */
.vcw__card::after { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(-45deg, color-mix(in srgb, var(--mi-card) 55%, transparent) 0 6px, color-mix(in srgb, var(--mi-card) 35%, transparent) 6px 12px); opacity: 0; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.vcw__card.is-frozen { transform: scale(.97); }
.vcw__card.is-frozen::after { opacity: 1; }
.vcw__chip { width: 30px; height: 22px; border-radius: 5px; background: linear-gradient(135deg, color-mix(in srgb, var(--mi-yellow) 80%, var(--mi-card)), color-mix(in srgb, var(--mi-orange) 60%, var(--mi-card))); }
.vcw__vendor { align-self: center; font-size: 15px; font-weight: 700; letter-spacing: -.01em; }
.vcw__pan { font-size: 13px; letter-spacing: .14em; font-variant-numeric: tabular-nums; opacity: .9; }
.vcw__tag { position: absolute; top: 12px; right: 12px; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; background: color-mix(in srgb, var(--mi-card) 30%, transparent); }

.vcw__info { display: grid; gap: 10px; min-width: 0; }
.vcw__row { display: flex; align-items: center; gap: 8px; min-width: 0; }
.vcw__row--end { justify-content: space-between; }

.vcw__issue { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; padding: 14px 16px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
@container (min-width: 760px) { .vcw__issue { grid-template-columns: auto minmax(0, 1fr) 190px auto auto; align-items: center; } }
.vcw__issue-title { white-space: nowrap; }
</style>

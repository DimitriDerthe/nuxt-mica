<template>
  <section class="mi:@container mi:flex mi:flex-col mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="vcw-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="vcw-title" as="h2" variant="title3" weight="bold">Virtual cards</MiText>
        <MiText variant="footnote" tone="label2">One card per vendor, each with its own monthly limit. {{ money(totalSpent) }} spent of {{ money(totalLimit) }}.</MiText>
      </div>
      <MiSegmented v-model="filter" label="Show cards" :options="filters" />
    </header>

    <ul class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[560px]:grid-cols-2 mi:@[960px]:grid-cols-4" aria-live="polite">
      <li v-for="c in shown" :key="c.id" class="mi:grid mi:gap-3 mi:p-3 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
        <!-- The card face: a token gradient that greys out when frozen. -->
        <div class="mi:relative mi:grid mi:grid-rows-[auto_1fr_auto] mi:aspect-[1.586] mi:p-3.5 mi:rounded-[12px] mi:overflow-hidden mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-ease)] mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:[background:repeating-linear-gradient(-45deg,_color-mix(in_srgb,_var(--mi-card)_55%,_transparent)_0_6px,_color-mix(in_srgb,_var(--mi-card)_35%,_transparent)_6px_12px)] mi:after:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" :class="[c.alt ? 'mi:text-s-on mi:[background:radial-gradient(120%_90%_at_0%_100%,_color-mix(in_srgb,_var(--mi-p)_50%,_transparent),_transparent_60%),_linear-gradient(135deg,_var(--mi-s),_color-mix(in_srgb,_var(--mi-s)_55%,_var(--mi-label)))]' : 'mi:text-p-on mi:[background:radial-gradient(120%_90%_at_100%_0%,_color-mix(in_srgb,_var(--mi-s)_55%,_transparent),_transparent_60%),_linear-gradient(135deg,_var(--mi-p),_color-mix(in_srgb,_var(--mi-p)_55%,_var(--mi-label)))]', c.frozen ? 'mi:transform-[scale(.97)] mi:after:opacity-100' : 'mi:after:opacity-0']" aria-hidden="true">
          <span class="mi:w-7.5 mi:h-5.5 mi:rounded-[5px] mi:[background:linear-gradient(135deg,_color-mix(in_srgb,_var(--mi-yellow)_80%,_var(--mi-card)),_color-mix(in_srgb,_var(--mi-orange)_60%,_var(--mi-card)))]" />
          <span class="mi:self-center mi:text-[15px] mi:font-bold mi:tracking-[-.01em]">{{ c.name }}</span>
          <span class="mi:text-[13px] mi:tracking-[.14em] mi:tabular-nums mi:opacity-90">•••• {{ c.last4 }}</span>
          <span v-if="c.singleUse" class="mi:absolute mi:top-3 mi:right-3 mi:py-0.5 mi:px-2 mi:rounded-[999px] mi:text-[10px] mi:font-bold mi:[background:color-mix(in_srgb,_var(--mi-card)_30%,_transparent)]">Single use</span>
        </div>
        <div class="mi:grid mi:gap-2.5 mi:min-w-0">
          <div class="mi:flex mi:items-center mi:gap-2 mi:min-w-0">
            <MiAvatar :name="c.owner" size="xs" tone="auto" decorative />
            <MiText variant="footnote" weight="medium" :lines="1">{{ c.name }} · {{ c.owner }}</MiText>
          </div>
          <MiMeter
            :value="c.spent" :max="c.limit" size="sm" :aria-label="c.name + ' spend'" :caption="money(c.spent) + ' spent'" :hint="'of ' + money(c.limit)"
            :color="c.spent / c.limit > 0.85 ? 'var(--mi-orange)' : undefined" :value-text="money(c.spent) + ' of ' + money(c.limit)"
          />
          <div class="mi:flex mi:items-center mi:gap-2 mi:min-w-0 mi:justify-between">
            <MiText variant="caption" tone="label2">{{ c.frozen ? 'Frozen, charges declined' : 'Active' }}</MiText>
            <MiSwitch v-model="c.frozen" size="compact" :label="'Freeze ' + c.name" />
          </div>
        </div>
      </li>
      <li v-if="!shown.length" class="mi:p-7 mi:text-center mi:rounded-lg mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]">
        <MiText variant="footnote" tone="label2">No {{ filter }} cards.</MiText>
      </li>
    </ul>

    <!-- Issue a card in one line: vendor, limit, single use. -->
    <form class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-2.5 mi:py-3.5 mi:px-4 mi:rounded-lg mi:[background:var(--mi-fill4)] mi:@[760px]:grid-cols-[auto_minmax(0,_1fr)_190px_auto_auto] mi:@[760px]:items-center" aria-labelledby="vcw-issue" novalidate @submit.prevent="issue">
      <MiText id="vcw-issue" as="h3" variant="subheadline" weight="semibold" class="mi:whitespace-nowrap">Issue a card</MiText>
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

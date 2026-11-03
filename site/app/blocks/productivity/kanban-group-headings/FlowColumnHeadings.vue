<template>
  <section class="gh mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="flow-headings-title">
    <header class="gh__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="flow-headings-title" variant="title3" as="h2" weight="semibold">Checkout redesign</MiText>
        <MiText variant="footnote" tone="label2">Column headings carry capacity, flow speed and owners</MiText>
      </div>
      <MiButton v-if="collapsedCount" variant="gray" size="small" @click="columns.forEach(c => (c.collapsed = false))">Expand all ({{ collapsedCount }})</MiButton>
    </header>

    <div class="gh__row mi:flex mi:gap-3 mi:items-stretch mi:overflow-x-auto mi:overscroll-x-contain mi:[scroll-snap-type:x_mandatory] mi:pt-0.5 mi:px-0.5 mi:pb-2 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-lg" tabindex="0" role="region" aria-label="Stages">
      <section v-for="col in columns" :key="col.id" class="gh__col mi:flex-[0_0_min(276px,_86%)] mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:content-start mi:gap-2.5 mi:snap-start mi:min-w-0 mi:@[1120px]:flex-[1_1_0] mi:[&.is-collapsed]:flex-[0_0_52px]" :class="{ 'is-collapsed': col.collapsed }" :style="{ '--c': col.color }" :aria-labelledby="'flow-headings-' + col.id">
        <!-- Collapsed: a slim vertical spine that expands again on click. -->
        <button v-if="col.collapsed" type="button" class="gh__spine mi:flex mi:flex-col mi:items-center mi:gap-2.5 mi:min-h-65 mi:py-3 mi:px-0 mi:[border:0] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[var(--mi-sh1),_inset_0_3px_0_var(--c)] mi:[font:inherit] mi:text-label mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:hover:transform-[translateY(-2px)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :aria-label="'Expand ' + col.name + ', ' + col.cards.length + ' cards'" @click="col.collapsed = false">
          <span class="gh__spine-count mi:grid mi:place-items-center mi:min-w-6.5 mi:h-6.5 mi:rounded-[13px] mi:text-[12px] mi:font-bold mi:[background:color-mix(in_srgb,_var(--c)_18%,_transparent)]">{{ col.cards.length }}</span>
          <span :id="'flow-headings-' + col.id" class="gh__spine-name mi:[writing-mode:vertical-rl] mi:text-[14px] mi:font-semibold mi:tracking-[.02em]">{{ col.name }}</span>
        </button>

        <template v-else>
          <header class="gh__card mi:relative mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-2.5 mi:pt-3.5 mi:px-3.5 mi:pb-3 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:overflow-hidden mi:before:content-[''] mi:before:absolute mi:before:top-0 mi:before:right-0 mi:before:bottom-auto mi:before:left-0 mi:before:h-[3px] mi:before:[background:var(--c)]">
            <div class="gh__line mi:flex mi:items-center mi:gap-2 mi:min-w-0">
              <span class="gh__swatch mi:w-2.5 mi:h-2.5 mi:flex-[none] mi:rounded-[3px] mi:[background:var(--c)]" aria-hidden="true" />
              <MiText :id="'flow-headings-' + col.id" variant="headline" as="h3" class="gh__name mi:text-ellipsis">{{ col.name }}</MiText>
              <span class="gh__count mi:py-px mi:px-2 mi:rounded-[999px] mi:text-[12px] mi:font-bold mi:tabular-nums mi:[background:color-mix(in_srgb,_var(--c)_16%,_transparent)]">{{ col.cards.length }}</span>
              <MiMenu :items="menuFor(col)" :aria-label="col.name + ' actions'" placement="bottom-end" @select="(item) => act(col, item.value)">
                <template #trigger="{ props }">
                  <MiIconButton v-bind="props" :label="col.name + ' actions'" variant="plain" size="small"><MiIcon name="more" :size="18" /></MiIconButton>
                </template>
              </MiMenu>
            </div>

            <!-- Capacity as slots: filled, free, and overflow past the limit. -->
            <div v-if="col.limit" class="gh__slots mi:flex mi:gap-[3px]" role="meter" :aria-label="col.name + ' work in progress'" aria-valuemin="0" :aria-valuemax="col.limit" :aria-valuenow="col.cards.length" :aria-valuetext="col.cards.length + ' of ' + col.limit">
              <span class="mi:[.gh__slots_&]:flex-1 mi:[.gh__slots_&]:h-2 mi:[.gh__slots_&]:rounded-[3px]" v-for="n in Math.max(col.limit, col.cards.length)" :key="n" :class="{ 'is-full': n <= col.cards.length, 'is-over': n > col.limit }" />
            </div>
            <MiText v-if="col.limit" variant="caption" :tone="col.cards.length > col.limit ? 'orange' : 'label2'" weight="medium">
              {{ col.cards.length > col.limit ? `${col.cards.length - col.limit} over the limit of ${col.limit}` : `${col.limit - col.cards.length} of ${col.limit} slots free` }}
            </MiText>
            <MiText v-else variant="caption" tone="label2" weight="medium">No limit · {{ col.note }}</MiText>

            <div class="gh__stats mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-2.5 mi:pt-2.5 mi:border-t mi:border-t-sep">
              <div class="gh__stat mi:grid mi:min-w-0">
                <MiText variant="caption2" tone="label2" weight="semibold" as="span" class="gh__stat-label">{{ col.metricLabel }}</MiText>
                <span class="gh__stat-val mi:text-[18px] mi:font-bold mi:tracking-[-.02em] mi:tabular-nums mi:whitespace-nowrap">{{ col.metric }}</span>
              </div>
              <MiSparkline :values="col.trend" :width="88" :height="28" :label="col.name + ' ' + col.metricLabel.toLowerCase() + ', last 8 weeks'" class="gh__spark mi:justify-self-center mi:w-full mi:max-w-22 mi:h-auto mi:text-(--c)" />
              <MiAvatarGroup :items="ownerItems(col.owners)" :max="2" :size="24" class="gh__owners mi:justify-self-end" />
            </div>
          </header>

          <ol class="gh__cards mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-1.5 mi:m-0 mi:p-0 mi:[list-style:none]" :aria-label="col.name + ' cards'">
            <li v-for="card in col.cards.slice(0, 3)" :key="card.title" class="gh__stub mi:flex mi:items-center mi:justify-between mi:gap-2 mi:py-2.5 mi:px-3 mi:rounded-md mi:[background:color-mix(in_srgb,_var(--mi-card)_70%,_transparent)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:text-[13px]">
              <span class="gh__stub-title mi:min-w-0 mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ card.title }}</span>
              <span class="gh__stub-age mi:flex-[none] mi:text-[11px] mi:font-semibold mi:text-label3 mi:tabular-nums">{{ card.age }}d</span>
            </li>
            <li v-if="col.cards.length > 3" class="gh__more mi:py-1 mi:px-3 mi:text-[12px] mi:text-label2">+{{ col.cards.length - 3 }} more</li>
          </ol>
        </template>
      </section>
    </div>
    <p class="gh__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap mi:m-0" role="status">{{ announce }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface Col {
  id: string, name: string, color: string, limit: number | null, collapsed: boolean, note?: string,
  metricLabel: string, metric: string, trend: number[], owners: string[], cards: { title: string, age: number }[]
}

// Sample stages; swap for your board API.
const columns = reactive<Col[]>([
  {
    id: 'discovery', name: 'Discovery', color: 'var(--mi-purple)', limit: 5, collapsed: false, metricLabel: 'Cycle time', metric: '3.1d',
    trend: [4.2, 3.9, 4.4, 3.6, 3.5, 3.3, 3.4, 3.1], owners: ['Ines Duarte', 'Yuki Tanaka'],
    cards: [{ title: 'Interview 6 users who abandoned at shipping', age: 2 }, { title: 'Map promo-code edge cases', age: 4 }, { title: 'Benchmark Apple Pay conversion', age: 1 }, { title: 'Guest checkout data audit', age: 6 }]
  },
  {
    id: 'building', name: 'Building', color: 'var(--mi-p)', limit: 5, collapsed: false, metricLabel: 'Cycle time', metric: '4.6d',
    trend: [3.2, 3.4, 3.3, 3.9, 4.1, 4.0, 4.4, 4.6], owners: ['Tomás Ruiz', 'Hana Kobayashi', 'Malik Osei', 'Rosa Lind'],
    cards: [{ title: 'One-page address + shipping step', age: 5 }, { title: 'Saved cards with 3-D Secure retry', age: 3 }, { title: 'Order summary drawer on mobile', age: 2 }, { title: 'Inline postcode lookup', age: 1 }, { title: 'Error states for declined payments', age: 4 }, { title: 'Tax line for EU VAT reverse charge', age: 1 }]
  },
  {
    id: 'qa', name: 'QA', color: 'var(--mi-orange)', limit: 3, collapsed: false, metricLabel: 'Bounce-backs', metric: '1 of 9',
    trend: [3, 2, 4, 2, 1, 2, 1, 1], owners: ['Rosa Lind'],
    cards: [{ title: 'Gift message character limit', age: 1 }, { title: 'Currency switcher keeps cart', age: 2 }]
  },
  {
    id: 'live', name: 'Live', color: 'var(--mi-green)', limit: null, collapsed: false, note: '+7 this week', metricLabel: 'Shipped / wk', metric: '7',
    trend: [3, 4, 4, 5, 3, 6, 5, 7], owners: ['Malik Osei', 'Ines Duarte'],
    cards: [{ title: 'Express checkout button', age: 0 }, { title: 'Remember last shipping method', age: 0 }, { title: 'Klarna in DE and AT', age: 0 }, { title: 'Faster card form autofill', age: 0 }, { title: 'Order confirmation redesign', age: 0 }, { title: 'Accessible error summary', age: 0 }, { title: 'Promo code at cart level', age: 0 }]
  }
])

const announce = ref('')
const ownerItems = (names: string[]) => names.map(n => ({ name: n, tone: 'auto' as const }))
const collapsedCount = computed(() => columns.filter(c => c.collapsed).length)

function menuFor(col: Col) {
  return [
    { heading: col.name },
    { value: 'collapse', label: 'Collapse column', shortcut: '⌘[' },
    { value: 'sort', label: 'Oldest cards first' },
    ...(col.limit ? [{ value: 'raise', label: `Raise limit to ${col.limit + 1}` }, { value: 'lower', label: `Lower limit to ${col.limit - 1}`, disabled: col.limit <= 1 }] : [{ value: 'limit', label: 'Set a limit of 8' }]),
    { separator: true },
    { value: 'clear', label: col.id === 'live' ? 'Archive shipped cards' : 'Move all to Backlog', destructive: true }
  ]
}

function act(col: Col, action: string | number | undefined) {
  if (action === 'collapse') col.collapsed = true
  if (action === 'sort') col.cards.sort((a, b) => b.age - a.age)
  if (action === 'raise' && col.limit) col.limit++
  if (action === 'lower' && col.limit && col.limit > 1) col.limit--
  if (action === 'limit') col.limit = 8
  if (action === 'clear') col.cards.splice(0)
  const messages: Record<string, string> = {
    collapse: `${col.name} collapsed.`, sort: `${col.name} sorted, oldest first.`, raise: `${col.name} limit is now ${col.limit}.`,
    lower: `${col.name} limit is now ${col.limit}.`, limit: `${col.name} limit set to 8.`, clear: `${col.name} cleared.`
  }
  announce.value = messages[String(action)] ?? ''
}
</script>

<style scoped>
.gh__name { margin: 0; white-space: nowrap; overflow: hidden; }
.gh__line > :last-child { margin-inline-start: auto; }
.gh__slots span { background: var(--mi-fill3); }
.gh__slots span.is-full { background: var(--c); }
.gh__slots span.is-over { background: repeating-linear-gradient(135deg, var(--mi-orange) 0 4px, color-mix(in srgb, var(--mi-orange) 45%, transparent) 4px 8px); }
.gh__stat-label { text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
</style>

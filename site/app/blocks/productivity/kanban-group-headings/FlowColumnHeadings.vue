<template>
  <section class="gh" aria-labelledby="flow-headings-title">
    <header class="gh__head">
      <div>
        <MiText id="flow-headings-title" variant="title3" as="h2" weight="semibold">Checkout redesign</MiText>
        <MiText variant="footnote" tone="label2">Column headings carry capacity, flow speed and owners</MiText>
      </div>
      <MiButton v-if="collapsedCount" variant="gray" size="small" @click="columns.forEach(c => (c.collapsed = false))">Expand all ({{ collapsedCount }})</MiButton>
    </header>

    <div class="gh__row" tabindex="0" role="region" aria-label="Stages">
      <section v-for="col in columns" :key="col.id" class="gh__col" :class="{ 'is-collapsed': col.collapsed }" :style="{ '--c': col.color }" :aria-labelledby="'flow-headings-' + col.id">
        <!-- Collapsed: a slim vertical spine that expands again on click. -->
        <button v-if="col.collapsed" type="button" class="gh__spine" :aria-label="'Expand ' + col.name + ', ' + col.cards.length + ' cards'" @click="col.collapsed = false">
          <span class="gh__spine-count">{{ col.cards.length }}</span>
          <span :id="'flow-headings-' + col.id" class="gh__spine-name">{{ col.name }}</span>
        </button>

        <template v-else>
          <header class="gh__card">
            <div class="gh__line">
              <span class="gh__swatch" aria-hidden="true" />
              <MiText :id="'flow-headings-' + col.id" variant="headline" as="h3" class="gh__name">{{ col.name }}</MiText>
              <span class="gh__count">{{ col.cards.length }}</span>
              <MiMenu :items="menuFor(col)" :aria-label="col.name + ' actions'" placement="bottom-end" @select="(item) => act(col, item.value)">
                <template #trigger="{ props }">
                  <MiIconButton v-bind="props" :label="col.name + ' actions'" variant="plain" size="small"><MiIcon name="more" :size="18" /></MiIconButton>
                </template>
              </MiMenu>
            </div>

            <!-- Capacity as slots: filled, free, and overflow past the limit. -->
            <div v-if="col.limit" class="gh__slots" role="meter" :aria-label="col.name + ' work in progress'" aria-valuemin="0" :aria-valuemax="col.limit" :aria-valuenow="col.cards.length" :aria-valuetext="col.cards.length + ' of ' + col.limit">
              <span v-for="n in Math.max(col.limit, col.cards.length)" :key="n" :class="{ 'is-full': n <= col.cards.length, 'is-over': n > col.limit }" />
            </div>
            <MiText v-if="col.limit" variant="caption" :tone="col.cards.length > col.limit ? 'orange' : 'label2'" weight="medium">
              {{ col.cards.length > col.limit ? `${col.cards.length - col.limit} over the limit of ${col.limit}` : `${col.limit - col.cards.length} of ${col.limit} slots free` }}
            </MiText>
            <MiText v-else variant="caption" tone="label2" weight="medium">No limit · {{ col.note }}</MiText>

            <div class="gh__stats">
              <div class="gh__stat">
                <MiText variant="caption2" tone="label2" weight="semibold" as="span" class="gh__stat-label">{{ col.metricLabel }}</MiText>
                <span class="gh__stat-val">{{ col.metric }}</span>
              </div>
              <MiSparkline :values="col.trend" :width="88" :height="28" :label="col.name + ' ' + col.metricLabel.toLowerCase() + ', last 8 weeks'" class="gh__spark" />
              <MiAvatarGroup :items="ownerItems(col.owners)" :max="2" :size="24" class="gh__owners" />
            </div>
          </header>

          <ol class="gh__cards" :aria-label="col.name + ' cards'">
            <li v-for="card in col.cards.slice(0, 3)" :key="card.title" class="gh__stub">
              <span class="gh__stub-title">{{ card.title }}</span>
              <span class="gh__stub-age">{{ card.age }}d</span>
            </li>
            <li v-if="col.cards.length > 3" class="gh__more">+{{ col.cards.length - 3 }} more</li>
          </ol>
        </template>
      </section>
    </div>
    <p class="gh__sr" role="status">{{ announce }}</p>
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
.gh { container-type: inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.gh__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }

.gh__row { display: flex; gap: 12px; align-items: stretch; overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x mandatory; padding: 2px 2px 8px; }
.gh__row:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; border-radius: var(--mi-radius-l); }
/* Explicit track: an implicit one grows to the widest card and spills over the next column. */
.gh__col { flex: 0 0 min(276px, 86%); display: grid; grid-template-columns: minmax(0, 1fr); align-content: start; gap: 10px; scroll-snap-align: start; min-width: 0; }
@container (min-width: 1120px) { .gh__col { flex: 1 1 0; } }
.gh__col.is-collapsed { flex: 0 0 52px; }

.gh__card {
  position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; padding: 14px 14px 12px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden;
}
/* Stage colour as a soft wash along the top edge. */
.gh__card::before { content: ""; position: absolute; inset: 0 0 auto; height: 3px; background: var(--c); }
.gh__line { display: flex; align-items: center; gap: 8px; min-width: 0; }
.gh__swatch { width: 10px; height: 10px; flex: none; border-radius: 3px; background: var(--c); }
.gh__name { margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gh__count { padding: 1px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; background: color-mix(in srgb, var(--c) 16%, transparent); }
.gh__line > :last-child { margin-inline-start: auto; }

.gh__slots { display: flex; gap: 3px; }
.gh__slots span { flex: 1; height: 8px; border-radius: 3px; background: var(--mi-fill3); }
.gh__slots span.is-full { background: var(--c); }
.gh__slots span.is-over { background: repeating-linear-gradient(135deg, var(--mi-orange) 0 4px, color-mix(in srgb, var(--mi-orange) 45%, transparent) 4px 8px); }

.gh__stats { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px; padding-top: 10px; border-top: 1px solid var(--mi-sep); }
.gh__stat { display: grid; min-width: 0; }
.gh__stat-label { text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
.gh__stat-val { font-size: 18px; font-weight: 700; letter-spacing: -.02em; font-variant-numeric: tabular-nums; white-space: nowrap; }
.gh__spark { justify-self: center; width: 100%; max-width: 88px; height: auto; color: var(--c); }
.gh__owners { justify-self: end; }

.gh__cards { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; margin: 0; padding: 0; list-style: none; }
.gh__stub { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 12px; border-radius: var(--mi-radius-m); background: color-mix(in srgb, var(--mi-card) 70%, transparent); box-shadow: inset 0 0 0 1px var(--mi-sep); font-size: 13px; }
.gh__stub-title { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gh__stub-age { flex: none; font-size: 11px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.gh__more { padding: 4px 12px; font-size: 12px; color: var(--mi-label2); }

.gh__spine {
  display: flex; flex-direction: column; align-items: center; gap: 10px; min-height: 260px; padding: 12px 0; border: 0; border-radius: var(--mi-radius-l);
  background: var(--mi-card); box-shadow: var(--mi-sh1), inset 0 3px 0 var(--c); font: inherit; color: var(--mi-label); cursor: pointer;
  transition: transform var(--mi-dur-2) var(--mi-spring);
}
.gh__spine:hover { transform: translateY(-2px); }
.gh__spine:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.gh__spine-count { display: grid; place-items: center; min-width: 26px; height: 26px; border-radius: 13px; font-size: 12px; font-weight: 700; background: color-mix(in srgb, var(--c) 18%, transparent); }
.gh__spine-name { writing-mode: vertical-rl; font-size: 14px; font-weight: 600; letter-spacing: .02em; }
.gh__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; margin: 0; }
</style>

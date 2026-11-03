<template>
  <section class="sf" aria-labelledby="sf-title">
    <header class="sf__head">
      <div>
        <MiText id="sf-title" variant="title3" as="h2" weight="semibold">Freight lanes</MiText>
        <MiText variant="footnote" tone="label2">European network · pallets per week, last 4 weeks</MiText>
      </div>
      <MiSegmented v-model="direction" label="Lane direction" :options="directions" />
    </header>

    <div class="sf__hubs" role="group" aria-label="Hub">
      <MiChip
        v-for="h in hubs" :key="h.id" selectable size="small" tone="neutral" :label="h.name"
        :model-value="hub === h.id" @update:model-value="hub = h.id"
      />
    </div>

    <div class="sf__body">
      <!-- Abstract map: hubs placed by rough position, lanes as arcs whose width follows volume. -->
      <div class="sf__map">
        <svg viewBox="0 0 400 260" role="img" :aria-label="`Freight lanes map, ${connected.length} lanes highlighted for ${current.name}`">
          <path
            v-for="l in drawn" :key="l.id" :d="l.path" class="sf__lane" :class="{ 'is-on': l.on, 'is-in': l.inbound }"
            :stroke-width="l.width"
          />
          <g v-for="h in hubs" :key="h.id" class="sf__node" :class="{ 'is-on': h.id === hub }" @click="hub = h.id">
            <circle :cx="h.x" :cy="h.y" :r="h.r" />
            <text :x="h.x" :y="h.y - h.r - 6">{{ h.name }}</text>
          </g>
        </svg>
        <MiChartLegend :items="legend" aria-label="Lane styles" class="sf__legend" />
      </div>

      <aside class="sf__side" aria-labelledby="sf-side-title" aria-live="polite">
        <div class="sf__side-top">
          <MiText id="sf-side-title" variant="headline" as="h3">{{ current.name }}</MiText>
          <MiText variant="footnote" tone="label2">{{ totalOf(connected).toLocaleString('en-US') }} pallets a week on {{ connected.length }} lanes</MiText>
        </div>
        <ol class="sf__lanes">
          <li v-for="l in connected" :key="l.id">
            <div class="sf__lane-top">
              <MiText variant="subheadline" weight="medium" :lines="1">{{ nameOf(l.from) }} → {{ nameOf(l.to) }}</MiText>
              <span class="sf__lane-val">{{ l.pallets }}</span>
            </div>
            <span class="sf__bar" aria-hidden="true"><i :class="{ 'is-in': l.to === hub }" :style="{ transform: `scaleX(${l.pallets / maxPallets})` }" /></span>
            <MiText variant="caption" :tone="l.onTime < 0.9 ? 'orange' : 'label2'">
              {{ l.days }}-day transit · {{ Math.round(l.onTime * 100) }}% on time
            </MiText>
          </li>
        </ol>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Hub { id: string, name: string, x: number, y: number }
interface Lane { id: string, from: string, to: string, pallets: number, days: number, onTime: number }

const directions = [{ value: 'all', label: 'All' }, { value: 'out', label: 'Outbound' }, { value: 'in', label: 'Inbound' }]
const direction = ref<string | number | null>('all')
const hub = ref('rtm')

// Sample network; x/y are positions on the 400 × 260 drawing, not coordinates.
const hubList: Hub[] = [
  { id: 'dub', name: 'Dublin', x: 52, y: 78 },
  { id: 'rtm', name: 'Rotterdam', x: 168, y: 100 },
  { id: 'ham', name: 'Hamburg', x: 222, y: 70 },
  { id: 'waw', name: 'Warsaw', x: 318, y: 92 },
  { id: 'lys', name: 'Lyon', x: 166, y: 176 },
  { id: 'mil', name: 'Milan', x: 230, y: 184 },
  { id: 'mad', name: 'Madrid', x: 78, y: 228 }
]
const lanes: Lane[] = [
  { id: 'rtm-ham', from: 'rtm', to: 'ham', pallets: 420, days: 1, onTime: 0.97 },
  { id: 'rtm-lys', from: 'rtm', to: 'lys', pallets: 310, days: 2, onTime: 0.94 },
  { id: 'rtm-mad', from: 'rtm', to: 'mad', pallets: 260, days: 3, onTime: 0.81 },
  { id: 'rtm-dub', from: 'rtm', to: 'dub', pallets: 180, days: 3, onTime: 0.88 },
  { id: 'ham-waw', from: 'ham', to: 'waw', pallets: 290, days: 2, onTime: 0.95 },
  { id: 'ham-rtm', from: 'ham', to: 'rtm', pallets: 150, days: 1, onTime: 0.98 },
  { id: 'waw-ham', from: 'waw', to: 'ham', pallets: 110, days: 2, onTime: 0.93 },
  { id: 'lys-mil', from: 'lys', to: 'mil', pallets: 160, days: 1, onTime: 0.96 },
  { id: 'mil-lys', from: 'mil', to: 'lys', pallets: 140, days: 1, onTime: 0.95 },
  { id: 'mil-mad', from: 'mil', to: 'mad', pallets: 120, days: 3, onTime: 0.86 },
  { id: 'mad-lys', from: 'mad', to: 'lys', pallets: 90, days: 2, onTime: 0.92 },
  { id: 'dub-rtm', from: 'dub', to: 'rtm', pallets: 70, days: 3, onTime: 0.9 }
]

const byId = new Map(hubList.map(h => [h.id, h]))
const totalOf = (ls: Lane[]) => ls.reduce((n, l) => n + l.pallets, 0)
const maxPallets = Math.max(...lanes.map(l => l.pallets))
const nameOf = (id: string) => byId.get(id)?.name ?? id

// Node size follows everything the hub handles, in and out.
const hubs = hubList.map(h => ({ ...h, r: 4 + Math.sqrt(totalOf(lanes.filter(l => l.from === h.id || l.to === h.id))) / 5 }))
const current = computed(() => byId.get(hub.value) ?? hubList[0]!)

const touches = (l: Lane) => (direction.value !== 'in' && l.from === hub.value) || (direction.value !== 'out' && l.to === hub.value)
const connected = computed(() => lanes.filter(touches).sort((a, b) => b.pallets - a.pallets))

// Each arc bends to its left, so a lane and its return trip draw as two separate curves.
const arcs = lanes.map((l) => {
  const a = byId.get(l.from)!
  const b = byId.get(l.to)!
  const cx = (a.x + b.x) / 2 - (b.y - a.y) * 0.18
  const cy = (a.y + b.y) / 2 + (b.x - a.x) * 0.18
  return { ...l, path: `M${a.x} ${a.y}Q${cx} ${cy} ${b.x} ${b.y}`, width: 1.5 + (l.pallets / maxPallets) * 6 }
})
const drawn = computed(() => arcs.map(a => ({ ...a, on: touches(a), inbound: a.to === hub.value })))

const legend = [
  { label: 'Outbound', color: 'var(--mi-p)', shape: 'line' as const },
  { label: 'Inbound', color: 'var(--mi-s)', shape: 'line' as const }
]
</script>

<style scoped>
.sf { container-type: inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.sf__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.sf__hubs { display: flex; flex-wrap: wrap; gap: 6px; }
.sf__body { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 820px) { .sf__body { grid-template-columns: minmax(0, 1fr) 300px; } }

/* Dot grid stands in for a basemap without shipping any geodata. */
.sf__map {
  display: grid; gap: 8px; min-width: 0; padding: 16px; border-radius: var(--mi-radius-xl); box-shadow: var(--mi-sh1);
  background: radial-gradient(circle, var(--mi-fill3) 1px, transparent 1.5px) 0 0 / 14px 14px, var(--mi-card);
}
.sf__map svg { display: block; width: 100%; height: auto; overflow: visible; }
.sf__legend { justify-self: start; }

.sf__lane { fill: none; stroke: var(--mi-label3); stroke-linecap: round; opacity: .14; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.sf__lane.is-on { stroke: var(--mi-p); opacity: .9; }
.sf__lane.is-on.is-in { stroke: var(--mi-s); stroke-dasharray: 6 5; }

.sf__node { cursor: pointer; }
.sf__node circle { fill: var(--mi-card); stroke: var(--mi-label2); stroke-width: 2; }
.sf__node.is-on circle { fill: var(--mi-p); stroke: var(--mi-p); }
.sf__node text { font-size: 11px; font-weight: 600; text-anchor: middle; fill: var(--mi-label2); paint-order: stroke; stroke: var(--mi-card); stroke-width: 3px; }
.sf__node.is-on text { fill: var(--mi-label); }

.sf__side { display: grid; gap: 12px; align-content: start; min-width: 0; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.sf__side-top { display: grid; gap: 2px; }
.sf__lanes { display: grid; margin: 0; padding: 0; list-style: none; }
.sf__lanes li { display: grid; gap: 5px; padding: 10px 0; border-top: 1px solid var(--mi-sep); }
.sf__lane-top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; min-width: 0; }
.sf__lane-val { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
.sf__bar { display: block; height: 5px; border-radius: 3px; background: var(--mi-fill4); overflow: hidden; }
.sf__bar i { display: block; height: 100%; border-radius: inherit; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.sf__bar i.is-in { background: var(--mi-s); }
</style>

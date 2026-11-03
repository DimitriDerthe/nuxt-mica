<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="sf-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="sf-title" variant="title3" as="h2" weight="semibold">Freight lanes</MiText>
        <MiText variant="footnote" tone="label2">European network · pallets per week, last 4 weeks</MiText>
      </div>
      <MiSegmented v-model="direction" label="Lane direction" :options="directions" />
    </header>

    <div class="mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Hub">
      <MiChip
        v-for="h in hubs" :key="h.id" selectable size="small" tone="neutral" :label="h.name"
        :model-value="hub === h.id" @update:model-value="hub = h.id"
      />
    </div>

    <div class="mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[820px]:grid-cols-[minmax(0,_1fr)_300px]">
      <!-- Abstract map: hubs placed by rough position, lanes as arcs whose width follows volume. -->
      <div class="mi:grid mi:gap-2 mi:min-w-0 mi:p-4 mi:rounded-xl mi:shadow-1 mi:[background:radial-gradient(circle,_var(--mi-fill3)_1px,_transparent_1.5px)_0_0_/_14px_14px,_var(--mi-card)]">
        <svg viewBox="0 0 400 260" class="mi:block mi:w-full mi:h-auto mi:overflow-visible" role="img" :aria-label="`Freight lanes map, ${connected.length} lanes highlighted for ${current.name}`">
          <path
            v-for="l in drawn" :key="l.id" :d="l.path" class="mi:fill-[color:none] mi:[stroke-linecap:round] mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" :class="!l.on ? 'mi:stroke-label3 mi:opacity-14' : l.inbound ? 'mi:stroke-s mi:opacity-90 mi:[stroke-dasharray:6_5]' : 'mi:stroke-p mi:opacity-90'"
            :stroke-width="l.width"
          />
          <g v-for="h in hubs" :key="h.id" class="mi:cursor-pointer" @click="hub = h.id">
            <circle class="mi:[stroke-width:2]" :class="h.id === hub ? 'mi:fill-p mi:stroke-p' : 'mi:fill-card mi:stroke-label2'" :cx="h.x" :cy="h.y" :r="h.r" />
            <text class="mi:stroke-card mi:text-[11px] mi:font-semibold mi:[text-anchor:middle] mi:[paint-order:stroke] mi:[stroke-width:3px]" :class="h.id === hub ? 'mi:fill-label' : 'mi:fill-label2'" :x="h.x" :y="h.y - h.r - 6">{{ h.name }}</text>
          </g>
        </svg>
        <MiChartLegend :items="legend" aria-label="Lane styles" class="mi:justify-self-start" />
      </div>

      <aside class="mi:grid mi:gap-3 mi:content-start mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="sf-side-title" aria-live="polite">
        <div class="mi:grid mi:gap-0.5">
          <MiText id="sf-side-title" variant="headline" as="h3">{{ current.name }}</MiText>
          <MiText variant="footnote" tone="label2">{{ totalOf(connected).toLocaleString('en-US') }} pallets a week on {{ connected.length }} lanes</MiText>
        </div>
        <ol class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
          <li class="mi:grid mi:gap-[5px] mi:py-2.5 mi:px-0 mi:border-t mi:border-t-sep" v-for="l in connected" :key="l.id">
            <div class="mi:flex mi:items-baseline mi:justify-between mi:gap-2.5 mi:min-w-0">
              <MiText variant="subheadline" weight="medium" :lines="1">{{ nameOf(l.from) }} → {{ nameOf(l.to) }}</MiText>
              <span class="mi:text-[14px] mi:font-semibold mi:tabular-nums">{{ l.pallets }}</span>
            </div>
            <span class="mi:block mi:h-[5px] mi:rounded-[3px] mi:[background:var(--mi-fill4)] mi:overflow-hidden" aria-hidden="true"><i class="mi:block mi:h-full mi:rounded-[inherit] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :class="l.to === hub ? 'mi:[background:var(--mi-s)]' : 'mi:[background:var(--mi-p)]'" :style="{ transform: `scaleX(${l.pallets / maxPallets})` }" /></span>
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

<template>
  <section class="tz" aria-labelledby="tz-title">
    <header class="tz__head">
      <div>
        <MiText id="tz-title" as="h2" variant="title3" weight="bold">Partner team</MiText>
        <MiText variant="footnote" tone="label2">Times shown against your day in Paris, 09:00 to 18:00 · now {{ fmtH(NOW) }}</MiText>
        <p class="tz__legend" aria-hidden="true">
          <span><i class="tz__band--them" />Their hours</span><span><i class="tz__band--you" />Yours</span><span><i class="tz__band--both" />Shared</span>
        </p>
      </div>
      <MiSegmented v-model="sort" label="Sort contacts" :options="[{ value: 'overlap', label: 'Most overlap' }, { value: 'name', label: 'Name' }]" />
    </header>

    <TransitionGroup tag="ul" name="tz-move" class="tz__grid">
      <li v-for="c in sorted" :key="c.id" class="tz__card">
        <div class="tz__top">
          <MiBadge dot-only :tone="c.state.tone" placement="bottom-right" :dot-size="12">
            <template #target><MiAvatar :name="c.name" size="md" :tone="c.tone" decorative /></template>
          </MiBadge>
          <div class="tz__who">
            <MiText as="h3" variant="headline" weight="semibold" :lines="1">{{ c.name }}</MiText>
            <MiText variant="footnote" tone="label2" :lines="1">{{ c.role }}</MiText>
          </div>
          <MiIconButton :label="'Favourite ' + c.name" variant="plain" size="small" :pressed="c.fav" @click="toggleFav(c.id)">
            <MiIcon name="star" :filled="c.fav" :size="18" />
          </MiIconButton>
        </div>

        <div class="tz__local">
          <span class="tz__clock">{{ fmtH(local(c)) }}</span>
          <span class="tz__where">{{ c.city }} · {{ c.offset >= 0 ? '+' : '' }}{{ c.offset }}h</span>
          <MiBadge :tone="c.state.tone" :label="c.state.label" dot />
        </div>

        <!-- Overlap bar: their working day mapped onto yours, the shared hours in brand colour. -->
        <div class="tz__bar" role="img" :aria-label="c.overlap ? c.overlap + ' hours overlap with your working day' : 'No overlap with your working day'">
          <span v-for="(s, i) in segs(c.start - c.offset, c.end - c.offset)" :key="'t' + i" class="tz__band tz__band--them" :style="band(s)" />
          <span class="tz__band tz__band--you" :style="band([MY_START, MY_END])" />
          <span v-if="c.overlap" class="tz__band tz__band--both" :style="band(c.window)" />
          <span class="tz__now" :style="{ left: (NOW / 24) * 100 + '%' }" />
        </div>
        <div class="tz__ticks" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
        <MiText variant="footnote" :tone="c.overlap >= 4 ? 'green' : c.overlap ? 'label' : 'orange'" weight="medium">
          {{ c.overlap ? c.overlap + 'h overlap · ' + fmtH(c.window[0]) + ' to ' + fmtH(c.window[1]) + ' your time' : 'No shared hours, send async' }}
        </MiText>

        <div class="tz__actions">
          <MiButton variant="tinted" size="small" class="tz__msg">
            <template #leading><MiIcon name="chat" :size="16" /></template>Message
          </MiButton>
          <MiIconButton :label="'Call ' + c.name" variant="gray" size="regular" :disabled="c.state.label === 'Off hours'"><MiIcon :svg="phone" :size="18" /></MiIconButton>
          <MiCopyButton :value="c.email" icon-only variant="outline" :label="'Copy ' + c.email" copied-label="Email copied" />
        </div>
      </li>
    </TransitionGroup>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Tone = 'success' | 'warning' | 'neutral'
interface Contact { id: string, name: string, role: string, city: string, email: string, offset: number, start: number, end: number, tone: 'indigo' | 'green' | 'orange' | 'pink', fav: boolean }

const phone = '<path d="M6.5 3.5h3l1.5 4-2 1.3a10.5 10.5 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>'
// Fixed "now" keeps server and client output identical; swap for the real clock.
const NOW = 14 + 20 / 60
const MY_START = 9
const MY_END = 18

// Sample contacts; offset is hours ahead of Paris, start/end their local working hours.
const contacts = ref<Contact[]>([
  { id: 'aiko', name: 'Aiko Tanaka', role: 'Product designer, Tokyo studio', city: 'Tokyo', email: 'aiko.tanaka@kumo.jp', offset: 8, start: 10, end: 19, tone: 'indigo', fav: false },
  { id: 'mateo', name: 'Mateo Silva', role: 'Engineering manager, Payments', city: 'São Paulo', email: 'mateo@pagaflow.com.br', offset: -4, start: 9, end: 18, tone: 'green', fav: true },
  { id: 'grace', name: 'Grace Mwangi', role: 'Solutions engineer, East Africa', city: 'Nairobi', email: 'grace.mwangi@savanna.io', offset: 2, start: 8, end: 17, tone: 'orange', fav: false }
])

const sort = ref<string | number | null>('overlap')

const wrap = (h: number) => ((h % 24) + 24) % 24
const local = (c: Contact) => wrap(NOW + c.offset)
const fmtH = (h: number) => `${String(Math.floor(wrap(h))).padStart(2, '0')}:${String(Math.round((h % 1) * 60) % 60).padStart(2, '0')}`

/** Split a span on your clock into segments that stay inside 0 to 24. */
function segs(a: number, b: number): [number, number][] {
  const s = wrap(a)
  const e = s + (b - a)
  return e <= 24 ? [[s, e]] : [[s, 24], [0, e - 24]]
}
const band = ([a, b]: [number, number]) => ({ left: (a / 24) * 100 + '%', width: ((b - a) / 24) * 100 + '%' })

const enriched = computed(() => contacts.value.map((c) => {
  let best: [number, number] = [0, 0]
  for (const [a, b] of segs(c.start - c.offset, c.end - c.offset)) {
    const lo = Math.max(a, MY_START)
    const hi = Math.min(b, MY_END)
    if (hi - lo > best[1] - best[0]) best = [lo, hi]
  }
  const t = local(c)
  const state: { label: string, tone: Tone } = t >= c.start && t < c.end
    ? (c.end - t < 1 ? { label: 'Wrapping up', tone: 'warning' } : { label: 'Working', tone: 'success' })
    : { label: 'Off hours', tone: 'neutral' }
  return { ...c, overlap: Math.round((best[1] - best[0]) * 10) / 10, window: best, state }
}))

function toggleFav(id: string) {
  const c = contacts.value.find(x => x.id === id)
  if (c) c.fav = !c.fav
}

const sorted = computed(() => [...enriched.value].sort((a, b) => (sort.value === 'name' ? a.name.localeCompare(b.name) : b.overlap - a.overlap)))
</script>

<style scoped>
.tz { container-type: inline-size; display: grid; align-content: start; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }
.tz__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.tz__legend { display: flex; flex-wrap: wrap; gap: 14px; margin: 8px 0 0; font-size: 12px; color: var(--mi-label2); }
.tz__legend span { display: inline-flex; align-items: center; gap: 6px; }
.tz__legend i { display: inline-block; width: 14px; height: 8px; border-radius: 3px; }
.tz__grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 620px) { .tz__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 960px) { .tz__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.tz__card { display: grid; gap: 12px; align-content: start; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.tz__top { display: flex; align-items: center; gap: 12px; }
.tz__who { flex: 1; min-width: 0; }

.tz__local { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 10px; }
.tz__clock { font-size: 30px; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; line-height: 1; }
.tz__where { flex: 1; min-width: 0; font-size: 13px; color: var(--mi-label2); }

.tz__bar { position: relative; height: 14px; border-radius: 7px; background: var(--mi-fill4); overflow: hidden; }
.tz__band { position: absolute; top: 0; bottom: 0; }
.tz__band--them { background: color-mix(in srgb, var(--mi-s) 32%, transparent); }
.tz__band--you { top: 9px; background: var(--mi-p-tint2); }
.tz__band--both { background: var(--mi-p); }
.tz__now { position: absolute; top: -2px; bottom: -2px; width: 2px; margin-left: -1px; background: var(--mi-label); }
.tz__ticks { display: flex; justify-content: space-between; margin-top: -6px; font-size: 10.5px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }

.tz__actions { display: flex; align-items: center; gap: 8px; padding-top: 4px; }
.tz__msg { flex: 1; }

.tz-move-move { transition: transform var(--mi-dur-4) var(--mi-spring); }
</style>

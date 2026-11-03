<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="tz-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="tz-title" as="h2" variant="title3" weight="bold">Partner team</MiText>
        <MiText variant="footnote" tone="label2">Times shown against your day in Paris, 09:00 to 18:00 · now {{ fmtH(NOW) }}</MiText>
        <p class="mi:flex mi:flex-wrap mi:gap-3.5 mi:mt-2 mi:mx-0 mi:mb-0 mi:text-[12px] mi:text-label2" aria-hidden="true">
          <span class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:inline-block mi:w-3.5 mi:h-2 mi:rounded-[3px] mi:[background:color-mix(in_srgb,_var(--mi-s)_32%,_transparent)]" />Their hours</span><span class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:inline-block mi:w-3.5 mi:h-2 mi:rounded-[3px] mi:top-[9px] mi:bg-p-tint2" />Yours</span><span class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:inline-block mi:w-3.5 mi:h-2 mi:rounded-[3px] mi:bg-p" />Shared</span>
        </p>
      </div>
      <MiSegmented v-model="sort" label="Sort contacts" :options="[{ value: 'overlap', label: 'Most overlap' }, { value: 'name', label: 'Name' }]" />
    </header>

    <TransitionGroup tag="ul" move-class="mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" class="mi:[list-style:none] mi:m-0 mi:p-0 mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[620px]:grid-cols-2 mi:@[960px]:grid-cols-3">
      <li v-for="c in sorted" :key="c.id" class="mi:grid mi:gap-3 mi:content-start mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1">
        <div class="mi:flex mi:items-center mi:gap-3">
          <MiBadge dot-only :tone="c.state.tone" placement="bottom-right" :dot-size="12">
            <template #target><MiAvatar :name="c.name" size="md" :tone="c.tone" decorative /></template>
          </MiBadge>
          <div class="mi:flex-1 mi:min-w-0">
            <MiText as="h3" variant="headline" weight="semibold" :lines="1">{{ c.name }}</MiText>
            <MiText variant="footnote" tone="label2" :lines="1">{{ c.role }}</MiText>
          </div>
          <MiIconButton :label="'Favourite ' + c.name" variant="plain" size="small" :pressed="c.fav" @click="toggleFav(c.id)">
            <MiIcon name="star" :filled="c.fav" :size="18" />
          </MiIconButton>
        </div>

        <div class="mi:flex mi:flex-wrap mi:items-baseline mi:gap-y-1.5 mi:gap-x-2.5">
          <span class="mi:text-[30px] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums mi:leading-none">{{ fmtH(local(c)) }}</span>
          <span class="mi:flex-1 mi:min-w-0 mi:text-[13px] mi:text-label2">{{ c.city }} · {{ c.offset >= 0 ? '+' : '' }}{{ c.offset }}h</span>
          <MiBadge :tone="c.state.tone" :label="c.state.label" dot />
        </div>

        <!-- Overlap bar: their working day mapped onto yours, the shared hours in brand colour. -->
        <div class="mi:relative mi:h-3.5 mi:rounded-[7px] mi:bg-fill4 mi:overflow-hidden" role="img" :aria-label="c.overlap ? c.overlap + ' hours overlap with your working day' : 'No overlap with your working day'">
          <span v-for="(s, i) in segs(c.start - c.offset, c.end - c.offset)" :key="'t' + i" class="mi:absolute mi:top-0 mi:bottom-0 mi:[background:color-mix(in_srgb,_var(--mi-s)_32%,_transparent)]" :style="band(s)" />
          <span class="mi:absolute mi:top-0 mi:bottom-0 mi:top-[9px] mi:bg-p-tint2" :style="band([MY_START, MY_END])" />
          <span v-if="c.overlap" class="mi:absolute mi:top-0 mi:bottom-0 mi:bg-p" :style="band(c.window)" />
          <span class="mi:absolute mi:-top-0.5 mi:-bottom-0.5 mi:w-0.5 mi:-ml-px mi:bg-label" :style="{ left: (NOW / 24) * 100 + '%' }" />
        </div>
        <div class="mi:flex mi:justify-between mi:-mt-1.5 mi:text-[10.5px] mi:text-label3 mi:tabular-nums" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
        <MiText variant="footnote" :tone="c.overlap >= 4 ? 'green' : c.overlap ? 'label' : 'orange'" weight="medium">
          {{ c.overlap ? c.overlap + 'h overlap · ' + fmtH(c.window[0]) + ' to ' + fmtH(c.window[1]) + ' your time' : 'No shared hours, send async' }}
        </MiText>

        <div class="mi:flex mi:items-center mi:gap-2 mi:pt-1">
          <MiButton variant="tinted" size="small" class="mi:flex-1">
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

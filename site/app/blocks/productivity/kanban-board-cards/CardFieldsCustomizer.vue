<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="cfc-title">
    <div class="mi:grid mi:gap-5 mi:@[680px]:grid-cols-[minmax(260px,_340px)_minmax(0,_1fr)] mi:@[680px]:items-start mi:@[980px]:grid-cols-[340px_minmax(0,_420px)] mi:@[980px]:justify-center">
      <!-- Settings: what a card shows, and how dense the board gets. -->
      <div class="mi:grid mi:content-start mi:gap-5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
        <div>
          <MiText id="cfc-title" variant="title3" as="h2" weight="semibold">Card layout</MiText>
          <MiText variant="footnote" tone="label2">Applies to every card on the Mobile app board.</MiText>
        </div>
        <div class="mi:grid mi:gap-2.5">
          <MiText variant="footnote" weight="semibold" tone="label2" as="h3" class="mi:m-0 mi:uppercase mi:tracking-[.05em]! mi:text-[11px]!">Density</MiText>
          <MiSegmented v-model="density" label="Density" :options="densities" />
        </div>
        <div class="mi:grid mi:gap-2.5">
          <MiText variant="footnote" weight="semibold" tone="label2" as="h3" class="mi:m-0 mi:uppercase mi:tracking-[.05em]! mi:text-[11px]!">Fields on the card</MiText>
          <MiCheckbox v-for="f in fields" :key="f.id" v-model="show[f.id]" :label="f.label" :description="f.hint" />
        </div>
        <div class="mi:flex mi:items-baseline mi:gap-2.5 mi:py-3 mi:px-3.5 mi:rounded-md mi:[background:var(--mi-p-tint)]" role="status">
          <p class="mi:m-0 mi:text-[30px] mi:leading-none mi:font-bold mi:tracking-[-.03em] mi:text-p-text mi:tabular-nums">{{ fit }}</p>
          <MiText variant="footnote" tone="label2">cards fit in a 900 px column without scrolling</MiText>
        </div>
      </div>

      <!-- Live preview column. -->
      <div class="mi:grid mi:content-start mi:gap-3 mi:p-3.5 mi:rounded-xl mi:[background:var(--mi-fill4)]" :class="density === 'compact' ? 'mi:[--gap:6px] mi:[--pad:8px_10px]' : density === 'detailed' ? 'mi:[--gap:12px] mi:[--pad:14px]' : 'mi:[--gap:10px] mi:[--pad:12px]'" aria-label="Preview" role="region">
        <div class="mi:flex mi:items-center mi:justify-between mi:gap-2 mi:px-1">
          <MiText variant="subheadline" weight="semibold" as="h3" class="mi:m-0">In review</MiText>
          <MiBadge :count="cards.length" tone="neutral" count-noun="cards" />
        </div>
        <ul class="mi:grid mi:gap-(--gap) mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="c in cards" :key="c.id" class="mi:grid mi:gap-2 mi:p-(--pad) mi:overflow-hidden mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1" :class="density === 'compact' ? 'mi:grid-cols-[minmax(0,_1fr)_auto] mi:items-center' : ''">
            <span v-if="show.cover && c.cover" class="mi:block mi:h-16 mi:mb-0 mi:[background:radial-gradient(120%_140%_at_0%_0%,_var(--a),_transparent_60%),_linear-gradient(135deg,_var(--mi-s-tint),_var(--mi-p-tint))] " :class="density === 'compact' ? 'mi:hidden' : density === 'detailed' ? 'mi:-mt-3.5 mi:-mx-3.5' : 'mi:-mt-3 mi:-mx-3'" :style="{ '--a': c.cover }" aria-hidden="true" />
            <div v-if="show.labels && density !== 'compact'" class="mi:flex mi:flex-wrap mi:gap-1">
              <span v-for="l in c.labels" :key="l.name" class="mi:py-0.5 mi:px-2 mi:rounded-[999px] mi:text-[11px] mi:font-semibold mi:[background:color-mix(in_srgb,_var(--c)_16%,_transparent)] mi:text-label" :style="{ '--c': l.color }">{{ l.name }}</span>
            </div>
            <p class="mi:m-0 mi:text-[14px] mi:font-semibold mi:leading-[1.35] mi:min-w-0" :class="density === 'compact' ? 'mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis' : ''">
              <span class="mi:mr-1.5 mi:text-[12px] mi:font-medium mi:text-label3 mi:tabular-nums">{{ c.key }}</span>{{ c.title }}
            </p>
            <p v-if="density === 'detailed'" class="mi:m-0 mi:text-[13px] mi:leading-[1.4] mi:text-label2">{{ c.desc }}</p>
            <div v-if="show.subtasks && density !== 'compact'" class="mi:flex mi:items-center mi:gap-2 mi:text-[12px] mi:text-label2 mi:tabular-nums">
              <span class="mi:flex-1 mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:overflow-hidden"><i class="mi:block mi:h-full mi:[background:var(--mi-green)] mi:origin-left" :style="{ transform: `scaleX(${c.done / c.total})` }" /></span>
              <span>{{ c.done }}/{{ c.total }}</span>
            </div>
            <div v-if="metaVisible" class="mi:flex mi:items-center mi:gap-2.5 mi:text-[12px] mi:text-label2">
              <span v-if="show.due" class="mi:inline-flex mi:items-center mi:gap-1 " :class="c.late ? 'mi:text-red-t mi:font-semibold' : ''"><MiIcon name="calendar" :size="13" />{{ c.due }}</span>
              <span v-if="show.estimate" class="mi:py-px mi:px-1.5 mi:rounded-[4px] mi:[background:var(--mi-fill3)] mi:tabular-nums">{{ c.points }} pt</span>
              <MiAvatar v-if="show.assignee" :name="c.owner" tone="auto" size="xs" class="mi:ml-auto" />
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type FieldId = 'cover' | 'labels' | 'subtasks' | 'due' | 'estimate' | 'assignee'
interface Field { id: FieldId, label: string, hint: string, px: number }
interface Card { id: number, key: string, title: string, desc: string, owner: string, due: string, late?: boolean, points: number, done: number, total: number, cover?: string, labels: { name: string, color: string }[] }

const densities = [{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfortable' }, { value: 'detailed', label: 'Detailed' }]
const density = ref<string | number | null>('comfortable')

// px: rough height each field adds to a card, used for the "cards that fit" estimate.
const fields: Field[] = [
  { id: 'cover', label: 'Cover image', hint: 'Only on cards that have one', px: 72 },
  { id: 'labels', label: 'Labels', hint: 'Hidden in compact density', px: 26 },
  { id: 'subtasks', label: 'Subtask progress', hint: 'Hidden in compact density', px: 22 },
  { id: 'due', label: 'Due date', hint: 'Turns red once overdue', px: 0 },
  { id: 'estimate', label: 'Estimate', hint: 'Story points', px: 0 },
  { id: 'assignee', label: 'Assignee', hint: 'Avatar on the right', px: 0 }
]
const show = reactive<Record<FieldId, boolean>>({ cover: false, labels: true, subtasks: true, due: true, estimate: false, assignee: true })

const cards: Card[] = [
  { id: 1, key: 'MOB-412', title: 'Offline queue for photo uploads', desc: 'Retry with backoff when the radio drops; keep order per album.', owner: 'Mei Tanaka', due: 'Nov 4', late: true, points: 5, done: 3, total: 5, cover: 'var(--mi-p)', labels: [{ name: 'iOS', color: 'var(--mi-blue)' }, { name: 'Sync', color: 'var(--mi-teal)' }] },
  { id: 2, key: 'MOB-398', title: 'Haptics on swipe-to-archive', desc: 'Light impact at the threshold, success on release.', owner: 'Ravi Menon', due: 'Nov 9', points: 2, done: 2, total: 2, labels: [{ name: 'Polish', color: 'var(--mi-purple)' }] },
  { id: 3, key: 'MOB-405', title: 'Dark mode contrast pass on charts', desc: 'Axis labels and legend chips under 4.5:1 in dark.', owner: 'Lena Brooks', due: 'Nov 12', points: 3, done: 1, total: 4, labels: [{ name: 'Accessibility', color: 'var(--mi-orange)' }, { name: 'Android', color: 'var(--mi-green)' }] }
]

const metaVisible = computed(() => show.due || show.estimate || show.assignee)
const fit = computed(() => {
  const compact = density.value === 'compact'
  const base = compact ? 44 : density.value === 'detailed' ? 98 : 64
  // Compact cards drop the cover, labels and subtasks, so those fields add nothing there.
  const extra = fields.reduce((sum, f) => sum + (show[f.id] && !(compact && f.px) ? f.px : 0), 0)
  return Math.floor(900 / (base + extra + (metaVisible.value ? 24 : 0) + 8))
})
</script>

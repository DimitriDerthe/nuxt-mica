<template>
  <section class="cfc" aria-labelledby="cfc-title">
    <div class="cfc__layout">
      <!-- Settings: what a card shows, and how dense the board gets. -->
      <div class="cfc__panel">
        <div>
          <MiText id="cfc-title" variant="title3" as="h2" weight="semibold">Card layout</MiText>
          <MiText variant="footnote" tone="label2">Applies to every card on the Mobile app board.</MiText>
        </div>
        <div class="cfc__group">
          <MiText variant="footnote" weight="semibold" tone="label2" as="h3">Density</MiText>
          <MiSegmented v-model="density" label="Density" :options="densities" />
        </div>
        <div class="cfc__group">
          <MiText variant="footnote" weight="semibold" tone="label2" as="h3">Fields on the card</MiText>
          <MiCheckbox v-for="f in fields" :key="f.id" v-model="show[f.id]" :label="f.label" :description="f.hint" />
        </div>
        <div class="cfc__fit" role="status">
          <p class="cfc__fit-num">{{ fit }}</p>
          <MiText variant="footnote" tone="label2">cards fit in a 900 px column without scrolling</MiText>
        </div>
      </div>

      <!-- Live preview column. -->
      <div class="cfc__preview" :class="'is-' + density" aria-label="Preview" role="region">
        <div class="cfc__col-head">
          <MiText variant="subheadline" weight="semibold" as="h3">In review</MiText>
          <MiBadge :count="cards.length" tone="neutral" count-noun="cards" />
        </div>
        <ul class="cfc__cards">
          <li v-for="c in cards" :key="c.id" class="cfc__card">
            <span v-if="show.cover && c.cover" class="cfc__cover" :style="{ '--a': c.cover }" aria-hidden="true" />
            <div v-if="show.labels && density !== 'compact'" class="cfc__labels">
              <span v-for="l in c.labels" :key="l.name" class="cfc__label" :style="{ '--c': l.color }">{{ l.name }}</span>
            </div>
            <p class="cfc__title">
              <span class="cfc__key">{{ c.key }}</span>{{ c.title }}
            </p>
            <p v-if="density === 'detailed'" class="cfc__desc">{{ c.desc }}</p>
            <div v-if="show.subtasks && density !== 'compact'" class="cfc__sub">
              <span class="cfc__sub-bar"><i :style="{ transform: `scaleX(${c.done / c.total})` }" /></span>
              <span>{{ c.done }}/{{ c.total }}</span>
            </div>
            <div v-if="metaVisible" class="cfc__meta">
              <span v-if="show.due" class="cfc__due" :class="{ 'is-late': c.late }"><MiIcon name="calendar" :size="13" />{{ c.due }}</span>
              <span v-if="show.estimate" class="cfc__est">{{ c.points }} pt</span>
              <MiAvatar v-if="show.assignee" :name="c.owner" tone="auto" size="xs" class="cfc__owner" />
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

<style scoped>
.cfc { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.cfc__layout { display: grid; gap: 20px; }
.cfc__panel { display: grid; align-content: start; gap: 20px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.cfc__group { display: grid; gap: 10px; }
.cfc__group h3 { margin: 0; text-transform: uppercase; letter-spacing: .05em; font-size: 11px; }
.cfc__fit { display: flex; align-items: baseline; gap: 10px; padding: 12px 14px; border-radius: var(--mi-radius-m); background: var(--mi-p-tint); }
.cfc__fit-num { margin: 0; font-size: 30px; line-height: 1; font-weight: 700; letter-spacing: -.03em; color: var(--mi-p-text); font-variant-numeric: tabular-nums; }

.cfc__preview { --gap: 10px; --pad: 12px; display: grid; align-content: start; gap: 12px; padding: 14px; border-radius: var(--mi-radius-xl); background: var(--mi-fill4); }
.cfc__preview.is-compact { --gap: 6px; --pad: 8px 10px; }
.cfc__preview.is-detailed { --gap: 12px; --pad: 14px; }
.cfc__col-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-inline: 4px; }
.cfc__col-head h3 { margin: 0; }
.cfc__cards { display: grid; gap: var(--gap); margin: 0; padding: 0; list-style: none; }
.cfc__card { display: grid; gap: 8px; padding: var(--pad); overflow: hidden; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.is-compact .cfc__card { grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 8px; }
.cfc__cover { display: block; height: 64px; margin: -12px -12px 0; background: radial-gradient(120% 140% at 0% 0%, var(--a), transparent 60%), linear-gradient(135deg, var(--mi-s-tint), var(--mi-p-tint)); }
.is-detailed .cfc__cover { margin: -14px -14px 0; }
.is-compact .cfc__cover { display: none; }
.cfc__labels { display: flex; flex-wrap: wrap; gap: 4px; }
.cfc__label { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--mi-label); }
.cfc__title { margin: 0; font-size: 14px; font-weight: 600; line-height: 1.35; min-width: 0; }
.is-compact .cfc__title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cfc__key { margin-right: 6px; font-size: 12px; font-weight: 500; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.cfc__desc { margin: 0; font-size: 13px; line-height: 1.4; color: var(--mi-label2); }
.cfc__sub { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.cfc__sub-bar { flex: 1; height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.cfc__sub-bar i { display: block; height: 100%; background: var(--mi-green); transform-origin: left; }
.cfc__meta { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--mi-label2); }
.cfc__due { display: inline-flex; align-items: center; gap: 4px; }
.cfc__due.is-late { color: var(--mi-red-t); font-weight: 600; }
.cfc__est { padding: 1px 6px; border-radius: 4px; background: var(--mi-fill3); font-variant-numeric: tabular-nums; }
.cfc__owner { margin-left: auto; }

@container (min-width: 680px) { .cfc__layout { grid-template-columns: minmax(260px, 340px) minmax(0, 1fr); align-items: start; } }
@container (min-width: 980px) { .cfc__layout { grid-template-columns: 340px minmax(0, 420px); justify-content: center; } }
</style>

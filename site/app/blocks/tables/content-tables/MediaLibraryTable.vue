<template>
  <section class="mlt" aria-labelledby="mlt-title">
    <header class="mlt__head">
      <div>
        <MiText id="mlt-title" variant="title3" as="h2" weight="semibold">Media library</MiText>
        <MiText variant="footnote" tone="label2">Fieldnotes Journal · {{ assets.length }} assets · {{ mb(totalSize) }} stored</MiText>
      </div>
      <MiSearch v-model="query" size="compact" placeholder="Search files" aria-label="Search files" class="mlt__search" />
    </header>

    <div class="mlt__filters" role="group" aria-label="Filter by kind">
      <MiChip
        v-for="f in filters" :key="f.id" selectable size="small" :tone="f.id === 'unused' ? 'secondary' : 'primary'"
        :model-value="filter === f.id" @update:model-value="filter = f.id"
      >
        {{ f.label }} · {{ f.count }}
      </MiChip>
    </div>

    <!-- Bulk bar: appears with a selection and only deletes what no page uses. -->
    <div v-if="selected.length" class="mlt__bulk">
      <MiText variant="subheadline" weight="semibold" tabular>{{ selected.length }} selected · {{ mb(selectedSize) }}</MiText>
      <div class="mlt__bulk-actions">
        <MiButton size="small" variant="gray" @click="selected = []">Clear</MiButton>
        <MiButton size="small" variant="destructive" soft :disabled="!deletable.length" @click="remove">
          Delete {{ deletable.length }} unused
        </MiButton>
      </div>
    </div>

    <div class="mlt__scroll">
      <MiTable
        v-model:selected="selected" :columns="columns" :rows="rows" selectable="multiple" caption="Media assets"
        density="relaxed" :zebra="false" empty-text="No files match this view"
      >
        <template #cell-name="{ row }">
          <span class="mlt__file">
            <span class="mlt__thumb" :data-kind="byId(row.id).kind" aria-hidden="true">{{ byId(row.id).ext }}</span>
            <span class="mlt__meta">
              <span class="mlt__name">{{ byId(row.id).name }}</span>
              <MiText as="span" variant="caption" tone="label2">{{ byId(row.id).dims }}</MiText>
            </span>
          </span>
        </template>
        <template #cell-usage="{ row }">
          <MiBadge v-if="byId(row.id).usage === 0" tone="warning" label="Unused" />
          <MiText v-else as="span" variant="footnote" tabular>{{ byId(row.id).usage }} {{ byId(row.id).usage === 1 ? 'page' : 'pages' }}</MiText>
        </template>
        <template #cell-license="{ row }">
          <MiBadge v-bind="license(byId(row.id))" />
        </template>
        <template #cell-size="{ row }">
          <MiText as="span" variant="footnote" tone="label2" tabular>{{ mb(byId(row.id).size) }}</MiText>
        </template>
      </MiTable>
    </div>

    <p class="mlt__log" aria-live="polite">{{ log }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Kind = 'image' | 'video' | 'doc'
interface Asset { id: string, name: string, ext: string, kind: Kind, dims: string, size: number, usage: number, licenseDays: number | null, updated: string }

const assets = ref<Asset[]>([
  { id: 'a1', name: 'harbour-dawn-hero', ext: 'JPG', kind: 'image', dims: '3840 × 2160', size: 4.8, usage: 6, licenseDays: null, updated: 'Oct 28' },
  { id: 'a2', name: 'interview-maren-cut2', ext: 'MP4', kind: 'video', dims: '2:41 · 1080p', size: 186.2, usage: 1, licenseDays: null, updated: 'Oct 26' },
  { id: 'a3', name: 'alpine-trail-wide', ext: 'JPG', kind: 'image', dims: '6000 × 4000', size: 9.1, usage: 3, licenseDays: 12, updated: 'Oct 21' },
  { id: 'a4', name: 'press-kit-2026', ext: 'PDF', kind: 'doc', dims: '18 pages', size: 12.4, usage: 0, licenseDays: null, updated: 'Oct 19' },
  { id: 'a5', name: 'market-stall-close', ext: 'PNG', kind: 'image', dims: '2400 × 1600', size: 3.2, usage: 0, licenseDays: -4, updated: 'Sep 30' },
  { id: 'a6', name: 'drone-coastline-loop', ext: 'MOV', kind: 'video', dims: '0:18 · 4K', size: 94.7, usage: 0, licenseDays: 45, updated: 'Sep 24' },
  { id: 'a7', name: 'ferry-timetable-map', ext: 'SVG', kind: 'image', dims: 'Vector', size: 0.3, usage: 2, licenseDays: null, updated: 'Sep 12' }
])

const filter = ref<'all' | Kind | 'unused'>('all')
const query = ref('')
const selected = ref<string[]>([])
const log = ref('Select files to clear out what no page uses.')

const filters = computed(() => ([
  { id: 'all', label: 'All' }, { id: 'image', label: 'Images' }, { id: 'video', label: 'Video' }, { id: 'doc', label: 'Docs' }, { id: 'unused', label: 'Unused' }
] as const).map(f => ({ ...f, count: assets.value.filter(a => matches(a, f.id)).length })))

function matches(a: Asset, f: typeof filter.value) {
  return f === 'all' || (f === 'unused' ? a.usage === 0 : a.kind === f)
}

const visible = computed(() => {
  const q = query.value.trim().toLowerCase()
  return assets.value.filter(a => matches(a, filter.value) && (!q || a.name.includes(q)))
})
const rows = computed(() => visible.value.map(a => ({ id: a.id, name: a.name, usage: a.usage, license: a.licenseDays ?? 9999, size: a.size, updated: a.updated })))
const byIdMap = computed(() => new Map(assets.value.map(a => [a.id, a])))
const byId = (id: unknown) => byIdMap.value.get(String(id)) ?? assets.value[0]!

const columns = [
  { key: 'name', label: 'File', sortable: true },
  { key: 'usage', label: 'Used on', sortable: true, width: '110px' },
  { key: 'license', label: 'License', sortable: true, width: '140px' },
  { key: 'size', label: 'Size', sortable: true, align: 'end' as const, width: '96px' },
  { key: 'updated', label: 'Updated', muted: true, width: '96px' }
]

const picked = computed(() => assets.value.filter(a => selected.value.includes(a.id)))
const selectedSize = computed(() => picked.value.reduce((t, a) => t + a.size, 0))
const deletable = computed(() => picked.value.filter(a => a.usage === 0))
const totalSize = computed(() => assets.value.reduce((t, a) => t + a.size, 0))

function license(a: Asset) {
  if (a.licenseDays === null) return { tone: 'neutral' as const, variant: 'outline' as const, label: 'Owned' }
  if (a.licenseDays < 0) return { tone: 'danger' as const, label: 'Expired', dot: true }
  return { tone: a.licenseDays <= 14 ? 'warning' as const : 'success' as const, label: `${a.licenseDays} days left`, dot: true }
}

function remove() {
  const gone = new Set(deletable.value.map(a => a.id))
  const kept = selected.value.length - gone.size
  assets.value = assets.value.filter(a => !gone.has(a.id))
  selected.value = []
  log.value = `Deleted ${gone.size} unused ${gone.size === 1 ? 'file' : 'files'}${kept ? `; kept ${kept} still in use` : ''}.`
}

const mb = (n: number) => (n >= 1000 ? (n / 1000).toFixed(2) + ' GB' : n.toFixed(1) + ' MB')
</script>

<style scoped>
.mlt { container-type: inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.mlt__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.mlt__search { width: 100%; }
@container (min-width: 560px) { .mlt__search { width: 240px; } }
.mlt__filters { display: flex; flex-wrap: wrap; gap: 6px; }

.mlt__bulk {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px 10px 16px;
  border-radius: var(--mi-radius-l); background: var(--mi-p-tint); color: var(--mi-p-text);
}
.mlt__bulk-actions { display: flex; gap: 8px; }

.mlt__scroll { min-width: 0; overflow-x: auto; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.mlt__scroll > * { min-width: 640px; }
.mlt__file { display: flex; align-items: center; gap: 12px; min-width: 0; }
.mlt__meta { display: grid; min-width: 0; line-height: 1.25; }
.mlt__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
/* Thumbnails are drawn: a gradient per kind, the extension as the label. */
.mlt__thumb {
  flex: none; display: grid; place-items: end start; width: 44px; height: 34px; padding: 3px 5px; border-radius: 7px;
  font-size: 9px; font-weight: 700; letter-spacing: .04em; color: var(--mi-p-on);
  background: linear-gradient(135deg, var(--mi-p), var(--mi-s));
}
.mlt__thumb[data-kind="video"] { background: linear-gradient(135deg, var(--mi-label), color-mix(in srgb, var(--mi-p) 60%, var(--mi-label))); color: var(--mi-card); }
.mlt__thumb[data-kind="doc"] { background: var(--mi-fill2); color: var(--mi-label2); }

.mlt__log { margin: 0; font-size: 13px; color: var(--mi-label2); }
</style>

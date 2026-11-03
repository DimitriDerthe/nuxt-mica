<template>
  <div class="mcb">
    <header class="mcb__top">
      <MiIconButton v-if="depth > 0" class="mcb__back" label="Back" variant="gray" size="small" @click="depth--">
        <MiIcon name="chevron-left" :size="16" />
      </MiIconButton>
      <div class="mcb__title">
        <MiText id="mcb-title" variant="headline" as="h2">Project files</MiText>
        <MiBreadcrumb class="mcb__crumbs" :items="crumbs" aria-label="Current location" @navigate="(_, i) => (depth = i)" />
      </div>
      <MiText as="span" variant="caption" tone="label2" class="mcb__count" tabular>{{ totalFiles }} files · 3 projects</MiText>
    </header>

    <!-- Miller columns: each pick opens the next column. Narrow widths show one column at a time. -->
    <div class="mcb__cols">
      <section v-for="(col, ci) in columns" :key="col.title" class="mcb__col" :class="{ 'is-shown': ci === depth }" :aria-label="col.title">
        <MiText as="h3" variant="caption2" tone="label3" weight="semibold" class="mcb__col-head">{{ col.title }}</MiText>
        <ul class="mcb__list">
          <li v-for="row in col.rows" :key="row.id">
            <button type="button" class="mcb__row" :aria-current="row.id === col.selected ? 'true' : undefined" @click="choose(ci, row.id)">
              <MiIcon :name="row.icon" :size="17" class="mcb__icon" />
              <span class="mcb__name">{{ row.label }}</span>
              <MiText as="span" variant="caption2" tone="label3" tabular>{{ row.meta }}</MiText>
              <MiIcon v-if="ci < 2" name="chevron-right" :size="13" class="mcb__chev" />
            </button>
          </li>
        </ul>
      </section>

      <!-- Last panel: preview and facts of the picked file. -->
      <section class="mcb__preview" :class="{ 'is-shown': depth === 3 }" aria-labelledby="mcb-file">
        <div class="mcb__sheet" :class="'is-' + file.kind" aria-hidden="true"><span /><span /><span /></div>
        <MiText id="mcb-file" variant="headline" as="h3">{{ file.name }}</MiText>
        <MiDetails :items="facts" label-width="72px" />
        <div class="mcb__actions">
          <MiButton size="small">Open</MiButton>
          <MiButton size="small" variant="gray">Share</MiButton>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Kind = 'drawing' | 'sheet' | 'doc'
interface FileEntry { id: string, name: string, kind: Kind, size: string, edited: string, by: string }
interface Folder { id: string, name: string, files: FileEntry[] }
interface Project { id: string, name: string, folders: Folder[] }
interface Row { id: string, label: string, meta: string, icon: 'folder' | 'document' | 'image' | 'grid' }

const icons: Record<Kind, Row['icon']> = { drawing: 'image', sheet: 'grid', doc: 'document' }
const kindLabel: Record<Kind, string> = { drawing: 'CAD drawing', sheet: 'Spreadsheet', doc: 'Document' }

const projects: Project[] = [
  {
    id: 'harbour', name: 'Harbour Library',
    folders: [
      { id: 'h-plans', name: 'Plans', files: [
        { id: 'h1', name: 'Ground floor GA rev F', kind: 'drawing', size: '18.4 MB', edited: 'Today 09:12', by: 'Ana Varga' },
        { id: 'h2', name: 'Roof terrace detail', kind: 'drawing', size: '6.1 MB', edited: 'Yesterday', by: 'Tom Okoro' }
      ] },
      { id: 'h-cost', name: 'Cost plan', files: [{ id: 'h3', name: 'Stage 3 estimate', kind: 'sheet', size: '420 KB', edited: '28 Oct', by: 'Lina Haas' }] },
      { id: 'h-brief', name: 'Client brief', files: [{ id: 'h4', name: 'Library brief v2', kind: 'doc', size: '1.2 MB', edited: '12 Oct', by: 'Ana Varga' }] }
    ]
  },
  {
    id: 'mill', name: 'Old Mill Housing',
    folders: [
      { id: 'm-plans', name: 'Plans', files: [{ id: 'm1', name: 'Site plan rev C', kind: 'drawing', size: '9.8 MB', edited: '30 Oct', by: 'Tom Okoro' }] },
      { id: 'm-plan', name: 'Planning', files: [{ id: 'm2', name: 'Heritage statement', kind: 'doc', size: '2.3 MB', edited: '21 Oct', by: 'Lina Haas' }] }
    ]
  },
  {
    id: 'kiosk', name: 'Park Kiosk',
    folders: [{ id: 'k-plans', name: 'Plans', files: [{ id: 'k1', name: 'Timber frame setting out', kind: 'drawing', size: '3.4 MB', edited: '2 Oct', by: 'Ana Varga' }] }]
  }
]

const pick = reactive({ project: 'harbour', folder: 'h-plans', file: 'h1' })
const depth = ref(3)

const project = computed(() => projects.find(p => p.id === pick.project) ?? projects[0]!)
const folder = computed(() => project.value.folders.find(f => f.id === pick.folder) ?? project.value.folders[0]!)
const file = computed(() => folder.value.files.find(f => f.id === pick.file) ?? folder.value.files[0]!)
const totalFiles = projects.reduce((n, p) => n + p.folders.reduce((m, f) => m + f.files.length, 0), 0)

const columns = computed(() => [
  { title: 'Projects', selected: pick.project, rows: projects.map<Row>(p => ({ id: p.id, label: p.name, meta: String(p.folders.length), icon: 'folder' })) },
  { title: project.value.name, selected: folder.value.id, rows: project.value.folders.map<Row>(f => ({ id: f.id, label: f.name, meta: String(f.files.length), icon: 'folder' })) },
  { title: folder.value.name, selected: file.value.id, rows: folder.value.files.map<Row>(f => ({ id: f.id, label: f.name, meta: f.size, icon: icons[f.kind] })) }
])
const crumbs = computed(() => [{ label: 'Projects', href: '#' }, { label: project.value.name, href: '#' }, { label: folder.value.name, href: '#' }, { label: file.value.name }].slice(0, depth.value + 1))
const facts = computed(() => [
  { key: 'type', label: 'Type', value: kindLabel[file.value.kind] },
  { key: 'size', label: 'Size', value: file.value.size },
  { key: 'edited', label: 'Edited', value: `${file.value.edited} by ${file.value.by}` }
])

// Picking in a column resets everything to its right to the first entry, then moves one level deeper.
function choose(level: number, id: string) {
  if (level === 0) { pick.project = id; pick.folder = project.value.folders[0]!.id; pick.file = folder.value.files[0]!.id }
  else if (level === 1) { pick.folder = id; pick.file = folder.value.files[0]!.id }
  else pick.file = id
  depth.value = level + 1
}
</script>

<style scoped>
.mcb { container-type: inline-size; display: grid; grid-template-rows: auto 1fr; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.mcb__top { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: var(--mi-card); box-shadow: inset 0 -1px 0 var(--mi-sep); }
.mcb__title { display: grid; gap: 2px; flex: 1; min-width: 0; }
.mcb__crumbs { min-width: 0; overflow: hidden; }
.mcb__count { display: none; white-space: nowrap; }

.mcb__cols { display: grid; min-height: 0; }
.mcb__col, .mcb__preview { display: none; align-content: start; min-width: 0; background: var(--mi-card); }
.mcb__col.is-shown, .mcb__preview.is-shown { display: grid; animation: mcb-in var(--mi-dur-3) var(--mi-spring); }
@keyframes mcb-in { from { opacity: 0; transform: translateX(12px); } }
@media (prefers-reduced-motion: reduce) { .mcb__col.is-shown, .mcb__preview.is-shown { animation: none; } }

.mcb__col-head { margin: 0; padding: 14px 16px 6px; text-transform: uppercase; letter-spacing: .06em; }
.mcb__list { display: grid; gap: 1px; margin: 0; padding: 0 8px 12px; list-style: none; }
.mcb__row { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 40px; padding: 8px 10px; border: 0; border-radius: 9px; font: inherit; font-size: 14px; text-align: start; color: inherit; background: transparent; cursor: pointer; }
.mcb__row:hover { background: var(--mi-fill4); }
.mcb__row[aria-current="true"] { color: var(--mi-p-text); background: var(--mi-p-tint); }
.mcb__row:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.mcb__icon { flex: none; color: var(--mi-label2); }
.mcb__row[aria-current="true"] .mcb__icon { color: inherit; }
.mcb__name { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.mcb__chev { flex: none; color: var(--mi-label3); }

.mcb__preview { gap: 12px; padding: 16px; background: var(--mi-page); }
.mcb__sheet { display: grid; align-content: end; gap: 6px; aspect-ratio: 4 / 3; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1), inset 0 0 0 1px var(--mi-sep); }
.mcb__sheet span { height: 6px; border-radius: 3px; background: var(--mi-fill3); }
.mcb__sheet span:nth-child(2) { width: 70%; }
.mcb__sheet span:nth-child(3) { width: 40%; }
.mcb__sheet.is-drawing { background: repeating-linear-gradient(0deg, transparent 0 15px, color-mix(in srgb, var(--mi-p) 14%, transparent) 15px 16px), repeating-linear-gradient(90deg, transparent 0 15px, color-mix(in srgb, var(--mi-p) 14%, transparent) 15px 16px), var(--mi-card); }
.mcb__sheet.is-sheet span { background: color-mix(in srgb, var(--mi-green) 35%, var(--mi-fill3)); }
.mcb__actions { display: flex; gap: 8px; }

@container (min-width: 560px) { .mcb__count { display: inline; } }
@container (min-width: 900px) {
  .mcb__back { display: none; }
  .mcb__cols { grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(240px, 1.2fr); }
  .mcb__col, .mcb__preview, .mcb__col.is-shown, .mcb__preview.is-shown { display: grid; animation: none; }
  .mcb__col + .mcb__col, .mcb__preview { box-shadow: inset 1px 0 0 var(--mi-sep); }
}
</style>

<template>
  <div class="mcb mi:@container mi:grid mi:grid-rows-[auto_1fr] mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]">
    <header class="mcb__top mi:flex mi:items-center mi:gap-2.5 mi:py-3 mi:px-3.5 mi:[background:var(--mi-card)] mi:shadow-[inset_0_-1px_0_var(--mi-sep)]">
      <MiIconButton v-if="depth > 0" class="mcb__back" label="Back" variant="gray" size="small" @click="depth--">
        <MiIcon name="chevron-left" :size="16" />
      </MiIconButton>
      <div class="mcb__title mi:grid mi:gap-0.5 mi:flex-1 mi:min-w-0">
        <MiText id="mcb-title" variant="headline" as="h2">Project files</MiText>
        <MiBreadcrumb class="mcb__crumbs" :items="crumbs" aria-label="Current location" @navigate="(_, i) => (depth = i)" />
      </div>
      <MiText as="span" variant="caption" tone="label2" class="mcb__count" tabular>{{ totalFiles }} files · 3 projects</MiText>
    </header>

    <!-- Miller columns: each pick opens the next column. Narrow widths show one column at a time. -->
    <div class="mcb__cols mi:grid mi:min-h-0 mi:@[900px]:grid-cols-[repeat(3,_minmax(0,_1fr))_minmax(240px,_1.2fr)]">
      <section v-for="(col, ci) in columns" :key="col.title" class="mcb__col mi:hidden mi:content-start mi:min-w-0 mi:[background:var(--mi-card)] mi:[&.is-shown]:grid mi:@[900px]:grid mi:@[900px]:animate-none mi:@[900px]:[&.is-shown]:grid mi:@[900px]:[.mcb__col+&]:shadow-[inset_1px_0_0_var(--mi-sep)]" :class="{ 'is-shown': ci === depth }" :aria-label="col.title">
        <MiText as="h3" variant="caption2" tone="label3" weight="semibold" class="mcb__col-head mi:pt-3.5 mi:px-4 mi:pb-1.5">{{ col.title }}</MiText>
        <ul class="mcb__list mi:grid mi:gap-px mi:m-0 mi:pt-0 mi:px-2 mi:pb-3 mi:[list-style:none]">
          <li v-for="row in col.rows" :key="row.id">
            <button type="button" class="mcb__row mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:min-h-10 mi:py-2 mi:px-2.5 mi:[border:0] mi:rounded-[9px] mi:text-start mi:text-inherit mi:[background:transparent] mi:cursor-pointer mi:aria-current:text-p-text mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :aria-current="row.id === col.selected ? 'true' : undefined" @click="choose(ci, row.id)">
              <MiIcon :name="row.icon" :size="17" class="mcb__icon mi:text-label2 mi:[.mcb__row[aria-current='true']_&]:text-inherit" />
              <span class="mcb__name mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">{{ row.label }}</span>
              <MiText as="span" variant="caption2" tone="label3" tabular>{{ row.meta }}</MiText>
              <MiIcon v-if="ci < 2" name="chevron-right" :size="13" class="mcb__chev mi:text-label3" />
            </button>
          </li>
        </ul>
      </section>

      <!-- Last panel: preview and facts of the picked file. -->
      <section class="mcb__preview mi:hidden mi:content-start mi:min-w-0 mi:[background:var(--mi-card)] mi:[&.is-shown]:grid mi:gap-3 mi:p-4 mi:[background:var(--mi-page)] mi:@[900px]:grid mi:@[900px]:animate-none mi:@[900px]:[&.is-shown]:grid mi:@[900px]:shadow-[inset_1px_0_0_var(--mi-sep)]" :class="{ 'is-shown': depth === 3 }" aria-labelledby="mcb-file">
        <div class="mcb__sheet mi:grid mi:content-end mi:gap-1.5 mi:aspect-[4_/_3] mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[var(--mi-sh1),_inset_0_0_0_1px_var(--mi-sep)] mi:[&.is-drawing]:[background:repeating-linear-gradient(0deg,_transparent_0_15px,_color-mix(in_srgb,_var(--mi-p)_14%,_transparent)_15px_16px),_repeating-linear-gradient(90deg,_transparent_0_15px,_color-mix(in_srgb,_var(--mi-p)_14%,_transparent)_15px_16px),_var(--mi-card)]" :class="'is-' + file.kind" aria-hidden="true"><span class="mi:[.mcb__sheet_&]:h-1.5 mi:[.mcb__sheet_&]:rounded-[3px] mi:[.mcb__sheet_&]:[background:var(--mi-fill3)] mi:[.mcb__sheet_&:nth-child(2)]:w-[70%] mi:[.mcb__sheet_&:nth-child(3)]:w-[40%] mi:[.mcb__sheet.is-sheet_&]:[background:color-mix(in_srgb,_var(--mi-green)_35%,_var(--mi-fill3))]" /><span class="mi:[.mcb__sheet_&]:h-1.5 mi:[.mcb__sheet_&]:rounded-[3px] mi:[.mcb__sheet_&]:[background:var(--mi-fill3)] mi:[.mcb__sheet_&:nth-child(2)]:w-[70%] mi:[.mcb__sheet_&:nth-child(3)]:w-[40%] mi:[.mcb__sheet.is-sheet_&]:[background:color-mix(in_srgb,_var(--mi-green)_35%,_var(--mi-fill3))]" /><span class="mi:[.mcb__sheet_&]:h-1.5 mi:[.mcb__sheet_&]:rounded-[3px] mi:[.mcb__sheet_&]:[background:var(--mi-fill3)] mi:[.mcb__sheet_&:nth-child(2)]:w-[70%] mi:[.mcb__sheet_&:nth-child(3)]:w-[40%] mi:[.mcb__sheet.is-sheet_&]:[background:color-mix(in_srgb,_var(--mi-green)_35%,_var(--mi-fill3))]" /></div>
        <MiText id="mcb-file" variant="headline" as="h3">{{ file.name }}</MiText>
        <MiDetails :items="facts" label-width="72px" />
        <div class="mcb__actions mi:flex mi:gap-2">
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
.mcb__crumbs { min-width: 0; overflow: hidden; }
.mcb__count { display: none; white-space: nowrap; }
.mcb__col.is-shown, .mcb__preview.is-shown { animation: mcb-in var(--mi-dur-3) var(--mi-spring); }
@keyframes mcb-in { from { opacity: 0; transform: translateX(12px); } }
@media (prefers-reduced-motion: reduce) { .mcb__col.is-shown, .mcb__preview.is-shown { animation: none; } }

.mcb__col-head { margin: 0; text-transform: uppercase; letter-spacing: .06em; }
.mcb__row { font: inherit; font-size: 14px; }
.mcb__row:hover { background: var(--mi-fill4); }
.mcb__row[aria-current="true"] { background: var(--mi-p-tint); }
.mcb__icon { flex: none; }
.mcb__chev { flex: none; }

@container (min-width: 560px) { .mcb__count { display: inline; } }
@container (min-width: 900px) {
  .mcb__back { display: none; }
  .mcb__col.is-shown, .mcb__preview.is-shown { animation: none; }
}
</style>

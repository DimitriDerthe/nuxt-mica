<template>
  <section class="shelf" aria-labelledby="shelf-title">
    <header class="shelf__head">
      <div class="shelf__title">
        <MiBreadcrumb :items="crumbs" aria-label="Folder path" />
        <MiText id="shelf-title" variant="title3" as="h2" weight="semibold">Spring campaign</MiText>
        <MiText variant="footnote" tone="label2" tabular>{{ files.length }} files · {{ size(totalKb) }} · shared with 6 people</MiText>
      </div>
      <div class="shelf__actions">
        <MiSearch v-model="query" size="compact" placeholder="Find a file" aria-label="Find a file" />
        <MiSegmented v-model="view" label="Layout" :options="views" />
      </div>
    </header>

    <div class="shelf__types" role="group" aria-label="File type">
      <MiChip
        v-for="t in typeFilters" :key="t.value" selectable size="small" tone="neutral"
        :model-value="type === t.value" :label="t.label" @update:model-value="type = t.value"
      />
    </div>

    <!-- Grid: every preview is drawn from tokens, so the shelf reads like a real drive with no images. -->
    <ul v-if="view === 'grid'" class="shelf__grid">
      <li v-for="f in visible" :key="f.id" class="shelf__card" :class="{ 'is-sel': picked.has(f.id) }">
        <div class="shelf__thumb" :class="'thumb--' + f.type" :style="{ '--tint': kinds[f.type].color }" aria-hidden="true">
          <template v-if="f.type === 'doc' || f.type === 'pdf'">
            <span class="thumb__page"><i v-for="n in 6" :key="n" :style="{ transform: `scaleX(${0.55 + ((n * 37) % 45) / 100})` }" /></span>
          </template>
          <span v-else-if="f.type === 'sheet'" class="thumb__sheet"><i v-for="n in 20" :key="n" /></span>
          <span v-else-if="f.type === 'image'" class="thumb__photo" :style="{ '--sky': f.sky }"><b /><s /></span>
          <span v-else-if="f.type === 'video'" class="thumb__photo thumb__photo--video" :style="{ '--sky': f.sky }"><b /><s /><em>{{ f.meta }}</em></span>
          <span v-else-if="f.type === 'audio'" class="thumb__wave"><i v-for="(h, n) in wave" :key="n" :style="{ transform: `scaleY(${h})` }" /></span>
          <span v-else class="thumb__design"><i /><i /><i /></span>
        </div>
        <div class="shelf__label">
          <span class="shelf__kind" :style="{ '--tint': kinds[f.type].color }">{{ kinds[f.type].short }}</span>
          <MiText as="h3" variant="subheadline" weight="medium" :lines="1" :title="f.name">{{ f.name }}</MiText>
        </div>
        <MiText variant="caption" tone="label2" tabular>{{ size(f.kb) }} · {{ f.edited }}</MiText>
        <MiCheckbox class="shelf__pick" :model-value="picked.has(f.id)" @update:model-value="toggle(f.id)">
          <span class="shelf__sr">Select {{ f.name }}</span>
        </MiCheckbox>
      </li>
    </ul>

    <!-- List: the same files as rows; secondary columns appear as the container widens. -->
    <ul v-else class="shelf__list">
      <li v-for="f in visible" :key="f.id" class="shelf__row" :class="{ 'is-sel': picked.has(f.id) }">
        <MiCheckbox :model-value="picked.has(f.id)" @update:model-value="toggle(f.id)">
          <span class="shelf__sr">Select {{ f.name }}</span>
        </MiCheckbox>
        <span class="shelf__kind shelf__kind--tile" :style="{ '--tint': kinds[f.type].color }" aria-hidden="true">{{ kinds[f.type].short }}</span>
        <div class="shelf__row-name">
          <MiText as="h3" variant="subheadline" weight="medium" :lines="1">{{ f.name }}</MiText>
          <MiText variant="caption" tone="label2" class="shelf__row-sub">{{ f.owner }} · {{ f.edited }}</MiText>
        </div>
        <span class="shelf__owner"><MiAvatar :name="f.owner" size="xs" tone="auto" decorative /><MiText as="span" variant="footnote" tone="label2" :lines="1">{{ f.owner }}</MiText></span>
        <MiText as="span" variant="footnote" tone="label2" class="shelf__edited">{{ f.edited }}</MiText>
        <MiText as="span" variant="footnote" tone="label2" tabular class="shelf__size">{{ size(f.kb) }}</MiText>
      </li>
    </ul>

    <MiEmptyState v-if="!visible.length" title="No files here" description="Try another type or clear the search." icon="search" />

    <Transition name="shelf-bar">
      <div v-if="picked.size" class="shelf__bar" role="region" aria-label="Selection">
        <MiText as="span" variant="subheadline" weight="semibold" tabular aria-live="polite">{{ picked.size }} selected · {{ size(pickedKb) }}</MiText>
        <div class="shelf__bar-actions">
          <MiButton size="small" variant="gray">Share</MiButton>
          <MiButton size="small" variant="gray">Download</MiButton>
          <MiIconButton size="small" variant="plain" label="Clear selection" @click="picked = new Set()"><MiIcon name="close" :size="16" /></MiIconButton>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Kind = 'doc' | 'pdf' | 'sheet' | 'image' | 'video' | 'audio' | 'design'

const kinds: Record<Kind, { short: string, color: string, group: string }> = {
  doc: { short: 'DOC', color: 'var(--mi-blue)', group: 'docs' },
  pdf: { short: 'PDF', color: 'var(--mi-red)', group: 'docs' },
  sheet: { short: 'XLS', color: 'var(--mi-green)', group: 'docs' },
  image: { short: 'JPG', color: 'var(--mi-orange)', group: 'media' },
  video: { short: 'MP4', color: 'var(--mi-purple)', group: 'media' },
  audio: { short: 'WAV', color: 'var(--mi-pink)', group: 'media' },
  design: { short: 'FIG', color: 'var(--mi-indigo)', group: 'design' }
}

const crumbs = [{ label: 'Drive', href: '#' }, { label: 'Halden Outdoor', href: '#' }, { label: 'Spring campaign' }]

// Sample folder; sizes in KB, `sky` tints the drawn photo previews.
const files: { id: string, name: string, type: Kind, kb: number, owner: string, edited: string, sky?: string, meta?: string }[] = [
  { id: 'f1', name: 'Campaign brief.docx', type: 'doc', kb: 184, owner: 'Inès Moreau', edited: '2 h ago' },
  { id: 'f2', name: 'Lofoten hero 01.jpg', type: 'image', kb: 6_550, owner: 'Tomás Ruiz', edited: 'Yesterday', sky: 'var(--mi-orange)' },
  { id: 'f3', name: 'Teaser cut v3.mp4', type: 'video', kb: 151_552, owner: 'Kofi Mensah', edited: 'Yesterday', sky: 'var(--mi-indigo)', meta: '0:42' },
  { id: 'f4', name: 'Media plan Q1.xlsx', type: 'sheet', kb: 92, owner: 'Noor Haddad', edited: 'Oct 29' },
  { id: 'f5', name: 'Landing page.fig', type: 'design', kb: 12_390, owner: 'Saoirse Byrne', edited: 'Oct 28' },
  { id: 'f6', name: 'Lofoten hero 02.jpg', type: 'image', kb: 6_041, owner: 'Tomás Ruiz', edited: 'Oct 27', sky: 'var(--mi-teal)' },
  { id: 'f7', name: 'Usage rights, Nordic Images.pdf', type: 'pdf', kb: 1_228, owner: 'Inès Moreau', edited: 'Oct 24' },
  { id: 'f8', name: 'Voiceover take 4.wav', type: 'audio', kb: 18_740, owner: 'Kofi Mensah', edited: 'Oct 22' }
]

const wave = [0.3, 0.55, 0.8, 0.45, 0.95, 0.6, 0.35, 0.7, 1, 0.5, 0.25, 0.65, 0.85, 0.4, 0.2]

const views = [{ value: 'grid', icon: 'grid' as const, ariaLabel: 'Grid' }, { value: 'list', icon: 'list' as const, ariaLabel: 'List' }]
const view = ref<string | number | null>('grid')
const query = ref('')

const typeFilters = [{ value: 'all', label: 'All' }, { value: 'docs', label: 'Documents' }, { value: 'media', label: 'Media' }, { value: 'design', label: 'Design' }]
const type = ref('all')

const visible = computed(() => {
  const q = query.value.trim().toLowerCase()
  return files.filter(f => (type.value === 'all' || kinds[f.type].group === type.value) && (!q || f.name.toLowerCase().includes(q)))
})

const picked = ref(new Set<string>(['f2', 'f6']))
const toggle = (id: string) => {
  const next = new Set(picked.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  picked.value = next
}

const totalKb = files.reduce((n, f) => n + f.kb, 0)
const pickedKb = computed(() => files.filter(f => picked.value.has(f.id)).reduce((n, f) => n + f.kb, 0))
const size = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(kb >= 10_240 ? 0 : 1)} MB` : `${kb} KB`)
</script>

<style scoped>
.shelf { container-type: inline-size; position: relative; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.shelf__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.shelf__title { display: grid; gap: 2px; min-width: 0; }
.shelf__actions { display: flex; align-items: center; gap: 8px; flex: 1 1 240px; min-width: 0; max-width: 360px; }
.shelf__actions > :first-child { flex: 1 1 0; min-width: 0; width: 0; }
.shelf__actions > :last-child { flex: none; }
.shelf__types { display: flex; flex-wrap: wrap; gap: 6px; }
.shelf__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.shelf__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 0; padding: 0; list-style: none; }
@container (min-width: 620px) { .shelf__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@container (min-width: 900px) { .shelf__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

.shelf__card {
  position: relative; display: grid; gap: 6px; padding: 8px 8px 12px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1);
}
.shelf__card.is-sel { box-shadow: 0 0 0 2px var(--mi-p), var(--mi-sh1); }
.shelf__pick { position: absolute; top: 14px; inset-inline-start: 14px; width: max-content; opacity: 0; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.shelf__card:hover .shelf__pick, .shelf__card:focus-within .shelf__pick, .shelf__card.is-sel .shelf__pick { opacity: 1; }
@media (hover: none) { .shelf__pick { opacity: 1; } }
.shelf__label { display: flex; align-items: center; gap: 6px; min-width: 0; padding: 4px 4px 0; }
.shelf__card > :nth-child(3) { padding: 0 4px; }
.shelf__kind {
  flex: none; padding: 2px 5px; border-radius: 5px; font-size: 9px; font-weight: 700; letter-spacing: .04em;
  color: var(--tint); background: color-mix(in srgb, var(--tint) 14%, transparent);
}

/* Drawn previews */
.shelf__thumb {
  position: relative; display: grid; place-items: center; aspect-ratio: 4 / 3; border-radius: calc(var(--mi-radius-l) - 4px); overflow: hidden;
  background: color-mix(in srgb, var(--tint) 9%, var(--mi-fill));
}
.thumb__page { display: grid; align-content: start; gap: 5px; width: 46%; height: 78%; margin-top: 18%; padding: 12% 10%; border-radius: 4px 4px 0 0; background: var(--mi-card); box-shadow: var(--mi-sh2); }
.thumb__page i { display: block; height: 3px; border-radius: 2px; background: var(--mi-fill3); transform-origin: left; }
.thumb__page i:first-child { height: 5px; background: color-mix(in srgb, var(--tint) 55%, transparent); }
.thumb--pdf .thumb__page { border-top: 4px solid var(--tint); }
.thumb__sheet { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; width: 64%; padding: 1px; border-radius: 4px; background: var(--mi-sep); box-shadow: var(--mi-sh2); }
.thumb__sheet i { height: 11px; background: var(--mi-card); }
.thumb__sheet i:nth-child(-n + 4) { background: color-mix(in srgb, var(--tint) 30%, var(--mi-card)); }
.thumb__sheet i:nth-child(4n + 1) { background: color-mix(in srgb, var(--tint) 10%, var(--mi-card)); }
.thumb__photo { position: absolute; inset: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--sky) 55%, var(--mi-card)), color-mix(in srgb, var(--sky) 20%, var(--mi-card))); }
.thumb__photo b { position: absolute; top: 18%; inset-inline-end: 20%; width: 18%; aspect-ratio: 1; border-radius: 50%; background: color-mix(in srgb, var(--mi-yellow) 80%, var(--mi-card)); }
.thumb__photo s { position: absolute; inset: auto -10% -30% -10%; height: 70%; background: color-mix(in srgb, var(--sky) 70%, var(--mi-label)); clip-path: polygon(0 60%, 22% 18%, 40% 48%, 62% 0, 100% 52%, 100% 100%, 0 100%); }
.thumb__photo--video::after {
  content: ""; position: absolute; top: 50%; left: 50%; width: 36px; height: 36px; margin: -18px 0 0 -18px; border-radius: 50%;
  background: color-mix(in srgb, var(--mi-card) 80%, transparent);
}
.thumb__photo--video::before {
  content: ""; position: absolute; z-index: 1; top: 50%; left: 50%; margin: -7px 0 0 -4px; border-style: solid; border-width: 7px 0 7px 12px;
  border-color: transparent transparent transparent var(--mi-label);
}
.thumb__photo em { position: absolute; bottom: 8px; inset-inline-end: 8px; padding: 1px 6px; border-radius: 6px; font-size: 10px; font-style: normal; font-weight: 600; color: var(--mi-card); background: color-mix(in srgb, var(--mi-label) 70%, transparent); }
.thumb__wave { display: flex; align-items: center; gap: 3px; height: 46%; }
.thumb__wave i { width: 4px; height: 100%; border-radius: 2px; background: var(--tint); opacity: .75; }
.thumb__design { position: relative; width: 60%; height: 64%; border-radius: 6px; background: var(--mi-card); box-shadow: var(--mi-sh2); }
.thumb__design i { position: absolute; border-radius: 4px; background: color-mix(in srgb, var(--tint) 25%, transparent); }
.thumb__design i:nth-child(1) { inset: 10% 10% auto 10%; height: 14%; background: var(--tint); opacity: .8; }
.thumb__design i:nth-child(2) { inset: 32% 52% 10% 10%; }
.thumb__design i:nth-child(3) { inset: 32% 10% 10% 54%; border-radius: 50%; }

/* List */
.shelf__list { display: grid; margin: 0; padding: 4px 0; list-style: none; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.shelf__row { display: grid; grid-template-columns: auto auto minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 10px 14px; }
.shelf__row + .shelf__row { border-top: 1px solid var(--mi-sep); }
.shelf__row.is-sel { background: var(--mi-p-tint); }
.shelf__kind--tile { display: grid; place-items: center; width: 36px; height: 36px; padding: 0; border-radius: 10px; }
.shelf__row-name { min-width: 0; }
.shelf__owner, .shelf__edited { display: none; }
.shelf__owner { align-items: center; gap: 8px; min-width: 0; }
.shelf__size { text-align: end; }
@container (min-width: 680px) {
  .shelf__row { grid-template-columns: auto auto minmax(0, 1fr) 170px 96px 72px; }
  .shelf__row-sub { display: none; }
  .shelf__owner { display: flex; }
  .shelf__edited { display: block; }
}

/* Selection bar */
.shelf__bar {
  position: sticky; bottom: 12px; z-index: 2; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px;
  padding: 10px 10px 10px 16px; border-radius: var(--mi-radius-l); background: var(--mi-elev); box-shadow: var(--mi-sh3);
}
.shelf__bar-actions { display: flex; align-items: center; gap: 6px; }
.shelf-bar-enter-active, .shelf-bar-leave-active { transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease); }
.shelf-bar-enter-from, .shelf-bar-leave-to { transform: translateY(12px); opacity: 0; }
</style>

<template>
  <section class="shelf mi:@container mi:relative mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="shelf-title">
    <header class="shelf__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div class="shelf__title mi:grid mi:gap-0.5 mi:min-w-0">
        <MiBreadcrumb :items="crumbs" aria-label="Folder path" />
        <MiText id="shelf-title" variant="title3" as="h2" weight="semibold">Spring campaign</MiText>
        <MiText variant="footnote" tone="label2" tabular>{{ files.length }} files · {{ size(totalKb) }} · shared with 6 people</MiText>
      </div>
      <div class="shelf__actions mi:flex mi:items-center mi:gap-2 mi:flex-[1_1_240px] mi:min-w-0 mi:max-w-90">
        <MiSearch v-model="query" size="compact" placeholder="Find a file" aria-label="Find a file" />
        <MiSegmented v-model="view" label="Layout" :options="views" />
      </div>
    </header>

    <div class="shelf__types mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="File type">
      <MiChip
        v-for="t in typeFilters" :key="t.value" selectable size="small" tone="neutral"
        :model-value="type === t.value" :label="t.label" @update:model-value="type = t.value"
      />
    </div>

    <!-- Grid: every preview is drawn from tokens, so the shelf reads like a real drive with no images. -->
    <ul v-if="view === 'grid'" class="shelf__grid mi:grid mi:grid-cols-2 mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[620px]:grid-cols-3 mi:@[900px]:grid-cols-4">
      <li v-for="f in visible" :key="f.id" class="shelf__card mi:relative mi:grid mi:gap-1.5 mi:pt-2 mi:px-2 mi:pb-3 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:[&.is-sel]:shadow-[0_0_0_2px_var(--mi-p),_var(--mi-sh1)]" :class="{ 'is-sel': picked.has(f.id) }">
        <div class="shelf__thumb mi:relative mi:grid mi:place-items-center mi:aspect-[4_/_3] mi:rounded-[calc(var(--mi-radius-l)_-_4px)] mi:overflow-hidden mi:[background:color-mix(in_srgb,_var(--tint)_9%,_var(--mi-fill))]" :class="'thumb--' + f.type" :style="{ '--tint': kinds[f.type].color }" aria-hidden="true">
          <template v-if="f.type === 'doc' || f.type === 'pdf'">
            <span class="thumb__page mi:grid mi:content-start mi:gap-[5px] mi:w-[46%] mi:h-[78%] mi:mt-[18%] mi:py-[12%] mi:px-[10%] mi:rounded-[4px_4px_0_0] mi:[background:var(--mi-card)] mi:shadow-2 mi:[.thumb--pdf_&]:[border-top:4px_solid_var(--tint)]"><i class="mi:[.thumb__page_&]:h-[3px] mi:[.thumb__page_&]:origin-left" v-for="n in 6" :key="n" :style="{ transform: `scaleX(${0.55 + ((n * 37) % 45) / 100})` }" /></span>
          </template>
          <span v-else-if="f.type === 'sheet'" class="thumb__sheet mi:grid mi:grid-cols-[repeat(4,_1fr)] mi:gap-px mi:w-[64%] mi:p-px mi:rounded-[4px] mi:[background:var(--mi-sep)] mi:shadow-2"><i v-for="n in 20" :key="n" /></span>
          <span v-else-if="f.type === 'image'" class="thumb__photo mi:absolute mi:inset-0 mi:[background:linear-gradient(180deg,_color-mix(in_srgb,_var(--sky)_55%,_var(--mi-card)),_color-mix(in_srgb,_var(--sky)_20%,_var(--mi-card)))]" :style="{ '--sky': f.sky }"><b class="mi:[.thumb__photo_&]:aspect-[1]" /><s class="mi:[.thumb__photo_&]:[clip-path:polygon(0_60%,_22%_18%,_40%_48%,_62%_0,_100%_52%,_100%_100%,_0_100%)]" /></span>
          <span v-else-if="f.type === 'video'" class="thumb__photo thumb__photo--video mi:absolute mi:inset-0 mi:[background:linear-gradient(180deg,_color-mix(in_srgb,_var(--sky)_55%,_var(--mi-card)),_color-mix(in_srgb,_var(--sky)_20%,_var(--mi-card)))] mi:after:content-[''] mi:after:absolute mi:after:top-1/2 mi:after:left-1/2 mi:after:w-9 mi:after:h-9 mi:after:-mt-4.5 mi:after:mr-0 mi:after:mb-0 mi:after:-ml-4.5 mi:after:rounded-[50%] mi:after:[background:color-mix(in_srgb,_var(--mi-card)_80%,_transparent)] mi:before:content-[''] mi:before:absolute mi:before:z-1 mi:before:top-1/2 mi:before:left-1/2 mi:before:mt-[-7px] mi:before:mr-0 mi:before:mb-0 mi:before:-ml-1 mi:before:[border-style:solid] mi:before:[border-width:7px_0_7px_12px] mi:before:border-[color:transparent_transparent_transparent_var(--mi-label)]" :style="{ '--sky': f.sky }"><b class="mi:[.thumb__photo_&]:aspect-[1]" /><s class="mi:[.thumb__photo_&]:[clip-path:polygon(0_60%,_22%_18%,_40%_48%,_62%_0,_100%_52%,_100%_100%,_0_100%)]" /><em class="mi:[.thumb__photo_&]:py-px mi:[.thumb__photo_&]:px-1.5 mi:[.thumb__photo_&]:text-[10px] mi:[.thumb__photo_&]:not-italic mi:[.thumb__photo_&]:font-semibold mi:[.thumb__photo_&]:text-card">{{ f.meta }}</em></span>
          <span v-else-if="f.type === 'audio'" class="thumb__wave mi:flex mi:items-center mi:gap-[3px] mi:h-[46%]"><i v-for="(h, n) in wave" :key="n" :style="{ transform: `scaleY(${h})` }" /></span>
          <span v-else class="thumb__design mi:relative mi:w-[60%] mi:h-[64%] mi:rounded-[6px] mi:[background:var(--mi-card)] mi:shadow-2"><i class="mi:[.thumb__design_&:nth-child(1)]:top-[10%] mi:[.thumb__design_&:nth-child(1)]:right-[10%] mi:[.thumb__design_&:nth-child(1)]:bottom-auto mi:[.thumb__design_&:nth-child(1)]:left-[10%] mi:[.thumb__design_&:nth-child(1)]:opacity-80 mi:[.thumb__design_&:nth-child(2)]:top-[32%] mi:[.thumb__design_&:nth-child(2)]:right-[52%] mi:[.thumb__design_&:nth-child(2)]:bottom-[10%] mi:[.thumb__design_&:nth-child(2)]:left-[10%] mi:[.thumb__design_&:nth-child(3)]:top-[32%] mi:[.thumb__design_&:nth-child(3)]:right-[10%] mi:[.thumb__design_&:nth-child(3)]:bottom-[10%] mi:[.thumb__design_&:nth-child(3)]:left-[54%] mi:[.thumb__design_&:nth-child(3)]:rounded-[50%]" /><i class="mi:[.thumb__design_&:nth-child(1)]:top-[10%] mi:[.thumb__design_&:nth-child(1)]:right-[10%] mi:[.thumb__design_&:nth-child(1)]:bottom-auto mi:[.thumb__design_&:nth-child(1)]:left-[10%] mi:[.thumb__design_&:nth-child(1)]:opacity-80 mi:[.thumb__design_&:nth-child(2)]:top-[32%] mi:[.thumb__design_&:nth-child(2)]:right-[52%] mi:[.thumb__design_&:nth-child(2)]:bottom-[10%] mi:[.thumb__design_&:nth-child(2)]:left-[10%] mi:[.thumb__design_&:nth-child(3)]:top-[32%] mi:[.thumb__design_&:nth-child(3)]:right-[10%] mi:[.thumb__design_&:nth-child(3)]:bottom-[10%] mi:[.thumb__design_&:nth-child(3)]:left-[54%] mi:[.thumb__design_&:nth-child(3)]:rounded-[50%]" /><i class="mi:[.thumb__design_&:nth-child(1)]:top-[10%] mi:[.thumb__design_&:nth-child(1)]:right-[10%] mi:[.thumb__design_&:nth-child(1)]:bottom-auto mi:[.thumb__design_&:nth-child(1)]:left-[10%] mi:[.thumb__design_&:nth-child(1)]:opacity-80 mi:[.thumb__design_&:nth-child(2)]:top-[32%] mi:[.thumb__design_&:nth-child(2)]:right-[52%] mi:[.thumb__design_&:nth-child(2)]:bottom-[10%] mi:[.thumb__design_&:nth-child(2)]:left-[10%] mi:[.thumb__design_&:nth-child(3)]:top-[32%] mi:[.thumb__design_&:nth-child(3)]:right-[10%] mi:[.thumb__design_&:nth-child(3)]:bottom-[10%] mi:[.thumb__design_&:nth-child(3)]:left-[54%] mi:[.thumb__design_&:nth-child(3)]:rounded-[50%]" /></span>
        </div>
        <div class="shelf__label mi:flex mi:items-center mi:gap-1.5 mi:min-w-0 mi:pt-1 mi:px-1 mi:pb-0">
          <span class="shelf__kind mi:flex-[none] mi:text-[9px] mi:font-bold mi:tracking-[.04em] mi:text-(--tint) mi:[background:color-mix(in_srgb,_var(--tint)_14%,_transparent)]" :style="{ '--tint': kinds[f.type].color }">{{ kinds[f.type].short }}</span>
          <MiText as="h3" variant="subheadline" weight="medium" :lines="1" :title="f.name">{{ f.name }}</MiText>
        </div>
        <MiText variant="caption" tone="label2" tabular>{{ size(f.kb) }} · {{ f.edited }}</MiText>
        <MiCheckbox class="shelf__pick" :model-value="picked.has(f.id)" @update:model-value="toggle(f.id)">
          <span class="shelf__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Select {{ f.name }}</span>
        </MiCheckbox>
      </li>
    </ul>

    <!-- List: the same files as rows; secondary columns appear as the container widens. -->
    <ul v-else class="shelf__list mi:grid mi:m-0 mi:py-1 mi:px-0 mi:[list-style:none] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
      <li v-for="f in visible" :key="f.id" class="shelf__row mi:grid mi:grid-cols-[auto_auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:py-2.5 mi:px-3.5 mi:[.shelf__row+&]:border-t mi:[.shelf__row+&]:border-t-sep mi:[&.is-sel]:[background:var(--mi-p-tint)] mi:@[680px]:grid-cols-[auto_auto_minmax(0,_1fr)_170px_96px_72px]" :class="{ 'is-sel': picked.has(f.id) }">
        <MiCheckbox :model-value="picked.has(f.id)" @update:model-value="toggle(f.id)">
          <span class="shelf__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Select {{ f.name }}</span>
        </MiCheckbox>
        <span class="shelf__kind shelf__kind--tile mi:flex-[none] mi:text-[9px] mi:font-bold mi:tracking-[.04em] mi:text-(--tint) mi:[background:color-mix(in_srgb,_var(--tint)_14%,_transparent)] mi:grid mi:place-items-center mi:w-9 mi:h-9" :style="{ '--tint': kinds[f.type].color }" aria-hidden="true">{{ kinds[f.type].short }}</span>
        <div class="shelf__row-name mi:min-w-0">
          <MiText as="h3" variant="subheadline" weight="medium" :lines="1">{{ f.name }}</MiText>
          <MiText variant="caption" tone="label2" class="shelf__row-sub">{{ f.owner }} · {{ f.edited }}</MiText>
        </div>
        <span class="shelf__owner mi:hidden mi:items-center mi:gap-2 mi:min-w-0 mi:@[680px]:flex"><MiAvatar :name="f.owner" size="xs" tone="auto" decorative /><MiText as="span" variant="footnote" tone="label2" :lines="1">{{ f.owner }}</MiText></span>
        <MiText as="span" variant="footnote" tone="label2" class="shelf__edited">{{ f.edited }}</MiText>
        <MiText as="span" variant="footnote" tone="label2" tabular class="shelf__size mi:text-end">{{ size(f.kb) }}</MiText>
      </li>
    </ul>

    <MiEmptyState v-if="!visible.length" title="No files here" description="Try another type or clear the search." icon="search" />

    <Transition name="shelf-bar">
      <div v-if="picked.size" class="shelf__bar mi:sticky mi:bottom-3 mi:z-2 mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2 mi:gap-x-3 mi:pt-2.5 mi:pr-2.5 mi:pb-2.5 mi:pl-4 mi:rounded-lg mi:[background:var(--mi-elev)] mi:shadow-3" role="region" aria-label="Selection">
        <MiText as="span" variant="subheadline" weight="semibold" tabular aria-live="polite">{{ picked.size }} selected · {{ size(pickedKb) }}</MiText>
        <div class="shelf__bar-actions mi:flex mi:items-center mi:gap-1.5">
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
.shelf__actions > :first-child { flex: 1 1 0; min-width: 0; width: 0; }
.shelf__actions > :last-child { flex: none; }
.shelf__pick { position: absolute; top: 14px; inset-inline-start: 14px; width: max-content; opacity: 0; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.shelf__card:hover .shelf__pick, .shelf__card:focus-within .shelf__pick, .shelf__card.is-sel .shelf__pick { opacity: 1; }
@media (hover: none) { .shelf__pick { opacity: 1; } }
.shelf__card > :nth-child(3) { padding: 0 4px; }
.shelf__kind { padding: 2px 5px; border-radius: 5px;
}
.thumb__page i { display: block; border-radius: 2px; background: var(--mi-fill3); }
.thumb__page i:first-child { height: 5px; background: color-mix(in srgb, var(--tint) 55%, transparent); }
.thumb__sheet i { height: 11px; background: var(--mi-card); }
.thumb__sheet i:nth-child(-n + 4) { background: color-mix(in srgb, var(--tint) 30%, var(--mi-card)); }
.thumb__sheet i:nth-child(4n + 1) { background: color-mix(in srgb, var(--tint) 10%, var(--mi-card)); }
.thumb__photo b { position: absolute; top: 18%; inset-inline-end: 20%; width: 18%; border-radius: 50%; background: color-mix(in srgb, var(--mi-yellow) 80%, var(--mi-card)); }
.thumb__photo s { position: absolute; inset: auto -10% -30% -10%; height: 70%; background: color-mix(in srgb, var(--sky) 70%, var(--mi-label)); }
.thumb__photo em { position: absolute; bottom: 8px; inset-inline-end: 8px; border-radius: 6px; background: color-mix(in srgb, var(--mi-label) 70%, transparent); }
.thumb__wave i { width: 4px; height: 100%; border-radius: 2px; background: var(--tint); opacity: .75; }
.thumb__design i { position: absolute; border-radius: 4px; background: color-mix(in srgb, var(--tint) 25%, transparent); }
.thumb__design i:nth-child(1) { height: 14%; background: var(--tint); }
.shelf__kind--tile { padding: 0; border-radius: 10px; }
.shelf__edited { display: none; }
@container (min-width: 680px) {
  .shelf__row-sub { display: none; }
  .shelf__edited { display: block; }
}
.shelf-bar-enter-active, .shelf-bar-leave-active { transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease); }
.shelf-bar-enter-from, .shelf-bar-leave-to { transform: translateY(12px); opacity: 0; }
</style>

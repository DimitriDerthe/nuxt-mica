<template>
  <section class="mi:@container mi:relative mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="shelf-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div class="mi:grid mi:gap-0.5 mi:min-w-0">
        <MiBreadcrumb :items="crumbs" aria-label="Folder path" />
        <MiText id="shelf-title" variant="title3" as="h2" weight="semibold">Spring campaign</MiText>
        <MiText variant="footnote" tone="label2" tabular>{{ files.length }} files · {{ size(totalKb) }} · shared with 6 people</MiText>
      </div>
      <div class="mi:flex mi:items-center mi:gap-2 mi:flex-[1_1_240px] mi:min-w-0 mi:max-w-90">
        <MiSearch v-model="query" class="mi:flex-[1_1_0] mi:min-w-0 mi:w-0!" size="compact" placeholder="Find a file" aria-label="Find a file" />
        <MiSegmented v-model="view" class="mi:flex-[none]" label="Layout" :options="views" />
      </div>
    </header>

    <div class="mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="File type">
      <MiChip
        v-for="t in typeFilters" :key="t.value" selectable size="small" tone="neutral"
        :model-value="type === t.value" :label="t.label" @update:model-value="type = t.value"
      />
    </div>

    <!-- Grid: every preview is drawn from tokens, so the shelf reads like a real drive with no images. -->
    <ul v-if="view === 'grid'" class="mi:grid mi:grid-cols-2 mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[620px]:grid-cols-3 mi:@[900px]:grid-cols-4">
      <li v-for="f in visible" :key="f.id" class="mi:group mi:relative mi:grid mi:gap-1.5 mi:pt-2 mi:px-2 mi:pb-3 mi:rounded-lg mi:[background:var(--mi-card)]" :class="picked.has(f.id) ? 'mi:shadow-[0_0_0_2px_var(--mi-p),_var(--mi-sh1)]' : 'mi:shadow-1'" :data-sel="picked.has(f.id) || undefined">
        <div class="mi:relative mi:grid mi:place-items-center mi:aspect-[4_/_3] mi:rounded-[calc(var(--mi-radius-l)_-_4px)] mi:overflow-hidden mi:[background:color-mix(in_srgb,_var(--tint)_9%,_var(--mi-fill))]" :style="{ '--tint': kinds[f.type].color }" aria-hidden="true">
          <template v-if="f.type === 'doc' || f.type === 'pdf'">
            <span class="mi:grid mi:content-start mi:gap-[5px] mi:w-[46%] mi:h-[78%] mi:mt-[18%] mi:py-[12%] mi:px-[10%] mi:rounded-[4px_4px_0_0] mi:[background:var(--mi-card)] mi:shadow-2" :class="f.type === 'pdf' ? 'mi:[border-top:4px_solid_var(--tint)]' : ''"><i class="mi:block mi:rounded-[2px] mi:origin-left" :class="n === 1 ? 'mi:h-[5px] mi:[background:color-mix(in_srgb,var(--tint)_55%,transparent)]' : 'mi:h-[3px] mi:[background:var(--mi-fill3)]'" v-for="n in 6" :key="n" :style="{ transform: `scaleX(${0.55 + ((n * 37) % 45) / 100})` }" /></span>
          </template>
          <span v-else-if="f.type === 'sheet'" class="mi:grid mi:grid-cols-[repeat(4,_1fr)] mi:gap-px mi:w-[64%] mi:p-px mi:rounded-[4px] mi:[background:var(--mi-sep)] mi:shadow-2"><i v-for="n in 20" :key="n" class="mi:h-[11px]" :class="n % 4 === 1 ? 'mi:[background:color-mix(in_srgb,var(--tint)_10%,var(--mi-card))]' : n <= 4 ? 'mi:[background:color-mix(in_srgb,var(--tint)_30%,var(--mi-card))]' : 'mi:[background:var(--mi-card)]'" /></span>
          <span v-else-if="f.type === 'image'" class="mi:absolute mi:inset-0 mi:[background:linear-gradient(180deg,_color-mix(in_srgb,_var(--sky)_55%,_var(--mi-card)),_color-mix(in_srgb,_var(--sky)_20%,_var(--mi-card)))]" :style="{ '--sky': f.sky }"><b class="mi:absolute mi:top-[18%] mi:end-[20%] mi:w-[18%] mi:rounded-[50%] mi:[background:color-mix(in_srgb,var(--mi-yellow)_80%,var(--mi-card))] mi:aspect-[1]" /><s class="mi:absolute mi:inset-[auto_-10%_-30%_-10%] mi:h-[70%] mi:[background:color-mix(in_srgb,var(--sky)_70%,var(--mi-label))] mi:[clip-path:polygon(0_60%,_22%_18%,_40%_48%,_62%_0,_100%_52%,_100%_100%,_0_100%)]" /></span>
          <span v-else-if="f.type === 'video'" class="mi:absolute mi:inset-0 mi:[background:linear-gradient(180deg,_color-mix(in_srgb,_var(--sky)_55%,_var(--mi-card)),_color-mix(in_srgb,_var(--sky)_20%,_var(--mi-card)))] mi:after:content-[''] mi:after:absolute mi:after:top-1/2 mi:after:left-1/2 mi:after:w-9 mi:after:h-9 mi:after:-mt-4.5 mi:after:mr-0 mi:after:mb-0 mi:after:-ml-4.5 mi:after:rounded-[50%] mi:after:[background:color-mix(in_srgb,_var(--mi-card)_80%,_transparent)] mi:before:content-[''] mi:before:absolute mi:before:z-1 mi:before:top-1/2 mi:before:left-1/2 mi:before:mt-[-7px] mi:before:mr-0 mi:before:mb-0 mi:before:-ml-1 mi:before:[border-style:solid] mi:before:[border-width:7px_0_7px_12px] mi:before:border-[color:transparent_transparent_transparent_var(--mi-label)]" :style="{ '--sky': f.sky }"><b class="mi:absolute mi:top-[18%] mi:end-[20%] mi:w-[18%] mi:rounded-[50%] mi:[background:color-mix(in_srgb,var(--mi-yellow)_80%,var(--mi-card))] mi:aspect-[1]" /><s class="mi:absolute mi:inset-[auto_-10%_-30%_-10%] mi:h-[70%] mi:[background:color-mix(in_srgb,var(--sky)_70%,var(--mi-label))] mi:[clip-path:polygon(0_60%,_22%_18%,_40%_48%,_62%_0,_100%_52%,_100%_100%,_0_100%)]" /><em class="mi:absolute mi:bottom-2 mi:end-2 mi:rounded-[6px] mi:[background:color-mix(in_srgb,var(--mi-label)_70%,transparent)] mi:py-px mi:px-1.5 mi:text-[10px] mi:not-italic mi:font-semibold mi:text-card">{{ f.meta }}</em></span>
          <span v-else-if="f.type === 'audio'" class="mi:flex mi:items-center mi:gap-[3px] mi:h-[46%]"><i v-for="(h, n) in wave" :key="n" class="mi:w-1 mi:h-full mi:rounded-[2px] mi:[background:var(--tint)] mi:opacity-75" :style="{ transform: `scaleY(${h})` }" /></span>
          <span v-else class="mi:relative mi:w-[60%] mi:h-[64%] mi:rounded-[6px] mi:[background:var(--mi-card)] mi:shadow-2"><i class="mi:absolute mi:rounded-[4px] mi:h-[14%] mi:[background:var(--tint)] mi:[&:nth-child(1)]:top-[10%] mi:[&:nth-child(1)]:right-[10%] mi:[&:nth-child(1)]:bottom-auto mi:[&:nth-child(1)]:left-[10%] mi:[&:nth-child(1)]:opacity-80 mi:[&:nth-child(2)]:top-[32%] mi:[&:nth-child(2)]:right-[52%] mi:[&:nth-child(2)]:bottom-[10%] mi:[&:nth-child(2)]:left-[10%] mi:[&:nth-child(3)]:top-[32%] mi:[&:nth-child(3)]:right-[10%] mi:[&:nth-child(3)]:bottom-[10%] mi:[&:nth-child(3)]:left-[54%] mi:[&:nth-child(3)]:rounded-[50%]" /><i class="mi:absolute mi:rounded-[4px] mi:[background:color-mix(in_srgb,var(--tint)_25%,transparent)] mi:[&:nth-child(1)]:top-[10%] mi:[&:nth-child(1)]:right-[10%] mi:[&:nth-child(1)]:bottom-auto mi:[&:nth-child(1)]:left-[10%] mi:[&:nth-child(1)]:opacity-80 mi:[&:nth-child(2)]:top-[32%] mi:[&:nth-child(2)]:right-[52%] mi:[&:nth-child(2)]:bottom-[10%] mi:[&:nth-child(2)]:left-[10%] mi:[&:nth-child(3)]:top-[32%] mi:[&:nth-child(3)]:right-[10%] mi:[&:nth-child(3)]:bottom-[10%] mi:[&:nth-child(3)]:left-[54%] mi:[&:nth-child(3)]:rounded-[50%]" /><i class="mi:absolute mi:rounded-[4px] mi:[background:color-mix(in_srgb,var(--tint)_25%,transparent)] mi:[&:nth-child(1)]:top-[10%] mi:[&:nth-child(1)]:right-[10%] mi:[&:nth-child(1)]:bottom-auto mi:[&:nth-child(1)]:left-[10%] mi:[&:nth-child(1)]:opacity-80 mi:[&:nth-child(2)]:top-[32%] mi:[&:nth-child(2)]:right-[52%] mi:[&:nth-child(2)]:bottom-[10%] mi:[&:nth-child(2)]:left-[10%] mi:[&:nth-child(3)]:top-[32%] mi:[&:nth-child(3)]:right-[10%] mi:[&:nth-child(3)]:bottom-[10%] mi:[&:nth-child(3)]:left-[54%] mi:[&:nth-child(3)]:rounded-[50%]" /></span>
        </div>
        <div class="mi:flex mi:items-center mi:gap-1.5 mi:min-w-0 mi:pt-1 mi:px-1 mi:pb-0">
          <span class="mi:py-0.5 mi:px-[5px] mi:rounded-[5px] mi:flex-[none] mi:text-[9px] mi:font-bold mi:tracking-[.04em] mi:text-(--tint) mi:[background:color-mix(in_srgb,_var(--tint)_14%,_transparent)]" :style="{ '--tint': kinds[f.type].color }">{{ kinds[f.type].short }}</span>
          <MiText as="h3" variant="subheadline" weight="medium" :lines="1" :title="f.name">{{ f.name }}</MiText>
        </div>
        <MiText variant="caption" tone="label2" tabular class="mi:py-0 mi:px-1">{{ size(f.kb) }} · {{ f.edited }}</MiText>
        <MiCheckbox class="mi:absolute mi:top-3.5 mi:start-3.5 mi:w-max! mi:opacity-0 mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:group-hover:opacity-100 mi:group-focus-within:opacity-100 mi:group-data-[sel]:opacity-100 mi:[@media(hover:none)]:opacity-100" :model-value="picked.has(f.id)" @update:model-value="toggle(f.id)">
          <span class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Select {{ f.name }}</span>
        </MiCheckbox>
      </li>
    </ul>

    <!-- List: the same files as rows; secondary columns appear as the container widens. -->
    <ul v-else class="mi:grid mi:m-0 mi:py-1 mi:px-0 mi:[list-style:none] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
      <li v-for="f in visible" :key="f.id" class="mi:grid mi:grid-cols-[auto_auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:py-2.5 mi:px-3.5 mi:not-first:border-t mi:not-first:border-t-sep mi:@[680px]:grid-cols-[auto_auto_minmax(0,_1fr)_170px_96px_72px]" :class="picked.has(f.id) ? 'mi:[background:var(--mi-p-tint)]' : ''">
        <MiCheckbox :model-value="picked.has(f.id)" @update:model-value="toggle(f.id)">
          <span class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Select {{ f.name }}</span>
        </MiCheckbox>
        <span class="mi:p-0 mi:rounded-[10px] mi:flex-[none] mi:text-[9px] mi:font-bold mi:tracking-[.04em] mi:text-(--tint) mi:[background:color-mix(in_srgb,_var(--tint)_14%,_transparent)] mi:grid mi:place-items-center mi:w-9 mi:h-9" :style="{ '--tint': kinds[f.type].color }" aria-hidden="true">{{ kinds[f.type].short }}</span>
        <div class="mi:min-w-0">
          <MiText as="h3" variant="subheadline" weight="medium" :lines="1">{{ f.name }}</MiText>
          <MiText variant="caption" tone="label2" class="mi:@[680px]:hidden">{{ f.owner }} · {{ f.edited }}</MiText>
        </div>
        <span class="mi:hidden mi:items-center mi:gap-2 mi:min-w-0 mi:@[680px]:flex"><MiAvatar :name="f.owner" size="xs" tone="auto" decorative /><MiText as="span" variant="footnote" tone="label2" :lines="1">{{ f.owner }}</MiText></span>
        <MiText as="span" variant="footnote" tone="label2" class="mi:hidden mi:@[680px]:block">{{ f.edited }}</MiText>
        <MiText as="span" variant="footnote" tone="label2" tabular class="mi:text-end">{{ size(f.kb) }}</MiText>
      </li>
    </ul>

    <MiEmptyState v-if="!visible.length" title="No files here" description="Try another type or clear the search." icon="search" />

    <Transition enter-active-class="mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring),opacity_var(--mi-dur-2)_var(--mi-ease)]" leave-active-class="mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring),opacity_var(--mi-dur-2)_var(--mi-ease)]" enter-from-class="mi:transform-[translateY(12px)] mi:opacity-0" leave-to-class="mi:transform-[translateY(12px)] mi:opacity-0">
      <div v-if="picked.size" class="mi:sticky mi:bottom-3 mi:z-2 mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2 mi:gap-x-3 mi:pt-2.5 mi:pr-2.5 mi:pb-2.5 mi:pl-4 mi:rounded-lg mi:[background:var(--mi-elev)] mi:shadow-3" role="region" aria-label="Selection">
        <MiText as="span" variant="subheadline" weight="semibold" tabular aria-live="polite">{{ picked.size }} selected · {{ size(pickedKb) }}</MiText>
        <div class="mi:flex mi:items-center mi:gap-1.5">
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

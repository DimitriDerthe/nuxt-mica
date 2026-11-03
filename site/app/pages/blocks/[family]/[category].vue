<template>
  <div class="bc wrap mi:max-w-370 mi:my-0 mi:mx-auto mi:py-0 mi:px-3 mi:box-border mi:grid mi:gap-10 mi:grid-cols-[minmax(0,_1fr)] mi:pt-8 mi:pb-24 mi:min-[1100px]:grid-cols-[232px_minmax(0,_1fr)]">
    <aside class="side mi:hidden mi:min-[1100px]:sticky mi:min-[1100px]:top-21 mi:min-[1100px]:flex mi:min-[1100px]:flex-col mi:min-[1100px]:self-start mi:min-[1100px]:max-h-[calc(100dvh_-_104px)]" :aria-label="t('blocks.title')">
      <nav class="side__nav mi:flex mi:flex-col mi:overflow-y-auto mi:overscroll-contain mi:pt-0 mi:pr-1 mi:pb-3 mi:pl-0 mi:[scrollbar-width:thin]">
        <template v-for="f in owned" :key="f.id">
          <p class="side__group mi:mt-3.5 mi:mr-0 mi:mb-1 mi:ml-2.5 mi:text-[11px] mi:font-semibold mi:tracking-[.04em] mi:uppercase mi:text-label3">{{ f.title[lang] }}</p>
          <NuxtLink
            v-for="x in f.categories" :key="x.id" :to="localePath(`/blocks/${f.id}/${x.id}`)" class="side__link mi:py-[5px] mi:px-2.5 mi:rounded-[8px] mi:text-[13.5px] mi:text-label2 mi:[text-decoration:none] mi:[transition:background-color_var(--mi-dur-1)_var(--mi-ease),_color_var(--mi-dur-1)_var(--mi-ease)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]"
            :class="{ on: f.id === family.id && x.id === category.id }" :aria-current="f.id === family.id && x.id === category.id ? 'page' : undefined"
          >
            {{ x.title[lang] }}
          </NuxtLink>
        </template>
      </nav>
    </aside>

    <main class="main mi:grid mi:gap-12 mi:min-w-0 mi:content-start">
      <nav class="crumbs mi:flex mi:items-center mi:gap-1.5 mi:text-[13px] mi:text-label3 mi:-mb-8" :aria-label="t('blocks.breadcrumb')">
        <NuxtLink class="mi:[.crumbs_a&]:[text-decoration:none] mi:[.crumbs_a&:hover]:text-label" :to="localePath('/blocks')">{{ t('blocks.title') }}</NuxtLink>
        <MiIcon class="mi:[.crumbs_a&]:[text-decoration:none] mi:[.crumbs_a&:hover]:text-label" name="chevron-right" :size="12" />
        <NuxtLink class="mi:[.crumbs_a&]:[text-decoration:none] mi:[.crumbs_a&:hover]:text-label" :to="localePath('/blocks') + '#' + family.id">{{ family.title[lang] }}</NuxtLink>
      </nav>

      <header class="head mi:grid mi:gap-2.5">
        <h1 class="head__title mi:m-0 mi:text-[clamp(34px,_5vw,_56px)] mi:leading-none mi:tracking-[-.045em] mi:font-bold">{{ category.title[lang] }}</h1>
        <p class="head__lead mi:m-0 mi:max-w-[64ch] mi:text-[17px] mi:leading-[1.55] mi:text-label2">{{ family.summary[lang] }}</p>
        <p class="head__count mi:m-0 mi:text-[13px] mi:text-label3">{{ t('blocks.n', { n: list.length }, list.length) }}</p>
      </header>

      <BlockFrame v-for="b in list" :key="b.file" :family="family.id" :category="category.id" :meta="b" />
      <MiEmptyState v-if="!list.length" icon="folder" :title="t('blocks.empty')" />

      <nav class="pn mi:grid mi:grid-cols-[1fr_1fr] mi:gap-3" :aria-label="t('blocks.pager')">
        <NuxtLink v-if="prev" :to="localePath(`/blocks/${prev.family}/${prev.id}`)" class="pn__link mi:grid mi:gap-0.5 mi:py-3.5 mi:px-4.5 mi:rounded-[16px] mi:bg-card mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:text-inherit mi:[text-decoration:none] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translate3d(0,_-2px,_0)] mi:motion-reduce:hover:transform-none">
          <small class="mi:[.pn__link_&]:text-[12px]">{{ t('explorer.prev') }}</small><span>{{ prev.title[lang] }}</span>
        </NuxtLink>
        <span v-else />
        <NuxtLink v-if="next" :to="localePath(`/blocks/${next.family}/${next.id}`)" class="pn__link pn__link--next mi:grid mi:gap-0.5 mi:py-3.5 mi:px-4.5 mi:rounded-[16px] mi:bg-card mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:text-inherit mi:[text-decoration:none] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translate3d(0,_-2px,_0)] mi:text-right mi:motion-reduce:hover:transform-none">
          <small class="mi:[.pn__link_&]:text-[12px]">{{ t('explorer.next') }}</small><span>{{ next.title[lang] }}</span>
        </NuxtLink>
      </nav>
    </main>
  </div>
</template>

<script setup lang="ts">
import { blocksOf, families, findCategory, findFamily } from '~/blocks/catalog'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const lang = computed(() => (locale.value === 'fr' ? 'fr' : 'en'))

const family = computed(() => findFamily(String(route.params.family))!)
const category = computed(() => findCategory(String(route.params.family), String(route.params.category))!)
if (!family.value || !category.value || category.value.ref) throw createError({ statusCode: 404, statusMessage: t('blocks.notFound'), fatal: true })

const list = computed(() => blocksOf(family.value.id, category.value.id))
/** Families without the cross-reference entries (the Modals family only points to other families). */
const owned = families.map(f => ({ ...f, categories: f.categories.filter(x => !x.ref) })).filter(f => f.categories.length)
const flat = owned.flatMap(f => f.categories.map(x => ({ ...x, family: f.id })))
const idx = computed(() => flat.findIndex(x => x.family === family.value.id && x.id === category.value.id))
const prev = computed(() => flat[idx.value - 1])
const next = computed(() => flat[idx.value + 1])

// Block titles first so every category page gets its own description, then the family summary.
useSiteSeo(
  () => `${category.value.title[lang.value]} · ${t('blocks.title')} · Mica`,
  () => `${category.value.title[lang.value]}${lang.value === 'fr' ? ' : ' : ': '}${list.value.map(x => x.title[lang.value]).join(', ')}. ${family.value.summary[lang.value]}`
)
</script>

<style scoped>
.side__link:hover { color: var(--mi-label); background: var(--mi-fill4); }
.side__link.on { color: var(--mi-p-text); background: var(--mi-p-tint); font-weight: 600; }

.main { animation: bc-in var(--mi-dur-3) var(--mi-ease) backwards; }
.crumbs a { color: var(--mi-label2); }
.pn__link small { color: var(--mi-label3); }
.pn__link span { font-weight: 600; color: var(--mi-p-text); }
@keyframes bc-in { from { opacity: 0; transform: translate3d(0, 10px, 0); } }
@media (prefers-reduced-motion: reduce) { .main { animation: none; } }
</style>

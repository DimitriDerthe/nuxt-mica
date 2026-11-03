<template>
  <main class="bx wrap mi:max-w-306 mi:my-0 mi:mx-auto mi:py-0 mi:px-3 mi:box-border mi:pt-[clamp(40px,_7vw,_88px)] mi:pb-24">
    <header class="bx__head mi:grid mi:gap-3 mi:max-w-190">
      <p class="eyebrow mi:m-0 mi:text-[14px] mi:font-semibold mi:text-p-text">{{ t('blocks.eyebrow') }}</p>
      <h1 class="bx__title mi:m-0 mi:text-[clamp(40px,_6vw,_72px)] mi:leading-none mi:tracking-[-.05em] mi:font-bold">{{ t('blocks.title') }}</h1>
      <p class="bx__lead mi:m-0 mi:text-[clamp(16px,_1.5vw,_19px)] mi:leading-[1.55] mi:text-label2 mi:max-w-[60ch]">{{ t('blocks.lead') }}</p>
      <dl class="bx__stats mi:flex mi:flex-wrap mi:gap-y-2 mi:gap-x-7 mi:mt-2.5 mi:mx-0 mi:mb-0">
        <div class="mi:[.bx__stats_&]:grid mi:[.bx__stats_&]:gap-0.5"><dt class="mi:[.bx__stats_&]:order-2">{{ t('blocks.statBlocks') }}</dt><dd class="mi:[.bx__stats_&]:m-0 mi:[.bx__stats_&]:tracking-[-.03em]">{{ total }}</dd></div>
        <div class="mi:[.bx__stats_&]:grid mi:[.bx__stats_&]:gap-0.5"><dt class="mi:[.bx__stats_&]:order-2">{{ t('blocks.statCategories') }}</dt><dd class="mi:[.bx__stats_&]:m-0 mi:[.bx__stats_&]:tracking-[-.03em]">{{ categories }}</dd></div>
        <div class="mi:[.bx__stats_&]:grid mi:[.bx__stats_&]:gap-0.5"><dt class="mi:[.bx__stats_&]:order-2">{{ t('blocks.statFamilies') }}</dt><dd class="mi:[.bx__stats_&]:m-0 mi:[.bx__stats_&]:tracking-[-.03em]">{{ families.length }}</dd></div>
      </dl>
    </header>

    <div class="bx__tools mi:sticky mi:top-18 mi:z-5 mi:grid mi:gap-3 mi:mt-9 mi:-mx-3 mi:mb-0 mi:p-3 mi:rounded-[18px] mi:bg-mat mi:shadow-[0_0_0_.5px_var(--mi-mat-b)] mi:min-[900px]:grid-cols-[300px_1fr] mi:min-[900px]:items-center">
      <MiSearch v-model="q" :placeholder="t('blocks.search')" :aria-label="t('blocks.search')" hotkey="k" :cancelable="false" class="bx__search" />
      <div class="bx__chips mi:flex mi:gap-1.5 mi:overflow-x-auto mi:[scrollbar-width:none] mi:p-0.5" role="group" :aria-label="t('blocks.family')">
        <MiChip :model-value="fam === ''" selectable tone="neutral" :label="t('blocks.all')" @update:model-value="fam = ''" />
        <MiChip
          v-for="f in families" :key="f.id" :model-value="fam === f.id" selectable tone="neutral" :label="f.title[lang]"
          @update:model-value="on => (fam = on ? f.id : '')"
        />
      </div>
    </div>

    <section v-for="f in visible" :id="f.id" :key="f.id" class="bx__family mi:pt-12 mi:[scroll-margin-top:150px]" :aria-labelledby="'f-' + f.id">
      <div class="bx__fhead mi:grid mi:gap-1 mi:mb-4">
        <h2 :id="'f-' + f.id" class="bx__ftitle mi:flex mi:items-baseline mi:gap-2.5 mi:m-0 mi:text-[24px] mi:tracking-[-.025em]">{{ f.title[lang] }} <span>{{ f.cats.length }}</span></h2>
        <p class="bx__fsum mi:m-0 mi:text-[14px] mi:text-label2">{{ f.summary[lang] }}</p>
      </div>
      <ul class="bx__grid mi:grid mi:gap-3.5 mi:grid-cols-[repeat(auto-fill,_minmax(min(100%,_280px),_1fr))] mi:[list-style:none] mi:m-0 mi:p-0">
        <li v-for="x in f.cats" :key="x.id">
          <NuxtLink :to="localePath(`/blocks/${x.owner.family}/${x.owner.category}`)" class="card mi:grid mi:gap-3 mi:pt-2.5 mi:px-2.5 mi:pb-3.5 mi:rounded-[20px] mi:bg-card mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:text-inherit mi:[text-decoration:none] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translate3d(0,_-3px,_0)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:motion-reduce:hover:transform-none">
            <BlockThumb :family="x.owner.family" :category="x.owner.category" :file="x.blocks[0]?.file" />
            <span class="card__row mi:flex mi:items-baseline mi:justify-between mi:gap-2.5 mi:py-0 mi:px-1.5">
              <span class="card__title mi:text-[15px] mi:font-semibold mi:tracking-[-.01em]">{{ x.title[lang] }}</span>
              <span class="card__n mi:text-[12px] mi:text-label3 mi:tabular-nums">{{ t('blocks.n', { n: x.blocks.length }, x.blocks.length) }}</span>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <MiEmptyState v-if="!visible.length" icon="search" :title="t('blocks.noMatch', { q })" />
  </main>
</template>

<script setup lang="ts">
import { blockCount, blocksOf, categoryCount, families, ownerOf } from '~/blocks/catalog'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const lang = computed(() => (locale.value === 'fr' ? 'fr' : 'en'))

const total = blockCount()
const categories = categoryCount()
const q = ref(typeof route.query.q === 'string' ? route.query.q : '')
const fam = ref(typeof route.query.family === 'string' ? route.query.family : '')

const visible = computed(() => {
  const s = q.value.trim().toLowerCase()
  return families
    .filter(f => !fam.value || f.id === fam.value)
    .map(f => ({
      ...f,
      cats: f.categories
        .map((x) => {
          const owner = ownerOf(f, x)
          return { ...x, owner, blocks: blocksOf(owner.family, owner.category) }
        })
        .filter(x => !s || x.title.en.toLowerCase().includes(s) || x.title.fr.toLowerCase().includes(s)
          || x.blocks.some(b => b.title[lang.value].toLowerCase().includes(s) || b.summary[lang.value].toLowerCase().includes(s)))
    }))
    .filter(f => f.cats.length)
})

useSiteSeo(() => `${t('blocks.title')} · Mica`, () => t('blocks.lead'))
</script>

<style scoped>
.bx__head { animation: bx-in var(--mi-dur-4) var(--mi-ease) backwards; }
.bx__stats dt { font-size: 13px; color: var(--mi-label2); }
.bx__stats dd { font-size: 28px; font-weight: 700; font-variant-numeric: tabular-nums; }
.bx__tools { -webkit-backdrop-filter: blur(20px) saturate(180%); backdrop-filter: blur(20px) saturate(180%); }
.bx__chips > * { flex: none; }
.bx__ftitle span { font-size: 13px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.card__n { flex: none; }
@keyframes bx-in { from { opacity: 0; transform: translate3d(0, 14px, 0); } }
@media (prefers-reduced-motion: reduce) { .bx__head { animation: none; } }
</style>

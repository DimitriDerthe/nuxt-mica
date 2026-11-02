<template>
  <main class="bx wrap">
    <header class="bx__head">
      <p class="eyebrow">{{ t('blocks.eyebrow') }}</p>
      <h1 class="bx__title">{{ t('blocks.title') }}</h1>
      <p class="bx__lead">{{ t('blocks.lead') }}</p>
      <dl class="bx__stats">
        <div><dt>{{ t('blocks.statBlocks') }}</dt><dd>{{ total }}</dd></div>
        <div><dt>{{ t('blocks.statCategories') }}</dt><dd>{{ categories }}</dd></div>
        <div><dt>{{ t('blocks.statFamilies') }}</dt><dd>{{ families.length }}</dd></div>
      </dl>
    </header>

    <div class="bx__tools">
      <MiSearch v-model="q" :placeholder="t('blocks.search')" :aria-label="t('blocks.search')" hotkey="k" :cancelable="false" class="bx__search" />
      <div class="bx__chips" role="group" :aria-label="t('blocks.family')">
        <MiChip :model-value="fam === ''" selectable tone="neutral" :label="t('blocks.all')" @update:model-value="fam = ''" />
        <MiChip
          v-for="f in families" :key="f.id" :model-value="fam === f.id" selectable tone="neutral" :label="f.title[lang]"
          @update:model-value="on => (fam = on ? f.id : '')"
        />
      </div>
    </div>

    <section v-for="f in visible" :id="f.id" :key="f.id" class="bx__family" :aria-labelledby="'f-' + f.id">
      <div class="bx__fhead">
        <h2 :id="'f-' + f.id" class="bx__ftitle">{{ f.title[lang] }} <span>{{ f.cats.length }}</span></h2>
        <p class="bx__fsum">{{ f.summary[lang] }}</p>
      </div>
      <ul class="bx__grid">
        <li v-for="x in f.cats" :key="x.id">
          <NuxtLink :to="localePath(`/blocks/${x.owner.family}/${x.owner.category}`)" class="card">
            <BlockThumb :family="x.owner.family" :category="x.owner.category" :file="x.blocks[0]?.file" />
            <span class="card__row">
              <span class="card__title">{{ x.title[lang] }}</span>
              <span class="card__n">{{ t('blocks.n', { n: x.blocks.length }, x.blocks.length) }}</span>
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
.wrap { max-width: 1224px; margin: 0 auto; padding: 0 12px; box-sizing: border-box; }
.bx { padding-top: clamp(40px, 7vw, 88px); padding-bottom: 96px; }
.bx__head { display: grid; gap: 12px; max-width: 760px; animation: bx-in var(--mi-dur-4) var(--mi-ease) backwards; }
.eyebrow { margin: 0; font-size: 14px; font-weight: 600; color: var(--mi-p-text); }
.bx__title { margin: 0; font-size: clamp(40px, 6vw, 72px); line-height: 1; letter-spacing: -.05em; font-weight: 700; }
.bx__lead { margin: 0; font-size: clamp(16px, 1.5vw, 19px); line-height: 1.55; color: var(--mi-label2); max-width: 60ch; }
.bx__stats { display: flex; flex-wrap: wrap; gap: 8px 28px; margin: 10px 0 0; }
.bx__stats div { display: grid; gap: 2px; }
.bx__stats dt { order: 2; font-size: 13px; color: var(--mi-label2); }
.bx__stats dd { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.bx__tools { position: sticky; top: 72px; z-index: 5; display: grid; gap: 12px; margin: 36px -12px 0; padding: 12px; border-radius: 18px; background: var(--mi-mat); box-shadow: 0 0 0 .5px var(--mi-mat-b); -webkit-backdrop-filter: blur(20px) saturate(180%); backdrop-filter: blur(20px) saturate(180%); }
@media (min-width: 900px) { .bx__tools { grid-template-columns: 300px 1fr; align-items: center; } }
.bx__chips { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding: 2px; }
.bx__chips > * { flex: none; }
.bx__family { padding-top: 48px; scroll-margin-top: 150px; }
.bx__fhead { display: grid; gap: 4px; margin-bottom: 16px; }
.bx__ftitle { display: flex; align-items: baseline; gap: 10px; margin: 0; font-size: 24px; letter-spacing: -.025em; }
.bx__ftitle span { font-size: 13px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.bx__fsum { margin: 0; font-size: 14px; color: var(--mi-label2); }
.bx__grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); list-style: none; margin: 0; padding: 0; }
.card { display: grid; gap: 12px; padding: 10px 10px 14px; border-radius: 20px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); color: inherit; text-decoration: none; transition: transform var(--mi-dur-2) var(--mi-ease); }
.card:hover { transform: translate3d(0, -3px, 0); }
.card:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.card__row { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; padding: 0 6px; }
.card__title { font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
.card__n { flex: none; font-size: 12px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
@keyframes bx-in { from { opacity: 0; transform: translate3d(0, 14px, 0); } }
@media (prefers-reduced-motion: reduce) { .bx__head { animation: none; } .card:hover { transform: none; } }
</style>

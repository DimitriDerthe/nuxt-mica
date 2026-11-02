<template>
  <div class="bc wrap">
    <aside class="side" :aria-label="t('blocks.title')">
      <nav class="side__nav">
        <template v-for="f in owned" :key="f.id">
          <p class="side__group">{{ f.title[lang] }}</p>
          <NuxtLink
            v-for="x in f.categories" :key="x.id" :to="localePath(`/blocks/${f.id}/${x.id}`)" class="side__link"
            :class="{ on: f.id === family.id && x.id === category.id }" :aria-current="f.id === family.id && x.id === category.id ? 'page' : undefined"
          >
            {{ x.title[lang] }}
          </NuxtLink>
        </template>
      </nav>
    </aside>

    <main class="main">
      <nav class="crumbs" :aria-label="t('blocks.breadcrumb')">
        <NuxtLink :to="localePath('/blocks')">{{ t('blocks.title') }}</NuxtLink>
        <MiIcon name="chevron-right" :size="12" />
        <NuxtLink :to="localePath('/blocks') + '#' + family.id">{{ family.title[lang] }}</NuxtLink>
      </nav>

      <header class="head">
        <h1 class="head__title">{{ category.title[lang] }}</h1>
        <p class="head__lead">{{ family.summary[lang] }}</p>
        <p class="head__count">{{ t('blocks.n', { n: list.length }, list.length) }}</p>
      </header>

      <BlockFrame v-for="b in list" :key="b.file" :family="family.id" :category="category.id" :meta="b" />
      <MiEmptyState v-if="!list.length" icon="folder" :title="t('blocks.empty')" />

      <nav class="pn" :aria-label="t('blocks.pager')">
        <NuxtLink v-if="prev" :to="localePath(`/blocks/${prev.family}/${prev.id}`)" class="pn__link">
          <small>{{ t('explorer.prev') }}</small><span>{{ prev.title[lang] }}</span>
        </NuxtLink>
        <span v-else />
        <NuxtLink v-if="next" :to="localePath(`/blocks/${next.family}/${next.id}`)" class="pn__link pn__link--next">
          <small>{{ t('explorer.next') }}</small><span>{{ next.title[lang] }}</span>
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

useSiteSeo(() => `${category.value.title[lang.value]} · ${t('blocks.title')} · Mica`, () => family.value.summary[lang.value])
</script>

<style scoped>
.wrap { max-width: 1480px; margin: 0 auto; padding: 0 12px; box-sizing: border-box; }
.bc { display: grid; gap: 40px; grid-template-columns: minmax(0, 1fr); padding-top: 32px; padding-bottom: 96px; }
@media (min-width: 1100px) { .bc { grid-template-columns: 232px minmax(0, 1fr); } }

.side { display: none; }
@media (min-width: 1100px) {
  .side { position: sticky; top: 84px; display: flex; flex-direction: column; align-self: start; max-height: calc(100dvh - 104px); }
}
.side__nav { display: flex; flex-direction: column; overflow-y: auto; overscroll-behavior: contain; padding: 0 4px 12px 0; scrollbar-width: thin; }
.side__group { margin: 14px 0 4px 10px; font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--mi-label3); }
.side__link { padding: 5px 10px; border-radius: 8px; font-size: 13.5px; color: var(--mi-label2); text-decoration: none; transition: background-color var(--mi-dur-1) var(--mi-ease), color var(--mi-dur-1) var(--mi-ease); }
.side__link:hover { color: var(--mi-label); background: var(--mi-fill4); }
.side__link.on { color: var(--mi-p-text); background: var(--mi-p-tint); font-weight: 600; }
.side__link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }

.main { display: grid; gap: 48px; min-width: 0; align-content: start; animation: bc-in var(--mi-dur-3) var(--mi-ease) backwards; }
.crumbs { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--mi-label3); margin-bottom: -32px; }
.crumbs a { color: var(--mi-label2); text-decoration: none; }
.crumbs a:hover { color: var(--mi-label); }
.head { display: grid; gap: 10px; }
.head__title { margin: 0; font-size: clamp(34px, 5vw, 56px); line-height: 1; letter-spacing: -.045em; font-weight: 700; }
.head__lead { margin: 0; max-width: 64ch; font-size: 17px; line-height: 1.55; color: var(--mi-label2); }
.head__count { margin: 0; font-size: 13px; color: var(--mi-label3); }

.pn { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.pn__link { display: grid; gap: 2px; padding: 14px 18px; border-radius: 16px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); color: inherit; text-decoration: none; transition: transform var(--mi-dur-2) var(--mi-ease); }
.pn__link:hover { transform: translate3d(0, -2px, 0); }
.pn__link--next { text-align: right; }
.pn__link small { font-size: 12px; color: var(--mi-label3); }
.pn__link span { font-weight: 600; color: var(--mi-p-text); }
@keyframes bc-in { from { opacity: 0; transform: translate3d(0, 10px, 0); } }
@media (prefers-reduced-motion: reduce) { .main { animation: none; } .pn__link:hover { transform: none; } }
</style>

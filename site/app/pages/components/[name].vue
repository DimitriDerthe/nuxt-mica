<template>
  <div class="cd wrap">
    <aside class="side" :aria-label="t('explorer.title')">
      <MiSearch v-model="q" size="compact" :placeholder="t('explorer.search')" :aria-label="t('explorer.search')" class="side__search" />
      <nav class="side__nav">
        <template v-for="g in groups" :key="g">
          <p v-if="sideList.some(c => c.group === g)" class="side__group">{{ t('explorer.groups.' + g) }}</p>
          <NuxtLink
            v-for="c in sideList.filter(x => x.group === g)" :key="c.name" :to="localePath('/components/' + toSlug(c.name))"
            class="side__link" :class="{ on: c.name === current }" :aria-current="c.name === name ? 'page' : undefined"
          >
            {{ c.name.replace(/^Mi/, '') }}
          </NuxtLink>
        </template>
      </nav>
    </aside>

    <main v-if="api" class="main">
      <nav class="crumbs" aria-label="Breadcrumb">
        <NuxtLink :to="localePath('/components')">{{ t('explorer.title') }}</NuxtLink>
        <MiIcon name="chevron-right" :size="12" />
        <NuxtLink :to="localePath('/components') + '?group=' + api.group">{{ t('explorer.groups.' + api.group) }}</NuxtLink>
        <template v-if="api.root">
          <MiIcon name="chevron-right" :size="12" />
          <NuxtLink :to="localePath('/components/' + toSlug(api.root))">{{ api.root.replace(/^Mi/, '') }}</NuxtLink>
        </template>
      </nav>

      <header class="head">
        <h1 class="head__title">{{ name.replace(/^Mi/, '') }}</h1>
        <div class="head__meta">
          <code class="head__tag">&lt;{{ name }}&gt;</code>
          <MiBadge :label="t('explorer.groups.' + api.group)" tone="neutral" />
          <MiBadge v-if="vmodel" :label="t('explorer.vmodel')" tone="primary" />
        </div>
        <p class="head__lead">{{ api.summary }}</p>
      </header>

      <ComponentPlayground :key="name" :name="name" :api="api.props" :vmodel="vmodel" />

      <section class="api" aria-labelledby="api-props">
        <h2 id="api-props" class="api__title">{{ t('explorer.propsTitle') }} <span>{{ api.props.length }}</span></h2>
        <div v-if="api.props.length" class="tbl" role="table" :aria-label="t('explorer.propsTitle')">
          <div class="tbl__row tbl__row--head" role="row">
            <span role="columnheader">{{ t('explorer.prop') }}</span>
            <span role="columnheader">{{ t('explorer.type') }}</span>
            <span role="columnheader">{{ t('explorer.default') }}</span>
          </div>
          <div v-for="p in api.props" :key="p.name" class="tbl__row" role="row">
            <span role="cell" class="tbl__name">
              <code>{{ p.name }}</code>
              <small v-if="p.required" class="tbl__req">{{ t('explorer.required') }}</small>
            </span>
            <span role="cell" class="tbl__type"><code>{{ p.type }}</code></span>
            <span role="cell" class="tbl__def"><code v-if="p.default">{{ p.default }}</code><span v-else class="tbl__dash">–</span></span>
            <span v-if="p.doc" role="cell" class="tbl__doc">{{ p.doc }}</span>
          </div>
        </div>
        <p v-else class="api__none">{{ t('explorer.none') }}</p>
      </section>

      <section v-if="api.parts.length" class="parts" aria-labelledby="api-parts">
        <h2 id="api-parts" class="api__title">{{ t('explorer.parts') }} <span>{{ api.parts.length }}</span></h2>
        <ul class="parts__list">
          <li v-for="p in api.parts" :key="p.name">
            <NuxtLink :to="localePath('/components/' + toSlug(p.name))" class="parts__link"><code>{{ p.name }}</code><span>{{ p.summary }}</span></NuxtLink>
          </li>
        </ul>
      </section>

      <div class="api__pair">
        <section class="api" aria-labelledby="api-slots">
          <h2 id="api-slots" class="api__title">{{ t('explorer.slots') }} <span>{{ api.slots.length }}</span></h2>
          <ul v-if="api.slots.length" class="list">
            <li v-for="s in api.slots" :key="s.name">
              <code class="list__name">#{{ s.name }}</code>
              <code v-if="s.props" class="list__type">{{ s.props }}</code>
              <span v-if="s.doc" class="list__doc">{{ s.doc }}</span>
            </li>
          </ul>
          <p v-else class="api__none">{{ t('explorer.none') }}</p>
        </section>
        <section class="api" aria-labelledby="api-events">
          <h2 id="api-events" class="api__title">{{ t('explorer.events') }} <span>{{ api.emits.length }}</span></h2>
          <ul v-if="api.emits.length" class="list">
            <li v-for="e in api.emits" :key="e.name">
              <code class="list__name">@{{ e.name }}</code>
              <code v-if="e.type" class="list__type">{{ e.type }}</code>
              <span v-if="e.doc" class="list__doc">{{ e.doc }}</span>
            </li>
          </ul>
          <p v-else class="api__none">{{ t('explorer.none') }}</p>
        </section>
      </div>

      <section v-if="api.types.length" class="api" aria-labelledby="api-types">
        <h2 id="api-types" class="api__title">{{ t('explorer.types') }}</h2>
        <SiteCode :file="api.path.split('/').pop() ?? ''" :text="api.types.join('\n')" :copy-label="t('start.copy')" :copied-label="t('start.copied')" plain class="api__code" />
      </section>

      <section v-if="api.exposed.length" class="api" aria-labelledby="api-exposed">
        <h2 id="api-exposed" class="api__title">{{ t('explorer.exposed') }}</h2>
        <p class="api__chips"><code v-for="x in api.exposed" :key="x">{{ x }}</code></p>
      </section>

      <p class="ai">
        <MiIcon name="document" :size="16" />
        <a :href="`${useRuntimeConfig().app.baseURL}docs/api/${name}.md`" target="_blank" rel="noopener">{{ t('explorer.aiDoc') }}</a>
        <code>docs/api/{{ name }}.md</code>
      </p>

      <nav class="pn" :aria-label="t('explorer.title')">
        <NuxtLink v-if="prev" :to="localePath('/components/' + toSlug(prev.name))" class="pn__link">
          <small>{{ t('explorer.prev') }}</small><span>{{ prev.name.replace(/^Mi/, '') }}</span>
        </NuxtLink>
        <span v-else />
        <NuxtLink v-if="next" :to="localePath('/components/' + toSlug(next.name))" class="pn__link pn__link--next">
          <small>{{ t('explorer.next') }}</small><span>{{ next.name.replace(/^Mi/, '') }}</span>
        </NuxtLink>
      </nav>
    </main>
  </div>
</template>

<script setup lang="ts">
import { fromSlug, toSlug } from '~/utils/explorer'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const name = computed(() => fromSlug(String(route.params.name)))
const { data: list } = await useFetch('/api/components', { query: { lang: locale } })
const { data: api, error } = await useFetch(() => `/api/components/${name.value}`, { query: { lang: locale } })
if (error.value) throw createError({ statusCode: 404, statusMessage: t('explorer.notFound'), fatal: true })

const vmodel = computed(() => !!api.value?.props.some(p => p.name === 'modelValue'))
const all = computed(() => list.value ?? [])
const groups = computed(() => [...new Set(all.value.map(c => c.group))])
const q = ref('')
const sideList = computed(() => {
  const s = q.value.trim().toLowerCase()
  return s ? all.value.filter(c => c.name.toLowerCase().includes(s)) : all.value
})
const current = computed(() => api.value?.root ?? name.value)
const idx = computed(() => all.value.findIndex(c => c.name === current.value))
const prev = computed(() => (idx.value > 0 ? all.value[idx.value - 1] : undefined))
const next = computed(() => (idx.value >= 0 && idx.value < all.value.length - 1 ? all.value[idx.value + 1] : undefined))

useHead(() => ({ title: `${name.value.replace(/^Mi/, '')} · ${t('explorer.title')} · Mica` }))
useSeoMeta({ description: () => api.value?.summary ?? '' })
</script>

<style scoped>
.wrap { max-width: 1320px; margin: 0 auto; padding: 0 24px; box-sizing: border-box; }
@media (max-width: 480px) { .wrap { padding: 0 16px; } }
.cd { display: grid; gap: 40px; grid-template-columns: minmax(0, 1fr); padding-top: 32px; padding-bottom: 96px; }
@media (min-width: 1024px) { .cd { grid-template-columns: 220px minmax(0, 1fr); } }

/* Sidebar: every component, grouped; hidden on small screens where the breadcrumb and prev/next take over. */
.side { display: none; }
@media (min-width: 1024px) {
  .side { position: sticky; top: 84px; display: flex; flex-direction: column; gap: 12px; align-self: start; max-height: calc(100dvh - 104px); }
}
.side__nav { display: flex; flex-direction: column; overflow-y: auto; overscroll-behavior: contain; padding: 0 4px 12px 0; scrollbar-width: thin; }
.side__group { margin: 14px 0 4px 10px; font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--mi-label3); }
.side__link { padding: 5px 10px; border-radius: 8px; font-size: 14px; color: var(--mi-label2); text-decoration: none; transition: background-color var(--mi-dur-1) var(--mi-ease), color var(--mi-dur-1) var(--mi-ease); }
.side__link:hover { color: var(--mi-label); background: var(--mi-fill4); }
.side__link.on { color: var(--mi-p-text); background: var(--mi-p-tint); font-weight: 600; }
.side__link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }

.main { display: grid; gap: 28px; min-width: 0; align-content: start; animation: cd-in var(--mi-dur-3) var(--mi-ease) backwards; }
.crumbs { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--mi-label3); }
.crumbs a { color: var(--mi-label2); text-decoration: none; }
.crumbs a:hover { color: var(--mi-label); }
.head { display: grid; gap: 12px; margin-top: -12px; }
.head__title { margin: 0; font-size: clamp(36px, 5vw, 56px); line-height: 1; letter-spacing: -.045em; font-weight: 700; }
.head__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.head__tag { padding: 3px 8px; border-radius: 7px; background: var(--mi-fill4); font: 13px/1.4 ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label); }
.head__lead { margin: 0; max-width: 64ch; font-size: 17px; line-height: 1.55; color: var(--mi-label2); }

.api { display: grid; gap: 14px; min-width: 0; align-content: start; }
.api__title { display: flex; align-items: baseline; gap: 8px; margin: 12px 0 0; font-size: 22px; letter-spacing: -.02em; }
.api__title span { font-size: 13px; font-weight: 600; color: var(--mi-label3); }
.api__none { margin: 0; font-size: 14px; color: var(--mi-label3); }
.api__pair { display: grid; gap: 28px; }
@media (min-width: 900px) { .api__pair { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
.api__chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; }
.api__chips code, .tbl code, .list code { font: 12.5px/1.5 ui-monospace, "SF Mono", Menlo, monospace; }
.api__chips code { padding: 3px 8px; border-radius: 7px; background: var(--mi-fill4); }

/* Props: a table on wide screens, stacked rows on phones. */
.tbl { border-radius: 18px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); overflow: hidden; }
.tbl__row { display: grid; grid-template-columns: minmax(0, 1fr); gap: 4px 16px; padding: 14px 16px; border-top: 1px solid var(--mi-sep); }
.tbl__row--head { display: none; }
@media (min-width: 760px) {
  .tbl__row { grid-template-columns: minmax(120px, .8fr) minmax(0, 2fr) minmax(80px, .7fr); }
  .tbl__row--head { display: grid; border-top: 0; padding-top: 10px; padding-bottom: 10px; background: var(--mi-fill4); font-size: 12px; font-weight: 600; color: var(--mi-label2); }
  .tbl__doc { grid-column: 2 / -1; }
}
.tbl__row--head + .tbl__row { border-top: 0; }
.tbl__name { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; }
.tbl__name code { font-weight: 600; color: var(--mi-label); }
.tbl__req { font-size: 11px; font-weight: 600; color: var(--mi-orange-t); }
.tbl__type code { color: var(--mi-p-text); overflow-wrap: anywhere; }
.tbl__def code { color: var(--mi-s-text); overflow-wrap: anywhere; }
.tbl__dash { color: var(--mi-label3); }
.tbl__doc { font-size: 14px; line-height: 1.5; color: var(--mi-label2); }

.list { display: grid; list-style: none; margin: 0; padding: 0; border-radius: 18px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); overflow: hidden; }
.list li { display: grid; gap: 4px; padding: 12px 16px; border-top: 1px solid var(--mi-sep); }
.list li:first-child { border-top: 0; }
.list__name { font-weight: 600; color: var(--mi-label); }
.list__type { color: var(--mi-p-text); overflow-wrap: anywhere; }
.list__doc { font-size: 14px; color: var(--mi-label2); }
.api__code :deep(.code__pre) { white-space: pre-wrap; overflow-wrap: anywhere; }

.ai { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 0; padding: 14px 16px; border-radius: 14px; background: var(--mi-p-tint2); font-size: 14px; color: var(--mi-p-text); }
.ai a { color: inherit; font-weight: 600; }
.ai code { margin-left: auto; font: 12px ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label2); }

.pn { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-top: 12px; }
.pn__link { display: grid; gap: 2px; padding: 14px 18px; border-radius: 16px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); color: inherit; text-decoration: none; transition: transform var(--mi-dur-2) var(--mi-ease); }
.pn__link:hover { transform: translate3d(0, -2px, 0); }
.pn__link--next { text-align: right; }
.pn__link small { font-size: 12px; color: var(--mi-label3); }
.pn__link span { font-weight: 600; color: var(--mi-p-text); }
@keyframes cd-in { from { opacity: 0; transform: translate3d(0, 10px, 0); } }
@media (prefers-reduced-motion: reduce) { .main { animation: none; } .pn__link:hover { transform: none; } }
.parts { display: grid; gap: 10px; margin-top: 4px; }
.parts__list { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr)); list-style: none; margin: 0; padding: 0; }
.parts__link { display: grid; gap: 2px; height: 100%; box-sizing: border-box; padding: 10px 14px; border-radius: 14px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); color: inherit; text-decoration: none; }
.parts__link:hover { box-shadow: 0 0 0 1px var(--mi-p); }
.parts__link code { font: 600 13px/1.3 ui-monospace, "SF Mono", Menlo, monospace; }
.parts__link span { font-size: 12px; line-height: 1.4; color: var(--mi-label2); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
</style>

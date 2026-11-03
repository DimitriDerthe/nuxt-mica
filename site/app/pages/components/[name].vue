<template>
  <div class="cd wrap mi:max-w-306 mi:my-0 mi:mx-auto mi:py-0 mi:px-3 mi:box-border mi:grid mi:gap-10 mi:grid-cols-[minmax(0,_1fr)] mi:pt-8 mi:pb-24 mi:min-[1024px]:grid-cols-[220px_minmax(0,_1fr)]">
    <aside class="side mi:hidden mi:min-[1024px]:sticky mi:min-[1024px]:top-21 mi:min-[1024px]:flex mi:min-[1024px]:flex-col mi:min-[1024px]:gap-3 mi:min-[1024px]:self-start mi:min-[1024px]:max-h-[calc(100dvh_-_104px)]" :aria-label="t('explorer.title')">
      <MiSearch v-model="q" size="compact" :placeholder="t('explorer.search')" :aria-label="t('explorer.search')" class="side__search" />
      <nav class="side__nav mi:flex mi:flex-col mi:overflow-y-auto mi:overscroll-contain mi:pt-0 mi:pr-1 mi:pb-3 mi:pl-0 mi:[scrollbar-width:thin]">
        <template v-for="g in groups" :key="g">
          <p v-if="sideList.some(c => c.group === g)" class="side__group mi:mt-3.5 mi:mr-0 mi:mb-1 mi:ml-2.5 mi:text-[11px] mi:font-semibold mi:tracking-[.04em] mi:uppercase mi:text-label3">{{ t('explorer.groups.' + g) }}</p>
          <NuxtLink
            v-for="c in sideList.filter(x => x.group === g)" :key="c.name" :to="localePath('/components/' + toSlug(c.name))"
            class="side__link mi:py-[5px] mi:px-2.5 mi:rounded-[8px] mi:text-[14px] mi:text-label2 mi:[text-decoration:none] mi:[transition:background-color_var(--mi-dur-1)_var(--mi-ease),_color_var(--mi-dur-1)_var(--mi-ease)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :class="{ on: c.name === current }" :aria-current="c.name === name ? 'page' : undefined"
          >
            {{ c.name.replace(/^Mi/, '') }}
          </NuxtLink>
        </template>
      </nav>
    </aside>

    <main v-if="api" class="main mi:grid mi:gap-7 mi:min-w-0 mi:content-start">
      <nav class="crumbs mi:flex mi:items-center mi:gap-1.5 mi:text-[13px] mi:text-label3" aria-label="Breadcrumb">
        <NuxtLink class="mi:[.crumbs_a&]:[text-decoration:none] mi:[.crumbs_a&:hover]:text-label" :to="localePath('/components')">{{ t('explorer.title') }}</NuxtLink>
        <MiIcon class="mi:[.crumbs_a&]:[text-decoration:none] mi:[.crumbs_a&:hover]:text-label" name="chevron-right" :size="12" />
        <NuxtLink class="mi:[.crumbs_a&]:[text-decoration:none] mi:[.crumbs_a&:hover]:text-label" :to="localePath('/components') + '?group=' + api.group">{{ t('explorer.groups.' + api.group) }}</NuxtLink>
        <template v-if="api.root">
          <MiIcon class="mi:[.crumbs_a&]:[text-decoration:none] mi:[.crumbs_a&:hover]:text-label" name="chevron-right" :size="12" />
          <NuxtLink class="mi:[.crumbs_a&]:[text-decoration:none] mi:[.crumbs_a&:hover]:text-label" :to="localePath('/components/' + toSlug(api.root))">{{ api.root.replace(/^Mi/, '') }}</NuxtLink>
        </template>
      </nav>

      <header class="head mi:grid mi:gap-3 mi:-mt-3">
        <h1 class="head__title mi:m-0 mi:text-[clamp(36px,_5vw,_56px)] mi:leading-none mi:tracking-[-.045em] mi:font-bold">{{ name.replace(/^Mi/, '') }}</h1>
        <div class="head__meta mi:flex mi:flex-wrap mi:items-center mi:gap-2">
          <code class="head__tag mi:py-[3px] mi:px-2 mi:rounded-[7px] mi:bg-fill4 mi:[font:13px/1.4_ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:text-label">&lt;{{ name }}&gt;</code>
          <MiBadge :label="t('explorer.groups.' + api.group)" tone="neutral" />
          <MiBadge v-if="vmodel" :label="t('explorer.vmodel')" tone="primary" />
        </div>
        <p class="head__lead mi:m-0 mi:max-w-[64ch] mi:text-[17px] mi:leading-[1.55] mi:text-label2">{{ api.summary }}</p>
      </header>

      <ComponentPlayground :key="name" :name="name" :api="api.props" :vmodel="vmodel" />

      <section class="api mi:grid mi:gap-3.5 mi:min-w-0 mi:content-start" aria-labelledby="api-props">
        <h2 id="api-props" class="api__title mi:flex mi:items-baseline mi:gap-2 mi:mt-3 mi:mx-0 mi:mb-0 mi:text-[22px] mi:tracking-[-.02em]">{{ t('explorer.propsTitle') }} <span>{{ api.props.length }}</span></h2>
        <div v-if="api.props.length" class="tbl mi:rounded-[18px] mi:bg-card mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:overflow-hidden" role="table" :aria-label="t('explorer.propsTitle')">
          <div class="tbl__row tbl__row--head mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-y-1 mi:gap-x-4 mi:py-3.5 mi:px-4 mi:border-t mi:border-t-sep mi:hidden mi:min-[760px]:grid-cols-[minmax(120px,_.8fr)_minmax(0,_2fr)_minmax(80px,_.7fr)] mi:min-[760px]:grid mi:min-[760px]:[border-top:0] mi:min-[760px]:pt-2.5 mi:min-[760px]:pb-2.5 mi:min-[760px]:bg-fill4 mi:min-[760px]:text-[12px] mi:min-[760px]:font-semibold mi:min-[760px]:text-label2 mi:[.tbl__row--head+&]:[border-top:0]" role="row">
            <span role="columnheader">{{ t('explorer.prop') }}</span>
            <span role="columnheader">{{ t('explorer.type') }}</span>
            <span role="columnheader">{{ t('explorer.default') }}</span>
          </div>
          <div v-for="p in api.props" :key="p.name" class="tbl__row mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-y-1 mi:gap-x-4 mi:py-3.5 mi:px-4 mi:border-t mi:border-t-sep mi:min-[760px]:grid-cols-[minmax(120px,_.8fr)_minmax(0,_2fr)_minmax(80px,_.7fr)] mi:[.tbl__row--head+&]:[border-top:0]" role="row">
            <span role="cell" class="tbl__name mi:flex mi:flex-wrap mi:items-baseline mi:gap-1.5">
              <code>{{ p.name }}</code>
              <small v-if="p.required" class="tbl__req mi:text-[11px] mi:font-semibold mi:text-orange-t">{{ t('explorer.required') }}</small>
            </span>
            <span role="cell" class="tbl__type"><code>{{ p.type }}</code></span>
            <span role="cell" class="tbl__def"><code v-if="p.default">{{ p.default }}</code><span v-else class="tbl__dash mi:text-label3">–</span></span>
            <span v-if="p.doc" role="cell" class="tbl__doc mi:min-[760px]:col-[2_/_-1] mi:text-[14px] mi:leading-normal mi:text-label2">{{ p.doc }}</span>
          </div>
        </div>
        <p v-else class="api__none mi:m-0 mi:text-[14px] mi:text-label3">{{ t('explorer.none') }}</p>
      </section>

      <section v-if="api.parts.length" class="parts mi:grid mi:gap-2.5 mi:mt-1" aria-labelledby="api-parts">
        <h2 id="api-parts" class="api__title mi:flex mi:items-baseline mi:gap-2 mi:mt-3 mi:mx-0 mi:mb-0 mi:text-[22px] mi:tracking-[-.02em]">{{ t('explorer.parts') }} <span>{{ api.parts.length }}</span></h2>
        <ul class="parts__list mi:grid mi:gap-2 mi:grid-cols-[repeat(auto-fill,_minmax(min(100%,_250px),_1fr))] mi:[list-style:none] mi:m-0 mi:p-0">
          <li v-for="p in api.parts" :key="p.name">
            <NuxtLink :to="localePath('/components/' + toSlug(p.name))" class="parts__link mi:grid mi:gap-0.5 mi:h-full mi:box-border mi:py-2.5 mi:px-3.5 mi:rounded-[14px] mi:bg-card mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:text-inherit mi:[text-decoration:none] mi:hover:shadow-[0_0_0_1px_var(--mi-p)]"><code>{{ p.name }}</code><span class="mi:[.parts__link_&]:[display:-webkit-box] mi:[.parts__link_&]:[-webkit-box-orient:vertical] mi:[.parts__link_&]:overflow-hidden">{{ p.summary }}</span></NuxtLink>
          </li>
        </ul>
      </section>

      <div class="api__pair mi:grid mi:gap-7 mi:min-[900px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)]">
        <section class="api mi:grid mi:gap-3.5 mi:min-w-0 mi:content-start" aria-labelledby="api-slots">
          <h2 id="api-slots" class="api__title mi:flex mi:items-baseline mi:gap-2 mi:mt-3 mi:mx-0 mi:mb-0 mi:text-[22px] mi:tracking-[-.02em]">{{ t('explorer.slots') }} <span>{{ api.slots.length }}</span></h2>
          <ul v-if="api.slots.length" class="list mi:grid mi:[list-style:none] mi:m-0 mi:p-0 mi:rounded-[18px] mi:bg-card mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:overflow-hidden">
            <li class="mi:[.list_&]:grid mi:[.list_&]:gap-1 mi:[.list_&]:py-3 mi:[.list_&]:px-4 mi:[.list_&]:border-t mi:[.list_&]:border-t-sep mi:[.list_&:first-child]:[border-top:0]" v-for="s in api.slots" :key="s.name">
              <code class="list__name mi:font-semibold mi:text-label">#{{ s.name }}</code>
              <code v-if="s.props" class="list__type mi:text-p-text mi:wrap-anywhere">{{ s.props }}</code>
              <span v-if="s.doc" class="list__doc mi:text-[14px] mi:text-label2">{{ s.doc }}</span>
            </li>
          </ul>
          <p v-else class="api__none mi:m-0 mi:text-[14px] mi:text-label3">{{ t('explorer.none') }}</p>
        </section>
        <section class="api mi:grid mi:gap-3.5 mi:min-w-0 mi:content-start" aria-labelledby="api-events">
          <h2 id="api-events" class="api__title mi:flex mi:items-baseline mi:gap-2 mi:mt-3 mi:mx-0 mi:mb-0 mi:text-[22px] mi:tracking-[-.02em]">{{ t('explorer.events') }} <span>{{ api.emits.length }}</span></h2>
          <ul v-if="api.emits.length" class="list mi:grid mi:[list-style:none] mi:m-0 mi:p-0 mi:rounded-[18px] mi:bg-card mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:overflow-hidden">
            <li class="mi:[.list_&]:grid mi:[.list_&]:gap-1 mi:[.list_&]:py-3 mi:[.list_&]:px-4 mi:[.list_&]:border-t mi:[.list_&]:border-t-sep mi:[.list_&:first-child]:[border-top:0]" v-for="e in api.emits" :key="e.name">
              <code class="list__name mi:font-semibold mi:text-label">@{{ e.name }}</code>
              <code v-if="e.type" class="list__type mi:text-p-text mi:wrap-anywhere">{{ e.type }}</code>
              <span v-if="e.doc" class="list__doc mi:text-[14px] mi:text-label2">{{ e.doc }}</span>
            </li>
          </ul>
          <p v-else class="api__none mi:m-0 mi:text-[14px] mi:text-label3">{{ t('explorer.none') }}</p>
        </section>
      </div>

      <section v-if="api.types.length" class="api mi:grid mi:gap-3.5 mi:min-w-0 mi:content-start" aria-labelledby="api-types">
        <h2 id="api-types" class="api__title mi:flex mi:items-baseline mi:gap-2 mi:mt-3 mi:mx-0 mi:mb-0 mi:text-[22px] mi:tracking-[-.02em]">{{ t('explorer.types') }}</h2>
        <SiteCode :file="api.path.split('/').pop() ?? ''" :text="api.types.join('\n')" :copy-label="t('start.copy')" :copied-label="t('start.copied')" plain class="api__code" />
      </section>

      <section v-if="api.exposed.length" class="api mi:grid mi:gap-3.5 mi:min-w-0 mi:content-start" aria-labelledby="api-exposed">
        <h2 id="api-exposed" class="api__title mi:flex mi:items-baseline mi:gap-2 mi:mt-3 mi:mx-0 mi:mb-0 mi:text-[22px] mi:tracking-[-.02em]">{{ t('explorer.exposed') }}</h2>
        <p class="api__chips mi:flex mi:flex-wrap mi:gap-1.5 mi:m-0"><code class="mi:[.api__chips_&]:py-[3px] mi:[.api__chips_&]:px-2 mi:[.api__chips_&]:rounded-[7px] mi:[.api__chips_&]:bg-fill4" v-for="x in api.exposed" :key="x">{{ x }}</code></p>
      </section>

      <p class="ai mi:flex mi:flex-wrap mi:items-center mi:gap-2 mi:m-0 mi:py-3.5 mi:px-4 mi:rounded-[14px] mi:bg-p-tint2 mi:text-[14px] mi:text-p-text">
        <MiIcon class="mi:[.ai_code&]:ml-auto" name="document" :size="16" />
        <a :href="`${useRuntimeConfig().app.baseURL}docs/api/${name}.md`" target="_blank" rel="noopener">{{ t('explorer.aiDoc') }}</a>
        <code class="mi:[.ai_code&]:ml-auto">docs/api/{{ name }}.md</code>
      </p>

      <nav class="pn mi:grid mi:grid-cols-[1fr_1fr] mi:gap-3 mi:pt-3" :aria-label="t('explorer.title')">
        <NuxtLink v-if="prev" :to="localePath('/components/' + toSlug(prev.name))" class="pn__link mi:grid mi:gap-0.5 mi:py-3.5 mi:px-4.5 mi:rounded-[16px] mi:bg-card mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:text-inherit mi:[text-decoration:none] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translate3d(0,_-2px,_0)] mi:motion-reduce:hover:transform-none">
          <small>{{ t('explorer.prev') }}</small><span>{{ prev.name.replace(/^Mi/, '') }}</span>
        </NuxtLink>
        <span v-else />
        <NuxtLink v-if="next" :to="localePath('/components/' + toSlug(next.name))" class="pn__link pn__link--next mi:grid mi:gap-0.5 mi:py-3.5 mi:px-4.5 mi:rounded-[16px] mi:bg-card mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:text-inherit mi:[text-decoration:none] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translate3d(0,_-2px,_0)] mi:text-right mi:motion-reduce:hover:transform-none">
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
// The slug is visitor input: only a component name may reach the API path.
if (!/^Mi[A-Za-z]+$/.test(name.value)) throw createError({ statusCode: 404, statusMessage: t('explorer.notFound'), fatal: true })
const { data: list } = await useFetch('/api/components', { query: { lang: locale } })
const { data: api, error } = await useFetch(() => `/api/components/${encodeURIComponent(name.value)}`, { query: { lang: locale } })
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

useSiteSeo(() => `${name.value.replace(/^Mi/, '')} · ${t('explorer.title')} · Mica`, () => api.value?.summary ? `${api.value.summary} ${t('explorer.seoTail')}` : t('explorer.lead'))
</script>

<style scoped>
.side__link:hover { color: var(--mi-label); background: var(--mi-fill4); }
.side__link.on { color: var(--mi-p-text); background: var(--mi-p-tint); font-weight: 600; }

.main { animation: cd-in var(--mi-dur-3) var(--mi-ease) backwards; }
.crumbs a { color: var(--mi-label2); }
.api__title span { font-size: 13px; font-weight: 600; color: var(--mi-label3); }
.api__chips code, .tbl code, .list code { font: 12.5px/1.5 ui-monospace, "SF Mono", Menlo, monospace; }
.tbl__name code { font-weight: 600; color: var(--mi-label); }
.tbl__type code { color: var(--mi-p-text); overflow-wrap: anywhere; }
.tbl__def code { color: var(--mi-s-text); overflow-wrap: anywhere; }
.api__code :deep(.code__pre) { white-space: pre-wrap; overflow-wrap: anywhere; }
.ai a { color: inherit; font-weight: 600; }
.ai code { font: 12px ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label2); }
.pn__link small { font-size: 12px; color: var(--mi-label3); }
.pn__link span { font-weight: 600; color: var(--mi-p-text); }
@keyframes cd-in { from { opacity: 0; transform: translate3d(0, 10px, 0); } }
@media (prefers-reduced-motion: reduce) { .main { animation: none; } }
.parts__link code { font: 600 13px/1.3 ui-monospace, "SF Mono", Menlo, monospace; }
.parts__link span { font-size: 12px; line-height: 1.4; color: var(--mi-label2); -webkit-line-clamp: 2; line-clamp: 2; }
</style>

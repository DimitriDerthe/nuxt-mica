<template>
  <footer class="ssf mi:@container mi:grid mi:content-start mi:gap-7 mi:py-6 mi:px-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:font-mi mi:text-label" aria-labelledby="ssf-title">
    <MiText id="ssf-title" variant="title3" as="h2" class="ssf__sr mi:absolute mi:w-px mi:h-px mi:[clip-path:inset(50%)]">Site footer</MiText>

    <!-- Tier 1: three ways to get help, before any link column. -->
    <ul class="ssf__doors mi:grid mi:gap-2.5 mi:@[620px]:grid-cols-3">
      <li v-for="d in doors" :key="d.title">
        <a href="#" class="ssf__door mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:p-3.5 mi:rounded-lg mi:bg-fill4" @click.prevent>
          <span class="ssf__door-icon mi:grid mi:place-items-center mi:w-10 mi:h-10 mi:rounded-md mi:bg-p-tint mi:text-p-text"><MiIcon :name="d.icon" :size="20" /></span>
          <span class="ssf__door-text mi:grid mi:min-w-0">
            <span class="ssf__door-title mi:text-[15px] mi:font-semibold">{{ d.title }}</span>
            <span class="ssf__door-sub mi:text-[13px] mi:text-label2">{{ d.sub }}</span>
          </span>
          <MiIcon name="arrow-right" :size="16" class="ssf__door-arrow mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" />
        </a>
      </li>
    </ul>

    <!-- Tier 2: link columns beside a live status panel scoped to the chosen region. -->
    <div class="ssf__mid mi:grid mi:gap-6 mi:pt-6 mi:border-t mi:border-t-sep mi:@[900px]:grid-cols-[minmax(0,_1.6fr)_minmax(280px,_1fr)]">
      <nav class="ssf__cols mi:grid mi:grid-cols-2 mi:gap-5 mi:@[620px]:grid-cols-3" aria-label="Footer">
        <div v-for="col in columns" :key="col.title" class="ssf__col mi:grid mi:content-start mi:gap-2.5">
          <MiText variant="footnote" weight="semibold" as="h3">{{ col.title }}</MiText>
          <ul>
            <li v-for="l in col.links" :key="l.label">
              <a href="#" @click.prevent>{{ l.label }}</a>
              <MiBadge v-if="l.tag" :label="l.tag" tone="secondary" />
            </li>
          </ul>
        </div>
      </nav>

      <section class="ssf__status mi:grid mi:content-start mi:gap-3 mi:p-4 mi:rounded-lg mi:border mi:border-sep" aria-labelledby="ssf-status-title">
        <div class="ssf__status-head mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
          <MiText id="ssf-status-title" variant="footnote" weight="semibold" as="h3">System status</MiText>
          <MiSegmented v-model="region" label="Region" :options="regions" />
        </div>
        <p class="ssf__pill mi:inline-flex mi:items-center mi:gap-2 mi:justify-self-start mi:m-0 mi:py-1.5 mi:px-3 mi:rounded-[999px] mi:text-[13px] mi:font-semibold" :class="'is-' + overall.tone" aria-live="polite">
          <span class="ssf__dot mi:w-2 mi:h-2 mi:flex-[none] mi:rounded-[50%] mi:bg-current" aria-hidden="true" />{{ overall.label }}
        </p>
        <MiCollapsible v-model:open="showServices" :title="showServices ? 'Hide services' : 'Show ' + services.length + ' services'">
          <ul class="ssf__services mi:grid mi:gap-2">
            <li class="mi:[.ssf__services_&]:grid-cols-[auto_minmax(0,_1fr)_auto]" v-for="s in services" :key="s.name">
              <span class="ssf__dot mi:w-2 mi:h-2 mi:flex-[none] mi:rounded-[50%] mi:bg-current" :class="'is-' + s.state" aria-hidden="true" />
              <span class="ssf__svc">{{ s.name }}</span>
              <span class="ssf__uptime mi:text-[13px] mi:text-label2 mi:tabular-nums">{{ s.uptime }}</span>
            </li>
          </ul>
        </MiCollapsible>
      </section>
    </div>

    <!-- Tier 3: legal bar. -->
    <div class="ssf__legal mi:flex mi:flex-wrap mi:items-center mi:gap-y-2.5 mi:gap-x-4 mi:pt-5 mi:border-t mi:border-t-sep">
      <MiLogo :size="20" />
      <MiText variant="caption" tone="label2">© 2026 Mica Labs SAS · Paris</MiText>
      <ul class="ssf__legal-links mi:flex mi:flex-wrap mi:gap-3.5 mi:text-[13px] mi:text-label2">
        <li v-for="l in legal" :key="l"><a href="#" @click.prevent>{{ l }}</a></li>
      </ul>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type IconName = 'document' | 'people' | 'chat'
type ServiceState = 'ok' | 'degraded' | 'down'
interface Door { icon: IconName, title: string, sub: string }
interface Column { title: string, links: { label: string, tag?: string }[] }
interface Service { name: string, state: ServiceState, uptime: string }
type Region = 'eu' | 'us' | 'ap'

const doors: Door[] = [
  { icon: 'document', title: 'Read the docs', sub: 'Guides, API reference and recipes' },
  { icon: 'people', title: 'Ask the community', sub: '14k builders, median reply in 2 h' },
  { icon: 'chat', title: 'Talk to support', sub: 'Mon to Fri, 8:00 to 20:00 CET' }
]

const columns: Column[] = [
  { title: 'Product', links: [{ label: 'Components' }, { label: 'Blocks', tag: 'New' }, { label: 'Themes' }, { label: 'Pricing' }] },
  { title: 'Developers', links: [{ label: 'Quick start' }, { label: 'Changelog' }, { label: 'Migration guide', tag: 'v4' }, { label: 'Open source' }] },
  { title: 'Company', links: [{ label: 'About' }, { label: 'Careers' }, { label: 'Press kit' }, { label: 'Contact' }] }
]

const regions = [{ value: 'eu', label: 'EU' }, { value: 'us', label: 'US' }, { value: 'ap', label: 'APAC' }]
const region = ref<string | number | null>('eu')
const showServices = ref(false)

// Sample status per region; swap for your status page feed.
const status: Record<Region, Service[]> = {
  eu: [
    { name: 'Dashboard', state: 'ok', uptime: '99.99%' },
    { name: 'REST API', state: 'ok', uptime: '99.98%' },
    { name: 'Webhooks', state: 'ok', uptime: '99.95%' },
    { name: 'CDN', state: 'ok', uptime: '100%' }
  ],
  us: [
    { name: 'Dashboard', state: 'ok', uptime: '99.99%' },
    { name: 'REST API', state: 'ok', uptime: '99.97%' },
    { name: 'Webhooks', state: 'degraded', uptime: '99.62%' },
    { name: 'CDN', state: 'ok', uptime: '99.99%' }
  ],
  ap: [
    { name: 'Dashboard', state: 'ok', uptime: '99.98%' },
    { name: 'REST API', state: 'down', uptime: '98.71%' },
    { name: 'Webhooks', state: 'degraded', uptime: '99.40%' },
    { name: 'CDN', state: 'ok', uptime: '100%' }
  ]
}

const services = computed<Service[]>(() => {
  const r = region.value
  return status[r === 'us' || r === 'ap' ? r : 'eu']
})
const overall = computed<{ tone: ServiceState, label: string }>(() => {
  const list = services.value
  if (list.some(s => s.state === 'down')) return { tone: 'down', label: 'Partial outage' }
  const slow = list.filter(s => s.state === 'degraded').length
  return slow ? { tone: 'degraded', label: `${slow} service degraded` } : { tone: 'ok', label: 'All systems operational' }
})

const legal = ['Terms', 'Privacy', 'Cookies', 'Security']
</script>

<style scoped>
.ssf__sr { overflow: hidden; white-space: nowrap; }
a { color: inherit; text-decoration: none; }
a:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; border-radius: 4px; }
ul { margin: 0; padding: 0; list-style: none; }
.ssf__door:hover .ssf__door-arrow { transform: translateX(3px); }
.ssf__door-arrow { color: var(--mi-label3); }
.ssf__col h3 { margin: 0; }
.ssf__col ul { display: grid; gap: 8px; }
.ssf__col li { display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--mi-label2); }
.ssf__col a:hover { color: var(--mi-label); }
.ssf__status-head h3 { margin: 0; }
.ssf__pill.is-ok { background: color-mix(in srgb, var(--mi-green) 14%, transparent); color: var(--mi-green-t); }
.ssf__pill.is-degraded { background: color-mix(in srgb, var(--mi-orange) 16%, transparent); color: var(--mi-orange-t); }
.ssf__pill.is-down { background: color-mix(in srgb, var(--mi-red) 14%, transparent); color: var(--mi-red-t); }
.ssf__dot.is-ok { background: var(--mi-green); }
.ssf__dot.is-degraded { background: var(--mi-orange); }
.ssf__dot.is-down { background: var(--mi-red); }
.ssf__services { padding-top: 8px; }
.ssf__services li { display: grid; align-items: center; gap: 10px; font-size: 14px; }
.ssf__legal-links a:hover { color: var(--mi-label); }

@container (min-width: 620px) {
  .ssf__legal-links { margin-inline-start: auto; }
}
</style>

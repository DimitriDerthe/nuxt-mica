<template>
  <footer class="mi:@container mi:grid mi:content-start mi:gap-7 mi:py-6 mi:px-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:font-mi mi:text-label" aria-labelledby="ssf-title">
    <MiText id="ssf-title" variant="title3" as="h2" class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:whitespace-nowrap mi:[clip-path:inset(50%)]">Site footer</MiText>

    <!-- Tier 1: three ways to get help, before any link column. -->
    <ul class="mi:m-0 mi:p-0 mi:[list-style:none] mi:grid mi:gap-2.5 mi:@[620px]:grid-cols-3">
      <li v-for="d in doors" :key="d.title">
        <a href="#" class="mi:group mi:text-inherit mi:[text-decoration:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px] mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:p-3.5 mi:rounded-lg mi:bg-fill4" @click.prevent>
          <span class="mi:grid mi:place-items-center mi:w-10 mi:h-10 mi:rounded-md mi:bg-p-tint mi:text-p-text"><MiIcon :name="d.icon" :size="20" /></span>
          <span class="mi:grid mi:min-w-0">
            <span class="mi:text-[15px] mi:font-semibold">{{ d.title }}</span>
            <span class="mi:text-[13px] mi:text-label2">{{ d.sub }}</span>
          </span>
          <MiIcon name="arrow-right" :size="16" class="mi:text-label3 mi:group-hover:transform-[translateX(3px)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" />
        </a>
      </li>
    </ul>

    <!-- Tier 2: link columns beside a live status panel scoped to the chosen region. -->
    <div class="mi:grid mi:gap-6 mi:pt-6 mi:border-t mi:border-t-sep mi:@[900px]:grid-cols-[minmax(0,_1.6fr)_minmax(280px,_1fr)]">
      <nav class="mi:grid mi:grid-cols-2 mi:gap-5 mi:@[620px]:grid-cols-3" aria-label="Footer">
        <div v-for="col in columns" :key="col.title" class="mi:grid mi:content-start mi:gap-2.5">
          <MiText variant="footnote" weight="semibold" as="h3" class="mi:m-0">{{ col.title }}</MiText>
          <ul class="mi:m-0 mi:p-0 mi:[list-style:none] mi:grid mi:gap-2">
            <li v-for="l in col.links" :key="l.label" class="mi:flex mi:items-center mi:gap-1.5 mi:text-[14px] mi:text-label2">
              <a href="#" class="mi:text-inherit mi:[text-decoration:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px] mi:hover:text-label" @click.prevent>{{ l.label }}</a>
              <MiBadge v-if="l.tag" :label="l.tag" tone="secondary" />
            </li>
          </ul>
        </div>
      </nav>

      <section class="mi:grid mi:content-start mi:gap-3 mi:p-4 mi:rounded-lg mi:border mi:border-sep" aria-labelledby="ssf-status-title">
        <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
          <MiText id="ssf-status-title" variant="footnote" weight="semibold" as="h3" class="mi:m-0">System status</MiText>
          <MiSegmented v-model="region" label="Region" :options="regions" />
        </div>
        <p class="mi:inline-flex mi:items-center mi:gap-2 mi:justify-self-start mi:m-0 mi:py-1.5 mi:px-3 mi:rounded-[999px] mi:text-[13px] mi:font-semibold" :class="{ ok: 'mi:bg-green/14 mi:text-green-t', degraded: 'mi:bg-orange/16 mi:text-orange-t', down: 'mi:bg-red/14 mi:text-red-t' }[overall.tone]" aria-live="polite">
          <span class="mi:w-2 mi:h-2 mi:flex-[none] mi:rounded-[50%] mi:bg-current" aria-hidden="true" />{{ overall.label }}
        </p>
        <MiCollapsible v-model:open="showServices" :title="showServices ? 'Hide services' : 'Show ' + services.length + ' services'">
          <ul class="mi:m-0 mi:p-0 mi:[list-style:none] mi:pt-2 mi:grid mi:gap-2">
            <li class="mi:grid mi:items-center mi:gap-2.5 mi:text-[14px] mi:grid-cols-[auto_minmax(0,_1fr)_auto]" v-for="s in services" :key="s.name">
              <span class="mi:w-2 mi:h-2 mi:flex-[none] mi:rounded-[50%]" :class="{ ok: 'mi:bg-green', degraded: 'mi:bg-orange', down: 'mi:bg-red' }[s.state]" aria-hidden="true" />
              <span>{{ s.name }}</span>
              <span class="mi:text-[13px] mi:text-label2 mi:tabular-nums">{{ s.uptime }}</span>
            </li>
          </ul>
        </MiCollapsible>
      </section>
    </div>

    <!-- Tier 3: legal bar. -->
    <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-2.5 mi:gap-x-4 mi:pt-5 mi:border-t mi:border-t-sep">
      <MiLogo :size="20" />
      <MiText variant="caption" tone="label2">© 2026 Mica Labs SAS · Paris</MiText>
      <ul class="mi:m-0 mi:p-0 mi:[list-style:none] mi:@[620px]:ms-auto mi:flex mi:flex-wrap mi:gap-3.5 mi:text-[13px] mi:text-label2">
        <li v-for="l in legal" :key="l"><a href="#" class="mi:text-inherit mi:[text-decoration:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px] mi:hover:text-label" @click.prevent>{{ l }}</a></li>
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


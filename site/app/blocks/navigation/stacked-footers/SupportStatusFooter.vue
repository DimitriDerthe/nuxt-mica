<template>
  <footer class="ssf" aria-labelledby="ssf-title">
    <MiText id="ssf-title" variant="title3" as="h2" class="ssf__sr">Site footer</MiText>

    <!-- Tier 1: three ways to get help, before any link column. -->
    <ul class="ssf__doors">
      <li v-for="d in doors" :key="d.title">
        <a href="#" class="ssf__door" @click.prevent>
          <span class="ssf__door-icon"><MiIcon :name="d.icon" :size="20" /></span>
          <span class="ssf__door-text">
            <span class="ssf__door-title">{{ d.title }}</span>
            <span class="ssf__door-sub">{{ d.sub }}</span>
          </span>
          <MiIcon name="arrow-right" :size="16" class="ssf__door-arrow" />
        </a>
      </li>
    </ul>

    <!-- Tier 2: link columns beside a live status panel scoped to the chosen region. -->
    <div class="ssf__mid">
      <nav class="ssf__cols" aria-label="Footer">
        <div v-for="col in columns" :key="col.title" class="ssf__col">
          <MiText variant="footnote" weight="semibold" as="h3">{{ col.title }}</MiText>
          <ul>
            <li v-for="l in col.links" :key="l.label">
              <a href="#" @click.prevent>{{ l.label }}</a>
              <MiBadge v-if="l.tag" :label="l.tag" tone="secondary" />
            </li>
          </ul>
        </div>
      </nav>

      <section class="ssf__status" aria-labelledby="ssf-status-title">
        <div class="ssf__status-head">
          <MiText id="ssf-status-title" variant="footnote" weight="semibold" as="h3">System status</MiText>
          <MiSegmented v-model="region" label="Region" :options="regions" />
        </div>
        <p class="ssf__pill" :class="'is-' + overall.tone" aria-live="polite">
          <span class="ssf__dot" aria-hidden="true" />{{ overall.label }}
        </p>
        <MiCollapsible v-model:open="showServices" :title="showServices ? 'Hide services' : 'Show ' + services.length + ' services'">
          <ul class="ssf__services">
            <li v-for="s in services" :key="s.name">
              <span class="ssf__dot" :class="'is-' + s.state" aria-hidden="true" />
              <span class="ssf__svc">{{ s.name }}</span>
              <span class="ssf__uptime">{{ s.uptime }}</span>
            </li>
          </ul>
        </MiCollapsible>
      </section>
    </div>

    <!-- Tier 3: legal bar. -->
    <div class="ssf__legal">
      <MiLogo :size="20" />
      <MiText variant="caption" tone="label2">© 2026 Mica Labs SAS · Paris</MiText>
      <ul class="ssf__legal-links">
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
.ssf { container-type: inline-size; display: grid; align-content: start; gap: 28px; padding: 24px 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); }
.ssf__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
a { color: inherit; text-decoration: none; }
a:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; border-radius: 4px; }
ul { margin: 0; padding: 0; list-style: none; }

.ssf__doors { display: grid; gap: 10px; }
.ssf__door { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.ssf__door:hover .ssf__door-arrow { transform: translateX(3px); }
.ssf__door-icon { display: grid; place-items: center; width: 40px; height: 40px; border-radius: var(--mi-radius-m); background: var(--mi-p-tint); color: var(--mi-p-text); }
.ssf__door-text { display: grid; min-width: 0; }
.ssf__door-title { font-size: 15px; font-weight: 600; }
.ssf__door-sub { font-size: 13px; color: var(--mi-label2); }
.ssf__door-arrow { color: var(--mi-label3); transition: transform var(--mi-dur-2) var(--mi-ease); }

.ssf__mid { display: grid; gap: 24px; padding-top: 24px; border-top: 1px solid var(--mi-sep); }
.ssf__cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.ssf__col { display: grid; align-content: start; gap: 10px; }
.ssf__col h3 { margin: 0; }
.ssf__col ul { display: grid; gap: 8px; }
.ssf__col li { display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--mi-label2); }
.ssf__col a:hover { color: var(--mi-label); }

.ssf__status { display: grid; align-content: start; gap: 12px; padding: 16px; border-radius: var(--mi-radius-l); border: 1px solid var(--mi-sep); }
.ssf__status-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.ssf__status-head h3 { margin: 0; }
.ssf__pill { display: inline-flex; align-items: center; gap: 8px; justify-self: start; margin: 0; padding: 6px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; }
.ssf__pill.is-ok { background: color-mix(in srgb, var(--mi-green) 14%, transparent); color: var(--mi-green-t); }
.ssf__pill.is-degraded { background: color-mix(in srgb, var(--mi-orange) 16%, transparent); color: var(--mi-orange-t); }
.ssf__pill.is-down { background: color-mix(in srgb, var(--mi-red) 14%, transparent); color: var(--mi-red-t); }
.ssf__dot { width: 8px; height: 8px; flex: none; border-radius: 50%; background: currentColor; }
.ssf__dot.is-ok { background: var(--mi-green); }
.ssf__dot.is-degraded { background: var(--mi-orange); }
.ssf__dot.is-down { background: var(--mi-red); }
.ssf__services { display: grid; gap: 8px; padding-top: 8px; }
.ssf__services li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px; font-size: 14px; }
.ssf__uptime { font-size: 13px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }

.ssf__legal { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; padding-top: 20px; border-top: 1px solid var(--mi-sep); }
.ssf__legal-links { display: flex; flex-wrap: wrap; gap: 14px; font-size: 13px; color: var(--mi-label2); }
.ssf__legal-links a:hover { color: var(--mi-label); }

@container (min-width: 620px) {
  .ssf__doors { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .ssf__cols { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .ssf__legal-links { margin-inline-start: auto; }
}
@container (min-width: 900px) {
  .ssf__mid { grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr); }
}
</style>

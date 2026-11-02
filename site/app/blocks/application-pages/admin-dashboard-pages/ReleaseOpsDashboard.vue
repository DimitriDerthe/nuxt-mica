<template>
  <section class="rod" aria-labelledby="rod-title">
    <div class="rod__in">
      <!-- Shell: a path bar and a status line. Everything else is the page itself. -->
      <header class="rod__top">
        <div class="rod__crumbs">
          <span class="rod__glyph" aria-hidden="true"><i /><i /></span>
          <MiBreadcrumb :items="[{ label: 'Fenwick Freight', href: '#' }, { label: 'Platform', href: '#' }, { label: 'Releases' }]" aria-label="Location" />
        </div>
        <button type="button" class="rod__cmd">
          <MiIcon name="search" :size="15" />
          <span>Find a service, build or incident</span>
          <MiKbd>⌘K</MiKbd>
        </button>
      </header>

      <div class="rod__page">
        <div class="rod__head">
          <div>
            <MiText id="rod-title" as="h2" variant="title2" weight="bold">Release operations</MiText>
            <p class="rod__status">
              <span class="rod__status-dot" aria-hidden="true" />
              <span><strong>1 service degraded</strong> · 4 of 5 healthy · next deploy window 15:00 UTC</span>
            </p>
          </div>
          <MiButton size="small">
            <template #leading><MiIcon name="arrow-up" :size="15" /></template>
            Promote v2.49.0-rc.1
          </MiButton>
        </div>

        <!-- Deployment timeline: one lane per environment, a build's promotion path drawn across lanes. -->
        <article class="rod__card rod__deploys" aria-labelledby="rod-deploys">
          <div class="rod__card-head">
            <div>
              <MiText id="rod-deploys" as="h3" variant="headline" weight="semibold">Deployments, last 24 hours</MiText>
              <MiText variant="caption" tone="label2">Select a deploy to trace its build through every environment</MiText>
            </div>
            <ul class="rod__legend" aria-label="Deploy status">
              <li v-for="(l, k) in statusLabel" :key="k"><i :class="'is-' + k" />{{ l }}</li>
            </ul>
          </div>

          <div class="rod__scroll">
            <div class="rod__timeline">
              <div class="rod__lane-names" aria-hidden="true">
                <span v-for="e in envs" :key="e.id">{{ e.label }}</span>
              </div>
              <div class="rod__track">
                <span v-for="h in hourTicks" :key="h.label" class="rod__tick" :style="{ left: x(h.ago) }"><em>{{ h.label }}</em></span>
                <span class="rod__now" :style="{ left: x(0) }"><em>Now</em></span>
                <div v-for="e in envs" :key="e.id" class="rod__lane" />
                <svg class="rod__path" viewBox="0 0 100 3" preserveAspectRatio="none" aria-hidden="true">
                  <polyline :points="pathPoints" vector-effect="non-scaling-stroke" />
                </svg>
                <button
                  v-for="d in deploys" :key="d.env + d.build" type="button" class="rod__dot"
                  :class="['is-' + d.status, { 'is-dim': selected !== d.build, 'is-on': selected === d.build }]"
                  :style="{ left: x(d.ago), top: `${(envIndex(d.env) + 0.5) / envs.length * 100}%` }"
                  :aria-pressed="selected === d.build"
                  :aria-label="`${d.build} to ${envLabel(d.env)}, ${statusLabel[d.status]}, ${ago(d.ago)}`"
                  @click="selected = d.build"
                />
              </div>
            </div>
          </div>

          <div class="rod__build" aria-live="polite">
            <div class="rod__build-id">
              <MiAvatar :name="build.author" size="sm" tone="auto" decorative />
              <div>
                <MiText as="h4" variant="subheadline" weight="semibold" tabular>{{ build.version }} <span class="rod__sha">{{ build.sha }}</span></MiText>
                <MiText variant="caption" tone="label2">{{ build.author }} · {{ build.summary }}</MiText>
              </div>
            </div>
            <ol class="rod__hops" aria-label="Promotion path">
              <li v-for="d in buildHops" :key="d.env" :class="'is-' + d.status">
                <span>{{ envLabel(d.env) }}</span>
                <strong>{{ clockAt(d.ago) }}</strong>
                <em>{{ statusLabel[d.status] }}</em>
              </li>
            </ol>
          </div>
        </article>

        <div class="rod__row">
          <article class="rod__card" aria-labelledby="rod-uptime">
            <div class="rod__card-head">
              <div>
                <MiText id="rod-uptime" as="h3" variant="headline" weight="semibold">Uptime, 90 days</MiText>
                <MiText variant="caption" tone="label2" tabular>{{ hover || 'Hover a day for details' }}</MiText>
              </div>
            </div>
            <ul class="rod__services">
              <li v-for="s in services" :key="s.name" :aria-label="`${s.name}: ${s.uptime} uptime, ${s.incidents} incidents in 90 days`">
                <div class="rod__svc-head">
                  <span class="rod__svc-name">{{ s.name }}</span>
                  <span class="rod__svc-pct" :class="{ 'is-low': parseFloat(s.uptime) < 99.9 }">{{ s.uptime }}</span>
                </div>
                <div class="rod__cells" aria-hidden="true">
                  <span
                    v-for="(c, i) in s.days" :key="i" :class="'is-' + c"
                    @mouseenter="hover = `${dayLabel(i)} · ${s.name} · ${c === 'ok' ? 'no incidents' : c === 'warn' ? 'degraded performance' : 'partial outage'}`"
                    @mouseleave="hover = ''"
                  />
                </div>
              </li>
            </ul>
            <div class="rod__axis" aria-hidden="true"><span>Aug 5</span><span>Today</span></div>
          </article>

          <div class="rod__stack">
            <article class="rod__card" aria-labelledby="rod-inc">
              <div class="rod__card-head">
                <MiText id="rod-inc" as="h3" variant="headline" weight="semibold">Open incidents</MiText>
                <MiTextLink href="#">History</MiTextLink>
              </div>
              <ul class="rod__incidents">
                <li v-for="i in incidents" :key="i.id">
                  <span class="rod__sev" :class="'is-' + i.sev">SEV{{ i.sev }}</span>
                  <div class="rod__inc-body">
                    <MiText variant="footnote" weight="semibold">{{ i.title }}</MiText>
                    <MiText variant="caption" tone="label2" tabular>{{ i.id }} · {{ i.service }} · {{ i.state }}</MiText>
                  </div>
                  <div class="rod__inc-time">
                    <strong>{{ i.open }}</strong>
                    <MiAvatar :name="i.lead" size="xs" tone="auto" />
                  </div>
                </li>
              </ul>
            </article>

            <article class="rod__card rod__oncall" aria-labelledby="rod-oncall">
              <div class="rod__card-head">
                <MiText id="rod-oncall" as="h3" variant="headline" weight="semibold">On call</MiText>
                <MiText variant="caption" tone="label2">Platform rotation</MiText>
              </div>
              <div class="rod__primary">
                <MiAvatar name="Ruth Asante" size="md" tone="auto" decorative />
                <div class="rod__primary-text">
                  <MiText variant="subheadline" weight="semibold">Ruth Asante</MiText>
                  <MiText variant="caption" tone="label2">Primary · Accra, 13:40 local</MiText>
                </div>
                <MiButton variant="tinted" size="small" :disabled="paged" @click="paged = true">{{ paged ? 'Paged' : 'Page' }}</MiButton>
              </div>
              <div class="rod__shift" role="meter" aria-label="Shift progress" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100" aria-valuetext="62%, hands over Monday 09:00">
                <span class="rod__shift-track"><i /></span>
                <MiText variant="caption" tone="label2" tabular>62% of shift done · hands over to Kenji Watanabe, Mon 09:00</MiText>
              </div>
              <MiText variant="caption" tone="label2">Escalates to Dalia Ferreira after 15 min without acknowledgement.</MiText>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Env = 'preview' | 'staging' | 'production'
type Status = 'ok' | 'failed' | 'rolledback' | 'running'
interface Deploy { build: string, env: Env, ago: number, status: Status }

const envs = [{ id: 'preview' as const, label: 'Preview' }, { id: 'staging' as const, label: 'Staging' }, { id: 'production' as const, label: 'Production' }]
const envIndex = (e: Env) => envs.findIndex(v => v.id === e)
const envLabel = (e: Env) => envs[envIndex(e)]!.label
const statusLabel: Record<Status, string> = { ok: 'Succeeded', failed: 'Failed', rolledback: 'Rolled back', running: 'In progress' }

// `ago` is hours before now (13:40 UTC); sample data.
const NOW = 13 + 40 / 60
const deploys: Deploy[] = [
  { build: 'v2.47.3', env: 'preview', ago: 22.5, status: 'ok' },
  { build: 'v2.47.3', env: 'staging', ago: 20.8, status: 'ok' },
  { build: 'v2.47.3', env: 'production', ago: 17.2, status: 'ok' },
  { build: 'pr-1182', env: 'preview', ago: 15.1, status: 'failed' },
  { build: 'v2.48.0', env: 'preview', ago: 12.3, status: 'ok' },
  { build: 'v2.48.0', env: 'staging', ago: 10.6, status: 'ok' },
  { build: 'v2.48.0', env: 'production', ago: 7.1, status: 'rolledback' },
  { build: 'pr-1190', env: 'preview', ago: 8.4, status: 'ok' },
  { build: 'v2.48.1', env: 'preview', ago: 5.6, status: 'ok' },
  { build: 'v2.48.1', env: 'staging', ago: 4.1, status: 'ok' },
  { build: 'v2.48.1', env: 'production', ago: 1.3, status: 'ok' },
  { build: 'v2.49.0-rc.1', env: 'preview', ago: 0.5, status: 'running' }
]
const builds: Record<string, { author: string, sha: string, summary: string }> = {
  'v2.47.3': { author: 'Tomasz Wójcik', sha: '9c41e2a', summary: 'Rate-limit headers on the public API' },
  'pr-1182': { author: 'Amara Nwosu', sha: '3fd07b1', summary: 'Preview only: migration failed on seed data' },
  'v2.48.0': { author: 'Lucas Ferreira', sha: 'b7a22c9', summary: 'New label printer queue, rolled back for p95 latency' },
  'pr-1190': { author: 'Hye-jin Park', sha: '60e9d14', summary: 'Preview only: tracking page redesign' },
  'v2.48.1': { author: 'Lucas Ferreira', sha: 'e1c8f30', summary: 'Label printer queue with batched writes' },
  'v2.49.0-rc.1': { author: 'Ruth Asante', sha: 'a4d5b77', summary: 'Carrier webhooks retry with backoff' }
}

const selected = ref('v2.48.0')
const build = computed(() => ({ version: selected.value, ...builds[selected.value]! }))
const buildHops = computed(() => deploys.filter(d => d.build === selected.value).sort((a, b) => b.ago - a.ago))
const x = (ago: number) => `${((24 - ago) / 24) * 100}%`
const pathPoints = computed(() => buildHops.value.map(d => `${((24 - d.ago) / 24) * 100},${envIndex(d.env) + 0.5}`).join(' '))
const ago = (h: number) => (h < 1 ? `${Math.round(h * 60)} minutes ago` : `${Math.round(h)} hours ago`)
function clockAt(agoH: number) {
  const t = (NOW - agoH + 24) % 24
  return `${String(Math.floor(t)).padStart(2, '0')}:${String(Math.round((t % 1) * 60) % 60).padStart(2, '0')}`
}
const hourTicks = [20, 16, 12, 8, 4].map(a => ({ ago: a, label: clockAt(a).slice(0, 2) + ':00' })).map(t => ({ ...t, ago: t.ago + 40 / 60 }))

// 90 daily cells per service, oldest first. Most days are clean; the exceptions are listed by index.
function days(warn: number[], down: number[] = []) {
  return Array.from({ length: 90 }, (_, i) => (down.includes(i) ? 'down' : warn.includes(i) ? 'warn' : 'ok'))
}
const services = [
  { name: 'api-gateway', uptime: '99.98%', incidents: 2, days: days([23, 71]) },
  { name: 'checkout', uptime: '99.91%', incidents: 3, days: days([12, 64], [41]) },
  { name: 'tracking', uptime: '99.99%', incidents: 1, days: days([88]) },
  { name: 'auth', uptime: '100%', incidents: 0, days: days([]) },
  { name: 'carrier-webhooks', uptime: '99.62%', incidents: 5, days: days([30, 31, 77, 88], [89]) }
]
const hover = ref('')
const START = Date.UTC(2026, 7, 5)
const dayLabel = (i: number) => new Date(START + i * 864e5).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })

const incidents = [
  { id: 'INC-2291', sev: 2, title: 'Carrier webhooks delayed for EU tenants', service: 'carrier-webhooks', state: 'Mitigating', open: '1h 12m', lead: 'Ruth Asante' },
  { id: 'INC-2290', sev: 3, title: 'Elevated 502s on tracking search', service: 'tracking', state: 'Monitoring', open: '3h 40m', lead: 'Kenji Watanabe' }
]
const paged = ref(false)
</script>

<style scoped>
.rod { container-type: inline-size; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.rod__in { display: grid; align-content: start; min-height: 100%; }

/* Path bar */
.rod__top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 16px; padding: 12px 16px; background: var(--mi-card); border-bottom: 1px solid var(--mi-sep); }
.rod__crumbs { display: flex; align-items: center; gap: 10px; min-width: 0; }
.rod__glyph { position: relative; flex: none; width: 26px; height: 26px; border-radius: 8px; background: var(--mi-label); }
.rod__glyph i { position: absolute; left: 6px; right: 6px; height: 3px; border-radius: 2px; background: var(--mi-card); }
.rod__glyph i:first-child { top: 8px; right: 10px; }
.rod__glyph i:last-child { bottom: 8px; left: 10px; background: var(--mi-p); }
.rod__cmd { display: none; align-items: center; gap: 8px; width: 300px; height: 32px; padding: 0 6px 0 10px; border: 1px solid var(--mi-sep); border-radius: 9px; background: var(--mi-fill4); color: var(--mi-label3); font: inherit; font-size: 13px; cursor: pointer; transition: transform var(--mi-dur-2) var(--mi-ease); }
.rod__cmd span { flex: 1; text-align: start; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rod__cmd:hover { color: var(--mi-label2); }
.rod__cmd:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

.rod__page { display: grid; gap: 16px; padding: 20px 16px 24px; min-width: 0; }
.rod__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.rod__status { display: flex; align-items: baseline; gap: 8px; margin: 4px 0 0; font-size: 13px; color: var(--mi-label2); }
.rod__status strong { font-weight: 600; color: var(--mi-orange-t); }
.rod__status-dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--mi-orange); transform: translateY(-1px); box-shadow: 0 0 0 3px color-mix(in srgb, var(--mi-orange) 20%, transparent); }

.rod__card { display: grid; align-content: start; gap: 14px; min-width: 0; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.rod__card-head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 8px 16px; }

/* Deploy timeline */
.rod__legend { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 0; padding: 0; list-style: none; font-size: 12px; color: var(--mi-label2); }
.rod__legend li { display: inline-flex; align-items: center; gap: 6px; }
.rod__legend i { width: 8px; height: 8px; border-radius: 50%; }
.rod__legend .is-ok, .rod__dot.is-ok { background: var(--mi-green); }
.rod__legend .is-failed, .rod__dot.is-failed { background: var(--mi-red); }
.rod__legend .is-rolledback, .rod__dot.is-rolledback { background: var(--mi-orange); }
.rod__legend .is-running, .rod__dot.is-running { background: var(--mi-p); }
.rod__scroll { overflow-x: auto; margin-inline: -18px; padding: 0 18px; scrollbar-width: thin; }
.rod__timeline { display: grid; grid-template-columns: 82px minmax(0, 1fr); min-width: 600px; padding: 0 10px 26px 0; }
.rod__lane-names { display: grid; grid-auto-rows: 44px; }
.rod__lane-names span { display: flex; align-items: center; font-size: 12.5px; font-weight: 600; color: var(--mi-label2); }
.rod__track { position: relative; display: grid; grid-auto-rows: 44px; }
.rod__lane { border-top: 1px solid var(--mi-sep); }
.rod__lane:nth-of-type(odd) { background: color-mix(in srgb, var(--mi-fill4) 60%, transparent); }
.rod__lane:last-of-type { border-bottom: 1px solid var(--mi-sep); }
.rod__tick, .rod__now { position: absolute; top: 0; bottom: 0; width: 0; border-left: 1px dashed var(--mi-sep); pointer-events: none; }
.rod__now { border-left: 1.5px solid var(--mi-p); }
.rod__tick em, .rod__now em { position: absolute; bottom: -22px; font-size: 11px; font-style: normal; color: var(--mi-label3); white-space: nowrap; transform: translateX(-50%); font-variant-numeric: tabular-nums; }
.rod__now em { color: var(--mi-p-text); font-weight: 600; }
.rod__path { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.rod__path polyline { fill: none; stroke: var(--mi-label); stroke-width: 1.5; stroke-dasharray: 3 3; opacity: .55; }
.rod__dot { position: absolute; width: 14px; height: 14px; margin: -7px 0 0 -7px; padding: 0; border: 0; border-radius: 50%; box-shadow: 0 0 0 3px var(--mi-card); cursor: pointer; transition: transform var(--mi-dur-2) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease); }
.rod__dot.is-dim { opacity: .38; }
.rod__dot:hover { opacity: 1; transform: scale(1.25); }
.rod__dot.is-on { transform: scale(1.3); }
.rod__dot.is-running::after { content: ""; position: absolute; inset: -5px; border-radius: 50%; border: 1.5px solid var(--mi-p); animation: rod-ping 1.8s var(--mi-ease) infinite; }
.rod__dot:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 4px; }
@keyframes rod-ping { from { transform: scale(.6); opacity: 1; } to { transform: scale(1.4); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .rod__dot.is-running::after { animation: none; } }

.rod__build { display: grid; gap: 14px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.rod__build-id { display: flex; align-items: center; gap: 12px; min-width: 0; }
.rod__sha { margin-left: 4px; padding: 1px 6px; border-radius: 5px; font-size: 11.5px; font-weight: 500; color: var(--mi-label2); background: var(--mi-fill3); }
.rod__hops { display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: 6px; margin: 0; padding: 0; list-style: none; counter-reset: hop; }
.rod__hops li { position: relative; display: grid; gap: 1px; min-width: 0; padding: 8px 10px; border-radius: var(--mi-radius-m); background: var(--mi-card); font-size: 12px; color: var(--mi-label2); }
.rod__hops strong { font-size: 15px; font-weight: 650; color: var(--mi-label); font-variant-numeric: tabular-nums; }
.rod__hops em { font-style: normal; font-weight: 600; }
.rod__hops .is-ok em { color: var(--mi-green-t); }
.rod__hops .is-failed em { color: var(--mi-red-t); }
.rod__hops .is-rolledback em { color: var(--mi-orange-t); }
.rod__hops .is-running em { color: var(--mi-p-text); }

/* Uptime */
.rod__row { display: grid; gap: 16px; min-width: 0; }
.rod__stack { display: grid; gap: 16px; align-content: start; min-width: 0; }
.rod__services { display: grid; gap: 14px; margin: 0; padding: 0; list-style: none; }
.rod__svc-head { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 6px; font-size: 13px; }
.rod__svc-name { font-weight: 600; }
.rod__svc-pct { font-weight: 600; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.rod__svc-pct.is-low { color: var(--mi-orange-t); }
.rod__cells { display: grid; grid-template-columns: repeat(90, minmax(0, 1fr)); gap: 1px; height: 24px; }
.rod__cells span { border-radius: 1.5px; background: color-mix(in srgb, var(--mi-green) 42%, var(--mi-card)); transition: transform var(--mi-dur-1) var(--mi-ease); }
.rod__cells span.is-warn { background: var(--mi-orange); }
.rod__cells span.is-down { background: var(--mi-red); }
.rod__cells span:hover { transform: scaleY(1.25); }
.rod__axis { display: flex; justify-content: space-between; font-size: 11px; color: var(--mi-label3); }

/* Incidents and on-call */
.rod__incidents { display: grid; margin: 0; padding: 0; list-style: none; }
.rod__incidents li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: start; gap: 12px; padding: 12px 0; }
.rod__incidents li + li { border-top: 1px solid var(--mi-sep); }
.rod__incidents li:first-child { padding-top: 0; }
.rod__incidents li:last-child { padding-bottom: 0; }
.rod__sev { padding: 3px 7px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: .02em; font-variant-numeric: tabular-nums; }
.rod__sev.is-1 { color: var(--mi-p-on); background: var(--mi-red); }
.rod__sev.is-2 { color: var(--mi-red-t); background: color-mix(in srgb, var(--mi-red) 14%, transparent); }
.rod__sev.is-3 { color: var(--mi-orange-t); background: color-mix(in srgb, var(--mi-orange) 14%, transparent); }
.rod__inc-body { display: grid; gap: 2px; min-width: 0; }
.rod__inc-time { display: grid; justify-items: end; gap: 6px; }
.rod__inc-time strong { font-size: 13px; font-weight: 650; font-variant-numeric: tabular-nums; }

.rod__oncall { position: relative; overflow: hidden; isolation: isolate; }
.rod__oncall::before { content: ""; position: absolute; inset: -60% -20% auto auto; width: 60%; aspect-ratio: 1; z-index: -1; border-radius: 50%; background: radial-gradient(closest-side, var(--mi-p-tint), transparent); }
.rod__primary { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; }
.rod__primary-text { display: grid; min-width: 0; }
.rod__shift { display: grid; gap: 6px; }
.rod__shift-track { display: block; height: 5px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.rod__shift-track i { display: block; height: 100%; border-radius: inherit; background: var(--mi-p); transform: scaleX(.62); transform-origin: left; }

@container (min-width: 640px) {
  .rod__top { padding: 12px 20px; }
  .rod__cmd { display: flex; }
  .rod__page { padding: 24px 20px 28px; }
  .rod__build { grid-template-columns: minmax(0, 1fr) auto; align-items: center; }
  .rod__hops { grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: 112px; }
  .rod__hops li { padding: 8px 12px; }
  .rod__cells { gap: 2px; }
  .rod__stack { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@container (min-width: 760px) {
  .rod__timeline { min-width: 0; }
  .rod__scroll { overflow: visible; }
}
@container (min-width: 980px) {
  .rod__page { padding: 28px 32px 32px; gap: 20px; }
  .rod__row { grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); }
  .rod__stack { grid-template-columns: minmax(0, 1fr); }
  .rod__card { padding: 20px 22px; }
  .rod__scroll { margin-inline: -22px; padding: 0 22px; }
}
</style>

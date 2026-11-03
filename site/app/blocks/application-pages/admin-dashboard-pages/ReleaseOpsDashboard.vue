<template>
  <section class="rod mi:@container mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]" aria-labelledby="rod-title">
    <div class="rod__in mi:grid mi:content-start mi:min-h-full">
      <!-- Shell: a path bar and a status line. Everything else is the page itself. -->
      <header class="rod__top mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2.5 mi:gap-x-4 mi:py-3 mi:px-4 mi:[background:var(--mi-card)] mi:border-b mi:border-b-sep mi:@[640px]:py-3 mi:@[640px]:px-5">
        <div class="rod__crumbs mi:flex mi:items-center mi:gap-2.5 mi:min-w-0">
          <span class="rod__glyph mi:relative mi:flex-[none] mi:w-6.5 mi:h-6.5 mi:rounded-[8px] mi:[background:var(--mi-label)]" aria-hidden="true"><i class="mi:[.rod__glyph_&]:absolute mi:[.rod__glyph_&]:left-1.5 mi:[.rod__glyph_&]:right-1.5 mi:[.rod__glyph_&]:h-[3px] mi:[.rod__glyph_&:first-child]:top-2 mi:[.rod__glyph_&:first-child]:right-2.5 mi:[.rod__glyph_&:last-child]:bottom-2 mi:[.rod__glyph_&:last-child]:left-2.5" /><i class="mi:[.rod__glyph_&]:absolute mi:[.rod__glyph_&]:left-1.5 mi:[.rod__glyph_&]:right-1.5 mi:[.rod__glyph_&]:h-[3px] mi:[.rod__glyph_&:first-child]:top-2 mi:[.rod__glyph_&:first-child]:right-2.5 mi:[.rod__glyph_&:last-child]:bottom-2 mi:[.rod__glyph_&:last-child]:left-2.5" /></span>
          <MiBreadcrumb :items="[{ label: 'Fenwick Freight', href: '#' }, { label: 'Platform', href: '#' }, { label: 'Releases' }]" aria-label="Location" />
        </div>
        <button type="button" class="rod__cmd mi:hidden mi:items-center mi:gap-2 mi:w-75 mi:h-8 mi:pt-0 mi:pr-1.5 mi:pb-0 mi:pl-2.5 mi:border mi:border-sep mi:rounded-[9px] mi:[background:var(--mi-fill4)] mi:text-label3 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:text-label2 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:@[640px]:flex">
          <MiIcon class="mi:[.rod__cmd_span&]:text-start mi:[.rod__cmd_span&]:text-ellipsis" name="search" :size="15" />
          <span class="mi:[.rod__cmd_span&]:text-start mi:[.rod__cmd_span&]:text-ellipsis">Find a service, build or incident</span>
          <MiKbd class="mi:[.rod__cmd_span&]:text-start mi:[.rod__cmd_span&]:text-ellipsis">⌘K</MiKbd>
        </button>
      </header>

      <div class="rod__page mi:grid mi:gap-4 mi:pt-5 mi:px-4 mi:pb-6 mi:min-w-0 mi:@[640px]:pt-6 mi:@[640px]:px-5 mi:@[640px]:pb-7 mi:@[980px]:pt-7 mi:@[980px]:px-8 mi:@[980px]:pb-8 mi:@[980px]:gap-5">
        <div class="rod__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
          <div>
            <MiText id="rod-title" as="h2" variant="title2" weight="bold">Release operations</MiText>
            <p class="rod__status mi:flex mi:items-baseline mi:gap-2 mi:mt-1 mi:mx-0 mi:mb-0 mi:text-[13px] mi:text-label2">
              <span class="rod__status-dot mi:flex-[none] mi:w-2 mi:h-2 mi:rounded-[50%] mi:[background:var(--mi-orange)] mi:transform-[translateY(-1px)] mi:shadow-[0_0_0_3px_color-mix(in_srgb,_var(--mi-orange)_20%,_transparent)]" aria-hidden="true" />
              <span><strong>1 service degraded</strong> · 4 of 5 healthy · next deploy window 15:00 UTC</span>
            </p>
          </div>
          <MiButton size="small">
            <template #leading><MiIcon name="arrow-up" :size="15" /></template>
            Promote v2.49.0-rc.1
          </MiButton>
        </div>

        <!-- Deployment timeline: one lane per environment, a build's promotion path drawn across lanes. -->
        <article class="rod__card rod__deploys mi:grid mi:content-start mi:gap-3.5 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[980px]:py-5 mi:@[980px]:px-5.5" aria-labelledby="rod-deploys">
          <div class="rod__card-head mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-y-2 mi:gap-x-4">
            <div>
              <MiText id="rod-deploys" as="h3" variant="headline" weight="semibold">Deployments, last 24 hours</MiText>
              <MiText variant="caption" tone="label2">Select a deploy to trace its build through every environment</MiText>
            </div>
            <ul class="rod__legend mi:flex mi:flex-wrap mi:gap-y-1 mi:gap-x-3.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[12px] mi:text-label2" aria-label="Deploy status">
              <li v-for="(l, k) in statusLabel" :key="k"><i class="mi:[.rod__legend_&]:w-2 mi:[.rod__legend_&]:h-2" :class="'is-' + k" />{{ l }}</li>
            </ul>
          </div>

          <div class="rod__scroll mi:overflow-x-auto mi:-mx-4.5 mi:py-0 mi:px-4.5 mi:[scrollbar-width:thin] mi:@[760px]:overflow-visible mi:@[980px]:-mx-5.5 mi:@[980px]:py-0 mi:@[980px]:px-5.5">
            <div class="rod__timeline mi:grid mi:grid-cols-[82px_minmax(0,_1fr)] mi:min-w-150 mi:pt-0 mi:pr-2.5 mi:pb-6.5 mi:pl-0 mi:@[760px]:min-w-0">
              <div class="rod__lane-names mi:grid mi:auto-rows-[44px]" aria-hidden="true">
                <span v-for="e in envs" :key="e.id">{{ e.label }}</span>
              </div>
              <div class="rod__track mi:relative mi:grid mi:auto-rows-[44px]">
                <span v-for="h in hourTicks" :key="h.label" class="rod__tick mi:absolute mi:top-0 mi:bottom-0 mi:w-0 mi:[border-left:1px_dashed_var(--mi-sep)] mi:pointer-events-none" :style="{ left: x(h.ago) }"><em class="mi:[.rod__tick_&]:-bottom-5.5">{{ h.label }}</em></span>
                <span class="rod__now mi:absolute mi:top-0 mi:bottom-0 mi:w-0 mi:[border-left:1px_dashed_var(--mi-sep)] mi:pointer-events-none mi:border-l-[1.5px] mi:border-l-p" :style="{ left: x(0) }"><em class="mi:[.rod__now_&]:absolute mi:[.rod__now_&]:-bottom-5.5 mi:[.rod__now_&]:not-italic mi:[.rod__now_&]:transform-[translateX(-50%)] mi:[.rod__now_&]:tabular-nums">Now</em></span>
                <div v-for="e in envs" :key="e.id" class="rod__lane mi:border-t mi:border-t-sep mi:[&:nth-of-type(odd)]:[background:color-mix(in_srgb,_var(--mi-fill4)_60%,_transparent)] mi:last-of-type:border-b mi:last-of-type:border-b-sep" />
                <svg class="rod__path mi:absolute mi:inset-0 mi:w-full mi:h-full mi:overflow-visible mi:pointer-events-none" viewBox="0 0 100 3" preserveAspectRatio="none" aria-hidden="true">
                  <polyline class="mi:[.rod__path_&]:fill-[color:none] mi:[.rod__path_&]:stroke-label mi:[.rod__path_&]:[stroke-width:1.5] mi:[.rod__path_&]:[stroke-dasharray:3_3] mi:[.rod__path_&]:opacity-55" :points="pathPoints" vector-effect="non-scaling-stroke" />
                </svg>
                <button
                  v-for="d in deploys" :key="d.env + d.build" type="button" class="rod__dot mi:[&.is-ok]:[background:var(--mi-green)] mi:absolute mi:w-3.5 mi:h-3.5 mi:mt-[-7px] mi:mr-0 mi:mb-0 mi:ml-[-7px] mi:p-0 mi:[border:0] mi:rounded-[50%] mi:shadow-[0_0_0_3px_var(--mi-card)] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring),_opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[&.is-dim]:opacity-38 mi:hover:opacity-100 mi:[&.is-running]:after:content-[''] mi:[&.is-running]:after:absolute mi:[&.is-running]:after:inset-[-5px] mi:[&.is-running]:after:rounded-[50%] mi:[&.is-running]:after:border-[1.5px] mi:[&.is-running]:after:border-p mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[4px]"
                  :class="['is-' + d.status, { 'is-dim': selected !== d.build, 'is-on': selected === d.build }]"
                  :style="{ left: x(d.ago), top: `${(envIndex(d.env) + 0.5) / envs.length * 100}%` }"
                  :aria-pressed="selected === d.build"
                  :aria-label="`${d.build} to ${envLabel(d.env)}, ${statusLabel[d.status]}, ${ago(d.ago)}`"
                  @click="selected = d.build"
                />
              </div>
            </div>
          </div>

          <div class="rod__build mi:grid mi:gap-3.5 mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-fill4)] mi:@[640px]:grid-cols-[minmax(0,_1fr)_auto] mi:@[640px]:items-center" aria-live="polite">
            <div class="rod__build-id mi:flex mi:items-center mi:gap-3 mi:min-w-0">
              <MiAvatar :name="build.author" size="sm" tone="auto" decorative />
              <div>
                <MiText as="h4" variant="subheadline" weight="semibold" tabular>{{ build.version }} <span class="rod__sha mi:ml-1 mi:py-px mi:px-1.5 mi:rounded-[5px] mi:text-[11.5px] mi:font-medium mi:text-label2 mi:[background:var(--mi-fill3)]">{{ build.sha }}</span></MiText>
                <MiText variant="caption" tone="label2">{{ build.author }} · {{ build.summary }}</MiText>
              </div>
            </div>
            <ol class="rod__hops mi:grid mi:grid-cols-[repeat(auto-fit,_minmax(0,_1fr))] mi:gap-1.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:[counter-reset:hop] mi:@[640px]:grid-cols-[none] mi:@[640px]:grid-flow-col mi:@[640px]:auto-cols-[112px]" aria-label="Promotion path">
              <li class="mi:[.rod__hops_&]:min-w-0 mi:[.rod__hops_&]:py-2 mi:[.rod__hops_&]:px-2.5" v-for="d in buildHops" :key="d.env" :class="'is-' + d.status">
                <span>{{ envLabel(d.env) }}</span>
                <strong>{{ clockAt(d.ago) }}</strong>
                <em>{{ statusLabel[d.status] }}</em>
              </li>
            </ol>
          </div>
        </article>

        <div class="rod__row mi:grid mi:gap-4 mi:min-w-0 mi:@[980px]:grid-cols-[minmax(0,_1.35fr)_minmax(0,_1fr)]">
          <article class="rod__card mi:grid mi:content-start mi:gap-3.5 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[980px]:py-5 mi:@[980px]:px-5.5" aria-labelledby="rod-uptime">
            <div class="rod__card-head mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-y-2 mi:gap-x-4">
              <div>
                <MiText id="rod-uptime" as="h3" variant="headline" weight="semibold">Uptime, 90 days</MiText>
                <MiText variant="caption" tone="label2" tabular>{{ hover || 'Hover a day for details' }}</MiText>
              </div>
            </div>
            <ul class="rod__services mi:grid mi:gap-3.5 mi:m-0 mi:p-0 mi:[list-style:none]">
              <li v-for="s in services" :key="s.name" :aria-label="`${s.name}: ${s.uptime} uptime, ${s.incidents} incidents in 90 days`">
                <div class="rod__svc-head mi:flex mi:justify-between mi:gap-2 mi:mb-1.5 mi:text-[13px]">
                  <span class="rod__svc-name mi:font-semibold">{{ s.name }}</span>
                  <span class="rod__svc-pct mi:font-semibold mi:text-label2 mi:tabular-nums" :class="{ 'is-low': parseFloat(s.uptime) < 99.9 }">{{ s.uptime }}</span>
                </div>
                <div class="rod__cells mi:grid mi:grid-cols-90 mi:gap-px mi:h-6 mi:@[640px]:gap-0.5" aria-hidden="true">
                  <span class="mi:[.rod__cells_&]:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:[.rod__cells_&:hover]:transform-[scaleY(1.25)]"
                    v-for="(c, i) in s.days" :key="i" :class="'is-' + c"
                    @mouseenter="hover = `${dayLabel(i)} · ${s.name} · ${c === 'ok' ? 'no incidents' : c === 'warn' ? 'degraded performance' : 'partial outage'}`"
                    @mouseleave="hover = ''"
                  />
                </div>
              </li>
            </ul>
            <div class="rod__axis mi:flex mi:justify-between mi:text-[11px] mi:text-label3" aria-hidden="true"><span>Aug 5</span><span>Today</span></div>
          </article>

          <div class="rod__stack mi:grid mi:gap-4 mi:content-start mi:min-w-0 mi:@[640px]:grid-cols-2 mi:@[980px]:grid-cols-[minmax(0,_1fr)]">
            <article class="rod__card mi:grid mi:content-start mi:gap-3.5 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[980px]:py-5 mi:@[980px]:px-5.5" aria-labelledby="rod-inc">
              <div class="rod__card-head mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-y-2 mi:gap-x-4">
                <MiText id="rod-inc" as="h3" variant="headline" weight="semibold">Open incidents</MiText>
                <MiTextLink href="#">History</MiTextLink>
              </div>
              <ul class="rod__incidents mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
                <li class="mi:[.rod__incidents_li&]:grid-cols-[auto_minmax(0,_1fr)_auto] mi:[.rod__incidents_li&:first-child]:pt-0 mi:[.rod__incidents_li&:last-child]:pb-0" v-for="i in incidents" :key="i.id">
                  <span class="rod__sev mi:py-[3px] mi:px-[7px] mi:rounded-[6px] mi:text-[11px] mi:font-bold mi:tracking-[.02em] mi:tabular-nums" :class="'is-' + i.sev">SEV{{ i.sev }}</span>
                  <div class="rod__inc-body mi:grid mi:gap-0.5 mi:min-w-0">
                    <MiText class="mi:[.rod__incidents_li&]:grid-cols-[auto_minmax(0,_1fr)_auto] mi:[.rod__incidents_li&:first-child]:pt-0 mi:[.rod__incidents_li&:last-child]:pb-0" variant="footnote" weight="semibold">{{ i.title }}</MiText>
                    <MiText class="mi:[.rod__incidents_li&]:grid-cols-[auto_minmax(0,_1fr)_auto] mi:[.rod__incidents_li&:first-child]:pt-0 mi:[.rod__incidents_li&:last-child]:pb-0" variant="caption" tone="label2" tabular>{{ i.id }} · {{ i.service }} · {{ i.state }}</MiText>
                  </div>
                  <div class="rod__inc-time mi:grid mi:justify-items-end mi:gap-1.5">
                    <strong>{{ i.open }}</strong>
                    <MiAvatar class="mi:[.rod__incidents_li&]:grid-cols-[auto_minmax(0,_1fr)_auto] mi:[.rod__incidents_li&:first-child]:pt-0 mi:[.rod__incidents_li&:last-child]:pb-0" :name="i.lead" size="xs" tone="auto" />
                  </div>
                </li>
              </ul>
            </article>

            <article class="rod__card rod__oncall mi:grid mi:content-start mi:gap-3.5 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:relative mi:overflow-hidden mi:isolate mi:before:content-[''] mi:before:absolute mi:before:top-[-60%] mi:before:right-[-20%] mi:before:bottom-auto mi:before:left-auto mi:before:w-[60%] mi:before:aspect-[1] mi:before:-z-1 mi:before:rounded-[50%] mi:before:[background:radial-gradient(closest-side,_var(--mi-p-tint),_transparent)] mi:@[980px]:py-5 mi:@[980px]:px-5.5" aria-labelledby="rod-oncall">
              <div class="rod__card-head mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-y-2 mi:gap-x-4">
                <MiText id="rod-oncall" as="h3" variant="headline" weight="semibold">On call</MiText>
                <MiText variant="caption" tone="label2">Platform rotation</MiText>
              </div>
              <div class="rod__primary mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3">
                <MiAvatar name="Ruth Asante" size="md" tone="auto" decorative />
                <div class="rod__primary-text mi:grid mi:min-w-0">
                  <MiText variant="subheadline" weight="semibold">Ruth Asante</MiText>
                  <MiText variant="caption" tone="label2">Primary · Accra, 13:40 local</MiText>
                </div>
                <MiButton variant="tinted" size="small" :disabled="paged" @click="paged = true">{{ paged ? 'Paged' : 'Page' }}</MiButton>
              </div>
              <div class="rod__shift mi:grid mi:gap-1.5" role="meter" aria-label="Shift progress" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100" aria-valuetext="62%, hands over Monday 09:00">
                <span class="rod__shift-track mi:block mi:h-[5px] mi:rounded-[3px] mi:[background:var(--mi-fill3)] mi:overflow-hidden"><i class="mi:[.rod__shift-track_&]:h-full mi:[.rod__shift-track_&]:origin-left" /></span>
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
.rod__glyph i { border-radius: 2px; background: var(--mi-card); }
.rod__glyph i:last-child { background: var(--mi-p); }
.rod__cmd { font: inherit; font-size: 13px; }
.rod__cmd span { flex: 1; white-space: nowrap; overflow: hidden; }
.rod__status strong { font-weight: 600; color: var(--mi-orange-t); }
.rod__legend li { display: inline-flex; align-items: center; gap: 6px; }
.rod__legend i { border-radius: 50%; }
.rod__legend .is-ok { background: var(--mi-green); }
.rod__legend .is-failed, .rod__dot.is-failed { background: var(--mi-red); }
.rod__legend .is-rolledback, .rod__dot.is-rolledback { background: var(--mi-orange); }
.rod__legend .is-running, .rod__dot.is-running { background: var(--mi-p); }
.rod__lane-names span { display: flex; align-items: center; font-size: 12.5px; font-weight: 600; color: var(--mi-label2); }
.rod__tick em { position: absolute; font-size: 11px; font-style: normal; color: var(--mi-label3); white-space: nowrap; transform: translateX(-50%); font-variant-numeric: tabular-nums; }
.rod__now em { font-size: 11px; color: var(--mi-label3); white-space: nowrap; }
.rod__now em { color: var(--mi-p-text); font-weight: 600; }
.rod__dot:hover { transform: scale(1.25); }
.rod__dot.is-on { transform: scale(1.3); }
.rod__dot.is-running::after { animation: rod-ping 1.8s var(--mi-ease) infinite; }
@keyframes rod-ping { from { transform: scale(.6); opacity: 1; } to { transform: scale(1.4); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .rod__dot.is-running::after { animation: none; } }
.rod__hops li { position: relative; display: grid; gap: 1px; border-radius: var(--mi-radius-m); background: var(--mi-card); font-size: 12px; color: var(--mi-label2); }
.rod__hops strong { font-size: 15px; font-weight: 650; color: var(--mi-label); font-variant-numeric: tabular-nums; }
.rod__hops em { font-style: normal; font-weight: 600; }
.rod__hops .is-ok em { color: var(--mi-green-t); }
.rod__hops .is-failed em { color: var(--mi-red-t); }
.rod__hops .is-rolledback em { color: var(--mi-orange-t); }
.rod__hops .is-running em { color: var(--mi-p-text); }
.rod__svc-pct.is-low { color: var(--mi-orange-t); }
.rod__cells span { border-radius: 1.5px; background: color-mix(in srgb, var(--mi-green) 42%, var(--mi-card)); }
.rod__cells span.is-warn { background: var(--mi-orange); }
.rod__cells span.is-down { background: var(--mi-red); }
.rod__incidents li { display: grid; align-items: start; gap: 12px; padding: 12px 0; }
.rod__incidents li + li { border-top: 1px solid var(--mi-sep); }
.rod__sev.is-1 { color: var(--mi-p-on); background: var(--mi-red); }
.rod__sev.is-2 { color: var(--mi-red-t); background: color-mix(in srgb, var(--mi-red) 14%, transparent); }
.rod__sev.is-3 { color: var(--mi-orange-t); background: color-mix(in srgb, var(--mi-orange) 14%, transparent); }
.rod__inc-time strong { font-size: 13px; font-weight: 650; font-variant-numeric: tabular-nums; }
.rod__shift-track i { display: block; border-radius: inherit; background: var(--mi-p); transform: scaleX(.62); }

@container (min-width: 640px) {
  .rod__hops li { padding: 8px 12px; }
}
</style>

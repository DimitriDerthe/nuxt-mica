<template>
  <section class="mi:@container mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]" aria-labelledby="rod-title">
    <div class="mi:grid mi:content-start mi:min-h-full">
      <!-- Shell: a path bar and a status line. Everything else is the page itself. -->
      <header class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2.5 mi:gap-x-4 mi:py-3 mi:px-4 mi:[background:var(--mi-card)] mi:border-b mi:border-b-sep mi:@[640px]:py-3 mi:@[640px]:px-5">
        <div class="mi:flex mi:items-center mi:gap-2.5 mi:min-w-0">
          <span class="mi:relative mi:flex-[none] mi:w-6.5 mi:h-6.5 mi:rounded-[8px] mi:[background:var(--mi-label)]" aria-hidden="true"><i class="mi:rounded-[2px] mi:bg-card mi:last:bg-p mi:absolute mi:left-1.5 mi:right-1.5 mi:h-[3px] mi:first:top-2 mi:first:right-2.5 mi:last:bottom-2 mi:last:left-2.5" /><i class="mi:rounded-[2px] mi:bg-card mi:last:bg-p mi:absolute mi:left-1.5 mi:right-1.5 mi:h-[3px] mi:first:top-2 mi:first:right-2.5 mi:last:bottom-2 mi:last:left-2.5" /></span>
          <MiBreadcrumb :items="[{ label: 'Fenwick Freight', href: '#' }, { label: 'Platform', href: '#' }, { label: 'Releases' }]" aria-label="Location" />
        </div>
        <button type="button" class="mi:[font:inherit] mi:text-[13px] mi:hidden mi:items-center mi:gap-2 mi:w-75 mi:h-8 mi:pt-0 mi:pr-1.5 mi:pb-0 mi:pl-2.5 mi:border mi:border-sep mi:rounded-[9px] mi:[background:var(--mi-fill4)] mi:text-label3 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:text-label2 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:@[640px]:flex">
          <MiIcon name="search" :size="15" />
          <span class="mi:flex-1 mi:whitespace-nowrap mi:overflow-hidden mi:text-start mi:text-ellipsis">Find a service, build or incident</span>
          <MiKbd>⌘K</MiKbd>
        </button>
      </header>

      <div class="mi:grid mi:gap-4 mi:pt-5 mi:px-4 mi:pb-6 mi:min-w-0 mi:@[640px]:pt-6 mi:@[640px]:px-5 mi:@[640px]:pb-7 mi:@[980px]:pt-7 mi:@[980px]:px-8 mi:@[980px]:pb-8 mi:@[980px]:gap-5">
        <div class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
          <div>
            <MiText id="rod-title" as="h2" variant="title2" weight="bold">Release operations</MiText>
            <p class="mi:flex mi:items-baseline mi:gap-2 mi:mt-1 mi:mx-0 mi:mb-0 mi:text-[13px] mi:text-label2">
              <span class="mi:flex-[none] mi:w-2 mi:h-2 mi:rounded-[50%] mi:[background:var(--mi-orange)] mi:transform-[translateY(-1px)] mi:shadow-[0_0_0_3px_color-mix(in_srgb,_var(--mi-orange)_20%,_transparent)]" aria-hidden="true" />
              <span><strong class="mi:font-semibold mi:text-orange-t">1 service degraded</strong> · 4 of 5 healthy · next deploy window 15:00 UTC</span>
            </p>
          </div>
          <MiButton size="small">
            <template #leading><MiIcon name="arrow-up" :size="15" /></template>
            Promote v2.49.0-rc.1
          </MiButton>
        </div>

        <!-- Deployment timeline: one lane per environment, a build's promotion path drawn across lanes. -->
        <article class="mi:grid mi:content-start mi:gap-3.5 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[980px]:py-5 mi:@[980px]:px-5.5" aria-labelledby="rod-deploys">
          <div class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-y-2 mi:gap-x-4">
            <div>
              <MiText id="rod-deploys" as="h3" variant="headline" weight="semibold">Deployments, last 24 hours</MiText>
              <MiText variant="caption" tone="label2">Select a deploy to trace its build through every environment</MiText>
            </div>
            <ul class="mi:flex mi:flex-wrap mi:gap-y-1 mi:gap-x-3.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[12px] mi:text-label2" aria-label="Deploy status">
              <li v-for="(l, k) in statusLabel" :key="k" class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:rounded-[50%] mi:w-2 mi:h-2" :class="[k === 'ok' ? 'mi:bg-green' : k === 'failed' ? 'mi:bg-red' : k === 'rolledback' ? 'mi:bg-orange' : 'mi:bg-p']" />{{ l }}</li>
            </ul>
          </div>

          <div class="mi:overflow-x-auto mi:-mx-4.5 mi:py-0 mi:px-4.5 mi:[scrollbar-width:thin] mi:@[760px]:overflow-visible mi:@[980px]:-mx-5.5 mi:@[980px]:py-0 mi:@[980px]:px-5.5">
            <div class="mi:grid mi:grid-cols-[82px_minmax(0,_1fr)] mi:min-w-150 mi:pt-0 mi:pr-2.5 mi:pb-6.5 mi:pl-0 mi:@[760px]:min-w-0">
              <div class="mi:grid mi:auto-rows-[44px]" aria-hidden="true">
                <span v-for="e in envs" :key="e.id" class="mi:flex mi:items-center mi:text-[12.5px] mi:font-semibold mi:text-label2">{{ e.label }}</span>
              </div>
              <div class="mi:relative mi:grid mi:auto-rows-[44px]">
                <span v-for="h in hourTicks" :key="h.label" class="mi:absolute mi:top-0 mi:bottom-0 mi:w-0 mi:[border-left:1px_dashed_var(--mi-sep)] mi:pointer-events-none" :style="{ left: x(h.ago) }"><em class="mi:absolute mi:text-[11px] mi:not-italic mi:text-label3 mi:whitespace-nowrap mi:transform-[translateX(-50%)] mi:tabular-nums mi:-bottom-5.5">{{ h.label }}</em></span>
                <span class="mi:absolute mi:top-0 mi:bottom-0 mi:w-0 mi:[border-left:1px_dashed_var(--mi-sep)] mi:pointer-events-none mi:border-l-[1.5px] mi:border-l-p" :style="{ left: x(0) }"><em class="mi:text-[11px] mi:whitespace-nowrap mi:text-p-text mi:font-semibold mi:absolute mi:-bottom-5.5 mi:not-italic mi:transform-[translateX(-50%)] mi:tabular-nums">Now</em></span>
                <div v-for="e in envs" :key="e.id" class="mi:border-t mi:border-t-sep mi:[&:nth-of-type(odd)]:[background:color-mix(in_srgb,_var(--mi-fill4)_60%,_transparent)] mi:last-of-type:border-b mi:last-of-type:border-b-sep" />
                <svg class="mi:absolute mi:inset-0 mi:w-full mi:h-full mi:overflow-visible mi:pointer-events-none" viewBox="0 0 100 3" preserveAspectRatio="none" aria-hidden="true">
                  <polyline class="mi:fill-[color:none] mi:stroke-label mi:[stroke-width:1.5] mi:[stroke-dasharray:3_3] mi:opacity-55" :points="pathPoints" vector-effect="non-scaling-stroke" />
                </svg>
                <button
                  v-for="d in deploys" :key="d.env + d.build" type="button" class="mi:absolute mi:w-3.5 mi:h-3.5 mi:mt-[-7px] mi:mr-0 mi:mb-0 mi:ml-[-7px] mi:p-0 mi:[border:0] mi:rounded-[50%] mi:shadow-[0_0_0_3px_var(--mi-card)] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring),_opacity_var(--mi-dur-2)_var(--mi-ease)] mi:hover:opacity-100 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[4px]"
                  :class="[DOT_BG[d.status], selected === d.build ? 'mi:transform-[scale(1.3)]' : 'mi:opacity-38 mi:hover:transform-[scale(1.25)]']"
                  :style="{ left: x(d.ago), top: `${(envIndex(d.env) + 0.5) / envs.length * 100}%` }"
                  :aria-pressed="selected === d.build"
                  :aria-label="`${d.build} to ${envLabel(d.env)}, ${statusLabel[d.status]}, ${ago(d.ago)}`"
                  @click="selected = d.build"
                />
              </div>
            </div>
          </div>

          <div class="mi:grid mi:gap-3.5 mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-fill4)] mi:@[640px]:grid-cols-[minmax(0,_1fr)_auto] mi:@[640px]:items-center" aria-live="polite">
            <div class="mi:flex mi:items-center mi:gap-3 mi:min-w-0">
              <MiAvatar :name="build.author" size="sm" tone="auto" decorative />
              <div>
                <MiText as="h4" variant="subheadline" weight="semibold" tabular>{{ build.version }} <span class="mi:ml-1 mi:py-px mi:px-1.5 mi:rounded-[5px] mi:text-[11.5px] mi:font-medium mi:text-label2 mi:[background:var(--mi-fill3)]">{{ build.sha }}</span></MiText>
                <MiText variant="caption" tone="label2">{{ build.author }} · {{ build.summary }}</MiText>
              </div>
            </div>
            <ol class="mi:grid mi:grid-cols-[repeat(auto-fit,_minmax(0,_1fr))] mi:gap-1.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:[counter-reset:hop] mi:@[640px]:grid-cols-[none] mi:@[640px]:grid-flow-col mi:@[640px]:auto-cols-[112px]" aria-label="Promotion path">
              <li class="mi:relative mi:grid mi:gap-px mi:rounded-md mi:bg-card mi:text-[12px] mi:text-label2 mi:py-2 mi:px-2.5 mi:@[640px]:px-3 mi:min-w-0" v-for="d in buildHops" :key="d.env">
                <span>{{ envLabel(d.env) }}</span>
                <strong class="mi:text-[15px] mi:font-[650] mi:text-label mi:tabular-nums">{{ clockAt(d.ago) }}</strong>
                <em class="mi:not-italic mi:font-semibold" :class="d.status === 'ok' ? 'mi:text-green-t' : d.status === 'failed' ? 'mi:text-red-t' : d.status === 'rolledback' ? 'mi:text-orange-t' : 'mi:text-p-text'">{{ statusLabel[d.status] }}</em>
              </li>
            </ol>
          </div>
        </article>

        <div class="mi:grid mi:gap-4 mi:min-w-0 mi:@[980px]:grid-cols-[minmax(0,_1.35fr)_minmax(0,_1fr)]">
          <article class="mi:grid mi:content-start mi:gap-3.5 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[980px]:py-5 mi:@[980px]:px-5.5" aria-labelledby="rod-uptime">
            <div class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-y-2 mi:gap-x-4">
              <div>
                <MiText id="rod-uptime" as="h3" variant="headline" weight="semibold">Uptime, 90 days</MiText>
                <MiText variant="caption" tone="label2" tabular>{{ hover || 'Hover a day for details' }}</MiText>
              </div>
            </div>
            <ul class="mi:grid mi:gap-3.5 mi:m-0 mi:p-0 mi:[list-style:none]">
              <li v-for="s in services" :key="s.name" :aria-label="`${s.name}: ${s.uptime} uptime, ${s.incidents} incidents in 90 days`">
                <div class="mi:flex mi:justify-between mi:gap-2 mi:mb-1.5 mi:text-[13px]">
                  <span class="mi:font-semibold">{{ s.name }}</span>
                  <span class="mi:font-semibold mi:tabular-nums" :class="parseFloat(s.uptime) < 99.9 ? 'mi:text-orange-t' : 'mi:text-label2'">{{ s.uptime }}</span>
                </div>
                <div class="mi:grid mi:grid-cols-90 mi:gap-px mi:h-6 mi:@[640px]:gap-0.5" aria-hidden="true">
                  <span class="mi:rounded-[1.5px] mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:hover:transform-[scaleY(1.25)]"
                    v-for="(c, i) in s.days" :key="i" :class="[c === 'warn' ? 'mi:bg-orange' : c === 'down' ? 'mi:bg-red' : 'mi:bg-[color:color-mix(in_srgb,_var(--mi-green)_42%,_var(--mi-card))]']"
                    @mouseenter="hover = `${dayLabel(i)} · ${s.name} · ${c === 'ok' ? 'no incidents' : c === 'warn' ? 'degraded performance' : 'partial outage'}`"
                    @mouseleave="hover = ''"
                  />
                </div>
              </li>
            </ul>
            <div class="mi:flex mi:justify-between mi:text-[11px] mi:text-label3" aria-hidden="true"><span>Aug 5</span><span>Today</span></div>
          </article>

          <div class="mi:grid mi:gap-4 mi:content-start mi:min-w-0 mi:@[640px]:grid-cols-2 mi:@[980px]:grid-cols-[minmax(0,_1fr)]">
            <article class="mi:grid mi:content-start mi:gap-3.5 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[980px]:py-5 mi:@[980px]:px-5.5" aria-labelledby="rod-inc">
              <div class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-y-2 mi:gap-x-4">
                <MiText id="rod-inc" as="h3" variant="headline" weight="semibold">Open incidents</MiText>
                <MiTextLink href="#">History</MiTextLink>
              </div>
              <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
                <li class="mi:grid mi:items-start mi:gap-3 mi:py-3 mi:px-0 mi:not-first:border-t mi:not-first:border-t-sep mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:first:pt-0 mi:last:pb-0" v-for="i in incidents" :key="i.id">
                  <span class="mi:py-[3px] mi:px-[7px] mi:rounded-[6px] mi:text-[11px] mi:font-bold mi:tracking-[.02em] mi:tabular-nums" :class="[i.sev === 1 ? 'mi:text-p-on mi:bg-red' : i.sev === 2 ? 'mi:text-red-t mi:bg-red/14' : 'mi:text-orange-t mi:bg-orange/14']">SEV{{ i.sev }}</span>
                  <div class="mi:grid mi:gap-0.5 mi:min-w-0">
                    <MiText variant="footnote" weight="semibold">{{ i.title }}</MiText>
                    <MiText variant="caption" tone="label2" tabular>{{ i.id }} · {{ i.service }} · {{ i.state }}</MiText>
                  </div>
                  <div class="mi:grid mi:justify-items-end mi:gap-1.5">
                    <strong class="mi:text-[13px] mi:font-[650] mi:tabular-nums">{{ i.open }}</strong>
                    <MiAvatar :name="i.lead" size="xs" tone="auto" />
                  </div>
                </li>
              </ul>
            </article>

            <article class="mi:grid mi:content-start mi:gap-3.5 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:relative mi:overflow-hidden mi:isolate mi:before:content-[''] mi:before:absolute mi:before:top-[-60%] mi:before:right-[-20%] mi:before:bottom-auto mi:before:left-auto mi:before:w-[60%] mi:before:aspect-[1] mi:before:-z-1 mi:before:rounded-[50%] mi:before:[background:radial-gradient(closest-side,_var(--mi-p-tint),_transparent)] mi:@[980px]:py-5 mi:@[980px]:px-5.5" aria-labelledby="rod-oncall">
              <div class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-y-2 mi:gap-x-4">
                <MiText id="rod-oncall" as="h3" variant="headline" weight="semibold">On call</MiText>
                <MiText variant="caption" tone="label2">Platform rotation</MiText>
              </div>
              <div class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3">
                <MiAvatar name="Ruth Asante" size="md" tone="auto" decorative />
                <div class="mi:grid mi:min-w-0">
                  <MiText variant="subheadline" weight="semibold">Ruth Asante</MiText>
                  <MiText variant="caption" tone="label2">Primary · Accra, 13:40 local</MiText>
                </div>
                <MiButton variant="tinted" size="small" :disabled="paged" @click="paged = true">{{ paged ? 'Paged' : 'Page' }}</MiButton>
              </div>
              <div class="mi:grid mi:gap-1.5" role="meter" aria-label="Shift progress" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100" aria-valuetext="62%, hands over Monday 09:00">
                <span class="mi:block mi:h-[5px] mi:rounded-[3px] mi:[background:var(--mi-fill3)] mi:overflow-hidden"><i class="mi:block mi:rounded-[inherit] mi:bg-p mi:transform-[scaleX(.62)] mi:h-full mi:origin-left" /></span>
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
const DOT_BG: Record<Status, string> = {
  ok: 'mi:[background:var(--mi-green)]',
  failed: 'mi:bg-red',
  rolledback: 'mi:bg-orange',
  running: "mi:bg-p mi:after:content-[''] mi:after:absolute mi:after:inset-[-5px] mi:after:rounded-[50%] mi:after:border-[1.5px] mi:after:border-p mi:after:transform-[scale(.6)] mi:after:[--mi-out-s:1.4] mi:after:animate-[out_1.8s_var(--mi-ease)_infinite] mi:motion-reduce:after:animate-none mi:motion-reduce:after:transform-none"
}
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

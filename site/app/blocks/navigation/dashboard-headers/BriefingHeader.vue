<template>
  <div class="bh mi:@container mi:grid mi:content-start mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]">
    <header class="bh__header mi:grid mi:gap-5.5 mi:pt-3 mi:px-4 mi:pb-6 mi:shadow-[0_1px_0_var(--mi-sep)] mi:[background:radial-gradient(70%_120%_at_100%_0%,_color-mix(in_srgb,_var(--mi-p)_9%,_transparent),_transparent_65%),_var(--mi-card)] mi:@[640px]:pt-3.5 mi:@[640px]:px-7 mi:@[640px]:pb-7" aria-labelledby="bh-title">
      <div class="bh__bar mi:flex mi:items-center mi:gap-3 mi:min-w-0">
        <span class="bh__brand mi:inline-flex mi:items-center mi:gap-2 mi:text-[15px] mi:font-750 mi:tracking-[-.02em]"><span class="bh__brand-dot mi:w-3.5 mi:h-3.5 mi:rounded-[5px] mi:[background:linear-gradient(135deg,_var(--mi-p),_var(--mi-s))] mi:transform-[rotate(45deg)_scale(.8)]" aria-hidden="true" />Relay</span>
        <nav class="bh__tabs mi:hidden mi:gap-0.5 mi:@[960px]:flex mi:@[960px]:ml-4.5" aria-label="Sections">
          <a v-for="t in tabs" :key="t" href="#" class="bh__tab mi:py-1.5 mi:px-2.5 mi:rounded-[8px] mi:text-[13.5px] mi:font-medium mi:text-label2 mi:[text-decoration:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :aria-current="t === 'Today' ? 'page' : undefined" @click.prevent>{{ t }}</a>
        </nav>
        <div class="bh__tools mi:flex mi:items-center mi:gap-2.5 mi:ml-auto">
          <MiSegmented v-model="scope" label="Briefing scope" :options="scopes" />
          <MiAvatar name="Inès Varga" size="sm" tone="auto" />
        </div>
      </div>

      <div class="bh__grid mi:grid mi:gap-5 mi:@[960px]:grid-cols-[minmax(0,_1fr)_280px] mi:@[960px]:gap-10 mi:@[960px]:items-start">
        <div class="bh__lead mi:grid mi:justify-items-start mi:gap-1.5 mi:min-w-0">
          <MiText as="p" variant="footnote" tone="label2" weight="medium" tabular class="bh__date">Monday 2 November · 08:12</MiText>
          <MiText id="bh-title" as="h2" variant="title1" weight="bold">Good morning, Inès.</MiText>

          <!-- The briefing is written from the data: approve a deploy and the sentence rewrites itself. -->
          <p class="bh__brief mi:max-w-[34ch] mi:mt-2 mi:mx-0 mi:mb-0 mi:text-[19px] mi:leading-[1.55] mi:tracking-[-.012em] mi:text-label2 mi:text-pretty mi:@[640px]:text-[21px] mi:@[960px]:text-[22px] mi:@[960px]:max-w-[36ch]" aria-live="polite">
            <template v-for="(t, i) in sentence" :key="i">
              <button
                v-if="t.key" type="button" class="bh__count mi:inline mi:py-0 mi:px-0.5 mi:my-0 mi:-mx-0.5 mi:[border:0] mi:rounded-[4px] mi:text-label mi:[background:none] mi:cursor-pointer mi:underline-offset-[4px] mi:hover:text-(--ct) mi:[&.is-open]:text-(--ct) mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :class="{ 'is-open': peek === t.key }" :style="{ '--c': `var(--mi-${clauseColor[t.key][0]})`, '--ct': `var(--mi-${clauseColor[t.key][1]})` }"
                :aria-expanded="peek === t.key" aria-controls="bh-peek" @click="toggle(t.key)"
              >{{ t.text }}</button>
              <template v-else>{{ t.text }}</template>
            </template>
          </p>

          <Transition name="bh-peek">
            <section v-if="peek && peekItems.length" id="bh-peek" :key="peek" class="bh__peek mi:w-full mi:max-w-155 mi:box-border mi:mt-2.5 mi:pt-1.5 mi:pr-1.5 mi:pb-1.5 mi:pl-3.5 mi:rounded-[16px] mi:[background:var(--mi-elev)] mi:shadow-2" :aria-label="peekTitle">
              <header class="bh__peek-head mi:flex mi:items-center mi:justify-between mi:gap-2 mi:pt-1 mi:px-0 mi:pb-0.5">
                <MiText as="h3" variant="subheadline" weight="semibold">{{ peekTitle }}</MiText>
                <MiIconButton size="small" variant="plain" label="Close details" @click="peek = null"><MiIcon name="close" :size="14" /></MiIconButton>
              </header>
              <ul class="bh__peek-list mi:grid mi:m-0 mi:pt-0 mi:pr-2 mi:pb-1 mi:pl-0 mi:[list-style:none]">
                <li v-for="it in peekItems" :key="it.id" class="bh__peek-row mi:flex mi:items-center mi:gap-2.5 mi:py-[9px] mi:px-0 mi:[.bh__peek-row+&]:border-t mi:[.bh__peek-row+&]:border-t-sep">
                  <MiAvatar :name="it.who" size="xs" tone="auto" decorative />
                  <span class="bh__peek-text mi:grid mi:flex-1 mi:min-w-0 mi:leading-[1.3]">
                    <span class="bh__peek-title mi:text-[13.5px] mi:font-550 mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis mi:tabular-nums">{{ it.title }}</span>
                    <span class="bh__peek-meta mi:text-[12px] mi:text-label2">{{ it.who }} · {{ it.meta }}</span>
                  </span>
                  <MiButton v-if="peek === 'deploys'" size="small" variant="tinted" @click="approve(it.id)">Approve</MiButton>
                  <MiButton v-else-if="peek === 'checks'" size="small" variant="gray" @click="ack(it.id)">Acknowledge</MiButton>
                </li>
              </ul>
            </section>
          </Transition>

          <ul class="bh__chips mi:flex mi:flex-wrap mi:gap-2 mi:mt-4 mi:mx-0 mi:mb-0 mi:p-0 mi:[list-style:none]" aria-label="Quick actions">
            <li v-for="a in actions" :key="a.label">
              <button type="button" class="bh__chip mi:inline-flex mi:items-center mi:gap-[7px] mi:h-8 mi:py-0 mi:px-3 mi:[border:0] mi:rounded-[999px] mi:text-label mi:[background:var(--mi-card)] mi:cursor-pointer mi:shadow-[inset_0_0_0_1px_var(--mi-sep),_var(--mi-sh1)] mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:hover:[background:var(--mi-fill4)] mi:active:transform-[scale(.97)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]">
                <MiIcon :name="a.icon" :size="15" />
                <span>{{ a.label }}</span>
                <MiKbd v-if="a.key" class="bh__chip-key mi:-mr-1">{{ a.key }}</MiKbd>
              </button>
            </li>
          </ul>
        </div>

        <aside class="bh__side mi:grid mi:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] mi:gap-2.5 mi:@[960px]:mt-6.5 mi:@[960px]:grid-cols-[minmax(0,_1fr)]" aria-label="Today at a glance">
          <div class="bh__glance mi:grid mi:gap-1.5 mi:content-start mi:py-3.5 mi:px-4 mi:rounded-[16px] mi:[background:color-mix(in_srgb,_var(--mi-page)_70%,_var(--mi-card))] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]">
            <MiText as="span" variant="caption" tone="label2" weight="medium">Error budget · 30 days</MiText>
            <span class="bh__big mi:text-[30px] mi:font-750 mi:leading-[1.05] mi:tracking-[-.035em] mi:tabular-nums">{{ data.budget }}<small class="mi:[.bh__big_&]:text-[16px] mi:[.bh__big_&]:font-semibold mi:[.bh__big_&]:text-label2 mi:[.bh__big_&]:ml-px">%</small></span>
            <div class="bh__meter mi:h-1.5 mi:rounded-[3px] mi:overflow-hidden mi:[background:var(--mi-fill3)]" role="meter" aria-label="Error budget left" :aria-valuenow="data.budget" aria-valuemin="0" aria-valuemax="100">
              <span class="mi:[.bh__meter_&]:block mi:[.bh__meter_&]:h-full mi:[.bh__meter_&]:rounded-[3px] mi:[.bh__meter_&]:[background:var(--mi-green)] mi:[.bh__meter_&]:origin-left mi:[.bh__meter_&]:[transition:transform_var(--mi-dur-4)_var(--mi-ease)]" :style="{ transform: `scaleX(${data.budget / 100})` }" />
            </div>
            <MiText as="span" variant="caption" tone="label2" tabular>{{ data.budgetNote }}</MiText>
          </div>
          <div class="bh__glance bh__glance--row mi:grid mi:gap-1.5 mi:content-start mi:py-3.5 mi:px-4 mi:rounded-[16px] mi:[background:color-mix(in_srgb,_var(--mi-page)_70%,_var(--mi-card))] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:hidden mi:items-center mi:gap-3.5 mi:@[640px]:flex">
            <span class="bh__next-time mi:text-[20px] mi:font-bold mi:tracking-[-.02em] mi:tabular-nums mi:text-p-text mi:pr-3.5 mi:border-r mi:border-r-sep">09:30</span>
            <span class="bh__next-text mi:grid mi:min-w-0">
              <MiText as="span" variant="footnote" weight="semibold">Platform stand-up</MiText>
              <MiText as="span" variant="caption" tone="label2">in 1 h 18 min · Room 2</MiText>
            </span>
          </div>
        </aside>
      </div>
    </header>

    <main class="bh__body mi:grid mi:gap-3 mi:p-4 mi:@[640px]:grid-cols-[1fr_1fr] mi:@[640px]:py-5 mi:@[640px]:px-7 mi:@[960px]:grid-cols-[2fr_1fr_1fr]" aria-label="Dashboard">
      <div class="bh__panel bh__panel--wide mi:min-h-25 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:@[640px]:col-span-full mi:@[960px]:col-[auto]"><MiSkeleton :animated="false" :height="120" :radius="10" /></div>
      <div class="bh__panel mi:min-h-25 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)]"><MiSkeleton variant="text" :lines="['70%', '90%', '55%']" :animated="false" /></div>
      <div class="bh__panel mi:min-h-25 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)]"><MiSkeleton variant="text" :lines="['60%', '85%', '40%']" :animated="false" /></div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Key = 'deploys' | 'resolved' | 'open' | 'checks'
interface Entry { id: string, title: string, who: string, meta: string }
interface Briefing { deploys: Entry[], resolved: Entry[], open: Entry[], checks: Entry[], budget: number, budgetNote: string, shift: string }

const tabs = ['Today', 'Deploys', 'Incidents', 'Services']
const scopes = [{ value: 'me', label: 'For me' }, { value: 'team', label: 'Team' }]
const scope = ref<string | number | null>('me')

const briefings = reactive<Record<'me' | 'team', Briefing>>({
  me: {
    deploys: [
      { id: 'd1', title: 'payments-api 4.18.0 → production', who: 'Rafael Costa', meta: 'waiting 42 min' },
      { id: 'd2', title: 'ledger-worker 2.6.1 → production', who: 'Mei Tanaka', meta: 'waiting 1 h' },
      { id: 'd3', title: 'search-indexer 0.9.4 → staging', who: 'Jonas Weber', meta: 'waiting 3 h' }
    ],
    resolved: [{ id: 'r1', title: 'Queue backlog on payments-worker', who: 'Mei Tanaka', meta: 'resolved 03:18 · 6 min' }],
    open: [],
    checks: [],
    budget: 82, budgetNote: '7 h 46 min of downtime left', shift: 'Your on-call shift starts at 18:00.'
  },
  team: {
    deploys: [
      { id: 't1', title: 'payments-api 4.18.0 → production', who: 'Rafael Costa', meta: 'waiting 42 min' },
      { id: 't2', title: 'ledger-worker 2.6.1 → production', who: 'Mei Tanaka', meta: 'waiting 1 h' },
      { id: 't3', title: 'search-indexer 0.9.4 → staging', who: 'Jonas Weber', meta: 'waiting 3 h' },
      { id: 't4', title: 'web-checkout 12.2.0 → production', who: 'Priya Nair', meta: 'waiting 12 min' },
      { id: 't5', title: 'notifier 1.4.0 → staging', who: 'Tom Okafor', meta: 'waiting 2 h' }
    ],
    resolved: [
      { id: 'tr1', title: 'Queue backlog on payments-worker', who: 'Mei Tanaka', meta: 'resolved 03:18 · 6 min' },
      { id: 'tr2', title: 'Elevated 502s on eu-west edge', who: 'Jonas Weber', meta: 'resolved 05:40 · 21 min' }
    ],
    open: [{ id: 'to1', title: 'Slow exports for accounts over 50k rows', who: 'Priya Nair', meta: 'SEV-3 · opened 07:55' }],
    checks: [
      { id: 'tc1', title: 'webhook-retry.spec fails on shard 3', who: 'Jonas Weber', meta: 'failed 4 of last 10 runs' },
      { id: 'tc2', title: 'ledger-replay.spec times out', who: 'Rafael Costa', meta: 'failed 2 of last 10 runs' }
    ],
    budget: 64, budgetNote: '15 h 33 min of downtime left', shift: 'Mei hands on-call over to you at 18:00.'
  }
})
const data = computed(() => briefings[scope.value === 'team' ? 'team' : 'me'])

const clauseColor: Record<Key, [string, string]> = { deploys: ['p', 'p-text'], resolved: ['green', 'green-t'], open: ['orange', 'orange-t'], checks: ['red', 'red-t'] }
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

// Each clause is written only when its count is above zero.
const clauses = computed(() => {
  const d = data.value
  const team = scope.value === 'team'
  const out: { key: Key, link: string, rest: string }[] = []
  if (d.deploys.length) out.push({ key: 'deploys', link: plural(d.deploys.length, 'deploy', 'deploys'), rest: ` ${d.deploys.length === 1 ? 'waits' : 'wait'} for ${team ? 'review' : 'your review'}` })
  if (d.resolved.length) out.push({ key: 'resolved', link: plural(d.resolved.length, 'incident', 'incidents'), rest: ` ${d.resolved.length === 1 ? 'was' : 'were'} resolved overnight` })
  if (d.open.length) out.push({ key: 'open', link: plural(d.open.length, 'incident', 'incidents'), rest: ` ${d.open.length === 1 ? 'is' : 'are'} still open` })
  if (d.checks.length) out.push({ key: 'checks', link: plural(d.checks.length, 'flaky test', 'flaky tests'), rest: ` ${d.checks.length === 1 ? 'needs' : 'need'} an owner` })
  return out
})

const sentence = computed(() => {
  const c = clauses.value
  const tokens: { text: string, key?: Key }[] = []
  if (!c.length) return [{ text: `Nothing needs you this morning. ${data.value.shift}` }]
  c.forEach((cl, i) => {
    if (i > 0) tokens.push({ text: i === c.length - 1 ? ' and ' : ', ' })
    tokens.push({ text: i === 0 ? cl.link.charAt(0).toUpperCase() + cl.link.slice(1) : cl.link, key: cl.key })
    if (cl.rest) tokens.push({ text: cl.rest })
  })
  tokens.push({ text: `. ${data.value.shift}` })
  return tokens
})

const peek = ref<Key | null>('deploys')
const titles: Record<Key, string> = { deploys: 'Deploys waiting for review', resolved: 'Resolved overnight', open: 'Open incidents', checks: 'Flaky tests without an owner' }
const peekTitle = computed(() => (peek.value ? titles[peek.value] : ''))
const peekItems = computed(() => (peek.value ? data.value[peek.value] : []))
function toggle(k: Key) { peek.value = peek.value === k ? null : k }
function drop(list: Entry[], id: string) {
  const i = list.findIndex(x => x.id === id)
  if (i >= 0) list.splice(i, 1)
  if (!list.length) peek.value = null
}
const approve = (id: string) => drop(data.value.deploys, id)
const ack = (id: string) => drop(data.value.checks, id)

const actions: { label: string, icon: 'check-circle' | 'warning' | 'chat' | 'bell', key?: string }[] = [
  { label: 'Review deploys', icon: 'check-circle', key: 'R' },
  { label: 'Incident log', icon: 'warning' },
  { label: 'Stand-up notes', icon: 'chat' },
  { label: 'Snooze until 10:00', icon: 'bell' }
]
</script>

<style scoped>
.bh__tab:hover { color: var(--mi-label); background: var(--mi-fill4); }
.bh__tab[aria-current="page"] { color: var(--mi-label); background: var(--mi-fill3); }
.bh__date { letter-spacing: .01em; }
.bh__count { font: inherit; font-weight: 650;
  font-variant-numeric: tabular-nums;
  text-decoration: underline; text-decoration-color: color-mix(in srgb, var(--c) 55%, transparent); text-decoration-thickness: 2px;
}
.bh__count:hover, .bh__count.is-open { text-decoration-color: var(--c); }
.bh-peek-enter-active, .bh-peek-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.bh-peek-enter-from, .bh-peek-leave-to { opacity: 0; transform: translateY(-6px); }
.bh__chip {
  font: inherit; font-size: 13px; font-weight: 550;
}
.bh__chip :deep(svg) { color: var(--mi-label2); }
</style>

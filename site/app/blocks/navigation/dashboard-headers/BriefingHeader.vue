<template>
  <div class="bh">
    <header class="bh__header" aria-labelledby="bh-title">
      <div class="bh__bar">
        <span class="bh__brand"><span class="bh__brand-dot" aria-hidden="true" />Relay</span>
        <nav class="bh__tabs" aria-label="Sections">
          <a v-for="t in tabs" :key="t" href="#" class="bh__tab" :aria-current="t === 'Today' ? 'page' : undefined" @click.prevent>{{ t }}</a>
        </nav>
        <div class="bh__tools">
          <MiSegmented v-model="scope" label="Briefing scope" :options="scopes" />
          <MiAvatar name="Inès Varga" size="sm" tone="auto" />
        </div>
      </div>

      <div class="bh__grid">
        <div class="bh__lead">
          <MiText as="p" variant="footnote" tone="label2" weight="medium" tabular class="bh__date">Monday 2 November · 08:12</MiText>
          <MiText id="bh-title" as="h2" variant="title1" weight="bold">Good morning, Inès.</MiText>

          <!-- The briefing is written from the data: approve a deploy and the sentence rewrites itself. -->
          <p class="bh__brief" aria-live="polite">
            <template v-for="(t, i) in sentence" :key="i">
              <button
                v-if="t.key" type="button" class="bh__count" :class="{ 'is-open': peek === t.key }" :style="{ '--c': `var(--mi-${clauseColor[t.key][0]})`, '--ct': `var(--mi-${clauseColor[t.key][1]})` }"
                :aria-expanded="peek === t.key" aria-controls="bh-peek" @click="toggle(t.key)"
              >{{ t.text }}</button>
              <template v-else>{{ t.text }}</template>
            </template>
          </p>

          <Transition name="bh-peek">
            <section v-if="peek && peekItems.length" id="bh-peek" :key="peek" class="bh__peek" :aria-label="peekTitle">
              <header class="bh__peek-head">
                <MiText as="h3" variant="subheadline" weight="semibold">{{ peekTitle }}</MiText>
                <MiIconButton size="small" variant="plain" label="Close details" @click="peek = null"><MiIcon name="close" :size="14" /></MiIconButton>
              </header>
              <ul class="bh__peek-list">
                <li v-for="it in peekItems" :key="it.id" class="bh__peek-row">
                  <MiAvatar :name="it.who" size="xs" tone="auto" decorative />
                  <span class="bh__peek-text">
                    <span class="bh__peek-title">{{ it.title }}</span>
                    <span class="bh__peek-meta">{{ it.who }} · {{ it.meta }}</span>
                  </span>
                  <MiButton v-if="peek === 'deploys'" size="small" variant="tinted" @click="approve(it.id)">Approve</MiButton>
                  <MiButton v-else-if="peek === 'checks'" size="small" variant="gray" @click="ack(it.id)">Acknowledge</MiButton>
                </li>
              </ul>
            </section>
          </Transition>

          <ul class="bh__chips" aria-label="Quick actions">
            <li v-for="a in actions" :key="a.label">
              <button type="button" class="bh__chip">
                <MiIcon :name="a.icon" :size="15" />
                <span>{{ a.label }}</span>
                <MiKbd v-if="a.key" class="bh__chip-key">{{ a.key }}</MiKbd>
              </button>
            </li>
          </ul>
        </div>

        <aside class="bh__side" aria-label="Today at a glance">
          <div class="bh__glance">
            <MiText as="span" variant="caption" tone="label2" weight="medium">Error budget · 30 days</MiText>
            <span class="bh__big">{{ data.budget }}<small>%</small></span>
            <div class="bh__meter" role="meter" aria-label="Error budget left" :aria-valuenow="data.budget" aria-valuemin="0" aria-valuemax="100">
              <span :style="{ transform: `scaleX(${data.budget / 100})` }" />
            </div>
            <MiText as="span" variant="caption" tone="label2" tabular>{{ data.budgetNote }}</MiText>
          </div>
          <div class="bh__glance bh__glance--row">
            <span class="bh__next-time">09:30</span>
            <span class="bh__next-text">
              <MiText as="span" variant="footnote" weight="semibold">Platform stand-up</MiText>
              <MiText as="span" variant="caption" tone="label2">in 1 h 18 min · Room 2</MiText>
            </span>
          </div>
        </aside>
      </div>
    </header>

    <main class="bh__body" aria-label="Dashboard">
      <div class="bh__panel bh__panel--wide"><MiSkeleton :animated="false" :height="120" :radius="10" /></div>
      <div class="bh__panel"><MiSkeleton variant="text" :lines="['70%', '90%', '55%']" :animated="false" /></div>
      <div class="bh__panel"><MiSkeleton variant="text" :lines="['60%', '85%', '40%']" :animated="false" /></div>
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
.bh { container-type: inline-size; display: grid; align-content: start; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.bh__header {
  display: grid; gap: 22px; padding: 12px 16px 24px; box-shadow: 0 1px 0 var(--mi-sep);
  background: radial-gradient(70% 120% at 100% 0%, color-mix(in srgb, var(--mi-p) 9%, transparent), transparent 65%), var(--mi-card);
}

.bh__bar { display: flex; align-items: center; gap: 12px; min-width: 0; }
.bh__brand { display: inline-flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 750; letter-spacing: -.02em; }
.bh__brand-dot { width: 14px; height: 14px; border-radius: 5px; background: linear-gradient(135deg, var(--mi-p), var(--mi-s)); transform: rotate(45deg) scale(.8); }
.bh__tabs { display: none; gap: 2px; }
.bh__tab { padding: 6px 10px; border-radius: 8px; font-size: 13.5px; font-weight: 500; color: var(--mi-label2); text-decoration: none; }
.bh__tab:hover { color: var(--mi-label); background: var(--mi-fill4); }
.bh__tab[aria-current="page"] { color: var(--mi-label); background: var(--mi-fill3); }
.bh__tab:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.bh__tools { display: flex; align-items: center; gap: 10px; margin-left: auto; }

.bh__grid { display: grid; gap: 20px; }
.bh__lead { display: grid; justify-items: start; gap: 6px; min-width: 0; }
.bh__date { letter-spacing: .01em; }
.bh__brief { max-width: 34ch; margin: 8px 0 0; font-size: 19px; line-height: 1.55; letter-spacing: -.012em; color: var(--mi-label2); text-wrap: pretty; }
.bh__count {
  display: inline; padding: 0 2px; margin: 0 -2px; border: 0; border-radius: 4px; font: inherit; font-weight: 650; color: var(--mi-label);
  font-variant-numeric: tabular-nums; background: none; cursor: pointer;
  text-decoration: underline; text-decoration-color: color-mix(in srgb, var(--c) 55%, transparent); text-decoration-thickness: 2px; text-underline-offset: 4px;
}
.bh__count:hover, .bh__count.is-open { color: var(--ct); text-decoration-color: var(--c); }
.bh__count:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

.bh__peek { width: 100%; max-width: 620px; box-sizing: border-box; margin-top: 10px; padding: 6px 6px 6px 14px; border-radius: 16px; background: var(--mi-elev); box-shadow: var(--mi-sh2); }
.bh__peek-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 4px 0 2px; }
.bh__peek-list { display: grid; margin: 0; padding: 0 8px 4px 0; list-style: none; }
.bh__peek-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; }
.bh__peek-row + .bh__peek-row { border-top: 1px solid var(--mi-sep); }
.bh__peek-text { display: grid; flex: 1; min-width: 0; line-height: 1.3; }
.bh__peek-title { font-size: 13.5px; font-weight: 550; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-variant-numeric: tabular-nums; }
.bh__peek-meta { font-size: 12px; color: var(--mi-label2); }
.bh-peek-enter-active, .bh-peek-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.bh-peek-enter-from, .bh-peek-leave-to { opacity: 0; transform: translateY(-6px); }

.bh__chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 0; padding: 0; list-style: none; }
.bh__chip {
  display: inline-flex; align-items: center; gap: 7px; height: 32px; padding: 0 12px; border: 0; border-radius: 999px;
  font: inherit; font-size: 13px; font-weight: 550; color: var(--mi-label); background: var(--mi-card); cursor: pointer;
  box-shadow: inset 0 0 0 1px var(--mi-sep), var(--mi-sh1); transition: transform var(--mi-dur-1) var(--mi-ease);
}
.bh__chip:hover { background: var(--mi-fill4); }
.bh__chip:active { transform: scale(.97); }
.bh__chip:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.bh__chip :deep(svg) { color: var(--mi-label2); }
.bh__chip-key { margin-right: -4px; }

.bh__side { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
.bh__glance { display: grid; gap: 6px; align-content: start; padding: 14px 16px; border-radius: 16px; background: color-mix(in srgb, var(--mi-page) 70%, var(--mi-card)); box-shadow: inset 0 0 0 1px var(--mi-sep); }
.bh__big { font-size: 30px; font-weight: 750; line-height: 1.05; letter-spacing: -.035em; font-variant-numeric: tabular-nums; }
.bh__big small { font-size: 16px; font-weight: 600; color: var(--mi-label2); margin-left: 1px; }
.bh__meter { height: 6px; border-radius: 3px; overflow: hidden; background: var(--mi-fill3); }
.bh__meter span { display: block; height: 100%; border-radius: 3px; background: var(--mi-green); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-ease); }
.bh__glance--row { display: none; align-items: center; gap: 14px; }
.bh__next-time { font-size: 20px; font-weight: 700; letter-spacing: -.02em; font-variant-numeric: tabular-nums; color: var(--mi-p-text); padding-right: 14px; border-right: 1px solid var(--mi-sep); }
.bh__next-text { display: grid; min-width: 0; }

.bh__body { display: grid; gap: 12px; padding: 16px; }
.bh__panel { min-height: 100px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); }

@container (min-width: 640px) {
  .bh__header { padding: 14px 28px 28px; }
  .bh__brief { font-size: 21px; }
  .bh__glance--row { display: flex; }
  .bh__body { grid-template-columns: 1fr 1fr; padding: 20px 28px; }
  .bh__panel--wide { grid-column: 1 / -1; }
}
@container (min-width: 960px) {
  .bh__tabs { display: flex; margin-left: 18px; }
  .bh__grid { grid-template-columns: minmax(0, 1fr) 280px; gap: 40px; align-items: start; }
  .bh__side { margin-top: 26px; }
  .bh__brief { font-size: 22px; max-width: 36ch; }
  .bh__side { grid-template-columns: minmax(0, 1fr); }
  .bh__body { grid-template-columns: 2fr 1fr 1fr; }
  .bh__panel--wide { grid-column: auto; }
}
</style>

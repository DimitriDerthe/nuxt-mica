<template>
  <section class="apal" aria-labelledby="apal-title">
    <h2 id="apal-title" class="apal__sr">Search and ask</h2>

    <div class="apal__stage">
      <!-- Faux help center behind the palette: a sidebar and an article, blurred once. -->
      <div class="apal__app" aria-hidden="true">
        <div class="apal__app-side"><i v-for="n in 7" :key="n" /></div>
        <div class="apal__app-doc"><b /><i v-for="n in 4" :key="n" /><u /><i v-for="n in 3" :key="`b${n}`" /></div>
      </div>
      <div class="apal__scrim" aria-hidden="true" />

      <div class="apal__palette" role="dialog" aria-modal="false" aria-labelledby="apal-title">
        <div class="apal__search">
          <MiIcon name="search" :size="18" class="apal__glass" />
          <input
            v-model="query" class="apal__input" type="text" role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls="apal-list"
            :aria-activedescendant="activeId" aria-label="Search or ask a question" placeholder="Search or ask anything…" autocomplete="off" spellcheck="false"
            @keydown="onKey"
          >
          <span v-if="query" class="apal__tab"><MiKbd>Tab</MiKbd> Ask AI</span>
        </div>

        <div id="apal-list" class="apal__list" role="listbox" aria-label="Results">
          <!-- Ask row: the model's proposed answer sits on top, regular results keep their place below. -->
          <div
            v-if="query.trim()" id="apal-opt-ask" role="option" class="apal__ask" :class="{ 'is-active': activeId === 'apal-opt-ask' }"
            :aria-selected="activeId === 'apal-opt-ask'" :aria-label="`Ask Lumen AI: ${query}`" aria-describedby="apal-answer"
            @mousemove="active = 0" @click="ask"
          >
            <span class="apal__orb"><MiOrb :state="phase === 'thinking' ? 'thinking' : 'idle'" size="sm" label="" /></span>
            <div class="apal__ask-body">
              <div class="apal__ask-head">
                <span class="apal__ask-title">Ask Lumen AI</span>
                <span class="apal__ask-q">“{{ query.trim() }}”</span>
                <span class="apal__ask-go"><MiKbd>↵</MiKbd> Continue in chat</span>
              </div>
              <div id="apal-answer" class="apal__answer" aria-live="polite">
                <MiShimmerText v-if="phase === 'thinking'" class="apal__reading" :text="`Reading ${answer ? answer.sources.length : 'your'} sources…`" />
                <template v-else-if="answer">
                  <p class="apal__summary">{{ answer.summary }}</p>
                  <ol class="apal__steps">
                    <li v-for="(s, i) in answer.steps" :key="i">{{ s }}</li>
                  </ol>
                  <span class="apal__sources">
                    <span v-for="s in answer.sources" :key="s.title" class="apal__source" :data-kind="s.kind">{{ s.title }}</span>
                  </span>
                </template>
                <p v-else class="apal__hint">Searches 214 docs, 38 runbooks and the #support channel.</p>
              </div>
            </div>
          </div>

          <template v-for="g in groups" :key="g.label">
            <div role="group" :aria-labelledby="`apal-g-${g.id}`">
              <div :id="`apal-g-${g.id}`" class="apal__group">{{ g.label }}</div>
              <div
                v-for="r in g.items" :id="`apal-opt-${r.id}`" :key="r.id" role="option" class="apal__opt"
                :class="{ 'is-active': activeId === `apal-opt-${r.id}` }" :aria-selected="activeId === `apal-opt-${r.id}`"
                @mousemove="active = options.indexOf(`apal-opt-${r.id}`)" @click="openResult(r)"
              >
                <MiAvatar v-if="r.kind === 'person'" :name="r.title" size="xs" tone="auto" decorative />
                <span v-else class="apal__ico" :data-kind="r.kind"><MiIcon :name="icons[r.kind]" :size="15" /></span>
                <span class="apal__opt-text">
                  <span class="apal__opt-title">{{ r.title }}</span>
                  <span class="apal__opt-sub">{{ r.sub }}</span>
                </span>
                <MiIcon v-if="r.kind !== 'recent'" name="arrow-right" :size="14" class="apal__go" />
              </div>
            </div>
          </template>

          <p v-if="query.trim() && !groups.length" class="apal__none">No page matches. Ask AI above instead.</p>
        </div>

        <div v-if="!query.trim()" class="apal__suggest">
          <span class="apal__suggest-label">Suggested</span>
          <div class="apal__chips">
            <MiButton v-for="s in suggestions" :key="s" size="small" variant="gray" @click="query = s">{{ s }}</MiButton>
          </div>
        </div>

        <footer class="apal__foot">
          <span class="apal__key"><MiKbdGroup><MiKbd>↑</MiKbd><MiKbd>↓</MiKbd></MiKbdGroup> move</span>
          <span class="apal__key"><MiKbd>↵</MiKbd> open</span>
          <span class="apal__key"><MiKbd>esc</MiKbd> {{ query ? 'clear' : 'close' }}</span>
          <span class="apal__status" role="status" aria-live="polite">{{ status }}</span>
        </footer>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

type Kind = 'doc' | 'setting' | 'person' | 'recent'
interface Result { id: string, kind: Kind, title: string, sub: string, keys: string }
interface Answer { keys: string[], summary: string, steps: string[], sources: { title: string, kind: 'doc' | 'runbook' | 'thread' }[] }

const icons = { doc: 'document', setting: 'settings', person: 'person', recent: 'search' } as const

// Sample workspace index and canned answers; swap for your search API and model.
const index: Result[] = [
  { id: 'd1', kind: 'doc', title: 'API keys and scopes', sub: 'Docs · Developers', keys: 'api key keys token scope create staging production' },
  { id: 'd2', kind: 'doc', title: 'Rotating secrets without downtime', sub: 'Runbook · Platform', keys: 'rotate rotation secret key api staging overlap revoke' },
  { id: 'd3', kind: 'doc', title: 'Webhook signing secrets', sub: 'Docs · Developers', keys: 'webhook secret signing rotate verify' },
  { id: 'd4', kind: 'doc', title: 'Inviting teammates', sub: 'Docs · Workspace', keys: 'invite teammate member seat people join' },
  { id: 'd5', kind: 'doc', title: 'Exporting usage data', sub: 'Docs · Billing', keys: 'export usage csv data report download' },
  { id: 'd6', kind: 'doc', title: 'Refunds and credits', sub: 'Docs · Billing', keys: 'refund credit invoice charge money billing' },
  { id: 's1', kind: 'setting', title: 'API keys', sub: 'Settings → Developers', keys: 'api key keys token rotate revoke staging' },
  { id: 's2', kind: 'setting', title: 'Members and seats', sub: 'Settings → Workspace', keys: 'invite member seat people teammate' },
  { id: 's3', kind: 'setting', title: 'Billing and invoices', sub: 'Settings → Billing', keys: 'billing invoice refund plan card' },
  { id: 'p1', kind: 'person', title: 'Kofi Asante', sub: 'Platform lead · owns API keys', keys: 'api key platform staging rotate secret' },
  { id: 'p2', kind: 'person', title: 'Inès Moreau', sub: 'Billing operations', keys: 'billing refund invoice export usage' }
]

const answers: Answer[] = [
  {
    keys: ['rotate', 'rotation', 'api', 'key'],
    summary: 'Create a second key, switch staging to it, then revoke the old one. Both keys work for up to 24 hours, so nothing breaks in between.',
    steps: ['Settings → API keys → New key, scope “staging”', 'Update STAGING_API_KEY in your deploy secrets and redeploy', 'Revoke the old key once its last-used time stops moving'],
    sources: [{ title: 'Rotating secrets', kind: 'runbook' }, { title: 'API keys and scopes', kind: 'doc' }, { title: '#platform, Oct 12', kind: 'thread' }]
  },
  {
    keys: ['invite', 'teammate', 'seat', 'member'],
    summary: 'Admins invite from Settings → Members. You have 3 of 25 seats left, and invite links expire after 7 days.',
    steps: ['Settings → Members → Invite', 'Pick a role; Editor is the default', 'Resend from the same page if the link expired'],
    sources: [{ title: 'Inviting teammates', kind: 'doc' }, { title: 'Members and seats', kind: 'doc' }]
  },
  {
    keys: ['export', 'usage', 'csv'],
    summary: 'Usage exports are daily rows for the last 90 days, one line per project and meter.',
    steps: ['Settings → Billing → Usage', 'Choose a range up to 90 days', 'Export CSV; large ranges arrive by email'],
    sources: [{ title: 'Exporting usage data', kind: 'doc' }, { title: '#billing, Sep 30', kind: 'thread' }]
  }
]

const recents = ['webhook retries after a timeout', 'invoice for October', 'who owns the Android release']
const suggestions = ['Rotate an API key', 'Invite a teammate', 'Export usage as CSV', 'Refund a charge']
const stop = new Set(['how', 'do', 'does', 'the', 'a', 'an', 'to', 'for', 'of', 'in', 'on', 'my', 'is', 'can', 'what', 'why', 'where', 'when', 'who', 'with', 'and', 'our', 'we', 'it'])

const query = ref('how do I rotate the staging API key')
const active = ref(0)
const status = ref('')
const terms = computed(() => query.value.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 1 && !stop.has(w)))
const stem = (w: string) => w.replace(/(ing|ion|es|s)$/, '')

const answer = computed(() => {
  const t = terms.value.map(stem)
  let best: Answer | null = null
  let score = 0
  for (const a of answers) {
    const s = a.keys.filter(k => t.some(w => stem(k).startsWith(w) || w.startsWith(stem(k)))).length
    if (s > score) { score = s; best = a }
  }
  return score ? best : null
})

const groups = computed(() => {
  if (!query.value.trim()) return [{ id: 'recent', label: 'Recent', items: recents.map((r, i) => ({ id: `r${i}`, kind: 'recent' as Kind, title: r, sub: 'Asked this week', keys: '' })) }]
  const t = terms.value.map(stem)
  const hits = index
    .map(r => ({ r, s: t.filter(w => r.keys.split(' ').some(k => k.startsWith(w)) || r.title.toLowerCase().includes(w)).length }))
    .filter(x => x.s)
    .sort((a, b) => b.s - a.s)
    .map(x => x.r)
  return ([['doc', 'Docs'], ['setting', 'Settings'], ['person', 'People']] as const)
    .map(([id, label]) => ({ id, label, items: hits.filter(r => r.kind === id).slice(0, 3) }))
    .filter(g => g.items.length)
})
const flat = computed(() => groups.value.flatMap(g => g.items))
// Index 0 is the Ask row whenever there is a query.
const options = computed(() => [...(query.value.trim() ? ['apal-opt-ask'] : []), ...flat.value.map(r => `apal-opt-${r.id}`)])
const activeId = computed(() => options.value[Math.min(active.value, options.value.length - 1)])

// The answer drafts itself shortly after typing pauses; the orb thinks while it does.
const phase = ref<'thinking' | 'ready'>('ready')
let timer: ReturnType<typeof setTimeout> | undefined
watch(query, (q) => {
  active.value = 0
  clearTimeout(timer)
  if (!q.trim()) return
  phase.value = 'thinking'
  timer = setTimeout(() => { phase.value = 'ready' }, 700)
})
onBeforeUnmount(() => clearTimeout(timer))

function ask() { status.value = `Opened a chat about “${query.value.trim()}”` }
function openResult(r: Result) {
  if (r.kind === 'recent') { query.value = r.title; return }
  status.value = `Opening ${r.title}`
}

function onKey(e: KeyboardEvent) {
  const n = options.value.length
  if (e.key === 'ArrowDown' && n) { e.preventDefault(); active.value = (active.value + 1) % n }
  else if (e.key === 'ArrowUp' && n) { e.preventDefault(); active.value = (active.value - 1 + n) % n }
  else if (e.key === 'Tab' && query.value.trim() && !e.shiftKey) { e.preventDefault(); active.value = 0 }
  else if (e.key === 'Enter') {
    e.preventDefault()
    if (activeId.value === 'apal-opt-ask') ask()
    else {
      const r = flat.value.find(x => `apal-opt-${x.id}` === activeId.value)
      if (r) openResult(r)
    }
  }
  else if (e.key === 'Escape' && query.value) { e.preventDefault(); query.value = '' }
  if (e.key.startsWith('Arrow')) document.getElementById(activeId.value ?? '')?.scrollIntoView({ block: 'nearest' })
}
</script>

<style scoped>
.apal { --apal-t3: color-mix(in srgb, var(--mi-label2) 78%, transparent); container-type: inline-size; display: grid; align-content: start; font-family: var(--mi-font); color: var(--mi-label); }
.apal__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.apal__stage { position: relative; display: grid; place-items: start center; min-height: 540px; padding: 32px 12px 24px; border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate; background: var(--mi-page); }
.apal__app { position: absolute; inset: 0; z-index: -2; display: grid; grid-template-columns: 26% 1fr; gap: 28px; padding: 22px; filter: blur(3px); }
.apal__app i, .apal__app b, .apal__app u { display: block; border-radius: 6px; background: var(--mi-fill3); }
.apal__app-side { display: grid; align-content: start; gap: 12px; }
.apal__app-side i { height: 12px; }
.apal__app-side i:nth-child(3) { width: 70%; background: var(--mi-p-tint); }
.apal__app-doc { display: grid; align-content: start; gap: 12px; max-width: 620px; }
.apal__app-doc b { height: 30px; width: 55%; margin-bottom: 10px; background: var(--mi-fill2); }
.apal__app-doc i { height: 11px; }
.apal__app-doc i:nth-child(odd) { width: 88%; }
.apal__app-doc u { height: 120px; margin: 8px 0; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.apal__scrim { position: absolute; inset: 0; z-index: -1; background: color-mix(in srgb, var(--mi-page) 50%, transparent); }

.apal__palette { display: grid; width: 100%; max-width: 640px; border-radius: var(--mi-radius-xl); overflow: hidden; background: var(--mi-elev); border: 1px solid var(--mi-sep); box-shadow: var(--mi-sh3); }

.apal__search { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid var(--mi-sep); }
.apal__glass { flex: none; color: var(--apal-t3); }
.apal__input { flex: 1; min-width: 0; height: 28px; padding: 0; border: 0; outline: none; background: none; font: inherit; font-size: 16px; color: var(--mi-label); }
.apal__input::placeholder { color: var(--apal-t3); }
.apal__tab { display: none; flex: none; align-items: center; gap: 6px; font-size: 12px; color: var(--apal-t3); }

.apal__list { max-height: 400px; overflow-y: auto; overscroll-behavior: contain; padding: 8px; }

/* Ask row: a quiet brand wash, the orb as the only moving thing. */
.apal__ask {
  display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 12px; padding: 12px; border-radius: var(--mi-radius-l); cursor: pointer;
  background: radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--mi-p) 9%, transparent), transparent 60%);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mi-p) 14%, var(--mi-sep));
}
.apal__ask.is-active { box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--mi-p) 55%, transparent); }
.apal__orb { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--mi-p-tint); }
.apal__ask-body { display: grid; gap: 8px; min-width: 0; }
.apal__ask-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 8px; min-height: 28px; padding-top: 4px; }
.apal__ask-title { font-size: 14px; font-weight: 600; color: var(--mi-p-text); }
.apal__ask-q { display: none; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; color: var(--mi-label2); flex: 1 1 140px; }
.apal__ask-go { display: none; align-items: center; gap: 6px; font-size: 12px; color: var(--apal-t3); }
.apal__answer { display: grid; gap: 8px; }
.apal__reading { font-size: 13px; color: var(--mi-label2); }
.apal__summary { margin: 0; font-size: 14px; line-height: 1.5; color: var(--mi-label); text-wrap: pretty; }
.apal__steps { display: grid; gap: 4px; margin: 0; padding: 0; list-style: none; counter-reset: s; }
.apal__steps li { position: relative; padding-left: 26px; font-size: 13px; line-height: 1.45; color: var(--mi-label2); counter-increment: s; }
.apal__steps li::before {
  content: counter(s); position: absolute; left: 0; top: 1px; display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%;
  font-size: 10px; font-weight: 700; color: var(--mi-label2); background: var(--mi-fill3); font-variant-numeric: tabular-nums;
}
.apal__sources { display: flex; flex-wrap: wrap; gap: 6px; padding-top: 2px; }
.apal__source { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 8px; border-radius: 6px; font-size: 11.5px; font-weight: 500; color: var(--mi-label2); background: var(--mi-fill4); border: 1px solid var(--mi-sep); }
.apal__source::before { content: ""; width: 6px; height: 6px; border-radius: 2px; background: var(--mi-p); }
.apal__source[data-kind="runbook"]::before { background: var(--mi-orange); }
.apal__source[data-kind="thread"]::before { border-radius: 50%; background: var(--mi-green); }
.apal__hint { margin: 0; font-size: 13px; color: var(--apal-t3); }

.apal__group { padding: 14px 10px 6px; font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--apal-t3); }
.apal__opt { display: flex; align-items: center; gap: 10px; min-height: 42px; padding: 6px 10px; border-radius: var(--mi-radius-m); cursor: pointer; }
.apal__opt.is-active { background: var(--mi-fill3); }
.apal__ico { display: grid; place-items: center; flex: none; width: 24px; height: 24px; border-radius: 7px; color: var(--mi-label2); background: var(--mi-fill4); }
.apal__ico[data-kind="setting"] { color: var(--mi-s-text); background: var(--mi-s-tint); }
.apal__ico[data-kind="recent"] { background: none; color: var(--apal-t3); }
.apal__opt-text { display: flex; flex: 1; flex-wrap: wrap; align-items: baseline; gap: 0 8px; min-width: 0; }
.apal__opt-title { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.apal__opt-sub { font-size: 12px; color: var(--apal-t3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.apal__go { flex: none; color: var(--apal-t3); opacity: 0; transform: translateX(-4px); transition: transform var(--mi-dur-2) var(--mi-ease), opacity var(--mi-dur-2) var(--mi-ease); }
.apal__opt.is-active .apal__go { opacity: 1; transform: none; }
.apal__none { margin: 0; padding: 18px 10px 8px; font-size: 13px; color: var(--mi-label2); }

.apal__suggest { display: grid; gap: 8px; padding: 4px 18px 14px; }
.apal__suggest-label { font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--apal-t3); }
.apal__chips { display: flex; flex-wrap: wrap; gap: 6px; }

.apal__foot { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; padding: 9px 16px; border-top: 1px solid var(--mi-sep); font-size: 12px; color: var(--mi-label2); background: color-mix(in srgb, var(--mi-fill4) 50%, transparent); }
.apal__key { display: inline-flex; align-items: center; gap: 6px; }
.apal__status { margin-left: auto; font-weight: 500; color: var(--mi-p-text); }

@container (min-width: 560px) {
  .apal__stage { padding: 52px 32px 32px; }
  .apal__tab { display: inline-flex; }
  .apal__ask-go { display: inline-flex; margin-left: auto; }
  .apal__ask-q { display: block; }
}
</style>

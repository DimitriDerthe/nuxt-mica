<template>
  <section class="apal mi:[--apal-t3:color-mix(in_srgb,_var(--mi-label2)_78%,_transparent)] mi:@container mi:grid mi:content-start mi:font-mi mi:text-label" aria-labelledby="apal-title">
    <h2 id="apal-title" class="apal__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Search and ask</h2>

    <div class="apal__stage mi:relative mi:grid mi:[place-items:start_center] mi:min-h-135 mi:pt-8 mi:px-3 mi:pb-6 mi:rounded-xl mi:overflow-hidden mi:isolate mi:[background:var(--mi-page)] mi:@[560px]:pt-13 mi:@[560px]:px-8 mi:@[560px]:pb-8">
      <!-- Faux help center behind the palette: a sidebar and an article, blurred once. -->
      <div class="apal__app mi:absolute mi:inset-0 mi:-z-2 mi:grid mi:grid-cols-[26%_1fr] mi:gap-7 mi:p-5.5 mi:[filter:blur(3px)]" aria-hidden="true">
        <div class="apal__app-side mi:grid mi:content-start mi:gap-3"><i class="mi:[.apal__app-side_&:nth-child(3)]:[background:var(--mi-p-tint)]" v-for="n in 7" :key="n" /></div>
        <div class="apal__app-doc mi:grid mi:content-start mi:gap-3 mi:max-w-155"><b class="mi:[.apal__app-doc_&]:w-[55%]" /><i v-for="n in 4" :key="n" /><u class="mi:[.apal__app_&]:block mi:[.apal__app_&]:rounded-[6px] mi:[.apal__app_&]:[background:var(--mi-fill3)] mi:[.apal__app-doc_&]:shadow-1" /><i v-for="n in 3" :key="`b${n}`" /></div>
      </div>
      <div class="apal__scrim mi:absolute mi:inset-0 mi:-z-1 mi:[background:color-mix(in_srgb,_var(--mi-page)_50%,_transparent)]" aria-hidden="true" />

      <div class="apal__palette mi:grid mi:w-full mi:max-w-160 mi:rounded-xl mi:overflow-hidden mi:[background:var(--mi-elev)] mi:border mi:border-sep mi:shadow-3" role="dialog" aria-modal="false" aria-labelledby="apal-title">
        <div class="apal__search mi:flex mi:items-center mi:gap-2.5 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep">
          <MiIcon name="search" :size="18" class="apal__glass mi:text-(--apal-t3)" />
          <input
            v-model="query" class="apal__input mi:flex-1 mi:min-w-0 mi:h-7 mi:p-0 mi:[border:0] mi:[outline:none] mi:[background:none] mi:text-label mi:placeholder:text-(--apal-t3)" type="text" role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls="apal-list"
            :aria-activedescendant="activeId" aria-label="Search or ask a question" placeholder="Search or ask anything…" autocomplete="off" spellcheck="false"
            @keydown="onKey"
          >
          <span v-if="query" class="apal__tab mi:hidden mi:flex-[none] mi:items-center mi:gap-1.5 mi:text-[12px] mi:text-(--apal-t3) mi:@[560px]:inline-flex"><MiKbd>Tab</MiKbd> Ask AI</span>
        </div>

        <div id="apal-list" class="apal__list mi:max-h-100 mi:overflow-y-auto mi:overscroll-contain mi:p-2" role="listbox" aria-label="Results">
          <!-- Ask row: the model's proposed answer sits on top, regular results keep their place below. -->
          <div
            v-if="query.trim()" id="apal-opt-ask" role="option" class="apal__ask mi:grid mi:grid-cols-[28px_minmax(0,_1fr)] mi:gap-3 mi:p-3 mi:rounded-lg mi:cursor-pointer mi:[background:radial-gradient(120%_140%_at_0%_0%,_color-mix(in_srgb,_var(--mi-p)_9%,_transparent),_transparent_60%)] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-p)_14%,_var(--mi-sep))] mi:[&.is-active]:shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)]" :class="{ 'is-active': activeId === 'apal-opt-ask' }"
            :aria-selected="activeId === 'apal-opt-ask'" :aria-label="`Ask Lumen AI: ${query}`" aria-describedby="apal-answer"
            @mousemove="active = 0" @click="ask"
          >
            <span class="apal__orb mi:grid mi:place-items-center mi:w-7 mi:h-7 mi:rounded-[50%] mi:[background:var(--mi-p-tint)]"><MiOrb :state="phase === 'thinking' ? 'thinking' : 'idle'" size="sm" label="" /></span>
            <div class="apal__ask-body mi:grid mi:gap-2 mi:min-w-0">
              <div class="apal__ask-head mi:flex mi:flex-wrap mi:items-baseline mi:gap-y-0.5 mi:gap-x-2 mi:min-h-7 mi:pt-1">
                <span class="apal__ask-title mi:text-[14px] mi:font-semibold mi:text-p-text">Ask Lumen AI</span>
                <span class="apal__ask-q mi:hidden mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[14px] mi:text-label2 mi:flex-[1_1_140px] mi:@[560px]:block">“{{ query.trim() }}”</span>
                <span class="apal__ask-go mi:hidden mi:items-center mi:gap-1.5 mi:text-[12px] mi:text-(--apal-t3) mi:@[560px]:inline-flex mi:@[560px]:ml-auto"><MiKbd>↵</MiKbd> Continue in chat</span>
              </div>
              <div id="apal-answer" class="apal__answer mi:grid mi:gap-2" aria-live="polite">
                <MiShimmerText v-if="phase === 'thinking'" class="apal__reading mi:text-[13px]" :text="`Reading ${answer ? answer.sources.length : 'your'} sources…`" />
                <template v-else-if="answer">
                  <p class="apal__summary mi:m-0 mi:text-[14px] mi:leading-normal mi:text-label mi:text-pretty">{{ answer.summary }}</p>
                  <ol class="apal__steps mi:grid mi:gap-1 mi:m-0 mi:p-0 mi:[list-style:none] mi:[counter-reset:s]">
                    <li class="mi:[.apal__steps_&]:relative mi:[.apal__steps_&]:pl-6.5 mi:[.apal__steps_&]:text-[13px] mi:[.apal__steps_&]:leading-[1.45] mi:[.apal__steps_&]:[counter-increment:s] mi:[.apal__steps_&]:before:content-[counter(s)] mi:[.apal__steps_&]:before:absolute mi:[.apal__steps_&]:before:left-0 mi:[.apal__steps_&]:before:top-px mi:[.apal__steps_&]:before:grid mi:[.apal__steps_&]:before:place-items-center mi:[.apal__steps_&]:before:w-4.5 mi:[.apal__steps_&]:before:h-4.5 mi:[.apal__steps_&]:before:rounded-[50%] mi:[.apal__steps_&]:before:text-[10px] mi:[.apal__steps_&]:before:font-bold mi:[.apal__steps_&]:before:text-label2 mi:[.apal__steps_&]:before:[background:var(--mi-fill3)] mi:[.apal__steps_&]:before:tabular-nums" v-for="(s, i) in answer.steps" :key="i">{{ s }}</li>
                  </ol>
                  <span class="apal__sources mi:flex mi:flex-wrap mi:gap-1.5 mi:pt-0.5">
                    <span v-for="s in answer.sources" :key="s.title" class="apal__source mi:inline-flex mi:items-center mi:gap-[5px] mi:h-5.5 mi:py-0 mi:px-2 mi:rounded-[6px] mi:text-[11.5px] mi:font-medium mi:text-label2 mi:[background:var(--mi-fill4)] mi:border mi:border-sep mi:before:content-[''] mi:before:w-1.5 mi:before:h-1.5 mi:before:rounded-[2px] mi:before:[background:var(--mi-p)] mi:[&[data-kind='runbook']]:before:[background:var(--mi-orange)] mi:[&[data-kind='thread']]:before:rounded-[50%] mi:[&[data-kind='thread']]:before:[background:var(--mi-green)]" :data-kind="s.kind">{{ s.title }}</span>
                  </span>
                </template>
                <p v-else class="apal__hint mi:m-0 mi:text-[13px] mi:text-(--apal-t3)">Searches 214 docs, 38 runbooks and the #support channel.</p>
              </div>
            </div>
          </div>

          <template v-for="g in groups" :key="g.label">
            <div role="group" :aria-labelledby="`apal-g-${g.id}`">
              <div :id="`apal-g-${g.id}`" class="apal__group mi:pt-3.5 mi:px-2.5 mi:pb-1.5 mi:text-[11px] mi:font-semibold mi:tracking-[.04em] mi:uppercase mi:text-(--apal-t3)">{{ g.label }}</div>
              <div
                v-for="r in g.items" :id="`apal-opt-${r.id}`" :key="r.id" role="option" class="apal__opt mi:flex mi:items-center mi:gap-2.5 mi:min-h-10.5 mi:py-1.5 mi:px-2.5 mi:rounded-md mi:cursor-pointer mi:[&.is-active]:[background:var(--mi-fill3)]"
                :class="{ 'is-active': activeId === `apal-opt-${r.id}` }" :aria-selected="activeId === `apal-opt-${r.id}`"
                @mousemove="active = options.indexOf(`apal-opt-${r.id}`)" @click="openResult(r)"
              >
                <MiAvatar v-if="r.kind === 'person'" :name="r.title" size="xs" tone="auto" decorative />
                <span v-else class="apal__ico mi:grid mi:place-items-center mi:flex-[none] mi:w-6 mi:h-6 mi:rounded-[7px] mi:text-label2 mi:[background:var(--mi-fill4)]" :data-kind="r.kind"><MiIcon :name="icons[r.kind]" :size="15" /></span>
                <span class="apal__opt-text mi:flex mi:flex-1 mi:flex-wrap mi:items-baseline mi:gap-y-0 mi:gap-x-2 mi:min-w-0">
                  <span class="apal__opt-title mi:text-[14px] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ r.title }}</span>
                  <span class="apal__opt-sub mi:text-[12px] mi:text-(--apal-t3) mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ r.sub }}</span>
                </span>
                <MiIcon v-if="r.kind !== 'recent'" name="arrow-right" :size="14" class="apal__go mi:text-(--apal-t3) mi:opacity-0 mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease),_opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[.apal__opt.is-active_&]:opacity-100" />
              </div>
            </div>
          </template>

          <p v-if="query.trim() && !groups.length" class="apal__none mi:m-0 mi:pt-4.5 mi:px-2.5 mi:pb-2 mi:text-[13px] mi:text-label2">No page matches. Ask AI above instead.</p>
        </div>

        <div v-if="!query.trim()" class="apal__suggest mi:grid mi:gap-2 mi:pt-1 mi:px-4.5 mi:pb-3.5">
          <span class="apal__suggest-label mi:text-[11px] mi:font-semibold mi:tracking-[.04em] mi:uppercase mi:text-(--apal-t3)">Suggested</span>
          <div class="apal__chips mi:flex mi:flex-wrap mi:gap-1.5">
            <MiButton v-for="s in suggestions" :key="s" size="small" variant="gray" @click="query = s">{{ s }}</MiButton>
          </div>
        </div>

        <footer class="apal__foot mi:flex mi:flex-wrap mi:items-center mi:gap-y-2 mi:gap-x-3.5 mi:py-[9px] mi:px-4 mi:border-t mi:border-t-sep mi:text-[12px] mi:text-label2 mi:[background:color-mix(in_srgb,_var(--mi-fill4)_50%,_transparent)]">
          <span class="apal__key mi:inline-flex mi:items-center mi:gap-1.5"><MiKbdGroup><MiKbd>↑</MiKbd><MiKbd>↓</MiKbd></MiKbdGroup> move</span>
          <span class="apal__key mi:inline-flex mi:items-center mi:gap-1.5"><MiKbd>↵</MiKbd> open</span>
          <span class="apal__key mi:inline-flex mi:items-center mi:gap-1.5"><MiKbd>esc</MiKbd> {{ query ? 'clear' : 'close' }}</span>
          <span class="apal__status mi:ml-auto mi:font-medium mi:text-p-text" role="status" aria-live="polite">{{ status }}</span>
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
.apal__app i, .apal__app b { display: block; border-radius: 6px; background: var(--mi-fill3); }
.apal__app-side i { height: 12px; }
.apal__app-side i:nth-child(3) { width: 70%; }
.apal__app-doc b { height: 30px; margin-bottom: 10px; background: var(--mi-fill2); }
.apal__app-doc i { height: 11px; }
.apal__app-doc i:nth-child(odd) { width: 88%; }
.apal__app-doc u { height: 120px; margin: 8px 0; background: var(--mi-card); }
.apal__glass { flex: none; }
.apal__input { font: inherit; font-size: 16px; }
.apal__reading { color: var(--mi-label2); }
.apal__steps li { color: var(--mi-label2); }
.apal__ico[data-kind="setting"] { color: var(--mi-s-text); background: var(--mi-s-tint); }
.apal__ico[data-kind="recent"] { background: none; color: var(--apal-t3); }
.apal__go { flex: none; transform: translateX(-4px); }
.apal__opt.is-active .apal__go { transform: none; }
</style>

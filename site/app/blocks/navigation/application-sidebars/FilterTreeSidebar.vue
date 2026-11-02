<template>
  <div class="ft">
    <div class="ft__shell" :class="{ 'is-detail': detail }" @keydown="onSlash">
      <aside class="ft__side" aria-label="Workspace tree">
        <header class="ft__head">
          <span class="ft__logo" aria-hidden="true">Q</span>
          <div class="ft__head-text">
            <MiText as="h2" variant="subheadline" weight="bold">Quarry Analytics</MiText>
            <span class="ft__env"><i aria-hidden="true" />eu-west · production</span>
          </div>
          <MiIconButton size="small" variant="plain" label="New item"><MiIcon name="plus" :size="16" /></MiIconButton>
        </header>

        <!-- Live filter: matches are highlighted and their parents open on their own. -->
        <div class="ft__filter" :class="{ 'has-query': q }">
          <MiIcon name="search" :size="14" class="ft__filter-icon" />
          <input
            id="ft-filter" ref="filterEl" v-model="query" class="ft__filter-input" type="text" autocomplete="off" spellcheck="false"
            placeholder="Filter pages and models" aria-label="Filter the tree" aria-describedby="ft-filter-status" @keydown.esc="query = ''"
          >
          <MiKbd v-if="!q" class="ft__filter-key">/</MiKbd>
          <button v-else type="button" class="ft__filter-clear" aria-label="Clear filter" @click="clear"><MiIcon name="close" :size="12" /></button>
        </div>
        <p id="ft-filter-status" class="ft__status" aria-live="polite">
          <template v-if="q">{{ matchCount }} {{ matchCount === 1 ? 'match' : 'matches' }} for “{{ query.trim() }}”</template>
        </p>

        <div class="ft__scroll">
          <section v-if="!q" class="ft__sec" aria-labelledby="ft-sec-recent">
            <button type="button" class="ft__sec-head" :aria-expanded="!closed.recent" aria-controls="ft-recent" @click="closed.recent = !closed.recent">
              <MiIcon name="chevron-right" :size="11" class="ft__chev" :class="{ 'is-open': !closed.recent }" />
              <span id="ft-sec-recent">Recent</span>
            </button>
            <ul v-show="!closed.recent" id="ft-recent" class="ft__rows">
              <li v-for="r in recent" :key="r.id">
                <button type="button" class="ft__row ft__row--recent" @click="select(r.id)">
                  <span class="ft__kind" :data-kind="byId[r.id]!.kind" aria-hidden="true" />
                  <span class="ft__label">{{ byId[r.id]!.label }}</span>
                  <span class="ft__time">{{ r.ago }}</span>
                </button>
              </li>
            </ul>
          </section>

          <section v-for="sec in visibleSections" :key="sec.id" class="ft__sec" :aria-labelledby="'ft-sec-' + sec.id">
            <button type="button" class="ft__sec-head" :aria-expanded="isSecOpen(sec.id)" :aria-controls="'ft-list-' + sec.id" @click="closed[sec.id] = !closed[sec.id]">
              <MiIcon name="chevron-right" :size="11" class="ft__chev" :class="{ 'is-open': isSecOpen(sec.id) }" />
              <span :id="'ft-sec-' + sec.id">{{ sec.label }}</span>
              <span class="ft__sec-count">{{ q ? sec.hits : sec.total }}</span>
            </button>
            <ul v-show="isSecOpen(sec.id)" :id="'ft-list-' + sec.id" class="ft__rows">
              <li v-for="row in sec.rows" :key="row.node.id" :style="{ '--d': row.depth }">
                <div class="ft__line">
                  <span v-for="n in row.depth" :key="n" class="ft__guide" :style="{ '--g': n - 1 }" aria-hidden="true" />
                  <button
                    v-if="row.node.children" type="button" class="ft__toggle" :aria-expanded="row.open"
                    :aria-label="(row.open ? 'Collapse ' : 'Expand ') + row.node.label" :disabled="!!q" @click="toggle(row.node.id)"
                  >
                    <MiIcon name="chevron-right" :size="11" class="ft__chev" :class="{ 'is-open': row.open }" />
                  </button>
                  <span v-else class="ft__toggle" aria-hidden="true" />
                  <button
                    type="button" class="ft__row" :class="{ 'is-active': selected === row.node.id, 'is-dim': q && !row.hit }"
                    :aria-current="selected === row.node.id ? 'page' : undefined" @click="row.node.children && !q ? toggle(row.node.id) : select(row.node.id)"
                  >
                    <span class="ft__kind" :data-kind="row.node.kind" aria-hidden="true" />
                    <span class="ft__label"><template v-for="(part, pi) in row.parts" :key="pi"><mark v-if="part.hit">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></span>
                    <span v-if="row.node.badge" class="ft__badge" :class="'is-' + row.node.badge.tone">{{ row.node.badge.text }}</span>
                  </button>
                </div>
              </li>
            </ul>
          </section>

          <div v-if="q && !matchCount" class="ft__empty">
            <MiIcon name="search" :size="20" />
            <MiText as="p" variant="footnote" weight="semibold">Nothing matches “{{ query.trim() }}”</MiText>
            <MiText as="p" variant="caption" tone="label2">Try a shorter word, or one of these:</MiText>
            <div class="ft__suggest">
              <MiChip v-for="s in suggestions" :key="s" size="small" tone="neutral" selectable :model-value="false" @update:model-value="query = s">{{ s }}</MiChip>
            </div>
          </div>
        </div>

        <footer class="ft__foot">
          <MiAvatar name="Elif Aydın" size="xs" tone="auto" decorative />
          <span class="ft__foot-name">Elif Aydın</span>
          <span class="ft__total">{{ totalNodes }} items</span>
        </footer>
      </aside>

      <main class="ft__main" aria-labelledby="ft-title">
        <header class="ft__bar">
          <MiIconButton class="ft__back" size="small" variant="gray" label="Back to the tree" @click="detail = false"><MiIcon name="chevron-left" :size="16" /></MiIconButton>
          <ol class="ft__path" aria-label="Location">
            <li v-for="(p, i) in path" :key="p.id" :aria-current="i === path.length - 1 ? 'page' : undefined">{{ p.label }}</li>
          </ol>
        </header>
        <article class="ft__doc">
          <span class="ft__kind ft__kind--lg" :data-kind="current.kind" aria-hidden="true" />
          <MiText id="ft-title" as="h3" variant="title2" weight="bold">{{ current.label }}</MiText>
          <MiText variant="footnote" tone="label2">{{ kindLabel[current.kind] }} · {{ current.meta ?? 'Updated this week' }}</MiText>
          <dl class="ft__facts">
            <div v-for="f in facts" :key="f.k"><dt>{{ f.k }}</dt><dd>{{ f.v }}</dd></div>
          </dl>
          <MiText as="h4" variant="footnote" weight="semibold" tone="label2" class="ft__linked-title">Linked</MiText>
          <ul class="ft__linked">
            <li v-for="l in linked" :key="l.id">
              <button type="button" class="ft__link" @click="select(l.id)">
                <span class="ft__kind" :data-kind="l.kind" aria-hidden="true" />
                <span class="ft__link-label">{{ l.label }}</span>
                <span class="ft__link-sec">{{ sections.find(s => s.id === sectionOf[l.id])?.label }}</span>
                <MiIcon name="chevron-right" :size="13" class="ft__link-chev" />
              </button>
            </li>
          </ul>
        </article>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Kind = 'folder' | 'model' | 'dash' | 'doc' | 'job'
interface Node { id: string, label: string, kind: Kind, meta?: string, badge?: { text: string, tone: 'warn' | 'ok' | 'muted' }, children?: Node[] }
interface Section { id: string, label: string, nodes: Node[] }

const kindLabel: Record<Kind, string> = { folder: 'Folder', model: 'Data model', dash: 'Dashboard', doc: 'Doc', job: 'Scheduled job' }

const sections: Section[] = [
  {
    id: 'models', label: 'Models', nodes: [
      { id: 'finance', label: 'Finance', kind: 'folder', children: [
        { id: 'revenue', label: 'Recognised revenue', kind: 'model', meta: 'Refreshed 06:00' },
        { id: 'arr', label: 'ARR by cohort', kind: 'model', meta: 'Refreshed 06:00' },
        { id: 'invoices', label: 'Invoice ageing', kind: 'model', badge: { text: 'stale', tone: 'warn' } }
      ] },
      { id: 'growth', label: 'Growth', kind: 'folder', children: [
        { id: 'signups', label: 'Daily signups', kind: 'model' },
        { id: 'attribution', label: 'Channel attribution', kind: 'model' },
        { id: 'experiments', label: 'Experiments', kind: 'folder', children: [
          { id: 'exp-pricing', label: 'Pricing page test', kind: 'model', badge: { text: 'live', tone: 'ok' } },
          { id: 'exp-onboard', label: 'Onboarding checklist', kind: 'model' }
        ] }
      ] },
      { id: 'ops', label: 'Operations', kind: 'folder', children: [
        { id: 'tickets', label: 'Support tickets', kind: 'model' },
        { id: 'sla', label: 'SLA breaches', kind: 'model' }
      ] }
    ]
  },
  {
    id: 'dashboards', label: 'Dashboards', nodes: [
      { id: 'board', label: 'Board pack · Q4', kind: 'dash', meta: 'Shared with 6 people' },
      { id: 'weekly', label: 'Weekly business review', kind: 'dash' },
      { id: 'retention', label: 'Retention curves', kind: 'dash' }
    ]
  },
  {
    id: 'pipelines', label: 'Pipelines', nodes: [
      { id: 'nightly', label: 'Nightly warehouse sync', kind: 'job', meta: 'Runs 02:00 UTC', badge: { text: 'failed', tone: 'warn' } },
      { id: 'stream', label: 'Event stream ingest', kind: 'job', badge: { text: 'ok', tone: 'ok' } },
      { id: 'docs', label: 'Docs', kind: 'folder', children: [
        { id: 'metric-defs', label: 'Metric definitions', kind: 'doc' },
        { id: 'runbook', label: 'Pipeline runbook', kind: 'doc' }
      ] }
    ]
  }
]

const byId: Record<string, Node> = {}
const parentOf: Record<string, string | undefined> = {}
const sectionOf: Record<string, string> = {}
function index(nodes: Node[], sec: string, parent?: string) {
  for (const n of nodes) {
    byId[n.id] = n
    parentOf[n.id] = parent
    sectionOf[n.id] = sec
    if (n.children) index(n.children, sec, n.id)
  }
}
sections.forEach(s => index(s.nodes, s.id))
const totalNodes = Object.keys(byId).length

const recent = [{ id: 'exp-pricing', ago: '4m' }, { id: 'nightly', ago: '1h' }, { id: 'board', ago: 'Tue' }]
const suggestions = ['revenue', 'pricing', 'sync']

const query = ref('')
const q = computed(() => query.value.trim().toLowerCase())
const expanded = reactive<Record<string, boolean>>({ growth: true, experiments: true, finance: false })
const closed = reactive<Record<string, boolean>>({ recent: false })
const selected = ref('exp-pricing')
const detail = ref(false)

function clear() { query.value = ''; filterEl.value?.focus() }
function toggle(id: string) { expanded[id] = !expanded[id] }
function select(id: string) {
  selected.value = id
  detail.value = true
  // Opening a match from a filtered list keeps its branch open afterwards.
  for (let p = parentOf[id]; p; p = parentOf[p]) expanded[p] = true
  closed[sectionOf[id]!] = false
}

interface Part { text: string, hit: boolean }
interface Row { node: Node, depth: number, open: boolean, hit: boolean, parts: Part[] }

function split(label: string): Part[] {
  if (!q.value) return [{ text: label, hit: false }]
  const parts: Part[] = []
  const lower = label.toLowerCase()
  let at = 0
  for (let i = lower.indexOf(q.value); i >= 0; i = lower.indexOf(q.value, at)) {
    if (i > at) parts.push({ text: label.slice(at, i), hit: false })
    parts.push({ text: label.slice(i, i + q.value.length), hit: true })
    at = i + q.value.length
  }
  if (at < label.length) parts.push({ text: label.slice(at), hit: false })
  return parts
}
const isHit = (n: Node) => !!q.value && n.label.toLowerCase().includes(q.value)
// A node stays visible while filtering if it matches or any descendant does.
function keeps(n: Node): boolean { return isHit(n) || !!n.children?.some(keeps) }

function flatten(nodes: Node[], depth: number, out: Row[]) {
  for (const n of nodes) {
    if (q.value && !keeps(n)) continue
    const open = q.value ? !!n.children?.some(keeps) : !!expanded[n.id]
    out.push({ node: n, depth, open, hit: isHit(n), parts: split(n.label) })
    if (n.children && open) flatten(n.children, depth + 1, out)
  }
  return out
}

const visibleSections = computed(() => sections
  .map(s => {
    const rows = flatten(s.nodes, 0, [])
    return { id: s.id, label: s.label, rows, hits: rows.filter(r => r.hit).length, total: count(s.nodes) }
  })
  .filter(s => !q.value || s.rows.length))
function count(nodes: Node[]): number { return nodes.reduce((a, n) => a + 1 + (n.children ? count(n.children) : 0), 0) }
const matchCount = computed(() => visibleSections.value.reduce((a, s) => a + s.hits, 0))
const isSecOpen = (id: string) => !!q.value || !closed[id]

const current = computed(() => byId[selected.value]!)
const path = computed(() => {
  const out: Node[] = []
  for (let id: string | undefined = selected.value; id; id = parentOf[id]) out.unshift(byId[id]!)
  const sec = sections.find(s => s.id === sectionOf[selected.value])
  return [{ id: 'sec', label: sec?.label ?? '' }, ...out]
})
const facts = computed(() => {
  const n = current.value
  if (n.kind === 'job') return [{ k: 'Last run', v: n.badge?.tone === 'warn' ? '02:00 · failed after 14 min' : '08:41 · 2.1M events' }, { k: 'Owner', v: 'Data platform' }, { k: 'Retries', v: '2 of 3' }]
  if (n.kind === 'dash') return [{ k: 'Charts', v: '14' }, { k: 'Viewers this week', v: '37' }, { k: 'Owner', v: 'Elif Aydın' }]
  if (n.kind === 'doc') return [{ k: 'Words', v: '2,340' }, { k: 'Owner', v: 'Data platform' }, { k: 'Last edit', v: 'Oct 29' }]
  if (n.kind === 'folder') return [{ k: 'Items', v: String(n.children?.length ?? 0) }, { k: 'Access', v: 'Analysts' }, { k: 'Owner', v: 'Elif Aydın' }]
  return [{ k: 'Rows', v: '1,284,906' }, { k: 'Columns', v: '23' }, { k: 'Freshness', v: n.badge?.tone === 'warn' ? '3 days' : '2 hours' }]
})

// Cross-links jump anywhere in the tree; the target's branch opens on the way.
const links: Record<string, string[]> = {
  'exp-pricing': ['signups', 'board', 'metric-defs'], nightly: ['runbook', 'revenue', 'weekly'], board: ['revenue', 'arr', 'retention'],
  revenue: ['board', 'invoices', 'nightly'], invoices: ['revenue', 'nightly', 'runbook']
}
const linked = computed(() => (links[selected.value] ?? ['weekly', 'stream', 'metric-defs']).filter(id => id !== selected.value).map(id => byId[id]!))

// "/" focuses the filter from anywhere inside the block, unless the user is typing.
const filterEl = ref<HTMLInputElement>()
function onSlash(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null
  if (e.key !== '/' || t?.closest('input, textarea, [contenteditable="true"]')) return
  e.preventDefault()
  filterEl.value?.focus()
}
</script>

<style scoped>
.ft { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.ft__shell { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); height: 640px; overflow: hidden; background: var(--mi-page); }

/* Sidebar: dense, 28px rows */
.ft__side { display: flex; flex-direction: column; min-width: 0; min-height: 0; background: var(--mi-side); }
.ft__head { display: flex; align-items: center; gap: 10px; padding: 14px 12px 12px 14px; }
.ft__logo {
  display: grid; place-items: center; flex: none; width: 28px; height: 28px; border-radius: 8px;
  font-size: 13px; font-weight: 800; color: var(--mi-card); background: var(--mi-label);
}
.ft__head-text { flex: 1; min-width: 0; display: grid; gap: 1px; line-height: 1.2; }
.ft__env { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--mi-label2); }
.ft__env i { width: 6px; height: 6px; border-radius: 50%; background: var(--mi-green); }
.ft__total { font-size: 11.5px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }

.ft__filter {
  position: relative; display: flex; align-items: center; gap: 6px; height: 30px; margin: 0 10px; padding: 0 6px 0 9px;
  border-radius: 8px; background: var(--mi-field); box-shadow: inset 0 0 0 1px var(--mi-field-b);
}
.ft__filter:focus-within { box-shadow: inset 0 0 0 1px var(--mi-p), 0 0 0 3px color-mix(in srgb, var(--mi-p) 22%, transparent); }
.ft__filter-icon { flex: none; color: var(--mi-label3); }
.ft__filter-input { flex: 1; min-width: 0; height: 100%; padding: 0; border: 0; outline: none; background: none; color: var(--mi-label); font: inherit; font-size: 13px; }
.ft__filter-input::placeholder { color: var(--mi-label3); }
.ft__filter-key { flex: none; }
.ft__filter-clear { display: grid; place-items: center; flex: none; width: 18px; height: 18px; padding: 0; border: 0; border-radius: 50%; color: var(--mi-card); background: var(--mi-label3); cursor: pointer; }
.ft__filter-clear:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.ft__status { min-height: 16px; margin: 6px 14px 2px; font-size: 11px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }

.ft__scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 0 6px 10px; scrollbar-width: thin; }
.ft__sec + .ft__sec { margin-top: 6px; }
.ft__sec-head {
  display: flex; align-items: center; gap: 6px; width: 100%; height: 26px; padding: 0 8px; border: 0; border-radius: 6px;
  font: inherit; font-size: 11px; font-weight: 650; letter-spacing: .06em; text-transform: uppercase; color: var(--mi-label2); background: none; cursor: pointer;
}
.ft__sec-head:hover { color: var(--mi-label); }
.ft__sec-head span:first-of-type { flex: 1; text-align: left; }
.ft__sec-count { font-variant-numeric: tabular-nums; font-weight: 500; letter-spacing: 0; color: var(--mi-label3); }
.ft__chev { flex: none; transition: transform var(--mi-dur-2) var(--mi-ease); }
.ft__chev.is-open { transform: rotate(90deg); }

.ft__rows { margin: 0; padding: 0; list-style: none; }
.ft__line { position: relative; display: flex; align-items: center; padding-left: calc(var(--d) * 14px); }
.ft__guide { position: absolute; top: 0; bottom: 0; left: calc(var(--g) * 14px + 13px); width: 1px; background: var(--mi-sep); }
.ft__toggle {
  display: grid; place-items: center; flex: none; width: 20px; height: 28px; margin-left: 4px; padding: 0; border: 0; border-radius: 5px;
  color: var(--mi-label3); background: none; cursor: pointer;
}
.ft__toggle:disabled { cursor: default; }
.ft__toggle:not(:disabled):hover { color: var(--mi-label); }
.ft__row {
  display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; height: 28px; padding: 0 8px 0 4px; border: 0; border-radius: 6px;
  font: inherit; font-size: 13px; color: var(--mi-label); background: none; text-align: left; cursor: pointer;
}
.ft__row:hover { background: var(--mi-fill4); }
.ft__row.is-active { background: var(--mi-p-tint); color: var(--mi-p-text); font-weight: 550; }
.ft__row.is-dim { color: var(--mi-label2); }
.ft__row--recent { width: 100%; padding-left: 26px; box-sizing: border-box; }
.ft__label { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ft__label mark { padding: 0 1px; margin: 0 -1px; border-radius: 3px; color: inherit; font-weight: 650; background: color-mix(in srgb, var(--mi-yellow) 42%, transparent); }
.ft__time { flex: none; font-size: 11px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.ft__badge { flex: none; padding: 1px 6px; border-radius: 5px; font-size: 10.5px; font-weight: 600; line-height: 15px; }
.ft__badge.is-warn { color: var(--mi-orange-t); background: color-mix(in srgb, var(--mi-orange) 14%, transparent); }
.ft__badge.is-ok { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 14%, transparent); }
.ft__row:focus-visible, .ft__toggle:focus-visible, .ft__sec-head:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }

/* Kind glyphs: tiny token-coloured shapes rather than a wall of icons. */
.ft__kind { flex: none; width: 10px; height: 10px; border-radius: 3px; background: var(--mi-label3); }
.ft__kind[data-kind="folder"] { border-radius: 2px 4px 4px 4px; background: color-mix(in srgb, var(--mi-label2) 55%, transparent); }
.ft__kind[data-kind="model"] { border-radius: 50%; background: var(--mi-p); }
.ft__kind[data-kind="dash"] { background: var(--mi-teal); }
.ft__kind[data-kind="doc"] { width: 8px; margin-inline: 1px; background: var(--mi-orange); }
.ft__kind[data-kind="job"] { border-radius: 2px; background: var(--mi-purple); transform: rotate(45deg) scale(.85); }
.ft__kind--lg { width: 14px; height: 14px; margin-bottom: 4px; }
.ft__kind--lg[data-kind="doc"] { width: 11px; }

.ft__empty { display: grid; justify-items: center; gap: 4px; margin: 18px 8px; padding: 20px 12px; border-radius: 12px; text-align: center; color: var(--mi-label3); border: 1px dashed var(--mi-sep); }
.ft__empty p { color: var(--mi-label); }
.ft__empty p + p { color: var(--mi-label2); }
.ft__suggest { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 8px; }

.ft__foot { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-top: 1px solid var(--mi-sep); }
.ft__foot-name { flex: 1; min-width: 0; font-size: 12.5px; font-weight: 550; }

/* Main */
.ft__main {
  position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; gap: 32px; padding: 14px 18px; overflow-y: auto; background: var(--mi-card);
  transform: translateX(102%); visibility: hidden; transition: transform var(--mi-dur-3) var(--mi-ease), visibility 0s linear var(--mi-dur-3);
}
.is-detail .ft__main { transform: none; visibility: visible; transition: transform var(--mi-dur-3) var(--mi-ease); }
.ft__bar { display: flex; align-items: center; gap: 10px; min-width: 0; }
.ft__path { display: flex; flex-wrap: wrap; align-items: center; gap: 2px 0; min-width: 0; margin: 0; padding: 0; list-style: none; font-size: 12.5px; color: var(--mi-label2); }
.ft__path li + li::before { content: "/"; padding: 0 7px; color: var(--mi-label3); }
.ft__path li[aria-current] { color: var(--mi-label); font-weight: 600; }
.ft__doc { display: grid; justify-items: start; gap: 6px; width: 100%; max-width: 620px; }
.ft__facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); width: 100%; margin: 22px 0 0; border-radius: 12px; box-shadow: inset 0 0 0 1px var(--mi-sep); }
.ft__facts div { display: grid; gap: 4px; padding: 12px 14px; min-width: 0; }
.ft__facts div + div { border-left: 1px solid var(--mi-sep); }
.ft__facts dt { font-size: 11px; color: var(--mi-label2); }
.ft__facts dd { margin: 0; font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.ft__linked-title { margin-top: 26px; }
.ft__linked { display: grid; width: 100%; margin: 4px 0 0; padding: 0; list-style: none; }
.ft__link {
  display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 6px; border: 0; border-bottom: 1px solid var(--mi-sep);
  font: inherit; font-size: 14px; color: var(--mi-label); background: none; text-align: left; cursor: pointer;
}
.ft__linked li:first-child .ft__link { border-top: 1px solid var(--mi-sep); }
.ft__link:hover { background: var(--mi-fill4); }
.ft__link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; border-radius: 6px; }
.ft__link-label { flex: 1; min-width: 0; font-weight: 500; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ft__link-sec { flex: none; font-size: 12px; color: var(--mi-label2); }
.ft__link-chev { flex: none; color: var(--mi-label3); transition: transform var(--mi-dur-2) var(--mi-ease); }
.ft__link:hover .ft__link-chev { transform: translateX(2px); }

@container (min-width: 720px) {
  .ft__shell { grid-template-columns: 284px minmax(0, 1fr); }
  .ft__side { border-right: 1px solid var(--mi-sep); }
  .ft__main, .is-detail .ft__main { position: relative; inset: auto; z-index: auto; transform: none; visibility: visible; transition: none; padding: 18px 36px 32px; }
  .ft__back { display: none; }
  .ft__doc { margin-top: 24px; }
}
</style>

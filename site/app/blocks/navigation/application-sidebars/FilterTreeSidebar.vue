<template>
  <div class="ft mi:@container mi:font-mi mi:text-label">
    <div class="ft__shell mi:relative mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:h-160 mi:overflow-hidden mi:[background:var(--mi-page)] mi:@[720px]:grid-cols-[284px_minmax(0,_1fr)]" :class="{ 'is-detail': detail }" @keydown="onSlash">
      <aside class="ft__side mi:flex mi:flex-col mi:min-w-0 mi:min-h-0 mi:[background:var(--mi-side)] mi:@[720px]:border-r mi:@[720px]:border-r-sep" aria-label="Workspace tree">
        <header class="ft__head mi:flex mi:items-center mi:gap-2.5 mi:pt-3.5 mi:pr-3 mi:pb-3 mi:pl-3.5">
          <span class="ft__logo mi:grid mi:place-items-center mi:flex-[none] mi:w-7 mi:h-7 mi:rounded-[8px] mi:text-[13px] mi:font-extrabold mi:text-card mi:[background:var(--mi-label)]" aria-hidden="true">Q</span>
          <div class="ft__head-text mi:flex-1 mi:min-w-0 mi:grid mi:gap-px mi:leading-[1.2]">
            <MiText as="h2" variant="subheadline" weight="bold">Quarry Analytics</MiText>
            <span class="ft__env mi:inline-flex mi:items-center mi:gap-[5px] mi:text-[11.5px] mi:text-label2"><i class="mi:[.ft__env_&]:w-1.5 mi:[.ft__env_&]:h-1.5 mi:[.ft__env_&]:rounded-[50%] mi:[.ft__env_&]:[background:var(--mi-green)]" aria-hidden="true" />eu-west · production</span>
          </div>
          <MiIconButton size="small" variant="plain" label="New item"><MiIcon name="plus" :size="16" /></MiIconButton>
        </header>

        <!-- Live filter: matches are highlighted and their parents open on their own. -->
        <div class="ft__filter mi:relative mi:flex mi:items-center mi:gap-1.5 mi:h-7.5 mi:my-0 mi:mx-2.5 mi:pt-0 mi:pr-1.5 mi:pb-0 mi:pl-[9px] mi:rounded-[8px] mi:[background:var(--mi-field)] mi:shadow-[inset_0_0_0_1px_var(--mi-field-b)] mi:focus-within:shadow-[inset_0_0_0_1px_var(--mi-p),_0_0_0_3px_color-mix(in_srgb,_var(--mi-p)_22%,_transparent)]" :class="{ 'has-query': q }">
          <MiIcon name="search" :size="14" class="ft__filter-icon mi:text-label3" />
          <input
            id="ft-filter" ref="filterEl" v-model="query" class="ft__filter-input mi:flex-1 mi:min-w-0 mi:h-full mi:p-0 mi:[border:0] mi:[outline:none] mi:[background:none] mi:text-label mi:placeholder:text-label3" type="text" autocomplete="off" spellcheck="false"
            placeholder="Filter pages and models" aria-label="Filter the tree" aria-describedby="ft-filter-status" @keydown.esc="query = ''"
          >
          <MiKbd v-if="!q" class="ft__filter-key mi:flex-[none]">/</MiKbd>
          <button v-else type="button" class="ft__filter-clear mi:grid mi:place-items-center mi:flex-[none] mi:w-4.5 mi:h-4.5 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:text-card mi:[background:var(--mi-label3)] mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" aria-label="Clear filter" @click="clear"><MiIcon name="close" :size="12" /></button>
        </div>
        <p id="ft-filter-status" class="ft__status mi:min-h-4 mi:mt-1.5 mi:mx-3.5 mi:mb-0.5 mi:text-[11px] mi:text-label2 mi:tabular-nums" aria-live="polite">
          <template v-if="q">{{ matchCount }} {{ matchCount === 1 ? 'match' : 'matches' }} for “{{ query.trim() }}”</template>
        </p>

        <div class="ft__scroll mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:pt-0 mi:px-1.5 mi:pb-2.5 mi:[scrollbar-width:thin]">
          <section v-if="!q" class="ft__sec mi:[.ft__sec+&]:mt-1.5" aria-labelledby="ft-sec-recent">
            <button type="button" class="ft__sec-head mi:flex mi:items-center mi:gap-1.5 mi:w-full mi:h-6.5 mi:py-0 mi:px-2 mi:[border:0] mi:rounded-[6px] mi:tracking-[.06em] mi:uppercase mi:text-label2 mi:[background:none] mi:cursor-pointer mi:hover:text-label mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :aria-expanded="!closed.recent" aria-controls="ft-recent" @click="closed.recent = !closed.recent">
              <MiIcon name="chevron-right" :size="11" class="ft__chev mi:[.ft__sec-head_span&:first-of-type]:text-left mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="{ 'is-open': !closed.recent }" />
              <span class="mi:[.ft__sec-head_span&:first-of-type]:text-left" id="ft-sec-recent">Recent</span>
            </button>
            <ul v-show="!closed.recent" id="ft-recent" class="ft__rows mi:m-0 mi:p-0 mi:[list-style:none]">
              <li v-for="r in recent" :key="r.id">
                <button type="button" class="ft__row ft__row--recent mi:flex mi:items-center mi:gap-2 mi:flex-1 mi:min-w-0 mi:h-7 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-1 mi:[border:0] mi:rounded-[6px] mi:text-label mi:[background:none] mi:text-left mi:cursor-pointer mi:[&.is-active]:text-p-text mi:[&.is-dim]:text-label2 mi:w-full mi:pl-6.5 mi:box-border mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" @click="select(r.id)">
                  <span class="ft__kind mi:flex-[none] mi:w-2.5 mi:h-2.5 mi:rounded-[3px] mi:[background:var(--mi-label3)] mi:[&[data-kind='folder']]:rounded-[2px_4px_4px_4px] mi:[&[data-kind='doc']]:w-2 mi:[&[data-kind='doc']]:mx-px mi:[&[data-kind='job']]:transform-[rotate(45deg)_scale(.85)]" :data-kind="byId[r.id]!.kind" aria-hidden="true" />
                  <span class="ft__label mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">{{ byId[r.id]!.label }}</span>
                  <span class="ft__time mi:flex-[none] mi:text-[11px] mi:text-label3 mi:tabular-nums">{{ r.ago }}</span>
                </button>
              </li>
            </ul>
          </section>

          <section v-for="sec in visibleSections" :key="sec.id" class="ft__sec mi:[.ft__sec+&]:mt-1.5" :aria-labelledby="'ft-sec-' + sec.id">
            <button type="button" class="ft__sec-head mi:flex mi:items-center mi:gap-1.5 mi:w-full mi:h-6.5 mi:py-0 mi:px-2 mi:[border:0] mi:rounded-[6px] mi:tracking-[.06em] mi:uppercase mi:text-label2 mi:[background:none] mi:cursor-pointer mi:hover:text-label mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :aria-expanded="isSecOpen(sec.id)" :aria-controls="'ft-list-' + sec.id" @click="closed[sec.id] = !closed[sec.id]">
              <MiIcon name="chevron-right" :size="11" class="ft__chev mi:[.ft__sec-head_span&:first-of-type]:text-left mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="{ 'is-open': isSecOpen(sec.id) }" />
              <span class="mi:[.ft__sec-head_span&:first-of-type]:text-left" :id="'ft-sec-' + sec.id">{{ sec.label }}</span>
              <span class="ft__sec-count mi:[.ft__sec-head_span&:first-of-type]:text-left mi:tabular-nums mi:font-medium mi:tracking-[0] mi:text-label3">{{ q ? sec.hits : sec.total }}</span>
            </button>
            <ul v-show="isSecOpen(sec.id)" :id="'ft-list-' + sec.id" class="ft__rows mi:m-0 mi:p-0 mi:[list-style:none]">
              <li v-for="row in sec.rows" :key="row.node.id" :style="{ '--d': row.depth }">
                <div class="ft__line mi:relative mi:flex mi:items-center mi:pl-[calc(var(--d)_*_14px)]">
                  <span v-for="n in row.depth" :key="n" class="ft__guide mi:absolute mi:top-0 mi:bottom-0 mi:left-[calc(var(--g)_*_14px_+_13px)] mi:w-px mi:[background:var(--mi-sep)]" :style="{ '--g': n - 1 }" aria-hidden="true" />
                  <button
                    v-if="row.node.children" type="button" class="ft__toggle mi:grid mi:place-items-center mi:flex-[none] mi:w-5 mi:h-7 mi:ml-1 mi:p-0 mi:[border:0] mi:rounded-[5px] mi:text-label3 mi:[background:none] mi:cursor-pointer mi:disabled:cursor-default mi:[&:not(:disabled):hover]:text-label mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :aria-expanded="row.open"
                    :aria-label="(row.open ? 'Collapse ' : 'Expand ') + row.node.label" :disabled="!!q" @click="toggle(row.node.id)"
                  >
                    <MiIcon name="chevron-right" :size="11" class="ft__chev mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="{ 'is-open': row.open }" />
                  </button>
                  <span v-else class="ft__toggle mi:grid mi:place-items-center mi:flex-[none] mi:w-5 mi:h-7 mi:ml-1 mi:p-0 mi:[border:0] mi:rounded-[5px] mi:text-label3 mi:[background:none] mi:cursor-pointer mi:disabled:cursor-default mi:[&:not(:disabled):hover]:text-label mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" aria-hidden="true" />
                  <button
                    type="button" class="ft__row mi:flex mi:items-center mi:gap-2 mi:flex-1 mi:min-w-0 mi:h-7 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-1 mi:[border:0] mi:rounded-[6px] mi:text-label mi:[background:none] mi:text-left mi:cursor-pointer mi:[&.is-active]:text-p-text mi:[&.is-dim]:text-label2 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :class="{ 'is-active': selected === row.node.id, 'is-dim': q && !row.hit }"
                    :aria-current="selected === row.node.id ? 'page' : undefined" @click="row.node.children && !q ? toggle(row.node.id) : select(row.node.id)"
                  >
                    <span class="ft__kind mi:flex-[none] mi:w-2.5 mi:h-2.5 mi:rounded-[3px] mi:[background:var(--mi-label3)] mi:[&[data-kind='folder']]:rounded-[2px_4px_4px_4px] mi:[&[data-kind='doc']]:w-2 mi:[&[data-kind='doc']]:mx-px mi:[&[data-kind='job']]:transform-[rotate(45deg)_scale(.85)]" :data-kind="row.node.kind" aria-hidden="true" />
                    <span class="ft__label mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis"><template v-for="(part, pi) in row.parts" :key="pi"><mark class="mi:[.ft__label_&]:rounded-[3px] mi:[.ft__label_&]:[background:color-mix(in_srgb,_var(--mi-yellow)_42%,_transparent)]" v-if="part.hit">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></span>
                    <span v-if="row.node.badge" class="ft__badge mi:flex-[none] mi:py-px mi:px-1.5 mi:rounded-[5px] mi:text-[10.5px] mi:font-semibold mi:leading-[15px]" :class="'is-' + row.node.badge.tone">{{ row.node.badge.text }}</span>
                  </button>
                </div>
              </li>
            </ul>
          </section>

          <div v-if="q && !matchCount" class="ft__empty mi:grid mi:justify-items-center mi:gap-1 mi:my-4.5 mi:mx-2 mi:py-5 mi:px-3 mi:rounded-[12px] mi:text-center mi:text-label3 mi:[border:1px_dashed_var(--mi-sep)]">
            <MiIcon name="search" :size="20" />
            <MiText as="p" variant="footnote" weight="semibold">Nothing matches “{{ query.trim() }}”</MiText>
            <MiText as="p" variant="caption" tone="label2">Try a shorter word, or one of these:</MiText>
            <div class="ft__suggest mi:flex mi:flex-wrap mi:justify-center mi:gap-1.5 mi:mt-2">
              <MiChip v-for="s in suggestions" :key="s" size="small" tone="neutral" selectable :model-value="false" @update:model-value="query = s">{{ s }}</MiChip>
            </div>
          </div>
        </div>

        <footer class="ft__foot mi:flex mi:items-center mi:gap-2 mi:py-2.5 mi:px-3.5 mi:border-t mi:border-t-sep">
          <MiAvatar name="Elif Aydın" size="xs" tone="auto" decorative />
          <span class="ft__foot-name mi:flex-1 mi:min-w-0 mi:text-[12.5px] mi:font-550">Elif Aydın</span>
          <span class="ft__total mi:text-[11.5px] mi:text-label3 mi:tabular-nums">{{ totalNodes }} items</span>
        </footer>
      </aside>

      <main class="ft__main mi:absolute mi:inset-0 mi:z-2 mi:flex mi:flex-col mi:gap-8 mi:py-3.5 mi:px-4.5 mi:overflow-y-auto mi:[background:var(--mi-card)] mi:transform-[translateX(102%)] mi:invisible mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease),_visibility_0s_linear_var(--mi-dur-3)] mi:[.is-detail_&]:transform-none mi:[.is-detail_&]:visible mi:[.is-detail_&]:[transition:transform_var(--mi-dur-3)_var(--mi-ease)] mi:@[720px]:relative mi:@[720px]:inset-auto mi:@[720px]:z-[auto] mi:@[720px]:transform-none mi:@[720px]:visible mi:@[720px]:[transition:none] mi:@[720px]:pt-4.5 mi:@[720px]:px-9 mi:@[720px]:pb-8 mi:@[720px]:[.is-detail_&]:relative mi:@[720px]:[.is-detail_&]:inset-auto mi:@[720px]:[.is-detail_&]:z-[auto] mi:@[720px]:[.is-detail_&]:transform-none mi:@[720px]:[.is-detail_&]:visible mi:@[720px]:[.is-detail_&]:[transition:none] mi:@[720px]:[.is-detail_&]:pt-4.5 mi:@[720px]:[.is-detail_&]:px-9 mi:@[720px]:[.is-detail_&]:pb-8" aria-labelledby="ft-title">
        <header class="ft__bar mi:flex mi:items-center mi:gap-2.5 mi:min-w-0">
          <MiIconButton class="ft__back" size="small" variant="gray" label="Back to the tree" @click="detail = false"><MiIcon name="chevron-left" :size="16" /></MiIconButton>
          <ol class="ft__path mi:flex mi:flex-wrap mi:items-center mi:gap-y-0.5 mi:gap-x-0 mi:min-w-0 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[12.5px] mi:text-label2" aria-label="Location">
            <li class="mi:[.ft__path_&[aria-current]]:text-label mi:[.ft__path_&[aria-current]]:font-semibold" v-for="(p, i) in path" :key="p.id" :aria-current="i === path.length - 1 ? 'page' : undefined">{{ p.label }}</li>
          </ol>
        </header>
        <article class="ft__doc mi:grid mi:justify-items-start mi:gap-1.5 mi:w-full mi:max-w-155 mi:@[720px]:mt-6">
          <span class="ft__kind ft__kind--lg mi:flex-[none] mi:w-2.5 mi:h-2.5 mi:rounded-[3px] mi:[background:var(--mi-label3)] mi:[&[data-kind='folder']]:rounded-[2px_4px_4px_4px] mi:[&[data-kind='doc']]:w-2 mi:[&[data-kind='doc']]:mx-px mi:[&[data-kind='job']]:transform-[rotate(45deg)_scale(.85)] mi:w-3.5 mi:h-3.5 mi:mb-1 mi:[&[data-kind='doc']]:w-[11px]" :data-kind="current.kind" aria-hidden="true" />
          <MiText id="ft-title" as="h3" variant="title2" weight="bold">{{ current.label }}</MiText>
          <MiText variant="footnote" tone="label2">{{ kindLabel[current.kind] }} · {{ current.meta ?? 'Updated this week' }}</MiText>
          <dl class="ft__facts mi:grid mi:grid-cols-3 mi:w-full mi:mt-5.5 mi:mx-0 mi:mb-0 mi:rounded-[12px] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]">
            <div class="mi:[.ft__facts_&]:gap-1 mi:[.ft__facts_&]:min-w-0" v-for="f in facts" :key="f.k"><dt class="mi:[.ft__facts_&]:text-[11px]">{{ f.k }}</dt><dd class="mi:[.ft__facts_&]:text-[14px] mi:[.ft__facts_&]:tabular-nums mi:[.ft__facts_&]:wrap-anywhere">{{ f.v }}</dd></div>
          </dl>
          <MiText as="h4" variant="footnote" weight="semibold" tone="label2" class="ft__linked-title">Linked</MiText>
          <ul class="ft__linked mi:grid mi:w-full mi:mt-1 mi:mx-0 mi:mb-0 mi:p-0 mi:[list-style:none]">
            <li v-for="l in linked" :key="l.id">
              <button type="button" class="ft__link mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:py-[11px] mi:px-1.5 mi:text-label mi:[background:none] mi:text-left mi:cursor-pointer mi:[.ft__linked_li:first-child_&]:border-t mi:[.ft__linked_li:first-child_&]:border-t-sep mi:hover:[background:var(--mi-fill4)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:focus-visible:rounded-[6px]" @click="select(l.id)">
                <span class="ft__kind mi:flex-[none] mi:w-2.5 mi:h-2.5 mi:rounded-[3px] mi:[background:var(--mi-label3)] mi:[&[data-kind='folder']]:rounded-[2px_4px_4px_4px] mi:[&[data-kind='doc']]:w-2 mi:[&[data-kind='doc']]:mx-px mi:[&[data-kind='job']]:transform-[rotate(45deg)_scale(.85)]" :data-kind="l.kind" aria-hidden="true" />
                <span class="ft__link-label mi:flex-1 mi:min-w-0 mi:font-medium mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">{{ l.label }}</span>
                <span class="ft__link-sec mi:flex-[none] mi:text-[12px] mi:text-label2">{{ sections.find(s => s.id === sectionOf[l.id])?.label }}</span>
                <MiIcon name="chevron-right" :size="13" class="ft__link-chev mi:text-label3 mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" />
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
.ft__filter-icon { flex: none; }
.ft__filter-input { font: inherit; font-size: 13px; }
.ft__sec-head {
  font: inherit; font-size: 11px; font-weight: 650;
}
.ft__sec-head span:first-of-type { flex: 1; }
.ft__chev { flex: none; }
.ft__chev.is-open { transform: rotate(90deg); }
.ft__row {
  font: inherit; font-size: 13px;
}
.ft__row:hover { background: var(--mi-fill4); }
.ft__row.is-active { background: var(--mi-p-tint); font-weight: 550; }
.ft__label mark { padding: 0 1px; margin: 0 -1px; color: inherit; font-weight: 650; }
.ft__badge.is-warn { color: var(--mi-orange-t); background: color-mix(in srgb, var(--mi-orange) 14%, transparent); }
.ft__badge.is-ok { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 14%, transparent); }
.ft__kind[data-kind="folder"] { background: color-mix(in srgb, var(--mi-label2) 55%, transparent); }
.ft__kind[data-kind="model"] { border-radius: 50%; background: var(--mi-p); }
.ft__kind[data-kind="dash"] { background: var(--mi-teal); }
.ft__kind[data-kind="doc"] { background: var(--mi-orange); }
.ft__kind[data-kind="job"] { border-radius: 2px; background: var(--mi-purple); }
.ft__empty p { color: var(--mi-label); }
.ft__empty p + p { color: var(--mi-label2); }
.ft__path li + li::before { content: "/"; padding: 0 7px; color: var(--mi-label3); }
.ft__facts div { display: grid; padding: 12px 14px; }
.ft__facts div + div { border-left: 1px solid var(--mi-sep); }
.ft__facts dt { color: var(--mi-label2); }
.ft__facts dd { margin: 0; font-weight: 600; }
.ft__linked-title { margin-top: 26px; }
.ft__link { border: 0; border-bottom: 1px solid var(--mi-sep);
  font: inherit; font-size: 14px;
}
.ft__link-chev { flex: none; }
.ft__link:hover .ft__link-chev { transform: translateX(2px); }

@container (min-width: 720px) {
  .ft__back { display: none; }
}
</style>

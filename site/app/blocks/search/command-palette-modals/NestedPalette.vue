<template>
  <section class="npal mi:[--npal-t3:color-mix(in_srgb,_var(--mi-label2)_78%,_transparent)] mi:@container mi:grid mi:content-start mi:font-mi mi:text-label" aria-labelledby="npal-title">
    <h2 id="npal-title" class="npal__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Issue command palette</h2>

    <div class="npal__stage mi:relative mi:grid mi:[place-items:start_center] mi:min-h-130 mi:pt-11 mi:px-3 mi:pb-6 mi:rounded-xl mi:overflow-hidden mi:isolate mi:[background:var(--mi-page)] mi:@[560px]:pt-16 mi:@[560px]:px-8 mi:@[560px]:pb-8">
      <!-- Faux issue tracker behind the palette: token shapes only, blurred once, never animated. -->
      <div class="npal__app mi:absolute mi:inset-0 mi:-z-2 mi:grid mi:content-start mi:gap-0.5 mi:p-4.5 mi:[filter:blur(2.5px)]" aria-hidden="true">
        <div class="npal__app-bar mi:flex mi:gap-2.5 mi:mb-3.5"><i class="mi:[.npal__app-bar_&]:h-6 mi:[.npal__app-bar_&]:w-[18%] mi:[.npal__app-bar_&]:rounded-md mi:[.npal__app-bar_&]:[background:var(--mi-fill3)] mi:[.npal__app-bar_&:last-child]:ml-auto mi:[.npal__app-bar_&:last-child]:w-[10%] mi:[.npal__app-bar_&:last-child]:opacity-45" /><i class="mi:[.npal__app-bar_&]:h-6 mi:[.npal__app-bar_&]:w-[18%] mi:[.npal__app-bar_&]:rounded-md mi:[.npal__app-bar_&]:[background:var(--mi-fill3)] mi:[.npal__app-bar_&:last-child]:ml-auto mi:[.npal__app-bar_&:last-child]:w-[10%] mi:[.npal__app-bar_&:last-child]:opacity-45" /><i class="mi:[.npal__app-bar_&]:h-6 mi:[.npal__app-bar_&]:w-[18%] mi:[.npal__app-bar_&]:rounded-md mi:[.npal__app-bar_&]:[background:var(--mi-fill3)] mi:[.npal__app-bar_&:last-child]:ml-auto mi:[.npal__app-bar_&:last-child]:w-[10%] mi:[.npal__app-bar_&:last-child]:opacity-45" /></div>
        <div v-for="n in 9" :key="n" class="npal__app-row mi:grid mi:grid-cols-[14px_64px_1fr_80px] mi:items-center mi:gap-3.5 mi:h-10 mi:py-0 mi:px-3 mi:rounded-md mi:[background:var(--mi-card)] mi:[&.is-hit]:shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,_var(--mi-p)_60%,_transparent)]" :class="{ 'is-hit': n === 3 }"><b class="mi:[.npal__app-row_&]:w-3.5 mi:[.npal__app-row_&]:rounded-[50%] mi:[.npal__app-row_&]:border-2 mi:[.npal__app-row_&]:border-label3" /><i class="mi:[.npal__app-row_&]:rounded-[5px] mi:[.npal__app-row_&]:[background:var(--mi-fill2)]" /><i class="mi:[.npal__app-row_&]:rounded-[5px] mi:[.npal__app-row_&]:[background:var(--mi-fill2)]" /><s class="mi:[.npal__app-row_&]:rounded-[9px] mi:[.npal__app-row_&]:[background:var(--mi-fill3)]" /></div>
      </div>
      <div class="npal__scrim mi:absolute mi:inset-0 mi:-z-1 mi:[background:color-mix(in_srgb,_var(--mi-page)_50%,_transparent)]" aria-hidden="true" />

      <div v-if="open" class="npal__wrap mi:relative mi:w-full mi:max-w-150">
        <!-- One faint sheet per page pushed, peeking above the palette: depth you can see. -->
        <TransitionGroup name="npal-layer" tag="div" class="npal__stack mi:absolute mi:inset-0 mi:z-0 mi:pointer-events-none" aria-hidden="true">
          <i class="mi:[.npal__stack_&]:absolute mi:[.npal__stack_&]:inset-0 mi:[.npal__stack_&]:border mi:[.npal__stack_&]:border-sep mi:[.npal__stack_&]:shadow-2 mi:[.npal__stack_&]:transform-[translateY(calc(var(--d)_*_-11px))_scale(calc(1_-_var(--d)_*_.05))] mi:[.npal__stack_&]:opacity-[calc(1_-_var(--d)_*_.25)] mi:[.npal__stack_&]:origin-[50%_0] mi:[.npal__stack_&]:[transition:transform_var(--mi-dur-3)_var(--mi-spring),_opacity_var(--mi-dur-2)_var(--mi-ease)]" v-for="d in stack.length - 1" :key="d" :style="{ '--d': stack.length - d }" />
        </TransitionGroup>

        <div class="npal__palette mi:relative mi:z-1 mi:grid mi:rounded-xl mi:overflow-hidden mi:[background:var(--mi-elev)] mi:border mi:border-sep mi:shadow-3" role="dialog" aria-modal="false" aria-labelledby="npal-title">
          <div class="npal__search mi:flex mi:flex-wrap mi:items-center mi:gap-y-2 mi:gap-x-1.5 mi:py-3 mi:px-3.5 mi:border-b mi:border-b-sep">
            <ol class="npal__crumbs mi:flex mi:flex-wrap mi:items-center mi:gap-1 mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Palette path">
              <li class="mi:[.npal__crumbs_&]:items-center mi:[.npal__crumbs_&]:gap-1" v-for="(f, i) in stack" :key="i">
                <button
                  v-if="i < stack.length - 1" type="button" class="npal__crumb mi:inline-flex mi:items-center mi:h-6 mi:py-0 mi:px-[9px] mi:[border:0] mi:rounded-[7px] mi:text-label2 mi:[background:var(--mi-fill3)] mi:whitespace-nowrap mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:[&.is-root]:tracking-[.01em] mi:[&.is-current]:text-p-text mi:[&.is-current]:[background:var(--mi-p-tint)] mi:[&.is-current]:cursor-default" :class="{ 'is-root': i === 0 }"
                  :aria-label="i === 0 ? `Back to all actions for ${issue.key}` : `Back to ${f.title}`" @click="popTo(i)"
                >
                  {{ i === 0 ? issue.key : f.title }}
                </button>
                <span v-else class="npal__crumb is-current mi:inline-flex mi:items-center mi:h-6 mi:py-0 mi:px-[9px] mi:[border:0] mi:rounded-[7px] mi:text-label2 mi:[background:var(--mi-fill3)] mi:whitespace-nowrap mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:[&.is-root]:tracking-[.01em] mi:[&.is-current]:text-p-text mi:[&.is-current]:[background:var(--mi-p-tint)] mi:[&.is-current]:cursor-default" :class="{ 'is-root': i === 0 }" aria-current="page">{{ i === 0 ? issue.key : f.title }}</span>
              </li>
            </ol>
            <div class="npal__field mi:flex mi:flex-[1_1_200px] mi:items-center mi:gap-2 mi:min-w-0">
              <MiIcon name="search" :size="17" class="npal__glass mi:text-(--npal-t3)" />
              <input
                ref="input" v-model="query" class="npal__input mi:flex-1 mi:min-w-0 mi:h-7 mi:p-0 mi:[border:0] mi:[outline:none] mi:[background:none] mi:text-label mi:placeholder:text-(--npal-t3)" type="text" role="combobox" aria-expanded="true" aria-autocomplete="list"
                aria-controls="npal-list" :aria-activedescendant="activeId" :aria-label="`${top.title}: type to filter`"
                :placeholder="top.placeholder" autocomplete="off" spellcheck="false" @keydown="onKey"
              >
            </div>
          </div>

          <Transition :name="`npal-${dir}`" mode="out-in">
            <div id="npal-list" :key="stack.length + top.page" class="npal__list mi:h-75 mi:overflow-y-auto mi:overscroll-contain mi:p-1.5" role="listbox" :aria-label="top.title">
              <template v-for="g in groups" :key="g.label">
                <div role="group" :aria-labelledby="`npal-g-${slug(g.label)}`" class="npal__group mi:[.npal__group+&]:mt-1.5 mi:[.npal__group+&]:pt-1.5 mi:[.npal__group+&]:border-t mi:[.npal__group+&]:border-t-sep">
                  <div :id="`npal-g-${slug(g.label)}`" class="npal__group-label mi:pt-2 mi:px-2.5 mi:pb-1.5 mi:text-[11px] mi:font-semibold mi:tracking-[.04em] mi:uppercase mi:text-(--npal-t3) mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ g.label }}</div>
                  <div
                    v-for="o in g.items" :id="`npal-opt-${o.id}`" :key="o.id" role="option" class="npal__opt mi:flex mi:items-center mi:gap-2.5 mi:min-h-10 mi:py-1.5 mi:px-2.5 mi:rounded-md mi:text-[14px] mi:cursor-pointer mi:[scroll-margin:6px] mi:[&.is-active]:[background:var(--mi-fill3)] mi:[&.is-active]:shadow-[inset_2px_0_0_var(--mi-p)]"
                    :class="{ 'is-active': o.id === active?.id }" :aria-selected="o.id === active?.id" @mousemove="hover(o.id)" @click="choose(o)"
                  >
                    <span class="npal__ico mi:grid mi:place-items-center mi:flex-[none] mi:w-6.5 mi:h-6.5 mi:rounded-[7px] mi:text-label2 mi:[background:var(--mi-fill4)] mi:[&[data-kind='person']]:[background:none] mi:[.npal__opt.is-active_&[data-kind='mi']]:text-p-text mi:[.npal__opt.is-active_&[data-kind='mi']]:[background:var(--mi-p-tint)]" :data-kind="o.icon.kind" :data-v="o.icon.v">
                      <MiAvatar class="mi:[.npal__ico[data-v='progress']_i&]:p-0.5 mi:[.npal__ico[data-v='review']_i&]:p-0.5" v-if="o.icon.kind === 'person'" :name="o.icon.v" size="xs" tone="auto" decorative />
                      <MiIcon class="mi:[.npal__ico[data-v='progress']_i&]:p-0.5 mi:[.npal__ico[data-v='review']_i&]:p-0.5" v-else-if="o.icon.kind === 'mi'" :name="o.icon.name" :size="16" />
                      <span v-else-if="o.icon.kind === 'prio'" class="npal__bars mi:inline-flex mi:[align-items:flex-end] mi:gap-0.5 mi:h-3"><i class="mi:[.npal__ico[data-v='progress']_i&]:p-0.5 mi:[.npal__ico[data-v='review']_i&]:p-0.5 mi:[.npal__bars_&]:w-[3px]" v-for="n in 3" :key="n" :class="{ on: n <= Number(o.icon.v) }" /></span>
                      <i class="mi:[.npal__ico[data-v='progress']_i&]:p-0.5 mi:[.npal__ico[data-v='review']_i&]:p-0.5" v-else />
                    </span>
                    <span class="npal__label mi:flex mi:flex-1 mi:items-baseline mi:gap-2 mi:min-w-0 mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">{{ o.label }}<small class="mi:[.npal__label_&]:overflow-hidden mi:[.npal__label_&]:text-ellipsis mi:[.npal__label_&]:text-[12px] mi:[.npal__label_&]:text-(--npal-t3) mi:[.npal__label_&]:tabular-nums" v-if="o.hint">{{ o.hint }}</small></span>
                    <span v-if="o.current" class="npal__now mi:inline-flex mi:flex-[none] mi:items-center mi:text-p-text">
                      <MiIcon name="check" :size="14" />
                      <span class="npal__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">current</span>
                    </span>
                    <span v-if="o.value" class="npal__value mi:flex-[none] mi:max-w-[40%] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[12px] mi:text-label2">{{ o.value }}</span>
                    <MiKbdGroup v-if="o.kbd" class="npal__kbd mi:@[560px]:flex-[none]"><MiKbd v-for="k in o.kbd" :key="k">{{ k }}</MiKbd></MiKbdGroup>
                    <MiIcon v-if="o.push" name="chevron-right" :size="15" class="npal__push mi:text-(--npal-t3) mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:[.npal__opt.is-active_&]:text-label" />
                  </div>
                </div>
              </template>
              <p v-if="!groups.length" class="npal__empty mi:m-0 mi:py-10 mi:px-4 mi:text-center mi:text-[13px] mi:text-label2">Nothing matches “{{ query }}”.</p>
            </div>
          </Transition>

          <footer class="npal__foot mi:flex mi:flex-wrap mi:items-center mi:gap-y-2 mi:gap-x-3.5 mi:min-h-10.5 mi:py-2 mi:px-3.5 mi:border-t mi:border-t-sep mi:text-[12px] mi:text-label2 mi:[background:color-mix(in_srgb,_var(--mi-fill4)_50%,_transparent)]">
            <span class="npal__hint mi:inline-flex mi:items-center mi:gap-1.5"><MiKbdGroup><MiKbd>↑</MiKbd><MiKbd>↓</MiKbd></MiKbdGroup> move</span>
            <span class="npal__hint mi:inline-flex mi:items-center mi:gap-1.5"><MiKbd>↵</MiKbd> {{ active?.push ? 'open' : 'select' }}</span>
            <span v-if="stack.length > 1" class="npal__hint mi:inline-flex mi:items-center mi:gap-1.5"><MiKbd>⌫</MiKbd> back</span>
            <span class="npal__hint mi:inline-flex mi:items-center mi:gap-1.5"><MiKbd>esc</MiKbd> {{ stack.length > 1 ? 'up' : 'close' }}</span>
            <Transition name="npal-done">
              <span v-if="done" :key="done" class="npal__done mi:inline-flex mi:items-center mi:gap-1.5 mi:ml-auto mi:font-medium mi:text-green-t"><MiIcon name="check-circle-fill" :size="14" />{{ done }}</span>
            </Transition>
          </footer>
        </div>
      </div>

      <div v-else class="npal__closed mi:grid mi:place-items-center mi:min-h-110">
        <MiButton variant="gray" size="small" @click="reopen">
          Reopen palette
          <template #trailing><MiKbdGroup><MiKbd>⌘</MiKbd><MiKbd>K</MiKbd></MiKbdGroup></template>
        </MiButton>
      </div>
    </div>
    <p class="npal__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" role="status" aria-live="polite">{{ announce }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'

type Page = 'root' | 'project' | 'cycle' | 'status' | 'assignee' | 'priority'
type Status = 'backlog' | 'todo' | 'progress' | 'review' | 'done' | 'canceled'
type Icon =
  | { kind: 'mi', name: 'folder' | 'person' | 'copy' | 'archive' | 'calendar' | 'tray', v?: string }
  | { kind: 'status', v: Status }
  | { kind: 'prio', v: string }
  | { kind: 'project', v: string }
  | { kind: 'person', v: string }
interface Opt { id: string, label: string, hint?: string, icon: Icon, value?: string, current?: boolean, kbd?: string[], push?: Page, run?: () => string, keywords?: string }
interface Group { label: string, items: Opt[] }
interface Frame { page: Page, title: string, placeholder: string, arg?: string }

// The issue the palette acts on; every choice writes back here, and the root page reflects it.
const issue = reactive({ key: 'LUM-482', title: 'Saved cards fail on checkout retry', project: 'payments', cycle: 'Cycle 24', status: 'progress' as Status, assignee: 'Maya Lindqvist', priority: 3 })

const projects = [
  { id: 'checkout', name: 'Checkout redesign', team: 'Web', open: 14, color: 'p' },
  { id: 'payments', name: 'Payments platform', team: 'Core', open: 31, color: 's' },
  { id: 'android', name: 'Android 5.2 release', team: 'Mobile', open: 27, color: 'green' },
  { id: 'billing', name: 'Billing migration', team: 'Core', open: 5, color: 'orange' },
  { id: 'ds', name: 'Design system v3', team: 'Design', open: 18, color: 'pink' },
  { id: 'onboarding', name: 'Onboarding revamp', team: 'Growth', open: 9, color: 'purple' }
]
const cycles = [
  { id: 'Cycle 24', hint: 'Nov 4 – Nov 17 · current' },
  { id: 'Cycle 25', hint: 'Nov 18 – Dec 1' },
  { id: 'Cycle 26', hint: 'Dec 2 – Dec 15' },
  { id: 'No cycle', hint: 'Keep it in the backlog' }
]
const statuses: { id: Status, label: string }[] = [
  { id: 'backlog', label: 'Backlog' }, { id: 'todo', label: 'Todo' }, { id: 'progress', label: 'In progress' },
  { id: 'review', label: 'In review' }, { id: 'done', label: 'Done' }, { id: 'canceled', label: 'Canceled' }
]
const people = ['Maya Lindqvist', 'Kofi Asante', 'Inès Moreau', 'Daniel Okafor', 'Hana Sato']
const priorities = [{ v: 4, label: 'Urgent' }, { v: 3, label: 'High' }, { v: 2, label: 'Medium' }, { v: 1, label: 'Low' }, { v: 0, label: 'No priority' }]

const projectName = (id: string) => projects.find(p => p.id === id)?.name ?? id
const statusLabel = (s: Status) => statuses.find(x => x.id === s)!.label
const prioLabel = (v: number) => priorities.find(p => p.v === v)!.label
const first = (name: string) => `${name.split(' ')[0]} ${name.split(' ')[1]?.[0] ?? ''}.`

function pageGroups(f: Frame): Group[] {
  switch (f.page) {
    case 'root': return [
      { label: issue.title, items: [
        { id: 'move', label: 'Move to project…', icon: { kind: 'mi', name: 'folder' }, value: projectName(issue.project), push: 'project', keywords: 'transfer team' },
        { id: 'status', label: 'Change status…', icon: { kind: 'status', v: issue.status }, value: statusLabel(issue.status), push: 'status', keywords: 'state done progress' },
        { id: 'assign', label: 'Assign to…', icon: { kind: 'mi', name: 'person' }, value: first(issue.assignee), push: 'assignee', keywords: 'owner person' },
        { id: 'prio', label: 'Set priority…', icon: { kind: 'prio', v: String(Math.min(3, issue.priority)) }, value: prioLabel(issue.priority), push: 'priority', keywords: 'urgent high low' }
      ] },
      { label: 'Actions', items: [
        { id: 'copy', label: 'Copy issue link', icon: { kind: 'mi', name: 'copy' }, kbd: ['⌘', '⇧', 'C'], run: () => `Copied the link to ${issue.key}` },
        { id: 'archive', label: 'Archive issue', icon: { kind: 'mi', name: 'archive' }, kbd: ['⌘', '⌫'], run: () => `${issue.key} archived · undo with ⌘Z` }
      ] }
    ]
    case 'project': return [{ label: 'Projects', items: projects.map(p => ({
      id: `p-${p.id}`, label: p.name, hint: `${p.team} · ${p.open} open`, icon: { kind: 'project', v: p.color }, current: p.id === issue.project, push: 'cycle' as Page, keywords: p.team
    })) }]
    case 'cycle': return [{ label: `Cycles in ${projectName(f.arg ?? '')}`, items: cycles.map(c => ({
      id: `c-${slug(c.id)}`, label: c.id, hint: c.hint, icon: { kind: 'mi', name: c.id === 'No cycle' ? 'tray' : 'calendar' }, current: f.arg === issue.project && c.id === issue.cycle,
      run: () => { issue.project = f.arg ?? issue.project; issue.cycle = c.id; return `Moved ${issue.key} to ${projectName(issue.project)} · ${c.id}` }
    })) }]
    case 'status': return [{ label: 'Status', items: statuses.map(s => ({
      id: `s-${s.id}`, label: s.label, icon: { kind: 'status', v: s.id }, current: s.id === issue.status,
      run: () => { issue.status = s.id; return `${issue.key} is now ${s.label}` }
    })) }]
    case 'assignee': return [{ label: 'Team members', items: people.map(n => ({
      id: `a-${slug(n)}`, label: n, icon: { kind: 'person', v: n }, current: n === issue.assignee,
      run: () => { issue.assignee = n; return `Assigned ${issue.key} to ${n}` }
    })) }]
    case 'priority': return [{ label: 'Priority', items: priorities.map(p => ({
      id: `pr-${p.v}`, label: p.label, icon: { kind: 'prio', v: String(Math.min(3, p.v)) }, current: p.v === issue.priority,
      run: () => { issue.priority = p.v; return `${issue.key} priority set to ${p.label}` }
    })) }]
  }
}

const titles: Record<Page, [string, string]> = {
  root: ['All actions', 'Type a command or search…'],
  project: ['Move to project', 'Search projects…'],
  cycle: ['Cycle', 'Pick a cycle…'],
  status: ['Change status', 'Search statuses…'],
  assignee: ['Assign to', 'Search people…'],
  priority: ['Set priority', 'Search priorities…']
}
const frame = (page: Page, arg?: string, title?: string): Frame => ({ page, arg, title: title ?? titles[page][0], placeholder: titles[page][1] })

// The palette opens pre-navigated one level deep so the preview shows a pushed page and its path.
const stack = ref<Frame[]>([frame('root'), frame('project')])
const top = computed(() => stack.value[stack.value.length - 1]!)
const query = ref('')
const dir = ref<'push' | 'pop'>('push')
const open = ref(true)
const done = ref('')
const announce = ref('')
const input = ref<HTMLInputElement | null>(null)

const groups = computed(() => {
  const q = query.value.trim().toLowerCase()
  return pageGroups(top.value)
    .map(g => ({ ...g, items: g.items.filter(o => !q || `${o.label} ${o.hint ?? ''} ${o.keywords ?? ''}`.toLowerCase().includes(q)) }))
    .filter(g => g.items.length)
})
const flat = computed(() => groups.value.flatMap(g => g.items))
const activeIdx = ref(1)
const active = computed(() => flat.value[Math.min(activeIdx.value, flat.value.length - 1)] ?? null)
const activeId = computed(() => (active.value ? `npal-opt-${active.value.id}` : undefined))
watch(query, () => { activeIdx.value = 0 })

function slug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
function hover(id: string) { activeIdx.value = flat.value.findIndex(o => o.id === id) }

function reveal() {
  nextTick(() => document.getElementById(activeId.value ?? '')?.scrollIntoView({ block: 'nearest' }))
}

function enter(f: Frame) {
  dir.value = 'push'
  done.value = ''
  stack.value = [...stack.value, f]
  query.value = ''
  activeIdx.value = 0
  nextTick(() => { announce.value = `${f.title}, ${flat.value.length} options` })
  input.value?.focus()
}

function popTo(i: number) {
  if (i >= stack.value.length - 1) return
  dir.value = 'pop'
  stack.value = stack.value.slice(0, i + 1)
  query.value = ''
  activeIdx.value = 0
  announce.value = `Back to ${top.value.title}`
  input.value?.focus()
}

function choose(o: Opt) {
  if (o.push) {
    const proj = top.value.page === 'project' ? o.id.slice(2) : undefined
    enter(frame(o.push, proj, proj ? projectName(proj) : undefined))
    return
  }
  if (o.run) {
    done.value = o.run()
    announce.value = done.value
    dir.value = 'pop'
    stack.value = [stack.value[0]!]
    query.value = ''
    activeIdx.value = 0
  }
}

function onKey(e: KeyboardEvent) {
  const n = flat.value.length
  if (e.key === 'ArrowDown' && n) { e.preventDefault(); activeIdx.value = (activeIdx.value + 1) % n; reveal() }
  else if (e.key === 'ArrowUp' && n) { e.preventDefault(); activeIdx.value = (activeIdx.value - 1 + n) % n; reveal() }
  else if (e.key === 'Home' && n) { e.preventDefault(); activeIdx.value = 0; reveal() }
  else if (e.key === 'End' && n) { e.preventDefault(); activeIdx.value = n - 1; reveal() }
  else if (e.key === 'Enter' && active.value) { e.preventDefault(); choose(active.value) }
  else if (e.key === 'Backspace' && !query.value && stack.value.length > 1) { e.preventDefault(); popTo(stack.value.length - 2) }
  else if (e.key === 'Escape') {
    e.preventDefault()
    if (query.value) query.value = ''
    else if (stack.value.length > 1) popTo(stack.value.length - 2)
    else { open.value = false; announce.value = 'Palette closed' }
  }
}

function reopen() {
  open.value = true
  stack.value = [frame('root')]
  activeIdx.value = 0
  nextTick(() => input.value?.focus())
}
</script>

<style scoped>
.npal__app-bar i:last-child { background: var(--mi-p); }
.npal__app-row b { height: 14px; }
.npal__app-row i { height: 10px; }
.npal__app-row i + i { width: 70%; }
.npal__app-row s { height: 18px; }
.npal__stack i { border-radius: var(--mi-radius-xl);
  background: color-mix(in srgb, var(--mi-label) 4%, var(--mi-elev));
}
.npal-layer-enter-from, .npal-layer-leave-to { transform: translateY(0) scale(1); opacity: 0; }
.npal__crumbs li { display: inline-flex; }
.npal__crumbs li + li::before { content: "›"; color: var(--npal-t3); font-size: 13px; }
.npal__crumb {
  font: inherit; font-size: 12px; font-weight: 500;
}
button.npal__crumb:hover { color: var(--mi-label); background: var(--mi-fill2); }
button.npal__crumb:active { transform: scale(.96); }
.npal__crumb.is-root { font-variant-numeric: tabular-nums; font-weight: 600; }
.npal__glass { flex: none; }
.npal__input { font: inherit; font-size: 15px; }
.npal__push { flex: none; }
.npal__opt.is-active .npal__push { transform: translateX(2px); }
.npal__kbd { display: none; }

/* Project swatches, status rings and priority bars: tiny glyphs drawn from tokens. */
.npal__ico[data-kind="project"] i { width: 12px; height: 12px; border-radius: 4px; background: var(--mi-p); }
.npal__ico[data-v="s"] i { background: var(--mi-s); }
.npal__ico[data-v="green"] i { background: var(--mi-green); }
.npal__ico[data-v="orange"] i { background: var(--mi-orange); }
.npal__ico[data-v="pink"] i { background: var(--mi-pink); }
.npal__ico[data-v="purple"] i { background: var(--mi-purple); }
.npal__ico[data-kind="status"] i { width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--mi-label2); }
.npal__ico[data-v="backlog"] i { border-style: dashed; }
.npal__ico[data-v="todo"] i { border-color: var(--mi-label2); }
.npal__ico[data-v="progress"] i { border-color: var(--mi-orange); background: conic-gradient(var(--mi-orange) 0 50%, transparent 0) content-box; }
.npal__ico[data-v="review"] i { border-color: var(--mi-green); background: conic-gradient(var(--mi-green) 0 75%, transparent 0) content-box; }
.npal__ico[data-v="done"] i { border-color: var(--mi-p); background: var(--mi-p); }
.npal__ico[data-v="canceled"] i { border-color: var(--npal-t3); background: var(--npal-t3); }
.npal__bars i { border-radius: 1px; background: var(--mi-fill2); }
.npal__bars i:nth-child(1) { height: 5px; }
.npal__bars i:nth-child(2) { height: 8px; }
.npal__bars i:nth-child(3) { height: 12px; }
.npal__bars i.on { background: var(--mi-label2); }

/* Page transitions: pushing slides in from the trailing edge, popping from the leading edge. */
.npal-push-enter-active, .npal-push-leave-active, .npal-pop-enter-active, .npal-pop-leave-active { transition: transform var(--mi-dur-2) var(--mi-ease), opacity var(--mi-dur-2) var(--mi-ease); }
.npal-push-enter-from, .npal-pop-leave-to { transform: translateX(14px); opacity: 0; }
.npal-push-leave-to, .npal-pop-enter-from { transform: translateX(-14px); opacity: 0; }
.npal-done-enter-active { transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease); }
.npal-done-enter-from { transform: translateY(4px); opacity: 0; }

@container (min-width: 560px) {
  .npal__kbd { display: inline-flex; }
}
</style>

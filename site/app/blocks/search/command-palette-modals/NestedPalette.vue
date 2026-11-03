<template>
  <section class="npal" aria-labelledby="npal-title">
    <h2 id="npal-title" class="npal__sr">Issue command palette</h2>

    <div class="npal__stage">
      <!-- Faux issue tracker behind the palette: token shapes only, blurred once, never animated. -->
      <div class="npal__app" aria-hidden="true">
        <div class="npal__app-bar"><i /><i /><i /></div>
        <div v-for="n in 9" :key="n" class="npal__app-row" :class="{ 'is-hit': n === 3 }"><b /><i /><i /><s /></div>
      </div>
      <div class="npal__scrim" aria-hidden="true" />

      <div v-if="open" class="npal__wrap">
        <!-- One faint sheet per page pushed, peeking above the palette: depth you can see. -->
        <TransitionGroup name="npal-layer" tag="div" class="npal__stack" aria-hidden="true">
          <i v-for="d in stack.length - 1" :key="d" :style="{ '--d': stack.length - d }" />
        </TransitionGroup>

        <div class="npal__palette" role="dialog" aria-modal="false" aria-labelledby="npal-title">
          <div class="npal__search">
            <ol class="npal__crumbs" aria-label="Palette path">
              <li v-for="(f, i) in stack" :key="i">
                <button
                  v-if="i < stack.length - 1" type="button" class="npal__crumb" :class="{ 'is-root': i === 0 }"
                  :aria-label="i === 0 ? `Back to all actions for ${issue.key}` : `Back to ${f.title}`" @click="popTo(i)"
                >
                  {{ i === 0 ? issue.key : f.title }}
                </button>
                <span v-else class="npal__crumb is-current" :class="{ 'is-root': i === 0 }" aria-current="page">{{ i === 0 ? issue.key : f.title }}</span>
              </li>
            </ol>
            <div class="npal__field">
              <MiIcon name="search" :size="17" class="npal__glass" />
              <input
                ref="input" v-model="query" class="npal__input" type="text" role="combobox" aria-expanded="true" aria-autocomplete="list"
                aria-controls="npal-list" :aria-activedescendant="activeId" :aria-label="`${top.title}: type to filter`"
                :placeholder="top.placeholder" autocomplete="off" spellcheck="false" @keydown="onKey"
              >
            </div>
          </div>

          <Transition :name="`npal-${dir}`" mode="out-in">
            <div id="npal-list" :key="stack.length + top.page" class="npal__list" role="listbox" :aria-label="top.title">
              <template v-for="g in groups" :key="g.label">
                <div role="group" :aria-labelledby="`npal-g-${slug(g.label)}`" class="npal__group">
                  <div :id="`npal-g-${slug(g.label)}`" class="npal__group-label">{{ g.label }}</div>
                  <div
                    v-for="o in g.items" :id="`npal-opt-${o.id}`" :key="o.id" role="option" class="npal__opt"
                    :class="{ 'is-active': o.id === active?.id }" :aria-selected="o.id === active?.id" @mousemove="hover(o.id)" @click="choose(o)"
                  >
                    <span class="npal__ico" :data-kind="o.icon.kind" :data-v="o.icon.v">
                      <MiAvatar v-if="o.icon.kind === 'person'" :name="o.icon.v" size="xs" tone="auto" decorative />
                      <MiIcon v-else-if="o.icon.kind === 'mi'" :name="o.icon.name" :size="16" />
                      <span v-else-if="o.icon.kind === 'prio'" class="npal__bars"><i v-for="n in 3" :key="n" :class="{ on: n <= Number(o.icon.v) }" /></span>
                      <i v-else />
                    </span>
                    <span class="npal__label">{{ o.label }}<small v-if="o.hint">{{ o.hint }}</small></span>
                    <span v-if="o.current" class="npal__now">
                      <MiIcon name="check" :size="14" />
                      <span class="npal__sr">current</span>
                    </span>
                    <span v-if="o.value" class="npal__value">{{ o.value }}</span>
                    <MiKbdGroup v-if="o.kbd" class="npal__kbd"><MiKbd v-for="k in o.kbd" :key="k">{{ k }}</MiKbd></MiKbdGroup>
                    <MiIcon v-if="o.push" name="chevron-right" :size="15" class="npal__push" />
                  </div>
                </div>
              </template>
              <p v-if="!groups.length" class="npal__empty">Nothing matches “{{ query }}”.</p>
            </div>
          </Transition>

          <footer class="npal__foot">
            <span class="npal__hint"><MiKbdGroup><MiKbd>↑</MiKbd><MiKbd>↓</MiKbd></MiKbdGroup> move</span>
            <span class="npal__hint"><MiKbd>↵</MiKbd> {{ active?.push ? 'open' : 'select' }}</span>
            <span v-if="stack.length > 1" class="npal__hint"><MiKbd>⌫</MiKbd> back</span>
            <span class="npal__hint"><MiKbd>esc</MiKbd> {{ stack.length > 1 ? 'up' : 'close' }}</span>
            <Transition name="npal-done">
              <span v-if="done" :key="done" class="npal__done"><MiIcon name="check-circle-fill" :size="14" />{{ done }}</span>
            </Transition>
          </footer>
        </div>
      </div>

      <div v-else class="npal__closed">
        <MiButton variant="gray" size="small" @click="reopen">
          Reopen palette
          <template #trailing><MiKbdGroup><MiKbd>⌘</MiKbd><MiKbd>K</MiKbd></MiKbdGroup></template>
        </MiButton>
      </div>
    </div>
    <p class="npal__sr" role="status" aria-live="polite">{{ announce }}</p>
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
.npal { --npal-t3: color-mix(in srgb, var(--mi-label2) 78%, transparent); container-type: inline-size; display: grid; align-content: start; font-family: var(--mi-font); color: var(--mi-label); }
.npal__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.npal__stage { position: relative; display: grid; place-items: start center; min-height: 520px; padding: 44px 12px 24px; border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate; background: var(--mi-page); }

/* Faux issue list. */
.npal__app { position: absolute; inset: 0; z-index: -2; display: grid; align-content: start; gap: 2px; padding: 18px; filter: blur(2.5px); }
.npal__app-bar { display: flex; gap: 10px; margin-bottom: 14px; }
.npal__app-bar i { height: 24px; width: 18%; border-radius: var(--mi-radius-m); background: var(--mi-fill3); }
.npal__app-bar i:last-child { margin-left: auto; width: 10%; background: var(--mi-p); opacity: .45; }
.npal__app-row { display: grid; grid-template-columns: 14px 64px 1fr 80px; align-items: center; gap: 14px; height: 40px; padding: 0 12px; border-radius: var(--mi-radius-m); background: var(--mi-card); }
.npal__app-row.is-hit { box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--mi-p) 60%, transparent); }
.npal__app-row b { width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--mi-label3); }
.npal__app-row i { height: 10px; border-radius: 5px; background: var(--mi-fill2); }
.npal__app-row i + i { width: 70%; }
.npal__app-row s { height: 18px; border-radius: 9px; background: var(--mi-fill3); }
.npal__scrim { position: absolute; inset: 0; z-index: -1; background: color-mix(in srgb, var(--mi-page) 50%, transparent); }

.npal__wrap { position: relative; width: 100%; max-width: 600px; }
.npal__stack { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.npal__stack i {
  position: absolute; inset: 0; border-radius: var(--mi-radius-xl); border: 1px solid var(--mi-sep); box-shadow: var(--mi-sh2);
  transform: translateY(calc(var(--d) * -11px)) scale(calc(1 - var(--d) * .05)); opacity: calc(1 - var(--d) * .25); transform-origin: 50% 0;
  background: color-mix(in srgb, var(--mi-label) 4%, var(--mi-elev));
  transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease);
}
.npal-layer-enter-from, .npal-layer-leave-to { transform: translateY(0) scale(1); opacity: 0; }

.npal__palette {
  position: relative; z-index: 1; display: grid; border-radius: var(--mi-radius-xl); overflow: hidden;
  background: var(--mi-elev); border: 1px solid var(--mi-sep); box-shadow: var(--mi-sh3);
}

.npal__search { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 6px; padding: 12px 14px; border-bottom: 1px solid var(--mi-sep); }
.npal__crumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin: 0; padding: 0; list-style: none; }
.npal__crumbs li { display: inline-flex; align-items: center; gap: 4px; }
.npal__crumbs li + li::before { content: "›"; color: var(--npal-t3); font-size: 13px; }
.npal__crumb {
  display: inline-flex; align-items: center; height: 24px; padding: 0 9px; border: 0; border-radius: 7px;
  font: inherit; font-size: 12px; font-weight: 500; color: var(--mi-label2); background: var(--mi-fill3); white-space: nowrap; cursor: pointer;
  transition: transform var(--mi-dur-1) var(--mi-ease);
}
button.npal__crumb:hover { color: var(--mi-label); background: var(--mi-fill2); }
button.npal__crumb:active { transform: scale(.96); }
.npal__crumb:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.npal__crumb.is-root { font-variant-numeric: tabular-nums; font-weight: 600; letter-spacing: .01em; }
.npal__crumb.is-current { color: var(--mi-p-text); background: var(--mi-p-tint); cursor: default; }
.npal__field { display: flex; flex: 1 1 200px; align-items: center; gap: 8px; min-width: 0; }
.npal__glass { flex: none; color: var(--npal-t3); }
.npal__input { flex: 1; min-width: 0; height: 28px; padding: 0; border: 0; outline: none; background: none; font: inherit; font-size: 15px; color: var(--mi-label); }
.npal__input::placeholder { color: var(--npal-t3); }

.npal__list { height: 300px; overflow-y: auto; overscroll-behavior: contain; padding: 6px; }
.npal__group + .npal__group { margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--mi-sep); }
.npal__group-label { padding: 8px 10px 6px; font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--npal-t3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.npal__opt {
  display: flex; align-items: center; gap: 10px; min-height: 40px; padding: 6px 10px; border-radius: var(--mi-radius-m);
  font-size: 14px; cursor: pointer; scroll-margin: 6px;
}
.npal__opt.is-active { background: var(--mi-fill3); box-shadow: inset 2px 0 0 var(--mi-p); }
.npal__ico { display: grid; place-items: center; flex: none; width: 26px; height: 26px; border-radius: 7px; color: var(--mi-label2); background: var(--mi-fill4); }
.npal__ico[data-kind="person"] { background: none; }
.npal__opt.is-active .npal__ico[data-kind="mi"] { color: var(--mi-p-text); background: var(--mi-p-tint); }
.npal__label { display: flex; flex: 1; align-items: baseline; gap: 8px; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.npal__label small { overflow: hidden; text-overflow: ellipsis; font-size: 12px; color: var(--npal-t3); font-variant-numeric: tabular-nums; }
.npal__value { flex: none; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: var(--mi-label2); }
.npal__now { display: inline-flex; flex: none; align-items: center; color: var(--mi-p-text); }
.npal__push { flex: none; color: var(--npal-t3); transition: transform var(--mi-dur-1) var(--mi-ease); }
.npal__opt.is-active .npal__push { color: var(--mi-label); transform: translateX(2px); }
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
.npal__ico[data-v="progress"] i { border-color: var(--mi-orange); background: conic-gradient(var(--mi-orange) 0 50%, transparent 0) content-box; padding: 2px; }
.npal__ico[data-v="review"] i { border-color: var(--mi-green); background: conic-gradient(var(--mi-green) 0 75%, transparent 0) content-box; padding: 2px; }
.npal__ico[data-v="done"] i { border-color: var(--mi-p); background: var(--mi-p); }
.npal__ico[data-v="canceled"] i { border-color: var(--npal-t3); background: var(--npal-t3); }
.npal__bars { display: inline-flex; align-items: flex-end; gap: 2px; height: 12px; }
.npal__bars i { width: 3px; border-radius: 1px; background: var(--mi-fill2); }
.npal__bars i:nth-child(1) { height: 5px; }
.npal__bars i:nth-child(2) { height: 8px; }
.npal__bars i:nth-child(3) { height: 12px; }
.npal__bars i.on { background: var(--mi-label2); }
.npal__empty { margin: 0; padding: 40px 16px; text-align: center; font-size: 13px; color: var(--mi-label2); }

.npal__foot { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; min-height: 42px; padding: 8px 14px; border-top: 1px solid var(--mi-sep); font-size: 12px; color: var(--mi-label2); background: color-mix(in srgb, var(--mi-fill4) 50%, transparent); }
.npal__hint { display: inline-flex; align-items: center; gap: 6px; }
.npal__done { display: inline-flex; align-items: center; gap: 6px; margin-left: auto; font-weight: 500; color: var(--mi-green-t); }

.npal__closed { display: grid; place-items: center; min-height: 440px; }

/* Page transitions: pushing slides in from the trailing edge, popping from the leading edge. */
.npal-push-enter-active, .npal-push-leave-active, .npal-pop-enter-active, .npal-pop-leave-active { transition: transform var(--mi-dur-2) var(--mi-ease), opacity var(--mi-dur-2) var(--mi-ease); }
.npal-push-enter-from, .npal-pop-leave-to { transform: translateX(14px); opacity: 0; }
.npal-push-leave-to, .npal-pop-enter-from { transform: translateX(-14px); opacity: 0; }
.npal-done-enter-active { transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease); }
.npal-done-enter-from { transform: translateY(4px); opacity: 0; }

@container (min-width: 560px) {
  .npal__stage { padding: 64px 32px 32px; }
  .npal__kbd { display: inline-flex; flex: none; }
}
</style>

<template>
  <div ref="rootEl" class="fds">
    <div class="fds__shell" :class="{ 'is-rail': collapsed }" @keydown="onKey">
      <!-- The dock floats off the edges; collapsed it becomes an icon rail with tooltips. -->
      <aside id="fds-dock" class="fds__dock" aria-label="Tidewater navigation">
        <div class="fds__head">
          <MiMenu v-model="workspace" variant="popup" :items="workspaces" aria-label="Switch workspace">
            <template #trigger="{ props }">
              <button v-bind="props" type="button" class="fds__ws" :aria-label="'Workspace: ' + currentWs.label + '. Switch workspace'">
                <span class="fds__ws-tile" aria-hidden="true">{{ currentWs.initials }}</span>
                <span class="fds__ws-text fds__label">
                  <span class="fds__ws-name">{{ currentWs.label }}</span>
                  <span class="fds__ws-plan">{{ currentWs.plan }}</span>
                </span>
                <MiIcon name="chevron-up-down" :size="14" class="fds__label fds__ws-chev" />
              </button>
            </template>
          </MiMenu>
          <MiTooltip :content="collapsed ? 'Expand sidebar' : 'Collapse sidebar'" shortcut="[" placement="right">
            <MiIconButton class="fds__toggle" size="small" variant="plain" :label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'" aria-controls="fds-dock" :aria-expanded="!collapsed" @click="collapsed = !collapsed">
              <MiIcon name="sidebar" :size="17" />
            </MiIconButton>
          </MiTooltip>
        </div>

        <MiTooltip class="fds__tip" content="Search" shortcut="⌘K" placement="right" :disabled="!collapsed">
          <button type="button" class="fds__search" aria-label="Search Tidewater">
            <MiIcon name="search" :size="16" />
            <span class="fds__label fds__search-text">Search</span>
            <MiKbdGroup class="fds__label fds__keys"><MiKbd>⌘</MiKbd><MiKbd>K</MiKbd></MiKbdGroup>
          </button>
        </MiTooltip>

        <nav class="fds__scroll" aria-label="Main">
          <ul class="fds__list">
            <li v-for="n in nav" :key="n.id">
              <MiTooltip class="fds__tip" :content="n.label + (n.count ? ' · ' + n.count + ' new' : '')" :shortcut="n.key ? 'G ' + n.key : undefined" placement="right" :disabled="!collapsed">
                <button type="button" class="fds__item" :class="{ 'is-active': n.id === view }" :aria-current="n.id === view ? 'page' : undefined" :aria-label="collapsed ? n.label : undefined" @click="go(n.id)">
                  <span class="fds__glyph"><MiIcon :name="n.icon" :size="18" /></span>
                  <span class="fds__label fds__item-label">{{ n.label }}</span>
                  <span v-if="n.count" class="fds__count" :aria-label="n.count + ' new'">{{ n.count }}</span>
                  <MiKbdGroup v-else-if="n.key" class="fds__label fds__keys fds__hint" aria-hidden="true"><MiKbd>G</MiKbd><MiKbd>{{ n.key }}</MiKbd></MiKbdGroup>
                </button>
              </MiTooltip>
            </li>
          </ul>

          <div class="fds__section">
            <MiText as="h2" variant="caption2" weight="semibold" tone="label2" class="fds__label fds__eyebrow">Pinned</MiText>
            <span class="fds__rule" aria-hidden="true" />
          </div>
          <ul class="fds__list">
            <li v-for="p in pinned" :key="p.id">
              <MiTooltip class="fds__tip" :content="p.label" :shortcut="'G ' + p.key" placement="right" :disabled="!collapsed">
                <button type="button" class="fds__item fds__pin" :class="{ 'is-active': p.id === view }" :style="{ '--c': `var(--mi-${p.color})` }" :aria-current="p.id === view ? 'page' : undefined" :aria-label="collapsed ? p.label : undefined" @click="go(p.id)">
                  <span class="fds__glyph"><span class="fds__pin-tile" aria-hidden="true">{{ p.label.charAt(0) }}</span></span>
                  <span class="fds__label fds__item-label">{{ p.label }}</span>
                  <MiKbdGroup class="fds__label fds__keys fds__hint" aria-hidden="true"><MiKbd>G</MiKbd><MiKbd>{{ p.key }}</MiKbd></MiKbdGroup>
                </button>
              </MiTooltip>
            </li>
          </ul>
        </nav>

        <!-- Usage: a segmented meter, folded into a ring when the dock is a rail. -->
        <MiTooltip class="fds__tip" :content="`Storage ${usedPct}% used · ${used.toFixed(1)} of ${quota} GB`" placement="right" :disabled="!collapsed">
          <div class="fds__usage" role="meter" aria-label="Storage used" :aria-valuenow="usedPct" aria-valuemin="0" aria-valuemax="100" :aria-valuetext="`${used.toFixed(1)} of ${quota} GB used`" tabindex="0">
            <svg class="fds__ring" viewBox="0 0 36 36" aria-hidden="true">
              <circle cx="18" cy="18" r="14" pathLength="100" class="fds__ring-track" />
              <circle cx="18" cy="18" r="14" pathLength="100" class="fds__ring-fill" :stroke-dasharray="`${usedPct} 100`" />
            </svg>
            <div class="fds__label fds__usage-body">
              <div class="fds__usage-top">
                <MiText as="span" variant="footnote" weight="semibold">Storage</MiText>
                <MiText as="span" variant="caption" tone="label2" tabular>{{ used.toFixed(1) }} / {{ quota }} GB</MiText>
              </div>
              <div class="fds__bar" aria-hidden="true">
                <span v-for="s in storage" :key="s.label" :style="{ flexGrow: s.gb, background: `var(--mi-${s.color})` }" />
                <span class="fds__bar-free" :style="{ flexGrow: quota - used }" />
              </div>
              <ul class="fds__legend">
                <li v-for="s in storage" :key="s.label"><i :style="{ background: `var(--mi-${s.color})` }" />{{ s.label }}</li>
              </ul>
            </div>
          </div>
        </MiTooltip>

        <div class="fds__me">
          <MiAvatar name="Maren Ruiz" size="sm" tone="auto" decorative />
          <span class="fds__label fds__me-text">
            <span class="fds__me-name">Maren Ruiz</span>
            <span class="fds__me-mail">Product lead</span>
          </span>
          <MiIconButton class="fds__label" size="small" variant="plain" label="Settings"><MiIcon name="settings" :size="17" /></MiIconButton>
        </div>
      </aside>
      <div class="fds__scrim" aria-hidden="true" @click="collapsed = true" />

      <main class="fds__main" aria-labelledby="fds-title">
        <header class="fds__bar-top">
          <div class="fds__title">
            <MiText as="span" variant="caption" tone="label2" weight="medium"><span class="fds__ws-crumb">{{ currentWs.label }} · </span>{{ page.kind }}</MiText>
            <MiText id="fds-title" as="h3" variant="title2" weight="bold">{{ page.label }}</MiText>
          </div>
          <MiButton size="small" variant="tinted">
            <template #leading><MiIcon name="plus" :size="15" /></template>
            New issue
          </MiButton>
        </header>

        <dl class="fds__stats">
          <div v-for="st in stats" :key="st.k"><dt>{{ st.k }}</dt><dd>{{ st.v }}</dd></div>
        </dl>

        <ul class="fds__rows" :aria-label="page.label">
          <li v-for="r in rows" :key="r.id" class="fds__row">
            <span class="fds__state" :style="{ '--c': `var(--mi-${r.color})` }" :aria-label="r.state" role="img" />
            <span class="fds__row-id">{{ r.id }}</span>
            <span class="fds__row-title">{{ r.title }}</span>
            <span class="fds__row-due">{{ r.due }}</span>
            <MiAvatar :name="r.owner" size="xs" tone="auto" />
          </li>
        </ul>

        <!-- Leader-key hint: press G, then a letter. -->
        <div class="fds__leader" :class="{ 'is-on': leader }" role="status" aria-live="polite">
          <template v-if="leader">
            <MiKbd>G</MiKbd>
            <span>then</span>
            <span v-for="k in allKeys" :key="k.key" class="fds__leader-key"><MiKbd>{{ k.key }}</MiKbd>{{ k.label }}</span>
          </template>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type Icon = 'home' | 'tray' | 'person' | 'calendar' | 'folder' | 'people'
interface NavItem { id: string, label: string, icon: Icon, count?: number, key?: string, kind: string }
interface Pin { id: string, label: string, color: string, key: string, kind: string }

const workspaces = [
  { value: 'tw', label: 'Tidewater Labs', initials: 'TL', plan: 'Team plan · 24 seats' },
  { value: 'fh', label: 'Fernhill Studio', initials: 'FS', plan: 'Free plan · 3 seats' }
]
const workspace = ref<string | number | undefined>('tw')
const currentWs = computed(() => workspaces.find(w => w.value === workspace.value) ?? workspaces[0]!)

const nav: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', kind: 'Overview' },
  { id: 'inbox', label: 'Inbox', icon: 'tray', count: 4, key: 'I', kind: 'Notifications' },
  { id: 'mine', label: 'My issues', icon: 'person', key: 'M', kind: 'Assigned to you' },
  { id: 'cycles', label: 'Cycles', icon: 'calendar', kind: 'Cycle 31 · ends Friday' },
  { id: 'projects', label: 'Projects', icon: 'folder', key: 'P', kind: '12 active' },
  { id: 'team', label: 'Team', icon: 'people', kind: '24 members' }
]
const pinned: Pin[] = [
  { id: 'checkout', label: 'Checkout v2', color: 'pink', key: 'C', kind: 'Project' },
  { id: 'android', label: 'Android crash rate', color: 'green', key: 'A', kind: 'View' },
  { id: 'q1', label: 'Q1 2027 planning', color: 'indigo', key: 'Q', kind: 'Doc' }
]
const allKeys = [...nav, ...pinned].filter(n => n.key).map(n => ({ key: n.key!, label: n.label }))

const storage = [
  { label: 'Attachments', gb: 21.6, color: 'p' },
  { label: 'Recordings', gb: 12.1, color: 'teal' },
  { label: 'Exports', gb: 4.7, color: 'orange' }
]
const quota = 50
const used = storage.reduce((a, s) => a + s.gb, 0)
const usedPct = Math.round((used / quota) * 100)

const pool = [
  { id: 'TID-482', title: 'Card form loses focus after 3-D Secure redirect', state: 'In progress', color: 'orange', due: 'Nov 4', owner: 'Maren Ruiz' },
  { id: 'TID-479', title: 'Show saved addresses before the postcode lookup', state: 'In review', color: 'indigo', due: 'Nov 6', owner: 'Kofi Mensah' },
  { id: 'TID-471', title: 'ANR on cold start when offline cache is empty', state: 'Todo', color: 'label3', due: 'Nov 8', owner: 'Ilse Brandt' },
  { id: 'TID-468', title: 'Retry webhook delivery with exponential backoff', state: 'In progress', color: 'orange', due: 'Nov 9', owner: 'Maren Ruiz' },
  { id: 'TID-455', title: 'Draft pricing experiments for Q1 planning', state: 'Done', color: 'green', due: 'Oct 30', owner: 'Ana Sobral' },
  { id: 'TID-451', title: 'Audit empty states across billing settings', state: 'Todo', color: 'label3', due: 'Nov 12', owner: 'Kofi Mensah' },
  { id: 'TID-447', title: 'Apple Pay button misaligned on narrow carts', state: 'In review', color: 'indigo', due: 'Nov 5', owner: 'Ilse Brandt' }
]

const view = ref('mine')
const pages = [...nav, ...pinned]
const page = computed(() => pages.find(p => p.id === view.value) ?? pages[0]!)
const rows = computed(() => {
  const i = pages.findIndex(p => p.id === view.value)
  return [...pool.slice(i % pool.length), ...pool.slice(0, i % pool.length)].slice(0, 5)
})

const stats = computed(() => {
  const r = rows.value
  return [
    { k: 'Open', v: r.filter(x => x.state !== 'Done').length },
    { k: 'In review', v: r.filter(x => x.state === 'In review').length },
    { k: 'Due soon', v: r.filter(x => ['Nov 4', 'Nov 5', 'Nov 6', 'Nov 8'].includes(x.due)).length }
  ]
})

const collapsed = ref(false)
function go(id: string) {
  view.value = id
  if (narrow.value) collapsed.value = true
}

// G then a letter jumps to a destination, like a leader key.
const leader = ref(false)
let leaderTimer: ReturnType<typeof setTimeout> | undefined
function onKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  if (e.metaKey || e.ctrlKey || e.altKey || t.closest('input, textarea, [contenteditable="true"]')) return
  const k = e.key.toUpperCase()
  if (e.key === '[') { collapsed.value = !collapsed.value; return }
  if (leader.value) {
    const hit = allKeys.find(x => x.key === k)
    const dest = [...nav, ...pinned].find(n => n.key === k)
    leader.value = false
    clearTimeout(leaderTimer)
    if (hit && dest) { e.preventDefault(); go(dest.id) }
    return
  }
  if (k === 'G') {
    leader.value = true
    clearTimeout(leaderTimer)
    leaderTimer = setTimeout(() => { leader.value = false }, 1600)
  }
}

// Narrow containers start as a rail; expanding then floats the dock over the page.
const rootEl = ref<HTMLElement>()
const narrow = ref(false)
let ro: ResizeObserver | undefined
onMounted(() => {
  ro = new ResizeObserver(([entry]) => {
    const isNarrow = (entry?.contentRect.width ?? 0) < 720
    if (isNarrow && !narrow.value) collapsed.value = true
    narrow.value = isNarrow
  })
  if (rootEl.value) ro.observe(rootEl.value)
})
onBeforeUnmount(() => { ro?.disconnect(); clearTimeout(leaderTimer) })
</script>

<style scoped>
.fds { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.fds__shell {
  position: relative; display: grid; grid-template-columns: 76px minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); height: 640px; overflow: hidden;
  background: radial-gradient(120% 80% at 0% 0%, color-mix(in srgb, var(--mi-p) 7%, transparent), transparent 60%), var(--mi-page);
}

/* Dock */
.fds__dock {
  position: absolute; z-index: 3; inset: 12px auto 12px 12px; width: 256px; box-sizing: border-box;
  display: flex; flex-direction: column; gap: 6px; min-height: 0; padding: 10px;
  border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh3);
}
.is-rail .fds__dock { position: relative; inset: auto; width: auto; margin: 12px 0 12px 12px; padding: 10px 8px; align-items: center; box-shadow: var(--mi-sh2); }
.is-rail .fds__label { display: none; }
.fds__dock .fds__label { animation: fds-fade var(--mi-dur-3) var(--mi-ease) both; }
@keyframes fds-fade { from { opacity: 0; transform: translateX(-4px); } }

.fds__dock :deep(.fds__tip) { display: flex; justify-content: center; width: 100%; }
.fds__head { display: flex; align-items: center; gap: 4px; width: 100%; }
.is-rail .fds__head { flex-direction: column; gap: 6px; }
.fds__ws {
  display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; padding: 6px; border: 0; border-radius: 12px;
  background: none; color: inherit; font: inherit; text-align: left; cursor: pointer;
}
.fds__ws:hover { background: var(--mi-fill4); }
.fds__ws-tile {
  display: grid; place-items: center; flex: none; width: 32px; height: 32px; border-radius: 10px;
  font-size: 12px; font-weight: 800; letter-spacing: .02em; color: var(--mi-p-on);
  background: linear-gradient(145deg, var(--mi-p), color-mix(in srgb, var(--mi-p) 55%, var(--mi-s)));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mi-card) 18%, transparent);
}
.fds__ws-text { display: grid; min-width: 0; flex: 1; }
.fds__ws-name { font-size: 14px; font-weight: 650; letter-spacing: -.01em; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.fds__ws-plan { font-size: 11.5px; color: var(--mi-label2); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.fds__ws-chev { color: var(--mi-label3); flex: none; }

.fds__search {
  display: flex; align-items: center; gap: 8px; width: 100%; height: 34px; padding: 0 8px 0 10px; box-sizing: border-box;
  border: 0; border-radius: 10px; background: var(--mi-fill4); color: var(--mi-label2); font: inherit; font-size: 13px; cursor: pointer;
}
.fds__search:hover { color: var(--mi-label); }
.is-rail .fds__search { width: 40px; height: 38px; padding: 0; justify-content: center; }
.fds__search-text { flex: 1; text-align: left; }
.fds__keys { flex: none; }

.fds__scroll { flex: 1; min-height: 0; width: 100%; overflow-y: auto; scrollbar-width: none; margin-top: 4px; }
.fds__list { display: grid; gap: 1px; margin: 0; padding: 0; list-style: none; }
.is-rail .fds__list { justify-items: center; gap: 2px; }
.fds__item {
  position: relative; display: flex; align-items: center; gap: 10px; width: 100%; height: 36px; padding: 0 8px 0 4px; box-sizing: border-box;
  border: 0; border-radius: 10px; background: none; color: var(--mi-label2); font: inherit; font-size: 13.5px; font-weight: 500; text-align: left; cursor: pointer;
}
.fds__item:hover { color: var(--mi-label); background: var(--mi-fill4); }
.fds__item.is-active { color: var(--mi-label); background: var(--mi-p-tint); }
.fds__item.is-active .fds__glyph { color: var(--mi-p-text); }
.is-rail .fds__item { width: 40px; height: 38px; padding: 0; justify-content: center; }
.is-rail .fds__ws { padding: 2px; flex: none; }
.fds__glyph { display: grid; place-items: center; flex: none; width: 28px; height: 28px; }
.fds__item-label { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.fds__count {
  flex: none; min-width: 20px; height: 20px; padding: 0 6px; box-sizing: border-box; border-radius: 10px;
  font-size: 11.5px; font-weight: 650; line-height: 20px; text-align: center; font-variant-numeric: tabular-nums;
  color: var(--mi-p-on); background: var(--mi-p);
}
.is-rail .fds__count { position: absolute; top: 3px; right: 2px; min-width: 16px; height: 16px; padding: 0 4px; font-size: 10px; line-height: 16px; box-shadow: 0 0 0 2px var(--mi-card); }
.fds__hint { opacity: 0; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.fds__item:hover .fds__hint, .fds__item:focus-visible .fds__hint, .fds__item.is-active .fds__hint { opacity: 1; }

.fds__section { display: flex; align-items: center; gap: 8px; padding: 18px 8px 6px; }
.is-rail .fds__section { padding: 8px 0 6px; justify-content: center; }
.fds__eyebrow { text-transform: uppercase; letter-spacing: .08em; }
.fds__rule { flex: 1; height: 1px; background: var(--mi-sep); }
.is-rail .fds__rule { flex: none; width: 20px; }
.fds__pin-tile {
  display: grid; place-items: center; width: 22px; height: 22px; border-radius: 7px;
  font-size: 11px; font-weight: 750; color: var(--c); background: color-mix(in srgb, var(--c) 16%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 26%, transparent);
}
.is-rail .fds__pin-tile { width: 26px; height: 26px; font-size: 12px; }

.fds__usage { display: flex; align-items: center; gap: 10px; width: 100%; box-sizing: border-box; padding: 12px; border-radius: 14px; background: var(--mi-fill4); outline: none; }
.fds__usage:focus-visible, .fds__item:focus-visible, .fds__search:focus-visible, .fds__ws:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.fds__ring { display: none; width: 30px; height: 30px; transform: rotate(-90deg); }
.fds__ring circle { fill: none; stroke-width: 4; }
.fds__ring-track { stroke: var(--mi-fill2); }
.fds__ring-fill { stroke: var(--mi-p); stroke-linecap: round; }
.is-rail .fds__usage { width: 40px; height: 40px; padding: 0; justify-content: center; border-radius: 12px; }
.is-rail .fds__ring { display: block; }
.fds__usage-body { display: grid; gap: 8px; flex: 1; min-width: 0; }
.fds__usage-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.fds__bar { display: flex; gap: 2px; height: 6px; }
.fds__bar span { flex-basis: 0; border-radius: 3px; }
.fds__bar .fds__bar-free { background: var(--mi-fill2); }
.fds__legend { display: flex; flex-wrap: wrap; gap: 4px 10px; margin: 0; padding: 0; list-style: none; font-size: 11px; color: var(--mi-label2); }
.fds__legend li { display: inline-flex; align-items: center; gap: 5px; }
.fds__legend i { width: 6px; height: 6px; border-radius: 2px; }

.fds__me { display: flex; align-items: center; gap: 10px; width: 100%; padding: 6px 2px 0 4px; box-sizing: border-box; }
.is-rail .fds__me { justify-content: center; padding: 6px 0 0; }
.fds__me-text { display: grid; flex: 1; min-width: 0; line-height: 1.25; }
.fds__me-name { font-size: 13px; font-weight: 600; }
.fds__me-mail { font-size: 11.5px; color: var(--mi-label2); }

.fds__scrim { position: absolute; inset: 0; z-index: 2; background: var(--mi-scrim); opacity: 1; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.is-rail .fds__scrim { opacity: 0; pointer-events: none; }

/* Page */
.fds__main { position: relative; min-width: 0; display: flex; flex-direction: column; gap: 18px; padding: 24px 16px 20px 16px; overflow: hidden; }
.fds__bar-top { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
.fds__title { display: grid; gap: 2px; min-width: 0; }
.fds__ws-crumb { display: none; }
.fds__stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0; }
.fds__stats div { display: grid; gap: 2px; min-width: 0; padding: 10px 11px; border-radius: 14px; background: color-mix(in srgb, var(--mi-card) 60%, transparent); box-shadow: inset 0 0 0 1px var(--mi-sep); }
.fds__stats dt { font-size: 11.5px; color: var(--mi-label2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fds__stats dd { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.fds__rows { display: grid; margin: 0; padding: 4px 0; list-style: none; border-radius: 16px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.fds__row { display: grid; grid-template-columns: 10px minmax(0, 1fr) auto; grid-template-areas: "dot title who" ". id due"; align-items: center; gap: 2px 12px; padding: 12px 14px; }
.fds__row + .fds__row { border-top: 1px solid var(--mi-sep); }
.fds__state { grid-area: dot; width: 10px; height: 10px; border-radius: 50%; box-sizing: border-box; border: 2px solid var(--c); background: color-mix(in srgb, var(--c) 30%, transparent); }
.fds__row-id { grid-area: id; font-size: 11.5px; color: var(--mi-label3); font-variant-numeric: tabular-nums; letter-spacing: .02em; }
.fds__row-title { grid-area: title; font-size: 14px; font-weight: 500; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.fds__row-due { grid-area: due; font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; text-align: right; }
.fds__row > :last-child { grid-area: who; justify-self: end; }

.fds__leader {
  position: absolute; left: 16px; right: 16px; bottom: 18px; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px;
  padding: 10px 12px; border-radius: 14px; font-size: 12px; color: var(--mi-label2);
  background: var(--mi-mat); backdrop-filter: blur(16px); box-shadow: var(--mi-sh2);
  opacity: 0; transform: translateY(8px); pointer-events: none; transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease);
}
.fds__leader.is-on { opacity: 1; transform: none; }
.fds__leader-key { display: inline-flex; align-items: center; gap: 5px; color: var(--mi-label); }

@container (min-width: 720px) {
  .fds__shell { grid-template-columns: 280px minmax(0, 1fr); }
  .fds__shell.is-rail { grid-template-columns: 76px minmax(0, 1fr); }
  .fds__dock { position: relative; inset: auto; width: auto; margin: 12px 0 12px 12px; box-shadow: var(--mi-sh2); }
  .fds__scrim { display: none; }
  .fds__ws-crumb { display: inline; }
  .fds__stats div { padding: 12px 14px; }
  .fds__main { padding: 32px 32px 24px 28px; }
  .fds__row { grid-template-columns: 10px 64px minmax(0, 1fr) 56px 24px; grid-template-areas: "dot id title due who"; padding: 12px 18px; }
  .fds__leader { left: 28px; right: auto; max-width: calc(100% - 60px); }
}
@media (prefers-reduced-motion: reduce) {
  .fds__dock .fds__label { animation: none; }
}
</style>

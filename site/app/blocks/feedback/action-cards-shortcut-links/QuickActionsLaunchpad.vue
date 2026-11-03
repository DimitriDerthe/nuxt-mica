<template>
  <!-- Single-letter shortcuts fire while focus is anywhere inside this panel, never page-wide. -->
  <section class="qal" aria-labelledby="qal-title" @keydown="onKey">
    <header class="qal__head">
      <div>
        <MiText id="qal-title" variant="title3" as="h2" weight="semibold">Quick actions</MiText>
        <MiText variant="footnote" tone="label2">Focus the panel and press a key, or click a card.</MiText>
      </div>
      <p class="qal__live" role="status" aria-live="polite">{{ announce }}</p>
    </header>

    <div class="qal__layout">
      <ul class="qal__grid" aria-label="Actions">
        <li v-for="a in actions" :key="a.key">
          <button type="button" class="qal__card" :aria-keyshortcuts="a.key" :style="{ '--qal-c': a.color }" @click="fire(a)">
            <span v-if="flashes[a.key]" :key="flashes[a.key]" class="qal__flash" aria-hidden="true" />
            <span class="qal__icon"><MiIcon :svg="a.glyph" :size="20" /></span>
            <span class="qal__text">
              <strong>{{ a.title }}</strong>
              <span>{{ a.desc }}</span>
            </span>
            <MiKbd class="qal__key">{{ a.key }}</MiKbd>
          </button>
        </li>
      </ul>

      <aside class="qal__side" aria-labelledby="qal-jump">
        <MiText id="qal-jump" variant="subheadline" as="h3" weight="semibold">Jump back in</MiText>
        <ul class="qal__links">
          <li v-for="l in sortedLinks" :key="l.id" class="qal__link">
            <a href="#" class="qal__link-a">
              <span class="qal__link-kind">{{ l.kind }}</span>
              <span class="qal__link-title">{{ l.title }}</span>
              <span class="qal__link-meta">{{ l.meta }}</span>
            </a>
            <MiIconButton
              :label="(l.pinned ? 'Unpin ' : 'Pin ') + l.title" variant="plain" size="small" :pressed="l.pinned"
              @click="l.pinned = !l.pinned"
            >
              <MiIcon name="star" :size="16" :filled="l.pinned" :class="{ 'qal__pin--on': l.pinned }" />
            </MiIconButton>
          </li>
        </ul>

        <div v-if="recent.length" class="qal__recent">
          <MiText variant="caption" tone="label3" weight="semibold" class="qal__caps">Just used</MiText>
          <ol class="qal__recent-list">
            <li v-for="r in recent" :key="r.id">
              <span class="qal__recent-dot" :style="{ background: r.color }" aria-hidden="true" />
              <span>{{ r.title }}</span>
              <MiText variant="caption2" tone="label3" as="span">{{ r.at }}</MiText>
            </li>
          </ol>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface Action { key: string, title: string, desc: string, color: string, glyph: string }

// Sample actions for a freelance studio's back office; wire `fire` to your router.
const actions: Action[] = [
  { key: 'N', title: 'New invoice', desc: 'From a client or a blank sheet', color: 'var(--mi-p)', glyph: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M12 11v6M9 14h6"/>' },
  { key: 'T', title: 'Track time', desc: 'Start a timer on a project', color: 'var(--mi-orange)', glyph: '<circle cx="12" cy="13" r="7"/><path d="M12 9v4l2.5 2M10 3h4"/>' },
  { key: 'E', title: 'Log expense', desc: 'Snap a receipt or type it in', color: 'var(--mi-green)', glyph: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>' },
  { key: 'C', title: 'Add client', desc: 'Company, contacts and rates', color: 'var(--mi-indigo)', glyph: '<circle cx="10" cy="9" r="3.5"/><path d="M4 19c.8-3 3.2-4.5 6-4.5s5.2 1.5 6 4.5M18 8v6M15 11h6"/>' },
  { key: 'P', title: 'New proposal', desc: 'Scope, timeline and price', color: 'var(--mi-s)', glyph: '<path d="M5 4h14v16H5z"/><path d="M9 9h6M9 13h6M9 17h3"/>' },
  { key: 'R', title: 'Run a report', desc: 'Profit, hours or tax period', color: 'var(--mi-teal)', glyph: '<path d="M5 20V10M12 20V4M19 20v-7"/>' }
]

const links = reactive([
  { id: 1, kind: 'Invoice', title: 'INV-0412 · Atelier Nord', meta: 'Draft, edited 12 min ago', pinned: true },
  { id: 2, kind: 'Project', title: 'Linden rebrand, phase 2', meta: '31 h logged of 48', pinned: false },
  { id: 3, kind: 'Report', title: 'Q3 VAT return', meta: 'Due 7 Nov', pinned: true },
  { id: 4, kind: 'Client', title: 'Hollis & Byrne Architects', meta: '2 unpaid invoices', pinned: false }
])
const sortedLinks = computed(() => [...links].sort((a, b) => Number(b.pinned) - Number(a.pinned)))

const flashes = reactive<Record<string, number>>({})
const recent = ref<{ id: number, title: string, color: string, at: string }[]>([])
const announce = ref('')
let seq = 0

function fire(a: Action) {
  seq += 1
  flashes[a.key] = seq
  announce.value = `Opened ${a.title}`
  recent.value = [{ id: seq, title: a.title, color: a.color, at: 'Just now' }, ...recent.value].slice(0, 3)
}

function onKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  if (e.metaKey || e.ctrlKey || e.altKey || t.closest('input, textarea, [contenteditable="true"]')) return
  const a = actions.find(x => x.key === e.key.toUpperCase())
  if (!a) return
  e.preventDefault()
  fire(a)
}
</script>

<style scoped>
.qal { container-type: inline-size; display: grid; align-content: start; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }
.qal__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 8px 16px; }
.qal__live { margin: 0; min-height: 1.4em; font-size: 13px; font-weight: 500; color: var(--mi-p-text); }

.qal__layout { display: grid; gap: 20px; }
@container (min-width: 900px) { .qal__layout { grid-template-columns: minmax(0, 1fr) 300px; align-items: start; } }

.qal__grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 480px) { .qal__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 660px) { .qal__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.qal__card {
  position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; width: 100%; height: 100%;
  padding: 14px; border: 0; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1);
  color: inherit; font: inherit; text-align: start; cursor: pointer; isolation: isolate;
  transition: transform var(--mi-dur-2) var(--mi-spring);
}
.qal__card:hover { transform: translateY(-2px); }
.qal__card:active { transform: scale(.98); }
.qal__card:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
@container (min-width: 660px) {
  .qal__card { grid-template-columns: 1fr auto; grid-template-rows: auto 1fr; align-items: start; gap: 18px 8px; padding: 16px; }
  .qal__text { grid-column: 1 / -1; grid-row: 2; }
  .qal__key { grid-column: 2; grid-row: 1; }
}
.qal__icon { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; color: var(--qal-c); background: color-mix(in srgb, var(--qal-c) 14%, transparent); }
.qal__text { display: grid; gap: 2px; min-width: 0; font-size: 13px; color: var(--mi-label2); }
.qal__text strong { font-size: 15px; font-weight: 600; color: var(--mi-label); }
.qal__flash { position: absolute; inset: 0; z-index: -1; border-radius: inherit; background: color-mix(in srgb, var(--qal-c) 18%, transparent); animation: qal-flash 700ms var(--mi-ease) both; }
@keyframes qal-flash { from { opacity: 1; transform: scale(.96); } to { opacity: 0; transform: scale(1.04); } }

.qal__side { display: grid; gap: 12px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.qal__links { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.qal__link { display: flex; align-items: center; gap: 4px; }
.qal__link-a { display: grid; flex: 1; min-width: 0; padding: 8px 10px; border-radius: var(--mi-radius-m); text-decoration: none; color: inherit; }
.qal__link-a:hover { background: var(--mi-fill3); }
.qal__link-a:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.qal__link-kind { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--mi-label3); }
.qal__link-title { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qal__link-meta { font-size: 12px; color: var(--mi-label2); }
.qal__pin--on { color: var(--mi-orange); }

.qal__recent { display: grid; gap: 8px; padding-top: 12px; border-top: 1px solid var(--mi-sep); }
.qal__caps { text-transform: uppercase; letter-spacing: .06em; }
.qal__recent-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; font-size: 13px; }
.qal__recent-list li { display: flex; align-items: center; gap: 8px; animation: qal-in var(--mi-dur-3) var(--mi-spring) both; }
.qal__recent-list li > span:nth-child(2) { flex: 1; }
.qal__recent-dot { width: 8px; height: 8px; border-radius: 50%; }
@keyframes qal-in { from { opacity: 0; transform: translateX(-6px); } }
@media (prefers-reduced-motion: reduce) { .qal__flash, .qal__recent-list li { animation: none; } .qal__card { transition: none; } }
</style>

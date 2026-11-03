<template>
  <!-- Single-letter shortcuts fire while focus is anywhere inside this panel, never page-wide. -->
  <section class="qal mi:@container mi:grid mi:content-start mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="qal-title" @keydown="onKey">
    <header class="qal__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-2 mi:gap-x-4">
      <div>
        <MiText id="qal-title" variant="title3" as="h2" weight="semibold">Quick actions</MiText>
        <MiText variant="footnote" tone="label2">Focus the panel and press a key, or click a card.</MiText>
      </div>
      <p class="qal__live mi:m-0 mi:min-h-[1.4em] mi:text-[13px] mi:font-medium mi:text-p-text" role="status" aria-live="polite">{{ announce }}</p>
    </header>

    <div class="qal__layout mi:grid mi:gap-5 mi:@[900px]:grid-cols-[minmax(0,_1fr)_300px] mi:@[900px]:items-start">
      <ul class="qal__grid mi:[list-style:none] mi:m-0 mi:p-0 mi:grid mi:gap-2.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[480px]:grid-cols-2 mi:@[660px]:grid-cols-3" aria-label="Actions">
        <li v-for="a in actions" :key="a.key">
          <button type="button" class="qal__card mi:relative mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:w-full mi:h-full mi:p-3.5 mi:[border:0] mi:rounded-lg mi:bg-card mi:shadow-1 mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:isolate mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:hover:transform-[translateY(-2px)] mi:active:transform-[scale(.98)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:@[660px]:grid-cols-[1fr_auto] mi:@[660px]:grid-rows-[auto_1fr] mi:@[660px]:items-start mi:@[660px]:gap-y-4.5 mi:@[660px]:gap-x-2 mi:@[660px]:p-4 mi:motion-reduce:[transition:none]" :aria-keyshortcuts="a.key" :style="{ '--qal-c': a.color }" @click="fire(a)">
            <span v-if="flashes[a.key]" :key="flashes[a.key]" class="qal__flash mi:absolute mi:inset-0 mi:-z-1 mi:rounded-[inherit] mi:[background:color-mix(in_srgb,_var(--qal-c)_18%,_transparent)]" aria-hidden="true" />
            <span class="qal__icon mi:grid mi:place-items-center mi:w-10 mi:h-10 mi:rounded-[12px] mi:text-(--qal-c) mi:[background:color-mix(in_srgb,_var(--qal-c)_14%,_transparent)]"><MiIcon :svg="a.glyph" :size="20" /></span>
            <span class="qal__text mi:@[660px]:col-span-full mi:@[660px]:row-[2] mi:grid mi:gap-0.5 mi:min-w-0 mi:text-[13px] mi:text-label2">
              <strong class="mi:[.qal__text_&]:text-[15px] mi:[.qal__text_&]:font-semibold mi:[.qal__text_&]:text-label">{{ a.title }}</strong>
              <span>{{ a.desc }}</span>
            </span>
            <MiKbd class="qal__key mi:@[660px]:col-[2] mi:@[660px]:row-[1]">{{ a.key }}</MiKbd>
          </button>
        </li>
      </ul>

      <aside class="qal__side mi:grid mi:gap-3 mi:p-4 mi:rounded-lg mi:bg-fill4" aria-labelledby="qal-jump">
        <MiText id="qal-jump" variant="subheadline" as="h3" weight="semibold">Jump back in</MiText>
        <ul class="qal__links mi:[list-style:none] mi:m-0 mi:p-0 mi:grid mi:gap-0.5">
          <li v-for="l in sortedLinks" :key="l.id" class="qal__link mi:flex mi:items-center mi:gap-1">
            <a href="#" class="qal__link-a mi:grid mi:flex-1 mi:min-w-0 mi:py-2 mi:px-2.5 mi:rounded-md mi:[text-decoration:none] mi:text-inherit mi:hover:bg-fill3 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]">
              <span class="qal__link-kind mi:text-[11px] mi:font-semibold mi:uppercase mi:tracking-[.06em] mi:text-label3">{{ l.kind }}</span>
              <span class="qal__link-title mi:text-[14px] mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ l.title }}</span>
              <span class="qal__link-meta mi:text-[12px] mi:text-label2">{{ l.meta }}</span>
            </a>
            <MiIconButton
              :label="(l.pinned ? 'Unpin ' : 'Pin ') + l.title" variant="plain" size="small" :pressed="l.pinned"
              @click="l.pinned = !l.pinned"
            >
              <MiIcon name="star" :size="16" :filled="l.pinned" :class="{ 'qal__pin--on mi:text-orange': l.pinned }" />
            </MiIconButton>
          </li>
        </ul>

        <div v-if="recent.length" class="qal__recent mi:grid mi:gap-2 mi:pt-3 mi:border-t mi:border-t-sep">
          <MiText variant="caption" tone="label3" weight="semibold" class="qal__caps">Just used</MiText>
          <ol class="qal__recent-list mi:[list-style:none] mi:m-0 mi:p-0 mi:grid mi:gap-1.5 mi:text-[13px]">
            <li class="mi:[.qal__recent-list_li&]:items-center mi:[.qal__recent-list_li&]:gap-2" v-for="r in recent" :key="r.id">
              <span class="qal__recent-dot mi:w-2 mi:h-2 mi:rounded-[50%]" :style="{ background: r.color }" aria-hidden="true" />
              <span>{{ r.title }}</span>
              <MiText class="mi:[.qal__recent-list_li&]:items-center mi:[.qal__recent-list_li&]:gap-2" variant="caption2" tone="label3" as="span">{{ r.at }}</MiText>
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
.qal__flash { animation: qal-flash 700ms var(--mi-ease) both; }
@keyframes qal-flash { from { opacity: 1; transform: scale(.96); } to { opacity: 0; transform: scale(1.04); } }
.qal__caps { text-transform: uppercase; letter-spacing: .06em; }
.qal__recent-list li { display: flex; animation: qal-in var(--mi-dur-3) var(--mi-spring) both; }
.qal__recent-list li > span:nth-child(2) { flex: 1; }
@keyframes qal-in { from { opacity: 0; transform: translateX(-6px); } }
@media (prefers-reduced-motion: reduce) { .qal__flash, .qal__recent-list li { animation: none; } }
</style>

<template>
  <section class="det" aria-labelledby="det-title">
    <div class="det__toolbar" role="toolbar" aria-label="Formatting">
      <MiMenu v-model="block" variant="popup" :items="blockItems" aria-label="Paragraph style" />
      <span class="det__sep" aria-hidden="true" />
      <div class="det__marks">
        <MiToggle v-for="m in marks" :key="m.key" v-model:pressed="active[m.key]" size="sm" :label="m.label">
          <span :class="'det__glyph det__glyph--' + m.key" aria-hidden="true">{{ m.glyph }}</span>
        </MiToggle>
      </div>
      <span class="det__sep" aria-hidden="true" />
      <MiToggleGroup v-model="align" :options="alignOptions" size="sm" label="Alignment">
        <template #default="{ option }"><MiIcon :name="iconFor(option.value)" :size="16" /></template>
      </MiToggleGroup>
      <span class="det__sep" aria-hidden="true" />
      <MiMenu :items="insertItems" aria-label="Insert" placement="bottom-end" @select="(i) => insert(String(i.value))">
        <template #trigger="{ props: tp }">
          <MiButton v-bind="tp" variant="tinted" size="small">
            <template #leading><MiIcon name="plus" :size="14" /></template>
            Insert
          </MiButton>
        </template>
      </MiMenu>
    </div>

    <article class="det__doc">
      <MiText id="det-title" variant="title2" as="h2" weight="bold">Field notes: Lisbon offsite</MiText>
      <MiText variant="caption" tone="label3">Edited by Clara Mendes · 3 min ago</MiText>

      <!-- The selected paragraph: the toolbar above formats it for real. -->
      <component :is="tag" class="det__target" :class="['is-' + block, { 'is-b': active.bold, 'is-i': active.italic, 'is-u': active.underline, 'is-s': active.strike }]" :style="{ textAlign: alignValue }">
        Day two moves to the LX Factory loft: kickoff at 9:30, roadmap review before lunch, and the customer panel with Ana from Tasca Rodrigues at 15:00.
      </component>

      <p v-for="(b, i) in inserted" :key="i" class="det__inserted"><MiIcon :name="glyph[b.icon]" :size="16" />{{ b.text }}</p>

      <!-- Slash command line with its menu open at the caret. -->
      <div class="det__slash">
        <p class="det__cmd"><span>/ch</span><i class="det__caret" aria-hidden="true" /></p>
        <MiContextMenu inline :items="slashItems" label="Insert block" :width="248" :highlighted="highlighted" @select="insert" />
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const blockItems = [
  { heading: 'Turn into' },
  { value: 'title', label: 'Title', shortcut: '⌥⌘1' },
  { value: 'heading', label: 'Heading', shortcut: '⌥⌘2' },
  { value: 'body', label: 'Body text', shortcut: '⌥⌘0' },
  { value: 'quote', label: 'Quote', shortcut: '⌥⌘Q' },
  { value: 'code', label: 'Code', shortcut: '⌥⌘C' }
]
const block = ref<string | number | undefined>('body')
const tag = computed(() => ({ title: 'h3', heading: 'h4', quote: 'blockquote', code: 'pre' } as Record<string, string>)[String(block.value)] ?? 'p')

type Mark = 'bold' | 'italic' | 'underline' | 'strike'
const marks: { key: Mark, label: string, glyph: string }[] = [
  { key: 'bold', label: 'Bold', glyph: 'B' },
  { key: 'italic', label: 'Italic', glyph: 'I' },
  { key: 'underline', label: 'Underline', glyph: 'U' },
  { key: 'strike', label: 'Strikethrough', glyph: 'S' }
]
const active = reactive<Record<Mark, boolean>>({ bold: false, italic: true, underline: false, strike: false })

const alignOptions = [{ value: 'left', ariaLabel: 'Align left' }, { value: 'center', ariaLabel: 'Align center' }, { value: 'right', ariaLabel: 'Align right' }]
const align = ref<string | number | (string | number)[] | null>('left')
const alignValue = computed(() => (typeof align.value === 'string' ? align.value : 'left') as 'left' | 'center' | 'right')
const iconFor = (v: string | number) => (v === 'center' ? 'align-center' : v === 'right' ? 'align-right' : 'align-left')

type FbIcon = 'check' | 'info' | 'calendar' | 'link' | 'document' | 'comment'
const catalog: Record<string, { label: string, icon: FbIcon, shortcut?: string, text: string }> = {
  checklist: { label: 'Checklist', icon: 'check', shortcut: '⌘⇧9', text: 'Book the ferry to Cacilhas for Thursday' },
  callout: { label: 'Callout', icon: 'info', text: 'Bring adapters: the loft only has type F sockets.' },
  date: { label: 'Date', icon: 'calendar', shortcut: '@', text: 'Wednesday, Nov 18 · 09:30' },
  page: { label: 'Link to page', icon: 'link', shortcut: '[[', text: 'Offsite budget, rev. 3' },
  file: { label: 'Embed file', icon: 'document', text: 'lisbon-venue-floorplan.pdf' },
  comment: { label: 'Comment', icon: 'comment', shortcut: '⌘⌥M', text: 'Clara: confirm the panel slot with Ana.' }
}
const slashItems = [
  { id: 'checklist', label: catalog.checklist!.label, icon: catalog.checklist!.icon, shortcut: catalog.checklist!.shortcut },
  { id: 'callout', label: catalog.callout!.label, icon: catalog.callout!.icon },
  { id: 'sep', type: 'separator' as const },
  { id: 'date', label: catalog.date!.label, icon: catalog.date!.icon, shortcut: catalog.date!.shortcut },
  { id: 'page', label: catalog.page!.label, icon: catalog.page!.icon, shortcut: catalog.page!.shortcut },
  { id: 'file', label: catalog.file!.label, icon: catalog.file!.icon }
]
const insertItems = [
  { heading: 'Blocks' },
  { value: 'checklist', label: 'Checklist', shortcut: '⌘⇧9' },
  { value: 'callout', label: 'Callout' },
  { heading: 'Inline' },
  { value: 'date', label: 'Date' },
  { value: 'page', label: 'Link to page' },
  { value: 'comment', label: 'Comment', shortcut: '⌘⌥M' }
]

const highlighted = ref('checklist')
const inserted = ref<{ icon: FbIcon, text: string }[]>([])
/** MiIcon names for the menu glyphs (the menu uses the feedback icon set). */
const glyph = { check: 'check', info: 'info-circle', calendar: 'calendar', link: 'share', document: 'document', comment: 'chat' } as const
function insert(id: string) {
  const entry = catalog[id]
  if (!entry) return
  highlighted.value = id
  inserted.value = [...inserted.value, { icon: entry.icon, text: entry.text }].slice(-3)
}
</script>

<style scoped>
.det { container-type: inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }

.det__toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 8px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh2); }
.det__marks { display: flex; gap: 2px; }
.det__sep { width: 1px; height: 20px; background: var(--mi-sep); }
.det__glyph { display: inline-block; min-width: 12px; font-size: 14px; text-align: center; }
.det__glyph--bold { font-weight: 800; }
.det__glyph--italic { font-style: italic; font-family: Georgia, serif; }
.det__glyph--underline { text-decoration: underline; text-underline-offset: 2px; }
.det__glyph--strike { text-decoration: line-through; }

.det__doc { display: grid; gap: 10px; padding: clamp(18px, 5cqi, 40px); border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.det__target { margin: 8px 0 0; padding: 4px 6px; margin-inline: -6px; border-radius: 6px; background: color-mix(in srgb, var(--mi-p) 14%, transparent); box-shadow: inset 2px 0 0 var(--mi-p); font-size: 16px; line-height: 1.6; max-width: 68ch; }
.det__target.is-title { font-size: 26px; line-height: 1.25; font-weight: 700; letter-spacing: -.02em; }
.det__target.is-heading { font-size: 19px; line-height: 1.35; font-weight: 600; }
.det__target.is-quote { padding-inline-start: 14px; font-size: 17px; color: var(--mi-label2); box-shadow: inset 3px 0 0 var(--mi-label3); }
.det__target.is-code { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; background: var(--mi-fill4); }
.det__target.is-b { font-weight: 700; }
.det__target.is-i { font-style: italic; }
.det__target.is-u { text-decoration: underline; text-underline-offset: 3px; }
.det__target.is-s { text-decoration: line-through; }
.det__target.is-u.is-s { text-decoration: underline line-through; }

.det__inserted { display: flex; align-items: center; gap: 8px; margin: 0; padding: 8px 10px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); font-size: 14px; animation: det-in var(--mi-dur-3) var(--mi-spring); }
.det__inserted :deep(svg) { flex: none; color: var(--mi-p-text); }
@keyframes det-in { from { opacity: 0; transform: translateY(6px); } }

.det__slash { display: grid; justify-items: start; gap: 6px; }
.det__cmd { display: flex; align-items: center; margin: 0; font-size: 16px; color: var(--mi-label2); }
.det__cmd span { padding: 0 2px; border-radius: 4px; background: var(--mi-fill3); }
.det__caret { width: 2px; height: 20px; margin-inline-start: 1px; background: var(--mi-p); animation: det-blink 1.1s steps(1) infinite; }
@keyframes det-blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .det__caret, .det__inserted { animation: none; } }
.det__slash > :last-child { max-width: 100%; }
</style>

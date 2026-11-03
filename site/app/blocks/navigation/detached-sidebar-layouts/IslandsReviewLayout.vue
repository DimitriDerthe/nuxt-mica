<template>
  <div class="irl">
    <div class="irl__shell">
      <!-- Island 1: navigation. A floating column when wide, a floating pill strip when narrow. -->
      <nav class="irl__nav" aria-label="Review files">
        <div class="irl__brand">
          <span class="irl__mark" aria-hidden="true" />
          <MiText as="span" variant="subheadline" weight="bold" class="irl__brand-name">Proofroom</MiText>
        </div>
        <MiText as="span" variant="caption2" tone="label3" weight="semibold" class="irl__nav-label">Spring campaign</MiText>
        <ul class="irl__files">
          <li v-for="f in files" :key="f.id">
            <button type="button" class="irl__file" :aria-current="f.id === fileId ? 'page' : undefined" @click="openFile(f.id)">
              <span class="irl__thumb" :style="{ '--a': `var(--mi-${f.hue})` }" aria-hidden="true" />
              <span class="irl__file-name">{{ f.name }}</span>
              <MiBadge v-if="openCount(f) > 0" :count="openCount(f)" tone="primary" count-noun="open comments" />
            </button>
          </li>
        </ul>
      </nav>

      <!-- Island 2: the canvas, with numbered pins tied to the comments. -->
      <main class="irl__canvas" aria-labelledby="irl-title">
        <div class="irl__canvas-head">
          <MiText id="irl-title" variant="headline" as="h2">{{ file.name }}</MiText>
          <MiText as="span" variant="caption" tone="label2">v{{ file.version }} · by {{ file.author }}</MiText>
        </div>
        <div class="irl__art" :style="{ '--a': `var(--mi-${file.hue})` }">
          <span class="irl__art-sun" aria-hidden="true" />
          <span class="irl__art-title" aria-hidden="true">{{ file.headline }}</span>
          <button
            v-for="(c, i) in file.comments" :key="c.id" type="button" class="irl__pin" :class="{ 'is-on': c.id === focus, 'is-done': c.resolved }"
            :style="{ left: c.x + '%', top: c.y + '%' }" :aria-label="`Comment ${i + 1} by ${c.who}`" :aria-pressed="c.id === focus" @click="focus = c.id"
          >{{ i + 1 }}</button>
        </div>
      </main>

      <!-- Island 3: comments. Selecting a pin highlights its thread; resolve dims the pin. -->
      <aside class="irl__notes" aria-labelledby="irl-notes">
        <div class="irl__notes-head">
          <MiText id="irl-notes" variant="headline" as="h3">Comments</MiText>
          <MiText as="span" variant="caption" tone="label2" tabular>{{ openCount(file) }} open</MiText>
        </div>
        <ol class="irl__list">
          <li v-for="(c, i) in file.comments" :key="c.id" class="irl__note" :class="{ 'is-on': c.id === focus, 'is-done': c.resolved }">
            <button type="button" class="irl__note-main" @click="focus = c.id">
              <span class="irl__num" aria-hidden="true">{{ i + 1 }}</span>
              <span class="irl__note-text">
                <MiText as="span" variant="footnote" weight="semibold">{{ c.who }}</MiText>
                <MiText as="span" variant="footnote" tone="label2">{{ c.text }}</MiText>
              </span>
            </button>
            <MiButton variant="plain" size="mini" :aria-pressed="c.resolved" @click="c.resolved = !c.resolved">{{ c.resolved ? 'Reopen' : 'Resolve' }}</MiButton>
          </li>
        </ol>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Hue = 'orange' | 'teal' | 'pink'
interface Comment { id: string, who: string, text: string, x: number, y: number, resolved: boolean }
interface ReviewFile { id: string, name: string, hue: Hue, version: number, author: string, headline: string, comments: Comment[] }

const files = reactive<ReviewFile[]>([
  {
    id: 'hero', name: 'Homepage hero', hue: 'orange', version: 4, author: 'Camille Roux', headline: 'Bloom season',
    comments: [
      { id: 'c1', who: 'Dev Malhotra', text: 'Headline wraps on 360px. Try the condensed cut.', x: 30, y: 58, resolved: false },
      { id: 'c2', who: 'Sofia Lind', text: 'Sun feels too saturated next to the logo.', x: 74, y: 26, resolved: false },
      { id: 'c3', who: 'Camille Roux', text: 'Swapped the CTA to the brand colour.', x: 52, y: 82, resolved: true }
    ]
  },
  {
    id: 'email', name: 'Launch email', hue: 'teal', version: 2, author: 'Noah Becker', headline: 'New in store',
    comments: [{ id: 'c4', who: 'Sofia Lind', text: 'Preheader text is missing.', x: 22, y: 20, resolved: false }]
  },
  { id: 'social', name: 'Social square', hue: 'pink', version: 7, author: 'Camille Roux', headline: '20% off', comments: [] }
])

const fileId = ref('hero')
const focus = ref('c1')

const file = computed(() => files.find(f => f.id === fileId.value) ?? files[0]!)

function openCount(f: ReviewFile) { return f.comments.filter(c => !c.resolved).length }
function openFile(id: string) {
  fileId.value = id
  focus.value = file.value.comments[0]?.id ?? ''
}
</script>

<style scoped>
.irl { container-type: inline-size; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: radial-gradient(120% 80% at 0% 0%, var(--mi-p-tint), transparent 60%), var(--mi-page); }
.irl__shell { display: grid; gap: 12px; padding: 12px; }

/* Shared island look: every panel floats as its own card with breathing room around it. */
.irl__nav, .irl__canvas, .irl__notes { min-width: 0; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2), inset 0 0 0 1px var(--mi-sep); }

.irl__nav { display: flex; align-items: center; gap: 10px; padding: 6px 6px 6px 12px; border-radius: 999px; }
.irl__brand { display: flex; align-items: center; gap: 8px; flex: none; }
.irl__mark { width: 22px; height: 22px; border-radius: 50%; background: conic-gradient(from 90deg, var(--mi-p), var(--mi-s), var(--mi-p)); }
.irl__brand-name, .irl__nav-label { display: none; }
.irl__files { display: flex; gap: 4px; flex: 1; min-width: 0; margin: 0; padding: 0; list-style: none; overflow-x: auto; scrollbar-width: none; }
.irl__file { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 10px 6px 6px; border: 0; border-radius: 999px; font: inherit; font-size: 13px; font-weight: 500; color: var(--mi-label2); background: transparent; white-space: nowrap; cursor: pointer; }
.irl__file:hover { background: var(--mi-fill4); }
.irl__file[aria-current="page"] { color: var(--mi-label); background: var(--mi-fill3); }
.irl__file:focus-visible, .irl__pin:focus-visible, .irl__note-main:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.irl__thumb { width: 22px; height: 22px; flex: none; border-radius: 7px; background: linear-gradient(135deg, var(--a), color-mix(in srgb, var(--a) 30%, var(--mi-card))); }
.irl__file-name { flex: 1; text-align: start; }

.irl__canvas { display: grid; gap: 12px; padding: 14px; }
.irl__canvas-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; }
.irl__art { position: relative; aspect-ratio: 16 / 10; border-radius: var(--mi-radius-l); overflow: hidden; background: linear-gradient(170deg, color-mix(in srgb, var(--a) 28%, var(--mi-card)), color-mix(in srgb, var(--a) 8%, var(--mi-page))); }
.irl__art-sun { position: absolute; right: 14%; top: 14%; width: 22%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--a) 60%, var(--mi-card)), var(--a)); }
.irl__art-title { position: absolute; left: 8%; bottom: 22%; max-width: 70%; font-size: clamp(22px, 7cqi, 48px); font-weight: 800; letter-spacing: -.04em; line-height: 1; color: var(--mi-label); }
.irl__pin {
  position: absolute; display: grid; place-items: center; width: 26px; height: 26px; border: 2px solid var(--mi-card); border-radius: 50% 50% 50% 4px; translate: -50% -100%;
  font: inherit; font-size: 12px; font-weight: 700; color: var(--mi-p-on); background: var(--mi-p); box-shadow: var(--mi-sh2); cursor: pointer;
  transition: transform var(--mi-dur-2) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease);
}
.irl__pin.is-on { transform: scale(1.18); }
.irl__pin.is-done { opacity: .45; }

.irl__notes { display: grid; align-content: start; gap: 8px; padding: 14px; }
.irl__notes-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.irl__list { display: grid; gap: 4px; margin: 0; padding: 0; list-style: none; }
.irl__note { display: flex; align-items: flex-start; gap: 4px; padding: 4px; border-radius: 12px; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.irl__note.is-on { background: var(--mi-p-tint); }
.irl__note.is-done { opacity: .6; }
.irl__note-main { display: flex; align-items: flex-start; gap: 10px; flex: 1; min-width: 0; padding: 6px; border: 0; border-radius: 9px; font: inherit; text-align: start; color: inherit; background: transparent; cursor: pointer; }
.irl__num { display: grid; place-items: center; width: 22px; height: 22px; flex: none; border-radius: 50%; font-size: 11px; font-weight: 700; color: var(--mi-p-text); background: var(--mi-p-tint); }
.irl__note.is-on .irl__num { color: var(--mi-p-on); background: var(--mi-p); }
.irl__note-text { display: grid; gap: 2px; min-width: 0; }

@container (min-width: 640px) {
  .irl__shell { grid-template-columns: minmax(0, 1fr) 260px; padding: 16px; gap: 16px; }
  .irl__nav { grid-column: 1 / -1; }
}
@container (min-width: 960px) {
  .irl__shell { grid-template-columns: 220px minmax(0, 1fr) 280px; align-items: start; }
  .irl__nav { grid-column: auto; flex-direction: column; align-items: stretch; gap: 12px; padding: 14px 10px; border-radius: var(--mi-radius-xl); }
  .irl__brand { padding: 0 6px; }
  .irl__brand-name, .irl__nav-label { display: inline; }
  .irl__nav-label { padding: 0 8px; text-transform: uppercase; letter-spacing: .06em; }
  .irl__files { flex-direction: column; overflow: visible; }
  .irl__file { border-radius: 10px; }
}
</style>

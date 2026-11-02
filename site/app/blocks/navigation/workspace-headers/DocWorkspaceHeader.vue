<template>
  <div class="dw" :class="'dw--' + mode">
    <header class="dw__header">
      <div class="dw__bar">
        <MiIconButton size="toolbar" variant="plain" label="Toggle sidebar"><MiIcon name="sidebar" /></MiIconButton>

        <div class="dw__doc">
          <MiText as="span" variant="caption" tone="label3" class="dw__path">Research / Customer interviews</MiText>
          <label class="dw__title-wrap">
            <span class="dw__sr">Document title</span>
            <input v-model="title" class="dw__title" :readonly="mode === 'view'" spellcheck="false" @input="markDirty">
          </label>
        </div>

        <span class="dw__save" role="status">
          <MiSpinner v-if="saving" variant="arc" :size="12" label="" />
          <MiIcon v-else :svg="icons.cloud" :size="15" />
          <span class="dw__save-text">{{ saving ? 'Saving…' : 'Saved' }}</span>
        </span>

        <div class="dw__tools">
          <!-- Presence: who is here right now, ringed in their cursor color. -->
          <div class="dw__presence">
            <MiAvatarGroup :items="people" :max="3" :size="28" label="3 people editing: Ingrid Holm, Daniel Osei, Meera Pillai" />
            <MiText as="span" variant="caption" tone="label2" weight="medium" class="dw__live">3 editing</MiText>
          </div>
          <MiBadge :count="comments" tone="primary" :offset="2" count-noun="open comments">
            <template #target>
              <MiIconButton size="toolbar" variant="plain" label="Comments"><MiIcon name="chat" /></MiIconButton>
            </template>
          </MiBadge>
          <MiButton class="dw__share" variant="bordered" size="small">Share</MiButton>
          <MiIconButton class="dw__share-icon" size="toolbar" variant="plain" label="Share"><MiIcon name="share" /></MiIconButton>
          <MiButton size="small" :variant="published && !dirty ? 'gray' : 'filled'" @click="publish">
            {{ published ? (dirty ? 'Update' : 'Published') : 'Publish' }}
          </MiButton>
        </div>
      </div>

      <!-- Mode strip: the header's accent line follows the editing mode. -->
      <div class="dw__mode">
        <MiSegmented v-model="mode" label="Editing mode" :options="modes" />
        <MiText as="span" variant="caption" tone="label2" class="dw__mode-hint">
          <MiIcon :svg="modeIcon" :size="14" /> {{ hint }}
        </MiText>
      </div>
    </header>

    <main class="dw__page" aria-label="Document">
      <article class="dw__sheet">
        <h2 class="dw__h">{{ title || 'Untitled' }}</h2>
        <p>Twelve dispatchers across four depots walked us through a normal Monday. The same pain came up in nine sessions: route changes arrive by phone, and nobody trusts the app to show the latest plan.</p>
        <p>
          Dispatchers keep a paper copy “just in case”
          <ins v-if="mode === 'suggest'" class="dw__ins">and photograph it at shift change</ins>,
          which doubles the work when a driver calls in sick.
        </p>
        <div class="dw__quote">“If I can't see who changed the route, I assume nobody did.” <span>Depot lead, Rotterdam</span></div>
      </article>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const icons = {
  cloud: '<path d="M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9H7Z"/><path d="m9.5 13.5 2 2 3.5-3.5"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
  suggest: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="M15 19h5M17.5 16.5v5"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
}

const people = [
  { name: 'Ingrid Holm', tone: 'pink' as const },
  { name: 'Daniel Osei', tone: 'teal' as const },
  { name: 'Meera Pillai', tone: 'orange' as const }
]
const modes = [{ value: 'edit', label: 'Editing' }, { value: 'suggest', label: 'Suggesting' }, { value: 'view', label: 'Viewing' }]
const mode = ref<string | number | null>('edit')
const modeIcon = computed(() => (mode.value === 'view' ? icons.lock : mode.value === 'suggest' ? icons.suggest : icons.pencil))
const hint = computed(() => ({
  edit: 'Changes go straight into the document',
  suggest: 'Your edits show as suggestions for Ingrid to accept',
  view: 'Read only. Nothing you do changes the document'
}[String(mode.value) as 'edit' | 'suggest' | 'view']))

const title = ref('Dispatcher interviews: what breaks on Mondays')
const comments = ref(4)
const saving = ref(false)
const dirty = ref(false)
const published = ref(false)

let saveTimer: ReturnType<typeof setTimeout> | undefined
function markDirty() {
  dirty.value = true
  saving.value = true
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => { saving.value = false }, 900)
}
function publish() {
  published.value = true
  dirty.value = false
}
onBeforeUnmount(() => clearTimeout(saveTimer))
</script>

<style scoped>
.dw { container-type: inline-size; display: grid; align-content: start; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); --accent: var(--mi-p); }
.dw--suggest { --accent: var(--mi-s); }
.dw--view { --accent: var(--mi-label3); }

.dw__header { position: relative; display: grid; gap: 10px; padding: 8px 12px 10px; background: var(--mi-card); box-shadow: 0 1px 0 var(--mi-sep); }
/* Accent hairline under the header, recolored by mode (color swap only, no layout change). */
.dw__header::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--accent); }

.dw__bar { display: flex; align-items: center; gap: 8px; min-width: 0; }
.dw__doc { display: grid; flex: 1 1 auto; min-width: 0; }
.dw__path { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.dw__title-wrap { display: block; min-width: 0; }
.dw__title {
  width: 100%; min-width: 0; margin: 0 0 0 -6px; padding: 2px 6px; border: 0; border-radius: 6px; outline: none;
  font: inherit; font-size: 15px; font-weight: 600; color: inherit; background: transparent; text-overflow: ellipsis;
}
.dw__title:hover:not([readonly]) { background: var(--mi-fill4); }
.dw__title:focus-visible { box-shadow: 0 0 0 2px var(--mi-p); }

.dw__save { display: none; align-items: center; gap: 6px; flex: none; font-size: 12px; color: var(--mi-label3); }
.dw__tools { display: flex; align-items: center; gap: 4px; flex: none; }
.dw__presence { display: none; align-items: center; gap: 8px; margin-right: 6px; }
.dw__live { white-space: nowrap; }
.dw__share { display: none; }

.dw__mode { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; }
.dw__mode-hint { display: inline-flex; align-items: center; gap: 6px; }

.dw__page { padding: 18px 12px 28px; }
.dw__sheet {
  max-width: 680px; margin: 0 auto; padding: 24px 20px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep);
  font-size: 15px; line-height: 1.65; color: var(--mi-label2);
}
.dw__h { margin: 0 0 10px; font-size: 22px; line-height: 1.25; letter-spacing: -.02em; color: var(--mi-label); }
.dw__sheet p { margin: 0 0 12px; }
.dw__ins { text-decoration: none; color: var(--mi-s-text); background: var(--mi-s-tint); border-bottom: 2px solid var(--mi-s); border-radius: 3px; padding: 0 2px; }
.dw__quote { padding: 10px 14px; border-left: 3px solid var(--accent); border-radius: 0 8px 8px 0; color: var(--mi-label); background: var(--mi-fill4); }
.dw__quote span { display: block; font-size: 12px; color: var(--mi-label3); }
.dw__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

@container (min-width: 640px) {
  .dw__header { padding: 10px 20px 12px; }
  .dw__save { display: inline-flex; }
  .dw__share { display: inline-flex; }
  .dw__share-icon { display: none; }
  .dw__page { padding: 28px 20px 40px; }
  .dw__sheet { padding: 32px 40px; }
}
@container (min-width: 900px) {
  .dw__presence { display: inline-flex; }
  .dw__title { font-size: 16px; }
}
</style>

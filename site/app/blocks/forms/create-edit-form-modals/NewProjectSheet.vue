<template>
  <section class="nps" aria-labelledby="nps-board-title">
    <!-- Faux board behind the sheet -->
    <div class="nps__board" :inert="open || undefined">
      <div class="nps__board-head">
        <MiText id="nps-board-title" variant="title3" as="h2" weight="semibold">Projects</MiText>
        <MiButton size="small" @click="reopen">New project</MiButton>
      </div>
      <div class="nps__cols">
        <div v-for="p in projects" :key="p.key" class="nps__proj">
          <span class="nps__key" :style="{ background: p.color }">{{ p.key }}</span>
          <div class="nps__proj-text"><b>{{ p.name }}</b><span>{{ p.meta }}</span></div>
        </div>
      </div>
    </div>

    <Transition name="nps-fade">
      <div v-if="open" class="nps__scrim">
        <MiSheet :model-value="true" inline title="New project" cancel-label="Cancel" class="nps__sheet" @cancel="open = false">
          <template #trailing>
            <MiButton size="small" :disabled="!valid" @click="create">Create</MiButton>
          </template>

          <form class="nps__form" novalidate @submit.prevent="create">
            <!-- Live identity: what the project will look like in the sidebar and in issue ids. -->
            <div class="nps__preview" aria-live="polite">
              <span class="nps__tile" :style="{ background: color ?? 'var(--mi-p)' }">{{ key || '—' }}</span>
              <div class="nps__preview-text">
                <MiText variant="headline" :lines="1">{{ name || 'Untitled project' }}</MiText>
                <MiText variant="footnote" tone="label2">Issues will read {{ key || 'KEY' }}-1, {{ key || 'KEY' }}-2 · {{ privateProject ? 'Private' : 'Whole workspace' }}</MiText>
              </div>
            </div>

            <div class="nps__pair">
              <MiField label="Name" required :error="touched ? nameError : ''">
                <MiInput v-model="name" placeholder="Atlas onboarding revamp" maxlength="40" @blur="touched = true" />
              </MiField>
              <MiField label="Key" :error="keyError" hint="2 to 4 letters">
                <MiInput :model-value="key" maxlength="4" @update:model-value="setKey" />
              </MiField>
            </div>

            <MiSwatch v-model="color" label="Color" :options="swatches" />

            <fieldset class="nps__tpl">
              <legend>Start from</legend>
              <label v-for="t in templates" :key="t.id" class="nps__card" :class="{ 'is-on': template === t.id }">
                <input v-model="template" type="radio" name="nps-template" :value="t.id" class="nps__radio">
                <span class="nps__art" :class="'is-' + t.id" aria-hidden="true"><i /><i /><i /></span>
                <b>{{ t.label }}</b>
                <span>{{ t.hint }}</span>
              </label>
            </fieldset>

            <div class="nps__pair">
              <MiField label="Lead">
                <MiSelect v-model="lead" :options="people" placeholder="Choose a lead" />
              </MiField>
              <div class="nps__private">
                <div>
                  <MiText id="nps-private" variant="subheadline" weight="medium">Private</MiText>
                  <MiText variant="caption" tone="label2">Only invited members see it</MiText>
                </div>
                <MiSwitch v-model="privateProject" aria-labelledby="nps-private" />
              </div>
            </div>
          </form>
        </MiSheet>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const projects = ref([
  { key: 'WEB', name: 'Website 2025', meta: '42 issues · Hana', color: 'var(--mi-indigo)' },
  { key: 'OPS', name: 'Ops automation', meta: '18 issues · Yusuf', color: 'var(--mi-teal)' },
  { key: 'MKT', name: 'Spring campaign', meta: '27 issues · Clara', color: 'var(--mi-pink)' },
  { key: 'APP', name: 'Mobile app v3', meta: '64 issues · Felix', color: 'var(--mi-orange)' }
])
const swatches = [
  { value: 'var(--mi-p)', name: 'Brand', color: 'var(--mi-p)' },
  { value: 'var(--mi-s)', name: 'Accent', color: 'var(--mi-s)' },
  { value: 'var(--mi-green)', name: 'Green', color: 'var(--mi-green)' },
  { value: 'var(--mi-orange)', name: 'Orange', color: 'var(--mi-orange)' },
  { value: 'var(--mi-pink)', name: 'Pink', color: 'var(--mi-pink)' },
  { value: 'var(--mi-teal)', name: 'Teal', color: 'var(--mi-teal)' },
  { value: 'var(--mi-indigo)', name: 'Indigo', color: 'var(--mi-indigo)' }
]
const templates = [
  { id: 'board', label: 'Board', hint: 'Columns by status' },
  { id: 'timeline', label: 'Timeline', hint: 'Milestones by week' },
  { id: 'list', label: 'Backlog', hint: 'One ranked list' }
]
const people = [
  { value: 'hana', label: 'Hana Sato', description: 'Product design' },
  { value: 'yusuf', label: 'Yusuf Demir', description: 'Engineering' },
  { value: 'clara', label: 'Clara Mendes', description: 'Growth' }
]

const open = ref(true)
const name = ref('Atlas onboarding')
const keyOverride = ref<string | null>(null)
const color = ref<string | null>('var(--mi-green)')
const template = ref('board')
const lead = ref<string | number | null>('hana')
const privateProject = ref(false)
const touched = ref(false)

/** Key follows the name (initials, or the first letters of one word) until it is typed by hand. */
const autoKey = computed(() => {
  const words = name.value.trim().split(/\s+/).filter(Boolean)
  const raw = words.length > 1 ? words.map(w => w[0]).join('') : (words[0] ?? '').slice(0, 3)
  return raw.replace(/[^a-z]/gi, '').toUpperCase().slice(0, 4)
})
const key = computed(() => keyOverride.value ?? autoKey.value)
const setKey = (v: string) => { keyOverride.value = v.replace(/[^a-z]/gi, '').toUpperCase() }

const nameError = computed(() => (name.value.trim().length < 3 ? 'Give the project a name of at least 3 characters.' : ''))
const keyError = computed(() => {
  if (!/^[A-Z]{2,4}$/.test(key.value)) return 'Use 2 to 4 letters.'
  return projects.value.some(p => p.key === key.value) ? `${key.value} is used by another project.` : ''
})
const valid = computed(() => !nameError.value && !keyError.value)

function create() {
  touched.value = true
  if (!valid.value) return
  projects.value.unshift({ key: key.value, name: name.value.trim(), meta: '0 issues · ' + (people.find(p => p.value === lead.value)?.label.split(' ')[0] ?? 'No lead'), color: color.value ?? 'var(--mi-p)' })
  open.value = false
}
function reopen() {
  name.value = ''
  keyOverride.value = null
  touched.value = false
  open.value = true
}
</script>

<style scoped>
.nps { container-type: inline-size; position: relative; display: grid; min-height: 600px; border-radius: var(--mi-radius-xl); overflow: hidden; background: var(--mi-page); box-shadow: 0 0 0 1px var(--mi-sep); font-family: var(--mi-font); color: var(--mi-label); }
.nps__board, .nps__scrim { grid-area: 1 / 1; }
.nps__board { display: grid; align-content: start; gap: 14px; padding: 20px; }
.nps__board-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.nps__cols { display: grid; gap: 10px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 560px) { .nps__cols { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 900px) { .nps__cols { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.nps__proj { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.nps__key, .nps__tile { display: grid; place-items: center; flex: none; border-radius: 10px; color: var(--mi-card); font-weight: 800; letter-spacing: .04em; }
.nps__key { width: 40px; height: 40px; font-size: 11px; }
.nps__proj-text { display: grid; min-width: 0; font-size: 14px; }
.nps__proj-text span { font-size: 12px; color: var(--mi-label2); }

.nps__scrim { display: grid; align-items: end; justify-items: center; padding: 48px 10px 10px; background: var(--mi-scrim); }
@container (min-width: 640px) { .nps__scrim { align-items: center; padding: 24px; } }
.nps__sheet { width: 100%; max-width: 560px; }
.nps-fade-enter-active, .nps-fade-leave-active { transition: opacity var(--mi-dur-3) var(--mi-ease); }
.nps-fade-enter-from, .nps-fade-leave-to { opacity: 0; }

.nps__form { display: grid; gap: 16px; padding: 4px 0 8px; }
.nps__preview { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.nps__tile { width: 52px; height: 52px; font-size: 14px; box-shadow: var(--mi-sh1); }
.nps__preview-text { display: grid; gap: 2px; min-width: 0; }
.nps__pair { display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 520px) { .nps__pair { grid-template-columns: minmax(0, 1fr) 150px; align-items: start; } .nps__pair:last-child { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: end; } }

.nps__tpl { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0; padding: 0; border: 0; min-width: 0; }
.nps__tpl legend { margin-bottom: 8px; padding: 0; font-size: 13px; font-weight: 600; }
.nps__card {
  position: relative; display: grid; gap: 2px; padding: 10px; border-radius: var(--mi-radius-m); cursor: pointer; font-size: 13px;
  background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); transition: transform var(--mi-dur-2) var(--mi-ease);
}
.nps__card:hover { transform: translateY(-1px); }
.nps__card.is-on { box-shadow: 0 0 0 2px var(--mi-p); }
.nps__card:has(:focus-visible) { outline: 3px solid color-mix(in srgb, var(--mi-p) 45%, transparent); outline-offset: 2px; }
.nps__card span:last-child { font-size: 11px; color: var(--mi-label2); }
.nps__radio { position: absolute; opacity: 0; pointer-events: none; }
/* Tiny diagrams of each template, drawn with three bars. */
.nps__art { display: flex; gap: 3px; height: 30px; margin-bottom: 6px; }
.nps__art i { flex: 1; border-radius: 3px; background: var(--mi-fill2); }
.is-on .nps__art i { background: var(--mi-p-tint); }
.nps__art.is-board i:nth-child(1) { transform: scaleY(.9); transform-origin: top; }
.nps__art.is-board i:nth-child(3) { transform: scaleY(.55); transform-origin: top; }
.nps__art.is-timeline { flex-direction: column; }
.nps__art.is-timeline i:nth-child(1) { transform: scaleX(.5); transform-origin: left; }
.nps__art.is-timeline i:nth-child(2) { transform: translateX(30%) scaleX(.55); transform-origin: left; }
.nps__art.is-timeline i:nth-child(3) { transform: translateX(60%) scaleX(.4); transform-origin: left; }
.nps__art.is-list { flex-direction: column; }
.nps__art.is-list i:nth-child(2) { transform: scaleX(.8); transform-origin: left; }
.nps__art.is-list i:nth-child(3) { transform: scaleX(.6); transform-origin: left; }
.nps__private { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 44px; }
</style>

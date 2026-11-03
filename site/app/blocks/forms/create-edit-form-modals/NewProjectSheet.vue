<template>
  <section class="nps mi:@container mi:relative mi:grid mi:min-h-150 mi:rounded-xl mi:overflow-hidden mi:bg-page mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:font-mi mi:text-label" aria-labelledby="nps-board-title">
    <!-- Faux board behind the sheet -->
    <div class="nps__board mi:[grid-area:1_/_1] mi:grid mi:content-start mi:gap-3.5 mi:p-5" :inert="open || undefined">
      <div class="nps__board-head mi:flex mi:items-center mi:justify-between mi:gap-3">
        <MiText id="nps-board-title" variant="title3" as="h2" weight="semibold">Projects</MiText>
        <MiButton size="small" @click="reopen">New project</MiButton>
      </div>
      <div class="nps__cols mi:grid mi:gap-2.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[560px]:grid-cols-2 mi:@[900px]:grid-cols-4">
        <div v-for="p in projects" :key="p.key" class="nps__proj mi:flex mi:items-center mi:gap-3 mi:p-3.5 mi:rounded-lg mi:bg-card mi:shadow-1">
          <span class="nps__key mi:grid mi:place-items-center mi:flex-[none] mi:rounded-[10px] mi:text-card mi:font-extrabold mi:tracking-[.04em] mi:w-10 mi:h-10 mi:text-[11px]" :style="{ background: p.color }">{{ p.key }}</span>
          <div class="nps__proj-text mi:grid mi:min-w-0 mi:text-[14px]"><b>{{ p.name }}</b><span class="mi:[.nps__proj-text_&]:text-[12px] mi:[.nps__proj-text_&]:text-label2">{{ p.meta }}</span></div>
        </div>
      </div>
    </div>

    <Transition name="nps-fade">
      <div v-if="open" class="nps__scrim mi:[grid-area:1_/_1] mi:grid mi:items-end mi:justify-items-center mi:pt-12 mi:px-2.5 mi:pb-2.5 mi:bg-scrim mi:@[640px]:items-center mi:@[640px]:p-6">
        <MiSheet :model-value="true" inline title="New project" cancel-label="Cancel" class="nps__sheet" @cancel="open = false">
          <template #trailing>
            <MiButton size="small" :disabled="!valid" @click="create">Create</MiButton>
          </template>

          <form class="nps__form mi:grid mi:gap-4 mi:pt-1 mi:px-0 mi:pb-2" novalidate @submit.prevent="create">
            <!-- Live identity: what the project will look like in the sidebar and in issue ids. -->
            <div class="nps__preview mi:flex mi:items-center mi:gap-3.5 mi:p-3.5 mi:rounded-lg mi:bg-fill4" aria-live="polite">
              <span class="nps__tile mi:grid mi:place-items-center mi:flex-[none] mi:rounded-[10px] mi:text-card mi:font-extrabold mi:tracking-[.04em] mi:w-13 mi:h-13 mi:text-[14px] mi:shadow-1" :style="{ background: color ?? 'var(--mi-p)' }">{{ key || '—' }}</span>
              <div class="nps__preview-text mi:grid mi:gap-0.5 mi:min-w-0">
                <MiText variant="headline" :lines="1">{{ name || 'Untitled project' }}</MiText>
                <MiText variant="footnote" tone="label2">Issues will read {{ key || 'KEY' }}-1, {{ key || 'KEY' }}-2 · {{ privateProject ? 'Private' : 'Whole workspace' }}</MiText>
              </div>
            </div>

            <div class="nps__pair mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[520px]:grid-cols-[minmax(0,_1fr)_150px] mi:@[520px]:items-start mi:@[520px]:last:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:@[520px]:last:items-end">
              <MiField label="Name" required :error="touched ? nameError : ''">
                <MiInput v-model="name" placeholder="Atlas onboarding revamp" maxlength="40" @blur="touched = true" />
              </MiField>
              <MiField label="Key" :error="keyError" hint="2 to 4 letters">
                <MiInput :model-value="key" maxlength="4" @update:model-value="setKey" />
              </MiField>
            </div>

            <MiSwatch v-model="color" label="Color" :options="swatches" />

            <fieldset class="nps__tpl mi:grid mi:grid-cols-3 mi:gap-2 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
              <legend class="mi:[.nps__tpl_&]:mb-2 mi:[.nps__tpl_&]:p-0 mi:[.nps__tpl_&]:text-[13px] mi:[.nps__tpl_&]:font-semibold">Start from</legend>
              <label v-for="t in templates" :key="t.id" class="nps__card mi:relative mi:grid mi:gap-0.5 mi:p-2.5 mi:rounded-md mi:cursor-pointer mi:text-[13px] mi:bg-card mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)] mi:[&.is-on]:shadow-[0_0_0_2px_var(--mi-p)] mi:[&:has(:focus-visible)]:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_45%,_transparent)] mi:[&:has(:focus-visible)]:outline-offset-[2px]" :class="{ 'is-on': template === t.id }">
                <input v-model="template" type="radio" name="nps-template" :value="t.id" class="nps__radio mi:absolute mi:opacity-0 mi:pointer-events-none">
                <span class="nps__art mi:[.nps__card_&:last-child]:text-[11px] mi:[.nps__card_&:last-child]:text-label2 mi:flex mi:gap-[3px] mi:h-7.5 mi:mb-1.5" :class="'is-' + t.id" aria-hidden="true"><i class="mi:[.nps__art_&]:flex-1 mi:[.nps__art_&]:rounded-[3px] mi:[.nps__art_&]:bg-fill2 mi:[.is-on_.nps__art_&]:bg-p-tint mi:[.nps__art.is-board_&:nth-child(1)]:transform-[scaleY(.9)] mi:[.nps__art.is-board_&:nth-child(1)]:origin-top mi:[.nps__art.is-board_&:nth-child(3)]:transform-[scaleY(.55)] mi:[.nps__art.is-board_&:nth-child(3)]:origin-top" /><i class="mi:[.nps__art_&]:flex-1 mi:[.nps__art_&]:rounded-[3px] mi:[.nps__art_&]:bg-fill2 mi:[.is-on_.nps__art_&]:bg-p-tint mi:[.nps__art.is-board_&:nth-child(1)]:transform-[scaleY(.9)] mi:[.nps__art.is-board_&:nth-child(1)]:origin-top mi:[.nps__art.is-board_&:nth-child(3)]:transform-[scaleY(.55)] mi:[.nps__art.is-board_&:nth-child(3)]:origin-top" /><i class="mi:[.nps__art_&]:flex-1 mi:[.nps__art_&]:rounded-[3px] mi:[.nps__art_&]:bg-fill2 mi:[.is-on_.nps__art_&]:bg-p-tint mi:[.nps__art.is-board_&:nth-child(1)]:transform-[scaleY(.9)] mi:[.nps__art.is-board_&:nth-child(1)]:origin-top mi:[.nps__art.is-board_&:nth-child(3)]:transform-[scaleY(.55)] mi:[.nps__art.is-board_&:nth-child(3)]:origin-top" /></span>
                <b>{{ t.label }}</b>
                <span class="mi:[.nps__card_&:last-child]:text-[11px] mi:[.nps__card_&:last-child]:text-label2">{{ t.hint }}</span>
              </label>
            </fieldset>

            <div class="nps__pair mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[520px]:grid-cols-[minmax(0,_1fr)_150px] mi:@[520px]:items-start mi:@[520px]:last:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:@[520px]:last:items-end">
              <MiField label="Lead">
                <MiSelect v-model="lead" :options="people" placeholder="Choose a lead" />
              </MiField>
              <div class="nps__private mi:flex mi:items-center mi:justify-between mi:gap-3 mi:min-h-11">
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
.nps__sheet { width: 100%; max-width: 560px; }
.nps-fade-enter-active, .nps-fade-leave-active { transition: opacity var(--mi-dur-3) var(--mi-ease); }
.nps-fade-enter-from, .nps-fade-leave-to { opacity: 0; }
.nps__art.is-timeline { flex-direction: column; }
.nps__art.is-timeline i:nth-child(1) { transform: scaleX(.5); transform-origin: left; }
.nps__art.is-timeline i:nth-child(2) { transform: translateX(30%) scaleX(.55); transform-origin: left; }
.nps__art.is-timeline i:nth-child(3) { transform: translateX(60%) scaleX(.4); transform-origin: left; }
.nps__art.is-list { flex-direction: column; }
.nps__art.is-list i:nth-child(2) { transform: scaleX(.8); transform-origin: left; }
.nps__art.is-list i:nth-child(3) { transform: scaleX(.6); transform-origin: left; }
</style>

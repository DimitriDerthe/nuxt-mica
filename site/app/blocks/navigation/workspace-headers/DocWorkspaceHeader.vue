<template>
  <div class="mi:@container mi:grid mi:content-start mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]" :class="[mode === 'suggest' ? 'mi:[--accent:var(--mi-s)]' : mode === 'view' ? 'mi:[--accent:var(--mi-label3)]' : 'mi:[--accent:var(--mi-p)]']">
    <header class="mi:relative mi:grid mi:gap-2.5 mi:pt-2 mi:px-3 mi:pb-2.5 mi:[background:var(--mi-card)] mi:shadow-[0_1px_0_var(--mi-sep)] mi:after:content-[''] mi:after:absolute mi:after:left-0 mi:after:right-0 mi:after:-bottom-px mi:after:h-0.5 mi:after:[background:var(--accent)] mi:@[640px]:pt-2.5 mi:@[640px]:px-5 mi:@[640px]:pb-3">
      <div class="mi:flex mi:items-center mi:gap-2 mi:min-w-0">
        <MiIconButton size="toolbar" variant="plain" label="Toggle sidebar"><MiIcon name="sidebar" /></MiIconButton>

        <div class="mi:grid mi:flex-[1_1_auto] mi:min-w-0">
          <MiText as="span" variant="caption" tone="label3" class="mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">Research / Customer interviews</MiText>
          <label class="mi:block mi:min-w-0">
            <span class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip:rect(0_0_0_0)] mi:whitespace-nowrap">Document title</span>
            <input v-model="title" class="mi:[font:inherit] mi:text-[15px] mi:font-semibold mi:@[900px]:text-[16px] mi:w-full mi:min-w-0 mi:mt-0 mi:mr-0 mi:mb-0 mi:-ml-1.5 mi:py-0.5 mi:px-1.5 mi:[border:0] mi:rounded-[6px] mi:[outline:none] mi:text-inherit mi:[background:transparent] mi:text-ellipsis mi:[&:hover:not([readonly])]:[background:var(--mi-fill4)] mi:focus-visible:shadow-[0_0_0_2px_var(--mi-p)]" :readonly="mode === 'view'" spellcheck="false" @input="markDirty">
          </label>
        </div>

        <span class="mi:hidden mi:items-center mi:gap-1.5 mi:flex-[none] mi:text-[12px] mi:text-label3 mi:@[640px]:inline-flex" role="status">
          <MiSpinner v-if="saving" variant="arc" :size="12" label="" />
          <MiIcon v-else :svg="icons.cloud" :size="15" />
          <span>{{ saving ? 'Saving…' : 'Saved' }}</span>
        </span>

        <div class="mi:flex mi:items-center mi:gap-1 mi:flex-[none]">
          <!-- Presence: who is here right now, ringed in their cursor color. -->
          <div class="mi:hidden mi:items-center mi:gap-2 mi:mr-1.5 mi:@[900px]:inline-flex">
            <MiAvatarGroup :items="people" :max="3" :size="28" label="3 people editing: Ingrid Holm, Daniel Osei, Meera Pillai" />
            <MiText as="span" variant="caption" tone="label2" weight="medium" class="mi:whitespace-nowrap">3 editing</MiText>
          </div>
          <MiBadge :count="comments" tone="primary" :offset="2" count-noun="open comments">
            <template #target>
              <MiIconButton size="toolbar" variant="plain" label="Comments"><MiIcon name="chat" /></MiIconButton>
            </template>
          </MiBadge>
          <MiButton class="mi:hidden! mi:@[640px]:inline-flex!" variant="bordered" size="small">Share</MiButton>
          <MiIconButton class="mi:@[640px]:hidden!" size="toolbar" variant="plain" label="Share"><MiIcon name="share" /></MiIconButton>
          <MiButton size="small" :variant="published && !dirty ? 'gray' : 'filled'" @click="publish">
            {{ published ? (dirty ? 'Update' : 'Published') : 'Publish' }}
          </MiButton>
        </div>
      </div>

      <!-- Mode strip: the header's accent line follows the editing mode. -->
      <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-2 mi:gap-x-3.5">
        <MiSegmented v-model="mode" label="Editing mode" :options="modes" />
        <MiText as="span" variant="caption" tone="label2" class="mi:inline-flex mi:items-center mi:gap-1.5">
          <MiIcon :svg="modeIcon" :size="14" /> {{ hint }}
        </MiText>
      </div>
    </header>

    <main class="mi:pt-4.5 mi:px-3 mi:pb-7 mi:@[640px]:pt-7 mi:@[640px]:px-5 mi:@[640px]:pb-10" aria-label="Document">
      <article class="mi:max-w-170 mi:my-0 mi:mx-auto mi:py-6 mi:px-5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:text-[15px] mi:leading-[1.65] mi:text-label2 mi:@[640px]:py-8 mi:@[640px]:px-10">
        <h2 class="mi:mt-0 mi:mx-0 mi:mb-2.5 mi:text-[22px] mi:leading-tight mi:tracking-[-.02em] mi:text-label">{{ title || 'Untitled' }}</h2>
        <p class="mi:mt-0 mi:mx-0 mi:mb-3">Twelve dispatchers across four depots walked us through a normal Monday. The same pain came up in nine sessions: route changes arrive by phone, and nobody trusts the app to show the latest plan.</p>
        <p class="mi:mt-0 mi:mx-0 mi:mb-3">
          Dispatchers keep a paper copy “just in case”
          <ins v-if="mode === 'suggest'" class="mi:[text-decoration:none] mi:text-s-text mi:[background:var(--mi-s-tint)] mi:border-b-2 mi:border-b-s mi:rounded-[3px] mi:py-0 mi:px-0.5">and photograph it at shift change</ins>,
          which doubles the work when a driver calls in sick.
        </p>
        <div class="mi:py-2.5 mi:px-3.5 mi:[border-left:3px_solid_var(--accent)] mi:rounded-[0_8px_8px_0] mi:text-label mi:[background:var(--mi-fill4)]">“If I can't see who changed the route, I assume nobody did.” <span class="mi:block mi:text-[12px] mi:text-label3">Depot lead, Rotterdam</span></div>
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

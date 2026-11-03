<template>
  <section class="wss mi:@container/wss mi:grid mi:content-start mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="wss-title">
    <header class="wss__head mi:grid mi:gap-0.5">
      <MiText id="wss-title" as="h2" variant="title2" weight="bold">Workspace settings</MiText>
      <MiText variant="footnote" tone="label2">Fieldnote Research · Owner access</MiText>
    </header>

    <div class="wss__layout mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:@[760px]/wss:grid-cols-[200px_minmax(0,_1fr)] mi:@[760px]/wss:gap-6">
      <!-- Section nav: each entry shows a dot while it holds unsaved edits. -->
      <nav class="wss__nav mi:flex mi:gap-1 mi:p-1 mi:overflow-x-auto mi:rounded-lg mi:bg-fill4 mi:[scrollbar-width:none] mi:@[760px]/wss:flex-col mi:@[760px]/wss:p-1.5 mi:@[760px]/wss:bg-transparent" aria-label="Settings sections">
        <button
          v-for="s in sections" :key="s.id" type="button" class="wss__nav-item mi:relative mi:flex mi:flex-[1_0_auto] mi:items-center mi:gap-2.5 mi:min-h-10 mi:py-2 mi:px-3 mi:[border:0] mi:rounded-[10px] mi:text-label2 mi:bg-transparent mi:cursor-pointer mi:text-start mi:[&.is-on]:shadow-1 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :class="{ 'is-on': active === s.id }"
          :aria-current="active === s.id ? 'page' : undefined" @click="active = s.id"
        >
          <MiIcon :name="s.icon" :size="18" />
          <span class="wss__nav-label mi:flex-1">{{ s.label }}</span>
          <span v-if="sectionErrors(s.id)" class="wss__flag is-err mi:w-[7px] mi:h-[7px] mi:rounded-[50%] mi:bg-p mi:[&.is-err]:bg-red" aria-label="has errors" />
          <span v-else-if="sectionDirty(s.id)" class="wss__flag mi:w-[7px] mi:h-[7px] mi:rounded-[50%] mi:bg-p mi:[&.is-err]:bg-red" aria-label="unsaved changes" />
        </button>
      </nav>

      <div class="wss__main mi:grid mi:content-start mi:gap-3.5 mi:min-w-0">
        <MiForm
          v-if="active === 'general'" title="General" description="How your workspace appears to members and guests."
          max-width="100%" @submit.prevent="save"
        >
          <MiFormRow label="Workspace name" required :error="err('name')">
            <MiInput v-model="draft.name" />
          </MiFormRow>
          <MiFormRow label="Workspace URL" required :error="err('slug')" hint="Lowercase letters, numbers and dashes. Old links redirect for 30 days.">
            <MiInput v-model="draft.slug" prefix="fieldnote.io/" />
          </MiFormRow>
          <MiFormRow label="About" top hint="Shown on the invite page.">
            <MiTextarea v-model="draft.about" :rows="2" :maxlength="160" counter />
          </MiFormRow>
          <MiFormRow label="Accent">
            <MiSwatch v-model="draft.accent" aria-label="Workspace accent color" :options="accents" />
          </MiFormRow>
        </MiForm>

        <MiForm
          v-else-if="active === 'region'" title="Region and formats" description="Defaults for new members; each person can override them."
          max-width="100%" @submit.prevent="save"
        >
          <MiFormRow label="Time zone" required :error="err('tz')">
            <MiCombobox v-model="draft.tz" :options="zones" placeholder="Search a city" search-placeholder="Type a city or offset" />
          </MiFormRow>
          <MiFormRow label="Week starts on">
            <MiSegmented v-model="draft.weekStart" label="Week starts on" :options="weekDays" />
          </MiFormRow>
          <MiFormRow label="Date format" top>
            <MiRadioGroup v-model="draft.dateFormat" label="Date format" :options="dateFormats" />
          </MiFormRow>
        </MiForm>

        <MiForm
          v-else title="Security" description="Applies to everyone with access, guests included."
          max-width="100%" @submit.prevent="save"
        >
          <MiFormRow label="Two-step login">
            <div class="wss__switch mi:flex mi:items-center mi:gap-3">
              <MiSwitch v-model="draft.mfa" label="Require two-step login" />
              <MiText variant="footnote" tone="label2">{{ draft.mfa ? 'Required for all members' : 'Optional' }}</MiText>
            </div>
          </MiFormRow>
          <MiFormRow label="Idle sign-out">
            <MiSelect v-model="draft.idle" :options="idleOptions" />
          </MiFormRow>
          <MiFormRow label="Allowed domains" top :error="err('domains')" hint="People with these email domains can join without an invite. Press Return after each.">
            <MiTagInput v-model="draft.domains" placeholder="example.org" :validate="isDomain" :max="5" />
          </MiFormRow>
        </MiForm>

        <!-- In-flow save bar: reflects the dirty state of every section. -->
        <div class="wss__bar mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:pt-3 mi:pr-3.5 mi:pb-3 mi:pl-4.5 mi:rounded-lg mi:bg-card mi:shadow-1 mi:border mi:border-transparent mi:[&.is-dirty]:border-p/45" :class="{ 'is-dirty': changes.length, 'is-saved': justSaved }" aria-live="polite">
          <div class="wss__bar-text mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:items-center mi:gap-y-0 mi:gap-x-2.5 mi:min-w-0 mi:flex-[1_1_220px] mi:[.wss__bar.is-dirty_&]:grid-cols-[minmax(0,_1fr)]">
            <template v-if="changes.length">
              <MiText variant="subheadline" weight="semibold">{{ changes.length }} unsaved {{ changes.length === 1 ? 'change' : 'changes' }}</MiText>
              <MiText variant="caption" tone="label2" :lines="1">{{ changes.join(', ') }}</MiText>
            </template>
            <template v-else>
              <span class="wss__ok mi:grid mi:place-items-center mi:w-5.5 mi:h-5.5 mi:rounded-[50%] mi:text-green-t mi:[background:color-mix(in_srgb,_var(--mi-green)_16%,_transparent)]"><MiIcon name="check" :size="14" :weight="2.6" /></span>
              <MiText variant="subheadline" tone="label2">{{ justSaved ? 'Saved. Members see the update now.' : 'Everything is up to date' }}</MiText>
            </template>
          </div>
          <div class="wss__bar-actions mi:flex mi:gap-2">
            <MiButton variant="gray" :disabled="!changes.length" @click="discard">Discard</MiButton>
            <MiButton :disabled="!changes.length" :loading="saving" @click="save">Save changes</MiButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onBeforeUnmount } from 'vue'

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })

type Val = string | number
type SectionId = 'general' | 'region' | 'security'

const sections = [
  { id: 'general', label: 'General', icon: 'home' },
  { id: 'region', label: 'Region', icon: 'globe' },
  { id: 'security', label: 'Security', icon: 'lock' }
] as const
const fields: Record<string, { section: SectionId, label: string }> = {
  name: { section: 'general', label: 'name' },
  slug: { section: 'general', label: 'URL' },
  about: { section: 'general', label: 'about' },
  accent: { section: 'general', label: 'accent' },
  tz: { section: 'region', label: 'time zone' },
  weekStart: { section: 'region', label: 'week start' },
  dateFormat: { section: 'region', label: 'date format' },
  mfa: { section: 'security', label: 'two-step login' },
  idle: { section: 'security', label: 'idle sign-out' },
  domains: { section: 'security', label: 'allowed domains' }
}

const accents = [
  { value: 'var(--mi-p)', name: 'Brand', color: 'var(--mi-p)' },
  { value: 'var(--mi-teal)', name: 'Teal', color: 'var(--mi-teal)' },
  { value: 'var(--mi-indigo)', name: 'Indigo', color: 'var(--mi-indigo)' },
  { value: 'var(--mi-orange)', name: 'Orange', color: 'var(--mi-orange)' },
  { value: 'var(--mi-pink)', name: 'Pink', color: 'var(--mi-pink)' }
]
const zones = [
  { value: 'Europe/Paris', label: 'Paris (UTC+1)', group: 'Europe' },
  { value: 'Europe/London', label: 'London (UTC+0)', group: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin (UTC+1)', group: 'Europe' },
  { value: 'America/New_York', label: 'New York (UTC−5)', group: 'Americas' },
  { value: 'America/Chicago', label: 'Chicago (UTC−6)', group: 'Americas' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC−8)', group: 'Americas' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (UTC−3)', group: 'Americas' },
  { value: 'Asia/Singapore', label: 'Singapore (UTC+8)', group: 'Asia Pacific' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)', group: 'Asia Pacific' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+11)', group: 'Asia Pacific' }
]
const weekDays = [{ value: 'mon', label: 'Monday' }, { value: 'sun', label: 'Sunday' }]
const dateFormats = [
  { value: 'iso', label: '2026-11-02', description: 'ISO, sorts correctly everywhere' },
  { value: 'eu', label: '02/11/2026', description: 'Day first' },
  { value: 'us', label: '11/02/2026', description: 'Month first' }
]
const idleOptions = [
  { value: 30, label: 'After 30 minutes' },
  { value: 240, label: 'After 4 hours' },
  { value: 1440, label: 'After 24 hours' },
  { value: 0, label: 'Never' }
]

const initial = () => ({
  name: 'Fieldnote Research',
  slug: 'fieldnote-research',
  about: 'Qualitative research ops for the product team: interviews, tagging and synthesis.',
  accent: 'var(--mi-p)' as string | null,
  tz: 'Europe/Paris' as Val | Val[] | null,
  weekStart: 'mon' as Val | null,
  dateFormat: 'iso' as Val | boolean | null,
  mfa: false,
  idle: 240 as Val | null,
  domains: ['fieldnote.io'] as string[]
})
type Settings = ReturnType<typeof initial>
type Key = keyof Settings

const saved = ref<Settings>(initial())
const draft = reactive<Settings>(initial())
const active = ref<SectionId>('general')

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const dirtyKeys = computed(() => (Object.keys(fields) as Key[]).filter(k => !same(draft[k], saved.value[k])))
const changes = computed(() => dirtyKeys.value.map(k => fields[k]!.label))
const sectionDirty = (id: SectionId) => dirtyKeys.value.some(k => fields[k]!.section === id)

const isDomain = (t: string) => /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(t.trim())
const errors = computed(() => {
  const e: Partial<Record<Key, string>> = {}
  if (!draft.name.trim()) e.name = 'Your workspace needs a name.'
  if (!draft.slug) e.slug = 'Choose a URL.'
  else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(draft.slug)) e.slug = 'Use lowercase letters, numbers and single dashes.'
  else if (draft.slug.length < 3) e.slug = 'At least 3 characters.'
  if (draft.tz == null) e.tz = 'Pick a time zone for schedules and digests.'
  if (draft.domains.some(d => /gmail|outlook|yahoo|icloud/.test(d))) e.domains = 'Public email providers would let anyone join. Remove them.'
  return e
})
const submitted = ref(false)
const err = (k: Key) => (submitted.value ? errors.value[k] : undefined)
const sectionErrors = (id: SectionId) => submitted.value && (Object.keys(errors.value) as Key[]).some(k => fields[k]!.section === id)

const saving = ref(false)
const justSaved = ref(false)

function save() {
  submitted.value = true
  const bad = (Object.keys(errors.value) as Key[])[0]
  if (bad) { active.value = fields[bad]!.section; return }
  if (!dirtyKeys.value.length) return
  saving.value = true
  later(() => {
    saved.value = JSON.parse(JSON.stringify(draft)) as Settings
    saving.value = false
    submitted.value = false
    justSaved.value = true
    later(() => { justSaved.value = false }, 2600)
  }, 600)
}

function discard() {
  Object.assign(draft, JSON.parse(JSON.stringify(saved.value)) as Settings)
  submitted.value = false
}
</script>

<style scoped>
.wss__nav-item {
  font: inherit; font-size: 14px; font-weight: 500;
}
.wss__nav-item:hover { color: var(--mi-label); background: var(--mi-fill3); }
.wss__nav-item.is-on { color: var(--mi-label); background: var(--mi-card); }
.wss__bar.is-saved .wss__ok { animation: wss-pop var(--mi-dur-4) var(--mi-spring); }
@keyframes wss-pop { from { transform: scale(.4); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .wss__bar.is-saved .wss__ok { animation: none; } }
</style>

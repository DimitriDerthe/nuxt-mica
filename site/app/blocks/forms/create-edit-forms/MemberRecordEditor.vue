<template>
  <section class="mi:@container/mre mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="mre-title">
    <header class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3.5">
      <div class="mi:flex mi:items-center mi:gap-3.5 mi:min-w-0 mi:flex-[1_1_260px]">
        <MiAvatar :name="mode === 'create' ? (draft.name || 'New member') : record.name" size="lg" tone="auto" decorative />
        <div class="mi:min-w-0">
          <MiText variant="caption" tone="label2" weight="medium">{{ mode === 'create' ? 'New member' : 'Crewbase · People' }}</MiText>
          <MiText id="mre-title" as="h2" variant="title2" weight="bold">{{ mode === 'create' ? (draft.name || 'Untitled member') : record.name }}</MiText>
          <MiText variant="footnote" tone="label2">{{ mode === 'create' ? 'Fill in the essentials; the invite goes out on save.' : roleLabel(record.role) + ' · ' + record.team }}</MiText>
        </div>
      </div>
      <div v-if="mode === 'view'" class="mi:flex mi:gap-2">
        <MiButton variant="gray" @click="startCreate">New member</MiButton>
        <MiButton @click="startEdit">Edit</MiButton>
      </div>
    </header>

    <div v-if="flash" class="mi:[--mi-in-y:-4px] mi:animate-[in_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:animate-none mi:flex mi:flex-wrap mi:items-center mi:gap-2 mi:py-2.5 mi:px-3.5 mi:rounded-lg mi:[background:color-mix(in_srgb,_var(--mi-green)_12%,_transparent)]" role="status" aria-live="polite">
      <MiIcon name="check-circle-fill" :size="18" class="mi:text-green" />
      <MiText variant="footnote" class="mi:flex-[1_1_200px]">{{ flash }}</MiText>
      <MiButton v-if="undoTo" variant="plain" size="small" @click="undo">Undo</MiButton>
    </div>

    <!-- View -->
    <div v-if="mode === 'view'" class="mi:grid mi:gap-4.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1">
      <MiDetails :items="details" label-width="150px" />
    </div>

    <!-- Review: a diff of what will change, before anything is written. -->
    <div v-else-if="reviewing" class="mi:grid mi:gap-3.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1">
      <MiText as="h3" variant="headline">{{ mode === 'create' ? 'Create this member?' : `Review ${diff.length} ${diff.length === 1 ? 'change' : 'changes'}` }}</MiText>
      <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:rounded-md mi:border mi:border-sep">
        <li class="mi:grid mi:py-2.5 mi:px-3.5 mi:not-first:border-t mi:not-first:border-t-sep mi:gap-1 mi:@[560px]/mre:grid-cols-[140px_minmax(0,_1fr)] mi:@[560px]/mre:items-center" v-for="d in diff" :key="d.label">
          <span class="mi:text-[13px] mi:text-label2">{{ d.label }}</span>
          <span class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-1.5 mi:gap-x-2 mi:text-[14px] mi:min-w-0">
            <del class="mi:py-px mi:px-1.5 mi:text-red-t mi:[background:color-mix(in_srgb,_var(--mi-red)_10%,_transparent)] mi:rounded-[6px] mi:wrap-anywhere" v-if="mode === 'edit'">{{ d.from || 'empty' }}</del>
            <MiIcon class="mi:text-label3" v-if="mode === 'edit'" name="arrow-right" :size="14" />
            <ins class="mi:py-px mi:px-1.5 mi:[text-decoration:none] mi:text-green-t mi:[background:color-mix(in_srgb,_var(--mi-green)_12%,_transparent)] mi:rounded-[6px] mi:wrap-anywhere">{{ d.to || 'empty' }}</ins>
          </span>
        </li>
      </ul>
      <div class="mi:flex mi:flex-wrap mi:items-center mi:[justify-content:flex-end] mi:gap-2">
        <MiButton variant="gray" @click="reviewing = false">Back to editing</MiButton>
        <MiButton :loading="saving" @click="commit">{{ mode === 'create' ? 'Create and invite' : 'Save changes' }}</MiButton>
      </div>
    </div>

    <!-- Create / edit form -->
    <form v-else class="mi:grid mi:gap-4.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1" novalidate @submit.prevent="review">
      <div class="mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:@[620px]/mre:grid-cols-2 mi:@[620px]/mre:gap-y-4.5 mi:@[620px]/mre:gap-x-5">
        <MiField label="Full name" required :error="err('name')">
          <MiInput v-model="draft.name" autocomplete="name" />
        </MiField>
        <MiField label="Work email" required :error="err('email')">
          <MiInput v-model="draft.email" type="email" autocomplete="email" placeholder="name@crewbase.co" />
        </MiField>
        <MiField label="Team" required :error="err('team')">
          <MiCombobox v-model="draft.team" :options="teams" placeholder="Choose a team" search-placeholder="Search teams" />
        </MiField>
        <MiField label="Access" required :error="err('role')" hint="Admins can change billing and remove people.">
          <MiSelect v-model="draft.role" :options="roles" placeholder="Choose access" />
        </MiField>
        <MiField label="Start date" required :error="err('start')">
          <MiDatePicker v-model="draft.start" locale="en-GB" />
        </MiField>
        <MiField label="Skills" hint="Press Return after each one.">
          <MiTagInput v-model="draft.skills" :max="6" placeholder="Add a skill" />
        </MiField>
      </div>

      <fieldset class="mi:[border:0] mi:border-t mi:border-t-sep mi:grid mi:gap-3.5 mi:m-0 mi:pt-4 mi:px-0 mi:pb-0 mi:min-w-0">
        <legend class="mi:float-left mi:w-full mi:mb-2.5 mi:text-[13px] mi:font-semibold">Contract</legend>
        <MiRadioGroup v-model="draft.contract" label="Contract type" orientation="horizontal" :options="contracts" />
        <MiField v-if="draft.contract === 'contractor'" label="Contract ends" required :error="err('end')" class="mi:[--mi-in-y:-4px] mi:animate-[in_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:animate-none mi:max-w-80">
          <MiDatePicker v-model="draft.end" locale="en-GB" :min="draft.start" />
        </MiField>
      </fieldset>

      <div class="mi:flex mi:flex-wrap mi:items-center mi:[justify-content:flex-end] mi:gap-2">
        <MiText v-if="mode === 'edit' && !diff.length" variant="footnote" tone="label3" class="mi:me-auto">No changes yet</MiText>
        <MiButton variant="gray" @click="cancel">Cancel</MiButton>
        <MiButton type="submit" :disabled="mode === 'edit' && !diff.length">Review</MiButton>
      </div>
    </form>
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

const teams = [
  { value: 'Platform', label: 'Platform', group: 'Engineering' },
  { value: 'Mobile', label: 'Mobile', group: 'Engineering' },
  { value: 'Data', label: 'Data', group: 'Engineering' },
  { value: 'Brand', label: 'Brand', group: 'Design' },
  { value: 'Product design', label: 'Product design', group: 'Design' },
  { value: 'Customer success', label: 'Customer success', group: 'Operations' }
]
const roles = [
  { value: 'viewer', label: 'Viewer', description: 'Read-only' },
  { value: 'editor', label: 'Editor', description: 'Create and edit projects' },
  { value: 'admin', label: 'Admin', description: 'Everything, including billing' }
]
const contracts = [{ value: 'full', label: 'Full-time' }, { value: 'part', label: 'Part-time' }, { value: 'contractor', label: 'Contractor' }]
const roleLabel = (v: Val | null) => roles.find(r => r.value === v)?.label ?? ''

interface Member { name: string, email: string, team: Val | Val[] | null, role: Val | null, start: Date | null, skills: string[], contract: Val | boolean | null, end: Date | null }
const blank = (): Member => ({ name: '', email: '', team: null, role: 'editor', start: null, skills: [], contract: 'full', end: null })
const copy = (m: Member): Member => ({ ...m, skills: [...m.skills], start: m.start ? new Date(m.start) : null, end: m.end ? new Date(m.end) : null })

const record = ref<Member>({
  name: 'Amara Nwosu', email: 'amara.nwosu@crewbase.co', team: 'Mobile', role: 'editor',
  start: new Date(2024, 2, 4), skills: ['SwiftUI', 'Accessibility', 'Kotlin'], contract: 'full', end: null
})
const mode = ref<'view' | 'edit' | 'create'>('view')
const draft = reactive<Member>(blank())
const reviewing = ref(false)
const submitted = ref(false)
const saving = ref(false)
const flash = ref('')
const undoTo = ref<Member | null>(null)

const fmtDate = (d: Date | null) => (d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '')
const asText = (m: Member) => ({
  'Name': m.name,
  'Email': m.email,
  'Team': Array.isArray(m.team) ? m.team.join(', ') : String(m.team ?? ''),
  'Access': roleLabel(m.role),
  'Start date': fmtDate(m.start),
  'Skills': m.skills.join(', '),
  'Contract': contracts.find(c => c.value === m.contract)?.label ?? '',
  'Contract ends': m.contract === 'contractor' ? fmtDate(m.end) : ''
})
const details = computed(() => Object.entries(asText(record.value)).filter(([, v]) => v).map(([label, value]) => ({ key: label, label, value })))
const diff = computed(() => {
  const before = asText(mode.value === 'create' ? blank() : record.value)
  const after = asText(draft)
  return (Object.keys(after) as (keyof typeof after)[]).filter(k => before[k] !== after[k]).map(k => ({ label: k, from: before[k], to: after[k] }))
})

const errors = computed(() => {
  const e: Record<string, string> = {}
  if (draft.name.trim().split(/\s+/).length < 2) e.name = 'First and last name, please.'
  if (!draft.email.trim()) e.email = 'Required for the invite.'
  else if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(draft.email.trim())) e.email = 'That does not look like an email address.'
  if (draft.team == null || (Array.isArray(draft.team) && !draft.team.length)) e.team = 'Pick the team they join.'
  if (draft.role == null) e.role = 'Choose an access level.'
  if (!draft.start) e.start = 'When is their first day?'
  if (draft.contract === 'contractor') {
    if (!draft.end) e.end = 'Contractors need an end date.'
    else if (draft.start && draft.end <= draft.start) e.end = 'The contract must end after the start date.'
  }
  return e
})
const err = (k: string) => (submitted.value ? errors.value[k] : undefined)

function open(next: 'edit' | 'create', from: Member) {
  Object.assign(draft, copy(from))
  mode.value = next
  reviewing.value = false
  submitted.value = false
  flash.value = ''
}
const startEdit = () => open('edit', record.value)
const startCreate = () => open('create', blank())
function cancel() { mode.value = 'view'; reviewing.value = false }

function review() {
  submitted.value = true
  if (!Object.keys(errors.value).length) reviewing.value = true
}
function commit() {
  saving.value = true
  later(() => {
    const n = diff.value.length
    undoTo.value = mode.value === 'edit' ? copy(record.value) : null
    flash.value = mode.value === 'create'
      ? `${draft.name} was added and invited to ${draft.email}.`
      : `Saved · ${n} ${n === 1 ? 'field' : 'fields'} updated.`
    record.value = copy(draft)
    saving.value = false
    reviewing.value = false
    mode.value = 'view'
  }, 600)
}
function undo() {
  if (!undoTo.value) return
  record.value = undoTo.value
  undoTo.value = null
  flash.value = 'Changes reverted.'
}
</script>

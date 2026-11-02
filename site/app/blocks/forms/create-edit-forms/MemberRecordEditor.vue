<template>
  <section class="mre" aria-labelledby="mre-title">
    <header class="mre__head">
      <div class="mre__who">
        <MiAvatar :name="mode === 'create' ? (draft.name || 'New member') : record.name" size="lg" tone="auto" decorative />
        <div>
          <MiText variant="caption" tone="label2" weight="medium">{{ mode === 'create' ? 'New member' : 'Crewbase · People' }}</MiText>
          <MiText id="mre-title" as="h2" variant="title2" weight="bold">{{ mode === 'create' ? (draft.name || 'Untitled member') : record.name }}</MiText>
          <MiText variant="footnote" tone="label2">{{ mode === 'create' ? 'Fill in the essentials; the invite goes out on save.' : roleLabel(record.role) + ' · ' + record.team }}</MiText>
        </div>
      </div>
      <div v-if="mode === 'view'" class="mre__head-actions">
        <MiButton variant="gray" @click="startCreate">New member</MiButton>
        <MiButton @click="startEdit">Edit</MiButton>
      </div>
    </header>

    <div v-if="flash" class="mre__flash" role="status" aria-live="polite">
      <MiIcon name="check-circle-fill" :size="18" />
      <MiText variant="footnote">{{ flash }}</MiText>
      <MiButton v-if="undoTo" variant="plain" size="small" @click="undo">Undo</MiButton>
    </div>

    <!-- View -->
    <div v-if="mode === 'view'" class="mre__card">
      <MiDetails :items="details" label-width="150px" />
    </div>

    <!-- Review: a diff of what will change, before anything is written. -->
    <div v-else-if="reviewing" class="mre__card mre__review">
      <MiText as="h3" variant="headline">{{ mode === 'create' ? 'Create this member?' : `Review ${diff.length} ${diff.length === 1 ? 'change' : 'changes'}` }}</MiText>
      <ul class="mre__diff">
        <li v-for="d in diff" :key="d.label">
          <span class="mre__diff-l">{{ d.label }}</span>
          <span class="mre__diff-v">
            <del v-if="mode === 'edit'">{{ d.from || 'empty' }}</del>
            <MiIcon v-if="mode === 'edit'" name="arrow-right" :size="14" />
            <ins>{{ d.to || 'empty' }}</ins>
          </span>
        </li>
      </ul>
      <div class="mre__actions">
        <MiButton variant="gray" @click="reviewing = false">Back to editing</MiButton>
        <MiButton :loading="saving" @click="commit">{{ mode === 'create' ? 'Create and invite' : 'Save changes' }}</MiButton>
      </div>
    </div>

    <!-- Create / edit form -->
    <form v-else class="mre__card mre__form" novalidate @submit.prevent="review">
      <div class="mre__grid">
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

      <fieldset class="mre__set">
        <legend class="mre__legend">Contract</legend>
        <MiRadioGroup v-model="draft.contract" label="Contract type" orientation="horizontal" :options="contracts" />
        <MiField v-if="draft.contract === 'contractor'" label="Contract ends" required :error="err('end')" class="mre__end">
          <MiDatePicker v-model="draft.end" locale="en-GB" :min="draft.start" />
        </MiField>
      </fieldset>

      <div class="mre__actions">
        <MiText v-if="mode === 'edit' && !diff.length" variant="footnote" tone="label3" class="mre__nochange">No changes yet</MiText>
        <MiButton variant="gray" @click="cancel">Cancel</MiButton>
        <MiButton type="submit" :disabled="mode === 'edit' && !diff.length">Review</MiButton>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

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
  setTimeout(() => {
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

<style scoped>
.mre { container: mre / inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.mre__head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px; }
.mre__who { display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1 1 260px; }
.mre__who > div { min-width: 0; }
.mre__head-actions { display: flex; gap: 8px; }

.mre__flash { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 10px 14px; border-radius: var(--mi-radius-l); background: color-mix(in srgb, var(--mi-green) 12%, transparent); animation: mre-in var(--mi-dur-3) var(--mi-ease); }
.mre__flash :deep(svg) { color: var(--mi-green); }
.mre__flash > :nth-child(2) { flex: 1 1 200px; }

.mre__card { display: grid; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.mre__grid { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); }
@container mre (min-width: 620px) { .mre__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 20px; } }
.mre__set { display: grid; gap: 14px; margin: 0; padding: 16px 0 0; border: 0; border-top: 1px solid var(--mi-sep); min-width: 0; }
.mre__legend { float: left; width: 100%; margin-bottom: 10px; font-size: 13px; font-weight: 600; }
.mre__end { max-width: 320px; animation: mre-in var(--mi-dur-3) var(--mi-ease); }
.mre__actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 8px; }
.mre__nochange { margin-inline-end: auto; }

.mre__review { gap: 14px; }
.mre__diff { display: grid; margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-m); border: 1px solid var(--mi-sep); }
.mre__diff li { display: grid; gap: 4px; padding: 10px 14px; }
.mre__diff li + li { border-top: 1px solid var(--mi-sep); }
@container mre (min-width: 560px) { .mre__diff li { grid-template-columns: 140px minmax(0, 1fr); align-items: center; } }
.mre__diff-l { font-size: 13px; color: var(--mi-label2); }
.mre__diff-v { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; font-size: 14px; min-width: 0; }
.mre__diff-v :deep(svg) { color: var(--mi-label3); }
.mre__diff del { color: var(--mi-red-t); background: color-mix(in srgb, var(--mi-red) 10%, transparent); padding: 1px 6px; border-radius: 6px; overflow-wrap: anywhere; }
.mre__diff ins { text-decoration: none; color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 12%, transparent); padding: 1px 6px; border-radius: 6px; overflow-wrap: anywhere; }
@keyframes mre-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .mre__flash, .mre__end { animation: none; } }
</style>

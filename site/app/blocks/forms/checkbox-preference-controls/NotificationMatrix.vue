<template>
  <section class="ntm" aria-labelledby="ntm-title">
    <header class="ntm__head">
      <div>
        <MiText id="ntm-title" as="h2" variant="title3" weight="semibold">Notifications</MiText>
        <MiText variant="footnote" tone="label2">Paperline · how each kind of update reaches you</MiText>
      </div>
      <MiSegmented v-model="preset" label="Preset" :options="presetOptions" />
    </header>

    <form class="ntm__card" novalidate @submit.prevent="save">
      <div class="ntm__scroll">
        <table class="ntm__table">
          <caption class="ntm__sr">Notification channels per event</caption>
          <thead>
            <tr>
              <th scope="col" class="ntm__event-h">Event</th>
              <th v-for="c in channels" :key="c.id" scope="col">
                <div class="ntm__col">
                  <MiIcon :svg="c.svg" :size="18" />
                  <span>{{ c.label }}</span>
                  <MiCheckbox
                    :model-value="colState(c.id) === 'all'" :indeterminate="colState(c.id) === 'some'"
                    @update:model-value="setColumn(c.id, $event)"
                  >
                    <span class="ntm__sr">All {{ c.label }}</span>
                  </MiCheckbox>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id" :class="{ 'is-err': err(r.id) }">
              <th scope="row">
                <span class="ntm__ev">{{ r.label }}</span>
                <span class="ntm__desc">{{ err(r.id) || r.desc }}</span>
              </th>
              <td v-for="c in channels" :key="c.id">
                <MiCheckbox v-model="prefs[r.id][c.id]" :disabled="isLocked(r.id, c.id)">
                  <span class="ntm__sr">{{ r.label }} by {{ c.label }}{{ isLocked(r.id, c.id) ? ' (required)' : '' }}</span>
                </MiCheckbox>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Weekly volume estimate: what these choices mean for your inbox. -->
      <div class="ntm__volume" aria-live="polite">
        <MiText as="h3" variant="subheadline" weight="semibold">About {{ total }} notifications a week</MiText>
        <div class="ntm__bars">
          <div v-for="c in channels" :key="c.id" class="ntm__bar">
            <span class="ntm__bar-l">{{ c.label }}</span>
            <span class="ntm__track"><i :style="{ transform: `scaleX(${volume[c.id] / maxVolume})` }" /></span>
            <span class="ntm__bar-v">{{ volume[c.id] }}</span>
          </div>
        </div>
      </div>

      <div class="ntm__foot">
        <MiText variant="footnote" :tone="saved ? 'green' : 'label2'" aria-live="polite">
          {{ saved ? 'Preferences saved' : dirty ? 'You have unsaved changes' : 'Up to date' }}
        </MiText>
        <div class="ntm__actions">
          <MiButton variant="gray" :disabled="!dirty" @click="reset">Reset</MiButton>
          <MiButton type="submit" :disabled="!dirty">Save preferences</MiButton>
        </div>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

type Val = string | number
type Channel = 'email' | 'push' | 'slack'

const channels: { id: Channel, label: string, svg: string }[] = [
  { id: 'email', label: 'Email', svg: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>' },
  { id: 'push', label: 'Push', svg: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>' },
  { id: 'slack', label: 'Slack', svg: '<path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>' }
]
// `perWeek` is a typical weekly volume for a member of a 12-person team.
const rows = [
  { id: 'mention', label: 'Mentions and replies', desc: 'Someone @mentions you or replies to your comment', perWeek: 9 },
  { id: 'assign', label: 'Assigned to you', desc: 'A task or review lands on your plate', perWeek: 5 },
  { id: 'status', label: 'Status changes', desc: 'Tasks you follow move columns', perWeek: 14 },
  { id: 'digest', label: 'Weekly digest', desc: 'Monday summary of your projects', perWeek: 1 },
  { id: 'security', label: 'Security alerts', desc: 'New sign-ins and password changes', perWeek: 1 }
] as const
type RowId = typeof rows[number]['id']
type Prefs = Record<RowId, Record<Channel, boolean>>
const locked: Partial<Record<RowId, Channel[]>> = { security: ['email'] }
const isLocked = (row: RowId, c: Channel) => locked[row]?.includes(c) ?? false

const make = (pick: (row: RowId) => Channel[]): Prefs =>
  Object.fromEntries(rows.map(r => [r.id, { email: false, push: false, slack: false, ...Object.fromEntries([...pick(r.id), ...(locked[r.id] ?? [])].map(c => [c, true])) }])) as Prefs

const presets = {
  all: make(() => ['email', 'push', 'slack']),
  direct: make(r => (r === 'mention' || r === 'assign' ? ['push', 'slack'] : r === 'digest' ? ['email'] : [])),
  minimal: make(r => (r === 'digest' ? ['email'] : []))
} satisfies Record<string, Prefs>
type PresetId = keyof typeof presets
const presetOptions = [{ value: 'all', label: 'Everything' }, { value: 'direct', label: 'Direct' }, { value: 'minimal', label: 'Minimal' }]

const clone = (p: Prefs): Prefs => JSON.parse(JSON.stringify(p)) as Prefs
const savedPrefs = ref<Prefs>(clone(presets.direct))
savedPrefs.value.status.slack = true
const prefs = reactive<Prefs>(clone(savedPrefs.value))

const same = (a: Prefs, b: Prefs) => JSON.stringify(a) === JSON.stringify(b)
// The segmented control shows a preset only while the matrix matches it exactly.
const preset = computed<Val | null>({
  get: () => (Object.keys(presets) as PresetId[]).find(k => same(presets[k], prefs)) ?? null,
  set: (v) => { if (typeof v === 'string' && v in presets) Object.assign(prefs, clone(presets[v as PresetId])) }
})

const colState = (c: Channel) => {
  const n = rows.filter(r => prefs[r.id][c]).length
  return n === rows.length ? 'all' : n ? 'some' : 'none'
}
function setColumn(c: Channel, on: boolean) {
  for (const r of rows) if (!isLocked(r.id, c)) prefs[r.id][c] = on
}

const volume = computed(() => Object.fromEntries(channels.map(c => [c.id, rows.reduce((n, r) => n + (prefs[r.id][c.id] ? r.perWeek : 0), 0)])) as Record<Channel, number>)
const total = computed(() => channels.reduce((n, c) => n + volume.value[c.id], 0))
const maxVolume = rows.reduce((n, r) => n + r.perWeek, 0)

const dirty = computed(() => !same(prefs, savedPrefs.value))
const errors = computed(() => {
  const e: Record<string, string> = {}
  if (!channels.some(c => prefs.assign[c.id])) e.assign = 'Pick at least one channel, or assigned work can slip by.'
  return e
})
const submitted = ref(false)
const err = (k: string) => (submitted.value ? errors.value[k] : undefined)
const saved = ref(false)
watch(prefs, () => { saved.value = false }, { deep: true })

function save() {
  submitted.value = true
  if (Object.keys(errors.value).length) return
  savedPrefs.value = clone(prefs)
  submitted.value = false
  saved.value = true
}
function reset() {
  Object.assign(prefs, clone(savedPrefs.value))
  submitted.value = false
}
</script>

<style scoped>
.ntm { container: ntm / inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.ntm__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.ntm__card { display: grid; gap: 18px; padding: 8px 0 16px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
.ntm__scroll { overflow-x: auto; }
.ntm__table { width: 100%; min-width: 320px; border-collapse: collapse; }
.ntm__table th, .ntm__table td { padding: 12px 8px; text-align: center; vertical-align: middle; }
.ntm__table th:first-child { padding-inline-start: 18px; text-align: start; }
.ntm__table td:last-child, .ntm__table th:last-child { padding-inline-end: 16px; }
.ntm__table thead th { position: relative; font-size: 12px; font-weight: 600; color: var(--mi-label2); border-bottom: 1px solid var(--mi-sep); }
.ntm__event-h { vertical-align: bottom !important; }
.ntm__col { display: grid; justify-items: center; gap: 6px; }
.ntm__table tbody tr + tr { border-top: 1px solid var(--mi-sep); }
.ntm__table tbody th { font-weight: 400; }
.ntm__table td { width: 64px; }
.ntm__table td :deep(label), .ntm__col :deep(label) { justify-content: center; }
.ntm__ev { display: block; font-size: 14px; font-weight: 600; color: var(--mi-label); }
.ntm__desc { display: block; margin-top: 2px; font-size: 12.5px; line-height: 1.35; color: var(--mi-label2); }
tr.is-err .ntm__desc { color: var(--mi-red-t); }
tr.is-err th { box-shadow: inset 3px 0 0 var(--mi-red); }

.ntm__volume { display: grid; gap: 10px; margin-inline: 16px; padding: 14px 16px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.ntm__bars { display: grid; gap: 8px; }
@container ntm (min-width: 640px) { .ntm__bars { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; } }
.ntm__bar { display: grid; grid-template-columns: 44px minmax(0, 1fr) 24px; align-items: center; gap: 10px; font-size: 12.5px; }
.ntm__bar-l { color: var(--mi-label2); }
.ntm__bar-v { text-align: end; font-weight: 600; font-variant-numeric: tabular-nums; }
.ntm__track { height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.ntm__track i { display: block; height: 100%; border-radius: inherit; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }

.ntm__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; padding-inline: 16px; }
.ntm__actions { display: flex; gap: 8px; }
.ntm__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>

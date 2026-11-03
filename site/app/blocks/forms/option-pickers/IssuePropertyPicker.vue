<template>
  <section class="ipp" aria-labelledby="ipp-title">
    <div class="ipp__card">
      <header class="ipp__head">
        <MiText variant="caption" tone="label2" weight="medium">MOB-1482</MiText>
        <MiText id="ipp-title" as="h2" variant="headline">Push token is dropped after app update</MiText>
      </header>

      <dl class="ipp__props">
        <div v-for="p in fields" :key="p.key" class="ipp__prop">
          <dt :id="'ipp-' + p.key + '-l'">{{ p.label }}</dt>
          <dd>
            <MiPopover
              :model-value="open === p.key" inline :arrow-offset="24" width="100%" :label="p.label + ' options'"
              @update:model-value="open = $event ? p.key : (open === p.key ? null : open)"
            >
              <template #trigger="{ attrs }">
                <button type="button" class="ipp__value" :class="{ 'is-open': open === p.key }" v-bind="attrs" :aria-describedby="'ipp-' + p.key + '-l'">
                  <template v-if="p.key === 'status'"><i class="ipp__ring" :style="{ '--c': statusOf(state.status).color }" />{{ statusOf(state.status).label }}</template>
                  <template v-else-if="p.key === 'priority'"><span class="ipp__bars" :data-level="state.priority"><i /><i /><i /></span>{{ priorityOf(state.priority).label }}</template>
                  <template v-else-if="p.key === 'assignees'">
                    <MiAvatarGroup v-if="state.assignees.length" :items="state.assignees.map(id => ({ name: personOf(id).name, tone: 'auto' as const }))" :max="3" size="xs" />
                    <span v-else class="ipp__none">Unassigned</span>
                  </template>
                  <template v-else>
                    <span v-if="!state.labels.length" class="ipp__none">No labels</span>
                    <span v-for="id in state.labels" :key="id" class="ipp__label"><i :style="{ background: labelOf(id).color }" />{{ labelOf(id).name }}</span>
                  </template>
                </button>
              </template>

              <!-- One picker panel, shaped by the property it edits. -->
              <div class="ipp__panel">
                <MiSearch v-model="query" size="compact" :placeholder="p.key === 'labels' ? 'Find or create a label' : 'Filter'" :aria-label="'Filter ' + p.label.toLowerCase()" />
                <ul class="ipp__opts" role="listbox" :aria-label="p.label" :aria-multiselectable="p.multi">
                  <li v-for="o in optionsFor(p.key)" :key="o.id">
                    <button type="button" role="option" class="ipp__opt" :aria-selected="isOn(p.key, o.id)" @click="pick(p.key, o.id)">
                      <span v-if="o.color" class="ipp__dot" :style="{ background: o.color }" />
                      <MiAvatar v-else-if="p.key === 'assignees'" :name="o.name" size="xs" tone="auto" decorative />
                      <span class="ipp__opt-name">{{ o.name }}</span>
                      <span v-if="o.meta" class="ipp__meta">{{ o.meta }}</span>
                      <MiIcon v-if="isOn(p.key, o.id)" name="check" :size="15" :weight="2.4" class="ipp__check" />
                    </button>
                  </li>
                </ul>
                <MiText v-if="!optionsFor(p.key).length && p.key !== 'labels'" variant="footnote" tone="label3">Nothing matches.</MiText>
                <form v-if="p.key === 'labels' && canCreate" class="ipp__create" novalidate @submit.prevent="createLabel">
                  <button type="submit" class="ipp__opt"><MiIcon name="plus" :size="15" />Create label “{{ query.trim() }}”</button>
                  <MiText v-if="createError" variant="caption" tone="red" role="alert">{{ createError }}</MiText>
                </form>
              </div>
            </MiPopover>
          </dd>
        </div>
      </dl>

      <p class="ipp__log" role="status" aria-live="polite">{{ log || 'Changes save as you pick.' }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

type Key = 'status' | 'priority' | 'assignees' | 'labels'
interface Opt { id: string, name: string, color?: string, meta?: string }

const fields: { key: Key, label: string, multi: boolean }[] = [
  { key: 'status', label: 'Status', multi: false },
  { key: 'priority', label: 'Priority', multi: false },
  { key: 'assignees', label: 'Assignees', multi: true },
  { key: 'labels', label: 'Labels', multi: true }
]
const statuses: Opt[] = [
  { id: 'triage', name: 'Triage', color: 'var(--mi-label3)' },
  { id: 'todo', name: 'Todo', color: 'var(--mi-label2)' },
  { id: 'progress', name: 'In progress', color: 'var(--mi-yellow)' },
  { id: 'review', name: 'In review', color: 'var(--mi-indigo)' },
  { id: 'done', name: 'Done', color: 'var(--mi-green)' }
]
const priorities: Opt[] = [
  { id: '3', name: 'Urgent', meta: 'P0' }, { id: '2', name: 'High', meta: 'P1' }, { id: '1', name: 'Medium', meta: 'P2' }, { id: '0', name: 'Low', meta: 'P3' }
]
const people: Opt[] = [
  { id: 'yk', name: 'Yuki Kato', meta: 'iOS' }, { id: 'ab', name: 'Ade Bello', meta: 'Android' },
  { id: 'cl', name: 'Camille Laurent', meta: 'Backend' }, { id: 'rs', name: 'Rafael Souza', meta: 'QA' }
]
const labels = ref<Opt[]>([
  { id: 'bug', name: 'Bug', color: 'var(--mi-red)' }, { id: 'push', name: 'Push', color: 'var(--mi-indigo)' },
  { id: 'regression', name: 'Regression', color: 'var(--mi-orange)' }, { id: 'release', name: '4.18 release', color: 'var(--mi-teal)' }
])
const palette = ['var(--mi-pink)', 'var(--mi-mint)', 'var(--mi-purple)', 'var(--mi-blue)']

const state = reactive({ status: 'progress', priority: '2', assignees: ['yk'] as string[], labels: ['bug', 'push'] as string[] })
const open = ref<Key | null>('labels')
const query = ref('')
const log = ref('')
const createError = ref('')
watch(open, () => { query.value = ''; createError.value = '' })
watch(query, () => { createError.value = '' })

const source = (k: Key) => (k === 'status' ? statuses : k === 'priority' ? priorities : k === 'assignees' ? people : labels.value)
const optionsFor = (k: Key) => {
  const q = query.value.trim().toLowerCase()
  return q ? source(k).filter(o => o.name.toLowerCase().includes(q)) : source(k)
}
const find = (list: Opt[], id: string): Opt => list.find(o => o.id === id) ?? { id, name: id }
const statusOf = (id: string) => ({ label: find(statuses, id).name, color: find(statuses, id).color })
const priorityOf = (id: string) => ({ label: find(priorities, id).name })
const personOf = (id: string) => find(people, id)
const labelOf = (id: string) => find(labels.value, id)

const isOn = (k: Key, id: string) => (k === 'status' ? state.status === id : k === 'priority' ? state.priority === id : state[k].includes(id))
function pick(k: Key, id: string) {
  const name = find(source(k), id).name
  if (k === 'status' || k === 'priority') {
    state[k] = id
    log.value = `${k === 'status' ? 'Status' : 'Priority'} set to ${name}.`
    open.value = null
    return
  }
  const on = state[k].includes(id)
  state[k] = on ? state[k].filter(x => x !== id) : [...state[k], id]
  log.value = `${on ? 'Removed' : 'Added'} ${name}.`
}

const canCreate = computed(() => {
  const q = query.value.trim().toLowerCase()
  return !!q && !labels.value.some(l => l.name.toLowerCase() === q)
})
function createLabel() {
  const name = query.value.trim()
  if (name.length < 2 || name.length > 24) { createError.value = 'Labels are 2 to 24 characters.'; return }
  if (!/^[\p{L}\p{N} .-]+$/u.test(name)) { createError.value = 'Use letters, numbers, spaces, dots or dashes.'; return }
  const id = name.toLowerCase().replace(/\s+/g, '-')
  labels.value.push({ id, name, color: palette[labels.value.length % palette.length] })
  state.labels = [...state.labels, id]
  log.value = `Created and added ${name}.`
  query.value = ''
}
</script>

<style scoped>
.ipp { container: ipp / inline-size; display: grid; align-content: start; justify-items: center; font-family: var(--mi-font); color: var(--mi-label); }
.ipp__card { display: grid; gap: 14px; width: 100%; max-width: 440px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ipp__head { display: grid; gap: 2px; padding-bottom: 12px; border-bottom: 1px solid var(--mi-sep); }
.ipp__props { display: grid; gap: 4px; margin: 0; }
.ipp__prop { display: grid; grid-template-columns: 84px minmax(0, 1fr); align-items: start; gap: 8px; }
.ipp__prop dt { padding-top: 8px; font-size: 13px; color: var(--mi-label2); }
.ipp__prop dd { margin: 0; min-width: 0; }
.ipp__value {
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px; width: 100%; min-height: 34px; padding: 5px 8px; border: 0; border-radius: 8px;
  background: transparent; font: inherit; font-size: 14px; color: var(--mi-label); text-align: start; cursor: pointer;
}
.ipp__value:hover, .ipp__value.is-open { background: var(--mi-fill4); }
.ipp__value:focus-visible, .ipp__opt:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.ipp__none { color: var(--mi-label3); }
.ipp__ring { width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--c); }
.ipp__bars { display: inline-flex; align-items: flex-end; gap: 2px; height: 12px; }
.ipp__bars i { width: 3px; border-radius: 1px; background: var(--mi-fill2); }
.ipp__bars i:nth-child(1) { height: 5px; } .ipp__bars i:nth-child(2) { height: 8px; } .ipp__bars i:nth-child(3) { height: 12px; }
.ipp__bars[data-level="0"] i:nth-child(1), .ipp__bars[data-level="1"] i:nth-child(-n+2), .ipp__bars[data-level="2"] i, .ipp__bars[data-level="3"] i { background: var(--mi-label); }
.ipp__bars[data-level="3"] i { background: var(--mi-red); }
.ipp__label { display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: 999px; font-size: 12.5px; border: 1px solid var(--mi-sep); }
.ipp__label i, .ipp__dot { width: 8px; height: 8px; flex: none; border-radius: 50%; }

.ipp__panel { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; min-width: 0; }
.ipp__panel :deep(.mi-search) { width: 100%; }
.ipp__opts { display: grid; gap: 1px; max-height: 220px; margin: 0; padding: 0; overflow-y: auto; list-style: none; }
.ipp__opt {
  display: flex; align-items: center; gap: 10px; width: 100%; min-height: 34px; padding: 6px 8px; border: 0; border-radius: 8px;
  background: transparent; font: inherit; font-size: 14px; color: var(--mi-label); text-align: start; cursor: pointer;
}
.ipp__opt:hover { background: var(--mi-fill4); }
.ipp__opt[aria-selected="true"] { background: var(--mi-p-tint); }
.ipp__opt-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ipp__meta { font-size: 12px; color: var(--mi-label3); }
.ipp__check { color: var(--mi-p); }
.ipp__create { display: grid; gap: 4px; padding-top: 6px; border-top: 1px solid var(--mi-sep); }
.ipp__create .ipp__opt { color: var(--mi-p-text); }
.ipp__log { margin: 0; padding-top: 12px; border-top: 1px solid var(--mi-sep); font-size: 12.5px; color: var(--mi-label2); }
</style>

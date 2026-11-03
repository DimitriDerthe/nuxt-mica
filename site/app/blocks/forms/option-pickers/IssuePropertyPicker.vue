<template>
  <section class="ipp mi:@container/ipp mi:grid mi:content-start mi:justify-items-center mi:font-mi mi:text-label" aria-labelledby="ipp-title">
    <div class="ipp__card mi:grid mi:gap-3.5 mi:w-full mi:max-w-110 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1">
      <header class="ipp__head mi:grid mi:gap-0.5 mi:pb-3 mi:border-b mi:border-b-sep">
        <MiText variant="caption" tone="label2" weight="medium">MOB-1482</MiText>
        <MiText id="ipp-title" as="h2" variant="headline">Push token is dropped after app update</MiText>
      </header>

      <dl class="ipp__props mi:grid mi:gap-1 mi:m-0">
        <div v-for="p in fields" :key="p.key" class="ipp__prop mi:grid mi:grid-cols-[84px_minmax(0,_1fr)] mi:items-start mi:gap-2">
          <dt :id="'ipp-' + p.key + '-l'">{{ p.label }}</dt>
          <dd>
            <MiPopover
              :model-value="open === p.key" inline :arrow-offset="24" width="100%" :label="p.label + ' options'"
              @update:model-value="open = $event ? p.key : (open === p.key ? null : open)"
            >
              <template #trigger="{ attrs }">
                <button type="button" class="ipp__value mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:w-full mi:min-h-8.5 mi:py-[5px] mi:px-2 mi:[border:0] mi:rounded-[8px] mi:bg-transparent mi:text-label mi:text-start mi:cursor-pointer mi:hover:bg-fill4 mi:[&.is-open]:bg-fill4 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :class="{ 'is-open': open === p.key }" v-bind="attrs" :aria-describedby="'ipp-' + p.key + '-l'">
                  <template v-if="p.key === 'status'"><i class="ipp__ring mi:w-3 mi:h-3 mi:rounded-[50%] mi:[border:2px_solid_var(--c)]" :style="{ '--c': statusOf(state.status).color }" />{{ statusOf(state.status).label }}</template>
                  <template v-else-if="p.key === 'priority'"><span class="ipp__bars mi:inline-flex mi:[align-items:flex-end] mi:gap-0.5 mi:h-3" :data-level="state.priority"><i class="mi:[.ipp__bars_&]:w-[3px] mi:[.ipp__bars_&]:rounded-[1px] mi:[.ipp__bars_&]:bg-fill2 mi:[.ipp__bars_&:nth-child(1)]:h-[5px] mi:[.ipp__bars_&:nth-child(2)]:h-2 mi:[.ipp__bars_&:nth-child(3)]:h-3" /><i class="mi:[.ipp__bars_&]:w-[3px] mi:[.ipp__bars_&]:rounded-[1px] mi:[.ipp__bars_&]:bg-fill2 mi:[.ipp__bars_&:nth-child(1)]:h-[5px] mi:[.ipp__bars_&:nth-child(2)]:h-2 mi:[.ipp__bars_&:nth-child(3)]:h-3" /><i class="mi:[.ipp__bars_&]:w-[3px] mi:[.ipp__bars_&]:rounded-[1px] mi:[.ipp__bars_&]:bg-fill2 mi:[.ipp__bars_&:nth-child(1)]:h-[5px] mi:[.ipp__bars_&:nth-child(2)]:h-2 mi:[.ipp__bars_&:nth-child(3)]:h-3" /></span>{{ priorityOf(state.priority).label }}</template>
                  <template v-else-if="p.key === 'assignees'">
                    <MiAvatarGroup v-if="state.assignees.length" :items="state.assignees.map(id => ({ name: personOf(id).name, tone: 'auto' as const }))" :max="3" size="xs" />
                    <span v-else class="ipp__none mi:text-label3">Unassigned</span>
                  </template>
                  <template v-else>
                    <span v-if="!state.labels.length" class="ipp__none mi:text-label3">No labels</span>
                    <span v-for="id in state.labels" :key="id" class="ipp__label mi:inline-flex mi:items-center mi:gap-[5px] mi:py-0.5 mi:px-2 mi:rounded-[999px] mi:text-[12.5px] mi:border mi:border-sep"><i class="mi:[.ipp__label_&]:w-2 mi:[.ipp__label_&]:h-2 mi:[.ipp__label_&]:flex-[none] mi:[.ipp__label_&]:rounded-[50%]" :style="{ background: labelOf(id).color }" />{{ labelOf(id).name }}</span>
                  </template>
                </button>
              </template>

              <!-- One picker panel, shaped by the property it edits. -->
              <div class="ipp__panel mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-2 mi:min-w-0">
                <MiSearch v-model="query" size="compact" :placeholder="p.key === 'labels' ? 'Find or create a label' : 'Filter'" :aria-label="'Filter ' + p.label.toLowerCase()" />
                <ul class="ipp__opts mi:grid mi:gap-px mi:max-h-55 mi:m-0 mi:p-0 mi:overflow-y-auto mi:[list-style:none]" role="listbox" :aria-label="p.label" :aria-multiselectable="p.multi">
                  <li v-for="o in optionsFor(p.key)" :key="o.id">
                    <button type="button" role="option" class="ipp__opt mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:min-h-8.5 mi:py-1.5 mi:px-2 mi:[border:0] mi:rounded-[8px] mi:bg-transparent mi:text-label mi:text-start mi:cursor-pointer mi:[.ipp__create_&]:text-p-text" :aria-selected="isOn(p.key, o.id)" @click="pick(p.key, o.id)">
                      <span v-if="o.color" class="ipp__dot mi:w-2 mi:h-2 mi:flex-[none] mi:rounded-[50%]" :style="{ background: o.color }" />
                      <MiAvatar v-else-if="p.key === 'assignees'" :name="o.name" size="xs" tone="auto" decorative />
                      <span class="ipp__opt-name mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ o.name }}</span>
                      <span v-if="o.meta" class="ipp__meta mi:text-[12px] mi:text-label3">{{ o.meta }}</span>
                      <MiIcon v-if="isOn(p.key, o.id)" name="check" :size="15" :weight="2.4" class="ipp__check mi:text-p" />
                    </button>
                  </li>
                </ul>
                <MiText v-if="!optionsFor(p.key).length && p.key !== 'labels'" variant="footnote" tone="label3">Nothing matches.</MiText>
                <form v-if="p.key === 'labels' && canCreate" class="ipp__create mi:grid mi:gap-1 mi:pt-1.5 mi:border-t mi:border-t-sep" novalidate @submit.prevent="createLabel">
                  <button type="submit" class="ipp__opt mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:min-h-8.5 mi:py-1.5 mi:px-2 mi:[border:0] mi:rounded-[8px] mi:bg-transparent mi:text-label mi:text-start mi:cursor-pointer mi:[.ipp__create_&]:text-p-text"><MiIcon name="plus" :size="15" />Create label “{{ query.trim() }}”</button>
                  <MiText v-if="createError" variant="caption" tone="red" role="alert">{{ createError }}</MiText>
                </form>
              </div>
            </MiPopover>
          </dd>
        </div>
      </dl>

      <p class="ipp__log mi:m-0 mi:pt-3 mi:border-t mi:border-t-sep mi:text-[12.5px] mi:text-label2" role="status" aria-live="polite">{{ log || 'Changes save as you pick.' }}</p>
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
.ipp__prop dt { padding-top: 8px; font-size: 13px; color: var(--mi-label2); }
.ipp__prop dd { margin: 0; min-width: 0; }
.ipp__value { font: inherit; font-size: 14px;
}
.ipp__bars[data-level="0"] i:nth-child(1), .ipp__bars[data-level="1"] i:nth-child(-n+2), .ipp__bars[data-level="2"] i, .ipp__bars[data-level="3"] i { background: var(--mi-label); }
.ipp__bars[data-level="3"] i { background: var(--mi-red); }
.ipp__panel :deep(.mi-search) { width: 100%; }
.ipp__opt { font: inherit; font-size: 14px;
}
.ipp__opt:hover { background: var(--mi-fill4); }
.ipp__opt[aria-selected="true"] { background: var(--mi-p-tint); }
</style>

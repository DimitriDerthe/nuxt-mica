<script setup lang="ts">
/** Repeatable block of fields: add and remove rows, min and max rows, a row factory, focus management and stable keys; rows render through the default slot. */
import { computed, nextTick, ref } from 'vue'
import MiIcon from '../Base/MiIcon.vue'

export type MiRepeaterRow = Record<string, unknown>

const props = withDefaults(defineProps<{
  /** Fewest rows allowed; remove buttons disable there and missing rows are created on mount. */
  min?: number
  /** Most rows allowed; the add button disables there. Unlimited when omitted. */
  max?: number
  /** Text of the add button. */
  addLabel?: string
  /** Accessible name of each remove button; the row number is appended. */
  removeLabel?: string
  /** Factory returning a new row. Defaults to an empty object. */
  template?: () => MiRepeaterRow
  /** Accessible name of the list and prefix of each row's group name. */
  label?: string
  /** Blocks adding and removing rows. */
  disabled?: boolean
}>(), {
  min: 0,
  addLabel: 'Add row',
  removeLabel: 'Remove row',
  label: 'Row'
})

/** Rows of the repeater; each row is an object edited through the slot's `update`. */

const model = defineModel<MiRepeaterRow[]>({ default: () => [] })
const emit = defineEmits<{
  /** Fires after a row is added, with its index. */
  add: [index: number]
  /** Fires after a row is removed, with its index and the removed row. */
  remove: [index: number, row: MiRepeaterRow]
}>()

defineSlots<{
  /** Fields of one row. */
  default(props: { row: MiRepeaterRow, index: number, update: (patch: Partial<MiRepeaterRow>) => void }): unknown
}>()

let seq = 0
const ids = ref<number[]>([])
const rowEls = ref<Record<number, HTMLElement | null>>({})
const addBtn = ref<HTMLButtonElement | null>(null)

const make = (): MiRepeaterRow => (props.template ? props.template() : {})

function sync() {
  const n = model.value.length
  while (ids.value.length < n) ids.value.push(++seq)
  if (ids.value.length > n) ids.value.length = n
}

if (model.value.length < props.min) {
  model.value = [...model.value, ...Array.from({ length: props.min - model.value.length }, make)]
}
sync()

const canAdd = computed(() => !props.disabled && (props.max == null || model.value.length < props.max))
const canRemove = computed(() => !props.disabled && model.value.length > props.min)
const rows = computed(() => {
  sync()
  return model.value.map((row, index) => ({ row, index, id: ids.value[index]! }))
})

function update(index: number, patch: Partial<MiRepeaterRow>) {
  model.value = model.value.map((r, i) => (i === index ? { ...r, ...patch } : r))
}

async function add() {
  if (!canAdd.value) return
  const index = model.value.length
  ids.value.push(++seq)
  const id = ids.value[index]!
  model.value = [...model.value, make()]
  emit('add', index)
  await nextTick()
  rowEls.value[id]?.querySelector<HTMLElement>('input:not([type=hidden]),select,textarea,[tabindex="0"],button:not([data-mi-rm])')?.focus()
}

async function remove(index: number) {
  if (!canRemove.value) return
  const row = model.value[index]!
  ids.value.splice(index, 1)
  model.value = model.value.filter((_, i) => i !== index)
  emit('remove', index, row)
  await nextTick()
  const target = ids.value[index] ?? ids.value[index - 1]
  const btn = target == null ? addBtn.value : rowEls.value[target]?.querySelector<HTMLElement>('[data-mi-rm]')
  ;(btn && !(btn as HTMLButtonElement).disabled ? btn : addBtn.value)?.focus()
}
</script>

<template>
  <div class="mi-rep mi:content-start mi:font-mi" role="group" :aria-label="label">
    <TransitionGroup tag="ul" name="mi-rep" class="mi-rep__list mi:grid mi:gap-2.5 mi:m-0 mi:p-0 mi:[list-style:none]">
      <li
        v-for="r in rows"
        :key="r.id"
        :ref="(el) => (rowEls[r.id] = el as HTMLElement | null)"
        class="mi-rep__row mi:flex mi:[align-items:flex-start] mi:gap-2.5 mi:p-3.5 mi:rounded-[14px] mi:bg-card mi:shadow-1"
        role="group"
        :aria-label="`${label} ${r.index + 1}`"
      >
        <div class="mi-rep__body mi:flex-1 mi:min-w-0 mi:grid mi:gap-2.5">
          <slot :row="r.row" :index="r.index" :update="(patch: Partial<MiRepeaterRow>) => update(r.index, patch)" />
        </div>
        <button type="button" class="mi-rep__rm mi:inline-flex mi:items-center mi:justify-center mi:flex-[none] mi:w-10 mi:h-10 mi:p-0 mi:[border:0] mi:rounded-[99px] mi:bg-transparent mi:text-label2 mi:cursor-pointer mi:[&:hover:not(:disabled)]:bg-fill3 mi:[&:hover:not(:disabled)]:text-red-t mi:disabled:opacity-35 mi:disabled:cursor-default mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[2px]" data-mi-rm :aria-label="`${removeLabel} ${r.index + 1}`" :disabled="!canRemove" @click="remove(r.index)">
          <MiIcon name="trash" :size="18" />
        </button>
      </li>
    </TransitionGroup>
    <button ref="addBtn" type="button" class="mi-rep__add mi:inline-flex mi:items-center mi:justify-center mi:gap-2 mi:min-h-11 mi:py-0 mi:px-4 mi:[border:1.5px_dashed_var(--mi-field-b)] mi:rounded-[12px] mi:bg-transparent mi:text-[color:var(--mi-p-text,_var(--mi-p))] mi:cursor-pointer mi:[&:hover:not(:disabled)]:bg-p-tint mi:disabled:opacity-40 mi:disabled:cursor-default mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[2px]" :disabled="!canAdd" @click="add">
      <MiIcon name="plus" :size="16" :weight="2.4" />
      <span>{{ addLabel }}</span>
    </button>
  </div>
</template>

<style scoped>
.mi-rep { display: grid; gap: 12px; color: var(--mi-label); }
.mi-rep__add {
  font: inherit; font-size: 15px; font-weight: 600;
}

.mi-rep-enter-active { transition: transform var(--mi-dur-3) var(--mi-ease), opacity var(--mi-dur-3) var(--mi-ease); }
.mi-rep-enter-from { opacity: 0; transform: translate3d(0, -8px, 0); }
</style>

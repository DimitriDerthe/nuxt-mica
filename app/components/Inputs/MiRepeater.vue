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
  <div class="mi-rep" role="group" :aria-label="label">
    <TransitionGroup tag="ul" name="mi-rep" class="mi-rep__list">
      <li
        v-for="r in rows"
        :key="r.id"
        :ref="(el) => (rowEls[r.id] = el as HTMLElement | null)"
        class="mi-rep__row"
        role="group"
        :aria-label="`${label} ${r.index + 1}`"
      >
        <div class="mi-rep__body">
          <slot :row="r.row" :index="r.index" :update="(patch: Partial<MiRepeaterRow>) => update(r.index, patch)" />
        </div>
        <button type="button" class="mi-rep__rm" data-mi-rm :aria-label="`${removeLabel} ${r.index + 1}`" :disabled="!canRemove" @click="remove(r.index)">
          <MiIcon name="trash" :size="18" />
        </button>
      </li>
    </TransitionGroup>
    <button ref="addBtn" type="button" class="mi-rep__add" :disabled="!canAdd" @click="add">
      <MiIcon name="plus" :size="16" :weight="2.4" />
      <span>{{ addLabel }}</span>
    </button>
  </div>
</template>

<style scoped>
.mi-rep { display: grid; align-content: start; gap: 12px; font-family: var(--mi-font); color: var(--mi-label); }
.mi-rep__list { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.mi-rep__row {
  display: flex; align-items: flex-start; gap: 10px; padding: 14px; border-radius: 14px;
  background: var(--mi-card); box-shadow: var(--mi-sh1);
}
.mi-rep__body { flex: 1; min-width: 0; display: grid; gap: 10px; }
.mi-rep__rm {
  display: inline-flex; align-items: center; justify-content: center; flex: none; width: 40px; height: 40px; padding: 0;
  border: 0; border-radius: 99px; background: transparent; color: var(--mi-label2); cursor: pointer;
}
.mi-rep__rm:hover:not(:disabled) { background: var(--mi-fill3); color: var(--mi-red-t); }
.mi-rep__rm:disabled { opacity: .35; cursor: default; }
.mi-rep__add {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 0 16px;
  border: 1.5px dashed var(--mi-field-b); border-radius: 12px; background: transparent; color: var(--mi-p-text, var(--mi-p));
  font: inherit; font-size: 15px; font-weight: 600; cursor: pointer;
}
.mi-rep__add:hover:not(:disabled) { background: var(--mi-p-tint); }
.mi-rep__add:disabled { opacity: .4; cursor: default; }
.mi-rep__rm:focus-visible, .mi-rep__add:focus-visible { outline: 3px solid color-mix(in srgb, var(--mi-p) 55%, transparent); outline-offset: 2px; }

.mi-rep-enter-active { transition: transform var(--mi-dur-3) var(--mi-ease), opacity var(--mi-dur-3) var(--mi-ease); }
.mi-rep-enter-from { opacity: 0; transform: translate3d(0, -8px, 0); }
</style>

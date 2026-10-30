<script setup lang="ts">
/** Searchable single or multiple choice dropdown; v-model holds the option value (or an array when multiple). */
import { computed, inject, nextTick, ref, useAttrs, useId } from 'vue'
import MiFieldBox from './MiFieldBox.vue'
import { useMiInputPopup } from '../../composables/useMiInputPopup'
import { MI_FIELD } from '../../utils/miInputs'
import type { MiSelectOption } from '../../utils/miInputs'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Options to choose from. */
  /** Options; an optional `group` renders a heading above the first option of each group. */
  options: (MiSelectOption & { group?: string })[]
  /** Allow several selected values; the model becomes an array. */
  multiple?: boolean
  /** Text shown when nothing is selected. */
  placeholder?: string
  /** Placeholder of the search input inside the list. */
  searchPlaceholder?: string
  /** Text shown when no option matches the query. */
  emptyText?: string
  /** Show a clear button when a value is selected. */
  clearable?: boolean
  /** Highlight the first match while typing. */
  autoHighlight?: boolean
  /** Control height: `sm` is compact, `md` the standard field size. */
  size?: 'sm' | 'md'
  /** Overrides the surrounding MiField state when set. */
  invalid?: boolean
  /** Overrides the surrounding MiField disabled state when set. */
  disabled?: boolean
  /** Submitted through hidden inputs when inside a native form. */
  name?: string
}>(), { placeholder: 'Select...', searchPlaceholder: 'Search...', emptyText: 'No results found.', clearable: false, autoHighlight: true, size: 'md', invalid: undefined, disabled: undefined })

type Val = string | number
/** Selected option value, or an array of values in multiple mode; null when empty. */
const model = defineModel<Val | Val[] | null>({ default: null })
const emit = defineEmits<{ change: [value: Val | Val[] | null] }>()

const attrs = useAttrs()
const field = inject(MI_FIELD, null)
const auto = useId()
const box = ref<InstanceType<typeof MiFieldBox> | null>(null)
const panel = ref<HTMLElement | null>(null)
const query = ref('')
const active = ref(0)
const hl = () => (props.autoHighlight ? 0 : -1)

const id = computed(() => (attrs.id as string | undefined) ?? field?.id ?? `mi-cb-${auto}`)
const listId = `mi-cb-list-${auto}`
const optId = (i: number) => `mi-cb-opt-${auto}-${i}`
const isInvalid = computed(() => props.invalid ?? field?.invalid.value ?? false)
const isDisabled = computed(() => props.disabled ?? field?.disabled.value ?? false)
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
const btnAttrs = computed(() => { const { class: _c, style: _s, id: _i, ...rest } = attrs; return rest })

const popup = useMiInputPopup({ trigger: () => (box.value?.$el as HTMLElement | null) ?? null, panel, matchWidth: true })
const selected = computed<Val[]>(() => props.multiple ? (Array.isArray(model.value) ? model.value : []) : (model.value == null || Array.isArray(model.value) ? [] : [model.value]))
const isSel = (v: Val) => selected.value.includes(v)
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? props.options.filter(o => o.label.toLowerCase().includes(q)) : props.options
})
const summary = computed(() => selected.value.map(v => props.options.find(o => o.value === v)?.label ?? String(v)))

function openList() {
  if (isDisabled.value) return
  query.value = ''
  popup.show()
  const at = filtered.value.findIndex(o => isSel(o.value))
  active.value = at >= 0 ? at : hl()
  void nextTick(() => panel.value?.querySelector<HTMLInputElement>('input')?.focus())
}
function commit(v: Val | Val[] | null) { model.value = v; emit('change', v) }
function choose(i: number) {
  const o = filtered.value[i]
  if (!o || o.disabled) return
  if (props.multiple) commit(isSel(o.value) ? selected.value.filter(x => x !== o.value) : [...selected.value, o.value])
  else { commit(isSel(o.value) ? null : o.value); popup.hide(true) }
}
function move(dir: 1 | -1) {
  const n = filtered.value.length
  for (let k = 1; k <= n; k++) {
    const i = (((Math.max(active.value, dir === 1 ? -1 : 0) + dir * k) % n) + n) % n
    if (!filtered.value[i]!.disabled) { active.value = i; break }
  }
  void nextTick(() => panel.value?.querySelector<HTMLElement>(`[id="${optId(active.value)}"]`)?.scrollIntoView({ block: 'nearest' }))
}
function clear() { commit(props.multiple ? [] : null) }
function removeChip(v: Val) { commit(selected.value.filter(x => x !== v)) }
function onKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown': e.preventDefault(); move(1); break
    case 'ArrowUp': e.preventDefault(); move(-1); break
    case 'Enter': e.preventDefault(); choose(active.value); break
    case 'Tab': popup.hide(false); break
    case 'Backspace': if (props.multiple && !query.value && selected.value.length) commit(selected.value.slice(0, -1)); break
  }
}
function onTriggerKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openList() }
}
defineExpose({ focus: () => (box.value?.$el as HTMLElement | undefined)?.focus() })
defineSlots<{
  /** Custom row content for each option. */
  item?(props: { option: MiSelectOption & { group?: string }, selected: boolean }): unknown
  /** Replaces the no-match message. */
  empty?(): unknown
}>()
</script>

<template>
  <div class="mi-cb" v-bind="rootAttrs">
    <MiFieldBox
      v-bind="btnAttrs" :id="id" ref="box" tag="button" type="button" class="mi-cb__trigger" :size="size"
      :invalid="isInvalid" :disabled="isDisabled" role="combobox" aria-haspopup="listbox"
      :aria-expanded="popup.open.value" :aria-controls="popup.open.value ? listId : undefined"
      :aria-invalid="isInvalid || undefined" @click="popup.open.value ? popup.hide(false) : openList()" @keydown="onTriggerKey"
    >
      <span class="mi-cb__value" :class="{ 'is-placeholder': !summary.length }">
        <template v-if="!summary.length">{{ placeholder }}</template>
        <template v-else-if="multiple"><span v-for="(s, ci) in summary" :key="s" class="mi-cb__chip">{{ s }}<span class="mi-cb__x" role="button" :aria-label="`Remove ${s}`" @click.stop="removeChip(selected[ci]!)">&times;</span></span></template>
        <template v-else>{{ summary[0] }}</template>
      </span>
      <svg class="mi-cb__chev" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 9l5-5 5 5M7 15l5 5 5-5" /></svg>
    </MiFieldBox>
    <button v-if="clearable && selected.length && !isDisabled" type="button" class="mi-cb__clear" aria-label="Clear" @click="clear">&times;</button>
    <template v-if="name">
      <input v-for="v in selected" :key="v" type="hidden" :name="multiple ? `${name}[]` : name" :value="v">
    </template>
    <Teleport to="body">
      <Transition name="mi-cb-pop">
        <div v-if="popup.open.value" ref="panel" class="mi mi-cb__panel" :class="popup.scope.value" :style="popup.style.value">
          <input
            v-model="query" class="mi-cb__search" type="text" role="searchbox" autocomplete="off" :placeholder="searchPlaceholder" :aria-label="searchPlaceholder"
            :aria-controls="listId" :aria-activedescendant="filtered.length ? optId(active) : undefined" @input="active = hl()" @keydown="onKeydown"
          >
          <ul :id="listId" class="mi-cb__list" role="listbox" :aria-multiselectable="multiple || undefined" :aria-labelledby="id">
            <template v-for="(o, i) in filtered" :key="o.value">
            <li v-if="o.group && o.group !== filtered[i - 1]?.group" class="mi-cb__heading" role="presentation">{{ o.group }}</li>
            <li
              :id="optId(i)" class="mi-cb__opt" role="option"
              :class="{ 'is-active': i === active, 'is-disabled': o.disabled }" :aria-selected="isSel(o.value)" :aria-disabled="o.disabled || undefined"
              @mousedown.prevent @mousemove="active = i" @click="choose(i)"
            >
              <svg class="mi-cb__check" :class="{ 'is-on': isSel(o.value) }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              <slot name="item" :option="o" :selected="isSel(o.value)"><span>{{ o.label }}</span></slot>
            </li>
            </template>
          </ul>
          <div v-if="!filtered.length" class="mi-cb__empty" role="status"><slot name="empty">{{ emptyText }}</slot></div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.mi-cb { position: relative; display: flex; min-width: 0; }
.mi-cb .mi-cb__trigger { padding: 0 36px 0 14px; cursor: pointer; }
.mi-cb__value { flex: 1; display: flex; flex-wrap: wrap; gap: 4px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 2px 0; }
.mi-cb__value.is-placeholder { color: var(--mi-label2); }
.mi-cb__chip { padding: 1px 8px; border-radius: 6px; background: var(--mi-p-tint); color: var(--mi-p-text); font-size: 14px; }
.mi-cb__x { margin-left: 4px; cursor: pointer; opacity: .7; }
.mi-cb__clear { position: absolute; right: 30px; top: 50%; width: 22px; height: 22px; margin-top: -11px; border: 0; border-radius: 6px; background: transparent; color: var(--mi-label2); cursor: pointer; }
.mi-cb__chev { position: absolute; right: 12px; top: 50%; margin-top: -6px; color: var(--mi-label2); pointer-events: none; }
</style>

<style>
.mi-cb__panel {
  position: fixed; z-index: 1000; box-sizing: border-box; min-width: 200px; overflow: hidden; display: flex; flex-direction: column; border-radius: 12px; padding: 6px;
  background: var(--mi-elev); box-shadow: var(--mi-sh3), inset 0 0 0 .5px var(--mi-mat-b); font-family: var(--mi-font); color: var(--mi-label);
  transform-origin: center var(--mi-origin, top); contain: layout paint;
}
.mi-cb__search { box-sizing: border-box; width: 100%; height: 36px; margin-bottom: 4px; padding: 0 10px; border: 0; border-radius: 8px; background: var(--mi-field); color: var(--mi-label); font: inherit; font-size: 15px; outline: none; }
.mi-cb__search:focus-visible { box-shadow: inset 0 0 0 1.5px var(--mi-p); }
.mi-cb__list { display: flex; flex-direction: column; gap: 1px; margin: 0; padding: 0; overflow-y: auto; list-style: none; overscroll-behavior: contain; }
.mi-cb__opt { display: flex; align-items: center; gap: 6px; min-height: 36px; padding: 6px 10px 6px 8px; border-radius: 7px; font-size: 15px; cursor: pointer; user-select: none; }
.mi-cb__opt.is-active { background: var(--mi-p); color: var(--mi-p-on); }
.mi-cb__opt.is-disabled { color: var(--mi-label3); cursor: not-allowed; }
.mi-cb__opt.is-disabled.is-active { background: transparent; }
.mi-cb__heading { padding: 8px 10px 4px; font-size: 12px; font-weight: 600; color: var(--mi-label2); }
.mi-cb__check { flex: none; opacity: 0; }
.mi-cb__check.is-on { opacity: 1; }
.mi-cb__empty { padding: 14px 10px; text-align: center; font-size: 14px; color: var(--mi-label2); }
.mi-cb-pop-enter-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.mi-cb-pop-leave-active { transition: opacity var(--mi-dur-1) var(--mi-ease-in-out), transform var(--mi-dur-1) var(--mi-ease-in-out); }
.mi-cb-pop-enter-from, .mi-cb-pop-leave-to { opacity: 0; transform: scale(.96) translateY(-4px); }
</style>

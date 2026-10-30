<script setup lang="ts">
/** One-time code input with one cell per character; numeric or alphanumeric mode, emits complete when every cell is filled. */
import { computed, inject, nextTick, ref, useAttrs, useId } from 'vue'
import { MI_FIELD } from '../../utils/miInputs'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Number of cells, and so the length of a complete code. */
  length?: number
  /** `numeric` shows the digit keypad on touch devices. */
  mode?: 'numeric' | 'alphanumeric'
  /** Hide entered characters. */
  mask?: boolean
  /** Focuses the first cell on mount so the user can type or paste right away. */
  autofocus?: boolean
  /** Overrides the surrounding MiField or MiFormRow state when set; undefined inherits it. */
  invalid?: boolean
  /** Overrides the surrounding MiField or MiFormRow disabled state when set. */
  disabled?: boolean
  /** Prefix of each cell's accessible name, followed by its index. */
  cellLabel?: string
  /** Accessible name of the whole cell group, announced before the individual cells. */
  label?: string
}>(), { length: 6, mode: 'numeric', invalid: undefined, disabled: undefined, cellLabel: 'Digit', label: 'Verification code' })

/** Code entered so far, from 0 to `length` characters. */

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ complete: [code: string] }>()

const attrs = useAttrs()
const field = inject(MI_FIELD, null)
const auto = useId()
const cells = ref<HTMLInputElement[]>([])
const focused = ref(-1)

const isInvalid = computed(() => props.invalid ?? field?.invalid.value ?? false)
const isDisabled = computed(() => props.disabled ?? field?.disabled.value ?? false)
const describedBy = computed(() => [attrs['aria-describedby'], field?.describedBy.value].filter(Boolean).join(' ') || undefined)
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
const chars = computed(() => Array.from({ length: props.length }, (_, i) => model.value[i] ?? ''))
const firstEmpty = computed(() => Math.min(model.value.length, props.length - 1))

const clean = (s: string) => (props.mode === 'numeric' ? s.replace(/\D/g, '') : s.replace(/[^a-z0-9]/gi, '')).toUpperCase()

function focusCell(i: number) {
  const t = Math.max(0, Math.min(props.length - 1, i))
  void nextTick(() => { const c = cells.value[t]; c?.focus(); c?.select() })
}

function commit(v: string) {
  const next = v.slice(0, props.length)
  model.value = next
  if (next.length === props.length) emit('complete', next)
}

/** Insert `text` at cell `i`; extra characters (paste, autofill) flow into the next cells. */
function insert(i: number, text: string, replace: boolean) {
  const s = clean(text)
  if (!s) return
  const at = Math.min(i, model.value.length)
  const head = model.value.slice(0, at)
  const tail = replace ? model.value.slice(at + s.length) : model.value.slice(at)
  commit(head + s + tail)
  focusCell(Math.min(at + s.length, props.length - 1))
}

function onInput(e: Event, i: number) {
  const t = e.target as HTMLInputElement
  const old = chars.value[i] ?? ''
  let v = t.value
  t.value = old
  if (!v) return
  if (old && v.length === 2) v = v[0] === old ? v[1]! : v[0]!
  insert(i, v, true)
}

function onKeydown(e: KeyboardEvent, i: number) {
  switch (e.key) {
    case 'Backspace':
      e.preventDefault()
      if (i < model.value.length) {
        commit(model.value.slice(0, i) + model.value.slice(i + 1))
        focusCell(i)
      } else if (i > 0) {
        commit(model.value.slice(0, i - 1))
        focusCell(i - 1)
      }
      break
    case 'Delete':
      e.preventDefault()
      if (i < model.value.length) commit(model.value.slice(0, i) + model.value.slice(i + 1))
      break
    case 'ArrowLeft': e.preventDefault(); focusCell(i - 1); break
    case 'ArrowRight': e.preventDefault(); focusCell(i + 1); break
    case 'Home': e.preventDefault(); focusCell(0); break
    case 'End': e.preventDefault(); focusCell(props.length - 1); break
  }
}

function onPaste(e: ClipboardEvent, i: number) {
  e.preventDefault()
  insert(i, e.clipboardData?.getData('text') ?? '', true)
}

function onFocus(e: FocusEvent, i: number) {
  focused.value = i
  // Typing is sequential: land on the first empty cell when focus arrives past it.
  if (i > firstEmpty.value && model.value.length < props.length) focusCell(firstEmpty.value)
  else (e.target as HTMLInputElement).select()
}

function setCell(el: unknown, i: number) { if (el) cells.value[i] = el as HTMLInputElement }
defineExpose({ focus: () => focusCell(firstEmpty.value), clear: () => { model.value = ''; focusCell(0) } })
</script>

<template>
  <span :id="`mi-code-${auto}`" class="mi-code" role="group" :aria-label="label" :aria-describedby="describedBy" v-bind="rootAttrs">
    <span v-for="(c, i) in chars" :key="i" class="mi-code__slot" :class="{ 'is-focus': focused === i, 'is-invalid': isInvalid }">
    <input
      :ref="el => setCell(el, i)" class="mi-code__cell"
      :class="{ 'is-filled': c, 'is-invalid': isInvalid }"
      :type="mask ? 'password' : 'text'" :inputmode="mode === 'numeric' ? 'numeric' : 'text'" :pattern="mode === 'numeric' ? '[0-9]*' : undefined"
      :autocomplete="i === 0 ? 'one-time-code' : 'off'" :autofocus="autofocus && i === 0" :maxlength="i === 0 ? undefined : 2"
      :aria-label="`${cellLabel} ${i + 1}`" :aria-invalid="isInvalid || undefined" :disabled="isDisabled" :value="c"
      autocapitalize="characters" spellcheck="false"
      @input="onInput($event, i)" @keydown="onKeydown($event, i)" @paste="onPaste($event, i)" @focus="onFocus($event, i)" @blur="focused = -1"
    >
    </span>
  </span>
</template>

<style scoped>
/* min-width: 0 lets the row shrink inside grid and flex parents; cells then keep their 52:60 shape and scale their digit. */
.mi-code { display: inline-flex; align-items: flex-start; gap: 10px; min-width: 0; max-width: 100%; font-family: var(--mi-font); }
.mi-code__slot { position: relative; flex: 0 1 52px; width: 52px; min-width: 0; aspect-ratio: 52 / 60; container-type: inline-size; border-radius: 12px; transition: transform var(--mi-dur-2) var(--mi-spring); }
.mi-code__slot::after {
  content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0;
  box-shadow: inset 0 0 0 1.5px var(--mi-p), 0 0 0 4px var(--mi-p-tint2); transition: opacity var(--mi-dur-2) var(--mi-ease);
}
.mi-code__slot.is-invalid::after { box-shadow: inset 0 0 0 1.5px var(--mi-red-t), 0 0 0 4px color-mix(in srgb, var(--mi-red) 24%, transparent); }
.mi-code__slot.is-focus { transform: scale(1.04); }
.mi-code__slot.is-focus::after { opacity: 1; }
.mi-code__cell {
  display: block; width: 100%; height: 100%; min-width: 0; margin: 0; padding: 0; border: 0; border-radius: 12px;
  background: var(--mi-field); box-shadow: inset 0 0 0 1px var(--mi-field-b); color: var(--mi-label); text-align: center; font: inherit;
  font-size: clamp(18px, 54cqi, 28px); font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: 0; outline: none; caret-color: var(--mi-p);
}
.mi-code__cell.is-invalid { box-shadow: inset 0 0 0 1.5px var(--mi-red-t); }
.mi-code__cell:disabled { background: var(--mi-fill4); box-shadow: none; color: var(--mi-label3); cursor: not-allowed; }
</style>

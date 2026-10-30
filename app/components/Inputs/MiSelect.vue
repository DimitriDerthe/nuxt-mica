<script setup lang="ts">
/** Single-choice dropdown over an options array; v-model holds the chosen option value. */
import { computed, inject, nextTick, onBeforeUnmount, ref, useAttrs, useId, watch } from 'vue'
import MiFieldBox from './MiFieldBox.vue'
import { useMiInputPopup } from '../../composables/useMiInputPopup'
import { MI_FIELD } from '../../utils/miInputs'
import type { MiSelectOption } from '../../utils/miInputs'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Choices listed in the dropdown, each with a `value` and a `label`. */
  options: MiSelectOption[]
  /** Text shown while nothing is selected. */
  placeholder?: string
  /** Control height: `sm` is compact, `md` the standard size. */
  size?: 'sm' | 'md'
  /** Overrides the surrounding MiField or MiFormRow state when set; undefined inherits it. */
  invalid?: boolean
  /** Draws the success border and focus ring. */
  success?: boolean
  /** Overrides the surrounding MiField or MiFormRow disabled state when set. */
  disabled?: boolean
  /** Submitted through a hidden input when inside a native form. */
  name?: string
}>(), { placeholder: 'Select an option', size: 'md', invalid: undefined, success: undefined, disabled: undefined })

/** Value of the chosen option, or null when none is. */

const model = defineModel<string | number | null>({ default: null })
const emit = defineEmits<{ change: [value: string | number] }>()

const attrs = useAttrs()
const field = inject(MI_FIELD, null)
const auto = useId()
const box = ref<InstanceType<typeof MiFieldBox> | null>(null)
const panel = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)
const active = ref(-1)

const id = computed(() => (attrs.id as string | undefined) ?? field?.id ?? `mi-s-${auto}`)
const listId = `mi-s-list-${auto}`
const optId = (i: number) => `mi-s-opt-${auto}-${i}`
const isInvalid = computed(() => props.invalid ?? field?.invalid.value ?? false)
const isSuccess = computed(() => props.success ?? field?.success.value ?? false)
const isDisabled = computed(() => props.disabled ?? field?.disabled.value ?? false)
const describedBy = computed(() => [attrs['aria-describedby'], field?.describedBy.value].filter(Boolean).join(' ') || undefined)
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
const btnAttrs = computed(() => { const { class: _c, style: _s, id: _i, 'aria-describedby': _d, ...rest } = attrs; return rest })

const popup = useMiInputPopup({ trigger: () => (box.value?.$el as HTMLElement | null) ?? null, panel, matchWidth: true })
const selectedIndex = computed(() => props.options.findIndex(o => o.value === model.value))
const selected = computed(() => props.options[selectedIndex.value])

const enabled = (i: number) => !!props.options[i] && !props.options[i]!.disabled
function step(from: number, dir: 1 | -1): number {
  const n = props.options.length
  for (let k = 1; k <= n; k++) {
    const i = (((from + dir * k) % n) + n) % n
    if (enabled(i)) return i
  }
  return from
}
const edge = (dir: 1 | -1) => step(dir === 1 ? -1 : props.options.length, dir)

function reveal() {
  void nextTick(() => list.value?.querySelector<HTMLElement>(`[id="${optId(active.value)}"]`)?.scrollIntoView({ block: 'nearest' }))
}
function setActive(i: number) { active.value = i; reveal() }

function openList(at?: 'first' | 'last') {
  if (isDisabled.value) return
  popup.show()
  active.value = at === 'first' ? edge(1) : at === 'last' ? edge(-1) : (selectedIndex.value >= 0 ? selectedIndex.value : edge(1))
  reveal()
}

function choose(i: number) {
  const o = props.options[i]
  if (!o || o.disabled) return
  if (o.value !== model.value) { model.value = o.value; emit('change', o.value) }
  popup.hide(true)
}

let buf = ''
let timer: ReturnType<typeof setTimeout> | undefined
function typeahead(ch: string) {
  buf += ch.toLowerCase()
  clearTimeout(timer)
  timer = setTimeout(() => { buf = '' }, 600)
  const n = props.options.length
  const start = popup.open.value ? active.value : selectedIndex.value
  for (let k = 0; k < n; k++) {
    const i = (start + (buf.length === 1 ? 1 : 0) + k + n) % n
    if (enabled(i) && props.options[i]!.label.toLowerCase().startsWith(buf)) {
      if (popup.open.value) setActive(i)
      else choose(i)
      return
    }
  }
}

function onKeydown(e: KeyboardEvent) {
  if (isDisabled.value) return
  const open = popup.open.value
  switch (e.key) {
    case 'ArrowDown': e.preventDefault(); open ? setActive(step(active.value, 1)) : openList(); break
    case 'ArrowUp': e.preventDefault(); open ? setActive(step(active.value, -1)) : openList(); break
    case 'Home': if (open) { e.preventDefault(); setActive(edge(1)) } else { e.preventDefault(); openList('first') } break
    case 'End': if (open) { e.preventDefault(); setActive(edge(-1)) } else { e.preventDefault(); openList('last') } break
    case 'Enter': case ' ':
      if (e.key === ' ' && buf) { typeahead(' '); e.preventDefault(); break }
      e.preventDefault(); open ? choose(active.value) : openList(); break
    case 'Tab': if (open) { if (enabled(active.value)) choose(active.value); else popup.hide(false) } break
    default:
      if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); typeahead(e.key) }
  }
}

watch(() => props.options, () => { if (active.value >= props.options.length) active.value = -1 })
onBeforeUnmount(() => clearTimeout(timer))
defineExpose({ focus: () => (box.value?.$el as HTMLElement | undefined)?.focus() })
</script>

<template>
  <div class="mi-sel" v-bind="rootAttrs">
    <MiFieldBox
      v-bind="btnAttrs" :id="id" ref="box" tag="button" type="button" class="mi-sel__trigger" :size="size"
      :invalid="isInvalid" :success="isSuccess" :disabled="isDisabled"
      role="combobox" aria-haspopup="listbox" :aria-expanded="popup.open.value" :aria-controls="popup.open.value ? listId : undefined"
      :aria-activedescendant="popup.open.value && active >= 0 ? optId(active) : undefined"
      :aria-invalid="isInvalid || undefined" :aria-describedby="describedBy" :aria-required="field?.required.value || undefined"
      @click="popup.open.value ? popup.hide(false) : openList()" @keydown="onKeydown"
    >
      <span class="mi-sel__value" :class="{ 'is-placeholder': !selected }">{{ selected ? selected.label : placeholder }}</span>
      <span class="mi-sel__chev" :class="{ 'is-open': popup.open.value }" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9l5-5 5 5M7 15l5 5 5-5" /></svg>
      </span>
    </MiFieldBox>
    <input v-if="name" type="hidden" :name="name" :value="model ?? ''">
    <Teleport to="body">
      <Transition name="mi-sel-pop">
        <div v-if="popup.open.value" ref="panel" class="mi mi-sel__panel" :class="popup.scope.value" :style="popup.style.value">
          <ul :id="listId" ref="list" class="mi-sel__list" role="listbox" :aria-labelledby="id" tabindex="-1">
            <li
              v-for="(o, i) in options" :id="optId(i)" :key="o.value" class="mi-sel__opt" role="option"
              :class="{ 'is-active': i === active, 'is-selected': i === selectedIndex, 'is-disabled': o.disabled }"
              :aria-selected="i === selectedIndex" :aria-disabled="o.disabled || undefined"
              @mousedown.prevent @mousemove="enabled(i) && active !== i && (active = i)" @click="choose(i)"
            >
              <svg class="mi-sel__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              <span class="mi-sel__text"><span>{{ o.label }}</span><small v-if="o.description">{{ o.description }}</small></span>
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.mi-sel { position: relative; display: flex; min-width: 0; }
.mi-sel .mi-sel__trigger { padding: 0 40px 0 14px; cursor: pointer; }
.mi-sel .mi-sel__trigger.mi-box--sm { padding-right: 36px; padding-left: 12px; }
.mi-sel__value { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mi-sel__value.is-placeholder { color: var(--mi-label2); }
.mi-sel__chev {
  position: absolute; right: 8px; top: 50%; width: 24px; height: 24px; margin-top: -12px; border-radius: 6px; background: var(--mi-p); color: var(--mi-p-on);
  display: flex; align-items: center; justify-content: center; pointer-events: none; transition: transform var(--mi-dur-2) var(--mi-ease);
}
.mi-sel__trigger.mi-box--sm .mi-sel__chev { right: 6px; width: 22px; height: 22px; margin-top: -11px; }
.mi-sel__chev.is-open { transform: scale(.9); }
.mi-sel__trigger.is-disabled .mi-sel__chev { background: var(--mi-fill); color: var(--mi-label3); }
</style>

<style>
.mi-sel__panel {
  position: fixed; z-index: 1000; box-sizing: border-box; min-width: 160px; overflow: hidden; border-radius: 12px; padding: 6px;
  background: var(--mi-elev); box-shadow: var(--mi-sh3), inset 0 0 0 .5px var(--mi-mat-b); font-family: var(--mi-font); color: var(--mi-label);
  transform-origin: center var(--mi-origin, top); contain: layout paint;
}
.mi-sel__list { display: flex; flex-direction: column; gap: 1px; margin: 0; padding: 0; max-height: inherit; overflow-y: auto; list-style: none; outline: none; overscroll-behavior: contain; }
.mi-sel__opt { display: flex; align-items: center; gap: 6px; min-height: 36px; padding: 6px 10px 6px 8px; border-radius: 7px; font-size: 15px; letter-spacing: -.01em; cursor: pointer; user-select: none; }
.mi-sel__opt.is-active { background: var(--mi-p); color: var(--mi-p-on); }
.mi-sel__opt.is-disabled { color: var(--mi-label3); cursor: not-allowed; }
.mi-sel__opt.is-disabled.is-active { background: transparent; color: var(--mi-label3); }
.mi-sel__check { flex: none; opacity: 0; }
.mi-sel__opt.is-selected .mi-sel__check { opacity: 1; }
.mi-sel__text { display: flex; flex-direction: column; min-width: 0; }
.mi-sel__text small { font-size: 12px; opacity: .72; }
.mi-sel-pop-enter-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); will-change: transform, opacity; }
.mi-sel-pop-leave-active { transition: opacity var(--mi-dur-1) var(--mi-ease-in-out), transform var(--mi-dur-1) var(--mi-ease-in-out); will-change: transform, opacity; }
.mi-sel-pop-enter-from, .mi-sel-pop-leave-to { opacity: 0; transform: scale(.96) translateY(-4px); }
</style>

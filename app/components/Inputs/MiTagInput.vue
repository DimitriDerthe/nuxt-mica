<script setup lang="ts">
/** Tag entry field that commits typed text with delimiter keys into a string[] v-model; supports max, duplicate and validate rules. */
import { computed, inject, nextTick, ref, useAttrs, useId } from 'vue'
import MiFieldBox from './MiFieldBox.vue'
import { MI_FIELD } from '../../utils/miInputs'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Hint text shown while the field is empty. */
  placeholder?: string
  /** Keys that commit the current text as a tag. */
  delimiters?: string[]
  /** Maximum number of tags. Extra tags are rejected. */
  max?: number
  /** When false, a tag matching an existing one (case-insensitive) is rejected. */
  allowDuplicates?: boolean
  /** Return false to reject a tag. */
  validate?: (tag: string) => boolean
  /** Overrides the surrounding MiField or MiFormRow state when set; undefined inherits it. */
  invalid?: boolean
  /** Draws the success border and focus ring. */
  success?: boolean
  /** Overrides the surrounding MiField or MiFormRow disabled state when set. */
  disabled?: boolean
  /** Accessible name of each tag's remove button. */
  removeLabel?: string
}>(), {
  placeholder: 'Add tag, press Return', delimiters: () => ['Enter', ','], allowDuplicates: false,
  invalid: undefined, success: undefined, disabled: undefined, removeLabel: 'Remove'
})

/** Committed tags, in entry order. */

const model = defineModel<string[]>({ default: () => [] })
const emit = defineEmits<{ add: [tag: string], remove: [tag: string], reject: [tag: string] }>()

const attrs = useAttrs()
const field = inject(MI_FIELD, null)
const auto = useId()
const el = ref<HTMLInputElement | null>(null)
const text = ref('')
const status = ref('')

const id = computed(() => (attrs.id as string | undefined) ?? field?.id ?? `mi-tg-${auto}`)
const isInvalid = computed(() => props.invalid ?? field?.invalid.value ?? false)
const isSuccess = computed(() => props.success ?? field?.success.value ?? false)
const isDisabled = computed(() => props.disabled ?? field?.disabled.value ?? false)
const describedBy = computed(() => [attrs['aria-describedby'], field?.describedBy.value].filter(Boolean).join(' ') || undefined)
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
const inputAttrs = computed(() => { const { class: _c, style: _s, id: _i, 'aria-describedby': _d, ...rest } = attrs; return rest })
const full = computed(() => props.max !== undefined && model.value.length >= props.max)

function tryAdd(raw: string, list: string[]): string[] | null {
  const tag = raw.trim()
  if (!tag) return null
  const dup = !props.allowDuplicates && list.some(t => t.toLowerCase() === tag.toLowerCase())
  if (dup || (props.max !== undefined && list.length >= props.max) || (props.validate && !props.validate(tag))) { emit('reject', tag); return null }
  status.value = `${tag} added`
  emit('add', tag)
  return [...list, tag]
}

function addMany(raws: string[]): boolean {
  let list = model.value
  let ok = false
  for (const r of raws) {
    const next = tryAdd(r, list)
    if (next) { list = next; ok = true }
  }
  if (ok) model.value = list
  return ok
}

function remove(i: number) {
  const tag = model.value[i]
  if (tag === undefined) return
  model.value = model.value.filter((_, j) => j !== i)
  status.value = `${tag} removed`
  emit('remove', tag)
  void nextTick(() => el.value?.focus())
}

function commit() {
  if (addMany([text.value])) text.value = ''
}

function onKeydown(e: KeyboardEvent) {
  if (props.delimiters.includes(e.key) && e.key !== 'Tab') {
    if (text.value.trim() || e.key === 'Enter') e.preventDefault()
    if (text.value.trim()) commit()
  } else if (e.key === 'Backspace' && !text.value && model.value.length) {
    remove(model.value.length - 1)
  }
}

function onPaste(e: ClipboardEvent) {
  const data = e.clipboardData?.getData('text') ?? ''
  if (!/[\n,;\t]/.test(data)) return
  e.preventDefault()
  addMany(data.split(/[\n,;\t]+/))
}

function onChipKey(e: KeyboardEvent, i: number) {
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(i) }
}

defineExpose({ focus: () => el.value?.focus() })
</script>

<template>
  <MiFieldBox
    class="mi-tg" :invalid="isInvalid" :success="isSuccess" :disabled="isDisabled" v-bind="rootAttrs" @click.self="el?.focus()"
  >
    <ul class="mi-tg__list mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:flex-1 mi:min-w-0 mi:m-0 mi:p-0 mi:[list-style:none]" @click.self="el?.focus()">
      <li v-for="(t, i) in model" :key="t" class="mi-tg__chip mi:inline-flex mi:items-center mi:gap-0.5 mi:h-7 mi:max-w-full mi:pt-0 mi:pr-0.5 mi:pb-0 mi:pl-2.5 mi:rounded-[7px] mi:bg-p-tint mi:text-p-text mi:text-[14px] mi:font-medium">
        <span class="mi-tg__label mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ t }}</span>
        <button type="button" class="mi-tg__x mi:flex mi:items-center mi:justify-center mi:flex-[none] mi:w-6 mi:h-6 mi:m-0 mi:p-0 mi:[border:0] mi:rounded-[5px] mi:bg-transparent mi:text-inherit mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.85)] mi:focus-visible:[outline:2px_solid_color-mix(in_srgb,_var(--mi-p)_70%,_transparent)] mi:focus-visible:outline-offset-[-1px]" :disabled="isDisabled" :aria-label="`${removeLabel} ${t}`" @click="remove(i)" @keydown="onChipKey($event, i)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </li>
      <li class="mi-tg__entry mi:flex-1 mi:min-w-35 mi:flex">
        <input
          v-bind="inputAttrs" :id="id" ref="el" v-model="text" class="mi-tg__input mi:[outline:none]" type="text" autocomplete="off"
          :placeholder="full ? '' : placeholder" :disabled="isDisabled || full" :aria-invalid="isInvalid || undefined"
          :aria-describedby="describedBy" @keydown="onKeydown" @paste="onPaste" @blur="commit"
        >
      </li>
    </ul>
    <span class="mi-tg__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" role="status" aria-live="polite">{{ status }}</span>
  </MiFieldBox>
</template>

<style scoped>
.mi-tg { min-height: 44px; padding: 6px 8px; cursor: text; }
.mi-tg__chip { animation: mi-tg-in var(--mi-dur-3) var(--mi-spring) both;
}
.mi-tg__input { flex: 1; min-width: 0; height: 28px; margin: 0; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; font-size: 15px; letter-spacing: inherit; }
.mi-tg__input::placeholder { color: var(--mi-label2); opacity: 1; }
@keyframes mi-tg-in { from { opacity: 0; transform: scale(.8); } to { opacity: 1; transform: none; } }
</style>

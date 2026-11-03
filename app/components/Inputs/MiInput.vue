<script setup lang="ts">
/** Single-line text input with optional prefix and suffix add-ons, clear button and password reveal toggle; v-model is a string. */
import { computed, inject, ref, useAttrs, useId } from 'vue'
import MiFieldBox from './MiFieldBox.vue'
import { MI_FIELD } from '../../utils/miInputs'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Native input type such as `text`, `email` or `password`. */
  type?: string
  /** Field height: `sm` is compact, `md` the standard size. */
  size?: 'sm' | 'md'
  /** Text add-on before the input (for example `https://`). */
  prefix?: string
  /** Text add-on after the input. */
  suffix?: string
  /** Shows a clear button; clicking it empties the model and emits clear. */
  clearable?: boolean
  /** Show the reveal button. Defaults to true for `type="password"`. */
  passwordToggle?: boolean
  /** Overrides the surrounding MiField or MiFormRow state when set; undefined inherits it. */
  invalid?: boolean
  /** Draws the success border and focus ring. */
  success?: boolean
  /** Overrides the surrounding MiField or MiFormRow disabled state when set. */
  disabled?: boolean
  /** Accessible name of the button that reveals a password. */
  showLabel?: string
  /** Accessible name of the button that hides a revealed password. */
  hideLabel?: string
  /** Accessible name of the clear button. */
  clearLabel?: string
}>(), {
  type: 'text', size: 'md', passwordToggle: undefined, invalid: undefined, success: undefined, disabled: undefined,
  showLabel: 'Show password', hideLabel: 'Hide password', clearLabel: 'Clear'
})

/** Text value of the field. */

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ clear: [] }>()

const attrs = useAttrs()
const field = inject(MI_FIELD, null)
const auto = useId()
const el = ref<HTMLInputElement | null>(null)
const revealed = ref(false)

const id = computed(() => (attrs.id as string | undefined) ?? field?.id ?? `mi-i-${auto}`)
const isInvalid = computed(() => props.invalid ?? field?.invalid.value ?? false)
const isSuccess = computed(() => props.success ?? field?.success.value ?? false)
const isDisabled = computed(() => props.disabled ?? field?.disabled.value ?? false)
const hasToggle = computed(() => props.passwordToggle ?? props.type === 'password')
const inputType = computed(() => (hasToggle.value && revealed.value ? 'text' : props.type))
const describedBy = computed(() => [attrs['aria-describedby'], field?.describedBy.value].filter(Boolean).join(' ') || undefined)
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
const inputAttrs = computed(() => {
  const { class: _c, style: _s, id: _i, 'aria-describedby': _d, ...rest } = attrs
  return rest
})
const showClear = computed(() => props.clearable && !isDisabled.value && String(model.value ?? '').length > 0)

function clear() {
  model.value = ''
  emit('clear')
  el.value?.focus()
}

defineExpose({ focus: () => el.value?.focus(), input: el })
defineSlots<{
  /** Replaces the text prefix add-on. */
  prefix?(): unknown
  /** Icon or content shown inside the field before the text. */
  leading?(): unknown
  /** Replaces the text suffix add-on. */
  suffix?(): unknown
}>()
</script>

<template>
  <MiFieldBox :size="size" :invalid="isInvalid" :success="isSuccess" :disabled="isDisabled" v-bind="rootAttrs">
    <span v-if="prefix || $slots.prefix" class="mi-in__addon mi-in__addon--start mi:self-stretch mi:flex mi:items-center mi:py-0 mi:px-3 mi:bg-fill4 mi:text-[.88em] mi:text-label2 mi:whitespace-nowrap mi:border-r mi:border-r-field-b mi:rounded-[var(--mi-box-r)_0_0_var(--mi-box-r)]"><slot name="prefix">{{ prefix }}</slot></span>
    <span v-if="$slots.leading" class="mi-in__lead mi:flex mi:items-center mi:pl-3 mi:text-label2"><slot name="leading" /></span>
    <input
      v-bind="inputAttrs"
      :id="id"
      ref="el"
      class="mi-in__field mi:self-stretch"
      :class="{ 'has-lead': $slots.leading, 'has-addon': prefix || $slots.prefix, 'has-action': showClear || hasToggle || suffix || $slots.suffix }"
      :type="inputType"
      :value="model"
      :disabled="isDisabled"
      :required="field?.required.value || undefined"
      :aria-invalid="isInvalid || undefined"
      :aria-describedby="describedBy"
      @input="model = ($event.target as HTMLInputElement).value"
    >
    <button v-if="showClear" type="button" class="mi-in__btn mi-in__btn--clear mi:flex-[none] mi:flex mi:items-center mi:justify-center mi:h-8 mi:m-0 mi:p-0 mi:[border:0] mi:bg-transparent mi:text-label2 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease),_opacity_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.88)] mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[-2px] mi:disabled:cursor-not-allowed mi:disabled:opacity-50" :aria-label="clearLabel" @click="clear">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" /><path d="M9 9l6 6M15 9l-6 6" stroke-width="2" stroke-linecap="round" style="stroke: var(--mi-field)" /></svg>
    </button>
    <button
      v-if="hasToggle" type="button" class="mi-in__btn mi-in__btn--toggle mi:flex-[none] mi:flex mi:items-center mi:justify-center mi:h-8 mi:m-0 mi:p-0 mi:[border:0] mi:bg-transparent mi:text-label2 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease),_opacity_var(--mi-dur-1)_var(--mi-ease)] mi:h-full mi:active:transform-[scale(.88)] mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[-2px] mi:disabled:cursor-not-allowed mi:disabled:opacity-50" :disabled="isDisabled"
      :aria-label="revealed ? hideLabel : showLabel" :aria-pressed="revealed" @click="revealed = !revealed"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <template v-if="!revealed"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></template>
        <template v-else><path d="M4 4l16 16" /><path d="M9.9 5.8A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.8M6.3 7.6A15.6 15.6 0 0 0 2.5 12S6 18.5 12 18.5c1.4 0 2.7-.3 3.8-.8" /><path d="M10 10a3 3 0 0 0 4 4" /></template>
      </svg>
    </button>
    <span v-if="suffix || $slots.suffix" class="mi-in__addon mi-in__addon--end mi:self-stretch mi:flex mi:items-center mi:py-0 mi:px-3 mi:bg-fill4 mi:text-[.88em] mi:text-label2 mi:whitespace-nowrap mi:border-l mi:border-l-field-b mi:rounded-[0_var(--mi-box-r)_var(--mi-box-r)_0]"><slot name="suffix">{{ suffix }}</slot></span>
  </MiFieldBox>
</template>

<style scoped>
.mi-in__field {
  flex: 1; min-width: 0; margin: 0; padding: 0 14px; border: 0; border-radius: inherit; background: transparent;
  color: inherit; font: inherit; letter-spacing: inherit; outline: none; text-overflow: ellipsis;
}
.mi-in__field::placeholder { color: var(--mi-label2); opacity: 1; }
.mi-in__field:disabled { cursor: not-allowed; }
.mi-in__field.has-addon { padding-left: 12px; }
.mi-in__field.has-lead { padding-left: 6px; }
.mi-in__field.has-action { padding-right: 4px; }
.mi-in__btn { width: 32px; border-radius: 50%;
}
.mi-in__btn--toggle { width: 44px; border-radius: 0 var(--mi-box-r) var(--mi-box-r) 0; }
</style>

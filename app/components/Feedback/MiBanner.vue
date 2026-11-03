<script setup lang="ts">
/** Page-level message bar for persistent notices, in `tint` or `solid` variant, optionally sticky and dismissible. */
import { computed } from 'vue'
import MiFbIcon, { type MiFbIconName } from './MiFbIcon.vue'
import { miFeedbackToneVars, type MiFeedbackTone } from '../../utils/miOverlay'

const props = withDefaults(defineProps<{
  /** Colour. `danger` is announced as an alert, other tones as a status. */
  tone?: MiFeedbackTone
  /** `tint` is soft and tonal, `solid` is a full colour bar. */
  variant?: 'tint' | 'solid'
  /** Bold heading shown before the message. */
  title?: string
  /** Body text, shown when no default slot is given. */
  message?: string
  /** Built-in leading glyph, or `false` to hide it. */
  icon?: MiFbIconName | false
  /** Text of the action button, which emits `action` on click; omitted when empty. */
  actionLabel?: string
  /** Adds a close button that emits `dismiss` (the parent decides whether to hide the banner). */
  dismissible?: boolean
  /** Accessible name of the close button. */
  dismissLabel?: string
  /** Stick to the top of the scroll container. */
  sticky?: boolean
}>(), {
  tone: 'primary',
  variant: 'tint',
  dismissLabel: 'Dismiss'
})

const emit = defineEmits<{
  action: []
  dismiss: []
}>()

const vars = computed(() => miFeedbackToneVars(props.tone))
const glyph = computed<MiFbIconName | null>(() => {
  if (props.icon === false) return null
  if (props.icon) return props.icon
  return ({ primary: 'info', secondary: 'info', success: 'success', warning: 'warning', danger: 'danger', neutral: 'info' } as const)[props.tone]
})
const role = computed(() => (props.tone === 'danger' ? 'alert' : 'status'))

defineSlots<{
  /** Replaces the leading glyph. */
  icon?(): unknown
  /** Message content; replaces the `message` prop. */
  default?(): unknown
  /** Replaces the action button, e.g. for a link or several buttons. */
  action?(): unknown
}>()
</script>

<template>
  <div class="mi-bnr mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:min-h-11 mi:pt-2 mi:pr-3 mi:pb-2 mi:pl-4 mi:font-mi mi:text-[14px] mi:leading-5 mi:tracking-[-.01em] mi:[border-bottom:.5px_solid_var(--mi-sep)] mi:[&.is-solid]:border-b-transparent mi:[&.is-sticky]:sticky mi:[&.is-sticky]:top-0 mi:[&.is-sticky]:z-5" :class="[`is-${variant}`, { 'is-sticky': sticky }]" :role="role" :style="vars">
    <span v-if="glyph || $slots.icon" class="mi-bnr-icon mi:[.mi-bnr.is-tint_&]:text-(--t-text) mi:flex-[none] mi:flex"><slot name="icon"><MiFbIcon v-if="glyph" :name="glyph" :size="18" :stroke="2" /></slot></span>
    <p class="mi-bnr-text mi:flex-1 mi:min-w-0 mi:m-0">
      <strong v-if="title" class="mi-bnr-title mi:font-semibold mi:mr-1.5">{{ title }}</strong>
      <span class="mi-bnr-msg mi:text-inherit mi:[.is-tint_&]:text-label2"><slot>{{ message }}</slot></span>
    </p>
    <span v-if="actionLabel || $slots.action" class="mi-bnr-action mi:flex-[none] mi:flex">
      <slot name="action"><button type="button" class="mi-bnr-btn mi:appearance-none mi:h-7 mi:py-0 mi:px-3 mi:m-0 mi:[border:0] mi:rounded-[999px] mi:[background:var(--mi-fill3)] mi:text-label mi:font-[inherit] mi:text-[13px] mi:font-semibold mi:cursor-pointer mi:[.is-solid_&]:[background:rgba(255,255,255,.22)] mi:[.is-solid_&]:text-inherit mi:active:opacity-60" @click="emit('action')">{{ actionLabel }}</button></slot>
    </span>
    <button v-if="dismissible" type="button" class="mi-bnr-x mi:appearance-none mi:flex-[none] mi:w-7 mi:h-7 mi:m-0 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:[background:transparent] mi:text-inherit mi:opacity-65 mi:flex mi:items-center mi:justify-center mi:cursor-pointer mi:hover:opacity-100 mi:active:opacity-50" :aria-label="dismissLabel" @click="emit('dismiss')">
      <MiFbIcon name="close" :size="14" :stroke="2.6" />
    </button>
  </div>
</template>

<style scoped>
.mi-bnr.is-tint{background:var(--t-bg);color:var(--mi-label)}
.mi-bnr.is-solid{background:var(--t-solid);color:var(--t-on)}
</style>

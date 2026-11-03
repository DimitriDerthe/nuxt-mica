<script lang="ts">
export type MiAlertTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'secondary'
</script>

<script setup lang="ts">
/** Inline callout for a status or error message inside a page or form; tones info, success, warning, danger, neutral, secondary. */
import { computed } from 'vue'
import MiFbIcon, { type MiFbIconName } from './MiFbIcon.vue'
import { miFeedbackToneVars, type MiFeedbackTone } from '../../utils/miOverlay'

const props = withDefaults(defineProps<{
  /** Colour and default glyph. `danger` is announced as an alert, other tones as a status. */
  tone?: MiAlertTone
  /** Bold heading above the message. */
  title?: string
  /** Body text, shown when no default slot is given. */
  message?: string
  /** Built-in glyph; defaults to one matching the tone. */
  icon?: MiFbIconName
  /** Text of the action button; the button is rendered only when set (or via the `action` slot) and emits `action` on click. */
  actionLabel?: string
  /** Adds a close button that hides the alert and emits `dismiss`. */
  dismissible?: boolean
  /** Accessible name of the close button. */
  dismissLabel?: string
}>(), {
  tone: 'info',
  dismissLabel: 'Dismiss'
})

const emit = defineEmits<{
  action: []
  dismiss: []
}>()

/** `v-model` controls visibility; dismissing sets it to false. */
const visible = defineModel<boolean>({ default: true })

const TONE: Record<MiAlertTone, MiFeedbackTone> = { info: 'primary', success: 'success', warning: 'warning', danger: 'danger', neutral: 'neutral', secondary: 'secondary' }
const ICON: Record<MiAlertTone, MiFbIconName> = { info: 'info', success: 'success', warning: 'warning', danger: 'danger', neutral: 'info', secondary: 'info' }

const vars = computed(() => miFeedbackToneVars(TONE[props.tone]))
const glyph = computed(() => props.icon ?? ICON[props.tone])
const role = computed(() => (props.tone === 'danger' ? 'alert' : 'status'))

function dismiss() {
  visible.value = false
  emit('dismiss')
}

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
  <Transition name="mi-alert">
    <div v-if="visible" class="mi-alert" :class="`is-${tone}`" :role="role" :style="vars">
      <span class="mi-alert-icon mi:flex-[none] mi:mt-px mi:flex mi:text-(--t-text)"><slot name="icon"><MiFbIcon :name="glyph" :size="20" :stroke="2" /></slot></span>
      <span class="mi-alert-body mi:flex-1 mi:min-w-0 mi:flex mi:flex-col mi:gap-0.5">
        <span v-if="title" class="mi-alert-title mi:text-[15px] mi:leading-5 mi:font-semibold">{{ title }}</span>
        <span v-if="message || $slots.default" class="mi-alert-msg mi:text-[14px] mi:leading-[19px] mi:text-label2"><slot>{{ message }}</slot></span>
      </span>
      <span v-if="actionLabel || $slots.action" class="mi-alert-action mi:flex-[none] mi:self-center mi:flex">
        <slot name="action"><button type="button" class="mi-alert-btn mi:appearance-none mi:h-7.5 mi:py-0 mi:px-3 mi:m-0 mi:[border:0] mi:rounded-[999px] mi:[background:var(--mi-fill3)] mi:text-label mi:font-[inherit] mi:text-[13px] mi:font-semibold mi:cursor-pointer mi:active:[background:var(--mi-fill2)]" @click="emit('action')">{{ actionLabel }}</button></slot>
      </span>
      <button v-if="dismissible" type="button" class="mi-alert-x mi:appearance-none mi:flex-[none] mi:w-7 mi:h-7 mi:m-0 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:[background:transparent] mi:text-label2 mi:flex mi:items-center mi:justify-center mi:cursor-pointer mi:hover:[background:var(--mi-fill4)] mi:active:[background:var(--mi-fill3)]" :aria-label="dismissLabel" @click="dismiss">
        <MiFbIcon name="close" :size="14" :stroke="2.6" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.mi-alert{display:flex;gap:12px;align-items:flex-start;padding:14px 10px 14px 16px;border-radius:14px;background:var(--t-bg);color:var(--mi-label);font-family:var(--mi-font);letter-spacing:-.01em}
.mi-alert-msg :deep(a){color:var(--t-text);text-decoration:none;font-weight:500}
.mi-alert-msg :deep(a:hover){text-decoration:underline}
.is-danger .mi-alert-btn{color:var(--t-text)}
.mi-alert-enter-active{transition:transform var(--mi-dur-3) var(--mi-spring),opacity var(--mi-dur-2) var(--mi-ease);will-change:transform,opacity}
.mi-alert-leave-active{transition:transform var(--mi-dur-2) var(--mi-ease),opacity var(--mi-dur-2) var(--mi-ease);will-change:transform,opacity}
.mi-alert-enter-from,.mi-alert-leave-to{opacity:0;transform:translate3d(0,-6px,0) scale(.98)}
</style>

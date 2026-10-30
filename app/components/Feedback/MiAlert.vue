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
      <span class="mi-alert-icon"><slot name="icon"><MiFbIcon :name="glyph" :size="20" :stroke="2" /></slot></span>
      <span class="mi-alert-body">
        <span v-if="title" class="mi-alert-title">{{ title }}</span>
        <span v-if="message || $slots.default" class="mi-alert-msg"><slot>{{ message }}</slot></span>
      </span>
      <span v-if="actionLabel || $slots.action" class="mi-alert-action">
        <slot name="action"><button type="button" class="mi-alert-btn" @click="emit('action')">{{ actionLabel }}</button></slot>
      </span>
      <button v-if="dismissible" type="button" class="mi-alert-x" :aria-label="dismissLabel" @click="dismiss">
        <MiFbIcon name="close" :size="14" :stroke="2.6" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.mi-alert{display:flex;gap:12px;align-items:flex-start;padding:14px 10px 14px 16px;border-radius:14px;background:var(--t-bg);color:var(--mi-label);font-family:var(--mi-font);letter-spacing:-.01em}
.mi-alert-icon{flex:none;margin-top:1px;display:flex;color:var(--t-text)}
.mi-alert-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.mi-alert-title{font-size:15px;line-height:20px;font-weight:600}
.mi-alert-msg{font-size:14px;line-height:19px;color:var(--mi-label2)}
.mi-alert-msg :deep(a){color:var(--t-text);text-decoration:none;font-weight:500}
.mi-alert-msg :deep(a:hover){text-decoration:underline}
.mi-alert-action{flex:none;align-self:center;display:flex}
.mi-alert-btn{appearance:none;height:30px;padding:0 12px;margin:0;border:0;border-radius:999px;background:var(--mi-fill3);color:var(--mi-label);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer}
.is-danger .mi-alert-btn{color:var(--t-text)}
.mi-alert-btn:active{background:var(--mi-fill2)}
.mi-alert-x{appearance:none;flex:none;width:28px;height:28px;margin:0;padding:0;border:0;border-radius:50%;background:transparent;color:var(--mi-label2);display:flex;align-items:center;justify-content:center;cursor:pointer}
.mi-alert-x:hover{background:var(--mi-fill4)}
.mi-alert-x:active{background:var(--mi-fill3)}
.mi-alert-enter-active{transition:transform var(--mi-dur-3) var(--mi-spring),opacity var(--mi-dur-2) var(--mi-ease);will-change:transform,opacity}
.mi-alert-leave-active{transition:transform var(--mi-dur-2) var(--mi-ease),opacity var(--mi-dur-2) var(--mi-ease);will-change:transform,opacity}
.mi-alert-enter-from,.mi-alert-leave-to{opacity:0;transform:translate3d(0,-6px,0) scale(.98)}
</style>

<script setup lang="ts">
/** Single transient message pill with tone, optional description and action; rendered by MiToaster, show one via useMiToast. */
import { computed } from 'vue'
import MiSpinner from './MiSpinner.vue'

type ToastTone = 'neutral' | 'success' | 'error' | 'warning' | 'info' | 'loading'

const props = withDefaults(defineProps<{
  /** Main text of the toast. */
  message: string
  /** Smaller second line under the message. */
  description?: string
  /** Icon and colour. `loading` shows a spinner, `error` is announced as an alert. */
  tone?: ToastTone
  /** `solid` is the inverted pill, `material` the blurred one. */
  variant?: 'solid' | 'material'
  /** Text of the action button, which emits `action`; omitted when empty. */
  actionLabel?: string
  /** Adds a close button that emits `dismiss`. */
  dismissible?: boolean
  /** Accessible name of the close button. */
  dismissLabel?: string
}>(), {
  tone: 'neutral',
  variant: 'solid',
  dismissLabel: 'Dismiss'
})

const emit = defineEmits<{
  action: []
  dismiss: []
}>()

const role = computed(() => (props.tone === 'error' ? 'alert' : 'status'))

defineSlots<{
  /** Replaces the tone icon or spinner. */
  icon?(): unknown
  /** Replaces the action button, e.g. for a custom control. */
  action?(): unknown
}>()
</script>

<template>
  <div class="mi-toast" :class="[`is-${variant}`, { 'has-desc': description, 'has-action': actionLabel || $slots.action }]" :role="role">
    <span v-if="tone !== 'neutral' || $slots.icon" class="mi-toast-icon">
      <slot name="icon">
        <MiSpinner v-if="tone === 'loading'" :size="18" label="" />
        <svg v-else-if="tone === 'success'" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" fill="var(--mi-green)" />
          <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else-if="tone === 'error'" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" fill="var(--mi-red)" />
          <path d="M12 7.5v5.5M12 16.4v.2" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" />
        </svg>
        <svg v-else-if="tone === 'warning'" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.5l9.5 16.5h-19z" fill="var(--mi-orange)" stroke="var(--mi-orange)" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M12 10v4.5M12 17.2v.2" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" />
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" fill="var(--mi-blue)" />
          <path d="M12 11v5.5M12 7.8v.2" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" />
        </svg>
      </slot>
    </span>
    <span class="mi-toast-text">
      <span class="mi-toast-msg">{{ message }}</span>
      <span v-if="description" class="mi-toast-desc">{{ description }}</span>
    </span>
    <slot name="action">
      <button v-if="actionLabel" type="button" class="mi-toast-act" @click="emit('action')">{{ actionLabel }}</button>
    </slot>
    <button v-if="dismissible" type="button" class="mi-toast-x" :aria-label="dismissLabel" @click="emit('dismiss')">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  </div>
</template>

<style scoped>
.mi-toast{box-sizing:border-box;display:inline-flex;align-items:center;gap:10px;min-height:48px;max-width:min(520px,calc(100vw - 32px));padding:0 18px;border-radius:999px;font-family:var(--mi-font);font-size:15px;line-height:20px;font-weight:500;letter-spacing:-.01em}
.mi-toast.is-solid{background:var(--mi-toast,var(--mi-label));color:var(--mi-toast-fg,var(--mi-card));box-shadow:var(--mi-sh3)}
.mi-toast.is-material{background:var(--mi-mat);color:var(--mi-label);-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);box-shadow:var(--mi-sh2)}
.mi-toast.has-action,.mi-toast:has(.mi-toast-x){padding-right:8px}
.mi-toast.has-desc{padding-top:10px;padding-bottom:10px;border-radius:24px}
.mi-toast-icon{flex:none;display:flex;align-items:center}
.mi-toast-text{display:flex;flex-direction:column;min-width:0}
.mi-toast-desc{font-size:13px;font-weight:400;opacity:.72}
.mi-toast-act{appearance:none;flex:none;height:34px;padding:0 12px;margin:0;border:0;border-radius:999px;background:transparent;color:inherit;font-family:inherit;font-size:15px;font-weight:600;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.mi-toast-act:active{opacity:.6}
.mi-toast-x{appearance:none;flex:none;width:28px;height:28px;margin:0;padding:0;border:0;border-radius:50%;background:transparent;color:inherit;opacity:.6;display:flex;align-items:center;justify-content:center;cursor:pointer}
.mi-toast-x:hover{opacity:1}
.mi-toast :focus-visible{outline-color:currentColor}
</style>

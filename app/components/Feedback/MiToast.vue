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
  <div class="mi-toast mi:box-border mi:inline-flex mi:items-center mi:gap-2.5 mi:min-h-12 mi:max-w-[min(520px,calc(100vw_-_32px))] mi:py-0 mi:px-4.5 mi:rounded-[999px] mi:font-mi mi:text-[15px] mi:leading-5 mi:font-medium mi:tracking-[-.01em] mi:[&.has-desc]:pt-2.5 mi:[&.has-desc]:pb-2.5 mi:[&.has-desc]:rounded-[24px]" :class="[`is-${variant}`, { 'has-desc': description, 'has-action': actionLabel || $slots.action }]" :role="role">
    <span v-if="tone !== 'neutral' || $slots.icon" class="mi-toast-icon mi:flex-[none] mi:flex mi:items-center">
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
    <span class="mi-toast-text mi:flex mi:flex-col mi:min-w-0">
      <span class="mi-toast-msg">{{ message }}</span>
      <span v-if="description" class="mi-toast-desc mi:text-[13px] mi:font-normal mi:opacity-72">{{ description }}</span>
    </span>
    <slot name="action">
      <button v-if="actionLabel" type="button" class="mi-toast-act mi:appearance-none mi:flex-[none] mi:h-8.5 mi:py-0 mi:px-3 mi:m-0 mi:[border:0] mi:rounded-[999px] mi:[background:transparent] mi:text-inherit mi:font-[inherit] mi:text-[15px] mi:font-semibold mi:[text-decoration:underline] mi:underline-offset-[3px] mi:cursor-pointer mi:active:opacity-60" @click="emit('action')">{{ actionLabel }}</button>
    </slot>
    <button v-if="dismissible" type="button" class="mi-toast-x mi:appearance-none mi:flex-[none] mi:w-7 mi:h-7 mi:m-0 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:[background:transparent] mi:text-inherit mi:opacity-60 mi:flex mi:items-center mi:justify-center mi:cursor-pointer mi:hover:opacity-100" :aria-label="dismissLabel" @click="emit('dismiss')">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  </div>
</template>

<style scoped>
.mi-toast.is-solid{background:var(--mi-toast,var(--mi-label));color:var(--mi-toast-fg,var(--mi-card));box-shadow:var(--mi-sh3)}
.mi-toast.is-material{background:var(--mi-mat);color:var(--mi-label);-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);box-shadow:var(--mi-sh2)}
.mi-toast.has-action,.mi-toast:has(.mi-toast-x){padding-right:8px}
.mi-toast :focus-visible{outline-color:currentColor}
</style>

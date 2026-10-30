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
  <div class="mi-bnr" :class="[`is-${variant}`, { 'is-sticky': sticky }]" :role="role" :style="vars">
    <span v-if="glyph || $slots.icon" class="mi-bnr-icon"><slot name="icon"><MiFbIcon v-if="glyph" :name="glyph" :size="18" :stroke="2" /></slot></span>
    <p class="mi-bnr-text">
      <strong v-if="title" class="mi-bnr-title">{{ title }}</strong>
      <span class="mi-bnr-msg"><slot>{{ message }}</slot></span>
    </p>
    <span v-if="actionLabel || $slots.action" class="mi-bnr-action">
      <slot name="action"><button type="button" class="mi-bnr-btn" @click="emit('action')">{{ actionLabel }}</button></slot>
    </span>
    <button v-if="dismissible" type="button" class="mi-bnr-x" :aria-label="dismissLabel" @click="emit('dismiss')">
      <MiFbIcon name="close" :size="14" :stroke="2.6" />
    </button>
  </div>
</template>

<style scoped>
.mi-bnr{display:flex;align-items:center;gap:10px;width:100%;min-height:44px;padding:8px 12px 8px 16px;font-family:var(--mi-font);font-size:14px;line-height:20px;letter-spacing:-.01em;border-bottom:.5px solid var(--mi-sep)}
.mi-bnr.is-tint{background:var(--t-bg);color:var(--mi-label)}
.mi-bnr.is-tint .mi-bnr-icon{color:var(--t-text)}
.mi-bnr.is-solid{background:var(--t-solid);color:var(--t-on);border-bottom-color:transparent}
.mi-bnr.is-sticky{position:sticky;top:0;z-index:5}
.mi-bnr-icon{flex:none;display:flex}
.mi-bnr-text{flex:1;min-width:0;margin:0}
.mi-bnr-title{font-weight:600;margin-right:6px}
.mi-bnr-msg{color:inherit}
.is-tint .mi-bnr-msg{color:var(--mi-label2)}
.mi-bnr-action{flex:none;display:flex}
.mi-bnr-btn{appearance:none;height:28px;padding:0 12px;margin:0;border:0;border-radius:999px;background:var(--mi-fill3);color:var(--mi-label);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer}
.is-solid .mi-bnr-btn{background:rgba(255,255,255,.22);color:inherit}
.mi-bnr-btn:active{opacity:.6}
.mi-bnr-x{appearance:none;flex:none;width:28px;height:28px;margin:0;padding:0;border:0;border-radius:50%;background:transparent;color:inherit;opacity:.65;display:flex;align-items:center;justify-content:center;cursor:pointer}
.mi-bnr-x:hover{opacity:1}
.mi-bnr-x:active{opacity:.5}
</style>

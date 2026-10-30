<script setup lang="ts">
/** One notification row (app tile, title, message, time) for inbox-style feeds; `interactive` turns it into a button. */
import { computed } from 'vue'
import MiFbIcon, { type MiFbIconName } from './MiFbIcon.vue'
import { miFeedbackToneVars, type MiFeedbackTone } from '../../utils/miOverlay'

const props = withDefaults(defineProps<{
  /** Bold first line of the notification. */
  title: string
  /** Body text under the title, shown when no default slot is given. */
  message?: string
  /** Timestamp text such as `now` or `2 min ago`. */
  time?: string
  /** Built-in glyph shown in the app tile. Use the `icon` slot for anything else. */
  icon?: MiFbIconName
  /** Colour of the app tile. */
  tone?: MiFeedbackTone
  /** Adds a dismiss button. */
  dismissible?: boolean
  /** Accessible name of the dismiss button. */
  dismissLabel?: string
  /** Makes the whole notification a button that emits `click`. */
  interactive?: boolean
  /** `status` announces politely, `alert` interrupts. */
  live?: 'status' | 'alert' | 'off'
}>(), {
  icon: 'bell',
  tone: 'primary',
  dismissLabel: 'Dismiss',
  live: 'status'
})

const emit = defineEmits<{
  click: [e: MouseEvent]
  dismiss: []
}>()

const vars = computed(() => miFeedbackToneVars(props.tone))
const role = computed(() => (props.live === 'off' ? undefined : props.live))

defineSlots<{
  /** Custom content for the app tile, replacing the `icon` glyph. */
  icon?(): unknown
  /** Timestamp content; replaces the `time` prop. */
  time?(): unknown
  /** Message content; replaces the `message` prop. */
  default?(): unknown
  /** Row of buttons under the message. Hidden when not provided. */
  actions?(): unknown
}>()
</script>

<template>
  <div class="mi-ntf" :class="{ 'is-interactive': interactive }" :role="role" :style="vars">
    <component :is="interactive ? 'button' : 'div'" class="mi-ntf-main" :type="interactive ? 'button' : undefined" @click="interactive ? emit('click', $event) : undefined">
      <span class="mi-ntf-tile" aria-hidden="true">
        <slot name="icon"><MiFbIcon :name="icon" :size="22" /></slot>
      </span>
      <span class="mi-ntf-body">
        <span class="mi-ntf-head">
          <span class="mi-ntf-title">{{ title }}</span>
          <span v-if="time || $slots.time" class="mi-ntf-time"><slot name="time">{{ time }}</slot></span>
        </span>
        <span v-if="message || $slots.default" class="mi-ntf-msg"><slot>{{ message }}</slot></span>
      </span>
    </component>
    <div v-if="$slots.actions" class="mi-ntf-actions"><slot name="actions" /></div>
    <button v-if="dismissible" type="button" class="mi-ntf-x" :aria-label="dismissLabel" @click="emit('dismiss')">
      <MiFbIcon name="close" :size="12" :stroke="2.6" />
    </button>
  </div>
</template>

<style scoped>
.mi-ntf{position:relative;border-radius:18px;background:var(--mi-mat);-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);box-shadow:var(--mi-sh2);color:var(--mi-label);font-family:var(--mi-font);letter-spacing:-.01em}
.mi-ntf-main{appearance:none;display:flex;gap:12px;width:100%;margin:0;padding:14px;border:0;border-radius:inherit;background:transparent;color:inherit;font:inherit;text-align:left}
button.mi-ntf-main{cursor:pointer}
.is-interactive:active{opacity:.82}
.mi-ntf-tile{width:38px;height:38px;flex:none;border-radius:10px;background:var(--t-solid);color:var(--t-on);display:flex;align-items:center;justify-content:center}
.mi-ntf-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.mi-ntf-head{display:flex;justify-content:space-between;gap:8px}
.mi-ntf-title{font-size:15px;line-height:20px;font-weight:600;min-width:0}
.mi-ntf-time{flex:none;font-size:13px;line-height:20px;color:var(--mi-label2)}
.mi-ntf-msg{font-size:15px;line-height:20px;color:var(--mi-label2)}
.mi-ntf-actions{display:flex;gap:8px;padding:0 14px 14px 64px}
.mi-ntf-x{appearance:none;position:absolute;top:-8px;left:-8px;width:24px;height:24px;margin:0;padding:0;border:0;border-radius:50%;background:var(--mi-elev);color:var(--mi-label2);box-shadow:var(--mi-sh2);display:flex;align-items:center;justify-content:center;cursor:pointer}
.mi-ntf-x:active{opacity:.6}
</style>

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
      <span class="mi-ntf-tile mi:w-9.5 mi:h-9.5 mi:flex-[none] mi:rounded-[10px] mi:[background:var(--t-solid)] mi:text-(--t-on) mi:flex mi:items-center mi:justify-center" aria-hidden="true">
        <slot name="icon"><MiFbIcon :name="icon" :size="22" /></slot>
      </span>
      <span class="mi-ntf-body mi:flex-1 mi:min-w-0 mi:flex mi:flex-col mi:gap-0.5">
        <span class="mi-ntf-head mi:flex mi:justify-between mi:gap-2">
          <span class="mi-ntf-title mi:text-[15px] mi:leading-5 mi:font-semibold mi:min-w-0">{{ title }}</span>
          <span v-if="time || $slots.time" class="mi-ntf-time mi:flex-[none] mi:text-[13px] mi:leading-5 mi:text-label2"><slot name="time">{{ time }}</slot></span>
        </span>
        <span v-if="message || $slots.default" class="mi-ntf-msg mi:text-[15px] mi:leading-5 mi:text-label2"><slot>{{ message }}</slot></span>
      </span>
    </component>
    <div v-if="$slots.actions" class="mi-ntf-actions mi:flex mi:gap-2 mi:pt-0 mi:pr-3.5 mi:pb-3.5 mi:pl-16"><slot name="actions" /></div>
    <button v-if="dismissible" type="button" class="mi-ntf-x mi:appearance-none mi:absolute mi:-top-2 mi:-left-2 mi:w-6 mi:h-6 mi:m-0 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:[background:var(--mi-elev)] mi:text-label2 mi:shadow-2 mi:flex mi:items-center mi:justify-center mi:cursor-pointer mi:active:opacity-60" :aria-label="dismissLabel" @click="emit('dismiss')">
      <MiFbIcon name="close" :size="12" :stroke="2.6" />
    </button>
  </div>
</template>

<style scoped>
.mi-ntf{position:relative;border-radius:18px;background:var(--mi-mat);-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);box-shadow:var(--mi-sh2);color:var(--mi-label);font-family:var(--mi-font);letter-spacing:-.01em}
.mi-ntf-main{appearance:none;display:flex;gap:12px;width:100%;margin:0;padding:14px;border:0;border-radius:inherit;background:transparent;color:inherit;font:inherit;text-align:left}
button.mi-ntf-main{cursor:pointer}
.is-interactive:active{opacity:.82}
</style>

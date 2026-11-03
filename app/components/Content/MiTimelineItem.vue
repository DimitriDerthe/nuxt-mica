<script setup lang="ts">
/** One entry of a MiTimeline: a marker (dot or icon) on the connecting line, a title, an optional time and description, and free content in the default slot. */
import { computed } from 'vue'
import MiIcon from '../Base/MiIcon.vue'
import type { MiIconName } from '../../utils/miIcons'

export type MiTimelineTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
export type MiTimelineStatus = 'done' | 'current' | 'upcoming'

defineSlots<{
  /** Extra content under the description (attachments, buttons, a comment). */
  default?(): unknown
  /** Replaces the title text. */
  title?(): unknown
  /** Replaces the time text. */
  time?(): unknown
  /** Replaces the marker contents (the icon or dot). */
  marker?(): unknown
}>()

const props = withDefaults(defineProps<{
  /** Heading of the entry. */
  title?: string
  /** Supporting text under the title. */
  description?: string
  /** When it happened: display text, or a Date (shown as YYYY-MM-DD). */
  time?: string | Date
  /** Machine-readable value of the `<time>` element; derived from `time` when that is a Date or an ISO string. */
  datetime?: string
  /** Icon shown in the marker; without it the marker is a dot. */
  icon?: MiIconName
  /** Color of the marker. */
  tone?: MiTimelineTone
  /** `done` is filled, `current` is highlighted and marked with `aria-current="step"`, `upcoming` is hollow and dimmed. */
  status?: MiTimelineStatus
}>(), { tone: 'primary', status: 'done' })

const COLORS: Record<MiTimelineTone, string> = {
  neutral: 'var(--mi-ctl)',
  primary: 'var(--mi-p)',
  success: 'var(--mi-green)',
  warning: 'var(--mi-orange)',
  danger: 'var(--mi-red)',
  info: 'var(--mi-blue)'
}
const text = computed(() => props.time instanceof Date ? props.time.toISOString().slice(0, 10) : props.time)
const stamp = computed(() => {
  if (props.datetime) return props.datetime
  if (props.time instanceof Date) return props.time.toISOString()
  return typeof props.time === 'string' && /^\d{4}-\d{2}-\d{2}/.test(props.time) ? props.time : undefined
})
</script>

<template>
  <li class="mi-tli mi:relative mi:[list-style:none] mi:grid-cols-[32px_minmax(0,1fr)] mi:font-mi mi:@[640px]/mi-tl:[.is-alternate>&]:grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)]" :class="`is-${status}`" :style="{ '--mi-tl-c': COLORS[tone] }" :aria-current="status === 'current' ? 'step' : undefined">
    <span class="mi-tli__rail mi:relative mi:col-[1] mi:flex mi:justify-center mi:after:content-[''] mi:after:absolute mi:after:top-9 mi:after:bottom-1 mi:after:left-[calc(50%_-_1px)] mi:after:w-0.5 mi:after:rounded-[1px] mi:after:[background:var(--mi-sep2)] mi:[.mi-tli:last-child_&]:after:hidden mi:@[640px]/mi-tl:[.is-alternate>.mi-tli_&]:col-[2] mi:@[640px]/mi-tl:[.is-alternate>.mi-tli_&]:row-[1]" aria-hidden="true">
      <span class="mi-tli__marker mi:relative mi:z-1 mi:w-8 mi:h-8 mi:rounded-[50%] mi:flex mi:items-center mi:justify-center mi:text-(--mi-tl-c) mi:[background:color-mix(in_srgb,var(--mi-tl-c)_16%,var(--mi-card))] mi:shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--mi-tl-c)_45%,transparent)] mi:[.is-done_&]:[background:var(--mi-tl-c)] mi:[.is-done_&]:text-card mi:[.is-done_&]:shadow-none mi:[.is-upcoming_&]:[background:var(--mi-card)] mi:[.is-upcoming_&]:shadow-[inset_0_0_0_1.5px_var(--mi-sep2)] mi:[.is-upcoming_&]:text-label3 mi:[.is-current_&]:before:content-[''] mi:[.is-current_&]:before:absolute mi:[.is-current_&]:before:inset-0 mi:[.is-current_&]:before:rounded-[50%] mi:[.is-current_&]:before:shadow-[0_0_0_4px_color-mix(in_srgb,var(--mi-tl-c)_22%,transparent)]">
        <slot name="marker">
          <MiIcon v-if="icon" :name="icon" :size="16" :weight="2.2" />
          <span v-else class="mi-tli__dot mi:w-2.5 mi:h-2.5 mi:rounded-[50%] mi:[background:var(--mi-tl-c)] mi:[.is-done_&]:[background:var(--mi-card)] mi:[.is-upcoming_&]:[background:var(--mi-label3)]" />
        </slot>
      </span>
    </span>
    <div class="mi-tli__body mi:col-[2] mi:min-w-0 mi:pt-1 mi:px-0 mi:pb-6.5 mi:[.mi-tli:last-child_&]:pb-1 mi:@[640px]/mi-tl:[.is-alternate>.mi-tli_&]:col-[3] mi:@[640px]/mi-tl:[.is-alternate>.mi-tli_&]:row-[1] mi:@[640px]/mi-tl:[.is-alternate>.mi-tli:nth-child(even)_&]:col-[1] mi:@[640px]/mi-tl:[.is-alternate>.mi-tli:nth-child(even)_&]:text-right">
      <component :is="stamp ? 'time' : 'span'" v-if="text || $slots.time" class="mi-tli__time" :datetime="stamp">
        <slot name="time">{{ text }}</slot>
      </component>
      <p v-if="title || $slots.title" class="mi-tli__title mi:m-0 mi:text-[15px] mi:leading-[22px] mi:font-semibold mi:text-label mi:[.is-upcoming_&]:text-label2"><slot name="title">{{ title }}</slot></p>
      <p v-if="description" class="mi-tli__desc mi:mt-0.5 mi:mx-0 mi:mb-0 mi:text-[14px] mi:leading-[21px] mi:text-label2">{{ description }}</p>
      <div v-if="$slots.default" class="mi-tli__extra mi:mt-2.5 mi:text-[14px] mi:text-label"><slot /></div>
    </div>
  </li>
</template>

<style scoped>
.mi-tli{display:grid;column-gap:14px}
.is-current .mi-tli__marker::before{animation:mi-tli-pulse 2.2s var(--mi-ease) infinite}
@keyframes mi-tli-pulse{0%{opacity:1;transform:scale(1)}70%,100%{opacity:0;transform:scale(1.35)}}
@media (prefers-reduced-motion:reduce){.is-current .mi-tli__marker::before{animation:none}}
.mi-tli__time{display:block;font-size:12px;font-weight:600;letter-spacing:.02em;color:var(--mi-label2);font-variant-numeric:tabular-nums;margin-bottom:2px}
/* Alternating layout: the owning MiTimeline sets .is-alternate and, at wide container widths, the rail moves to the center. */
@container mi-tl (min-width:640px){
  .is-alternate > .mi-tli{column-gap:20px}
}
</style>

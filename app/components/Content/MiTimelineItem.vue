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
  <li class="mi-tli" :class="`is-${status}`" :style="{ '--mi-tl-c': COLORS[tone] }" :aria-current="status === 'current' ? 'step' : undefined">
    <span class="mi-tli__rail" aria-hidden="true">
      <span class="mi-tli__marker">
        <slot name="marker">
          <MiIcon v-if="icon" :name="icon" :size="16" :weight="2.2" />
          <span v-else class="mi-tli__dot" />
        </slot>
      </span>
    </span>
    <div class="mi-tli__body">
      <component :is="stamp ? 'time' : 'span'" v-if="text || $slots.time" class="mi-tli__time" :datetime="stamp">
        <slot name="time">{{ text }}</slot>
      </component>
      <p v-if="title || $slots.title" class="mi-tli__title"><slot name="title">{{ title }}</slot></p>
      <p v-if="description" class="mi-tli__desc">{{ description }}</p>
      <div v-if="$slots.default" class="mi-tli__extra"><slot /></div>
    </div>
  </li>
</template>

<style scoped>
.mi-tli{position:relative;list-style:none;display:grid;grid-template-columns:32px minmax(0,1fr);column-gap:14px;font-family:var(--mi-font)}
.mi-tli__rail{position:relative;grid-column:1;display:flex;justify-content:center}
.mi-tli__rail::after{content:'';position:absolute;top:36px;bottom:4px;left:calc(50% - 1px);width:2px;border-radius:1px;background:var(--mi-sep2)}
.mi-tli:last-child .mi-tli__rail::after{display:none}
.mi-tli__marker{position:relative;z-index:1;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--mi-tl-c);background:color-mix(in srgb,var(--mi-tl-c) 16%,var(--mi-card));box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--mi-tl-c) 45%,transparent)}
.mi-tli__dot{width:10px;height:10px;border-radius:50%;background:var(--mi-tl-c)}
.is-done .mi-tli__marker{background:var(--mi-tl-c);color:var(--mi-card);box-shadow:none}
.is-done .mi-tli__dot{background:var(--mi-card)}
.is-upcoming .mi-tli__marker{background:var(--mi-card);box-shadow:inset 0 0 0 1.5px var(--mi-sep2);color:var(--mi-label3)}
.is-upcoming .mi-tli__dot{background:var(--mi-label3)}
.is-current .mi-tli__marker::before{content:'';position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 4px color-mix(in srgb,var(--mi-tl-c) 22%,transparent);animation:mi-tli-pulse 2.2s var(--mi-ease) infinite}
@keyframes mi-tli-pulse{0%{opacity:1;transform:scale(1)}70%,100%{opacity:0;transform:scale(1.35)}}
@media (prefers-reduced-motion:reduce){.is-current .mi-tli__marker::before{animation:none}}
.mi-tli__body{grid-column:2;min-width:0;padding:4px 0 26px}
.mi-tli:last-child .mi-tli__body{padding-bottom:4px}
.mi-tli__time{display:block;font-size:12px;font-weight:600;letter-spacing:.02em;color:var(--mi-label2);font-variant-numeric:tabular-nums;margin-bottom:2px}
.mi-tli__title{margin:0;font-size:15px;line-height:22px;font-weight:600;color:var(--mi-label)}
.is-upcoming .mi-tli__title{color:var(--mi-label2)}
.mi-tli__desc{margin:2px 0 0;font-size:14px;line-height:21px;color:var(--mi-label2)}
.mi-tli__extra{margin-top:10px;font-size:14px;color:var(--mi-label)}
/* Alternating layout: the owning MiTimeline sets .is-alternate and, at wide container widths, the rail moves to the center. */
@container mi-tl (min-width:640px){
  .is-alternate > .mi-tli{grid-template-columns:minmax(0,1fr) 32px minmax(0,1fr);column-gap:20px}
  .is-alternate > .mi-tli .mi-tli__rail{grid-column:2;grid-row:1}
  .is-alternate > .mi-tli .mi-tli__body{grid-column:3;grid-row:1}
  .is-alternate > .mi-tli:nth-child(even) .mi-tli__body{grid-column:1;text-align:right}
}
</style>

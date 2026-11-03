<script setup lang="ts">
/** Trace container for reasoning, tool calls and sources; compose MiTraceLine rows or pass a `steps` shortcut. */
import MiIcon from '../Base/MiIcon.vue'
import MiOrb from './MiOrb.vue'
import MiTraceLine from './MiTraceLine.vue'
import MiTraceIcon from './MiTraceIcon.vue'
import MiTraceTitle from './MiTraceTitle.vue'
import MiTraceDescription from './MiTraceDescription.vue'
import MiTraceCollapsible from './MiTraceCollapsible.vue'
import MiTraceCollapsibleTrigger from './MiTraceCollapsibleTrigger.vue'
import MiTraceCollapsibleContent from './MiTraceCollapsibleContent.vue'

export interface MiTraceStep {
  id?: string
  title: string
  /** Secondary text such as a count or tool name. */
  description?: string
  status?: 'done' | 'running' | 'error' | 'pending'
  /** Duration in milliseconds. */
  duration?: number
  /** Collapsible detail text. */
  detail?: string
  /** Start expanded. */
  open?: boolean
}

defineProps<{
  /** Shortcut steps, rendered when no default slot is given. */
  steps?: MiTraceStep[]
  /** Accessible name of the list. */
  label?: string
}>()

const st = (s: MiTraceStep) => s.status ?? 'done'
const lineStatus = (s: MiTraceStep) => { const v = st(s); return v === 'done' ? undefined : v }
function dur(ms?: number) {
  if (ms === undefined) return ''
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`
}

defineSlots<{
  /** Custom trace content built from MiTraceLine and MiTraceCollapsible rows; replaces the rows generated from `steps`. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-tr mi:flex-col mi:font-mi mi:text-label mi:text-[14px]" role="list" :aria-label="label || 'Trace'">
    <slot>
      <div v-for="(s, i) in steps" :key="s.id ?? i" role="listitem">
        <component :is="s.detail ? MiTraceCollapsible : 'div'" v-bind="s.detail ? { defaultOpen: !!s.open } : {}">
          <component :is="s.detail ? MiTraceCollapsibleTrigger : 'div'">
            <MiTraceLine :status="lineStatus(s)">
              <MiTraceIcon>
                <MiOrb v-if="st(s) === 'running'" state="working" :size="16" label="" />
                <MiIcon v-else-if="st(s) === 'error'" name="x-circle-fill" :size="14" />
                <MiIcon v-else-if="st(s) === 'done'" name="check-circle-fill" :size="14" />
                <MiIcon v-else name="dash" :size="14" />
              </MiTraceIcon>
              <MiTraceTitle>{{ s.title }}</MiTraceTitle>
              <MiTraceDescription v-if="s.description">{{ s.description }}</MiTraceDescription>
              <MiTraceDescription v-if="s.duration !== undefined">{{ dur(s.duration) }}</MiTraceDescription>
              <span class="mi-tr__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">{{ st(s) }}</span>
            </MiTraceLine>
          </component>
          <MiTraceCollapsibleContent v-if="s.detail"><pre class="mi-tr__detail mi:m-0 mi:py-2 mi:px-2.5 mi:rounded-[8px] mi:bg-p-tint mi:[font:12px/1.5_ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:whitespace-pre-wrap mi:wrap-anywhere">{{ s.detail }}</pre></MiTraceCollapsibleContent>
        </component>
      </div>
    </slot>
  </div>
</template>

<style scoped>
.mi-tr { display: flex; gap: 2px; }
.mi-tr :deep(.mi-tr__line) { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px; }
.mi-tr :deep(.mi-tr__line.is-pending) { opacity: .5; }
.mi-tr :deep(.mi-tr__line.is-running .mi-tr__title) { font-weight: 600; }
.mi-tr :deep(.mi-tr__line.is-error) { color: var(--mi-s-text); }
.mi-tr :deep(.mi-tr__icon) { display: grid; place-items: center; color: var(--mi-p-text); }
.mi-tr :deep(.mi-tr__line.is-error .mi-tr__icon) { color: inherit; }
.mi-tr :deep(.mi-tr__title) { font-weight: 500; }
.mi-tr :deep(.mi-tr__desc) { opacity: .6; font-size: 12px; font-variant-numeric: tabular-nums; }
.mi-tr :deep(.mi-tr__trigger) { display: block; width: 100%; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; border-radius: 8px; }
.mi-tr :deep(.mi-tr__trigger:hover) { background: var(--mi-p-tint); }
.mi-tr :deep(.mi-tr__trigger:focus-visible) { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.mi-tr :deep(.mi-tr__content) { margin: 2px 0 6px 30px; font-size: 13px; }
</style>

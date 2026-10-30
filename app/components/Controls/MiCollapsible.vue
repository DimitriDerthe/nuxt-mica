<script setup lang="ts">
/** Show/hide a region with a trigger button. v-model `open`; `trigger` and default (content) slots; chevron and reveal animate with transform/opacity. */
import { useId } from 'vue'

defineSlots<{
  /** Custom trigger content, given the open state; replaces the title and chevron. */
  trigger?(props: { open: boolean }): unknown
  /** Content revealed when the section is open. */
  default?(): unknown
}>()

const props = defineProps<{
  /** Text of the default trigger when the `trigger` slot is not used. */
  title?: string
  /** Blocks toggling; the content stays in its current state. */
  disabled?: boolean
}>()

/** Whether the content is shown. */
const open = defineModel<boolean>('open', { default: false })
const uid = useId()

function toggle() {
  if (!props.disabled) open.value = !open.value
}
</script>

<template>
  <div class="mi-collapsible" :class="{ 'is-open': open }" :data-state="open ? 'open' : 'closed'">
    <button
      type="button"
      class="mi-collapsible__trigger"
      :aria-expanded="open"
      :aria-controls="`${uid}-content`"
      :disabled="disabled"
      @click="toggle"
    >
      <slot name="trigger" :open="open">
        <span class="mi-collapsible__title">{{ title }}</span>
        <svg class="mi-collapsible__chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </slot>
    </button>
    <div :id="`${uid}-content`" class="mi-collapsible__wrap" role="region" :hidden="!open ? true : undefined">
      <div class="mi-collapsible__inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.mi-collapsible { font-family: var(--mi-font); color: var(--mi-label); }
.mi-collapsible__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  text-align: start;
  cursor: pointer;
  border-radius: 8px;
  -webkit-tap-highlight-color: transparent;
}
.mi-collapsible__trigger:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.mi-collapsible__trigger:disabled { opacity: .4; cursor: default; }
.mi-collapsible__chev { flex: none; color: var(--mi-label2); transition: transform var(--mi-dur-3) var(--mi-spring); }
.is-open .mi-collapsible__chev { transform: rotate(180deg); }

/* Closed content is removed via [hidden]; opening fades and slides it in (transform/opacity only). */
.mi-collapsible__inner { padding: 4px 0 8px; }
.is-open .mi-collapsible__inner { animation: mi-collapsible-in var(--mi-dur-3) var(--mi-ease) both; }
@keyframes mi-collapsible-in {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: none; }
}
</style>

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
  <div class="mi-collapsible mi:font-mi" :class="{ 'is-open': open }" :data-state="open ? 'open' : 'closed'">
    <button
      type="button"
      class="mi-collapsible__trigger mi:flex mi:items-center mi:justify-between mi:gap-3 mi:w-full mi:py-2 mi:px-0 mi:[border:0] mi:bg-transparent mi:text-inherit mi:text-start mi:cursor-pointer mi:rounded-[8px] mi:[-webkit-tap-highlight-color:transparent] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:disabled:opacity-40 mi:disabled:cursor-default"
      :aria-expanded="open"
      :aria-controls="`${uid}-content`"
      :disabled="disabled"
      @click="toggle"
    >
      <slot name="trigger" :open="open">
        <span class="mi-collapsible__title">{{ title }}</span>
        <svg class="mi-collapsible__chev mi:flex-[none] mi:text-label2 mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:[.is-open_&]:transform-[rotate(180deg)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </slot>
    </button>
    <div :id="`${uid}-content`" class="mi-collapsible__wrap" role="region" :hidden="!open ? true : undefined">
      <div class="mi-collapsible__inner mi:pt-1 mi:px-0 mi:pb-2">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.mi-collapsible { color: var(--mi-label); }
.mi-collapsible__trigger {
  font: inherit;
  font-size: 15px;
  font-weight: 600;
}
.is-open .mi-collapsible__inner { animation: mi-collapsible-in var(--mi-dur-3) var(--mi-ease) both; }
@keyframes mi-collapsible-in {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: none; }
}
</style>

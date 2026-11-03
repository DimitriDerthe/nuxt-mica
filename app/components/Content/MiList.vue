<script setup lang="ts">
/** Grouped list container with optional header and footer for MiListItem rows. Use for settings or menus; `grouped` false for a bare list. */
import { useSlots } from 'vue'

defineSlots<{
  /** Custom heading replacing the `header` text. */
  header?(): unknown
  /** The list rows, normally `MiListItem` elements. */
  default?(): unknown
  /** Custom helper text replacing the `footer` text. */
  footer?(): unknown
}>()

withDefaults(defineProps<{
  /** Small uppercase heading above the list. */
  header?: string
  /** Helper text below the list. */
  footer?: string
  /** Grouped appearance: card surface with rounded corners. Disable for a bare list. */
  grouped?: boolean
  /** Accessible name for the list when no visible header exists. */
  label?: string
}>(), { grouped: true })

const slots = useSlots()
</script>

<template>
  <section class="mi-list mi:flex-col mi:gap-2.5 mi:font-mi">
    <p v-if="header || slots.header" class="mi-list__head mi:mt-3.5 mi:mx-4 mi:mb-0 mi:text-[13px] mi:text-label2 mi:uppercase mi:tracking-[.02em]"><slot name="header">{{ header }}</slot></p>
    <div class="mi-list__box" :class="{ 'mi-list__box--grouped mi:rounded-[14px] mi:bg-card mi:shadow-1 mi:overflow-hidden': grouped }" role="list" :aria-label="label">
      <slot />
    </div>
    <p v-if="footer || slots.footer" class="mi-list__foot mi:my-0 mi:mx-4 mi:text-[13px] mi:leading-[18px] mi:text-label2"><slot name="footer">{{ footer }}</slot></p>
  </section>
</template>

<style scoped>
.mi-list{display:flex;color:var(--mi-label);min-width:0}
.mi-list__box :deep(.mi-li--row + .mi-li--row .mi-li__body){border-top:.5px solid var(--mi-sep)}
.mi-list__box :deep(:not(:last-child) .mi-li--rich .mi-li__main),.mi-list__box :deep(.mi-li--rich:not(:last-child) .mi-li__main){border-bottom:.5px solid var(--mi-sep)}
</style>

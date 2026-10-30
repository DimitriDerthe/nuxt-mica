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
  <section class="mi-list">
    <p v-if="header || slots.header" class="mi-list__head"><slot name="header">{{ header }}</slot></p>
    <div class="mi-list__box" :class="{ 'mi-list__box--grouped': grouped }" role="list" :aria-label="label">
      <slot />
    </div>
    <p v-if="footer || slots.footer" class="mi-list__foot"><slot name="footer">{{ footer }}</slot></p>
  </section>
</template>

<style scoped>
.mi-list{display:flex;flex-direction:column;gap:10px;font-family:var(--mi-font);color:var(--mi-label);min-width:0}
.mi-list__head{margin:14px 16px 0;font-size:13px;color:var(--mi-label2);text-transform:uppercase;letter-spacing:.02em}
.mi-list__foot{margin:0 16px;font-size:13px;line-height:18px;color:var(--mi-label2)}
.mi-list__box--grouped{border-radius:14px;background:var(--mi-card);box-shadow:var(--mi-sh1);overflow:hidden}
.mi-list__box :deep(.mi-li--row + .mi-li--row .mi-li__body){border-top:.5px solid var(--mi-sep)}
.mi-list__box :deep(:not(:last-child) .mi-li--rich .mi-li__main),.mi-list__box :deep(.mi-li--rich:not(:last-child) .mi-li__main){border-bottom:.5px solid var(--mi-sep)}
</style>

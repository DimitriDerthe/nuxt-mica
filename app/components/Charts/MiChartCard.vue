<script setup lang="ts">
/** Titled wrapper for any chart: heading, subtitle and an elevated card surface that can be turned off. */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** Heading text; the header is hidden when no title, subtitle or actions are given. */
  title?: string
  /** Muted line under the title. */
  subtitle?: string
  /** Render the elevated card surface. Turn off to embed the chart in your own container. */
  surface?: boolean
  /** Heading level of the title, h2 to h5. Pick it to fit the page outline. */
  headingLevel?: 2 | 3 | 4 | 5
}>(), { surface: true, headingLevel: 3 })

const tag = computed(() => `h${props.headingLevel}`)

const _slots = defineSlots<{
  /** Controls shown at the right of the header, such as a toggle or legend. */
  actions?(): unknown
  /** The chart or content shown under the header. */
  default?(): unknown
}>()
</script>

<template>
  <section class="mi-cc" :class="{ 'mi-cc--surface': surface }">
    <header v-if="title || subtitle || $slots.actions" class="mi-cc-head">
      <div v-if="title || subtitle" class="mi-cc-titles">
        <component :is="tag" v-if="title" class="mi-cc-title">{{ title }}</component>
        <p v-if="subtitle" class="mi-cc-sub">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="mi-cc-actions"><slot name="actions" /></div>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.mi-cc{display:flex;flex-direction:column;gap:14px;min-width:0;font-family:var(--mi-font);color:var(--mi-label)}
.mi-cc--surface{background:var(--mi-card);border-radius:20px;box-shadow:var(--mi-sh1);padding:22px 24px 18px}
.mi-cc-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}
.mi-cc-titles{display:flex;flex-direction:column;gap:4px;min-width:0}
.mi-cc-title{margin:0;font-size:20px;line-height:1.2;font-weight:600;letter-spacing:-.015em}
.mi-cc-sub{margin:0;font-size:13px;color:var(--mi-label2)}
.mi-cc-actions{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
</style>

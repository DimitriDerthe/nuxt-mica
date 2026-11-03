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
  <section class="mi-cc mi:flex mi:flex-col mi:gap-3.5 mi:min-w-0" :class="{ 'mi-cc--surface mi:shadow-1': surface }">
    <header v-if="title || subtitle || $slots.actions" class="mi-cc-head mi:flex mi:justify-between mi:[align-items:flex-start] mi:gap-4 mi:flex-wrap">
      <div v-if="title || subtitle" class="mi-cc-titles mi:flex mi:flex-col mi:gap-1 mi:min-w-0">
        <component :is="tag" v-if="title" class="mi-cc-title">{{ title }}</component>
        <p v-if="subtitle" class="mi-cc-sub mi:m-0 mi:text-[13px] mi:text-label2">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="mi-cc-actions mi:flex mi:items-center mi:gap-4 mi:flex-wrap"><slot name="actions" /></div>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.mi-cc{font-family:var(--mi-font);color:var(--mi-label)}
.mi-cc--surface{background:var(--mi-card);border-radius:20px;padding:22px 24px 18px}
.mi-cc-title{margin:0;font-size:20px;line-height:1.2;font-weight:600;letter-spacing:-.015em}
</style>

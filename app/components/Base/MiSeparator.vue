<script setup lang="ts">
/** Thin line that visually or semantically separates content, horizontal or vertical. */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** Direction of the line. */
  orientation?: 'horizontal' | 'vertical'
  /** Purely visual: renders with role="none" and no separator semantics. */
  decorative?: boolean
}>(), { orientation: 'horizontal', decorative: true })

const role = computed(() => (props.decorative ? 'none' : 'separator'))
const ariaOrientation = computed(() => (!props.decorative && props.orientation === 'vertical' ? 'vertical' : undefined))
</script>

<template>
  <div class="mi-separator mi:shrink-0" :class="`mi-separator--${orientation}`" :role="role" :aria-orientation="ariaOrientation" />
</template>

<style scoped>
.mi-separator{background:var(--mi-sep)}
.mi-separator--horizontal{height:1px;width:100%}
.mi-separator--vertical{width:1px;align-self:stretch;min-height:1em}
</style>

<script lang="ts">
export const playground = {
  props: { label: 'Message', placeholder: 'Write something...', minHeight: 180 },
  controls: ['label', 'placeholder', 'readonly', 'disabled', 'invalid', 'toolbar', 'pasteMode', 'minHeight']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const html = ref('<h2>Release notes</h2><p>Select text and use <strong>Bold</strong>, <em>Italic</em> or <a href="https://example.com">links</a>.</p><ul><li>Lists</li><li>Quotes</li></ul>')
</script>

<template>
  <div class="wrap">
    <MiEditor v-model="html" v-bind="p" />
  </div>
</template>

<style scoped>
.wrap { width: min(100%, 560px); }
</style>

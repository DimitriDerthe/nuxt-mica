<script lang="ts">
export const playground = {
  props: { prefix: 'https://', suffix: '.mica.app', clearable: true },
  controls: ['type', 'size', 'prefix', 'suffix', 'clearable', 'passwordToggle', 'invalid', 'success', 'disabled'],
  height: 220
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const slug = ref('northwind')
</script>

<template>
  <div class="card">
    <MiField label="Workspace URL" hint="Lowercase letters, numbers and dashes.">
      <MiInput v-model="slug" v-bind="p" spellcheck="false" />
    </MiField>
  </div>
</template>

<style scoped>
.card { width: min(100%, 360px); padding: 18px; border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
</style>

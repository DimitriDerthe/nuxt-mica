<script lang="ts">
export const playground = {
  props: { rows: 3, maxlength: 280, counter: true },
  controls: ['size', 'rows', 'autoGrow', 'maxRows', 'maxlength', 'counter', 'invalid', 'success', 'disabled'],
  height: 300
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const note = ref('The export finished, but the CSV dropped the time zone column. Could you take a look before Friday\'s report?')
</script>

<template>
  <div class="card mi:box-border">
    <MiField label="Message" hint="Our team usually replies within a few hours.">
      <MiTextarea v-model="note" v-bind="p" />
    </MiField>
    <div class="actions mi:flex mi:[justify-content:flex-end] mi:gap-2">
      <MiButton variant="gray">Attach file</MiButton>
      <MiButton>Send</MiButton>
    </div>
  </div>
</template>

<style scoped>
.card { width: min(100%, 400px); padding: 18px; border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh1); display: grid; gap: 14px; }
</style>

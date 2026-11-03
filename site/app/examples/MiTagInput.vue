<script lang="ts">
export const playground = {
  props: { max: 6, placeholder: 'Add topic, press Return' },
  controls: ['placeholder', 'max', 'allowDuplicates', 'invalid', 'success', 'disabled'],
  height: 260
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const tags = ref(['design-systems', 'nuxt', 'accessibility'])
</script>

<template>
  <div class="card mi:shadow-1">
    <MiField label="Topics" hint="Help people find your talk. Up to six topics.">
      <MiTagInput v-model="tags" v-bind="p" />
    </MiField>
  </div>
</template>

<style scoped>
.card { width: min(100%, 380px); padding: 18px; border-radius: 20px; background: var(--mi-card); }
</style>

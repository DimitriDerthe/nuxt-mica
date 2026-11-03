<script lang="ts">
export const playground = {
  controls: ['variant', 'size', 'disabled'],
  props: { label: 'Bold' }
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const bold = ref(true)
const style = ref<string | number | (string | number)[] | null>(['italic'])
const options = [
  { value: 'italic', label: 'Italic' },
  { value: 'underline', label: 'Underline' },
  { value: 'strike', label: 'Strike' }
]
</script>

<template>
  <div class="ex-bar mi:flex mi:flex-wrap mi:items-center mi:justify-center mi:gap-3">
    <MiToggle v-model:pressed="bold" v-bind="p">Bold</MiToggle>
    <MiToggleGroup v-model="style" v-bind="p" type="multiple" :options="options" label="Text style" :spacing="1" />
  </div>
</template>

<style scoped>
.ex-bar { max-width: 100%; }
</style>

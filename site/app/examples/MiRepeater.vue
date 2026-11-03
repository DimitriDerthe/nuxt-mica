<script lang="ts">
export const playground = {
  props: { addLabel: 'Add guest', removeLabel: 'Remove guest', label: 'Guest', min: 1, max: 4 },
  controls: ['min', 'max', 'addLabel', 'removeLabel', 'disabled']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const guests = ref([{ name: 'Ada Lovelace', email: 'ada@example.com' }])
const blank = () => ({ name: '', email: '' })
</script>

<template>
  <div class="wrap mi:w-[min(100%,_440px)]">
    <MiRepeater v-model="guests" v-bind="p" :template="blank">
      <template #default="{ row, update }">
        <MiInput :model-value="String(row.name)" placeholder="Name" aria-label="Name" @update:model-value="update({ name: $event })" />
        <MiInput :model-value="String(row.email)" type="email" placeholder="Email" aria-label="Email" @update:model-value="update({ email: $event })" />
      </template>
    </MiRepeater>
  </div>
</template>

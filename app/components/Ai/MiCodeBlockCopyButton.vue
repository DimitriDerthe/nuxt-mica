<script setup lang="ts">
/** Copy-to-clipboard button for a code block header. */
import { onBeforeUnmount, ref } from 'vue'
import MiIcon from '../Base/MiIcon.vue'

const props = defineProps<{
  /** Text to copy. */
  value: string
}>()
const emit = defineEmits<{
  /** Fired after copying. */
  copy: [value: string]
}>()
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    emit('copy', props.value)
    clearTimeout(timer)
    timer = setTimeout(() => { copied.value = false }, 1500)
  } catch { /* clipboard unavailable */ }
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <button type="button" class="mi-cb__copy" :aria-label="copied ? 'Copied' : 'Copy code'" @click="copy">
    <MiIcon :name="copied ? 'check' : 'copy'" :size="14" />
    <span aria-live="polite">{{ copied ? 'Copied' : 'Copy' }}</span>
  </button>
</template>

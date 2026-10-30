<script lang="ts">
export const playground = {
  props: { value: 64, label: 'Uploading Brand assets.zip' },
  controls: ['size', 'tone', 'label', 'valueText', 'showValue', 'max']
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{ p: Record<string, unknown> }>()
// `value` is `number | null`, which the explorer cannot turn into a control, so the example simulates it.
const value = ref<number | null>(props.p.value as number)
watch(() => props.p.value, v => (value.value = v as number))
const max = computed(() => Number(props.p.max ?? 100) || 100)
const total = 231
const done = computed(() => value.value === null ? 0 : Math.round(total * Math.min(1, value.value / max.value)))
let timer: ReturnType<typeof setInterval> | undefined

function restart() {
  clearInterval(timer)
  value.value = null
  let n = 0
  timer = setTimeout(() => {
    timer = setInterval(() => {
      n = Math.min(max.value, n + max.value / 25)
      value.value = Math.round(n)
      if (n >= max.value) clearInterval(timer)
    }, 120)
  }, 1200)
}
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="ex">
    <MiProgress v-bind="p" :value="value" />
    <div class="foot">
      <span>{{ value === null ? 'Preparing…' : done + ' MB of ' + total + ' MB' }}</span>
      <MiButton variant="plain" size="mini" @click="restart">Restart upload</MiButton>
    </div>
  </div>
</template>

<style scoped>
.ex { display: grid; gap: 10px; width: min(100%, 360px); padding: 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 12px; color: var(--mi-label2); }
</style>

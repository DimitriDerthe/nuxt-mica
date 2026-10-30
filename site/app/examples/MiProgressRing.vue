<script lang="ts">
export const playground = {
  props: { value: 72, label: 'Downloading Lisbon offline map' },
  controls: ['variant', 'size', 'stroke', 'tone', 'showValue', 'stoppable']
}
</script>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{ p: Record<string, unknown> }>()
// `value` is `number | null`, which the explorer cannot turn into a control, so the example simulates it.
const value = ref<number | null>(props.p.value as number)
watch(() => props.p.value, v => (value.value = v as number))
const status = ref('312 MB · Wi-Fi only')
let timer: ReturnType<typeof setInterval> | undefined

function restart() {
  clearInterval(timer)
  value.value = null
  status.value = 'Waiting for Wi-Fi…'
  let n = 0
  timer = setTimeout(() => {
    status.value = '312 MB · Wi-Fi only'
    timer = setInterval(() => {
      n = Math.min(100, n + 4)
      value.value = n
      if (n >= 100) { clearInterval(timer); status.value = 'Downloaded' }
    }, 120)
  }, 1200)
}
function stop() {
  clearInterval(timer)
  status.value = 'Download paused'
}
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="ex">
    <MiProgressRing v-bind="p" :value="value" @stop="stop" />
    <div class="txt">
      <div class="name">Lisbon offline map</div>
      <div class="sub" aria-live="polite">{{ status }}</div>
      <MiButton class="again" variant="plain" size="mini" @click="restart">Restart download</MiButton>
    </div>
  </div>
</template>

<style scoped>
.ex { display: flex; align-items: center; gap: 16px; width: min(100%, 320px); padding: 16px 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.txt { display: grid; justify-items: start; gap: 2px; min-width: 0; }
.name { font-size: 15px; font-weight: 600; color: var(--mi-label); }
.sub { font-size: 13px; color: var(--mi-label2); }
.again { margin-left: -8px; }
</style>

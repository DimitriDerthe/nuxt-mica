<script setup lang="ts">
/** Free-text answer alongside the choices; pass aria-label and placeholder. */
import { inject } from 'vue'
import { MI_QN_ITEM_KEY, MI_QN_KEY } from '../../utils/miAi'

const q = inject(MI_QN_KEY)!
const item = inject(MI_QN_ITEM_KEY)!
function onInput(e: Event) {
  const text = (e.target as HTMLInputElement).value
  if (!item.multiple) { q.other[item.name] = text; q.set(item.name, text); return }
  const cur = q.answers.value[item.name]
  const base = (Array.isArray(cur) ? cur : []).filter(x => x !== q.other[item.name])
  q.other[item.name] = text
  q.set(item.name, text ? [...base, text] : base)
}
</script>

<template>
  <input class="mi-qn__text" type="text" :value="q.other[item.name] ?? ''" @input="onInput">
</template>

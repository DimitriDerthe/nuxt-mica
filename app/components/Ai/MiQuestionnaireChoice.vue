<script setup lang="ts">
/** Radio (single) or checkbox (multiple) choice inside a questionnaire item. */
import { computed, inject } from 'vue'
import { MI_QN_ITEM_KEY, MI_QN_KEY } from '../../utils/miAi'

const props = defineProps<{
  /** Value stored in the answer. */
  value: string
}>()
const q = inject(MI_QN_KEY)!
const item = inject(MI_QN_ITEM_KEY)!
const cur = computed(() => q.answers.value[item.name])
const checked = computed(() => item.multiple ? Array.isArray(cur.value) && cur.value.includes(props.value) : cur.value === props.value)
function change() {
  if (!item.multiple) { q.other[item.name] = ''; q.set(item.name, props.value); return }
  const a = Array.isArray(cur.value) ? cur.value : []
  q.set(item.name, a.includes(props.value) ? a.filter(x => x !== props.value) : [...a, props.value])
}

defineSlots<{
  /** Choice label; falls back to the raw value when empty. */
  default?(): unknown
}>()
</script>

<template>
  <label class="mi-qn__opt">
    <input data-mi-choice :type="item.multiple ? 'checkbox' : 'radio'" :name="item.name" :value="value" :checked="checked" @change="change">
    <span class="mi-qn__body"><slot>{{ value }}</slot></span>
  </label>
</template>

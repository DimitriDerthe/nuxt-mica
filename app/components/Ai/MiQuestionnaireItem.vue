<script setup lang="ts">
/** One question step; only the active item is visible. Items register in render order. */
import { computed, inject, onBeforeUnmount, provide } from 'vue'
import { MI_QN_ITEM_KEY, MI_QN_KEY } from '../../utils/miAi'

const props = defineProps<{
  /** Answer key and form field name. */
  name: string
  /** Allow several choices. */
  multiple?: boolean
  /** Block Next until answered; hides Skip. */
  required?: boolean
}>()
const q = inject(MI_QN_KEY)!
const off = q.register(props.name, !!props.required)
onBeforeUnmount(off)
provide(MI_QN_ITEM_KEY, { name: props.name, multiple: !!props.multiple })
const isActive = computed(() => q.active.value === props.name)

defineSlots<{
  /** Title, description, choices and error of one question. */
  default?(): unknown
}>()
</script>

<template>
  <fieldset class="mi-qn__set" :hidden="!isActive || undefined" :data-name="name"><slot /></fieldset>
</template>

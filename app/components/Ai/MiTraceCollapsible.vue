<script setup lang="ts">
/** Expandable trace row; v-model:open for controlled state or defaultOpen for uncontrolled. */
import { computed, provide, useId } from 'vue'
import { MI_TRACE_KEY } from '../../utils/miAi'

const props = withDefaults(defineProps<{
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean
}>(), { defaultOpen: false })

/** Whether the row is expanded. Leave unset to let `defaultOpen` and the trigger manage it. */

const model = defineModel<boolean | undefined>('open', { default: undefined })
const open = computed(() => model.value ?? props.defaultOpen)
const id = `mi-trc-${useId()}`
provide(MI_TRACE_KEY, { open, id, toggle: () => { model.value = !open.value } })

defineSlots<{
  /** A MiTraceCollapsibleTrigger followed by a MiTraceCollapsibleContent. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-tr__coll" :data-state="open ? 'open' : 'closed'"><slot /></div>
</template>

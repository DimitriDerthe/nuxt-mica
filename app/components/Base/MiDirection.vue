<script lang="ts">
import { inject, ref } from 'vue'
import type { InjectionKey, Ref } from 'vue'

export type MiDirectionValue = 'ltr' | 'rtl'
/** Injection key holding the current reading direction. */
export const MI_DIRECTION_KEY: InjectionKey<Ref<MiDirectionValue>> = Symbol('mi-direction')

/** Returns the current reading direction (defaults to a `ltr` ref outside a provider). */
export function useMiDirection(): Ref<MiDirectionValue> {
  return inject(MI_DIRECTION_KEY, ref<MiDirectionValue>('ltr'))
}
</script>

<script setup lang="ts">
/** Provider that sets the reading direction (LTR or RTL) for its subtree and exposes it to descendants. */
import { provide, toRef } from 'vue'

const props = withDefaults(defineProps<{
  /** Reading direction applied to the subtree. */
  direction?: MiDirectionValue
}>(), { direction: 'ltr' })

provide(MI_DIRECTION_KEY, toRef(props, 'direction') as Ref<MiDirectionValue>)

defineSlots<{
  /** Content that inherits the reading direction. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-direction" :dir="direction"><slot /></div>
</template>

<style scoped>
.mi-direction{display:contents}
</style>

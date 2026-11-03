<script setup lang="ts">
/** Color swatch picker to choose one color from a palette via v-model. Defaults to brand and system colors; pass `options` for a custom set. */
import { computed, ref, useId } from 'vue'
import { MI_SWATCH_DEFAULTS, miRovingKey } from '../../utils/miControls'
import type { MiSwatchOption } from '../../utils/miControls'

const props = withDefaults(defineProps<{
  /** Swatches to pick from. Defaults to the brand colors plus system colors. */
  options?: MiSwatchOption[]
  /** Visible label; the selected color name is appended after a dot. */
  label?: string
  /** Accessible name when there is no visible `label`. */
  ariaLabel?: string
  /** Append the selected color name to the label. */
  showName?: boolean
  /** Blocks picking a color and dims the swatches. */
  disabled?: boolean
}>(), {
  options: () => MI_SWATCH_DEFAULTS,
  showName: true
})

/** Selected color as a CSS color, or null when none is. */

const model = defineModel<string | null>({ default: null })
const root = ref<HTMLElement | null>(null)
const labelId = `mi-swatch-${useId()}`

const index = computed(() => props.options.findIndex(o => o.value === model.value))
const selected = computed(() => props.options[index.value])

function tabindex(i: number) {
  return (index.value >= 0 ? index.value : 0) === i ? 0 : -1
}

function pick(o: MiSwatchOption) {
  if (!props.disabled) model.value = o.value
}

function onKeydown(e: KeyboardEvent) {
  miRovingKey(e, root.value, '[role="radio"]')
}
</script>

<template>
  <div class="mi-swatch mi:flex-col mi:gap-3 mi:font-mi" :class="{ 'is-disabled': disabled }">
    <span v-if="label" :id="labelId" class="mi-swatch__label mi:text-[15px] mi:font-medium">
      {{ label }}<template v-if="showName && selected"> · <span class="mi-swatch__name mi:text-label2 mi:font-normal">{{ selected.name }}</span></template>
    </span>
    <div
      ref="root"
      class="mi-swatch__group mi:flex mi:flex-wrap mi:gap-1.5"
      role="radiogroup"
      :aria-label="label ? undefined : ariaLabel"
      :aria-labelledby="label ? labelId : undefined"
      @keydown="onKeydown"
    >
      <button
        v-for="(o, i) in options"
        :key="o.value"
        type="button"
        role="radio"
        class="mi-swatch__item mi:relative mi:flex mi:items-center mi:justify-center mi:w-11 mi:h-11 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:[background:transparent] mi:[-webkit-tap-highlight-color:transparent] mi:disabled:cursor-default"
        :class="{ 'is-on': i === index }"
        :style="{ '--_c': o.color }"
        :aria-checked="i === index"
        :aria-label="o.name"
        :tabindex="tabindex(i)"
        :disabled="disabled"
        @click="pick(o)"
      >
        <span class="mi-swatch__dot mi:w-7 mi:h-7 mi:rounded-[50%] mi:[background:var(--\_c)] mi:shadow-[inset_0_0_0_.5px_rgba(0,_0,_0,_.12)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:[.mi-swatch__item:active:not(:disabled)_&]:transform-[scale(.88)]" />
        <span class="mi-swatch__ring mi:absolute mi:top-1 mi:left-1 mi:w-9 mi:h-9 mi:rounded-[50%] mi:[border:2px_solid_var(--\_c)] mi:opacity-0 mi:transform-[scale(.78)] mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring),_opacity_var(--mi-dur-1)_ease] mi:pointer-events-none mi:[.is-on_&]:opacity-100 mi:[.is-on_&]:transform-[scale(1)]" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.mi-swatch { display: flex; color: var(--mi-label); }
.mi-swatch.is-disabled { opacity: .4; }
</style>

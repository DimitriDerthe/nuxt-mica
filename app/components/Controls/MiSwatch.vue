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
  <div class="mi-swatch" :class="{ 'is-disabled': disabled }">
    <span v-if="label" :id="labelId" class="mi-swatch__label">
      {{ label }}<template v-if="showName && selected"> · <span class="mi-swatch__name">{{ selected.name }}</span></template>
    </span>
    <div
      ref="root"
      class="mi-swatch__group"
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
        class="mi-swatch__item"
        :class="{ 'is-on': i === index }"
        :style="{ '--_c': o.color }"
        :aria-checked="i === index"
        :aria-label="o.name"
        :tabindex="tabindex(i)"
        :disabled="disabled"
        @click="pick(o)"
      >
        <span class="mi-swatch__dot" />
        <span class="mi-swatch__ring" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.mi-swatch { display: flex; flex-direction: column; gap: 12px; font-family: var(--mi-font); color: var(--mi-label); }
.mi-swatch.is-disabled { opacity: .4; }
.mi-swatch__label { font-size: 15px; font-weight: 500; }
.mi-swatch__name { color: var(--mi-label2); font-weight: 400; }
.mi-swatch__group { display: flex; flex-wrap: wrap; gap: 6px; }

.mi-swatch__item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  -webkit-tap-highlight-color: transparent;
}
.mi-swatch__item:disabled { cursor: default; }
.mi-swatch__dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--_c);
  box-shadow: inset 0 0 0 .5px rgba(0, 0, 0, .12);
  transition: transform var(--mi-dur-2) var(--mi-spring);
}
.mi-swatch__item:active:not(:disabled) .mi-swatch__dot { transform: scale(.88); }
/* Selection ring: a 36px outline scaled and faded in, leaving a 2px gap around the dot. */
.mi-swatch__ring {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--_c);
  opacity: 0;
  transform: scale(.78);
  transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-1) ease;
  pointer-events: none;
}
.is-on .mi-swatch__ring { opacity: 1; transform: scale(1); }
</style>

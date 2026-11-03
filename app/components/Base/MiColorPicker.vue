<script setup lang="ts">
/** Hex color field plus preset swatches that edit the primary or secondary brand color and apply it to the theme live. */
import { computed, nextTick, ref, useId, watch } from 'vue'
import MiIcon from './MiIcon.vue'
import { miHex, miOn } from '../../utils/color'
import { useMiTheme } from '../../composables/useMiTheme'

const props = withDefaults(defineProps<{
  /** Which brand color this picker edits. */
  target?: 'primary' | 'secondary'
  /** Visible title of the field; defaults to Primary or Secondary from the target. */
  label?: string
  /** Preset swatches (hex). Defaults to the kit presets for the target. */
  presets?: string[]
}>(), { target: 'primary' })

const emit = defineEmits<{
  /** Fired with the new hex color after a valid entry or swatch pick. */
  change: [hex: string]
}>()

const PRESETS = {
  primary: ['#0071E3', '#5856D6', '#248A3D', '#D3006A'],
  secondary: ['#BF4800', '#AF52DE', '#0A7E8C', '#8E6A00']
} as const

const theme = useMiTheme()
const current = computed(() => (props.target === 'primary' ? theme.primary.value : theme.secondary.value))
const swatches = computed(() => (props.presets?.length ? props.presets : [...PRESETS[props.target]]).map(h => miHex(h, '#000000')))
const title = computed(() => props.label ?? (props.target === 'primary' ? 'Primary' : 'Secondary'))
const fallback = computed(() => PRESETS[props.target][0])
const uid = `mi-cp-${useId()}`

const draft = ref(current.value)
const invalid = ref(false)
const swatchEls = ref<HTMLButtonElement[]>([])
watch(current, (v) => { draft.value = v; invalid.value = false })

const activeIndex = computed(() => swatches.value.findIndex(h => h === miHex(current.value, fallback.value)))

function apply(hex: string) {
  const next = miHex(hex, '')
  if (!next) { invalid.value = true; return }
  invalid.value = false
  if (props.target === 'primary') theme.setPrimary(next)
  else theme.setSecondary(next)
  draft.value = next
  emit('change', next)
}

function commit() {
  if (draft.value.trim() === '') { draft.value = current.value; invalid.value = false; return }
  apply(draft.value)
}

function onInput(e: Event) {
  draft.value = (e.target as HTMLInputElement).value
  invalid.value = false
}

async function onSwatchKey(e: KeyboardEvent, i: number) {
  const n = swatches.value.length
  let next = -1
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % n
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + n) % n
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = n - 1
  if (next < 0) return
  e.preventDefault()
  apply(swatches.value[next]!)
  await nextTick()
  swatchEls.value[next]?.focus()
}
</script>

<template>
  <div class="mi-cp mi:flex-col">
    <div class="mi-cp__head mi:flex mi:items-center mi:justify-between mi:gap-3">
      <label class="mi-cp__title mi:text-[15px] mi:font-semibold mi:tracking-[-.01em]" :for="`${uid}-hex`">{{ title }}</label>
      <div class="mi-cp__field mi:flex mi:items-center mi:gap-2 mi:h-9 mi:py-0 mi:px-2.5 mi:rounded-[10px] mi:bg-field mi:shadow-[inset_0_0_0_1px_var(--mi-field-b)] mi:focus-within:shadow-[inset_0_0_0_2px_var(--mi-p)]" :class="{ 'mi-cp__field--bad mi:shadow-[inset_0_0_0_2px_var(--mi-red)] mi:focus-within:shadow-[inset_0_0_0_2px_var(--mi-red)]': invalid }">
        <span class="mi-cp__chip mi:w-4 mi:h-4 mi:flex-[none] mi:rounded-[50%] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]" :style="{ background: miHex(current, fallback) }" aria-hidden="true" />
        <input
          :id="`${uid}-hex`"
          class="mi-cp__input mi:w-21 mi:[border:0] mi:p-0 mi:bg-transparent mi:text-label mi:uppercase mi:[outline:none] mi:focus-visible:[outline:none]"
          type="text"
          inputmode="text"
          spellcheck="false"
          autocomplete="off"
          maxlength="7"
          :value="draft"
          :aria-invalid="invalid"
          :aria-describedby="invalid ? `${uid}-err` : undefined"
          @input="onInput"
          @blur="commit"
          @keydown.enter.prevent="commit"
          @keydown.esc="draft = current; invalid = false"
        >
      </div>
    </div>
    <p v-if="invalid" :id="`${uid}-err`" class="mi-cp__err mi:m-0 mi:text-[12px] mi:text-red-t" role="alert">Enter a hex color such as #0071E3.</p>
    <div class="mi-cp__swatches mi:flex mi:flex-wrap mi:gap-2.5" role="radiogroup" :aria-label="`${title} presets`">
      <button
        v-for="(h, i) in swatches"
        :key="h"
        :ref="(el) => { if (el) swatchEls[i] = el as HTMLButtonElement }"
        type="button"
        role="radio"
        class="mi-cp__sw mi:relative mi:inline-flex mi:items-center mi:justify-center mi:w-9 mi:h-9 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:[-webkit-tap-highlight-color:transparent] mi:active:transform-[scale(.92)]"
        :aria-checked="i === activeIndex"
        :aria-label="h"
        :title="h"
        :tabindex="i === activeIndex || (activeIndex < 0 && i === 0) ? 0 : -1"
        :style="{ background: h, color: miOn(h) }"
        @click="apply(h)"
        @keydown="onSwatchKey($event, i)"
      >
        <MiIcon class="mi-cp__tick mi:opacity-0 mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring),opacity_var(--mi-dur-1)_linear] mi:[.mi-cp__sw[aria-checked=true]_&]:opacity-100" name="check" :size="16" :weight="3" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.mi-cp{display:flex;gap:12px;font-family:var(--mi-font);color:var(--mi-label)}
.mi-cp__input{font:inherit;font-size:15px;font-variant-numeric:tabular-nums}
.mi-cp__tick{transform:scale(.5)}
.mi-cp__sw[aria-checked=true] .mi-cp__tick{transform:scale(1)}
</style>

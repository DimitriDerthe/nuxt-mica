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
  <div class="mi-cp">
    <div class="mi-cp__head">
      <label class="mi-cp__title" :for="`${uid}-hex`">{{ title }}</label>
      <div class="mi-cp__field" :class="{ 'mi-cp__field--bad': invalid }">
        <span class="mi-cp__chip" :style="{ background: miHex(current, fallback) }" aria-hidden="true" />
        <input
          :id="`${uid}-hex`"
          class="mi-cp__input"
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
    <p v-if="invalid" :id="`${uid}-err`" class="mi-cp__err" role="alert">Enter a hex color such as #0071E3.</p>
    <div class="mi-cp__swatches" role="radiogroup" :aria-label="`${title} presets`">
      <button
        v-for="(h, i) in swatches"
        :key="h"
        :ref="(el) => { if (el) swatchEls[i] = el as HTMLButtonElement }"
        type="button"
        role="radio"
        class="mi-cp__sw"
        :aria-checked="i === activeIndex"
        :aria-label="h"
        :title="h"
        :tabindex="i === activeIndex || (activeIndex < 0 && i === 0) ? 0 : -1"
        :style="{ background: h, color: miOn(h) }"
        @click="apply(h)"
        @keydown="onSwatchKey($event, i)"
      >
        <MiIcon class="mi-cp__tick" name="check" :size="16" :weight="3" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.mi-cp{display:flex;flex-direction:column;gap:12px;font-family:var(--mi-font);color:var(--mi-label)}
.mi-cp__head{display:flex;align-items:center;justify-content:space-between;gap:12px}
.mi-cp__title{font-size:15px;font-weight:600;letter-spacing:-.01em}
.mi-cp__field{display:flex;align-items:center;gap:8px;height:36px;padding:0 10px;border-radius:10px;background:var(--mi-field);box-shadow:inset 0 0 0 1px var(--mi-field-b)}
.mi-cp__field:focus-within{box-shadow:inset 0 0 0 2px var(--mi-p)}
.mi-cp__field--bad,.mi-cp__field--bad:focus-within{box-shadow:inset 0 0 0 2px var(--mi-red)}
.mi-cp__chip{width:16px;height:16px;flex:none;border-radius:50%;box-shadow:inset 0 0 0 1px var(--mi-sep)}
.mi-cp__input{width:84px;border:0;padding:0;background:transparent;color:var(--mi-label);font:inherit;font-size:15px;font-variant-numeric:tabular-nums;text-transform:uppercase;outline:none}
.mi-cp__input:focus-visible{outline:none}
.mi-cp__err{margin:0;font-size:12px;color:var(--mi-red-t)}
.mi-cp__swatches{display:flex;flex-wrap:wrap;gap:10px}
.mi-cp__sw{position:relative;display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;padding:0;border:0;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12);transition:transform var(--mi-dur-2) var(--mi-spring);-webkit-tap-highlight-color:transparent}
.mi-cp__sw:active{transform:scale(.92)}
.mi-cp__tick{opacity:0;transform:scale(.5);transition:transform var(--mi-dur-2) var(--mi-spring),opacity var(--mi-dur-1) linear}
.mi-cp__sw[aria-checked=true] .mi-cp__tick{opacity:1;transform:scale(1)}
</style>

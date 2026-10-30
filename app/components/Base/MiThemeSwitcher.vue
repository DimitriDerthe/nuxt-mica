<script setup lang="ts">
/** Segmented control to switch the app appearance (light, dark or system) via useMiTheme; icon-only variant for tight toolbars. */
import { computed, nextTick, ref } from 'vue'
import MiIcon from './MiIcon.vue'
import { useMiTheme, type MiMode } from '../../composables/useMiTheme'

const props = withDefaults(defineProps<{
  /** Accessible name of the group. */
  label?: string
  /** Hide the text labels and keep icons only (labels stay available to assistive tech). */
  iconOnly?: boolean
  /** Override the visible option texts per mode (e.g. translated labels). */
  labels?: Partial<Record<MiMode, string>>
}>(), { label: 'Appearance', iconOnly: false })

const emit = defineEmits<{
  /** Fired with the newly selected mode after the user changes it. */
  change: [mode: MiMode]
}>()

const theme = useMiTheme()
const options: ReadonlyArray<{ value: MiMode, icon: 'sun' | 'moon' | 'desktop', text: string }> = [
  { value: 'light', icon: 'sun', text: 'Light' },
  { value: 'dark', icon: 'moon', text: 'Dark' },
  { value: 'system', icon: 'desktop', text: 'System' }
]

const items = computed(() => options.map(o => ({ ...o, text: props.labels?.[o.value] ?? o.text })))
const index = computed(() => Math.max(0, options.findIndex(o => o.value === theme.mode.value)))
const buttons = ref<HTMLButtonElement[]>([])

function pick(mode: MiMode) {
  if (theme.mode.value === mode) return
  theme.setMode(mode)
  emit('change', mode)
}

async function onKey(e: KeyboardEvent) {
  const last = options.length - 1
  let next = -1
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = index.value >= last ? 0 : index.value + 1
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = index.value <= 0 ? last : index.value - 1
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = last
  if (next < 0) return
  e.preventDefault()
  pick(options[next]!.value)
  await nextTick()
  buttons.value[next]?.focus()
}
</script>

<template>
  <div class="mi-themesw" :class="{ 'mi-themesw--icons': iconOnly }" role="radiogroup" :aria-label="label" @keydown="onKey">
    <span class="mi-themesw__thumb" aria-hidden="true" :style="{ transform: `translateX(${index * 100}%)` }" />
    <button
      v-for="(o, i) in items"
      :key="o.value"
      :ref="(el) => { if (el) buttons[i] = el as HTMLButtonElement }"
      type="button"
      role="radio"
      class="mi-themesw__opt"
      :aria-checked="theme.mode.value === o.value"
      :aria-label="iconOnly ? o.text : undefined"
      :tabindex="i === index ? 0 : -1"
      @click="pick(o.value)"
    >
      <MiIcon :name="o.icon" :size="16" :weight="2" />
      <span v-if="!iconOnly" class="mi-themesw__text">{{ o.text }}</span>
    </button>
  </div>
</template>

<style scoped>
.mi-themesw{position:relative;display:grid;grid-template-columns:repeat(3,1fr);flex:none;width:max-content;max-width:100%;padding:2px;border-radius:9px;background:var(--mi-fill3);font-family:var(--mi-font);isolation:isolate}
.mi-themesw__thumb{position:absolute;top:2px;bottom:2px;left:2px;width:calc((100% - 4px) / 3);border-radius:7px;background:var(--mi-seg);box-shadow:0 3px 8px rgba(0,0,0,.12),0 3px 1px rgba(0,0,0,.04),0 0 0 .5px rgba(0,0,0,.04);transition:transform var(--mi-dur-3) var(--mi-spring);z-index:0}
.mi-themesw__opt{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:30px;padding:0 12px;border:0;border-radius:7px;background:transparent;color:var(--mi-label);font-size:13px;font-weight:500;letter-spacing:-.005em;white-space:nowrap;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.mi-themesw__opt[aria-checked=true]{font-weight:600}
.mi-themesw__opt:not([aria-checked=true]){color:var(--mi-label2)}
.mi-themesw__opt:focus-visible{outline-offset:-1px}
.mi-themesw--icons .mi-themesw__opt{padding:0 10px}
@media (max-width:420px){.mi-themesw--icons .mi-themesw__opt{padding:0 7px}}
</style>

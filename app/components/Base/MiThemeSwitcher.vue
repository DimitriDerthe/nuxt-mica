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
  <div class="mi-themesw mi:flex-[none] mi:isolate" :class="{ 'mi-themesw--icons': iconOnly }" role="radiogroup" :aria-label="label" @keydown="onKey">
    <span class="mi-themesw__thumb mi:absolute mi:top-0.5 mi:bottom-0.5 mi:left-0.5 mi:w-[calc((100%_-_4px)_/_3)] mi:rounded-[7px] mi:bg-seg mi:shadow-[0_3px_8px_rgba(0,0,0,.12),0_3px_1px_rgba(0,0,0,.04),0_0_0_.5px_rgba(0,0,0,.04)] mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:z-0" aria-hidden="true" :style="{ transform: `translateX(${index * 100}%)` }" />
    <button
      v-for="(o, i) in items"
      :key="o.value"
      :ref="(el) => { if (el) buttons[i] = el as HTMLButtonElement }"
      type="button"
      role="radio"
      class="mi-themesw__opt mi:relative mi:z-1 mi:inline-flex mi:items-center mi:justify-center mi:gap-1.5 mi:h-7.5 mi:py-0 mi:px-3 mi:[border:0] mi:rounded-[7px] mi:bg-transparent mi:text-label mi:text-[13px] mi:font-medium mi:tracking-[-.005em] mi:whitespace-nowrap mi:[-webkit-tap-highlight-color:transparent] mi:touch-manipulation mi:[&[aria-checked=true]]:font-semibold mi:[&:not([aria-checked=true])]:text-label2 mi:focus-visible:outline-offset-[-1px] mi:[.mi-themesw--icons_&]:py-0 mi:[.mi-themesw--icons_&]:px-2.5 mi:max-[420px]:[.mi-themesw--icons_&]:py-0 mi:max-[420px]:[.mi-themesw--icons_&]:px-[7px]"
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
.mi-themesw{position:relative;display:grid;grid-template-columns:repeat(3,1fr);width:max-content;max-width:100%;padding:2px;border-radius:9px;background:var(--mi-fill3);font-family:var(--mi-font)}
</style>

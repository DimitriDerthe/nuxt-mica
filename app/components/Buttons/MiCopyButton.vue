<script setup lang="ts">
/** Button that copies a string to the clipboard, swaps its icon and label to a confirmation, and announces it to screen readers. */
import { computed, onBeforeUnmount, ref } from 'vue'
import MiIcon from '../Base/MiIcon.vue'

const props = withDefaults(defineProps<{
  /** Text to copy. Ignored when `getValue` is set. */
  value?: string
  /** Function returning the text at click time (sync or async); wins over `value`. */
  getValue?: () => string | Promise<string>
  /** Button text and accessible name before copying. Empty hides the text (icon only, the name stays). */
  label?: string
  /** Text and accessible name shown right after copying; announced politely. */
  copiedLabel?: string
  /** How long the confirmation stays, in ms. */
  timeout?: number
  /** Visual style: subtle tinted, outlined, or icon-only quiet. */
  variant?: 'tinted' | 'outline' | 'ghost'
  /** Hides the visible text and shows only the icon. */
  iconOnly?: boolean
  /** Blocks interaction and dims the button. */
  disabled?: boolean
}>(), { label: 'Copy', copiedLabel: 'Copied', timeout: 1800, variant: 'tinted' })

const emit = defineEmits<{
  /** Fired after the text reached the clipboard, with that text. */
  copy: [value: string]
  /** Fired when copying failed. */
  error: [error: unknown]
}>()

const copied = ref(false)
const announce = ref('')
let timer: ReturnType<typeof setTimeout> | undefined

/** Copies with the async Clipboard API, falling back to a hidden textarea and execCommand. */
async function writeClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch { /* permission denied or insecure context: try the fallback */ }
  }
  if (typeof document === 'undefined') throw new Error('Clipboard unavailable')
  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  ta.setAttribute('aria-hidden', 'true')
  ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none'
  const active = document.activeElement as HTMLElement | null
  document.body.appendChild(ta)
  try {
    ta.select()
    ta.setSelectionRange(0, text.length)
    if (!document.execCommand('copy')) throw new Error('Copy command rejected')
  } finally {
    ta.remove()
    active?.focus?.()
  }
}

async function copy() {
  if (props.disabled) return
  try {
    const text = props.getValue ? await props.getValue() : (props.value ?? '')
    await writeClipboard(text)
    copied.value = true
    announce.value = props.copiedLabel
    emit('copy', text)
    clearTimeout(timer)
    timer = setTimeout(() => { copied.value = false; announce.value = '' }, props.timeout)
  } catch (e) {
    emit('error', e)
  }
}

const name = computed(() => (copied.value ? props.copiedLabel : props.label))
const showText = computed(() => !props.iconOnly && !!name.value)

onBeforeUnmount(() => clearTimeout(timer))

const _slots = defineSlots<{
  /** Replaces the idle icon. */
  icon?(): unknown
}>()
</script>

<template>
  <button
    type="button"
    class="mi-copy mi:cursor-pointer mi:[-webkit-tap-highlight-color:transparent] mi:disabled:cursor-not-allowed"
    :class="[`mi-copy--${variant}`, { 'is-copied': copied, 'is-icon': !showText }]"
    :disabled="disabled ? true : undefined"
    :aria-label="showText ? undefined : name"
    @click="copy"
  >
    <span class="mi-copy__icons mi:relative mi:inline-grid mi:w-4 mi:h-4 mi:flex-[none]" aria-hidden="true">
      <span class="mi-copy__ico mi-copy__ico--idle mi:[grid-area:1_/_1] mi:grid mi:place-items-center mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring),_opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[.mi-copy.is-copied_&]:opacity-0 mi:[.mi-copy.is-copied_&]:transform-[scale3d(.4,_.4,_1)_rotate(30deg)]"><slot name="icon"><MiIcon name="copy" :size="16" /></slot></span>
      <span class="mi-copy__ico mi-copy__ico--done mi:[grid-area:1_/_1] mi:grid mi:place-items-center mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring),_opacity_var(--mi-dur-2)_var(--mi-ease)] mi:opacity-0 mi:transform-[scale3d(.4,_.4,_1)_rotate(-30deg)] mi:[.mi-copy.is-copied_&]:opacity-100 mi:[.mi-copy.is-copied_&]:transform-none"><MiIcon name="check" :size="16" :weight="2.4" /></span>
    </span>
    <span v-if="showText" class="mi-copy__text mi:whitespace-nowrap">{{ name }}</span>
    <span class="mi-copy__live mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" role="status" aria-live="polite">{{ announce }}</span>
  </button>
</template>

<style scoped>
.mi-copy {
  position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  height: 36px; padding: 0 14px 0 12px; border: 0; border-radius: 10px;
  font: 600 14px/1 var(--mi-font); letter-spacing: -.01em; color: var(--mi-p-text); background: var(--mi-p-tint);
  transition: transform var(--mi-dur-2) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease);
}
.mi-copy.is-icon { width: 36px; padding: 0; }
.mi-copy--outline { background: transparent; color: var(--mi-label); box-shadow: inset 0 0 0 1px var(--mi-sep2); }
.mi-copy--ghost { background: transparent; color: var(--mi-label2); }
.mi-copy:active:not(:disabled) { transform: scale3d(.96, .96, 1); }
.mi-copy:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.mi-copy:disabled { opacity: .4; }
.mi-copy.is-copied { color: var(--mi-green); }
</style>

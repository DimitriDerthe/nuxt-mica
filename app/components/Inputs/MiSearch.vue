<script setup lang="ts">
/** Search input with optional cancel button and Cmd/Ctrl+letter focus hotkey; default or compact size. v-model is the query. */
import { computed, onBeforeUnmount, onMounted, ref, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** `default` is the 40 px filled field, `compact` the 32 px toolbar field. */
  size?: 'default' | 'compact'
  /** Hint text shown while the field is empty. */
  placeholder?: string
  /** Show a Cancel button next to the field while it has text (default size only). */
  cancelable?: boolean
  /** Text of the cancel button. */
  cancelLabel?: string
  /** Accessible name of the clear button. */
  clearLabel?: string
  /** Visible keyboard shortcut hint in compact mode, for example `⌘K`. */
  shortcut?: string
  /** Letter bound to Cmd/Ctrl + letter to focus the field, for example `k`. */
  hotkey?: string
  /** Blocks typing and dims the field. */
  disabled?: boolean
  /** Accessible name of the input. Defaults to Search. */
  ariaLabel?: string
}>(), { size: 'default', placeholder: 'Search', cancelable: true, cancelLabel: 'Cancel', clearLabel: 'Clear search', ariaLabel: 'Search' })

/** Current search query. */

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ search: [value: string], cancel: [] }>()

const attrs = useAttrs()
const el = ref<HTMLInputElement | null>(null)
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
const inputAttrs = computed(() => { const { class: _c, style: _s, ...rest } = attrs; return rest })
const hasText = computed(() => String(model.value ?? '').length > 0)
const compact = computed(() => props.size === 'compact')

function clear() { model.value = ''; el.value?.focus() }
function cancel() { model.value = ''; emit('cancel'); el.value?.blur() }
function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter') emit('search', model.value)
  else if (e.key === 'Escape' && hasText.value) { e.preventDefault(); clear() }
}
function onHotkey(e: KeyboardEvent) {
  if (props.hotkey && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === props.hotkey.toLowerCase()) {
    e.preventDefault()
    el.value?.focus()
    el.value?.select()
  }
}
onMounted(() => { if (props.hotkey) document.addEventListener('keydown', onHotkey) })
onBeforeUnmount(() => document.removeEventListener('keydown', onHotkey))
defineExpose({ focus: () => el.value?.focus(), input: el })
</script>

<template>
  <div class="mi-search" :class="{ 'is-compact': compact }" v-bind="rootAttrs" role="search">
    <span class="mi-search__box" :class="{ 'is-disabled': disabled }">
      <svg :width="compact ? 15 : 18" :height="compact ? 15 : 18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>
      <input
        v-bind="inputAttrs" ref="el" v-model="model" class="mi-search__input" type="search" enterkeyhint="search"
        :aria-label="ariaLabel" :placeholder="placeholder" :disabled="disabled" autocomplete="off" @keydown="onKey"
      >
      <button v-if="hasText && !disabled" type="button" class="mi-search__clear" :aria-label="clearLabel" @click="clear">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" /><path d="M9 9l6 6M15 9l-6 6" stroke-width="2" stroke-linecap="round" style="stroke: var(--mi-card)" /></svg>
      </button>
      <kbd v-else-if="compact && shortcut" class="mi-search__kbd">{{ shortcut }}</kbd>
    </span>
    <button v-if="!compact && cancelable && hasText" type="button" class="mi-search__cancel" @click="cancel">{{ cancelLabel }}</button>
  </div>
</template>

<style scoped>
.mi-search { display: flex; align-items: center; gap: 12px; font-family: var(--mi-font); letter-spacing: -.01em; min-width: 0; }
.mi-search.is-compact { display: inline-flex; width: 280px; max-width: 100%; }
.mi-search__box {
  position: relative; flex: 1; min-width: 0; height: 40px; display: flex; align-items: center; gap: 6px; padding: 0 4px 0 10px;
  border-radius: 10px; background: var(--mi-fill3); color: var(--mi-label2); font-size: 17px;
}
.is-compact .mi-search__box { height: 32px; gap: 8px; padding: 0 10px; border-radius: 8px; font-size: 13px; }
.mi-search__box::after {
  content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0;
  box-shadow: inset 0 0 0 1.5px var(--mi-p), 0 0 0 3px var(--mi-p-tint2); transition: opacity var(--mi-dur-2) var(--mi-ease);
}
.mi-search__box:focus-within::after { opacity: 1; }
.mi-search__box.is-disabled { opacity: .5; }
.mi-search__box svg { flex: none; }
.mi-search__input {
  flex: 1; min-width: 0; height: 100%; margin: 0; padding: 0; border: 0; background: transparent; color: var(--mi-label);
  font: inherit; letter-spacing: inherit; outline: none; -webkit-appearance: none; appearance: none;
}
.mi-search__input::placeholder { color: var(--mi-label2); opacity: 1; }
.mi-search__input::-webkit-search-cancel-button, .mi-search__input::-webkit-search-decoration { -webkit-appearance: none; display: none; }
.mi-search__clear {
  flex: none; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; border: 0;
  border-radius: 50%; background: transparent; color: var(--mi-label2); cursor: pointer; transition: transform var(--mi-dur-1) var(--mi-ease);
}
.mi-search__clear:active { transform: scale(.88); }
.mi-search__clear:focus-visible, .mi-search__cancel:focus-visible { outline: 3px solid color-mix(in srgb, var(--mi-p) 55%, transparent); outline-offset: 1px; }
.mi-search__cancel {
  flex: none; height: 40px; padding: 0 4px; border: 0; background: transparent; color: var(--mi-p-text); font: inherit; font-size: 17px;
  cursor: pointer; transform-origin: left center; animation: mi-search-in var(--mi-dur-3) var(--mi-ease) both;
}
.mi-search__kbd { flex: none; padding: 2px 6px; border-radius: 5px; box-shadow: inset 0 0 0 1px var(--mi-sep2); font: inherit; font-size: 11px; font-weight: 600; }
@keyframes mi-search-in { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: none; } }
</style>

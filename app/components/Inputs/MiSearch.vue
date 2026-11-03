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
    <span class="mi-search__box mi:relative mi:flex-1 mi:min-w-0 mi:h-10 mi:flex mi:items-center mi:gap-1.5 mi:pt-0 mi:pr-1 mi:pb-0 mi:pl-2.5 mi:rounded-[10px] mi:bg-fill3 mi:text-label2 mi:text-[17px] mi:[.is-compact_&]:h-8 mi:[.is-compact_&]:gap-2 mi:[.is-compact_&]:py-0 mi:[.is-compact_&]:px-2.5 mi:[.is-compact_&]:rounded-[8px] mi:[.is-compact_&]:text-[13px] mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:after:pointer-events-none mi:after:opacity-0 mi:after:shadow-[inset_0_0_0_1.5px_var(--mi-p),_0_0_0_3px_var(--mi-p-tint2)] mi:after:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:focus-within:after:opacity-100 mi:[&.is-disabled]:opacity-50" :class="{ 'is-disabled': disabled }">
      <svg class="mi:[.mi-search__box_&]:flex-[none]" :width="compact ? 15 : 18" :height="compact ? 15 : 18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>
      <input
        v-bind="inputAttrs" ref="el" v-model="model" class="mi-search__input mi:[&::-webkit-search-cancel-button]:[-webkit-appearance:none] mi:[&::-webkit-search-decoration]:[-webkit-appearance:none]" type="search" enterkeyhint="search"
        :aria-label="ariaLabel" :placeholder="placeholder" :disabled="disabled" autocomplete="off" @keydown="onKey"
      >
      <button v-if="hasText && !disabled" type="button" class="mi-search__clear mi:flex-[none] mi:flex mi:items-center mi:justify-center mi:w-8 mi:h-8 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:bg-transparent mi:text-label2 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.88)] mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[1px]" :aria-label="clearLabel" @click="clear">
        <svg class="mi:[.mi-search__box_&]:flex-[none]" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" /><path d="M9 9l6 6M15 9l-6 6" stroke-width="2" stroke-linecap="round" style="stroke: var(--mi-card)" /></svg>
      </button>
      <kbd v-else-if="compact && shortcut" class="mi-search__kbd mi:flex-[none] mi:py-0.5 mi:px-1.5 mi:rounded-[5px] mi:shadow-[inset_0_0_0_1px_var(--mi-sep2)]">{{ shortcut }}</kbd>
    </span>
    <button v-if="!compact && cancelable && hasText" type="button" class="mi-search__cancel mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[1px] mi:flex-[none] mi:h-10 mi:py-0 mi:px-1 mi:[border:0] mi:bg-transparent mi:text-p-text mi:cursor-pointer mi:origin-[left_center]" @click="cancel">{{ cancelLabel }}</button>
  </div>
</template>

<style scoped>
.mi-search { display: flex; align-items: center; gap: 12px; font-family: var(--mi-font); letter-spacing: -.01em; min-width: 0; }
.mi-search.is-compact { display: inline-flex; width: 280px; max-width: 100%; }
.mi-search__input {
  flex: 1; min-width: 0; height: 100%; margin: 0; padding: 0; border: 0; background: transparent; color: var(--mi-label);
  font: inherit; letter-spacing: inherit; outline: none; -webkit-appearance: none; appearance: none;
}
.mi-search__input::placeholder { color: var(--mi-label2); opacity: 1; }
.mi-search__input::-webkit-search-cancel-button, .mi-search__input::-webkit-search-decoration { display: none; }
.mi-search__cancel { font: inherit; font-size: 17px; animation: mi-search-in var(--mi-dur-3) var(--mi-ease) both;
}
.mi-search__kbd { font: inherit; font-size: 11px; font-weight: 600; }
@keyframes mi-search-in { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: none; } }
</style>

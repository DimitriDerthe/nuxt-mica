<script setup lang="ts">
/** Compact tag for labels or filters. `selectable` adds a v-model toggle, `removable` a remove button; tones primary, secondary, neutral. */
export type MiChipTone = 'primary' | 'secondary' | 'neutral'

defineSlots<{
  /** Custom chip content replacing the `label` text. */
  default?(): unknown
}>()

const props = withDefaults(defineProps<{
  /** Text of the chip. */
  label?: string
  /** Renders a toggle (`aria-pressed`) bound to `v-model`. */
  selectable?: boolean
  /** Adds a trailing remove button; Backspace and Delete also remove. */
  removable?: boolean
  /** Color treatment of the chip. */
  tone?: MiChipTone
  /** Chip height and text size. */
  size?: 'regular' | 'small'
  /** Blocks selecting and removing, and dims the chip. */
  disabled?: boolean
  /** Accessible name of the remove button. */
  removeLabel?: string
}>(), {
  tone: 'primary',
  size: 'regular'
})

const emit = defineEmits<{ remove: [] }>()
/** Whether the chip is selected (only with `selectable`). */
const model = defineModel<boolean>({ default: false })

function toggle() {
  if (!props.disabled) model.value = !model.value
}

function remove() {
  if (!props.disabled) emit('remove')
}

function onKeydown(e: KeyboardEvent) {
  if (props.removable && (e.key === 'Backspace' || e.key === 'Delete')) {
    e.preventDefault()
    remove()
  }
}
</script>

<template>
  <span
    class="mi-chip"
    :class="[`tone-${tone}`, `is-${size}`, { 'is-on': selectable && model, 'is-static': !selectable, 'is-removable': removable, 'is-disabled': disabled }]"
    @keydown="onKeydown"
  >
    <button v-if="selectable" type="button" class="mi-chip__main" :aria-pressed="model" :disabled="disabled" @click="toggle">
      <svg v-if="model" class="mi-chip__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
      <slot>{{ label }}</slot>
    </button>
    <span v-else class="mi-chip__main" :tabindex="removable && !disabled ? 0 : undefined"><slot>{{ label }}</slot></span>
    <button v-if="removable" type="button" class="mi-chip__x" :aria-label="removeLabel ?? (label ? `Remove ${label}` : 'Remove')" :disabled="disabled" tabindex="-1" @click="remove">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  </span>
</template>

<style scoped>
.mi-chip {
  --_tint: var(--mi-p-tint);
  --_fg: var(--mi-p-text);
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 32px;
  border-radius: 999px;
  font-family: var(--mi-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--mi-label);
  vertical-align: middle;
}
.mi-chip.is-small { height: 26px; font-size: 13px; }
.mi-chip.tone-secondary { --_tint: var(--mi-s-tint); --_fg: var(--mi-s-text); }
.mi-chip.tone-neutral { --_tint: var(--mi-fill); --_fg: var(--mi-label); }
.mi-chip.is-disabled { opacity: .4; }

/* Outline and tint are stacked layers cross-faded with opacity. */
.mi-chip::before,
.mi-chip::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  transition: opacity var(--mi-dur-2) ease;
}
.mi-chip::before { box-shadow: inset 0 0 0 1px var(--mi-sep2); }
.mi-chip::after { background: var(--_tint); opacity: 0; }
.mi-chip.is-on::before { opacity: 0; }
.mi-chip.is-on::after { opacity: 1; }
.mi-chip.is-static::before { background: var(--mi-fill3); box-shadow: none; }
.mi-chip.is-on { color: var(--_fg); }

.mi-chip__main {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  align-self: stretch;
  gap: 6px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font: inherit;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--mi-dur-2) var(--mi-spring);
}
.is-small .mi-chip__main { padding: 0 10px; }
.is-removable .mi-chip__main { padding-right: 6px; }
button.mi-chip__main:active:not(:disabled) { transform: scale(.96); }
button.mi-chip__main:disabled { cursor: default; }

.mi-chip__check { flex: none; animation: mi-chip-pop var(--mi-dur-3) var(--mi-spring) both; }
@keyframes mi-chip-pop {
  from { transform: scale(.3); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.mi-chip__x {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--mi-label2);
  -webkit-tap-highlight-color: transparent;
}
.is-small .mi-chip__x { margin-right: 5px; }
.mi-chip__x::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--mi-fill);
  opacity: 0;
  transition: opacity var(--mi-dur-1) ease;
}
.mi-chip__x:hover:not(:disabled)::before { opacity: 1; }
.mi-chip__x svg { position: relative; }
.mi-chip__x:disabled { cursor: default; }
</style>

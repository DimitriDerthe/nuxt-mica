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
    class="mi-chip mi:[--_tint:var(--mi-p-tint)] mi:[--_fg:var(--mi-p-text)] mi:before:pointer-events-none mi:after:pointer-events-none"
    :class="[`tone-${tone}`, `is-${size}`, { 'is-on': selectable && model, 'is-static': !selectable, 'is-removable': removable, 'is-disabled': disabled }]"
    @keydown="onKeydown"
  >
    <button v-if="selectable" type="button" class="mi-chip__main mi:relative mi:z-1 mi:inline-flex mi:items-center mi:self-stretch mi:gap-1.5 mi:py-0 mi:px-3.5 mi:[border:0] mi:rounded-[999px] mi:[background:transparent] mi:text-inherit mi:[font:inherit] mi:whitespace-nowrap mi:[-webkit-tap-highlight-color:transparent] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:[.is-small_&]:py-0 mi:[.is-small_&]:px-2.5 mi:[.is-removable_&]:pr-1.5" :aria-pressed="model" :disabled="disabled" @click="toggle">
      <svg v-if="model" class="mi-chip__check mi:flex-[none]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
      <slot>{{ label }}</slot>
    </button>
    <span v-else class="mi-chip__main mi:relative mi:z-1 mi:inline-flex mi:items-center mi:self-stretch mi:gap-1.5 mi:py-0 mi:px-3.5 mi:[border:0] mi:rounded-[999px] mi:[background:transparent] mi:text-inherit mi:[font:inherit] mi:whitespace-nowrap mi:[-webkit-tap-highlight-color:transparent] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:[.is-small_&]:py-0 mi:[.is-small_&]:px-2.5 mi:[.is-removable_&]:pr-1.5" :tabindex="removable && !disabled ? 0 : undefined"><slot>{{ label }}</slot></span>
    <button v-if="removable" type="button" class="mi-chip__x mi:relative mi:z-1 mi:inline-flex mi:items-center mi:justify-center mi:w-5 mi:h-5 mi:mr-2 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:[background:transparent] mi:text-label2 mi:[-webkit-tap-highlight-color:transparent] mi:[.is-small_&]:mr-[5px] mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[inherit] mi:before:[background:var(--mi-fill)] mi:before:opacity-0 mi:before:[transition:opacity_var(--mi-dur-1)_ease] mi:[&:hover:not(:disabled)]:before:opacity-100 mi:disabled:cursor-default" :aria-label="removeLabel ?? (label ? `Remove ${label}` : 'Remove')" :disabled="disabled" tabindex="-1" @click="remove">
      <svg class="mi:[.mi-chip__x_&]:relative" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  </span>
</template>

<style scoped>
.mi-chip {
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
.mi-chip::before, .mi-chip::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  transition: opacity var(--mi-dur-2) ease;
}
.mi-chip::before { box-shadow: inset 0 0 0 1px var(--mi-sep2); }
.mi-chip::after { background: var(--_tint); opacity: 0; }
.mi-chip.is-on::before { opacity: 0; }
.mi-chip.is-on::after { opacity: 1; }
.mi-chip.is-static::before { background: var(--mi-fill3); box-shadow: none; }
.mi-chip.is-on { color: var(--_fg); }
button.mi-chip__main:active:not(:disabled) { transform: scale(.96); }
button.mi-chip__main:disabled { cursor: default; }

.mi-chip__check { animation: mi-chip-pop var(--mi-dur-3) var(--mi-spring) both; }
@keyframes mi-chip-pop {
  from { transform: scale(.3); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>

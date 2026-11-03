<script setup lang="ts">
/** Two-state pressed button (bold, italic, mute) bound to a boolean v-model. Variants `default` or `outline`; sizes `sm`, `default`, `lg`. */
export type MiToggleVariant = 'default' | 'outline'
export type MiToggleSize = 'sm' | 'default' | 'lg'

defineSlots<{
  /** Toggle content, given the pressed state so the icon or text can change. */
  default?(props: { pressed: boolean }): unknown
}>()

const props = withDefaults(defineProps<{
  /** `outline` adds a hairline border. */
  variant?: MiToggleVariant
  /** Control height: 32px, 36px or 44px. */
  size?: MiToggleSize
  /** Blocks interaction and dims the control. */
  disabled?: boolean
  /** Accessible name, required for icon-only toggles. */
  label?: string
}>(), {
  variant: 'default',
  size: 'default'
})

/** Pressed state. */
const model = defineModel<boolean>('pressed', { default: false })

function toggle() {
  if (!props.disabled) model.value = !model.value
}
</script>

<template>
  <button
    type="button"
    class="mi-toggle mi:inline-flex mi:items-center mi:justify-center mi:gap-1.5 mi:min-w-(--_h) mi:h-(--_h) mi:whitespace-nowrap mi:cursor-pointer mi:[-webkit-tap-highlight-color:transparent] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring),_opacity_var(--mi-dur-1)_ease] mi:active:transform-[scale(.96)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:disabled:opacity-40 mi:disabled:cursor-default mi:disabled:pointer-events-none"
    :class="[`is-${variant}`, `is-${size}`, { 'is-on': model }]"
    :aria-pressed="model"
    :aria-label="label"
    :data-state="model ? 'on' : 'off'"
    :disabled="disabled"
    @click="toggle"
  >
    <slot :pressed="model" />
  </button>
</template>

<style scoped>
.mi-toggle {
  padding: 0 10px;
  border: .5px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--mi-label);
  font: inherit;
  font-family: var(--mi-font);
  font-size: 14px;
  font-weight: 500;
}
.mi-toggle.is-sm { --_h: 32px; font-size: 13px; padding: 0 8px; }
.mi-toggle.is-default { --_h: 36px; }
.mi-toggle.is-lg { --_h: 44px; font-size: 15px; padding: 0 14px; }
.mi-toggle.is-outline { border-color: var(--mi-sep); }
.mi-toggle:hover { background: var(--mi-fill3); }
.mi-toggle.is-on { background: var(--mi-p-tint); color: var(--mi-p-text); }
</style>

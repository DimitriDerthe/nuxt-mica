<script setup lang="ts">
/** @internal Internal field surface: border, focus ring (opacity only), error / success / disabled states. */
withDefaults(defineProps<{
  /** Root element tag. Defaults to span. */
  tag?: string
  /** Field height: `sm` is compact, `md` the standard size. */
  size?: 'sm' | 'md'
  /** Draws the error border and focus ring. */
  invalid?: boolean
  /** Draws the success border and focus ring. */
  success?: boolean
  /** Dims the surface and blocks pointer interaction. */
  disabled?: boolean
}>(), { tag: 'span', size: 'md' })
defineSlots<{
  /** The control rendered inside the field surface. */
  default?(): unknown
}>()
</script>

<template>
  <component
    :is="tag"
    class="mi-box"
    :disabled="tag === 'button' && disabled ? true : undefined"
    :class="[`mi-box--${size}`, { 'is-invalid': invalid, 'is-success': success && !invalid, 'is-disabled': disabled }]"
  >
    <slot />
  </component>
</template>

<style scoped>
.mi-box {
  --mi-box-r: 10px;
  --mi-ring: var(--mi-p);
  --mi-halo: var(--mi-p-tint2);
  position: relative; display: flex; align-items: center; width: 100%; min-width: 0; min-height: 44px;
  margin: 0; padding: 0; border: 0; border-radius: var(--mi-box-r); background: var(--mi-field);
  box-shadow: inset 0 0 0 1px var(--mi-field-b); color: var(--mi-label);
  font-family: var(--mi-font); font-size: 17px; letter-spacing: -.01em; text-align: left;
}
.mi-box--sm { --mi-box-r: 8px; min-height: 36px; font-size: 15px; }
.mi-box::after {
  content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0;
  box-shadow: inset 0 0 0 1.5px var(--mi-ring), 0 0 0 4px var(--mi-halo);
  transition: opacity var(--mi-dur-2) var(--mi-ease);
}
.mi-box:focus-within::after { opacity: 1; }
.mi-box:focus-visible { outline: none; }
.is-invalid { --mi-ring: var(--mi-red-t); --mi-halo: color-mix(in srgb, var(--mi-red) 24%, transparent); box-shadow: inset 0 0 0 1.5px var(--mi-red-t); }
.is-success { --mi-ring: var(--mi-green-t); --mi-halo: color-mix(in srgb, var(--mi-green) 24%, transparent); box-shadow: inset 0 0 0 1.5px var(--mi-green-t); }
.is-disabled { background: var(--mi-fill4); box-shadow: none; color: var(--mi-label3); cursor: not-allowed; }
.is-disabled::after { display: none; }
</style>

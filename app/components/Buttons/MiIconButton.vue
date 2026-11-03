<script setup lang="ts">
/** Icon-only button, always labelled, for toolbars and compact actions: 4 variants, 4 sizes, optional pressed toggle. */
import { computed } from 'vue'
import type { MiBrand, MiButtonState, MiIconButtonShape, MiIconButtonSize, MiIconButtonVariant } from '../../utils/miButtons'

const props = withDefaults(defineProps<{
  /** Accessible name. Icon buttons are always labelled. */
  label: string
  /** Visual style of the button, from the most to the least emphasized. */
  variant?: MiIconButtonVariant
  /** Color family used by the button: primary, secondary or a semantic one. */
  brand?: MiBrand
  /** Diameter or height of the button, including the toolbar size. */
  size?: MiIconButtonSize
  /** Defaults to circle, or rounded for the toolbar size. */
  shape?: MiIconButtonShape
  /** Sets `aria-pressed` and the pressed look (toolbar toggles). */
  pressed?: boolean
  /** Blocks interaction and dims the button. */
  disabled?: boolean
  /** Native button type; use submit inside forms. */
  type?: 'button' | 'submit' | 'reset'
  /** Forces a visual state: rest, hover or focus (docs and visual tests). */
  state?: MiButtonState
}>(), {
  variant: 'filled',
  brand: 'primary',
  size: 'large',
  type: 'button',
  state: 'rest',
  shape: undefined,
  pressed: undefined
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const resolvedShape = computed(() => props.shape ?? (props.size === 'toolbar' ? 'rounded' : 'circle'))

function onClick(e: MouseEvent) {
  if (props.disabled) {
    e.preventDefault()
    e.stopPropagation()
    return
  }
  emit('click', e)
}

const _slots = defineSlots<{
  /** The icon to display. */
  default?(): unknown
}>()
</script>

<template>
  <button
    class="mi-icon-btn mi:[--_solid:var(--mi-p)] mi:[--_on:var(--mi-p-on)] mi:[--_text:var(--mi-p-text)] mi:[--w:44px] mi:[--h:44px] mi:[--icon:20px] mi:[--r:50%] mi:[-webkit-tap-highlight-color:transparent] mi:isolate mi:after:pointer-events-none"
    :class="[
      `mi-icon-btn--${variant}`,
      `mi-icon-btn--${size}`,
      `mi-icon-btn--${brand}`,
      `mi-icon-btn--${resolvedShape}`,
      { 'is-pressed': pressed, 'is-disabled': disabled, 'is-hover': state === 'hover', 'is-focus': state === 'focus' }
    ]"
    :type="type"
    :aria-label="label"
    :aria-pressed="pressed"
    :disabled="disabled ? true : undefined"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<style scoped>
.mi-icon-btn {
  --_tint: var(--mi-p-tint);
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  box-sizing: border-box;
  width: var(--w);
  height: var(--h);
  padding: 0;
  border: 0;
  border-radius: var(--r);
  background: transparent;
  color: var(--mi-label2);
  font-family: var(--mi-font);
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  transition: transform var(--mi-dur-1) var(--mi-ease);
}
.mi-icon-btn--secondary {
  --_solid: var(--mi-s);
  --_on: var(--mi-s-on);
  --_tint: var(--mi-s-tint);
  --_text: var(--mi-s-text);
}

.mi-icon-btn--regular { --w: 36px; --h: 36px; }
.mi-icon-btn--small { --w: 30px; --h: 30px; --icon: 14px; }
.mi-icon-btn--toolbar { --w: 36px; --h: 32px; --r: 8px; }
.mi-icon-btn--rounded { --r: 8px; }
.mi-icon-btn--circle { --r: 50%; }
.mi-icon-btn--small.mi-icon-btn--rounded { --r: 8px; }

.mi-icon-btn :deep(svg) {
  width: var(--mi-icon, var(--icon));
  height: var(--mi-icon, var(--icon));
  flex: none;
  position: relative;
  z-index: 1;
}

.mi-icon-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--mi-label);
  opacity: 0;
  transition: opacity var(--mi-dur-2) var(--mi-ease);
}
@media (hover: hover) {
  .mi-icon-btn:hover:not(.is-disabled)::after { opacity: 0.06; }
}
.mi-icon-btn.is-hover:not(.is-disabled)::after { opacity: 0.06; }
.mi-icon-btn:active:not(.is-disabled) { transform: scale(0.94); }
.mi-icon-btn:active:not(.is-disabled)::after { opacity: 0.1; }

.mi-icon-btn:focus-visible,
.mi-icon-btn.is-focus {
  outline: 3px solid color-mix(in srgb, var(--mi-p) 55%, transparent);
  outline-offset: 2px;
}
.mi-icon-btn:focus:not(:focus-visible):not(.is-focus) { outline: none; }

.mi-icon-btn--filled { background: var(--_solid); color: var(--_on); }
.mi-icon-btn--tinted { background: var(--_tint); color: var(--_text); }
.mi-icon-btn--gray { background: var(--mi-fill3); color: var(--mi-label); }
.mi-icon-btn--gray.mi-icon-btn--small { color: var(--mi-label2); }
.mi-icon-btn--plain { background: transparent; color: var(--mi-label2); }
.mi-icon-btn.is-pressed { background: var(--mi-fill3); color: var(--mi-label); }

.mi-icon-btn.is-disabled { cursor: default; color: var(--mi-label3); background: var(--mi-fill3); }
.mi-icon-btn.is-disabled.mi-icon-btn--tinted,
.mi-icon-btn.is-disabled.mi-icon-btn--gray { background: var(--mi-fill4); }
.mi-icon-btn.is-disabled.mi-icon-btn--plain { background: transparent; }
</style>

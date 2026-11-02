<script setup lang="ts">
/** Button for actions and CTAs: 6 variants (filled, tinted, gray, plain, bordered, destructive), renders an anchor when href is set. */
import { computed } from 'vue'
import type { MiBrand, MiButtonSize, MiButtonState, MiButtonVariant } from '../../utils/miButtons'
import { miSafeHref } from '../../utils/miSafe'

defineOptions({ inheritAttrs: true })

const props = withDefaults(defineProps<{
  /** Visual style of the button, from the most to the least emphasized. */
  variant?: MiButtonVariant
  /** Color family used by the button: primary, secondary or a semantic one. */
  brand?: MiBrand
  /** Height and padding of the button. */
  size?: MiButtonSize
  /** Shows a busy state, sets aria-busy and blocks clicks like disabled. */
  loading?: boolean
  /** Blocks interaction and dims the button. */
  disabled?: boolean
  /** Stretches to the full width of the container. */
  block?: boolean
  /** Destructive variant only: gray background with red text. */
  soft?: boolean
  /** Renders an anchor instead of a button. */
  href?: string
  /** Native button type; use submit inside forms. Ignored when href is set. */
  type?: 'button' | 'submit' | 'reset'
  /** Sets `aria-pressed` for toggle buttons. */
  pressed?: boolean
  /** Forces a visual state (docs and visual tests). */
  state?: MiButtonState
}>(), {
  variant: 'filled',
  brand: 'primary',
  size: 'regular',
  type: 'button',
  state: 'rest',
  pressed: undefined
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const isLink = computed(() => !!props.href)
const inactive = computed(() => props.disabled || props.loading)

function onClick(e: MouseEvent) {
  if (inactive.value) {
    e.preventDefault()
    e.stopPropagation()
    return
  }
  emit('click', e)
}

const _slots = defineSlots<{
  /** Icon shown before the label; replaced by the spinner while loading. */
  leading?(): unknown
  /** Label of the button. */
  default?(): unknown
  /** Icon shown after the label. */
  trailing?(): unknown
}>()
</script>

<template>
  <component
    :is="isLink ? 'a' : 'button'"
    class="mi-btn"
    :class="[
      `mi-btn--${variant}`,
      `mi-btn--${size}`,
      `mi-btn--${brand}`,
      {
        'is-block': block,
        'is-soft': soft,
        'is-disabled': disabled,
        'is-busy': loading,
        'is-hover': state === 'hover',
        'is-focus': state === 'focus',
        'has-lead': loading || $slots.leading,
        'has-trail': $slots.trailing
      }
    ]"
    :type="isLink ? undefined : type"
    :href="isLink && !disabled ? miSafeHref(href) : undefined"
    :disabled="!isLink && disabled ? true : undefined"
    :aria-disabled="isLink && disabled ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    :aria-pressed="pressed"
    :tabindex="isLink && disabled ? -1 : undefined"
    :role="isLink && disabled ? 'link' : undefined"
    @click="onClick"
  >
    <span v-if="loading" class="mi-btn__spin" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
        <path d="M12 3a9 9 0 019 9" />
        <path d="M21 12a9 9 0 11-9-9" opacity=".3" />
      </svg>
    </span>
    <span v-else-if="$slots.leading" class="mi-btn__icon"><slot name="leading" /></span>
    <span v-if="$slots.default" class="mi-btn__label"><slot /></span>
    <span v-if="$slots.trailing" class="mi-btn__icon"><slot name="trailing" /></span>
  </component>
</template>

<style scoped>
.mi-btn {
  --_solid: var(--mi-p);
  --_on: var(--mi-p-on);
  --_tint: var(--mi-p-tint);
  --_text: var(--mi-p-text);
  --h: 36px; --px-base: 16px; --r: 10px; --fs: 15px; --fw: 600; --icon: 18px; --gap: 6px;
  --px: var(--px-base);
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--gap);
  box-sizing: border-box;
  height: var(--h);
  padding: 0 var(--px);
  border: 0;
  border-radius: var(--r);
  background: var(--mi-fill3);
  color: var(--mi-label);
  font-family: var(--mi-font);
  font-size: var(--fs);
  font-weight: var(--fw);
  letter-spacing: -0.01em;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
  isolation: isolate;
  transition: transform var(--mi-dur-1) var(--mi-ease);
}
.mi-btn--secondary {
  --_solid: var(--mi-s);
  --_on: var(--mi-s-on);
  --_tint: var(--mi-s-tint);
  --_text: var(--mi-s-text);
}

/* sizes */
.mi-btn--mini { --h: 24px; --px-base: 10px; --r: 6px; --fs: 12px; --icon: 14px; --gap: 4px; }
.mi-btn--small { --h: 30px; --px-base: 12px; --r: 8px; --fs: 13px; --icon: 16px; --gap: 5px; }
.mi-btn--large { --h: 44px; --px-base: 22px; --r: 12px; --fs: 17px; --icon: 20px; --gap: 8px; }
.mi-btn--capsule { --h: 48px; --px-base: 28px; --r: 999px; --fs: 17px; --fw: 500; --icon: 20px; --gap: 8px; }
.mi-btn--xlarge { --h: 50px; --px-base: 24px; --r: 14px; --fs: 17px; --icon: 20px; --gap: 8px; }
.is-block { display: flex; width: 100%; }

/* hover overlay: label color darkens in light mode and lightens in dark mode, compositor only */
.mi-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--mi-label);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--mi-dur-2) var(--mi-ease);
}
@media (hover: hover) {
  .mi-btn:hover:not(.is-disabled):not(.is-busy)::after { opacity: 0.06; }
}
.mi-btn.is-hover:not(.is-disabled)::after { opacity: 0.06; }
.mi-btn:active:not(.is-disabled):not(.is-busy) { transform: scale(0.97); }
.mi-btn:active:not(.is-disabled):not(.is-busy)::after { opacity: 0.1; }

.mi-btn:focus-visible,
.mi-btn.is-focus {
  outline: 3px solid color-mix(in srgb, var(--mi-p) 55%, transparent);
  outline-offset: 2px;
}
.mi-btn:focus:not(:focus-visible):not(.is-focus) { outline: none; }

/* variants */
.mi-btn--filled { background: var(--_solid); color: var(--_on); }
.mi-btn--tinted { background: var(--_tint); color: var(--_text); }
.mi-btn--gray { background: var(--mi-fill3); color: var(--mi-label); }
.mi-btn--bordered {
  --fw: 500;
  background: var(--mi-card);
  color: var(--mi-label);
  border: 1px solid var(--mi-sep2);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
}
.mi-btn--plain { --fw: 500; --px: calc(var(--px-base) / 2); --gap: 2px; background: transparent; color: var(--_text); }
.mi-btn--destructive { background: var(--mi-red-t); color: #fff; }
.mi-btn--destructive.is-soft { background: var(--mi-fill3); color: var(--mi-red-t); }

/* icon spacing: icon sits closer to the edge than the label */
.mi-btn.has-lead:not(.mi-btn--plain) { padding-left: calc(var(--px) - 4px); }
.mi-btn.has-trail:not(.mi-btn--plain) { padding-right: calc(var(--px) - 4px); }
.mi-btn.is-busy:not(.mi-btn--plain) { --gap: 8px; padding-left: calc(var(--px) - 2px); }

/* disabled */
.mi-btn.is-disabled { cursor: default; background: var(--mi-fill3); color: var(--mi-label3); box-shadow: none; }
.mi-btn.is-disabled.mi-btn--tinted,
.mi-btn.is-disabled.mi-btn--gray,
.mi-btn.is-disabled.is-soft { background: var(--mi-fill4); }
.mi-btn.is-disabled.mi-btn--bordered { background: transparent; border-color: var(--mi-sep); }
.mi-btn.is-disabled.mi-btn--plain { background: transparent; }
.mi-btn.is-busy { cursor: progress; }

.mi-btn__label { position: relative; z-index: 1; }
.mi-btn__icon,
.mi-btn__spin { position: relative; z-index: 1; display: inline-flex; align-items: center; justify-content: center; flex: none; }
.mi-btn__icon :deep(svg),
.mi-btn__spin svg { width: var(--icon); height: var(--icon); flex: none; }
.mi-btn__spin { width: 16px; height: 16px; }
.mi-btn__spin svg { width: 16px; height: 16px; animation: mi-btn-spin 0.9s linear infinite; will-change: transform; }

@keyframes mi-btn-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .mi-btn__spin svg { animation-duration: 2.4s !important; animation-iteration-count: infinite !important; }
}
</style>

<script setup lang="ts">
/** Groups related buttons: attached strip, segmented selector bound to v-model, or split button with a primary action and menu. */
import { ref } from 'vue'
import type { MiButtonGroupVariant, MiSegmentOption } from '../../utils/miButtons'

const props = withDefaults(defineProps<{
  /** attached: put MiButton or MiIconButton children in the default slot, they render as one bordered strip. segmented: pass `options` and v-model. split: a MiButton for the main action, then a MiMenu whose `#trigger="{ props }"` renders `<MiButton v-bind="props">` with a chevron. */
  variant?: MiButtonGroupVariant
  /** Accessible name of the group. */
  label: string
  /** Segmented only: renders the options as toggle buttons bound to v-model. */
  options?: MiSegmentOption[]
}>(), { variant: 'attached', options: undefined })

/** Value of the selected option in `segmented` mode. */

const model = defineModel<string | number | undefined>()
const emit = defineEmits<{ change: [value: string | number] }>()

const root = ref<HTMLElement | null>(null)

function select(o: MiSegmentOption) {
  if (o.disabled || model.value === o.value) return
  model.value = o.value
  emit('change', o.value)
}

function onKeydown(e: KeyboardEvent) {
  if (props.variant !== 'segmented' || !props.options) return
  const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (!keys.includes(e.key) || !root.value) return
  const btns = Array.from(root.value.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
  const i = btns.indexOf(document.activeElement as HTMLButtonElement)
  if (i < 0) return
  e.preventDefault()
  let n = i
  if (e.key === 'ArrowRight') n = (i + 1) % btns.length
  else if (e.key === 'ArrowLeft') n = (i - 1 + btns.length) % btns.length
  else if (e.key === 'Home') n = 0
  else n = btns.length - 1
  btns[n]?.focus()
}

const _slots = defineSlots<{
  /** Custom content of each segmented option; defaults to its label. */
  option?(props: { option: MiSegmentOption, selected: boolean }): unknown
  /** The buttons or menu to group, for the attached and split variants. */
  default?(): unknown
}>()
</script>

<template>
  <span ref="root" class="mi-bgroup mi:inline-flex mi:align-middle" :class="`mi-bgroup--${variant}`" role="group" :aria-label="label" @keydown="onKeydown">
    <template v-if="variant === 'segmented' && options">
      <button
        v-for="o in options"
        :key="o.value"
        type="button"
        class="mi-bgroup__seg mi:relative mi:inline-flex mi:items-center mi:justify-center mi:min-w-8.5 mi:h-7 mi:p-0 mi:[border:0] mi:rounded-[7px] mi:bg-transparent mi:text-label2 mi:tracking-[-0.01em] mi:whitespace-nowrap mi:cursor-pointer mi:[-webkit-tap-highlight-color:transparent] mi:isolate mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:-z-1 mi:before:rounded-[inherit] mi:before:bg-seg mi:before:shadow-[0_1px_3px_rgba(0,_0,_0,_0.12)] mi:before:opacity-0 mi:before:transform-[scale(0.9)] mi:before:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)] mi:[&.is-on]:before:opacity-100 mi:[&.is-on]:before:transform-none mi:[&:active:not(:disabled)]:transform-[scale(0.95)] mi:disabled:cursor-default mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[2px]"
        :class="{ 'is-on': model === o.value, 'has-label': !!o.label }"
        :aria-pressed="model === o.value"
        :aria-label="o.ariaLabel"
        :disabled="o.disabled ? true : undefined"
        @click="select(o)"
      >
        <span class="mi-bgroup__seg-in mi:inline-flex mi:items-center mi:justify-center">
          <slot name="option" :option="o" :selected="model === o.value">{{ o.label }}</slot>
        </span>
      </button>
    </template>
    <slot v-else />
  </span>
</template>

<style scoped>
.mi-bgroup { font-family: var(--mi-font); }

/* attached */
.mi-bgroup--attached {
  border: 1px solid var(--mi-sep2);
  border-radius: 8px;
  overflow: hidden;
  background: var(--mi-card);
}
.mi-bgroup--attached :deep(.mi-icon-btn:not(.is-disabled)) { color: var(--mi-label); }
.mi-bgroup--attached :deep(.mi-icon-btn) { --w: 36px; --h: 30px; --r: 0; background: transparent; }
.mi-bgroup--attached :deep(.mi-btn) { --r: 0; border: 0; box-shadow: none; background: transparent; }

/* split */
.mi-bgroup--split { border-radius: 10px; overflow: hidden; }
.mi-bgroup--split :deep(.mi-btn) { --r: 0; }
.mi-bgroup--split :deep(.mi-icon-btn) { --r: 0; --h: 36px; }

/* dividers between neighbours, including a menu wrapper in between */
.mi-bgroup--attached :deep(.mi-btn + .mi-btn),
.mi-bgroup--attached :deep(.mi-btn + .mi-menu > .mi-btn),
.mi-bgroup--attached :deep(.mi-icon-btn + .mi-icon-btn),
.mi-bgroup--attached :deep(.mi-icon-btn + .mi-menu > .mi-icon-btn),
.mi-bgroup--attached :deep(.mi-btn + .mi-icon-btn),
.mi-bgroup--attached :deep(.mi-icon-btn + .mi-btn) { box-shadow: inset 1px 0 0 var(--mi-sep2); }
.mi-bgroup--split :deep(.mi-btn + .mi-btn),
.mi-bgroup--split :deep(.mi-btn + .mi-menu > .mi-btn),
.mi-bgroup--split :deep(.mi-btn + .mi-icon-btn),
.mi-bgroup--split :deep(.mi-btn + .mi-menu > .mi-icon-btn),
.mi-bgroup--split :deep(.mi-icon-btn + .mi-icon-btn) { box-shadow: inset 1px 0 0 color-mix(in srgb, currentColor 30%, transparent); }
.mi-bgroup--split :deep(.mi-menu > .mi-btn) { padding: 0; width: 34px; }

/* segmented */
.mi-bgroup--segmented { gap: 2px; padding: 2px; border-radius: 9px; background: var(--mi-fill3); }
.mi-bgroup__seg {
  font: inherit;
  font-size: 13px;
  font-weight: 500;
}
.mi-bgroup__seg.has-label { padding: 0 12px; }
.mi-bgroup__seg.is-on { color: var(--mi-label); }
.mi-bgroup__seg:disabled { color: var(--mi-label3); }
.mi-bgroup__seg-in :deep(svg) { width: 16px; height: 16px; }
</style>

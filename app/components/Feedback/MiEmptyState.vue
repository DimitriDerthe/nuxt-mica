<script setup lang="ts">
/** Placeholder for an empty list or screen with a glyph, text and up to two actions; `card` wraps it in a surface. */
import MiFbIcon, { type MiFbIconName } from './MiFbIcon.vue'

withDefaults(defineProps<{
  /** Heading of the placeholder. */
  title: string
  /** Supporting text under the title, shown when no default slot is given. */
  description?: string
  /** Built-in glyph in the tinted circle. Use the `icon` slot for custom artwork. */
  icon?: MiFbIconName
  /** Text of the main action button, which emits `primary`; omitted when empty. */
  primaryLabel?: string
  /** Text of the secondary action button, which emits `secondary`; omitted when empty. */
  secondaryLabel?: string
  /** Wrap in a card surface. */
  card?: boolean
  /** Heading element. */
  as?: 'h2' | 'h3' | 'h4'
}>(), {
  icon: 'folder-plus',
  as: 'h3'
})

const emit = defineEmits<{
  primary: []
  secondary: []
}>()

defineSlots<{
  /** Custom artwork inside the tinted circle, replacing the `icon` glyph. */
  icon?(): unknown
  /** Description content; replaces the `description` prop. */
  default?(): unknown
  /** Replaces the built-in primary and secondary buttons. */
  actions?(): unknown
}>()
</script>

<template>
  <div class="mi-es mi:flex-col mi:text-center" :class="{ 'is-card': card }">
    <span class="mi-es-icon mi:w-16 mi:h-16 mi:rounded-[50%] mi:bg-p-tint mi:text-p-text mi:flex mi:items-center mi:justify-center"><slot name="icon"><MiFbIcon :name="icon" :size="30" :stroke="1.8" /></slot></span>
    <component :is="['h2', 'h3', 'h4'].includes(as) ? as : 'h3'" class="mi-es-title">{{ title }}</component>
    <p v-if="description || $slots.default" class="mi-es-desc mi:m-0 mi:max-w-75 mi:text-[15px] mi:leading-[21px] mi:text-label2"><slot>{{ description }}</slot></p>
    <div v-if="primaryLabel || secondaryLabel || $slots.actions" class="mi-es-actions mi:flex mi:flex-wrap mi:justify-center mi:gap-2.5 mi:pt-1.5">
      <slot name="actions">
        <button v-if="primaryLabel" type="button" class="mi-es-btn is-primary mi:appearance-none mi:h-9 mi:py-0 mi:px-4 mi:m-0 mi:[border:0] mi:rounded-[10px] mi:bg-fill3 mi:text-label mi:font-[inherit] mi:text-[15px] mi:font-semibold mi:cursor-pointer mi:[&.is-primary]:bg-p mi:[&.is-primary]:text-p-on mi:[&.is-primary:hover]:bg-p-hover mi:[&:not(.is-primary):active]:bg-fill2 mi:[&.is-primary:active]:opacity-85" @click="emit('primary')">{{ primaryLabel }}</button>
        <button v-if="secondaryLabel" type="button" class="mi-es-btn mi:appearance-none mi:h-9 mi:py-0 mi:px-4 mi:m-0 mi:[border:0] mi:rounded-[10px] mi:bg-fill3 mi:text-label mi:font-[inherit] mi:text-[15px] mi:font-semibold mi:cursor-pointer mi:[&.is-primary]:bg-p mi:[&.is-primary]:text-p-on mi:[&.is-primary:hover]:bg-p-hover mi:[&:not(.is-primary):active]:bg-fill2 mi:[&.is-primary:active]:opacity-85" @click="emit('secondary')">{{ secondaryLabel }}</button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.mi-es{display:flex;align-items:center;gap:12px;padding:32px 24px;font-family:var(--mi-font);color:var(--mi-label);letter-spacing:-.01em}
.mi-es.is-card{background:var(--mi-card);border-radius:20px;box-shadow:var(--mi-sh1)}
.mi-es-title{margin:4px 0 0;font-size:20px;line-height:25px;font-weight:600;letter-spacing:-.015em}
</style>

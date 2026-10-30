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
  <div class="mi-es" :class="{ 'is-card': card }">
    <span class="mi-es-icon"><slot name="icon"><MiFbIcon :name="icon" :size="30" :stroke="1.8" /></slot></span>
    <component :is="as" class="mi-es-title">{{ title }}</component>
    <p v-if="description || $slots.default" class="mi-es-desc"><slot>{{ description }}</slot></p>
    <div v-if="primaryLabel || secondaryLabel || $slots.actions" class="mi-es-actions">
      <slot name="actions">
        <button v-if="primaryLabel" type="button" class="mi-es-btn is-primary" @click="emit('primary')">{{ primaryLabel }}</button>
        <button v-if="secondaryLabel" type="button" class="mi-es-btn" @click="emit('secondary')">{{ secondaryLabel }}</button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.mi-es{display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;padding:32px 24px;font-family:var(--mi-font);color:var(--mi-label);letter-spacing:-.01em}
.mi-es.is-card{background:var(--mi-card);border-radius:20px;box-shadow:var(--mi-sh1)}
.mi-es-icon{width:64px;height:64px;border-radius:50%;background:var(--mi-p-tint);color:var(--mi-p-text);display:flex;align-items:center;justify-content:center}
.mi-es-title{margin:4px 0 0;font-size:20px;line-height:25px;font-weight:600;letter-spacing:-.015em}
.mi-es-desc{margin:0;max-width:300px;font-size:15px;line-height:21px;color:var(--mi-label2)}
.mi-es-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;padding-top:6px}
.mi-es-btn{appearance:none;height:36px;padding:0 16px;margin:0;border:0;border-radius:10px;background:var(--mi-fill3);color:var(--mi-label);font-family:inherit;font-size:15px;font-weight:600;cursor:pointer}
.mi-es-btn.is-primary{background:var(--mi-p);color:var(--mi-p-on)}
.mi-es-btn.is-primary:hover{background:var(--mi-p-hover)}
.mi-es-btn:not(.is-primary):active{background:var(--mi-fill2)}
.mi-es-btn.is-primary:active{opacity:.85}
</style>

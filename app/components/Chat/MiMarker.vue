<script setup lang="ts">
/** Conversation marker: inline status or note, or a labeled divider (date, unread) between messages; can be a link or button. */
import { computed } from 'vue'
import { miSafeHref } from '../../utils/miSafe'

const props = withDefaults(defineProps<{
  /** `default` inline marker, `border` adds a bottom border, `separator` centers the label between divider lines. */
  variant?: 'default' | 'border' | 'separator'
  /** Render as a link (`a`, needs `href`) or `button` to make the marker actionable. */
  as?: 'div' | 'a' | 'button'
  /** Link target when `as="a"`. */
  href?: string
  /** Set to `status` for in-progress markers so assistive tech announces them. */
  role?: string
}>(), { variant: 'default', as: 'div' })

// `as` is a union at type level only; anything else renders the default div.
const as = computed(() => (['div', 'a', 'button'].includes(props.as) ? props.as : 'div'))
const tag = computed(() => (props.href && as.value === 'div' ? 'a' : as.value))
const attrs = computed(() => (tag.value === 'a' ? { href: miSafeHref(props.href) } : tag.value === 'button' ? { type: 'button' } : {}))

defineSlots<{
  /** Marker label such as a date, status text or "New messages". */
  default?(): unknown
  /** Decorative icon shown before the label. */
  icon?(): unknown
}>()
</script>

<template>
  <component :is="tag" v-bind="attrs" :role="role" class="mi-mk" :class="[`mi-mk--${variant}`, { 'mi-mk--act': tag !== 'div' }]">
    <span v-if="$slots.icon" class="mi-mk__i mi:inline-flex mi:flex-[none]" aria-hidden="true"><slot name="icon" /></span>
    <span class="mi-mk__t"><slot /></span>
  </component>
</template>

<style scoped>
.mi-mk{display:flex;align-items:center;gap:6px;box-sizing:border-box;padding:4px 0;border:0;background:none;font:inherit;font-family:var(--mi-font);font-size:12px;font-weight:500;color:var(--mi-label2);text-decoration:none;text-align:start}
.mi-mk--border{padding-block:6px;border-block-end:1px solid var(--mi-sep2)}
.mi-mk--separator{justify-content:center;gap:12px;text-transform:uppercase;letter-spacing:.04em}
.mi-mk--separator::before,.mi-mk--separator::after{content:"";flex:1;height:1px;background:var(--mi-sep2)}
.mi-mk--act{cursor:pointer;transition:opacity var(--mi-dur-2) var(--mi-ease)}
.mi-mk--act:hover{opacity:.7}
.mi-mk--act:focus-visible{outline:2px solid var(--mi-p);outline-offset:2px;border-radius:6px}
</style>

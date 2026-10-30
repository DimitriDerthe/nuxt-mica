<script setup lang="ts">
/** Overlapping row of MiAvatar for team or member lists, collapsing the rest into "+N". Use with `items` and a `max` cap. */
import { computed } from 'vue'
import MiAvatar from './MiAvatar.vue'
import type { MiAvatarSize, MiAvatarTone } from './MiAvatar.vue'

export interface MiAvatarGroupItem {
  name: string
  src?: string
  tone?: MiAvatarTone
  initials?: string
}

const props = withDefaults(defineProps<{
  /** Members to display, in order; the first `max` are shown. */
  items: MiAvatarGroupItem[]
  /** Maximum avatars shown before collapsing the rest into "+N". */
  max?: number
  /** Preset (xs to xl, see MiAvatar) or px. Default 36px. */
  size?: MiAvatarSize
  /** Circle or rounded square outline of every avatar. */
  shape?: 'circle' | 'square'
  /** Override the generated accessible label. */
  label?: string
}>(), { max: 3, size: 36, shape: 'circle' })

const TONES: MiAvatarTone[] = ['primary', 'secondary', 'teal', 'indigo', 'green', 'pink']

const visible = computed(() => props.items.slice(0, Math.max(0, props.max)))
const extra = computed(() => Math.max(0, props.items.length - visible.value.length))
const px = computed(() => (typeof props.size === 'number' ? props.size : ({ xs: 24, sm: 32, md: 44, lg: 64, xl: 80 }[props.size] ?? 36)))

const summary = computed(() => {
  if (props.label) return props.label
  const names = visible.value.map(i => i.name.trim().split(/\s+/)[0] ?? '')
  if (!names.length) return 'No members'
  const rest = extra.value
  if (rest > 0) return `${names.join(', ')} and ${rest} ${rest === 1 ? 'other' : 'others'}`
  if (names.length === 1) return names[0]!
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
})
</script>

<template>
  <span class="mi-avg" role="img" :aria-label="summary" :style="{ '--mi-avg-o': Math.round(px * 0.2) + 'px' }">
    <MiAvatar
      v-for="(it, i) in visible"
      :key="it.name + i"
      class="mi-avg__i"
      :name="it.name"
      :initials="it.initials"
      :src="it.src"
      :tone="it.tone ?? TONES[i % TONES.length]"
      :size="size"
      :shape="shape"
      decorative
    />
    <MiAvatar v-if="extra" class="mi-avg__i mi-avg__more" :initials="`+${extra}`" tone="neutral" :size="size" :shape="shape" decorative />
  </span>
</template>

<style scoped>
/* Overlap is 20% of the avatar size: enough to read as a stack, small enough to keep two-letter initials whole. */
.mi-avg{display:inline-flex;padding-left:var(--mi-avg-o);font-family:var(--mi-font);vertical-align:middle}
.mi-avg__i{margin-left:calc(var(--mi-avg-o) * -1);box-shadow:0 0 0 2.5px var(--mi-card)}
.mi-avg__i.mi-avg__more{--_fg:var(--mi-label)}
</style>

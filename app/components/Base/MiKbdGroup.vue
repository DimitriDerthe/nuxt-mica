<script setup lang="ts">
/** Groups several MiKbd keys in a row, e.g. a shortcut like Ctrl + K; with `shortcut` the whole group listens for the combination and presses down when it is hit. */
import { useMiShortcutPress } from '../../utils/miShortcut'

const props = defineProps<{
  /** Combination to listen for, such as `Ctrl K` or `⇧⌘P`. Leave unset for a purely visual group. */
  shortcut?: string
}>()

const emit = defineEmits<{
  /** The combination was pressed. */
  press: [event: KeyboardEvent]
}>()

const { pressed } = useMiShortcutPress(() => props.shortcut, e => emit('press', e))

defineSlots<{
  /** MiKbd keys that form one shortcut. */
  default?(): unknown
}>()
</script>

<template>
  <span class="mi-kbd-group" :class="{ 'is-pressed': pressed }"><slot /></span>
</template>

<style scoped>
.mi-kbd-group{display:inline-flex;align-items:center;gap:4px;transition:transform var(--mi-dur-1) var(--mi-ease)}
.mi-kbd-group.is-pressed{transform:translate3d(0,1px,0) scale(.94)}
</style>

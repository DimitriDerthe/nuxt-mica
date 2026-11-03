<script setup lang="ts">
/** Keyboard key or short keyboard input, rendered as a small keycap; with `shortcut` it also listens for that key and presses down when it is hit. */
import { useMiShortcutPress } from '../../utils/miShortcut'

const props = defineProps<{
  /** Shortcut to listen for, such as `Esc`, `K` or `Ctrl K`. Leave unset for a purely visual keycap. */
  shortcut?: string
}>()

const emit = defineEmits<{
  /** The shortcut was pressed. */
  press: [event: KeyboardEvent]
}>()

const { pressed } = useMiShortcutPress(() => props.shortcut, e => emit('press', e))

defineSlots<{
  /** Key name or symbol, such as Ctrl or Esc. */
  default?(): unknown
}>()
</script>

<template>
  <kbd class="mi-kbd mi:select-none mi:box-border" :class="{ 'is-pressed': pressed }"><slot /></kbd>
</template>

<style scoped>
.mi-kbd{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:var(--mi-radius-s);background:var(--mi-fill2);color:var(--mi-label2);font-family:var(--mi-font);font-size:12px;line-height:1;font-weight:500;transition:transform var(--mi-dur-1) var(--mi-ease)}
.mi-kbd.is-pressed{transform:translate3d(0,1px,0) scale(.92)}
</style>

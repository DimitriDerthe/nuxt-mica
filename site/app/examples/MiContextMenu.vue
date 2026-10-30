<script lang="ts">
export const playground = {
  props: {
    items: [
      { id: 'open', label: 'Open', icon: 'eye', shortcut: '⌘O' },
      { id: 'rename', label: 'Rename', icon: 'pencil', shortcut: '↩' },
      { id: 'duplicate', label: 'Duplicate', icon: 'duplicate', shortcut: '⌘D' },
      {
        id: 'share', label: 'Share', icon: 'share', children: [
          { id: 'copy-link', label: 'Copy link', icon: 'link' },
          { id: 'invite', label: 'Invite people…' }
        ]
      },
      { id: 'sep-1', type: 'separator' },
      { id: 'pin', label: 'Pin to sidebar', type: 'checkbox', checked: true },
      { id: 'sep-2', type: 'separator' },
      { id: 'delete', label: 'Move to Trash', icon: 'trash', shortcut: '⌘⌫', destructive: true }
    ]
  },
  controls: ['width', 'disabled', 'label'],
  height: 380
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ p: Record<string, unknown> }>()
const open = ref(false)
const last = ref('')
const menu = ref<{ openAt: (x: number, y: number, byKeyboard?: boolean) => void } | null>(null)

function openFrom(e: MouseEvent) {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  // Keep the menu inside narrow viewports: openAt does not shift a menu that fits on neither side.
  const width = Number(props.p.width ?? 260) || 260
  const x = Math.max(8, Math.min(r.left, window.innerWidth - width - 8))
  menu.value?.openAt(x, r.bottom + 6, e.detail === 0)
}
</script>

<template>
  <div class="ex">
    <MiContextMenu ref="menu" v-model="open" v-bind="p" @select="id => (last = 'Selected: ' + id)">
      <div class="file" tabindex="0">
        <div class="doc"><MiIcon name="document" :size="26" /></div>
        <div class="txt">
          <div class="name">Q4 roadmap.key</div>
          <div class="sub">Right-click or long-press</div>
        </div>
      </div>
    </MiContextMenu>
    <MiButton variant="gray" size="small" @click="openFrom">Open menu</MiButton>
    <p class="note" aria-live="polite">{{ last || 'Edited 2 hours ago by Maya' }}</p>
  </div>
</template>

<style scoped>
.ex { display: grid; gap: 12px; justify-items: center; width: min(100%, 300px); }
.file { display: flex; align-items: center; gap: 14px; width: min(100vw - 72px, 280px); padding: 14px 16px; border-radius: 16px; background: var(--mi-card); box-shadow: var(--mi-sh1); cursor: context-menu; user-select: none; }
.file:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.doc { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 12px; background: var(--mi-p-tint); color: var(--mi-p); }
.name { font-size: 15px; font-weight: 600; color: var(--mi-label); }
.sub, .note { font-size: 13px; color: var(--mi-label2); }
.note { margin: 0; }
</style>

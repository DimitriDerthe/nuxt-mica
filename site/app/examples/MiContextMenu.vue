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
  <div class="ex mi:grid mi:gap-3 mi:justify-items-center">
    <MiContextMenu ref="menu" v-model="open" v-bind="p" @select="id => (last = 'Selected: ' + id)">
      <div class="file mi:flex mi:items-center mi:gap-3.5 mi:w-[min(100vw_-_72px,_280px)] mi:py-3.5 mi:px-4 mi:rounded-[16px] mi:bg-card mi:shadow-1 mi:cursor-[context-menu] mi:select-none mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" tabindex="0">
        <div class="doc mi:grid mi:place-items-center mi:w-11.5 mi:h-11.5 mi:rounded-[12px] mi:bg-p-tint mi:text-p"><MiIcon name="document" :size="26" /></div>
        <div class="txt">
          <div class="name mi:text-[15px] mi:font-semibold mi:text-label">Q4 roadmap.key</div>
          <div class="sub mi:text-[13px] mi:text-label2">Right-click or long-press</div>
        </div>
      </div>
    </MiContextMenu>
    <MiButton variant="gray" size="small" @click="openFrom">Open menu</MiButton>
    <p class="note mi:text-[13px] mi:text-label2 mi:m-0" aria-live="polite">{{ last || 'Edited 2 hours ago by Maya' }}</p>
  </div>
</template>

<style scoped>
.ex { width: min(100%, 300px); }
</style>

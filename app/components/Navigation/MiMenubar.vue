<script setup lang="ts">
/** Horizontal application menu bar (File, Edit, View...) whose entries open MiMenu dropdowns; once one is open, hovering another trigger switches to it; Left/Right/Home/End move between menus. */
import { ref } from 'vue'
import MiMenu from '../Buttons/MiMenu.vue'
import type { MiMenuItem } from '../../utils/miMenu'
import { miNavRoving } from '../../utils/miNav'

export interface MiMenubarMenu { id: string, label: string, items: MiMenuItem[], disabled?: boolean }

withDefaults(defineProps<{
  /** Top-level menus, each with its dropdown items. */
  menus: MiMenubarMenu[]
  /** Accessible name of the bar. */
  ariaLabel?: string
  /** Run item shortcuts (such as `⌘N`) even while every menu is closed, like a desktop menu bar. */
  globalShortcuts?: boolean
}>(), { ariaLabel: 'Menu bar' })

const emit = defineEmits<{ select: [menuId: string, item: MiMenuItem] }>()
const root = ref<HTMLElement | null>(null)
/** Id of the open menu, if any. */
const active = ref<string | undefined>()
function setOpen(id: string, v: boolean) { if (v) active.value = id; else if (active.value === id) active.value = undefined }
function hover(id: string) { if (active.value && active.value !== id) active.value = id }

function onKey(e: KeyboardEvent) { miNavRoving(e, root.value, '[data-mi-menu-trigger]', 'horizontal') }
</script>

<template>
  <div ref="root" class="mi-menubar mi:font-mi mi:inline-flex mi:gap-0.5 mi:p-[3px] mi:rounded-[10px] mi:border mi:border-sep2 mi:bg-card" role="menubar" :aria-label="ariaLabel" @keydown="onKey">
    <MiMenu
      v-for="m in menus" :key="m.id" :open="active === m.id" :items="m.items" :aria-label="m.label" :disabled="m.disabled" :global-shortcuts="globalShortcuts"
      @update:open="setOpen(m.id, $event)" @select="emit('select', m.id, $event)"
    >
      <template #trigger="{ props: tp, open }">
        <button
          v-bind="tp" type="button" role="menuitem" class="mi-menubar__trigger mi:[border:0] mi:rounded-[7px] mi:h-7 mi:py-0 mi:px-2.5 mi:bg-transparent mi:text-label mi:cursor-pointer mi:[&:hover:not(:disabled)]:bg-fill3 mi:[&.is-open]:bg-fill3 mi:disabled:text-label3 mi:disabled:cursor-default mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[1px]" :class="{ 'is-open': open }" @pointerenter="hover(m.id)"
          :disabled="m.disabled || undefined"
        >
          {{ m.label }}
        </button>
      </template>
    </MiMenu>
  </div>
</template>

<style scoped>
.mi-menubar__trigger{font:inherit;font-size:14px;font-weight:500}
</style>

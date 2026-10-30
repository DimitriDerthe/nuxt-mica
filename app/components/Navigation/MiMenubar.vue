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
  <div ref="root" class="mi-menubar" role="menubar" :aria-label="ariaLabel" @keydown="onKey">
    <MiMenu
      v-for="m in menus" :key="m.id" :open="active === m.id" :items="m.items" :aria-label="m.label" :disabled="m.disabled"
      @update:open="setOpen(m.id, $event)" @select="emit('select', m.id, $event)"
    >
      <template #trigger="{ props: tp, open }">
        <button
          v-bind="tp" type="button" role="menuitem" class="mi-menubar__trigger" :class="{ 'is-open': open }" @pointerenter="hover(m.id)"
          :disabled="m.disabled || undefined"
        >
          {{ m.label }}
        </button>
      </template>
    </MiMenu>
  </div>
</template>

<style scoped>
.mi-menubar{font-family:var(--mi-font);display:inline-flex;gap:2px;padding:3px;border-radius:10px;border:1px solid var(--mi-sep2);background:var(--mi-card)}
.mi-menubar__trigger{border:0;border-radius:7px;height:28px;padding:0 10px;background:transparent;color:var(--mi-label);font:inherit;font-size:14px;font-weight:500;cursor:pointer}
.mi-menubar__trigger:hover:not(:disabled),.mi-menubar__trigger.is-open{background:var(--mi-fill3)}
.mi-menubar__trigger:disabled{color:var(--mi-label3);cursor:default}
.mi-menubar__trigger:focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:1px}
</style>

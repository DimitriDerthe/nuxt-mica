<script lang="ts">
export type MiFbIconName =
  | 'info' | 'success' | 'warning' | 'danger' | 'calendar' | 'comment' | 'bell' | 'folder' | 'folder-plus'
  | 'document' | 'eye' | 'duplicate' | 'pencil' | 'check' | 'chevron-right' | 'trash' | 'close' | 'inbox'
  | 'share' | 'search' | 'link'

type Shape = readonly [tag: 'path' | 'circle' | 'rect', attrs: Record<string, string | number>]

const ICONS: Record<MiFbIconName, readonly Shape[]> = {
  info: [['circle', { cx: 12, cy: 12, r: 8.5 }], ['path', { d: 'M12 11v5.5M12 7.8v.2' }]],
  success: [['circle', { cx: 12, cy: 12, r: 8.5 }], ['path', { d: 'M8 12.5l2.7 2.7L16 9.5' }]],
  warning: [['path', { d: 'M12 4l9 16H3z' }], ['path', { d: 'M12 10v4.5M12 17.3v.2' }]],
  danger: [['circle', { cx: 12, cy: 12, r: 8.5 }], ['path', { d: 'M12 7.8v5M12 16.2v.2' }]],
  calendar: [['rect', { x: 4, y: 5.5, width: 16, height: 14.5, rx: 2.5 }], ['path', { d: 'M4 10h16M8.5 3.5v4M15.5 3.5v4' }]],
  comment: [['path', { d: 'M4.5 6.5h15v10h-9l-4 3.5v-3.5h-2z' }]],
  bell: [['path', { d: 'M6 16V11a6 6 0 0112 0v5l1.5 2h-15z' }], ['path', { d: 'M10 20.5a2 2 0 004 0' }]],
  folder: [['path', { d: 'M3.5 7a1.5 1.5 0 011.5-1.5h4l2 2h8A1.5 1.5 0 0120.5 9v9a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 18z' }]],
  'folder-plus': [['path', { d: 'M3.5 7a1.5 1.5 0 011.5-1.5h4l2 2h8A1.5 1.5 0 0120.5 9v9a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 18z' }], ['path', { d: 'M12 11v5M9.5 13.5h5' }]],
  document: [['path', { d: 'M7 3.5h7l4 4V20a.5.5 0 01-.5.5h-10.5a.5.5 0 01-.5-.5V4a.5.5 0 01.5-.5z' }], ['path', { d: 'M14 3.5V8h4' }]],
  eye: [['path', { d: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z' }], ['circle', { cx: 12, cy: 12, r: 3 }]],
  duplicate: [['rect', { x: 8, y: 8, width: 12, height: 12, rx: 2 }], ['path', { d: 'M16 8V5.5A1.5 1.5 0 0014.5 4h-9A1.5 1.5 0 004 5.5v9A1.5 1.5 0 005.5 16H8' }]],
  pencil: [['path', { d: 'M14.5 5.5l4 4L8 20H4v-4z' }]],
  check: [['path', { d: 'M5 12.5l4.5 4.5L19 7' }]],
  'chevron-right': [['path', { d: 'M9 5l7 7-7 7' }]],
  trash: [['path', { d: 'M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13' }]],
  close: [['path', { d: 'M6 6l12 12M18 6L6 18' }]],
  inbox: [['path', { d: 'M3.5 13.5l2.3-7.4A2 2 0 017.7 4.7h8.6a2 2 0 011.9 1.4l2.3 7.4V18a1.5 1.5 0 01-1.5 1.5h-14A1.5 1.5 0 013.5 18z' }]],
  share: [['path', { d: 'M12 15V4M8 7.5L12 4l4 3.5' }], ['path', { d: 'M6 11H5.5A1.5 1.5 0 004 12.5v6A1.5 1.5 0 005.5 20h13a1.5 1.5 0 001.5-1.5v-6a1.5 1.5 0 00-1.5-1.5H18' }]],
  search: [['circle', { cx: 11, cy: 11, r: 6.5 }], ['path', { d: 'M16 16l4.5 4.5' }]],
  link: [['path', { d: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1' }], ['path', { d: 'M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1' }]]
}

export const MI_FB_ICON_NAMES = Object.keys(ICONS) as MiFbIconName[]
</script>

<script setup lang="ts">
/** @internal Renders a named built-in glyph as inline SVG for the other Feedback components. Not part of the public API. */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** Glyph to draw. */
  name: MiFbIconName
  /** Rendered width and height in px. */
  size?: number
  /** Stroke width in 24-unit viewBox units. */
  stroke?: number
}>(), { size: 20, stroke: 1.9 })

const shapes = computed(() => ICONS[props.name] ?? [])
</script>

<template>
  <svg
    class="mi-fbi mi:flex-[none] mi:block"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <component :is="s[0]" v-for="(s, i) in shapes" :key="i" v-bind="s[1]" />
  </svg>
</template>

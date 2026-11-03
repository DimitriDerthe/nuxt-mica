<script lang="ts">
export const playground = {
  props: {
    title: 'IMG_2481.HEIC · 3.2 MB',
    actions: [
      { id: 'share', label: 'Share photo' },
      { id: 'duplicate', label: 'Duplicate' },
      { id: 'album', label: 'Add to album' },
      { id: 'wallpaper', label: 'Use as wallpaper', disabled: true },
      { id: 'delete', label: 'Delete photo', kind: 'destructive' }
    ]
  },
  controls: ['title', 'cancelLabel', 'persistent'],
  height: 300
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const open = ref(false)
const last = ref('')
</script>

<template>
  <div class="ex mi:w-[min(100%,_300px)] mi:p-2.5 mi:rounded-[20px] mi:[background:var(--mi-card)] mi:shadow-1">
    <div class="photo mi:h-37.5 mi:rounded-[12px] mi:[background:linear-gradient(135deg,_var(--mi-orange),_var(--mi-pink)_55%,_var(--mi-indigo))]" aria-hidden="true" />
    <div class="meta mi:flex mi:items-center mi:justify-between mi:gap-3 mi:pt-3 mi:px-1.5 mi:pb-1">
      <div>
        <div class="name mi:text-[15px] mi:font-semibold mi:text-label">Lisbon, golden hour</div>
        <div class="sub mi:text-[13px] mi:text-label2">Yesterday at 18:42</div>
      </div>
      <MiIconButton label="Photo options" variant="gray" size="regular" @click="open = true">
        <MiIcon name="more" />
      </MiIconButton>
    </div>
    <p class="note mi:text-[13px] mi:text-label2 mi:mt-1.5 mi:mx-1.5 mi:mb-1" aria-live="polite">{{ last || 'Tap the options button to open the sheet.' }}</p>
    <MiActionSheet
      v-model="open" v-bind="p"
      @action="id => (last = 'Chose: ' + id)" @cancel="r => (last = 'Cancelled (' + r + ')')"
    />
  </div>
</template>

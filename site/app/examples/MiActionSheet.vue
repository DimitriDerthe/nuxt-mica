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
  <div class="ex">
    <div class="photo" aria-hidden="true" />
    <div class="meta">
      <div>
        <div class="name">Lisbon, golden hour</div>
        <div class="sub">Yesterday at 18:42</div>
      </div>
      <MiIconButton label="Photo options" variant="gray" size="regular" @click="open = true">
        <MiIcon name="more" />
      </MiIconButton>
    </div>
    <p class="note" aria-live="polite">{{ last || 'Tap the options button to open the sheet.' }}</p>
    <MiActionSheet
      v-model="open" v-bind="p"
      @action="id => (last = 'Chose: ' + id)" @cancel="r => (last = 'Cancelled (' + r + ')')"
    />
  </div>
</template>

<style scoped>
.ex { width: min(100%, 300px); padding: 10px; border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.photo { height: 150px; border-radius: 12px; background: linear-gradient(135deg, var(--mi-orange), var(--mi-pink) 55%, var(--mi-indigo)); }
.meta { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 6px 4px; }
.name { font-size: 15px; font-weight: 600; color: var(--mi-label); }
.sub, .note { font-size: 13px; color: var(--mi-label2); }
.note { margin: 6px 6px 4px; }
</style>

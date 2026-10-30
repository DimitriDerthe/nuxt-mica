<script lang="ts">
// `icon` is SVG path data on a 24x24 stroked grid, not an icon name.
export const playground = {
  props: {
    actions: [
      { id: 'flag', label: 'Flag', tone: 'neutral', icon: 'M5 21V4h11l-1.5 4L16 12H5' },
      { id: 'archive', label: 'Archive', tone: 'primary', icon: 'M3 5h18v4H3zM5 9v10h14V9M10 13h4' },
      { id: 'delete', label: 'Delete', tone: 'danger', icon: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6' }
    ],
    open: true
  },
  controls: ['open', 'actionWidth', 'keepOpen', 'disabled'],
  height: 320
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ p: Record<string, unknown> }>()
const open = ref(!!props.p.open)
watch(() => props.p.open, v => { open.value = !!v })
const last = ref('')
const labels: Record<string, string> = { flag: 'Flagged', archive: 'Archived', delete: 'Deleted' }
function onAction(id: string) { last.value = `${labels[id] ?? id} "Q4 roadmap review"` }
</script>

<template>
  <div class="ex-wrap">
    <MiList label="Inbox" class="ex-list">
      <MiSwipeRow v-bind="p" v-model:open="open" @action="onAction">
        <MiListItem variant="rich" title="Nora Lindqvist" value="9:41" subtitle="Q4 roadmap review" description="Sharing the draft before Thursday. Could you check the timeline for the billing migration?" :dot="true" />
      </MiSwipeRow>
      <MiSwipeRow :actions="p.actions">
        <MiListItem variant="rich" title="Build pipeline" value="Yesterday" subtitle="Deploy succeeded on main" description="Release 4.12.0 is live in production. 128 tests passed in 3 min 42 s." :dot="false" />
      </MiSwipeRow>
    </MiList>
    <p class="ex-status" aria-live="polite">{{ last || 'Swipe a row left, or focus it and press the left arrow.' }}</p>
  </div>
</template>

<style scoped>
.ex-wrap { display: grid; gap: 10px; width: min(100%, 420px); }
.ex-status { margin: 0; font-size: 13px; color: var(--mi-label2); text-align: center; }
</style>

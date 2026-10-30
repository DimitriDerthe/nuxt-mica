<script lang="ts">
export const playground = {
  props: { state: 'done', size: 'default', orientation: 'horizontal' },
  controls: ['state', 'size', 'orientation'],
  layout: 'start'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex">
    <MiAttachment v-bind="p">
      <MiAttachmentTrigger href="#q3-report" @click.prevent />
      <MiAttachmentMedia><MiIcon name="document" /></MiAttachmentMedia>
      <MiAttachmentContent>
        <MiAttachmentTitle>Q3-board-report.pdf</MiAttachmentTitle>
        <MiAttachmentDescription>PDF - 2.4 MB</MiAttachmentDescription>
      </MiAttachmentContent>
      <MiAttachmentActions>
        <MiAttachmentAction aria-label="Copy link"><MiIcon name="copy" :size="16" /></MiAttachmentAction>
        <MiAttachmentAction aria-label="Remove attachment"><MiIcon name="close" :size="16" /></MiAttachmentAction>
      </MiAttachmentActions>
    </MiAttachment>
    <MiAttachmentGroup>
      <MiAttachment name="roadmap.xlsx" :file-size="184000" type="application/vnd.ms-excel" />
      <MiAttachment name="hero-shot.png" :file-size="921000" type="image/png" :progress="64" />
      <MiAttachment name="notes.txt" error="Upload failed" />
    </MiAttachmentGroup>
  </div>
</template>

<style scoped>
.ex { display: grid; gap: 16px; width: min(100%, 420px); }
</style>

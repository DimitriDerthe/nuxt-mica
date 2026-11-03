<script lang="ts">
export const playground = {
  props: { label: 'Agent activity' },
  controls: ['label'],
  layout: 'start'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex mi:w-[min(100%,_420px)]">
    <MiTrace v-bind="p">
      <MiTraceLine>
        <MiTraceIcon><MiIcon name="check" :size="16" /></MiTraceIcon>
        <MiTraceTitle>Read project files</MiTraceTitle>
        <MiTraceDescription>14 files</MiTraceDescription>
      </MiTraceLine>
      <MiTraceCollapsible default-open>
        <MiTraceLine>
          <MiTraceIcon><MiIcon name="search" :size="16" /></MiTraceIcon>
          <MiTraceCollapsibleTrigger>
            <MiTraceTitle>Searched the codebase</MiTraceTitle>
            <MiTraceDescription>1.2s</MiTraceDescription>
          </MiTraceCollapsibleTrigger>
        </MiTraceLine>
        <MiTraceCollapsibleContent>
          Found 3 usages of <code>useSession</code> in server/api and app/middleware.
        </MiTraceCollapsibleContent>
      </MiTraceCollapsible>
      <MiTraceLine status="running">
        <MiTraceIcon><MiOrb state="working" :size="16" label="" /></MiTraceIcon>
        <MiTraceTitle>Running tests</MiTraceTitle>
      </MiTraceLine>
      <MiTraceLine status="error">
        <MiTraceIcon><MiIcon name="exclamation-circle" :size="16" /></MiTraceIcon>
        <MiTraceTitle>Deploy preview</MiTraceTitle>
        <MiTraceDescription>Build failed</MiTraceDescription>
      </MiTraceLine>
      <MiTraceLine status="pending">
        <MiTraceIcon><MiIcon name="dash" :size="16" /></MiTraceIcon>
        <MiTraceTitle>Write summary</MiTraceTitle>
      </MiTraceLine>
    </MiTrace>
  </div>
</template>

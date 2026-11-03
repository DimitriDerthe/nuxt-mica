<script lang="ts">
export const playground = {
  props: { variant: 'h2' },
  controls: ['variant'],
  slot: 'Designing calm interfaces',
  layout: 'start'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex mi:w-[min(100%,_460px)]">
    <MiTypography v-bind="p">Designing calm interfaces</MiTypography>
    <MiTypography variant="lead">Good defaults let the content lead.</MiTypography>
    <MiTypography variant="p">Every screen should answer one question. Use <MiTypography variant="code" as="code">MiTypography</MiTypography> so headings, paragraphs and quotes share one rhythm.</MiTypography>
    <MiTypography variant="muted">Last edited 2 days ago</MiTypography>
  </div>
</template>

<script lang="ts">
export const playground = {
  props: { align: 'start', label: 'Lena Brandt' },
  controls: ['align'],
  layout: 'fill'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex-thread">
    <MiMessageGroup>
      <MiMessage v-bind="p">
        <template #avatar><MiAvatar name="Lena Brandt" tone="auto" size="sm" decorative /></template>
        <template #header>Lena Brandt</template>
        <MiBubble :align="p.align" variant="secondary">The new onboarding flow is live.</MiBubble>
      </MiMessage>
      <MiMessage v-bind="p" label="Lena Brandt">
        <template #avatar />
        <MiBubble :align="p.align" variant="secondary">Conversion is already up 4%.</MiBubble>
        <template #footer>Delivered 9:41</template>
      </MiMessage>
    </MiMessageGroup>
  </div>
</template>

<style scoped>
.ex-thread { width: min(100%, 420px); margin-inline: auto; }
</style>

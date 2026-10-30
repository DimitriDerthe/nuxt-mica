<script lang="ts">
export const playground = {
  props: { label: 'Profile preview' },
  controls: ['side', 'align', 'delay', 'closeDelay', 'width', 'disabled'],
  height: 280
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <MiHoverCard v-bind="p">
    <template #trigger>
      <a class="handle" href="#" @click.prevent>@maya.chen</a>
    </template>
    <div class="card">
      <strong>Maya Chen</strong>
      <span class="sub">Design engineer at Northwind</span>
      <p>Building calm interfaces and the occasional keyboard. Joined March 2022.</p>
    </div>
  </MiHoverCard>
</template>

<style scoped>
.handle { color: var(--mi-p); font-size: 17px; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
.card { display: grid; gap: 4px; padding: 12px; font-size: 14px; }
.sub { color: var(--mi-text-2, inherit); opacity: .7; }
p { margin: 4px 0 0; }
</style>

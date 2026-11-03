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
      <a class="handle mi:text-p mi:text-[17px] mi:font-semibold mi:[text-decoration:underline] mi:underline-offset-[3px]" href="#" @click.prevent>@maya.chen</a>
    </template>
    <div class="card mi:grid mi:gap-1 mi:p-3 mi:text-[14px]">
      <strong>Maya Chen</strong>
      <span class="sub mi:text-[color:var(--mi-text-2,_inherit)] mi:opacity-70">Design engineer at Northwind</span>
      <p>Building calm interfaces and the occasional keyboard. Joined March 2022.</p>
    </div>
  </MiHoverCard>
</template>

<style scoped>
p { margin: 4px 0 0; }
</style>

<script lang="ts">
export const playground = {
  props: {
    variant: 'breadcrumb',
    items: [
      { label: 'Workspace', href: '#', icon: true },
      { label: 'Projects', href: '#' },
      { label: 'Marketing site', href: '#' },
      { label: 'Deployments' }
    ]
  },
  controls: ['variant'],
  height: 160
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()

// Demo links point to "#": keep the page from jumping to the top.
function stayHere(e: MouseEvent) {
  const target = e.target
  if (target instanceof Element && target.closest('a[href="#"]')) e.preventDefault()
}
</script>

<template>
  <div class="bar" @click.capture="stayHere">
    <MiBreadcrumb v-bind="p" />
  </div>
</template>

<style scoped>
.bar { max-width: 100%; overflow-x: auto; padding: 10px 14px; border-radius: 14px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
</style>

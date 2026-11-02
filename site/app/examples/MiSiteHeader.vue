<script lang="ts">
export const playground = {
  props: {
    links: [
      { label: 'Product', href: '#product', active: true },
      { label: 'Resources', children: [{ label: 'Docs', href: '#docs' }, { label: 'Guides', href: '#guides' }, { label: 'Changelog', href: '#changelog' }] },
      { label: 'Pricing', href: '#pricing' },
      { label: 'About', href: '#about' }
    ]
  },
  controls: ['sticky'],
  height: 360
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <MiSiteHeader v-bind="p" class="ex-sh">
    <template #logo><MiLogo /></template>
    <template #actions>
      <MiButton variant="plain">Sign in</MiButton>
      <MiButton>Get started</MiButton>
    </template>
  </MiSiteHeader>
</template>

<style scoped>
.ex-sh { width: 100%; border-radius: 16px; overflow: visible; }
</style>

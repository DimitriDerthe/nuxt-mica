<script lang="ts">
export const playground = {
  props: { size: 'default', variant: 'default' },
  controls: ['size', 'variant'],
  layout: 'fill'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
const source = `export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}`
</script>

<template>
  <div class="ex mi:w-[min(100%,_560px)]">
    <MiCodeBlock v-bind="p">
      <MiCodeBlockHeader>
        <MiCodeBlockTitle>math.ts</MiCodeBlockTitle>
        <MiCodeBlockActions><MiCodeBlockCopyButton :value="source" /></MiCodeBlockActions>
      </MiCodeBlockHeader>
      <MiCodeBlockContent line-numbers>
        <MiCodeBlockLine variant="removed">export const clamp = (n, a, b) => n</MiCodeBlockLine>
        <MiCodeBlockLine variant="added">export function clamp(n: number, min: number, max: number) {</MiCodeBlockLine>
        <MiCodeBlockLine variant="highlighted">  return Math.min(Math.max(n, min), max)</MiCodeBlockLine>
        <MiCodeBlockLine variant="added">}</MiCodeBlockLine>
      </MiCodeBlockContent>
      <MiCodeBlockFooter>Fixed: values outside the range are now clamped.</MiCodeBlockFooter>
    </MiCodeBlock>
  </div>
</template>

<style scoped>
.ex { margin-inline: auto; }
</style>

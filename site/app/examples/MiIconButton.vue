<script lang="ts">
export const playground = {
  controls: ['variant', 'brand', 'size', 'shape', 'pressed', 'disabled'],
  slot: '<MiIcon name="heart" />'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
const actions = [
  { icon: 'share', label: 'Share' },
  { icon: 'bookmark', label: 'Save to collection' },
  { icon: 'heart', label: 'Add to favorites' }
] as const
</script>

<template>
  <div class="card">
    <div class="art mi:grid mi:place-items-center mi:w-13 mi:h-13 mi:rounded-[12px] mi:[background:linear-gradient(135deg,_var(--mi-p-tint2),_var(--mi-s-tint2))] mi:text-p-text" aria-hidden="true"><MiIcon name="image" :size="28" /></div>
    <div class="text mi:grid mi:gap-0.5 mi:min-w-0">
      <MiText variant="headline" :lines="1">Northern Lights, Tromsø</MiText>
      <MiText variant="footnote" tone="label2" :lines="1">Photo by Ingrid Solberg</MiText>
    </div>
    <div class="actions mi:col-span-full mi:flex mi:gap-2.5 mi:[justify-content:flex-end] mi:pt-3 mi:border-t mi:border-t-sep">
      <MiIconButton v-for="a in actions" :key="a.icon" v-bind="p" :label="a.label">
        <MiIcon :name="a.icon" :filled="a.icon === 'heart' && !!p.pressed" />
      </MiIconButton>
    </div>
  </div>
</template>

<style scoped>
.card { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 12px 14px; width: min(100%, 340px); padding: 14px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
</style>

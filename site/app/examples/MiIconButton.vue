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
    <div class="art" aria-hidden="true"><MiIcon name="image" :size="28" /></div>
    <div class="text">
      <MiText variant="headline" :lines="1">Northern Lights, Tromsø</MiText>
      <MiText variant="footnote" tone="label2" :lines="1">Photo by Ingrid Solberg</MiText>
    </div>
    <div class="actions">
      <MiIconButton v-for="a in actions" :key="a.icon" v-bind="p" :label="a.label">
        <MiIcon :name="a.icon" :filled="a.icon === 'heart' && !!p.pressed" />
      </MiIconButton>
    </div>
  </div>
</template>

<style scoped>
.card { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 12px 14px; width: min(100%, 340px); padding: 14px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
.art { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 12px; background: linear-gradient(135deg, var(--mi-p-tint2), var(--mi-s-tint2)); color: var(--mi-p-text); }
.text { display: grid; gap: 2px; min-width: 0; }
.actions { grid-column: 1 / -1; display: flex; gap: 10px; justify-content: flex-end; padding-top: 12px; border-top: 1px solid var(--mi-sep); }
</style>

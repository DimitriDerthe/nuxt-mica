<script lang="ts">
export const playground = {
  props: {
    max: 4,
    items: [
      { name: 'Camille Laurent', tone: 'indigo' },
      { name: 'Jonas Becker', tone: 'teal' },
      { name: 'Aiko Tanaka', tone: 'pink' },
      { name: 'Mateo Alvarez', tone: 'orange' },
      { name: 'Priya Natarajan', tone: 'purple' },
      { name: 'Samuel Okafor', tone: 'green' },
      { name: 'Lea Moreau', tone: 'blue' },
      { name: 'Noah Fischer', tone: 'mint' }
    ]
  },
  controls: ['max', 'shape']
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex-team">
    <div class="ex-head mi:grid mi:gap-0.5">
      <span class="ex-title mi:text-[17px] mi:font-semibold mi:text-label">Design team</span>
      <span class="ex-sub mi:text-[13px] mi:text-label2">8 members · 3 online</span>
    </div>
    <div class="ex-foot mi:flex mi:items-center mi:justify-between mi:gap-3">
      <MiAvatarGroup v-bind="p" />
      <MiButton size="small" variant="gray">Invite</MiButton>
    </div>
  </div>
</template>

<style scoped>
.ex-team { display: grid; gap: 14px; width: min(100%, 340px); padding: 16px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
</style>

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
    <div class="ex-head">
      <span class="ex-title">Design team</span>
      <span class="ex-sub">8 members · 3 online</span>
    </div>
    <div class="ex-foot">
      <MiAvatarGroup v-bind="p" />
      <MiButton size="small" variant="gray">Invite</MiButton>
    </div>
  </div>
</template>

<style scoped>
.ex-team { display: grid; gap: 14px; width: min(100%, 340px); padding: 16px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
.ex-head { display: grid; gap: 2px; }
.ex-title { font-size: 17px; font-weight: 600; color: var(--mi-label); }
.ex-sub { font-size: 13px; color: var(--mi-label2); }
.ex-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
</style>

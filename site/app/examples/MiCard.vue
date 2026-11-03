<script lang="ts">
export const playground = {
  props: {
    eyebrow: 'Guide · 6 min read',
    title: 'Plan your first release',
    description: 'Group work into milestones, invite reviewers and ship on a predictable cadence your whole team can follow.'
  },
  controls: ['variant', 'padding', 'align', 'eyebrow', 'title', 'description', 'mediaHeight']
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <MiCard v-bind="p" class="ex-card">
    <template #media>
      <div class="ex-media mi:relative mi:grid mi:place-items-center mi:w-full mi:h-full mi:overflow-hidden mi:[background:linear-gradient(135deg,_var(--mi-p-tint2,_var(--mi-p-tint)),_var(--mi-s-tint))]" aria-hidden="true">
        <span class="ex-dot ex-dot--a mi:absolute mi:rounded-[50%] mi:opacity-55 mi:w-35 mi:h-35 mi:-left-9 mi:-top-12 mi:[background:var(--mi-p-tint)]" /><span class="ex-dot ex-dot--b mi:absolute mi:rounded-[50%] mi:opacity-55 mi:w-24 mi:h-24 mi:-right-5 mi:-bottom-7.5 mi:[background:var(--mi-s-tint)]" /><span class="ex-dot ex-dot--c mi:absolute mi:rounded-[50%] mi:opacity-55 mi:w-10 mi:h-10 mi:right-16 mi:top-5.5 mi:[background:var(--mi-card)]" />
        <MiIcon name="calendar" class="ex-icon mi:w-11 mi:h-11 mi:text-p-text" />
      </div>
    </template>
    <template #footer>
      <MiButton size="small">Start guide</MiButton>
      <MiButton size="small" variant="plain">Save for later</MiButton>
    </template>
  </MiCard>
</template>

<style scoped>
.ex-card { width: min(100%, 340px); }
</style>

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
      <div class="ex-media" aria-hidden="true">
        <span class="ex-dot ex-dot--a" /><span class="ex-dot ex-dot--b" /><span class="ex-dot ex-dot--c" />
        <MiIcon name="calendar" class="ex-icon" />
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
.ex-media { position: relative; display: grid; place-items: center; width: 100%; height: 100%; overflow: hidden; background: linear-gradient(135deg, var(--mi-p-tint2, var(--mi-p-tint)), var(--mi-s-tint)); }
.ex-icon { width: 44px; height: 44px; color: var(--mi-p-text); }
.ex-dot { position: absolute; border-radius: 50%; opacity: .55; }
.ex-dot--a { width: 140px; height: 140px; left: -36px; top: -48px; background: var(--mi-p-tint); }
.ex-dot--b { width: 96px; height: 96px; right: -20px; bottom: -30px; background: var(--mi-s-tint); }
.ex-dot--c { width: 40px; height: 40px; right: 64px; top: 22px; background: var(--mi-card); }
</style>

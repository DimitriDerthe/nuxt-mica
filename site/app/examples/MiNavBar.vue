<script lang="ts">
export const playground = {
  props: { title: 'Settings', backLabel: 'Account', actionLabel: 'Edit', large: true },
  controls: ['title', 'backLabel', 'actionLabel', 'large'],
  height: 600
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()

const general = [
  { title: 'Notifications', value: 'On', tile: 'red' },
  { title: 'Appearance', value: 'Auto', tile: 'indigo' },
  { title: 'Language', value: 'English', tile: 'blue' },
  { title: 'Privacy', tile: 'green' }
] as const
const data = [
  { title: 'Storage', value: '12.4 GB', tile: 'orange' },
  { title: 'Connected apps', value: '3', tile: 'teal' },
  { title: 'Export data', tile: 'purple' },
  { title: 'Sessions', value: '2 active', tile: 'pink' }
] as const
</script>

<template>
  <div class="phone">
    <div class="screen">
      <MiNavBar v-bind="p" />
      <div class="content">
        <MiList header="General">
          <MiListItem v-for="r in general" :key="r.title" :title="r.title" :value="r.value" :tile="r.tile" chevron button>
            <template #leading><span class="glyph" aria-hidden="true">{{ r.title[0] }}</span></template>
          </MiListItem>
        </MiList>
        <MiList header="Data">
          <MiListItem v-for="r in data" :key="r.title" :title="r.title" :value="r.value" :tile="r.tile" chevron button>
            <template #leading><span class="glyph" aria-hidden="true">{{ r.title[0] }}</span></template>
          </MiListItem>
        </MiList>
        <p class="hint">Scroll to collapse the large title into the bar.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.phone { width: min(100%, 320px); height: 540px; padding: 8px; border-radius: 44px; background: var(--mi-fill); box-shadow: var(--mi-sh2, var(--mi-sh1)); box-sizing: border-box; }
.screen { height: 100%; overflow-y: auto; border-radius: 36px; background: var(--mi-page); overscroll-behavior: contain; }
.content { display: grid; gap: 20px; padding: 8px 14px 32px; }
.glyph { font-size: 13px; font-weight: 700; }
.hint { margin: 0; text-align: center; font-size: 12px; color: var(--mi-label3); }
</style>

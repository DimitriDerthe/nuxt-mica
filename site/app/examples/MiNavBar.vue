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
  <div class="phone mi:w-[min(100%,_320px)] mi:h-135 mi:p-2 mi:rounded-[44px] mi:bg-fill mi:shadow-[var(--mi-sh2,_var(--mi-sh1))] mi:box-border">
    <div class="screen mi:h-full mi:overflow-y-auto mi:rounded-[36px] mi:bg-page mi:overscroll-contain">
      <MiNavBar v-bind="p" />
      <div class="content mi:grid mi:gap-5 mi:pt-2 mi:px-3.5 mi:pb-8">
        <MiList header="General">
          <MiListItem v-for="r in general" :key="r.title" :title="r.title" :value="r.value" :tile="r.tile" chevron button>
            <template #leading><span class="glyph mi:text-[13px] mi:font-bold" aria-hidden="true">{{ r.title[0] }}</span></template>
          </MiListItem>
        </MiList>
        <MiList header="Data">
          <MiListItem v-for="r in data" :key="r.title" :title="r.title" :value="r.value" :tile="r.tile" chevron button>
            <template #leading><span class="glyph mi:text-[13px] mi:font-bold" aria-hidden="true">{{ r.title[0] }}</span></template>
          </MiListItem>
        </MiList>
        <p class="hint mi:m-0 mi:text-center mi:text-[12px] mi:text-label3">Scroll to collapse the large title into the bar.</p>
      </div>
    </div>
  </div>
</template>

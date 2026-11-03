<script lang="ts">
export const playground = {
  props: {
    variant: 'bar',
    items: [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'search', label: 'Search', icon: 'search' },
      { id: 'inbox', label: 'Inbox', icon: 'inbox', badge: 3 },
      { id: 'profile', label: 'Profile', icon: 'person' }
    ]
  },
  controls: ['variant'],
  height: 580
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ p: Record<string, unknown> }>()
const tab = ref<string | undefined>('home')

const copy: Record<string, { title: string, body: string }> = {
  home: { title: 'Good morning, Alex', body: 'Three projects moved overnight. Your standup starts at 9:30.' },
  search: { title: 'Search', body: 'Find people, files and projects across the workspace.' },
  inbox: { title: 'Inbox', body: 'Three unread mentions from the Mobile app channel.' },
  profile: { title: 'Profile', body: 'Alex Morgan, Product designer at Northwind.' }
}
const screen = computed(() => copy[tab.value ?? 'home'] ?? copy.home)
const capsule = computed(() => props.p.variant === 'capsule')
</script>

<template>
  <div class="phone mi:w-[min(100%,_320px)] mi:box-border">
    <div class="screen mi:relative mi:h-full mi:flex mi:flex-col mi:rounded-[36px] mi:overflow-hidden mi:bg-page">
      <div class="content mi:flex-1 mi:min-h-0 mi:pt-10 mi:px-4.5 mi:pb-4.5 mi:grid mi:content-start mi:gap-2">
        <h3>{{ screen.title }}</h3>
        <p>{{ screen.body }}</p>
        <div class="tiles mi:grid mi:grid-cols-[1fr_1fr] mi:gap-2.5 mi:mt-3.5" aria-hidden="true">
          <span v-for="n in 4" :key="n" class="tile mi:h-19 mi:rounded-[16px] mi:bg-card mi:shadow-1 mi:first:bg-p-tint mi:first:shadow-none" />
        </div>
      </div>
      <div class="dock mi:flex-[0_0_auto] mi:[&.float]:absolute mi:[&.float]:left-0 mi:[&.float]:right-0 mi:[&.float]:bottom-4 mi:[&.float]:flex mi:[&.float]:justify-center mi:[&.float]:px-3" :class="{ float: capsule }">
        <MiTabBar v-model="tab" v-bind="p" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.phone { height: 520px; padding: 8px; border-radius: 44px; background: var(--mi-fill); }
h3 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.02em; color: var(--mi-label); }
p { margin: 0; font-size: 14px; line-height: 1.4; color: var(--mi-label2); }
</style>

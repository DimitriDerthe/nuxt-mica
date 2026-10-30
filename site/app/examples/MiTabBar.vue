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
  <div class="phone">
    <div class="screen">
      <div class="content">
        <h3>{{ screen.title }}</h3>
        <p>{{ screen.body }}</p>
        <div class="tiles" aria-hidden="true">
          <span v-for="n in 4" :key="n" class="tile" />
        </div>
      </div>
      <div class="dock" :class="{ float: capsule }">
        <MiTabBar v-model="tab" v-bind="p" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.phone { width: min(100%, 320px); height: 520px; padding: 8px; border-radius: 44px; background: var(--mi-fill); box-sizing: border-box; }
.screen { position: relative; height: 100%; display: flex; flex-direction: column; border-radius: 36px; overflow: hidden; background: var(--mi-page); }
.content { flex: 1; min-height: 0; padding: 40px 18px 18px; display: grid; align-content: start; gap: 8px; }
h3 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.02em; color: var(--mi-label); }
p { margin: 0; font-size: 14px; line-height: 1.4; color: var(--mi-label2); }
.tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
.tile { height: 76px; border-radius: 16px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.tile:first-child { background: var(--mi-p-tint); box-shadow: none; }
.dock { flex: 0 0 auto; }
.dock.float { position: absolute; left: 0; right: 0; bottom: 16px; display: flex; justify-content: center; padding-inline: 12px; }
</style>

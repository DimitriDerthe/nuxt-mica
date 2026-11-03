<template>
  <div class="pmp">
    <section class="pmp__card" aria-labelledby="pmp-title">
      <header class="pmp__head">
        <div>
          <MiText id="pmp-title" variant="headline" as="h2">Spring rebrand</MiText>
          <MiText variant="footnote" tone="label2">{{ members.length }} members · due Apr 18</MiText>
        </div>
        <MiBadge tone="primary" label="On track" dot />
      </header>

      <!-- The popover stays open; its arrow slides under whichever avatar is picked. -->
      <MiPopover :model-value="!!current" trigger="manual" inline :arrow-offset="arrowAt" width="min(340px, 100%)" label="Member profile">
        <template #trigger>
          <ul class="pmp__stack" aria-label="Project members">
            <li v-for="m in members" :key="m.id">
              <button
                type="button" class="pmp__face" :aria-pressed="m.id === selected" aria-controls="pmp-panel"
                :aria-label="`Show ${m.name}`" @click="selected = m.id"
              >
                <MiAvatar :name="m.name" tone="auto" decorative />
              </button>
            </li>
          </ul>
        </template>

        <div v-if="current" id="pmp-panel" class="pmp__panel">
          <div class="pmp__who">
            <MiAvatar :name="current.name" tone="auto" size="lg" decorative />
            <div class="pmp__id">
              <MiText variant="headline" as="h3">{{ current.name }}</MiText>
              <MiText variant="footnote" tone="label2">{{ current.title }}</MiText>
              <MiBadge :tone="current.away ? 'warning' : 'success'" variant="tint" dot :label="current.away ?? 'Active now'" />
            </div>
          </div>

          <dl class="pmp__facts">
            <div><dt>Open tasks</dt><dd>{{ current.open }}</dd></div>
            <div><dt>Done this week</dt><dd>{{ current.done }}</dd></div>
            <div><dt>Joined</dt><dd>{{ current.joined }}</dd></div>
          </dl>

          <MiMeter
            :value="current.load" label="Capacity this sprint" :caption="`${current.load}% booked`"
            :hint="current.load > 90 ? 'Overbooked' : `${100 - current.load}% free`" size="sm"
            :color="current.load > 90 ? 'var(--mi-red)' : undefined"
          />

          <MiField label="Access to this project">
            <MiSelect v-model="current.access" :options="accessOptions" size="sm" :disabled="current.access === 'owner'" />
          </MiField>

          <div class="pmp__actions">
            <MiButton variant="tinted" size="small">
              <template #leading><MiIcon name="chat" :size="16" /></template>
              Message
            </MiButton>
            <MiButton variant="destructive" soft size="small" :disabled="current.access === 'owner'" @click="remove(current.id)">
              Remove from project
            </MiButton>
          </div>
        </div>
      </MiPopover>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Member {
  id: string, name: string, title: string, away?: string, open: number, done: number, joined: string, load: number
  access: string | number | null
}

const accessOptions = [
  { value: 'owner', label: 'Owner', description: 'Full control, billing and deletion' },
  { value: 'edit', label: 'Can edit', description: 'Create and change tasks and files' },
  { value: 'comment', label: 'Can comment', description: 'Read everything, leave comments' },
  { value: 'view', label: 'Can view', description: 'Read-only access' }
]

const members = ref<Member[]>([
  { id: 'ia', name: 'Inès Aubert', title: 'Design lead', open: 7, done: 12, joined: 'Jan 2024', load: 82, access: 'owner' },
  { id: 'ko', name: 'Kwame Owusu', title: 'Brand designer', open: 11, done: 6, joined: 'Mar 2024', load: 96, access: 'edit' },
  { id: 'ml', name: 'Mei Lin', title: 'Copywriter', away: 'Away until Monday', open: 3, done: 9, joined: 'Sep 2024', load: 40, access: 'edit' },
  { id: 'rs', name: 'Rafael Santos', title: 'Frontend engineer', open: 5, done: 4, joined: 'Nov 2024', load: 64, access: 'comment' },
  { id: 'hb', name: 'Hanna Berg', title: 'Marketing manager', open: 2, done: 3, joined: 'Feb 2025', load: 30, access: 'view' }
])
const selected = ref('ko')

const current = computed(() => members.value.find(m => m.id === selected.value))
// Avatar is 44px with an 8px gap; the arrow points at the middle of the picked face.
const arrowAt = computed(() => Math.max(0, members.value.findIndex(m => m.id === selected.value)) * 52 + 22)

function remove(id: string): void {
  const i = members.value.findIndex(m => m.id === id)
  members.value.splice(i, 1)
  selected.value = members.value[Math.min(i, members.value.length - 1)]?.id ?? ''
}
</script>

<style scoped>
.pmp { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.pmp__card { display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.pmp__head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 8px 16px; }

.pmp__stack { display: flex; gap: 8px; margin: 0; padding: 0; list-style: none; }
.pmp__face {
  display: block; padding: 0; border: 0; border-radius: 50%; background: none; cursor: pointer;
  opacity: .55; transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-spring);
}
.pmp__face:hover { opacity: .85; }
.pmp__face[aria-pressed="true"] { opacity: 1; transform: translateY(-2px); }
.pmp__face:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

.pmp__panel { display: grid; gap: 14px; }
.pmp__who { display: flex; align-items: center; gap: 12px; }
.pmp__id { display: grid; justify-items: start; gap: 2px; min-width: 0; }

.pmp__facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.pmp__facts div { display: grid; gap: 2px; padding: 10px 12px; }
.pmp__facts div + div { border-left: 1px solid var(--mi-sep); }
.pmp__facts dt { font-size: 11px; color: var(--mi-label2); }
.pmp__facts dd { margin: 0; font-size: 17px; font-weight: 600; font-variant-numeric: tabular-nums; }

.pmp__actions { display: flex; flex-wrap: wrap; gap: 8px; }

@container (min-width: 560px) {
  .pmp__card { padding: 24px 28px; }
}
</style>

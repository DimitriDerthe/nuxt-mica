<template>
  <div class="mi:@container mi:font-mi mi:text-label">
    <section class="mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[560px]:py-6 mi:@[560px]:px-7" aria-labelledby="pmp-title">
      <header class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-y-2 mi:gap-x-4">
        <div>
          <MiText id="pmp-title" variant="headline" as="h2">Spring rebrand</MiText>
          <MiText variant="footnote" tone="label2">{{ members.length }} members · due Apr 18</MiText>
        </div>
        <MiBadge tone="primary" label="On track" dot />
      </header>

      <!-- The popover stays open; its arrow slides under whichever avatar is picked. -->
      <MiPopover :model-value="!!current" trigger="manual" inline :arrow-offset="arrowAt" width="min(340px, 100%)" label="Member profile">
        <template #trigger>
          <ul class="mi:flex mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Project members">
            <li v-for="m in members" :key="m.id">
              <button
                type="button" class="mi:block mi:p-0 mi:[border:0] mi:rounded-[50%] mi:[background:none] mi:cursor-pointer mi:opacity-55 mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-spring)] mi:aria-pressed:transform-[translateY(-2px)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :class="m.id === selected ? 'mi:aria-pressed:opacity-100' : 'mi:hover:opacity-85'" :aria-pressed="m.id === selected" aria-controls="pmp-panel"
                :aria-label="`Show ${m.name}`" @click="selected = m.id"
              >
                <MiAvatar :name="m.name" tone="auto" decorative />
              </button>
            </li>
          </ul>
        </template>

        <div v-if="current" id="pmp-panel" class="mi:grid mi:gap-3.5">
          <div class="mi:flex mi:items-center mi:gap-3">
            <MiAvatar :name="current.name" tone="auto" size="lg" decorative />
            <div class="mi:grid mi:justify-items-start mi:gap-0.5 mi:min-w-0">
              <MiText variant="headline" as="h3">{{ current.name }}</MiText>
              <MiText variant="footnote" tone="label2">{{ current.title }}</MiText>
              <MiBadge :tone="current.away ? 'warning' : 'success'" variant="tint" dot :label="current.away ?? 'Active now'" />
            </div>
          </div>

          <dl class="mi:grid mi:grid-cols-3 mi:m-0 mi:rounded-md mi:[background:var(--mi-fill4)]">
            <div class="mi:not-first:border-l mi:not-first:border-l-sep mi:grid mi:gap-0.5 mi:py-2.5 mi:px-3"><dt class="mi:text-[11px] mi:text-label2">Open tasks</dt><dd class="mi:m-0 mi:text-[17px] mi:font-semibold mi:tabular-nums">{{ current.open }}</dd></div>
            <div class="mi:not-first:border-l mi:not-first:border-l-sep mi:grid mi:gap-0.5 mi:py-2.5 mi:px-3"><dt class="mi:text-[11px] mi:text-label2">Done this week</dt><dd class="mi:m-0 mi:text-[17px] mi:font-semibold mi:tabular-nums">{{ current.done }}</dd></div>
            <div class="mi:not-first:border-l mi:not-first:border-l-sep mi:grid mi:gap-0.5 mi:py-2.5 mi:px-3"><dt class="mi:text-[11px] mi:text-label2">Joined</dt><dd class="mi:m-0 mi:text-[17px] mi:font-semibold mi:tabular-nums">{{ current.joined }}</dd></div>
          </dl>

          <MiMeter
            :value="current.load" label="Capacity this sprint" :caption="`${current.load}% booked`"
            :hint="current.load > 90 ? 'Overbooked' : `${100 - current.load}% free`" size="sm"
            :color="current.load > 90 ? 'var(--mi-red)' : undefined"
          />

          <MiField label="Access to this project">
            <MiSelect v-model="current.access" :options="accessOptions" size="sm" :disabled="current.access === 'owner'" />
          </MiField>

          <div class="mi:flex mi:flex-wrap mi:gap-2">
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

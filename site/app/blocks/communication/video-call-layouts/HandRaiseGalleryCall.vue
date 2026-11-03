<template>
  <section class="mi:@container mi:min-h-165 mi:font-mi mi:text-label mi:[background:var(--mi-page)]" aria-labelledby="hg-title">
    <div class="mi:grid mi:gap-4 mi:p-4 mi:grid-cols-[minmax(0,_1fr)] mi:@[920px]:grid-cols-[minmax(0,_1fr)_280px] mi:@[920px]:p-5">
      <div class="mi:grid mi:content-start mi:gap-3.5 mi:min-w-0">
        <header class="mi:flex mi:items-center mi:justify-between mi:gap-3">
          <div>
            <MiText id="hg-title" as="h2" variant="headline" weight="semibold">All-hands Q&amp;A</MiText>
            <MiText variant="caption" tone="label2">{{ people.length }} in call · 32:14 · you are hosting</MiText>
          </div>
          <MiBadge :tone="queue.length ? 'warning' : 'neutral'" :label="queue.length + ' raised'" dot />
        </header>

        <ul class="mi:[list-style:none] mi:m-0 mi:p-0 mi:grid mi:gap-2.5 mi:grid-cols-2 mi:@[600px]:grid-cols-3 mi:@[1100px]:grid-cols-4" aria-label="Participants">
          <li
            v-for="p in people" :key="p.id" class="mi:relative mi:grid mi:place-items-center mi:aspect-[4_/_3] mi:rounded-lg mi:overflow-hidden mi:isolate mi:[background:radial-gradient(120%_90%_at_30%_20%,_color-mix(in_srgb,_var(--hg-hue)_35%,_var(--mi-elev)),_var(--mi-elev))] mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:border-3 mi:after:border-green mi:after:rounded-[inherit] mi:after:pointer-events-none mi:after:[--mi-blink:.45]" :class="p.id === speakerId ? 'mi:after:opacity-100 mi:after:animate-[blink_1.6s_var(--mi-ease)_infinite] mi:motion-reduce:after:animate-none' : 'mi:after:opacity-0'"
            :style="{ '--hg-hue': p.hue }"
          >
            <MiAvatar :name="p.name" size="lg" tone="auto" decorative />
            <span v-if="queuePos(p.id)" class="mi:[--mi-in-s:.6] mi:animate-[in_var(--mi-dur-3)_var(--mi-spring)] mi:motion-reduce:animate-none mi:absolute mi:top-2 mi:right-2 mi:py-[3px] mi:px-2 mi:rounded-[999px] mi:[background:var(--mi-card)] mi:text-orange-t mi:text-[12px] mi:font-bold mi:shadow-1" :aria-label="'Hand raised, number ' + queuePos(p.id)">✋ {{ queuePos(p.id) }}</span>
            <span class="mi:absolute mi:left-2 mi:bottom-2 mi:inline-flex mi:items-center mi:gap-1 mi:max-w-[calc(100%_-_16px)] mi:py-[3px] mi:px-2 mi:rounded-[8px] mi:[background:color-mix(in_srgb,_var(--mi-card)_82%,_transparent)] mi:text-[12px] mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">
              <MiIcon v-if="p.muted" :svg="icons.micOff" :size="13" label="Muted" />
              {{ p.id === 'me' ? 'You' : p.name }}
            </span>
          </li>
        </ul>

        <div class="mi:flex mi:justify-center mi:items-center mi:gap-2.5 mi:p-2.5 mi:rounded-[999px] mi:[background:var(--mi-card)] mi:shadow-1 mi:justify-self-center" role="toolbar" aria-label="Call controls">
          <MiIconButton :label="me.muted ? 'Unmute' : 'Mute'" variant="gray" :pressed="me.muted" @click="me.muted = !me.muted">
            <MiIcon :svg="me.muted ? icons.micOff : icons.mic" />
          </MiIconButton>
          <MiIconButton label="Raise hand" variant="gray" :pressed="!!queuePos('me')" @click="toggleHand('me')">
            <span aria-hidden="true">✋</span>
          </MiIconButton>
          <MiButton variant="destructive">Leave</MiButton>
        </div>
      </div>

      <aside class="mi:grid mi:content-start mi:gap-1.5 mi:py-4.5 mi:px-4 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="hg-queue-title">
        <MiText id="hg-queue-title" as="h3" variant="subheadline" weight="semibold">Raised hands</MiText>
        <MiText variant="caption" tone="label2">First come, first served. Calling on someone unmutes them.</MiText>
        <ol v-if="queue.length" class="mi:[list-style:none] mi:mt-2 mi:mx-0 mi:mb-0 mi:p-0 mi:grid mi:gap-1">
          <li v-for="(id, i) in queue" :key="id" class="mi:flex mi:items-center mi:gap-2 mi:min-h-10 mi:pt-1 mi:pr-1 mi:pb-1 mi:pl-2 mi:rounded-md mi:first:[background:var(--mi-p-tint)]">
            <span class="mi:w-4 mi:text-[12px] mi:font-bold mi:text-label3 mi:tabular-nums">{{ i + 1 }}</span>
            <MiAvatar :name="byId[id]?.name" size="xs" tone="auto" decorative />
            <span class="mi:flex-1 mi:min-w-0 mi:text-[14px] mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ id === 'me' ? 'You' : byId[id]?.name }}</span>
            <MiButton v-if="i === 0" size="mini" variant="tinted" @click="callOn(id)">Call on</MiButton>
            <MiIconButton :label="'Lower hand for ' + byId[id]?.name" variant="plain" size="small" @click="toggleHand(id)"><MiIcon name="close" :size="14" /></MiIconButton>
          </li>
        </ol>
        <p v-else class="mi:mt-2 mi:mx-0 mi:mb-0 mi:text-[13px] mi:text-label2">No hands raised.</p>
        <p class="mi:mt-1.5 mi:mx-0 mi:mb-0 mi:min-h-4.5 mi:text-[12.5px] mi:text-green-t" role="status">{{ speakerId ? 'Speaking: ' + (speakerId === 'me' ? 'You' : byId[speakerId]?.name) : '' }}</p>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Person { id: string, name: string, muted: boolean, hue: string }

const icons = {
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  micOff: '<path d="M15 9V6a3 3 0 0 0-5.7-1.3M9 9v2a3 3 0 0 0 4.6 2.5M5 11a7 7 0 0 0 11.5 5.4M19 11a7 7 0 0 1-.6 2.8M12 18v3M3 3l18 18"/>'
}

// Sample call; swap for your realtime SDK state.
const people = ref<Person[]>([
  { id: 'kofi', name: 'Kofi Mensah', muted: false, hue: 'var(--mi-p)' },
  { id: 'me', name: 'Elise Laurent', muted: true, hue: 'var(--mi-s)' },
  { id: 'hana', name: 'Hana Sato', muted: true, hue: 'var(--mi-green)' },
  { id: 'ben', name: 'Ben Fischer', muted: true, hue: 'var(--mi-orange)' },
  { id: 'lucia', name: 'Lucía Gómez', muted: true, hue: 'var(--mi-red)' },
  { id: 'arjun', name: 'Arjun Mehta', muted: true, hue: 'var(--mi-p)' },
  { id: 'zoe', name: 'Zoe Clarke', muted: true, hue: 'var(--mi-s)' },
  { id: 'ilya', name: 'Ilya Petrov', muted: true, hue: 'var(--mi-green)' }
])
const queue = ref<string[]>(['hana', 'arjun', 'zoe'])
const speakerId = ref<string | null>('kofi')

const byId = computed(() => {
  const map: Record<string, Person | undefined> = {}
  for (const p of people.value) map[p.id] = p
  return map
})
const me = computed(() => byId.value.me ?? people.value[0]!)
const queuePos = (id: string) => queue.value.indexOf(id) + 1

function toggleHand(id: string) {
  queue.value = queue.value.includes(id) ? queue.value.filter(x => x !== id) : [...queue.value, id]
}

function callOn(id: string) {
  const prev = speakerId.value ? byId.value[speakerId.value] : undefined
  if (prev) prev.muted = true
  const next = byId.value[id]
  if (next) next.muted = false
  speakerId.value = id
  queue.value = queue.value.filter(x => x !== id)
}
</script>

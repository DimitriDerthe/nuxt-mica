<template>
  <section class="hg" aria-labelledby="hg-title">
    <div class="hg__shell">
      <div class="hg__main">
        <header class="hg__head">
          <div>
            <MiText id="hg-title" as="h2" variant="headline" weight="semibold">All-hands Q&amp;A</MiText>
            <MiText variant="caption" tone="label2">{{ people.length }} in call · 32:14 · you are hosting</MiText>
          </div>
          <MiBadge :tone="queue.length ? 'warning' : 'neutral'" :label="queue.length + ' raised'" dot />
        </header>

        <ul class="hg__grid" aria-label="Participants">
          <li
            v-for="p in people" :key="p.id" class="hg__tile" :class="{ 'is-speaking': p.id === speakerId }"
            :style="{ '--hg-hue': p.hue }"
          >
            <MiAvatar :name="p.name" size="lg" tone="auto" decorative />
            <span v-if="queuePos(p.id)" class="hg__hand" :aria-label="'Hand raised, number ' + queuePos(p.id)">✋ {{ queuePos(p.id) }}</span>
            <span class="hg__name">
              <MiIcon v-if="p.muted" :svg="icons.micOff" :size="13" label="Muted" />
              {{ p.id === 'me' ? 'You' : p.name }}
            </span>
          </li>
        </ul>

        <div class="hg__controls" role="toolbar" aria-label="Call controls">
          <MiIconButton :label="me.muted ? 'Unmute' : 'Mute'" variant="gray" :pressed="me.muted" @click="me.muted = !me.muted">
            <MiIcon :svg="me.muted ? icons.micOff : icons.mic" />
          </MiIconButton>
          <MiIconButton label="Raise hand" variant="gray" :pressed="!!queuePos('me')" @click="toggleHand('me')">
            <span aria-hidden="true">✋</span>
          </MiIconButton>
          <MiButton variant="destructive">Leave</MiButton>
        </div>
      </div>

      <aside class="hg__queue" aria-labelledby="hg-queue-title">
        <MiText id="hg-queue-title" as="h3" variant="subheadline" weight="semibold">Raised hands</MiText>
        <MiText variant="caption" tone="label2">First come, first served. Calling on someone unmutes them.</MiText>
        <ol v-if="queue.length" class="hg__list">
          <li v-for="(id, i) in queue" :key="id" class="hg__q">
            <span class="hg__q-n">{{ i + 1 }}</span>
            <MiAvatar :name="byId[id]?.name" size="xs" tone="auto" decorative />
            <span class="hg__q-name">{{ id === 'me' ? 'You' : byId[id]?.name }}</span>
            <MiButton v-if="i === 0" size="mini" variant="tinted" @click="callOn(id)">Call on</MiButton>
            <MiIconButton :label="'Lower hand for ' + byId[id]?.name" variant="plain" size="small" @click="toggleHand(id)"><MiIcon name="close" :size="14" /></MiIconButton>
          </li>
        </ol>
        <p v-else class="hg__empty">No hands raised.</p>
        <p class="hg__now" role="status">{{ speakerId ? 'Speaking: ' + (speakerId === 'me' ? 'You' : byId[speakerId]?.name) : '' }}</p>
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

<style scoped>
.hg { container-type: inline-size; min-height: 660px; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.hg__shell { display: grid; gap: 16px; padding: 16px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 920px) { .hg__shell { grid-template-columns: minmax(0, 1fr) 280px; padding: 20px; } }

.hg__main { display: grid; align-content: start; gap: 14px; min-width: 0; }
.hg__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.hg__grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
@container (min-width: 600px) { .hg__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@container (min-width: 1100px) { .hg__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

/* Faux video: a token gradient per person, the avatar stands in for the camera feed. */
.hg__tile { position: relative; display: grid; place-items: center; aspect-ratio: 4 / 3; border-radius: var(--mi-radius-l); overflow: hidden; isolation: isolate; background: radial-gradient(120% 90% at 30% 20%, color-mix(in srgb, var(--hg-hue) 35%, var(--mi-elev)), var(--mi-elev)); }
.hg__tile::after { content: ""; position: absolute; inset: 0; border: 3px solid var(--mi-green); border-radius: inherit; opacity: 0; pointer-events: none; }
.hg__tile.is-speaking::after { opacity: 1; animation: hg-talk 1.6s var(--mi-ease) infinite; }
@keyframes hg-talk { 50% { opacity: .45; } }
.hg__hand { position: absolute; top: 8px; right: 8px; padding: 3px 8px; border-radius: 999px; background: var(--mi-card); color: var(--mi-orange-t); font-size: 12px; font-weight: 700; box-shadow: var(--mi-sh1); animation: hg-pop var(--mi-dur-3) var(--mi-spring); }
@keyframes hg-pop { from { transform: scale(.6); opacity: 0; } }
.hg__name { position: absolute; left: 8px; bottom: 8px; display: inline-flex; align-items: center; gap: 4px; max-width: calc(100% - 16px); padding: 3px 8px; border-radius: 8px; background: color-mix(in srgb, var(--mi-card) 82%, transparent); font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.hg__controls { display: flex; justify-content: center; align-items: center; gap: 10px; padding: 10px; border-radius: 999px; background: var(--mi-card); box-shadow: var(--mi-sh1); justify-self: center; }

.hg__queue { display: grid; align-content: start; gap: 6px; padding: 18px 16px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.hg__list { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 4px; }
.hg__q { display: flex; align-items: center; gap: 8px; min-height: 40px; padding: 4px 4px 4px 8px; border-radius: var(--mi-radius-m); }
.hg__q:first-child { background: var(--mi-p-tint); }
.hg__q-n { width: 16px; font-size: 12px; font-weight: 700; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.hg__q-name { flex: 1; min-width: 0; font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hg__empty { margin: 8px 0 0; font-size: 13px; color: var(--mi-label2); }
.hg__now { margin: 6px 0 0; min-height: 18px; font-size: 12.5px; color: var(--mi-green-t); }
@media (prefers-reduced-motion: reduce) { .hg__tile.is-speaking::after, .hg__hand { animation: none; } }
</style>

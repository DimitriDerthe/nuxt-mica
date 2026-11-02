<template>
  <section class="mt" aria-labelledby="mt-title">
    <div class="mt__card">
      <!-- One toolbar, three modes: it morphs instead of stacking extra bars. -->
      <div class="mt__bar" :data-mode="mode">
        <Transition name="mt-swap" mode="out-in">
          <div v-if="mode === 'default'" key="default" class="mt__row" role="toolbar" aria-label="Conversation">
            <MiAvatarGroup :items="members" :max="3" :size="32" class="mt__stack" />
            <div class="mt__title">
              <MiText id="mt-title" as="h2" variant="headline" weight="semibold" :lines="1">Q3 pricing review</MiText>
              <MiText variant="caption" tone="label2" :lines="1"><span class="mt__live" aria-hidden="true" />3 of 5 online</MiText>
            </div>
            <div class="mt__actions">
              <MiIconButton label="Search in conversation" variant="plain" size="toolbar" @click="enter('search')"><MiIcon name="search" /></MiIconButton>
              <MiIconButton class="mt__wide" label="Start voice call" variant="plain" size="toolbar"><MiIcon :svg="icons.phone" /></MiIconButton>
              <MiIconButton label="Start video call" variant="plain" size="toolbar"><MiIcon :svg="icons.video" /></MiIconButton>
              <MiIconButton class="mt__wide" label="Pin conversation" variant="plain" size="toolbar" :pressed="pinned" @click="pinned = !pinned"><MiIcon :svg="icons.pin" :filled="pinned" /></MiIconButton>
              <MiIconButton label="Select messages" variant="plain" size="toolbar" @click="enter('select')"><MiIcon name="check-circle" /></MiIconButton>
            </div>
          </div>

          <div v-else-if="mode === 'search'" key="search" class="mt__row" role="toolbar" aria-label="Search in conversation">
            <MiSearch v-model="query" size="compact" class="mt__search" placeholder="Search this chat" aria-label="Search this chat" :cancelable="false" />
            <span class="mt__count" aria-live="polite">{{ total ? (current + 1) + ' of ' + total : 'No matches' }}</span>
            <MiIconButton label="Previous match" variant="gray" size="small" :disabled="!total" @click="step(-1)"><MiIcon name="chevron-up" :size="16" /></MiIconButton>
            <MiIconButton label="Next match" variant="gray" size="small" :disabled="!total" @click="step(1)"><MiIcon name="chevron-down" :size="16" /></MiIconButton>
            <MiButton variant="plain" size="small" @click="enter('default')">Done</MiButton>
          </div>

          <div v-else key="select" class="mt__row mt__row--select" role="toolbar" aria-label="Selected messages">
            <MiButton variant="plain" size="small" @click="enter('default')">Cancel</MiButton>
            <MiText variant="headline" weight="semibold" class="mt__sel" aria-live="polite">{{ selected.length }} selected</MiText>
            <div class="mt__actions">
              <MiIconButton label="Reply" variant="gray" size="small" :disabled="selected.length !== 1"><MiIcon :svg="icons.reply" :size="16" /></MiIconButton>
              <MiIconButton label="Forward" variant="gray" size="small" :disabled="!selected.length"><MiIcon :svg="icons.forward" :size="16" /></MiIconButton>
              <MiIconButton label="Copy" variant="gray" size="small" :disabled="!selected.length"><MiIcon name="copy" :size="16" /></MiIconButton>
              <MiIconButton label="Delete" variant="gray" size="small" :disabled="!selected.length" @click="remove"><MiIcon name="trash" :size="16" /></MiIconButton>
            </div>
          </div>
        </Transition>
      </div>

      <div class="mt__msgs" :class="{ 'is-selecting': mode === 'select' }">
        <MiMarker variant="separator">Today</MiMarker>
        <MiMessage
          v-for="m in rendered" :key="m.id" :align="m.me ? 'end' : 'start'" :label="m.who"
          class="mt__msg" :class="{ 'is-end': m.me, 'is-picked': selected.includes(m.id) }"
        >
          <template #avatar><MiAvatar :name="m.who" size="xs" :tone="m.me ? 'primary' : 'auto'" decorative /></template>
          <MiBubble
            as="button" :align="m.me ? 'end' : 'start'" :variant="m.me ? 'default' : 'secondary'" class="mt__bub"
            :aria-pressed="mode === 'select' ? selected.includes(m.id) : undefined" @click="pick(m.id)"
          ><template v-for="(p, i) in m.parts" :key="i"><mark v-if="p.match >= 0" :class="{ 'is-current': p.match === current }">{{ p.text }}</mark><template v-else>{{ p.text }}</template></template></MiBubble>
          <template v-if="!m.me" #header>{{ m.who }}</template>
        </MiMessage>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type Mode = 'default' | 'search' | 'select'
interface Msg { id: string, who: string, text: string, me?: boolean }

const icons = {
  phone: '<path d="M6.5 3.5h3l1.5 4-2 1.3a10.5 10.5 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>',
  video: '<rect x="3" y="6" width="12.5" height="12" rx="2.5"/><path d="M15.5 10.2 21 7v10l-5.5-3.2"/>',
  pin: '<path d="M9 3.5h6l-.8 5.2 3.3 3.3h-11l3.3-3.3L9 3.5zM12 12v8.5"/>',
  reply: '<path d="M9 7 4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 6 6"/>',
  forward: '<path d="m15 7 5 5-5 5"/><path d="M20 12H10a6 6 0 0 0-6 6"/>'
}

const members = [
  { name: 'Amara Diallo', tone: 'teal' as const },
  { name: 'Jonas Weber', tone: 'indigo' as const },
  { name: 'Priya Raman', tone: 'pink' as const },
  { name: 'Tomás Ruiz' },
  { name: 'Léa Fontaine' }
]

// Sample conversation; swap for your messages API.
const messages = ref<Msg[]>([
  { id: 'm1', who: 'Jonas Weber', text: 'Draft pricing is in the deck: Starter 12 €, Team 29 €, Scale on request.' },
  { id: 'm2', who: 'Priya Raman', text: 'Support volume says Team should include priority email. Scale customers ask for SLAs, not features.' },
  { id: 'm3', who: 'Léa Fontaine', me: true, text: 'Agree on priority email. Can we test 34 € for Team in two regions first?' },
  { id: 'm4', who: 'Amara Diallo', text: 'Netherlands and Portugal are the cleanest test regions for pricing. Low overlap with ads.' },
  { id: 'm5', who: 'Jonas Weber', text: 'OK: Team at 34 € in NL and PT for six weeks, everywhere else 29 €.' },
  { id: 'm6', who: 'Léa Fontaine', me: true, text: 'Perfect. I will brief finance on the pricing test tomorrow.' }
])

const mode = ref<Mode>('default')
const query = ref('pricing')
const current = ref(0)
const selected = ref<string[]>([])
const pinned = ref(true)

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Split every message around the query and number the matches across the whole chat.
const rendered = computed(() => {
  const q = mode.value === 'search' ? query.value.trim() : ''
  const re = q ? new RegExp('(' + escape(q) + ')', 'gi') : null
  let n = 0
  return messages.value.map(m => ({
    ...m,
    parts: (re ? m.text.split(re) : [m.text]).filter(Boolean).map(text => ({ text, match: re && text.toLowerCase() === q.toLowerCase() ? n++ : -1 }))
  }))
})
const total = computed(() => rendered.value.reduce((sum, m) => sum + m.parts.filter(p => p.match >= 0).length, 0))
watch(query, () => { current.value = 0 })

function step(dir: 1 | -1) {
  if (total.value) current.value = (current.value + dir + total.value) % total.value
}

function enter(next: Mode) {
  mode.value = next
  if (next !== 'select') selected.value = []
}

function pick(id: string) {
  if (mode.value !== 'select') mode.value = 'select'
  selected.value = selected.value.includes(id) ? selected.value.filter(x => x !== id) : [...selected.value, id]
}

function remove() {
  messages.value = messages.value.filter(m => !selected.value.includes(m.id))
  enter('default')
}
</script>

<style scoped>
.mt { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.mt__card { max-width: 760px; margin-inline: auto; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2); overflow: hidden; }

.mt__bar { position: relative; min-height: 64px; padding: 0 10px 0 14px; border-bottom: 1px solid var(--mi-sep); display: grid; align-items: center; }
/* Mode tint: a hairline under the bar that changes colour with the mode. */
.mt__bar::after { content: ""; position: absolute; inset: auto 0 -1px 0; height: 2px; background: var(--mi-p); transform: scaleX(0); transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-ease); }
.mt__bar[data-mode="search"]::after, .mt__bar[data-mode="select"]::after { transform: scaleX(1); }
.mt__row { display: flex; align-items: center; gap: 10px; min-width: 0; padding-block: 10px; }
.mt__stack { flex: none; display: none; }
@container (min-width: 420px) { .mt__stack { display: flex; } }
.mt__title { flex: 1; min-width: 0; }
.mt__live { display: inline-block; width: 7px; height: 7px; margin-right: 6px; border-radius: 50%; background: var(--mi-green); vertical-align: 1px; }
.mt__actions { display: flex; align-items: center; gap: 2px; flex: none; }
.mt__row--select .mt__actions { gap: 6px; }
.mt__wide { display: none; }
@container (min-width: 480px) { .mt__wide { display: inline-flex; } }
.mt__search { flex: 1; min-width: 0; }
.mt__count { flex: none; min-width: 52px; font-size: 12px; font-weight: 500; color: var(--mi-label2); text-align: end; font-variant-numeric: tabular-nums; }
.mt__sel { flex: 1; min-width: 0; }

.mt-swap-enter-active, .mt-swap-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.mt-swap-enter-from { opacity: 0; transform: translateY(6px); }
.mt-swap-leave-to { opacity: 0; transform: translateY(-6px); }

.mt__msgs { display: flex; flex-direction: column; gap: 10px; padding: 16px; background: var(--mi-page); }
.mt__msg { max-width: min(86%, 30rem); }
.mt__msg.is-end { margin-inline-start: auto; }
.mt .mt__bub { max-width: 100%; }
.mt__bub mark { border-radius: 4px; padding: 0 2px; background: color-mix(in srgb, var(--mi-yellow) 32%, transparent); color: inherit; }
.mt__bub mark.is-current { background: color-mix(in srgb, var(--mi-yellow) 55%, transparent); box-shadow: 0 0 0 1.5px currentColor; }
/* Selection: a check ring slides in beside each bubble. */
.mt__msg { position: relative; transition: transform var(--mi-dur-2) var(--mi-ease); }
.mt__msgs.is-selecting .mt__msg:not(.is-end) { transform: translateX(28px); }
.mt__msg::before { content: ""; position: absolute; top: 50%; width: 18px; height: 18px; margin-top: -9px; border-radius: 50%; border: 2px solid var(--mi-fill); box-sizing: border-box; opacity: 0; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.mt__msg:not(.is-end)::before { left: -22px; }
.mt__msg.is-end::before { left: -26px; }
.mt__msgs.is-selecting .mt__msg::before { opacity: 1; }
.mt__msg.is-picked::before { border-color: var(--mi-p); background: radial-gradient(circle, var(--mi-p) 0 4px, transparent 5px); }
</style>

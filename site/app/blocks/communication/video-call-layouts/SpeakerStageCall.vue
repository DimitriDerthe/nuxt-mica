<template>
  <section class="vc" aria-labelledby="vc-title">
    <div class="vc__shell" :class="{ 'is-chat': chat }">
      <div class="vc__call">
        <header class="vc__top">
          <span class="vc__rec" aria-label="Recording" role="img" />
          <div class="vc__top-text">
            <MiText id="vc-title" as="h2" variant="subheadline" weight="semibold" :lines="1">Sprint 42 review</MiText>
            <MiText variant="caption" tone="label2" tabular>{{ clock }} · {{ people.length }} people</MiText>
          </div>
          <MiBadge v-if="hand" tone="warning" label="Hand raised" />
        </header>

        <div class="vc__body">
          <!-- Stage: the pinned person, drawn with a token gradient and initials. -->
          <div class="vc__stage vc__tile" :style="tileStyle(pinned)" :class="{ 'is-speaking': pinned.id === speaker && !pinned.muted }">
            <template v-if="pinned.id === 'me' && sharing">
              <div class="vc__share" aria-label="Your screen" role="img">
                <span /><span /><span />
              </div>
            </template>
            <span v-else class="vc__face vc__face--lg" :class="{ 'is-off': !pinned.cam }">{{ initials(pinned.name) }}</span>
            <span class="vc__tag">
              <MiIcon :svg="pinned.muted ? icons.micOff : icons.mic" :size="14" />{{ pinned.id === 'me' ? 'You' : pinned.name }}
              <span v-if="pinned.id === 'me' && sharing" class="vc__tag-note">presenting</span>
            </span>
            <span class="vc__pin">Pinned</span>
          </div>

          <ul class="vc__strip" aria-label="Participants">
            <li v-for="p in others" :key="p.id">
              <button
                type="button" class="vc__tile vc__mini" :style="tileStyle(p)" :class="{ 'is-speaking': p.id === speaker && !p.muted }"
                :aria-label="'Pin ' + (p.id === 'me' ? 'yourself' : p.name)" @click="pinnedId = p.id"
              >
                <span class="vc__face" :class="{ 'is-off': !p.cam }">{{ initials(p.name) }}</span>
                <span class="vc__tag vc__tag--sm">
                  <MiIcon :svg="p.muted ? icons.micOff : icons.mic" :size="12" />{{ p.id === 'me' ? 'You' : p.name.split(' ')[0] }}
                  <span v-if="p.id === 'me' && hand" aria-label="hand raised">✋</span>
                </span>
              </button>
            </li>
          </ul>
        </div>

        <div class="vc__controls" role="toolbar" aria-label="Call controls">
          <button type="button" class="vc__ctl" :class="{ 'is-off': me.muted }" :aria-pressed="me.muted" :aria-label="me.muted ? 'Unmute' : 'Mute'" @click="me.muted = !me.muted">
            <MiIcon :svg="me.muted ? icons.micOff : icons.mic" />
          </button>
          <button type="button" class="vc__ctl" :class="{ 'is-off': !me.cam }" :aria-pressed="!me.cam" :aria-label="me.cam ? 'Turn camera off' : 'Turn camera on'" @click="me.cam = !me.cam">
            <MiIcon :svg="me.cam ? icons.cam : icons.camOff" />
          </button>
          <button type="button" class="vc__ctl vc__wide" :class="{ 'is-on': sharing }" :aria-pressed="sharing" aria-label="Share screen" @click="toggleShare">
            <MiIcon :svg="icons.share" />
          </button>
          <button type="button" class="vc__ctl" :class="{ 'is-on': hand }" :aria-pressed="hand" aria-label="Raise hand" @click="hand = !hand">
            <MiIcon :svg="icons.hand" />
          </button>
          <MiBadge :count="chat ? 0 : unread" placement="top-right">
            <template #target>
              <button type="button" class="vc__ctl" :class="{ 'is-on': chat }" :aria-pressed="chat" aria-label="Chat" @click="openChat">
                <MiIcon name="chat" />
              </button>
            </template>
          </MiBadge>
          <button type="button" class="vc__ctl vc__leave" :aria-label="left ? 'Rejoin call' : 'Leave call'" @click="left = !left">
            <MiIcon :svg="icons.leave" />
          </button>
        </div>
        <p v-if="left" class="vc__left" role="status">You left the call. Select the red button to rejoin.</p>
      </div>

      <aside class="vc__panel" aria-labelledby="vc-chat-title">
        <header class="vc__panel-head">
          <MiIconButton class="vc__back" label="Back to call" variant="gray" size="regular" @click="chat = false"><MiIcon name="chevron-left" /></MiIconButton>
          <MiText id="vc-chat-title" as="h3" variant="subheadline" weight="semibold">In-call chat</MiText>
          <MiIconButton class="vc__close" label="Close chat" variant="plain" size="small" @click="chat = false"><MiIcon name="close" :size="16" /></MiIconButton>
        </header>
        <MiMessageScroller class="vc__log" label="In-call chat">
          <MiMessageScrollerItem v-for="m in messages" :key="m.id" :message-id="'vc-' + m.id">
            <MiMessage :align="m.me ? 'end' : 'start'" :label="m.who" class="vc__row" :class="{ 'is-end': m.me }">
              <template v-if="!m.me" #header>{{ m.who }}</template>
              <MiBubble :align="m.me ? 'end' : 'start'" :variant="m.me ? 'default' : 'secondary'" class="vc__bub">{{ m.text }}</MiBubble>
            </MiMessage>
          </MiMessageScrollerItem>
        </MiMessageScroller>
        <form class="vc__composer" @submit.prevent="send">
          <MiInputGroup v-model="draft" size="sm" aria-label="Message everyone" placeholder="Message everyone">
            <template #trailing>
              <MiIconButton type="submit" label="Send" size="small" :disabled="!draft.trim()"><MiIcon name="arrow-up" :size="15" /></MiIconButton>
            </template>
          </MiInputGroup>
        </form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface Person { id: string, name: string, a: string, b: string, muted: boolean, cam: boolean }

const icons = {
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  micOff: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M4 4l16 16"/>',
  cam: '<rect x="3" y="6" width="12.5" height="12" rx="2.5"/><path d="M15.5 10.2 21 7v10l-5.5-3.2"/>',
  camOff: '<rect x="3" y="6" width="12.5" height="12" rx="2.5"/><path d="M15.5 10.2 21 7v10l-5.5-3.2M3 3l18 18"/>',
  share: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 13V8M9.5 10.5 12 8l2.5 2.5"/>',
  hand: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12m0-7a1.5 1.5 0 0 1 3 0v7m0-5.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5A6.5 6.5 0 0 1 5 17.5L3.6 14a1.5 1.5 0 0 1 2.6-1.4L8 15"/>',
  leave: '<path d="M3 14.5c5-4.7 13-4.7 18 0l-2.2 2.6-3.3-1.4v-2.6a10.4 10.4 0 0 0-7 0v2.6l-3.3 1.4z"/>'
}

// Sample call; tiles use token gradients instead of video.
const people = ref<Person[]>([
  { id: 'kenji', name: 'Kenji Watanabe', a: 'indigo', b: 'teal', muted: false, cam: true },
  { id: 'me', name: 'Léa Fontaine', a: 'p', b: 's', muted: false, cam: true },
  { id: 'zara', name: 'Zara Ahmed', a: 'pink', b: 'orange', muted: true, cam: true },
  { id: 'lukas', name: 'Lukas Novak', a: 'green', b: 'teal', muted: true, cam: false },
  { id: 'ines', name: 'Inês Carvalho', a: 'orange', b: 'yellow', muted: false, cam: true },
  { id: 'omar', name: 'Omar Haddad', a: 'blue', b: 'purple', muted: true, cam: true }
])
const speakers = ['kenji', 'ines', 'kenji', 'me']

const pinnedId = ref('kenji')
const chat = ref(false)
const sharing = ref(false)
const hand = ref(false)
const left = ref(false)
const unread = ref(2)
const draft = ref('')
const seconds = ref(18 * 60 + 42)
let timer: ReturnType<typeof setInterval> | undefined

const me = computed(() => people.value.find(p => p.id === 'me') ?? people.value[0]!)
const pinned = computed(() => people.value.find(p => p.id === pinnedId.value) ?? people.value[0]!)
const others = computed(() => people.value.filter(p => p.id !== pinnedId.value))
// The active speaker rotates with the clock tick, so the ring moves around the room.
const speaker = computed(() => (left.value ? '' : speakers[Math.floor(seconds.value / 5) % speakers.length]))
const clock = computed(() => `${String(Math.floor(seconds.value / 60)).padStart(2, '0')}:${String(seconds.value % 60).padStart(2, '0')}`)

const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2)
const tileStyle = (p: Person) => ({ '--a': `var(--mi-${p.a})`, '--b': `var(--mi-${p.b})` })

const messages = ref([
  { id: 1, who: 'Zara Ahmed', me: false, text: 'Demo link for the new onboarding: staging build 1.42.0-rc2' },
  { id: 2, who: 'Omar Haddad', me: false, text: 'Can we keep 5 min at the end for the incident from Tuesday?' }
])

function toggleShare() {
  sharing.value = !sharing.value
  if (sharing.value) pinnedId.value = 'me'
}

function openChat() {
  chat.value = !chat.value
  unread.value = 0
}

let seq = 10
function send() {
  const text = draft.value.trim()
  if (!text) return
  messages.value.push({ id: ++seq, who: 'You', me: true, text })
  draft.value = ''
}

onMounted(() => { timer = setInterval(() => { if (!left.value) seconds.value += 1 }, 1000) })
onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.vc { container-type: inline-size; height: 680px; font-family: var(--mi-font); color: var(--mi-label); background: color-mix(in srgb, var(--mi-label) 6%, var(--mi-page)); }
.vc__shell { display: grid; height: 100%; grid-template-columns: minmax(0, 1fr); }
.vc__panel { display: none; }
.vc__shell.is-chat .vc__call { display: none; }
.vc__shell.is-chat .vc__panel { display: flex; }
.vc__close { display: none; }

@container (min-width: 1000px) {
  .vc__shell.is-chat { grid-template-columns: minmax(0, 1fr) 320px; }
  .vc__shell.is-chat .vc__call { display: flex; }
  .vc__panel { border-left: 1px solid var(--mi-sep); }
  .vc__back { display: none; }
  .vc__close { display: inline-flex; }
}

.vc__call { display: flex; flex-direction: column; gap: 12px; min-width: 0; min-height: 0; padding: 12px; }
.vc__top { display: flex; align-items: center; gap: 10px; padding: 2px 4px; }
.vc__top-text { flex: 1; min-width: 0; }
.vc__rec { flex: none; width: 10px; height: 10px; border-radius: 50%; background: var(--mi-red); box-shadow: 0 0 0 4px color-mix(in srgb, var(--mi-red) 22%, transparent); }

.vc__body { flex: 1; min-height: 0; display: grid; gap: 10px; grid-template-rows: minmax(0, 1fr) auto; }
@container (min-width: 760px) {
  .vc__body { grid-template-rows: none; grid-template-columns: minmax(0, 1fr) 180px; }
}

.vc__tile { position: relative; display: grid; place-items: center; overflow: hidden; isolation: isolate; border-radius: var(--mi-radius-xl); background: linear-gradient(140deg, color-mix(in srgb, var(--a) 72%, var(--mi-label)), color-mix(in srgb, var(--b) 58%, var(--mi-page))); color: var(--mi-page); }
/* Soft light in the corner gives each tile depth without media. */
.vc__tile::before { content: ""; position: absolute; inset: -30% 30% 40% -30%; z-index: -1; border-radius: 50%; background: radial-gradient(closest-side, color-mix(in srgb, var(--mi-page) 30%, transparent), transparent); }
/* Speaking ring: a border layer that breathes with opacity and scale. */
.vc__tile::after { content: ""; position: absolute; inset: 0; border-radius: inherit; box-shadow: inset 0 0 0 3px var(--mi-green); opacity: 0; transition: opacity var(--mi-dur-2) var(--mi-ease); pointer-events: none; }
.vc__tile.is-speaking::after { opacity: 1; }
.vc__stage { min-height: 0; }
.vc__face { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 50%; background: color-mix(in srgb, var(--mi-label) 35%, transparent); font-size: 20px; font-weight: 700; letter-spacing: .02em; }
.vc__face--lg { width: clamp(84px, 18cqi, 140px); height: auto; aspect-ratio: 1; font-size: clamp(28px, 6cqi, 48px); }
.vc__tile.is-speaking .vc__face { animation: vc-talk 1.4s var(--mi-ease) infinite; }
@keyframes vc-talk { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
.vc__face.is-off { background: var(--mi-label); color: var(--mi-page); }
.vc__tag { position: absolute; left: 10px; bottom: 10px; display: inline-flex; align-items: center; gap: 6px; max-width: calc(100% - 20px); padding: 4px 10px 4px 8px; border-radius: 999px; background: color-mix(in srgb, var(--mi-label) 55%, transparent); color: var(--mi-page); font-size: 12.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vc__tag--sm { left: 6px; bottom: 6px; padding: 2px 8px 2px 6px; font-size: 11px; }
.vc__tag-note { font-weight: 400; opacity: .8; }
.vc__pin { position: absolute; top: 10px; right: 10px; padding: 3px 9px; border-radius: 999px; background: color-mix(in srgb, var(--mi-page) 80%, transparent); color: var(--mi-label); font-size: 11px; font-weight: 600; }

.vc__share { display: grid; gap: 10px; width: 70%; padding: 18px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh2); }
.vc__share span { height: 12px; border-radius: 6px; background: var(--mi-fill3); }
.vc__share span:first-child { width: 60%; height: 18px; background: var(--mi-p-tint2); }
.vc__share span:last-child { width: 80%; }

.vc__strip { list-style: none; margin: 0; padding: 0 0 2px; display: grid; grid-auto-flow: column; grid-auto-columns: 112px; gap: 8px; overflow-x: auto; scroll-snap-type: x mandatory; }
.vc__strip li { scroll-snap-align: start; }
@container (min-width: 760px) {
  .vc__strip { grid-auto-flow: row; grid-auto-columns: auto; grid-auto-rows: minmax(0, 1fr); overflow: hidden auto; padding: 0; }
}
.vc__mini { width: 100%; height: 100%; min-height: 84px; padding: 0; border: 0; font: inherit; cursor: pointer; transition: transform var(--mi-dur-2) var(--mi-ease); }
.vc__mini:hover { transform: scale(.98); }
.vc__mini:focus-visible, .vc__ctl:focus-visible { outline: 3px solid var(--mi-p); outline-offset: 2px; }
.vc__mini .vc__face { width: 40px; height: 40px; font-size: 14px; }

.vc__controls { display: flex; justify-content: center; align-items: center; gap: 8px; padding: 4px 0 2px; }
.vc__ctl { display: grid; place-items: center; width: 48px; height: 48px; padding: 0; border: 0; border-radius: 50%; background: var(--mi-card); color: var(--mi-label); box-shadow: var(--mi-sh1); cursor: pointer; transition: transform var(--mi-dur-1) var(--mi-ease); }
.vc__ctl:active { transform: scale(.94); }
.vc__ctl.is-off { background: var(--mi-label); color: var(--mi-page); }
.vc__ctl.is-on { background: var(--mi-p); color: var(--mi-p-on); }
.vc__leave { width: 64px; border-radius: 24px; background: var(--mi-red); color: var(--mi-p-on); }
.vc__wide { display: none; }
@container (min-width: 400px) { .vc__wide { display: grid; } }
.vc__left { margin: 0; text-align: center; font-size: 13px; color: var(--mi-label2); }

.vc__panel { flex-direction: column; min-height: 0; min-width: 0; background: var(--mi-card); }
.vc__panel-head { display: flex; align-items: center; gap: 10px; min-height: 56px; padding: 0 12px 0 16px; border-bottom: 1px solid var(--mi-sep); }
.vc__panel-head > :nth-child(2) { flex: 1; }
.vc__log { flex: 1; min-height: 0; }
.vc__row { max-width: 90%; }
.vc__row.is-end { margin-inline-start: auto; }
.vc .vc__bub { max-width: 100%; }
.vc__composer { padding: 10px 12px 12px; border-top: 1px solid var(--mi-sep); }
@media (prefers-reduced-motion: reduce) { .vc__tile.is-speaking .vc__face { animation: none; } }
</style>

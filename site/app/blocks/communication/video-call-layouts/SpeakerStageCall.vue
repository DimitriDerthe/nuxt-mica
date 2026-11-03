<template>
  <section class="vc mi:@container mi:h-170 mi:font-mi mi:text-label mi:[background:color-mix(in_srgb,_var(--mi-label)_6%,_var(--mi-page))]" aria-labelledby="vc-title">
    <div class="vc__shell mi:grid mi:h-full mi:grid-cols-[minmax(0,_1fr)] mi:@[1000px]:[&.is-chat]:grid-cols-[minmax(0,_1fr)_320px]" :class="{ 'is-chat': chat }">
      <div class="vc__call mi:[.vc__shell.is-chat_&]:hidden mi:@[1000px]:[.vc__shell.is-chat_&]:flex mi:flex mi:flex-col mi:gap-3 mi:min-w-0 mi:min-h-0 mi:p-3">
        <header class="vc__top mi:flex mi:items-center mi:gap-2.5 mi:py-0.5 mi:px-1">
          <span class="vc__rec mi:flex-[none] mi:w-2.5 mi:h-2.5 mi:rounded-[50%] mi:[background:var(--mi-red)] mi:shadow-[0_0_0_4px_color-mix(in_srgb,_var(--mi-red)_22%,_transparent)]" aria-label="Recording" role="img" />
          <div class="vc__top-text mi:flex-1 mi:min-w-0">
            <MiText id="vc-title" as="h2" variant="subheadline" weight="semibold" :lines="1">Sprint 42 review</MiText>
            <MiText variant="caption" tone="label2" tabular>{{ clock }} · {{ people.length }} people</MiText>
          </div>
          <MiBadge v-if="hand" tone="warning" label="Hand raised" />
        </header>

        <div class="vc__body mi:flex-1 mi:min-h-0 mi:grid mi:gap-2.5 mi:grid-rows-[minmax(0,_1fr)_auto] mi:@[760px]:grid-rows-[none] mi:@[760px]:grid-cols-[minmax(0,_1fr)_180px]">
          <!-- Stage: the pinned person, drawn with a token gradient and initials. -->
          <div class="vc__stage vc__tile mi:relative mi:grid mi:place-items-center mi:overflow-hidden mi:isolate mi:rounded-xl mi:[background:linear-gradient(140deg,_color-mix(in_srgb,_var(--a)_72%,_var(--mi-label)),_color-mix(in_srgb,_var(--b)_58%,_var(--mi-page)))] mi:text-page mi:before:content-[''] mi:before:absolute mi:before:top-[-30%] mi:before:right-[30%] mi:before:bottom-[40%] mi:before:left-[-30%] mi:before:-z-1 mi:before:rounded-[50%] mi:before:[background:radial-gradient(closest-side,_color-mix(in_srgb,_var(--mi-page)_30%,_transparent),_transparent)] mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:after:shadow-[inset_0_0_0_3px_var(--mi-green)] mi:after:opacity-0 mi:after:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:after:pointer-events-none mi:[&.is-speaking]:after:opacity-100 mi:min-h-0" :style="tileStyle(pinned)" :class="{ 'is-speaking': pinned.id === speaker && !pinned.muted }">
            <template v-if="pinned.id === 'me' && sharing">
              <div class="vc__share mi:grid mi:gap-2.5 mi:w-[70%] mi:p-4.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-2" aria-label="Your screen" role="img">
                <span class="mi:[.vc__share_&]:rounded-[6px] mi:[.vc__share_&:first-child]:w-[60%] mi:[.vc__share_&:last-child]:w-[80%]" /><span class="mi:[.vc__share_&]:rounded-[6px] mi:[.vc__share_&:first-child]:w-[60%] mi:[.vc__share_&:last-child]:w-[80%]" /><span class="mi:[.vc__share_&]:rounded-[6px] mi:[.vc__share_&:first-child]:w-[60%] mi:[.vc__share_&:last-child]:w-[80%]" />
              </div>
            </template>
            <span v-else class="vc__face vc__face--lg mi:grid mi:place-items-center mi:w-14 mi:h-14 mi:rounded-[50%] mi:[background:color-mix(in_srgb,_var(--mi-label)_35%,_transparent)] mi:text-[20px] mi:font-bold mi:tracking-[.02em] mi:w-[clamp(84px,_18cqi,_140px)] mi:h-auto mi:aspect-[1] mi:text-[clamp(28px,_6cqi,_48px)] mi:[&.is-off]:text-page mi:[.vc__mini_&]:w-10 mi:[.vc__mini_&]:text-[14px]" :class="{ 'is-off': !pinned.cam }">{{ initials(pinned.name) }}</span>
            <span class="vc__tag mi:absolute mi:inline-flex mi:items-center mi:gap-1.5 mi:max-w-[calc(100%_-_20px)] mi:rounded-[999px] mi:[background:color-mix(in_srgb,_var(--mi-label)_55%,_transparent)] mi:text-page mi:font-semibold mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">
              <MiIcon :svg="pinned.muted ? icons.micOff : icons.mic" :size="14" />{{ pinned.id === 'me' ? 'You' : pinned.name }}
              <span v-if="pinned.id === 'me' && sharing" class="vc__tag-note mi:font-normal mi:opacity-80">presenting</span>
            </span>
            <span class="vc__pin mi:absolute mi:top-2.5 mi:right-2.5 mi:py-[3px] mi:px-[9px] mi:rounded-[999px] mi:[background:color-mix(in_srgb,_var(--mi-page)_80%,_transparent)] mi:text-label mi:text-[11px] mi:font-semibold">Pinned</span>
          </div>

          <ul class="vc__strip mi:[list-style:none] mi:m-0 mi:pt-0 mi:px-0 mi:pb-0.5 mi:grid mi:grid-flow-col mi:auto-cols-[112px] mi:gap-2 mi:overflow-x-auto mi:[scroll-snap-type:x_mandatory] mi:@[760px]:grid-flow-row mi:@[760px]:auto-cols-[auto] mi:@[760px]:auto-rows-[minmax(0,_1fr)] mi:@[760px]:[overflow:hidden_auto] mi:@[760px]:p-0" aria-label="Participants">
            <li class="mi:[.vc__strip_li&]:snap-start" v-for="p in others" :key="p.id">
              <button
                type="button" class="vc__tile vc__mini mi:relative mi:grid mi:place-items-center mi:overflow-hidden mi:isolate mi:rounded-xl mi:[background:linear-gradient(140deg,_color-mix(in_srgb,_var(--a)_72%,_var(--mi-label)),_color-mix(in_srgb,_var(--b)_58%,_var(--mi-page)))] mi:text-page mi:before:content-[''] mi:before:absolute mi:before:top-[-30%] mi:before:right-[30%] mi:before:bottom-[40%] mi:before:left-[-30%] mi:before:-z-1 mi:before:rounded-[50%] mi:before:[background:radial-gradient(closest-side,_color-mix(in_srgb,_var(--mi-page)_30%,_transparent),_transparent)] mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:after:shadow-[inset_0_0_0_3px_var(--mi-green)] mi:after:opacity-0 mi:after:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:after:pointer-events-none mi:[&.is-speaking]:after:opacity-100 mi:w-full mi:h-full mi:min-h-21 mi:p-0 mi:[border:0] mi:[font:inherit] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[scale(.98)] mi:focus-visible:[outline:3px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :style="tileStyle(p)" :class="{ 'is-speaking': p.id === speaker && !p.muted }"
                :aria-label="'Pin ' + (p.id === 'me' ? 'yourself' : p.name)" @click="pinnedId = p.id"
              >
                <span class="vc__face mi:grid mi:place-items-center mi:w-14 mi:h-14 mi:rounded-[50%] mi:[background:color-mix(in_srgb,_var(--mi-label)_35%,_transparent)] mi:text-[20px] mi:font-bold mi:tracking-[.02em] mi:[&.is-off]:text-page mi:[.vc__mini_&]:w-10 mi:[.vc__mini_&]:text-[14px]" :class="{ 'is-off': !p.cam }">{{ initials(p.name) }}</span>
                <span class="vc__tag vc__tag--sm mi:absolute mi:inline-flex mi:items-center mi:gap-1.5 mi:max-w-[calc(100%_-_20px)] mi:rounded-[999px] mi:[background:color-mix(in_srgb,_var(--mi-label)_55%,_transparent)] mi:text-page mi:font-semibold mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">
                  <MiIcon class="mi:[.vc__strip_li&]:snap-start" :svg="p.muted ? icons.micOff : icons.mic" :size="12" />{{ p.id === 'me' ? 'You' : p.name.split(' ')[0] }}
                  <span v-if="p.id === 'me' && hand" aria-label="hand raised">✋</span>
                </span>
              </button>
            </li>
          </ul>
        </div>

        <div class="vc__controls mi:flex mi:justify-center mi:items-center mi:gap-2 mi:pt-1 mi:px-0 mi:pb-0.5" role="toolbar" aria-label="Call controls">
          <button type="button" class="vc__ctl mi:focus-visible:[outline:3px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:grid mi:place-items-center mi:w-12 mi:h-12 mi:p-0 mi:[border:0] mi:[background:var(--mi-card)] mi:text-label mi:shadow-1 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.94)] mi:[&.is-off]:[background:var(--mi-label)] mi:[&.is-off]:text-page mi:[&.is-on]:[background:var(--mi-p)] mi:[&.is-on]:text-p-on" :class="{ 'is-off': me.muted }" :aria-pressed="me.muted" :aria-label="me.muted ? 'Unmute' : 'Mute'" @click="me.muted = !me.muted">
            <MiIcon :svg="me.muted ? icons.micOff : icons.mic" />
          </button>
          <button type="button" class="vc__ctl mi:focus-visible:[outline:3px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:grid mi:place-items-center mi:w-12 mi:h-12 mi:p-0 mi:[border:0] mi:[background:var(--mi-card)] mi:text-label mi:shadow-1 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.94)] mi:[&.is-off]:[background:var(--mi-label)] mi:[&.is-off]:text-page mi:[&.is-on]:[background:var(--mi-p)] mi:[&.is-on]:text-p-on" :class="{ 'is-off': !me.cam }" :aria-pressed="!me.cam" :aria-label="me.cam ? 'Turn camera off' : 'Turn camera on'" @click="me.cam = !me.cam">
            <MiIcon :svg="me.cam ? icons.cam : icons.camOff" />
          </button>
          <button type="button" class="vc__ctl vc__wide mi:focus-visible:[outline:3px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:grid mi:place-items-center mi:w-12 mi:h-12 mi:p-0 mi:[border:0] mi:[background:var(--mi-card)] mi:text-label mi:shadow-1 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.94)] mi:[&.is-off]:[background:var(--mi-label)] mi:[&.is-off]:text-page mi:[&.is-on]:[background:var(--mi-p)] mi:[&.is-on]:text-p-on mi:hidden mi:@[400px]:grid" :class="{ 'is-on': sharing }" :aria-pressed="sharing" aria-label="Share screen" @click="toggleShare">
            <MiIcon :svg="icons.share" />
          </button>
          <button type="button" class="vc__ctl mi:focus-visible:[outline:3px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:grid mi:place-items-center mi:w-12 mi:h-12 mi:p-0 mi:[border:0] mi:[background:var(--mi-card)] mi:text-label mi:shadow-1 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.94)] mi:[&.is-off]:[background:var(--mi-label)] mi:[&.is-off]:text-page mi:[&.is-on]:[background:var(--mi-p)] mi:[&.is-on]:text-p-on" :class="{ 'is-on': hand }" :aria-pressed="hand" aria-label="Raise hand" @click="hand = !hand">
            <MiIcon :svg="icons.hand" />
          </button>
          <MiBadge :count="chat ? 0 : unread" placement="top-right">
            <template #target>
              <button type="button" class="vc__ctl mi:focus-visible:[outline:3px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:grid mi:place-items-center mi:w-12 mi:h-12 mi:p-0 mi:[border:0] mi:[background:var(--mi-card)] mi:text-label mi:shadow-1 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.94)] mi:[&.is-off]:[background:var(--mi-label)] mi:[&.is-off]:text-page mi:[&.is-on]:[background:var(--mi-p)] mi:[&.is-on]:text-p-on" :class="{ 'is-on': chat }" :aria-pressed="chat" aria-label="Chat" @click="openChat">
                <MiIcon name="chat" />
              </button>
            </template>
          </MiBadge>
          <button type="button" class="vc__ctl vc__leave mi:focus-visible:[outline:3px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:grid mi:place-items-center mi:w-12 mi:h-12 mi:p-0 mi:[border:0] mi:[background:var(--mi-card)] mi:text-label mi:shadow-1 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.94)] mi:[&.is-off]:[background:var(--mi-label)] mi:[&.is-off]:text-page mi:[&.is-on]:[background:var(--mi-p)] mi:[&.is-on]:text-p-on mi:w-16 mi:[background:var(--mi-red)] mi:text-p-on" :aria-label="left ? 'Rejoin call' : 'Leave call'" @click="left = !left">
            <MiIcon :svg="icons.leave" />
          </button>
        </div>
        <p v-if="left" class="vc__left mi:m-0 mi:text-center mi:text-[13px] mi:text-label2" role="status">You left the call. Select the red button to rejoin.</p>
      </div>

      <aside class="vc__panel mi:hidden mi:[.vc__shell.is-chat_&]:flex mi:@[1000px]:border-l mi:@[1000px]:border-l-sep mi:flex-col mi:min-h-0 mi:min-w-0 mi:[background:var(--mi-card)]" aria-labelledby="vc-chat-title">
        <header class="vc__panel-head mi:flex mi:items-center mi:gap-2.5 mi:min-h-14 mi:pt-0 mi:pr-3 mi:pb-0 mi:pl-4 mi:border-b mi:border-b-sep">
          <MiIconButton class="vc__back" label="Back to call" variant="gray" size="regular" @click="chat = false"><MiIcon name="chevron-left" /></MiIconButton>
          <MiText id="vc-chat-title" as="h3" variant="subheadline" weight="semibold">In-call chat</MiText>
          <MiIconButton class="vc__close" label="Close chat" variant="plain" size="small" @click="chat = false"><MiIcon name="close" :size="16" /></MiIconButton>
        </header>
        <MiMessageScroller class="vc__log" label="In-call chat">
          <MiMessageScrollerItem v-for="m in messages" :key="m.id" :message-id="'vc-' + m.id">
            <MiMessage :align="m.me ? 'end' : 'start'" :label="m.who" class="vc__row mi:[&.is-end]:ms-auto" :class="{ 'is-end': m.me }">
              <template v-if="!m.me" #header>{{ m.who }}</template>
              <MiBubble :align="m.me ? 'end' : 'start'" :variant="m.me ? 'default' : 'secondary'" class="vc__bub">{{ m.text }}</MiBubble>
            </MiMessage>
          </MiMessageScrollerItem>
        </MiMessageScroller>
        <form class="vc__composer mi:pt-2.5 mi:px-3 mi:pb-3 mi:border-t mi:border-t-sep" @submit.prevent="send">
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
.vc__close { display: none; }

@container (min-width: 1000px) {
  .vc__back { display: none; }
  .vc__close { display: inline-flex; }
}
.vc__tile.is-speaking .vc__face { animation: vc-talk 1.4s var(--mi-ease) infinite; }
@keyframes vc-talk { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
.vc__face.is-off { background: var(--mi-label); }
.vc__tag { left: 10px; bottom: 10px; padding: 4px 10px 4px 8px; font-size: 12.5px; }
.vc__tag--sm { left: 6px; bottom: 6px; padding: 2px 8px 2px 6px; font-size: 11px; }
.vc__share span { height: 12px; background: var(--mi-fill3); }
.vc__share span:first-child { height: 18px; background: var(--mi-p-tint2); }
.vc__mini .vc__face { height: 40px; }
.vc__ctl { border-radius: 50%; }
.vc__leave { border-radius: 24px; }
.vc__panel-head > :nth-child(2) { flex: 1; }
.vc__log { flex: 1; min-height: 0; }
.vc__row { max-width: 90%; }
.vc .vc__bub { max-width: 100%; }
@media (prefers-reduced-motion: reduce) { .vc__tile.is-speaking .vc__face { animation: none; } }
</style>

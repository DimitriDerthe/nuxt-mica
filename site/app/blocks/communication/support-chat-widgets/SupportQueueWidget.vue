<template>
  <section class="sq" aria-labelledby="sq-title">
    <!-- Faux storefront behind the widget, so the preview reads in context. -->
    <div class="sq__page" aria-hidden="true">
      <div class="sq__nav"><span class="sq__logo" /><span /><span /><span /></div>
      <div class="sq__hero"><span class="sq__line sq__line--l" /><span class="sq__line" /><span class="sq__line sq__line--s" /></div>
      <div class="sq__tiles"><span /><span /><span /></div>
    </div>

    <div class="sq__dock">
      <Transition name="sq-pop">
        <div v-if="open" id="sq-panel" class="sq__panel" role="dialog" aria-modal="false" aria-labelledby="sq-title">
          <header class="sq__head">
            <div class="sq__head-top">
              <MiAvatarGroup :items="team" :max="3" :size="30" label="Bramble support team" />
              <MiIconButton label="Minimise chat" variant="plain" size="small" class="sq__min" @click="open = false"><MiIcon name="chevron-down" :size="16" /></MiIconButton>
            </div>
            <MiText id="sq-title" as="h2" variant="title3" weight="bold">Bramble Support</MiText>
            <p class="sq__eta"><span class="sq__dot" aria-hidden="true" />Ama, Felix and Jun are online · replies in about {{ eta }} min</p>
          </header>

          <MiMessageScroller class="sq__log" label="Support conversation" :busy="typing">
            <MiMessageScrollerItem v-for="m in log" :key="m.id" :message-id="'sq-' + m.id">
              <MiMarker v-if="m.kind === 'status'" role="status" class="sq__status">
                <template #icon><MiIcon :svg="icons.queue" :size="14" /></template>{{ m.text }}
              </MiMarker>
              <MiMessage v-else :align="m.kind === 'me' ? 'end' : 'start'" :label="m.who" class="sq__row" :class="{ 'is-end': m.kind === 'me' }">
                <template v-if="m.kind !== 'me'" #avatar><MiAvatar :name="m.who" size="xs" :tone="m.kind === 'bot' ? 'secondary' : 'pink'" decorative /></template>
                <template v-if="m.kind === 'agent'" #header>{{ m.who }}</template>
                <MiBubble :align="m.kind === 'me' ? 'end' : 'start'" :variant="m.kind === 'me' ? 'default' : 'secondary'" class="sq__bub">{{ m.text }}</MiBubble>
              </MiMessage>
            </MiMessageScrollerItem>
            <MiMessageScrollerItem v-if="typing" message-id="sq-typing">
              <div class="sq__typing" role="status" aria-label="Ama is typing"><span /><span /><span /></div>
            </MiMessageScrollerItem>
          </MiMessageScroller>

          <div v-if="!asked" class="sq__topics" role="group" aria-label="Common topics">
            <button v-for="t in topics" :key="t" type="button" class="sq__topic" @click="send(t)">{{ t }}</button>
          </div>

          <form class="sq__composer" @submit.prevent="send(draft)">
            <MiInputGroup v-model="draft" size="sm" aria-label="Message Bramble Support" placeholder="Write a message…">
              <template #trailing>
                <MiIconButton type="submit" label="Send" size="small" :disabled="!draft.trim()"><MiIcon name="arrow-up" :size="15" /></MiIconButton>
              </template>
            </MiInputGroup>
          </form>
        </div>
      </Transition>

      <MiBadge :count="open ? 0 : unread" placement="top-left" class="sq__launch-wrap">
        <template #target>
          <button type="button" class="sq__launch" :aria-expanded="open" aria-controls="sq-panel" :aria-label="open ? 'Close support chat' : 'Open support chat'" @click="toggle">
            <MiIcon :svg="open ? icons.close : icons.bubble" :size="24" />
          </button>
        </template>
      </MiBadge>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

interface Line { id: number, kind: 'bot' | 'me' | 'agent' | 'status', who: string, text: string }

const icons = {
  bubble: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V17A2.5 2.5 0 0 1 4 14.5z"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  queue: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'
}
const team = [{ name: 'Ama Owusu', tone: 'pink' as const }, { name: 'Felix Brandt', tone: 'indigo' as const }, { name: 'Jun Park', tone: 'teal' as const }]
const topics = ['Change my delivery date', 'Where is my refund?', 'Talk to a person']

// Canned replies stand in for your agents; keyed by the first word that matches.
const replies: [RegExp, string][] = [
  [/deliver|date|ship/i, 'Hi Sam, Ama here. Order BR-20931 is still at the depot, so I can move it. Thursday or Saturday morning?'],
  [/refund|money|return/i, 'Hi Sam, Ama here. Your refund of €64.90 was issued on Monday; banks take 3 to 5 working days to show it.'],
  [/.*/, 'Hi Sam, Ama here. I have your order history open. What can I do for you?']
]

const open = ref(true)
const draft = ref('')
const asked = ref(false)
const typing = ref(false)
const unread = ref(0)
const eta = ref(4)
let seq = 0
let timer: ReturnType<typeof setTimeout> | undefined

const log = ref<Line[]>([
  { id: ++seq, kind: 'bot', who: 'Bramble', text: 'Hi Sam! Pick a topic below or just type. A person reads every message.' }
])

function toggle() {
  open.value = !open.value
  if (open.value) unread.value = 0
}

// One timer at a time walks the queue: position update, then typing, then the reply.
function send(text: string) {
  const body = text.trim()
  if (!body) return
  log.value.push({ id: ++seq, kind: 'me', who: 'You', text: body })
  draft.value = ''
  if (asked.value) return
  asked.value = true
  log.value.push({ id: ++seq, kind: 'status', who: '', text: 'You are 2nd in line · about 3 min' })
  eta.value = 3
  clearTimeout(timer)
  timer = setTimeout(() => {
    eta.value = 1
    log.value.push({ id: ++seq, kind: 'status', who: '', text: 'Ama joined the conversation' })
    typing.value = true
    timer = setTimeout(() => {
      typing.value = false
      log.value.push({ id: ++seq, kind: 'agent', who: 'Ama Owusu', text: replies.find(([re]) => re.test(body))?.[1] ?? '' })
      if (!open.value) unread.value += 1
    }, 1800)
  }, 1600)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.sq { container-type: inline-size; position: relative; height: 640px; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); overflow: hidden; }

.sq__page { display: grid; align-content: start; gap: 28px; padding: 20px; opacity: .7; }
.sq__nav { display: flex; gap: 16px; align-items: center; }
.sq__nav span { width: 56px; height: 10px; border-radius: 5px; background: var(--mi-fill3); }
.sq__nav .sq__logo { width: 28px; height: 28px; border-radius: 8px; background: var(--mi-p-tint2); margin-right: auto; }
.sq__hero { display: grid; gap: 12px; max-width: 520px; }
.sq__line { height: 14px; border-radius: 7px; background: var(--mi-fill3); }
.sq__line--l { height: 32px; width: 80%; background: var(--mi-fill2); }
.sq__line--s { width: 45%; }
.sq__tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.sq__tiles span { aspect-ratio: 4 / 5; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }

.sq__dock { position: absolute; inset: auto 12px 12px 12px; display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
@container (min-width: 560px) { .sq__dock { inset: auto 20px 20px auto; width: 372px; } }

.sq__panel { display: flex; flex-direction: column; width: 100%; height: 520px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh3); overflow: hidden; transform-origin: bottom right; }
.sq__head { display: grid; gap: 4px; padding: 14px 16px 16px; background: linear-gradient(150deg, var(--mi-p), color-mix(in srgb, var(--mi-p) 55%, var(--mi-s))); color: var(--mi-p-on); }
.sq__head-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.sq__min { color: var(--mi-p-on); }
.sq__eta { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 12.5px; opacity: .9; }
.sq__dot { flex: none; width: 7px; height: 7px; border-radius: 50%; background: var(--mi-green); box-shadow: 0 0 0 2px color-mix(in srgb, var(--mi-p-on) 60%, transparent); }

.sq__log { flex: 1; min-height: 0; background: var(--mi-page); }
.sq__row { max-width: 88%; }
.sq__row.is-end { margin-inline-start: auto; }
.sq .sq__bub { max-width: 100%; }
.sq__status { justify-content: center; color: var(--mi-label2); }

.sq__typing { display: inline-flex; gap: 4px; margin-left: 32px; padding: 12px 14px; border-radius: 18px 18px 18px 6px; background: var(--mi-fill2); }
.sq__typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--mi-label2); animation: sq-bounce 1.1s var(--mi-ease) infinite; }
.sq__typing span:nth-child(2) { animation-delay: .15s; }
.sq__typing span:nth-child(3) { animation-delay: .3s; }
@keyframes sq-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: .45; } 30% { transform: translateY(-4px); opacity: 1; } }

.sq__topics { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 14px 0; background: var(--mi-card); }
.sq__topic { padding: 7px 12px; border: 1px solid color-mix(in srgb, var(--mi-p) 35%, transparent); border-radius: 999px; background: transparent; color: var(--mi-p-text); font: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: transform var(--mi-dur-1) var(--mi-ease); }
.sq__topic:hover { background: var(--mi-p-tint); }
.sq__topic:active { transform: scale(.97); }
.sq__topic:focus-visible, .sq__launch:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.sq__composer { padding: 10px 14px 14px; background: var(--mi-card); }

.sq__launch { display: grid; place-items: center; width: 56px; height: 56px; padding: 0; border: 0; border-radius: 50%; background: var(--mi-p); color: var(--mi-p-on); box-shadow: var(--mi-sh2); cursor: pointer; transition: transform var(--mi-dur-2) var(--mi-spring); }
.sq__launch:hover { transform: scale(1.05); }
.sq__launch:active { transform: scale(.95); }

.sq-pop-enter-active, .sq-pop-leave-active { transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.sq-pop-enter-from, .sq-pop-leave-to { opacity: 0; transform: translateY(12px) scale(.96); }
@media (prefers-reduced-motion: reduce) { .sq__typing span { animation: none; } }
</style>

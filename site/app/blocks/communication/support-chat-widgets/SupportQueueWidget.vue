<template>
  <section class="sq mi:@container mi:relative mi:h-160 mi:font-mi mi:text-label mi:[background:var(--mi-page)] mi:overflow-hidden" aria-labelledby="sq-title">
    <!-- Faux storefront behind the widget, so the preview reads in context. -->
    <div class="sq__page mi:grid mi:content-start mi:gap-7 mi:p-5 mi:opacity-70" aria-hidden="true">
      <div class="sq__nav mi:flex mi:gap-4 mi:items-center"><span class="sq__logo mi:[.sq__nav_&]:w-14 mi:[.sq__nav_&]:h-2.5 mi:[.sq__nav_&]:rounded-[5px] mi:[.sq__nav_&]:mr-auto" /><span class="mi:[.sq__nav_&]:w-14 mi:[.sq__nav_&]:h-2.5 mi:[.sq__nav_&]:rounded-[5px]" /><span class="mi:[.sq__nav_&]:w-14 mi:[.sq__nav_&]:h-2.5 mi:[.sq__nav_&]:rounded-[5px]" /><span class="mi:[.sq__nav_&]:w-14 mi:[.sq__nav_&]:h-2.5 mi:[.sq__nav_&]:rounded-[5px]" /></div>
      <div class="sq__hero mi:grid mi:gap-3 mi:max-w-130"><span class="sq__line sq__line--l mi:h-3.5 mi:rounded-[7px] mi:h-8 mi:w-[80%]" /><span class="sq__line mi:h-3.5 mi:rounded-[7px]" /><span class="sq__line sq__line--s mi:h-3.5 mi:rounded-[7px] mi:w-[45%]" /></div>
      <div class="sq__tiles mi:grid mi:grid-cols-[repeat(3,_1fr)] mi:gap-3"><span class="mi:[.sq__tiles_&]:aspect-[4_/_5]" /><span class="mi:[.sq__tiles_&]:aspect-[4_/_5]" /><span class="mi:[.sq__tiles_&]:aspect-[4_/_5]" /></div>
    </div>

    <div class="sq__dock mi:absolute mi:top-auto mi:right-3 mi:bottom-3 mi:left-3 mi:flex mi:flex-col mi:[align-items:flex-end] mi:gap-3 mi:@[560px]:top-auto mi:@[560px]:right-5 mi:@[560px]:bottom-5 mi:@[560px]:left-auto mi:@[560px]:w-93">
      <Transition name="sq-pop">
        <div v-if="open" id="sq-panel" class="sq__panel mi:flex mi:flex-col mi:w-full mi:h-130 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-3 mi:overflow-hidden mi:origin-bottom-right" role="dialog" aria-modal="false" aria-labelledby="sq-title">
          <header class="sq__head mi:grid mi:gap-1 mi:pt-3.5 mi:px-4 mi:pb-4 mi:[background:linear-gradient(150deg,_var(--mi-p),_color-mix(in_srgb,_var(--mi-p)_55%,_var(--mi-s)))] mi:text-p-on">
            <div class="sq__head-top mi:flex mi:items-center mi:justify-between mi:mb-2">
              <MiAvatarGroup :items="team" :max="3" :size="30" label="Bramble support team" />
              <MiIconButton label="Minimise chat" variant="plain" size="small" class="sq__min" @click="open = false"><MiIcon name="chevron-down" :size="16" /></MiIconButton>
            </div>
            <MiText id="sq-title" as="h2" variant="title3" weight="bold">Bramble Support</MiText>
            <p class="sq__eta mi:flex mi:items-center mi:gap-1.5 mi:m-0 mi:text-[12.5px] mi:opacity-90"><span class="sq__dot mi:flex-[none] mi:w-[7px] mi:h-[7px] mi:rounded-[50%] mi:[background:var(--mi-green)] mi:shadow-[0_0_0_2px_color-mix(in_srgb,_var(--mi-p-on)_60%,_transparent)]" aria-hidden="true" />Ama, Felix and Jun are online · replies in about {{ eta }} min</p>
          </header>

          <MiMessageScroller class="sq__log" label="Support conversation" :busy="typing">
            <MiMessageScrollerItem v-for="m in log" :key="m.id" :message-id="'sq-' + m.id">
              <MiMarker v-if="m.kind === 'status'" role="status" class="sq__status">
                <template #icon><MiIcon :svg="icons.queue" :size="14" /></template>{{ m.text }}
              </MiMarker>
              <MiMessage v-else :align="m.kind === 'me' ? 'end' : 'start'" :label="m.who" class="sq__row mi:[&.is-end]:ms-auto" :class="{ 'is-end': m.kind === 'me' }">
                <template v-if="m.kind !== 'me'" #avatar><MiAvatar :name="m.who" size="xs" :tone="m.kind === 'bot' ? 'secondary' : 'pink'" decorative /></template>
                <template v-if="m.kind === 'agent'" #header>{{ m.who }}</template>
                <MiBubble :align="m.kind === 'me' ? 'end' : 'start'" :variant="m.kind === 'me' ? 'default' : 'secondary'" class="sq__bub">{{ m.text }}</MiBubble>
              </MiMessage>
            </MiMessageScrollerItem>
            <MiMessageScrollerItem v-if="typing" message-id="sq-typing">
              <div class="sq__typing mi:inline-flex mi:gap-1 mi:ml-8 mi:py-3 mi:px-3.5 mi:rounded-[18px_18px_18px_6px] mi:[background:var(--mi-fill2)]" role="status" aria-label="Ama is typing"><span class="mi:[.sq__typing_&:nth-child(2)]:[animation-delay:.15s] mi:[.sq__typing_&:nth-child(3)]:[animation-delay:.3s]" /><span class="mi:[.sq__typing_&:nth-child(2)]:[animation-delay:.15s] mi:[.sq__typing_&:nth-child(3)]:[animation-delay:.3s]" /><span class="mi:[.sq__typing_&:nth-child(2)]:[animation-delay:.15s] mi:[.sq__typing_&:nth-child(3)]:[animation-delay:.3s]" /></div>
            </MiMessageScrollerItem>
          </MiMessageScroller>

          <div v-if="!asked" class="sq__topics mi:flex mi:flex-wrap mi:gap-1.5 mi:pt-2.5 mi:px-3.5 mi:pb-0 mi:[background:var(--mi-card)]" role="group" aria-label="Common topics">
            <button v-for="t in topics" :key="t" type="button" class="sq__topic mi:py-[7px] mi:px-3 mi:border mi:border-p/35 mi:rounded-[999px] mi:[background:transparent] mi:text-p-text mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:hover:[background:var(--mi-p-tint)] mi:active:transform-[scale(.97)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="send(t)">{{ t }}</button>
          </div>

          <form class="sq__composer mi:pt-2.5 mi:px-3.5 mi:pb-3.5 mi:[background:var(--mi-card)]" @submit.prevent="send(draft)">
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
          <button type="button" class="sq__launch mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:grid mi:place-items-center mi:w-14 mi:h-14 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:[background:var(--mi-p)] mi:text-p-on mi:shadow-2 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:hover:transform-[scale(1.05)] mi:active:transform-[scale(.95)]" :aria-expanded="open" aria-controls="sq-panel" :aria-label="open ? 'Close support chat' : 'Open support chat'" @click="toggle">
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
.sq__nav span { background: var(--mi-fill3); }
.sq__nav .sq__logo { width: 28px; height: 28px; border-radius: 8px; background: var(--mi-p-tint2); }
.sq__line { background: var(--mi-fill3); }
.sq__line--l { background: var(--mi-fill2); }
.sq__tiles span { border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.sq__min { color: var(--mi-p-on); }

.sq__log { flex: 1; min-height: 0; background: var(--mi-page); }
.sq__row { max-width: 88%; }
.sq .sq__bub { max-width: 100%; }
.sq__status { justify-content: center; color: var(--mi-label2); }
.sq__typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--mi-label2); animation: sq-bounce 1.1s var(--mi-ease) infinite; }
@keyframes sq-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: .45; } 30% { transform: translateY(-4px); opacity: 1; } }
.sq__topic { font: inherit; font-size: 13px; font-weight: 500; }

.sq-pop-enter-active, .sq-pop-leave-active { transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.sq-pop-enter-from, .sq-pop-leave-to { opacity: 0; transform: translateY(12px) scale(.96); }
@media (prefers-reduced-motion: reduce) { .sq__typing span { animation: none; } }
</style>

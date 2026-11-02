<template>
  <section class="qr" aria-labelledby="qr-title">
    <div class="qr__card">
      <header class="qr__head">
        <MiBadge dot-only tone="success" placement="bottom-right" :dot-size="10">
          <template #target><MiAvatar name="Noor Haddad" size="sm" tone="orange" decorative /></template>
        </MiBadge>
        <div class="qr__head-text">
          <MiText id="qr-title" as="h2" variant="headline" weight="semibold">Noor Haddad</MiText>
          <MiText variant="caption" tone="label2">Porto weekend · active now</MiText>
        </div>
      </header>

      <MiMessageScroller ref="scroller" class="qr__log" label="Conversation with Noor Haddad">
        <MiMarker variant="separator">Friday</MiMarker>
        <template v-for="g in groups" :key="g.id">
          <MiMarker v-if="g.unreadBefore" variant="separator" class="qr__unread">2 new messages</MiMarker>
          <MiMessageScrollerItem :message-id="'qr-' + g.id">
            <MiMessage :align="g.me ? 'end' : 'start'" :label="g.me ? 'You' : 'Noor Haddad'" class="qr__msg" :class="{ 'is-end': g.me }">
              <template #avatar><MiAvatar v-if="!g.me" name="Noor Haddad" size="xs" tone="orange" decorative /></template>
              <MiBubbleGroup>
                <div v-for="m in g.items" :key="m.id" class="qr__line" :class="{ 'is-end': g.me }">
                  <span v-if="m.emoji" class="qr__emoji" :class="{ 'is-flash': flash === m.id }" role="img" :aria-label="m.alt">{{ m.text }}</span>
                  <MiBubble
                    v-else :align="g.me ? 'end' : 'start'" :variant="g.me ? 'default' : 'secondary'"
                    class="qr__bub" :class="{ 'is-flash': flash === m.id }"
                  >
                    <button v-if="m.quote && byId[m.quote]" type="button" class="qr__quote" @click="goTo(m.quote)">
                      <span class="qr__quote-who">{{ byId[m.quote]?.me ? 'You' : 'Noor' }}</span>
                      <span class="qr__quote-text">{{ byId[m.quote]?.text }}</span>
                    </button>
                    <span class="qr__text">{{ m.text }}</span>
                    <template v-if="m.reactions?.length" #reactions>
                      <button
                        v-for="r in m.reactions" :key="r.e" type="button" class="qr__rx" :class="{ 'is-mine': r.mine }"
                        :aria-pressed="r.mine" :aria-label="r.e + ' ' + r.n" @click="toggle(m, r.e)"
                      >{{ r.e }}<span v-if="r.n > 1">{{ r.n }}</span></button>
                    </template>
                  </MiBubble>
                  <span class="qr__acts">
                    <button type="button" class="qr__act" :aria-label="'Reply to: ' + m.text" @click="replyTo = m.id"><MiIcon :svg="icons.reply" :size="15" /></button>
                    <button type="button" class="qr__act" aria-label="React with thumbs up" @click="toggle(m, '👍')">👍</button>
                  </span>
                </div>
              </MiBubbleGroup>
              <template #footer>
                <span>{{ g.time }}<template v-if="g.edited"> · edited</template></span>
                <span v-if="g.me && g.id === lastMine" class="qr__read"><MiIcon :svg="icons.ticks" :size="14" />{{ g.status }}</span>
              </template>
            </MiMessage>
          </MiMessageScrollerItem>
        </template>
      </MiMessageScroller>

      <form class="qr__composer" @submit.prevent="send">
        <div v-if="replyTo && byId[replyTo]" class="qr__ctx">
          <MiIcon :svg="icons.reply" :size="15" />
          <span class="qr__ctx-text"><strong>Replying to {{ byId[replyTo]?.me ? 'yourself' : 'Noor' }}</strong> {{ byId[replyTo]?.text }}</span>
          <MiIconButton label="Cancel reply" variant="plain" size="small" @click="replyTo = null"><MiIcon name="close" :size="14" /></MiIconButton>
        </div>
        <MiInputGroup v-model="draft" aria-label="Message Noor" placeholder="Message Noor">
          <template #trailing>
            <MiIconButton type="submit" label="Send" size="small" :disabled="!draft.trim()"><MiIcon name="arrow-up" :size="16" /></MiIconButton>
          </template>
        </MiInputGroup>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

interface Reaction { e: string, n: number, mine: boolean }
interface Msg { id: string, me: boolean, text: string, time: string, quote?: string, reactions?: Reaction[], edited?: boolean, emoji?: boolean, alt?: string, unread?: boolean }

const icons = {
  reply: '<path d="M9 7 4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 6 6"/>',
  ticks: '<path d="m2.5 12.5 4 4 8-9M10.5 15.5l1 1 8-9"/>'
}

// Sample conversation; swap for your messages API.
const msgs = ref<Msg[]>([
  { id: 'a', me: false, time: '18:02', text: 'Train or car to Porto? The train is 2h50 from Lisbon and drops us at São Bento.' },
  { id: 'b', me: false, time: '18:02', text: 'Car means we could stop in Aveiro on the way.' },
  { id: 'c', me: true, time: '18:10', text: 'Train. Parking in Ribeira is a nightmare and I want to sleep on the way.', reactions: [{ e: '💯', n: 1, mine: false }] },
  { id: 'd', me: true, time: '18:11', quote: 'b', text: 'We can do Aveiro as a day trip on Sunday instead.' },
  { id: 'e', me: false, time: '18:24', text: 'Deal. Booked the 8:39 Alfa Pendular, seats 41 and 42, coach 4.', unread: true, reactions: [{ e: '🎉', n: 1, mine: true }] },
  { id: 'f', me: false, time: '18:25', text: '🚆', emoji: true, alt: 'train' }
])

const byId = computed(() => Object.fromEntries(msgs.value.map(m => [m.id, m])) as Record<string, Msg | undefined>)

// Consecutive messages from one sender share a group, a timestamp and one avatar.
const groups = computed(() => {
  const out: { id: string, me: boolean, time: string, edited: boolean, unreadBefore: boolean, status: string, items: Msg[] }[] = []
  for (const m of msgs.value) {
    const last = out[out.length - 1]
    if (last && last.me === m.me && !m.unread) {
      last.items.push(m)
      last.time = m.time
      last.edited ||= !!m.edited
    }
    else {
      out.push({ id: m.id, me: m.me, time: m.time, edited: !!m.edited, unreadBefore: !!m.unread, status: m.time === 'Now' ? 'Delivered' : 'Read 18:20', items: [m] })
    }
  }
  return out
})
const lastMine = computed(() => [...groups.value].reverse().find(g => g.me)?.id)

const scroller = ref<{ scrollToMessage: (id: string, o?: { behavior?: ScrollBehavior }) => boolean } | null>(null)
const flash = ref<string | null>(null)
const replyTo = ref<string | null>('e')
const draft = ref('')
let flashTimer: ReturnType<typeof setTimeout> | undefined

function goTo(id: string) {
  const g = groups.value.find(x => x.items.some(m => m.id === id))
  if (g) scroller.value?.scrollToMessage('qr-' + g.id, { behavior: 'smooth' })
  flash.value = id
  clearTimeout(flashTimer)
  flashTimer = setTimeout(() => { flash.value = null }, 1200)
}

function toggle(m: Msg, e: string) {
  const list = (m.reactions ??= [])
  const r = list.find(x => x.e === e)
  if (!r) list.push({ e, n: 1, mine: true })
  else if (r.mine) { r.n -= 1; r.mine = false; if (!r.n) list.splice(list.indexOf(r), 1) }
  else { r.n += 1; r.mine = true }
}

let seq = 0
function send() {
  const text = draft.value.trim()
  if (!text) return
  msgs.value.push({ id: 'n' + ++seq, me: true, time: 'Now', text, quote: replyTo.value ?? undefined })
  draft.value = ''
  replyTo.value = null
}

onBeforeUnmount(() => clearTimeout(flashTimer))
</script>

<style scoped>
.qr { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.qr__card { display: flex; flex-direction: column; height: 540px; max-width: 640px; margin-inline: auto; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2); overflow: hidden; }
.qr__head { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--mi-sep); }
.qr__head-text { min-width: 0; }
.qr__log { flex: 1; min-height: 0; background: var(--mi-page); }
.qr__unread { color: var(--mi-p-text); }

.qr__msg { max-width: min(88%, 30rem); }
.qr__msg.is-end { margin-inline-start: auto; }
.qr__line { display: flex; align-items: center; gap: 6px; min-width: 0; }
.qr__line.is-end { flex-direction: row-reverse; }
.qr .qr__bub { max-width: 100%; min-width: 0; }
.qr__text { display: block; }

/* Quoted reply: a compact card inside the bubble that jumps to the original. */
.qr__quote { display: grid; gap: 1px; width: 100%; margin: 2px 0 6px; padding: 6px 10px; border: 0; border-left: 3px solid currentColor; border-radius: 8px; background: color-mix(in srgb, currentColor 12%, transparent); color: inherit; font: inherit; text-align: start; white-space: normal; cursor: pointer; }
.qr__quote:focus-visible, .qr__rx:focus-visible, .qr__act:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.qr__quote-who { font-size: 12px; font-weight: 700; }
.qr__quote-text { font-size: 13px; opacity: .8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.qr__rx { display: inline-flex; align-items: center; gap: 3px; padding: 0 4px; border: 0; border-radius: 999px; background: transparent; color: var(--mi-label2); font: inherit; font-size: 13px; cursor: pointer; }
.qr__rx.is-mine { background: var(--mi-p-tint); color: var(--mi-p-text); }
.qr__rx span { font-size: 11px; font-weight: 600; }

.qr__emoji { font-size: 44px; line-height: 1.1; padding: 2px 4px; }
.qr__acts { display: flex; gap: 2px; flex: none; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.qr__act { display: grid; place-items: center; width: 28px; height: 28px; padding: 0; border: 0; border-radius: 50%; background: var(--mi-fill4); color: var(--mi-label2); font-size: 13px; cursor: pointer; }
.qr__act:hover { background: var(--mi-fill3); }
@media (hover: hover) {
  .qr__acts { opacity: 0; }
  .qr__line:hover .qr__acts, .qr__acts:focus-within { opacity: 1; }
}
.qr__read { display: inline-flex; align-items: center; gap: 3px; color: var(--mi-p-text); }

.is-flash { animation: qr-flash 1.1s var(--mi-ease); }
@keyframes qr-flash { 0%, 100% { transform: scale(1); opacity: 1; } 20% { transform: scale(1.04); opacity: .55; } 45% { opacity: 1; } }

.qr__composer { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; padding: 12px 14px 14px; border-top: 1px solid var(--mi-sep); }
.qr__ctx { display: flex; align-items: center; gap: 8px; padding: 6px 6px 6px 12px; border-radius: var(--mi-radius-m); background: var(--mi-p-tint); color: var(--mi-p-text); }
.qr__ctx-text { flex: 1; min-width: 0; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qr__ctx-text strong { margin-right: 4px; }
@media (prefers-reduced-motion: reduce) { .is-flash { animation: none; } }
</style>

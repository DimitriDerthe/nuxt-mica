<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="qr-title">
    <div class="mi:flex mi:flex-col mi:h-135 mi:max-w-160 mi:mx-auto mi:rounded-xl mi:bg-card mi:shadow-2 mi:overflow-hidden">
      <header class="mi:flex mi:items-center mi:gap-3 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep">
        <MiBadge dot-only tone="success" placement="bottom-right" :dot-size="10">
          <template #target><MiAvatar name="Noor Haddad" size="sm" tone="orange" decorative /></template>
        </MiBadge>
        <div class="mi:min-w-0">
          <MiText id="qr-title" as="h2" variant="headline" weight="semibold">Noor Haddad</MiText>
          <MiText variant="caption" tone="label2">Porto weekend · active now</MiText>
        </div>
      </header>

      <MiMessageScroller ref="scroller" class="mi:flex-1! mi:min-h-0! mi:bg-page!" label="Conversation with Noor Haddad">
        <MiMarker variant="separator">Friday</MiMarker>
        <template v-for="g in groups" :key="g.id">
          <MiMarker v-if="g.unreadBefore" variant="separator" class="mi:text-p-text!">2 new messages</MiMarker>
          <MiMessageScrollerItem :message-id="'qr-' + g.id">
            <MiMessage :align="g.me ? 'end' : 'start'" :label="g.me ? 'You' : 'Noor Haddad'" class="mi:max-w-[min(88%,_30rem)]! " :class="g.me ? 'mi:ms-auto' : ''">
              <template #avatar><MiAvatar v-if="!g.me" name="Noor Haddad" size="xs" tone="orange" decorative /></template>
              <MiBubbleGroup>
                <div v-for="m in g.items" :key="m.id" class="mi:group mi:flex mi:items-center mi:gap-1.5 mi:min-w-0" :class="g.me ? 'mi:flex-row-reverse' : ''">
                  <span v-if="m.emoji" class="mi:text-[44px] mi:leading-[1.1] mi:py-0.5 mi:px-1" :class="{ 'mi:[--mi-beat:1.04] mi:[--mi-beat-o:.55] mi:animate-[beat_1.1s_var(--mi-ease)] mi:motion-reduce:animate-none': flash === m.id }" role="img" :aria-label="m.alt">{{ m.text }}</span>
                  <MiBubble
                    v-else :align="g.me ? 'end' : 'start'" :variant="g.me ? 'default' : 'secondary'"
                    class="mi:max-w-full! mi:min-w-0!" :class="{ 'mi:[--mi-beat:1.04] mi:[--mi-beat-o:.55] mi:animate-[beat_1.1s_var(--mi-ease)] mi:motion-reduce:animate-none': flash === m.id }"
                  >
                    <button v-if="m.quote && byId[m.quote]" type="button" class="mi:[border:0] mi:[border-left:3px_solid_currentColor] mi:grid mi:gap-px mi:w-full mi:mt-0.5 mi:mx-0 mi:mb-1.5 mi:py-1.5 mi:px-2.5 mi:rounded-[8px] mi:[background:color-mix(in_srgb,_currentColor_12%,_transparent)] mi:text-inherit mi:[font:inherit] mi:text-start mi:whitespace-normal mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="goTo(m.quote)">
                      <span class="mi:text-[12px] mi:font-bold">{{ byId[m.quote]?.me ? 'You' : 'Noor' }}</span>
                      <span class="mi:text-[13px] mi:opacity-80 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ byId[m.quote]?.text }}</span>
                    </button>
                    <span class="mi:block">{{ m.text }}</span>
                    <template v-if="m.reactions?.length" #reactions>
                      <button
                        v-for="r in m.reactions" :key="r.e" type="button" class="mi:[font:inherit] mi:text-[13px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:inline-flex mi:items-center mi:gap-[3px] mi:py-0 mi:px-1 mi:[border:0] mi:rounded-[999px] mi:cursor-pointer" :class="r.mine ? 'mi:bg-p-tint mi:text-p-text' : 'mi:bg-transparent mi:text-label2'"
                        :aria-pressed="r.mine" :aria-label="r.e + ' ' + r.n" @click="toggle(m, r.e)"
                      >{{ r.e }}<span class="mi:text-[11px] mi:font-semibold" v-if="r.n > 1">{{ r.n }}</span></button>
                    </template>
                  </MiBubble>
                  <span class="mi:flex mi:gap-0.5 mi:flex-[none] mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:can-hover:opacity-0 mi:can-hover:group-hover:opacity-100 mi:can-hover:focus-within:opacity-100">
                    <button type="button" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:grid mi:place-items-center mi:w-7 mi:h-7 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:bg-fill4 mi:text-label2 mi:text-[13px] mi:cursor-pointer mi:hover:bg-fill3" :aria-label="'Reply to: ' + m.text" @click="replyTo = m.id"><MiIcon :svg="icons.reply" :size="15" /></button>
                    <button type="button" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:grid mi:place-items-center mi:w-7 mi:h-7 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:bg-fill4 mi:text-label2 mi:text-[13px] mi:cursor-pointer mi:hover:bg-fill3" aria-label="React with thumbs up" @click="toggle(m, '👍')">👍</button>
                  </span>
                </div>
              </MiBubbleGroup>
              <template #footer>
                <span>{{ g.time }}<template v-if="g.edited"> · edited</template></span>
                <span v-if="g.me && g.id === lastMine" class="mi:inline-flex mi:items-center mi:gap-[3px] mi:text-p-text"><MiIcon :svg="icons.ticks" :size="14" />{{ g.status }}</span>
              </template>
            </MiMessage>
          </MiMessageScrollerItem>
        </template>
      </MiMessageScroller>

      <form class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-2 mi:pt-3 mi:px-3.5 mi:pb-3.5 mi:border-t mi:border-t-sep" @submit.prevent="send">
        <div v-if="replyTo && byId[replyTo]" class="mi:flex mi:items-center mi:gap-2 mi:pt-1.5 mi:pr-1.5 mi:pb-1.5 mi:pl-3 mi:rounded-md mi:bg-p-tint mi:text-p-text">
          <MiIcon :svg="icons.reply" :size="15" />
          <span class="mi:flex-1 mi:min-w-0 mi:text-[13px] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap"><strong class="mi:mr-1">Replying to {{ byId[replyTo]?.me ? 'yourself' : 'Noor' }}</strong> {{ byId[replyTo]?.text }}</span>
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


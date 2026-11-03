<template>
  <section class="ds" aria-labelledby="ds-title">
    <div class="ds__card">
      <header class="ds__head">
        <MiAvatar name="Marta Silva" size="sm" tone="green" decorative />
        <div class="ds__head-text">
          <MiText id="ds-title" as="h2" variant="headline" weight="semibold">Marta Silva</MiText>
          <MiText variant="caption" tone="label2">Moving day · Saturday</MiText>
        </div>
        <div class="ds__net">
          <MiSwitch v-model="online" size="compact" tone="success" aria-labelledby="ds-net-label" />
          <span id="ds-net-label">{{ online ? 'Online' : 'Offline' }}</span>
        </div>
      </header>

      <div class="ds__log" role="log" aria-label="Conversation with Marta Silva">
        <template v-for="m in msgs" :key="m.id">
          <MiMarker v-if="m.unsent" class="ds__unsent">You unsent a message</MiMarker>
          <MiMessage v-else :align="m.me ? 'end' : 'start'" :label="m.me ? 'You' : 'Marta Silva'" class="ds__row" :class="{ 'is-end': m.me }">
            <form v-if="editing === m.id" class="ds__edit" @submit.prevent="saveEdit(m)">
              <MiInput v-model="editDraft" size="sm" aria-label="Edit message" />
              <MiButton type="submit" size="small" :disabled="!editDraft.trim()">Save</MiButton>
              <MiButton variant="plain" size="small" @click="editing = null">Cancel</MiButton>
            </form>
            <MiBubble v-else :align="m.me ? 'end' : 'start'" :variant="m.status === 'failed' ? 'outline' : m.me ? 'default' : 'secondary'" :class="{ 'is-failed': m.status === 'failed', 'is-sending': m.status === 'sending' }">
              {{ m.text }}
            </MiBubble>
            <template #footer>
              <span>{{ m.time }}<template v-if="m.edited"> · edited</template></span>
              <template v-if="m.me">
                <span v-if="m.status === 'sending'" class="ds__state"><MiSpinner size="sm" label="" />Sending</span>
                <span v-else-if="m.status === 'failed'" class="ds__state is-failed">
                  <MiIcon name="exclamation-circle" :size="14" />Not delivered
                  <button type="button" class="ds__link" @click="deliver(m)">Retry</button>
                </span>
                <span v-else class="ds__state" :class="{ 'is-read': m.status === 'read' }">
                  <MiIcon name="check" :size="14" />{{ labels[m.status] }}
                </span>
                <span v-if="m.id === lastMine?.id && m.status !== 'sending' && editing !== m.id" class="ds__tools">
                  <button type="button" class="ds__link" @click="startEdit(m)">Edit</button>
                  <button type="button" class="ds__link" @click="m.unsent = true">Unsend</button>
                </span>
              </template>
            </template>
          </MiMessage>
        </template>
      </div>
      <p class="ds__sr" role="status">{{ announce }}</p>

      <form class="ds__composer" @submit.prevent="send">
        <MiInputGroup v-model="draft" aria-label="Message Marta" :placeholder="online ? 'Message Marta' : 'Offline: messages will fail until you reconnect'">
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

type Status = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
interface Msg { id: string, me: boolean, text: string, time: string, status: Status, edited?: boolean, unsent?: boolean }

const labels: Record<Status, string> = { sending: 'Sending', sent: 'Sent', delivered: 'Delivered', read: 'Read', failed: 'Not delivered' }

// Sample conversation; swap for your messaging API and its delivery receipts.
const msgs = ref<Msg[]>([
  { id: 'a', me: false, text: 'Van is booked for 8:00. Can you grab the keys from the agency on Friday?', time: '19:02', status: 'read' },
  { id: 'b', me: true, text: 'Yes, they close at 18:00 so I will go at lunch.', time: '19:05', status: 'read' },
  { id: 'c', me: true, text: 'Also bought 20 boxes and two rolls of tape.', time: '19:06', status: 'delivered' },
  { id: 'd', me: true, text: 'Do we still need the dolly from Rui?', time: '19:30', status: 'failed' }
])

const online = ref(true)
const draft = ref('')
const editing = ref<string | null>(null)
const editDraft = ref('')
const announce = ref('')
const lastMine = computed(() => [...msgs.value].reverse().find(m => m.me && !m.unsent))

// Simulated network: each step of the receipt chain lands after a short delay.
const timers = new Set<ReturnType<typeof setTimeout>>()
function later(ms: number, fn: () => void) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}

function deliver(m: Msg) {
  m.status = 'sending'
  later(900, () => {
    if (!online.value) { m.status = 'failed'; announce.value = 'Message not delivered.'; return }
    m.status = 'sent'
    later(700, () => { m.status = 'delivered'; announce.value = 'Message delivered.' })
  })
}

let seq = 0
function send() {
  const text = draft.value.trim()
  if (!text) return
  const m: Msg = { id: 'n' + ++seq, me: true, text, time: 'Now', status: 'sending' }
  msgs.value.push(m)
  draft.value = ''
  deliver(msgs.value[msgs.value.length - 1] ?? m)
}

function startEdit(m: Msg) {
  editing.value = m.id
  editDraft.value = m.text
}

function saveEdit(m: Msg) {
  const text = editDraft.value.trim()
  if (text && text !== m.text) { m.text = text; m.edited = true }
  editing.value = null
}

onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })
</script>

<style scoped>
.ds { container-type: inline-size; position: relative; font-family: var(--mi-font); color: var(--mi-label); }
.ds__card { display: flex; flex-direction: column; max-width: 620px; margin-inline: auto; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2); overflow: hidden; }
.ds__head { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--mi-sep); }
.ds__head-text { flex: 1; min-width: 0; }
.ds__net { display: inline-flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--mi-label2); }

.ds__log { display: grid; gap: 10px; min-height: 320px; align-content: end; padding: 16px 14px; background: var(--mi-page); }
.ds__row { max-width: min(88%, 28rem); }
.ds__row.is-end { margin-inline-start: auto; }
.is-sending { opacity: .6; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.ds .is-failed { color: var(--mi-red-t); }
.ds__unsent { justify-self: end; font-style: italic; }

.ds__state { display: inline-flex; align-items: center; gap: 4px; }
.ds__state.is-read { color: var(--mi-p-text); }
.ds__tools { display: inline-flex; gap: 2px; }
.ds__link { padding: 0 4px; border: 0; border-radius: 4px; background: transparent; color: var(--mi-p-text); font: inherit; font-weight: 600; cursor: pointer; }
.ds__link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.ds__edit { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 6px; }
.ds__edit > :first-child { flex: 1 1 200px; }

.ds__composer { padding: 12px 14px 14px; border-top: 1px solid var(--mi-sep); }
.ds__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>

<template>
  <section class="mi:@container mi:relative mi:font-mi mi:text-label" aria-labelledby="ds-title">
    <div class="mi:flex mi:flex-col mi:max-w-155 mi:mx-auto mi:rounded-xl mi:bg-card mi:shadow-2 mi:overflow-hidden">
      <header class="mi:flex mi:items-center mi:gap-3 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep">
        <MiAvatar name="Marta Silva" size="sm" tone="green" decorative />
        <div class="mi:flex-1 mi:min-w-0">
          <MiText id="ds-title" as="h2" variant="headline" weight="semibold">Marta Silva</MiText>
          <MiText variant="caption" tone="label2">Moving day · Saturday</MiText>
        </div>
        <div class="mi:inline-flex mi:items-center mi:gap-2 mi:text-[12.5px] mi:text-label2">
          <MiSwitch v-model="online" size="compact" tone="success" aria-labelledby="ds-net-label" />
          <span id="ds-net-label">{{ online ? 'Online' : 'Offline' }}</span>
        </div>
      </header>

      <div class="mi:grid mi:gap-2.5 mi:min-h-80 mi:content-end mi:py-4 mi:px-3.5 mi:bg-page" role="log" aria-label="Conversation with Marta Silva">
        <template v-for="m in msgs" :key="m.id">
          <MiMarker v-if="m.unsent" class="mi:italic! mi:justify-self-end">You unsent a message</MiMarker>
          <MiMessage v-else :align="m.me ? 'end' : 'start'" :label="m.me ? 'You' : 'Marta Silva'" class="mi:max-w-[min(88%,_28rem)]! " :class="m.me ? 'mi:ms-auto' : ''">
            <form v-if="editing === m.id" class="mi:flex mi:flex-wrap mi:items-center mi:[justify-content:flex-end] mi:gap-1.5" @submit.prevent="saveEdit(m)">
              <MiInput v-model="editDraft" size="sm" class="mi:flex-[1_1_200px]" aria-label="Edit message" />
              <MiButton type="submit" size="small" :disabled="!editDraft.trim()">Save</MiButton>
              <MiButton variant="plain" size="small" @click="editing = null">Cancel</MiButton>
            </form>
            <MiBubble v-else :align="m.me ? 'end' : 'start'" :variant="m.status === 'failed' ? 'outline' : m.me ? 'default' : 'secondary'" :class="{ 'mi:text-red-t!': m.status === 'failed', 'mi:opacity-60! mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]!': m.status === 'sending' }">
              {{ m.text }}
            </MiBubble>
            <template #footer>
              <span>{{ m.time }}<template v-if="m.edited"> · edited</template></span>
              <template v-if="m.me">
                <span v-if="m.status === 'sending'" class="mi:inline-flex mi:items-center mi:gap-1"><MiSpinner size="sm" label="" />Sending</span>
                <span v-else-if="m.status === 'failed'" class="mi:text-red-t! mi:inline-flex mi:items-center mi:gap-1">
                  <MiIcon name="exclamation-circle" :size="14" />Not delivered
                  <button type="button" class="mi:[font:inherit] mi:font-semibold mi:py-0 mi:px-1 mi:[border:0] mi:rounded-[4px] mi:bg-transparent mi:text-p-text mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" @click="deliver(m)">Retry</button>
                </span>
                <span v-else class="mi:inline-flex mi:items-center mi:gap-1" :class="m.status === 'read' ? 'mi:text-p-text' : ''">
                  <MiIcon name="check" :size="14" />{{ labels[m.status] }}
                </span>
                <span v-if="m.id === lastMine?.id && m.status !== 'sending' && editing !== m.id" class="mi:inline-flex mi:gap-0.5">
                  <button type="button" class="mi:[font:inherit] mi:font-semibold mi:py-0 mi:px-1 mi:[border:0] mi:rounded-[4px] mi:bg-transparent mi:text-p-text mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" @click="startEdit(m)">Edit</button>
                  <button type="button" class="mi:[font:inherit] mi:font-semibold mi:py-0 mi:px-1 mi:[border:0] mi:rounded-[4px] mi:bg-transparent mi:text-p-text mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" @click="m.unsent = true">Unsend</button>
                </span>
              </template>
            </template>
          </MiMessage>
        </template>
      </div>
      <p class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" role="status">{{ announce }}</p>

      <form class="mi:pt-3 mi:px-3.5 mi:pb-3.5 mi:border-t mi:border-t-sep" @submit.prevent="send">
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


<template>
  <section class="acs" aria-labelledby="acs-title">
    <header class="acs__top">
      <MiText id="acs-title" as="h2" variant="headline" weight="semibold" :lines="1">Writing assistant</MiText>
      <MiSegmented v-model="pane" label="Show pane" :options="panes" class="acs__switch" />
    </header>

    <div class="acs__shell" :class="'show-' + pane">
      <!-- Chat pane: requests on the left, the document they change on the right. -->
      <div class="acs__chat">
        <MiMessageScroller class="acs__log" label="Conversation about the draft">
          <MiMessageScrollerItem v-for="m in messages" :key="m.id" :message-id="'acs-' + m.id" :scroll-anchor="m.role === 'user'">
            <MiMessage :align="m.role === 'user' ? 'end' : 'start'" :label="m.role === 'user' ? 'You' : 'Assistant'">
              <MiBubble :align="m.role === 'user' ? 'end' : 'start'" :variant="m.role === 'user' ? 'secondary' : 'muted'">{{ m.text }}</MiBubble>
              <template v-if="m.para !== undefined" #footer>
                <button type="button" class="acs__jump" @click="jumpTo(m.para)">Edited paragraph {{ m.para + 1 }}</button>
              </template>
            </MiMessage>
          </MiMessageScrollerItem>
        </MiMessageScroller>

        <form class="acs__composer" @submit.prevent="send(draft)">
          <div class="acs__quick" role="group" aria-label="Quick edits">
            <MiButton v-for="q in quick" :key="q" variant="gray" size="mini" :disabled="!next" @click="send(q)">{{ q }}</MiButton>
          </div>
          <MiInputGroup v-model="draft" aria-label="Ask for an edit" placeholder="Ask for an edit…">
            <template #inline-end>
              <MiIconButton type="submit" label="Send" size="small" :disabled="!draft.trim() || !next">
                <MiIcon name="arrow-up" :size="16" />
              </MiIconButton>
            </template>
          </MiInputGroup>
        </form>
      </div>

      <article class="acs__canvas" aria-labelledby="acs-doc">
        <header class="acs__doc-head">
          <MiText variant="caption" tone="label2" weight="medium">Draft · version {{ history.length }}</MiText>
          <MiButton variant="plain" size="small" :disabled="history.length === 1" @click="undo">
            <template #leading><MiIcon name="arrow-left" :size="14" /></template>Undo
          </MiButton>
        </header>
        <div class="acs__page">
          <MiText id="acs-doc" as="h3" variant="title2" weight="bold">Ledgerline now closes your books in a day</MiText>
          <p
            v-for="(p, i) in current.paras" :id="'acs-p' + i" :key="i" class="acs__para" :class="{ 'is-fresh': i === current.changed, 'is-focus': i === focus }"
          >
            {{ p }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

interface Msg { id: number, role: 'user' | 'assistant', text: string, para?: number }
interface Version { paras: string[], changed: number }
interface Edit { para: number, text: string, reply: string }

const panes = [{ value: 'chat', label: 'Chat' }, { value: 'canvas', label: 'Draft' }]
const quick = ['Make the intro punchier', 'Add a customer quote', 'End with a clear next step']

// Scripted edits stand in for model output; each request applies the next one.
const edits: Edit[] = [
  { para: 0, reply: 'Tightened the intro to lead with the outcome.', text: 'Month-end close used to take finance teams a week. With automatic bank matching and live accruals, Ledgerline now gets it done in a single working day.' },
  { para: 2, reply: 'Added a quote from the pilot customer.', text: '“We closed October on the 1st, before lunch,” says Hana Petrov, CFO at Brightwater Logistics, one of 40 teams in the pilot.' },
  { para: 3, reply: 'Closed with one specific action.', text: 'Same-day close is live for every workspace today. Open Settings → Close and switch it on; your next month-end will run on it.' }
]

const history = ref<Version[]>([{
  changed: -1,
  paras: [
    'We are excited to announce a new feature that we think a lot of our customers will find helpful when doing month-end close.',
    'Bank feeds are now matched to ledger entries as they arrive, and accruals are posted from approved purchase orders without a manual journal.',
    'Teams in the pilot cut their close from an average of six days to one.',
    'Let us know what you think.'
  ]
}])
const messages = ref<Msg[]>([
  { id: 1, role: 'user', text: 'Draft a short launch post for same-day close.' },
  { id: 2, role: 'assistant', text: 'Here is a first draft in the canvas. Ask for changes and I will edit it in place.' }
])
const draft = ref('')
const pane = ref<string | number | null>('chat')
const focus = ref(-1)

const current = computed(() => history.value[history.value.length - 1]!)
const next = computed<Edit | undefined>(() => edits[history.value.length - 1])

function send(text: string) {
  const edit = next.value
  if (!text.trim() || !edit) return
  const paras = [...current.value.paras]
  paras[edit.para] = edit.text
  history.value = [...history.value, { paras, changed: edit.para }]
  const id = messages.value.length + 1
  messages.value = [...messages.value, { id, role: 'user', text: text.trim() }, { id: id + 1, role: 'assistant', text: edit.reply, para: edit.para }]
  draft.value = ''
  focus.value = -1
}
function undo() {
  history.value = history.value.slice(0, -1)
  messages.value = [...messages.value, { id: messages.value.length + 1, role: 'assistant', text: 'Reverted the last edit.' }]
}
async function jumpTo(i: number) {
  focus.value = i
  pane.value = 'canvas'
  await nextTick()
  document.getElementById('acs-p' + i)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}
</script>

<style scoped>
.acs { container-type: inline-size; display: flex; flex-direction: column; height: 680px; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.acs__top { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--mi-sep); }
.acs__shell { flex: 1; display: grid; grid-template-columns: minmax(0, 1fr); min-height: 0; }
/* Narrow: one pane at a time behind the switch. Wide: both side by side and the switch goes away. */
.acs__shell.show-chat .acs__canvas, .acs__shell.show-canvas .acs__chat { display: none; }
@container (min-width: 820px) {
  .acs__switch { display: none; }
  .acs__shell { grid-template-columns: minmax(300px, 2fr) 3fr; }
  .acs__shell.show-chat .acs__canvas, .acs__shell.show-canvas .acs__chat { display: flex; }
  .acs__canvas { border-left: 1px solid var(--mi-sep); }
}

.acs__chat { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.acs__log { flex: 1; min-height: 0; }
.acs__jump { padding: 0; border: 0; background: none; font: inherit; font-size: 12px; color: var(--mi-p-text); cursor: pointer; }
.acs__jump:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; border-radius: 4px; }
.acs__composer { display: grid; gap: 8px; padding: 12px 14px 14px; border-top: 1px solid var(--mi-sep); background: var(--mi-card); }
.acs__quick { display: flex; flex-wrap: wrap; gap: 6px; }

.acs__canvas { display: flex; flex-direction: column; min-width: 0; min-height: 0; background: var(--mi-card); }
.acs__doc-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 12px 8px 20px; border-bottom: 1px solid var(--mi-sep); }
.acs__page { flex: 1; overflow-y: auto; display: grid; align-content: start; gap: 14px; padding: 24px 20px 32px; }
@container (min-width: 820px) { .acs__page { padding: 36px 44px; } }
.acs__para { position: relative; margin: 0; max-width: 62ch; font-size: 15px; line-height: 1.65; }
/* The paragraph the assistant just changed carries a brand rule in the margin. */
.acs__para::before { content: ""; position: absolute; inset: 2px auto 2px -12px; width: 3px; border-radius: 2px; background: var(--mi-p); opacity: 0; transform: scaleY(.4); transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.acs__para.is-fresh::before, .acs__para.is-focus::before { opacity: 1; transform: none; }
.acs__para.is-focus::before { background: var(--mi-s); }
</style>

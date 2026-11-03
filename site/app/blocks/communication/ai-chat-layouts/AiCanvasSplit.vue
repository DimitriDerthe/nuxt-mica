<template>
  <section class="acs mi:@container mi:flex mi:flex-col mi:h-170 mi:font-mi mi:text-label mi:[background:var(--mi-page)]" aria-labelledby="acs-title">
    <header class="acs__top mi:flex mi:items-center mi:justify-between mi:gap-3 mi:py-3 mi:px-4 mi:border-b mi:border-b-sep">
      <MiText id="acs-title" as="h2" variant="headline" weight="semibold" :lines="1">Writing assistant</MiText>
      <MiSegmented v-model="pane" label="Show pane" :options="panes" class="acs__switch" />
    </header>

    <div class="acs__shell mi:flex-1 mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:min-h-0 mi:@[820px]:grid-cols-[minmax(300px,_2fr)_3fr]" :class="'show-' + pane">
      <!-- Chat pane: requests on the left, the document they change on the right. -->
      <div class="acs__chat mi:[.acs__shell.show-canvas_&]:hidden mi:@[820px]:[.acs__shell.show-canvas_&]:flex mi:flex mi:flex-col mi:min-w-0 mi:min-h-0">
        <MiMessageScroller class="acs__log" label="Conversation about the draft">
          <MiMessageScrollerItem v-for="m in messages" :key="m.id" :message-id="'acs-' + m.id" :scroll-anchor="m.role === 'user'">
            <MiMessage :align="m.role === 'user' ? 'end' : 'start'" :label="m.role === 'user' ? 'You' : 'Assistant'">
              <MiBubble :align="m.role === 'user' ? 'end' : 'start'" :variant="m.role === 'user' ? 'secondary' : 'muted'">{{ m.text }}</MiBubble>
              <template v-if="m.para !== undefined" #footer>
                <button type="button" class="acs__jump mi:p-0 mi:[border:0] mi:[background:none] mi:text-p-text mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px]" @click="jumpTo(m.para)">Edited paragraph {{ m.para + 1 }}</button>
              </template>
            </MiMessage>
          </MiMessageScrollerItem>
        </MiMessageScroller>

        <form class="acs__composer mi:grid mi:gap-2 mi:pt-3 mi:px-3.5 mi:pb-3.5 mi:border-t mi:border-t-sep mi:[background:var(--mi-card)]" @submit.prevent="send(draft)">
          <div class="acs__quick mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Quick edits">
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

      <article class="acs__canvas mi:[.acs__shell.show-chat_&]:hidden mi:@[820px]:[.acs__shell.show-chat_&]:flex mi:@[820px]:border-l mi:@[820px]:border-l-sep mi:flex mi:flex-col mi:min-w-0 mi:min-h-0 mi:[background:var(--mi-card)]" aria-labelledby="acs-doc">
        <header class="acs__doc-head mi:flex mi:items-center mi:justify-between mi:gap-2 mi:pt-2 mi:pr-3 mi:pb-2 mi:pl-5 mi:border-b mi:border-b-sep">
          <MiText variant="caption" tone="label2" weight="medium">Draft · version {{ history.length }}</MiText>
          <MiButton variant="plain" size="small" :disabled="history.length === 1" @click="undo">
            <template #leading><MiIcon name="arrow-left" :size="14" /></template>Undo
          </MiButton>
        </header>
        <div class="acs__page mi:flex-1 mi:overflow-y-auto mi:grid mi:content-start mi:gap-3.5 mi:pt-6 mi:px-5 mi:pb-8 mi:@[820px]:py-9 mi:@[820px]:px-11">
          <MiText id="acs-doc" as="h3" variant="title2" weight="bold">Ledgerline now closes your books in a day</MiText>
          <p
            v-for="(p, i) in current.paras" :id="'acs-p' + i" :key="i" class="acs__para mi:relative mi:m-0 mi:max-w-[62ch] mi:text-[15px] mi:leading-[1.65] mi:before:content-[''] mi:before:absolute mi:before:top-0.5 mi:before:right-auto mi:before:bottom-0.5 mi:before:-left-3 mi:before:w-[3px] mi:before:rounded-[2px] mi:before:[background:var(--mi-p)] mi:before:opacity-0 mi:before:transform-[scaleY(.4)] mi:before:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)] mi:[&.is-fresh]:before:opacity-100 mi:[&.is-fresh]:before:transform-none mi:[&.is-focus]:before:opacity-100 mi:[&.is-focus]:before:transform-none mi:[&.is-focus]:before:[background:var(--mi-s)]" :class="{ 'is-fresh': i === current.changed, 'is-focus': i === focus }"
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
@container (min-width: 820px) {
  .acs__switch { display: none; }
}
.acs__log { flex: 1; min-height: 0; }
.acs__jump { font: inherit; font-size: 12px; }
</style>

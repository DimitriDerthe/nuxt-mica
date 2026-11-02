<template>
  <section class="ac" aria-labelledby="ac-title">
    <div class="ac__shell" :class="{ 'is-history': showHistory }">
      <nav class="ac__hist" aria-label="Conversations">
        <header class="ac__hist-head">
          <MiIconButton class="ac__back" label="Back to chat" variant="gray" size="regular" @click="showHistory = false">
            <MiIcon name="chevron-left" />
          </MiIconButton>
          <MiText as="h3" variant="subheadline" weight="semibold">Research</MiText>
          <MiButton variant="tinted" size="small" @click="newChat">
            <template #leading><MiIcon name="plus" :size="16" /></template>New
          </MiButton>
        </header>
        <ul class="ac__hist-list">
          <li v-for="c in chats" :key="c.id">
            <button type="button" class="ac__hist-item" :class="{ 'is-on': c.id === activeId }" :aria-current="c.id === activeId ? 'true' : undefined" @click="openChat(c.id)">
              <span class="ac__hist-title">{{ c.title }}</span>
              <span class="ac__hist-meta">{{ c.when }} · {{ sourceCount(c) }} sources</span>
            </button>
          </li>
        </ul>
      </nav>

      <div class="ac__main">
        <header class="ac__head">
          <MiIconButton class="ac__hist-btn" label="Show conversations" variant="gray" size="regular" @click="showHistory = true">
            <MiIcon name="sidebar" />
          </MiIconButton>
          <MiText id="ac-title" as="h2" variant="headline" weight="semibold" :lines="1" class="ac__title">{{ active.title }}</MiText>
          <MiBadge tone="secondary" label="Cited answers" />
        </header>

        <MiMessageScroller :key="activeId" class="ac__log" :busy="pending" :label="'Conversation: ' + active.title">
          <MiMessageScrollerItem v-for="m in active.messages" :key="m.id" :message-id="'ac-' + m.id" :scroll-anchor="m.role === 'user'">
            <MiMessage v-if="m.role === 'user'" align="end" label="You" class="ac__user">
              <MiBubble align="end" variant="secondary" class="ac__bub">{{ m.text }}</MiBubble>
            </MiMessage>

            <article v-else class="ac__answer" :aria-busy="m.pending ? 'true' : undefined">
              <MiTrace :steps="m.trace" :label="'How this answer was made'" class="ac__trace" />
              <template v-if="!m.pending">
                <!-- Each claim carries a numbered citation that lights up its source card. -->
                <p v-for="(para, i) in m.paras" :key="i" class="ac__p">
                  <template v-for="(seg, j) in para" :key="j">{{ seg.t }}<button
                    v-if="seg.cite" type="button" class="ac__cite" :class="{ 'is-hot': hot === m.id + ':' + seg.cite }"
                    :aria-label="'Source ' + seg.cite" @click="hot = m.id + ':' + seg.cite"
                  >{{ seg.cite }}</button></template>
                </p>
                <ol class="ac__sources" :aria-label="'Sources for this answer'">
                  <li v-for="s in m.sources" :key="s.n">
                    <button type="button" class="ac__src" :class="{ 'is-hot': hot === m.id + ':' + s.n }" @click="hot = m.id + ':' + s.n">
                      <span class="ac__src-n">{{ s.n }}</span>
                      <span class="ac__src-text">
                        <span class="ac__src-title">{{ s.title }}</span>
                        <span class="ac__src-host">{{ s.host }}</span>
                      </span>
                    </button>
                  </li>
                </ol>
              </template>
            </article>
          </MiMessageScrollerItem>
        </MiMessageScroller>

        <form class="ac__composer" @submit.prevent="ask">
          <MiInputGroup v-model="draft" multiline :rows="2" aria-label="Ask a research question" placeholder="Ask a follow-up…" @keydown.enter.exact.prevent="ask">
            <template #block-end>
              <div class="ac__bar">
                <MiChip v-model="deep" selectable size="small" tone="secondary" label="Deep research" />
                <MiText variant="caption" tone="label3" class="ac__hint">Answers cite every claim</MiText>
                <MiIconButton type="submit" label="Ask" size="small" :disabled="!draft.trim() || pending">
                  <MiIcon name="arrow-up" :size="16" />
                </MiIconButton>
              </div>
            </template>
          </MiInputGroup>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

interface Step { title: string, description?: string, status?: 'done' | 'running' | 'error' | 'pending', duration?: number, detail?: string }
interface Source { n: number, title: string, host: string }
type Para = { t: string, cite?: number }[]
interface Msg { id: string, role: 'user' | 'assistant', text?: string, paras?: Para[], sources?: Source[], trace?: Step[], pending?: boolean }
interface Chat { id: string, title: string, when: string, messages: Msg[] }

// Sample research threads; swap for your model API.
const chats = ref<Chat[]>([
  {
    id: 'heat', title: 'Heat pump vs gas boiler, 1970s semi', when: 'Today',
    messages: [
      { id: 'h1', role: 'user', text: 'Is a heat pump cheaper to run than my gas boiler? 1970s semi-detached in Leeds, cavity walls filled, about 11,000 kWh of gas a year.' },
      {
        id: 'h2', role: 'assistant',
        trace: [
          { title: 'Searched energy price caps', description: '4 results', duration: 1200 },
          { title: 'Read heat pump field trial', description: 'Electrification of Heat, 742 homes', duration: 2100, detail: 'Median seasonal performance factor 2.8 across all property ages; 1970s homes ranged 2.6 to 3.1.' },
          { title: 'Calculated annual cost', description: '2 scenarios', duration: 400 }
        ],
        paras: [
          [{ t: 'Probably slightly cheaper, but not by much. A typical heat pump in a home like yours reaches a seasonal efficiency of around 2.8', cite: 1 }, { t: ', so 11,000 kWh of heat needs roughly 3,900 kWh of electricity.' }],
          [{ t: 'At current capped unit rates', cite: 2 }, { t: ' that is about £960 a year against £690 for gas plus the £120 gas standing charge you would drop. Switching to a heat pump tariff with cheaper overnight rates widens the gap to roughly £150 in your favour', cite: 3 }, { t: '.' }]
        ],
        sources: [
          { n: 1, title: 'Electrification of Heat demonstration: final report', host: 'gov.uk' },
          { n: 2, title: 'Energy price cap explained, October to December', host: 'ofgem.gov.uk' },
          { n: 3, title: 'Heat pump tariffs compared', host: 'energysavingtrust.org.uk' }
        ]
      }
    ]
  },
  {
    id: 'act', title: 'AI Act duties for a hiring tool', when: 'Yesterday',
    messages: [
      { id: 'a1', role: 'user', text: 'We sell CV screening software in the EU. What does the AI Act require from us, briefly?' },
      {
        id: 'a2', role: 'assistant',
        trace: [{ title: 'Read Regulation (EU) 2024/1689', description: 'Annex III', duration: 2600 }],
        paras: [
          [{ t: 'CV screening is listed as high-risk under Annex III, point 4', cite: 1 }, { t: '. As the provider you need a risk management system, documented training data governance, human oversight by design and a conformity assessment before sale.' }],
          [{ t: 'Most of these obligations apply from 2 August 2026', cite: 2 }, { t: '.' }]
        ],
        sources: [
          { n: 1, title: 'Regulation (EU) 2024/1689, Annex III', host: 'eur-lex.europa.eu' },
          { n: 2, title: 'AI Act implementation timeline', host: 'digital-strategy.ec.europa.eu' }
        ]
      }
    ]
  },
  { id: 'kyoto', title: 'Kyoto in 3 days, fewer crowds', when: 'Oct 28', messages: [{ id: 'k1', role: 'user', text: 'Three days in Kyoto in late November. How do I avoid the worst crowds?' }] }
])

const followUp: Omit<Msg, 'id' | 'role'> = {
  trace: [
    { title: 'Searched installer quotes', description: '5 results', duration: 1400 },
    { title: 'Checked grant eligibility', description: 'Boiler Upgrade Scheme', duration: 900 }
  ],
  paras: [
    [{ t: 'Installed costs for a 7 kW air-source unit in Yorkshire are quoted between £10,500 and £13,000', cite: 1 }, { t: ', before the £7,500 Boiler Upgrade Scheme grant', cite: 2 }, { t: ' which your home qualifies for since the cavity walls are filled.' }]
  ],
  sources: [
    { n: 1, title: 'Regional installation cost survey, 2024', host: 'mcscertified.com' },
    { n: 2, title: 'Boiler Upgrade Scheme: check if you can apply', host: 'gov.uk' }
  ]
}

const activeId = ref('heat')
const showHistory = ref(false)
const draft = ref('')
const deep = ref(false)
const hot = ref('h2:1')
const pending = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let seq = 0

const active = computed(() => chats.value.find(c => c.id === activeId.value) ?? chats.value[0]!)
const sourceCount = (c: Chat) => c.messages.reduce((n, m) => n + (m.sources?.length ?? 0), 0)

function openChat(id: string) {
  activeId.value = id
  showHistory.value = false
}

function newChat() {
  const id = 'new' + ++seq
  chats.value.unshift({ id, title: 'New research', when: 'Now', messages: [] })
  openChat(id)
}

function ask() {
  const text = draft.value.trim()
  if (!text || pending.value) return
  const chat = active.value
  if (!chat.messages.length) chat.title = text.length > 40 ? text.slice(0, 40) + '…' : text
  chat.messages.push({ id: 'u' + ++seq, role: 'user', text })
  const id = 'r' + seq
  chat.messages.push({ id, role: 'assistant', pending: true, trace: [{ title: deep.value ? 'Planning a deep search' : 'Searching sources', status: 'running' }] })
  draft.value = ''
  pending.value = true
  // One timer stands in for the streamed response.
  timer = setTimeout(() => {
    const msg = chat.messages.find(m => m.id === id)
    if (msg) Object.assign(msg, followUp, { pending: false })
    hot.value = id + ':1'
    pending.value = false
  }, 1600)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.ac { container-type: inline-size; height: 700px; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.ac__shell { display: grid; height: 100%; grid-template-columns: minmax(0, 1fr); }
.ac__hist { display: none; }
.ac__shell.is-history .ac__hist { display: flex; }
.ac__shell.is-history .ac__main { display: none; }

@container (min-width: 900px) {
  .ac__shell { grid-template-columns: 260px minmax(0, 1fr); }
  .ac__shell .ac__hist { display: flex; border-right: 1px solid var(--mi-sep); }
  .ac__shell .ac__main, .ac__shell.is-history .ac__main { display: flex; }
  .ac__back, .ac__hist-btn { display: none; }
}

.ac__hist { flex-direction: column; min-height: 0; background: var(--mi-card); }
.ac__hist-head { display: flex; align-items: center; gap: 10px; min-height: 60px; padding: 0 12px 0 16px; border-bottom: 1px solid var(--mi-sep); }
.ac__hist-head > :nth-child(2) { flex: 1; }
.ac__hist-list { flex: 1; min-height: 0; overflow-y: auto; list-style: none; margin: 0; padding: 8px; display: grid; align-content: start; gap: 2px; }
.ac__hist-item { display: grid; gap: 3px; width: 100%; padding: 10px 12px; border: 0; border-radius: var(--mi-radius-m); background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; }
.ac__hist-item:hover { background: var(--mi-fill4); }
.ac__hist-item.is-on { background: var(--mi-fill3); }
.ac__hist-item:focus-visible, .ac__src:focus-visible, .ac__cite:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.ac__hist-title { font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ac__hist-meta { font-size: 12px; color: var(--mi-label3); }

.ac__main { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.ac__head { display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 0 16px; border-bottom: 1px solid var(--mi-sep); background: var(--mi-card); }
.ac__title { flex: 1; min-width: 0; }
.ac__log { flex: 1; min-height: 0; }
.ac__user { max-width: min(86%, 34rem); margin-inline-start: auto; }
.ac .ac__bub { max-width: 100%; }

.ac__answer { display: grid; gap: 12px; max-width: 46rem; padding: 4px 4px 8px; }
.ac__trace { max-width: 30rem; }
.ac__p { margin: 0; font-size: 15px; line-height: 1.65; overflow-wrap: anywhere; }
.ac__cite { display: inline-grid; place-items: center; min-width: 18px; height: 18px; margin: 0 2px; padding: 0 4px; border: 0; border-radius: 6px; background: var(--mi-fill3); color: var(--mi-label2); font: inherit; font-size: 11px; font-weight: 700; vertical-align: 2px; cursor: pointer; transition: transform var(--mi-dur-2) var(--mi-spring); }
.ac__cite.is-hot { background: var(--mi-p); color: var(--mi-p-on); transform: scale(1.12); }
.ac__sources { list-style: none; margin: 4px 0 0; padding: 0; display: grid; gap: 8px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 620px) { .ac__sources { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); } }
.ac__src { position: relative; display: flex; gap: 10px; width: 100%; height: 100%; padding: 10px 12px; border: 1px solid var(--mi-sep); border-radius: var(--mi-radius-m); background: var(--mi-card); color: inherit; font: inherit; text-align: start; cursor: pointer; }
.ac__src::after { content: ""; position: absolute; inset: -1px; border-radius: inherit; box-shadow: 0 0 0 2px var(--mi-p); opacity: 0; transition: opacity var(--mi-dur-2) var(--mi-ease); pointer-events: none; }
.ac__src.is-hot::after { opacity: 1; }
.ac__src-n { display: grid; place-items: center; flex: none; width: 20px; height: 20px; border-radius: 6px; background: var(--mi-p-tint); color: var(--mi-p-text); font-size: 11px; font-weight: 700; }
.ac__src-text { display: grid; gap: 2px; min-width: 0; }
.ac__src-title { font-size: 13px; font-weight: 500; line-height: 1.35; }
.ac__src-host { font-size: 12px; color: var(--mi-label3); }

.ac__composer { padding: 12px 16px 16px; border-top: 1px solid var(--mi-sep); background: var(--mi-card); }
.ac__bar { display: flex; align-items: center; gap: 10px; width: 100%; }
.ac__hint { flex: 1; min-width: 0; text-align: end; }
@container (max-width: 380px) { .ac__hint { visibility: hidden; } }
</style>

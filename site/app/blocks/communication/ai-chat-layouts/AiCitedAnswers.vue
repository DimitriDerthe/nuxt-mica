<template>
  <section class="mi:@container mi:h-175 mi:font-mi mi:text-label mi:bg-page" aria-labelledby="ac-title">
    <div class="mi:grid mi:h-full mi:grid-cols-[minmax(0,_1fr)] mi:@[900px]:grid-cols-[260px_minmax(0,_1fr)]">
      <nav class="mi:@[900px]:flex mi:@[900px]:border-r mi:@[900px]:border-r-sep mi:flex-col mi:min-h-0 mi:bg-card" :class="showHistory ? 'mi:flex' : 'mi:hidden'" aria-label="Conversations">
        <header class="mi:flex mi:items-center mi:gap-2.5 mi:min-h-15 mi:pt-0 mi:pr-3 mi:pb-0 mi:pl-4 mi:border-b mi:border-b-sep">
          <MiIconButton class="mi:@[900px]:hidden!" label="Back to chat" variant="gray" size="regular" @click="showHistory = false">
            <MiIcon name="chevron-left" />
          </MiIconButton>
          <MiText as="h3" variant="subheadline" weight="semibold" class="mi:flex-1">Research</MiText>
          <MiButton variant="tinted" size="small" @click="newChat">
            <template #leading><MiIcon name="plus" :size="16" /></template>New
          </MiButton>
        </header>
        <ul class="mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:[list-style:none] mi:m-0 mi:p-2 mi:grid mi:content-start mi:gap-0.5">
          <li v-for="c in chats" :key="c.id">
            <button type="button" class="mi:grid mi:gap-[3px] mi:w-full mi:py-2.5 mi:px-3 mi:[border:0] mi:rounded-md mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :class="c.id === activeId ? 'mi:bg-fill3' : 'mi:bg-transparent mi:hover:bg-fill4'" :aria-current="c.id === activeId ? 'true' : undefined" @click="openChat(c.id)">
              <span class="mi:text-[14px] mi:font-medium mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ c.title }}</span>
              <span class="mi:text-[12px] mi:text-label3">{{ c.when }} · {{ sourceCount(c) }} sources</span>
            </button>
          </li>
        </ul>
      </nav>

      <div class="mi:@[900px]:flex mi:flex-col mi:min-w-0 mi:min-h-0" :class="showHistory ? 'mi:hidden' : 'mi:flex'">
        <header class="mi:flex mi:items-center mi:gap-3 mi:min-h-15 mi:py-0 mi:px-4 mi:border-b mi:border-b-sep mi:bg-card">
          <MiIconButton class="mi:@[900px]:hidden!" label="Show conversations" variant="gray" size="regular" @click="showHistory = true">
            <MiIcon name="sidebar" />
          </MiIconButton>
          <MiText id="ac-title" as="h2" variant="headline" weight="semibold" :lines="1" class="mi:flex-1 mi:min-w-0">{{ active.title }}</MiText>
          <MiBadge tone="secondary" label="Cited answers" />
        </header>

        <MiMessageScroller :key="activeId" class="mi:flex-1 mi:min-h-0" :busy="pending" :label="'Conversation: ' + active.title">
          <MiMessageScrollerItem v-for="m in active.messages" :key="m.id" :message-id="'ac-' + m.id" :scroll-anchor="m.role === 'user'">
            <MiMessage v-if="m.role === 'user'" align="end" label="You" class="mi:ms-auto mi:max-w-[min(86%,_34rem)]!">
              <MiBubble align="end" variant="secondary" class="mi:max-w-full!">{{ m.text }}</MiBubble>
            </MiMessage>

            <article v-else class="mi:grid mi:gap-3 mi:max-w-[46rem] mi:pt-1 mi:px-1 mi:pb-2" :aria-busy="m.pending ? 'true' : undefined">
              <MiTrace :steps="m.trace" :label="'How this answer was made'" class="mi:max-w-[30rem]" />
              <template v-if="!m.pending">
                <!-- Each claim carries a numbered citation that lights up its source card. -->
                <p v-for="(para, i) in m.paras" :key="i" class="mi:m-0 mi:text-[15px] mi:leading-[1.65] mi:wrap-anywhere">
                  <template v-for="(seg, j) in para" :key="j">{{ seg.t }}<button
                    v-if="seg.cite" type="button" class="mi:[font:inherit] mi:text-[11px] mi:font-bold mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:inline-grid mi:place-items-center mi:min-w-4.5 mi:h-4.5 mi:my-0 mi:mx-0.5 mi:py-0 mi:px-1 mi:[border:0] mi:rounded-[6px] mi:[vertical-align:2px] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)]" :class="hot === `${m.id}:${seg.cite}` ? 'mi:bg-p mi:text-p-on mi:transform-[scale(1.12)]' : 'mi:bg-fill3 mi:text-label2'"
                    :aria-label="'Source ' + seg.cite" @click="hot = `${m.id}:${seg.cite}`"
                  >{{ seg.cite }}</button></template>
                </p>
                <ol class="mi:[list-style:none] mi:mt-1 mi:mx-0 mi:mb-0 mi:p-0 mi:grid mi:gap-2 mi:grid-cols-[minmax(0,_1fr)] mi:@[620px]:grid-cols-[repeat(auto-fill,_minmax(220px,_1fr))]" :aria-label="'Sources for this answer'">
                  <li v-for="s in m.sources" :key="s.n">
                    <button type="button" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:relative mi:flex mi:gap-2.5 mi:w-full mi:h-full mi:py-2.5 mi:px-3 mi:border mi:border-sep mi:rounded-md mi:bg-card mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:after:content-[''] mi:after:absolute mi:after:-inset-px mi:after:rounded-[inherit] mi:after:shadow-[0_0_0_2px_var(--mi-p)] mi:after:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:after:pointer-events-none" :class="hot === `${m.id}:${s.n}` ? 'mi:after:opacity-100' : 'mi:after:opacity-0'" @click="hot = `${m.id}:${s.n}`">
                      <span class="mi:grid mi:place-items-center mi:flex-[none] mi:w-5 mi:h-5 mi:rounded-[6px] mi:bg-p-tint mi:text-p-text mi:text-[11px] mi:font-bold">{{ s.n }}</span>
                      <span class="mi:grid mi:gap-0.5 mi:min-w-0">
                        <span class="mi:text-[13px] mi:font-medium mi:leading-[1.35]">{{ s.title }}</span>
                        <span class="mi:text-[12px] mi:text-label3">{{ s.host }}</span>
                      </span>
                    </button>
                  </li>
                </ol>
              </template>
            </article>
          </MiMessageScrollerItem>
        </MiMessageScroller>

        <form class="mi:pt-3 mi:px-4 mi:pb-4 mi:border-t mi:border-t-sep mi:bg-card" @submit.prevent="ask">
          <MiInputGroup v-model="draft" multiline :rows="2" aria-label="Ask a research question" placeholder="Ask a follow-up…" @keydown.enter.exact.prevent="ask">
            <template #block-end>
              <div class="mi:flex mi:items-center mi:gap-2.5 mi:w-full">
                <MiChip v-model="deep" selectable size="small" tone="secondary" label="Deep research" />
                <MiText variant="caption" tone="label3" class="mi:flex-1 mi:min-w-0 mi:text-end mi:@max-[380px]:invisible">Answers cite every claim</MiText>
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

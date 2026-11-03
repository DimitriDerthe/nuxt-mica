<template>
  <section class="hd mi:@container mi:h-155 mi:font-mi mi:text-label mi:bg-page" aria-labelledby="hd-title">
    <div class="hd__shell mi:grid mi:h-full mi:grid-cols-[minmax(0,_1fr)] mi:@[760px]:grid-cols-[minmax(0,_1fr)_380px]">
      <!-- The app page the help sidebar sits beside (wide containers only). -->
      <div class="hd__app mi:hidden mi:@[760px]:grid mi:content-start mi:gap-5 mi:p-7 mi:opacity-75" aria-hidden="true">
        <div class="hd__app-head mi:flex mi:items-center mi:gap-2.5"><span class="hd__app-title mi:text-[24px] mi:font-bold mi:tracking-[-.02em]">Billing</span><span class="hd__pill mi:py-[3px] mi:px-2.5 mi:rounded-[999px] mi:bg-p-tint mi:text-p-text mi:text-[12px] mi:font-semibold">Team plan</span></div>
        <div class="hd__app-card mi:grid mi:grid-cols-[auto_1fr] mi:gap-y-3 mi:gap-x-6 mi:p-5 mi:rounded-lg mi:bg-card mi:shadow-1 mi:text-[14px]">
          <span class="hd__k mi:text-label2">Next invoice</span><span class="hd__v mi:font-medium">€348.00 on 1 December</span>
          <span class="hd__k mi:text-label2">Seats</span><span class="hd__v mi:font-medium">12 of 12 used</span>
          <span class="hd__k mi:text-label2">Payment method</span><span class="hd__v mi:font-medium">Visa ending 4410</span>
        </div>
        <div class="hd__app-rows mi:grid mi:gap-2.5"><span class="mi:[.hd__app-rows_&]:h-11 mi:[.hd__app-rows_&]:rounded-md" /><span class="mi:[.hd__app-rows_&]:h-11 mi:[.hd__app-rows_&]:rounded-md" /><span class="mi:[.hd__app-rows_&]:h-11 mi:[.hd__app-rows_&]:rounded-md" /><span class="mi:[.hd__app-rows_&]:h-11 mi:[.hd__app-rows_&]:rounded-md" /></div>
      </div>

      <aside class="hd__side mi:@[760px]:border-l mi:@[760px]:border-l-sep mi:@[760px]:shadow-2 mi:flex mi:flex-col mi:min-h-0 mi:min-w-0 mi:bg-card">
        <header class="hd__head mi:pt-4 mi:px-4 mi:pb-2">
          <MiText id="hd-title" as="h2" variant="headline" weight="bold">Help</MiText>
          <MiText variant="caption" tone="label2">Felix and Jun are online</MiText>
        </header>

        <MiTabs v-model="tab" aria-label="Help sections" class="hd__tabs mi:min-h-0">
          <MiTabsList aria-label="Help sections" class="hd__tablist mi:my-0 mi:mx-4">
            <MiTabsTrigger value="chat">Chat</MiTabsTrigger>
            <MiTabsTrigger value="guides">Guides</MiTabsTrigger>
          </MiTabsList>

          <MiTabsContent value="chat" class="hd__panel mi:min-h-0 mi:flex mi:flex-col">
            <MiMessageScroller class="hd__log" label="Support chat">
              <MiMessageScrollerItem v-for="m in log" :key="m.id" :message-id="'hd-' + m.id">
                <MiMarker v-if="m.kind === 'status'" role="status" class="hd__status">{{ m.text }}</MiMarker>
                <MiMessage v-else :align="m.kind === 'me' ? 'end' : 'start'" :label="m.who" class="hd__row mi:[&.is-end]:ms-auto" :class="{ 'is-end': m.kind === 'me' }">
                  <template v-if="m.kind !== 'me'" #avatar><MiAvatar :name="m.who" size="xs" tone="indigo" decorative /></template>
                  <MiBubble :align="m.kind === 'me' ? 'end' : 'start'" :variant="m.kind === 'me' ? 'default' : 'secondary'" class="hd__bub">{{ m.text }}</MiBubble>
                </MiMessage>
              </MiMessageScrollerItem>
            </MiMessageScroller>

            <!-- Deflection: guides that match what is being typed, before it is sent. -->
            <Transition name="hd-rise">
              <div v-if="suggestions.length" class="hd__suggest mi:grid mi:gap-1 mi:my-0 mi:mx-3 mi:p-2.5 mi:rounded-[var(--mi-radius-l)_var(--mi-radius-l)_0_0] mi:bg-p-tint mi:origin-bottom" aria-live="polite">
                <MiText variant="caption" weight="semibold" tone="label2">Might answer this</MiText>
                <button v-for="a in suggestions" :key="a.id" type="button" class="hd__sug mi:flex mi:items-center mi:gap-2 mi:w-full mi:py-2 mi:px-2.5 mi:[border:0] mi:rounded-md mi:bg-card mi:text-label mi:text-start mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" @click="openGuide(a.id)">
                  <MiIcon class="mi:[.hd__sug_span&]:min-w-0" name="document" :size="15" />
                  <span class="mi:[.hd__sug_span&]:min-w-0">{{ a.title }}</span>
                  <MiIcon class="mi:[.hd__sug_span&]:min-w-0" name="chevron-right" :size="14" />
                </button>
              </div>
            </Transition>

            <form class="hd__composer mi:pt-0 mi:px-3 mi:pb-3.5 mi:before:content-[''] mi:before:block mi:before:h-2.5" @submit.prevent="send">
              <MiInputGroup v-model="draft" size="sm" aria-label="Message support" placeholder="Ask about billing, seats, invoices…">
                <template #trailing>
                  <MiIconButton type="submit" label="Send" size="small" :disabled="!draft.trim()"><MiIcon name="arrow-up" :size="15" /></MiIconButton>
                </template>
              </MiInputGroup>
            </form>
          </MiTabsContent>

          <MiTabsContent value="guides" class="hd__panel hd__panel--guides mi:min-h-0 mi:flex mi:flex-col mi:gap-3 mi:p-4 mi:overflow-y-auto">
            <template v-if="article">
              <article class="hd__article mi:grid mi:gap-2 mi:justify-items-start" aria-labelledby="hd-art-title">
                <MiButton variant="plain" size="small" @click="articleId = null">
                  <template #leading><MiIcon name="chevron-left" :size="15" /></template>All guides
                </MiButton>
                <MiText id="hd-art-title" as="h3" variant="title3" weight="bold">{{ article.title }}</MiText>
                <MiText variant="caption" tone="label3">{{ article.read }} min read</MiText>
                <p v-for="(p, i) in article.body" :key="i" class="hd__art-p mi:m-0 mi:text-[14.5px] mi:leading-[1.6]">{{ p }}</p>
                <div class="hd__helpful mi:grid mi:gap-2 mi:w-full mi:mt-2 mi:p-3 mi:rounded-md mi:bg-fill4">
                  <MiText variant="footnote" tone="label2">{{ helpful === null ? 'Did this answer your question?' : helpful ? 'Glad it helped.' : 'Sorry. Ask us in Chat, we reply in about 6 min.' }}</MiText>
                  <div v-if="helpful === null" class="hd__yn mi:flex mi:gap-1.5">
                    <MiButton variant="gray" size="small" @click="helpful = true">Yes</MiButton>
                    <MiButton variant="gray" size="small" @click="helpful = false; tab = 'chat'">No, chat</MiButton>
                  </div>
                </div>
              </article>
            </template>
            <template v-else>
              <MiSearch v-model="query" size="compact" placeholder="Search guides" aria-label="Search guides" :cancelable="false" />
              <MiList :grouped="false" label="Guides" class="hd__list">
                <MiListItem v-for="a in filtered" :key="a.id" button :title="a.title" :subtitle="a.read + ' min read'" chevron @click="openGuide(a.id)" />
              </MiList>
              <MiText v-if="!filtered.length" variant="footnote" tone="label2">No guide matches “{{ query }}”.</MiText>
            </template>
          </MiTabsContent>
        </MiTabs>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Line { id: number, kind: 'agent' | 'me' | 'status', who: string, text: string }
interface Guide { id: string, title: string, read: number, keys: string[], body: string[] }

// Sample help centre; swap for your docs search.
const guides: Guide[] = [
  { id: 'seats', title: 'Add or remove seats', read: 2, keys: ['seat', 'member', 'user', 'invite', 'add'], body: ['Go to Billing, then Seats, and change the number. New seats are charged pro rata for the rest of the cycle.', 'Removing a seat takes effect at the next invoice; the person keeps access until then.'] },
  { id: 'invoice', title: 'Download past invoices', read: 1, keys: ['invoice', 'receipt', 'pdf', 'download', 'vat'], body: ['Every invoice is under Billing, then History. Each one has a PDF with your VAT number once it is set in company details.'] },
  { id: 'card', title: 'Change the payment card', read: 1, keys: ['card', 'payment', 'visa', 'expired', 'pay'], body: ['Billing, then Payment method, then Replace. The next charge uses the new card; nothing is charged right away.'] },
  { id: 'downgrade', title: 'Switch to a smaller plan', read: 3, keys: ['downgrade', 'cancel', 'plan', 'cheaper', 'price'], body: ['You can move to Starter at any time. Features above the Starter limits become read-only, nothing is deleted.'] }
]

const tab = ref<string | undefined>('chat')
const draft = ref('Can I add two more seats this month?')
const query = ref('')
const articleId = ref<string | null>(null)
const helpful = ref<boolean | null>(null)
let seq = 0

const log = ref<Line[]>([
  { id: ++seq, kind: 'agent', who: 'Felix Brandt', text: 'Hi Rosa, Felix from support. Ask anything about your plan, seats or invoices.' }
])

const words = computed(() => draft.value.toLowerCase().split(/\W+/).filter(w => w.length > 3))
const suggestions = computed(() => (words.value.length ? guides.filter(g => g.keys.some(k => words.value.some(w => k.startsWith(w) || w.startsWith(k)))).slice(0, 2) : []))
const filtered = computed(() => guides.filter(g => (g.title + ' ' + g.keys.join(' ')).toLowerCase().includes(query.value.trim().toLowerCase())))
const article = computed(() => guides.find(g => g.id === articleId.value))
watch(articleId, () => { helpful.value = null })

function openGuide(id: string) {
  articleId.value = id
  tab.value = 'guides'
}

function send() {
  const text = draft.value.trim()
  if (!text) return
  log.value.push({ id: ++seq, kind: 'me', who: 'You', text })
  if (log.value.filter(l => l.kind === 'status').length === 0) log.value.push({ id: ++seq, kind: 'status', who: '', text: 'Sent · Felix usually replies in 6 min' })
  draft.value = ''
}
</script>

<style scoped>
.hd__app-rows span { background: var(--mi-fill4); }
.hd__tabs { flex: 1; display: flex; flex-direction: column; }
.hd__panel { flex: 1; }

.hd__log { flex: 1; min-height: 0; background: var(--mi-page); }
.hd__row { max-width: 90%; }
.hd .hd__bub { max-width: 100%; }
.hd__status { justify-content: center; }
.hd__sug { font: inherit; font-size: 13.5px; font-weight: 500; }
.hd__sug span { flex: 1; }
.hd__sug > :first-child { color: var(--mi-p-text); }

.hd__list { margin-inline: -4px; }

.hd-rise-enter-active, .hd-rise-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.hd-rise-enter-from, .hd-rise-leave-to { opacity: 0; transform: translateY(8px); }
</style>

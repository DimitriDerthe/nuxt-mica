<template>
  <section class="hd" aria-labelledby="hd-title">
    <div class="hd__shell">
      <!-- The app page the help sidebar sits beside (wide containers only). -->
      <div class="hd__app" aria-hidden="true">
        <div class="hd__app-head"><span class="hd__app-title">Billing</span><span class="hd__pill">Team plan</span></div>
        <div class="hd__app-card">
          <span class="hd__k">Next invoice</span><span class="hd__v">€348.00 on 1 December</span>
          <span class="hd__k">Seats</span><span class="hd__v">12 of 12 used</span>
          <span class="hd__k">Payment method</span><span class="hd__v">Visa ending 4410</span>
        </div>
        <div class="hd__app-rows"><span /><span /><span /><span /></div>
      </div>

      <aside class="hd__side">
        <header class="hd__head">
          <MiText id="hd-title" as="h2" variant="headline" weight="bold">Help</MiText>
          <MiText variant="caption" tone="label2">Felix and Jun are online</MiText>
        </header>

        <MiTabs v-model="tab" aria-label="Help sections" class="hd__tabs">
          <MiTabsList aria-label="Help sections" class="hd__tablist">
            <MiTabsTrigger value="chat">Chat</MiTabsTrigger>
            <MiTabsTrigger value="guides">Guides</MiTabsTrigger>
          </MiTabsList>

          <MiTabsContent value="chat" class="hd__panel">
            <MiMessageScroller class="hd__log" label="Support chat">
              <MiMessageScrollerItem v-for="m in log" :key="m.id" :message-id="'hd-' + m.id">
                <MiMarker v-if="m.kind === 'status'" role="status" class="hd__status">{{ m.text }}</MiMarker>
                <MiMessage v-else :align="m.kind === 'me' ? 'end' : 'start'" :label="m.who" class="hd__row" :class="{ 'is-end': m.kind === 'me' }">
                  <template v-if="m.kind !== 'me'" #avatar><MiAvatar :name="m.who" size="xs" tone="indigo" decorative /></template>
                  <MiBubble :align="m.kind === 'me' ? 'end' : 'start'" :variant="m.kind === 'me' ? 'default' : 'secondary'" class="hd__bub">{{ m.text }}</MiBubble>
                </MiMessage>
              </MiMessageScrollerItem>
            </MiMessageScroller>

            <!-- Deflection: guides that match what is being typed, before it is sent. -->
            <Transition name="hd-rise">
              <div v-if="suggestions.length" class="hd__suggest" aria-live="polite">
                <MiText variant="caption" weight="semibold" tone="label2">Might answer this</MiText>
                <button v-for="a in suggestions" :key="a.id" type="button" class="hd__sug" @click="openGuide(a.id)">
                  <MiIcon name="document" :size="15" />
                  <span>{{ a.title }}</span>
                  <MiIcon name="chevron-right" :size="14" />
                </button>
              </div>
            </Transition>

            <form class="hd__composer" @submit.prevent="send">
              <MiInputGroup v-model="draft" size="sm" aria-label="Message support" placeholder="Ask about billing, seats, invoices…">
                <template #trailing>
                  <MiIconButton type="submit" label="Send" size="small" :disabled="!draft.trim()"><MiIcon name="arrow-up" :size="15" /></MiIconButton>
                </template>
              </MiInputGroup>
            </form>
          </MiTabsContent>

          <MiTabsContent value="guides" class="hd__panel hd__panel--guides">
            <template v-if="article">
              <article class="hd__article" aria-labelledby="hd-art-title">
                <MiButton variant="plain" size="small" @click="articleId = null">
                  <template #leading><MiIcon name="chevron-left" :size="15" /></template>All guides
                </MiButton>
                <MiText id="hd-art-title" as="h3" variant="title3" weight="bold">{{ article.title }}</MiText>
                <MiText variant="caption" tone="label3">{{ article.read }} min read</MiText>
                <p v-for="(p, i) in article.body" :key="i" class="hd__art-p">{{ p }}</p>
                <div class="hd__helpful">
                  <MiText variant="footnote" tone="label2">{{ helpful === null ? 'Did this answer your question?' : helpful ? 'Glad it helped.' : 'Sorry. Ask us in Chat, we reply in about 6 min.' }}</MiText>
                  <div v-if="helpful === null" class="hd__yn">
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
.hd { container-type: inline-size; height: 620px; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.hd__shell { display: grid; height: 100%; grid-template-columns: minmax(0, 1fr); }
.hd__app { display: none; }
@container (min-width: 760px) {
  .hd__shell { grid-template-columns: minmax(0, 1fr) 380px; }
  .hd__app { display: grid; }
  .hd__side { border-left: 1px solid var(--mi-sep); box-shadow: var(--mi-sh2); }
}

.hd__app { align-content: start; gap: 20px; padding: 28px; opacity: .75; }
.hd__app-head { display: flex; align-items: center; gap: 10px; }
.hd__app-title { font-size: 24px; font-weight: 700; letter-spacing: -.02em; }
.hd__pill { padding: 3px 10px; border-radius: 999px; background: var(--mi-p-tint); color: var(--mi-p-text); font-size: 12px; font-weight: 600; }
.hd__app-card { display: grid; grid-template-columns: auto 1fr; gap: 12px 24px; padding: 20px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); font-size: 14px; }
.hd__k { color: var(--mi-label2); }
.hd__v { font-weight: 500; }
.hd__app-rows { display: grid; gap: 10px; }
.hd__app-rows span { height: 44px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }

.hd__side { display: flex; flex-direction: column; min-height: 0; min-width: 0; background: var(--mi-card); }
.hd__head { padding: 16px 16px 8px; }
.hd__tabs { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.hd__tablist { margin: 0 16px; }
.hd__panel { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.hd__panel--guides { gap: 12px; padding: 16px; overflow-y: auto; }

.hd__log { flex: 1; min-height: 0; background: var(--mi-page); }
.hd__row { max-width: 90%; }
.hd__row.is-end { margin-inline-start: auto; }
.hd .hd__bub { max-width: 100%; }
.hd__status { justify-content: center; }

.hd__suggest { display: grid; gap: 4px; margin: 0 12px; padding: 10px; border-radius: var(--mi-radius-l) var(--mi-radius-l) 0 0; background: var(--mi-p-tint); transform-origin: bottom; }
.hd__sug { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 10px; border: 0; border-radius: var(--mi-radius-m); background: var(--mi-card); color: var(--mi-label); font: inherit; font-size: 13.5px; font-weight: 500; text-align: start; cursor: pointer; }
.hd__sug span { flex: 1; min-width: 0; }
.hd__sug > :first-child { color: var(--mi-p-text); }
.hd__sug:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.hd__composer { padding: 0 12px 14px; }
.hd__composer::before { content: ""; display: block; height: 10px; }

.hd__list { margin-inline: -4px; }
.hd__article { display: grid; gap: 8px; justify-items: start; }
.hd__art-p { margin: 0; font-size: 14.5px; line-height: 1.6; }
.hd__helpful { display: grid; gap: 8px; width: 100%; margin-top: 8px; padding: 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.hd__yn { display: flex; gap: 6px; }

.hd-rise-enter-active, .hd-rise-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.hd-rise-enter-from, .hd-rise-leave-to { opacity: 0; transform: translateY(8px); }
</style>

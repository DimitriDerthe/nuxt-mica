<template>
  <section class="tt" aria-labelledby="tt-title">
    <div class="tt__shell" :class="{ 'is-open': reading }">
      <nav class="tt__side" aria-labelledby="tt-title">
        <header class="tt__stream">
          <MiText id="tt-title" as="h2" variant="headline" weight="bold" :lines="1">#product-feedback</MiText>
          <MiText variant="caption" tone="label2">Every conversation is a topic. Resolve it when it is settled.</MiText>
          <MiSegmented v-model="filter" label="Topic status" :options="filters" />
        </header>
        <ul class="tt__topics">
          <li v-for="t in visible" :key="t.id">
            <button
              type="button" class="tt__topic" :class="{ 'is-on': t.id === activeId }"
              :aria-current="t.id === activeId ? 'true' : undefined" @click="open(t.id)"
            >
              <span class="tt__topic-top">
                <MiIcon v-if="t.resolved" name="check-circle-fill" :size="15" class="tt__ok" />
                <span class="tt__topic-name">{{ t.title }}</span>
                <MiBadge v-if="t.unread" :count="t.unread" tone="primary" variant="solid" />
              </span>
              <span class="tt__topic-meta">{{ lastOf(t).who }} · {{ t.messages.length }} {{ t.messages.length === 1 ? 'message' : 'messages' }}</span>
            </button>
          </li>
        </ul>
        <p v-if="!visible.length" class="tt__empty">No {{ filter }} topics in this stream.</p>
      </nav>

      <div class="tt__main">
        <header class="tt__head">
          <MiIconButton class="tt__back" label="Back to topics" variant="gray" size="regular" @click="reading = false">
            <MiIcon name="chevron-left" />
          </MiIconButton>
          <div class="tt__head-text">
            <MiText as="h3" variant="headline" weight="semibold" :lines="1">{{ active.title }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">Started by {{ active.messages[0]?.who }} · {{ people(active) }} people</MiText>
          </div>
          <MiButton :variant="active.resolved ? 'gray' : 'tinted'" size="small" @click="active.resolved = !active.resolved">
            <template #leading><MiIcon :name="active.resolved ? 'arrow-left' : 'check'" :size="15" /></template>
            {{ active.resolved ? 'Reopen' : 'Resolve' }}
          </MiButton>
        </header>

        <MiMessageScroller :key="activeId" class="tt__log" :label="'Messages in ' + active.title">
          <MiMessageScrollerItem v-for="m in active.messages" :key="m.id" :message-id="'tt-' + m.id">
            <MiMessage :label="m.who" class="tt__row">
              <template #avatar><MiAvatar :name="m.who" size="sm" :tone="m.who === me ? 'primary' : 'auto'" decorative /></template>
              <template #header><span class="tt__who">{{ m.who === me ? 'You' : m.who }} <time>{{ m.time }}</time></span></template>
              <MiBubble variant="ghost">{{ m.text }}</MiBubble>
            </MiMessage>
          </MiMessageScrollerItem>
          <MiMarker v-if="active.resolved" variant="separator" role="status">
            <template #icon><MiIcon name="check-circle" :size="14" /></template>
            Topic resolved
          </MiMarker>
        </MiMessageScroller>

        <form class="tt__composer" @submit.prevent="send">
          <MiInputGroup v-model="draft" :aria-label="'Reply in ' + active.title" :placeholder="active.resolved ? 'Replying reopens this topic' : 'Reply to this topic'">
            <template #trailing>
              <MiIconButton type="submit" label="Send reply" size="small" :disabled="!draft.trim()"><MiIcon name="arrow-up" :size="16" /></MiIconButton>
            </template>
          </MiInputGroup>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Msg { id: string, who: string, time: string, text: string }
interface Topic { id: string, title: string, resolved: boolean, unread: number, messages: Msg[] }

const me = 'Ines Moreau'
const filters = [{ value: 'open', label: 'Open' }, { value: 'resolved', label: 'Resolved' }]
const filter = ref<string | number | null>('open')

// Sample stream; swap for your messaging API.
const topics = ref<Topic[]>([
  {
    id: 'export', title: 'CSV export drops accented names', resolved: false, unread: 2,
    messages: [
      { id: 'e1', who: 'Karim Benali', time: '10:12', text: 'Three customers report “Zoë” exported as “ZoÃ«”. Looks like we write Latin-1 instead of UTF-8.' },
      { id: 'e2', who: 'Hannah Vogel', time: '10:20', text: 'Excel on Windows needs a BOM to detect UTF-8. Adding it fixes the file for everyone else too.' },
      { id: 'e3', who: 'Karim Benali', time: '10:24', text: 'Patch is up. I will ask the three accounts to retry once it ships at 14:00.' }
    ]
  },
  {
    id: 'dark', title: 'Dark mode chart colors too dim', resolved: false, unread: 0,
    messages: [
      { id: 'd1', who: 'Sofia Lindqvist', time: 'Yesterday', text: 'The green series sits at 2.6:1 contrast on the dark card. Hard to read in the weekly report.' },
      { id: 'd2', who: me, time: 'Yesterday', text: 'Let us lift the series lightness by one step in dark mode only and recheck.' }
    ]
  },
  {
    id: 'sso', title: 'SSO request from Halvorsen Logistics', resolved: false, unread: 1,
    messages: [
      { id: 's1', who: 'Mateo Rossi', time: '09:05', text: 'They need Azure AD SSO before renewing 120 seats in March. Is it on the Q1 plan?' }
    ]
  },
  {
    id: 'tz', title: 'Reminders fire an hour early after DST', resolved: true, unread: 0,
    messages: [
      { id: 't1', who: 'Hannah Vogel', time: 'Mon', text: 'We stored offsets instead of zone names. Migrated to IANA zones for all 8,400 reminders.' },
      { id: 't2', who: 'Karim Benali', time: 'Mon', text: 'Confirmed fixed on three test accounts in Sydney, Berlin and Denver.' }
    ]
  }
])

const activeId = ref('export')
const reading = ref(false)
const draft = ref('')

const visible = computed(() => topics.value.filter(t => t.resolved === (filter.value === 'resolved')))
const active = computed(() => topics.value.find(t => t.id === activeId.value) ?? topics.value[0]!)
const lastOf = (t: Topic) => t.messages[t.messages.length - 1] ?? { who: '' }
const people = (t: Topic) => new Set(t.messages.map(m => m.who)).size

function open(id: string) {
  activeId.value = id
  reading.value = true
  const t = topics.value.find(x => x.id === id)
  if (t) t.unread = 0
}

let seq = 0
function send() {
  const text = draft.value.trim()
  if (!text) return
  active.value.messages.push({ id: 'n' + ++seq, who: me, time: 'Now', text })
  active.value.resolved = false
  filter.value = 'open'
  draft.value = ''
}
</script>

<style scoped>
.tt { container-type: inline-size; height: 640px; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.tt__shell { display: grid; height: 100%; grid-template-columns: minmax(0, 1fr); }
.tt__main { display: none; }
.tt__shell.is-open .tt__side { display: none; }
.tt__shell.is-open .tt__main { display: flex; }
@container (min-width: 760px) {
  .tt__shell { grid-template-columns: 300px minmax(0, 1fr); }
  .tt__shell .tt__side, .tt__shell.is-open .tt__side { display: flex; }
  .tt__shell .tt__main { display: flex; }
  .tt__back { display: none; }
}

.tt__side { display: flex; flex-direction: column; min-height: 0; background: var(--mi-card); border-right: 1px solid var(--mi-sep); }
.tt__stream { display: grid; gap: 6px; padding: 18px 16px 14px; border-bottom: 1px solid var(--mi-sep); }
.tt__stream > :last-child { margin-top: 8px; }
.tt__topics { flex: 1; min-height: 0; overflow-y: auto; list-style: none; margin: 0; padding: 8px; display: grid; align-content: start; gap: 2px; }
.tt__topic { display: grid; gap: 3px; width: 100%; padding: 10px 12px; border: 0; border-radius: var(--mi-radius-m); background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; }
.tt__topic:hover { background: var(--mi-fill4); }
.tt__topic.is-on { background: var(--mi-p-tint); }
.tt__topic:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.tt__topic-top { display: flex; align-items: center; gap: 6px; min-width: 0; }
.tt__topic-name { flex: 1; min-width: 0; font-size: 14.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tt__topic.is-on .tt__topic-name { color: var(--mi-p-text); }
.tt__topic-meta { font-size: 12.5px; color: var(--mi-label3); }
.tt__ok { flex: none; color: var(--mi-green); }
.tt__empty { margin: 0; padding: 16px; font-size: 13px; color: var(--mi-label2); }

.tt__main { flex-direction: column; min-width: 0; min-height: 0; }
.tt__head { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--mi-sep); background: var(--mi-card); }
.tt__head-text { flex: 1; min-width: 0; }
.tt__log { flex: 1; min-height: 0; }
.tt__row { max-width: 46rem; }
.tt__who { font-weight: 600; color: var(--mi-label); }
.tt__who time { margin-left: 6px; font-weight: 400; color: var(--mi-label3); }
.tt__composer { padding: 12px 16px 16px; border-top: 1px solid var(--mi-sep); background: var(--mi-card); }
</style>

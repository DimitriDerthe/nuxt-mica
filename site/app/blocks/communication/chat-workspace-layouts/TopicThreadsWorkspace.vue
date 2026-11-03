<template>
  <section class="mi:@container mi:h-160 mi:font-mi mi:text-label mi:bg-page" aria-labelledby="tt-title">
    <div class="mi:group mi:grid mi:h-full mi:grid-cols-[minmax(0,_1fr)] mi:@[760px]:grid-cols-[300px_minmax(0,_1fr)]" :data-open="reading || undefined">
      <nav class="mi:group-data-[open]:hidden mi:@[760px]:flex mi:@[760px]:group-data-[open]:flex mi:flex mi:flex-col mi:min-h-0 mi:bg-card mi:border-r mi:border-r-sep" aria-labelledby="tt-title">
        <header class="mi:grid mi:gap-1.5 mi:pt-4.5 mi:px-4 mi:pb-3.5 mi:border-b mi:border-b-sep">
          <MiText id="tt-title" as="h2" variant="headline" weight="bold" :lines="1">#product-feedback</MiText>
          <MiText variant="caption" tone="label2">Every conversation is a topic. Resolve it when it is settled.</MiText>
          <MiSegmented v-model="filter" label="Topic status" :options="filters" class="mi:mt-2" />
        </header>
        <ul class="mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:[list-style:none] mi:m-0 mi:p-2 mi:grid mi:content-start mi:gap-0.5">
          <li v-for="t in visible" :key="t.id">
            <button
              type="button" class="mi:grid mi:gap-[3px] mi:w-full mi:py-2.5 mi:px-3 mi:[border:0] mi:rounded-md mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :class="t.id === activeId ? 'mi:bg-p-tint' : 'mi:bg-transparent mi:hover:bg-fill4'"
              :aria-current="t.id === activeId ? 'true' : undefined" @click="open(t.id)"
            >
              <span class="mi:flex mi:items-center mi:gap-1.5 mi:min-w-0">
                <MiIcon v-if="t.resolved" name="check-circle-fill" :size="15" class="mi:text-green" />
                <span class="mi:flex-1 mi:min-w-0 mi:text-[14.5px] mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap" :class="t.id === activeId ? 'mi:text-p-text' : ''">{{ t.title }}</span>
                <MiBadge v-if="t.unread" :count="t.unread" tone="primary" variant="solid" />
              </span>
              <span class="mi:text-[12.5px] mi:text-label3">{{ lastOf(t).who }} · {{ t.messages.length }} {{ t.messages.length === 1 ? 'message' : 'messages' }}</span>
            </button>
          </li>
        </ul>
        <p v-if="!visible.length" class="mi:m-0 mi:p-4 mi:text-[13px] mi:text-label2">No {{ filter }} topics in this stream.</p>
      </nav>

      <div class="mi:hidden mi:group-data-[open]:flex mi:@[760px]:flex mi:flex-col mi:min-w-0 mi:min-h-0">
        <header class="mi:flex mi:items-center mi:gap-3 mi:py-3 mi:px-4 mi:border-b mi:border-b-sep mi:bg-card">
          <MiIconButton class="mi:@[760px]:hidden!" label="Back to topics" variant="gray" size="regular" @click="reading = false">
            <MiIcon name="chevron-left" />
          </MiIconButton>
          <div class="mi:flex-1 mi:min-w-0">
            <MiText as="h3" variant="headline" weight="semibold" :lines="1">{{ active.title }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">Started by {{ active.messages[0]?.who }} · {{ people(active) }} people</MiText>
          </div>
          <MiButton :variant="active.resolved ? 'gray' : 'tinted'" size="small" @click="active.resolved = !active.resolved">
            <template #leading><MiIcon :name="active.resolved ? 'arrow-left' : 'check'" :size="15" /></template>
            {{ active.resolved ? 'Reopen' : 'Resolve' }}
          </MiButton>
        </header>

        <MiMessageScroller :key="activeId" class="mi:flex-1 mi:min-h-0" :label="'Messages in ' + active.title">
          <MiMessageScrollerItem v-for="m in active.messages" :key="m.id" :message-id="'tt-' + m.id">
            <MiMessage :label="m.who" class="mi:max-w-[46rem]!">
              <template #avatar><MiAvatar :name="m.who" size="sm" :tone="m.who === me ? 'primary' : 'auto'" decorative /></template>
              <template #header><span class="mi:font-semibold mi:text-label">{{ m.who === me ? 'You' : m.who }} <time class="mi:ml-1.5 mi:font-normal mi:text-label3">{{ m.time }}</time></span></template>
              <MiBubble variant="ghost">{{ m.text }}</MiBubble>
            </MiMessage>
          </MiMessageScrollerItem>
          <MiMarker v-if="active.resolved" variant="separator" role="status">
            <template #icon><MiIcon name="check-circle" :size="14" /></template>
            Topic resolved
          </MiMarker>
        </MiMessageScroller>

        <form class="mi:pt-3 mi:px-4 mi:pb-4 mi:border-t mi:border-t-sep mi:bg-card" @submit.prevent="send">
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

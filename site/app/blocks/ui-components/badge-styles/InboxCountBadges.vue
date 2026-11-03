<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="icb-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="icb-title" variant="title3" as="h2" weight="semibold">Support inbox</MiText>
        <MiText variant="footnote" tone="label2">Counts, caps, presence dots and label badges that stay in sync as you read</MiText>
      </div>
      <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2">
        <MiSegmented v-model="cap" label="Count cap" :options="caps" />
        <MiButton size="small" variant="gray" :disabled="!unreadTotal" @click="readAll">Mark all read</MiButton>
      </div>
    </header>

    <div class="mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:@[680px]:grid-cols-[220px_minmax(0,_1fr)]">
      <!-- Folders: count badges with a cap, a muted tone for drafts, and the agents' presence. -->
      <nav class="mi:grid mi:gap-0.5 mi:p-2 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-label="Folders">
        <button
          v-for="f in folders" :key="f.id" type="button" class="mi:[font:inherit] mi:text-[14px] mi:flex mi:items-center mi:gap-2.5 mi:min-h-9.5 mi:py-1.5 mi:px-2.5 mi:[border:0] mi:rounded-md mi:[background:none] mi:text-label mi:cursor-pointer mi:text-start mi:[&[aria-current='page']]:text-p-text mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :class="folder === f.id ? 'mi:bg-p-tint mi:font-semibold' : 'mi:hover:bg-fill4'" :aria-current="folder === f.id ? 'page' : undefined"
          @click="folder = f.id"
        >
          <MiIcon :name="f.icon" :size="17" />
          <span class="mi:flex-1">{{ f.label }}</span>
          <MiBadge :count="f.count" :max="Number(cap)" :tone="f.tone" :variant="f.id === 'drafts' ? 'tint' : 'solid'" :count-noun="f.noun" />
        </button>
        <MiSeparator />
        <MiText variant="caption" tone="label2" weight="semibold" class="mi:pt-2 mi:px-2.5 mi:pb-0.5">On shift</MiText>
        <div class="mi:flex mi:gap-2.5 mi:pt-1.5 mi:px-2.5 mi:pb-1">
          <MiBadge v-for="a in agents" :key="a.name" dot-only :tone="a.tone" placement="bottom-right" :dot-size="9" :aria-label="a.name + ', ' + a.state">
            <template #target><MiAvatar :name="a.name" size="sm" tone="auto" decorative /></template>
          </MiBadge>
        </div>
      </nav>

      <ul class="mi:grid mi:m-0 mi:p-1.5 mi:[list-style:none] mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" :aria-label="current.label">
        <li v-for="m in shown" :key="m.id" class="mi:not-first:border-t mi:not-first:border-t-sep">
          <button type="button" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:relative mi:flex mi:w-full mi:pt-3 mi:pr-3 mi:pb-3 mi:pl-6.5 mi:[border:0] mi:rounded-md mi:[background:none] mi:[font:inherit] mi:text-inherit mi:text-start mi:cursor-pointer mi:hover:[background:var(--mi-fill4)]" @click="read(m)">
            <MiBadge v-if="m.unread" dot-only :dot-size="8" tone="primary" aria-label="Unread" class="mi:absolute! mi:top-[19px] mi:left-2.5" />
            <span class="mi:grid mi:gap-[3px] mi:flex-1 mi:min-w-0">
              <span class="mi:flex mi:justify-between mi:gap-2">
                <span class="mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[15px]" :class="m.unread ? 'mi:font-bold mi:text-label' : 'mi:text-label2'">{{ m.from }}</span>
                <MiText as="span" variant="caption" tone="label3" tabular>{{ m.time }}</MiText>
              </span>
              <MiText as="span" variant="footnote" tone="label2" :lines="1">{{ m.subject }}</MiText>
              <span class="mi:flex mi:flex-wrap mi:gap-1 mi:mt-[3px] mi:empty:hidden">
                <MiBadge v-if="m.vip" tone="secondary" variant="solid" label="VIP" shape="pill" />
                <MiBadge v-for="l in m.labels" :key="l" v-bind="labelStyle[l]" :label="l" shape="pill" />
                <MiBadge v-if="m.external" variant="outline" tone="neutral" label="External" />
              </span>
            </span>
          </button>
        </li>
        <li v-if="!shown.length" class="mi:not-first:border-t mi:not-first:border-t-sep mi:py-5 mi:px-3 mi:text-center"><MiText variant="footnote" tone="label2">Drafts open in the composer.</MiText></li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Label = 'Billing' | 'Bug' | 'Urgent'
type FolderId = 'inbox' | 'mentions' | 'urgent' | 'drafts'
interface Mail { id: number, from: string, subject: string, time: string, unread: boolean, labels: Label[], vip?: boolean, external?: boolean, mention?: boolean }

const caps = [{ value: 9, label: '9+' }, { value: 99, label: '99+' }]
const cap = ref<string | number | null>(99)
const folder = ref<FolderId>('inbox')
// Unread mail outside the sample list, so the inbox count shows the cap at work.
const backlog = ref(118)

const mails = ref<Mail[]>([
  { id: 1, from: 'Harbor Freight Co.', subject: 'Invoice 4471 charged twice this month', time: '09:48', unread: true, labels: ['Billing', 'Urgent'], vip: true, external: true },
  { id: 2, from: 'Imani Brooks', subject: '@you can you confirm the refund window?', time: '09:31', unread: true, labels: ['Billing'], mention: true },
  { id: 3, from: 'Pinecrest Clinic', subject: 'Export to CSV drops the last column', time: '08:57', unread: true, labels: ['Bug'], external: true },
  { id: 4, from: 'Mateo Alvarez', subject: '@you repro steps for the login loop', time: '08:12', unread: false, labels: ['Bug', 'Urgent'], mention: true },
  { id: 5, from: 'Brightline Logistics', subject: 'Seat upgrade for 12 more drivers', time: 'Mon', unread: false, labels: [], vip: true, external: true }
])

const agents = [
  { name: 'Imani Brooks', state: 'available', tone: 'success' as const },
  { name: 'Mateo Alvarez', state: 'in a call', tone: 'danger' as const },
  { name: 'Yuki Sato', state: 'away', tone: 'warning' as const },
  { name: 'Femi Adeyemi', state: 'offline', tone: 'neutral' as const }
]
const labelStyle: Record<Label, { tone: 'warning' | 'danger' | 'primary', variant: 'tint' | 'solid' }> = {
  Billing: { tone: 'primary', variant: 'tint' }, Bug: { tone: 'warning', variant: 'tint' }, Urgent: { tone: 'danger', variant: 'solid' }
}

const unread = computed(() => mails.value.filter(m => m.unread))
const unreadTotal = computed(() => unread.value.length + backlog.value)
const folders = computed(() => [
  { id: 'inbox' as const, label: 'Inbox', icon: 'tray' as const, count: unreadTotal.value, tone: 'primary' as const, noun: 'unread' },
  { id: 'mentions' as const, label: 'Mentions', icon: 'chat' as const, count: unread.value.filter(m => m.mention).length, tone: 'secondary' as const, noun: 'unread mentions' },
  { id: 'urgent' as const, label: 'Urgent', icon: 'warning' as const, count: unread.value.filter(m => m.labels.includes('Urgent')).length, tone: 'danger' as const, noun: 'unread urgent' },
  { id: 'drafts' as const, label: 'Drafts', icon: 'pencil' as const, count: 3, tone: 'neutral' as const, noun: 'drafts' }
])
const current = computed(() => folders.value.find(f => f.id === folder.value)!)
const shown = computed(() => mails.value.filter(m =>
  folder.value === 'mentions' ? m.mention : folder.value === 'urgent' ? m.labels.includes('Urgent') : folder.value !== 'drafts'))

function read(m: Mail) { m.unread = false }
function readAll() {
  for (const m of mails.value) m.unread = false
  backlog.value = 0
}
</script>

<template>
  <section class="icb" aria-labelledby="icb-title">
    <header class="icb__head">
      <div>
        <MiText id="icb-title" variant="title3" as="h2" weight="semibold">Support inbox</MiText>
        <MiText variant="footnote" tone="label2">Counts, caps, presence dots and label badges that stay in sync as you read</MiText>
      </div>
      <div class="icb__head-actions">
        <MiSegmented v-model="cap" label="Count cap" :options="caps" />
        <MiButton size="small" variant="gray" :disabled="!unreadTotal" @click="readAll">Mark all read</MiButton>
      </div>
    </header>

    <div class="icb__layout">
      <!-- Folders: count badges with a cap, a muted tone for drafts, and the agents' presence. -->
      <nav class="icb__nav" aria-label="Folders">
        <button
          v-for="f in folders" :key="f.id" type="button" class="icb__folder" :aria-current="folder === f.id ? 'page' : undefined"
          @click="folder = f.id"
        >
          <MiIcon :name="f.icon" :size="17" />
          <span class="icb__folder-name">{{ f.label }}</span>
          <MiBadge :count="f.count" :max="Number(cap)" :tone="f.tone" :variant="f.id === 'drafts' ? 'tint' : 'solid'" :count-noun="f.noun" />
        </button>
        <MiSeparator />
        <MiText variant="caption" tone="label2" weight="semibold" class="icb__agents-title">On shift</MiText>
        <div class="icb__agents">
          <MiBadge v-for="a in agents" :key="a.name" dot-only :tone="a.tone" placement="bottom-right" :dot-size="9" :aria-label="a.name + ', ' + a.state">
            <template #target><MiAvatar :name="a.name" size="sm" tone="auto" decorative /></template>
          </MiBadge>
        </div>
      </nav>

      <ul class="icb__list" :aria-label="current.label">
        <li v-for="m in shown" :key="m.id">
          <button type="button" class="icb__msg" :class="{ 'is-unread': m.unread }" @click="read(m)">
            <MiBadge v-if="m.unread" dot-only :dot-size="8" tone="primary" aria-label="Unread" class="icb__unread" />
            <span class="icb__msg-main">
              <span class="icb__msg-top">
                <span class="icb__from">{{ m.from }}</span>
                <MiText as="span" variant="caption" tone="label3" tabular>{{ m.time }}</MiText>
              </span>
              <MiText as="span" variant="footnote" tone="label2" :lines="1">{{ m.subject }}</MiText>
              <span class="icb__tags">
                <MiBadge v-if="m.vip" tone="secondary" variant="solid" label="VIP" shape="pill" />
                <MiBadge v-for="l in m.labels" :key="l" v-bind="labelStyle[l]" :label="l" shape="pill" />
                <MiBadge v-if="m.external" variant="outline" tone="neutral" label="External" />
              </span>
            </span>
          </button>
        </li>
        <li v-if="!shown.length" class="icb__empty"><MiText variant="footnote" tone="label2">Drafts open in the composer.</MiText></li>
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

<style scoped>
.icb { container-type: inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.icb__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.icb__head-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }

.icb__layout { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); align-items: start; }
@container (min-width: 680px) { .icb__layout { grid-template-columns: 220px minmax(0, 1fr); } }

.icb__nav { display: grid; gap: 2px; padding: 8px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.icb__folder { display: flex; align-items: center; gap: 10px; min-height: 38px; padding: 6px 10px; border: 0; border-radius: var(--mi-radius-m); background: none; font: inherit; font-size: 14px; color: var(--mi-label); cursor: pointer; text-align: start; }
.icb__folder:hover { background: var(--mi-fill4); }
.icb__folder[aria-current="page"] { background: var(--mi-p-tint); color: var(--mi-p-text); font-weight: 600; }
.icb__folder:focus-visible, .icb__msg:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.icb__folder-name { flex: 1; }
.icb__agents-title { padding: 8px 10px 2px; }
.icb__agents { display: flex; gap: 10px; padding: 6px 10px 4px; }

.icb__list { display: grid; margin: 0; padding: 6px; list-style: none; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.icb__list > li + li { border-top: 1px solid var(--mi-sep); }
.icb__msg { position: relative; display: flex; width: 100%; padding: 12px 12px 12px 26px; border: 0; border-radius: var(--mi-radius-m); background: none; font: inherit; color: inherit; text-align: start; cursor: pointer; }
.icb__msg:hover { background: var(--mi-fill4); }
.icb__unread { position: absolute; top: 19px; left: 10px; }
.icb__msg-main { display: grid; gap: 3px; flex: 1; min-width: 0; }
.icb__msg-top { display: flex; justify-content: space-between; gap: 8px; }
.icb__from { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; color: var(--mi-label2); }
.icb__msg.is-unread .icb__from { font-weight: 700; color: var(--mi-label); }
.icb__tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px; }
.icb__tags:empty { display: none; }
.icb__empty { padding: 20px 12px; text-align: center; }
</style>

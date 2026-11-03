<template>
  <section class="fts mi:@container mi:font-mi mi:text-label" aria-labelledby="fts-title">
    <div class="fts__grid mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:@[820px]:grid-cols-[minmax(0,_1fr)_320px] mi:@[820px]:items-start">
      <div class="fts__files mi:grid mi:gap-3.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0">
        <header>
          <MiText id="fts-title" variant="title3" as="h2" weight="semibold">Send files</MiText>
          <MiText variant="footnote" tone="label2">Up to 2 GB per transfer, encrypted until it expires</MiText>
        </header>
        <!-- The zone only collects files; the list below owns them so samples and drops sit together. -->
        <MiFileUpload :model-value="[]" multiple label="Drop files or browse" hint="Any type · folders are zipped first" @update:model-value="add" />
        <ul class="fts__list mi:grid mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Files in this transfer">
          <li class="mi:[.fts__list_li&]:grid-cols-[40px_minmax(0,_1fr)_auto_auto] mi:[.fts__list_li&]:gap-2.5" v-for="f in files" :key="f.id">
            <span class="fts__ext mi:grid mi:place-items-center mi:h-7 mi:rounded-[6px] mi:text-[10px] mi:font-bold mi:tracking-[.03em] mi:bg-fill3 mi:text-label2" :data-kind="kind(f.name)">{{ ext(f.name) }}</span>
            <span class="fts__name mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[14px]">{{ f.name }}</span>
            <span class="fts__size mi:text-[12px] mi:text-label2 mi:tabular-nums">{{ size(f.bytes) }}</span>
            <MiIconButton class="mi:[.fts__list_li&]:grid-cols-[40px_minmax(0,_1fr)_auto_auto] mi:[.fts__list_li&]:gap-2.5" :label="`Remove ${f.name}`" variant="plain" size="small" @click="remove(f.id)"><MiIcon class="mi:[.fts__list_li&]:grid-cols-[40px_minmax(0,_1fr)_auto_auto] mi:[.fts__list_li&]:gap-2.5" name="close" :size="14" /></MiIconButton>
          </li>
        </ul>
        <MiMeter :value="total" :max="LIMIT" :label="`${size(total)} of 2 GB`" :hint="over ? `${size(total - LIMIT)} over the limit` : `${size(LIMIT - total)} left`" :color="over ? 'var(--mi-red)' : undefined" size="sm" />
      </div>

      <form v-if="!link" class="fts__send mi:grid mi:gap-3.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0" novalidate @submit.prevent="send">
        <MiSegmented v-model="mode" label="How to share" :options="[{ value: 'email', label: 'Email it' }, { value: 'link', label: 'Get a link' }]" />
        <MiField v-if="mode === 'email'" label="To" :error="tried && !to.length ? 'Add at least one recipient.' : tagError" :hint="`${to.length} of 20 · press Return after each`">
          <MiTagInput v-model="to" :max="20" :validate="isEmail" placeholder="name@studio.com" @reject="tagError = `“${$event}” is not a new email address.`" @add="tagError = ''" />
        </MiField>
        <MiField label="Message" hint="Optional">
          <MiTextarea v-model="note" :rows="3" :maxlength="500" placeholder="Final cut and stems for the spring spot." />
        </MiField>
        <div class="fts__row mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
          <MiText variant="footnote" weight="medium">Expires after</MiText>
          <MiSegmented v-model="days" label="Expires after" :options="[{ value: 1, label: '1 day' }, { value: 7, label: '7 days' }, { value: 30, label: '30 days' }]" />
        </div>
        <div class="fts__row mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
          <div>
            <MiText id="fts-notify" variant="footnote" weight="medium">Tell me when it is downloaded</MiText>
            <MiText variant="caption" tone="label2">One email per recipient, the first time</MiText>
          </div>
          <MiSwitch v-model="notify" size="compact" aria-labelledby="fts-notify" />
        </div>
        <MiButton type="submit" block :disabled="over || !files.length" :loading="busy">
          {{ over ? 'Remove files to fit 2 GB' : mode === 'email' ? `Send ${files.length} files` : 'Create link' }}
        </MiButton>
      </form>

      <div v-else class="fts__send fts__done mi:grid mi:gap-3.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0 mi:justify-items-center mi:text-center" role="status">
        <span class="fts__done-mark mi:grid mi:place-items-center mi:w-12 mi:h-12 mi:rounded-[50%] mi:bg-green mi:text-card"><MiIcon name="check" :size="22" :weight="2.6" /></span>
        <MiText variant="headline" as="h3">{{ mode === 'email' ? `Sent to ${to.length} ${to.length > 1 ? 'people' : 'person'}` : 'Your link is ready' }}</MiText>
        <div class="fts__link mi:flex mi:items-center mi:gap-2 mi:max-w-full mi:pt-1.5 mi:pr-1.5 mi:pb-1.5 mi:pl-3 mi:rounded-md mi:bg-fill4">
          <code class="mi:[.fts__link_code&]:text-ellipsis">{{ link }}</code>
          <MiCopyButton class="mi:[.fts__link_code&]:text-ellipsis" :value="link" label="Copy link" />
        </div>
        <MiText variant="caption" tone="label2">{{ files.length }} files · {{ size(total) }} · expires in {{ days }} {{ days === 1 ? 'day' : 'days' }}</MiText>
        <MiButton variant="gray" @click="link = ''">New transfer</MiButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

interface Item { id: number, name: string, bytes: number }
const LIMIT = 2_000_000_000

// Sample transfer; dropped files are appended.
const files = ref<Item[]>([
  { id: 1, name: 'spring-spot_final-cut_v7.mov', bytes: 1_240_000_000 },
  { id: 2, name: 'stems_dialogue-music-fx.zip', bytes: 386_000_000 },
  { id: 3, name: 'subtitles_en-fr-de.srt', bytes: 48_000 },
  { id: 4, name: 'delivery-notes.pdf', bytes: 2_100_000 }
])
const mode = ref<string | number | null>('email')
const to = ref<string[]>(['marta@northlight.film'])
const note = ref('')
const days = ref<string | number | null>(7)
const notify = ref(true)
const tried = ref(false)
const tagError = ref('')
const busy = ref(false)
const link = ref('')
let nextId = 5
let timer: ReturnType<typeof setTimeout> | undefined

const total = computed(() => files.value.reduce((n, f) => n + f.bytes, 0))
const over = computed(() => total.value > LIMIT)

function add(list: File[]) { files.value.push(...list.map(f => ({ id: nextId++, name: f.name, bytes: f.size }))) }
function remove(id: number) { files.value = files.value.filter(f => f.id !== id) }
function send() {
  tried.value = true
  if (over.value || !files.value.length || (mode.value === 'email' && !to.value.length) || busy.value) return
  busy.value = true
  timer = setTimeout(() => { busy.value = false; link.value = 'drop.fernhill.co/t/8KQ2-mzP' }, 900)
}
onBeforeUnmount(() => clearTimeout(timer))

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const ext = (n: string) => (n.split('.').pop() ?? '').slice(0, 4).toUpperCase()
const kind = (n: string) => (/\.(mov|mp4)$/i.test(n) ? 'video' : /\.(zip|rar)$/i.test(n) ? 'archive' : 'doc')
function size(b: number) {
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  while (b >= 1000 && i < units.length - 1) { b /= 1000; i++ }
  return `${b.toFixed(i > 1 ? 1 : 0)} ${units[i]}`
}
</script>

<style scoped>
.fts__list li { display: grid; align-items: center; padding: 8px 0; }
.fts__list li + li { border-top: 1px solid var(--mi-sep); }
.fts__ext[data-kind="video"] { background: var(--mi-p-tint); color: var(--mi-p-text); }
.fts__ext[data-kind="archive"] { background: color-mix(in srgb, var(--mi-orange) 16%, transparent); color: var(--mi-orange-t); }
.fts__row > div { flex: 1; min-width: 160px; }
.fts__link code { overflow: hidden; white-space: nowrap; font-size: 13px; }
</style>

<template>
  <section class="fts" aria-labelledby="fts-title">
    <div class="fts__grid">
      <div class="fts__files">
        <header>
          <MiText id="fts-title" variant="title3" as="h2" weight="semibold">Send files</MiText>
          <MiText variant="footnote" tone="label2">Up to 2 GB per transfer, encrypted until it expires</MiText>
        </header>
        <!-- The zone only collects files; the list below owns them so samples and drops sit together. -->
        <MiFileUpload :model-value="[]" multiple label="Drop files or browse" hint="Any type · folders are zipped first" @update:model-value="add" />
        <ul class="fts__list" aria-label="Files in this transfer">
          <li v-for="f in files" :key="f.id">
            <span class="fts__ext" :data-kind="kind(f.name)">{{ ext(f.name) }}</span>
            <span class="fts__name">{{ f.name }}</span>
            <span class="fts__size">{{ size(f.bytes) }}</span>
            <MiIconButton :label="`Remove ${f.name}`" variant="plain" size="small" @click="remove(f.id)"><MiIcon name="close" :size="14" /></MiIconButton>
          </li>
        </ul>
        <MiMeter :value="total" :max="LIMIT" :label="`${size(total)} of 2 GB`" :hint="over ? `${size(total - LIMIT)} over the limit` : `${size(LIMIT - total)} left`" :color="over ? 'var(--mi-red)' : undefined" size="sm" />
      </div>

      <form v-if="!link" class="fts__send" novalidate @submit.prevent="send">
        <MiSegmented v-model="mode" label="How to share" :options="[{ value: 'email', label: 'Email it' }, { value: 'link', label: 'Get a link' }]" />
        <MiField v-if="mode === 'email'" label="To" :error="tried && !to.length ? 'Add at least one recipient.' : tagError" :hint="`${to.length} of 20 · press Return after each`">
          <MiTagInput v-model="to" :max="20" :validate="isEmail" placeholder="name@studio.com" @reject="tagError = `“${$event}” is not a new email address.`" @add="tagError = ''" />
        </MiField>
        <MiField label="Message" hint="Optional">
          <MiTextarea v-model="note" :rows="3" :maxlength="500" placeholder="Final cut and stems for the spring spot." />
        </MiField>
        <div class="fts__row">
          <MiText variant="footnote" weight="medium">Expires after</MiText>
          <MiSegmented v-model="days" label="Expires after" :options="[{ value: 1, label: '1 day' }, { value: 7, label: '7 days' }, { value: 30, label: '30 days' }]" />
        </div>
        <div class="fts__row">
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

      <div v-else class="fts__send fts__done" role="status">
        <span class="fts__done-mark"><MiIcon name="check" :size="22" :weight="2.6" /></span>
        <MiText variant="headline" as="h3">{{ mode === 'email' ? `Sent to ${to.length} ${to.length > 1 ? 'people' : 'person'}` : 'Your link is ready' }}</MiText>
        <div class="fts__link">
          <code>{{ link }}</code>
          <MiCopyButton :value="link" label="Copy link" />
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
.fts { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.fts__grid { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 820px) { .fts__grid { grid-template-columns: minmax(0, 1fr) 320px; align-items: start; } }
.fts__files, .fts__send { display: grid; gap: 14px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }

.fts__list { display: grid; margin: 0; padding: 0; list-style: none; }
.fts__list li { display: grid; grid-template-columns: 40px minmax(0, 1fr) auto auto; align-items: center; gap: 10px; padding: 8px 0; }
.fts__list li + li { border-top: 1px solid var(--mi-sep); }
.fts__ext { display: grid; place-items: center; height: 28px; border-radius: 6px; font-size: 10px; font-weight: 700; letter-spacing: .03em; background: var(--mi-fill3); color: var(--mi-label2); }
.fts__ext[data-kind="video"] { background: var(--mi-p-tint); color: var(--mi-p-text); }
.fts__ext[data-kind="archive"] { background: color-mix(in srgb, var(--mi-orange) 16%, transparent); color: var(--mi-orange-t); }
.fts__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; }
.fts__size { font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }

.fts__row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.fts__row > div { flex: 1; min-width: 160px; }
.fts__done { justify-items: center; text-align: center; }
.fts__done-mark { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%; background: var(--mi-green); color: var(--mi-card); }
.fts__link { display: flex; align-items: center; gap: 8px; max-width: 100%; padding: 6px 6px 6px 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.fts__link code { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
</style>

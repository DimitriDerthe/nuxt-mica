<template>
  <div class="dns">
    <section class="dns__card" aria-labelledby="dns-title">
      <header class="dns__head">
        <div>
          <MiText id="dns-title" variant="title3" as="h2" weight="semibold">DNS records</MiText>
          <MiText variant="footnote" tone="label2">northwind.studio · changes propagate in about 5 minutes</MiText>
        </div>
        <MiBadge tone="success" dot label="Nameservers verified" />
      </header>

      <!-- Each field carries its own compact select: record type before the name, TTL after the value. -->
      <form class="dns__form" novalidate @submit.prevent="add">
        <MiField label="Name" hint="Leave empty for the root, or type a subdomain">
          <MiInputGroup v-model="name" placeholder="www">
            <template #inline-start>
              <select v-model="type" class="dns__pick" aria-label="Record type">
                <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
              </select>
            </template>
            <template #inline-end><span class="dns__zone">.northwind.studio</span></template>
          </MiInputGroup>
        </MiField>

        <MiField label="Value" :hint="rule.hint" :error="showError ? rule.error : undefined">
          <MiInputGroup v-model="value" :placeholder="rule.placeholder">
            <template #inline-end>
              <select v-model.number="ttl" class="dns__pick dns__pick--end" aria-label="Time to live">
                <option v-for="t in ttls" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </template>
          </MiInputGroup>
        </MiField>

        <MiButton type="submit" class="dns__add">
          <template #leading><MiIcon name="plus" :size="16" /></template>
          Add record
        </MiButton>
      </form>

      <p class="dns__preview" aria-live="polite">
        <span class="dns__preview-label">Zone line</span>
        <code>{{ host }}. {{ ttl }} IN {{ type }} {{ value.trim() || '…' }}</code>
      </p>

      <ul class="dns__list" aria-label="Current records">
        <li v-for="r in records" :key="r.id" class="dns__row">
          <MiBadge variant="outline" tone="neutral" :label="r.type" class="dns__type" />
          <div class="dns__text">
            <MiText variant="subheadline" weight="medium" :lines="1">{{ r.name || '@' }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1" class="dns__mono">{{ r.value }}</MiText>
          </div>
          <MiText as="span" variant="caption" tone="label3" tabular class="dns__ttl">{{ ttlLabel(r.ttl) }}</MiText>
          <MiIconButton :label="`Delete ${r.type} record ${r.name || '@'}`" variant="plain" size="small" @click="remove(r.id)">
            <MiIcon name="trash" :size="16" />
          </MiIconButton>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type RecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT'
interface DnsRecord { id: number, type: RecordType, name: string, value: string, ttl: number }
interface Rule { hint: string, error: string, placeholder: string, test: (v: string) => boolean }

const types: RecordType[] = ['A', 'AAAA', 'CNAME', 'MX', 'TXT']
const ttls = [{ value: 300, label: '5 min' }, { value: 3600, label: '1 h' }, { value: 14400, label: '4 h' }, { value: 86400, label: '1 day' }]

const hostname = /^[a-z0-9-]+(\.[a-z0-9-]+)+\.?$/i
const rules: Record<RecordType, Rule> = {
  A: { hint: 'An IPv4 address', error: 'Enter four numbers from 0 to 255, like 76.76.21.21', placeholder: '76.76.21.21', test: v => /^(\d{1,3}\.){3}\d{1,3}$/.test(v) && v.split('.').every(n => Number(n) <= 255) },
  AAAA: { hint: 'An IPv6 address', error: 'Enter an IPv6 address, like 2606:4700::6810', placeholder: '2606:4700::6810', test: v => /^[0-9a-f:]+$/i.test(v) && v.includes(':') },
  CNAME: { hint: 'The hostname this name points to', error: 'Enter a hostname, like cname.vercel-dns.com', placeholder: 'cname.vercel-dns.com', test: v => hostname.test(v) },
  MX: { hint: 'Priority, a space, then the mail server', error: 'Use the form "10 mail.example.com"', placeholder: '10 aspmx.l.google.com', test: v => /^\d{1,5}\s+[a-z0-9.-]+$/i.test(v) },
  TXT: { hint: 'Free text, up to 255 characters', error: 'TXT values need 1 to 255 characters', placeholder: 'v=spf1 include:_spf.google.com ~all', test: v => v.length > 0 && v.length <= 255 }
}

const type = ref<RecordType>('CNAME')
const name = ref('docs')
const value = ref('')
const ttl = ref(3600)
const tried = ref(false)

const records = ref<DnsRecord[]>([
  { id: 1, type: 'A', name: '', value: '76.76.21.21', ttl: 3600 },
  { id: 2, type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', ttl: 3600 },
  { id: 3, type: 'MX', name: '', value: '1 aspmx.l.google.com', ttl: 86400 },
  { id: 4, type: 'TXT', name: '', value: 'v=spf1 include:_spf.google.com ~all', ttl: 14400 }
])

const rule = computed(() => rules[type.value])
const valid = computed(() => rule.value.test(value.value.trim()))
const showError = computed(() => tried.value && !valid.value)
const host = computed(() => (name.value.trim() ? `${name.value.trim()}.` : '') + 'northwind.studio')

function ttlLabel(seconds: number): string {
  return ttls.find(t => t.value === seconds)?.label ?? `${seconds} s`
}

let nextId = 5
function add(): void {
  tried.value = true
  if (!valid.value) return
  records.value.push({ id: nextId++, type: type.value, name: name.value.trim(), value: value.value.trim(), ttl: ttl.value })
  value.value = ''
  name.value = ''
  tried.value = false
}

function remove(id: number): void {
  records.value = records.value.filter(r => r.id !== id)
}
</script>

<style scoped>
.dns { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.dns__card { display: grid; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.dns__head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 10px 16px; }

.dns__form { display: grid; gap: 14px; }
.dns__add { justify-self: start; }

/* Bare native selects that sit inside the field surface, separated by a hairline. */
.dns__pick {
  height: 100%; padding: 0 8px 0 2px; border: 0; border-right: 1px solid var(--mi-sep); background: none;
  color: var(--mi-label); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; border-radius: var(--mi-radius-s);
}
.dns__pick--end { padding: 0 2px 0 8px; border-right: 0; border-left: 1px solid var(--mi-sep); font-weight: 500; color: var(--mi-label2); }
.dns__pick:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.dns__zone { font-size: 13px; color: var(--mi-label3); white-space: nowrap; }

.dns__preview { display: grid; gap: 4px; margin: 0; padding: 12px 14px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.dns__preview-label { font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--mi-label3); }
.dns__preview code, .dns__mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.dns__preview code { font-size: 13px; color: var(--mi-p-text); overflow-wrap: anywhere; }

.dns__list { display: grid; margin: 0; padding: 0; list-style: none; }
.dns__row { display: grid; grid-template-columns: 64px minmax(0, 1fr) auto; align-items: center; gap: 4px 12px; padding: 10px 0; border-top: 1px solid var(--mi-sep); }
.dns__type { justify-self: start; }
.dns__text { min-width: 0; }
.dns__ttl { display: none; }

@container (min-width: 720px) {
  .dns__card { padding: 24px 28px; }
  .dns__form { grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr) auto; align-items: start; }
  .dns__add { margin-top: 26px; }
  .dns__row { grid-template-columns: 72px minmax(0, 1fr) 64px auto; }
  .dns__ttl { display: block; text-align: end; }
}
</style>

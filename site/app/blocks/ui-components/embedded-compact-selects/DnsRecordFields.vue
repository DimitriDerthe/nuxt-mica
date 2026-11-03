<template>
  <div class="mi:@container mi:font-mi mi:text-label">
    <section class="mi:grid mi:gap-4.5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[720px]:py-6 mi:@[720px]:px-7" aria-labelledby="dns-title">
      <header class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-y-2.5 mi:gap-x-4">
        <div>
          <MiText id="dns-title" variant="title3" as="h2" weight="semibold">DNS records</MiText>
          <MiText variant="footnote" tone="label2">northwind.studio · changes propagate in about 5 minutes</MiText>
        </div>
        <MiBadge tone="success" dot label="Nameservers verified" />
      </header>

      <!-- Each field carries its own compact select: record type before the name, TTL after the value. -->
      <form class="mi:grid mi:gap-3.5 mi:@[720px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1.3fr)_auto] mi:@[720px]:items-start" novalidate @submit.prevent="add">
        <MiField label="Name" hint="Leave empty for the root, or type a subdomain">
          <MiInputGroup v-model="name" placeholder="www">
            <template #inline-start>
              <select v-model="type" class="mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-0.5 mi:[border:0] mi:border-r mi:border-r-sep mi:[font:inherit] mi:text-[13px] mi:font-semibold mi:h-full mi:[background:none] mi:text-label mi:cursor-pointer mi:rounded-sm mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" aria-label="Record type">
                <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
              </select>
            </template>
            <template #inline-end><span class="mi:text-[13px] mi:text-label3 mi:whitespace-nowrap">.northwind.studio</span></template>
          </MiInputGroup>
        </MiField>

        <MiField label="Value" :hint="rule.hint" :error="showError ? rule.error : undefined">
          <MiInputGroup v-model="value" :placeholder="rule.placeholder">
            <template #inline-end>
              <select v-model.number="ttl" class="mi:pt-0 mi:pr-0.5 mi:pb-0 mi:pl-2 mi:[border:0] mi:border-l mi:border-l-sep mi:[font:inherit] mi:text-[13px] mi:font-medium mi:h-full mi:[background:none] mi:cursor-pointer mi:rounded-sm mi:text-label2 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" aria-label="Time to live">
                <option v-for="t in ttls" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </template>
          </MiInputGroup>
        </MiField>

        <MiButton type="submit" class="mi:justify-self-start mi:@[720px]:mt-6.5">
          <template #leading><MiIcon name="plus" :size="16" /></template>
          Add record
        </MiButton>
      </form>

      <p class="mi:grid mi:gap-1 mi:m-0 mi:py-3 mi:px-3.5 mi:rounded-md mi:[background:var(--mi-fill4)]" aria-live="polite">
        <span class="mi:text-[11px] mi:font-semibold mi:tracking-[.04em] mi:uppercase mi:text-label3">Zone line</span>
        <code class="mi:font-[ui-monospace,SFMono-Regular,Menlo,monospace] mi:text-[13px] mi:text-p-text mi:wrap-anywhere">{{ host }}. {{ ttl }} IN {{ type }} {{ value.trim() || '…' }}</code>
      </p>

      <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Current records">
        <li v-for="r in records" :key="r.id" class="mi:grid mi:grid-cols-[64px_minmax(0,_1fr)_auto] mi:items-center mi:gap-y-1 mi:gap-x-3 mi:py-2.5 mi:px-0 mi:border-t mi:border-t-sep mi:@[720px]:grid-cols-[72px_minmax(0,_1fr)_64px_auto]">
          <MiBadge variant="outline" tone="neutral" :label="r.type" class="mi:justify-self-start" />
          <div class="mi:min-w-0">
            <MiText variant="subheadline" weight="medium" :lines="1">{{ r.name || '@' }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1" class="mi:font-[ui-monospace,SFMono-Regular,Menlo,monospace]!">{{ r.value }}</MiText>
          </div>
          <MiText as="span" variant="caption" tone="label3" tabular class="mi:hidden mi:@[720px]:block mi:@[720px]:text-end">{{ ttlLabel(r.ttl) }}</MiText>
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

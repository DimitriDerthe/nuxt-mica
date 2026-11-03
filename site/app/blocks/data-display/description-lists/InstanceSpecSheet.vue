<template>
  <section class="iss mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="iss-title">
    <header class="iss__head mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3">
      <div class="iss__id mi:flex mi:items-center mi:gap-3 mi:min-w-0">
        <span class="iss__glyph mi:grid mi:place-items-center mi:flex-[none] mi:w-10 mi:h-10 mi:rounded-md mi:bg-p-tint mi:text-p-text" aria-hidden="true"><MiIcon name="desktop" :size="20" /></span>
        <div>
          <MiText id="iss-title" variant="title3" as="h2" weight="semibold">api-prod-3</MiText>
          <MiText variant="footnote" tone="label2">General purpose · Paris 2 · created 14 Mar 2024</MiText>
        </div>
      </div>
      <div class="iss__actions mi:flex mi:flex-wrap mi:items-center mi:gap-2.5">
        <MiBadge tone="success" label="Running" dot />
        <MiCopyButton :get-value="toYaml" label="Copy as YAML" copied-label="YAML copied" variant="outline" />
      </div>
    </header>

    <div class="iss__search mi:grid mi:gap-1.5 mi:@[640px]:grid-cols-[minmax(0,_360px)_auto] mi:@[640px]:items-center mi:@[640px]:justify-between">
      <MiSearch v-model="query" size="compact" placeholder="Find a spec, e.g. IPv6 or backup" aria-label="Find a spec" />
      <MiText variant="caption" tone="label2" aria-live="polite">{{ query ? matchCount + ' matching specs' : total + ' specs' }}</MiText>
    </div>

    <div v-if="matchCount" class="iss__grid mi:grid mi:gap-3 mi:@[640px]:grid-cols-2 mi:@[1000px]:grid-cols-3">
      <section v-for="g in groups" :key="g.id" class="iss__card mi:grid mi:content-start mi:gap-2.5 mi:py-4 mi:px-4.5 mi:rounded-lg mi:bg-card mi:shadow-1 mi:min-w-0" :aria-labelledby="'iss-' + g.id">
        <div class="iss__card-head mi:flex mi:items-center mi:gap-2 mi:text-label2">
          <MiIcon :name="g.icon" :size="16" />
          <MiText :id="'iss-' + g.id" variant="headline" as="h3">{{ g.title }}</MiText>
        </div>
        <MiDetails :items="g.items" label-width="132px">
          <template #value="{ item }">
            <span class="iss__value mi:inline-flex mi:flex-wrap mi:items-center mi:gap-1 mi:min-w-0 mi:wrap-anywhere">
              <code v-if="COPYABLE.has(item.key)">{{ item.value }}</code>
              <template v-else>{{ item.value }}</template>
              <MiCopyButton v-if="COPYABLE.has(item.key)" :value="String(item.value)" icon-only variant="ghost" :label="'Copy ' + item.label" />
            </span>
          </template>
        </MiDetails>
      </section>
    </div>
    <MiText v-else variant="footnote" tone="label2" class="iss__empty mi:p-7 mi:text-center mi:rounded-lg mi:bg-card">Nothing matches “{{ query }}”.</MiText>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Spec { key: string, label: string, value: string }
interface Group { id: string, title: string, icon: 'settings' | 'globe' | 'archive', items: Spec[] }

// Values worth pasting into a terminal get monospace and a copy button.
const COPYABLE = new Set(['id', 'ipv4', 'ipv6', 'image'])

const GROUPS: Group[] = [
  {
    id: 'compute', title: 'Compute', icon: 'settings', items: [
      { key: 'id', label: 'Instance ID', value: 'i-0a7f3c91e2b4' },
      { key: 'type', label: 'Type', value: 'GP1-M · 8 vCPU' },
      { key: 'memory', label: 'Memory', value: '32 GB' },
      { key: 'image', label: 'Image', value: 'ubuntu-24.04-lts' },
      { key: 'cost', label: 'Monthly cost', value: '€118.40' }
    ]
  },
  {
    id: 'network', title: 'Network', icon: 'globe', items: [
      { key: 'ipv4', label: 'Public IPv4', value: '51.158.64.12' },
      { key: 'ipv6', label: 'Public IPv6', value: '2001:bc8:710:1a2::1' },
      { key: 'vpc', label: 'Private network', value: 'pn-backend (10.4.0.0/20)' },
      { key: 'bandwidth', label: 'Bandwidth', value: '1.5 Gbit/s' },
      { key: 'firewall', label: 'Security group', value: 'web-https-only' }
    ]
  },
  {
    id: 'storage', title: 'Storage', icon: 'archive', items: [
      { key: 'root', label: 'Root volume', value: '150 GB SSD' },
      { key: 'data', label: 'Data volume', value: '500 GB block, 5K IOPS' },
      { key: 'backup', label: 'Backups', value: 'Daily at 02:00, kept 14 days' },
      { key: 'snapshot', label: 'Last snapshot', value: 'Today, 02:04' }
    ]
  }
]

const query = ref('')
const total = GROUPS.reduce((n, g) => n + g.items.length, 0)

const groups = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return GROUPS
  return GROUPS.map(g => ({ ...g, items: g.items.filter(i => (i.label + ' ' + i.value).toLowerCase().includes(q)) })).filter(g => g.items.length)
})
const matchCount = computed(() => groups.value.reduce((n, g) => n + g.items.length, 0))

// Built at click time so it always reflects the full sheet, not the filtered view.
const toYaml = () => ['name: api-prod-3', ...GROUPS.flatMap(g => [`${g.id}:`, ...g.items.map(i => `  ${i.key}: "${i.value}"`)])].join('\n')
</script>

<style scoped>
.iss__card-head :deep(h3) { color: var(--mi-label); }
.iss__value code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
</style>

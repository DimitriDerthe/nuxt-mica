<template>
  <section class="iss" aria-labelledby="iss-title">
    <header class="iss__head">
      <div class="iss__id">
        <span class="iss__glyph" aria-hidden="true"><MiIcon name="desktop" :size="20" /></span>
        <div>
          <MiText id="iss-title" variant="title3" as="h2" weight="semibold">api-prod-3</MiText>
          <MiText variant="footnote" tone="label2">General purpose · Paris 2 · created 14 Mar 2024</MiText>
        </div>
      </div>
      <div class="iss__actions">
        <MiBadge tone="success" label="Running" dot />
        <MiCopyButton :get-value="toYaml" label="Copy as YAML" copied-label="YAML copied" variant="outline" />
      </div>
    </header>

    <div class="iss__search">
      <MiSearch v-model="query" size="compact" placeholder="Find a spec, e.g. IPv6 or backup" aria-label="Find a spec" />
      <MiText variant="caption" tone="label2" aria-live="polite">{{ query ? matchCount + ' matching specs' : total + ' specs' }}</MiText>
    </div>

    <div v-if="matchCount" class="iss__grid">
      <section v-for="g in groups" :key="g.id" class="iss__card" :aria-labelledby="'iss-' + g.id">
        <div class="iss__card-head">
          <MiIcon :name="g.icon" :size="16" />
          <MiText :id="'iss-' + g.id" variant="headline" as="h3">{{ g.title }}</MiText>
        </div>
        <MiDetails :items="g.items" label-width="132px">
          <template #value="{ item }">
            <span class="iss__value">
              <code v-if="COPYABLE.has(item.key)">{{ item.value }}</code>
              <template v-else>{{ item.value }}</template>
              <MiCopyButton v-if="COPYABLE.has(item.key)" :value="String(item.value)" icon-only variant="ghost" :label="'Copy ' + item.label" />
            </span>
          </template>
        </MiDetails>
      </section>
    </div>
    <MiText v-else variant="footnote" tone="label2" class="iss__empty">Nothing matches “{{ query }}”.</MiText>
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
.iss { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.iss__head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
.iss__id { display: flex; align-items: center; gap: 12px; min-width: 0; }
.iss__glyph { display: grid; place-items: center; flex: none; width: 40px; height: 40px; border-radius: var(--mi-radius-m); background: var(--mi-p-tint); color: var(--mi-p-text); }
.iss__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.iss__search { display: grid; gap: 6px; }
.iss__grid { display: grid; gap: 12px; }
.iss__card { display: grid; align-content: start; gap: 10px; padding: 16px 18px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.iss__card-head { display: flex; align-items: center; gap: 8px; color: var(--mi-label2); }
.iss__card-head :deep(h3) { color: var(--mi-label); }
.iss__value { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 4px; min-width: 0; overflow-wrap: anywhere; }
.iss__value code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
.iss__empty { padding: 28px; text-align: center; border-radius: var(--mi-radius-l); background: var(--mi-card); }

@container (min-width: 640px) {
  .iss__search { grid-template-columns: minmax(0, 360px) auto; align-items: center; justify-content: space-between; }
  .iss__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@container (min-width: 1000px) {
  .iss__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>

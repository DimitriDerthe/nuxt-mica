<template>
  <section class="aky mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="aky-title">
    <header class="aky__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="aky-title" variant="title3" as="h2" weight="semibold">API keys</MiText>
        <MiText variant="footnote" tone="label2" aria-live="polite">{{ activeCount }} active · {{ attention }} need attention</MiText>
      </div>
      <div class="aky__tools mi:flex mi:flex-wrap mi:items-center mi:gap-2">
        <MiSegmented v-model="env" label="Environment" :options="envs" />
        <MiButton size="small">
          <template #leading><MiIcon name="plus" :size="14" /></template>
          Create key
        </MiButton>
      </div>
    </header>

    <div class="aky__table mi:hidden mi:min-w-0 mi:overflow-x-auto mi:@[820px]:block">
      <MiTable :columns="columns" :rows="rows" caption="API keys" density="relaxed" :zebra="false" empty-text="No key in this environment.">
        <template #cell-name="{ row }">
          <span class="aky__name mi:grid mi:gap-0.5 mi:min-w-0 mi:py-1 mi:px-0" :class="{ 'is-revoked': k(row).revoked }">
            <span class="aky__title mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:font-semibold mi:[.is-revoked_&]:text-label3 mi:[.is-revoked_&]:[text-decoration:line-through]">{{ k(row).name }}<MiBadge v-if="k(row).env === 'test'" tone="neutral" variant="outline" label="Test" /></span>
            <span class="aky__key mi:inline-flex mi:items-center mi:gap-0.5"><code class="mi:[.is-revoked_.aky__key_code&]:[text-decoration:line-through]">{{ k(row).prefix }}••••{{ k(row).last4 }}</code><MiCopyButton class="mi:[.is-revoked_.aky__key_code&]:[text-decoration:line-through]" :value="k(row).id" icon-only variant="ghost" :label="'Copy key ID of ' + k(row).name" /></span>
          </span>
        </template>
        <template #cell-scopes="{ row }">
          <span class="aky__scopes mi:flex mi:flex-wrap mi:gap-1">
            <span v-for="s in k(row).scopes" :key="s" class="aky__scope mi:py-0.5 mi:px-1.5 mi:rounded-[6px] mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[11px] mi:text-label2 mi:bg-fill2 mi:[&.is-write]:text-orange-t mi:[&.is-write]:[background:color-mix(in_srgb,_var(--mi-orange)_13%,_transparent)]" :class="{ 'is-write': s.endsWith(':write') }">{{ s }}</span>
          </span>
        </template>
        <template #cell-used="{ row }">
          <span class="aky__used mi:inline-flex mi:items-center mi:gap-2">
            <MiSparkline v-if="!k(row).revoked" :values="k(row).spark" :width="64" :height="22" :animate="false" :dot="false" />
            <span class="aky__used-text mi:text-[13px] mi:whitespace-nowrap mi:[&.is-stale]:text-orange-t mi:[&.is-stale]:font-semibold" :class="{ 'is-stale': k(row).idleDays > 30 }">{{ k(row).lastUsed }}</span>
          </span>
        </template>
        <template #cell-expires="{ row }">
          <span class="aky__exp mi:grid mi:gap-1">
            <span class="aky__exp-text" :class="'is-' + expiry(k(row)).state">{{ expiry(k(row)).label }}</span>
            <span v-if="k(row).expiresIn !== null && !k(row).revoked" class="aky__exp-bar mi:block mi:w-25 mi:h-1 mi:rounded-[2px] mi:bg-fill3 mi:overflow-hidden"><i class="mi:[.aky__exp-bar_&]:block mi:[.aky__exp-bar_&]:h-full mi:[.aky__exp-bar_&]:origin-left mi:[.aky__exp-bar_&]:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :class="'is-' + expiry(k(row)).state" :style="{ transform: `scaleX(${expiry(k(row)).left})` }" /></span>
          </span>
        </template>
        <template #cell-actions="{ row }">
          <span class="aky__actions mi:inline-flex mi:flex-nowrap mi:whitespace-nowrap mi:items-center mi:[justify-content:flex-end] mi:gap-1.5">
            <template v-if="k(row).revoked"><MiText as="span" variant="caption" tone="label2">Revoked</MiText></template>
            <template v-else-if="confirming === k(row).id">
              <MiText as="span" variant="caption" weight="semibold">Revoke?</MiText>
              <MiButton size="mini" variant="destructive" @click="revoke(k(row).id)">Revoke</MiButton>
              <MiButton size="mini" variant="gray" @click="confirming = null">Keep</MiButton>
            </template>
            <template v-else>
              <MiButton size="mini" variant="gray" @click="rotate(k(row).id)">{{ rotated.has(k(row).id) ? 'Rotated' : 'Rotate' }}</MiButton>
              <MiIconButton size="small" variant="plain" :label="'Revoke ' + k(row).name" @click="confirming = k(row).id"><MiIcon name="trash" :size="16" /></MiIconButton>
            </template>
          </span>
        </template>
      </MiTable>
    </div>

    <ul class="aky__cards mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[820px]:hidden">
      <li v-for="key in rows" :key="key.id" class="aky__card mi:[&.is-revoked]:opacity-70 mi:grid mi:gap-2.5 mi:py-3 mi:px-3.5 mi:rounded-lg mi:bg-card mi:shadow-1" :class="{ 'is-revoked': key.revoked }">
        <div class="aky__card-top mi:flex mi:[align-items:flex-start] mi:justify-between mi:gap-2.5">
          <span class="aky__name mi:grid mi:gap-0.5 mi:min-w-0 mi:py-1 mi:px-0">
            <span class="aky__title mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:font-semibold mi:[.is-revoked_&]:text-label3 mi:[.is-revoked_&]:[text-decoration:line-through]">{{ key.name }}<MiBadge v-if="key.env === 'test'" tone="neutral" variant="outline" label="Test" /></span>
            <span class="aky__key mi:inline-flex mi:items-center mi:gap-0.5"><code class="mi:[.is-revoked_.aky__key_code&]:[text-decoration:line-through]">{{ key.prefix }}••••{{ key.last4 }}</code></span>
          </span>
          <MiSparkline v-if="!key.revoked" :values="key.spark" :width="56" :height="22" :animate="false" :dot="false" />
        </div>
        <span class="aky__scopes mi:flex mi:flex-wrap mi:gap-1"><span v-for="s in key.scopes" :key="s" class="aky__scope mi:py-0.5 mi:px-1.5 mi:rounded-[6px] mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[11px] mi:text-label2 mi:bg-fill2 mi:[&.is-write]:text-orange-t mi:[&.is-write]:[background:color-mix(in_srgb,_var(--mi-orange)_13%,_transparent)]" :class="{ 'is-write': s.endsWith(':write') }">{{ s }}</span></span>
        <div class="aky__card-foot mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-1.5 mi:gap-x-2.5">
          <MiText as="span" variant="caption" tone="label2">Used {{ key.lastUsed }} · <span :class="'aky__exp-text is-' + expiry(key).state">{{ expiry(key).label }}</span></MiText>
          <span class="aky__actions mi:inline-flex mi:flex-nowrap mi:whitespace-nowrap mi:items-center mi:[justify-content:flex-end] mi:gap-1.5">
            <template v-if="key.revoked"><MiText as="span" variant="caption" tone="label2">Revoked</MiText></template>
            <template v-else-if="confirming === key.id">
              <MiButton size="mini" variant="destructive" @click="revoke(key.id)">Revoke</MiButton>
              <MiButton size="mini" variant="gray" @click="confirming = null">Keep</MiButton>
            </template>
            <MiIconButton v-else size="small" variant="plain" :label="'Revoke ' + key.name" @click="confirming = key.id"><MiIcon name="trash" :size="16" /></MiIconButton>
          </span>
        </div>
      </li>
      <li v-if="!rows.length" class="aky__none mi:p-5 mi:text-center"><MiText variant="footnote" tone="label2">No key in this environment.</MiText></li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface ApiKey { id: string, name: string, env: 'live' | 'test', prefix: string, last4: string, scopes: string[], lastUsed: string, idleDays: number, expiresIn: number | null, lifetime: number, spark: number[], revoked: boolean }

// `expiresIn` and `lifetime` are in days; `spark` is requests per day over the last week.
const keys = reactive<ApiKey[]>([
  { id: 'key_01HF7Q2', name: 'Production storefront', env: 'live', prefix: 'nw_live_', last4: 'f9Kd', scopes: ['orders:read', 'catalog:read'], lastUsed: '2 min ago', idleDays: 0, expiresIn: 213, lifetime: 365, spark: [24, 26, 25, 29, 31, 30, 33], revoked: false },
  { id: 'key_01HG2M8', name: 'Warehouse scanner app', env: 'live', prefix: 'nw_live_', last4: 'a07P', scopes: ['inventory:write', 'orders:read'], lastUsed: '14 min ago', idleDays: 0, expiresIn: 18, lifetime: 180, spark: [8, 9, 11, 10, 12, 4, 3], revoked: false },
  { id: 'key_01HJ9C4', name: 'Analytics export', env: 'live', prefix: 'nw_live_', last4: 'Q2xe', scopes: ['events:read'], lastUsed: '6 h ago', idleDays: 0, expiresIn: null, lifetime: 0, spark: [1, 1, 1, 1, 1, 1, 1], revoked: false },
  { id: 'key_01H8ZK1', name: 'Zapier (legacy)', env: 'live', prefix: 'nw_live_', last4: 'mT4c', scopes: ['orders:write', 'customers:read'], lastUsed: '41 days ago', idleDays: 41, expiresIn: 96, lifetime: 365, spark: [0, 0, 0, 0, 0, 0, 0], revoked: false },
  { id: 'key_01HK3D6', name: 'Staging smoke tests', env: 'test', prefix: 'nw_test_', last4: '9wLr', scopes: ['orders:write', 'catalog:write'], lastUsed: '1 h ago', idleDays: 0, expiresIn: 5, lifetime: 30, spark: [3, 6, 5, 7, 6, 2, 6], revoked: false },
  { id: 'key_01HD5T0', name: 'Ledgerline webhooks', env: 'live', prefix: 'nw_live_', last4: 'Hh81', scopes: ['webhooks:write'], lastUsed: 'Sep 12', idleDays: 51, expiresIn: 0, lifetime: 90, spark: [0, 0, 0, 0, 0, 0, 0], revoked: true }
])
const k = (row: Record<string, unknown>) => row as unknown as ApiKey

const envs = [{ value: 'all', label: 'All' }, { value: 'live', label: 'Live' }, { value: 'test', label: 'Test' }]
const env = ref<string | number | null>('all')
const rows = computed(() => keys.filter(x => env.value === 'all' || x.env === env.value))

// Expiry: the bar is the share of the key's lifetime that is left, so short-lived keys never look safe by accident.
const expiry = (x: ApiKey) => {
  if (x.revoked) return { label: 'Revoked', state: 'off', left: 0 }
  if (x.expiresIn === null) return { label: 'Never expires', state: 'warn', left: 1 }
  const state = x.expiresIn <= 7 ? 'bad' : x.expiresIn <= 30 ? 'warn' : 'ok'
  return { label: `Expires in ${x.expiresIn} days`, state, left: x.expiresIn / x.lifetime }
}
const activeCount = computed(() => keys.filter(x => !x.revoked).length)
const attention = computed(() => keys.filter(x => !x.revoked && (x.idleDays > 30 || expiry(x).state !== 'ok')).length)

const columns = [
  { key: 'name', label: 'Key', sortable: true },
  { key: 'scopes', label: 'Scopes', width: '200px' },
  { key: 'used', label: 'Last used', sortable: true, width: '160px', sortBy: (r: Record<string, unknown>) => k(r).idleDays },
  { key: 'expires', label: 'Expiry', sortable: true, width: '150px', sortBy: (r: Record<string, unknown>) => k(r).expiresIn ?? 9999 },
  { key: 'actions', label: '', align: 'end' as const, width: '210px' }
]

// The unused legacy key starts in its confirm state so the preview shows the inline guard.
const confirming = ref<string | null>('key_01H8ZK1')
const rotated = ref(new Set<string>())
const revoke = (id: string) => { const x = keys.find(y => y.id === id); if (x) x.revoked = true; confirming.value = null }
const rotate = (id: string) => {
  const x = keys.find(y => y.id === id)
  if (!x || rotated.value.has(id)) return
  x.last4 = 'r' + x.last4.slice(1).split('').reverse().join('')
  if (x.expiresIn !== null) x.expiresIn = x.lifetime
  rotated.value = new Set(rotated.value).add(id)
}
</script>

<style scoped>
.aky__key code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: var(--mi-label2); }
.is-revoked .aky__key code { color: var(--mi-label3); }
.aky__exp-text { font-size: 12.5px; white-space: nowrap; }
.aky__exp-text.is-warn { color: var(--mi-orange-t); }
.aky__exp-text.is-bad { color: var(--mi-red-t); font-weight: 600; }
.aky__exp-text.is-off { color: var(--mi-label3); }
.aky__exp-bar i.is-ok { background: var(--mi-green); }
.aky__exp-bar i.is-warn { background: var(--mi-orange); }
.aky__exp-bar i.is-bad { background: var(--mi-red); }
</style>

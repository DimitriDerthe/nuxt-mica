<template>
  <section class="aky" aria-labelledby="aky-title">
    <header class="aky__head">
      <div>
        <MiText id="aky-title" variant="title3" as="h2" weight="semibold">API keys</MiText>
        <MiText variant="footnote" tone="label2" aria-live="polite">{{ activeCount }} active · {{ attention }} need attention</MiText>
      </div>
      <div class="aky__tools">
        <MiSegmented v-model="env" label="Environment" :options="envs" />
        <MiButton size="small">
          <template #leading><MiIcon name="plus" :size="14" /></template>
          Create key
        </MiButton>
      </div>
    </header>

    <div class="aky__table">
      <MiTable :columns="columns" :rows="rows" caption="API keys" density="relaxed" :zebra="false" empty-text="No key in this environment.">
        <template #cell-name="{ row }">
          <span class="aky__name" :class="{ 'is-revoked': k(row).revoked }">
            <span class="aky__title">{{ k(row).name }}<MiBadge v-if="k(row).env === 'test'" tone="neutral" variant="outline" label="Test" /></span>
            <span class="aky__key"><code>{{ k(row).prefix }}••••{{ k(row).last4 }}</code><MiCopyButton :value="k(row).id" icon-only variant="ghost" :label="'Copy key ID of ' + k(row).name" /></span>
          </span>
        </template>
        <template #cell-scopes="{ row }">
          <span class="aky__scopes">
            <span v-for="s in k(row).scopes" :key="s" class="aky__scope" :class="{ 'is-write': s.endsWith(':write') }">{{ s }}</span>
          </span>
        </template>
        <template #cell-used="{ row }">
          <span class="aky__used">
            <MiSparkline v-if="!k(row).revoked" :values="k(row).spark" :width="64" :height="22" :animate="false" :dot="false" />
            <span class="aky__used-text" :class="{ 'is-stale': k(row).idleDays > 30 }">{{ k(row).lastUsed }}</span>
          </span>
        </template>
        <template #cell-expires="{ row }">
          <span class="aky__exp">
            <span class="aky__exp-text" :class="'is-' + expiry(k(row)).state">{{ expiry(k(row)).label }}</span>
            <span v-if="k(row).expiresIn !== null && !k(row).revoked" class="aky__exp-bar"><i :class="'is-' + expiry(k(row)).state" :style="{ transform: `scaleX(${expiry(k(row)).left})` }" /></span>
          </span>
        </template>
        <template #cell-actions="{ row }">
          <span class="aky__actions">
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

    <ul class="aky__cards">
      <li v-for="key in rows" :key="key.id" class="aky__card" :class="{ 'is-revoked': key.revoked }">
        <div class="aky__card-top">
          <span class="aky__name">
            <span class="aky__title">{{ key.name }}<MiBadge v-if="key.env === 'test'" tone="neutral" variant="outline" label="Test" /></span>
            <span class="aky__key"><code>{{ key.prefix }}••••{{ key.last4 }}</code></span>
          </span>
          <MiSparkline v-if="!key.revoked" :values="key.spark" :width="56" :height="22" :animate="false" :dot="false" />
        </div>
        <span class="aky__scopes"><span v-for="s in key.scopes" :key="s" class="aky__scope" :class="{ 'is-write': s.endsWith(':write') }">{{ s }}</span></span>
        <div class="aky__card-foot">
          <MiText as="span" variant="caption" tone="label2">Used {{ key.lastUsed }} · <span :class="'aky__exp-text is-' + expiry(key).state">{{ expiry(key).label }}</span></MiText>
          <span class="aky__actions">
            <template v-if="key.revoked"><MiText as="span" variant="caption" tone="label2">Revoked</MiText></template>
            <template v-else-if="confirming === key.id">
              <MiButton size="mini" variant="destructive" @click="revoke(key.id)">Revoke</MiButton>
              <MiButton size="mini" variant="gray" @click="confirming = null">Keep</MiButton>
            </template>
            <MiIconButton v-else size="small" variant="plain" :label="'Revoke ' + key.name" @click="confirming = key.id"><MiIcon name="trash" :size="16" /></MiIconButton>
          </span>
        </div>
      </li>
      <li v-if="!rows.length" class="aky__none"><MiText variant="footnote" tone="label2">No key in this environment.</MiText></li>
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
.aky { container-type: inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.aky__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.aky__tools { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }

.aky__table { display: none; min-width: 0; overflow-x: auto; }
.aky__cards { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
@container (min-width: 820px) { .aky__table { display: block; } .aky__cards { display: none; } }

.aky__name { display: grid; gap: 2px; min-width: 0; padding: 4px 0; }
.aky__title { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-weight: 600; }
.aky__key { display: inline-flex; align-items: center; gap: 2px; }
.aky__key code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: var(--mi-label2); }
.is-revoked .aky__title, .is-revoked .aky__key code { color: var(--mi-label3); text-decoration: line-through; }
.aky__card.is-revoked { opacity: .7; }

.aky__scopes { display: flex; flex-wrap: wrap; gap: 4px; }
.aky__scope { padding: 2px 6px; border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: var(--mi-label2); background: var(--mi-fill2); }
.aky__scope.is-write { color: var(--mi-orange-t); background: color-mix(in srgb, var(--mi-orange) 13%, transparent); }

.aky__used { display: inline-flex; align-items: center; gap: 8px; }
.aky__used-text { font-size: 13px; white-space: nowrap; }
.aky__used-text.is-stale { color: var(--mi-orange-t); font-weight: 600; }

.aky__exp { display: grid; gap: 4px; }
.aky__exp-text { font-size: 12.5px; white-space: nowrap; }
.aky__exp-text.is-warn { color: var(--mi-orange-t); }
.aky__exp-text.is-bad { color: var(--mi-red-t); font-weight: 600; }
.aky__exp-text.is-off { color: var(--mi-label3); }
.aky__exp-bar { display: block; width: 100px; height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.aky__exp-bar i { display: block; height: 100%; transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.aky__exp-bar i.is-ok { background: var(--mi-green); }
.aky__exp-bar i.is-warn { background: var(--mi-orange); }
.aky__exp-bar i.is-bad { background: var(--mi-red); }

.aky__actions { display: inline-flex; flex-wrap: nowrap; white-space: nowrap; align-items: center; justify-content: flex-end; gap: 6px; }

.aky__card { display: grid; gap: 10px; padding: 12px 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.aky__card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.aky__card-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 10px; }
.aky__none { padding: 20px; text-align: center; }
</style>

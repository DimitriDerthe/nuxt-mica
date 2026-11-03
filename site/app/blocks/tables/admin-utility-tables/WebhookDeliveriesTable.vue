<template>
  <section class="wdt" aria-labelledby="wdt-title">
    <header class="wdt__head">
      <div>
        <MiText id="wdt-title" variant="title3" as="h2" weight="semibold">Webhook deliveries</MiText>
        <MiText variant="footnote" tone="label2"><code>https://api.harbor.dev/hooks/billing</code> · last 24 hours</MiText>
      </div>
      <dl class="wdt__stats">
        <div><dt>Success rate</dt><dd :class="{ 'is-bad': successRate < 95 }">{{ successRate }}%</dd></div>
        <div><dt>p95 latency</dt><dd>{{ p95 >= TIMEOUT ? "> 10 s" : p95 + " ms" }}</dd></div>
      </dl>
    </header>

    <div class="wdt__tools">
      <MiSegmented v-model="filter" label="Filter deliveries" :options="filters" />
      <MiText variant="caption" tone="label2" aria-live="polite">{{ live }}</MiText>
    </div>

    <!-- Wide table scrolls inside its own frame on narrow screens. -->
    <div class="wdt__scroll" tabindex="0" aria-label="Deliveries table">
      <table class="wdt__table">
        <caption class="wdt__sr">Webhook deliveries, newest first</caption>
        <thead>
          <tr><th scope="col"><span class="wdt__sr">Details</span></th><th scope="col">Status</th><th scope="col">Event</th><th scope="col">Latency</th><th scope="col">Attempts</th><th scope="col">Sent</th><th scope="col"><span class="wdt__sr">Actions</span></th></tr>
        </thead>
        <tbody>
          <template v-for="d in rows" :key="d.id">
            <tr :class="{ 'is-open': openId === d.id }">
              <td>
                <MiIconButton size="small" variant="plain" :label="(openId === d.id ? 'Hide' : 'Show') + ' response for ' + d.id" :aria-expanded="openId === d.id" @click="openId = openId === d.id ? null : d.id">
                  <MiIcon name="chevron-right" :size="14" class="wdt__chev" :class="{ 'is-open': openId === d.id }" />
                </MiIconButton>
              </td>
              <td><span class="wdt__code" :class="'is-' + kind(d.code)">{{ d.code || 'Timeout' }}</span></td>
              <td>
                <span class="wdt__event">{{ d.event }}</span>
                <span class="wdt__id">{{ d.id }}</span>
              </td>
              <td>
                <span class="wdt__lat">
                  <span class="wdt__lat-bar"><i :class="{ 'is-slow': d.ms > SLOW }" :style="{ transform: `scaleX(${Math.min(d.ms / TIMEOUT, 1)})` }" /></span>
                  <span class="wdt__lat-num">{{ d.ms >= TIMEOUT ? '> 10 s' : d.ms + ' ms' }}</span>
                </span>
              </td>
              <td class="wdt__num">{{ d.attempts }}</td>
              <td class="wdt__time">{{ d.sent }}</td>
              <td class="wdt__act">
                <MiButton v-if="kind(d.code) !== 'ok'" size="mini" variant="gray" :loading="retrying === d.id" @click="redeliver(d)">Redeliver</MiButton>
              </td>
            </tr>
            <tr v-if="openId === d.id" class="wdt__detail">
              <td colspan="7">
                <div class="wdt__resp">
                  <MiText variant="caption" weight="semibold" tone="label2">Response · {{ d.code || 'no response' }}</MiText>
                  <pre>{{ d.body }}</pre>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

interface Delivery { id: string, event: string, code: number, ms: number, attempts: number, sent: string, body: string }
type Kind = 'ok' | 'client' | 'server'

const TIMEOUT = 10000
const SLOW = 2000
const filters = computed(() => [
  { value: 'all', label: `All ${deliveries.value.length}` },
  { value: 'failed', label: `Failed ${deliveries.value.filter(d => kind(d.code) !== 'ok').length}` }
])
const filter = ref<string | number | null>('all')
const openId = ref<string | null>('evt_8KQ2')
const retrying = ref<string | null>(null)
const live = ref('')

// Sample log, newest first; code 0 means the endpoint never answered.
const deliveries = ref<Delivery[]>([
  { id: 'evt_9A1F', event: 'invoice.paid', code: 200, ms: 182, attempts: 1, sent: '14:02', body: '{ "received": true }' },
  { id: 'evt_8KQ2', event: 'customer.subscription.updated', code: 500, ms: 2410, attempts: 3, sent: '13:47', body: '{ "error": "upstream ledger unavailable", "retry_after": 30 }' },
  { id: 'evt_8JX7', event: 'invoice.created', code: 200, ms: 240, attempts: 1, sent: '13:45', body: '{ "received": true }' },
  { id: 'evt_7ZP4', event: 'charge.refunded', code: 0, ms: 10000, attempts: 5, sent: '12:31', body: 'No response within 10 s. The connection was closed.' },
  { id: 'evt_7YB9', event: 'customer.created', code: 410, ms: 96, attempts: 1, sent: '11:58', body: '{ "error": "endpoint retired, use /hooks/v2/customers" }' },
  { id: 'evt_7W2C', event: 'invoice.paid', code: 200, ms: 1980, attempts: 2, sent: '11:20', body: '{ "received": true }' }
])

const kind = (code: number): Kind => (code >= 200 && code < 300 ? 'ok' : code >= 400 && code < 500 ? 'client' : 'server')
const rows = computed(() => (filter.value === 'failed' ? deliveries.value.filter(d => kind(d.code) !== 'ok') : deliveries.value))
const successRate = computed(() => Math.round((deliveries.value.filter(d => kind(d.code) === 'ok').length / deliveries.value.length) * 1000) / 10)
const p95 = computed(() => {
  const sorted = deliveries.value.map(d => d.ms).sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)] ?? 0
})

// Simulated retry: one short timer, cleared on unmount.
let timer: ReturnType<typeof setTimeout> | undefined
function redeliver(d: Delivery) {
  retrying.value = d.id
  clearTimeout(timer)
  timer = setTimeout(() => {
    d.code = 200
    d.ms = 214
    d.attempts++
    d.sent = 'Just now'
    d.body = '{ "received": true }'
    retrying.value = null
    live.value = `${d.id} redelivered, 200 OK.`
  }, 900)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.wdt { container-type: inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.wdt__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.wdt__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.wdt__head code { font-family: ui-monospace, monospace; font-size: 12px; overflow-wrap: anywhere; }
.wdt__stats { display: flex; gap: 20px; margin: 0; }
.wdt__stats dt { font-size: 12px; color: var(--mi-label2); }
.wdt__stats dd { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.wdt__stats dd.is-bad { color: var(--mi-orange-t); }
.wdt__tools { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }

.wdt__scroll { overflow-x: auto; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.wdt__scroll:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.wdt__table { width: 100%; min-width: 700px; border-collapse: collapse; font-size: 13px; }
.wdt__table th { padding: 10px 12px; font-size: 11px; font-weight: 600; text-align: start; text-transform: uppercase; letter-spacing: .05em; color: var(--mi-label3); border-bottom: 1px solid var(--mi-sep); }
.wdt__table td { padding: 8px 12px; vertical-align: middle; }
.wdt__table tbody tr + tr td { border-top: 1px solid var(--mi-sep); }
.wdt__table th:first-child, .wdt__table td:first-child { width: 36px; padding-inline: 8px 0; }
.wdt__table tr.is-open td { background: var(--mi-fill4); }
.wdt__chev { transition: transform var(--mi-dur-2) var(--mi-ease); }
.wdt__chev.is-open { transform: rotate(90deg); }

.wdt__code { display: inline-block; min-width: 44px; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; text-align: center; font-variant-numeric: tabular-nums; }
.wdt__code.is-ok { background: color-mix(in srgb, var(--mi-green) 14%, transparent); color: var(--mi-green-t); }
.wdt__code.is-client { background: color-mix(in srgb, var(--mi-orange) 16%, transparent); color: var(--mi-orange-t); }
.wdt__code.is-server { background: color-mix(in srgb, var(--mi-red) 14%, transparent); color: var(--mi-red-t); }
.wdt__event { display: block; font-family: ui-monospace, monospace; font-weight: 600; }
.wdt__id { font-size: 12px; color: var(--mi-label3); }
.wdt__lat { display: flex; align-items: center; gap: 8px; }
.wdt__lat-bar { width: 72px; height: 5px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.wdt__lat-bar i { display: block; height: 100%; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-spring); }
.wdt__lat-bar i.is-slow { background: var(--mi-orange); }
.wdt__lat-num, .wdt__num, .wdt__time { font-variant-numeric: tabular-nums; white-space: nowrap; color: var(--mi-label2); }
.wdt__act { text-align: end; }

.wdt__detail td { padding: 0 12px 12px 44px; background: var(--mi-fill4); }
.wdt__table tbody tr.wdt__detail td { border-top: 0; }
.wdt__resp { display: grid; gap: 6px; padding: 10px 12px; border-radius: var(--mi-radius-m); background: var(--mi-card); }
.wdt__resp pre { margin: 0; font-family: ui-monospace, monospace; font-size: 12px; white-space: pre-wrap; overflow-wrap: anywhere; color: var(--mi-label); }
</style>

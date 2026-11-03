<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="wdt-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="wdt-title" variant="title3" as="h2" weight="semibold">Webhook deliveries</MiText>
        <MiText variant="footnote" tone="label2"><code class="mi:font-[ui-monospace,monospace] mi:text-[12px] mi:[overflow-wrap:anywhere]">https://api.harbor.dev/hooks/billing</code> · last 24 hours</MiText>
      </div>
      <dl class="mi:flex mi:gap-5 mi:m-0">
        <div><dt class="mi:text-[12px] mi:text-label2">Success rate</dt><dd class="mi:text-[22px] mi:m-0 mi:font-bold mi:tracking-[-.02em] mi:tabular-nums" :class="successRate < 95 ? 'mi:text-orange-t' : ''">{{ successRate }}%</dd></div>
        <div><dt class="mi:text-[12px] mi:text-label2">p95 latency</dt><dd class="mi:text-[22px] mi:m-0 mi:font-bold mi:tracking-[-.02em] mi:tabular-nums">{{ p95 >= TIMEOUT ? "> 10 s" : p95 + " ms" }}</dd></div>
      </dl>
    </header>

    <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
      <MiSegmented v-model="filter" label="Filter deliveries" :options="filters" />
      <MiText variant="caption" tone="label2" aria-live="polite">{{ live }}</MiText>
    </div>

    <!-- Wide table scrolls inside its own frame on narrow screens. -->
    <div class="mi:overflow-x-auto mi:rounded-xl mi:bg-card mi:shadow-1 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" tabindex="0" aria-label="Deliveries table">
      <table class="mi:w-full mi:min-w-175 mi:border-collapse mi:text-[13px]">
        <caption class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Webhook deliveries, newest first</caption>
        <thead>
          <tr><th class="mi:w-9 mi:ps-2 mi:pe-0 mi:py-2.5 mi:px-3 mi:text-[11px] mi:font-semibold mi:uppercase mi:tracking-[.05em] mi:text-label3 mi:border-b mi:border-b-sep mi:text-start" scope="col"><span class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Details</span></th><th class="mi:py-2.5 mi:px-3 mi:text-[11px] mi:font-semibold mi:uppercase mi:tracking-[.05em] mi:text-label3 mi:border-b mi:border-b-sep mi:text-start" scope="col">Status</th><th class="mi:py-2.5 mi:px-3 mi:text-[11px] mi:font-semibold mi:uppercase mi:tracking-[.05em] mi:text-label3 mi:border-b mi:border-b-sep mi:text-start" scope="col">Event</th><th class="mi:py-2.5 mi:px-3 mi:text-[11px] mi:font-semibold mi:uppercase mi:tracking-[.05em] mi:text-label3 mi:border-b mi:border-b-sep mi:text-start" scope="col">Latency</th><th class="mi:py-2.5 mi:px-3 mi:text-[11px] mi:font-semibold mi:uppercase mi:tracking-[.05em] mi:text-label3 mi:border-b mi:border-b-sep mi:text-start" scope="col">Attempts</th><th class="mi:py-2.5 mi:px-3 mi:text-[11px] mi:font-semibold mi:uppercase mi:tracking-[.05em] mi:text-label3 mi:border-b mi:border-b-sep mi:text-start" scope="col">Sent</th><th class="mi:py-2.5 mi:px-3 mi:text-[11px] mi:font-semibold mi:uppercase mi:tracking-[.05em] mi:text-label3 mi:border-b mi:border-b-sep mi:text-start" scope="col"><span class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Actions</span></th></tr>
        </thead>
        <tbody>
          <template v-for="d in rows" :key="d.id">
            <tr class="mi:group" :data-open="openId === d.id || undefined">
              <td class="mi:w-9 mi:ps-2 mi:pe-0 mi:py-2 mi:px-3 mi:align-middle mi:[tr+tr>&]:border-t mi:[tr+tr>&]:border-t-sep mi:group-data-[open]:bg-fill4">
                <MiIconButton class="" size="small" variant="plain" :label="(openId === d.id ? 'Hide' : 'Show') + ' response for ' + d.id" :aria-expanded="openId === d.id" @click="openId = openId === d.id ? null : d.id">
                  <MiIcon name="chevron-right" :size="14" class="mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="openId === d.id ? 'mi:transform-[rotate(90deg)]' : ''" />
                </MiIconButton>
              </td>
              <td class="mi:py-2 mi:px-3 mi:align-middle mi:[tr+tr>&]:border-t mi:[tr+tr>&]:border-t-sep mi:group-data-[open]:bg-fill4"><span class="mi:inline-block mi:min-w-11 mi:py-0.5 mi:px-2 mi:rounded-[6px] mi:text-[12px] mi:font-bold mi:text-center mi:tabular-nums" :class="[({ ok: 'mi:bg-green/14 mi:text-green-t', client: 'mi:bg-orange/16 mi:text-orange-t', server: 'mi:bg-red/14 mi:text-red-t' } as Record<string, string>)[kind(d.code)]]">{{ d.code || 'Timeout' }}</span></td>
              <td class="mi:py-2 mi:px-3 mi:align-middle mi:[tr+tr>&]:border-t mi:[tr+tr>&]:border-t-sep mi:group-data-[open]:bg-fill4">
                <span class="mi:block mi:font-[ui-monospace,_monospace] mi:font-semibold">{{ d.event }}</span>
                <span class="mi:text-[12px] mi:text-label3">{{ d.id }}</span>
              </td>
              <td class="mi:py-2 mi:px-3 mi:align-middle mi:[tr+tr>&]:border-t mi:[tr+tr>&]:border-t-sep mi:group-data-[open]:bg-fill4">
                <span class="mi:flex mi:items-center mi:gap-2">
                  <span class="mi:w-18 mi:h-[5px] mi:rounded-[3px] mi:bg-fill3 mi:overflow-hidden"><i class="mi:block mi:h-full mi:origin-left mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :class="d.ms > SLOW ? 'mi:bg-orange' : 'mi:bg-p'" :style="{ transform: `scaleX(${Math.min(d.ms / TIMEOUT, 1)})` }" /></span>
                  <span class="mi:tabular-nums mi:whitespace-nowrap mi:text-label2">{{ d.ms >= TIMEOUT ? '> 10 s' : d.ms + ' ms' }}</span>
                </span>
              </td>
              <td class="mi:py-2 mi:px-3 mi:align-middle mi:[tr+tr>&]:border-t mi:[tr+tr>&]:border-t-sep mi:group-data-[open]:bg-fill4 mi:tabular-nums mi:whitespace-nowrap mi:text-label2">{{ d.attempts }}</td>
              <td class="mi:py-2 mi:px-3 mi:align-middle mi:[tr+tr>&]:border-t mi:[tr+tr>&]:border-t-sep mi:group-data-[open]:bg-fill4 mi:tabular-nums mi:whitespace-nowrap mi:text-label2">{{ d.sent }}</td>
              <td class="mi:py-2 mi:px-3 mi:align-middle mi:[tr+tr>&]:border-t mi:[tr+tr>&]:border-t-sep mi:group-data-[open]:bg-fill4 mi:text-end">
                <MiButton class="" v-if="kind(d.code) !== 'ok'" size="mini" variant="gray" :loading="retrying === d.id" @click="redeliver(d)">Redeliver</MiButton>
              </td>
            </tr>
            <tr v-if="openId === d.id" >
              <td class="mi:w-9 mi:align-middle mi:pt-0 mi:pb-3 mi:ps-2 mi:pe-0 mi:bg-fill4" colspan="7">
                <div class="mi:grid mi:gap-1.5 mi:py-2.5 mi:px-3 mi:rounded-md mi:bg-card">
                  <MiText variant="caption" weight="semibold" tone="label2">Response · {{ d.code || 'no response' }}</MiText>
                  <pre class="mi:m-0 mi:font-[ui-monospace,monospace] mi:text-[12px] mi:whitespace-pre-wrap mi:[overflow-wrap:anywhere] mi:text-label">{{ d.body }}</pre>
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

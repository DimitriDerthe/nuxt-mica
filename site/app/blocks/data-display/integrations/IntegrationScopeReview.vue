<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="isr-title">
    <header class="mi:flex mi:flex-wrap mi:items-center mi:gap-4">
      <div class="mi:flex mi:items-center mi:gap-1.5" aria-hidden="true">
        <span class="mi:grid mi:place-items-center mi:w-11 mi:h-11 mi:rounded-[12px] mi:text-[18px] mi:font-bold mi:[background:linear-gradient(140deg,_var(--mi-s),_color-mix(in_srgb,_var(--mi-s)_55%,_var(--mi-p)))] mi:text-s-on">L</span>
        <span class="mi:flex mi:gap-[3px]"><i class="mi:w-1 mi:h-1 mi:rounded-[50%] mi:[background:var(--mi-label3)]" /><i class="mi:w-1 mi:h-1 mi:rounded-[50%] mi:[background:var(--mi-label3)]" /><i class="mi:w-1 mi:h-1 mi:rounded-[50%] mi:[background:var(--mi-label3)]" /></span>
        <span class="mi:grid mi:place-items-center mi:w-11 mi:h-11 mi:rounded-[12px] mi:text-[18px] mi:font-bold mi:[background:var(--mi-p)] mi:text-p-on">N</span>
      </div>
      <div>
        <MiText id="isr-title" variant="title3" as="h2" weight="semibold">Connect Ledgerline to Northwind</MiText>
        <MiText variant="footnote" tone="label2">Requested by Hana Ito · review what it can read, write and sync</MiText>
      </div>
    </header>

    <MiAlert v-if="connected" tone="success" title="Ledgerline is connected">First sync starts in a minute. You can change permissions any time in Settings.</MiAlert>

    <div class="mi:grid mi:gap-3 mi:@[820px]:grid-cols-2">
      <section class="mi:grid mi:content-start mi:gap-3 mi:p-4.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0" aria-labelledby="isr-perm">
        <MiText id="isr-perm" variant="headline" as="h3">Permissions</MiText>
        <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="s in scopes" :key="s.id" class="mi:flex mi:items-center mi:gap-3 mi:py-2.5 mi:px-0 mi:not-first:border-t mi:not-first:border-t-sep">
            <span class="mi:flex-[none] mi:w-11.5 mi:py-0.5 mi:px-0 mi:rounded-[6px] mi:text-[11px] mi:font-bold mi:text-center mi:uppercase mi:tracking-[.04em]" :class="s.level === 'write' ? 'mi:[background:color-mix(in_srgb,_var(--mi-orange)_14%,_transparent)] mi:text-orange-t' : 'mi:[background:var(--mi-fill4)] mi:text-label2'">{{ s.level }}</span>
            <div class="mi:grid mi:flex-1 mi:min-w-0 mi:text-[14px]">
              <span :id="'isr-scope-' + s.id">{{ s.label }}</span>
              <MiText variant="caption" tone="label2">{{ s.why }}</MiText>
            </div>
            <MiText v-if="s.required" variant="caption" tone="label3">Required</MiText>
            <MiSwitch v-else v-model="s.on" size="compact" :aria-labelledby="'isr-scope-' + s.id" :disabled="connected" @update:model-value="on => on || downgrade(s.id)" />
          </li>
        </ul>
      </section>

      <section class="mi:grid mi:content-start mi:gap-3 mi:p-4.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0" aria-labelledby="isr-sync">
        <MiText id="isr-sync" variant="headline" as="h3">Sync</MiText>
        <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="o in objects" :key="o.id" class="mi:flex mi:items-center mi:gap-3 mi:py-2.5 mi:px-0 mi:not-first:border-t mi:not-first:border-t-sep mi:flex-wrap mi:justify-between">
            <div class="mi:grid mi:flex-1 mi:min-w-0 mi:text-[14px] mi:min-w-35">
              <span :id="'isr-obj-' + o.id">{{ o.label }}</span>
              <MiText variant="caption" tone="label2">{{ DIRECTION_HINT[String(o.direction)] }}</MiText>
            </div>
            <MiSegmented v-model="o.direction" :options="directionOptions(o)" :label="'Sync direction for ' + o.label" :disabled="connected" />
          </li>
        </ul>

        <!-- Footprint: one sentence and a meter so the approver sees the blast radius. -->
        <div class="mi:grid mi:gap-2.5 mi:pt-3 mi:border-t mi:border-t-sep">
          <MiMeter :value="writeCount" :max="WRITE_MAX" size="sm" label="Write access" :caption="writeCount + ' of ' + WRITE_MAX + ' write permissions'" :color="writeCount > 2 ? 'var(--mi-orange)' : 'var(--mi-p)'" />
          <MiText variant="footnote" tone="label2">Ledgerline will read {{ readCount }} and write {{ writeCount }} kinds of data, syncing {{ syncing }} objects.</MiText>
          <div class="mi:flex mi:[justify-content:flex-end] mi:gap-2">
            <MiButton variant="gray" :disabled="connected" @click="reset">Reset</MiButton>
            <MiButton :disabled="connected" @click="connected = true">{{ connected ? 'Connected' : 'Authorize' }}</MiButton>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Scope { id: string, label: string, why: string, level: 'read' | 'write', required: boolean, on: boolean }
interface SyncObject { id: string, label: string, needs: string, direction: string | number | null }

const DIRECTION_HINT: Record<string, string> = { off: 'Not synced', pull: 'Ledgerline → Northwind', both: 'Both ways, newest edit wins' }

const initialScopes = (): Scope[] => [
  { id: 'profile', label: 'Workspace name and members', why: 'To match invoices to the right owner', level: 'read', required: true, on: true },
  { id: 'customers', label: 'Customers', why: 'To create customers on new invoices', level: 'read', required: true, on: true },
  { id: 'invoices', label: 'Create and update invoices', why: 'Needed for two-way invoice sync', level: 'write', required: false, on: true },
  { id: 'payments', label: 'Record payments', why: 'Marks deals as paid when money lands', level: 'write', required: false, on: false },
  { id: 'products', label: 'Edit the product catalog', why: 'Keeps prices aligned in both tools', level: 'write', required: false, on: false }
]
const initialObjects = (): SyncObject[] => [
  { id: 'invoices', label: 'Invoices', needs: 'invoices', direction: 'both' },
  { id: 'payments', label: 'Payments', needs: 'payments', direction: 'pull' },
  { id: 'products', label: 'Products', needs: 'products', direction: 'off' }
]

const scopes = ref(initialScopes())
const objects = ref(initialObjects())
const connected = ref(false)
const WRITE_MAX = initialScopes().filter(s => s.level === 'write').length

// Two-way sync needs the matching write scope, so the option stays disabled without it.
const directionOptions = (o: SyncObject) => [
  { value: 'off', label: 'Off' },
  { value: 'pull', label: 'Pull' },
  { value: 'both', label: 'Both', disabled: !scopes.value.some(s => s.id === o.needs && s.on) }
]
// Turning a write scope off drops its object from two-way back to pull.
function downgrade(scopeId: string) {
  for (const o of objects.value) if (o.needs === scopeId && o.direction === 'both') o.direction = 'pull'
}
const writeCount = computed(() => scopes.value.filter(s => s.level === 'write' && s.on).length)
const readCount = computed(() => scopes.value.filter(s => s.level === 'read').length)
const syncing = computed(() => objects.value.filter(o => o.direction !== 'off').length)

function reset() {
  scopes.value = initialScopes()
  objects.value = initialObjects()
}
</script>

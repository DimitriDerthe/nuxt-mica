<template>
  <section class="isr" aria-labelledby="isr-title">
    <header class="isr__head">
      <div class="isr__pair" aria-hidden="true">
        <span class="isr__app is-them">L</span>
        <span class="isr__link"><i /><i /><i /></span>
        <span class="isr__app is-us">N</span>
      </div>
      <div>
        <MiText id="isr-title" variant="title3" as="h2" weight="semibold">Connect Ledgerline to Northwind</MiText>
        <MiText variant="footnote" tone="label2">Requested by Hana Ito · review what it can read, write and sync</MiText>
      </div>
    </header>

    <MiAlert v-if="connected" tone="success" title="Ledgerline is connected">First sync starts in a minute. You can change permissions any time in Settings.</MiAlert>

    <div class="isr__grid">
      <section class="isr__card" aria-labelledby="isr-perm">
        <MiText id="isr-perm" variant="headline" as="h3">Permissions</MiText>
        <ul class="isr__scopes">
          <li v-for="s in scopes" :key="s.id" class="isr__scope">
            <span class="isr__level" :class="'is-' + s.level">{{ s.level }}</span>
            <div class="isr__scope-text">
              <span :id="'isr-scope-' + s.id">{{ s.label }}</span>
              <MiText variant="caption" tone="label2">{{ s.why }}</MiText>
            </div>
            <MiText v-if="s.required" variant="caption" tone="label3">Required</MiText>
            <MiSwitch v-else v-model="s.on" size="compact" :aria-labelledby="'isr-scope-' + s.id" :disabled="connected" @update:model-value="on => on || downgrade(s.id)" />
          </li>
        </ul>
      </section>

      <section class="isr__card" aria-labelledby="isr-sync">
        <MiText id="isr-sync" variant="headline" as="h3">Sync</MiText>
        <ul class="isr__objects">
          <li v-for="o in objects" :key="o.id" class="isr__object">
            <div class="isr__object-text">
              <span :id="'isr-obj-' + o.id">{{ o.label }}</span>
              <MiText variant="caption" tone="label2">{{ DIRECTION_HINT[String(o.direction)] }}</MiText>
            </div>
            <MiSegmented v-model="o.direction" :options="directionOptions(o)" :label="'Sync direction for ' + o.label" :disabled="connected" />
          </li>
        </ul>

        <!-- Footprint: one sentence and a meter so the approver sees the blast radius. -->
        <div class="isr__foot">
          <MiMeter :value="writeCount" :max="WRITE_MAX" size="sm" label="Write access" :caption="writeCount + ' of ' + WRITE_MAX + ' write permissions'" :color="writeCount > 2 ? 'var(--mi-orange)' : 'var(--mi-p)'" />
          <MiText variant="footnote" tone="label2">Ledgerline will read {{ readCount }} and write {{ writeCount }} kinds of data, syncing {{ syncing }} objects.</MiText>
          <div class="isr__cta">
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

<style scoped>
.isr { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.isr__head { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.isr__pair { display: flex; align-items: center; gap: 6px; }
.isr__app { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; font-size: 18px; font-weight: 700; }
.isr__app.is-them { background: linear-gradient(140deg, var(--mi-s), color-mix(in srgb, var(--mi-s) 55%, var(--mi-p))); color: var(--mi-s-on); }
.isr__app.is-us { background: var(--mi-p); color: var(--mi-p-on); }
.isr__link { display: flex; gap: 3px; }
.isr__link i { width: 4px; height: 4px; border-radius: 50%; background: var(--mi-label3); }
.isr__grid { display: grid; gap: 12px; }
.isr__card { display: grid; align-content: start; gap: 12px; padding: 18px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.isr__scopes, .isr__objects { display: grid; margin: 0; padding: 0; list-style: none; }
.isr__scope, .isr__object { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
.isr__scope + .isr__scope, .isr__object + .isr__object { border-top: 1px solid var(--mi-sep); }
.isr__object { flex-wrap: wrap; justify-content: space-between; }
.isr__scope-text, .isr__object-text { display: grid; flex: 1; min-width: 0; font-size: 14px; }
.isr__object-text { min-width: 140px; }
.isr__level { flex: none; width: 46px; padding: 2px 0; border-radius: 6px; font-size: 11px; font-weight: 700; text-align: center; text-transform: uppercase; letter-spacing: .04em; background: var(--mi-fill4); color: var(--mi-label2); }
.isr__level.is-write { background: color-mix(in srgb, var(--mi-orange) 14%, transparent); color: var(--mi-orange-t); }
.isr__foot { display: grid; gap: 10px; padding-top: 12px; border-top: 1px solid var(--mi-sep); }
.isr__cta { display: flex; justify-content: flex-end; gap: 8px; }

@container (min-width: 820px) {
  .isr__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>

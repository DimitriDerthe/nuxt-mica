<template>
  <section class="cct" aria-labelledby="cct-title">
    <header class="cct__head">
      <div>
        <MiText id="cct-title" as="h2" variant="title3" weight="semibold">Customize columns</MiText>
        <MiText variant="footnote" tone="label2">Orders table · saved for everyone in Fulfilment</MiText>
      </div>
      <MiButton variant="plain" size="small" :disabled="isDefault" @click="visible = [...defaults]">Reset to default</MiButton>
    </header>

    <div class="cct__panes">
      <div class="cct__pane">
        <div class="cct__pane-head">
          <MiText as="h3" variant="subheadline" weight="semibold">Available</MiText>
          <MiText variant="caption" tone="label3">{{ hidden.length }} fields</MiText>
        </div>
        <MiSearch v-model="query" size="compact" placeholder="Find a field" aria-label="Find a field" />
        <div v-for="g in groups" :key="g.name" class="cct__group">
          <MiText variant="caption" tone="label2" weight="semibold" class="cct__group-name">{{ g.name }}</MiText>
          <ul class="cct__fields">
            <li v-for="f in g.fields" :key="f.id" class="cct__field">
              <span class="cct__label">{{ f.label }}</span>
              <MiIconButton :label="`Show ${f.label}`" variant="gray" size="small" :disabled="full" @click="show(f.id)">
                <MiIcon name="plus" :size="14" />
              </MiIconButton>
            </li>
          </ul>
        </div>
        <MiText v-if="!groups.length" variant="footnote" tone="label3">No hidden field matches “{{ query }}”.</MiText>
      </div>

      <div class="cct__pane">
        <div class="cct__pane-head">
          <MiText as="h3" variant="subheadline" weight="semibold">Shown, in order</MiText>
          <MiText variant="caption" :tone="full ? 'orange' : 'label3'" tabular>{{ visible.length }} / {{ max }}</MiText>
        </div>
        <!-- Order ID is pinned first; the rest reorder by drag or by keyboard on the handle. -->
        <div class="cct__pinned"><MiIcon name="lock" :size="13" /> Order ID</div>
        <MiSortable
          :model-value="rows" handle bare :gap="4" aria-label="Shown columns" :item-label="(item: Record<string, unknown>) => String(item.label)"
          @update:model-value="visible = $event.map(i => String(i.id))"
        >
          <template #default="{ item }">
            <div class="cct__row">
              <span class="cct__label">{{ item.label }}</span>
              <MiIconButton :label="`Hide ${item.label}`" variant="plain" size="small" @click="hide(String(item.id))">
                <MiIcon name="close" :size="14" />
              </MiIconButton>
            </div>
          </template>
        </MiSortable>
        <MiText v-if="full" variant="caption" tone="orange">Eight columns fit on a laptop screen. Hide one to add another.</MiText>
      </div>
    </div>

    <!-- Header preview: how the table will read, left to right. -->
    <div class="cct__preview" role="group" tabindex="0" aria-label="Table header preview">
      <span class="cct__th is-pinned">Order ID</span>
      <span v-for="r in rows" :key="r.id" class="cct__th">{{ r.label }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Field { id: string, label: string, group: string }

const fields: Field[] = [
  { id: 'customer', label: 'Customer', group: 'Order' },
  { id: 'placed', label: 'Placed on', group: 'Order' },
  { id: 'total', label: 'Total', group: 'Order' },
  { id: 'channel', label: 'Sales channel', group: 'Order' },
  { id: 'items', label: 'Item count', group: 'Order' },
  { id: 'status', label: 'Fulfilment status', group: 'Shipping' },
  { id: 'carrier', label: 'Carrier', group: 'Shipping' },
  { id: 'tracking', label: 'Tracking number', group: 'Shipping' },
  { id: 'country', label: 'Destination country', group: 'Shipping' },
  { id: 'payment', label: 'Payment status', group: 'Payment' },
  { id: 'method', label: 'Payment method', group: 'Payment' },
  { id: 'refund', label: 'Refunded amount', group: 'Payment' },
  { id: 'tags', label: 'Tags', group: 'Other' },
  { id: 'notes', label: 'Internal notes', group: 'Other' }
]
const byId = new Map(fields.map(f => [f.id, f]))
const max = 8
const defaults = ['customer', 'placed', 'status', 'total', 'payment']
const visible = ref<string[]>(['customer', 'placed', 'status', 'carrier', 'total', 'payment'])
const query = ref('')

const rows = computed(() => visible.value.map(id => byId.get(id)).filter((f): f is Field => !!f))
const hidden = computed(() => fields.filter(f => !visible.value.includes(f.id)))
const groups = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = hidden.value.filter(f => !q || f.label.toLowerCase().includes(q))
  return [...new Set(list.map(f => f.group))].map(name => ({ name, fields: list.filter(f => f.group === name) }))
})
const full = computed(() => visible.value.length >= max)
const isDefault = computed(() => visible.value.join() === defaults.join())

function show(id: string) { if (!full.value) visible.value = [...visible.value, id] }
function hide(id: string) { visible.value = visible.value.filter(v => v !== id) }
</script>

<style scoped>
.cct { container: cct / inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.cct__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }

.cct__panes { display: grid; gap: 12px; }
@container cct (min-width: 640px) { .cct__panes { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; } }
.cct__pane { display: grid; gap: 10px; padding: 16px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.cct__pane-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }

.cct__group { display: grid; gap: 4px; }
.cct__group-name { text-transform: uppercase; letter-spacing: .06em; padding-top: 4px; }
.cct__fields { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }
.cct__field, .cct__row { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 38px; padding: 0 4px 0 10px; border-radius: var(--mi-radius-s); }
.cct__field:hover { background: var(--mi-fill4); }
.cct__row { background: var(--mi-fill4); }
.cct__label { min-width: 0; font-size: 14px; overflow-wrap: anywhere; }
.cct__pinned { display: flex; align-items: center; gap: 6px; min-height: 38px; padding: 0 10px; border-radius: var(--mi-radius-s); font-size: 14px; color: var(--mi-label2); border: 1px dashed var(--mi-sep); }

.cct__preview { display: flex; gap: 1px; overflow-x: auto; border-radius: var(--mi-radius-m); background: var(--mi-sep); scrollbar-width: thin; }
.cct__th { flex: none; padding: 9px 14px; font-size: 12px; font-weight: 600; white-space: nowrap; color: var(--mi-label2); background: var(--mi-card); }
.cct__th.is-pinned { color: var(--mi-label); }
</style>

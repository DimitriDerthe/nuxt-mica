<template>
  <section class="mi:@container/cct mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="cct-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="cct-title" as="h2" variant="title3" weight="semibold">Customize columns</MiText>
        <MiText variant="footnote" tone="label2">Orders table · saved for everyone in Fulfilment</MiText>
      </div>
      <MiButton variant="plain" size="small" :disabled="isDefault" @click="visible = [...defaults]">Reset to default</MiButton>
    </header>

    <div class="mi:grid mi:gap-3 mi:@[640px]/cct:grid-cols-2 mi:@[640px]/cct:items-start">
      <div class="mi:grid mi:gap-2.5 mi:p-4 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0">
        <div class="mi:flex mi:items-baseline mi:justify-between mi:gap-2">
          <MiText as="h3" variant="subheadline" weight="semibold">Available</MiText>
          <MiText variant="caption" tone="label3">{{ hidden.length }} fields</MiText>
        </div>
        <MiSearch v-model="query" size="compact" placeholder="Find a field" aria-label="Find a field" />
        <div v-for="g in groups" :key="g.name" class="mi:grid mi:gap-1">
          <MiText variant="caption" tone="label2" weight="semibold" class="mi:uppercase! mi:tracking-[.06em]! mi:pt-1">{{ g.name }}</MiText>
          <ul class="mi:grid mi:gap-0.5 mi:m-0 mi:p-0 mi:[list-style:none]">
            <li v-for="f in g.fields" :key="f.id" class="mi:flex mi:items-center mi:justify-between mi:gap-2 mi:min-h-9.5 mi:pt-0 mi:pr-1 mi:pb-0 mi:pl-2.5 mi:rounded-sm mi:hover:bg-fill4">
              <span class="mi:min-w-0 mi:text-[14px] mi:wrap-anywhere">{{ f.label }}</span>
              <MiIconButton :label="`Show ${f.label}`" variant="gray" size="small" :disabled="full" @click="show(f.id)">
                <MiIcon name="plus" :size="14" />
              </MiIconButton>
            </li>
          </ul>
        </div>
        <MiText v-if="!groups.length" variant="footnote" tone="label3">No hidden field matches “{{ query }}”.</MiText>
      </div>

      <div class="mi:grid mi:gap-2.5 mi:p-4 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0">
        <div class="mi:flex mi:items-baseline mi:justify-between mi:gap-2">
          <MiText as="h3" variant="subheadline" weight="semibold">Shown, in order</MiText>
          <MiText variant="caption" :tone="full ? 'orange' : 'label3'" tabular>{{ visible.length }} / {{ max }}</MiText>
        </div>
        <!-- Order ID is pinned first; the rest reorder by drag or by keyboard on the handle. -->
        <div class="mi:flex mi:items-center mi:gap-1.5 mi:min-h-9.5 mi:py-0 mi:px-2.5 mi:rounded-sm mi:text-[14px] mi:text-label2 mi:[border:1px_dashed_var(--mi-sep)]"><MiIcon name="lock" :size="13" /> Order ID</div>
        <MiSortable
          :model-value="rows" handle bare :gap="4" aria-label="Shown columns" :item-label="(item: Record<string, unknown>) => String(item.label)"
          @update:model-value="visible = $event.map(i => String(i.id))"
        >
          <template #default="{ item }">
            <div class="mi:flex mi:items-center mi:justify-between mi:gap-2 mi:min-h-9.5 mi:pt-0 mi:pr-1 mi:pb-0 mi:pl-2.5 mi:rounded-sm mi:bg-fill4">
              <span class="mi:min-w-0 mi:text-[14px] mi:wrap-anywhere">{{ item.label }}</span>
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
    <div class="mi:flex mi:gap-px mi:overflow-x-auto mi:rounded-md mi:bg-sep mi:[scrollbar-width:thin]" role="group" tabindex="0" aria-label="Table header preview">
      <span class="mi:flex-[none] mi:py-[9px] mi:px-3.5 mi:text-[12px] mi:font-semibold mi:whitespace-nowrap mi:text-label mi:bg-card">Order ID</span>
      <span v-for="r in rows" :key="r.id" class="mi:flex-[none] mi:py-[9px] mi:px-3.5 mi:text-[12px] mi:font-semibold mi:whitespace-nowrap mi:text-label2 mi:bg-card">{{ r.label }}</span>
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

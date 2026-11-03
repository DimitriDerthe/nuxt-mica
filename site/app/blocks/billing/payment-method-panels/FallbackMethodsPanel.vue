<template>
  <section class="mi:@container mi:flex mi:flex-col mi:gap-4 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:font-mi mi:text-label" aria-labelledby="fmp-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-3">
      <div>
        <MiText id="fmp-title" as="h2" variant="title3" weight="bold">Payment methods</MiText>
        <MiText variant="footnote" tone="label2">Drag to set the order. If a charge fails, we try the next method in line.</MiText>
      </div>
      <MiButton variant="tinted" size="small">
        <template #leading><MiIcon name="plus" :size="15" /></template>
        Add method
      </MiButton>
    </header>

    <MiSortable :model-value="methods" handle bare :gap="0" aria-label="Payment methods, in charge order" :item-label="labelOf" class="mi:rounded-lg mi:border mi:border-sep mi:[&_.mi-sort__item+.mi-sort__item]:border-t mi:[&_.mi-sort__item+.mi-sort__item]:border-t-sep" @update:model-value="reorder">
      <template #default="{ item, index }">
        <div class="mi:relative mi:grid mi:grid-cols-[auto_auto_minmax(0,_1fr)] mi:items-center mi:gap-y-1.5 mi:gap-x-3 mi:pt-0.5 mi:pr-0 mi:pb-0.5 mi:pl-1 mi:rounded-md mi:@[560px]:grid-cols-[auto_auto_minmax(0,_1fr)_auto]" :class="confirming === item.id ? 'mi:[background:color-mix(in_srgb,_var(--mi-red)_7%,_var(--mi-card))]' : ''">
          <span class="mi:grid mi:place-items-center mi:w-5.5 mi:h-5.5 mi:rounded-[50%] mi:text-[11px] mi:font-bold " :class="index === 0 ? 'mi:[background:var(--mi-p)] mi:text-p-on' : 'mi:text-label2 mi:[background:var(--mi-fill3)]'" aria-hidden="true">{{ index + 1 }}</span>
          <span class="mi:grid mi:place-items-center mi:w-11.5 mi:h-8 mi:rounded-[7px] mi:text-[10px] mi:font-extrabold mi:tracking-[.04em] " :class="KIND[item.kind]" aria-hidden="true">{{ item.short }}</span>
          <div class="mi:min-w-0">
            <MiText variant="subheadline" weight="semibold" :lines="1">{{ item.label }}</MiText>
            <MiText variant="caption" :tone="item.warn ? 'orange' : 'label2'" :lines="1">{{ item.warn || item.sub }}</MiText>
          </div>

          <div v-if="confirming === item.id" class="mi:col-[2_/_-1] mi:flex mi:items-center mi:gap-2 mi:[justify-content:flex-end] mi:@[560px]:col-[auto] mi:@[560px]:[justify-content:flex-end]" role="group" :aria-label="'Remove ' + item.label + '?'">
            <MiButton variant="plain" size="small" @click="confirming = ''">Keep</MiButton>
            <MiButton variant="destructive" size="small" @click="remove(item.id)">Remove</MiButton>
          </div>
          <div v-else class="mi:col-[2_/_-1] mi:flex mi:items-center mi:gap-2 mi:@[560px]:col-[auto] mi:@[560px]:[justify-content:flex-end]">
            <MiBadge v-if="index === 0" tone="primary" label="Charged first" />
            <MiBadge v-else tone="neutral" variant="outline" :label="'Fallback ' + index" />
            <MiIconButton :label="'Remove ' + item.label" variant="plain" size="small" :disabled="methods.length === 1" @click="confirming = item.id">
              <MiIcon name="trash" :size="16" />
            </MiIconButton>
          </div>
        </div>
      </template>
    </MiSortable>

    <div class="mi:flex mi:items-center mi:justify-between mi:gap-3.5">
      <div class="mi:min-w-0">
        <MiText id="fmp-retry" variant="subheadline" weight="medium">Smart retries</MiText>
        <MiText variant="caption" tone="label2">{{ retries ? 'Retry each method up to 3 times over 7 days before pausing the workspace.' : 'A failed charge pauses the workspace after 24 hours.' }}</MiText>
      </div>
      <MiSwitch v-model="retries" aria-labelledby="fmp-retry" />
    </div>

    <footer class="mi:flex mi:items-center mi:gap-2.5 mi:py-3 mi:px-3.5 mi:rounded-lg mi:[background:var(--mi-p-tint)] mi:text-p-text" aria-live="polite">
      <MiIcon name="calendar" :size="18" />
      <MiText variant="footnote" class="mi:[&_strong]:text-label">Next charge <strong>€384.00</strong> on 1 Dec to <strong>{{ methods[0]?.label }}</strong></MiText>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const KIND: Record<string, string> = {
  visa: 'mi:text-p-on mi:[background:linear-gradient(135deg,_var(--mi-p),_color-mix(in_srgb,_var(--mi-p)_50%,_var(--mi-s)))]',
  mc: 'mi:text-s-on mi:[background:linear-gradient(135deg,_var(--mi-s),_color-mix(in_srgb,_var(--mi-s)_50%,_var(--mi-orange)))]',
  sepa: 'mi:text-label mi:[background:var(--mi-fill3)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]'
}
type Method = { id: string, kind: 'visa' | 'mc' | 'sepa', short: string, label: string, sub: string, warn?: string }

const methods = ref<Method[]>([
  { id: 'visa', kind: 'visa', short: 'VISA', label: 'Visa •••• 4242', sub: 'Expires 08/28 · Camille Moreau' },
  { id: 'mc', kind: 'mc', short: 'MC', label: 'Mastercard •••• 5100', sub: 'Expires 12/26', warn: 'Expires next month · update it' },
  { id: 'sepa', kind: 'sepa', short: 'SEPA', label: 'SEPA Direct Debit •••• 3000', sub: 'Fernhouse SARL · mandate FH-2209' }
])
const confirming = ref('')
const retries = ref(true)

const labelOf = (item: Record<string, unknown>) => String(item.label)
function reorder(list: Record<string, unknown>[]) { methods.value = list as unknown as Method[] }
function remove(id: string) {
  methods.value = methods.value.filter(m => m.id !== id)
  confirming.value = ''
}
</script>

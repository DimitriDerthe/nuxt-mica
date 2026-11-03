<template>
  <section class="fmp mi:@container mi:flex mi:flex-col mi:gap-4 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:font-mi mi:text-label" aria-labelledby="fmp-title">
    <header class="fmp__head mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-3">
      <div>
        <MiText id="fmp-title" as="h2" variant="title3" weight="bold">Payment methods</MiText>
        <MiText variant="footnote" tone="label2">Drag to set the order. If a charge fails, we try the next method in line.</MiText>
      </div>
      <MiButton variant="tinted" size="small">
        <template #leading><MiIcon name="plus" :size="15" /></template>
        Add method
      </MiButton>
    </header>

    <MiSortable :model-value="methods" handle bare :gap="0" aria-label="Payment methods, in charge order" :item-label="labelOf" class="fmp__list" @update:model-value="reorder">
      <template #default="{ item, index }">
        <div class="fmp__row mi:relative mi:grid mi:grid-cols-[auto_auto_minmax(0,_1fr)] mi:items-center mi:gap-y-1.5 mi:gap-x-3 mi:pt-0.5 mi:pr-0 mi:pb-0.5 mi:pl-1 mi:rounded-md mi:[&.is-confirming]:[background:color-mix(in_srgb,_var(--mi-red)_7%,_var(--mi-card))] mi:@[560px]:grid-cols-[auto_auto_minmax(0,_1fr)_auto]" :class="{ 'is-first': index === 0, 'is-confirming': confirming === item.id }">
          <span class="fmp__step mi:grid mi:place-items-center mi:w-5.5 mi:h-5.5 mi:rounded-[50%] mi:text-[11px] mi:font-bold mi:text-label2 mi:[background:var(--mi-fill3)] mi:[.fmp__row.is-first_&]:[background:var(--mi-p)]" aria-hidden="true">{{ index + 1 }}</span>
          <span class="fmp__tile mi:grid mi:place-items-center mi:w-11.5 mi:h-8 mi:rounded-[7px] mi:text-[10px] mi:font-extrabold mi:tracking-[.04em] mi:text-p-on mi:[background:linear-gradient(135deg,_var(--mi-p),_color-mix(in_srgb,_var(--mi-p)_50%,_var(--mi-s)))] mi:[&.is-mc]:text-s-on mi:[&.is-mc]:[background:linear-gradient(135deg,_var(--mi-s),_color-mix(in_srgb,_var(--mi-s)_50%,_var(--mi-orange)))] mi:[&.is-sepa]:text-label mi:[&.is-sepa]:[background:var(--mi-fill3)] mi:[&.is-sepa]:shadow-[inset_0_0_0_1px_var(--mi-sep)]" :class="'is-' + item.kind" aria-hidden="true">{{ item.short }}</span>
          <div class="fmp__text mi:min-w-0">
            <MiText variant="subheadline" weight="semibold" :lines="1">{{ item.label }}</MiText>
            <MiText variant="caption" :tone="item.warn ? 'orange' : 'label2'" :lines="1">{{ item.warn || item.sub }}</MiText>
          </div>

          <div v-if="confirming === item.id" class="fmp__confirm mi:col-[2_/_-1] mi:flex mi:items-center mi:gap-2 mi:[justify-content:flex-end] mi:@[560px]:col-[auto] mi:@[560px]:[justify-content:flex-end]" role="group" :aria-label="'Remove ' + item.label + '?'">
            <MiButton variant="plain" size="small" @click="confirming = ''">Keep</MiButton>
            <MiButton variant="destructive" size="small" @click="remove(item.id)">Remove</MiButton>
          </div>
          <div v-else class="fmp__end mi:col-[2_/_-1] mi:flex mi:items-center mi:gap-2 mi:@[560px]:col-[auto] mi:@[560px]:[justify-content:flex-end]">
            <MiBadge v-if="index === 0" tone="primary" label="Charged first" />
            <MiBadge v-else tone="neutral" variant="outline" :label="'Fallback ' + index" />
            <MiIconButton :label="'Remove ' + item.label" variant="plain" size="small" :disabled="methods.length === 1" @click="confirming = item.id">
              <MiIcon name="trash" :size="16" />
            </MiIconButton>
          </div>
        </div>
      </template>
    </MiSortable>

    <div class="fmp__retry mi:flex mi:items-center mi:justify-between mi:gap-3.5">
      <div class="fmp__retry-text mi:min-w-0">
        <MiText id="fmp-retry" variant="subheadline" weight="medium">Smart retries</MiText>
        <MiText variant="caption" tone="label2">{{ retries ? 'Retry each method up to 3 times over 7 days before pausing the workspace.' : 'A failed charge pauses the workspace after 24 hours.' }}</MiText>
      </div>
      <MiSwitch v-model="retries" aria-labelledby="fmp-retry" />
    </div>

    <footer class="fmp__next mi:flex mi:items-center mi:gap-2.5 mi:py-3 mi:px-3.5 mi:rounded-lg mi:[background:var(--mi-p-tint)] mi:text-p-text" aria-live="polite">
      <MiIcon name="calendar" :size="18" />
      <MiText variant="footnote">Next charge <strong>€384.00</strong> on 1 Dec to <strong>{{ methods[0]?.label }}</strong></MiText>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

<style scoped>
.fmp__list { border-radius: var(--mi-radius-l); border: 1px solid var(--mi-sep); }
/* One bordered list with hairlines between rows; the rows themselves are bare. */
.fmp__list :deep(.mi-sort__item + .mi-sort__item) { border-top: 1px solid var(--mi-sep); }
.fmp__row.is-first .fmp__step { color: var(--mi-p-on); }
.fmp__next :deep(strong) { color: var(--mi-label); }
</style>

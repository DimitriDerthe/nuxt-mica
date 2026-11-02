<template>
  <section class="fmp" aria-labelledby="fmp-title">
    <header class="fmp__head">
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
        <div class="fmp__row" :class="{ 'is-first': index === 0, 'is-confirming': confirming === item.id }">
          <span class="fmp__step" aria-hidden="true">{{ index + 1 }}</span>
          <span class="fmp__tile" :class="'is-' + item.kind" aria-hidden="true">{{ item.short }}</span>
          <div class="fmp__text">
            <MiText variant="subheadline" weight="semibold" :lines="1">{{ item.label }}</MiText>
            <MiText variant="caption" :tone="item.warn ? 'orange' : 'label2'" :lines="1">{{ item.warn || item.sub }}</MiText>
          </div>

          <div v-if="confirming === item.id" class="fmp__confirm" role="group" :aria-label="'Remove ' + item.label + '?'">
            <MiButton variant="plain" size="small" @click="confirming = ''">Keep</MiButton>
            <MiButton variant="destructive" size="small" @click="remove(item.id)">Remove</MiButton>
          </div>
          <div v-else class="fmp__end">
            <MiBadge v-if="index === 0" tone="primary" label="Charged first" />
            <MiBadge v-else tone="neutral" variant="outline" :label="'Fallback ' + index" />
            <MiIconButton :label="'Remove ' + item.label" variant="plain" size="small" :disabled="methods.length === 1" @click="confirming = item.id">
              <MiIcon name="trash" :size="16" />
            </MiIconButton>
          </div>
        </div>
      </template>
    </MiSortable>

    <div class="fmp__retry">
      <div class="fmp__retry-text">
        <MiText id="fmp-retry" variant="subheadline" weight="medium">Smart retries</MiText>
        <MiText variant="caption" tone="label2">{{ retries ? 'Retry each method up to 3 times over 7 days before pausing the workspace.' : 'A failed charge pauses the workspace after 24 hours.' }}</MiText>
      </div>
      <MiSwitch v-model="retries" aria-labelledby="fmp-retry" />
    </div>

    <footer class="fmp__next" aria-live="polite">
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
/* Flex column, not grid: a grid row here was sized for the list's narrow layout and left an empty band under it. */
.fmp { container-type: inline-size; display: flex; flex-direction: column; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); }
.fmp__head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 12px; }

.fmp__list { border-radius: var(--mi-radius-l); border: 1px solid var(--mi-sep); }
/* One bordered list with hairlines between rows; the rows themselves are bare. */
.fmp__list :deep(.mi-sort__item + .mi-sort__item) { border-top: 1px solid var(--mi-sep); }
.fmp__row { position: relative; display: grid; grid-template-columns: auto auto minmax(0, 1fr); align-items: center; gap: 6px 12px; padding: 2px 0 2px 4px; border-radius: var(--mi-radius-m); }
.fmp__row.is-confirming { background: color-mix(in srgb, var(--mi-red) 7%, var(--mi-card)); }
.fmp__end, .fmp__confirm { grid-column: 2 / -1; display: flex; align-items: center; gap: 8px; }
.fmp__confirm { justify-content: flex-end; }
@container (min-width: 560px) {
  .fmp__row { grid-template-columns: auto auto minmax(0, 1fr) auto; }
  .fmp__end, .fmp__confirm { grid-column: auto; justify-content: flex-end; }
}
/* Chain: numbered steps joined by a hairline, so the retry order reads at a glance. */
.fmp__step { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; font-size: 11px; font-weight: 700; color: var(--mi-label2); background: var(--mi-fill3); }
.fmp__row.is-first .fmp__step { color: var(--mi-p-on); background: var(--mi-p); }
.fmp__tile { display: grid; place-items: center; width: 46px; height: 32px; border-radius: 7px; font-size: 10px; font-weight: 800; letter-spacing: .04em; color: var(--mi-p-on); background: linear-gradient(135deg, var(--mi-p), color-mix(in srgb, var(--mi-p) 50%, var(--mi-s))); }
.fmp__tile.is-mc { color: var(--mi-s-on); background: linear-gradient(135deg, var(--mi-s), color-mix(in srgb, var(--mi-s) 50%, var(--mi-orange))); }
.fmp__tile.is-sepa { color: var(--mi-label); background: var(--mi-fill3); box-shadow: inset 0 0 0 1px var(--mi-sep); }
.fmp__text { min-width: 0; }

.fmp__retry { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.fmp__retry-text { min-width: 0; }
.fmp__next { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: var(--mi-radius-l); background: var(--mi-p-tint); color: var(--mi-p-text); }
.fmp__next :deep(strong) { color: var(--mi-label); }
</style>

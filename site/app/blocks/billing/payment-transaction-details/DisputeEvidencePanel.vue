<template>
  <section class="dep" aria-labelledby="dep-title">
    <header class="dep__head">
      <div class="dep__id">
        <MiText variant="caption" tone="label2" weight="medium">Dispute dp_7Hq2 · charge of 12 October · Mastercard •••• 8810</MiText>
        <MiText id="dep-title" as="h2" variant="title3" weight="bold">Product not received</MiText>
        <MiText variant="footnote" tone="label2">Customer: Elodie Varga · order #31877 · 2× Walnut desk shelf</MiText>
      </div>
      <div class="dep__amount">
        <MiBadge :tone="status.tone" :label="status.label" dot />
        <p class="dep__big">$1,240.00</p>
        <MiText variant="caption" tone="label2">+ $15.00 dispute fee</MiText>
      </div>
    </header>

    <MiMeter
      :value="15" :max="21" label="Response window" caption="Opened 19 October" :hint="submitted ? 'Submitted' : '6 days left · due 9 November'"
      :color="submitted ? 'var(--mi-green)' : 'var(--mi-orange)'" value-text="15 of 21 days used"
    />

    <div class="dep__grid">
      <!-- Evidence checklist: the bank weighs these, so required items gate the submission. -->
      <div class="dep__col">
        <div class="dep__col-head">
          <MiText as="h3" variant="headline">Evidence</MiText>
          <MiText variant="caption" tone="label2">{{ attachedCount }} of {{ evidence.length }} attached</MiText>
        </div>
        <ul class="dep__list">
          <li v-for="e in evidence" :key="e.id" class="dep__item">
            <MiIcon :name="e.file ? 'check-circle-fill' : 'document'" :size="20" class="dep__icon" :class="{ 'is-on': e.file }" />
            <div class="dep__text">
              <MiText variant="subheadline" weight="medium">{{ e.label }} <span v-if="e.required" class="dep__req">Required</span></MiText>
              <MiText variant="caption" tone="label2" :lines="1">{{ e.file || e.hint }}</MiText>
            </div>
            <MiButton v-if="!e.file" variant="tinted" size="small" :disabled="submitted" @click="e.file = e.sample">Attach</MiButton>
            <MiIconButton v-else :label="'Remove ' + e.label" variant="plain" size="small" :disabled="submitted" @click="e.file = ''">
              <MiIcon name="close" :size="16" />
            </MiIconButton>
          </li>
        </ul>
      </div>

      <div class="dep__col">
        <MiText as="h3" variant="headline">Your response</MiText>
        <MiField label="Summary for the bank" :hint="rebuttal.trim().length < 80 ? `At least 80 characters (${rebuttal.trim().length} so far).` : 'Clear and factual reads best.'">
          <MiTextarea v-model="rebuttal" :rows="5" :maxlength="1000" counter :disabled="submitted" />
        </MiField>
        <MiAlert v-if="submitted" tone="success" title="Evidence submitted" message="The issuing bank usually decides within 60 to 75 days. We'll email you either way." />
        <MiAlert v-else-if="missing.length" tone="warning" :message="'Still needed: ' + missing.join(', ') + '.'" />
        <div class="dep__actions">
          <MiButton variant="destructive" soft :disabled="submitted">Accept dispute</MiButton>
          <MiButton :disabled="!canSubmit" @click="submitted = true">Submit evidence</MiButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Evidence { id: string, label: string, hint: string, sample: string, required: boolean, file: string }

const evidence = ref<Evidence[]>([
  { id: 'tracking', label: 'Carrier tracking', hint: 'Proof of delivery with date and address', sample: 'proof-of-delivery-4417.pdf · 182 KB', required: true, file: 'proof-of-delivery-4417.pdf · 182 KB' },
  { id: 'receipt', label: 'Receipt or invoice', hint: 'What the customer paid for', sample: 'invoice-31877.pdf · 64 KB', required: true, file: '' },
  { id: 'comms', label: 'Customer messages', hint: 'Emails or chat about the delivery', sample: 'support-thread-31877.pdf · 410 KB', required: false, file: '' },
  { id: 'signature', label: 'Signed delivery photo', hint: 'Photo or signature at the door', sample: 'doorstep-photo.jpg · 1.2 MB', required: false, file: '' }
])
const rebuttal = ref('The order shipped on 13 October and the carrier confirms delivery to the billing address on 16 October.')
const submitted = ref(false)

const attachedCount = computed(() => evidence.value.filter(e => e.file).length)
const missing = computed(() => evidence.value.filter(e => e.required && !e.file).map(e => e.label.toLowerCase()))
const canSubmit = computed(() => !submitted.value && !missing.value.length && rebuttal.value.trim().length >= 80)
const status = computed<{ tone: 'warning' | 'primary', label: string }>(() =>
  submitted.value ? { tone: 'primary', label: 'Under review' } : { tone: 'warning', label: 'Needs response' })
</script>

<style scoped>
.dep { container-type: inline-size; display: flex; flex-direction: column; gap: 20px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); }
.dep__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 14px; }
.dep__id { display: grid; gap: 2px; min-width: 0; }
.dep__amount { display: grid; justify-items: start; gap: 4px; }
@container (min-width: 620px) { .dep__amount { justify-items: end; } }
.dep__big { margin: 0; font-size: clamp(28px, 6cqi, 38px); font-weight: 700; letter-spacing: -.035em; font-variant-numeric: tabular-nums; }

.dep__grid { display: grid; gap: 20px; }
@container (min-width: 760px) { .dep__grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 28px; } }
.dep__col { display: grid; align-content: start; gap: 12px; min-width: 0; }
.dep__col-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }

.dep__list { display: grid; margin: 0; padding: 0; list-style: none; border: 1px solid var(--mi-sep); border-radius: var(--mi-radius-l); }
.dep__item { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 12px 14px; }
.dep__item + .dep__item { border-top: 1px solid var(--mi-sep); }
.dep__icon { color: var(--mi-label3); }
.dep__icon.is-on { color: var(--mi-green); }
.dep__text { min-width: 0; }
.dep__req { margin-left: 4px; font-size: 11px; font-weight: 600; color: var(--mi-orange-t); }

.dep__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
</style>

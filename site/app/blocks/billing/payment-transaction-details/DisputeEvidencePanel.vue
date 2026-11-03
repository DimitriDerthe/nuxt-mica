<template>
  <section class="mi:@container mi:flex mi:flex-col mi:gap-5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:font-mi mi:text-label" aria-labelledby="dep-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3.5">
      <div class="mi:grid mi:gap-0.5 mi:min-w-0">
        <MiText variant="caption" tone="label2" weight="medium">Dispute dp_7Hq2 · charge of 12 October · Mastercard •••• 8810</MiText>
        <MiText id="dep-title" as="h2" variant="title3" weight="bold">Product not received</MiText>
        <MiText variant="footnote" tone="label2">Customer: Elodie Varga · order #31877 · 2× Walnut desk shelf</MiText>
      </div>
      <div class="mi:grid mi:justify-items-start mi:gap-1 mi:@[620px]:justify-items-end">
        <MiBadge :tone="status.tone" :label="status.label" dot />
        <p class="mi:m-0 mi:text-[clamp(28px,_6cqi,_38px)] mi:font-bold mi:tracking-[-.035em] mi:tabular-nums">$1,240.00</p>
        <MiText variant="caption" tone="label2">+ $15.00 dispute fee</MiText>
      </div>
    </header>

    <MiMeter
      :value="15" :max="21" label="Response window" caption="Opened 19 October" :hint="submitted ? 'Submitted' : '6 days left · due 9 November'"
      :color="submitted ? 'var(--mi-green)' : 'var(--mi-orange)'" value-text="15 of 21 days used"
    />

    <div class="mi:grid mi:gap-5 mi:@[760px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:@[760px]:gap-7">
      <!-- Evidence checklist: the bank weighs these, so required items gate the submission. -->
      <div class="mi:grid mi:content-start mi:gap-3 mi:min-w-0">
        <div class="mi:flex mi:items-baseline mi:justify-between mi:gap-2.5">
          <MiText as="h3" variant="headline">Evidence</MiText>
          <MiText variant="caption" tone="label2">{{ attachedCount }} of {{ evidence.length }} attached</MiText>
        </div>
        <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:border mi:border-sep mi:rounded-lg">
          <li v-for="e in evidence" :key="e.id" class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:py-3 mi:px-3.5 mi:not-first:border-t mi:not-first:border-t-sep">
            <MiIcon :name="e.file ? 'check-circle-fill' : 'document'" :size="20" " :class="e.file ? 'mi:text-green' : 'mi:text-label3'" />
            <div class="mi:min-w-0">
              <MiText variant="subheadline" weight="medium">{{ e.label }} <span v-if="e.required" class="mi:ml-1 mi:text-[11px] mi:font-semibold mi:text-orange-t">Required</span></MiText>
              <MiText variant="caption" tone="label2" :lines="1">{{ e.file || e.hint }}</MiText>
            </div>
            <MiButton v-if="!e.file" variant="tinted" size="small" :disabled="submitted" @click="e.file = e.sample">Attach</MiButton>
            <MiIconButton v-else :label="'Remove ' + e.label" variant="plain" size="small" :disabled="submitted" @click="e.file = ''">
              <MiIcon name="close" :size="16" />
            </MiIconButton>
          </li>
        </ul>
      </div>

      <div class="mi:grid mi:content-start mi:gap-3 mi:min-w-0">
        <MiText as="h3" variant="headline">Your response</MiText>
        <MiField label="Summary for the bank" :hint="rebuttal.trim().length < 80 ? `At least 80 characters (${rebuttal.trim().length} so far).` : 'Clear and factual reads best.'">
          <MiTextarea v-model="rebuttal" :rows="5" :maxlength="1000" counter :disabled="submitted" />
        </MiField>
        <MiAlert v-if="submitted" tone="success" title="Evidence submitted" message="The issuing bank usually decides within 60 to 75 days. We'll email you either way." />
        <MiAlert v-else-if="missing.length" tone="warning" :message="'Still needed: ' + missing.join(', ') + '.'" />
        <div class="mi:flex mi:flex-wrap mi:[justify-content:flex-end] mi:gap-2">
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

<template>
  <section class="psr mi:@container mi:font-mi mi:text-label" aria-labelledby="psr-title">
    <div class="psr__card mi:grid mi:gap-5.5 mi:max-w-215 mi:mx-auto mi:py-6 mi:px-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[640px]:p-8">
      <header class="psr__head mi:grid mi:justify-items-center mi:gap-1.5">
        <!-- Check mark with a one-shot burst: transform and opacity keyframes only. -->
        <div class="psr__mark mi:relative mi:grid mi:place-items-center mi:w-22 mi:h-22 mi:mb-1.5" aria-hidden="true">
          <span v-for="n in 8" :key="n" class="psr__spark mi:absolute mi:left-1/2 mi:top-1/2 mi:w-1.5 mi:h-1.5 mi:m-[-3px] mi:rounded-[50%] mi:bg-green mi:opacity-0 mi:even:bg-p" :style="{ '--psr-a': n * 45 + 'deg' }" />
          <span class="psr__disc mi:grid mi:place-items-center mi:w-16 mi:h-16 mi:rounded-[50%] mi:bg-green mi:text-card mi:shadow-[0_0_0_8px_color-mix(in_srgb,_var(--mi-green)_16%,_transparent)]"><MiIcon name="check" :size="30" :weight="2.6" /></span>
        </div>
        <MiText id="psr-title" variant="title2" as="h2" weight="bold" align="center" balance>€4,860.00 is on its way</MiText>
        <MiText variant="footnote" tone="label2" align="center">To Atelier Nord · arrives Wednesday, 4 November</MiText>
      </header>

      <div class="psr__grid mi:grid mi:gap-6 mi:@[700px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:@[700px]:gap-8 mi:@[700px]:items-start">
        <!-- The receipt slides out of a slot, like a till printing it. -->
        <div class="psr__slot mi:relative mi:overflow-hidden mi:pt-1.5 mi:before:content-[''] mi:before:absolute mi:before:top-0 mi:before:right-0 mi:before:bottom-auto mi:before:left-0 mi:before:h-1.5 mi:before:rounded-[3px] mi:before:bg-fill2 mi:before:z-1">
          <div class="psr__receipt mi:grid mi:gap-4 mi:pt-5 mi:px-4.5 mi:pb-7 mi:bg-elev">
            <dl class="psr__lines mi:grid mi:gap-2.5 mi:m-0">
              <div class="mi:[.psr__lines_&]:flex mi:[.psr__lines_&]:justify-between mi:[.psr__lines_&]:gap-3 mi:[.psr__lines_&]:text-[14px]" v-for="l in lines" :key="l.k"><dt class="mi:[.psr__lines_&]:text-label2">{{ l.k }}</dt><dd class="mi:[.psr__lines_&]:m-0 mi:[.psr__lines_&]:tabular-nums mi:[.psr__lines_&]:text-end">{{ l.v }}</dd></div>
              <div class="psr__total mi:[.psr__lines_&]:flex mi:[.psr__lines_&]:justify-between mi:[.psr__lines_&]:gap-3 mi:[.psr__lines_&]:text-[14px] mi:pt-3 mi:[border-top:1px_dashed_var(--mi-sep)] mi:font-semibold"><dt class="mi:[.psr__lines_&]:text-label2 mi:[.psr__total_&]:text-label">Total sent</dt><dd class="mi:[.psr__lines_&]:m-0 mi:[.psr__lines_&]:tabular-nums mi:[.psr__lines_&]:text-end">€4,860.00</dd></div>
            </dl>
            <div class="psr__ref mi:flex mi:items-center mi:justify-between mi:gap-3 mi:py-2.5 mi:px-3 mi:rounded-md mi:bg-fill4">
              <div>
                <MiText variant="caption2" tone="label3">Reference</MiText>
                <p class="psr__mono mi:m-0 mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[14px] mi:tracking-[.04em]">PAY-7Q4M-2291</p>
              </div>
              <MiCopyButton value="PAY-7Q4M-2291" variant="ghost" icon-only label="Copy reference" />
            </div>
          </div>
        </div>

        <div class="psr__side mi:grid mi:gap-5.5">
          <div>
            <MiText variant="subheadline" as="h3" weight="semibold">Where it is now</MiText>
            <ol class="psr__track mi:[list-style:none] mi:mt-3 mi:mx-0 mi:mb-0 mi:p-0 mi:grid">
              <li class="mi:[.psr__track_li&]:relative mi:[.psr__track_li&]:grid-cols-[20px_1fr] mi:[.psr__track_li&]:gap-3 mi:[.psr__track_li&]:pb-4 mi:[.psr__track_li&:not(:last-child)]:before:content-[''] mi:[.psr__track_li&:not(:last-child)]:before:absolute mi:[.psr__track_li&:not(:last-child)]:before:left-[9px] mi:[.psr__track_li&:not(:last-child)]:before:top-4.5 mi:[.psr__track_li&:not(:last-child)]:before:bottom-0 mi:[.psr__track_li&:not(:last-child)]:before:w-0.5 mi:[.psr__track_li&:not(:last-child)]:before:bg-fill3 mi:[.psr__track_li&[data-state='done']]:before:bg-green" v-for="(s, i) in track" :key="s.label" :data-state="i < 1 ? 'done' : i === 1 ? 'now' : 'next'">
                <span class="psr__dot mi:w-5 mi:h-5 mi:rounded-[50%] mi:border-2 mi:border-fill2 mi:bg-card mi:box-border mi:[.psr__track_li[data-state='done']_&]:border-green mi:[.psr__track_li[data-state='done']_&]:bg-green mi:[.psr__track_li[data-state='now']_&]:border-p mi:[.psr__track_li[data-state='now']_&]:shadow-[inset_0_0_0_4px_var(--mi-card)] mi:[.psr__track_li[data-state='now']_&]:bg-p" aria-hidden="true" />
                <div>
                  <MiText class="mi:[.psr__track_li&]:relative mi:[.psr__track_li&]:grid-cols-[20px_1fr] mi:[.psr__track_li&]:gap-3 mi:[.psr__track_li&]:pb-4 mi:[.psr__track_li&:not(:last-child)]:before:content-[''] mi:[.psr__track_li&:not(:last-child)]:before:absolute mi:[.psr__track_li&:not(:last-child)]:before:left-[9px] mi:[.psr__track_li&:not(:last-child)]:before:top-4.5 mi:[.psr__track_li&:not(:last-child)]:before:bottom-0 mi:[.psr__track_li&:not(:last-child)]:before:w-0.5 mi:[.psr__track_li&:not(:last-child)]:before:bg-fill3 mi:[.psr__track_li&[data-state='done']]:before:bg-green" variant="footnote" weight="semibold">{{ s.label }}</MiText>
                  <MiText class="mi:[.psr__track_li&]:relative mi:[.psr__track_li&]:grid-cols-[20px_1fr] mi:[.psr__track_li&]:gap-3 mi:[.psr__track_li&]:pb-4 mi:[.psr__track_li&:not(:last-child)]:before:content-[''] mi:[.psr__track_li&:not(:last-child)]:before:absolute mi:[.psr__track_li&:not(:last-child)]:before:left-[9px] mi:[.psr__track_li&:not(:last-child)]:before:top-4.5 mi:[.psr__track_li&:not(:last-child)]:before:bottom-0 mi:[.psr__track_li&:not(:last-child)]:before:w-0.5 mi:[.psr__track_li&:not(:last-child)]:before:bg-fill3 mi:[.psr__track_li&[data-state='done']]:before:bg-green" variant="caption" tone="label2">{{ s.when }}</MiText>
                </div>
              </li>
            </ol>
          </div>

          <div class="psr__opts mi:grid mi:rounded-lg mi:border mi:border-sep">
            <div class="psr__opt mi:flex mi:items-center mi:justify-between mi:gap-3 mi:py-3 mi:px-3.5 mi:[.psr__opt+&]:border-t mi:[.psr__opt+&]:border-t-sep">
              <div>
                <MiText id="psr-notify" variant="footnote" weight="medium">Tell me when it lands</MiText>
                <MiText variant="caption" tone="label2">Push and email, once</MiText>
              </div>
              <MiSwitch v-model="notify" size="compact" aria-labelledby="psr-notify" />
            </div>
            <div class="psr__opt mi:flex mi:items-center mi:justify-between mi:gap-3 mi:py-3 mi:px-3.5 mi:[.psr__opt+&]:border-t mi:[.psr__opt+&]:border-t-sep">
              <div>
                <MiText id="psr-repeat" variant="footnote" weight="medium">Repeat monthly</MiText>
                <MiText variant="caption" tone="label2" aria-live="polite">{{ repeat ? 'Next on 2 December, same amount' : 'Retainer invoices from this payee' }}</MiText>
              </div>
              <MiSwitch v-model="repeat" size="compact" aria-labelledby="psr-repeat" />
            </div>
          </div>
        </div>
      </div>

      <footer class="psr__foot mi:flex mi:flex-wrap mi:[justify-content:flex-end] mi:gap-2.5 mi:pt-4.5 mi:border-t mi:border-t-sep">
        <MiButton variant="gray" @click="pdf = true">
          <template #leading><MiIcon :svg="downloadGlyph" :size="16" /></template>
          {{ pdf ? 'Receipt saved' : 'Download receipt' }}
        </MiButton>
        <MiButton>Pay another invoice</MiButton>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Sample payment; swap for your transfer record.
const lines = [
  { k: 'Invoice', v: 'INV-2026-0412' },
  { k: 'From', v: 'Operating account ··2048' },
  { k: 'Amount', v: '€4,860.00' },
  { k: 'Transfer fee', v: '€0.00' }
]
const track = [
  { label: 'Sent', when: 'Mon 2 Nov, 14:08' },
  { label: 'Cleared by our bank', when: 'Expected Tue 3 Nov, morning' },
  { label: 'In Atelier Nord’s account', when: 'Wed 4 Nov, by 18:00' }
]
const downloadGlyph = '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/>'

const notify = ref(true)
const repeat = ref(false)
const pdf = ref(false)
</script>

<style scoped>
.psr__disc {
  animation: psr-pop var(--mi-dur-4) var(--mi-spring) both;
}
.psr__spark { animation: psr-burst 900ms var(--mi-ease) 160ms both;
}
@keyframes psr-pop { from { transform: scale(.4); opacity: 0; } }
@keyframes psr-burst {
  0% { opacity: 1; transform: rotate(var(--psr-a)) translateY(-20px) scale(1); }
  100% { opacity: 0; transform: rotate(var(--psr-a)) translateY(-46px) scale(.4); }
}
.psr__receipt { border: 1px solid var(--mi-sep); border-top: 0;
  -webkit-mask: radial-gradient(circle 6px at 8px 100%, transparent 98%, var(--mi-label)) 0 0 / 16px 100% repeat-x;
  mask: radial-gradient(circle 6px at 8px 100%, transparent 98%, var(--mi-label)) 0 0 / 16px 100% repeat-x;
  animation: psr-print 900ms var(--mi-ease) 200ms both;
}
@keyframes psr-print { from { transform: translateY(-100%); } }
.psr__track li { display: grid; }
@media (prefers-reduced-motion: reduce) { .psr__disc, .psr__spark, .psr__receipt { animation: none; } }
</style>

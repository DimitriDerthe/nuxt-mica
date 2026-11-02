<template>
  <section class="psr" aria-labelledby="psr-title">
    <div class="psr__card">
      <header class="psr__head">
        <!-- Check mark with a one-shot burst: transform and opacity keyframes only. -->
        <div class="psr__mark" aria-hidden="true">
          <span v-for="n in 8" :key="n" class="psr__spark" :style="{ '--psr-a': n * 45 + 'deg' }" />
          <span class="psr__disc"><MiIcon name="check" :size="30" :weight="2.6" /></span>
        </div>
        <MiText id="psr-title" variant="title2" as="h2" weight="bold" align="center" balance>€4,860.00 is on its way</MiText>
        <MiText variant="footnote" tone="label2" align="center">To Atelier Nord · arrives Wednesday, 4 November</MiText>
      </header>

      <div class="psr__grid">
        <!-- The receipt slides out of a slot, like a till printing it. -->
        <div class="psr__slot">
          <div class="psr__receipt">
            <dl class="psr__lines">
              <div v-for="l in lines" :key="l.k"><dt>{{ l.k }}</dt><dd>{{ l.v }}</dd></div>
              <div class="psr__total"><dt>Total sent</dt><dd>€4,860.00</dd></div>
            </dl>
            <div class="psr__ref">
              <div>
                <MiText variant="caption2" tone="label3">Reference</MiText>
                <p class="psr__mono">PAY-7Q4M-2291</p>
              </div>
              <MiCopyButton value="PAY-7Q4M-2291" variant="ghost" icon-only label="Copy reference" />
            </div>
          </div>
        </div>

        <div class="psr__side">
          <div>
            <MiText variant="subheadline" as="h3" weight="semibold">Where it is now</MiText>
            <ol class="psr__track">
              <li v-for="(s, i) in track" :key="s.label" :data-state="i < 1 ? 'done' : i === 1 ? 'now' : 'next'">
                <span class="psr__dot" aria-hidden="true" />
                <div>
                  <MiText variant="footnote" weight="semibold">{{ s.label }}</MiText>
                  <MiText variant="caption" tone="label2">{{ s.when }}</MiText>
                </div>
              </li>
            </ol>
          </div>

          <div class="psr__opts">
            <div class="psr__opt">
              <div>
                <MiText id="psr-notify" variant="footnote" weight="medium">Tell me when it lands</MiText>
                <MiText variant="caption" tone="label2">Push and email, once</MiText>
              </div>
              <MiSwitch v-model="notify" size="compact" aria-labelledby="psr-notify" />
            </div>
            <div class="psr__opt">
              <div>
                <MiText id="psr-repeat" variant="footnote" weight="medium">Repeat monthly</MiText>
                <MiText variant="caption" tone="label2" aria-live="polite">{{ repeat ? 'Next on 2 December, same amount' : 'Retainer invoices from this payee' }}</MiText>
              </div>
              <MiSwitch v-model="repeat" size="compact" aria-labelledby="psr-repeat" />
            </div>
          </div>
        </div>
      </div>

      <footer class="psr__foot">
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
.psr { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.psr__card { display: grid; gap: 22px; max-width: 860px; margin-inline: auto; padding: 24px 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
@container (min-width: 640px) { .psr__card { padding: 32px; } }

.psr__head { display: grid; justify-items: center; gap: 6px; }
.psr__mark { position: relative; display: grid; place-items: center; width: 88px; height: 88px; margin-bottom: 6px; }
.psr__disc {
  display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%;
  background: var(--mi-green); color: var(--mi-card); box-shadow: 0 0 0 8px color-mix(in srgb, var(--mi-green) 16%, transparent);
  animation: psr-pop var(--mi-dur-4) var(--mi-spring) both;
}
.psr__spark {
  position: absolute; left: 50%; top: 50%; width: 6px; height: 6px; margin: -3px; border-radius: 50%; background: var(--mi-green);
  opacity: 0; animation: psr-burst 900ms var(--mi-ease) 160ms both;
}
.psr__spark:nth-child(even) { background: var(--mi-p); }
@keyframes psr-pop { from { transform: scale(.4); opacity: 0; } }
@keyframes psr-burst {
  0% { opacity: 1; transform: rotate(var(--psr-a)) translateY(-20px) scale(1); }
  100% { opacity: 0; transform: rotate(var(--psr-a)) translateY(-46px) scale(.4); }
}

.psr__grid { display: grid; gap: 24px; }
@container (min-width: 700px) { .psr__grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 32px; align-items: start; } }

.psr__slot { position: relative; overflow: hidden; padding-top: 6px; }
.psr__slot::before { content: ""; position: absolute; inset: 0 0 auto; height: 6px; border-radius: 3px; background: var(--mi-fill2); z-index: 1; }
.psr__receipt {
  display: grid; gap: 16px; padding: 20px 18px 28px; background: var(--mi-elev); border: 1px solid var(--mi-sep); border-top: 0;
  /* Torn edge: a row of round notches cut out of the bottom. */
  -webkit-mask: radial-gradient(circle 6px at 8px 100%, transparent 98%, var(--mi-label)) 0 0 / 16px 100% repeat-x;
  mask: radial-gradient(circle 6px at 8px 100%, transparent 98%, var(--mi-label)) 0 0 / 16px 100% repeat-x;
  animation: psr-print 900ms var(--mi-ease) 200ms both;
}
@keyframes psr-print { from { transform: translateY(-100%); } }
.psr__lines { display: grid; gap: 10px; margin: 0; }
.psr__lines div { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; }
.psr__lines dt { color: var(--mi-label2); }
.psr__lines dd { margin: 0; font-variant-numeric: tabular-nums; text-align: end; }
.psr__total { padding-top: 12px; border-top: 1px dashed var(--mi-sep); font-weight: 600; }
.psr__total dt { color: var(--mi-label); }
.psr__ref { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.psr__mono { margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; letter-spacing: .04em; }

.psr__side { display: grid; gap: 22px; }
.psr__track { list-style: none; margin: 12px 0 0; padding: 0; display: grid; }
.psr__track li { position: relative; display: grid; grid-template-columns: 20px 1fr; gap: 12px; padding-bottom: 16px; }
.psr__track li:not(:last-child)::before { content: ""; position: absolute; left: 9px; top: 18px; bottom: 0; width: 2px; background: var(--mi-fill3); }
.psr__track li[data-state="done"]::before { background: var(--mi-green); }
.psr__dot { width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--mi-fill2); background: var(--mi-card); box-sizing: border-box; }
.psr__track li[data-state="done"] .psr__dot { border-color: var(--mi-green); background: var(--mi-green); }
.psr__track li[data-state="now"] .psr__dot { border-color: var(--mi-p); box-shadow: inset 0 0 0 4px var(--mi-card); background: var(--mi-p); }

.psr__opts { display: grid; border-radius: var(--mi-radius-l); border: 1px solid var(--mi-sep); }
.psr__opt { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; }
.psr__opt + .psr__opt { border-top: 1px solid var(--mi-sep); }

.psr__foot { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; padding-top: 18px; border-top: 1px solid var(--mi-sep); }
@media (prefers-reduced-motion: reduce) { .psr__disc, .psr__spark, .psr__receipt { animation: none; } }
</style>

<template>
  <section class="ccc" aria-labelledby="ccc-title">
    <div class="ccc__stage">
      <!-- Faux storefront behind the prompt, drawn with tokens and kept out of the accessibility tree. -->
      <div class="ccc__site" aria-hidden="true">
        <div class="ccc__nav"><i /><i /><i /><i /></div>
        <div class="ccc__hero"><i /><i /><i /></div>
        <div class="ccc__tiles"><i v-for="n in 4" :key="n" /></div>
      </div>

      <Transition name="ccc-swap" mode="out-in">
        <div v-if="!saved" key="card" class="ccc__card" role="region" aria-labelledby="ccc-title">
          <div class="ccc__top">
            <span class="ccc__glyph" aria-hidden="true"><i /><i /><i /></span>
            <div class="ccc__copy">
              <MiText id="ccc-title" variant="headline" as="h2">Cookies, on your terms</MiText>
              <MiText variant="footnote" tone="label2">
                Linden &amp; Oak needs a few cookies to run the shop. The rest help us improve it and are off until you say yes.
              </MiText>
            </div>
          </div>

          <div v-if="choosing" class="ccc__kinds">
            <div v-for="k in kinds" :key="k.id" class="ccc__kind">
              <div class="ccc__kind-text">
                <MiText :id="'ccc-k-' + k.id" variant="footnote" weight="semibold">{{ k.label }}</MiText>
                <MiText variant="caption" tone="label2">{{ k.hint }}</MiText>
              </div>
              <MiBadge v-if="k.locked" label="Always on" tone="neutral" variant="outline" />
              <MiSwitch v-else v-model="k.on" size="compact" :aria-labelledby="'ccc-k-' + k.id" />
            </div>
          </div>

          <!-- Reject and accept carry the same weight; neither is the easy way out. -->
          <div class="ccc__actions">
            <MiButton variant="gray" @click="decide('none')">Reject all</MiButton>
            <MiButton variant="gray" @click="decide('all')">Accept all</MiButton>
            <MiButton v-if="choosing" variant="filled" @click="decide('mine')">Save {{ onCount }} of {{ kinds.length }}</MiButton>
            <MiButton v-else variant="plain" @click="choosing = true">Choose</MiButton>
          </div>
          <MiTextLink href="#" :chevron="false" class="ccc__policy">Read the cookie policy</MiTextLink>
        </div>

        <!-- After a decision the prompt shrinks to a pill that reopens it. -->
        <div v-else key="pill" class="ccc__pill">
          <MiIcon name="check-circle-fill" :size="18" class="ccc__ok" />
          <MiText variant="footnote" weight="medium">{{ summary }}</MiText>
          <MiButton variant="plain" size="small" @click="saved = false">Change</MiButton>
        </div>
      </Transition>
      <p class="ccc__sr" role="status" aria-live="polite">{{ saved ? summary : '' }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const kinds = reactive([
  { id: 'needed', label: 'Needed to run the shop', hint: 'Cart, sign-in, fraud checks', on: true, locked: true },
  { id: 'prefs', label: 'Preferences', hint: 'Language, currency, recently viewed', on: false, locked: false },
  { id: 'stats', label: 'Anonymous statistics', hint: 'Which pages work, aggregated, no profiles', on: false, locked: false },
  { id: 'ads', label: 'Advertising', hint: 'Measures campaigns on 3 partner sites', on: false, locked: false }
])

const choosing = ref(false)
const saved = ref(false)
const onCount = computed(() => kinds.filter(k => k.on).length)
const summary = computed(() => onCount.value === kinds.length
  ? 'All cookies allowed'
  : onCount.value === 1 ? 'Only needed cookies' : `${onCount.value} of ${kinds.length} kinds allowed`)

function decide(mode: 'none' | 'all' | 'mine') {
  if (mode !== 'mine') kinds.forEach((k) => { k.on = k.locked || mode === 'all' })
  saved.value = true
  choosing.value = false
}
</script>

<style scoped>
.ccc { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.ccc__stage { position: relative; display: grid; align-content: end; justify-items: center; min-height: 440px; padding: 16px; border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate; background: var(--mi-page); }
@container (min-width: 720px) { .ccc__stage { justify-items: start; padding: 24px; } }

.ccc__site { position: absolute; inset: 0; z-index: -1; display: grid; align-content: start; gap: 18px; padding: 18px; opacity: .7; }
.ccc__site i { display: block; border-radius: var(--mi-radius-m); background: var(--mi-fill3); }
.ccc__nav { display: flex; gap: 12px; }
.ccc__nav i { width: 54px; height: 12px; }
.ccc__nav i:first-child { width: 90px; background: var(--mi-label3); }
.ccc__hero { display: grid; gap: 10px; padding: 26px 18px; border-radius: var(--mi-radius-xl); background: linear-gradient(135deg, var(--mi-p-tint), color-mix(in srgb, var(--mi-s) 12%, transparent)); }
.ccc__hero i { width: 60%; height: 18px; }
.ccc__hero i:nth-child(2) { width: 40%; height: 12px; }
.ccc__hero i:nth-child(3) { width: 96px; height: 28px; border-radius: 999px; background: var(--mi-p); opacity: .6; }
.ccc__tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.ccc__tiles i { aspect-ratio: 3 / 4; background: var(--mi-card); box-shadow: var(--mi-sh1); }

.ccc__card { display: grid; gap: 14px; width: 100%; max-width: 440px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-elev); box-shadow: var(--mi-sh3); border: 1px solid var(--mi-sep); }
.ccc__top { display: flex; gap: 14px; align-items: flex-start; }
.ccc__copy { display: grid; gap: 4px; min-width: 0; }
/* Cookie mark: a brand disc with three crumbs. */
.ccc__glyph { position: relative; flex: none; width: 40px; height: 40px; border-radius: 50%; background: var(--mi-p-tint); }
.ccc__glyph i { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: var(--mi-p); }
.ccc__glyph i:nth-child(1) { left: 11px; top: 12px; }
.ccc__glyph i:nth-child(2) { left: 22px; top: 20px; width: 5px; height: 5px; }
.ccc__glyph i:nth-child(3) { left: 13px; top: 25px; width: 4px; height: 4px; }

.ccc__kinds { display: grid; border-radius: var(--mi-radius-l); background: var(--mi-fill4); animation: ccc-open var(--mi-dur-3) var(--mi-spring) both; }
.ccc__kind { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; }
.ccc__kind + .ccc__kind { border-top: 1px solid var(--mi-sep); }
.ccc__kind-text { display: grid; min-width: 0; }
@keyframes ccc-open { from { opacity: 0; transform: translateY(-4px); } }

.ccc__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ccc__actions > :last-child { grid-column: 1 / -1; }
@container (min-width: 420px) { .ccc__actions { grid-template-columns: 1fr 1fr auto; } .ccc__actions > :last-child { grid-column: auto; } }
.ccc__policy { justify-self: start; font-size: 13px; }

.ccc__pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 6px 6px 14px; border-radius: 999px; background: var(--mi-elev); box-shadow: var(--mi-sh2); border: 1px solid var(--mi-sep); }
.ccc__ok { color: var(--mi-green); }
.ccc__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.ccc-swap-enter-active, .ccc-swap-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.ccc-swap-enter-from, .ccc-swap-leave-to { opacity: 0; transform: translateY(10px) scale(.97); }
@media (prefers-reduced-motion: reduce) { .ccc__kinds { animation: none; } .ccc-swap-enter-active, .ccc-swap-leave-active { transition: none; } }
</style>

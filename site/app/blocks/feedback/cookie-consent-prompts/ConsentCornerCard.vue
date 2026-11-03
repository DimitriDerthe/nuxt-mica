<template>
  <section class="ccc mi:@container mi:font-mi mi:text-label" aria-labelledby="ccc-title">
    <div class="ccc__stage mi:relative mi:grid mi:content-end mi:justify-items-center mi:min-h-110 mi:p-4 mi:rounded-xl mi:overflow-hidden mi:isolate mi:[background:var(--mi-page)] mi:@[720px]:justify-items-start mi:@[720px]:p-6">
      <!-- Faux storefront behind the prompt, drawn with tokens and kept out of the accessibility tree. -->
      <div class="ccc__site mi:absolute mi:inset-0 mi:-z-1 mi:grid mi:content-start mi:gap-4.5 mi:p-4.5 mi:opacity-70" aria-hidden="true">
        <div class="ccc__nav mi:flex mi:gap-3"><i class="mi:[.ccc__site_&]:block" /><i class="mi:[.ccc__site_&]:block" /><i class="mi:[.ccc__site_&]:block" /><i class="mi:[.ccc__site_&]:block" /></div>
        <div class="ccc__hero mi:grid mi:gap-2.5 mi:py-6.5 mi:px-4.5 mi:rounded-xl mi:[background:linear-gradient(135deg,_var(--mi-p-tint),_color-mix(in_srgb,_var(--mi-s)_12%,_transparent))]"><i class="mi:[.ccc__site_&]:block mi:[.ccc__hero_&:nth-child(3)]:rounded-[999px] mi:[.ccc__hero_&:nth-child(3)]:opacity-60" /><i class="mi:[.ccc__site_&]:block mi:[.ccc__hero_&:nth-child(3)]:rounded-[999px] mi:[.ccc__hero_&:nth-child(3)]:opacity-60" /><i class="mi:[.ccc__site_&]:block mi:[.ccc__hero_&:nth-child(3)]:rounded-[999px] mi:[.ccc__hero_&:nth-child(3)]:opacity-60" /></div>
        <div class="ccc__tiles mi:grid mi:grid-cols-[repeat(4,_1fr)] mi:gap-2.5"><i class="mi:[.ccc__site_&]:block mi:[.ccc__tiles_&]:aspect-[3_/_4] mi:[.ccc__tiles_&]:shadow-1" v-for="n in 4" :key="n" /></div>
      </div>

      <Transition name="ccc-swap" mode="out-in">
        <div v-if="!saved" key="card" class="ccc__card mi:grid mi:gap-3.5 mi:w-full mi:max-w-110 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-elev)] mi:shadow-3 mi:border mi:border-sep" role="region" aria-labelledby="ccc-title">
          <div class="ccc__top mi:flex mi:gap-3.5 mi:[align-items:flex-start]">
            <span class="ccc__glyph mi:relative mi:flex-[none] mi:w-10 mi:h-10 mi:rounded-[50%] mi:[background:var(--mi-p-tint)]" aria-hidden="true"><i class="mi:[.ccc__glyph_&]:absolute mi:[.ccc__glyph_&:nth-child(1)]:left-[11px] mi:[.ccc__glyph_&:nth-child(1)]:top-3 mi:[.ccc__glyph_&:nth-child(2)]:left-5.5 mi:[.ccc__glyph_&:nth-child(2)]:top-5 mi:[.ccc__glyph_&:nth-child(3)]:left-[13px] mi:[.ccc__glyph_&:nth-child(3)]:top-[25px]" /><i class="mi:[.ccc__glyph_&]:absolute mi:[.ccc__glyph_&:nth-child(1)]:left-[11px] mi:[.ccc__glyph_&:nth-child(1)]:top-3 mi:[.ccc__glyph_&:nth-child(2)]:left-5.5 mi:[.ccc__glyph_&:nth-child(2)]:top-5 mi:[.ccc__glyph_&:nth-child(3)]:left-[13px] mi:[.ccc__glyph_&:nth-child(3)]:top-[25px]" /><i class="mi:[.ccc__glyph_&]:absolute mi:[.ccc__glyph_&:nth-child(1)]:left-[11px] mi:[.ccc__glyph_&:nth-child(1)]:top-3 mi:[.ccc__glyph_&:nth-child(2)]:left-5.5 mi:[.ccc__glyph_&:nth-child(2)]:top-5 mi:[.ccc__glyph_&:nth-child(3)]:left-[13px] mi:[.ccc__glyph_&:nth-child(3)]:top-[25px]" /></span>
            <div class="ccc__copy mi:grid mi:gap-1 mi:min-w-0">
              <MiText id="ccc-title" variant="headline" as="h2">Cookies, on your terms</MiText>
              <MiText variant="footnote" tone="label2">
                Linden &amp; Oak needs a few cookies to run the shop. The rest help us improve it and are off until you say yes.
              </MiText>
            </div>
          </div>

          <div v-if="choosing" class="ccc__kinds mi:grid mi:rounded-lg mi:[background:var(--mi-fill4)]">
            <div v-for="k in kinds" :key="k.id" class="ccc__kind mi:flex mi:items-center mi:justify-between mi:gap-3 mi:py-2.5 mi:px-3 mi:[.ccc__kind+&]:border-t mi:[.ccc__kind+&]:border-t-sep">
              <div class="ccc__kind-text mi:grid mi:min-w-0">
                <MiText :id="'ccc-k-' + k.id" variant="footnote" weight="semibold">{{ k.label }}</MiText>
                <MiText variant="caption" tone="label2">{{ k.hint }}</MiText>
              </div>
              <MiBadge v-if="k.locked" label="Always on" tone="neutral" variant="outline" />
              <MiSwitch v-else v-model="k.on" size="compact" :aria-labelledby="'ccc-k-' + k.id" />
            </div>
          </div>

          <!-- Reject and accept carry the same weight; neither is the easy way out. -->
          <div class="ccc__actions mi:grid mi:grid-cols-[1fr_1fr] mi:gap-2 mi:@[420px]:grid-cols-[1fr_1fr_auto]">
            <MiButton variant="gray" @click="decide('none')">Reject all</MiButton>
            <MiButton variant="gray" @click="decide('all')">Accept all</MiButton>
            <MiButton v-if="choosing" variant="filled" @click="decide('mine')">Save {{ onCount }} of {{ kinds.length }}</MiButton>
            <MiButton v-else variant="plain" @click="choosing = true">Choose</MiButton>
          </div>
          <MiTextLink href="#" :chevron="false" class="ccc__policy mi:justify-self-start">Read the cookie policy</MiTextLink>
        </div>

        <!-- After a decision the prompt shrinks to a pill that reopens it. -->
        <div v-else key="pill" class="ccc__pill mi:inline-flex mi:items-center mi:gap-2 mi:pt-1.5 mi:pr-1.5 mi:pb-1.5 mi:pl-3.5 mi:rounded-[999px] mi:[background:var(--mi-elev)] mi:shadow-2 mi:border mi:border-sep">
          <MiIcon name="check-circle-fill" :size="18" class="ccc__ok mi:text-green" />
          <MiText variant="footnote" weight="medium">{{ summary }}</MiText>
          <MiButton variant="plain" size="small" @click="saved = false">Change</MiButton>
        </div>
      </Transition>
      <p class="ccc__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" role="status" aria-live="polite">{{ saved ? summary : '' }}</p>
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
.ccc__site i { border-radius: var(--mi-radius-m); background: var(--mi-fill3); }
.ccc__nav i { width: 54px; height: 12px; }
.ccc__nav i:first-child { width: 90px; background: var(--mi-label3); }
.ccc__hero i { width: 60%; height: 18px; }
.ccc__hero i:nth-child(2) { width: 40%; height: 12px; }
.ccc__hero i:nth-child(3) { width: 96px; height: 28px; background: var(--mi-p); }
.ccc__tiles i { background: var(--mi-card); }
.ccc__glyph i { width: 6px; height: 6px; border-radius: 50%; background: var(--mi-p); }
.ccc__glyph i:nth-child(2) { width: 5px; height: 5px; }
.ccc__glyph i:nth-child(3) { width: 4px; height: 4px; }

.ccc__kinds { animation: ccc-open var(--mi-dur-3) var(--mi-spring) both; }
@keyframes ccc-open { from { opacity: 0; transform: translateY(-4px); } }
.ccc__actions > :last-child { grid-column: 1 / -1; }
@container (min-width: 420px) { .ccc__actions > :last-child { grid-column: auto; } }
.ccc__policy { font-size: 13px; }

.ccc-swap-enter-active, .ccc-swap-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.ccc-swap-enter-from, .ccc-swap-leave-to { opacity: 0; transform: translateY(10px) scale(.97); }
@media (prefers-reduced-motion: reduce) { .ccc__kinds { animation: none; } .ccc-swap-enter-active, .ccc-swap-leave-active { transition: none; } }
</style>

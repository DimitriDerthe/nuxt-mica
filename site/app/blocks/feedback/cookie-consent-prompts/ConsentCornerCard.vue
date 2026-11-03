<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="ccc-title">
    <div class="mi:relative mi:grid mi:content-end mi:justify-items-center mi:min-h-110 mi:p-4 mi:rounded-xl mi:overflow-hidden mi:isolate mi:[background:var(--mi-page)] mi:@[720px]:justify-items-start mi:@[720px]:p-6">
      <!-- Faux storefront behind the prompt, drawn with tokens and kept out of the accessibility tree. -->
      <div class="mi:absolute mi:inset-0 mi:-z-1 mi:grid mi:content-start mi:gap-4.5 mi:p-4.5 mi:opacity-70" aria-hidden="true">
        <div class="mi:flex mi:gap-3"><i class="mi:block mi:rounded-md mi:w-22.5 mi:h-3 mi:[background:var(--mi-label3)]" /><i class="mi:block mi:rounded-md mi:w-13.5 mi:h-3 mi:[background:var(--mi-fill3)]" /><i class="mi:block mi:rounded-md mi:w-13.5 mi:h-3 mi:[background:var(--mi-fill3)]" /><i class="mi:block mi:rounded-md mi:w-13.5 mi:h-3 mi:[background:var(--mi-fill3)]" /></div>
        <div class="mi:grid mi:gap-2.5 mi:py-6.5 mi:px-4.5 mi:rounded-xl mi:[background:linear-gradient(135deg,_var(--mi-p-tint),_color-mix(in_srgb,_var(--mi-s)_12%,_transparent))]"><i class="mi:block mi:rounded-md mi:[&:nth-child(3)]:rounded-[999px] mi:[&:nth-child(3)]:opacity-60 mi:w-[60%] mi:h-4.5 mi:[background:var(--mi-fill3)]" /><i class="mi:block mi:rounded-md mi:[&:nth-child(3)]:rounded-[999px] mi:[&:nth-child(3)]:opacity-60 mi:w-[40%] mi:h-3 mi:[background:var(--mi-fill3)]" /><i class="mi:block mi:rounded-md mi:[&:nth-child(3)]:rounded-[999px] mi:[&:nth-child(3)]:opacity-60 mi:w-24 mi:h-7 mi:[background:var(--mi-p)]" /></div>
        <div class="mi:grid mi:grid-cols-[repeat(4,_1fr)] mi:gap-2.5"><i class="mi:block mi:rounded-md mi:[background:var(--mi-card)] mi:aspect-[3_/_4] mi:shadow-1" v-for="n in 4" :key="n" /></div>
      </div>

      <Transition mode="out-in" enter-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)] mi:motion-reduce:[transition:none]" enter-from-class="mi:opacity-0 mi:transform-[translateY(10px)_scale(.97)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)] mi:motion-reduce:[transition:none]" leave-to-class="mi:opacity-0 mi:transform-[translateY(10px)_scale(.97)]">
        <div v-if="!saved" key="card" class="mi:grid mi:gap-3.5 mi:w-full mi:max-w-110 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-elev)] mi:shadow-3 mi:border mi:border-sep" role="region" aria-labelledby="ccc-title">
          <div class="mi:flex mi:gap-3.5 mi:[align-items:flex-start]">
            <span class="mi:relative mi:flex-[none] mi:w-10 mi:h-10 mi:rounded-[50%] mi:[background:var(--mi-p-tint)]" aria-hidden="true"><i class="mi:absolute mi:[&:nth-child(1)]:left-[11px] mi:[&:nth-child(1)]:top-3 mi:[&:nth-child(2)]:left-5.5 mi:[&:nth-child(2)]:top-5 mi:[&:nth-child(3)]:left-[13px] mi:[&:nth-child(3)]:top-[25px] mi:rounded-[50%] mi:[background:var(--mi-p)] mi:w-1.5 mi:h-1.5" /><i class="mi:absolute mi:[&:nth-child(1)]:left-[11px] mi:[&:nth-child(1)]:top-3 mi:[&:nth-child(2)]:left-5.5 mi:[&:nth-child(2)]:top-5 mi:[&:nth-child(3)]:left-[13px] mi:[&:nth-child(3)]:top-[25px] mi:rounded-[50%] mi:[background:var(--mi-p)] mi:w-[5px] mi:h-[5px]" /><i class="mi:absolute mi:[&:nth-child(1)]:left-[11px] mi:[&:nth-child(1)]:top-3 mi:[&:nth-child(2)]:left-5.5 mi:[&:nth-child(2)]:top-5 mi:[&:nth-child(3)]:left-[13px] mi:[&:nth-child(3)]:top-[25px] mi:rounded-[50%] mi:[background:var(--mi-p)] mi:w-1 mi:h-1" /></span>
            <div class="mi:grid mi:gap-1 mi:min-w-0">
              <MiText id="ccc-title" variant="headline" as="h2">Cookies, on your terms</MiText>
              <MiText variant="footnote" tone="label2">
                Linden &amp; Oak needs a few cookies to run the shop. The rest help us improve it and are off until you say yes.
              </MiText>
            </div>
          </div>

          <div v-if="choosing" class="mi:[--mi-in-y:-4px] mi:animate-[in_var(--mi-dur-3)_var(--mi-spring)_both] mi:motion-reduce:animate-none mi:grid mi:rounded-lg mi:[background:var(--mi-fill4)]">
            <div v-for="k in kinds" :key="k.id" class="mi:flex mi:items-center mi:justify-between mi:gap-3 mi:py-2.5 mi:px-3 mi:not-first:border-t mi:not-first:border-t-sep">
              <div class="mi:grid mi:min-w-0">
                <MiText :id="'ccc-k-' + k.id" variant="footnote" weight="semibold">{{ k.label }}</MiText>
                <MiText variant="caption" tone="label2">{{ k.hint }}</MiText>
              </div>
              <MiBadge v-if="k.locked" label="Always on" tone="neutral" variant="outline" />
              <MiSwitch v-else v-model="k.on" size="compact" :aria-labelledby="'ccc-k-' + k.id" />
            </div>
          </div>

          <!-- Reject and accept carry the same weight; neither is the easy way out. -->
          <div class="mi:grid mi:grid-cols-[1fr_1fr] mi:gap-2 mi:@[420px]:grid-cols-[1fr_1fr_auto]">
            <MiButton variant="gray" @click="decide('none')">Reject all</MiButton>
            <MiButton variant="gray" @click="decide('all')">Accept all</MiButton>
            <MiButton v-if="choosing" variant="filled" class="mi:col-span-full mi:@[420px]:[grid-column:auto]" @click="decide('mine')">Save {{ onCount }} of {{ kinds.length }}</MiButton>
            <MiButton v-else variant="plain" class="mi:col-span-full mi:@[420px]:[grid-column:auto]" @click="choosing = true">Choose</MiButton>
          </div>
          <MiTextLink href="#" :chevron="false" class="mi:justify-self-start mi:text-[13px]!">Read the cookie policy</MiTextLink>
        </div>

        <!-- After a decision the prompt shrinks to a pill that reopens it. -->
        <div v-else key="pill" class="mi:inline-flex mi:items-center mi:gap-2 mi:pt-1.5 mi:pr-1.5 mi:pb-1.5 mi:pl-3.5 mi:rounded-[999px] mi:[background:var(--mi-elev)] mi:shadow-2 mi:border mi:border-sep">
          <MiIcon name="check-circle-fill" :size="18" class="mi:text-green" />
          <MiText variant="footnote" weight="medium">{{ summary }}</MiText>
          <MiButton variant="plain" size="small" @click="saved = false">Change</MiButton>
        </div>
      </Transition>
      <p class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" role="status" aria-live="polite">{{ saved ? summary : '' }}</p>
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

<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="tcs-title">
    <div class="mi:grid mi:gap-5.5 mi:items-center mi:@[740px]:grid-cols-[minmax(0,_1.1fr)_minmax(0,_1fr)] mi:@[740px]:gap-9">
    <div class="mi:group mi:relative mi:w-full mi:max-w-105 mi:justify-self-center mi:[perspective:900px] mi:[--rx:0deg] mi:[--ry:0deg] mi:[--sx:-60%] mi:[--so:0] mi:[&:has(i:nth-child(1):hover)]:[--rx:7deg] mi:[&:has(i:nth-child(1):hover)]:[--ry:-9deg] mi:[&:has(i:nth-child(1):hover)]:[--sx:-40%] mi:[&:has(i:nth-child(1):hover)]:[--so:.5] mi:[&:has(i:nth-child(2):hover)]:[--rx:8deg] mi:[&:has(i:nth-child(2):hover)]:[--ry:0deg] mi:[&:has(i:nth-child(2):hover)]:[--sx:-10%] mi:[&:has(i:nth-child(2):hover)]:[--so:.45] mi:[&:has(i:nth-child(3):hover)]:[--rx:7deg] mi:[&:has(i:nth-child(3):hover)]:[--ry:9deg] mi:[&:has(i:nth-child(3):hover)]:[--sx:20%] mi:[&:has(i:nth-child(3):hover)]:[--so:.5] mi:[&:has(i:nth-child(4):hover)]:[--rx:0deg] mi:[&:has(i:nth-child(4):hover)]:[--ry:-10deg] mi:[&:has(i:nth-child(4):hover)]:[--sx:-35%] mi:[&:has(i:nth-child(4):hover)]:[--so:.4] mi:[&:has(i:nth-child(5):hover)]:[--rx:0deg] mi:[&:has(i:nth-child(5):hover)]:[--ry:0deg] mi:[&:has(i:nth-child(5):hover)]:[--sx:0%] mi:[&:has(i:nth-child(5):hover)]:[--so:.3] mi:[&:has(i:nth-child(6):hover)]:[--rx:0deg] mi:[&:has(i:nth-child(6):hover)]:[--ry:10deg] mi:[&:has(i:nth-child(6):hover)]:[--sx:35%] mi:[&:has(i:nth-child(6):hover)]:[--so:.4] mi:[&:has(i:nth-child(7):hover)]:[--rx:-7deg] mi:[&:has(i:nth-child(7):hover)]:[--ry:-9deg] mi:[&:has(i:nth-child(7):hover)]:[--sx:-20%] mi:[&:has(i:nth-child(7):hover)]:[--so:.5] mi:[&:has(i:nth-child(8):hover)]:[--rx:-8deg] mi:[&:has(i:nth-child(8):hover)]:[--ry:0deg] mi:[&:has(i:nth-child(8):hover)]:[--sx:10%] mi:[&:has(i:nth-child(8):hover)]:[--so:.45] mi:[&:has(i:nth-child(9):hover)]:[--rx:-7deg] mi:[&:has(i:nth-child(9):hover)]:[--ry:9deg] mi:[&:has(i:nth-child(9):hover)]:[--sx:40%] mi:[&:has(i:nth-child(9):hover)]:[--so:.5]" :class="[colorway === 'dusk' ? 'mi:[--tcs-ink:var(--mi-s-on)] mi:[--tcs-bg:linear-gradient(150deg,_color-mix(in_srgb,_var(--mi-purple)_80%,_var(--mi-label)),_var(--mi-pink)_80%)]' : colorway === 'graphite' ? 'mi:[--tcs-ink:var(--mi-page)] mi:[--tcs-bg:linear-gradient(150deg,_var(--mi-label),_color-mix(in_srgb,_var(--mi-label)_70%,_var(--mi-label2)))]' : 'mi:[--tcs-ink:var(--mi-p-on)] mi:[--tcs-bg:linear-gradient(140deg,_var(--mi-p),_color-mix(in_srgb,_var(--mi-p)_45%,_var(--mi-s))_70%,_var(--mi-s))]']" :data-flipped="flipped || undefined" :data-frozen="frozen || undefined">
      <!-- Nine invisible hover zones drive the tilt through :has(), so it is pure CSS transforms. -->
      <div class="mi:absolute mi:inset-0 mi:z-3 mi:grid mi:grid-cols-[repeat(3,_1fr)] mi:grid-rows-[repeat(3,_1fr)]" aria-hidden="true"><i v-for="n in 9" :key="n" /></div>
      <div class="mi:transform-[rotateX(var(--rx))_rotateY(var(--ry))] mi:[transform-style:preserve-3d] mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:motion-reduce:transform-none">
        <div class="mi:relative mi:aspect-[1.586] mi:[transform-style:preserve-3d] mi:[transition:transform_600ms_var(--mi-spring)] mi:group-data-[flipped]:transform-[rotateY(180deg)] mi:motion-reduce:[transition:none]">
          <div class="mi:backface-hidden mi:absolute mi:inset-0 mi:grid mi:overflow-hidden mi:rounded-[18px] mi:isolate mi:text-(--tcs-ink) mi:[background:var(--tcs-bg)] mi:shadow-[0_0_0_1px_color-mix(in_srgb,_var(--tcs-ink)_14%,_transparent),_0_24px_44px_-22px_color-mix(in_srgb,_var(--mi-label)_60%,_transparent)] mi:grid-rows-[auto_1fr_auto_auto] mi:gap-2 mi:p-[clamp(14px,_5cqi,_22px)]" role="img" :aria-label="`${colorLabel} card ending 7731${frozen ? ', frozen' : ''}`">
            <span class="mi:absolute mi:inset-0 mi:-z-1 mi:opacity-50 mi:[background:repeating-radial-gradient(circle_at_110%_120%,_transparent_0_14px,_color-mix(in_srgb,_var(--tcs-ink)_16%,_transparent)_14px_15px)]" aria-hidden="true" />
            <span class="mi:absolute mi:inset-y-[-20%] mi:inset-x-[-40%] mi:z-2 mi:pointer-events-none mi:opacity-(--so) mi:[background:linear-gradient(105deg,_transparent_35%,_color-mix(in_srgb,_var(--mi-card)_55%,_transparent)_50%,_transparent_65%)] mi:transform-[translateX(var(--sx))] mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring),_opacity_var(--mi-dur-3)_var(--mi-ease)]" aria-hidden="true" />
            <div class="mi:items-flex-start mi:flex mi:justify-between mi:gap-2.5">
              <span class="mi:font-extrabold mi:text-[17px] mi:tracking-[-.02em]">Fernhouse</span>
              <span class="mi:text-[11px] mi:font-semibold mi:opacity-80">Virtual · Travel</span>
            </div>
            <span class="mi:self-center mi:w-10.5 mi:h-8 mi:rounded-[7px] mi:[background:linear-gradient(135deg,_color-mix(in_srgb,_var(--mi-yellow)_70%,_var(--mi-card)),_var(--mi-yellow)_60%,_color-mix(in_srgb,_var(--mi-yellow)_70%,_var(--mi-orange)))] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-label)_18%,_transparent)]" aria-hidden="true" />
            <span class="mi:[font:600_clamp(15px,_4.4cqi,_21px)/1_ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:tracking-[.08em] mi:whitespace-nowrap">{{ revealed ? '4000 0012 3456 7731' : '•••• •••• •••• 7731' }}</span>
            <div class="mi:items-flex-end mi:flex mi:justify-between mi:gap-2.5 mi:text-[13px] mi:font-semibold">
              <span><small class="mi:block mi:text-[9px] mi:font-semibold mi:tracking-[.08em] mi:uppercase mi:opacity-70">Cardholder</small>Ines Okafor</span>
              <span class="mi:[&:nth-child(2)]:mr-auto"><small class="mi:block mi:text-[9px] mi:font-semibold mi:tracking-[.08em] mi:uppercase mi:opacity-70">Valid thru</small>{{ revealed ? '09/29' : '••/••' }}</span>
              <span class="mi:flex" aria-hidden="true"><i class="mi:w-6 mi:h-6 mi:rounded-[50%] mi:[background:color-mix(in_srgb,_var(--tcs-ink)_80%,_transparent)]" /><i class="mi:-ml-2.5 mi:w-6 mi:h-6 mi:rounded-[50%] mi:[background:color-mix(in_srgb,_var(--tcs-ink)_45%,_transparent)]" /></span>
            </div>
            <span class="mi:[backdrop-filter:blur(6px)_grayscale(1)] mi:[-webkit-backdrop-filter:blur(6px)_grayscale(1)] mi:absolute mi:inset-0 mi:z-2 mi:grid mi:place-content-center mi:justify-items-center mi:gap-1.5 mi:font-bold mi:text-label mi:[background:color-mix(in_srgb,_var(--mi-card)_55%,_transparent)] mi:opacity-0 mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:group-data-[frozen]:opacity-100" aria-hidden="true"><MiIcon name="lock" :size="22" />Frozen</span>
          </div>
          <div class="mi:backface-hidden mi:absolute mi:inset-0 mi:grid mi:overflow-hidden mi:rounded-[18px] mi:isolate mi:text-(--tcs-ink) mi:[background:var(--tcs-bg)] mi:shadow-[0_0_0_1px_color-mix(in_srgb,_var(--tcs-ink)_14%,_transparent),_0_24px_44px_-22px_color-mix(in_srgb,_var(--mi-label)_60%,_transparent)] mi:transform-[rotateY(180deg)] mi:grid-rows-[auto_auto_1fr] mi:content-start mi:gap-3.5 mi:py-5.5 mi:px-0" aria-hidden="true">
            <span class="mi:h-10 mi:[background:color-mix(in_srgb,_var(--mi-label)_80%,_transparent)]" />
            <span class="mi:flex mi:items-center mi:justify-between mi:gap-2.5 mi:my-0 mi:mx-5.5 mi:py-2 mi:px-3 mi:rounded-[6px] mi:[background:color-mix(in_srgb,_var(--mi-card)_85%,_transparent)] mi:text-label mi:text-[13px] mi:italic"><span>Ines Okafor</span><b class="mi:[font:700_14px/1_ui-monospace,SFMono-Regular,Menlo,monospace] mi:not-italic mi:tracking-[.1em]">{{ revealed ? '418' : '•••' }}</b></span>
            <span class="mi:self-end mi:my-0 mi:mx-5.5 mi:text-[10px] mi:opacity-80">Issued for team travel. Report loss in the app, 24/7.</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mi:grid mi:gap-4.5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
      <div class="mi:flex mi:items-center mi:justify-between mi:gap-2.5">
        <MiText id="tcs-title" as="h2" variant="title3" weight="bold">Travel card</MiText>
        <MiBadge :tone="frozen ? 'neutral' : 'success'" :label="frozen ? 'Frozen' : 'Active'" dot />
      </div>

      <MiMeter :value="spent" :max="limit" label="Monthly limit" :caption="`€${spent.toLocaleString('en-IE')} spent`" :hint="`€${(limit - spent).toLocaleString('en-IE')} left of €${limit.toLocaleString('en-IE')}`" />

      <div class="mi:flex mi:flex-wrap mi:gap-2">
        <MiButton variant="gray" size="small" :pressed="revealed" @click="revealed = !revealed">
          <template #leading><MiIcon name="eye" :size="15" /></template>
          {{ revealed ? 'Hide details' : 'Show details' }}
        </MiButton>
        <MiButton variant="gray" size="small" :pressed="flipped" @click="flipped = !flipped">{{ flipped ? 'Show front' : 'Show back' }}</MiButton>
      </div>

      <div class="mi:grid">
        <div class="mi:flex mi:items-center mi:justify-between mi:gap-3.5 mi:py-3.5 mi:px-0 mi:border-t mi:border-t-sep">
          <div>
            <MiText id="tcs-freeze" variant="subheadline" weight="medium">Freeze card</MiText>
            <MiText variant="caption" tone="label2">Declines new payments; subscriptions keep running.</MiText>
          </div>
          <MiSwitch v-model="frozen" aria-labelledby="tcs-freeze" />
        </div>
        <div class="mi:flex mi:items-center mi:justify-between mi:gap-3.5 mi:py-3.5 mi:px-0 mi:border-t mi:border-t-sep mi:flex-wrap">
          <MiText id="tcs-colors" variant="subheadline" weight="medium">Card colour</MiText>
          <div class="mi:flex mi:gap-2.5" role="radiogroup" aria-labelledby="tcs-colors">
            <button
              v-for="c in colorways" :key="c.id" type="button" role="radio" class="mi:w-7 mi:h-7 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:cursor-pointer mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:hover:transform-[scale(1.08)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[3px] mi:aria-checked:shadow-[0_0_0_2px_var(--mi-card),_0_0_0_4px_var(--mi-label)]" :class="c.id === 'dusk' ? 'mi:[background:linear-gradient(150deg,_var(--mi-purple),_var(--mi-pink))]' : c.id === 'graphite' ? 'mi:[background:linear-gradient(150deg,_var(--mi-label),_var(--mi-label2))]' : 'mi:[background:linear-gradient(140deg,_var(--mi-p),_var(--mi-s))]'"
              :aria-checked="colorway === c.id" :aria-label="c.label" @click="colorway = c.id"
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const colorways = [{ id: 'brand', label: 'Brand' }, { id: 'dusk', label: 'Dusk' }, { id: 'graphite', label: 'Graphite' }]
const colorway = ref('brand')
const colorLabel = computed(() => colorways.find(c => c.id === colorway.value)?.label ?? '')
const revealed = ref(false)
const flipped = ref(false)
const frozen = ref(false)
const spent = 1240
const limit = 2000
</script>

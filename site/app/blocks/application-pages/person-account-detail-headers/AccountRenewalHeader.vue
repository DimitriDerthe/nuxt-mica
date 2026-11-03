<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="arh-title">
    <div class="mi:grid mi:gap-4.5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[760px]:py-6 mi:@[760px]:px-7">
    <MiBreadcrumb :items="crumbs" />

    <header class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:gap-y-3.5 mi:gap-x-4 mi:items-center mi:@[820px]:grid-cols-[auto_minmax(0,_1fr)_auto]">
      <div class="mi:relative mi:grid mi:place-items-center mi:w-15 mi:h-15 mi:rounded-[18px] mi:overflow-hidden mi:[background:linear-gradient(150deg,_var(--mi-p),_color-mix(in_srgb,_var(--mi-p)_40%,_var(--mi-s)))] mi:text-p-on mi:font-extrabold mi:text-[20px] mi:tracking-[-.04em] mi:after:content-[''] mi:after:absolute mi:after:top-[55%] mi:after:right-[-10%] mi:after:bottom-[-10%] mi:after:left-[-10%] mi:after:rounded-[50%_50%_0_0] mi:after:[background:repeating-radial-gradient(circle_at_50%_0,_transparent_0_5px,_color-mix(in_srgb,_var(--mi-p-on)_22%,_transparent)_5px_6px)]" aria-hidden="true"><span class="mi:relative mi:z-1">SS</span></div>
      <div class="mi:grid mi:gap-1 mi:min-w-0">
        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-1.5 mi:gap-x-2.5">
          <MiText id="arh-title" as="h2" variant="title2" weight="bold">Saltmarsh Survey Co.</MiText>
          <MiBadge tone="secondary" label="Enterprise" />
          <MiBadge :tone="health >= 70 ? 'success' : 'warning'" :label="health >= 70 ? 'Healthy' : 'At risk'" dot />
        </div>
        <MiText variant="footnote" tone="label2">saltmarsh.co · Bristol, UK · Customer since March 2021</MiText>
        <div class="mi:flex mi:items-center mi:gap-1.5">
          <MiAvatar name="Malik Rahman" size="xs" tone="auto" decorative />
          <MiText as="span" variant="caption" tone="label2">Owned by <strong class="mi:text-label mi:font-semibold">Malik Rahman</strong> · 3 open tasks</MiText>
        </div>
      </div>
      <div class="mi:col-span-full mi:flex mi:flex-wrap mi:gap-2 mi:@[820px]:col-[auto] mi:@[820px]:[justify-content:flex-end]">
        <MiButton :variant="following ? 'tinted' : 'gray'" size="small" :pressed="following" @click="following = !following">
          <template #leading><MiIcon :name="following ? 'check' : 'bell'" :size="15" /></template>
          {{ following ? 'Following' : 'Follow' }}
        </MiButton>
        <MiButton variant="gray" size="small">Log call</MiButton>
        <MiButton size="small">New deal</MiButton>
        <MiIconButton label="More actions" variant="gray" size="small"><MiIcon name="more" :size="16" /></MiIconButton>
      </div>
    </header>

    <dl class="mi:grid mi:grid-cols-2 mi:m-0 mi:rounded-lg mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:@[760px]:grid-cols-4">
      <div class="mi:grid mi:content-start mi:gap-1.5 mi:p-3.5 mi:min-w-0 mi:@max-[759px]:odd:border-r mi:@max-[759px]:odd:border-r-sep mi:@max-[759px]:[&:nth-child(-n+2)]:border-b mi:@max-[759px]:[&:nth-child(-n+2)]:border-b-sep mi:@[760px]:not-first:border-l mi:@[760px]:not-first:border-l-sep">
        <dt class="mi:text-[12px] mi:font-medium mi:text-label2">Annual revenue</dt>
        <dd class="mi:flex mi:items-flex-end mi:justify-between mi:gap-2 mi:m-0 mi:min-h-7"><span class="mi:text-[22px] mi:font-bold mi:tracking-[-.03em] mi:leading-none mi:tabular-nums mi:whitespace-nowrap">€184,000</span><MiSparkline :values="[120, 128, 141, 141, 156, 168, 184]" :width="72" :height="24" label="ARR over 7 quarters" /></dd>
        <MiText as="span" variant="caption2" tone="green" weight="semibold">+17% year on year</MiText>
      </div>
      <div class="mi:grid mi:content-start mi:gap-1.5 mi:p-3.5 mi:min-w-0 mi:@max-[759px]:odd:border-r mi:@max-[759px]:odd:border-r-sep mi:@max-[759px]:[&:nth-child(-n+2)]:border-b mi:@max-[759px]:[&:nth-child(-n+2)]:border-b-sep mi:@[760px]:not-first:border-l mi:@[760px]:not-first:border-l-sep">
        <dt class="mi:text-[12px] mi:font-medium mi:text-label2">Seats</dt>
        <dd class="mi:flex mi:items-flex-end mi:justify-between mi:gap-2 mi:m-0 mi:min-h-7"><span class="mi:text-[22px] mi:font-bold mi:tracking-[-.03em] mi:leading-none mi:tabular-nums mi:whitespace-nowrap">212</span><span class="mi:mr-auto mi:-ml-1 mi:text-[13px] mi:text-label2">/ 250</span></dd>
        <MiMeter :value="212" :max="250" size="sm" aria-label="Seats used" />
      </div>
      <div class="mi:grid mi:content-start mi:gap-1.5 mi:p-3.5 mi:min-w-0 mi:@max-[759px]:odd:border-r mi:@max-[759px]:odd:border-r-sep mi:@max-[759px]:[&:nth-child(-n+2)]:border-b mi:@max-[759px]:[&:nth-child(-n+2)]:border-b-sep mi:@[760px]:not-first:border-l mi:@[760px]:not-first:border-l-sep">
        <dt class="mi:text-[12px] mi:font-medium mi:text-label2">Health score</dt>
        <dd class="mi:flex mi:items-flex-end mi:justify-between mi:gap-2 mi:m-0 mi:min-h-7">
          <span class="mi:text-[22px] mi:font-bold mi:tracking-[-.03em] mi:leading-none mi:tabular-nums mi:whitespace-nowrap">{{ health }}</span>
          <span class="mi:flex mi:[align-items:flex-end] mi:gap-0.5 mi:h-6" role="img" :aria-label="`Weekly health, last 8 weeks, now ${health}`">
            <span class="mi:bg-[color-mix(in_srgb,_var(--mi-green)_60%,_var(--mi-fill))] mi:last:bg-green mi:w-[5px] mi:h-full mi:rounded-[2px] mi:origin-bottom" v-for="(v, i) in healthWeeks" :key="i" :style="{ transform: `scaleY(${v / 100})` }" />
          </span>
        </dd>
        <MiText as="span" variant="caption2" tone="label2">Usage, support and sentiment</MiText>
      </div>
      <div class="mi:grid mi:content-start mi:gap-1.5 mi:p-3.5 mi:min-w-0 mi:@max-[759px]:odd:border-r mi:@max-[759px]:odd:border-r-sep mi:@max-[759px]:[&:nth-child(-n+2)]:border-b mi:@max-[759px]:[&:nth-child(-n+2)]:border-b-sep mi:@[760px]:not-first:border-l mi:@[760px]:not-first:border-l-sep">
        <dt class="mi:text-[12px] mi:font-medium mi:text-label2">Renewal</dt>
        <dd class="mi:flex mi:items-flex-end mi:justify-between mi:gap-2 mi:m-0 mi:min-h-7"><span class="mi:text-[22px] mi:font-bold mi:tracking-[-.03em] mi:leading-none mi:tabular-nums mi:whitespace-nowrap mi:text-p-text">{{ daysLeft }} days</span></dd>
        <MiText as="span" variant="caption2" tone="label2">18 Dec 2026 · auto-renew off</MiText>
      </div>
    </dl>

    <!-- Contract runway: where today sits between signature and renewal, with the milestones on the way. -->
    <div class="mi:grid mi:gap-3" aria-labelledby="arh-runway">
      <div class="mi:flex mi:flex-wrap mi:justify-between mi:gap-1.5">
        <MiText id="arh-runway" as="h3" variant="subheadline" weight="semibold">Contract runway</MiText>
        <MiText variant="caption" tone="label2">{{ Math.round(elapsed * 100) }}% of the term used</MiText>
      </div>
      <div class="mi:relative mi:h-2 mi:mt-8.5 mi:mx-2.5 mi:mb-1 mi:rounded-[4px] mi:[background:var(--mi-fill3)]" role="img" :aria-label="`Today is ${Math.round(elapsed * 100)}% through the contract term`">
        <span class="mi:absolute mi:inset-0 mi:rounded-[inherit] mi:[background:linear-gradient(90deg,_var(--mi-p-tint2),_var(--mi-p))] mi:origin-left" :style="{ transform: `scaleX(${elapsed})` }" />
        <span v-for="(m, i) in milestones" :key="m.label" class="mi:absolute mi:top-1/2 mi:grid mi:place-items-center mi:w-5 mi:h-5 mi:-mt-2.5 mi:mr-0 mi:mb-0 mi:-ml-2.5 mi:rounded-[50%] mi:text-[10px] mi:font-bold" :class="m.at <= elapsed ? 'mi:text-p-on mi:bg-p mi:shadow-[0_0_0_2px_var(--mi-card)]' : 'mi:text-label2 mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1.5px_var(--mi-fill)]'" :style="{ left: m.at * 100 + '%' }">{{ i + 1 }}</span>
        <span class="mi:absolute mi:-top-4 mi:-bottom-1.5 mi:w-0.5 mi:-ml-px mi:rounded-[1px] mi:[background:var(--mi-label)]" :style="{ left: elapsed * 100 + '%' }"><i class="mi:text-[10px] mi:not-italic mi:font-semibold mi:text-label mi:absolute mi:bottom-full mi:left-1/2 mi:transform-[translateX(-50%)] mi:pb-0.5 mi:whitespace-nowrap">Today</i></span>
      </div>
      <ol class="mi:grid mi:grid-cols-2 mi:gap-y-2 mi:gap-x-3.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[760px]:grid-cols-4">
        <li class="mi:flex mi:items-flex-start mi:gap-2 mi:text-[12px] mi:min-w-0" v-for="(m, i) in milestones" :key="m.label">
          <span class="mi:grid mi:place-items-center mi:flex-[none] mi:w-4.5 mi:h-4.5 mi:rounded-[50%] mi:text-[10px] mi:font-bold" :class="m.at <= elapsed ? 'mi:bg-p mi:text-p-on' : 'mi:[background:var(--mi-fill3)] mi:text-label2'" aria-hidden="true">{{ i + 1 }}</span>
          <span><b class="mi:font-semibold">{{ m.label }}</b> <em class="mi:block mi:not-italic mi:text-label2">{{ m.date }}</em></span>
        </li>
      </ol>
    </div>

    <MiTabs v-model="tab" :items="tabs" aria-label="Account sections">
      <template #overview><MiText variant="footnote" tone="label2" class="mi:pt-3">Security review on 20 Nov is the last blocker before the renewal quote. Procurement asked for a 3-year option.</MiText></template>
      <template #contacts><MiText variant="footnote" tone="label2" class="mi:pt-3">8 contacts · champion: Ines Okafor (Operations lead) · economic buyer: Tom Hale (CFO).</MiText></template>
      <template #deals><MiText variant="footnote" tone="label2" class="mi:pt-3">2 open deals · Renewal 2027 (€184k) · Field app add-on, 40 seats (€22k).</MiText></template>
      <template #activity><MiText variant="footnote" tone="label2" class="mi:pt-3">Last touch 2 days ago: call with Ines about seat growth in the Cardiff office.</MiText></template>
    </MiTabs>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const crumbs = [{ label: 'Accounts', href: '#' }, { label: 'Enterprise', href: '#' }, { label: 'Saltmarsh Survey Co.' }]
const tabs = [{ value: 'overview', label: 'Overview' }, { value: 'contacts', label: 'Contacts · 8' }, { value: 'deals', label: 'Deals · 2' }, { value: 'activity', label: 'Activity' }]
const tab = ref<string | undefined>('overview')
const following = ref(true)

const health = 82
const healthWeeks = [64, 70, 68, 74, 77, 75, 80, 82]

// Term 18 Dec 2025 → 18 Dec 2026, sample "today" 2 Nov 2026.
const termDays = 365
const daysLeft = 46
const elapsed = (termDays - daysLeft) / termDays
const milestones = [
  { label: 'Kickoff QBR', date: '12 Mar', at: 84 / 365 },
  { label: 'Expansion to Cardiff', date: '4 Jun', at: 168 / 365 },
  { label: 'Security review', date: '20 Nov', at: 337 / 365 },
  { label: 'Renewal', date: '18 Dec', at: 1 }
]
</script>

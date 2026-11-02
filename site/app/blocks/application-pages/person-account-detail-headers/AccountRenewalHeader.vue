<template>
  <section class="arh" aria-labelledby="arh-title">
    <div class="arh__in">
    <MiBreadcrumb :items="crumbs" class="arh__crumbs" />

    <header class="arh__top">
      <div class="arh__mono" aria-hidden="true"><span>SS</span></div>
      <div class="arh__ident">
        <div class="arh__name-row">
          <MiText id="arh-title" as="h2" variant="title2" weight="bold">Saltmarsh Survey Co.</MiText>
          <MiBadge tone="secondary" label="Enterprise" />
          <MiBadge :tone="health >= 70 ? 'success' : 'warning'" :label="health >= 70 ? 'Healthy' : 'At risk'" dot />
        </div>
        <MiText variant="footnote" tone="label2">saltmarsh.co · Bristol, UK · Customer since March 2021</MiText>
        <div class="arh__owner">
          <MiAvatar name="Malik Rahman" size="xs" tone="auto" decorative />
          <MiText as="span" variant="caption" tone="label2">Owned by <strong>Malik Rahman</strong> · 3 open tasks</MiText>
        </div>
      </div>
      <div class="arh__actions">
        <MiButton :variant="following ? 'tinted' : 'gray'" size="small" :pressed="following" @click="following = !following">
          <template #leading><MiIcon :name="following ? 'check' : 'bell'" :size="15" /></template>
          {{ following ? 'Following' : 'Follow' }}
        </MiButton>
        <MiButton variant="gray" size="small">Log call</MiButton>
        <MiButton size="small">New deal</MiButton>
        <MiIconButton label="More actions" variant="gray" size="small"><MiIcon name="more" :size="16" /></MiIconButton>
      </div>
    </header>

    <dl class="arh__facts">
      <div class="arh__fact">
        <dt>Annual revenue</dt>
        <dd><span class="arh__num">€184,000</span><MiSparkline :values="[120, 128, 141, 141, 156, 168, 184]" :width="72" :height="24" label="ARR over 7 quarters" /></dd>
        <MiText as="span" variant="caption2" tone="green" weight="semibold">+17% year on year</MiText>
      </div>
      <div class="arh__fact">
        <dt>Seats</dt>
        <dd><span class="arh__num">212</span><span class="arh__of">/ 250</span></dd>
        <MiMeter :value="212" :max="250" size="sm" aria-label="Seats used" />
      </div>
      <div class="arh__fact">
        <dt>Health score</dt>
        <dd>
          <span class="arh__num">{{ health }}</span>
          <span class="arh__bars" role="img" :aria-label="`Weekly health, last 8 weeks, now ${health}`">
            <span v-for="(v, i) in healthWeeks" :key="i" :style="{ transform: `scaleY(${v / 100})` }" />
          </span>
        </dd>
        <MiText as="span" variant="caption2" tone="label2">Usage, support and sentiment</MiText>
      </div>
      <div class="arh__fact arh__fact--renew">
        <dt>Renewal</dt>
        <dd><span class="arh__num">{{ daysLeft }} days</span></dd>
        <MiText as="span" variant="caption2" tone="label2">18 Dec 2026 · auto-renew off</MiText>
      </div>
    </dl>

    <!-- Contract runway: where today sits between signature and renewal, with the milestones on the way. -->
    <div class="arh__runway" aria-labelledby="arh-runway">
      <div class="arh__runway-head">
        <MiText id="arh-runway" as="h3" variant="subheadline" weight="semibold">Contract runway</MiText>
        <MiText variant="caption" tone="label2">{{ Math.round(elapsed * 100) }}% of the term used</MiText>
      </div>
      <div class="arh__track" role="img" :aria-label="`Today is ${Math.round(elapsed * 100)}% through the contract term`">
        <span class="arh__track-fill" :style="{ transform: `scaleX(${elapsed})` }" />
        <span v-for="(m, i) in milestones" :key="m.label" class="arh__pin" :class="{ 'is-done': m.at <= elapsed }" :style="{ left: m.at * 100 + '%' }">{{ i + 1 }}</span>
        <span class="arh__today" :style="{ left: elapsed * 100 + '%' }"><i>Today</i></span>
      </div>
      <ol class="arh__miles">
        <li v-for="(m, i) in milestones" :key="m.label" :class="{ 'is-done': m.at <= elapsed }">
          <span class="arh__mi-n" aria-hidden="true">{{ i + 1 }}</span>
          <span><b>{{ m.label }}</b> <em>{{ m.date }}</em></span>
        </li>
      </ol>
    </div>

    <MiTabs v-model="tab" :items="tabs" aria-label="Account sections" class="arh__tabs">
      <template #overview><MiText variant="footnote" tone="label2" class="arh__panel">Security review on 20 Nov is the last blocker before the renewal quote. Procurement asked for a 3-year option.</MiText></template>
      <template #contacts><MiText variant="footnote" tone="label2" class="arh__panel">8 contacts · champion: Ines Okafor (Operations lead) · economic buyer: Tom Hale (CFO).</MiText></template>
      <template #deals><MiText variant="footnote" tone="label2" class="arh__panel">2 open deals · Renewal 2027 (€184k) · Field app add-on, 40 seats (€22k).</MiText></template>
      <template #activity><MiText variant="footnote" tone="label2" class="arh__panel">Last touch 2 days ago: call with Ines about seat growth in the Cardiff office.</MiText></template>
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

<style scoped>
.arh { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.arh__in { display: grid; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
@container (min-width: 760px) { .arh__in { padding: 24px 28px; } }

.arh__top { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 14px 16px; align-items: center; }
.arh__mono {
  position: relative; display: grid; place-items: center; width: 60px; height: 60px; border-radius: 18px; overflow: hidden;
  background: linear-gradient(150deg, var(--mi-p), color-mix(in srgb, var(--mi-p) 40%, var(--mi-s)));
  color: var(--mi-p-on); font-weight: 800; font-size: 20px; letter-spacing: -.04em;
}
/* Tide lines across the monogram. */
.arh__mono::after { content: ""; position: absolute; inset: 55% -10% -10%; border-radius: 50% 50% 0 0; background: repeating-radial-gradient(circle at 50% 0, transparent 0 5px, color-mix(in srgb, var(--mi-p-on) 22%, transparent) 5px 6px); }
.arh__mono span { position: relative; z-index: 1; }
.arh__ident { display: grid; gap: 4px; min-width: 0; }
.arh__name-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; }
.arh__owner { display: flex; align-items: center; gap: 6px; }
.arh__owner strong { color: var(--mi-label); font-weight: 600; }
.arh__actions { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 8px; }
@container (min-width: 820px) { .arh__top { grid-template-columns: auto minmax(0, 1fr) auto; } .arh__actions { grid-column: auto; justify-content: flex-end; } }

.arh__facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 0; border-radius: var(--mi-radius-l); box-shadow: inset 0 0 0 1px var(--mi-sep); }
.arh__fact { display: grid; align-content: start; gap: 6px; padding: 14px; min-width: 0; }
@container (max-width: 759px) { .arh__fact:nth-child(odd) { border-right: 1px solid var(--mi-sep); } .arh__fact:nth-child(-n+2) { border-bottom: 1px solid var(--mi-sep); } }
@container (min-width: 760px) { .arh__facts { grid-template-columns: repeat(4, minmax(0, 1fr)); } .arh__fact + .arh__fact { border-left: 1px solid var(--mi-sep); } }
.arh__fact dt { font-size: 12px; font-weight: 500; color: var(--mi-label2); }
.arh__fact dd { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; margin: 0; min-height: 28px; }
.arh__num { font-size: 22px; font-weight: 700; letter-spacing: -.03em; line-height: 1; font-variant-numeric: tabular-nums; white-space: nowrap; }
.arh__of { margin-right: auto; margin-left: -4px; font-size: 13px; color: var(--mi-label2); }
.arh__fact--renew .arh__num { color: var(--mi-p-text); }
.arh__bars { display: flex; align-items: flex-end; gap: 2px; height: 24px; }
.arh__bars span { width: 5px; height: 100%; border-radius: 2px; background: color-mix(in srgb, var(--mi-green) 60%, var(--mi-fill)); transform-origin: bottom; }
.arh__bars span:last-child { background: var(--mi-green); }

.arh__runway { display: grid; gap: 12px; }
.arh__runway-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px; }
.arh__track { position: relative; height: 8px; margin: 34px 10px 4px; border-radius: 4px; background: var(--mi-fill3); }
.arh__track-fill { position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(90deg, var(--mi-p-tint2), var(--mi-p)); transform-origin: left; }
.arh__pin {
  position: absolute; top: 50%; display: grid; place-items: center; width: 20px; height: 20px; margin: -10px 0 0 -10px; border-radius: 50%;
  font-size: 10px; font-weight: 700; color: var(--mi-label2); background: var(--mi-card); box-shadow: 0 0 0 1.5px var(--mi-fill);
}
.arh__pin.is-done { color: var(--mi-p-on); background: var(--mi-p); box-shadow: 0 0 0 2px var(--mi-card); }
.arh__today { position: absolute; top: -16px; bottom: -6px; width: 2px; margin-left: -1px; border-radius: 1px; background: var(--mi-label); }
.arh__today i { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); padding-bottom: 2px; font-size: 10px; font-style: normal; font-weight: 600; white-space: nowrap; color: var(--mi-label); }
.arh__miles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 14px; margin: 0; padding: 0; list-style: none; }
@container (min-width: 760px) { .arh__miles { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.arh__miles li { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; min-width: 0; }
.arh__miles b { font-weight: 600; }
.arh__miles em { display: block; font-style: normal; color: var(--mi-label2); }
.arh__mi-n { display: grid; place-items: center; flex: none; width: 18px; height: 18px; border-radius: 50%; font-size: 10px; font-weight: 700; background: var(--mi-fill3); color: var(--mi-label2); }
.arh__miles li.is-done .arh__mi-n { background: var(--mi-p); color: var(--mi-p-on); }
.arh__panel { padding-top: 12px; }
</style>

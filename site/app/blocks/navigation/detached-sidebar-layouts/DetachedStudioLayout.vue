<template>
  <div class="ds mi:@container mi:font-mi mi:text-label">
    <div class="ds__shell mi:relative mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:h-160 mi:overflow-hidden mi:[background:radial-gradient(120%_80%_at_100%_0%,_var(--mi-p-tint),_transparent_60%),_radial-gradient(90%_70%_at_0%_100%,_var(--mi-s-tint),_transparent_55%),_var(--mi-page)] mi:@[780px]:grid-cols-[300px_minmax(0,_1fr)] mi:@[780px]:gap-1 mi:@[780px]:p-3.5" @keydown.esc="open = false">
      <!-- The sidebar floats as its own card, inset from every edge. Off-canvas under 780px. -->
      <div id="ds-side" class="ds__side mi:absolute mi:z-3 mi:top-2.5 mi:bottom-2.5 mi:left-2.5 mi:w-[min(300px,_calc(100%_-_56px))] mi:transform-[translateX(calc(-100%_-_24px))] mi:invisible mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease),_visibility_0s_linear_var(--mi-dur-3)] mi:[&.is-open]:transform-none mi:[&.is-open]:visible mi:[&.is-open]:[transition:transform_var(--mi-dur-3)_var(--mi-ease)] mi:@[780px]:relative mi:@[780px]:inset-auto mi:@[780px]:w-auto mi:@[780px]:transform-none mi:@[780px]:visible mi:@[780px]:[transition:none]" :class="{ 'is-open': open }">
        <MiSidebar v-model="current" class="ds__sb mi:[.ds_&]:box-border" :groups="groups" aria-label="Low Tide Audio" @select="open = false">
          <template #footer>
            <div class="ds__player mi:grid mi:gap-2.5 mi:mt-auto mi:p-3 mi:rounded-md mi:[background:var(--mi-card)] mi:shadow-1" :class="{ 'is-playing': playing }">
              <div class="ds__wave mi:flex mi:items-center mi:gap-0.5 mi:h-7" aria-hidden="true">
                <span class="mi:[.ds__wave_&]:flex-1 mi:[.ds__wave_&]:h-full mi:[.ds__wave_&]:rounded-[2px] mi:[.ds__wave_&]:[background:var(--mi-fill)] mi:[.ds__wave_&]:transform-[scaleY(var(--h))] mi:[.ds__wave_&]:origin-center" v-for="(b, i) in wave" :key="i" :style="{ '--h': b, '--d': (i % 6) * 90 + 'ms' }" :class="{ 'is-past mi:[.ds__wave_&]:[background:var(--mi-p)]': i < wave.length * progress }" />
              </div>
              <div class="ds__player-row mi:flex mi:items-center mi:gap-2.5">
                <MiIconButton :label="playing ? 'Pause preview' : 'Play preview'" size="small" :pressed="playing" @click="playing = !playing">
                  <MiIcon :svg="playing ? glyph.pause : glyph.play" :size="14" :filled="true" />
                </MiIconButton>
                <div class="ds__player-text mi:grid mi:min-w-0">
                  <MiText variant="caption" weight="semibold" :lines="1">Ep. 48 · The tide tables</MiText>
                  <MiText variant="caption2" tone="label2" tabular>{{ playing ? 'Playing' : 'Paused' }} · 12:40 / 41:05</MiText>
                </div>
              </div>
            </div>
          </template>
        </MiSidebar>
      </div>
      <div class="ds__scrim mi:absolute mi:inset-0 mi:z-2 mi:[background:var(--mi-scrim)] mi:opacity-0 mi:pointer-events-none mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:[&.is-on]:opacity-100 mi:[&.is-on]:pointer-events-auto mi:@[780px]:hidden" :class="{ 'is-on': open }" aria-hidden="true" @click="open = false" />

      <main class="ds__main mi:min-w-0 mi:overflow-y-auto mi:p-4 mi:grid mi:content-start mi:gap-4.5 mi:@[600px]:py-5.5 mi:@[600px]:px-6 mi:@[780px]:pt-3.5 mi:@[780px]:pr-4.5 mi:@[780px]:pb-4.5 mi:@[780px]:pl-6.5" aria-labelledby="ds-title">
        <header class="ds__top mi:flex mi:items-center mi:gap-3 mi:flex-wrap">
          <MiIconButton class="ds__burger" label="Open navigation" variant="gray" size="regular" aria-controls="ds-side" :aria-expanded="open" @click="open = true">
            <MiIcon :svg="glyph.burger" :size="18" />
          </MiIconButton>
          <div class="ds__heading mi:grid mi:flex-1 mi:min-w-0">
            <MiText variant="caption" tone="label2" weight="medium">{{ view.kicker }}</MiText>
            <MiText id="ds-title" variant="title2" as="h2" weight="bold">{{ view.title }}</MiText>
          </div>
          <MiButton class="ds__cta" size="small">
            <template #leading><MiIcon name="plus" :size="15" /></template>
            {{ view.cta }}
          </MiButton>
        </header>

        <Transition name="ds-swap" mode="out-in">
          <div :key="current" class="ds__cards mi:grid mi:gap-2.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[600px]:grid-cols-2 mi:@[780px]:grid-cols-[minmax(0,_1fr)] mi:@[1000px]:grid-cols-2">
            <article v-for="c in view.cards" :key="c.title" class="ds__card mi:flex mi:items-center mi:gap-3.5 mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
              <span class="ds__art mi:flex-[none] mi:relative mi:w-12 mi:h-12 mi:rounded-[12px] mi:overflow-hidden mi:[background:color-mix(in_srgb,_var(--a)_18%,_var(--mi-card))] mi:before:content-[''] mi:before:absolute mi:before:rounded-[50%] mi:after:content-[''] mi:after:absolute mi:after:rounded-[50%] mi:before:w-15 mi:before:h-15 mi:before:-left-3 mi:before:-bottom-8.5 mi:before:[background:var(--a)] mi:before:opacity-85 mi:after:w-6.5 mi:after:h-6.5 mi:after:right-[7px] mi:after:top-[7px] mi:after:[background:color-mix(in_srgb,_var(--a)_45%,_var(--mi-card))]" :style="{ '--a': `var(--mi-${c.color})` }" aria-hidden="true" />
              <div class="ds__card-text mi:grid mi:gap-0.5 mi:flex-1 mi:min-w-0">
                <MiText variant="subheadline" as="h3" weight="semibold" :lines="1">{{ c.title }}</MiText>
                <MiText variant="caption" tone="label2" :lines="2">{{ c.meta }}</MiText>
              </div>
              <MiBadge :label="c.state" :tone="c.tone" variant="tint" />
            </article>
          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const glyph = {
  burger: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" stroke-linejoin="round"/>',
  pause: '<path d="M8 5.5v13M16 5.5v13" stroke-width="3.2" stroke-linecap="round"/>'
}

const groups = [
  {
    id: 'studio',
    items: [
      { id: 'overview', label: 'Overview', icon: 'home' as const },
      { id: 'episodes', label: 'Episodes', icon: 'list' as const, badge: 3 },
      { id: 'schedule', label: 'Recording schedule', icon: 'calendar' as const },
      { id: 'guests', label: 'Guests', icon: 'people' as const },
      { id: 'mail', label: 'Listener mail', icon: 'inbox' as const, badge: 12 }
    ]
  },
  {
    id: 'shows', label: 'Shows', collapsible: true,
    items: [
      { id: 'low-tide', label: 'Low Tide', color: 'teal' as const },
      { id: 'long-shift', label: 'The Long Shift', color: 'orange' as const },
      { id: 'small-hours', label: 'Small Hours', color: 'indigo' as const }
    ]
  },
  {
    id: 'account', label: 'Account', collapsible: true,
    items: [
      { id: 'settings', label: 'Settings', icon: 'settings' as const },
      { id: 'billing', label: 'Billing', icon: 'billing' as const }
    ]
  }
]

type Tone = 'primary' | 'success' | 'warning' | 'neutral'
interface Card { title: string, meta: string, state: string, tone: Tone, color: string }
interface View { kicker: string, title: string, cta: string, cards: Card[] }

const views: Record<string, View> = {
  overview: {
    kicker: 'Low Tide Audio', title: 'This week in the studio', cta: 'New episode',
    cards: [
      { title: 'Ep. 48 · The tide tables', meta: 'Mixing · publishes Thursday 06:00', state: 'Mixing', tone: 'warning', color: 'teal' },
      { title: 'Interview with a harbour pilot', meta: 'Booked Wednesday 10:00 · Studio B', state: 'Booked', tone: 'primary', color: 'orange' },
      { title: 'Listener questions, round 6', meta: '12 new letters waiting for a reply', state: 'To answer', tone: 'neutral', color: 'indigo' },
      { title: 'Downloads, last 7 days', meta: '18,420 across three shows · up 9%', state: 'Up 9%', tone: 'success', color: 'mint' }
    ]
  },
  episodes: {
    kicker: 'All shows', title: 'Episodes', cta: 'New episode',
    cards: [
      { title: 'Ep. 48 · The tide tables', meta: 'Low Tide · 41 min · final mix due Wednesday', state: 'Mixing', tone: 'warning', color: 'teal' },
      { title: 'Ep. 12 · Night bakers', meta: 'The Long Shift · 36 min · needs show notes', state: 'Draft', tone: 'neutral', color: 'orange' },
      { title: 'Ep. 7 · The 3 a.m. radio caller', meta: 'Small Hours · 52 min · scheduled', state: 'Scheduled', tone: 'primary', color: 'indigo' }
    ]
  },
  schedule: {
    kicker: 'Studio A and B', title: 'Recording schedule', cta: 'Book studio',
    cards: [
      { title: 'Harbour pilot interview', meta: 'Wed 10:00–11:30 · Studio B · remote guest', state: 'Booked', tone: 'primary', color: 'orange' },
      { title: 'Low Tide intro re-take', meta: 'Thu 09:00–09:30 · Studio A', state: 'Booked', tone: 'primary', color: 'teal' },
      { title: 'Small Hours call-in night', meta: 'Fri 23:00–01:00 · Studio A · live', state: 'Live', tone: 'warning', color: 'indigo' }
    ]
  },
  guests: {
    kicker: 'Contacts', title: 'Guests', cta: 'Invite guest',
    cards: [
      { title: 'Captain Ilse Marten', meta: 'Harbour pilot, Rotterdam · confirmed', state: 'Confirmed', tone: 'success', color: 'orange' },
      { title: 'Dr. Kofi Mensah', meta: 'Sleep researcher · waiting on release form', state: 'Pending', tone: 'warning', color: 'indigo' },
      { title: 'Rosa Lindqvist', meta: 'Night-shift baker · recorded in May', state: 'Aired', tone: 'neutral', color: 'teal' }
    ]
  },
  mail: {
    kicker: 'Inbox', title: 'Listener mail', cta: 'Reply',
    cards: [
      { title: '“Where was the foghorn recorded?”', meta: 'From Anke, Hamburg · about Ep. 47', state: 'New', tone: 'primary', color: 'teal' },
      { title: '“I drive a night bus, interview me”', meta: 'From Duarte, Lisbon · pitch for The Long Shift', state: 'New', tone: 'primary', color: 'orange' },
      { title: '“The intro music, who made it?”', meta: 'From Mira, Toronto · 4th time this month', state: 'FAQ', tone: 'neutral', color: 'indigo' }
    ]
  },
  'low-tide': {
    kicker: 'Show', title: 'Low Tide', cta: 'New episode',
    cards: [
      { title: 'Ep. 48 · The tide tables', meta: 'Mixing · 41 min', state: 'Mixing', tone: 'warning', color: 'teal' },
      { title: 'Ep. 47 · Foghorns', meta: 'Aired 2 weeks ago · 9,812 plays', state: 'Aired', tone: 'neutral', color: 'teal' }
    ]
  },
  'long-shift': {
    kicker: 'Show', title: 'The Long Shift', cta: 'New episode',
    cards: [
      { title: 'Ep. 12 · Night bakers', meta: 'Draft · needs show notes', state: 'Draft', tone: 'neutral', color: 'orange' },
      { title: 'Ep. 11 · The toll booth', meta: 'Aired last month · 6,104 plays', state: 'Aired', tone: 'neutral', color: 'orange' }
    ]
  },
  'small-hours': {
    kicker: 'Show', title: 'Small Hours', cta: 'New episode',
    cards: [{ title: 'Ep. 7 · The 3 a.m. radio caller', meta: 'Scheduled for Friday 23:00', state: 'Scheduled', tone: 'primary', color: 'indigo' }]
  },
  settings: {
    kicker: 'Account', title: 'Settings', cta: 'Invite member',
    cards: [
      { title: 'Feed and distribution', meta: 'Apple, Spotify and 4 more directories', state: 'Synced', tone: 'success', color: 'mint' },
      { title: 'Team', meta: '5 producers, 2 editors', state: '7 seats', tone: 'neutral', color: 'indigo' }
    ]
  },
  billing: {
    kicker: 'Account', title: 'Billing', cta: 'Add card',
    cards: [{ title: 'Studio plan · €49 / month', meta: 'Next invoice on 1 March · 3 shows included', state: 'Active', tone: 'success', color: 'teal' }]
  }
}

const current = ref<string | undefined>('overview')
const open = ref(false)
const playing = ref(false)
const progress = 0.31
const wave = [0.35, 0.6, 0.45, 0.8, 0.55, 0.9, 0.4, 0.7, 1, 0.65, 0.5, 0.85, 0.3, 0.6, 0.75, 0.45, 0.95, 0.55, 0.35, 0.7, 0.5, 0.8, 0.4, 0.6, 0.3, 0.5]
const view = computed(() => views[current.value ?? 'overview'] ?? views.overview!)
</script>

<style scoped>
.ds .ds__sb { width: 100%; height: 100%; overflow-y: auto; box-shadow: var(--mi-sh3); }
.is-playing .ds__wave span { animation: ds-bounce 900ms var(--mi-ease-in-out) var(--d) infinite alternate; }
@keyframes ds-bounce { to { transform: scaleY(calc(var(--h) * .45)); } }
@media (prefers-reduced-motion: reduce) { .is-playing .ds__wave span { animation: none; } }

.ds-swap-enter-active, .ds-swap-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.ds-swap-enter-from { opacity: 0; transform: translateY(8px); }
.ds-swap-leave-to { opacity: 0; }

@container (min-width: 780px) {
  .ds .ds__sb { box-shadow: var(--mi-sh2); }
  .ds__burger { display: none; }
}
</style>

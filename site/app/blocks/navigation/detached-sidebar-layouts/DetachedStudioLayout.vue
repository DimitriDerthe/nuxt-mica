<template>
  <div class="ds">
    <div class="ds__shell" @keydown.esc="open = false">
      <!-- The sidebar floats as its own card, inset from every edge. Off-canvas under 780px. -->
      <div id="ds-side" class="ds__side" :class="{ 'is-open': open }">
        <MiSidebar v-model="current" class="ds__sb" :groups="groups" aria-label="Low Tide Audio" @select="open = false">
          <template #footer>
            <div class="ds__player" :class="{ 'is-playing': playing }">
              <div class="ds__wave" aria-hidden="true">
                <span v-for="(b, i) in wave" :key="i" :style="{ '--h': b, '--d': (i % 6) * 90 + 'ms' }" :class="{ 'is-past': i < wave.length * progress }" />
              </div>
              <div class="ds__player-row">
                <MiIconButton :label="playing ? 'Pause preview' : 'Play preview'" size="small" :pressed="playing" @click="playing = !playing">
                  <MiIcon :svg="playing ? glyph.pause : glyph.play" :size="14" :filled="true" />
                </MiIconButton>
                <div class="ds__player-text">
                  <MiText variant="caption" weight="semibold" :lines="1">Ep. 48 · The tide tables</MiText>
                  <MiText variant="caption2" tone="label2" tabular>{{ playing ? 'Playing' : 'Paused' }} · 12:40 / 41:05</MiText>
                </div>
              </div>
            </div>
          </template>
        </MiSidebar>
      </div>
      <div class="ds__scrim" :class="{ 'is-on': open }" aria-hidden="true" @click="open = false" />

      <main class="ds__main" aria-labelledby="ds-title">
        <header class="ds__top">
          <MiIconButton class="ds__burger" label="Open navigation" variant="gray" size="regular" aria-controls="ds-side" :aria-expanded="open" @click="open = true">
            <MiIcon :svg="glyph.burger" :size="18" />
          </MiIconButton>
          <div class="ds__heading">
            <MiText variant="caption" tone="label2" weight="medium">{{ view.kicker }}</MiText>
            <MiText id="ds-title" variant="title2" as="h2" weight="bold">{{ view.title }}</MiText>
          </div>
          <MiButton class="ds__cta" size="small">
            <template #leading><MiIcon name="plus" :size="15" /></template>
            {{ view.cta }}
          </MiButton>
        </header>

        <Transition name="ds-swap" mode="out-in">
          <div :key="current" class="ds__cards">
            <article v-for="c in view.cards" :key="c.title" class="ds__card">
              <span class="ds__art" :style="{ '--a': `var(--mi-${c.color})` }" aria-hidden="true" />
              <div class="ds__card-text">
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
.ds { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.ds__shell {
  position: relative; display: grid; grid-template-columns: minmax(0, 1fr); height: 640px; overflow: hidden;
  /* Soft contour backdrop so the floating card reads as detached. */
  background:
    radial-gradient(120% 80% at 100% 0%, var(--mi-p-tint), transparent 60%),
    radial-gradient(90% 70% at 0% 100%, var(--mi-s-tint), transparent 55%),
    var(--mi-page);
}

.ds__side {
  position: absolute; z-index: 3; top: 10px; bottom: 10px; left: 10px; width: min(300px, calc(100% - 56px));
  transform: translateX(calc(-100% - 24px)); visibility: hidden;
  transition: transform var(--mi-dur-3) var(--mi-ease), visibility 0s linear var(--mi-dur-3);
}
.ds__side.is-open { transform: none; visibility: visible; transition: transform var(--mi-dur-3) var(--mi-ease); }
.ds .ds__sb { width: 100%; height: 100%; box-sizing: border-box; overflow-y: auto; box-shadow: var(--mi-sh3); }
.ds__scrim { position: absolute; inset: 0; z-index: 2; background: var(--mi-scrim); opacity: 0; pointer-events: none; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.ds__scrim.is-on { opacity: 1; pointer-events: auto; }

/* Mini player pinned to the bottom of the floating sidebar. */
.ds__player { display: grid; gap: 10px; margin-top: auto; padding: 12px; border-radius: var(--mi-radius-m); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ds__wave { display: flex; align-items: center; gap: 2px; height: 28px; }
.ds__wave span { flex: 1; height: 100%; border-radius: 2px; background: var(--mi-fill); transform: scaleY(var(--h)); transform-origin: center; }
.ds__wave span.is-past { background: var(--mi-p); }
.is-playing .ds__wave span { animation: ds-bounce 900ms var(--mi-ease-in-out) var(--d) infinite alternate; }
@keyframes ds-bounce { to { transform: scaleY(calc(var(--h) * .45)); } }
@media (prefers-reduced-motion: reduce) { .is-playing .ds__wave span { animation: none; } }
.ds__player-row { display: flex; align-items: center; gap: 10px; }
.ds__player-text { display: grid; min-width: 0; }

.ds__main { min-width: 0; overflow-y: auto; padding: 16px; display: grid; align-content: start; gap: 18px; }
.ds__top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.ds__heading { display: grid; flex: 1; min-width: 0; }
.ds__cards { display: grid; gap: 10px; grid-template-columns: minmax(0, 1fr); }
.ds__card { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
/* Cover art: two overlapping arcs tinted with the show colour. */
.ds__art { flex: none; position: relative; width: 48px; height: 48px; border-radius: 12px; overflow: hidden; background: color-mix(in srgb, var(--a) 18%, var(--mi-card)); }
.ds__art::before, .ds__art::after { content: ""; position: absolute; border-radius: 50%; }
.ds__art::before { width: 60px; height: 60px; left: -12px; bottom: -34px; background: var(--a); opacity: .85; }
.ds__art::after { width: 26px; height: 26px; right: 7px; top: 7px; background: color-mix(in srgb, var(--a) 45%, var(--mi-card)); }
.ds__card-text { display: grid; gap: 2px; flex: 1; min-width: 0; }

.ds-swap-enter-active, .ds-swap-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.ds-swap-enter-from { opacity: 0; transform: translateY(8px); }
.ds-swap-leave-to { opacity: 0; }

@container (min-width: 600px) {
  .ds__cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ds__main { padding: 22px 24px; }
}

@container (min-width: 780px) {
  .ds__shell { grid-template-columns: 300px minmax(0, 1fr); gap: 4px; padding: 14px; }
  .ds__side { position: relative; inset: auto; width: auto; transform: none; visibility: visible; transition: none; }
  .ds .ds__sb { box-shadow: var(--mi-sh2); }
  .ds__burger, .ds__scrim { display: none; }
  .ds__cards { grid-template-columns: minmax(0, 1fr); }
  .ds__main { padding: 14px 18px 18px 26px; }
}

@container (min-width: 1000px) {
  .ds__cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>

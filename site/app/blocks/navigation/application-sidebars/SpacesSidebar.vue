<template>
  <div class="sp">
    <div class="sp__shell" :class="{ 'is-detail': detail }" :style="{ '--tint': `var(--mi-${space.color})` }" @keydown="onKey">
      <!-- One tinted wash per space, cross-faded with opacity. -->
      <span v-for="(s, i) in spaces" :key="s.id" class="sp__wash" :class="{ 'is-on': i === active }" :style="{ '--c': `var(--mi-${s.color})` }" aria-hidden="true" />

      <aside class="sp__side" aria-label="Spaces">
        <header class="sp__head">
          <span class="sp__mark" aria-hidden="true"><MiIcon :name="space.icon" :size="16" /></span>
          <div class="sp__head-text">
            <MiText as="h2" variant="headline" weight="bold">{{ space.label }}</MiText>
            <MiText as="span" variant="caption" tone="label2">{{ space.members }}</MiText>
          </div>
          <MiIconButton size="small" variant="plain" :label="'New page in ' + space.label"><MiIcon name="plus" :size="16" /></MiIconButton>
        </header>

        <button type="button" class="sp__jump">
          <MiIcon name="search" :size="15" />
          <span>Jump to…</span>
          <MiKbdGroup class="sp__keys"><MiKbd>⌘</MiKbd><MiKbd>T</MiKbd></MiKbdGroup>
        </button>

        <!-- The three space panels sit side by side; the track slides with transform. -->
        <div class="sp__viewport">
          <div class="sp__track" :style="{ '--i': active }">
            <section
              v-for="(s, si) in spaces" :id="'sp-panel-' + s.id" :key="s.id" class="sp__panel" role="tabpanel"
              :aria-labelledby="'sp-tab-' + s.id" :inert="si !== active" :aria-hidden="si !== active"
            >
              <ul class="sp__pins" :aria-label="s.label + ' pinned'">
                <li v-for="p in s.pins" :key="p.id">
                  <button type="button" class="sp__pin" :class="{ 'is-active': selection[s.id] === p.id }" :aria-current="selection[s.id] === p.id ? 'page' : undefined" @click="pick(s.id, p.id)">
                    <MiIcon :name="p.icon" :size="18" />
                    <span class="sp__pin-label">{{ p.label }}</span>
                    <i v-if="p.unread" class="sp__pin-dot" :aria-label="p.unread + ' unread'" />
                  </button>
                </li>
              </ul>

              <div v-for="g in s.groups" :key="g.label" class="sp__group">
                <MiText as="h3" variant="caption2" weight="semibold" tone="label2" class="sp__eyebrow">{{ g.label }}</MiText>
                <ul class="sp__list">
                  <li v-for="it in g.items" :key="it.id">
                    <button type="button" class="sp__item" :class="{ 'is-active': selection[s.id] === it.id, 'is-unread': it.unread }" :aria-current="selection[s.id] === it.id ? 'page' : undefined" @click="pick(s.id, it.id)">
                      <span class="sp__fav" aria-hidden="true">{{ it.label.charAt(0) }}</span>
                      <span class="sp__item-label">{{ it.label }}</span>
                      <span v-if="it.unread" class="sp__unread" :aria-label="it.unread + ' unread'">{{ it.unread }}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>

        <!-- Space strip: dots switch spaces, arrow keys move between them. -->
        <footer class="sp__strip">
          <MiIconButton size="small" variant="plain" label="Archived pages"><MiIcon name="archive" :size="16" /></MiIconButton>
          <div class="sp__dots" role="tablist" aria-label="Switch space" @keydown="onTabKey">
            <button
              v-for="(s, i) in spaces" :id="'sp-tab-' + s.id" :key="s.id" type="button" role="tab" class="sp__dot"
              :class="{ 'is-on': i === active }" :style="{ '--c': `var(--mi-${s.color})` }"
              :aria-selected="i === active" :aria-controls="'sp-panel-' + s.id" :tabindex="i === active ? 0 : -1"
              :aria-label="s.label + (unreadOf(s) ? ', ' + unreadOf(s) + ' unread' : '')" :title="s.label + ' · Ctrl ' + (i + 1)"
              @click="active = i"
            >
              <span class="sp__dot-core" />
              <i v-if="unreadOf(s) && i !== active" class="sp__dot-badge" />
            </button>
          </div>
          <MiIconButton size="small" variant="plain" label="New space"><MiIcon name="plus" :size="16" /></MiIconButton>
        </footer>
      </aside>

      <!-- Content card, framed on the tinted shell. On phones it slides over the list. -->
      <main class="sp__main" aria-labelledby="sp-title">
        <div class="sp__card">
          <header class="sp__top">
            <MiIconButton class="sp__back" size="small" variant="gray" :label="'Back to ' + space.label" @click="detail = false"><MiIcon name="chevron-left" :size="16" /></MiIconButton>
            <MiText as="span" variant="footnote" tone="label2" class="sp__crumb">{{ space.label }} <span aria-hidden="true">/</span> {{ current.group }}</MiText>
            <MiAvatarGroup :items="space.people" :max="3" :size="28" class="sp__people" />
          </header>
          <Transition name="sp-swap" mode="out-in">
            <article :key="space.id + current.item.id" class="sp__doc">
              <span class="sp__doc-mark" aria-hidden="true"><MiIcon v-if="'icon' in current.item" :name="current.item.icon" :size="22" /><template v-else>{{ current.item.label.charAt(0) }}</template></span>
              <MiText id="sp-title" as="h3" variant="title1" weight="bold" balance>{{ current.item.label }}</MiText>
              <MiText variant="footnote" tone="label2">{{ current.item.meta }}</MiText>
              <MiText variant="body" class="sp__lede">{{ current.item.note }}</MiText>
              <div v-if="current.item.unread" class="sp__new">
                <MiText as="span" variant="subheadline" weight="semibold">{{ current.item.unread }} new since your last visit</MiText>
                <MiButton size="small" variant="tinted" @click="markRead">Mark as read</MiButton>
              </div>
              <MiText v-else as="p" variant="subheadline" tone="label2" class="sp__caught"><MiIcon name="check-circle" :size="16" /> You're caught up here.</MiText>
              <div class="sp__lines" aria-hidden="true"><span v-for="n in 5" :key="n" :style="{ '--w': [0.96, 0.84, 0.9, 0.72, 0.38][n - 1] }" /></div>
            </article>
          </Transition>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Icon = 'tray' | 'calendar' | 'pencil' | 'bookmark' | 'grid' | 'chat' | 'image' | 'sliders' | 'bell' | 'check-circle' | 'document' | 'list-bullet' | 'person' | 'star' | 'widgets'
interface Page { id: string, label: string, unread: number, meta: string, note: string }
interface Pin extends Page { icon: Icon }
interface Space { id: string, label: string, color: string, icon: Icon, members: string, people: { name: string, tone?: 'auto' }[], pins: Pin[], groups: { label: string, items: Page[] }[] }

const spaces = reactive<Space[]>([
  {
    id: 'personal', label: 'Personal', color: 'teal', icon: 'person', members: 'Only you',
    people: [{ name: 'Noor Haddad', tone: 'auto' }],
    pins: [
      { id: 'mail', label: 'Mail', icon: 'tray', unread: 12, meta: '12 unread · last sync 2 min ago', note: 'Two replies from the architect about the kitchen quote, and the airline moved your Lisbon flight by forty minutes.' },
      { id: 'cal', label: 'Calendar', icon: 'calendar', unread: 0, meta: 'Next: dentist, Thu 09:30', note: 'A quiet week. Thursday morning is blocked for the dentist, Saturday for the flea market in Clignancourt.' },
      { id: 'journal', label: 'Journal', icon: 'pencil', unread: 0, meta: '41-day streak', note: 'Yesterday: finished the last chapter, booked the train to Nantes, decided against the second bike.' },
      { id: 'reading', label: 'Reading', icon: 'bookmark', unread: 3, meta: '3 saved this week', note: 'Saved for the weekend: a long read on night trains, a recipe for socca and an essay on slow software.' }
    ],
    groups: [
      { label: 'Today', items: [
        { id: 'review', label: 'Weekly review', unread: 0, meta: 'Every Sunday · 14 tasks', note: 'Three tasks carried over from last week. Close them or drop them before planning the next one.' },
        { id: 'lisbon', label: 'Lisbon trip, 14–18 Nov', unread: 1, meta: 'Shared with Sami', note: 'Flight TP 437 now leaves at 10:20. The flat in Alfama confirmed self check-in after 15:00.' },
        { id: 'kitchen', label: 'Kitchen renovation quotes', unread: 2, meta: '3 quotes · €18.4k to €23.9k', note: 'Atelier Marbre is the cheapest but cannot start before February. The others can start in January.' }
      ] }
    ]
  },
  {
    id: 'design', label: 'Design', color: 'pink', icon: 'image', members: '9 members · Tidewater',
    people: [{ name: 'Ilse Brandt', tone: 'auto' }, { name: 'Kofi Mensah', tone: 'auto' }, { name: 'Ana Sobral', tone: 'auto' }, { name: 'Lou Perrin', tone: 'auto' }],
    pins: [
      { id: 'library', label: 'Library', icon: 'grid', unread: 0, meta: '312 components · v4.2', note: 'The component library is in sync with code. Four components are marked for deprecation in v5.' },
      { id: 'crit', label: 'Critique', icon: 'chat', unread: 4, meta: 'Thursdays at 16:00', note: 'Four new threads on the checkout flow, mostly about the address step and the order summary on mobile.' },
      { id: 'mood', label: 'Boards', icon: 'image', unread: 0, meta: '86 references', note: 'Collected for the 2027 brand refresh: tidal charts, enamel signage and rail timetables from the 1970s.' },
      { id: 'tokens', label: 'Tokens', icon: 'sliders', unread: 0, meta: 'Last published Oct 30', note: 'Colour and spacing tokens are published. Motion tokens are still in review with engineering.' }
    ],
    groups: [
      { label: 'Today', items: [
        { id: 'onboard', label: 'Onboarding flow v4', unread: 5, meta: 'Ilse Brandt · edited 18 min ago', note: 'The new flow drops the plan picker from step two. Five comments wait on the empty-state illustrations.' },
        { id: 'icons', label: 'Icon set audit', unread: 1, meta: '214 icons · 31 flagged', note: 'Thirty-one icons use the old 1.5 stroke. Kofi proposes redrawing them before the brand refresh lands.' },
        { id: 'motion', label: 'Motion principles', unread: 0, meta: 'Draft · Lou Perrin', note: 'Short, physical, interruptible. The draft covers sheets, toasts and list reordering so far.' }
      ] },
      { label: 'Brand refresh 2027', items: [
        { id: 'logo', label: 'Logo explorations', unread: 2, meta: '3 directions left', note: 'Direction B tests best at small sizes. Direction C is the team favourite but fails on dark photos.' }
      ] }
    ]
  },
  {
    id: 'eng', label: 'Engineering', color: 'indigo', icon: 'widgets', members: '23 members · Tidewater',
    people: [{ name: 'Rafael Costa', tone: 'auto' }, { name: 'Mei Tanaka', tone: 'auto' }, { name: 'Jonas Weber', tone: 'auto' }, { name: 'Priya Nair', tone: 'auto' }, { name: 'Tom Okafor', tone: 'auto' }],
    pins: [
      { id: 'oncall', label: 'On-call', icon: 'bell', unread: 1, meta: 'Mei Tanaka until Mon 09:00', note: 'One page overnight: the payments worker queue spiked at 03:12 and drained on its own in six minutes.' },
      { id: 'ci', label: 'CI', icon: 'check-circle', unread: 0, meta: 'main is green · 7m 42s', note: 'Median pipeline time is down to 7 m 42 s after splitting the integration suite in four shards.' },
      { id: 'runbooks', label: 'Runbooks', icon: 'document', unread: 0, meta: '48 runbooks', note: 'The database failover runbook was rehearsed on Oct 24 and updated with the new replica names.' },
      { id: 'rfcs', label: 'RFCs', icon: 'list-bullet', unread: 8, meta: '3 open for comment', note: 'Three RFCs are open. The event-sourcing proposal for ledgers closes for comments on Friday.' }
    ],
    groups: [
      { label: 'Today', items: [
        { id: 'rfc112', label: 'RFC 112: Event-sourced ledgers', unread: 8, meta: 'Rafael Costa · closes Fri', note: 'Proposes an append-only ledger with projections per account. Open question: how to replay 4 years of history.' },
        { id: 'flaky', label: 'Flaky test triage', unread: 3, meta: '11 quarantined tests', note: 'Most flakes come from the webhook suite. Jonas suspects the shared clock mock between workers.' },
        { id: 'pm', label: 'Postmortem: Oct 28 outage', unread: 0, meta: 'Published · 3 actions open', note: 'A config push removed the read replica from the pool for 22 minutes. Three follow-ups remain open.' }
      ] },
      { label: 'Platform', items: [
        { id: 'pg17', label: 'Postgres 17 upgrade', unread: 1, meta: 'Staging done · prod Nov 19', note: 'Staging ran for a week without regressions. Production upgrade is planned for the Nov 19 window.' },
        { id: 'rate', label: 'Rate limiter rewrite', unread: 0, meta: 'In review', note: 'Moves from fixed windows to a token bucket kept in Postgres, with a per-key burst allowance.' }
      ] }
    ]
  }
])

const active = ref(1)
const detail = ref(false)
const selection = reactive<Record<string, string>>({ personal: 'lisbon', design: 'onboard', eng: 'rfc112' })

const space = computed(() => spaces[active.value] ?? spaces[0]!)
const current = computed(() => {
  const s = space.value
  const id = selection[s.id]
  const pin = s.pins.find(p => p.id === id)
  if (pin) return { item: pin as Page | Pin, group: 'Pinned' }
  for (const g of s.groups) {
    const it = g.items.find(i => i.id === id)
    if (it) return { item: it as Page | Pin, group: g.label }
  }
  return { item: s.pins[0] as Page | Pin, group: 'Pinned' }
})

function unreadOf(s: Space) {
  return s.pins.reduce((a, p) => a + p.unread, 0) + s.groups.reduce((a, g) => a + g.items.reduce((b, i) => b + i.unread, 0), 0)
}

function pick(spaceId: string, id: string) {
  selection[spaceId] = id
  detail.value = true
}
function markRead() { current.value.item.unread = 0 }

function onTabKey(e: KeyboardEvent) {
  const n = spaces.length
  let next = -1
  if (e.key === 'ArrowRight') next = (active.value + 1) % n
  else if (e.key === 'ArrowLeft') next = (active.value - 1 + n) % n
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = n - 1
  if (next < 0) return
  e.preventDefault()
  active.value = next
  const tab = (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]')[next]
  tab?.focus()
}
// Ctrl + 1..3 jumps straight to a space, wherever focus is inside the block.
function onKey(e: KeyboardEvent) {
  const i = Number(e.key) - 1
  if (e.ctrlKey && i >= 0 && i < spaces.length) { e.preventDefault(); active.value = i }
}
</script>

<style scoped>
.sp { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.sp__shell { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); height: 640px; overflow: hidden; background: var(--mi-side); isolation: isolate; }
.sp__wash {
  position: absolute; inset: 0; z-index: -1; opacity: 0; transition: opacity var(--mi-dur-4) var(--mi-ease);
  background:
    radial-gradient(90% 60% at 0% 100%, color-mix(in srgb, var(--c) 22%, transparent), transparent 70%),
    linear-gradient(180deg, color-mix(in srgb, var(--c) 9%, var(--mi-side)), color-mix(in srgb, var(--c) 14%, var(--mi-side)));
}
.sp__wash.is-on { opacity: 1; }

/* Sidebar */
.sp__side { display: flex; flex-direction: column; min-width: 0; min-height: 0; padding: 16px 12px 10px; }
.sp__head { display: flex; align-items: center; gap: 10px; padding: 0 4px 14px; }
.sp__mark {
  display: grid; place-items: center; flex: none; width: 34px; height: 34px; border-radius: 11px;
  color: var(--tint); background: color-mix(in srgb, var(--tint) 16%, var(--mi-card));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tint) 24%, transparent);
}
.sp__head-text { flex: 1; min-width: 0; display: grid; line-height: 1.2; }
.sp__jump {
  display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 8px 0 12px; border: 0; border-radius: 12px;
  font: inherit; font-size: 13px; color: var(--mi-label2); cursor: pointer;
  background: color-mix(in srgb, var(--mi-card) 70%, transparent); box-shadow: var(--mi-sh1);
}
.sp__jump span { flex: 1; text-align: left; }
.sp__jump:hover { color: var(--mi-label); }
.sp__keys { flex: none; }

.sp__viewport { flex: 1; min-height: 0; margin: 12px -12px 0; overflow: hidden; }
.sp__track { display: grid; grid-auto-flow: column; grid-auto-columns: 100%; height: 100%; transform: translateX(calc(var(--i) * -100%)); transition: transform var(--mi-dur-4) var(--mi-spring); }
.sp__panel { min-width: 0; overflow-y: auto; padding: 0 12px 8px; scrollbar-width: none; }

.sp__pins { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; margin: 0 0 14px; padding: 0; list-style: none; }
.sp__pin {
  position: relative; display: grid; justify-items: center; gap: 4px; width: 100%; padding: 10px 2px 8px; border: 0; border-radius: 12px;
  color: var(--mi-label2); background: color-mix(in srgb, var(--mi-card) 55%, transparent); font: inherit; cursor: pointer;
  transition: transform var(--mi-dur-2) var(--mi-ease);
}
.sp__pin:hover { color: var(--mi-label); background: color-mix(in srgb, var(--mi-card) 85%, transparent); }
.sp__pin:active { transform: scale(.96); }
.sp__pin.is-active { color: var(--tint); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.sp__pin-label { max-width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 11px; font-weight: 550; color: var(--mi-label2); }
.sp__pin.is-active .sp__pin-label { color: var(--mi-label); }
.sp__pin-dot { position: absolute; top: 7px; right: 9px; width: 7px; height: 7px; border-radius: 50%; background: var(--tint); box-shadow: 0 0 0 2px color-mix(in srgb, var(--mi-card) 80%, transparent); }

.sp__group + .sp__group { margin-top: 14px; }
.sp__eyebrow { padding: 0 8px 6px; text-transform: uppercase; letter-spacing: .08em; }
.sp__list { display: grid; gap: 1px; margin: 0; padding: 0; list-style: none; }
.sp__item {
  display: flex; align-items: center; gap: 10px; width: 100%; height: 36px; padding: 0 8px; border: 0; border-radius: 10px;
  font: inherit; font-size: 13.5px; color: var(--mi-label2); background: none; text-align: left; cursor: pointer;
}
.sp__item:hover { color: var(--mi-label); background: color-mix(in srgb, var(--mi-card) 55%, transparent); }
.sp__item.is-unread { color: var(--mi-label); font-weight: 600; }
.sp__item.is-active { color: var(--mi-label); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.sp__fav {
  display: grid; place-items: center; flex: none; width: 20px; height: 20px; border-radius: 6px;
  font-size: 10.5px; font-weight: 700; color: var(--tint); background: color-mix(in srgb, var(--tint) 14%, transparent);
}
.sp__item-label { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.sp__unread {
  flex: none; min-width: 18px; height: 18px; padding: 0 5px; box-sizing: border-box; border-radius: 9px;
  font-size: 11px; font-weight: 650; line-height: 18px; text-align: center; font-variant-numeric: tabular-nums;
  color: var(--tint); background: color-mix(in srgb, var(--tint) 15%, transparent);
}
.sp__pin:focus-visible, .sp__item:focus-visible, .sp__jump:focus-visible, .sp__dot:focus-visible { outline: 2px solid var(--tint); outline-offset: 1px; }

.sp__strip { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 10px; border-top: 1px solid color-mix(in srgb, var(--tint) 18%, var(--mi-sep)); }
.sp__dots { display: flex; align-items: center; gap: 2px; }
.sp__dot { position: relative; display: grid; place-items: center; width: 30px; height: 30px; padding: 0; border: 0; border-radius: 50%; background: none; cursor: pointer; }
.sp__dot-core {
  width: 14px; height: 14px; border-radius: 50%; background: var(--c); opacity: .38; transform: scale(.75);
  transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-3) var(--mi-ease);
}
.sp__dot:hover .sp__dot-core { opacity: .7; }
.sp__dot.is-on .sp__dot-core { opacity: 1; transform: scale(1); box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 25%, transparent); }
.sp__dot-badge { position: absolute; top: 5px; right: 5px; width: 6px; height: 6px; border-radius: 50%; background: var(--c); box-shadow: 0 0 0 2px color-mix(in srgb, var(--tint) 12%, var(--mi-side)); }

/* Content card */
.sp__main {
  position: absolute; inset: 0; z-index: 2; display: flex; padding: 8px; min-width: 0; min-height: 0;
  transform: translateX(102%); visibility: hidden; transition: transform var(--mi-dur-3) var(--mi-ease), visibility 0s linear var(--mi-dur-3);
}
.is-detail .sp__main { transform: none; visibility: visible; transition: transform var(--mi-dur-3) var(--mi-ease); }
.sp__card {
  position: relative; flex: 1; min-width: 0; overflow: hidden; display: flex; flex-direction: column; gap: 28px; padding: 14px 18px 24px;
  border-radius: 16px; background: var(--mi-card); box-shadow: var(--mi-sh2);
}
.sp__card::before {
  content: ""; position: absolute; inset: 0 0 auto; height: 160px; pointer-events: none;
  background: linear-gradient(180deg, color-mix(in srgb, var(--tint) 10%, transparent), transparent);
}
.sp__top { position: relative; display: flex; align-items: center; gap: 10px; min-width: 0; }
.sp__crumb { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.sp__crumb span { color: var(--mi-label3); padding: 0 2px; }
.sp__people { flex: none; }
.sp__doc { position: relative; display: grid; justify-items: start; gap: 10px; width: 100%; max-width: 560px; margin: 0 auto; }
.sp__doc-mark {
  display: grid; place-items: center; width: 48px; height: 48px; margin-bottom: 6px; border-radius: 15px;
  font-size: 20px; font-weight: 750; color: var(--tint); background: color-mix(in srgb, var(--tint) 14%, var(--mi-card));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tint) 22%, transparent), var(--mi-sh1);
}
.sp__lede { max-width: 52ch; font-size: 16px; line-height: 1.6; }
.sp__new {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; width: 100%; box-sizing: border-box;
  margin-top: 8px; padding: 12px 12px 12px 16px; border-radius: 14px;
  background: color-mix(in srgb, var(--tint) 8%, var(--mi-card)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tint) 20%, transparent);
}
.sp__lines { display: grid; gap: 10px; width: 100%; margin-top: 18px; }
.sp__lines span { display: block; height: 8px; border-radius: 4px; background: var(--mi-fill4); transform-origin: left; transform: scaleX(var(--w)); }
.sp__caught { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; color: var(--mi-green-t); }

.sp-swap-enter-active, .sp-swap-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.sp-swap-enter-from { opacity: 0; transform: translateY(6px); }
.sp-swap-leave-to { opacity: 0; }

@container (min-width: 720px) {
  .sp__shell { grid-template-columns: 276px minmax(0, 1fr); }
  .sp__main, .is-detail .sp__main { position: relative; inset: auto; z-index: auto; padding: 10px 10px 10px 0; transform: none; visibility: visible; transition: none; }
  .sp__back { display: none; }
  .sp__card { padding: 18px 36px 32px; gap: 48px; }
  .sp__doc { margin: 0; }
}
@container (min-width: 1100px) {
  .sp__card { padding-inline: 56px; }
}
</style>

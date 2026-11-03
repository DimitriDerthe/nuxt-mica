<template>
  <div class="sp mi:@container mi:font-mi mi:text-label">
    <div class="sp__shell mi:relative mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:h-160 mi:overflow-hidden mi:[background:var(--mi-side)] mi:isolate mi:@[720px]:grid-cols-[276px_minmax(0,_1fr)]" :class="{ 'is-detail': detail }" :style="{ '--tint': `var(--mi-${space.color})` }" @keydown="onKey">
      <!-- One tinted wash per space, cross-faded with opacity. -->
      <span v-for="(s, i) in spaces" :key="s.id" class="sp__wash mi:absolute mi:inset-0 mi:-z-1 mi:opacity-0 mi:[transition:opacity_var(--mi-dur-4)_var(--mi-ease)] mi:[background:radial-gradient(90%_60%_at_0%_100%,_color-mix(in_srgb,_var(--c)_22%,_transparent),_transparent_70%),_linear-gradient(180deg,_color-mix(in_srgb,_var(--c)_9%,_var(--mi-side)),_color-mix(in_srgb,_var(--c)_14%,_var(--mi-side)))] mi:[&.is-on]:opacity-100" :class="{ 'is-on': i === active }" :style="{ '--c': `var(--mi-${s.color})` }" aria-hidden="true" />

      <aside class="sp__side mi:flex mi:flex-col mi:min-w-0 mi:min-h-0 mi:pt-4 mi:px-3 mi:pb-2.5" aria-label="Spaces">
        <header class="sp__head mi:flex mi:items-center mi:gap-2.5 mi:pt-0 mi:px-1 mi:pb-3.5">
          <span class="sp__mark mi:grid mi:place-items-center mi:flex-[none] mi:w-8.5 mi:h-8.5 mi:rounded-[11px] mi:text-(--tint) mi:[background:color-mix(in_srgb,_var(--tint)_16%,_var(--mi-card))] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--tint)_24%,_transparent)]" aria-hidden="true"><MiIcon :name="space.icon" :size="16" /></span>
          <div class="sp__head-text mi:flex-1 mi:min-w-0 mi:grid mi:leading-[1.2]">
            <MiText as="h2" variant="headline" weight="bold">{{ space.label }}</MiText>
            <MiText as="span" variant="caption" tone="label2">{{ space.members }}</MiText>
          </div>
          <MiIconButton size="small" variant="plain" :label="'New page in ' + space.label"><MiIcon name="plus" :size="16" /></MiIconButton>
        </header>

        <button type="button" class="sp__jump mi:flex mi:items-center mi:gap-2 mi:h-9 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-3 mi:[border:0] mi:rounded-[12px] mi:text-label2 mi:cursor-pointer mi:[background:color-mix(in_srgb,_var(--mi-card)_70%,_transparent)] mi:shadow-1 mi:hover:text-label mi:focus-visible:[outline:2px_solid_var(--tint)] mi:focus-visible:outline-offset-[1px]">
          <MiIcon class="mi:[.sp__jump_span&]:text-left" name="search" :size="15" />
          <span class="mi:[.sp__jump_span&]:text-left">Jump to…</span>
          <MiKbdGroup class="sp__keys mi:[.sp__jump_span&]:text-left mi:flex-[none]"><MiKbd class="mi:[.sp__jump_span&]:text-left">⌘</MiKbd><MiKbd class="mi:[.sp__jump_span&]:text-left">T</MiKbd></MiKbdGroup>
        </button>

        <!-- The three space panels sit side by side; the track slides with transform. -->
        <div class="sp__viewport mi:flex-1 mi:min-h-0 mi:mt-3 mi:-mx-3 mi:mb-0 mi:overflow-hidden">
          <div class="sp__track mi:grid mi:grid-flow-col mi:auto-cols-[100%] mi:h-full mi:transform-[translateX(calc(var(--i)_*_-100%))] mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ '--i': active }">
            <section
              v-for="(s, si) in spaces" :id="'sp-panel-' + s.id" :key="s.id" class="sp__panel mi:min-w-0 mi:overflow-y-auto mi:pt-0 mi:px-3 mi:pb-2 mi:[scrollbar-width:none]" role="tabpanel"
              :aria-labelledby="'sp-tab-' + s.id" :inert="si !== active" :aria-hidden="si !== active"
            >
              <ul class="sp__pins mi:grid mi:grid-cols-4 mi:gap-1.5 mi:mt-0 mi:mx-0 mi:mb-3.5 mi:p-0 mi:[list-style:none]" :aria-label="s.label + ' pinned'">
                <li v-for="p in s.pins" :key="p.id">
                  <button type="button" class="sp__pin mi:relative mi:grid mi:justify-items-center mi:gap-1 mi:w-full mi:pt-2.5 mi:px-0.5 mi:pb-2 mi:[border:0] mi:rounded-[12px] mi:text-label2 mi:[background:color-mix(in_srgb,_var(--mi-card)_55%,_transparent)] mi:[font:inherit] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:active:transform-[scale(.96)] mi:[&.is-active]:shadow-1 mi:focus-visible:[outline:2px_solid_var(--tint)] mi:focus-visible:outline-offset-[1px]" :class="{ 'is-active': selection[s.id] === p.id }" :aria-current="selection[s.id] === p.id ? 'page' : undefined" @click="pick(s.id, p.id)">
                    <MiIcon :name="p.icon" :size="18" />
                    <span class="sp__pin-label mi:max-w-full mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis mi:text-[11px] mi:font-550 mi:text-label2 mi:[.sp__pin.is-active_&]:text-label">{{ p.label }}</span>
                    <i v-if="p.unread" class="sp__pin-dot mi:absolute mi:top-[7px] mi:right-[9px] mi:w-[7px] mi:h-[7px] mi:rounded-[50%] mi:[background:var(--tint)] mi:shadow-[0_0_0_2px_color-mix(in_srgb,_var(--mi-card)_80%,_transparent)]" :aria-label="p.unread + ' unread'" />
                  </button>
                </li>
              </ul>

              <div v-for="g in s.groups" :key="g.label" class="sp__group mi:[.sp__group+&]:mt-3.5">
                <MiText as="h3" variant="caption2" weight="semibold" tone="label2" class="sp__eyebrow mi:pt-0 mi:px-2 mi:pb-1.5">{{ g.label }}</MiText>
                <ul class="sp__list mi:grid mi:gap-px mi:m-0 mi:p-0 mi:[list-style:none]">
                  <li v-for="it in g.items" :key="it.id">
                    <button type="button" class="sp__item mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:h-9 mi:py-0 mi:px-2 mi:[border:0] mi:rounded-[10px] mi:text-label2 mi:[background:none] mi:text-left mi:cursor-pointer mi:[&.is-active]:shadow-1 mi:focus-visible:[outline:2px_solid_var(--tint)] mi:focus-visible:outline-offset-[1px]" :class="{ 'is-active': selection[s.id] === it.id, 'is-unread': it.unread }" :aria-current="selection[s.id] === it.id ? 'page' : undefined" @click="pick(s.id, it.id)">
                      <span class="sp__fav mi:grid mi:place-items-center mi:flex-[none] mi:w-5 mi:h-5 mi:rounded-[6px] mi:text-[10.5px] mi:font-bold mi:text-(--tint) mi:[background:color-mix(in_srgb,_var(--tint)_14%,_transparent)]" aria-hidden="true">{{ it.label.charAt(0) }}</span>
                      <span class="sp__item-label mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">{{ it.label }}</span>
                      <span v-if="it.unread" class="sp__unread mi:flex-[none] mi:min-w-4.5 mi:h-4.5 mi:py-0 mi:px-[5px] mi:box-border mi:rounded-[9px] mi:text-[11px] mi:font-650 mi:leading-[18px] mi:text-center mi:tabular-nums mi:text-(--tint) mi:[background:color-mix(in_srgb,_var(--tint)_15%,_transparent)]" :aria-label="it.unread + ' unread'">{{ it.unread }}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>

        <!-- Space strip: dots switch spaces, arrow keys move between them. -->
        <footer class="sp__strip mi:flex mi:items-center mi:justify-between mi:gap-2 mi:pt-2.5 mi:border-t mi:border-t-[color:color-mix(in_srgb,_var(--tint)_18%,_var(--mi-sep))]">
          <MiIconButton size="small" variant="plain" label="Archived pages"><MiIcon name="archive" :size="16" /></MiIconButton>
          <div class="sp__dots mi:flex mi:items-center mi:gap-0.5" role="tablist" aria-label="Switch space" @keydown="onTabKey">
            <button
              v-for="(s, i) in spaces" :id="'sp-tab-' + s.id" :key="s.id" type="button" role="tab" class="sp__dot mi:focus-visible:[outline:2px_solid_var(--tint)] mi:focus-visible:outline-offset-[1px] mi:relative mi:grid mi:place-items-center mi:w-7.5 mi:h-7.5 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:[background:none] mi:cursor-pointer"
              :class="{ 'is-on': i === active }" :style="{ '--c': `var(--mi-${s.color})` }"
              :aria-selected="i === active" :aria-controls="'sp-panel-' + s.id" :tabindex="i === active ? 0 : -1"
              :aria-label="s.label + (unreadOf(s) ? ', ' + unreadOf(s) + ' unread' : '')" :title="s.label + ' · Ctrl ' + (i + 1)"
              @click="active = i"
            >
              <span class="sp__dot-core mi:w-3.5 mi:h-3.5 mi:rounded-[50%] mi:[background:var(--c)] mi:opacity-38 mi:transform-[scale(.75)] mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring),_opacity_var(--mi-dur-3)_var(--mi-ease)] mi:[.sp__dot.is-on_&]:transform-[scale(1)] mi:[.sp__dot.is-on_&]:shadow-[0_0_0_3px_color-mix(in_srgb,_var(--c)_25%,_transparent)]" />
              <i v-if="unreadOf(s) && i !== active" class="sp__dot-badge mi:absolute mi:top-[5px] mi:right-[5px] mi:w-1.5 mi:h-1.5 mi:rounded-[50%] mi:[background:var(--c)] mi:shadow-[0_0_0_2px_color-mix(in_srgb,_var(--tint)_12%,_var(--mi-side))]" />
            </button>
          </div>
          <MiIconButton size="small" variant="plain" label="New space"><MiIcon name="plus" :size="16" /></MiIconButton>
        </footer>
      </aside>

      <!-- Content card, framed on the tinted shell. On phones it slides over the list. -->
      <main class="sp__main mi:absolute mi:inset-0 mi:z-2 mi:flex mi:p-2 mi:min-w-0 mi:min-h-0 mi:transform-[translateX(102%)] mi:invisible mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease),_visibility_0s_linear_var(--mi-dur-3)] mi:[.is-detail_&]:transform-none mi:[.is-detail_&]:visible mi:[.is-detail_&]:[transition:transform_var(--mi-dur-3)_var(--mi-ease)] mi:@[720px]:relative mi:@[720px]:inset-auto mi:@[720px]:z-[auto] mi:@[720px]:pt-2.5 mi:@[720px]:pr-2.5 mi:@[720px]:pb-2.5 mi:@[720px]:pl-0 mi:@[720px]:transform-none mi:@[720px]:visible mi:@[720px]:[transition:none] mi:@[720px]:[.is-detail_&]:relative mi:@[720px]:[.is-detail_&]:inset-auto mi:@[720px]:[.is-detail_&]:z-[auto] mi:@[720px]:[.is-detail_&]:pt-2.5 mi:@[720px]:[.is-detail_&]:pr-2.5 mi:@[720px]:[.is-detail_&]:pb-2.5 mi:@[720px]:[.is-detail_&]:pl-0 mi:@[720px]:[.is-detail_&]:transform-none mi:@[720px]:[.is-detail_&]:visible mi:@[720px]:[.is-detail_&]:[transition:none]" aria-labelledby="sp-title">
        <div class="sp__card mi:relative mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:flex mi:flex-col mi:gap-7 mi:pt-3.5 mi:px-4.5 mi:pb-6 mi:rounded-[16px] mi:[background:var(--mi-card)] mi:shadow-2 mi:before:content-[''] mi:before:absolute mi:before:top-0 mi:before:right-0 mi:before:bottom-auto mi:before:left-0 mi:before:h-40 mi:before:pointer-events-none mi:before:[background:linear-gradient(180deg,_color-mix(in_srgb,_var(--tint)_10%,_transparent),_transparent)] mi:@[720px]:pt-4.5 mi:@[720px]:px-9 mi:@[720px]:pb-8 mi:@[720px]:gap-12 mi:@[1100px]:px-14">
          <header class="sp__top mi:relative mi:flex mi:items-center mi:gap-2.5 mi:min-w-0">
            <MiIconButton class="sp__back" size="small" variant="gray" :label="'Back to ' + space.label" @click="detail = false"><MiIcon name="chevron-left" :size="16" /></MiIconButton>
            <MiText as="span" variant="footnote" tone="label2" class="sp__crumb mi:flex-1 mi:min-w-0 mi:text-ellipsis">{{ space.label }} <span class="mi:[.sp__crumb_&]:py-0 mi:[.sp__crumb_&]:px-0.5" aria-hidden="true">/</span> {{ current.group }}</MiText>
            <MiAvatarGroup :items="space.people" :max="3" :size="28" class="sp__people mi:flex-[none]" />
          </header>
          <Transition name="sp-swap" mode="out-in">
            <article :key="space.id + current.item.id" class="sp__doc mi:relative mi:grid mi:justify-items-start mi:gap-2.5 mi:w-full mi:max-w-140 mi:my-0 mi:mx-auto mi:@[720px]:m-0">
              <span class="sp__doc-mark mi:grid mi:place-items-center mi:w-12 mi:h-12 mi:mb-1.5 mi:rounded-[15px] mi:text-[20px] mi:font-750 mi:text-(--tint) mi:[background:color-mix(in_srgb,_var(--tint)_14%,_var(--mi-card))] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--tint)_22%,_transparent),_var(--mi-sh1)]" aria-hidden="true"><MiIcon v-if="'icon' in current.item" :name="current.item.icon" :size="22" /><template v-else>{{ current.item.label.charAt(0) }}</template></span>
              <MiText id="sp-title" as="h3" variant="title1" weight="bold" balance>{{ current.item.label }}</MiText>
              <MiText variant="footnote" tone="label2">{{ current.item.meta }}</MiText>
              <MiText variant="body" class="sp__lede mi:max-w-[52ch]">{{ current.item.note }}</MiText>
              <div v-if="current.item.unread" class="sp__new mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5 mi:w-full mi:box-border mi:mt-2 mi:pt-3 mi:pr-3 mi:pb-3 mi:pl-4 mi:rounded-[14px] mi:[background:color-mix(in_srgb,_var(--tint)_8%,_var(--mi-card))] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--tint)_20%,_transparent)]">
                <MiText as="span" variant="subheadline" weight="semibold">{{ current.item.unread }} new since your last visit</MiText>
                <MiButton size="small" variant="tinted" @click="markRead">Mark as read</MiButton>
              </div>
              <MiText v-else as="p" variant="subheadline" tone="label2" class="sp__caught mi:items-center mi:gap-1.5"><MiIcon name="check-circle" :size="16" /> You're caught up here.</MiText>
              <div class="sp__lines mi:grid mi:gap-2.5 mi:w-full mi:mt-4.5" aria-hidden="true"><span class="mi:[.sp__lines_&]:h-2 mi:[.sp__lines_&]:rounded-[4px] mi:[.sp__lines_&]:[background:var(--mi-fill4)] mi:[.sp__lines_&]:origin-left mi:[.sp__lines_&]:transform-[scaleX(var(--w))]" v-for="n in 5" :key="n" :style="{ '--w': [0.96, 0.84, 0.9, 0.72, 0.38][n - 1] }" /></div>
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
.sp__jump {
  font: inherit; font-size: 13px;
}
.sp__jump span { flex: 1; }
.sp__pin:hover { color: var(--mi-label); background: color-mix(in srgb, var(--mi-card) 85%, transparent); }
.sp__pin.is-active { color: var(--tint); background: var(--mi-card); }
.sp__eyebrow { text-transform: uppercase; letter-spacing: .08em; }
.sp__item {
  font: inherit; font-size: 13.5px;
}
.sp__item:hover { color: var(--mi-label); background: color-mix(in srgb, var(--mi-card) 55%, transparent); }
.sp__item.is-unread { color: var(--mi-label); font-weight: 600; }
.sp__item.is-active { color: var(--mi-label); background: var(--mi-card); }
.sp__dot:hover .sp__dot-core { opacity: .7; }
.sp__dot.is-on .sp__dot-core { opacity: 1; }
.sp__crumb { overflow: hidden; white-space: nowrap; }
.sp__crumb span { color: var(--mi-label3); }
.sp__lede { font-size: 16px; line-height: 1.6; }
.sp__lines span { display: block; }
.sp__caught { display: inline-flex; margin-top: 8px; color: var(--mi-green-t); }

.sp-swap-enter-active, .sp-swap-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.sp-swap-enter-from { opacity: 0; transform: translateY(6px); }
.sp-swap-leave-to { opacity: 0; }

@container (min-width: 720px) {
  .sp__back { display: none; }
}
</style>

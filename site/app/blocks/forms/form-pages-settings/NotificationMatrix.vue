<template>
  <section class="mi:@container/nmx mi:grid mi:content-start mi:gap-5 mi:font-mi mi:text-label" aria-labelledby="nmx-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-2.5 mi:gap-x-5">
      <div class="mi:grid mi:gap-1 mi:max-w-130">
        <MiText id="nmx-title" as="h2" variant="title2" weight="bold">Notifications</MiText>
        <MiText variant="footnote" tone="label2">Pick where each event reaches you. Headers switch a whole row or channel.</MiText>
      </div>
      <p class="mi:inline-flex mi:items-center mi:gap-1.5 mi:m-0 mi:min-w-0 mi:text-[12px] mi:font-medium mi:text-label2" aria-live="polite">
        <MiIcon name="check-circle" :size="15" class="mi:flex-[none] mi:text-green" />
        <span>{{ lastChange }}</span>
      </p>
    </header>

    <div class="mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:@[900px]/nmx:grid-cols-[minmax(0,_1fr)_320px] mi:@[900px]/nmx:gap-5">
      <div class="mi:min-w-0 mi:pt-1.5 mi:px-1 mi:pb-1 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:overflow-x-auto">
        <table class="mi:w-full mi:border-collapse mi:table-fixed">
          <caption class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip:rect(0_0_0_0)] mi:whitespace-nowrap">Notification channels per event</caption>
          <thead>
            <tr>
              <th scope="col" class="mi:w-auto mi:pt-0 mi:pr-2.5 mi:pb-2.5 mi:pl-3.5 mi:text-start mi:align-bottom">
                <MiText as="span" variant="caption" weight="semibold" tone="label2">Event</MiText>
              </th>
              <th v-for="c in channels" :key="c.id" scope="col" class="mi:w-12.5 mi:pt-1 mi:px-0 mi:pb-2 mi:align-bottom mi:@[520px]/nmx:w-19">
                <button
                  type="button" role="checkbox" class="mi:hover:text-label mi:[border:0] mi:[font:inherit] mi:text-inherit mi:[background:transparent] mi:cursor-pointer mi:rounded-[10px] mi:grid mi:justify-items-center mi:gap-1 mi:w-full mi:py-1.5 mi:px-0 mi:text-label2 mi:hover:[background:var(--mi-fill4)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :aria-checked="colState(c.id)" :aria-label="`${c.label} for every event`"
                  @click="toggleCol(c.id)"
                >
                  <MiIcon v-if="c.icon" :name="c.icon" :size="18" />
                  <MiIcon v-else :svg="slackGlyph" :size="18" />
                  <span class="mi:text-[11px] mi:font-semibold mi:tracking-[.01em]">{{ c.label }}</span>
                  <span class="mi:grid mi:place-items-center mi:flex-[none] mi:w-4.5 mi:h-4.5 mi:box-border mi:rounded-[5px] mi:text-p-on" :class="boxClass(colState(c.id))" aria-hidden="true">
                    <MiIcon v-if="colState(c.id) === 'true'" name="check" :size="12" :weight="3" />
                    <span v-else-if="colState(c.id) === 'mixed'" class="mi:w-2 mi:h-0.5 mi:rounded-[1px] mi:[background:var(--mi-p-on)]" />
                  </span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody v-for="g in groups" :key="g.label">
            <tr>
              <th class="mi:pt-3.5 mi:px-3.5 mi:pb-1.5 mi:text-start mi:text-[11px] mi:font-650 mi:tracking-[.06em] mi:uppercase mi:text-label3" :colspan="channels.length + 1" scope="colgroup">{{ g.label }}</th>
            </tr>
            <tr v-for="e in g.events" :key="e.id">
              <th scope="row" class="mi:[tr:nth-child(n+3)>&]:border-t mi:[tr:nth-child(n+3)>&]:border-t-sep mi:pt-0.5 mi:pr-1 mi:pb-0.5 mi:pl-1.5 mi:text-start mi:[font-weight:inherit]">
                <button type="button" role="checkbox" class="mi:[border:0] mi:[font:inherit] mi:text-inherit mi:[background:transparent] mi:cursor-pointer mi:rounded-[10px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:flex mi:[align-items:flex-start] mi:gap-3 mi:w-full mi:py-[9px] mi:px-2 mi:text-start mi:hover:[background:var(--mi-fill4)]" :aria-checked="rowState(e.id)" @click="toggleRow(e.id)">
                  <span class="mi:grid mi:place-items-center mi:flex-[none] mi:w-4.5 mi:h-4.5 mi:box-border mi:rounded-[5px] mi:text-p-on mi:mt-px" :class="boxClass(rowState(e.id))" aria-hidden="true">
                    <MiIcon v-if="rowState(e.id) === 'true'" name="check" :size="12" :weight="3" />
                    <span v-else-if="rowState(e.id) === 'mixed'" class="mi:w-2 mi:h-0.5 mi:rounded-[1px] mi:[background:var(--mi-p-on)]" />
                  </span>
                  <span class="mi:grid mi:gap-px mi:min-w-0">
                    <span class="mi:text-[14px] mi:font-550 mi:leading-[1.3]">{{ e.label }}</span>
                    <span class="mi:hidden mi:text-[12px] mi:leading-[1.35] mi:text-label2 mi:@[520px]/nmx:block">{{ e.desc }}</span>
                  </span>
                </button>
              </th>
              <td v-for="c in channels" :key="c.id" class="mi:[tr:nth-child(n+3)>&]:border-t mi:[tr:nth-child(n+3)>&]:border-t-sep mi:p-0 mi:text-center">
                <button
                  type="button" role="checkbox" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:relative mi:inline-grid mi:place-items-center mi:w-7.5 mi:h-7.5 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:[background:transparent] mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[inherit] mi:before:[transition:transform_var(--mi-dur-3)_var(--mi-spring),_opacity_var(--mi-dur-2)_var(--mi-ease)] mi:motion-reduce:before:[transition:none]" :class="dotClass(prefs[e.id]![c.id], isLocked(e.id, c.id))"
                  :aria-checked="prefs[e.id]![c.id]" :aria-disabled="isLocked(e.id, c.id) || undefined"
                  :aria-label="`${c.label}: ${e.label}${isLocked(e.id, c.id) ? ' (required)' : ''}`"
                  :title="isLocked(e.id, c.id) ? 'Always on for account security' : undefined"
                  @click="toggleCell(e.id, c.id)"
                >
                  <MiIcon v-if="isLocked(e.id, c.id)" name="lock" :size="11" :weight="2.4" class="mi:relative" />
                  <MiIcon v-else name="check" :size="12" :weight="3" class="mi:relative mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring),_opacity_var(--mi-dur-2)_var(--mi-ease)] mi:motion-reduce:[transition:none]" :class="prefs[e.id]![c.id] ? 'mi:opacity-100 mi:[transform:none]' : 'mi:opacity-0 mi:transform-[scale(.6)]'" />
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" class="mi:pt-3 mi:pr-2.5 mi:pb-2.5 mi:pl-3.5 mi:text-start mi:border-t mi:border-t-sep">
                <MiText as="span" variant="caption" weight="semibold" tone="label2">Per week</MiText>
              </th>
              <td v-for="c in channels" :key="c.id" class="mi:pt-3 mi:px-1.5 mi:pb-2.5 mi:border-t mi:border-t-sep mi:text-center">
                <span class="mi:block mi:text-[15px] mi:font-650 mi:tracking-[-.01em] mi:tabular-nums">{{ load[c.id] }}</span>
                <span class="mi:block mi:h-[3px] mi:mt-[5px] mi:mx-auto mi:mb-0 mi:max-w-10 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" aria-hidden="true"><span class="mi:[background:var(--mi-p)] mi:block mi:h-full mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:motion-reduce:[transition:none]" :style="{ transform: `scaleX(${load[c.id] / maxLoad})` }" /></span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="mi:grid mi:gap-4 mi:min-w-0 mi:[@container_nmx_(min-width:_600px)_and_(max-width:_899px)]:grid-cols-2 mi:[@container_nmx_(min-width:_600px)_and_(max-width:_899px)]:items-start">
        <section class="mi:grid mi:gap-3 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="nmx-quiet-title">
          <div class="mi:flex mi:[align-items:flex-start] mi:justify-between mi:gap-3">
            <div class="mi:grid mi:gap-[3px]">
              <MiText id="nmx-quiet-title" as="h3" variant="headline">Quiet hours</MiText>
              <MiText variant="caption" tone="label2">Push and Slack wait until morning. Email is never held.</MiText>
            </div>
            <MiSwitch v-model="quiet" label="Quiet hours" />
          </div>
          <div class="mi:grid mi:grid-cols-24 mi:gap-0.5 mi:mt-1" aria-hidden="true">
            <span
              v-for="h in 24" :key="h" class="mi:relative mi:h-6.5 mi:rounded-[3px] mi:[background:var(--mi-fill3)] mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[inherit] mi:before:[background:linear-gradient(180deg,_var(--mi-p),_color-mix(in_srgb,_var(--mi-p)_60%,_var(--mi-s)))] mi:before:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:before:[transition:none]"
              :class="[!quiet ? 'mi:before:opacity-35' : (h - 1 >= range[0] && h - 1 < range[1]) ? 'mi:before:opacity-100' : 'mi:before:opacity-0', h - 1 === nowHour ? NOW_TICK : '']"
            />
          </div>
          <div class="mi:flex mi:justify-between mi:-mt-1 mi:text-[10px] mi:font-semibold mi:text-label3 mi:tabular-nums" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
          <MiSlider v-model="active" :min="0" :max="24" :disabled="!quiet" aria-label="Delivery window" :format="hh" />
          <MiText variant="footnote" :tone="quiet ? 'label' : 'label2'" class="mi:-mt-1!" tabular>
            <template v-if="quiet">Delivering {{ hh(range[0]) }} to {{ hh(range[1]) }}, {{ range[1] - range[0] }} h a day</template>
            <template v-else>Notifications arrive around the clock</template>
          </MiText>
          <div class="mi:flex mi:items-center mi:gap-2.5 mi:pt-3 mi:border-t mi:border-t-sep">
            <MiSwitch v-model="weekends" size="compact" :disabled="!quiet" label="Keep weekends quiet" />
            <MiText as="span" variant="footnote" :tone="quiet ? 'label' : 'label3'">Keep weekends quiet</MiText>
          </div>
        </section>

        <section class="mi:grid mi:gap-3 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="nmx-digest-title">
          <MiText id="nmx-digest-title" as="h3" variant="headline">Email digest</MiText>
          <MiSegmented v-model="digest" label="Digest frequency" :options="digestOptions" />
          <MiText variant="footnote" tone="label2">
            <template v-if="digest === 'off'">Events without email are only kept in your inbox.</template>
            <template v-else-if="!digestCount">Nothing to round up: every event already reaches your email.</template>
            <template v-else>
              {{ digest === 'daily' ? 'Every weekday at 08:00' : 'Mondays at 08:00' }}, one email rounds up
              <strong class="mi:font-650 mi:text-label mi:tabular-nums">≈ {{ digestCount }} events</strong> you don't get by email.
            </template>
          </MiText>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const NOW_TICK = "mi:after:content-[''] mi:after:absolute mi:after:left-1/2 mi:after:-bottom-1.5 mi:after:w-1 mi:after:h-1 mi:after:-ml-0.5 mi:after:rounded-[50%] mi:after:[background:var(--mi-label)]"

type Channel = 'email' | 'push' | 'slack' | 'app'
type Check = 'true' | 'false' | 'mixed'
const channels: { id: Channel, label: string, icon?: 'tray' | 'bell' | 'desktop' }[] = [
  { id: 'email', label: 'Email', icon: 'tray' },
  { id: 'push', label: 'Push', icon: 'bell' },
  { id: 'slack', label: 'Slack' },
  { id: 'app', label: 'In-app', icon: 'desktop' }
]
const slackGlyph = '<path d="M9.5 3.5 7.5 20.5M16.5 3.5l-2 17M4 8.5h16.5M3.5 15.5H20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>'

// perWeek: how often the event fired for this person over the last month, used for the load forecast.
const groups = [
  { label: 'Your work', events: [
    { id: 'mention', label: 'Mentions and replies', desc: 'Someone @mentions you or answers your thread', perWeek: 24 },
    { id: 'assign', label: 'Assigned to you', desc: 'A task or review lands on your plate', perWeek: 9 },
    { id: 'due', label: 'Due tomorrow', desc: 'Reminder the evening before a deadline', perWeek: 5 }
  ] },
  { label: 'Boards you follow', events: [
    { id: 'comment', label: 'New comments', desc: 'Activity on boards you starred', perWeek: 38 },
    { id: 'status', label: 'Status changes', desc: 'A card moves to Review or Done', perWeek: 17 }
  ] },
  { label: 'Account', events: [
    { id: 'signin', label: 'New sign-in', desc: 'A device you haven’t used before', perWeek: 1 },
    { id: 'invoice', label: 'Invoices', desc: 'Monthly receipt for Northline Studio', perWeek: 0.25 }
  ] }
]
const events = groups.flatMap(g => g.events)
const locked: Partial<Record<string, Channel[]>> = { signin: ['email'] }
const isLocked = (e: string, c: Channel) => locked[e]?.includes(c) ?? false

const row = (email: boolean, push: boolean, slack: boolean, app: boolean) => ({ email, push, slack, app })
const prefs = reactive<Record<string, Record<Channel, boolean>>>({
  mention: row(true, true, true, true),
  assign: row(true, true, false, true),
  due: row(false, true, false, true),
  comment: row(false, false, false, true),
  status: row(false, false, true, true),
  signin: row(true, true, false, true),
  invoice: row(true, false, false, false)
})

const lastChange = ref('Changes save automatically')
const eventLabel = (id: string) => events.find(e => e.id === id)?.label ?? id
const chanLabel = (id: Channel) => channels.find(c => c.id === id)?.label ?? id
const note = (what: string, on: boolean) => { lastChange.value = `Saved · ${what} ${on ? 'on' : 'off'}` }

const stateOf = (vals: boolean[]): Check => (vals.every(Boolean) ? 'true' : vals.some(Boolean) ? 'mixed' : 'false')
const rowState = (e: string) => stateOf(channels.map(c => prefs[e]![c.id]))
const colState = (c: Channel) => stateOf(events.map(e => prefs[e.id]![c]))
const dotClass = (on: boolean, locked: boolean) => [
  locked ? 'mi:cursor-not-allowed mi:text-label2 mi:before:[background:var(--mi-fill3)]' : 'mi:cursor-pointer mi:text-p-on mi:before:[background:var(--mi-p)]',
  on ? 'mi:before:opacity-100 mi:before:transform-none' : 'mi:before:opacity-0 mi:before:transform-[scale(.4)]',
  locked ? 'mi:shadow-none' : 'mi:shadow-[inset_0_0_0_1.5px_var(--mi-fill2)]',
  on ? '' : 'mi:hover:shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)]'
]
const boxClass = (s: Check) => (s === 'false' ? 'mi:[background:transparent] mi:shadow-[inset_0_0_0_1.5px_var(--mi-fill)]' : 'mi:[background:var(--mi-p)] mi:shadow-none')

function toggleCell(e: string, c: Channel) {
  if (isLocked(e, c)) return
  prefs[e]![c] = !prefs[e]![c]
  note(`${chanLabel(c)} for “${eventLabel(e)}”`, prefs[e]![c])
}
// Mixed or off turns everything on; fully on turns everything off, except locked cells.
function toggleRow(e: string) {
  const on = rowState(e) !== 'true'
  for (const c of channels) if (!isLocked(e, c.id)) prefs[e]![c.id] = on
  note(`“${eventLabel(e)}” on every channel`, on)
}
function toggleCol(c: Channel) {
  const on = colState(c) !== 'true'
  for (const e of events) if (!isLocked(e.id, c)) prefs[e.id]![c] = on
  note(`${chanLabel(c)} for every event`, on)
}

const load = computed(() => Object.fromEntries(channels.map(c => [
  c.id, Math.round(events.reduce((sum, e) => sum + (prefs[e.id]![c.id] ? e.perWeek : 0), 0))
])) as Record<Channel, number>)
const maxLoad = Math.round(events.reduce((s, e) => s + e.perWeek, 0))

const quiet = ref(true)
const weekends = ref(true)
const active = ref<number | [number, number]>([8, 19])
const range = computed<[number, number]>(() => (Array.isArray(active.value) ? active.value : [0, active.value]))
const nowHour = 14
const hh = (h: number) => `${String(h).padStart(2, '0')}:00`

const digestOptions = [{ value: 'off', label: 'Off' }, { value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }]
const digest = ref<string | number | null>('weekly')
const digestCount = computed(() => {
  const week = events.reduce((sum, e) => sum + (prefs[e.id]!.email ? 0 : e.perWeek), 0)
  return Math.round(digest.value === 'daily' ? week / 5 : week)
})
</script>

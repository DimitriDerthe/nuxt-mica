<template>
  <section class="nmx" aria-labelledby="nmx-title">
    <header class="nmx__head">
      <div class="nmx__intro">
        <MiText id="nmx-title" as="h2" variant="title2" weight="bold">Notifications</MiText>
        <MiText variant="footnote" tone="label2">Pick where each event reaches you. Headers switch a whole row or channel.</MiText>
      </div>
      <p class="nmx__saved" aria-live="polite">
        <MiIcon name="check-circle" :size="15" />
        <span>{{ lastChange }}</span>
      </p>
    </header>

    <div class="nmx__layout">
      <div class="nmx__matrix">
        <table class="nmx__table">
          <caption class="nmx__sr">Notification channels per event</caption>
          <thead>
            <tr>
              <th scope="col" class="nmx__corner">
                <MiText as="span" variant="caption" weight="semibold" tone="label2">Event</MiText>
              </th>
              <th v-for="c in channels" :key="c.id" scope="col" class="nmx__col">
                <button
                  type="button" role="checkbox" class="nmx__colbtn" :aria-checked="colState(c.id)" :aria-label="`${c.label} for every event`"
                  @click="toggleCol(c.id)"
                >
                  <MiIcon v-if="c.icon" :name="c.icon" :size="18" />
                  <MiIcon v-else :svg="slackGlyph" :size="18" />
                  <span class="nmx__colname">{{ c.label }}</span>
                  <span class="nmx__box" :class="boxClass(colState(c.id))" aria-hidden="true">
                    <MiIcon v-if="colState(c.id) === 'true'" name="check" :size="12" :weight="3" />
                    <span v-else-if="colState(c.id) === 'mixed'" class="nmx__dash" />
                  </span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody v-for="g in groups" :key="g.label">
            <tr class="nmx__group">
              <th :colspan="channels.length + 1" scope="colgroup">{{ g.label }}</th>
            </tr>
            <tr v-for="e in g.events" :key="e.id" class="nmx__row">
              <th scope="row" class="nmx__event">
                <button type="button" role="checkbox" class="nmx__rowbtn" :aria-checked="rowState(e.id)" @click="toggleRow(e.id)">
                  <span class="nmx__box" :class="boxClass(rowState(e.id))" aria-hidden="true">
                    <MiIcon v-if="rowState(e.id) === 'true'" name="check" :size="12" :weight="3" />
                    <span v-else-if="rowState(e.id) === 'mixed'" class="nmx__dash" />
                  </span>
                  <span class="nmx__event-text">
                    <span class="nmx__event-name">{{ e.label }}</span>
                    <span class="nmx__event-desc">{{ e.desc }}</span>
                  </span>
                </button>
              </th>
              <td v-for="c in channels" :key="c.id" class="nmx__cell">
                <button
                  type="button" role="checkbox" class="nmx__dot" :class="{ 'is-on': prefs[e.id]![c.id], 'is-locked': isLocked(e.id, c.id) }"
                  :aria-checked="prefs[e.id]![c.id]" :aria-disabled="isLocked(e.id, c.id) || undefined"
                  :aria-label="`${c.label}: ${e.label}${isLocked(e.id, c.id) ? ' (required)' : ''}`"
                  :title="isLocked(e.id, c.id) ? 'Always on for account security' : undefined"
                  @click="toggleCell(e.id, c.id)"
                >
                  <MiIcon v-if="isLocked(e.id, c.id)" name="lock" :size="11" :weight="2.4" />
                  <MiIcon v-else name="check" :size="12" :weight="3" class="nmx__tick" />
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" class="nmx__foot-label">
                <MiText as="span" variant="caption" weight="semibold" tone="label2">Per week</MiText>
              </th>
              <td v-for="c in channels" :key="c.id" class="nmx__load">
                <span class="nmx__load-num">{{ load[c.id] }}</span>
                <span class="nmx__load-bar" aria-hidden="true"><span :style="{ transform: `scaleX(${load[c.id] / maxLoad})` }" /></span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="nmx__side">
        <section class="nmx__panel" aria-labelledby="nmx-quiet-title">
          <div class="nmx__panel-head">
            <div>
              <MiText id="nmx-quiet-title" as="h3" variant="headline">Quiet hours</MiText>
              <MiText variant="caption" tone="label2">Push and Slack wait until morning. Email is never held.</MiText>
            </div>
            <MiSwitch v-model="quiet" label="Quiet hours" />
          </div>
          <div class="nmx__clock" :class="{ 'is-off': !quiet }" aria-hidden="true">
            <span
              v-for="h in 24" :key="h" class="nmx__hour"
              :class="{ 'is-awake': !quiet || (h - 1 >= range[0] && h - 1 < range[1]), 'is-now': h - 1 === nowHour }"
            />
          </div>
          <div class="nmx__ticks" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
          <MiSlider v-model="active" :min="0" :max="24" :disabled="!quiet" aria-label="Delivery window" :format="hh" />
          <MiText variant="footnote" :tone="quiet ? 'label' : 'label2'" class="nmx__window" tabular>
            <template v-if="quiet">Delivering {{ hh(range[0]) }} to {{ hh(range[1]) }}, {{ range[1] - range[0] }} h a day</template>
            <template v-else>Notifications arrive around the clock</template>
          </MiText>
          <div class="nmx__inline">
            <MiSwitch v-model="weekends" size="compact" :disabled="!quiet" label="Keep weekends quiet" />
            <MiText as="span" variant="footnote" :tone="quiet ? 'label' : 'label3'">Keep weekends quiet</MiText>
          </div>
        </section>

        <section class="nmx__panel" aria-labelledby="nmx-digest-title">
          <MiText id="nmx-digest-title" as="h3" variant="headline">Email digest</MiText>
          <MiSegmented v-model="digest" label="Digest frequency" :options="digestOptions" />
          <MiText variant="footnote" tone="label2">
            <template v-if="digest === 'off'">Events without email are only kept in your inbox.</template>
            <template v-else-if="!digestCount">Nothing to round up: every event already reaches your email.</template>
            <template v-else>
              {{ digest === 'daily' ? 'Every weekday at 08:00' : 'Mondays at 08:00' }}, one email rounds up
              <strong class="nmx__strong">≈ {{ digestCount }} events</strong> you don't get by email.
            </template>
          </MiText>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

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
const boxClass = (s: Check) => ({ 'is-on': s === 'true', 'is-mixed': s === 'mixed' })

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

<style scoped>
.nmx { container: nmx / inline-size; display: grid; align-content: start; gap: 20px; font-family: var(--mi-font); color: var(--mi-label); }
.nmx__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 10px 20px; }
.nmx__intro { display: grid; gap: 4px; max-width: 520px; }
.nmx__saved { display: inline-flex; align-items: center; gap: 6px; margin: 0; min-width: 0; font-size: 12px; font-weight: 500; color: var(--mi-label2); }
.nmx__saved :deep(svg) { flex: none; color: var(--mi-green); }
.nmx__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.nmx__layout { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); align-items: start; }
@container nmx (min-width: 900px) { .nmx__layout { grid-template-columns: minmax(0, 1fr) 320px; gap: 20px; } }

.nmx__matrix { min-width: 0; padding: 6px 4px 4px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow-x: auto; }
.nmx__table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.nmx__corner { width: auto; padding: 0 10px 10px 14px; text-align: start; vertical-align: bottom; }
.nmx__col { width: 50px; padding: 4px 0 8px; vertical-align: bottom; }
@container nmx (min-width: 520px) { .nmx__col { width: 76px; } }

.nmx__colbtn, .nmx__rowbtn {
  border: 0; font: inherit; color: inherit; background: transparent; cursor: pointer; border-radius: 10px;
}
.nmx__colbtn { display: grid; justify-items: center; gap: 4px; width: 100%; padding: 6px 0; color: var(--mi-label2); }
.nmx__colbtn:hover { color: var(--mi-label); background: var(--mi-fill4); }
.nmx__colname { font-size: 11px; font-weight: 600; letter-spacing: .01em; }
.nmx__colbtn:focus-visible, .nmx__rowbtn:focus-visible, .nmx__dot:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }

.nmx__box {
  display: grid; place-items: center; flex: none; width: 18px; height: 18px; box-sizing: border-box; border-radius: 5px;
  box-shadow: inset 0 0 0 1.5px var(--mi-fill); color: var(--mi-p-on); background: transparent;
}
.nmx__box.is-on, .nmx__box.is-mixed { box-shadow: none; background: var(--mi-p); }
.nmx__dash { width: 8px; height: 2px; border-radius: 1px; background: var(--mi-p-on); }

.nmx__group th {
  padding: 14px 14px 6px; text-align: start; font-size: 11px; font-weight: 650; letter-spacing: .06em; text-transform: uppercase; color: var(--mi-label3);
}
.nmx__row + .nmx__row .nmx__event, .nmx__row + .nmx__row .nmx__cell { border-top: 1px solid var(--mi-sep); }
.nmx__event { padding: 2px 4px 2px 6px; text-align: start; font-weight: inherit; }
.nmx__rowbtn { display: flex; align-items: flex-start; gap: 12px; width: 100%; padding: 9px 8px; text-align: start; }
.nmx__rowbtn .nmx__box { margin-top: 1px; }
.nmx__rowbtn:hover { background: var(--mi-fill4); }
.nmx__event-text { display: grid; gap: 1px; min-width: 0; }
.nmx__event-name { font-size: 14px; font-weight: 550; line-height: 1.3; }
.nmx__event-desc { display: none; font-size: 12px; line-height: 1.35; color: var(--mi-label2); }
@container nmx (min-width: 520px) { .nmx__event-desc { display: block; } }

.nmx__cell { padding: 0; text-align: center; }
.nmx__dot {
  position: relative; display: inline-grid; place-items: center; width: 30px; height: 30px; padding: 0; border: 0; border-radius: 50%;
  color: var(--mi-p-on); background: transparent; box-shadow: inset 0 0 0 1.5px var(--mi-fill2); cursor: pointer;
}
.nmx__dot::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; background: var(--mi-p);
  transform: scale(.4); opacity: 0; transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease);
}
.nmx__dot > :deep(svg) { position: relative; }
.nmx__tick { opacity: 0; transform: scale(.6); transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease); }
.nmx__dot:hover:not(.is-on) { box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--mi-p) 55%, transparent); }
.nmx__dot.is-on::before, .nmx__dot.is-on .nmx__tick { transform: none; opacity: 1; }
.nmx__dot.is-locked { cursor: not-allowed; color: var(--mi-label2); box-shadow: none; }
.nmx__dot.is-locked::before { background: var(--mi-fill3); }

.nmx__foot-label { padding: 12px 10px 10px 14px; text-align: start; border-top: 1px solid var(--mi-sep); }
.nmx__load { padding: 12px 6px 10px; border-top: 1px solid var(--mi-sep); text-align: center; }
.nmx__load-num { display: block; font-size: 15px; font-weight: 650; letter-spacing: -.01em; font-variant-numeric: tabular-nums; }
.nmx__load-bar { display: block; height: 3px; margin: 5px auto 0; max-width: 40px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.nmx__load-bar span { display: block; height: 100%; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }

.nmx__side { display: grid; gap: 16px; min-width: 0; }
@container nmx (min-width: 600px) and (max-width: 899px) { .nmx__side { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; } }
.nmx__panel { display: grid; gap: 12px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.nmx__panel-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.nmx__panel-head > div { display: grid; gap: 3px; }

/* 24 hour strip: each hour is a bar, lit while delivery is allowed. */
.nmx__clock { display: grid; grid-template-columns: repeat(24, minmax(0, 1fr)); gap: 2px; margin-top: 4px; }
.nmx__hour { position: relative; height: 26px; border-radius: 3px; background: var(--mi-fill3); }
.nmx__hour::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(180deg, var(--mi-p), color-mix(in srgb, var(--mi-p) 60%, var(--mi-s)));
  opacity: 0; transition: opacity var(--mi-dur-3) var(--mi-ease);
}
.nmx__hour.is-awake::before { opacity: 1; }
.nmx__clock.is-off .nmx__hour::before { opacity: .35; }
.nmx__hour.is-now::after { content: ""; position: absolute; left: 50%; bottom: -6px; width: 4px; height: 4px; margin-left: -2px; border-radius: 50%; background: var(--mi-label); }
.nmx__ticks { display: flex; justify-content: space-between; margin-top: -4px; font-size: 10px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.nmx__window { margin-top: -4px; }
.nmx__inline { display: flex; align-items: center; gap: 10px; padding-top: 12px; border-top: 1px solid var(--mi-sep); }
.nmx__strong { font-weight: 650; color: var(--mi-label); font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) { .nmx__dot::before, .nmx__tick, .nmx__hour::before, .nmx__load-bar span { transition: none; } }
</style>

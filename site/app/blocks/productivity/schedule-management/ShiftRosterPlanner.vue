<template>
  <section class="ro" aria-labelledby="shift-roster-title">
    <header class="ro__head">
      <div>
        <MiText id="shift-roster-title" variant="title3" as="h2" weight="semibold">Support desk roster</MiText>
        <MiText variant="footnote" tone="label2">Week of November 9 · Early 07–15 · Late 14–22</MiText>
      </div>
      <div class="ro__actions">
        <MiBadge v-if="published" tone="success" dot label="Published · team notified" />
        <MiBadge v-else :tone="gaps ? 'warning' : 'neutral'" :label="gaps ? gaps + (gaps > 1 ? ' gaps' : ' gap') + ' to cover' : 'Draft · fully covered'" />
        <MiButton variant="gray" size="small" :disabled="!gaps" @click="fillGaps">Fill gaps</MiButton>
        <MiButton size="small" :disabled="gaps > 0 || published" @click="publish">Publish</MiButton>
      </div>
    </header>

    <div class="ro__brush">
      <MiText id="shift-roster-brush" as="span" variant="footnote" weight="semibold" tone="label2">Paint with</MiText>
      <MiSegmented v-model="brush" variant="tinted" label="Shift to paint" :options="brushes" />
      <MiText as="span" variant="footnote" tone="label2" class="ro__hint">Click a cell to paint it; click again to clear.</MiText>
    </div>

    <div class="ro__scroll" tabindex="0" role="region" aria-label="Roster grid">
      <table class="ro__table">
        <thead>
          <tr>
            <th scope="col" class="ro__who">Agent</th>
            <th v-for="d in days" :key="d.key" scope="col" class="ro__day" :class="{ 'is-weekend': d.weekend }">
              <span class="ro__dow">{{ d.dow }}</span><span class="ro__date">{{ d.date }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in people" :key="p.name">
            <th scope="row" class="ro__who">
              <div class="ro__person">
                <MiAvatar :name="p.name" tone="auto" size="sm" decorative />
                <div class="ro__pinfo">
                  <span class="ro__name">{{ p.name }}</span>
                  <div class="ro__hours">
                    <div class="ro__meter" role="meter" :aria-label="p.name + ' weekly hours'" aria-valuemin="0" aria-valuemax="40" :aria-valuenow="hoursOf(p)">
                      <span :class="{ 'is-over': hoursOf(p) > 40 }" :style="{ transform: `scaleX(${Math.min(hoursOf(p) / 40, 1)})` }" />
                    </div>
                    <span class="ro__h" :class="{ 'is-over': hoursOf(p) > 40 }">{{ hoursOf(p) }}h</span>
                  </div>
                </div>
              </div>
            </th>
            <td v-for="(s, i) in p.week" :key="i" class="ro__cell-td" :class="{ 'is-weekend': days[i]?.weekend }">
              <button
                type="button" class="ro__cell" :class="['is-' + s, { 'is-turn': quickTurn(p, i) }]" :disabled="s === 'P'"
                :aria-label="`${p.name}, ${days[i]?.long}: ${label[s]}${quickTurn(p, i) ? ', quick turnaround' : ''}`"
                @click="paint(p, i)"
              >
                <MiIcon v-if="s === 'P'" name="lock" :size="12" />
                <span>{{ short[s] }}</span>
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr v-for="shift in covShifts" :key="shift">
            <th scope="row" class="ro__who ro__cov-label">{{ label[shift] }} coverage</th>
            <td v-for="(d, i) in days" :key="d.key" class="ro__cov-td">
              <span class="ro__cov" :class="'is-' + coverage(shift, i).state">
                <MiIcon :name="coverage(shift, i).state === 'ok' ? 'check' : coverage(shift, i).state === 'short' ? 'exclamation-circle' : 'plus'" :size="12" :weight="2.4" />
                {{ coverage(shift, i).have }}/{{ coverage(shift, i).need }}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <ul class="ro__legend" aria-label="Legend">
      <li><span class="ro__swatch is-E" />Early</li>
      <li><span class="ro__swatch is-L" />Late</li>
      <li><span class="ro__swatch is-P" />Approved leave</li>
      <li><span class="ro__swatch is-turn" />Late then Early: under 11h rest</li>
    </ul>
    <p class="ro__sr" role="status">{{ announce }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Shift = 'E' | 'L' | 'O' | 'P'
interface Person { name: string, week: Shift[] }

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dow, i) => ({
  key: dow, dow, date: 9 + i, weekend: i > 4,
  long: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i] + ' ' + (9 + i)
}))
const need: Record<'E' | 'L', number[]> = { E: [2, 2, 2, 2, 2, 1, 1], L: [2, 2, 2, 2, 2, 2, 2] }
const covShifts = ['E', 'L'] as const
const label: Record<Shift, string> = { E: 'Early', L: 'Late', O: 'Off', P: 'Leave' }
const short: Record<Shift, string> = { E: '07–15', L: '14–22', O: '—', P: 'Leave' }

// Sample roster; swap for your workforce API.
const people = reactive<Person[]>([
  { name: 'Amara Diallo', week: ['E', 'E', 'E', 'E', 'E', 'O', 'O'] },
  { name: 'Jonas Weber', week: ['L', 'L', 'O', 'L', 'O', 'L', 'O'] },
  { name: 'Priya Nair', week: ['E', 'O', 'E', 'E', 'P', 'P', 'O'] },
  { name: 'Lucas Martin', week: ['O', 'L', 'L', 'O', 'L', 'E', 'L'] },
  { name: 'Sofia Ricci', week: ['L', 'O', 'L', 'L', 'O', 'O', 'E'] },
  { name: 'Kenji Mori', week: ['O', 'O', 'O', 'E', 'E', 'L', 'O'] }
])

const brushes = [{ value: 'E', label: 'Early' }, { value: 'L', label: 'Late' }, { value: 'O', label: 'Off' }]
const brush = ref<string | number | null>('L')
const published = ref(false)
const announce = ref('')

const hoursOf = (p: Person) => p.week.filter(s => s === 'E' || s === 'L').length * 8
const quickTurn = (p: Person, i: number) => i > 0 && p.week[i] === 'E' && p.week[i - 1] === 'L'

function coverage(shift: 'E' | 'L', i: number) {
  const have = people.filter(p => p.week[i] === shift).length
  const n = need[shift][i]!
  return { have, need: n, state: have < n ? 'short' : have > n ? 'over' : 'ok' }
}

const gaps = computed(() => (['E', 'L'] as const).reduce(
  (sum, s) => sum + days.reduce((acc, _, i) => acc + Math.max(0, need[s][i]! - people.filter(p => p.week[i] === s).length), 0), 0
))
const refresh = () => { published.value = false }

function paint(p: Person, i: number) {
  const b = (brush.value ?? 'O') as Shift
  p.week[i] = p.week[i] === b ? 'O' : b
  refresh()
  announce.value = `${p.name}, ${days[i]?.long}: ${label[p.week[i]!]}.`
}

/** Covers each short slot with the least-booked agent who is off that day, stays at 40h or under and keeps 11h of rest. */
function fillGaps() {
  const filled: string[] = []
  for (const s of ['E', 'L'] as const) {
    days.forEach((d, i) => {
      while (people.filter(p => p.week[i] === s).length < need[s][i]!) {
        const pick = people
          .filter(p => p.week[i] === 'O' && hoursOf(p) + 8 <= 40)
          .filter(p => !(s === 'E' && p.week[i - 1] === 'L') && !(s === 'L' && p.week[i + 1] === 'E'))
          .sort((a, b) => hoursOf(a) - hoursOf(b))[0]
        if (!pick) break
        pick.week[i] = s
        filled.push(`${pick.name.split(' ')[0]} on ${d.dow} ${label[s].toLowerCase()}`)
      }
    })
  }
  refresh()
  announce.value = filled.length ? `Filled: ${filled.join(', ')}.` : 'No one available to fill the remaining gaps.'
}

function publish() {
  published.value = true
  announce.value = 'Roster published. Six agents notified.'
}
</script>

<style scoped>
.ro { container-type: inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.ro__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.ro__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.ro__brush { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.ro__hint { display: none; }
@container (min-width: 640px) { .ro__hint { display: inline; } }

.ro__scroll {
  overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x mandatory; scroll-padding-inline-start: 160px;
  border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1);
}
.ro__scroll:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.ro__table { width: 100%; min-width: 660px; border-collapse: separate; border-spacing: 0; table-layout: fixed; }
.ro__table th, .ro__table td { padding: 0; font-weight: inherit; }
.ro__who { position: sticky; inset-inline-start: 0; z-index: 2; width: 160px; background: var(--mi-card); text-align: start; border-inline-end: 1px solid var(--mi-sep); }
@container (min-width: 900px) { .ro__who { width: 210px; } }
thead .ro__who { padding: 12px 14px; font-size: 12px; font-weight: 600; color: var(--mi-label2); text-transform: uppercase; letter-spacing: .05em; }
.ro__day { padding: 12px 4px 10px; scroll-snap-align: start; text-align: center; }
.ro__day.is-weekend, .ro__cell-td.is-weekend { background: color-mix(in srgb, var(--mi-fill4) 70%, transparent); }
.ro__dow { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--mi-label2); }
.ro__date { display: block; font-size: 18px; font-weight: 700; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
thead th { border-bottom: 1px solid var(--mi-sep); }
tbody tr + tr th, tbody tr + tr td { border-top: 1px solid var(--mi-sep); }

.ro__person { display: flex; align-items: center; gap: 10px; padding: 10px 12px; min-width: 0; }
.ro__pinfo { display: grid; gap: 5px; min-width: 0; flex: 1; }
.ro__name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ro__hours { display: flex; align-items: center; gap: 6px; }
.ro__meter { flex: 1; height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.ro__meter span { display: block; height: 100%; background: var(--mi-green); transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-spring); }
.ro__meter span.is-over { background: var(--mi-orange); }
.ro__h { font-size: 11px; font-weight: 600; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.ro__h.is-over { color: var(--mi-orange-t); }

.ro__cell-td { padding: 6px 4px; }
.ro__cell {
  position: relative; display: flex; align-items: center; justify-content: center; gap: 4px; width: 100%; height: 40px; border: 0; border-radius: 10px;
  font: inherit; font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; cursor: pointer; background: transparent; color: var(--mi-label3);
  transition: transform var(--mi-dur-2) var(--mi-spring);
}
.ro__cell:hover:not(:disabled) { background: var(--mi-fill4); }
.ro__cell:active:not(:disabled) { transform: scale(.94); }
.ro__cell:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.ro__cell.is-E, .ro__swatch.is-E { background: var(--mi-p-tint); color: var(--mi-p-text); }
.ro__cell.is-L, .ro__swatch.is-L { background: var(--mi-s-tint); color: var(--mi-s-text); }
.ro__cell.is-P, .ro__swatch.is-P {
  cursor: not-allowed; color: var(--mi-orange-t);
  background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--mi-orange) 16%, transparent) 0 6px, transparent 6px 12px);
}
.ro__cell.is-turn::after { content: ""; position: absolute; top: 5px; inset-inline-end: 5px; width: 7px; height: 7px; border-radius: 50%; background: var(--mi-orange); }

tfoot th, tfoot td { border-top: 1px solid var(--mi-sep); }
tfoot tr:first-child th, tfoot tr:first-child td { border-top-width: 2px; }
.ro__cov-label { padding: 10px 14px; font-size: 12px; font-weight: 600; color: var(--mi-label2); }
.ro__cov-td { padding: 8px 4px; text-align: center; }
.ro__cov { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
.ro__cov.is-ok { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 12%, transparent); }
.ro__cov.is-short { color: var(--mi-red-t); background: color-mix(in srgb, var(--mi-red) 12%, transparent); }
.ro__cov.is-over { color: var(--mi-label2); background: var(--mi-fill3); }

.ro__legend { display: flex; flex-wrap: wrap; gap: 8px 16px; margin: 0; padding: 0; list-style: none; font-size: 12px; color: var(--mi-label2); }
.ro__legend li { display: inline-flex; align-items: center; gap: 6px; }
.ro__swatch { position: relative; width: 14px; height: 14px; border-radius: 4px; }
.ro__swatch.is-turn { background: var(--mi-orange); width: 8px; height: 8px; border-radius: 50%; }
.ro__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; margin: 0; }
</style>

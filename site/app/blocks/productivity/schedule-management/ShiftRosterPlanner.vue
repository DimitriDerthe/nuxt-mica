<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="shift-roster-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="shift-roster-title" variant="title3" as="h2" weight="semibold">Support desk roster</MiText>
        <MiText variant="footnote" tone="label2">Week of November 9 · Early 07–15 · Late 14–22</MiText>
      </div>
      <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2">
        <MiBadge v-if="published" tone="success" dot label="Published · team notified" />
        <MiBadge v-else :tone="gaps ? 'warning' : 'neutral'" :label="gaps ? gaps + (gaps > 1 ? ' gaps' : ' gap') + ' to cover' : 'Draft · fully covered'" />
        <MiButton variant="gray" size="small" :disabled="!gaps" @click="fillGaps">Fill gaps</MiButton>
        <MiButton size="small" :disabled="gaps > 0 || published" @click="publish">Publish</MiButton>
      </div>
    </header>

    <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2.5">
      <MiText id="shift-roster-brush" as="span" variant="footnote" weight="semibold" tone="label2">Paint with</MiText>
      <MiSegmented v-model="brush" variant="tinted" label="Shift to paint" :options="brushes" />
      <MiText as="span" variant="footnote" tone="label2" class="mi:hidden! mi:@[640px]:inline!">Click a cell to paint it; click again to clear.</MiText>
    </div>

    <div class="mi:overflow-x-auto mi:overscroll-x-contain mi:[scroll-snap-type:x_mandatory] mi:[scroll-padding-inline-start:160px] mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" tabindex="0" role="region" aria-label="Roster grid">
      <table class="mi:w-full mi:min-w-165 mi:border-separate mi:[border-spacing:0] mi:table-fixed">
        <thead>
          <tr>
            <th scope="col" class="mi:py-3 mi:px-3.5 mi:font-semibold mi:sticky mi:start-0 mi:z-2 mi:w-40 mi:[background:var(--mi-card)] mi:text-start mi:[border-inline-end:1px_solid_var(--mi-sep)] mi:@[900px]:w-52.5 mi:[thead_&]:text-[12px] mi:[thead_&]:text-label2 mi:[thead_&]:uppercase mi:[thead_&]:tracking-[.05em] mi:[thead_&]:border-b mi:[thead_&]:border-b-sep mi:[tbody_tr+tr_th&]:border-t mi:[tbody_tr+tr_th&]:border-t-sep mi:[tfoot_tr:first-child_th&]:[border-top-width:2px]">Agent</th>
            <th v-for="d in days" :key="d.key" scope="col" class="mi:p-0 mi:[font-weight:inherit] mi:snap-start mi:text-center mi:[thead_&]:border-b mi:[thead_&]:border-b-sep mi:[tbody_tr+tr_th&]:border-t mi:[tbody_tr+tr_th&]:border-t-sep mi:[tfoot_tr:first-child_th&]:[border-top-width:2px]" :class="d.weekend ? 'mi:[background:color-mix(in_srgb,_var(--mi-fill4)_70%,_transparent)]' : ''">
              <span class="mi:block mi:text-[11px] mi:font-semibold mi:uppercase mi:tracking-[.05em] mi:text-label2">{{ d.dow }}</span><span class="mi:block mi:text-[18px] mi:font-bold mi:tracking-[-.02em] mi:tabular-nums">{{ d.date }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in people" :key="p.name">
            <th scope="row" class="mi:p-0 mi:[font-weight:inherit] mi:sticky mi:start-0 mi:z-2 mi:w-40 mi:[background:var(--mi-card)] mi:text-start mi:[border-inline-end:1px_solid_var(--mi-sep)] mi:@[900px]:w-52.5 mi:[thead_&]:text-[12px] mi:[thead_&]:text-label2 mi:[thead_&]:uppercase mi:[thead_&]:tracking-[.05em] mi:[tbody_tr+tr_th&]:border-t mi:[tbody_tr+tr_th&]:border-t-sep mi:[tfoot_tr:first-child_th&]:[border-top-width:2px]">
              <div class="mi:flex mi:items-center mi:gap-2.5 mi:py-2.5 mi:px-3 mi:min-w-0">
                <MiAvatar class="mi:[tbody_tr+tr_th&]:border-t mi:[tbody_tr+tr_th&]:border-t-sep mi:[tbody_tr+tr_td&]:border-t mi:[tbody_tr+tr_td&]:border-t-sep mi:[tfoot_tr:first-child_th&]:[border-top-width:2px] mi:[tfoot_tr:first-child_td&]:[border-top-width:2px]" :name="p.name" tone="auto" size="sm" decorative />
                <div class="mi:grid mi:gap-[5px] mi:min-w-0 mi:flex-1">
                  <span class="mi:text-[14px] mi:font-semibold mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ p.name }}</span>
                  <div class="mi:flex mi:items-center mi:gap-1.5">
                    <div class="mi:flex-1 mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" :aria-label="p.name + ' weekly hours'" aria-valuemin="0" aria-valuemax="40" :aria-valuenow="hoursOf(p)">
                      <span class="mi:block mi:h-full mi:origin-left mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :class="hoursOf(p) > 40 ? 'mi:bg-orange' : 'mi:bg-green'" :style="{ transform: `scaleX(${Math.min(hoursOf(p) / 40, 1)})` }" />
                    </div>
                    <span class="mi:text-[11px] mi:font-semibold mi:tabular-nums" :class="hoursOf(p) > 40 ? 'mi:text-orange-t' : 'mi:text-label2'">{{ hoursOf(p) }}h</span>
                  </div>
                </div>
              </div>
            </th>
            <td v-for="(s, i) in p.week" :key="i" class="mi:p-0 mi:[font-weight:inherit] mi:[tbody_tr+tr_td&]:border-t mi:[tbody_tr+tr_td&]:border-t-sep mi:[tfoot_tr:first-child_td&]:[border-top-width:2px]" :class="days[i]?.weekend ? 'mi:[background:color-mix(in_srgb,_var(--mi-fill4)_70%,_transparent)]' : ''">
              <button
                type="button" class="mi:[font:inherit] mi:text-[12px] mi:font-semibold mi:tabular-nums mi:relative mi:flex mi:items-center mi:justify-center mi:gap-1 mi:w-full mi:h-10 mi:[border:0] mi:rounded-[10px] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:[&:active:not(:disabled)]:transform-[scale(.94)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :class="[CELL[s], quickTurn(p, i) ? TURN : '']" :disabled="s === 'P'"
                :aria-label="`${p.name}, ${days[i]?.long}: ${label[s]}${quickTurn(p, i) ? ', quick turnaround' : ''}`"
                @click="paint(p, i)"
              >
                <MiIcon class="mi:[tbody_tr+tr_th&]:border-t mi:[tbody_tr+tr_th&]:border-t-sep mi:[tbody_tr+tr_td&]:border-t mi:[tbody_tr+tr_td&]:border-t-sep mi:[tfoot_tr:first-child_th&]:[border-top-width:2px] mi:[tfoot_tr:first-child_td&]:[border-top-width:2px]" v-if="s === 'P'" name="lock" :size="12" />
                <span>{{ short[s] }}</span>
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr v-for="shift in covShifts" :key="shift">
            <th scope="row" class="mi:p-0 mi:sticky mi:start-0 mi:z-2 mi:w-40 mi:[background:var(--mi-card)] mi:text-start mi:[border-inline-end:1px_solid_var(--mi-sep)] mi:@[900px]:w-52.5 mi:[thead_&]:text-[12px] mi:[thead_&]:text-label2 mi:[thead_&]:uppercase mi:[thead_&]:tracking-[.05em] mi:[tbody_tr+tr_th&]:border-t mi:[tbody_tr+tr_th&]:border-t-sep mi:[tfoot_th&]:border-t mi:[tfoot_th&]:border-t-sep mi:[tfoot_tr:first-child_th&]:[border-top-width:2px] mi:[font-weight:inherit] mi:text-[12px] mi:text-label2">{{ label[shift] }} coverage</th>
            <td v-for="(d, i) in days" :key="d.key" class="mi:p-0 mi:[font-weight:inherit] mi:[tbody_tr+tr_td&]:border-t mi:[tbody_tr+tr_td&]:border-t-sep mi:[tfoot_td&]:border-t mi:[tfoot_td&]:border-t-sep mi:[tfoot_tr:first-child_td&]:[border-top-width:2px] mi:text-center">
              <span class="mi:inline-flex mi:items-center mi:gap-1 mi:py-[3px] mi:px-2 mi:rounded-[999px] mi:text-[12px] mi:font-semibold mi:tabular-nums" :class="COV[coverage(shift, i).state]">
                <MiIcon class="mi:[tbody_tr+tr_th&]:border-t mi:[tbody_tr+tr_th&]:border-t-sep mi:[tbody_tr+tr_td&]:border-t mi:[tbody_tr+tr_td&]:border-t-sep mi:[tfoot_th&]:border-t mi:[tfoot_th&]:border-t-sep mi:[tfoot_td&]:border-t mi:[tfoot_td&]:border-t-sep mi:[tfoot_tr:first-child_th&]:[border-top-width:2px] mi:[tfoot_tr:first-child_td&]:[border-top-width:2px]" :name="coverage(shift, i).state === 'ok' ? 'check' : coverage(shift, i).state === 'short' ? 'exclamation-circle' : 'plus'" :size="12" :weight="2.4" />
                {{ coverage(shift, i).have }}/{{ coverage(shift, i).need }}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <ul class="mi:flex mi:flex-wrap mi:gap-y-2 mi:gap-x-4 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[12px] mi:text-label2" aria-label="Legend">
      <li class="mi:inline-flex mi:items-center mi:gap-1.5"><span class="mi:text-p-text mi:bg-p-tint mi:relative mi:w-3.5 mi:h-3.5 mi:rounded-[4px]" />Early</li>
      <li class="mi:inline-flex mi:items-center mi:gap-1.5"><span class="mi:text-s-text mi:bg-s-tint mi:relative mi:w-3.5 mi:h-3.5 mi:rounded-[4px]" />Late</li>
      <li class="mi:inline-flex mi:items-center mi:gap-1.5"><span class="mi:cursor-not-allowed mi:text-orange-t mi:[background:repeating-linear-gradient(135deg,_color-mix(in_srgb,_var(--mi-orange)_16%,_transparent)_0_6px,_transparent_6px_12px)] mi:relative mi:w-3.5 mi:h-3.5 mi:rounded-[4px]" />Approved leave</li>
      <li class="mi:inline-flex mi:items-center mi:gap-1.5"><span class="mi:relative mi:w-2 mi:h-2 mi:rounded-[50%] mi:bg-orange" />Late then Early: under 11h rest</li>
    </ul>
    <p class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap mi:m-0" role="status">{{ announce }}</p>
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
const CELL: Record<Shift, string> = {
  E: 'mi:cursor-pointer mi:[background:var(--mi-p-tint)] mi:text-p-text',
  L: 'mi:cursor-pointer mi:[background:var(--mi-s-tint)] mi:text-s-text',
  O: 'mi:cursor-pointer mi:[background:transparent] mi:text-label3 mi:hover:[background:var(--mi-fill4)]',
  P: 'mi:cursor-not-allowed mi:text-orange-t mi:[background:repeating-linear-gradient(135deg,_color-mix(in_srgb,_var(--mi-orange)_16%,_transparent)_0_6px,_transparent_6px_12px)]'
}
const TURN = "mi:after:content-[''] mi:after:absolute mi:after:top-[5px] mi:after:end-[5px] mi:after:w-[7px] mi:after:h-[7px] mi:after:rounded-[50%] mi:after:[background:var(--mi-orange)]"
const COV: Record<string, string> = {
  ok: 'mi:text-green-t mi:bg-green/12',
  short: 'mi:text-red-t mi:bg-red/12',
  over: 'mi:text-label2 mi:bg-fill3'
}
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

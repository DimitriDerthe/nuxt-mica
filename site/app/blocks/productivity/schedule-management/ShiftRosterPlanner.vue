<template>
  <section class="ro mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="shift-roster-title">
    <header class="ro__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="shift-roster-title" variant="title3" as="h2" weight="semibold">Support desk roster</MiText>
        <MiText variant="footnote" tone="label2">Week of November 9 · Early 07–15 · Late 14–22</MiText>
      </div>
      <div class="ro__actions mi:flex mi:flex-wrap mi:items-center mi:gap-2">
        <MiBadge v-if="published" tone="success" dot label="Published · team notified" />
        <MiBadge v-else :tone="gaps ? 'warning' : 'neutral'" :label="gaps ? gaps + (gaps > 1 ? ' gaps' : ' gap') + ' to cover' : 'Draft · fully covered'" />
        <MiButton variant="gray" size="small" :disabled="!gaps" @click="fillGaps">Fill gaps</MiButton>
        <MiButton size="small" :disabled="gaps > 0 || published" @click="publish">Publish</MiButton>
      </div>
    </header>

    <div class="ro__brush mi:flex mi:flex-wrap mi:items-center mi:gap-2.5">
      <MiText id="shift-roster-brush" as="span" variant="footnote" weight="semibold" tone="label2">Paint with</MiText>
      <MiSegmented v-model="brush" variant="tinted" label="Shift to paint" :options="brushes" />
      <MiText as="span" variant="footnote" tone="label2" class="ro__hint">Click a cell to paint it; click again to clear.</MiText>
    </div>

    <div class="ro__scroll mi:overflow-x-auto mi:overscroll-x-contain mi:[scroll-snap-type:x_mandatory] mi:[scroll-padding-inline-start:160px] mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" tabindex="0" role="region" aria-label="Roster grid">
      <table class="ro__table mi:w-full mi:min-w-165 mi:border-separate mi:[border-spacing:0] mi:table-fixed">
        <thead>
          <tr>
            <th scope="col" class="ro__who mi:sticky mi:start-0 mi:z-2 mi:w-40 mi:[background:var(--mi-card)] mi:text-start mi:[border-inline-end:1px_solid_var(--mi-sep)] mi:@[900px]:w-52.5 mi:[thead_&]:text-[12px] mi:[thead_&]:text-label2 mi:[thead_&]:uppercase mi:[thead_&]:tracking-[.05em] mi:[thead_&]:border-b mi:[thead_&]:border-b-sep mi:[tbody_tr+tr_th&]:border-t mi:[tbody_tr+tr_th&]:border-t-sep mi:[tfoot_tr:first-child_th&]:[border-top-width:2px]">Agent</th>
            <th v-for="d in days" :key="d.key" scope="col" class="ro__day mi:pt-3 mi:px-1 mi:pb-2.5 mi:snap-start mi:text-center mi:[&.is-weekend]:[background:color-mix(in_srgb,_var(--mi-fill4)_70%,_transparent)] mi:[thead_&]:border-b mi:[thead_&]:border-b-sep mi:[tbody_tr+tr_th&]:border-t mi:[tbody_tr+tr_th&]:border-t-sep mi:[tfoot_tr:first-child_th&]:[border-top-width:2px]" :class="{ 'is-weekend': d.weekend }">
              <span class="ro__dow mi:block mi:text-[11px] mi:font-semibold mi:uppercase mi:tracking-[.05em] mi:text-label2">{{ d.dow }}</span><span class="ro__date mi:block mi:text-[18px] mi:font-bold mi:tracking-[-.02em] mi:tabular-nums">{{ d.date }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in people" :key="p.name">
            <th scope="row" class="ro__who mi:sticky mi:start-0 mi:z-2 mi:w-40 mi:[background:var(--mi-card)] mi:text-start mi:[border-inline-end:1px_solid_var(--mi-sep)] mi:@[900px]:w-52.5 mi:[thead_&]:text-[12px] mi:[thead_&]:text-label2 mi:[thead_&]:uppercase mi:[thead_&]:tracking-[.05em] mi:[tbody_tr+tr_th&]:border-t mi:[tbody_tr+tr_th&]:border-t-sep mi:[tfoot_tr:first-child_th&]:[border-top-width:2px]">
              <div class="ro__person mi:flex mi:items-center mi:gap-2.5 mi:py-2.5 mi:px-3 mi:min-w-0">
                <MiAvatar class="mi:[tbody_tr+tr_th&]:border-t mi:[tbody_tr+tr_th&]:border-t-sep mi:[tbody_tr+tr_td&]:border-t mi:[tbody_tr+tr_td&]:border-t-sep mi:[tfoot_tr:first-child_th&]:[border-top-width:2px] mi:[tfoot_tr:first-child_td&]:[border-top-width:2px]" :name="p.name" tone="auto" size="sm" decorative />
                <div class="ro__pinfo mi:grid mi:gap-[5px] mi:min-w-0 mi:flex-1">
                  <span class="ro__name mi:text-[14px] mi:font-semibold mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ p.name }}</span>
                  <div class="ro__hours mi:flex mi:items-center mi:gap-1.5">
                    <div class="ro__meter mi:flex-1 mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" :aria-label="p.name + ' weekly hours'" aria-valuemin="0" aria-valuemax="40" :aria-valuenow="hoursOf(p)">
                      <span class="mi:[.ro__meter_&]:origin-left mi:[.ro__meter_&]:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :class="{ 'is-over': hoursOf(p) > 40 }" :style="{ transform: `scaleX(${Math.min(hoursOf(p) / 40, 1)})` }" />
                    </div>
                    <span class="ro__h mi:text-[11px] mi:font-semibold mi:text-label2 mi:tabular-nums mi:[&.is-over]:text-orange-t" :class="{ 'is-over': hoursOf(p) > 40 }">{{ hoursOf(p) }}h</span>
                  </div>
                </div>
              </div>
            </th>
            <td v-for="(s, i) in p.week" :key="i" class="ro__cell-td mi:[&.is-weekend]:[background:color-mix(in_srgb,_var(--mi-fill4)_70%,_transparent)] mi:[tbody_tr+tr_td&]:border-t mi:[tbody_tr+tr_td&]:border-t-sep mi:py-1.5 mi:px-1 mi:[tfoot_tr:first-child_td&]:[border-top-width:2px]" :class="{ 'is-weekend': days[i]?.weekend }">
              <button
                type="button" class="ro__cell mi:relative mi:flex mi:items-center mi:justify-center mi:gap-1 mi:w-full mi:h-10 mi:[border:0] mi:rounded-[10px] mi:cursor-pointer mi:[background:transparent] mi:text-label3 mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:[&:hover:not(:disabled)]:[background:var(--mi-fill4)] mi:[&:active:not(:disabled)]:transform-[scale(.94)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:[&.is-E]:[background:var(--mi-p-tint)] mi:[&.is-E]:text-p-text mi:[&.is-L]:[background:var(--mi-s-tint)] mi:[&.is-L]:text-s-text mi:[&.is-P]:cursor-not-allowed mi:[&.is-P]:text-orange-t mi:[&.is-P]:[background:repeating-linear-gradient(135deg,_color-mix(in_srgb,_var(--mi-orange)_16%,_transparent)_0_6px,_transparent_6px_12px)] mi:[&.is-turn]:after:content-[''] mi:[&.is-turn]:after:absolute mi:[&.is-turn]:after:top-[5px] mi:[&.is-turn]:after:end-[5px] mi:[&.is-turn]:after:w-[7px] mi:[&.is-turn]:after:h-[7px] mi:[&.is-turn]:after:rounded-[50%] mi:[&.is-turn]:after:[background:var(--mi-orange)]" :class="['is-' + s, { 'is-turn': quickTurn(p, i) }]" :disabled="s === 'P'"
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
            <th scope="row" class="ro__who ro__cov-label mi:sticky mi:start-0 mi:z-2 mi:w-40 mi:[background:var(--mi-card)] mi:text-start mi:[border-inline-end:1px_solid_var(--mi-sep)] mi:@[900px]:w-52.5 mi:[thead_&]:text-[12px] mi:[thead_&]:text-label2 mi:[thead_&]:uppercase mi:[thead_&]:tracking-[.05em] mi:[tbody_tr+tr_th&]:border-t mi:[tbody_tr+tr_th&]:border-t-sep mi:[tfoot_th&]:border-t mi:[tfoot_th&]:border-t-sep mi:[tfoot_tr:first-child_th&]:[border-top-width:2px] mi:py-2.5 mi:px-3.5 mi:text-[12px] mi:font-semibold mi:text-label2">{{ label[shift] }} coverage</th>
            <td v-for="(d, i) in days" :key="d.key" class="ro__cov-td mi:[tbody_tr+tr_td&]:border-t mi:[tbody_tr+tr_td&]:border-t-sep mi:[tfoot_td&]:border-t mi:[tfoot_td&]:border-t-sep mi:[tfoot_tr:first-child_td&]:[border-top-width:2px] mi:py-2 mi:px-1 mi:text-center">
              <span class="ro__cov mi:inline-flex mi:items-center mi:gap-1 mi:py-[3px] mi:px-2 mi:rounded-[999px] mi:text-[12px] mi:font-semibold mi:tabular-nums mi:[&.is-ok]:text-green-t" :class="'is-' + coverage(shift, i).state">
                <MiIcon class="mi:[tbody_tr+tr_th&]:border-t mi:[tbody_tr+tr_th&]:border-t-sep mi:[tbody_tr+tr_td&]:border-t mi:[tbody_tr+tr_td&]:border-t-sep mi:[tfoot_th&]:border-t mi:[tfoot_th&]:border-t-sep mi:[tfoot_td&]:border-t mi:[tfoot_td&]:border-t-sep mi:[tfoot_tr:first-child_th&]:[border-top-width:2px] mi:[tfoot_tr:first-child_td&]:[border-top-width:2px]" :name="coverage(shift, i).state === 'ok' ? 'check' : coverage(shift, i).state === 'short' ? 'exclamation-circle' : 'plus'" :size="12" :weight="2.4" />
                {{ coverage(shift, i).have }}/{{ coverage(shift, i).need }}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <ul class="ro__legend mi:flex mi:flex-wrap mi:gap-y-2 mi:gap-x-4 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[12px] mi:text-label2" aria-label="Legend">
      <li class="mi:[.ro__legend_&]:items-center mi:[.ro__legend_&]:gap-1.5"><span class="ro__swatch is-E mi:[&.is-E]:text-p-text mi:[&.is-L]:text-s-text mi:[&.is-P]:cursor-not-allowed mi:[&.is-P]:text-orange-t mi:relative mi:w-3.5 mi:h-3.5 mi:rounded-[4px] mi:[&.is-turn]:w-2 mi:[&.is-turn]:rounded-[50%]" />Early</li>
      <li class="mi:[.ro__legend_&]:items-center mi:[.ro__legend_&]:gap-1.5"><span class="ro__swatch is-L mi:[&.is-E]:text-p-text mi:[&.is-L]:text-s-text mi:[&.is-P]:cursor-not-allowed mi:[&.is-P]:text-orange-t mi:relative mi:w-3.5 mi:h-3.5 mi:rounded-[4px] mi:[&.is-turn]:w-2 mi:[&.is-turn]:rounded-[50%]" />Late</li>
      <li class="mi:[.ro__legend_&]:items-center mi:[.ro__legend_&]:gap-1.5"><span class="ro__swatch is-P mi:[&.is-E]:text-p-text mi:[&.is-L]:text-s-text mi:[&.is-P]:cursor-not-allowed mi:[&.is-P]:text-orange-t mi:relative mi:w-3.5 mi:h-3.5 mi:rounded-[4px] mi:[&.is-turn]:w-2 mi:[&.is-turn]:rounded-[50%]" />Approved leave</li>
      <li class="mi:[.ro__legend_&]:items-center mi:[.ro__legend_&]:gap-1.5"><span class="ro__swatch is-turn mi:[&.is-E]:text-p-text mi:[&.is-L]:text-s-text mi:[&.is-P]:cursor-not-allowed mi:[&.is-P]:text-orange-t mi:relative mi:w-3.5 mi:h-3.5 mi:rounded-[4px] mi:[&.is-turn]:w-2 mi:[&.is-turn]:rounded-[50%]" />Late then Early: under 11h rest</li>
    </ul>
    <p class="ro__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap mi:m-0" role="status">{{ announce }}</p>
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
.ro__hint { display: none; }
@container (min-width: 640px) { .ro__hint { display: inline; } }
.ro__table th, .ro__table td { padding: 0; font-weight: inherit; }
thead .ro__who { padding: 12px 14px; font-weight: 600; }
.ro__meter span { display: block; height: 100%; background: var(--mi-green); }
.ro__meter span.is-over { background: var(--mi-orange); }
.ro__cell {
  font: inherit; font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums;
}
.ro__swatch.is-E { background: var(--mi-p-tint); }
.ro__swatch.is-L { background: var(--mi-s-tint); }
.ro__swatch.is-P {
  background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--mi-orange) 16%, transparent) 0 6px, transparent 6px 12px);
}
.ro__cov.is-ok { background: color-mix(in srgb, var(--mi-green) 12%, transparent); }
.ro__cov.is-short { color: var(--mi-red-t); background: color-mix(in srgb, var(--mi-red) 12%, transparent); }
.ro__cov.is-over { color: var(--mi-label2); background: var(--mi-fill3); }
.ro__legend li { display: inline-flex; }
.ro__swatch.is-turn { background: var(--mi-orange); height: 8px; }
</style>

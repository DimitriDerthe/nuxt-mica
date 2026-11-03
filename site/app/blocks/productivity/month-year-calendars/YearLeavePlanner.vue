<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="year-leave-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="year-leave-title" variant="title3" as="h2" weight="semibold">Leave planner 2027</MiText>
        <MiText variant="footnote" tone="label2">Paris office · French public holidays</MiText>
      </div>
      <MiSegmented v-model="view" label="Calendar view" :options="views" />
    </header>

    <div class="mi:grid mi:gap-2.5 mi:py-4 mi:px-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[640px]:grid-cols-[auto_minmax(0,_1fr)] mi:@[640px]:items-center mi:@[640px]:gap-6">
      <div class="mi:flex mi:items-baseline mi:gap-2.5 mi:flex-wrap">
        <p class="mi:m-0 mi:text-[34px] mi:leading-none mi:font-bold mi:tracking-[-.04em] mi:tabular-nums">{{ left }}<span class="mi:text-[17px] mi:font-semibold mi:text-label3 mi:tracking-[0]"> / {{ allowance }}</span></p>
        <MiText variant="footnote" tone="label2">days left · {{ used }} booked, weekends and holidays never count</MiText>
      </div>
      <div class="mi:h-2 mi:rounded-[4px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" aria-label="Leave used" aria-valuemin="0" :aria-valuemax="allowance" :aria-valuenow="used">
        <span class="mi:block mi:h-full mi:rounded-[inherit] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :class="used > allowance ? 'mi:bg-red' : 'mi:[background:linear-gradient(90deg,_var(--mi-p),_var(--mi-s))]'" :style="{ transform: `scaleX(${Math.min(used / allowance, 1)})` }" />
      </div>
    </div>

    <div class="mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:@[1000px]:grid-cols-[minmax(0,_1fr)_260px] mi:@[1000px]:items-start">
      <!-- Year: twelve compact months, every weekday is a toggle. -->
      <div v-if="view === 'year'" class="mi:grid mi:gap-2.5 mi:grid-cols-2 mi:@[560px]:grid-cols-3 mi:@[560px]:gap-3 mi:@[760px]:grid-cols-4">
        <article v-for="m in months" :key="m.index" class="mi:grid mi:gap-1 mi:pt-2.5 mi:px-2 mi:pb-2 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0">
          <button type="button" class="mi:[font:inherit] mi:text-[13px] mi:font-semibold mi:flex mi:items-center mi:justify-between mi:gap-1.5 mi:pt-0.5 mi:px-1 mi:pb-1 mi:[border:0] mi:[background:none] mi:text-label mi:text-start mi:cursor-pointer mi:rounded-[6px] mi:hover:text-p-text mi:focus-visible:[outline:2px_solid_var(--mi-p)]" @click="openMonth(m.index)">
            {{ m.name }}<span v-if="m.pto" class="mi:py-px mi:px-1.5 mi:rounded-[999px] mi:text-[11px] mi:[background:var(--mi-p-tint)] mi:text-p-text">{{ m.pto }}d</span>
          </button>
          <div class="mi:grid mi:grid-cols-7" aria-hidden="true"><span class="mi:text-[10px] mi:font-semibold mi:text-center mi:text-label3" v-for="w in weekdays" :key="w">{{ w[0] }}</span></div>
          <div class="mi:grid mi:grid-cols-7" role="group" :aria-label="m.name + ' 2027'">
            <span v-for="n in m.offset" :key="'o' + n" aria-hidden="true" />
            <button
              v-for="d in m.days" :key="d.day" type="button" class="mi:[font:inherit] mi:text-[11px] mi:tabular-nums mi:[&:hover:not(:disabled)]:bg-fill4 mi:relative mi:aspect-[1] mi:grid mi:place-items-center mi:p-0 mi:[border:0] mi:rounded-[50%] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:[&:active:not(:disabled)]:transform-[scale(.85)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:focus-visible:z-1 mi:disabled:cursor-default" :class="d.yc" :disabled="!d.bookable"
              :aria-pressed="d.bookable ? d.pto : undefined" :aria-label="d.aria" :title="d.note || undefined" @click="toggle(m.index, d.day)"
            >{{ d.day }}</button>
          </div>
        </article>
      </div>

      <!-- Month: the same data, roomy enough for labels. -->
      <div v-else class="mi:grid mi:gap-2.5 mi:p-3.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
        <div class="mi:flex mi:items-center mi:justify-between mi:gap-2">
          <MiIconButton label="Previous month" variant="gray" size="small" :disabled="month === 0" @click="month--"><MiIcon name="chevron-left" :size="16" /></MiIconButton>
          <MiText class="mi:m-0" variant="headline" as="h3" aria-live="polite">{{ cur.name }} 2027</MiText>
          <MiIconButton label="Next month" variant="gray" size="small" :disabled="month === 11" @click="month++"><MiIcon name="chevron-right" :size="16" /></MiIconButton>
        </div>
        <div class="mi:grid mi:grid-cols-7 mi:gap-1" aria-hidden="true"><span class="mi:text-[11px] mi:font-semibold mi:text-label2 mi:text-center mi:tracking-[.04em] mi:uppercase" v-for="w in weekdays" :key="w">{{ w }}</span></div>
        <div class="mi:grid mi:grid-cols-7 mi:gap-1" role="group" :aria-label="cur.name + ' 2027'">
          <span v-for="n in cur.offset" :key="'o' + n" class="mi:[&:hover:not(:disabled)]:bg-fill3 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:focus-visible:z-1 mi:disabled:cursor-default mi:flex mi:flex-col mi:[align-items:flex-start] mi:gap-1 mi:min-h-13 mi:p-1.5 mi:[border:0] mi:rounded-[10px] mi:[font:inherit] mi:text-label mi:text-start mi:cursor-pointer mi:overflow-hidden mi:min-w-0 mi:@[560px]:min-h-19 mi:@[560px]:p-2" aria-hidden="true" />
          <button
            v-for="d in cur.days" :key="d.day" type="button" class="mi:[&:hover:not(:disabled)]:bg-fill3 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:focus-visible:z-1 mi:disabled:cursor-default mi:flex mi:flex-col mi:[align-items:flex-start] mi:gap-1 mi:min-h-13 mi:p-1.5 mi:[border:0] mi:rounded-[10px] mi:[font:inherit] mi:text-start mi:cursor-pointer mi:overflow-hidden mi:min-w-0 mi:@[560px]:min-h-19 mi:@[560px]:p-2" :class="d.mc" :disabled="!d.bookable"
            :aria-pressed="d.bookable ? d.pto : undefined" :aria-label="d.aria" @click="toggle(cur.index, d.day)"
          >
            <span class="mi:text-[13px] mi:font-semibold mi:tabular-nums">{{ d.day }}</span>
            <span v-if="d.note" class="mi:hidden mi:max-w-full mi:text-[11px] mi:font-semibold mi:leading-[1.2] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:@[560px]:block" :class="d.nc">{{ d.note }}</span>
          </button>
        </div>
      </div>

      <aside class="mi:grid mi:gap-2.5 mi:p-4 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="year-leave-bridges">
        <MiText id="year-leave-bridges" class="mi:m-0" variant="subheadline" weight="semibold" as="h3">Bridge days</MiText>
        <MiText variant="footnote" tone="label2">One day off that joins a holiday to a weekend.</MiText>
        <ul class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="b in bridges" :key="b.key" class="mi:flex mi:items-center mi:justify-between mi:gap-2.5 mi:py-2.5 mi:px-3 mi:rounded-md mi:bg-green/8">
            <div class="mi:grid mi:gap-0.5 mi:min-w-0">
              <span class="mi:text-[14px] mi:font-semibold">{{ b.label }}</span>
              <MiText variant="caption" tone="label2">{{ b.span }} days off for 1 · {{ b.holiday }}</MiText>
            </div>
            <MiButton :variant="b.taken ? 'gray' : 'tinted'" size="small" :aria-label="(b.taken ? 'Release ' : 'Take ') + b.label" @click="toggle(b.m, b.d)">
              {{ b.taken ? 'Taken' : 'Take' }}
            </MiButton>
          </li>
        </ul>
        <ul class="mi:flex mi:flex-wrap mi:gap-y-1.5 mi:gap-x-3.5 mi:mt-1 mi:mx-0 mi:mb-0 mi:p-0 mi:[list-style:none] mi:text-[12px] mi:text-label2" aria-label="Legend">
          <li class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:rounded-[50%] mi:bg-p mi:w-2.5 mi:h-2.5" />Leave</li>
          <li class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:rounded-[50%] mi:bg-orange/40 mi:w-2.5 mi:h-2.5" />Public holiday</li>
          <li class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:rounded-[50%] mi:shadow-[inset_0_0_0_1.5px_var(--mi-s)] mi:w-2.5 mi:h-2.5" />Company event</li>
          <li class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:rounded-[50%] mi:shadow-[inset_0_0_0_1.5px_var(--mi-green)] mi:w-2.5 mi:h-2.5" />Bridge day</li>
        </ul>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const year = 2027
const allowance = 25
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const views = [{ value: 'year', label: 'Year' }, { value: 'month', label: 'Month' }]
const view = ref<string | number | null>('year')
const month = ref(4)

const key = (m: number, d: number) => `${m}-${d}`
// French public holidays 2027 (Easter is March 28).
const holidays: Record<string, string> = {
  [key(0, 1)]: 'New Year', [key(2, 29)]: 'Easter Monday', [key(4, 1)]: 'Labour Day', [key(4, 6)]: 'Ascension', [key(4, 8)]: 'Victory Day',
  [key(4, 17)]: 'Whit Monday', [key(6, 14)]: 'Bastille Day', [key(7, 15)]: 'Assumption', [key(10, 1)]: 'All Saints', [key(10, 11)]: 'Armistice', [key(11, 25)]: 'Christmas'
}
const events: Record<string, string> = {
  [key(1, 3)]: 'Kickoff', [key(5, 9)]: 'Offsite', [key(5, 10)]: 'Offsite', [key(5, 11)]: 'Offsite', [key(8, 21)]: 'Launch', [key(11, 16)]: 'Code freeze'
}

const dateOf = (m: number, d: number) => new Date(year, m, d)
const isWeekend = (m: number, d: number) => { const w = dateOf(m, d).getDay(); return w === 0 || w === 6 }

// Already booked: winter week and the August break.
const pto = ref(new Set<string>([
  ...[15, 16, 17, 18, 19].map(d => key(1, d)),
  ...[2, 3, 4, 5, 6, 9, 10, 11, 12, 13].map(d => key(7, d))
]))

/** A Monday before a Tuesday holiday or a Friday after a Thursday holiday turns one day into a long weekend. */
const bridgeKeys = computed(() => {
  const out: { m: number, d: number, holiday: string }[] = []
  for (const [k, name] of Object.entries(holidays)) {
    const [m, d] = k.split('-').map(Number) as [number, number]
    const w = dateOf(m, d).getDay()
    if (w === 2) { const b = dateOf(m, d - 1); out.push({ m: b.getMonth(), d: b.getDate(), holiday: name }) }
    if (w === 4) { const b = dateOf(m, d + 1); out.push({ m: b.getMonth(), d: b.getDate(), holiday: name }) }
  }
  return out
})
const bridgeSet = computed(() => new Set(bridgeKeys.value.map(b => key(b.m, b.d))))
const bridges = computed(() => bridgeKeys.value.map(b => ({
  ...b, key: key(b.m, b.d), span: 4, taken: pto.value.has(key(b.m, b.d)),
  label: dateOf(b.m, b.d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })
})))

function buildMonth(index: number) {
  const count = new Date(year, index + 1, 0).getDate()
  const offset = (dateOf(index, 1).getDay() + 6) % 7
  let ptoCount = 0
  const days = Array.from({ length: count }, (_, i) => {
    const day = i + 1
    const k = key(index, day)
    const weekend = isWeekend(index, day)
    const hol = holidays[k]
    const ev = events[k]
    const off = pto.value.has(k)
    if (off) ptoCount++
    const bridge = bridgeSet.value.has(k) && !off
    const note = hol ?? (off ? 'Leave' : ev ?? (bridge ? 'Bridge day' : ''))
    const long = dateOf(index, day).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    return {
      day, pto: off, note, bookable: !weekend && !hol,
      aria: `${long}${note ? ', ' + note : ''}`,
      yc: [
        off ? 'mi:text-p-on' : bridge ? 'mi:text-green-t' : hol ? 'mi:text-orange-t' : weekend ? 'mi:text-label3' : 'mi:text-label',
        off || bridge ? 'mi:font-semibold' : hol ? 'mi:font-bold' : '',
        bridge ? 'mi:shadow-[inset_0_0_0_1.5px_var(--mi-green)] mi:[border-style:dashed]' : ev && !off ? 'mi:shadow-[inset_0_0_0_1.5px_var(--mi-s)]' : '',
        off ? 'mi:[background:var(--mi-p)]' : hol ? 'mi:[background:color-mix(in_srgb,_var(--mi-orange)_22%,_transparent)]' : 'mi:[background:none]'
      ].join(' '),
      mc: [
        off ? 'mi:bg-p mi:text-p-on' : hol ? 'mi:bg-orange/16 mi:text-orange-t' : weekend ? 'mi:bg-transparent mi:text-label3' : 'mi:bg-fill4 mi:text-label',
        bridge ? 'mi:shadow-[inset_0_0_0_1.5px_var(--mi-green)]' : ev && !off ? 'mi:shadow-[inset_3px_0_0_var(--mi-s)]' : ''
      ].join(' '),
      nc: bridge ? 'mi:text-green-t' : ev && !off ? 'mi:text-s-text' : ''
    }
  })
  return { index, name: monthNames[index]!, offset, days, pto: ptoCount }
}

const months = computed(() => monthNames.map((_, i) => buildMonth(i)))
const cur = computed(() => months.value[month.value]!)
const used = computed(() => pto.value.size)
const left = computed(() => allowance - used.value)

function toggle(m: number, d: number) {
  if (isWeekend(m, d) || holidays[key(m, d)]) return
  const next = new Set(pto.value)
  const k = key(m, d)
  if (next.has(k)) next.delete(k)
  else next.add(k)
  pto.value = next
}

function openMonth(i: number) { month.value = i; view.value = 'month' }
</script>

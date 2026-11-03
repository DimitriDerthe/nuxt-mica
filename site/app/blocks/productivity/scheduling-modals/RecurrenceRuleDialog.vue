<template>
  <section class="mi:relative mi:@container mi:grid mi:content-start mi:min-h-full mi:font-mi mi:text-label mi:rounded-xl mi:overflow-hidden mi:isolate" aria-labelledby="rrd-heading">
    <MiText id="rrd-heading" variant="title3" as="h2" weight="semibold" class="mi:absolute mi:w-px mi:h-px mi:[clip-path:inset(50%)] mi:overflow-hidden! mi:whitespace-nowrap!">Edit a recurring event</MiText>

    <!-- Faux page and scrim behind the dialog; decorative only. -->
    <div class="mi:absolute mi:inset-0 mi:-z-1 mi:grid mi:content-start mi:gap-3.5 mi:p-5 mi:bg-page mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:bg-scrim" aria-hidden="true">
      <div class="mi:rounded-md mi:bg-card mi:shadow-1 mi:h-11" />
      <div class="mi:grid mi:grid-cols-7 mi:gap-2"><div v-for="n in 7" :key="n" class="mi:rounded-md mi:bg-card mi:shadow-1 mi:h-105" /></div>
    </div>

    <div class="mi:grid mi:place-items-center mi:py-6 mi:px-3 mi:@[600px]:py-10 mi:@[600px]:px-6">
      <MiDialog :model-value="true" inline variant="dialog" icon="calendar" title="Repeat: Design sync" :close-on-action="false">
        <div class="mi:grid mi:gap-4.5 mi:text-start">
          <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-2.5 mi:gap-x-3">
            <MiText variant="subheadline" weight="medium">Every</MiText>
            <MiStepper v-model="interval" :min="1" :max="6" label="Repeat interval" show-value />
            <MiSegmented v-model="unit" label="Repeat unit" :options="units" />
          </div>

          <div v-if="unit === 'week'" class="mi:grid mi:gap-2">
            <MiText variant="footnote" weight="semibold" tone="label2">On</MiText>
            <MiToggleGroup v-model="days" multiple :options="weekdayOptions" label="Weekdays" variant="outline" size="sm" :spacing="1" />
          </div>

          <div class="mi:grid mi:gap-2">
            <MiText variant="footnote" weight="semibold" tone="label2">Ends</MiText>
            <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-2.5 mi:gap-x-4">
              <MiRadioGroup v-model="ends" :options="endOptions" label="Ends" orientation="horizontal" />
              <MiStepper v-if="ends === 'count'" v-model="count" :min="2" :max="52" label="Occurrences" unit="×" show-value />
            </div>
          </div>

          <!-- The rule read back in plain words, then the next dates it produces. -->
          <div class="mi:grid mi:gap-2.5 mi:p-3.5 mi:rounded-lg mi:bg-fill4" aria-live="polite">
            <MiText variant="subheadline" weight="semibold">{{ sentence }}</MiText>
            <ol class="mi:grid mi:grid-cols-[repeat(auto-fill,_minmax(52px,_1fr))] mi:gap-1.5 mi:m-0 mi:p-0 mi:[list-style:none]">
              <li class="mi:grid mi:justify-items-center mi:py-1.5 mi:px-0 mi:rounded-md mi:bg-card mi:text-[11px]" v-for="d in upcoming" :key="d.getTime()" :class="d.getTime() === START.getTime() ? 'mi:bg-p mi:text-p-on' : 'mi:text-label2'">
                <span>{{ dayFmt.format(d) }}</span><strong class="mi:text-[18px] mi:leading-[1.2] mi:tabular-nums" :class="d.getTime() === START.getTime() ? 'mi:text-p-on' : 'mi:text-label'">{{ d.getDate() }}</strong><span>{{ monFmt.format(d) }}</span>
              </li>
            </ol>
            <MiText v-if="lastDate" variant="footnote" tone="label2">Last one on {{ longFmt.format(lastDate) }}.</MiText>
          </div>
        </div>

        <template #actions>
          <div class="mi:grid mi:gap-3.5 mi:w-full mi:text-start">
            <div class="mi:grid mi:gap-2">
              <MiText variant="footnote" weight="semibold" tone="label2">Apply changes to</MiText>
              <MiSegmented v-model="scope" label="Apply changes to" :options="scopes" />
            </div>
            <MiButton block :disabled="!valid" @click="savedRule = ruleKey">{{ saved ? 'Saved' : 'Save rule' }}</MiButton>
          </div>
        </template>
      </MiDialog>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Unit = 'day' | 'week' | 'month'

const START = new Date(2026, 10, 3, 10, 0) // Tuesday, November 3, 10:00
const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const weekdayOptions = names.map((n, i) => ({ value: i, label: n.slice(0, 2), ariaLabel: n }))
const units = [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]
const endOptions = [{ value: 'never', label: 'Never' }, { value: 'count', label: 'After' }]
const scopes = [{ value: 'one', label: 'This event' }, { value: 'next', label: 'Following' }, { value: 'all', label: 'All' }]

const interval = ref(2)
const unit = ref<string | number | null>('week')
const days = ref<string | number | (string | number)[] | null>([1, 3])
const ends = ref<string | number | boolean | null>('count')
const count = ref(8)
const scope = ref<string | number | null>('next')
const savedRule = ref('')

const dayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
const monFmt = new Intl.DateTimeFormat('en-US', { month: 'short' })
const longFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

const picked = computed<number[]>(() => (Array.isArray(days.value) ? days.value.map(Number).sort((a, b) => a - b) : []))
const valid = computed(() => unit.value !== 'week' || picked.value.length > 0)
const weekday = (d: Date): number => (d.getDay() + 6) % 7 // Monday = 0

// Walks forward day by day (weeks), or jumps by unit, collecting up to `limit` dates.
function occurrences(limit: number): Date[] {
  const out: Date[] = []
  const u: Unit = unit.value === 'day' || unit.value === 'month' ? unit.value : 'week'
  if (u === 'week') {
    const weekStart = new Date(START.getFullYear(), START.getMonth(), START.getDate() - weekday(START))
    for (let i = 0; out.length < limit && i < 730; i++) {
      const d = new Date(START.getFullYear(), START.getMonth(), START.getDate() + i, 10)
      const weeks = Math.floor((d.getTime() - weekStart.getTime()) / (7 * 864e5))
      if (weeks % interval.value === 0 && picked.value.includes(weekday(d))) out.push(d)
    }
  }
  else {
    for (let i = 0; out.length < limit; i++) {
      const step = i * interval.value
      out.push(u === 'day' ? new Date(2026, 10, 3 + step, 10) : new Date(2026, 10 + step, 3, 10))
    }
  }
  return out
}

const total = computed(() => (ends.value === 'count' ? count.value : 0))
const upcoming = computed(() => (valid.value ? occurrences(Math.min(total.value || 6, 6)) : []))
const lastDate = computed(() => (valid.value && total.value ? occurrences(total.value)[total.value - 1] ?? null : null))

const sentence = computed(() => {
  if (!valid.value) return 'Pick at least one weekday.'
  const n = interval.value
  const every = n === 1 ? `Every ${unit.value}` : `Every ${n} ${unit.value}s`
  const on = unit.value === 'week' ? ` on ${picked.value.map(i => names[i]).join(', ').replace(/, ([^,]*)$/, ' and $1')}` : unit.value === 'month' ? ' on the 3rd' : ''
  return `${every}${on} at 10:00, ${total.value ? `${total.value} times` : 'with no end date'}.`
})

// Any edit changes the key, so the button reads "Save rule" again.
const ruleKey = computed(() => `${sentence.value}|${scope.value}`)
const saved = computed(() => savedRule.value === ruleKey.value)
</script>

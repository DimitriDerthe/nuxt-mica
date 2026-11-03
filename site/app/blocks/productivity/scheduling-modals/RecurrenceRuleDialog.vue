<template>
  <section class="rrd" aria-labelledby="rrd-heading">
    <MiText id="rrd-heading" variant="title3" as="h2" weight="semibold" class="rrd__sr">Edit a recurring event</MiText>

    <!-- Faux page and scrim behind the dialog; decorative only. -->
    <div class="rrd__backdrop" aria-hidden="true">
      <div class="rrd__ghost rrd__ghost--bar" />
      <div class="rrd__ghost-row"><div v-for="n in 7" :key="n" class="rrd__ghost rrd__ghost--day" /></div>
    </div>

    <div class="rrd__center">
      <MiDialog :model-value="true" inline variant="dialog" icon="calendar" title="Repeat: Design sync" :close-on-action="false">
        <div class="rrd__body">
          <div class="rrd__row">
            <MiText variant="subheadline" weight="medium">Every</MiText>
            <MiStepper v-model="interval" :min="1" :max="6" label="Repeat interval" show-value />
            <MiSegmented v-model="unit" label="Repeat unit" :options="units" />
          </div>

          <div v-if="unit === 'week'" class="rrd__field">
            <MiText variant="footnote" weight="semibold" tone="label2">On</MiText>
            <MiToggleGroup v-model="days" multiple :options="weekdayOptions" label="Weekdays" variant="outline" size="sm" :spacing="1" />
          </div>

          <div class="rrd__field">
            <MiText variant="footnote" weight="semibold" tone="label2">Ends</MiText>
            <div class="rrd__ends">
              <MiRadioGroup v-model="ends" :options="endOptions" label="Ends" orientation="horizontal" />
              <MiStepper v-if="ends === 'count'" v-model="count" :min="2" :max="52" label="Occurrences" unit="×" show-value />
            </div>
          </div>

          <!-- The rule read back in plain words, then the next dates it produces. -->
          <div class="rrd__preview" aria-live="polite">
            <MiText variant="subheadline" weight="semibold">{{ sentence }}</MiText>
            <ol class="rrd__dates">
              <li v-for="d in upcoming" :key="d.getTime()" :class="{ 'is-first': d.getTime() === START.getTime() }">
                <span>{{ dayFmt.format(d) }}</span><strong>{{ d.getDate() }}</strong><span>{{ monFmt.format(d) }}</span>
              </li>
            </ol>
            <MiText v-if="lastDate" variant="footnote" tone="label2">Last one on {{ longFmt.format(lastDate) }}.</MiText>
          </div>
        </div>

        <template #actions>
          <div class="rrd__actions">
            <div class="rrd__field">
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

<style scoped>
.rrd { position: relative; container-type: inline-size; display: grid; align-content: start; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate; }
.rrd__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.rrd__backdrop { position: absolute; inset: 0; z-index: -1; display: grid; align-content: start; gap: 14px; padding: 20px; background: var(--mi-page); }
.rrd__backdrop::after { content: ""; position: absolute; inset: 0; background: var(--mi-scrim); }
.rrd__ghost { border-radius: var(--mi-radius-m); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.rrd__ghost--bar { height: 44px; }
.rrd__ghost-row { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; }
.rrd__ghost--day { height: 420px; }

.rrd__center { display: grid; place-items: center; padding: 24px 12px; }
.rrd__body { display: grid; gap: 18px; text-align: start; }
.rrd__row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 12px; }
.rrd__field { display: grid; gap: 8px; }
.rrd__ends { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; }

.rrd__preview { display: grid; gap: 10px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.rrd__dates { display: grid; grid-template-columns: repeat(auto-fill, minmax(52px, 1fr)); gap: 6px; margin: 0; padding: 0; list-style: none; }
.rrd__dates li { display: grid; justify-items: center; padding: 6px 0; border-radius: var(--mi-radius-m); background: var(--mi-card); font-size: 11px; color: var(--mi-label2); }
.rrd__dates strong { font-size: 18px; line-height: 1.2; color: var(--mi-label); font-variant-numeric: tabular-nums; }
.rrd__dates li.is-first { background: var(--mi-p); color: var(--mi-p-on); }
.rrd__dates li.is-first strong { color: var(--mi-p-on); }

.rrd__actions { display: grid; gap: 14px; width: 100%; text-align: start; }

@container (min-width: 600px) { .rrd__center { padding: 40px 24px; } }
</style>

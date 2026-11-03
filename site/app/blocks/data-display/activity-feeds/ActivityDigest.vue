<template>
  <section class="act mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="act-title">
    <header class="act__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-3 mi:gap-x-5">
      <div>
        <MiText id="act-title" variant="title3" as="h2" weight="semibold">Activity</MiText>
        <MiText variant="footnote" tone="label2" aria-live="polite">{{ day === null ? 'Last 7 days' : week[day]?.long }} · {{ shownCount }} events</MiText>
      </div>
      <!-- Week density: one bar per day; picking a bar narrows the feed to that day. -->
      <div class="act__week mi:flex mi:flex-row-reverse mi:gap-1" role="group" aria-label="Filter by day">
        <button
          v-for="(d, i) in week" :key="d.short" type="button" class="act__day mi:grid mi:justify-items-center mi:gap-1 mi:w-8.5 mi:py-1 mi:px-0 mi:[border:0] mi:rounded-[8px] mi:[background:none] mi:[font:inherit] mi:text-label2 mi:cursor-pointer mi:hover:[background:var(--mi-fill2)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:[&.is-on]:text-p-text" :class="{ 'is-on': day === i }" :aria-pressed="day === i"
          :aria-label="`${d.long}, ${d.count} events`" @click="day = day === i ? null : i"
        >
          <span class="act__day-bar mi:flex mi:[align-items:flex-end] mi:w-3.5 mi:h-10"><i class="mi:[.act__day-bar_&]:w-full mi:[.act__day-bar_&]:h-full mi:[.act__day-bar_&]:rounded-[4px] mi:[.act__day-bar_&]:[background:color-mix(in_srgb,_var(--mi-p)_35%,_var(--mi-fill3))] mi:[.act__day-bar_&]:origin-bottom mi:[.act__day-bar_&]:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:[.act__day.is-on_.act__day-bar_&]:[background:var(--mi-p)]" :style="{ transform: `scaleY(${Math.max(0.08, d.count / maxDay)})` }" /></span>
          <span class="act__day-label mi:text-[10px] mi:font-semibold">{{ d.short }}</span>
        </button>
      </div>
    </header>

    <div class="act__chips mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Event type">
      <MiChip v-for="t in types" :key="t.value" selectable size="small" tone="neutral" :label="t.label" :model-value="type === t.value" @update:model-value="type = t.value" />
    </div>

    <div class="act__feed mi:grid mi:gap-4.5">
      <section v-for="g in groups" :key="g.day" class="act__group mi:grid mi:gap-1.5" :aria-label="week[g.day]?.long">
        <MiText as="h3" variant="caption" weight="semibold" tone="label2" class="act__group-title">{{ week[g.day]?.long }}</MiText>
        <ol class="act__list mi:grid mi:m-0 mi:py-1.5 mi:px-0 mi:[list-style:none] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
          <li v-for="e in g.items" :key="e.id" class="act__row mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:gap-3 mi:py-2.5 mi:px-3.5 mi:[.act__row+&]:border-t mi:[.act__row+&]:border-t-sep">
            <span class="act__icon mi:grid mi:place-items-center mi:w-7.5 mi:h-7.5 mi:rounded-[9px] mi:text-label2 mi:[background:var(--mi-fill2)]" :class="'act__icon--' + (e.tone ?? e.type)" aria-hidden="true"><MiIcon :svg="glyphs[e.type]" :size="16" /></span>
            <div class="act__body mi:grid mi:gap-1.5 mi:min-w-0 mi:pt-[5px]">
              <p class="act__line mi:m-0 mi:text-[14px] mi:leading-[1.4] mi:text-label2">
                <strong class="mi:[.act__line_&]:font-semibold">{{ e.who }}</strong> {{ e.verb }} <span class="act__target mi:font-medium mi:text-label mi:wrap-anywhere">{{ e.target }}</span>
              </p>
              <blockquote v-if="e.quote" class="act__quote mi:m-0 mi:py-2 mi:px-3 mi:rounded-[10px] mi:text-[13px] mi:leading-[1.45] mi:text-label mi:[background:var(--mi-fill)] mi:[border-inline-start:2px_solid_var(--mi-p)]">{{ e.quote }}</blockquote>
              <template v-if="e.commits">
                <button type="button" class="act__more mi:inline-flex mi:items-center mi:gap-1 mi:justify-self-start mi:py-0.5 mi:px-0 mi:[border:0] mi:[background:none] mi:text-p-text mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px]" :aria-expanded="open.has(e.id)" @click="toggle(e.id)">
                  <MiIcon name="chevron-right" :size="12" class="act__chev mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" />
                  {{ open.has(e.id) ? 'Hide' : 'Show' }} {{ e.commits.length }} commits
                </button>
                <ul v-show="open.has(e.id)" class="act__commits mi:grid mi:gap-1 mi:m-0 mi:p-0 mi:[list-style:none]">
                  <li class="mi:[.act__commits_&]:gap-2.5" v-for="c in e.commits" :key="c[0]"><code class="mi:[.act__commits_&]:flex-[none] mi:[.act__commits_&]:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace]">{{ c[0] }}</code><span class="mi:[.act__commits_&]:overflow-hidden mi:[.act__commits_&]:text-ellipsis mi:[.act__commits_&]:whitespace-nowrap">{{ c[1] }}</span></li>
                </ul>
              </template>
            </div>
            <MiText as="time" variant="caption2" tone="label3" tabular class="act__time mi:pt-[7px]">{{ e.time }}</MiText>
          </li>
        </ol>
      </section>
      <MiEmptyState v-if="!groups.length" title="Quiet day" description="Nothing of this type happened then." icon="inbox" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Type = 'code' | 'review' | 'deploy' | 'comment' | 'billing'
interface Event { id: string, day: number, time: string, type: Type, who: string, verb: string, target: string, quote?: string, commits?: [string, string][], tone?: 'danger' }

const glyphs: Record<Type, string> = {
  code: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3v5.8M12 15.2V21"/>',
  review: '<path d="M5 12.5l4.2 4.2L19 7"/>',
  deploy: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  comment: '<path d="M5 6.5A2.5 2.5 0 017.5 4h9A2.5 2.5 0 0119 6.5v7a2.5 2.5 0 01-2.5 2.5H11l-4.5 4v-4h0A1.5 1.5 0 015 14.5z"/>',
  billing: '<rect x="3.5" y="6" width="17" height="12" rx="2.5"/><path d="M3.5 10h17M7 14.5h3"/>'
}

// Day 0 is today (Mon, Nov 2). Sample events; bursts carry their commits.
const events: Event[] = [
  { id: 'e1', day: 0, time: '11:30', type: 'review', who: 'Inès Moreau', verb: 'approved', target: '#482 Split the shipping step' },
  { id: 'e2', day: 0, time: '11:03', type: 'comment', who: 'Saoirse Byrne', verb: 'commented on', target: 'Checkout, empty cart', quote: 'Keep the illustration, drop the second button. One way out is enough.' },
  { id: 'e3', day: 0, time: '10:15', type: 'deploy', who: 'Kofi Mensah', verb: 'deployed', target: 'api 2.14.0 to production' },
  { id: 'e4', day: 0, time: '09:42', type: 'code', who: 'Yuki Tanaka', verb: 'pushed to', target: 'android/parity', commits: [['a41f9c2', 'Port saved carts to Compose'], ['7be0d13', 'Fix tablet padding on order recap'], ['c09e44a', 'Add haptic on add-to-cart'], ['55d1b7e', 'Share coupon field with iOS copy'], ['e3a8f01', 'Bump Kotlin to 2.1.20'], ['0f6c2ad', 'Snapshot tests for recap']] },
  { id: 'e5', day: 1, time: '18:20', type: 'billing', who: 'Halden Outdoor', verb: 'paid', target: 'INV-1043, $4,800.00' },
  { id: 'e6', day: 2, time: '14:02', type: 'code', who: 'Tomás Ruiz', verb: 'pushed to', target: 'web/checkout', commits: [['9d2e0b4', 'Inline address validation'], ['31c7fa8', 'Remember last carrier'], ['b8e6a19', 'Copy: shorter delivery hints']] },
  { id: 'e7', day: 3, time: '16:48', type: 'deploy', tone: 'danger', who: 'Kofi Mensah', verb: 'rolled back', target: 'api 2.13.2 after a spike in 502s' },
  { id: 'e8', day: 3, time: '16:12', type: 'code', who: 'Arjun Mehta', verb: 'pushed to', target: 'api/billing', commits: [['4ab1c90', 'Retry webhook with jitter'], ['d77e2f5', 'Idempotency key on refunds'], ['18f0c3b', 'Log Stripe request ids'], ['ee21a6d', 'Drop legacy tax table']] },
  { id: 'e9', day: 3, time: '15:01', type: 'comment', who: 'Noor Haddad', verb: 'commented on', target: 'Release notes 2.14', quote: 'Lead with the faster checkout, the API changes can go below the fold.' },
  { id: 'e10', day: 3, time: '10:20', type: 'review', who: 'Inès Moreau', verb: 'requested changes on', target: '#477 Guest checkout' },
  { id: 'e11', day: 4, time: '17:40', type: 'deploy', who: 'Lena Vogel', verb: 'deployed', target: 'dbt models to the warehouse' },
  { id: 'e12', day: 4, time: '11:05', type: 'comment', who: 'Marta Kowalska', verb: 'commented on', target: 'Test plan, Android 3.0', quote: 'Adding two old Samsung devices to the matrix.' },
  { id: 'e13', day: 5, time: '09:12', type: 'code', who: 'Yuki Tanaka', verb: 'pushed to', target: 'android/parity', commits: [['f1e2d3c', 'Order history paging'], ['2c3d4e5', 'Empty state for wishlist']] },
  { id: 'e14', day: 6, time: '13:30', type: 'billing', who: 'Pocketmeal', verb: 'paid', target: 'INV-1037, $2,150.00' }
]

const names = [['Mon', 'Today'], ['Sun', 'Yesterday'], ['Sat', 'Saturday, Oct 31'], ['Fri', 'Friday, Oct 30'], ['Thu', 'Thursday, Oct 29'], ['Wed', 'Wednesday, Oct 28'], ['Tue', 'Tuesday, Oct 27']] as const
const weight = (e: Event) => e.commits?.length ?? 1

const types = [{ value: 'all', label: 'All' }, { value: 'code', label: 'Code' }, { value: 'review', label: 'Reviews' }, { value: 'deploy', label: 'Deploys' }, { value: 'comment', label: 'Comments' }, { value: 'billing', label: 'Billing' }]
const type = ref('all')
const day = ref<number | null>(null)

const byType = computed(() => events.filter(e => type.value === 'all' || e.type === type.value))
// Bars read oldest to newest, left to right; indexes still point at `names`.
const week = computed(() => names.map(([short, long], i) => ({ short, long, count: byType.value.filter(e => e.day === i).reduce((n, e) => n + weight(e), 0) })))
const maxDay = computed(() => Math.max(1, ...week.value.map(d => d.count)))

const groups = computed(() => {
  const list = byType.value.filter(e => day.value === null || e.day === day.value)
  return [...new Set(list.map(e => e.day))].map(d => ({ day: d, items: list.filter(e => e.day === d) }))
})
const shownCount = computed(() => groups.value.reduce((n, g) => n + g.items.reduce((m, e) => m + weight(e), 0), 0))

const open = ref(new Set<string>(['e4']))
const toggle = (id: string) => {
  const next = new Set(open.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  open.value = next
}
</script>

<style scoped>
.act__day-bar i { display: block; }
.act__group-title { text-transform: uppercase; letter-spacing: .06em; }
.act__icon--deploy { color: var(--mi-p-text); background: var(--mi-p-tint); }
.act__icon--review { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 14%, transparent); }
.act__icon--billing { color: var(--mi-s-text); background: var(--mi-s-tint); }
.act__icon--danger { color: var(--mi-red-t); background: color-mix(in srgb, var(--mi-red) 14%, transparent); }
.act__line strong { color: var(--mi-label); }
.act__more { font: inherit; font-size: 12px; font-weight: 600; }
.act__more[aria-expanded="true"] .act__chev { transform: rotate(90deg); }
.act__commits li { display: flex; min-width: 0; font-size: 12.5px; color: var(--mi-label2); }
.act__commits code { font-size: 11.5px; color: var(--mi-p-text); }
.act__commits span { min-width: 0; }
</style>

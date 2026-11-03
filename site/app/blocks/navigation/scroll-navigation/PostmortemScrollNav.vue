<template>
  <div class="sc mi:@container mi:grid mi:content-start mi:gap-0 mi:overflow-hidden mi:rounded-xl mi:font-mi mi:text-label mi:[background:var(--mi-card)] mi:shadow-1 mi:[timeline-scope:--sc-read]">
    <header class="sc__head mi:relative mi:flex mi:items-center mi:justify-between mi:gap-3 mi:pt-4 mi:px-4 mi:pb-3.5 mi:border-b mi:border-b-sep mi:@[720px]:pt-4.5 mi:@[720px]:px-6 mi:@[720px]:pb-4">
      <div class="sc__title mi:grid mi:gap-0.5 mi:min-w-0">
        <MiText variant="caption" tone="label2" weight="medium">Postmortem · Sev 2 · resolved</MiText>
        <MiText id="sc-title" variant="title3" as="h2" weight="semibold">Delayed SEPA payouts on October 14</MiText>
      </div>
      <MiButton v-show="activeIndex > 0" variant="gray" size="small" @click="go(firstId)">
        <template #leading><MiIcon name="arrow-up" :size="14" /></template>
        Top
      </MiButton>
      <!-- Reading progress: a CSS scroll-driven animation on transform, no scroll listener. -->
      <div class="sc__progress mi:absolute mi:left-0 mi:right-0 mi:-bottom-px mi:h-0.5" aria-hidden="true"><span class="mi:[.sc__progress_&]:block mi:[.sc__progress_&]:h-full mi:[.sc__progress_&]:[background:var(--mi-p)] mi:[.sc__progress_&]:transform-[scaleX(0)] mi:[.sc__progress_&]:origin-left" /></div>
    </header>

    <div class="sc__layout mi:grid mi:min-w-0 mi:@[720px]:grid-cols-[220px_minmax(0,_1fr)]">
      <nav ref="navEl" class="sc__nav mi:relative mi:flex mi:gap-1.5 mi:py-2.5 mi:px-4 mi:overflow-x-auto mi:[scrollbar-width:none] mi:border-b mi:border-b-sep mi:[background:var(--mi-fill4)] mi:@[720px]:grid mi:@[720px]:content-start mi:@[720px]:gap-0 mi:@[720px]:pt-4 mi:@[720px]:pr-3 mi:@[720px]:pb-4 mi:@[720px]:pl-4 mi:@[720px]:overflow-visible mi:@[720px]:[border-bottom:0] mi:@[720px]:border-r mi:@[720px]:border-r-sep mi:@[720px]:[background:none]" aria-label="Sections of this postmortem" :style="{ '--i': activeIndex }">
        <span class="sc__marker mi:hidden mi:@[720px]:absolute mi:@[720px]:top-4 mi:@[720px]:left-4 mi:@[720px]:block mi:@[720px]:w-0.5 mi:@[720px]:h-9 mi:@[720px]:rounded-[1px] mi:@[720px]:[background:var(--mi-p)] mi:@[720px]:transform-[translateY(calc(var(--i)_*_36px))] mi:@[720px]:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" aria-hidden="true" />
        <a
          v-for="s in sections" :key="s.id" :href="'#' + s.id" class="sc__link mi:inline-flex mi:flex-[none] mi:items-center mi:gap-2 mi:h-8 mi:py-0 mi:px-3 mi:rounded-[999px] mi:text-[13px] mi:font-medium mi:text-label2 mi:[text-decoration:none] mi:whitespace-nowrap mi:[&[aria-current='location']]:text-p-on mi:[&[aria-current='location']]:[background:var(--mi-p)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:@[720px]:h-9 mi:@[720px]:pt-0 mi:@[720px]:pr-3 mi:@[720px]:pb-0 mi:@[720px]:pl-4 mi:@[720px]:rounded-[0_8px_8px_0] mi:@[720px]:shadow-[inset_2px_0_0_var(--mi-sep)] mi:@[720px]:[&[aria-current='location']]:text-label mi:@[720px]:[&[aria-current='location']]:[background:var(--mi-fill4)]" :aria-current="active === s.id ? 'location' : undefined"
          :data-id="s.id" @click.prevent="go(s.id)"
        >
          <span class="sc__num mi:[font:600_11px_ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:opacity-60">{{ String(sections.indexOf(s) + 1).padStart(2, '0') }}</span>{{ s.label }}
        </a>
      </nav>

      <div ref="pane" class="sc__pane mi:relative mi:h-105 mi:overflow-y-auto mi:pt-1 mi:px-4.5 mi:pb-6 mi:overscroll-contain mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:@[720px]:h-115 mi:@[720px]:pt-1 mi:@[720px]:px-8 mi:@[720px]:pb-7" tabindex="0" aria-labelledby="sc-title">
        <section v-for="s in sections" :id="s.id" :key="s.id" class="sc__section mi:pt-4 mi:px-0 mi:pb-2 mi:max-w-[64ch] mi:text-[15px] mi:leading-[1.65] mi:text-label2 mi:[.sc__section+&]:border-t mi:[.sc__section+&]:border-t-sep">
          <h3 class="sc__h mi:mt-0 mi:mx-0 mi:mb-2 mi:text-[17px] mi:font-650 mi:tracking-[-.01em] mi:text-label">{{ s.label }}</h3>
          <p v-for="(p, i) in s.body" :key="i">{{ p }}</p>
          <ol v-if="s.timeline" class="sc__timeline mi:grid mi:gap-2 mi:mt-1 mi:mx-0 mi:mb-3 mi:p-0 mi:[list-style:none]">
            <li class="mi:[.sc__timeline_&]:grid mi:[.sc__timeline_&]:grid-cols-[52px_minmax(0,_1fr)] mi:[.sc__timeline_&]:gap-2" v-for="t in s.timeline" :key="t.at"><time class="mi:[.sc__timeline_&]:[font:600_13px/1.65_ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:[.sc__timeline_&]:text-label">{{ t.at }}</time>{{ t.what }}</li>
          </ol>
          <ul v-if="s.actions" class="sc__actions mi:grid mi:gap-2.5 mi:mt-1 mi:mx-0 mi:mb-3 mi:p-0 mi:[list-style:none]">
            <li v-for="a in s.actions" :key="a.what">
              <MiCheckbox v-model="a.done" :label="a.what" :description="a.owner + ' · due ' + a.due" />
            </li>
          </ul>
        </section>
        <div ref="end" class="sc__end mi:h-px" aria-hidden="true" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const sections = reactive([
  { id: 'pm-summary', label: 'Summary', body: ['Between 09:05 and 13:40 CET, 2,184 SEPA payouts were confirmed between 25 minutes and 4 hours late. No funds were lost and every payout reached its destination the same day.'] },
  { id: 'pm-impact', label: 'Impact', body: ['612 merchants saw payouts stuck in “Processing”. Support received 143 tickets, 38 of them from marketplaces that pay sellers on a fixed schedule.', 'Card acquiring, refunds and Faster Payments in the UK were not affected.'] },
  {
    id: 'pm-timeline', label: 'Timeline', body: ['All times CET.'],
    timeline: [
      { at: '09:05', what: 'Partner bank rotates its signing certificate a day early.' },
      { at: '09:31', what: 'Queue depth alert fires; on-call acknowledges in 2 minutes.' },
      { at: '10:12', what: 'Signature failures traced to the stale certificate.' },
      { at: '11:58', what: 'New certificate deployed after the bank confirms it.' },
      { at: '13:40', what: 'Backlog drained, incident resolved.' }
    ]
  },
  { id: 'pm-cause', label: 'Root cause', body: ['Our payout signer pinned the bank certificate by fingerprint and only reloaded it at deploy time. The early rotation made every request fail validation, and retries kept the queue full instead of failing fast.', 'The rotation notice went to a shared inbox nobody had watched since the team reorganised in August.'] },
  { id: 'pm-well', label: 'What went well', body: ['The alert fired within 26 minutes and status page updates went out every 30 minutes. Merchants with webhooks saw accurate states the whole time.'] },
  {
    id: 'pm-actions', label: 'Action items', body: ['Owners agreed these in the review on October 16.'],
    actions: [
      { what: 'Reload bank certificates without a deploy', owner: 'Luca Bianchi', due: 'Oct 25', done: true },
      { what: 'Route bank notices to the payments on-call alias', owner: 'Emma Novak', due: 'Oct 18', done: true },
      { what: 'Fail fast after 3 signature errors in a row', owner: 'Luca Bianchi', due: 'Nov 8', done: false },
      { what: 'Add a certificate expiry check to the daily report', owner: 'Ravi Shah', due: 'Nov 15', done: false }
    ]
  }
] as { id: string, label: string, body: string[], timeline?: { at: string, what: string }[], actions?: { what: string, owner: string, due: string, done: boolean }[] }[])

const pane = ref<HTMLElement>()
const end = ref<HTMLElement>()
const navEl = ref<HTMLElement>()
const firstId = sections[0]!.id
const active = ref(firstId)
const activeIndex = computed(() => sections.findIndex(s => s.id === active.value))

const reduce = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function go(id: string) {
  const el = pane.value?.querySelector<HTMLElement>('#' + id)
  if (!el || !pane.value) return
  active.value = id
  pane.value.scrollTo({ top: el.offsetTop - 16, behavior: reduce() ? 'auto' : 'smooth' })
}

// Keep the active chip in view in the narrow, horizontally scrolling nav.
watch(active, (id) => {
  const nav = navEl.value
  const link = nav?.querySelector<HTMLElement>(`[data-id="${id}"]`)
  if (!nav || !link || nav.scrollWidth <= nav.clientWidth) return
  nav.scrollTo({ left: link.offsetLeft - 16, behavior: reduce() ? 'auto' : 'smooth' })
})

let io: IntersectionObserver | undefined
onMounted(() => {
  if (!pane.value) return
  const visible = new Set<string>()
  let atEnd = false
  // A section counts once it crosses the top third of the pane; the end sentinel selects the last one.
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const id = (e.target as HTMLElement).id
      if (e.target === end.value) atEnd = e.isIntersecting
      else if (e.isIntersecting) visible.add(id)
      else visible.delete(id)
    }
    const first = sections.find(s => visible.has(s.id))
    if (atEnd) active.value = sections.at(-1)!.id
    else if (first) active.value = first.id
  }, { root: pane.value, rootMargin: '0px 0px -66% 0px' })
  pane.value.querySelectorAll('.sc__section').forEach(el => io!.observe(el))
  if (end.value) io.observe(end.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<style scoped>
.sc__progress span {
  animation: sc-read linear both; animation-timeline: --sc-read;
}
@keyframes sc-read { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@supports not (animation-timeline: scroll()) { .sc__progress { display: none; } }

.sc__pane { scroll-timeline: --sc-read block; }
.sc__section p { margin: 0 0 10px; }
</style>

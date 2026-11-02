<template>
  <div class="sc">
    <header class="sc__head">
      <div class="sc__title">
        <MiText variant="caption" tone="label2" weight="medium">Postmortem · Sev 2 · resolved</MiText>
        <MiText id="sc-title" variant="title3" as="h2" weight="semibold">Delayed SEPA payouts on October 14</MiText>
      </div>
      <MiButton v-show="activeIndex > 0" variant="gray" size="small" @click="go(firstId)">
        <template #leading><MiIcon name="arrow-up" :size="14" /></template>
        Top
      </MiButton>
      <!-- Reading progress: a CSS scroll-driven animation on transform, no scroll listener. -->
      <div class="sc__progress" aria-hidden="true"><span /></div>
    </header>

    <div class="sc__layout">
      <nav ref="navEl" class="sc__nav" aria-label="Sections of this postmortem" :style="{ '--i': activeIndex }">
        <span class="sc__marker" aria-hidden="true" />
        <a
          v-for="s in sections" :key="s.id" :href="'#' + s.id" class="sc__link" :aria-current="active === s.id ? 'location' : undefined"
          :data-id="s.id" @click.prevent="go(s.id)"
        >
          <span class="sc__num">{{ String(sections.indexOf(s) + 1).padStart(2, '0') }}</span>{{ s.label }}
        </a>
      </nav>

      <div ref="pane" class="sc__pane" tabindex="0" aria-labelledby="sc-title">
        <section v-for="s in sections" :id="s.id" :key="s.id" class="sc__section">
          <h3 class="sc__h">{{ s.label }}</h3>
          <p v-for="(p, i) in s.body" :key="i">{{ p }}</p>
          <ol v-if="s.timeline" class="sc__timeline">
            <li v-for="t in s.timeline" :key="t.at"><time>{{ t.at }}</time>{{ t.what }}</li>
          </ol>
          <ul v-if="s.actions" class="sc__actions">
            <li v-for="a in s.actions" :key="a.what">
              <MiCheckbox v-model="a.done" :label="a.what" :description="a.owner + ' · due ' + a.due" />
            </li>
          </ul>
        </section>
        <div ref="end" class="sc__end" aria-hidden="true" />
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
.sc {
  container-type: inline-size; display: grid; gap: 0; overflow: hidden; border-radius: var(--mi-radius-xl);
  font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-card); box-shadow: var(--mi-sh1);
  timeline-scope: --sc-read;
}
.sc__head { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 16px 14px; border-bottom: 1px solid var(--mi-sep); }
.sc__title { display: grid; gap: 2px; min-width: 0; }
.sc__progress { position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; }
.sc__progress span {
  display: block; height: 100%; background: var(--mi-p); transform: scaleX(0); transform-origin: left;
  animation: sc-read linear both; animation-timeline: --sc-read;
}
@keyframes sc-read { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@supports not (animation-timeline: scroll()) { .sc__progress { display: none; } }

.sc__layout { display: grid; min-width: 0; }
.sc__nav {
  position: relative; display: flex; gap: 6px; padding: 10px 16px; overflow-x: auto; scrollbar-width: none;
  border-bottom: 1px solid var(--mi-sep); background: var(--mi-fill4);
}
.sc__marker { display: none; }
.sc__link {
  display: inline-flex; flex: none; align-items: center; gap: 8px; height: 32px; padding: 0 12px; border-radius: 999px;
  font-size: 13px; font-weight: 500; color: var(--mi-label2); text-decoration: none; white-space: nowrap;
}
.sc__link[aria-current="location"] { color: var(--mi-p-on); background: var(--mi-p); }
.sc__link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.sc__num { font: 600 11px ui-monospace, "SF Mono", Menlo, monospace; opacity: .6; }

.sc__pane { position: relative; height: 420px; overflow-y: auto; padding: 4px 18px 24px; overscroll-behavior: contain; scroll-timeline: --sc-read block; }
.sc__pane:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.sc__section { padding: 16px 0 8px; max-width: 64ch; font-size: 15px; line-height: 1.65; color: var(--mi-label2); }
.sc__section + .sc__section { border-top: 1px solid var(--mi-sep); }
.sc__section p { margin: 0 0 10px; }
.sc__h { margin: 0 0 8px; font-size: 17px; font-weight: 650; letter-spacing: -.01em; color: var(--mi-label); }
.sc__timeline { display: grid; gap: 8px; margin: 4px 0 12px; padding: 0; list-style: none; }
.sc__timeline li { display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: 8px; }
.sc__timeline time { font: 600 13px/1.65 ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label); }
.sc__actions { display: grid; gap: 10px; margin: 4px 0 12px; padding: 0; list-style: none; }
.sc__end { height: 1px; }

@container (min-width: 720px) {
  .sc__head { padding: 18px 24px 16px; }
  .sc__layout { grid-template-columns: 220px minmax(0, 1fr); }
  .sc__nav {
    display: grid; align-content: start; gap: 0; padding: 16px 12px 16px 16px; overflow: visible;
    border-bottom: 0; border-right: 1px solid var(--mi-sep); background: none;
  }
  /* Sliding marker: one bar that moves between fixed-height rows with a transform. */
  .sc__marker {
    position: absolute; top: 16px; left: 16px; display: block; width: 2px; height: 36px; border-radius: 1px; background: var(--mi-p);
    transform: translateY(calc(var(--i) * 36px)); transition: transform var(--mi-dur-3) var(--mi-spring);
  }
  .sc__link { height: 36px; padding: 0 12px 0 16px; border-radius: 0 8px 8px 0; box-shadow: inset 2px 0 0 var(--mi-sep); }
  .sc__link[aria-current="location"] { color: var(--mi-label); background: var(--mi-fill4); }
  .sc__pane { height: 460px; padding: 4px 32px 28px; }
}
</style>

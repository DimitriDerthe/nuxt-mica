<template>
  <div class="srn">
    <!-- The block scrolls inside its own box so every sticky layer is visible in the preview. -->
    <div ref="scroller" class="srn__scroller" tabindex="0" aria-label="Release notes, scrollable">
      <header class="srn__head">
        <div class="srn__head-text">
          <MiText variant="caption" tone="label2" weight="medium">Tessera CMS</MiText>
          <MiText id="srn-title" variant="headline" as="h2">Release notes</MiText>
        </div>
        <MiButton :variant="subscribed ? 'gray' : 'filled'" size="small" :pressed="subscribed" @click="subscribed = !subscribed">
          <template #leading><MiIcon :name="subscribed ? 'check' : 'bell'" :size="15" /></template>
          {{ subscribed ? 'Subscribed' : 'Subscribe' }}
        </MiButton>
        <span class="srn__progress" aria-hidden="true"><span /></span>
      </header>

      <div class="srn__layout">
        <nav class="srn__toc" aria-label="Versions">
          <MiText variant="caption2" tone="label2" weight="semibold" class="srn__toc-label">Versions</MiText>
          <ul>
            <li v-for="r in releases" :key="r.id">
              <a :href="'#srn-' + r.id" class="srn__toc-link" :class="{ 'is-active': r.id === active }" :aria-current="r.id === active ? 'location' : undefined" @click.prevent="jump(r.id)">
                <b>{{ r.version }}</b><span>{{ r.title }}</span>
              </a>
            </li>
          </ul>
        </nav>

        <div class="srn__content">
          <section v-for="r in releases" :id="'srn-' + r.id" :key="r.id" :ref="el => track(el)" class="srn__release" :data-id="r.id" :aria-labelledby="'srn-h-' + r.id">
            <div class="srn__release-head">
              <MiText :id="'srn-h-' + r.id" variant="title3" as="h3" weight="bold">{{ r.version }} · {{ r.title }}</MiText>
              <MiText variant="caption" tone="label2">{{ r.date }}</MiText>
              <MiBadge v-if="r.latest" label="Latest" tone="success" variant="tint" dot />
            </div>
            <div v-for="g in r.groups" :key="g.kind" class="srn__group">
              <span class="srn__kind" :class="'is-' + g.kind.toLowerCase()">{{ g.kind }}</span>
              <ul class="srn__items">
                <li v-for="item in g.items" :key="item">{{ item }}</li>
              </ul>
            </div>
          </section>

          <div class="srn__end">
            <MiText variant="footnote" tone="label2">That's everything since 5.0. Older notes live in the archive.</MiText>
          </div>
        </div>
      </div>

      <!-- Sticky feedback bar pinned to the bottom of the scroll box. -->
      <div class="srn__feedback" role="group" aria-label="Feedback on these notes">
        <MiText variant="footnote" weight="medium" aria-live="polite">{{ vote ? 'Thanks, noted for the next release.' : 'Were these notes useful?' }}</MiText>
        <div v-if="!vote" class="srn__votes">
          <MiButton variant="gray" size="small" @click="vote = 'yes'">Yes</MiButton>
          <MiButton variant="gray" size="small" @click="vote = 'no'">Not really</MiButton>
        </div>
        <MiButton v-else variant="plain" size="small" @click="vote = null">Undo</MiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const releases = [
  {
    id: 'v54', version: '5.4', title: 'Scheduled publishing', date: '28 January 2027', latest: true,
    groups: [
      { kind: 'Added', items: ['Publish times per locale, so the French site can go live at 08:00 Paris time.', 'Bulk scheduling straight from the content list.', 'A calendar view of everything queued for the next 30 days.'] },
      { kind: 'Improved', items: ['The media library opens three times faster with more than 10,000 assets.', 'Preview links now show the scheduled date in a banner.'] },
      { kind: 'Fixed', items: ['Italics were lost when pasting rich text from Google Docs.', 'Webhook retries ignored the backoff setting.'] }
    ]
  },
  {
    id: 'v53', version: '5.3', title: 'Field-level permissions', date: '10 December 2026',
    groups: [
      { kind: 'Added', items: ['Hide or lock individual fields per role.', 'Export the audit log to CSV for any date range.'] },
      { kind: 'Changed', items: ['Preview links expire after 7 days by default; owners can extend them.'] },
      { kind: 'Fixed', items: ['The slug field accepted trailing hyphens.', 'Role names longer than 40 characters broke the settings table.'] }
    ]
  },
  {
    id: 'v52', version: '5.2', title: 'Reusable blocks', date: '22 October 2026',
    groups: [
      { kind: 'Added', items: ['Blocks you can share across entries and edit in one place.', 'A "Used in" panel that lists every entry using a block.'] },
      { kind: 'Improved', items: ['Search ranks exact title matches first.'] },
      { kind: 'Fixed', items: ['The image focal point reset after cropping.'] }
    ]
  },
  {
    id: 'v51', version: '5.1', title: 'Dark mode for editors', date: '3 September 2026',
    groups: [
      { kind: 'Added', items: ['Dark mode that follows the system setting.', 'A keyboard shortcuts sheet, opened with the question mark key.'] },
      { kind: 'Fixed', items: ['The date picker started weeks on Sunday for British English.'] }
    ]
  },
  {
    id: 'v50', version: '5.0', title: 'The new editor', date: '15 July 2026',
    groups: [
      { kind: 'Added', items: ['A block editor with slash commands.', 'Live presence: see who else is editing an entry.'] },
      { kind: 'Changed', items: ['The CLI now needs Node 20 or later.'] },
      { kind: 'Removed', items: ['The legacy v3 REST endpoints. Use the v4 API or GraphQL.'] }
    ]
  }
]

const scroller = ref<HTMLElement>()
const active = ref('v54')
const subscribed = ref(false)
const vote = ref<'yes' | 'no' | null>(null)

// Active version: an IntersectionObserver rooted on the scroll box, so no scroll handler reads layout.
const sections: Element[] = []
const track = (el: unknown) => { if (el instanceof Element && !sections.includes(el)) sections.push(el) }
let io: IntersectionObserver | undefined
onMounted(() => {
  io = new IntersectionObserver((entries) => {
    const hit = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
    const id = (hit?.target as HTMLElement | undefined)?.dataset.id
    if (id) active.value = id
  }, { root: scroller.value, rootMargin: '-120px 0px -55% 0px' })
  sections.forEach(s => io?.observe(s))
})
onBeforeUnmount(() => io?.disconnect())

function jump(id: string) {
  const el = scroller.value?.querySelector<HTMLElement>('#srn-' + id)
  if (!el || !scroller.value) return
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
  scroller.value.scrollTo({ top: el.offsetTop - margin, behavior: 'smooth' })
  active.value = id
}
</script>

<style scoped>
.srn { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.srn__scroller {
  --srn-head: 60px; --srn-toc: 48px;
  position: relative; height: 640px; overflow-y: auto; overscroll-behavior: contain; background: var(--mi-page); scrollbar-width: thin;
}
.srn__scroller:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }

/* Layer 1: header */
.srn__head {
  position: sticky; top: 0; z-index: 4; display: flex; align-items: center; gap: 12px; height: var(--srn-head); padding: 0 16px; box-sizing: border-box;
  background: var(--mi-mat); backdrop-filter: saturate(1.6) blur(18px); -webkit-backdrop-filter: saturate(1.6) blur(18px); border-bottom: 1px solid var(--mi-sep);
}
.srn__head-text { display: grid; flex: 1; min-width: 0; }
/* Reading progress driven by the scroll timeline: transform only, no script. */
.srn__progress { position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; display: none; }
.srn__progress span { display: block; height: 100%; background: linear-gradient(90deg, var(--mi-p), var(--mi-s)); transform-origin: left; transform: scaleX(0); }
@supports (animation-timeline: scroll()) {
  .srn__progress { display: block; }
  .srn__progress span { animation: srn-progress linear both; animation-timeline: scroll(nearest block); }
}
@keyframes srn-progress { to { transform: scaleX(1); } }

/* Layer 2: version index (chips on narrow, side column on wide) */
.srn__layout { display: grid; grid-template-columns: minmax(0, 1fr); }
.srn__toc { position: sticky; top: var(--srn-head); z-index: 3; height: var(--srn-toc); box-sizing: border-box; display: flex; align-items: center; padding: 0 12px; background: var(--mi-page); border-bottom: 1px solid var(--mi-sep); overflow-x: auto; scrollbar-width: none; }
.srn__toc-label { display: none; }
.srn__toc ul { display: flex; gap: 6px; margin: 0; padding: 0; list-style: none; }
.srn__toc-link { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 99px; color: var(--mi-label2); font-size: 13px; text-decoration: none; white-space: nowrap; }
.srn__toc-link b { font-weight: 700; font-variant-numeric: tabular-nums; }
.srn__toc-link span { display: none; }
.srn__toc-link.is-active { background: var(--mi-p-tint); color: var(--mi-p-text); }
.srn__toc-link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }

/* Layer 3: each version heading sticks under the layers above it */
.srn__content { min-width: 0; padding: 0 16px 24px; }
.srn__release { scroll-margin-top: calc(var(--srn-head) + var(--srn-toc)); padding-bottom: 8px; }
.srn__release-head {
  position: sticky; top: calc(var(--srn-head) + var(--srn-toc)); z-index: 2; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px;
  margin: 0 -16px; padding: 14px 16px 10px; background: color-mix(in srgb, var(--mi-page) 92%, transparent);
}
.srn__group { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; padding: 12px 16px; margin-top: 8px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.srn__kind { justify-self: start; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
.srn__kind.is-added { background: color-mix(in srgb, var(--mi-green) 15%, transparent); color: var(--mi-green-t); }
.srn__kind.is-improved { background: var(--mi-p-tint); color: var(--mi-p-text); }
.srn__kind.is-fixed { background: color-mix(in srgb, var(--mi-orange) 16%, transparent); color: var(--mi-orange-t); }
.srn__kind.is-changed { background: color-mix(in srgb, var(--mi-purple) 15%, transparent); color: var(--mi-purple); }
.srn__kind.is-removed { background: color-mix(in srgb, var(--mi-red) 14%, transparent); color: var(--mi-red-t); }
.srn__items { display: grid; gap: 6px; margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.5; }
.srn__items li::marker { color: var(--mi-label3); }
.srn__end { padding: 24px 0 8px; text-align: center; }

/* Layer 4: feedback bar sticks to the bottom */
.srn__feedback {
  position: sticky; bottom: 0; z-index: 4; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; padding: 10px 16px;
  background: var(--mi-mat); backdrop-filter: saturate(1.6) blur(18px); -webkit-backdrop-filter: saturate(1.6) blur(18px); border-top: 1px solid var(--mi-sep);
}
.srn__votes { display: flex; gap: 6px; }

@container (min-width: 760px) {
  .srn__scroller { --srn-toc: 0px; }
  .srn__head { padding: 0 28px; }
  .srn__layout { grid-template-columns: 220px minmax(0, 1fr); gap: 12px; padding: 0 28px; }
  .srn__toc { top: calc(var(--srn-head) + 20px); align-self: start; height: auto; display: grid; gap: 8px; align-items: start; padding: 0; margin-top: 20px; background: none; border: 0; overflow: visible; }
  .srn__toc-label { display: block; letter-spacing: .08em; text-transform: uppercase; padding-left: 14px; }
  .srn__toc ul { display: grid; gap: 2px; border-left: 1px solid var(--mi-sep); }
  .srn__toc-link { position: relative; display: grid; gap: 1px; padding: 6px 12px 6px 14px; border-radius: 0 var(--mi-radius-s) var(--mi-radius-s) 0; white-space: normal; }
  .srn__toc-link span { display: block; font-size: 12px; color: var(--mi-label2); }
  .srn__toc-link.is-active { background: none; color: var(--mi-label); }
  .srn__toc-link::before { content: ""; position: absolute; left: -1px; top: 6px; bottom: 6px; width: 2px; background: var(--mi-p); transform: scaleY(0); transition: transform var(--mi-dur-2) var(--mi-spring); }
  .srn__toc-link.is-active::before { transform: scaleY(1); }
  .srn__content { padding: 4px 0 32px; }
  .srn__release-head { margin: 0; padding: 18px 0 10px; }
  .srn__group { grid-template-columns: 96px minmax(0, 1fr); align-items: start; padding: 14px 18px; }
  .srn__kind { margin-top: 2px; }
  .srn__feedback { padding: 12px 28px; }
}
</style>

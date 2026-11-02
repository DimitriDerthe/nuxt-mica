<template>
  <div class="hb">
    <div class="hb__shell" @keydown.esc="open = false">
      <aside id="hb-nav" class="hb__side" :class="{ 'is-open': open }" aria-label="Handbook">
        <header class="hb__head">
          <div class="hb__head-row">
            <MiText variant="headline" as="h2">The Loomwork handbook</MiText>
            <MiIconButton class="hb__close" label="Close handbook navigation" variant="gray" size="small" @click="open = false">
              <MiIcon name="close" :size="14" />
            </MiIconButton>
          </div>
          <div class="hb__overall">
            <div class="hb__overall-bar" role="meter" aria-label="Pages read" :aria-valuenow="readCount" aria-valuemin="0" :aria-valuemax="total">
              <span :style="{ transform: `scaleX(${readCount / total})` }" />
            </div>
            <MiText variant="caption" tone="label2" tabular>{{ readCount }} of {{ total }} read</MiText>
          </div>
          <MiSearch v-model="query" size="compact" placeholder="Filter pages" aria-label="Filter handbook pages" />
        </header>

        <nav class="hb__nav" aria-label="Handbook pages">
          <section v-for="s in filtered" :key="s.id" class="hb__sec">
            <button
              type="button" class="hb__sec-head" :aria-expanded="isOpen(s.id)" :aria-controls="'hb-s-' + s.id"
              @click="folded[s.id] = !folded[s.id]"
            >
              <MiIcon name="chevron-right" :size="12" class="hb__chev" :class="{ 'is-open': isOpen(s.id) }" />
              <span class="hb__sec-label">{{ s.label }}</span>
              <span class="hb__sec-count" :class="{ 'is-done': s.readIn === s.size }">
                <MiIcon v-if="s.readIn === s.size" name="check" :size="11" :weight="2.6" />
                {{ s.readIn }}/{{ s.size }}
              </span>
            </button>
            <ul v-show="isOpen(s.id)" :id="'hb-s-' + s.id" class="hb__pages">
              <li v-for="p in s.pages" :key="p.id">
                <a
                  :href="'#hb-' + p.id" class="hb__page" :class="{ 'is-active': p.id === current, 'is-read': read.has(p.id) }"
                  :aria-current="p.id === current ? 'page' : undefined" @click.prevent="go(p.id)"
                >
                  <span class="hb__mark" aria-hidden="true"><MiIcon v-if="read.has(p.id)" name="check" :size="9" :weight="3" /></span>
                  <span class="hb__page-label">{{ p.parts[0] }}<mark v-if="p.parts[1]">{{ p.parts[1] }}</mark>{{ p.parts[2] }}</span>
                  <span class="hb__sr">{{ read.has(p.id) ? ', read' : ', unread' }}</span>
                </a>
              </li>
            </ul>
          </section>
          <MiText v-if="!filtered.length" variant="footnote" tone="label2" class="hb__empty">No page title contains “{{ query }}”.</MiText>
        </nav>

        <footer v-if="recent.length" class="hb__recent">
          <MiText variant="caption2" tone="label2" weight="semibold" class="hb__recent-label">Recently viewed</MiText>
          <div class="hb__recent-list">
            <button v-for="id in recent" :key="id" type="button" class="hb__recent-chip" @click="go(id)">{{ byId[id]?.label }}</button>
          </div>
        </footer>
      </aside>
      <div class="hb__scrim" :class="{ 'is-on': open }" aria-hidden="true" @click="open = false" />

      <main class="hb__main" aria-labelledby="hb-title">
        <div class="hb__bar">
          <MiIconButton class="hb__burger" label="Open handbook navigation" variant="gray" size="regular" aria-controls="hb-nav" :aria-expanded="open" @click="open = true">
            <MiIcon :svg="burger" :size="18" />
          </MiIconButton>
          <MiText variant="footnote" tone="label2" :lines="1">{{ page.section }} / {{ page.label }}</MiText>
        </div>
        <Transition name="hb-swap" mode="out-in">
          <article :id="'hb-' + page.id" :key="page.id" class="hb__article">
            <MiText variant="caption" tone="primary" weight="semibold">{{ page.minutes }} min read</MiText>
            <MiText id="hb-title" variant="title1" as="h3" weight="bold" balance>{{ page.label }}</MiText>
            <MiText variant="body" class="hb__lede">{{ page.summary }}</MiText>
            <div class="hb__lines" aria-hidden="true"><span v-for="w in [1, 0.92, 0.97, 0.6]" :key="w" :style="{ transform: `scaleX(${w})` }" /></div>
            <div class="hb__actions">
              <MiButton v-if="next" @click="finish">
                Done, next: {{ next.label }}
                <template #trailing><MiIcon name="arrow-right" :size="16" /></template>
              </MiButton>
              <MiButton v-else @click="markRead(page.id)">Mark as read</MiButton>
              <MiButton v-if="read.has(page.id)" variant="plain" @click="unread(page.id)">Mark unread</MiButton>
            </div>
          </article>
        </Transition>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const burger = '<path d="M4 7h16M4 12h16M4 17h10"/>'

interface Page { id: string, label: string, minutes: number, summary: string }
const sections: { id: string, label: string, pages: Page[] }[] = [
  {
    id: 'start', label: 'Start here',
    pages: [
      { id: 'welcome', label: 'Welcome to Loomwork', minutes: 3, summary: 'Thirty-one people in eleven time zones, building scheduling software for community clinics. This handbook is how we stay on the same page without meeting all day.' },
      { id: 'first-week', label: 'Your first week', minutes: 5, summary: 'Day one is laptop and accounts, day two is a pairing session, and by Friday you ship one small change to production with your buddy.' },
      { id: 'tools', label: 'Tools we use', minutes: 4, summary: 'Linear for work, Notion for writing, Slack for quick questions only. If a thread runs past ten replies, it becomes a doc.' },
      { id: 'glossary', label: 'Words we use', minutes: 2, summary: 'A clinic is a customer, a site is one of its locations, and a slot is a bookable 15-minute block. We avoid “user” when we mean a patient.' }
    ]
  },
  {
    id: 'work', label: 'How we work',
    pages: [
      { id: 'async', label: 'Async by default', minutes: 6, summary: 'Write it down first. A short Loom or a doc beats a meeting, and every decision lands in the decision log within a day.' },
      { id: 'meetings', label: 'When we do meet', minutes: 3, summary: 'Meetings need an agenda, a note-taker and a decision to make. Tuesdays and Thursdays from 14:00 to 17:00 UTC are our overlap hours.' },
      { id: 'rfcs', label: 'Writing an RFC', minutes: 8, summary: 'Any change that touches more than one team starts as a two-page RFC: problem, options, recommendation, and what we will not do.' },
      { id: 'decisions', label: 'The decision log', minutes: 3, summary: 'One line per decision, with a link, an owner and a date. Reversing a decision is fine; doing it silently is not.' },
      { id: 'feedback', label: 'Giving feedback', minutes: 5, summary: 'Specific, kind and soon. We use “I noticed, I felt, I suggest”, and we ask before giving feedback outside a review.' }
    ]
  },
  {
    id: 'people', label: 'People & time',
    pages: [
      { id: 'time-off', label: 'Time off', minutes: 4, summary: 'Thirty days a year plus your local public holidays. Book a week or more at least a month ahead and tell your team channel.' },
      { id: 'parental', label: 'Parental leave', minutes: 5, summary: 'Twenty weeks at full pay for every parent, taken in one block or split over the first year.' },
      { id: 'equipment', label: 'Home office budget', minutes: 2, summary: '€1,500 when you join and €400 each year after, for a chair, a desk, a screen or anything that makes work comfortable.' },
      { id: 'retreats', label: 'Team retreats', minutes: 4, summary: 'Twice a year, one week, somewhere reachable by train for most of us. The spring 2027 retreat is in Ghent.' }
    ]
  },
  {
    id: 'craft', label: 'Craft',
    pages: [
      { id: 'critique', label: 'Design critique', minutes: 5, summary: 'Show work early. Critique is about the problem and the patient, never the designer, and ends with one clear next step.' },
      { id: 'shipping', label: 'Shipping on Thursdays', minutes: 3, summary: 'The release train leaves every Thursday at 10:00 UTC. Missed it? The next one is a week away, and that is fine.' },
      { id: 'oncall', label: 'On-call rotation', minutes: 6, summary: 'One engineer per week, follow-the-sun hand-offs, and a paid day off after any night page.' },
      { id: 'reviews', label: 'Blameless incident reviews', minutes: 7, summary: 'Within five days of an incident we write what happened, why it made sense at the time, and what we change.' }
    ]
  }
]

const byId: Record<string, Page & { section: string }> = Object.fromEntries(sections.flatMap(s => s.pages.map(p => [p.id, { ...p, section: s.label }])))
const order = sections.flatMap(s => s.pages.map(p => p.id))
const total = order.length

const current = ref('rfcs')
const open = ref(false)
const query = ref('')
const folded = reactive<Record<string, boolean>>({ people: true })
const read = reactive(new Set(['welcome', 'first-week', 'tools', 'glossary', 'async', 'meetings', 'time-off', 'critique', 'shipping']))
const recent = ref<string[]>(['meetings', 'async'])

const readCount = computed(() => read.size)
const page = computed(() => byId[current.value]!)
const next = computed(() => {
  const id = order[order.indexOf(current.value) + 1]
  return id ? byId[id] : undefined
})

/** Sections with their pages narrowed to the filter, each title split around the match for highlighting. */
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return sections.map((s) => {
    const pages = s.pages.flatMap((p) => {
      if (!q) return [{ ...p, parts: [p.label, '', ''] }]
      const at = p.label.toLowerCase().indexOf(q)
      return at < 0 ? [] : [{ ...p, parts: [p.label.slice(0, at), p.label.slice(at, at + q.length), p.label.slice(at + q.length)] }]
    })
    return { ...s, pages, size: s.pages.length, readIn: s.pages.filter(p => read.has(p.id)).length }
  }).filter(s => s.pages.length)
})
const isOpen = (id: string) => !folded[id] || !!query.value.trim()

function go(id: string) {
  if (id !== current.value) recent.value = [current.value, ...recent.value.filter(r => r !== current.value && r !== id)].slice(0, 3)
  current.value = id
  open.value = false
  const sec = sections.find(s => s.pages.some(p => p.id === id))
  if (sec) folded[sec.id] = false
}
function markRead(id: string) { read.add(id) }
function unread(id: string) { read.delete(id) }
function finish() {
  markRead(current.value)
  if (next.value) go(next.value.id)
}
</script>

<style scoped>
.hb { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.hb__shell { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); height: 620px; overflow: hidden; background: var(--mi-card); }

.hb__side {
  position: absolute; inset: 0 auto 0 0; z-index: 3; width: min(300px, 88%); display: flex; flex-direction: column; box-sizing: border-box;
  background: var(--mi-side); box-shadow: var(--mi-sh3);
  transform: translateX(-104%); visibility: hidden; transition: transform var(--mi-dur-3) var(--mi-ease), visibility 0s linear var(--mi-dur-3);
}
.hb__side.is-open { transform: none; visibility: visible; transition: transform var(--mi-dur-3) var(--mi-ease); }
.hb__scrim { position: absolute; inset: 0; z-index: 2; background: var(--mi-scrim); opacity: 0; pointer-events: none; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.hb__scrim.is-on { opacity: 1; pointer-events: auto; }

.hb__head { display: grid; gap: 12px; padding: 18px 16px 12px; }
.hb__head-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.hb__overall { display: flex; align-items: center; gap: 10px; }
.hb__overall-bar { flex: 1; height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.hb__overall-bar span { display: block; height: 100%; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }

.hb__nav { flex: 1; min-height: 0; overflow-y: auto; padding: 4px 10px 14px; display: grid; align-content: start; gap: 6px; }
.hb__sec-head { display: flex; align-items: center; gap: 6px; width: 100%; padding: 7px 6px; border: 0; border-radius: var(--mi-radius-s); background: none; color: var(--mi-label); font: 600 13px/1.3 var(--mi-font); text-align: left; cursor: pointer; }
.hb__sec-head:hover { background: var(--mi-fill4); }
.hb__chev { color: var(--mi-label2); transition: transform var(--mi-dur-2) var(--mi-ease); }
.hb__chev.is-open { transform: rotate(90deg); }
.hb__sec-label { flex: 1; min-width: 0; }
.hb__sec-count { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--mi-label3); }
.hb__sec-count.is-done { color: var(--mi-green-t); }

/* Pages hang off a guide line; the mark on the line tells read, unread and current apart. */
.hb__pages { position: relative; display: grid; margin: 2px 0 6px 12px; padding: 0; list-style: none; }
.hb__pages::before { content: ""; position: absolute; left: 5px; top: 8px; bottom: 8px; width: 1px; background: var(--mi-sep); }
.hb__page { position: relative; display: flex; align-items: center; gap: 12px; padding: 7px 8px 7px 0; border-radius: var(--mi-radius-s); color: var(--mi-label2); font-size: 14px; line-height: 1.3; text-decoration: none; }
.hb__page:hover { color: var(--mi-label); }
.hb__page:focus-visible, .hb__sec-head:focus-visible, .hb__recent-chip:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.hb__mark { position: relative; flex: none; display: grid; place-items: center; width: 11px; height: 11px; border-radius: 50%; background: var(--mi-side); box-shadow: inset 0 0 0 1.5px var(--mi-label3); color: var(--mi-p-on); transition: transform var(--mi-dur-2) var(--mi-spring); }
.hb__page.is-read .hb__mark { background: var(--mi-green); box-shadow: none; }
.hb__page.is-active { color: var(--mi-label); font-weight: 600; }
.hb__page.is-active .hb__mark { box-shadow: 0 0 0 3px var(--mi-p-tint), inset 0 0 0 1.5px var(--mi-p); transform: scale(1.15); }
.hb__page.is-active.is-read .hb__mark { background: var(--mi-p); box-shadow: 0 0 0 3px var(--mi-p-tint); }
.hb__page-label { min-width: 0; }
.hb__page mark { background: var(--mi-p-tint2); color: inherit; border-radius: 3px; padding: 0 1px; }
.hb__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.hb__empty { padding: 8px; }

.hb__recent { display: grid; gap: 8px; padding: 12px 16px 16px; border-top: 1px solid var(--mi-sep); }
.hb__recent-label { letter-spacing: .06em; text-transform: uppercase; }
.hb__recent-list { display: flex; flex-wrap: wrap; gap: 6px; }
.hb__recent-chip { max-width: 100%; padding: 5px 10px; border: 0; border-radius: 99px; background: var(--mi-card); box-shadow: var(--mi-sh1); color: var(--mi-label); font: 500 12px/1.2 var(--mi-font); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }

.hb__main { min-width: 0; overflow-y: auto; padding: 14px 18px 28px; }
.hb__bar { display: flex; align-items: center; gap: 10px; min-height: 36px; }
.hb__article { display: grid; justify-items: start; gap: 12px; max-width: 620px; margin: 28px auto 0; }
.hb__lede { font-size: 17px; line-height: 1.6; }
.hb__lines { display: grid; gap: 10px; width: 100%; }
.hb__lines span { display: block; height: 9px; border-radius: 5px; background: var(--mi-fill4); transform-origin: left; }
.hb__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }

.hb-swap-enter-active, .hb-swap-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.hb-swap-enter-from { opacity: 0; transform: translateY(8px); }
.hb-swap-leave-to { opacity: 0; }

@container (min-width: 760px) {
  .hb__shell { grid-template-columns: 284px minmax(0, 1fr); }
  .hb__side { position: relative; inset: auto; width: auto; transform: none; visibility: visible; transition: none; box-shadow: none; border-right: 1px solid var(--mi-sep); }
  .hb__close, .hb__burger, .hb__scrim { display: none; }
  .hb__main { padding: 18px 36px 36px; }
  .hb__bar { min-height: 0; }
}
</style>

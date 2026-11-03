<template>
  <div class="mi:@container mi:font-mi mi:text-label">
    <div class="mi:relative mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:h-155 mi:overflow-hidden mi:[background:var(--mi-card)] mi:@[760px]:grid-cols-[284px_minmax(0,_1fr)]" @keydown.esc="open = false">
      <aside id="hb-nav" class="mi:absolute mi:top-0 mi:right-auto mi:bottom-0 mi:left-0 mi:z-3 mi:w-[min(300px,_88%)] mi:flex mi:flex-col mi:box-border mi:[background:var(--mi-side)] mi:shadow-3 mi:@[760px]:relative mi:@[760px]:inset-auto mi:@[760px]:w-auto mi:@[760px]:transform-none mi:@[760px]:visible mi:@[760px]:[transition:none] mi:@[760px]:shadow-none mi:@[760px]:border-r mi:@[760px]:border-r-sep" :class="open ? 'mi:transform-none mi:visible mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease)]' : 'mi:transform-[translateX(-104%)] mi:invisible mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease),_visibility_0s_linear_var(--mi-dur-3)]'" aria-label="Handbook">
        <header class="mi:grid mi:gap-3 mi:pt-4.5 mi:px-4 mi:pb-3">
          <div class="mi:flex mi:items-center mi:justify-between mi:gap-2">
            <MiText variant="headline" as="h2">The Loomwork handbook</MiText>
            <MiIconButton class="mi:@[760px]:hidden!" label="Close handbook navigation" variant="gray" size="small" @click="open = false">
              <MiIcon name="close" :size="14" />
            </MiIconButton>
          </div>
          <div class="mi:flex mi:items-center mi:gap-2.5">
            <div class="mi:flex-1 mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" aria-label="Pages read" :aria-valuenow="readCount" aria-valuemin="0" :aria-valuemax="total">
              <span class="mi:block mi:h-full mi:[background:var(--mi-p)] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${readCount / total})` }" />
            </div>
            <MiText variant="caption" tone="label2" tabular>{{ readCount }} of {{ total }} read</MiText>
          </div>
          <MiSearch v-model="query" size="compact" placeholder="Filter pages" aria-label="Filter handbook pages" />
        </header>

        <nav class="mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:pt-1 mi:px-2.5 mi:pb-3.5 mi:grid mi:content-start mi:gap-1.5" aria-label="Handbook pages">
          <section v-for="s in filtered" :key="s.id">
            <button
              type="button" class="mi:flex mi:items-center mi:gap-1.5 mi:w-full mi:py-[7px] mi:px-1.5 mi:[border:0] mi:rounded-sm mi:[background:none] mi:text-label mi:[font:600_13px/1.3_var(--mi-font)] mi:text-left mi:cursor-pointer mi:hover:[background:var(--mi-fill4)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :aria-expanded="isOpen(s.id)" :aria-controls="'hb-s-' + s.id"
              @click="folded[s.id] = !folded[s.id]"
            >
              <MiIcon name="chevron-right" :size="12" class="mi:text-label2 mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] " :class="isOpen(s.id) ? 'mi:transform-[rotate(90deg)]' : ''" />
              <span class="mi:flex-1 mi:min-w-0">{{ s.label }}</span>
              <span class="mi:inline-flex mi:items-center mi:gap-[3px] mi:text-[11px] mi:font-semibold mi:tabular-nums" :class="s.readIn === s.size ? 'mi:text-green-t' : 'mi:text-label3'">
                <MiIcon v-if="s.readIn === s.size" name="check" :size="11" :weight="2.6" />
                {{ s.readIn }}/{{ s.size }}
              </span>
            </button>
            <ul v-show="isOpen(s.id)" :id="'hb-s-' + s.id" class="mi:relative mi:grid mi:mt-0.5 mi:mr-0 mi:mb-1.5 mi:ml-3 mi:p-0 mi:[list-style:none] mi:before:content-[''] mi:before:absolute mi:before:left-[5px] mi:before:top-2 mi:before:bottom-2 mi:before:w-px mi:before:[background:var(--mi-sep)]">
              <li v-for="p in s.pages" :key="p.id">
                <a
                  :href="'#hb-' + p.id" class="mi:relative mi:flex mi:items-center mi:gap-3 mi:pt-[7px] mi:pr-2 mi:pb-[7px] mi:pl-0 mi:rounded-sm mi:text-[14px] mi:leading-[1.3] mi:[text-decoration:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] " :class="[p.id === current ? 'mi:font-semibold mi:text-label' : 'mi:text-label2 mi:hover:text-label']"
                  :aria-current="p.id === current ? 'page' : undefined" @click.prevent="go(p.id)"
                >
                  <span class="mi:relative mi:flex-[none] mi:grid mi:place-items-center mi:w-[11px] mi:h-[11px] mi:rounded-[50%] mi:text-p-on mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)]" :class="[p.id === current ? 'mi:transform-[scale(1.15)]' : '', p.id === current && read.has(p.id) ? 'mi:[background:var(--mi-p)]' : read.has(p.id) ? 'mi:[background:var(--mi-green)]' : 'mi:[background:var(--mi-side)]', p.id === current && read.has(p.id) ? 'mi:shadow-[0_0_0_3px_var(--mi-p-tint)]' : p.id === current ? 'mi:shadow-[0_0_0_3px_var(--mi-p-tint),_inset_0_0_0_1.5px_var(--mi-p)]' : read.has(p.id) ? 'mi:shadow-none' : 'mi:shadow-[inset_0_0_0_1.5px_var(--mi-label3)]']" aria-hidden="true"><MiIcon v-if="read.has(p.id)" name="check" :size="9" :weight="3" /></span>
                  <span class="mi:min-w-0">{{ p.parts[0] }}<mark class="mi:text-inherit mi:py-0 mi:px-px mi:[background:var(--mi-p-tint2)] mi:rounded-[3px]" v-if="p.parts[1]">{{ p.parts[1] }}</mark>{{ p.parts[2] }}</span>
                  <span class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">{{ read.has(p.id) ? ', read' : ', unread' }}</span>
                </a>
              </li>
            </ul>
          </section>
          <MiText v-if="!filtered.length" variant="footnote" tone="label2" class="mi:p-2">No page title contains “{{ query }}”.</MiText>
        </nav>

        <footer v-if="recent.length" class="mi:grid mi:gap-2 mi:pt-3 mi:px-4 mi:pb-4 mi:border-t mi:border-t-sep">
          <MiText variant="caption2" tone="label2" weight="semibold" class="mi:tracking-[.06em]! mi:uppercase">Recently viewed</MiText>
          <div class="mi:flex mi:flex-wrap mi:gap-1.5">
            <button v-for="id in recent" :key="id" type="button" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:max-w-full mi:py-[5px] mi:px-2.5 mi:[border:0] mi:rounded-[99px] mi:[background:var(--mi-card)] mi:shadow-1 mi:text-label mi:[font:500_12px/1.2_var(--mi-font)] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:cursor-pointer" @click="go(id)">{{ byId[id]?.label }}</button>
          </div>
        </footer>
      </aside>
      <div class="mi:absolute mi:inset-0 mi:z-2 mi:[background:var(--mi-scrim)] mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:@[760px]:hidden" :class="open ? 'mi:opacity-100 mi:pointer-events-auto' : 'mi:opacity-0 mi:pointer-events-none'" aria-hidden="true" @click="open = false" />

      <main class="mi:min-w-0 mi:overflow-y-auto mi:pt-3.5 mi:px-4.5 mi:pb-7 mi:@[760px]:pt-4.5 mi:@[760px]:px-9 mi:@[760px]:pb-9" aria-labelledby="hb-title">
        <div class="mi:flex mi:items-center mi:gap-2.5 mi:min-h-9 mi:@[760px]:min-h-0">
          <MiIconButton class="mi:@[760px]:hidden!" label="Open handbook navigation" variant="gray" size="regular" aria-controls="hb-nav" :aria-expanded="open" @click="open = true">
            <MiIcon :svg="burger" :size="18" />
          </MiIconButton>
          <MiText variant="footnote" tone="label2" :lines="1">{{ page.section }} / {{ page.label }}</MiText>
        </div>
        <Transition mode="out-in" enter-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" enter-from-class="mi:opacity-0 mi:transform-[translateY(8px)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" leave-to-class="mi:opacity-0">
          <article :id="'hb-' + page.id" :key="page.id" class="mi:grid mi:justify-items-start mi:gap-3 mi:max-w-155 mi:mt-7 mi:mx-auto mi:mb-0">
            <MiText variant="caption" tone="primary" weight="semibold">{{ page.minutes }} min read</MiText>
            <MiText id="hb-title" variant="title1" as="h3" weight="bold" balance>{{ page.label }}</MiText>
            <MiText variant="body" class="mi:text-[17px]! mi:leading-[1.6]!">{{ page.summary }}</MiText>
            <div class="mi:grid mi:gap-2.5 mi:w-full" aria-hidden="true"><span v-for="w in [1, 0.92, 0.97, 0.6]" :key="w" class="mi:block mi:h-[9px] mi:rounded-[5px] mi:[background:var(--mi-fill4)] mi:origin-left" :style="{ transform: `scaleX(${w})` }" /></div>
            <div class="mi:flex mi:flex-wrap mi:gap-2 mi:mt-2.5">
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

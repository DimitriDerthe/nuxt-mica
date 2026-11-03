<template>
  <div class="mi:@container mi:font-mi mi:text-label">
    <div class="mi:relative mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:grid-rows-[minmax(0,_1fr)_auto] mi:h-160 mi:overflow-hidden mi:[background:var(--mi-card)] mi:@[720px]:grid-rows-[minmax(0,_1fr)] mi:group/shell" :class="tucked ? 'mi:@[720px]:grid-cols-[68px_0_minmax(0,_1fr)]' : 'mi:@[720px]:grid-cols-[68px_264px_minmax(0,_1fr)]'" :data-tucked="tucked || undefined" @keydown.esc="panelOpen = false">
      <!-- Rail: one button per app area; the brand pill slides between them with transform. -->
      <nav class="mi:hidden mi:@[720px]:flex mi:@[720px]:flex-col mi:@[720px]:items-center mi:@[720px]:gap-5.5 mi:@[720px]:pt-4 mi:@[720px]:px-0 mi:@[720px]:pb-3.5 mi:@[720px]:[background:var(--mi-side)] mi:@[720px]:border-r mi:@[720px]:border-r-sep" aria-label="Galley areas">
        <span class="mi:grid mi:place-items-center mi:w-9 mi:h-9 mi:rounded-[11px] mi:text-p-on mi:font-extrabold mi:text-[17px] mi:tracking-[-.04em] mi:[background:linear-gradient(150deg,_var(--mi-p),_var(--mi-s))]" aria-hidden="true">G</span>
        <div class="mi:relative mi:grid mi:gap-1" :style="{ '--i': areaIndex }">
          <span class="mi:absolute mi:left-0 mi:top-0 mi:w-11 mi:h-11 mi:rounded-[13px] mi:[background:var(--mi-p-tint)] mi:transform-[translateY(calc(var(--i)_*_48px))] mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" aria-hidden="true" />
          <button
            v-for="a in areas" :key="a.id" type="button" class="mi:relative mi:grid mi:place-items-center mi:w-11 mi:h-11 mi:[border:0] mi:rounded-[13px] mi:[background:none] mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :class="a.id === area ? 'mi:text-p-text' : 'mi:text-label2 mi:hover:text-label'"
            :aria-current="a.id === area ? 'true' : undefined" :aria-label="a.label" :title="a.id === area ? (tucked ? 'Show ' : 'Hide ') + a.label.toLowerCase() + ' panel' : a.label"
            @click="pickArea(a.id, true)"
          >
            <MiIcon :name="a.icon === 'inbox' ? 'tray' : a.icon" :size="20" />
            <i v-if="a.count" class="mi:absolute mi:top-[5px] mi:right-1 mi:min-w-4 mi:h-4 mi:py-0 mi:px-1 mi:box-border mi:rounded-[8px] mi:[background:var(--mi-red)] mi:text-p-on mi:shadow-[0_0_0_2px_var(--mi-side)] mi:[font:600_10px/16px_var(--mi-font)] mi:not-italic">{{ a.count }}</i>
          </button>
        </div>
        <MiAvatar class="mi:mt-auto" name="Odile Marchetti" size="sm" tone="auto" />
      </nav>

      <!-- Context panel: its tree follows the selected area. Off-canvas under 720px. -->
      <aside id="dr-panel" class="mi:absolute mi:top-0 mi:right-auto mi:bottom-0 mi:left-0 mi:z-3 mi:w-[min(300px,_86%)] mi:flex mi:flex-col mi:box-border mi:[background:var(--mi-side)] mi:shadow-3 mi:@[720px]:relative mi:@[720px]:inset-auto mi:@[720px]:w-auto mi:@[720px]:transform-none mi:@[720px]:visible mi:@[720px]:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:@[720px]:shadow-none mi:@[720px]:border-r mi:@[720px]:border-r-sep mi:@[720px]:[background:color-mix(in_srgb,_var(--mi-side)_55%,_var(--mi-card))] mi:@[720px]:group-data-[tucked]/shell:opacity-0 mi:@[720px]:group-data-[tucked]/shell:invisible" :class="panelOpen ? 'mi:visible mi:transform-none mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease)]' : 'mi:invisible mi:transform-[translateX(-104%)] mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease),_visibility_0s_linear_var(--mi-dur-3)]'" :aria-label="current.label">
        <header class="mi:flex mi:[align-items:flex-end] mi:justify-between mi:gap-2 mi:pt-5 mi:px-4 mi:pb-3">
          <div>
            <MiText variant="caption2" tone="label2" weight="semibold" class="mi:tracking-[.06em]! mi:uppercase!">Northbound · Galley</MiText>
            <MiText variant="title3" as="h2" weight="bold">{{ current.label }}</MiText>
          </div>
          <MiIconButton :label="'New in ' + current.label.toLowerCase()" variant="tinted" size="small"><MiIcon name="plus" :size="14" /></MiIconButton>
        </header>
        <div class="mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:pt-0 mi:px-2 mi:pb-4 mi:grid mi:content-start mi:gap-2.5">
          <section v-for="g in current.groups" :key="g.id">
            <button type="button" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:flex mi:items-center mi:gap-1.5 mi:w-full mi:py-1.5 mi:px-2 mi:[border:0] mi:rounded-sm mi:[background:none] mi:text-label2 mi:[font:600_12px/1.3_var(--mi-font)] mi:text-left mi:cursor-pointer mi:hover:text-label" :aria-expanded="!folded[g.id]" :aria-controls="'dr-g-' + g.id" @click="folded[g.id] = !folded[g.id]">
              <MiIcon name="chevron-right" :size="12" class="mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="!folded[g.id] ? 'mi:transform-[rotate(90deg)]' : ''" />
              <span class="mi:flex-1 mi:min-w-0">{{ g.label }}</span>
              <span class="mi:tabular-nums mi:text-label3">{{ g.items.length }}</span>
            </button>
            <ul v-show="!folded[g.id]" :id="'dr-g-' + g.id" class="mi:grid mi:gap-0.5 mi:pt-0 mi:pr-0 mi:pb-0 mi:pl-3.5 mi:mt-0.5 mi:mr-0 mi:mb-0 mi:ml-3.5 mi:[list-style:none] mi:border-l mi:border-l-sep">
              <li v-for="it in g.items" :key="it.id">
                <button
                  type="button" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:flex mi:[align-items:flex-start] mi:gap-2.5 mi:w-full mi:py-2 mi:px-2.5 mi:[border:0] mi:rounded-[10px] mi:[background:none] mi:text-label mi:[font:inherit] mi:text-left mi:cursor-pointer" :class="it.id === selected ? 'mi:bg-card mi:shadow-1' : 'mi:hover:bg-fill4'" :aria-current="it.id === selected ? 'page' : undefined"
                  @click="pickItem(it.id)"
                >
                  <span class="mi:flex-[none] mi:w-2 mi:h-2 mi:mt-1.5 mi:rounded-[50%]" :style="{ background: `var(--mi-${it.color})` }" aria-hidden="true" />
                  <span class="mi:grid mi:gap-px mi:min-w-0">
                    <span class="mi:text-[14px] mi:leading-[1.3]" :class="it.id === selected ? 'mi:font-semibold' : 'mi:font-medium'">{{ it.label }}</span>
                    <span class="mi:text-[12px] mi:text-label2">{{ it.meta }}</span>
                  </span>
                </button>
              </li>
            </ul>
          </section>
        </div>
      </aside>
      <div class="mi:absolute mi:inset-0 mi:z-2 mi:[background:var(--mi-scrim)] mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:@[720px]:hidden" :class="panelOpen ? 'mi:opacity-100 mi:pointer-events-auto' : 'mi:opacity-0 mi:pointer-events-none'" aria-hidden="true" @click="panelOpen = false" />

      <main class="mi:min-w-0 mi:min-h-0 mi:overflow-y-auto mi:pt-3.5 mi:px-4.5 mi:pb-6 mi:@[720px]:pt-4.5 mi:@[720px]:px-8 mi:@[720px]:pb-8" aria-labelledby="dr-doc-title">
        <header class="mi:flex mi:items-center mi:gap-2.5 mi:min-w-0">
          <MiIconButton class="mi:@[720px]:hidden!" :label="'Open ' + current.label.toLowerCase()" variant="gray" size="regular" aria-controls="dr-panel" :aria-expanded="panelOpen" @click="panelOpen = true">
            <MiIcon :svg="burger" :size="18" />
          </MiIconButton>
          <MiBreadcrumb :items="[{ label: current.label, href: '#' }, { label: group.label, href: '#' }, { label: item.label }]" class="mi:min-w-0! mi:overflow-hidden!" />
        </header>
        <Transition mode="out-in" enter-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" enter-from-class="mi:opacity-0 mi:transform-[translateY(8px)]" leave-to-class="mi:opacity-0">
          <article :key="item.id" class="mi:grid mi:justify-items-start mi:gap-3 mi:max-w-160 mi:mt-7 mi:mx-auto mi:mb-0">
            <MiBadge :label="item.status" variant="tint" :tone="item.tone" dot />
            <MiText id="dr-doc-title" variant="title1" as="h3" weight="bold" balance>{{ item.label }}</MiText>
            <div class="mi:flex mi:items-center mi:gap-2">
              <MiAvatar :name="item.owner" size="xs" tone="auto" decorative />
              <MiText variant="footnote" tone="label2">{{ item.owner }} · {{ item.meta }}</MiText>
            </div>
            <MiText variant="body" class="mi:text-[17px]! mi:leading-[1.6]!">{{ item.excerpt }}</MiText>
            <div class="mi:grid mi:gap-2.5 mi:w-full mi:mt-1.5" aria-hidden="true"><span class="mi:block mi:h-[9px] mi:rounded-[5px] mi:[background:var(--mi-fill4)] mi:origin-left mi:transform-[scaleX(var(--w))]" v-for="n in 5" :key="n" :style="{ '--w': [0.96, 0.88, 0.92, 0.7, 0.4][n - 1] }" /></div>
          </article>
        </Transition>
      </main>

      <!-- Narrow screens: the rail becomes a bottom tab bar. -->
      <div class="mi:@[720px]:hidden">
        <MiTabBar :model-value="area" :items="areas.map(a => ({ id: a.id, label: a.label, icon: a.icon, badge: a.count }))" aria-label="Galley areas" @update:model-value="v => v && pickArea(v, false)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const burger = '<path d="M4 7h16M4 12h16M4 17h10"/>'

type Tone = 'primary' | 'success' | 'warning' | 'neutral'
interface Item { id: string, label: string, meta: string, color: string, status: string, tone: Tone, owner: string, excerpt: string }
interface Group { id: string, label: string, items: Item[] }
interface Area { id: string, label: string, icon: 'folder' | 'inbox' | 'calendar' | 'people', count?: number, groups: Group[] }

const areas: Area[] = [
  {
    id: 'issues', label: 'Issues', icon: 'folder',
    groups: [
      {
        id: 'no14', label: 'Spring 2027 · No. 14',
        items: [
          { id: 'ferrymen', label: 'The last ferrymen of the Tagus', meta: '4,200 words', color: 'orange', status: 'In edit', tone: 'warning', owner: 'Rui Tavares', excerpt: 'Three crossings a day, the same faces for thirty years. A portrait of the crews who keep the river ferries running while the bridge traffic hums overhead.' },
          { id: 'seeds', label: 'Notes from a seed library', meta: '2,800 words', color: 'green', status: 'Approved', tone: 'success', owner: 'Hana Okafor', excerpt: 'In a former post office in Évora, gardeners borrow tomato seeds in spring and return twice as many in autumn. The catalogue now holds 1,140 varieties.' },
          { id: 'cover', label: 'Cover: low tide at Comporta', meta: '6 frames', color: 'indigo', status: 'Photo selects', tone: 'primary', owner: 'Léa Fontaine', excerpt: 'Two candidates left for the cover. The wide frame wins on mood; the close one carries the headline better on the newsstand.' }
        ]
      },
      {
        id: 'no13', label: 'Winter 2026 · No. 13',
        items: [
          { id: 'salt', label: 'Salt pans after the storm', meta: 'Published', color: 'teal', status: 'Live', tone: 'neutral', owner: 'Rui Tavares', excerpt: 'Published in December. Corrections log is closed and the piece is syndicated to two partner magazines.' },
          { id: 'lighthouse', label: 'Keepers of an automatic light', meta: 'Published', color: 'teal', status: 'Live', tone: 'neutral', owner: 'Mei Lindqvist', excerpt: 'The lighthouse has run itself since 1994, yet two retired keepers still climb it every Sunday.' }
        ]
      }
    ]
  },
  {
    id: 'pitches', label: 'Pitches', icon: 'inbox', count: 3,
    groups: [
      {
        id: 'new', label: 'New this week',
        items: [
          { id: 'tiles', label: 'Who still paints azulejos by hand?', meta: 'from Inês Prata', color: 'blue', status: 'Unread', tone: 'primary', owner: 'Inês Prata', excerpt: 'A workshop in Sacavém takes commissions two years out. I can get access to the kiln firing in March.' },
          { id: 'night-bus', label: 'Riding the 208 night bus', meta: 'from Tomás Neto', color: 'blue', status: 'Unread', tone: 'primary', owner: 'Tomás Neto', excerpt: 'One night, end to end, with the drivers, bakers and nurses who make up its regular passengers.' },
          { id: 'cork', label: 'The cork harvest, nine years on', meta: 'from Amara Diallo', color: 'blue', status: 'Unread', tone: 'primary', owner: 'Amara Diallo', excerpt: 'Cork oaks are stripped every nine years. I photographed this grove in 2018 and can return in June.' }
        ]
      },
      {
        id: 'short', label: 'Shortlisted',
        items: [
          { id: 'radio', label: 'A pirate radio on the south bank', meta: 'from Dario Esposito', color: 'purple', status: 'Shortlisted', tone: 'warning', owner: 'Dario Esposito', excerpt: 'Broadcasting fado and football commentary from a garage since 1979. The owner agreed to an interview.' }
        ]
      }
    ]
  },
  {
    id: 'schedule', label: 'Schedule', icon: 'calendar',
    groups: [
      {
        id: 'week', label: 'This week',
        items: [
          { id: 'copy', label: 'Copy deadline', meta: 'Tue 9 Feb · 18:00', color: 'red', status: 'Due in 2 days', tone: 'warning', owner: 'Odile Marchetti', excerpt: 'All features locked for copy-edit. Late pieces move to the web edition, not the print run.' },
          { id: 'selects', label: 'Photo selects review', meta: 'Wed 10 Feb · 11:00', color: 'indigo', status: 'Scheduled', tone: 'primary', owner: 'Léa Fontaine', excerpt: 'Forty minutes in the small room. Bring the contact sheets for the cover and the seed library story.' },
          { id: 'proofs', label: 'Proofs to the printer', meta: 'Fri 12 Feb · 16:00', color: 'orange', status: 'Scheduled', tone: 'primary', owner: 'Odile Marchetti', excerpt: 'Printer slot is fixed. Colour proofs come back Monday morning by courier.' }
        ]
      }
    ]
  },
  {
    id: 'people', label: 'Contributors', icon: 'people',
    groups: [
      {
        id: 'writers', label: 'Writers',
        items: [
          { id: 'rui', label: 'Rui Tavares', meta: '2 pieces in No. 14', color: 'green', status: 'On assignment', tone: 'success', owner: 'Rui Tavares', excerpt: 'Based in Barreiro. Covers rivers, ports and working lives. Invoices at the end of each issue.' },
          { id: 'hana', label: 'Hana Okafor', meta: '1 piece in No. 14', color: 'green', status: 'On assignment', tone: 'success', owner: 'Hana Okafor', excerpt: 'Food and agriculture. Prefers edits as tracked changes, not comments.' }
        ]
      },
      {
        id: 'photo', label: 'Photographers',
        items: [
          { id: 'lea', label: 'Léa Fontaine', meta: 'Cover shoot', color: 'pink', status: 'Booked', tone: 'primary', owner: 'Léa Fontaine', excerpt: 'Shoots on film for features, digital for news. Keeps her own archive; licences per use.' }
        ]
      }
    ]
  }
]

const area = ref('issues')
const selected = ref('ferrymen')
const panelOpen = ref(false)
const tucked = ref(false)
const folded = reactive<Record<string, boolean>>({ no13: true })

const areaIndex = computed(() => areas.findIndex(a => a.id === area.value))
const current = computed(() => areas[areaIndex.value] ?? areas[0]!)
const group = computed(() => current.value.groups.find(g => g.items.some(i => i.id === selected.value)) ?? current.value.groups[0]!)
const item = computed(() => group.value.items.find(i => i.id === selected.value) ?? group.value.items[0]!)

/** Picking the active area again from the rail tucks or restores the panel (wide screens). */
function pickArea(id: string, fromRail: boolean) {
  if (id === area.value && fromRail) { tucked.value = !tucked.value; return }
  area.value = id
  tucked.value = false
  const first = areas.find(a => a.id === id)?.groups[0]?.items[0]
  if (first) selected.value = first.id
}

function pickItem(id: string) {
  selected.value = id
  panelOpen.value = false
}
</script>

<template>
  <div class="dr">
    <div class="dr__shell" :class="{ 'is-tucked': tucked }" @keydown.esc="panelOpen = false">
      <!-- Rail: one button per app area; the brand pill slides between them with transform. -->
      <nav class="dr__rail" aria-label="Galley areas">
        <span class="dr__logo" aria-hidden="true">G</span>
        <div class="dr__rail-list" :style="{ '--i': areaIndex }">
          <span class="dr__rail-pill" aria-hidden="true" />
          <button
            v-for="a in areas" :key="a.id" type="button" class="dr__rail-btn" :class="{ 'is-active': a.id === area }"
            :aria-current="a.id === area ? 'true' : undefined" :aria-label="a.label" :title="a.id === area ? (tucked ? 'Show ' : 'Hide ') + a.label.toLowerCase() + ' panel' : a.label"
            @click="pickArea(a.id, true)"
          >
            <MiIcon :name="a.icon === 'inbox' ? 'tray' : a.icon" :size="20" />
            <i v-if="a.count" class="dr__rail-count">{{ a.count }}</i>
          </button>
        </div>
        <MiAvatar class="dr__rail-me" name="Odile Marchetti" size="sm" tone="auto" />
      </nav>

      <!-- Context panel: its tree follows the selected area. Off-canvas under 720px. -->
      <aside id="dr-panel" class="dr__panel" :class="{ 'is-open': panelOpen }" :aria-label="current.label">
        <header class="dr__panel-head">
          <div>
            <MiText variant="caption2" tone="label2" weight="semibold" class="dr__eyebrow">Northbound · Galley</MiText>
            <MiText variant="title3" as="h2" weight="bold">{{ current.label }}</MiText>
          </div>
          <MiIconButton :label="'New in ' + current.label.toLowerCase()" variant="tinted" size="small"><MiIcon name="plus" :size="14" /></MiIconButton>
        </header>
        <div class="dr__tree">
          <section v-for="g in current.groups" :key="g.id" class="dr__group">
            <button type="button" class="dr__group-head" :aria-expanded="!folded[g.id]" :aria-controls="'dr-g-' + g.id" @click="folded[g.id] = !folded[g.id]">
              <MiIcon name="chevron-right" :size="12" class="dr__chev" :class="{ 'is-open': !folded[g.id] }" />
              <span class="dr__group-label">{{ g.label }}</span>
              <span class="dr__group-count">{{ g.items.length }}</span>
            </button>
            <ul v-show="!folded[g.id]" :id="'dr-g-' + g.id" class="dr__items">
              <li v-for="it in g.items" :key="it.id">
                <button
                  type="button" class="dr__item" :class="{ 'is-active': it.id === selected }" :aria-current="it.id === selected ? 'page' : undefined"
                  @click="pickItem(it.id)"
                >
                  <span class="dr__status" :style="{ background: `var(--mi-${it.color})` }" aria-hidden="true" />
                  <span class="dr__item-text">
                    <span class="dr__item-label">{{ it.label }}</span>
                    <span class="dr__item-meta">{{ it.meta }}</span>
                  </span>
                </button>
              </li>
            </ul>
          </section>
        </div>
      </aside>
      <div class="dr__scrim" :class="{ 'is-on': panelOpen }" aria-hidden="true" @click="panelOpen = false" />

      <main class="dr__main" aria-labelledby="dr-doc-title">
        <header class="dr__bar">
          <MiIconButton class="dr__burger" :label="'Open ' + current.label.toLowerCase()" variant="gray" size="regular" aria-controls="dr-panel" :aria-expanded="panelOpen" @click="panelOpen = true">
            <MiIcon :svg="burger" :size="18" />
          </MiIconButton>
          <MiBreadcrumb :items="[{ label: current.label, href: '#' }, { label: group.label, href: '#' }, { label: item.label }]" class="dr__crumbs" />
        </header>
        <Transition name="dr-swap" mode="out-in">
          <article :key="item.id" class="dr__doc">
            <MiBadge :label="item.status" variant="tint" :tone="item.tone" dot />
            <MiText id="dr-doc-title" variant="title1" as="h3" weight="bold" balance>{{ item.label }}</MiText>
            <div class="dr__byline">
              <MiAvatar :name="item.owner" size="xs" tone="auto" decorative />
              <MiText variant="footnote" tone="label2">{{ item.owner }} · {{ item.meta }}</MiText>
            </div>
            <MiText variant="body" class="dr__lede">{{ item.excerpt }}</MiText>
            <div class="dr__lines" aria-hidden="true"><span v-for="n in 5" :key="n" :style="{ '--w': [0.96, 0.88, 0.92, 0.7, 0.4][n - 1] }" /></div>
          </article>
        </Transition>
      </main>

      <!-- Narrow screens: the rail becomes a bottom tab bar. -->
      <div class="dr__tabs">
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

<style scoped>
.dr { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.dr__shell { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; height: 640px; overflow: hidden; background: var(--mi-card); }

/* Rail (wide only) */
.dr__rail { display: none; }
.dr__logo { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 11px; color: var(--mi-p-on); font-weight: 800; font-size: 17px; letter-spacing: -.04em; background: linear-gradient(150deg, var(--mi-p), var(--mi-s)); }
.dr__rail-list { position: relative; display: grid; gap: 4px; }
.dr__rail-pill { position: absolute; left: 0; top: 0; width: 44px; height: 44px; border-radius: 13px; background: var(--mi-p-tint); transform: translateY(calc(var(--i) * 48px)); transition: transform var(--mi-dur-3) var(--mi-spring); }
.dr__rail-btn { position: relative; display: grid; place-items: center; width: 44px; height: 44px; border: 0; border-radius: 13px; background: none; color: var(--mi-label2); cursor: pointer; }
.dr__rail-btn:hover { color: var(--mi-label); }
.dr__rail-btn.is-active { color: var(--mi-p-text); }
.dr__rail-btn:focus-visible, .dr__item:focus-visible, .dr__group-head:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.dr__rail-count { position: absolute; top: 5px; right: 4px; min-width: 16px; height: 16px; padding: 0 4px; box-sizing: border-box; border-radius: 8px; background: var(--mi-red); color: var(--mi-p-on); font: 600 10px/16px var(--mi-font); font-style: normal; box-shadow: 0 0 0 2px var(--mi-side); }
.dr__rail-me { margin-top: auto; }

/* Context panel: off-canvas by default */
.dr__panel {
  position: absolute; inset: 0 auto 0 0; z-index: 3; width: min(300px, 86%); display: flex; flex-direction: column; box-sizing: border-box;
  background: var(--mi-side); box-shadow: var(--mi-sh3);
  transform: translateX(-104%); visibility: hidden; transition: transform var(--mi-dur-3) var(--mi-ease), visibility 0s linear var(--mi-dur-3);
}
.dr__panel.is-open { transform: none; visibility: visible; transition: transform var(--mi-dur-3) var(--mi-ease); }
.dr__scrim { position: absolute; inset: 0; z-index: 2; background: var(--mi-scrim); opacity: 0; pointer-events: none; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.dr__scrim.is-on { opacity: 1; pointer-events: auto; }
.dr__panel-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; padding: 20px 16px 12px; }
.dr__eyebrow { letter-spacing: .06em; text-transform: uppercase; }
.dr__tree { flex: 1; min-height: 0; overflow-y: auto; padding: 0 8px 16px; display: grid; align-content: start; gap: 10px; }
.dr__group-head { display: flex; align-items: center; gap: 6px; width: 100%; padding: 6px 8px; border: 0; border-radius: var(--mi-radius-s); background: none; color: var(--mi-label2); font: 600 12px/1.3 var(--mi-font); text-align: left; cursor: pointer; }
.dr__group-head:hover { color: var(--mi-label); }
.dr__chev { transition: transform var(--mi-dur-2) var(--mi-ease); }
.dr__chev.is-open { transform: rotate(90deg); }
.dr__group-label { flex: 1; min-width: 0; }
.dr__group-count { font-variant-numeric: tabular-nums; color: var(--mi-label3); }
.dr__items { display: grid; gap: 2px; margin: 2px 0 0; padding: 0 0 0 14px; list-style: none; border-left: 1px solid var(--mi-sep); margin-left: 14px; }
.dr__item { display: flex; align-items: flex-start; gap: 10px; width: 100%; padding: 8px 10px; border: 0; border-radius: 10px; background: none; color: var(--mi-label); font: inherit; text-align: left; cursor: pointer; }
.dr__item:hover { background: var(--mi-fill4); }
.dr__item.is-active { background: var(--mi-card); box-shadow: var(--mi-sh1); }
.dr__status { flex: none; width: 8px; height: 8px; margin-top: 6px; border-radius: 50%; }
.dr__item-text { display: grid; gap: 1px; min-width: 0; }
.dr__item-label { font-size: 14px; font-weight: 500; line-height: 1.3; }
.dr__item.is-active .dr__item-label { font-weight: 600; }
.dr__item-meta { font-size: 12px; color: var(--mi-label2); }

/* Main */
.dr__main { min-width: 0; min-height: 0; overflow-y: auto; padding: 14px 18px 24px; }
.dr__bar { display: flex; align-items: center; gap: 10px; min-width: 0; }
.dr__crumbs { min-width: 0; overflow: hidden; }
.dr__doc { display: grid; justify-items: start; gap: 12px; max-width: 640px; margin: 28px auto 0; }
.dr__byline { display: flex; align-items: center; gap: 8px; }
.dr__lede { font-size: 17px; line-height: 1.6; }
.dr__lines { display: grid; gap: 10px; width: 100%; margin-top: 6px; }
.dr__lines span { display: block; height: 9px; border-radius: 5px; background: var(--mi-fill4); transform-origin: left; transform: scaleX(var(--w)); }

.dr__tabs { border-top: 1px solid var(--mi-sep); }

.dr-swap-enter-active, .dr-swap-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.dr-swap-enter-from { opacity: 0; transform: translateY(8px); }
.dr-swap-leave-to { opacity: 0; }

@container (min-width: 720px) {
  .dr__shell { grid-template-columns: 68px 264px minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); }
  .dr__shell.is-tucked { grid-template-columns: 68px 0 minmax(0, 1fr); }
  .dr__rail { display: flex; flex-direction: column; align-items: center; gap: 22px; padding: 16px 0 14px; background: var(--mi-side); border-right: 1px solid var(--mi-sep); }
  .dr__panel { position: relative; inset: auto; width: auto; transform: none; visibility: visible; transition: opacity var(--mi-dur-2) var(--mi-ease); box-shadow: none; border-right: 1px solid var(--mi-sep); background: color-mix(in srgb, var(--mi-side) 55%, var(--mi-card)); }
  .is-tucked .dr__panel { opacity: 0; visibility: hidden; }
  .dr__burger, .dr__scrim, .dr__tabs { display: none; }
  .dr__main { padding: 18px 32px 32px; }
}
</style>

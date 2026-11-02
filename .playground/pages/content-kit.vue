<script setup lang="ts">
import { ref } from 'vue'
import MiTree from '../../app/components/Content/MiTree.vue'
import MiTimeline from '../../app/components/Content/MiTimeline.vue'
import MiTimelineItem from '../../app/components/Content/MiTimelineItem.vue'
import MiSortable from '../../app/components/Content/MiSortable.vue'
import MiMarquee from '../../app/components/Content/MiMarquee.vue'
import MiBlockquote from '../../app/components/Base/MiBlockquote.vue'
import MiAvatar from '../../app/components/Content/MiAvatar.vue'
import MiLogo from '../../app/components/Base/MiLogo.vue'
import MiButton from '../../app/components/Buttons/MiButton.vue'
import MiSiteHeader from '../../app/components/Navigation/MiSiteHeader.vue'
import MiScrollspy from '../../app/components/Navigation/MiScrollspy.vue'

const files = [
  { id: 'src', label: 'src', icon: 'folder' as const, children: [
    { id: 'components', label: 'components', icon: 'folder' as const, children: [
      { id: 'button', label: 'Button.vue', icon: 'document' as const },
      { id: 'card', label: 'Card.vue', icon: 'document' as const },
      { id: 'legacy', label: 'Legacy.vue', icon: 'document' as const, disabled: true }
    ] },
    { id: 'utils', label: 'utils', icon: 'folder' as const, children: [{ id: 'format', label: 'format.ts', icon: 'document' as const }] },
    { id: 'app', label: 'App.vue', icon: 'document' as const }
  ] },
  { id: 'public', label: 'public', icon: 'folder' as const, children: [{ id: 'logo', label: 'logo.svg', icon: 'image' as const }] },
  { id: 'readme', label: 'README.md', icon: 'document' as const }
]
const sel = ref<string | null>('button')
const exp = ref<string[]>(['src', 'components'])
const multiSel = ref<string[]>(['card'])
const checked = ref<string[]>(['button'])
const checkExp = ref<string[]>(['src', 'components'])

const events = [
  { title: 'Order placed', description: 'Payment confirmed for order #4821.', time: '2026-03-02', icon: 'check' as const, status: 'done' as const },
  { title: 'Packed', description: 'Packed at the Lyon warehouse.', time: '2026-03-03', icon: 'archive' as const, status: 'done' as const },
  { title: 'Out for delivery', description: 'The courier is on the way.', time: '2026-03-04', icon: 'arrow-right' as const, status: 'current' as const },
  { title: 'Delivery failed', description: 'Nobody was home.', time: '2026-03-04', icon: 'exclamation-circle' as const, tone: 'danger' as const },
  { title: 'Delivered', time: '2026-03-05', status: 'upcoming' as const, tone: 'success' as const }
]

const todo = ref([
  { id: 1, title: 'Write the brief', meta: 'Today' },
  { id: 2, title: 'Review the mockups', meta: 'Tomorrow' },
  { id: 3, title: 'Ship the release', meta: 'Friday' },
  { id: 4, title: 'Retrospective', meta: 'Next week' }
])
const todoH = ref([...todo.value])
const tiles = ref([{ id: 'a', t: 'Alpha' }, { id: 'b', t: 'Beta' }, { id: 'c', t: 'Gamma' }, { id: 'd', t: 'Delta' }])
const logos = ['Northwind', 'Lumen', 'Atlas', 'Foundry', 'Parallel', 'Meridian']

const links = [
  { label: 'Product', href: '#product', active: true },
  { label: 'Resources', children: [{ label: 'Docs', href: '#docs' }, { label: 'Guides', href: '#guides' }, { label: 'Changelog', href: '#changelog' }] },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' }
]
const headerOpen = ref(false)
const spy = ref<string | undefined>('pg-intro')
const spyItems = [
  { id: 'pg-intro', label: 'Introduction' }, { id: 'pg-install', label: 'Installation' },
  { id: 'pg-usage', label: 'Usage' }, { id: 'pg-props', label: 'Props', level: 2 }, { id: 'pg-slots', label: 'Slots', level: 2 }
]
</script>

<template>
  <div class="mi pg">
    <h1>Content kit</h1>

    <h2>Tree</h2>
    <div class="grid3">
      <section class="card"><p class="cap">Single selection</p><MiTree v-model:selected="sel" v-model:expanded="exp" :items="files" aria-label="Project files" /></section>
      <section class="card"><p class="cap">Multiple</p><MiTree v-model:selected="multiSel" v-model:expanded="exp" :items="files" multiple aria-label="Files (multiple)" /></section>
      <section class="card"><p class="cap">Checkable (leaves: {{ checked.length }})</p><MiTree v-model:selected="checked" v-model:expanded="checkExp" :items="files" checkable aria-label="Files (checkable)" /></section>
    </div>

    <h2>Timeline</h2>
    <div class="grid2">
      <section class="card"><p class="cap">Start (items)</p><MiTimeline :items="events" /></section>
      <section class="card">
        <p class="cap">Composed parts</p>
        <MiTimeline aria-label="Release notes">
          <MiTimelineItem title="v2.0 released" time="2026-02-01" icon="star" tone="info">Major release with a new theme engine.</MiTimelineItem>
          <MiTimelineItem title="Beta" description="Open beta for all teams." time="2026-01-10" tone="warning" />
          <MiTimelineItem title="Kickoff" time="2025-12-01" tone="neutral" />
        </MiTimeline>
      </section>
    </div>
    <section class="card"><p class="cap">Alternate (wide containers)</p><MiTimeline :items="events" align="alternate" /></section>

    <h2>Sortable</h2>
    <div class="grid2">
      <section class="card">
        <p class="cap">Whole row</p>
        <MiSortable v-model="todo" :item-label="i => i.title">
          <template #default="{ item, dragging }"><strong>{{ item.title }}</strong> <small>{{ item.meta }}{{ dragging ? ' (moving)' : '' }}</small></template>
        </MiSortable>
      </section>
      <section class="card">
        <p class="cap">With handle</p>
        <MiSortable v-model="todoH" handle :item-label="i => i.title">
          <template #default="{ item }"><strong>{{ item.title }}</strong> <small>{{ item.meta }}</small></template>
        </MiSortable>
      </section>
    </div>
    <section class="card">
      <p class="cap">Horizontal</p>
      <MiSortable v-model="tiles" orientation="horizontal" handle item-key="id">
        <template #default="{ item }"><span class="tile">{{ item.t }}</span></template>
      </MiSortable>
    </section>

    <h2>Marquee</h2>
    <section class="card">
      <MiMarquee aria-label="Trusted by"><span v-for="n in logos" :key="n" class="chip">{{ n }}</span></MiMarquee>
      <MiMarquee direction="right" :speed="70" :gap="16" :pause-on-hover="false" :fade="false"><span v-for="n in logos" :key="n" class="chip">{{ n }}</span></MiMarquee>
      <div class="grid3">
        <MiMarquee vertical direction="up"><span v-for="n in logos" :key="n" class="chip">{{ n }}</span></MiMarquee>
        <MiMarquee vertical direction="down" :speed="20"><span v-for="n in logos" :key="n" class="chip">{{ n }}</span></MiMarquee>
      </div>
    </section>

    <h2>Blockquote</h2>
    <div class="grid3">
      <MiBlockquote quote="The layer cut our UI work in half." cite="Maya Okafor" role="Head of Design" />
      <MiBlockquote variant="bordered" quote="Premium by default, quiet when it should be." cite="Jun Park">
        <template #avatar><MiAvatar name="Jun Park" tone="auto" /></template>
      </MiBlockquote>
      <MiBlockquote variant="card" quote="Dark mode and mobile just worked, on day one." cite="Ines Moreau" role="Engineer">
        <template #avatar><MiAvatar name="Ines Moreau" tone="auto" /></template>
      </MiBlockquote>
    </div>
    <MiBlockquote variant="bordered" size="lg" quote="Design is not just what it looks like. Design is how it works." cite="A large quote" />

    <h2>Site header</h2>
    <section class="card tall">
      <MiSiteHeader v-model:open="headerOpen" :links="links" sticky>
        <template #logo><MiLogo /></template>
        <template #actions><MiButton variant="plain">Sign in</MiButton><MiButton>Get started</MiButton></template>
      </MiSiteHeader>
      <div class="narrow">
        <MiSiteHeader :links="links">
          <template #logo><MiLogo /></template>
          <template #actions><MiButton>Get started</MiButton></template>
        </MiSiteHeader>
      </div>
    </section>

    <h2>Scrollspy</h2>
    <section class="card spy">
      <MiScrollspy v-model:active="spy" :items="spyItems" :offset="16" class="spy__nav" />
      <div>
        <article v-for="s in spyItems" :id="s.id" :key="s.id" class="sec"><h3>{{ s.label }}</h3><p>Scroll the page: the outline follows the section in view. Active: {{ spy }}</p></article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pg{padding:32px;display:flex;flex-direction:column;gap:20px;background:var(--mi-page);color:var(--mi-label);min-height:100vh;font-family:var(--mi-font)}
h1{margin:0;font-size:44px;letter-spacing:-.03em}
h2{margin:8px 0 0;font-size:22px;letter-spacing:-.02em}
.card{border-radius:18px;background:var(--mi-card);box-shadow:var(--mi-sh1);padding:18px;display:flex;flex-direction:column;gap:14px;min-width:0}
.cap{margin:0;font-size:12px;font-weight:600;color:var(--mi-label2)}
.grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
.grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.chip{padding:10px 20px;border-radius:999px;background:var(--mi-page);color:var(--mi-label);font-size:15px;font-weight:600;white-space:nowrap}
.tile{display:block;padding:8px 18px;font-weight:600}
.tall{min-height:340px}
.narrow{width:360px;max-width:100%;border-radius:12px;box-shadow:var(--mi-sh1)}
.spy{display:grid;grid-template-columns:180px minmax(0,1fr);align-items:start}
.spy__nav{position:sticky;top:16px}
.sec{min-height:260px}
.sec h3{margin:0 0 6px}
@media (max-width:900px){.grid2,.grid3{grid-template-columns:minmax(0,1fr)}.spy{grid-template-columns:minmax(0,1fr)}.spy__nav{position:static}}
</style>

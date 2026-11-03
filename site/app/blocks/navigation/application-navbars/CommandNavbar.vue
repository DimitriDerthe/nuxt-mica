<template>
  <div class="mi:@container mi:relative mi:grid mi:grid-rows-[auto_auto_1fr] mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]" @keydown.esc="palette = false">
    <header class="mi:flex mi:items-center mi:gap-2.5 mi:min-h-15 mi:py-2 mi:px-3 mi:[background:var(--mi-card)] mi:shadow-[inset_0_-1px_0_var(--mi-sep)] mi:@[860px]:gap-4.5 mi:@[860px]:py-2 mi:@[860px]:px-5">
      <a href="#" class="mi:flex mi:items-center mi:gap-2 mi:flex-[none] mi:text-inherit mi:[text-decoration:none] mi:rounded-[9px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" aria-label="Fieldnote home" @click.prevent="go('studies')">
        <span class="mi:grid mi:place-items-center mi:w-7.5 mi:h-7.5 mi:rounded-[9px] mi:font-extrabold mi:text-[17px] mi:text-p-on mi:[background:linear-gradient(135deg,_var(--mi-p),_var(--mi-s))]" aria-hidden="true">f</span>
        <MiText as="span" variant="subheadline" weight="bold" class="mi:hidden! mi:@[600px]:inline!">Fieldnote</MiText>
      </a>

      <nav class="mi:hidden mi:gap-0.5 mi:@[860px]:flex" aria-label="Primary">
        <a
          v-for="l in links" :key="l.id" href="#" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:py-[7px] mi:px-[11px] mi:rounded-[8px] mi:text-[14px] mi:font-medium mi:[text-decoration:none]" :class="l.id === page ? 'mi:text-label mi:bg-fill3' : 'mi:text-label2 mi:hover:text-label mi:hover:bg-fill4'" :aria-current="l.id === page ? 'page' : undefined"
          @click.prevent="go(l.id)"
        >{{ l.label }}</a>
      </nav>

      <!-- The search field is a button: it opens the command palette instead of filtering in place. -->
      <button
        type="button" class="mi:[font:inherit] mi:text-[14px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:flex mi:items-center mi:gap-2 mi:flex-1 mi:min-w-0 mi:h-9 mi:py-0 mi:px-2.5 mi:[border:0] mi:rounded-[10px] mi:text-label3 mi:[background:var(--mi-fill4)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:cursor-pointer mi:aria-expanded:shadow-[inset_0_0_0_2px_var(--mi-p)] mi:@[860px]:flex-[0_1_300px] mi:@[860px]:ms-auto" aria-haspopup="dialog" :aria-expanded="palette" aria-controls="cn-palette"
        @click="palette = !palette"
      >
        <MiIcon name="search" :size="16" />
        <span class="mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:text-start mi:whitespace-nowrap mi:text-ellipsis">Search or jump to…</span>
        <MiKbdGroup class="mi:hidden! mi:@[600px]:inline-flex!"><MiKbd>⌘</MiKbd><MiKbd>K</MiKbd></MiKbdGroup>
      </button>

      <div class="mi:flex mi:items-center mi:gap-2 mi:flex-[none]">
        <MiBadge :count="unread" count-noun="unread notifications" placement="top-right" :offset="2">
          <template #target>
            <MiIconButton label="Notifications" variant="plain" size="regular" @click="unread = 0">
              <MiIcon name="bell" :size="18" />
            </MiIconButton>
          </template>
        </MiBadge>
        <MiAvatar name="Ines Moreau" size="sm" tone="auto" />
      </div>
    </header>

    <!-- Narrow widths: the same links as a scrolling strip under the bar. -->
    <nav class="mi:flex mi:gap-1.5 mi:py-2 mi:px-3 mi:overflow-x-auto mi:[scrollbar-width:none] mi:[background:var(--mi-card)] mi:shadow-[inset_0_-1px_0_var(--mi-sep)] mi:@[860px]:hidden" aria-label="Primary (compact)">
      <a
        v-for="l in links" :key="l.id" href="#" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:flex-[none] mi:py-[5px] mi:px-3 mi:rounded-[999px] mi:text-[13px] mi:font-medium mi:text-label2 mi:[text-decoration:none] mi:[background:var(--mi-fill4)] mi:[&[aria-current='page']]:text-p-on mi:[&[aria-current='page']]:[background:var(--mi-p)]" :aria-current="l.id === page ? 'page' : undefined"
        @click.prevent="go(l.id)"
      >{{ l.label }}</a>
    </nav>

    <main class="mi:grid mi:content-start mi:gap-1.5 mi:py-7 mi:px-4 mi:@[860px]:py-9 mi:@[860px]:px-8" aria-labelledby="cn-title">
      <MiText id="cn-title" variant="title2" as="h2" weight="bold">{{ current.label }}</MiText>
      <MiText variant="callout" tone="label2">{{ current.blurb }}</MiText>
      <p class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" aria-live="polite">{{ announce }}</p>
      <div class="mi:grid mi:gap-2.5 mi:mt-4.5 mi:@[860px]:grid-cols-3" aria-hidden="true"><span class="mi:h-13 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:odd:opacity-70 mi:@[860px]:h-30" v-for="n in 6" :key="n" /></div>
    </main>

    <!-- Palette shown open in place over a faux backdrop; the find button toggles it. -->
    <div v-if="palette" class="mi:absolute mi:top-15 mi:right-0 mi:bottom-0 mi:left-0 mi:z-2 mi:grid mi:justify-items-center mi:content-start mi:py-4 mi:px-3 mi:[background:var(--mi-scrim)]" @click.self="palette = false">
      <div id="cn-palette" class="mi:[--mi-in-y:-6px] mi:[--mi-in-s:.98] mi:animate-[in_var(--mi-dur-3)_var(--mi-spring)] mi:motion-reduce:animate-none mi:grid mi:w-full mi:max-w-140 mi:rounded-xl mi:overflow-hidden mi:[background:var(--mi-elev)] mi:shadow-3" role="dialog" aria-label="Command menu">
        <MiCommand v-model:query="query" :items="commands" placeholder="Search studies, people or actions" @select="run" />
        <div class="mi:flex mi:items-center mi:justify-between mi:gap-2 mi:py-2 mi:px-3 mi:shadow-[inset_0_1px_0_var(--mi-sep)]">
          <MiText as="span" variant="caption2" tone="label3"><MiKbd>↑</MiKbd> <MiKbd>↓</MiKbd> to move · <MiKbd>↵</MiKbd> to open</MiText>
          <MiButton variant="plain" size="mini" @click="palette = false">Close</MiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type PageId = 'studies' | 'insights' | 'participants' | 'recordings'
interface NavLink { id: PageId, label: string, blurb: string }
interface Command { value: string, label: string, group: string, shortcut?: string, keywords?: string[] }

const links: NavLink[] = [
  { id: 'studies', label: 'Studies', blurb: '12 active studies across onboarding, billing and the mobile app.' },
  { id: 'insights', label: 'Insights', blurb: '48 tagged insights, 9 waiting for review this week.' },
  { id: 'participants', label: 'Participants', blurb: '326 people in the panel, 41 available for sessions in November.' },
  { id: 'recordings', label: 'Recordings', blurb: '87 hours of interviews, transcribed and searchable.' }
]

const commands: Command[] = [
  { value: 'go:studies', label: 'Go to Studies', group: 'Navigate', shortcut: 'G S' },
  { value: 'go:insights', label: 'Go to Insights', group: 'Navigate', shortcut: 'G I' },
  { value: 'go:participants', label: 'Go to Participants', group: 'Navigate', shortcut: 'G P' },
  { value: 'go:recordings', label: 'Go to Recordings', group: 'Navigate', shortcut: 'G R' },
  { value: 'study:checkout', label: 'Checkout friction, round 3', group: 'Recent studies', keywords: ['payments', 'billing'] },
  { value: 'study:widgets', label: 'Home screen widgets diary study', group: 'Recent studies', keywords: ['mobile', 'ios'] },
  { value: 'new:study', label: 'New study', group: 'Actions', shortcut: 'N' },
  { value: 'new:invite', label: 'Invite participants', group: 'Actions' },
  { value: 'new:tag', label: 'Tag an insight', group: 'Actions', shortcut: 'T' }
]

const page = ref<PageId>('studies')
const palette = ref(true)
const query = ref('')
const unread = ref(3)
const announce = ref('')

const current = computed(() => links.find(l => l.id === page.value) ?? links[0]!)

function go(id: PageId) {
  page.value = id
  announce.value = ''
}

function isPage(v: string): v is PageId { return links.some(l => l.id === v) }

function run(item: { value: string, label: string }) {
  const [kind, target] = item.value.split(':')
  if (kind === 'go' && target && isPage(target)) go(target)
  else announce.value = `${item.label}: opened`
  palette.value = false
  query.value = ''
}
</script>

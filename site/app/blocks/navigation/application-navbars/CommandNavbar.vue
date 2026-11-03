<template>
  <div class="cn" @keydown.esc="palette = false">
    <header class="cn__bar">
      <a href="#" class="cn__brand" aria-label="Fieldnote home" @click.prevent="go('studies')">
        <span class="cn__mark" aria-hidden="true">f</span>
        <MiText as="span" variant="subheadline" weight="bold" class="cn__name">Fieldnote</MiText>
      </a>

      <nav class="cn__links" aria-label="Primary">
        <a
          v-for="l in links" :key="l.id" href="#" class="cn__link" :aria-current="l.id === page ? 'page' : undefined"
          @click.prevent="go(l.id)"
        >{{ l.label }}</a>
      </nav>

      <!-- The search field is a button: it opens the command palette instead of filtering in place. -->
      <button
        type="button" class="cn__find" aria-haspopup="dialog" :aria-expanded="palette" aria-controls="cn-palette"
        @click="palette = !palette"
      >
        <MiIcon name="search" :size="16" />
        <span class="cn__find-text">Search or jump to…</span>
        <MiKbdGroup class="cn__find-kbd"><MiKbd>⌘</MiKbd><MiKbd>K</MiKbd></MiKbdGroup>
      </button>

      <div class="cn__end">
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
    <nav class="cn__strip" aria-label="Primary (compact)">
      <a
        v-for="l in links" :key="l.id" href="#" class="cn__chip" :aria-current="l.id === page ? 'page' : undefined"
        @click.prevent="go(l.id)"
      >{{ l.label }}</a>
    </nav>

    <main class="cn__page" aria-labelledby="cn-title">
      <MiText id="cn-title" variant="title2" as="h2" weight="bold">{{ current.label }}</MiText>
      <MiText variant="callout" tone="label2">{{ current.blurb }}</MiText>
      <p class="cn__sr" aria-live="polite">{{ announce }}</p>
      <div class="cn__ghosts" aria-hidden="true"><span v-for="n in 6" :key="n" /></div>
    </main>

    <!-- Palette shown open in place over a faux backdrop; the find button toggles it. -->
    <div v-if="palette" class="cn__scrim" @click.self="palette = false">
      <div id="cn-palette" class="cn__palette" role="dialog" aria-label="Command menu">
        <MiCommand v-model:query="query" :items="commands" placeholder="Search studies, people or actions" @select="run" />
        <div class="cn__palette-foot">
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

<style scoped>
.cn { container-type: inline-size; position: relative; display: grid; grid-template-rows: auto auto 1fr; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }

.cn__bar { display: flex; align-items: center; gap: 10px; min-height: 60px; padding: 8px 12px; background: var(--mi-card); box-shadow: inset 0 -1px 0 var(--mi-sep); }
.cn__brand { display: flex; align-items: center; gap: 8px; flex: none; color: inherit; text-decoration: none; border-radius: 9px; }
.cn__brand:focus-visible, .cn__link:focus-visible, .cn__chip:focus-visible, .cn__find:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.cn__mark { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px; font-weight: 800; font-size: 17px; color: var(--mi-p-on); background: linear-gradient(135deg, var(--mi-p), var(--mi-s)); }
.cn__name { display: none; }

.cn__links { display: none; gap: 2px; }
.cn__link { padding: 7px 11px; border-radius: 8px; font-size: 14px; font-weight: 500; color: var(--mi-label2); text-decoration: none; }
.cn__link:hover { color: var(--mi-label); background: var(--mi-fill4); }
.cn__link[aria-current="page"] { color: var(--mi-label); background: var(--mi-fill3); }

.cn__find {
  display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; height: 36px; padding: 0 10px; border: 0; border-radius: 10px;
  font: inherit; font-size: 14px; color: var(--mi-label3); background: var(--mi-fill4); box-shadow: inset 0 0 0 1px var(--mi-sep); cursor: pointer;
}
.cn__find[aria-expanded="true"] { box-shadow: inset 0 0 0 2px var(--mi-p); }
.cn__find-text { flex: 1; min-width: 0; overflow: hidden; text-align: start; white-space: nowrap; text-overflow: ellipsis; }
.cn__find-kbd { display: none; }
.cn__end { display: flex; align-items: center; gap: 8px; flex: none; }

.cn__strip { display: flex; gap: 6px; padding: 8px 12px; overflow-x: auto; scrollbar-width: none; background: var(--mi-card); box-shadow: inset 0 -1px 0 var(--mi-sep); }
.cn__chip { flex: none; padding: 5px 12px; border-radius: 999px; font-size: 13px; font-weight: 500; color: var(--mi-label2); text-decoration: none; background: var(--mi-fill4); }
.cn__chip[aria-current="page"] { color: var(--mi-p-on); background: var(--mi-p); }

.cn__page { display: grid; align-content: start; gap: 6px; padding: 28px 16px; }
.cn__ghosts { display: grid; gap: 10px; margin-top: 18px; }
.cn__ghosts span { height: 52px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.cn__ghosts span:nth-child(odd) { opacity: .7; }
.cn__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.cn__scrim { position: absolute; inset: 60px 0 0; z-index: 2; display: grid; justify-items: center; align-content: start; padding: 16px 12px; background: var(--mi-scrim); }
.cn__palette { display: grid; width: 100%; max-width: 560px; border-radius: var(--mi-radius-xl); overflow: hidden; background: var(--mi-elev); box-shadow: var(--mi-sh3); animation: cn-in var(--mi-dur-3) var(--mi-spring); }
.cn__palette-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 12px; box-shadow: inset 0 1px 0 var(--mi-sep); }
@keyframes cn-in { from { opacity: 0; transform: translateY(-6px) scale(.98); } }
@media (prefers-reduced-motion: reduce) { .cn__palette { animation: none; } }

@container (min-width: 600px) {
  .cn__name { display: inline; }
  .cn__find-kbd { display: inline-flex; }
}
@container (min-width: 860px) {
  .cn__bar { gap: 18px; padding: 8px 20px; }
  .cn__links { display: flex; }
  .cn__strip { display: none; }
  .cn__find { flex: 0 1 300px; margin-inline-start: auto; }
  .cn__page { padding: 36px 32px; }
  .cn__ghosts { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .cn__ghosts span { height: 120px; }
}
</style>

<template>
  <div class="wsm-cq">
    <section class="wsm" aria-labelledby="wsm-title" :style="{ '--wsm-hue': `var(--mi-${current.tile})` }">
      <header class="wsm__bar">
        <MiText id="wsm-title" variant="headline" as="h2" class="wsm__sr">Workspace and account menus</MiText>
        <!-- Wrappers own the grid placement: an inline MiPopover renders its trigger and panel as two siblings. -->
        <div class="wsm__pop">
          <MiPopover v-model="open" inline trigger="manual" :width="280" :arrow-offset="26" label="Switch workspace">
            <template #trigger="{ attrs, toggle }">
              <button v-bind="attrs" type="button" class="wsm__trigger" @click="toggle">
                <span class="wsm__mark">{{ initials(current.name) }}</span>
                <span class="wsm__trigger-text">
                  <span class="wsm__trigger-name">{{ current.name }}</span>
                  <span class="wsm__trigger-plan">{{ current.plan }} plan</span>
                </span>
                <MiIcon name="chevron-up-down" :size="16" class="wsm__chev" />
              </button>
            </template>

            <div class="wsm__panel">
              <div class="wsm__panel-head">
                <MiText variant="caption" tone="label2" weight="semibold">Workspaces</MiText>
                <MiKbdGroup><MiKbd>⌘</MiKbd><MiKbd>O</MiKbd></MiKbdGroup>
              </div>
              <MiList :grouped="false" label="Workspaces">
                <MiListItem
                  v-for="w in workspaces" :key="w.id" button :tile="w.tile" :title="w.name"
                  :subtitle="`${w.plan} · ${w.members === 1 ? 'Just you' : w.members + ' members'}`"
                  :aria-current="w.id === currentId ? 'true' : undefined" @click="pick(w.id)"
                >
                  <template #leading><span class="wsm__tile-text">{{ initials(w.name) }}</span></template>
                  <template #trailing>
                    <MiIcon v-if="w.id === currentId" name="check" :size="16" class="wsm__check" />
                    <MiBadge v-else-if="w.unread" :count="w.unread" tone="primary" count-noun="unread updates" />
                  </template>
                </MiListItem>
              </MiList>
              <MiSeparator />
              <MiList :grouped="false" label="Workspace actions">
                <MiListItem button title="Create workspace" @click="note = 'New workspace draft opened.'">
                  <template #leading><MiIcon name="plus" :size="18" /></template>
                </MiListItem>
                <MiListItem button title="Join with an invite code" @click="note = 'Paste an invite code to join a workspace.'">
                  <template #leading><MiIcon name="people" :size="18" /></template>
                </MiListItem>
              </MiList>
            </div>
          </MiPopover>
        </div>

        <div class="wsm__account">
          <MiMenu :items="accountItems" aria-label="Account" placement="bottom-end" @select="onAccount">
            <template #trigger="{ props: tp }">
              <button v-bind="tp" type="button" class="wsm__me" aria-label="Account menu, Noor Farah">
                <MiAvatar name="Noor Farah" size="sm" tone="secondary" decorative />
                <MiIcon name="chevron-down" :size="14" />
              </button>
            </template>
          </MiMenu>
        </div>
      </header>

      <!-- The workspace you land in: its hue, seats and team follow the switcher. -->
      <article class="wsm__space" aria-live="polite">
        <div class="wsm__space-top">
          <div>
            <MiText variant="caption" tone="label2" weight="medium">Current workspace</MiText>
            <p class="wsm__space-name">{{ current.name }}</p>
          </div>
          <MiBadge :label="current.plan" variant="outline" />
        </div>
        <div class="wsm__seats">
          <div class="wsm__seats-row">
            <MiText variant="footnote" weight="medium">Seats</MiText>
            <MiText variant="footnote" tone="label2" tabular>{{ current.members }} of {{ current.seats }} used</MiText>
          </div>
          <div class="wsm__meter" role="meter" aria-label="Seats used" :aria-valuenow="current.members" aria-valuemin="0" :aria-valuemax="current.seats">
            <span :style="{ transform: `scaleX(${current.members / current.seats})` }" />
          </div>
        </div>
        <div class="wsm__team">
          <MiAvatarGroup :items="current.team" :max="4" size="sm" />
          <MiText variant="footnote" tone="label2">{{ current.activity }}</MiText>
        </div>
        <MiText variant="caption" tone="label3">{{ note }}</MiText>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Tile = 'indigo' | 'teal' | 'orange' | 'pink'
interface Workspace { id: string, name: string, plan: string, members: number, seats: number, unread: number, tile: Tile, team: { name: string, tone: 'auto' }[], activity: string }

const team = (...names: string[]) => names.map(name => ({ name, tone: 'auto' as const }))
const workspaces: Workspace[] = [
  { id: 'hollowtide', name: 'Hollowtide Studio', plan: 'Business', members: 38, seats: 50, unread: 0, tile: 'indigo', team: team('Noor Farah', 'Ruben Castell', 'Aiko Tanaka', 'Lior Ben-Ami', 'Grace Okafor'), activity: '12 people active today' },
  { id: 'fieldnote', name: 'Fieldnote Press', plan: 'Pro', members: 9, seats: 10, unread: 3, tile: 'teal', team: team('Noor Farah', 'Hugo Marchetti', 'Selma Nyberg'), activity: 'Issue #48 goes to print Friday' },
  { id: 'kiln', name: 'Kiln & Co. Ceramics', plan: 'Free', members: 2, seats: 3, unread: 12, tile: 'orange', team: team('Noor Farah', 'Pia Brandt'), activity: '12 orders waiting for a glaze note' },
  { id: 'personal', name: 'Personal', plan: 'Free', members: 1, seats: 1, unread: 0, tile: 'pink', team: team('Noor Farah'), activity: 'Only you can see this space' }
]

const open = ref(true)
const currentId = ref('hollowtide')
const current = computed(() => workspaces.find(w => w.id === currentId.value)!)
const note = ref('Signed in as noor.f@hollowtide.studio')

const initials = (name: string) => name.split(/\s+/).filter(p => /^[A-Za-z]/.test(p)).slice(0, 2).map(p => p[0]).join('')

function pick(id: string) {
  const w = workspaces.find(x => x.id === id)
  if (!w) return
  currentId.value = id
  w.unread = 0
  note.value = `Switched to ${w.name}.`
}

const accountItems = [
  { heading: 'noor.f@hollowtide.studio' },
  { value: 'profile', label: 'Profile', shortcut: '⇧⌘P' },
  { value: 'prefs', label: 'Preferences', shortcut: '⌘,' },
  { value: 'shortcuts', label: 'Keyboard shortcuts', shortcut: '⌘/' },
  { separator: true },
  { value: 'signout', label: 'Sign out', destructive: true }
]
function onAccount(item: { value?: string | number, label?: string }) {
  note.value = item.value === 'signout' ? 'Signing out of every workspace…' : `${item.label} opened.`
}
</script>

<style scoped>
.wsm-cq { container-type: inline-size; }
.wsm { position: relative; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.wsm__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.wsm__bar { display: grid; gap: 10px; }
.wsm__pop { display: grid; justify-items: start; min-width: 0; }
/* Narrow: the account menu takes its own row above, so the open switcher never collides with it. */
.wsm__account { order: -1; display: flex; justify-content: flex-end; }

.wsm__trigger { display: flex; align-items: center; gap: 10px; min-width: 0; max-width: 280px; padding: 6px 10px 6px 6px; border: 0; border-radius: var(--mi-radius-m); background: var(--mi-card); box-shadow: var(--mi-sh1); color: inherit; font: inherit; text-align: start; cursor: pointer; }
.wsm__trigger:focus-visible, .wsm__me:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.wsm__mark { display: grid; place-items: center; flex: none; width: 32px; height: 32px; border-radius: 9px; background: var(--wsm-hue); color: var(--mi-p-on); font-size: 13px; font-weight: 700; letter-spacing: -.02em; }
.wsm__trigger-text { display: grid; min-width: 0; }
.wsm__trigger-name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wsm__trigger-plan { font-size: 12px; color: var(--mi-label2); }
.wsm__chev { flex: none; color: var(--mi-label3); }

.wsm__panel { display: grid; gap: 6px; margin: -6px -8px; }
.wsm__panel-head { display: flex; align-items: center; justify-content: space-between; padding: 0 8px; }
.wsm__tile-text { font-size: 12px; font-weight: 700; color: var(--mi-p-on); }
.wsm__check { color: var(--mi-p-text); }

.wsm__me { display: flex; align-items: center; gap: 4px; padding: 3px 6px 3px 3px; border: 0; border-radius: 999px; background: var(--mi-fill3); color: var(--mi-label2); cursor: pointer; }

/* Workspace card: its hue washes in from the corner, a static gradient only. */
.wsm__space { position: relative; display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; isolation: isolate; }
.wsm__space::before { content: ""; position: absolute; inset: -50% -20% auto auto; width: 70%; aspect-ratio: 1; z-index: -1; border-radius: 50%; background: radial-gradient(closest-side, color-mix(in srgb, var(--wsm-hue) 22%, transparent), transparent); }
.wsm__space-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.wsm__space-name { margin: 2px 0 0; font-size: clamp(22px, 5cqi, 30px); font-weight: 700; letter-spacing: -.03em; line-height: 1.1; }
.wsm__seats { display: grid; gap: 8px; }
.wsm__seats-row { display: flex; justify-content: space-between; gap: 8px; }
.wsm__meter { height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.wsm__meter span { display: block; height: 100%; border-radius: inherit; background: var(--wsm-hue); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.wsm__team { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }

/* Wide: the open switcher keeps its own column and the workspace card sits beside it. */
@container (min-width: 720px) {
  .wsm { grid-template-columns: 300px minmax(0, 1fr); grid-template-rows: auto 1fr; align-items: start; column-gap: 24px; }
  .wsm__bar { display: contents; }
  .wsm__pop { grid-column: 1; grid-row: 1 / span 2; }
  .wsm__account { order: 0; grid-column: 2; grid-row: 1; }
  .wsm__space { grid-column: 2; grid-row: 2; }
}
</style>

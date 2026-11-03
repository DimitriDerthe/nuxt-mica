<template>
  <div class="mi:@container">
    <section class="mi:relative mi:grid mi:gap-4 mi:font-mi mi:text-label mi:@[720px]:grid-cols-[300px_minmax(0,_1fr)] mi:@[720px]:grid-rows-[auto_1fr] mi:@[720px]:items-start mi:@[720px]:gap-x-6" aria-labelledby="wsm-title" :style="{ '--wsm-hue': `var(--mi-${current.tile})` }">
      <header class="mi:grid mi:gap-2.5 mi:@[720px]:contents">
        <MiText id="wsm-title" variant="headline" as="h2" class="mi:absolute mi:w-px mi:h-px mi:[clip-path:inset(50%)] mi:overflow-hidden mi:whitespace-nowrap">Workspace and account menus</MiText>
        <!-- Wrappers own the grid placement: an inline MiPopover renders its trigger and panel as two siblings. -->
        <div class="mi:grid mi:justify-items-start mi:min-w-0 mi:@[720px]:col-[1] mi:@[720px]:row-[1_/_span_2]">
          <MiPopover v-model="open" inline trigger="manual" :width="280" :arrow-offset="26" label="Switch workspace">
            <template #trigger="{ attrs, toggle }">
              <button v-bind="attrs" type="button" class="mi:flex mi:items-center mi:gap-2.5 mi:min-w-0 mi:max-w-70 mi:pt-1.5 mi:pr-2.5 mi:pb-1.5 mi:pl-1.5 mi:[border:0] mi:rounded-md mi:[background:var(--mi-card)] mi:shadow-1 mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="toggle">
                <span class="mi:grid mi:place-items-center mi:flex-[none] mi:w-8 mi:h-8 mi:rounded-[9px] mi:[background:var(--wsm-hue)] mi:text-p-on mi:text-[13px] mi:font-bold mi:tracking-[-.02em]">{{ initials(current.name) }}</span>
                <span class="mi:grid mi:min-w-0">
                  <span class="mi:text-[14px] mi:font-semibold mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ current.name }}</span>
                  <span class="mi:text-[12px] mi:text-label2">{{ current.plan }} plan</span>
                </span>
                <MiIcon name="chevron-up-down" :size="16" class="mi:text-label3 mi:flex-none" />
              </button>
            </template>

            <div class="mi:grid mi:gap-1.5 mi:-my-1.5 mi:-mx-2">
              <div class="mi:flex mi:items-center mi:justify-between mi:py-0 mi:px-2">
                <MiText variant="caption" tone="label2" weight="semibold">Workspaces</MiText>
                <MiKbdGroup><MiKbd>⌘</MiKbd><MiKbd>O</MiKbd></MiKbdGroup>
              </div>
              <MiList :grouped="false" label="Workspaces">
                <MiListItem
                  v-for="w in workspaces" :key="w.id" button :tile="w.tile" :title="w.name"
                  :subtitle="`${w.plan} · ${w.members === 1 ? 'Just you' : w.members + ' members'}`"
                  :aria-current="w.id === currentId ? 'true' : undefined" @click="pick(w.id)"
                >
                  <template #leading><span class="mi:text-[12px] mi:font-bold mi:text-p-on">{{ initials(w.name) }}</span></template>
                  <template #trailing>
                    <MiIcon v-if="w.id === currentId" name="check" :size="16" class="mi:text-p-text" />
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

        <div class="mi:-order-1 mi:flex mi:[justify-content:flex-end] mi:@[720px]:order-0 mi:@[720px]:col-[2] mi:@[720px]:row-[1]">
          <MiMenu :items="accountItems" aria-label="Account" placement="bottom-end" @select="onAccount">
            <template #trigger="{ props: tp }">
              <button v-bind="tp" type="button" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:flex mi:items-center mi:gap-1 mi:pt-[3px] mi:pr-1.5 mi:pb-[3px] mi:pl-[3px] mi:[border:0] mi:rounded-[999px] mi:[background:var(--mi-fill3)] mi:text-label2 mi:cursor-pointer" aria-label="Account menu, Noor Farah">
                <MiAvatar name="Noor Farah" size="sm" tone="secondary" decorative />
                <MiIcon name="chevron-down" :size="14" />
              </button>
            </template>
          </MiMenu>
        </div>
      </header>

      <!-- The workspace you land in: its hue, seats and team follow the switcher. -->
      <article class="mi:relative mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:overflow-hidden mi:isolate mi:before:content-[''] mi:before:absolute mi:before:top-[-50%] mi:before:right-[-20%] mi:before:bottom-auto mi:before:left-auto mi:before:w-[70%] mi:before:aspect-[1] mi:before:-z-1 mi:before:rounded-[50%] mi:before:[background:radial-gradient(closest-side,_color-mix(in_srgb,_var(--wsm-hue)_22%,_transparent),_transparent)] mi:@[720px]:col-[2] mi:@[720px]:row-[2]" aria-live="polite">
        <div class="mi:flex mi:[align-items:flex-start] mi:justify-between mi:gap-3">
          <div>
            <MiText variant="caption" tone="label2" weight="medium">Current workspace</MiText>
            <p class="mi:mt-0.5 mi:mx-0 mi:mb-0 mi:text-[clamp(22px,_5cqi,_30px)] mi:font-bold mi:tracking-[-.03em] mi:leading-[1.1]">{{ current.name }}</p>
          </div>
          <MiBadge :label="current.plan" variant="outline" />
        </div>
        <div class="mi:grid mi:gap-2">
          <div class="mi:flex mi:justify-between mi:gap-2">
            <MiText variant="footnote" weight="medium">Seats</MiText>
            <MiText variant="footnote" tone="label2" tabular>{{ current.members }} of {{ current.seats }} used</MiText>
          </div>
          <div class="mi:h-1.5 mi:rounded-[3px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" aria-label="Seats used" :aria-valuenow="current.members" aria-valuemin="0" :aria-valuemax="current.seats">
            <span class="mi:block mi:h-full mi:rounded-[inherit] mi:[background:var(--wsm-hue)] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${current.members / current.seats})` }" />
          </div>
        </div>
        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-3">
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

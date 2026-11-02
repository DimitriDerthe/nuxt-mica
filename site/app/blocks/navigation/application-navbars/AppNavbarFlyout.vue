<template>
  <div class="an">
    <header class="an__header">
      <div class="an__bar">
        <a href="#" class="an__brand" aria-label="Tidewater home" @click.prevent>
          <span class="an__mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 15c3-3 6 3 9 0s6 3 9 0" /><path d="M3 10c3-3 6 3 9 0s6 3 9 0" /></svg></span>
          <span class="an__word">Tidewater</span>
        </a>

        <!-- Context capsule: where the team is in its cycle, always one glance away. -->
        <span class="an__cycle" title="Cycle 14 runs Mar 3 to Mar 16">
          <MiProgressRing :value="71" :size="16" :stroke="2.5" label="Cycle 14 progress" />
          <span class="an__cycle-name">Cycle 14</span>
          <span class="an__cycle-left">3 days left</span>
        </span>

        <MiNavigationMenu v-model="openItem" class="an__nav" :items="items" aria-label="Main" />

        <div class="an__tools">
          <button type="button" class="an__find" aria-label="Search or run a command" aria-keyshortcuts="Meta+K">
            <MiIcon name="search" :size="16" />
            <span class="an__find-text">Find anything</span>
            <MiKbdGroup class="an__find-kbd"><MiKbd>⌘</MiKbd><MiKbd>K</MiKbd></MiKbdGroup>
          </button>

          <MiMenu :items="createItems" aria-label="Create" placement="bottom-end">
            <template #trigger="{ props }">
              <MiIconButton v-bind="props" size="toolbar" variant="tinted" label="Create new"><MiIcon name="plus" /></MiIconButton>
            </template>
          </MiMenu>

          <MiBadge dot-only :dot-size="9" tone="danger" placement="top-right" :offset="-1" aria-label="New notifications">
            <template #target>
              <MiIconButton size="toolbar" variant="plain" label="Notifications"><MiIcon name="bell" /></MiIconButton>
            </template>
          </MiBadge>

          <MiMenu :items="accountItems" aria-label="Account" placement="bottom-end">
            <template #trigger="{ props }">
              <button v-bind="props" type="button" class="an__me" aria-label="Account menu for Noor Haddad">
                <MiAvatar name="Noor Haddad" size="sm" tone="auto" decorative />
              </button>
            </template>
          </MiMenu>

          <MiIconButton class="an__burger" size="toolbar" variant="plain" :label="sheet ? 'Close menu' : 'Open menu'" aria-controls="an-sheet" :aria-expanded="sheet" @click="sheet = !sheet">
            <MiIcon :svg="sheet ? icons.close : icons.burger" />
          </MiIconButton>
        </div>
      </div>

      <!-- Narrow widths: the same entries as an inline sheet under the bar. -->
      <nav v-show="sheet" id="an-sheet" class="an__sheet" aria-label="Main">
        <template v-for="it in items" :key="it.id">
          <a v-if="!it.links" href="#" class="an__sheet-link" :aria-current="it.id === 'inbox' ? 'page' : undefined" @click.prevent="sheet = false">{{ it.label }}</a>
          <div v-else class="an__sheet-group">
            <MiText as="span" variant="caption" tone="label3" weight="semibold" class="an__sheet-head">{{ it.label }}</MiText>
            <a v-for="l in it.links" :key="l.title" :href="l.href" class="an__sheet-link an__sheet-link--sub" @click.prevent="sheet = false">{{ l.title }}</a>
          </div>
        </template>
      </nav>
    </header>

    <main class="an__body" aria-labelledby="an-title">
      <div class="an__page-head">
        <MiText id="an-title" variant="title2" as="h2" weight="bold">Inbox</MiText>
        <MiText variant="footnote" tone="label2">7 unread · 2 mention you</MiText>
      </div>
      <ul class="an__rows" aria-label="Inbox preview">
        <li v-for="r in rows" :key="r.title" class="an__row">
          <MiAvatar :name="r.who" size="sm" tone="auto" decorative />
          <div class="an__row-text">
            <MiText as="span" variant="subheadline" weight="semibold" :lines="1">{{ r.title }}</MiText>
            <MiText as="span" variant="footnote" tone="label2" :lines="1">{{ r.who }} · {{ r.what }}</MiText>
          </div>
          <MiText as="span" variant="caption" tone="label3">{{ r.when }}</MiText>
        </li>
      </ul>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const icons = {
  burger: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>'
}

const items = [
  { id: 'inbox', label: 'Inbox', href: '#inbox' },
  {
    id: 'projects', label: 'Projects', links: [
      { title: 'Active projects', description: '12 in progress across 4 teams', href: '#active' },
      { title: 'Roadmap', description: 'Quarter view with milestones', href: '#roadmap' },
      { title: 'Templates', description: 'Start from a proven plan', href: '#templates' },
      { title: 'Archive', description: 'Finished and paused work', href: '#archive' }
    ]
  },
  {
    id: 'insights', label: 'Insights', links: [
      { title: 'Cycle time', description: 'From first commit to shipped', href: '#cycle' },
      { title: 'Workload', description: 'Who is over capacity this week', href: '#workload' },
      { title: 'SLA breaches', description: 'Customer issues past their target', href: '#sla' }
    ]
  },
  { id: 'docs', label: 'Docs', href: '#docs' },
  { id: 'team', label: 'Team', href: '#team' }
]
const createItems = [
  { value: 'issue', label: 'New issue', shortcut: 'C' },
  { value: 'project', label: 'New project', shortcut: '⇧P' },
  { value: 'doc', label: 'New doc', shortcut: '⇧D' }
]
const accountItems = [
  { heading: 'noor@tidewater.dev' },
  { value: 'profile', label: 'Profile' },
  { value: 'prefs', label: 'Preferences', shortcut: '⌘,' },
  { separator: true },
  { value: 'out', label: 'Sign out' }
]
const rows = [
  { who: 'Lucía Fernández', title: 'Cycle time spiked on the payments team', what: 'mentioned you in Insights', when: '9:41' },
  { who: 'Ben Carter', title: 'Roadmap Q2: final review', what: 'asked for your approval', when: '9:12' },
  { who: 'Ama Boateng', title: 'Webhook retries ship tomorrow', what: 'posted a project update', when: 'Yesterday' }
]

const openItem = ref<string | undefined>('')
const sheet = ref(false)
</script>

<style scoped>
.an { container-type: inline-size; display: grid; align-content: start; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.an__header { position: relative; z-index: 2; background: var(--mi-card); box-shadow: 0 1px 0 var(--mi-sep); }
.an__bar { display: flex; align-items: center; gap: 10px; height: 56px; padding: 0 10px 0 14px; }

.an__brand { display: inline-flex; align-items: center; gap: 8px; flex: none; border-radius: 8px; color: inherit; text-decoration: none; }
.an__brand:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 3px; }
.an__mark { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px; background: var(--mi-p); }
.an__mark svg { width: 20px; height: 20px; fill: none; stroke: var(--mi-p-on); stroke-width: 2.2; stroke-linecap: round; }
.an__word { display: none; font-size: 16px; font-weight: 700; letter-spacing: -.02em; }

.an__cycle {
  display: inline-flex; align-items: center; gap: 6px; flex: none; height: 28px; padding: 0 10px 0 6px; border-radius: 999px;
  font-size: 12px; font-weight: 600; background: var(--mi-fill4); box-shadow: inset 0 0 0 1px var(--mi-sep);
}
.an__cycle-left, .an__cycle-name { display: none; font-weight: 500; color: var(--mi-label2); }
.an__cycle-name { font-weight: 600; color: inherit; }
.an__nav { display: none; }

.an__tools { display: flex; align-items: center; gap: 4px; margin-left: auto; }
.an__find {
  display: inline-grid; place-items: center; width: 36px; height: 36px; padding: 0; border: 0; border-radius: 10px;
  font: inherit; color: var(--mi-label2); background: none; cursor: pointer;
}
.an__find-text, .an__find-kbd { display: none; }
.an__find:hover { background: var(--mi-fill4); }
.an__find:focus-visible, .an__me:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.an__me { display: grid; padding: 0; margin-left: 4px; border: 0; border-radius: 50%; background: none; cursor: pointer; }

.an__sheet { display: grid; gap: 2px; max-height: 420px; overflow-y: auto; padding: 8px 10px 14px; border-top: 1px solid var(--mi-sep); }
.an__sheet-group { display: grid; gap: 2px; padding-top: 8px; }
.an__sheet-head { padding: 4px 12px; }
.an__sheet-link { padding: 10px 12px; border-radius: var(--mi-radius-m); font-size: 15px; font-weight: 500; color: var(--mi-label); text-decoration: none; }
.an__sheet-link--sub { padding-left: 20px; font-weight: 400; color: var(--mi-label2); }
.an__sheet-link[aria-current="page"] { color: var(--mi-p-text); background: var(--mi-p-tint); }
.an__sheet-link:hover { background: var(--mi-fill4); }
.an__sheet-link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }

.an__body { display: grid; gap: 14px; padding: 20px 14px 32px; }
.an__page-head { display: grid; gap: 2px; }
.an__rows { display: grid; margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); }
.an__row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 12px 14px; }
.an__row + .an__row { border-top: 1px solid var(--mi-sep); }
.an__row-text { display: grid; min-width: 0; }

@container (min-width: 420px) { .an__cycle-name { display: inline; } }
@container (min-width: 520px) { .an__word { display: inline; } }
@container (min-width: 640px) { .an__cycle-left { display: inline; } }
@container (min-width: 900px) {
  .an__bar { gap: 16px; padding: 0 16px 0 20px; }
  .an__cycle-left { display: none; }
  .an__nav { display: block; min-width: 0; }
  .an__burger, .an__sheet { display: none; }
  .an__body { padding: 28px 24px 40px; max-width: 880px; }
}
@container (min-width: 1120px) {
  .an__cycle-left { display: inline; }
  .an__find {
    display: inline-flex; gap: 8px; width: auto; padding: 0 6px 0 10px; height: 32px;
    background: var(--mi-fill4); box-shadow: inset 0 0 0 1px var(--mi-sep);
  }
  .an__find-text { display: inline; font-size: 13px; }
  .an__find-kbd { display: inline-flex; margin-left: 18px; }
}
</style>

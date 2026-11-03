<template>
  <div class="mi:@container mi:grid mi:content-start mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]">
    <header class="mi:relative mi:z-2 mi:[background:var(--mi-card)] mi:shadow-[0_1px_0_var(--mi-sep)]">
      <div class="mi:flex mi:items-center mi:gap-2.5 mi:h-14 mi:pt-0 mi:pr-2.5 mi:pb-0 mi:pl-3.5 mi:@[900px]:gap-4 mi:@[900px]:pt-0 mi:@[900px]:pr-4 mi:@[900px]:pb-0 mi:@[900px]:pl-5">
        <a href="#" class="mi:inline-flex mi:items-center mi:gap-2 mi:flex-[none] mi:rounded-[8px] mi:text-inherit mi:[text-decoration:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[3px]" aria-label="Tidewater home" @click.prevent>
          <span class="mi:grid mi:place-items-center mi:w-7.5 mi:h-7.5 mi:rounded-[9px] mi:[background:var(--mi-p)]" aria-hidden="true"><svg class="mi:w-5 mi:h-5 mi:fill-[color:none] mi:stroke-p-on mi:[stroke-width:2.2] mi:[stroke-linecap:round]" viewBox="0 0 24 24"><path d="M3 15c3-3 6 3 9 0s6 3 9 0" /><path d="M3 10c3-3 6 3 9 0s6 3 9 0" /></svg></span>
          <span class="mi:hidden mi:text-[16px] mi:font-bold mi:tracking-[-.02em] mi:@[520px]:inline">Tidewater</span>
        </a>

        <!-- Context capsule: where the team is in its cycle, always one glance away. -->
        <span class="mi:inline-flex mi:items-center mi:gap-1.5 mi:flex-[none] mi:h-7 mi:pt-0 mi:pr-2.5 mi:pb-0 mi:pl-1.5 mi:rounded-[999px] mi:text-[12px] mi:font-semibold mi:[background:var(--mi-fill4)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]" title="Cycle 14 runs Mar 3 to Mar 16">
          <MiProgressRing :value="71" :size="16" :stroke="2.5" label="Cycle 14 progress" />
          <span class="mi:text-inherit mi:hidden mi:font-medium mi:font-semibold mi:@[420px]:inline">Cycle 14</span>
          <span class="mi:hidden mi:font-medium mi:text-label2 mi:@[640px]:inline mi:@[900px]:hidden mi:@[1120px]:inline">3 days left</span>
        </span>

        <MiNavigationMenu v-model="openItem" class="mi:hidden! mi:@[900px]:block! mi:@[900px]:min-w-0!" :items="items" aria-label="Main" />

        <div class="mi:flex mi:items-center mi:gap-1 mi:ml-auto">
          <button type="button" class="mi:inline-grid mi:place-items-center mi:w-9 mi:h-9 mi:p-0 mi:[border:0] mi:rounded-[10px] mi:[font:inherit] mi:text-label2 mi:[background:none] mi:cursor-pointer mi:hover:[background:var(--mi-fill4)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:@[1120px]:inline-flex mi:@[1120px]:gap-2 mi:@[1120px]:w-auto mi:@[1120px]:pt-0 mi:@[1120px]:pr-1.5 mi:@[1120px]:pb-0 mi:@[1120px]:pl-2.5 mi:@[1120px]:h-8 mi:@[1120px]:[background:var(--mi-fill4)] mi:@[1120px]:shadow-[inset_0_0_0_1px_var(--mi-sep)]" aria-label="Search or run a command" aria-keyshortcuts="Meta+K">
            <MiIcon name="search" :size="16" />
            <span class="mi:hidden mi:@[1120px]:inline mi:@[1120px]:text-[13px]">Find anything</span>
            <MiKbdGroup class="mi:hidden! mi:@[1120px]:inline-flex! mi:@[1120px]:ml-4.5"><MiKbd>⌘</MiKbd><MiKbd>K</MiKbd></MiKbdGroup>
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
              <button v-bind="props" type="button" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:grid mi:p-0 mi:ml-1 mi:[border:0] mi:rounded-[50%] mi:[background:none] mi:cursor-pointer" aria-label="Account menu for Noor Haddad">
                <MiAvatar name="Noor Haddad" size="sm" tone="auto" decorative />
              </button>
            </template>
          </MiMenu>

          <MiIconButton class="mi:@[900px]:hidden!" size="toolbar" variant="plain" :label="sheet ? 'Close menu' : 'Open menu'" aria-controls="an-sheet" :aria-expanded="sheet" @click="sheet = !sheet">
            <MiIcon :svg="sheet ? icons.close : icons.burger" />
          </MiIconButton>
        </div>
      </div>

      <!-- Narrow widths: the same entries as an inline sheet under the bar. -->
      <nav v-show="sheet" id="an-sheet" class="mi:grid mi:gap-0.5 mi:max-h-105 mi:overflow-y-auto mi:pt-2 mi:px-2.5 mi:pb-3.5 mi:border-t mi:border-t-sep mi:@[900px]:hidden" aria-label="Main">
        <template v-for="it in items" :key="it.id">
          <a v-if="!it.links" href="#" class="mi:py-2.5 mi:px-3 mi:rounded-md mi:text-[15px] mi:font-medium mi:text-label mi:[text-decoration:none] mi:[&[aria-current='page']]:text-p-text mi:[&[aria-current='page']]:[background:var(--mi-p-tint)] mi:hover:[background:var(--mi-fill4)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :aria-current="it.id === 'inbox' ? 'page' : undefined" @click.prevent="sheet = false">{{ it.label }}</a>
          <div v-else class="mi:grid mi:gap-0.5 mi:pt-2">
            <MiText as="span" variant="caption" tone="label3" weight="semibold" class="mi:py-1 mi:px-3">{{ it.label }}</MiText>
            <a v-for="l in it.links" :key="l.title" :href="l.href" class="mi:py-2.5 mi:px-3 mi:rounded-md mi:text-[15px] mi:font-medium mi:text-label mi:[text-decoration:none] mi:pl-5 mi:font-normal mi:text-label2 mi:[&[aria-current='page']]:text-p-text mi:[&[aria-current='page']]:[background:var(--mi-p-tint)] mi:hover:[background:var(--mi-fill4)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" @click.prevent="sheet = false">{{ l.title }}</a>
          </div>
        </template>
      </nav>
    </header>

    <main class="mi:grid mi:gap-3.5 mi:pt-5 mi:px-3.5 mi:pb-8 mi:@[900px]:pt-7 mi:@[900px]:px-6 mi:@[900px]:pb-10 mi:@[900px]:max-w-220" aria-labelledby="an-title">
      <div class="mi:grid mi:gap-0.5">
        <MiText id="an-title" variant="title2" as="h2" weight="bold">Inbox</MiText>
        <MiText variant="footnote" tone="label2">7 unread · 2 mention you</MiText>
      </div>
      <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)]" aria-label="Inbox preview">
        <li v-for="r in rows" :key="r.title" class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:py-3 mi:px-3.5 mi:not-first:border-t mi:not-first:border-t-sep">
          <MiAvatar :name="r.who" size="sm" tone="auto" decorative />
          <div class="mi:grid mi:min-w-0">
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

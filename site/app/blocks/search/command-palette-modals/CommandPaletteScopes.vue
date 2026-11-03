<template>
  <section class="cps mi:@container mi:grid mi:content-start mi:gap-3 mi:font-mi mi:text-label" aria-labelledby="cps-title">
    <h2 id="cps-title" class="cps__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Command palette</h2>

    <div class="cps__stage mi:relative mi:grid mi:[place-items:start_center] mi:py-7 mi:px-3 mi:rounded-xl mi:overflow-hidden mi:isolate mi:bg-page mi:@[640px]:py-14 mi:@[640px]:px-8">
      <!-- Faux app behind the palette: token shapes only, blurred and dimmed like a real modal backdrop. -->
      <div class="cps__app mi:absolute mi:inset-0 mi:-z-2 mi:grid mi:grid-cols-[22%_1fr] mi:gap-4 mi:p-4 mi:[filter:blur(3px)]" aria-hidden="true">
        <div class="cps__app-side mi:grid mi:content-start mi:gap-2.5 mi:p-2 mi:rounded-lg mi:bg-card"><i class="mi:[.cps__app_&]:block mi:[.cps__app_&]:rounded-md mi:[.cps__app-side_&:first-child]:h-7 mi:[.cps__app-side_&:first-child]:bg-p-tint" v-for="n in 6" :key="n" /></div>
        <div class="cps__app-main mi:grid mi:content-start mi:gap-3.5">
          <div class="cps__app-bar mi:flex mi:justify-between"><i class="mi:[.cps__app_&]:block mi:[.cps__app_&]:rounded-md mi:[.cps__app-bar_&]:w-[30%]" /><i class="mi:[.cps__app_&]:block mi:[.cps__app_&]:rounded-md mi:[.cps__app-bar_&]:w-[30%]" /></div>
          <div class="cps__app-cards mi:grid mi:grid-cols-[repeat(3,_1fr)] mi:gap-3"><i class="mi:[.cps__app_&]:block mi:[.cps__app_&]:rounded-md mi:[.cps__app-cards_&]:shadow-1" v-for="n in 3" :key="n" /></div>
          <div class="cps__app-rows mi:grid mi:gap-2 mi:p-3 mi:rounded-lg mi:bg-card"><i class="mi:[.cps__app_&]:block mi:[.cps__app_&]:rounded-md" v-for="n in 5" :key="n" /></div>
        </div>
      </div>
      <div class="cps__scrim mi:absolute mi:inset-0 mi:-z-1 mi:[background:color-mix(in_srgb,_var(--mi-page)_45%,_transparent)]" aria-hidden="true" />

      <div class="cps__palette mi:grid mi:w-full mi:max-w-190 mi:rounded-xl mi:overflow-hidden mi:bg-elev mi:shadow-3 mi:border mi:border-sep" role="dialog" aria-modal="false" aria-labelledby="cps-title">
        <div class="cps__scopes mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2 mi:gap-x-3 mi:pt-3 mi:px-3.5 mi:pb-0">
          <MiSegmented v-model="scope" label="Search scope" :options="scopes" />
          <MiText variant="caption" tone="label3" class="cps__count" role="status" aria-live="polite">{{ filtered.length }} matches</MiText>
        </div>

        <div class="cps__body mi:grid mi:min-w-0 mi:@[640px]:grid-cols-[minmax(0,_1fr)_248px]">
          <MiCommand
            v-model:query="query" class="cps__command" :items="scoped" :placeholder="placeholder"
            label="Command menu" empty-text="No command, project or person matches." @select="run"
          />

          <!-- Preview of the item the palette would run: the last one picked, or the top match. -->
          <aside v-if="focus" class="cps__preview mi:hidden mi:@[640px]:grid mi:@[640px]:content-start mi:@[640px]:gap-3.5 mi:@[640px]:p-4.5 mi:@[640px]:border-l mi:@[640px]:border-l-sep mi:@[640px]:[background:color-mix(in_srgb,_var(--mi-fill4)_60%,_transparent)]" aria-label="Preview">
            <div class="cps__preview-head mi:flex mi:items-center mi:gap-3">
              <MiAvatar v-if="focus.kind === 'person'" :name="focus.label" size="md" tone="auto" decorative />
              <span v-else class="cps__tile mi:grid mi:place-items-center mi:flex-[none] mi:w-11 mi:h-11 mi:rounded-lg mi:bg-p-tint mi:text-p-text mi:[&[data-kind='doc']]:text-label2 mi:[&[data-kind='project']]:text-s" :data-kind="focus.kind"><MiIcon :svg="glyphs[focus.kind]" :size="20" /></span>
              <div class="cps__preview-title mi:grid mi:min-w-0">
                <MiText variant="headline" as="h3">{{ focus.label }}</MiText>
                <MiText variant="caption" tone="label2">{{ focus.group }}</MiText>
              </div>
            </div>
            <MiText variant="footnote" tone="label2">{{ focus.desc }}</MiText>
            <MiMeter v-if="focus.progress !== undefined" :value="focus.progress" label="Milestone" :caption="focus.progress + '% done'" size="sm" />
            <dl class="cps__facts mi:grid mi:gap-2 mi:m-0">
              <div class="mi:[.cps__facts_&]:flex mi:[.cps__facts_&]:justify-between mi:[.cps__facts_&]:gap-3 mi:[.cps__facts_&]:text-[13px]" v-for="[k, v] in focus.facts" :key="k"><dt class="mi:[.cps__facts_&]:text-label2">{{ k }}</dt><dd class="mi:[.cps__facts_&]:m-0 mi:[.cps__facts_&]:font-medium mi:[.cps__facts_&]:text-end">{{ v }}</dd></div>
            </dl>
            <div v-if="focus.shortcut" class="cps__shortcut mi:flex mi:items-center mi:justify-between mi:gap-2 mi:pt-3 mi:border-t mi:border-t-sep">
              <MiText variant="caption" tone="label3">Shortcut</MiText>
              <MiKbdGroup><MiKbd v-for="k in focus.shortcut.split(' ')" :key="k">{{ k }}</MiKbd></MiKbdGroup>
            </div>
          </aside>
        </div>

        <footer class="cps__foot mi:flex mi:flex-wrap mi:items-center mi:gap-y-2 mi:gap-x-4 mi:py-2.5 mi:px-3.5 mi:border-t mi:border-t-sep mi:text-[12px] mi:text-label2">
          <span class="cps__hint mi:inline-flex mi:items-center mi:gap-1.5"><MiKbdGroup><MiKbd>↑</MiKbd><MiKbd>↓</MiKbd></MiKbdGroup> move</span>
          <span class="cps__hint mi:inline-flex mi:items-center mi:gap-1.5"><MiKbd>↵</MiKbd> run</span>
          <span class="cps__hint mi:inline-flex mi:items-center mi:gap-1.5"><MiKbd>esc</MiKbd> close</span>
          <span class="cps__ran mi:ml-auto mi:text-p-text mi:font-medium" role="status" aria-live="polite">{{ ran }}</span>
        </footer>
      </div>
    </div>

    <div class="cps__try mi:flex mi:justify-center">
      <MiButton variant="gray" size="small" @click="modal = true">Open as a modal</MiButton>
    </div>
    <MiCommand v-model:open="modal" dialog :items="items" label="Command menu" @select="run" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Kind = 'action' | 'project' | 'person' | 'doc'
interface Entry { value: string, label: string, group: string, kind: Kind, desc: string, facts: [string, string][], shortcut?: string, keywords?: string[], progress?: number }

// Sample commands; swap for your router, project list and directory.
const items: Entry[] = [
  { value: 'new-issue', label: 'Create issue', group: 'Actions', kind: 'action', shortcut: 'C', keywords: ['new', 'bug', 'ticket'], desc: 'Opens the issue composer in the current project with your default labels.', facts: [['Project', 'Checkout redesign'], ['Labels', 'triage']] },
  { value: 'deploy', label: 'Deploy main to staging', group: 'Actions', kind: 'action', shortcut: '⌘ ⇧ D', keywords: ['release', 'ship'], desc: 'Builds commit 4f2a91c and promotes it to staging.lumen.dev. Takes about 3 minutes.', facts: [['Last deploy', 'Today, 09:42'], ['Pipeline', '14 checks']] },
  { value: 'invite', label: 'Invite a teammate', group: 'Actions', kind: 'action', shortcut: 'I', keywords: ['member', 'add'], desc: 'Sends an invite link valid for 7 days. New members join as Editors.', facts: [['Seats left', '3 of 25']] },
  { value: 'theme', label: 'Switch appearance', group: 'Actions', kind: 'action', shortcut: '⌘ ⇧ L', keywords: ['dark', 'light', 'theme'], desc: 'Cycles between light, dark and the system setting.', facts: [['Current', 'System']] },
  { value: 'checkout', label: 'Checkout redesign', group: 'Projects', kind: 'project', keywords: ['cart', 'web'], progress: 68, desc: 'One-page checkout with saved carts and wallet payments.', facts: [['Open issues', '14'], ['Due', 'Nov 21'], ['Lead', 'Maya Lindqvist']] },
  { value: 'android', label: 'Android 5.2 release', group: 'Projects', kind: 'project', keywords: ['mobile', 'app'], progress: 41, desc: 'Offline mode, widget refresh and the new onboarding.', facts: [['Open issues', '27'], ['Due', 'Dec 4'], ['Lead', 'Kofi Asante']] },
  { value: 'billing', label: 'Billing migration', group: 'Projects', kind: 'project', keywords: ['invoices', 'payments'], progress: 89, desc: 'Moves 3,412 customers to usage-based invoices.', facts: [['Open issues', '5'], ['Due', 'Nov 8'], ['Lead', 'Inès Moreau']] },
  { value: 'maya', label: 'Maya Lindqvist', group: 'People', kind: 'person', keywords: ['design'], desc: 'Product designer, checkout and payments. In Stockholm, 16:20 local time.', facts: [['Team', 'Design'], ['Status', 'Focusing until 17:00']] },
  { value: 'kofi', label: 'Kofi Asante', group: 'People', kind: 'person', keywords: ['mobile', 'android'], desc: 'Mobile lead. Reviews every Android release candidate.', facts: [['Team', 'Mobile'], ['Status', 'Available']] },
  { value: 'roadmap', label: 'Q4 roadmap review', group: 'Recent', kind: 'doc', keywords: ['planning', 'doc'], desc: 'Notes from the October 28 review, with 6 decisions and 11 follow-ups.', facts: [['Edited', '2 hours ago'], ['Owner', 'Inès Moreau']] }
]

const glyphs: Record<Kind, string> = {
  action: '<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>',
  project: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h5"/>',
  person: '',
  doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>'
}

const scopes = [{ value: 'all', label: 'All' }, { value: 'Actions', label: 'Actions' }, { value: 'Projects', label: 'Projects' }, { value: 'People', label: 'People' }]
const scope = ref<string | number | null>('all')
const query = ref('')
const picked = ref<string | null>(null)
const ran = ref('')
const modal = ref(false)

const scoped = computed(() => scope.value === 'all' ? items : items.filter(i => i.group === scope.value))
const placeholder = computed(() => scope.value === 'all' ? 'Search commands, projects and people' : `Search ${String(scope.value).toLowerCase()}`)

// Mirrors the palette's own matching so the preview follows what is on screen.
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return scoped.value
  return scoped.value.filter(i => [i.label, i.group, ...(i.keywords ?? [])].join(' ').toLowerCase().includes(q))
})
const focus = computed(() => filtered.value.find(i => i.value === picked.value) ?? filtered.value[0] ?? null)

function run(item: { value: string, label: string }) {
  picked.value = item.value
  ran.value = `Ran “${item.label}”`
}
</script>

<style scoped>
.cps__app i { background: var(--mi-fill3); }
.cps__app-side i { height: 14px; }
.cps__app-bar i { height: 22px; }
.cps__app-bar i + i { width: 14%; background: var(--mi-p); opacity: .5; }
.cps__app-cards i { height: 92px; background: var(--mi-card); }
.cps__app-rows i { height: 14px; }
.cps__count { font-variant-numeric: tabular-nums; }
.cps__command { min-width: 0; }
.cps__tile[data-kind="doc"] { background: var(--mi-fill3); }
.cps__tile[data-kind="project"] { background: color-mix(in srgb, var(--mi-s) 16%, transparent); }
</style>

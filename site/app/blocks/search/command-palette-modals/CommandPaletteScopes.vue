<template>
  <section class="cps" aria-labelledby="cps-title">
    <h2 id="cps-title" class="cps__sr">Command palette</h2>

    <div class="cps__stage">
      <!-- Faux app behind the palette: token shapes only, blurred and dimmed like a real modal backdrop. -->
      <div class="cps__app" aria-hidden="true">
        <div class="cps__app-side"><i v-for="n in 6" :key="n" /></div>
        <div class="cps__app-main">
          <div class="cps__app-bar"><i /><i /></div>
          <div class="cps__app-cards"><i v-for="n in 3" :key="n" /></div>
          <div class="cps__app-rows"><i v-for="n in 5" :key="n" /></div>
        </div>
      </div>
      <div class="cps__scrim" aria-hidden="true" />

      <div class="cps__palette" role="dialog" aria-modal="false" aria-labelledby="cps-title">
        <div class="cps__scopes">
          <MiSegmented v-model="scope" label="Search scope" :options="scopes" />
          <MiText variant="caption" tone="label3" class="cps__count" role="status" aria-live="polite">{{ filtered.length }} matches</MiText>
        </div>

        <div class="cps__body">
          <MiCommand
            v-model:query="query" class="cps__command" :items="scoped" :placeholder="placeholder"
            label="Command menu" empty-text="No command, project or person matches." @select="run"
          />

          <!-- Preview of the item the palette would run: the last one picked, or the top match. -->
          <aside v-if="focus" class="cps__preview" aria-label="Preview">
            <div class="cps__preview-head">
              <MiAvatar v-if="focus.kind === 'person'" :name="focus.label" size="md" tone="auto" decorative />
              <span v-else class="cps__tile" :data-kind="focus.kind"><MiIcon :svg="glyphs[focus.kind]" :size="20" /></span>
              <div class="cps__preview-title">
                <MiText variant="headline" as="h3">{{ focus.label }}</MiText>
                <MiText variant="caption" tone="label2">{{ focus.group }}</MiText>
              </div>
            </div>
            <MiText variant="footnote" tone="label2">{{ focus.desc }}</MiText>
            <MiMeter v-if="focus.progress !== undefined" :value="focus.progress" label="Milestone" :caption="focus.progress + '% done'" size="sm" />
            <dl class="cps__facts">
              <div v-for="[k, v] in focus.facts" :key="k"><dt>{{ k }}</dt><dd>{{ v }}</dd></div>
            </dl>
            <div v-if="focus.shortcut" class="cps__shortcut">
              <MiText variant="caption" tone="label3">Shortcut</MiText>
              <MiKbdGroup><MiKbd v-for="k in focus.shortcut.split(' ')" :key="k">{{ k }}</MiKbd></MiKbdGroup>
            </div>
          </aside>
        </div>

        <footer class="cps__foot">
          <span class="cps__hint"><MiKbdGroup><MiKbd>↑</MiKbd><MiKbd>↓</MiKbd></MiKbdGroup> move</span>
          <span class="cps__hint"><MiKbd>↵</MiKbd> run</span>
          <span class="cps__hint"><MiKbd>esc</MiKbd> close</span>
          <span class="cps__ran" role="status" aria-live="polite">{{ ran }}</span>
        </footer>
      </div>
    </div>

    <div class="cps__try">
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
.cps { container-type: inline-size; display: grid; align-content: start; gap: 12px; font-family: var(--mi-font); color: var(--mi-label); }
.cps__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.cps__stage { position: relative; display: grid; place-items: start center; padding: 28px 12px; border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate; background: var(--mi-page); }
@container (min-width: 640px) { .cps__stage { padding: 56px 32px; } }

/* Faux application: static shapes, blurred once, never animated. */
.cps__app { position: absolute; inset: 0; z-index: -2; display: grid; grid-template-columns: 22% 1fr; gap: 16px; padding: 16px; filter: blur(3px); }
.cps__app i { display: block; border-radius: var(--mi-radius-m); background: var(--mi-fill3); }
.cps__app-side { display: grid; align-content: start; gap: 10px; padding: 8px; border-radius: var(--mi-radius-l); background: var(--mi-card); }
.cps__app-side i { height: 14px; }
.cps__app-side i:first-child { height: 28px; background: var(--mi-p-tint); }
.cps__app-main { display: grid; align-content: start; gap: 14px; }
.cps__app-bar { display: flex; justify-content: space-between; }
.cps__app-bar i { width: 30%; height: 22px; }
.cps__app-bar i + i { width: 14%; background: var(--mi-p); opacity: .5; }
.cps__app-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.cps__app-cards i { height: 92px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.cps__app-rows { display: grid; gap: 8px; padding: 12px; border-radius: var(--mi-radius-l); background: var(--mi-card); }
.cps__app-rows i { height: 14px; }
.cps__scrim { position: absolute; inset: 0; z-index: -1; background: color-mix(in srgb, var(--mi-page) 45%, transparent); }

.cps__palette {
  display: grid; width: 100%; max-width: 760px; border-radius: var(--mi-radius-xl); overflow: hidden;
  background: var(--mi-elev); box-shadow: var(--mi-sh3); border: 1px solid var(--mi-sep);
}
.cps__scopes { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; padding: 12px 14px 0; }
.cps__count { font-variant-numeric: tabular-nums; }

.cps__body { display: grid; min-width: 0; }
.cps__command { min-width: 0; }
.cps__preview { display: none; }
@container (min-width: 640px) {
  .cps__body { grid-template-columns: minmax(0, 1fr) 248px; }
  .cps__preview { display: grid; align-content: start; gap: 14px; padding: 18px; border-left: 1px solid var(--mi-sep); background: color-mix(in srgb, var(--mi-fill4) 60%, transparent); }
}
.cps__preview-head { display: flex; align-items: center; gap: 12px; }
.cps__preview-title { display: grid; min-width: 0; }
.cps__tile { display: grid; place-items: center; flex: none; width: 44px; height: 44px; border-radius: var(--mi-radius-l); background: var(--mi-p-tint); color: var(--mi-p-text); }
.cps__tile[data-kind="doc"] { background: var(--mi-fill3); color: var(--mi-label2); }
.cps__tile[data-kind="project"] { background: color-mix(in srgb, var(--mi-s) 16%, transparent); color: var(--mi-s); }
.cps__facts { display: grid; gap: 8px; margin: 0; }
.cps__facts div { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; }
.cps__facts dt { color: var(--mi-label2); }
.cps__facts dd { margin: 0; font-weight: 500; text-align: end; }
.cps__shortcut { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 12px; border-top: 1px solid var(--mi-sep); }

.cps__foot { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding: 10px 14px; border-top: 1px solid var(--mi-sep); font-size: 12px; color: var(--mi-label2); }
.cps__hint { display: inline-flex; align-items: center; gap: 6px; }
.cps__ran { margin-left: auto; color: var(--mi-p-text); font-weight: 500; }
.cps__try { display: flex; justify-content: center; }
</style>

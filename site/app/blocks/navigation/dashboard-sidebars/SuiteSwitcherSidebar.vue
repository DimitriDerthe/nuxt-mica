<template>
  <div class="drs">
    <div class="drs__shell" @keydown.esc="panel = false">
      <!-- Rail: one icon per app. Picking an app swaps the panel beside it. -->
      <nav class="drs__rail" aria-label="Apps">
        <span class="drs__logo" aria-hidden="true">H</span>
        <button
          v-for="a in apps" :key="a.id" type="button" class="drs__app" :aria-current="a.id === app ? 'true' : undefined"
          :aria-label="a.label" :title="a.label" @click="pick(a.id)"
        >
          <MiBadge v-if="a.alert" dot-only tone="danger" :dot-size="8" placement="top-right" ring-color="var(--mi-fill4)">
            <template #target><MiIcon :name="a.icon" :size="20" /></template>
          </MiBadge>
          <MiIcon v-else :name="a.icon" :size="20" />
        </button>
        <MiAvatar class="drs__me" name="Leila Benali" size="sm" tone="auto" />
      </nav>

      <!-- Contextual panel: a static column when wide, an overlay that slides in when narrow. -->
      <aside id="drs-panel" class="drs__panel" :class="{ 'is-open': panel }" :aria-label="`${current.label} navigation`">
        <div class="drs__panel-head">
          <div>
            <MiText variant="headline" as="h2">{{ current.label }}</MiText>
            <MiText variant="caption" tone="label2">{{ current.hint }}</MiText>
          </div>
          <MiIconButton :label="`Hide ${current.label} panel`" variant="gray" size="small" class="drs__hide" @click="panel = false">
            <MiIcon name="sidebar" :size="15" />
          </MiIconButton>
        </div>
        <MiSidebar
          :key="app" v-model="picked[app]" class="drs__nav" :groups="current.groups" :aria-label="current.label"
          :footer-label="current.footer" @select="panel = false"
        />
      </aside>
      <div v-if="panel" class="drs__scrim" aria-hidden="true" @click="panel = false" />

      <main class="drs__main" aria-labelledby="drs-title">
        <div class="drs__bar">
          <MiIconButton
            label="Show panel" variant="gray" size="small" class="drs__toggle" :aria-expanded="panel" aria-controls="drs-panel" @click="panel = !panel"
          >
            <MiIcon name="sidebar" :size="15" />
          </MiIconButton>
          <MiText variant="caption" tone="label2">{{ current.label }}</MiText>
        </div>
        <MiText id="drs-title" variant="title2" as="h3" weight="bold">{{ itemLabel }}</MiText>
        <div class="drs__ghosts" aria-hidden="true"><span v-for="n in 4" :key="n" /></div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type AppId = 'home' | 'inbox' | 'crm' | 'calendar' | 'reports'
type RailIcon = 'home' | 'tray' | 'people' | 'calendar' | 'grid'
type NavIcon = 'home' | 'inbox' | 'folder' | 'calendar' | 'document' | 'person' | 'people' | 'grid' | 'list' | 'check' | 'share'
type Tag = 'red' | 'orange' | 'green' | 'blue' | 'purple'
interface NavItem { id: string, label: string, icon?: NavIcon, color?: Tag, badge?: number | string }
interface NavGroup { id: string, label?: string, items: NavItem[], collapsible?: boolean }
interface App { id: AppId, label: string, hint: string, icon: RailIcon, alert?: boolean, footer: string, groups: NavGroup[] }

const apps: App[] = [
  {
    id: 'home', label: 'Home', hint: 'Harbor CRM · Lisbon office', icon: 'home', footer: 'Customise home',
    groups: [{ id: 'h', items: [{ id: 'today', label: 'Today', icon: 'home' }, { id: 'tasks', label: 'My tasks', icon: 'check', badge: 6 }, { id: 'mentions', label: 'Mentions', icon: 'share', badge: 2 }] }]
  },
  {
    id: 'inbox', label: 'Inbox', hint: 'Shared sales inbox', icon: 'tray', alert: true, footer: 'New folder',
    groups: [
      { id: 'boxes', items: [{ id: 'all', label: 'All mail', icon: 'inbox', badge: 18 }, { id: 'assigned', label: 'Assigned to me', icon: 'person', badge: 4 }, { id: 'sent', label: 'Sent', icon: 'share' }] },
      { id: 'labels', label: 'Labels', collapsible: true, items: [{ id: 'renewal', label: 'Renewals', color: 'orange' }, { id: 'trial', label: 'Trials', color: 'green' }, { id: 'legal', label: 'Legal review', color: 'red' }] }
    ]
  },
  {
    id: 'crm', label: 'Pipeline', hint: '€1.42M open this quarter', icon: 'people', footer: 'New view',
    groups: [
      { id: 'views', items: [{ id: 'deals', label: 'Deals', icon: 'grid', badge: 37 }, { id: 'companies', label: 'Companies', icon: 'folder' }, { id: 'contacts', label: 'Contacts', icon: 'people' }] },
      { id: 'stages', label: 'Stages', collapsible: true, items: [{ id: 'qualify', label: 'Qualified', color: 'blue', badge: 14 }, { id: 'proposal', label: 'Proposal sent', color: 'purple', badge: 9 }, { id: 'won', label: 'Closed won', color: 'green' }] }
    ]
  },
  {
    id: 'calendar', label: 'Calendar', hint: '3 meetings left today', icon: 'calendar', footer: 'Add calendar',
    groups: [{ id: 'cal', items: [{ id: 'week', label: 'This week', icon: 'calendar' }, { id: 'booking', label: 'Booking links', icon: 'share' }, { id: 'team', label: 'Team availability', icon: 'people' }] }]
  },
  {
    id: 'reports', label: 'Reports', hint: 'Refreshed 6 minutes ago', icon: 'grid', footer: 'New report',
    groups: [{ id: 'rep', items: [{ id: 'forecast', label: 'Forecast', icon: 'list' }, { id: 'activity', label: 'Rep activity', icon: 'document' }, { id: 'winloss', label: 'Win and loss', icon: 'grid' }] }]
  }
]

const app = ref<AppId>('crm')
const panel = ref(false)
// Each app remembers its own selected row.
const picked = reactive<Record<AppId, string | undefined>>({ home: 'today', inbox: 'all', crm: 'deals', calendar: 'week', reports: 'forecast' })

const current = computed(() => apps.find(a => a.id === app.value) ?? apps[0]!)
const itemLabel = computed(() => current.value.groups.flatMap(g => g.items).find(i => i.id === picked[app.value])?.label ?? current.value.label)

function pick(id: AppId) {
  app.value = id
  panel.value = true
}
</script>

<style scoped>
.drs { container-type: inline-size; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.drs__shell { position: relative; display: grid; grid-template-columns: 60px minmax(0, 1fr); min-height: 100%; overflow: hidden; }

.drs__rail { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 0; background: var(--mi-fill4); box-shadow: inset -1px 0 0 var(--mi-sep); }
.drs__logo { display: grid; place-items: center; width: 34px; height: 34px; margin-bottom: 10px; border-radius: 10px; font-weight: 800; color: var(--mi-p-on); background: linear-gradient(135deg, var(--mi-p), var(--mi-s)); }
.drs__app { position: relative; display: grid; place-items: center; width: 42px; height: 42px; border: 0; border-radius: 12px; color: var(--mi-label2); background: transparent; cursor: pointer; transition: transform var(--mi-dur-2) var(--mi-spring); }
.drs__app:hover { color: var(--mi-label); background: var(--mi-fill3); }
.drs__app:active { transform: scale(.94); }
.drs__app[aria-current="true"] { color: var(--mi-p-text); background: var(--mi-p-tint); }
.drs__app[aria-current="true"]::before { content: ""; position: absolute; inset: 10px auto 10px -9px; width: 3px; border-radius: 2px; background: var(--mi-p); }
.drs__app:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.drs__me { margin-top: auto; }

.drs__panel {
  position: absolute; inset: 0 auto 0 60px; z-index: 3; display: flex; flex-direction: column; gap: 6px; width: min(280px, calc(100% - 76px)); padding: 14px 10px;
  background: var(--mi-card); box-shadow: var(--mi-sh3); transform: translateX(-110%); opacity: 0; visibility: hidden;
  transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease), visibility 0s linear var(--mi-dur-3);
}
.drs__panel.is-open { transform: none; opacity: 1; visibility: visible; transition-delay: 0s; }
.drs__panel-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; padding: 0 6px 6px; }
.drs__nav { flex: 1; min-height: 0; }
.drs__scrim { position: absolute; inset: 0 0 0 60px; z-index: 2; background: var(--mi-scrim); }

.drs__main { display: grid; align-content: start; gap: 10px; padding: 14px 16px 28px; min-width: 0; }
.drs__bar { display: flex; align-items: center; gap: 10px; }
.drs__ghosts { display: grid; gap: 10px; margin-top: 8px; }
.drs__ghosts span { height: 64px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }

@container (min-width: 720px) {
  .drs__shell { grid-template-columns: 60px 248px minmax(0, 1fr); }
  .drs__panel { position: static; width: auto; transform: none; opacity: 1; visibility: visible; box-shadow: inset -1px 0 0 var(--mi-sep); transition: none; }
  .drs__hide, .drs__toggle, .drs__scrim { display: none; }
  .drs__main { padding: 22px 28px 36px; }
  .drs__ghosts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .drs__ghosts span { height: 120px; }
}
</style>

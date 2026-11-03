<template>
  <div class="drs mi:@container mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]">
    <div class="drs__shell mi:relative mi:grid mi:grid-cols-[60px_minmax(0,_1fr)] mi:min-h-full mi:overflow-hidden mi:@[720px]:grid-cols-[60px_248px_minmax(0,_1fr)]" @keydown.esc="panel = false">
      <!-- Rail: one icon per app. Picking an app swaps the panel beside it. -->
      <nav class="drs__rail mi:flex mi:flex-col mi:items-center mi:gap-1.5 mi:py-3 mi:px-0 mi:[background:var(--mi-fill4)] mi:shadow-[inset_-1px_0_0_var(--mi-sep)]" aria-label="Apps">
        <span class="drs__logo mi:grid mi:place-items-center mi:w-8.5 mi:h-8.5 mi:mb-2.5 mi:rounded-[10px] mi:font-extrabold mi:text-p-on mi:[background:linear-gradient(135deg,_var(--mi-p),_var(--mi-s))]" aria-hidden="true">H</span>
        <button
          v-for="a in apps" :key="a.id" type="button" class="drs__app mi:relative mi:grid mi:place-items-center mi:w-10.5 mi:h-10.5 mi:[border:0] mi:rounded-[12px] mi:text-label2 mi:[background:transparent] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:active:transform-[scale(.94)] mi:aria-current:before:content-[''] mi:aria-current:before:absolute mi:aria-current:before:top-2.5 mi:aria-current:before:right-auto mi:aria-current:before:bottom-2.5 mi:aria-current:before:left-[-9px] mi:aria-current:before:w-[3px] mi:aria-current:before:rounded-[2px] mi:aria-current:before:[background:var(--mi-p)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :aria-current="a.id === app ? 'true' : undefined"
          :aria-label="a.label" :title="a.label" @click="pick(a.id)"
        >
          <MiBadge v-if="a.alert" dot-only tone="danger" :dot-size="8" placement="top-right" ring-color="var(--mi-fill4)">
            <template #target><MiIcon :name="a.icon" :size="20" /></template>
          </MiBadge>
          <MiIcon v-else :name="a.icon" :size="20" />
        </button>
        <MiAvatar class="drs__me mi:mt-auto" name="Leila Benali" size="sm" tone="auto" />
      </nav>

      <!-- Contextual panel: a static column when wide, an overlay that slides in when narrow. -->
      <aside id="drs-panel" class="drs__panel mi:absolute mi:top-0 mi:right-auto mi:bottom-0 mi:left-15 mi:z-3 mi:flex mi:flex-col mi:gap-1.5 mi:w-[min(280px,_calc(100%_-_76px))] mi:py-3.5 mi:px-2.5 mi:[background:var(--mi-card)] mi:shadow-3 mi:transform-[translateX(-110%)] mi:opacity-0 mi:invisible mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring),_opacity_var(--mi-dur-2)_var(--mi-ease),_visibility_0s_linear_var(--mi-dur-3)] mi:[&.is-open]:transform-none mi:[&.is-open]:opacity-100 mi:[&.is-open]:visible mi:[&.is-open]:delay-[0s] mi:@[720px]:static mi:@[720px]:w-auto mi:@[720px]:transform-none mi:@[720px]:opacity-100 mi:@[720px]:visible mi:@[720px]:shadow-[inset_-1px_0_0_var(--mi-sep)] mi:@[720px]:[transition:none]" :class="{ 'is-open': panel }" :aria-label="`${current.label} navigation`">
        <div class="drs__panel-head mi:flex mi:[align-items:flex-start] mi:justify-between mi:gap-2 mi:pt-0 mi:px-1.5 mi:pb-1.5">
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
      <div v-if="panel" class="drs__scrim mi:absolute mi:top-0 mi:right-0 mi:bottom-0 mi:left-15 mi:z-2 mi:[background:var(--mi-scrim)] mi:@[720px]:hidden" aria-hidden="true" @click="panel = false" />

      <main class="drs__main mi:grid mi:content-start mi:gap-2.5 mi:pt-3.5 mi:px-4 mi:pb-7 mi:min-w-0 mi:@[720px]:pt-5.5 mi:@[720px]:px-7 mi:@[720px]:pb-9" aria-labelledby="drs-title">
        <div class="drs__bar mi:flex mi:items-center mi:gap-2.5">
          <MiIconButton
            label="Show panel" variant="gray" size="small" class="drs__toggle" :aria-expanded="panel" aria-controls="drs-panel" @click="panel = !panel"
          >
            <MiIcon name="sidebar" :size="15" />
          </MiIconButton>
          <MiText variant="caption" tone="label2">{{ current.label }}</MiText>
        </div>
        <MiText id="drs-title" variant="title2" as="h3" weight="bold">{{ itemLabel }}</MiText>
        <div class="drs__ghosts mi:grid mi:gap-2.5 mi:mt-2 mi:@[720px]:grid-cols-2" aria-hidden="true"><span class="mi:[.drs__ghosts_&]:h-16 mi:[.drs__ghosts_&]:rounded-lg mi:[.drs__ghosts_&]:[background:var(--mi-card)] mi:[.drs__ghosts_&]:shadow-1 mi:@[720px]:[.drs__ghosts_&]:h-30" v-for="n in 4" :key="n" /></div>
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
.drs__app:hover { color: var(--mi-label); background: var(--mi-fill3); }
.drs__app[aria-current="true"] { color: var(--mi-p-text); background: var(--mi-p-tint); }
.drs__nav { flex: 1; min-height: 0; }

@container (min-width: 720px) {
  .drs__hide, .drs__toggle { display: none; }
}
</style>

<template>
  <div ref="rootEl" class="fds mi:@container mi:font-mi mi:text-label">
    <div class="fds__shell mi:relative mi:grid mi:grid-cols-[76px_minmax(0,_1fr)] mi:grid-rows-[minmax(0,_1fr)] mi:h-160 mi:overflow-hidden mi:[background:radial-gradient(120%_80%_at_0%_0%,_color-mix(in_srgb,_var(--mi-p)_7%,_transparent),_transparent_60%),_var(--mi-page)] mi:@[720px]:grid-cols-[280px_minmax(0,_1fr)] mi:@[720px]:[&.is-rail]:grid-cols-[76px_minmax(0,_1fr)]" :class="{ 'is-rail': collapsed }" @keydown="onKey">
      <!-- The dock floats off the edges; collapsed it becomes an icon rail with tooltips. -->
      <aside id="fds-dock" class="fds__dock mi:absolute mi:z-3 mi:top-3 mi:right-auto mi:bottom-3 mi:left-3 mi:w-64 mi:box-border mi:flex mi:flex-col mi:gap-1.5 mi:min-h-0 mi:p-2.5 mi:rounded-[20px] mi:[background:var(--mi-card)] mi:shadow-3 mi:[.is-rail_&]:relative mi:[.is-rail_&]:inset-auto mi:[.is-rail_&]:w-auto mi:[.is-rail_&]:mt-3 mi:[.is-rail_&]:mr-0 mi:[.is-rail_&]:mb-3 mi:[.is-rail_&]:ml-3 mi:[.is-rail_&]:py-2.5 mi:[.is-rail_&]:px-2 mi:[.is-rail_&]:items-center mi:[.is-rail_&]:shadow-2 mi:@[720px]:relative mi:@[720px]:inset-auto mi:@[720px]:w-auto mi:@[720px]:mt-3 mi:@[720px]:mr-0 mi:@[720px]:mb-3 mi:@[720px]:ml-3 mi:@[720px]:shadow-2" aria-label="Tidewater navigation">
        <div class="fds__head mi:flex mi:items-center mi:gap-1 mi:w-full mi:[.is-rail_&]:flex-col mi:[.is-rail_&]:gap-1.5">
          <MiMenu v-model="workspace" variant="popup" :items="workspaces" aria-label="Switch workspace">
            <template #trigger="{ props }">
              <button v-bind="props" type="button" class="fds__ws mi:flex mi:items-center mi:gap-2.5 mi:flex-1 mi:min-w-0 mi:p-1.5 mi:[border:0] mi:rounded-[12px] mi:[background:none] mi:text-inherit mi:[font:inherit] mi:text-left mi:cursor-pointer mi:hover:[background:var(--mi-fill4)] mi:[.is-rail_&]:p-0.5 mi:[.is-rail_&]:flex-[none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :aria-label="'Workspace: ' + currentWs.label + '. Switch workspace'">
                <span class="fds__ws-tile mi:grid mi:place-items-center mi:flex-[none] mi:w-8 mi:h-8 mi:rounded-[10px] mi:text-[12px] mi:font-extrabold mi:tracking-[.02em] mi:text-p-on mi:[background:linear-gradient(145deg,_var(--mi-p),_color-mix(in_srgb,_var(--mi-p)_55%,_var(--mi-s)))] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-card)_18%,_transparent)]" aria-hidden="true">{{ currentWs.initials }}</span>
                <span class="fds__ws-text fds__label mi:grid mi:min-w-0 mi:flex-1">
                  <span class="fds__ws-name mi:text-[14px] mi:font-650 mi:tracking-[-.01em] mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">{{ currentWs.label }}</span>
                  <span class="fds__ws-plan mi:text-[11.5px] mi:text-label2 mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">{{ currentWs.plan }}</span>
                </span>
                <MiIcon name="chevron-up-down" :size="14" class="fds__label fds__ws-chev mi:text-label3" />
              </button>
            </template>
          </MiMenu>
          <MiTooltip :content="collapsed ? 'Expand sidebar' : 'Collapse sidebar'" shortcut="[" placement="right">
            <MiIconButton class="fds__toggle" size="small" variant="plain" :label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'" aria-controls="fds-dock" :aria-expanded="!collapsed" @click="collapsed = !collapsed">
              <MiIcon name="sidebar" :size="17" />
            </MiIconButton>
          </MiTooltip>
        </div>

        <MiTooltip class="fds__tip" content="Search" shortcut="⌘K" placement="right" :disabled="!collapsed">
          <button type="button" class="fds__search mi:flex mi:items-center mi:gap-2 mi:w-full mi:h-8.5 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-2.5 mi:box-border mi:[border:0] mi:rounded-[10px] mi:[background:var(--mi-fill4)] mi:text-label2 mi:cursor-pointer mi:hover:text-label mi:[.is-rail_&]:h-9.5 mi:[.is-rail_&]:p-0 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" aria-label="Search Tidewater">
            <MiIcon name="search" :size="16" />
            <span class="fds__label fds__search-text mi:flex-1 mi:text-left">Search</span>
            <MiKbdGroup class="fds__label fds__keys mi:flex-[none]"><MiKbd>⌘</MiKbd><MiKbd>K</MiKbd></MiKbdGroup>
          </button>
        </MiTooltip>

        <nav class="fds__scroll mi:flex-1 mi:min-h-0 mi:w-full mi:overflow-y-auto mi:[scrollbar-width:none] mi:mt-1" aria-label="Main">
          <ul class="fds__list mi:grid mi:gap-px mi:m-0 mi:p-0 mi:[list-style:none] mi:[.is-rail_&]:justify-items-center mi:[.is-rail_&]:gap-0.5">
            <li v-for="n in nav" :key="n.id">
              <MiTooltip class="fds__tip" :content="n.label + (n.count ? ' · ' + n.count + ' new' : '')" :shortcut="n.key ? 'G ' + n.key : undefined" placement="right" :disabled="!collapsed">
                <button type="button" class="fds__item mi:relative mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:h-9 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-1 mi:box-border mi:[border:0] mi:rounded-[10px] mi:[background:none] mi:text-label2 mi:text-left mi:cursor-pointer mi:[.is-rail_&]:h-9.5 mi:[.is-rail_&]:p-0 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :class="{ 'is-active': n.id === view }" :aria-current="n.id === view ? 'page' : undefined" :aria-label="collapsed ? n.label : undefined" @click="go(n.id)">
                  <span class="fds__glyph mi:[.fds__item.is-active_&]:text-p-text mi:grid mi:place-items-center mi:flex-[none] mi:w-7 mi:h-7"><MiIcon :name="n.icon" :size="18" /></span>
                  <span class="fds__label fds__item-label mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">{{ n.label }}</span>
                  <span v-if="n.count" class="fds__count mi:flex-[none] mi:min-w-5 mi:h-5 mi:py-0 mi:px-1.5 mi:box-border mi:rounded-[10px] mi:text-[11.5px] mi:font-650 mi:leading-5 mi:text-center mi:tabular-nums mi:text-p-on mi:[background:var(--mi-p)] mi:[.is-rail_&]:absolute mi:[.is-rail_&]:top-[3px] mi:[.is-rail_&]:right-0.5 mi:[.is-rail_&]:min-w-4 mi:[.is-rail_&]:h-4 mi:[.is-rail_&]:py-0 mi:[.is-rail_&]:px-1 mi:[.is-rail_&]:text-[10px] mi:[.is-rail_&]:leading-4 mi:[.is-rail_&]:shadow-[0_0_0_2px_var(--mi-card)]" :aria-label="n.count + ' new'">{{ n.count }}</span>
                  <MiKbdGroup v-else-if="n.key" class="fds__label fds__keys fds__hint mi:flex-[none] mi:opacity-0 mi:[.fds__item:hover_&]:opacity-100 mi:[.fds__item:focus-visible_&]:opacity-100 mi:[.fds__item.is-active_&]:opacity-100" aria-hidden="true"><MiKbd>G</MiKbd><MiKbd>{{ n.key }}</MiKbd></MiKbdGroup>
                </button>
              </MiTooltip>
            </li>
          </ul>

          <div class="fds__section mi:flex mi:items-center mi:gap-2 mi:pt-4.5 mi:px-2 mi:pb-1.5">
            <MiText as="h2" variant="caption2" weight="semibold" tone="label2" class="fds__label fds__eyebrow">Pinned</MiText>
            <span class="fds__rule mi:flex-1 mi:h-px mi:[background:var(--mi-sep)]" aria-hidden="true" />
          </div>
          <ul class="fds__list mi:grid mi:gap-px mi:m-0 mi:p-0 mi:[list-style:none] mi:[.is-rail_&]:justify-items-center mi:[.is-rail_&]:gap-0.5">
            <li v-for="p in pinned" :key="p.id">
              <MiTooltip class="fds__tip" :content="p.label" :shortcut="'G ' + p.key" placement="right" :disabled="!collapsed">
                <button type="button" class="fds__item fds__pin mi:relative mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:h-9 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-1 mi:box-border mi:[border:0] mi:rounded-[10px] mi:[background:none] mi:text-label2 mi:text-left mi:cursor-pointer mi:[.is-rail_&]:h-9.5 mi:[.is-rail_&]:p-0 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :class="{ 'is-active': p.id === view }" :style="{ '--c': `var(--mi-${p.color})` }" :aria-current="p.id === view ? 'page' : undefined" :aria-label="collapsed ? p.label : undefined" @click="go(p.id)">
                  <span class="fds__glyph mi:[.fds__item.is-active_&]:text-p-text mi:grid mi:place-items-center mi:flex-[none] mi:w-7 mi:h-7"><span class="fds__pin-tile mi:grid mi:place-items-center mi:w-5.5 mi:h-5.5 mi:rounded-[7px] mi:text-[11px] mi:font-750 mi:text-(--c) mi:[background:color-mix(in_srgb,_var(--c)_16%,_transparent)] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--c)_26%,_transparent)] mi:[.is-rail_&]:h-6.5 mi:[.is-rail_&]:text-[12px]" aria-hidden="true">{{ p.label.charAt(0) }}</span></span>
                  <span class="fds__label fds__item-label mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">{{ p.label }}</span>
                  <MiKbdGroup class="fds__label fds__keys fds__hint mi:flex-[none] mi:opacity-0 mi:[.fds__item:hover_&]:opacity-100 mi:[.fds__item:focus-visible_&]:opacity-100 mi:[.fds__item.is-active_&]:opacity-100" aria-hidden="true"><MiKbd>G</MiKbd><MiKbd>{{ p.key }}</MiKbd></MiKbdGroup>
                </button>
              </MiTooltip>
            </li>
          </ul>
        </nav>

        <!-- Usage: a segmented meter, folded into a ring when the dock is a rail. -->
        <MiTooltip class="fds__tip" :content="`Storage ${usedPct}% used · ${used.toFixed(1)} of ${quota} GB`" placement="right" :disabled="!collapsed">
          <div class="fds__usage mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:box-border mi:p-3 mi:rounded-[14px] mi:[background:var(--mi-fill4)] mi:[outline:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:[.is-rail_&]:h-10 mi:[.is-rail_&]:rounded-[12px]" role="meter" aria-label="Storage used" :aria-valuenow="usedPct" aria-valuemin="0" aria-valuemax="100" :aria-valuetext="`${used.toFixed(1)} of ${quota} GB used`" tabindex="0">
            <svg class="fds__ring mi:hidden mi:w-7.5 mi:h-7.5 mi:transform-[rotate(-90deg)]" viewBox="0 0 36 36" aria-hidden="true">
              <circle cx="18" cy="18" r="14" pathLength="100" class="fds__ring-track mi:[.fds__ring_&]:fill-[color:none] mi:[.fds__ring_&]:[stroke-width:4] mi:stroke-fill2" />
              <circle cx="18" cy="18" r="14" pathLength="100" class="fds__ring-fill mi:[.fds__ring_&]:fill-[color:none] mi:[.fds__ring_&]:[stroke-width:4] mi:stroke-p mi:[stroke-linecap:round]" :stroke-dasharray="`${usedPct} 100`" />
            </svg>
            <div class="fds__label fds__usage-body mi:grid mi:gap-2 mi:flex-1 mi:min-w-0">
              <div class="fds__usage-top mi:flex mi:items-baseline mi:justify-between mi:gap-2">
                <MiText as="span" variant="footnote" weight="semibold">Storage</MiText>
                <MiText as="span" variant="caption" tone="label2" tabular>{{ used.toFixed(1) }} / {{ quota }} GB</MiText>
              </div>
              <div class="fds__bar mi:flex mi:gap-0.5 mi:h-1.5" aria-hidden="true">
                <span class="mi:[.fds__bar_&]:rounded-[3px]" v-for="s in storage" :key="s.label" :style="{ flexGrow: s.gb, background: `var(--mi-${s.color})` }" />
                <span class="fds__bar-free mi:[.fds__bar_&]:rounded-[3px] mi:[.fds__bar_&]:[background:var(--mi-fill2)]" :style="{ flexGrow: quota - used }" />
              </div>
              <ul class="fds__legend mi:flex mi:flex-wrap mi:gap-y-1 mi:gap-x-2.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[11px] mi:text-label2">
                <li class="mi:[.fds__legend_&]:inline-flex mi:[.fds__legend_&]:items-center mi:[.fds__legend_&]:gap-[5px]" v-for="s in storage" :key="s.label"><i class="mi:[.fds__legend_&]:w-1.5 mi:[.fds__legend_&]:h-1.5 mi:[.fds__legend_&]:rounded-[2px]" :style="{ background: `var(--mi-${s.color})` }" />{{ s.label }}</li>
              </ul>
            </div>
          </div>
        </MiTooltip>

        <div class="fds__me mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:pt-1.5 mi:pr-0.5 mi:pb-0 mi:pl-1 mi:box-border">
          <MiAvatar name="Maren Ruiz" size="sm" tone="auto" decorative />
          <span class="fds__label fds__me-text mi:grid mi:flex-1 mi:min-w-0 mi:leading-tight">
            <span class="fds__me-name mi:text-[13px] mi:font-semibold">Maren Ruiz</span>
            <span class="fds__me-mail mi:text-[11.5px] mi:text-label2">Product lead</span>
          </span>
          <MiIconButton class="fds__label" size="small" variant="plain" label="Settings"><MiIcon name="settings" :size="17" /></MiIconButton>
        </div>
      </aside>
      <div class="fds__scrim mi:absolute mi:inset-0 mi:z-2 mi:[background:var(--mi-scrim)] mi:opacity-100 mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:[.is-rail_&]:opacity-0 mi:[.is-rail_&]:pointer-events-none mi:@[720px]:hidden" aria-hidden="true" @click="collapsed = true" />

      <main class="fds__main mi:relative mi:min-w-0 mi:flex mi:flex-col mi:gap-4.5 mi:pt-6 mi:pr-4 mi:pb-5 mi:pl-4 mi:overflow-hidden mi:@[720px]:pt-8 mi:@[720px]:pr-8 mi:@[720px]:pb-6 mi:@[720px]:pl-7" aria-labelledby="fds-title">
        <header class="fds__bar-top mi:flex mi:[align-items:flex-end] mi:justify-between mi:gap-3">
          <div class="fds__title mi:grid mi:gap-0.5 mi:min-w-0">
            <MiText as="span" variant="caption" tone="label2" weight="medium"><span class="fds__ws-crumb mi:hidden mi:@[720px]:inline">{{ currentWs.label }} · </span>{{ page.kind }}</MiText>
            <MiText id="fds-title" as="h3" variant="title2" weight="bold">{{ page.label }}</MiText>
          </div>
          <MiButton size="small" variant="tinted">
            <template #leading><MiIcon name="plus" :size="15" /></template>
            New issue
          </MiButton>
        </header>

        <dl class="fds__stats mi:grid mi:grid-cols-3 mi:gap-2 mi:m-0">
          <div class="mi:[.fds__stats_&]:grid mi:[.fds__stats_&]:gap-0.5 mi:[.fds__stats_&]:min-w-0 mi:[.fds__stats_&]:rounded-[14px] mi:[.fds__stats_&]:[background:color-mix(in_srgb,_var(--mi-card)_60%,_transparent)] mi:[.fds__stats_&]:shadow-[inset_0_0_0_1px_var(--mi-sep)]" v-for="st in stats" :key="st.k"><dt class="mi:[.fds__stats_&]:text-[11.5px] mi:[.fds__stats_&]:text-label2 mi:[.fds__stats_&]:whitespace-nowrap mi:[.fds__stats_&]:overflow-hidden mi:[.fds__stats_&]:text-ellipsis">{{ st.k }}</dt><dd class="mi:[.fds__stats_&]:m-0 mi:[.fds__stats_&]:text-[22px] mi:[.fds__stats_&]:font-bold mi:[.fds__stats_&]:tabular-nums">{{ st.v }}</dd></div>
        </dl>

        <ul class="fds__rows mi:grid mi:m-0 mi:py-1 mi:px-0 mi:[list-style:none] mi:rounded-[16px] mi:[background:var(--mi-card)] mi:shadow-1" :aria-label="page.label">
          <li v-for="r in rows" :key="r.id" class="fds__row mi:grid mi:grid-cols-[10px_minmax(0,_1fr)_auto] mi:[grid-template-areas:'dot_title_who'_'._id_due'] mi:items-center mi:gap-y-0.5 mi:gap-x-3 mi:py-3 mi:px-3.5 mi:[.fds__row+&]:border-t mi:[.fds__row+&]:border-t-sep mi:@[720px]:grid-cols-[10px_64px_minmax(0,_1fr)_56px_24px] mi:@[720px]:[grid-template-areas:'dot_id_title_due_who'] mi:@[720px]:py-3 mi:@[720px]:px-4.5">
            <span class="fds__state mi:[grid-area:dot] mi:w-2.5 mi:h-2.5 mi:rounded-[50%] mi:box-border mi:[border:2px_solid_var(--c)] mi:[background:color-mix(in_srgb,_var(--c)_30%,_transparent)]" :style="{ '--c': `var(--mi-${r.color})` }" :aria-label="r.state" role="img" />
            <span class="fds__row-id mi:[grid-area:id] mi:text-[11.5px] mi:text-label3 mi:tabular-nums mi:tracking-[.02em]">{{ r.id }}</span>
            <span class="fds__row-title mi:[grid-area:title] mi:text-[14px] mi:font-medium mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">{{ r.title }}</span>
            <span class="fds__row-due mi:[grid-area:due] mi:text-[12px] mi:text-label2 mi:tabular-nums mi:text-right">{{ r.due }}</span>
            <MiAvatar :name="r.owner" size="xs" tone="auto" />
          </li>
        </ul>

        <!-- Leader-key hint: press G, then a letter. -->
        <div class="fds__leader mi:absolute mi:left-4 mi:right-4 mi:bottom-4.5 mi:flex mi:flex-wrap mi:items-center mi:gap-y-1.5 mi:gap-x-2.5 mi:py-2.5 mi:px-3 mi:rounded-[14px] mi:text-[12px] mi:text-label2 mi:[background:var(--mi-mat)] mi:[backdrop-filter:blur(16px)] mi:shadow-2 mi:opacity-0 mi:transform-[translateY(8px)] mi:pointer-events-none mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)] mi:[&.is-on]:opacity-100 mi:[&.is-on]:transform-none mi:@[720px]:left-7 mi:@[720px]:right-auto mi:@[720px]:max-w-[calc(100%_-_60px)]" :class="{ 'is-on': leader }" role="status" aria-live="polite">
          <template v-if="leader">
            <MiKbd>G</MiKbd>
            <span>then</span>
            <span v-for="k in allKeys" :key="k.key" class="fds__leader-key mi:inline-flex mi:items-center mi:gap-[5px] mi:text-label"><MiKbd>{{ k.key }}</MiKbd>{{ k.label }}</span>
          </template>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type Icon = 'home' | 'tray' | 'person' | 'calendar' | 'folder' | 'people'
interface NavItem { id: string, label: string, icon: Icon, count?: number, key?: string, kind: string }
interface Pin { id: string, label: string, color: string, key: string, kind: string }

const workspaces = [
  { value: 'tw', label: 'Tidewater Labs', initials: 'TL', plan: 'Team plan · 24 seats' },
  { value: 'fh', label: 'Fernhill Studio', initials: 'FS', plan: 'Free plan · 3 seats' }
]
const workspace = ref<string | number | undefined>('tw')
const currentWs = computed(() => workspaces.find(w => w.value === workspace.value) ?? workspaces[0]!)

const nav: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', kind: 'Overview' },
  { id: 'inbox', label: 'Inbox', icon: 'tray', count: 4, key: 'I', kind: 'Notifications' },
  { id: 'mine', label: 'My issues', icon: 'person', key: 'M', kind: 'Assigned to you' },
  { id: 'cycles', label: 'Cycles', icon: 'calendar', kind: 'Cycle 31 · ends Friday' },
  { id: 'projects', label: 'Projects', icon: 'folder', key: 'P', kind: '12 active' },
  { id: 'team', label: 'Team', icon: 'people', kind: '24 members' }
]
const pinned: Pin[] = [
  { id: 'checkout', label: 'Checkout v2', color: 'pink', key: 'C', kind: 'Project' },
  { id: 'android', label: 'Android crash rate', color: 'green', key: 'A', kind: 'View' },
  { id: 'q1', label: 'Q1 2027 planning', color: 'indigo', key: 'Q', kind: 'Doc' }
]
const allKeys = [...nav, ...pinned].filter(n => n.key).map(n => ({ key: n.key!, label: n.label }))

const storage = [
  { label: 'Attachments', gb: 21.6, color: 'p' },
  { label: 'Recordings', gb: 12.1, color: 'teal' },
  { label: 'Exports', gb: 4.7, color: 'orange' }
]
const quota = 50
const used = storage.reduce((a, s) => a + s.gb, 0)
const usedPct = Math.round((used / quota) * 100)

const pool = [
  { id: 'TID-482', title: 'Card form loses focus after 3-D Secure redirect', state: 'In progress', color: 'orange', due: 'Nov 4', owner: 'Maren Ruiz' },
  { id: 'TID-479', title: 'Show saved addresses before the postcode lookup', state: 'In review', color: 'indigo', due: 'Nov 6', owner: 'Kofi Mensah' },
  { id: 'TID-471', title: 'ANR on cold start when offline cache is empty', state: 'Todo', color: 'label3', due: 'Nov 8', owner: 'Ilse Brandt' },
  { id: 'TID-468', title: 'Retry webhook delivery with exponential backoff', state: 'In progress', color: 'orange', due: 'Nov 9', owner: 'Maren Ruiz' },
  { id: 'TID-455', title: 'Draft pricing experiments for Q1 planning', state: 'Done', color: 'green', due: 'Oct 30', owner: 'Ana Sobral' },
  { id: 'TID-451', title: 'Audit empty states across billing settings', state: 'Todo', color: 'label3', due: 'Nov 12', owner: 'Kofi Mensah' },
  { id: 'TID-447', title: 'Apple Pay button misaligned on narrow carts', state: 'In review', color: 'indigo', due: 'Nov 5', owner: 'Ilse Brandt' }
]

const view = ref('mine')
const pages = [...nav, ...pinned]
const page = computed(() => pages.find(p => p.id === view.value) ?? pages[0]!)
const rows = computed(() => {
  const i = pages.findIndex(p => p.id === view.value)
  return [...pool.slice(i % pool.length), ...pool.slice(0, i % pool.length)].slice(0, 5)
})

const stats = computed(() => {
  const r = rows.value
  return [
    { k: 'Open', v: r.filter(x => x.state !== 'Done').length },
    { k: 'In review', v: r.filter(x => x.state === 'In review').length },
    { k: 'Due soon', v: r.filter(x => ['Nov 4', 'Nov 5', 'Nov 6', 'Nov 8'].includes(x.due)).length }
  ]
})

const collapsed = ref(false)
function go(id: string) {
  view.value = id
  if (narrow.value) collapsed.value = true
}

// G then a letter jumps to a destination, like a leader key.
const leader = ref(false)
let leaderTimer: ReturnType<typeof setTimeout> | undefined
function onKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  if (e.metaKey || e.ctrlKey || e.altKey || t.closest('input, textarea, [contenteditable="true"]')) return
  const k = e.key.toUpperCase()
  if (e.key === '[') { collapsed.value = !collapsed.value; return }
  if (leader.value) {
    const hit = allKeys.find(x => x.key === k)
    const dest = [...nav, ...pinned].find(n => n.key === k)
    leader.value = false
    clearTimeout(leaderTimer)
    if (hit && dest) { e.preventDefault(); go(dest.id) }
    return
  }
  if (k === 'G') {
    leader.value = true
    clearTimeout(leaderTimer)
    leaderTimer = setTimeout(() => { leader.value = false }, 1600)
  }
}

// Narrow containers start as a rail; expanding then floats the dock over the page.
const rootEl = ref<HTMLElement>()
const narrow = ref(false)
let ro: ResizeObserver | undefined
onMounted(() => {
  ro = new ResizeObserver(([entry]) => {
    const isNarrow = (entry?.contentRect.width ?? 0) < 720
    if (isNarrow && !narrow.value) collapsed.value = true
    narrow.value = isNarrow
  })
  if (rootEl.value) ro.observe(rootEl.value)
})
onBeforeUnmount(() => { ro?.disconnect(); clearTimeout(leaderTimer) })
</script>

<style scoped>
.is-rail .fds__label { display: none; }
.fds__dock .fds__label { animation: fds-fade var(--mi-dur-3) var(--mi-ease) both; }
@keyframes fds-fade { from { opacity: 0; transform: translateX(-4px); } }

.fds__dock :deep(.fds__tip) { display: flex; justify-content: center; width: 100%; }
.fds__ws-chev { flex: none; }

.fds__search { font: inherit; font-size: 13px;
}
.is-rail .fds__search { width: 40px; justify-content: center; }
.fds__item { font: inherit; font-size: 13.5px; font-weight: 500;
}
.fds__item:hover { color: var(--mi-label); background: var(--mi-fill4); }
.fds__item.is-active { color: var(--mi-label); background: var(--mi-p-tint); }
.is-rail .fds__item { width: 40px; justify-content: center; }
.fds__hint { transition: opacity var(--mi-dur-2) var(--mi-ease); }
.is-rail .fds__section { padding: 8px 0 6px; justify-content: center; }
.fds__eyebrow { text-transform: uppercase; letter-spacing: .08em; }
.is-rail .fds__rule { flex: none; width: 20px; }
.is-rail .fds__pin-tile { width: 26px; }
.is-rail .fds__usage { width: 40px; padding: 0; justify-content: center; }
.is-rail .fds__ring { display: block; }
.fds__bar span { flex-basis: 0; }
.is-rail .fds__me { justify-content: center; padding: 6px 0 0; }
.fds__stats div { padding: 10px 11px; }
.fds__stats dd { letter-spacing: -.02em; }
.fds__row > :last-child { grid-area: who; justify-self: end; }

@container (min-width: 720px) {
  .fds__stats div { padding: 12px 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .fds__dock .fds__label { animation: none; }
}
</style>

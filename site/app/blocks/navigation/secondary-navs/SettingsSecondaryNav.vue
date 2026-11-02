<template>
  <div class="sn">
    <header class="sn__head">
      <MiBreadcrumb :items="crumbs" />
      <MiText variant="title2" as="h2" weight="bold">Settings</MiText>
    </header>

    <div class="sn__layout">
      <!-- One nav, two shapes: grouped column when wide, scrolling strip when narrow. -->
      <nav class="sn__nav" aria-label="Settings sections">
        <div v-for="g in groups" :key="g.label" class="sn__group">
          <MiText as="span" variant="caption" tone="label3" weight="semibold" class="sn__group-label">{{ g.label }}</MiText>
          <button
            v-for="it in g.items" :key="it.id" type="button" class="sn__item" :aria-current="current === it.id ? 'page' : undefined"
            @click="current = it.id"
          >
            <MiIcon :name="it.icon" :size="17" />
            <span class="sn__item-label">{{ it.label }}</span>
            <span v-if="it.id === 'notifications' && dirty" class="sn__dirty" aria-label="Unsaved changes" role="img" />
            <MiBadge v-else-if="it.count" :count="it.count" tone="neutral" variant="tint" :count-noun="it.label.toLowerCase()" />
            <MiBadge v-else-if="it.isNew" label="New" tone="primary" variant="tint" shape="pill" />
          </button>
        </div>
      </nav>

      <section class="sn__panel" :aria-labelledby="'sn-h-' + current">
        <MiText :id="'sn-h-' + current" variant="title3" as="h3" weight="semibold">{{ active.label }}</MiText>
        <MiText variant="footnote" tone="label2">{{ active.desc }}</MiText>

        <div v-if="current === 'general'" class="sn__stack">
          <MiField label="Workspace name"><MiInput v-model="name" /></MiField>
          <MiField label="Default time zone"><MiInput model-value="Europe/Lisbon (UTC+0)" disabled /></MiField>
        </div>

        <ul v-else-if="current === 'members'" class="sn__rows">
          <li v-for="m in members" :key="m.name" class="sn__row">
            <MiAvatar :name="m.name" size="sm" tone="auto" decorative />
            <span class="sn__row-text"><strong>{{ m.name }}</strong><span>{{ m.email }}</span></span>
            <MiBadge :label="m.role" :tone="m.role === 'Owner' ? 'primary' : 'neutral'" variant="outline" />
          </li>
        </ul>

        <div v-else-if="current === 'notifications'" class="sn__stack">
          <div v-for="n in notices" :key="n.id" class="sn__switch">
            <span class="sn__row-text"><strong>{{ n.label }}</strong><span>{{ n.hint }}</span></span>
            <MiSwitch v-model="prefs[n.id]" size="compact" :label="n.label" />
          </div>
          <div v-if="dirty" class="sn__save" role="status">
            <MiText as="span" variant="footnote" weight="medium">You have unsaved changes</MiText>
            <span class="sn__save-actions">
              <MiButton variant="plain" size="small" @click="discard">Discard</MiButton>
              <MiButton size="small" @click="save">Save</MiButton>
            </span>
          </div>
        </div>

        <div v-else-if="current === 'billing'" class="sn__stack">
          <MiMeter :value="38" :max="50" label="Seats" caption="38 of 50 used" hint="Renews Apr 1" />
          <MiMeter :value="212" :max="250" label="Automation runs" caption="212k of 250k" hint="85% used" color="var(--mi-orange)" />
        </div>

        <MiSkeleton v-else variant="text" :lines="['80%', '64%', '90%', '45%']" :animated="false" class="sn__skel" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Icon = 'settings' | 'people' | 'bell' | 'billing' | 'widgets' | 'lock' | 'globe'
interface Item { id: string, label: string, icon: Icon, desc: string, count?: number, isNew?: boolean }

const crumbs = [{ label: 'Harbor Freight', href: '#' }, { label: 'Settings' }]
const groups: { label: string, items: Item[] }[] = [
  {
    label: 'Workspace', items: [
      { id: 'general', label: 'General', icon: 'settings', desc: 'Name, time zone and the address people use to sign in.' },
      { id: 'members', label: 'Members', icon: 'people', count: 24, desc: 'Who can sign in, and what each person can change.' },
      { id: 'billing', label: 'Billing', icon: 'billing', desc: 'Your plan, seats and usage this period.' }
    ]
  },
  {
    label: 'Personal', items: [
      { id: 'notifications', label: 'Notifications', icon: 'bell', desc: 'What we tell you about, and where.' },
      { id: 'security', label: 'Security', icon: 'lock', desc: 'Passkeys, sessions and two-step sign in.' }
    ]
  },
  {
    label: 'Developers', items: [
      { id: 'integrations', label: 'Integrations', icon: 'widgets', isNew: true, desc: 'Connect Slack, Linear and 40 more tools.' },
      { id: 'domains', label: 'Domains', icon: 'globe', desc: 'Verified domains for single sign-on.' }
    ]
  }
]
const all = groups.flatMap(g => g.items)

const members = [
  { name: 'Noor Haddad', email: 'noor@harborfreight.co', role: 'Owner' },
  { name: 'Jonas Weber', email: 'jonas@harborfreight.co', role: 'Admin' },
  { name: 'Aylin Kaya', email: 'aylin@harborfreight.co', role: 'Member' }
]
const notices = [
  { id: 'mentions', label: 'Mentions and replies', hint: 'Push and email, right away' },
  { id: 'digest', label: 'Daily digest', hint: 'Email at 8:00, skipped on weekends' },
  { id: 'sla', label: 'SLA breaches', hint: 'Push only, for your teams' }
] as const

const current = ref('notifications')
const active = computed(() => all.find(i => i.id === current.value)!)
const name = ref('Harbor Freight Ops')

const saved = reactive({ mentions: true, digest: false, sla: true })
const prefs = reactive({ ...saved })
const dirty = computed(() => (Object.keys(saved) as (keyof typeof saved)[]).some(k => saved[k] !== prefs[k]))
function discard() { Object.assign(prefs, saved) }
function save() { Object.assign(saved, { ...prefs }) }
</script>

<style scoped>
.sn { container-type: inline-size; display: grid; align-content: start; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.sn__head { display: grid; gap: 6px; padding: 18px 14px 6px; }
.sn__layout { display: grid; min-width: 0; }

.sn__nav {
  display: flex; gap: 4px; padding: 8px 14px; overflow-x: auto; scrollbar-width: none; border-bottom: 1px solid var(--mi-sep);
}
.sn__group { display: contents; }
.sn__group-label { display: none; }
.sn__item {
  position: relative; display: inline-flex; flex: none; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border: 0; border-radius: 10px;
  font: inherit; font-size: 14px; font-weight: 500; color: var(--mi-label2); background: none; cursor: pointer; white-space: nowrap;
}
.sn__item:hover { color: var(--mi-label); background: var(--mi-fill4); }
.sn__item:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.sn__item[aria-current="page"] { color: var(--mi-p-text); background: var(--mi-p-tint); }
.sn__item-label { flex: 1; text-align: start; }
.sn__dirty { width: 8px; height: 8px; border-radius: 50%; background: var(--mi-orange); box-shadow: 0 0 0 3px color-mix(in srgb, var(--mi-orange) 22%, transparent); }

.sn__panel { display: grid; align-content: start; gap: 4px; min-width: 0; margin: 14px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.sn__stack { display: grid; gap: 16px; margin-top: 16px; }
.sn__rows { display: grid; margin: 12px 0 0; padding: 0; list-style: none; }
.sn__row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 10px 0; }
.sn__row + .sn__row { border-top: 1px solid var(--mi-sep); }
.sn__row-text { display: grid; min-width: 0; font-size: 14px; }
.sn__row-text strong { font-weight: 600; }
.sn__row-text span { overflow: hidden; font-size: 12px; color: var(--mi-label3); white-space: nowrap; text-overflow: ellipsis; }
.sn__switch { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.sn__save {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 10px 10px 14px; border-radius: var(--mi-radius-m);
  background: color-mix(in srgb, var(--mi-orange) 10%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mi-orange) 30%, transparent);
}
.sn__save-actions { display: flex; gap: 6px; }
.sn__skel { margin-top: 16px; }

@container (min-width: 720px) {
  .sn__head { padding: 24px 24px 12px; }
  .sn__layout { grid-template-columns: 220px minmax(0, 1fr); gap: 8px; padding: 0 24px 24px 16px; align-items: start; }
  .sn__nav { display: grid; gap: 14px; padding: 6px 0; overflow: visible; border: 0; }
  .sn__group { display: grid; gap: 2px; }
  .sn__group-label { display: block; padding: 0 12px 4px; text-transform: uppercase; letter-spacing: .05em; font-size: 11px; }
  .sn__item { display: flex; width: 100%; }
  .sn__panel { margin: 0; padding: 24px 28px; }
}
</style>

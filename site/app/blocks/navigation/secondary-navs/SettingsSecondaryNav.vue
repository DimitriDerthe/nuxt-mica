<template>
  <div class="mi:@container mi:grid mi:content-start mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]">
    <header class="mi:grid mi:gap-1.5 mi:pt-4.5 mi:px-3.5 mi:pb-1.5 mi:@[720px]:pt-6 mi:@[720px]:px-6 mi:@[720px]:pb-3">
      <MiBreadcrumb :items="crumbs" />
      <MiText variant="title2" as="h2" weight="bold">Settings</MiText>
    </header>

    <div class="mi:grid mi:min-w-0 mi:@[720px]:grid-cols-[220px_minmax(0,_1fr)] mi:@[720px]:gap-2 mi:@[720px]:pt-0 mi:@[720px]:pr-6 mi:@[720px]:pb-6 mi:@[720px]:pl-4 mi:@[720px]:items-start">
      <!-- One nav, two shapes: grouped column when wide, scrolling strip when narrow. -->
      <nav class="mi:flex mi:gap-1 mi:py-2 mi:px-3.5 mi:overflow-x-auto mi:[scrollbar-width:none] mi:border-b mi:border-b-sep mi:@[720px]:grid mi:@[720px]:gap-3.5 mi:@[720px]:py-1.5 mi:@[720px]:px-0 mi:@[720px]:overflow-visible mi:@[720px]:[border:0]" aria-label="Settings sections">
        <div v-for="g in groups" :key="g.label" class="mi:contents mi:@[720px]:grid mi:@[720px]:gap-0.5">
          <MiText as="span" variant="caption" tone="label3" weight="semibold" class="mi:hidden! mi:@[720px]:block! mi:@[720px]:uppercase! mi:@[720px]:tracking-[.05em]! mi:@[720px]:text-[11px]! mi:@[720px]:pt-0 mi:@[720px]:px-3 mi:@[720px]:pb-1">{{ g.label }}</MiText>
          <button
            v-for="it in g.items" :key="it.id" type="button" class="mi:relative mi:inline-flex mi:flex-[none] mi:items-center mi:gap-2 mi:h-9 mi:py-0 mi:px-3 mi:[border:0] mi:rounded-[10px] mi:[background:none] mi:[font:inherit] mi:text-[14px] mi:font-medium mi:cursor-pointer mi:whitespace-nowrap mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:@[720px]:flex mi:@[720px]:w-full" :class="current === it.id ? 'mi:text-p-text mi:bg-p-tint' : 'mi:text-label2 mi:hover:text-label mi:hover:bg-fill4'" :aria-current="current === it.id ? 'page' : undefined"
            @click="current = it.id"
          >
            <MiIcon :name="it.icon" :size="17" />
            <span class="mi:flex-1 mi:text-start">{{ it.label }}</span>
            <span v-if="it.id === 'notifications' && dirty" class="mi:w-2 mi:h-2 mi:rounded-[50%] mi:[background:var(--mi-orange)] mi:shadow-[0_0_0_3px_color-mix(in_srgb,_var(--mi-orange)_22%,_transparent)]" aria-label="Unsaved changes" role="img" />
            <MiBadge v-else-if="it.count" :count="it.count" tone="neutral" variant="tint" :count-noun="it.label.toLowerCase()" />
            <MiBadge v-else-if="it.isNew" label="New" tone="primary" variant="tint" shape="pill" />
          </button>
        </div>
      </nav>

      <section class="mi:grid mi:content-start mi:gap-1 mi:min-w-0 mi:m-3.5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[720px]:m-0 mi:@[720px]:py-6 mi:@[720px]:px-7" :aria-labelledby="'sn-h-' + current">
        <MiText :id="'sn-h-' + current" variant="title3" as="h3" weight="semibold">{{ active.label }}</MiText>
        <MiText variant="footnote" tone="label2">{{ active.desc }}</MiText>

        <div v-if="current === 'general'" class="mi:grid mi:gap-4 mi:mt-4">
          <MiField label="Workspace name"><MiInput v-model="name" /></MiField>
          <MiField label="Default time zone"><MiInput model-value="Europe/Lisbon (UTC+0)" disabled /></MiField>
        </div>

        <ul v-else-if="current === 'members'" class="mi:grid mi:mt-3 mi:mx-0 mi:mb-0 mi:p-0 mi:[list-style:none]">
          <li v-for="m in members" :key="m.name" class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:py-2.5 mi:px-0 mi:not-first:border-t mi:not-first:border-t-sep">
            <MiAvatar :name="m.name" size="sm" tone="auto" decorative />
            <span class="mi:grid mi:min-w-0 mi:text-[14px]"><strong class="mi:font-semibold">{{ m.name }}</strong><span class="mi:text-[12px] mi:overflow-hidden mi:text-label3 mi:whitespace-nowrap mi:text-ellipsis">{{ m.email }}</span></span>
            <MiBadge :label="m.role" :tone="m.role === 'Owner' ? 'primary' : 'neutral'" variant="outline" />
          </li>
        </ul>

        <div v-else-if="current === 'notifications'" class="mi:grid mi:gap-4 mi:mt-4">
          <div v-for="n in notices" :key="n.id" class="mi:flex mi:items-center mi:justify-between mi:gap-3">
            <span class="mi:grid mi:min-w-0 mi:text-[14px]"><strong class="mi:font-semibold">{{ n.label }}</strong><span class="mi:text-[12px] mi:overflow-hidden mi:text-label3 mi:whitespace-nowrap mi:text-ellipsis">{{ n.hint }}</span></span>
            <MiSwitch v-model="prefs[n.id]" size="compact" :label="n.label" />
          </div>
          <div v-if="dirty" class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2 mi:pt-2.5 mi:pr-2.5 mi:pb-2.5 mi:pl-3.5 mi:rounded-md mi:[background:color-mix(in_srgb,_var(--mi-orange)_10%,_transparent)] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-orange)_30%,_transparent)]" role="status">
            <MiText as="span" variant="footnote" weight="medium">You have unsaved changes</MiText>
            <span class="mi:flex mi:gap-1.5">
              <MiButton variant="plain" size="small" @click="discard">Discard</MiButton>
              <MiButton size="small" @click="save">Save</MiButton>
            </span>
          </div>
        </div>

        <div v-else-if="current === 'billing'" class="mi:grid mi:gap-4 mi:mt-4">
          <MiMeter :value="38" :max="50" label="Seats" caption="38 of 50 used" hint="Renews Apr 1" />
          <MiMeter :value="212" :max="250" label="Automation runs" caption="212k of 250k" hint="85% used" color="var(--mi-orange)" />
        </div>

        <MiSkeleton v-else variant="text" :lines="['80%', '64%', '90%', '45%']" :animated="false" class="mi:mt-4!" />
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

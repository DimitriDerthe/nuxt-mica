<template>
  <section class="wss mi:@container mi:font-mi mi:text-label" aria-labelledby="wss-title">
    <MiText id="wss-title" as="h2" variant="headline" class="wss__sr mi:absolute mi:w-px mi:h-px mi:[clip-path:inset(50%)]">Workspace settings</MiText>
    <div class="wss__backdrop mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:place-items-center mi:min-h-140 mi:p-4 mi:rounded-xl mi:box-border mi:[background:radial-gradient(70%_60%_at_20%_10%,_var(--mi-p-tint),_transparent_70%),_color-mix(in_srgb,_var(--mi-scrim)_70%,_var(--mi-fill4))] mi:@[700px]:p-8">
      <div v-if="open" class="wss__shell mi:w-full mi:max-w-205">
        <MiSheet
          v-model="open" inline title="Workspace settings" cancel-label="Close" :confirm-label="dirty ? 'Save' : 'Saved'"
          :close-on-confirm="false" @confirm="save"
        >
          <div class="wss__body mi:grid mi:gap-3.5 mi:pt-1 mi:px-4 mi:pb-3 mi:@[640px]:grid-cols-[188px_minmax(0,_1fr)] mi:@[640px]:gap-5.5 mi:@[640px]:min-h-85">
            <nav class="wss__nav mi:flex mi:gap-1 mi:overflow-x-auto mi:[scrollbar-width:none] mi:-mx-1 mi:py-0.5 mi:px-1 mi:@[640px]:flex-col mi:@[640px]:overflow-visible mi:@[640px]:m-0 mi:@[640px]:pt-0 mi:@[640px]:pr-4 mi:@[640px]:pb-0 mi:@[640px]:pl-0 mi:@[640px]:border-r mi:@[640px]:border-r-sep" aria-label="Settings sections">
              <button
                v-for="s in sections" :key="s.id" type="button" class="wss__tab mi:relative mi:flex mi:items-center mi:gap-2 mi:flex-[none] mi:py-2 mi:px-3 mi:[border:0] mi:rounded-[10px] mi:[font:500_14px/1.2_var(--mi-font)] mi:text-label2 mi:[background:transparent] mi:cursor-pointer mi:whitespace-nowrap mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:[&.is-on]:text-p-text mi:[&.is-on]:font-semibold" :class="{ 'is-on': section === s.id }"
                :aria-current="section === s.id ? 'page' : undefined" @click="section = s.id"
              >
                <MiIcon :name="s.icon" :size="17" />
                <span>{{ s.label }}</span>
                <i v-if="changedIn(s.id)" class="wss__dot mi:w-1.5 mi:h-1.5 mi:rounded-[50%] mi:[background:var(--mi-orange)] mi:ml-auto" aria-label="Unsaved changes" />
              </button>
            </nav>

            <div class="wss__panel mi:grid mi:content-start mi:gap-4 mi:min-w-0">
              <template v-if="section === 'general'">
                <MiText as="h3" variant="headline" weight="semibold">General</MiText>
                <MiField label="Workspace name">
                  <template #default="{ id }"><MiInput :id="id" v-model="s.name" /></template>
                </MiField>
                <MiField label="Default language">
                  <template #default="{ id }"><MiNativeSelect :id="id" v-model="s.lang" :options="langs" /></template>
                </MiField>
                <div class="wss__row mi:flex mi:items-center mi:justify-between mi:gap-3.5 mi:py-3 mi:px-0 mi:border-t mi:border-t-sep">
                  <div><MiText variant="subheadline" weight="medium">Week starts on</MiText><MiText variant="caption" tone="label2">Used by calendars and reports</MiText></div>
                  <MiSegmented v-model="s.week" label="Week starts on" :options="[{ value: 'mon', label: 'Mon' }, { value: 'sun', label: 'Sun' }]" />
                </div>
              </template>

              <template v-else-if="section === 'notify'">
                <MiText as="h3" variant="headline" weight="semibold">Notifications</MiText>
                <div v-for="n in notifyRows" :key="n.key" class="wss__row mi:flex mi:items-center mi:justify-between mi:gap-3.5 mi:py-3 mi:px-0 mi:border-t mi:border-t-sep">
                  <div><MiText :id="'wss-n-' + n.key" variant="subheadline" weight="medium">{{ n.label }}</MiText><MiText variant="caption" tone="label2">{{ n.sub }}</MiText></div>
                  <MiSwitch v-model="s[n.key]" size="compact" :aria-labelledby="'wss-n-' + n.key" />
                </div>
              </template>

              <template v-else-if="section === 'members'">
                <MiText as="h3" variant="headline" weight="semibold">Members</MiText>
                <div v-for="m in members" :key="m.email" class="wss__member mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-2.5">
                  <MiAvatar :name="m.name" size="sm" tone="auto" decorative />
                  <div class="wss__member-text mi:min-w-0"><MiText variant="subheadline" weight="medium" :lines="1">{{ m.name }}</MiText><MiText variant="caption" tone="label2" :lines="1">{{ m.email }}</MiText></div>
                  <MiNativeSelect v-model="s.roles[m.email]" size="sm" :options="roleOptions" :aria-label="'Role for ' + m.name" class="wss__role" />
                </div>
                <div class="wss__row mi:flex mi:items-center mi:justify-between mi:gap-3.5 mi:py-3 mi:px-0 mi:border-t mi:border-t-sep">
                  <div><MiText id="wss-guests" variant="subheadline" weight="medium">Allow guests</MiText><MiText variant="caption" tone="label2">Guests see only the projects they're invited to</MiText></div>
                  <MiSwitch v-model="s.guests" size="compact" aria-labelledby="wss-guests" />
                </div>
              </template>

              <template v-else>
                <MiText as="h3" variant="headline" weight="semibold">Security</MiText>
                <div class="wss__row mi:flex mi:items-center mi:justify-between mi:gap-3.5 mi:py-3 mi:px-0 mi:border-t mi:border-t-sep">
                  <div><MiText id="wss-2fa" variant="subheadline" weight="medium">Require two-step verification</MiText><MiText variant="caption" tone="label2">{{ s.twofa ? 'Members without it are asked at next sign-in' : '4 of 12 members have it on' }}</MiText></div>
                  <MiSwitch v-model="s.twofa" size="compact" tone="success" aria-labelledby="wss-2fa" />
                </div>
                <MiField label="Sign members out after">
                  <template #default="{ id }"><MiNativeSelect :id="id" v-model="s.session" :options="sessions" /></template>
                </MiField>
                <MiAlert tone="secondary" title="SAML single sign-on" message="Available on the Scale plan. Your identity provider stays the source of truth." />
              </template>
            </div>
          </div>

          <template #footer>
            <div class="wss__foot mi:flex mi:items-center mi:justify-between mi:gap-2.5 mi:min-h-8 mi:py-2 mi:px-4 mi:border-t mi:border-t-sep" aria-live="polite">
              <MiText v-if="dirty" variant="footnote" weight="medium">{{ changes.length }} unsaved {{ changes.length === 1 ? 'change' : 'changes' }}</MiText>
              <MiText v-else variant="footnote" tone="label2">{{ savedAt ? 'Saved just now' : 'All changes saved' }}</MiText>
              <MiButton v-if="dirty" variant="plain" size="small" @click="discard">Discard</MiButton>
            </div>
          </template>
        </MiSheet>
      </div>
      <MiButton v-else variant="tinted" @click="open = true">Open workspace settings</MiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Section = 'general' | 'notify' | 'members' | 'security'
const sections: { id: Section, label: string, icon: 'settings' | 'bell' | 'people' | 'lock' }[] = [
  { id: 'general', label: 'General', icon: 'settings' },
  { id: 'notify', label: 'Notifications', icon: 'bell' },
  { id: 'members', label: 'Members', icon: 'people' },
  { id: 'security', label: 'Security', icon: 'lock' }
]
const langs = [{ value: 'en', label: 'English' }, { value: 'fr', label: 'Français' }, { value: 'de', label: 'Deutsch' }]
const sessions = [{ value: '7', label: '7 days' }, { value: '30', label: '30 days' }, { value: '90', label: '90 days' }]
const roleOptions = [{ value: 'admin', label: 'Admin' }, { value: 'member', label: 'Member' }, { value: 'guest', label: 'Guest' }]
const members = [
  { name: 'Yara Haddad', email: 'yara@brightwater.io' },
  { name: 'Felix Brandt', email: 'felix@brightwater.io' },
  { name: 'Mei Lin', email: 'mei@brightwater.io' }
]
const notifyRows = [
  { key: 'mentions' as const, label: 'Mentions and replies', sub: 'Push and email, instantly' },
  { key: 'digest' as const, label: 'Weekly digest', sub: 'Mondays at 08:00' },
  { key: 'billing' as const, label: 'Billing alerts', sub: 'Failed payments and plan limits' },
  { key: 'quiet' as const, label: 'Quiet hours', sub: 'Mute pushes 20:00–08:00' }
]

const fieldSection: Record<string, Section> = { name: 'general', lang: 'general', week: 'general', mentions: 'notify', digest: 'notify', billing: 'notify', quiet: 'notify', roles: 'members', guests: 'members', twofa: 'security', session: 'security' }
const initial = () => ({
  name: 'Brightwater Studio', lang: 'en' as string | number | null, week: 'mon' as string | number | null,
  mentions: true, digest: true, billing: true, quiet: false,
  roles: { 'yara@brightwater.io': 'admin', 'felix@brightwater.io': 'member', 'mei@brightwater.io': 'member' } as Record<string, string | number | null>,
  guests: false, twofa: false, session: '30' as string | number | null
})
type State = ReturnType<typeof initial>

const s = reactive<State>(initial())
const saved = ref<string>(JSON.stringify(s))
const section = ref<Section>('general')
const open = ref(true)
const savedAt = ref(false)

const changes = computed(() => {
  const base = JSON.parse(saved.value) as State
  return (Object.keys(s) as (keyof State)[]).filter(k => JSON.stringify(s[k]) !== JSON.stringify(base[k]))
})
const dirty = computed(() => changes.value.length > 0)
const changedIn = (id: Section) => changes.value.some(k => fieldSection[k] === id)

function save() { saved.value = JSON.stringify(s); savedAt.value = true }
function discard() { Object.assign(s, JSON.parse(saved.value) as State) }
</script>

<style scoped>
.wss__sr { overflow: hidden; white-space: nowrap; }
.wss__tab:hover { background: var(--mi-fill4); }
.wss__tab.is-on { background: var(--mi-p-tint); }
.wss__row > div:first-child { min-width: 0; }
.wss__role { width: 116px; }
</style>

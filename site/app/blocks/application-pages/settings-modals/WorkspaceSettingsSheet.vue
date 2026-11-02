<template>
  <section class="wss" aria-labelledby="wss-title">
    <MiText id="wss-title" as="h2" variant="headline" class="wss__sr">Workspace settings</MiText>
    <div class="wss__backdrop">
      <div v-if="open" class="wss__shell">
        <MiSheet
          v-model="open" inline title="Workspace settings" cancel-label="Close" :confirm-label="dirty ? 'Save' : 'Saved'"
          :close-on-confirm="false" @confirm="save"
        >
          <div class="wss__body">
            <nav class="wss__nav" aria-label="Settings sections">
              <button
                v-for="s in sections" :key="s.id" type="button" class="wss__tab" :class="{ 'is-on': section === s.id }"
                :aria-current="section === s.id ? 'page' : undefined" @click="section = s.id"
              >
                <MiIcon :name="s.icon" :size="17" />
                <span>{{ s.label }}</span>
                <i v-if="changedIn(s.id)" class="wss__dot" aria-label="Unsaved changes" />
              </button>
            </nav>

            <div class="wss__panel">
              <template v-if="section === 'general'">
                <MiText as="h3" variant="headline" weight="semibold">General</MiText>
                <MiField label="Workspace name">
                  <template #default="{ id }"><MiInput :id="id" v-model="s.name" /></template>
                </MiField>
                <MiField label="Default language">
                  <template #default="{ id }"><MiNativeSelect :id="id" v-model="s.lang" :options="langs" /></template>
                </MiField>
                <div class="wss__row">
                  <div><MiText variant="subheadline" weight="medium">Week starts on</MiText><MiText variant="caption" tone="label2">Used by calendars and reports</MiText></div>
                  <MiSegmented v-model="s.week" label="Week starts on" :options="[{ value: 'mon', label: 'Mon' }, { value: 'sun', label: 'Sun' }]" />
                </div>
              </template>

              <template v-else-if="section === 'notify'">
                <MiText as="h3" variant="headline" weight="semibold">Notifications</MiText>
                <div v-for="n in notifyRows" :key="n.key" class="wss__row">
                  <div><MiText :id="'wss-n-' + n.key" variant="subheadline" weight="medium">{{ n.label }}</MiText><MiText variant="caption" tone="label2">{{ n.sub }}</MiText></div>
                  <MiSwitch v-model="s[n.key]" size="compact" :aria-labelledby="'wss-n-' + n.key" />
                </div>
              </template>

              <template v-else-if="section === 'members'">
                <MiText as="h3" variant="headline" weight="semibold">Members</MiText>
                <div v-for="m in members" :key="m.email" class="wss__member">
                  <MiAvatar :name="m.name" size="sm" tone="auto" decorative />
                  <div class="wss__member-text"><MiText variant="subheadline" weight="medium" :lines="1">{{ m.name }}</MiText><MiText variant="caption" tone="label2" :lines="1">{{ m.email }}</MiText></div>
                  <MiNativeSelect v-model="s.roles[m.email]" size="sm" :options="roleOptions" :aria-label="'Role for ' + m.name" class="wss__role" />
                </div>
                <div class="wss__row">
                  <div><MiText id="wss-guests" variant="subheadline" weight="medium">Allow guests</MiText><MiText variant="caption" tone="label2">Guests see only the projects they're invited to</MiText></div>
                  <MiSwitch v-model="s.guests" size="compact" aria-labelledby="wss-guests" />
                </div>
              </template>

              <template v-else>
                <MiText as="h3" variant="headline" weight="semibold">Security</MiText>
                <div class="wss__row">
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
            <div class="wss__foot" aria-live="polite">
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
.wss { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.wss__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.wss__backdrop {
  display: grid; grid-template-columns: minmax(0, 1fr); place-items: center; min-height: 560px; padding: 16px; border-radius: var(--mi-radius-xl); box-sizing: border-box;
  background: radial-gradient(70% 60% at 20% 10%, var(--mi-p-tint), transparent 70%), color-mix(in srgb, var(--mi-scrim) 70%, var(--mi-fill4));
}
@container (min-width: 700px) { .wss__backdrop { padding: 32px; } }
.wss__shell { width: 100%; max-width: 820px; }

.wss__body { display: grid; gap: 14px; padding: 4px 16px 12px; }
@container (min-width: 640px) { .wss__body { grid-template-columns: 188px minmax(0, 1fr); gap: 22px; min-height: 340px; } }

.wss__nav { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; margin-inline: -4px; padding: 2px 4px; }
@container (min-width: 640px) { .wss__nav { flex-direction: column; overflow: visible; margin: 0; padding: 0 16px 0 0; border-right: 1px solid var(--mi-sep); } }
.wss__tab {
  position: relative; display: flex; align-items: center; gap: 8px; flex: none; padding: 8px 12px; border: 0; border-radius: 10px;
  font: 500 14px/1.2 var(--mi-font); color: var(--mi-label2); background: transparent; cursor: pointer; white-space: nowrap;
}
.wss__tab:hover { background: var(--mi-fill4); }
.wss__tab:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.wss__tab.is-on { color: var(--mi-p-text); background: var(--mi-p-tint); font-weight: 600; }
.wss__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mi-orange); margin-left: auto; }

.wss__panel { display: grid; align-content: start; gap: 16px; min-width: 0; }
.wss__row { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 0; border-top: 1px solid var(--mi-sep); }
.wss__row > div:first-child { min-width: 0; }
.wss__member { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px; }
.wss__member-text { min-width: 0; }
.wss__role { width: 116px; }
.wss__foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 32px; padding: 8px 16px; border-top: 1px solid var(--mi-sep); }
</style>

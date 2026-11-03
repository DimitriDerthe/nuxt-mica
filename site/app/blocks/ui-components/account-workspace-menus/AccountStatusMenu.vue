<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3 mi:font-mi mi:text-label" aria-labelledby="asm-title">
    <MiText id="asm-title" variant="headline" as="h2" class="mi:absolute mi:w-px mi:h-px mi:[clip-path:inset(50%)] mi:overflow-hidden mi:whitespace-nowrap">Account and status menu</MiText>

    <!-- Faux top bar: the avatar trigger carries the live presence dot. -->
    <div class="mi:grid mi:justify-items-end mi:gap-2 mi:pt-3 mi:px-3 mi:pb-5 mi:rounded-xl mi:[background:radial-gradient(90%_70%_at_100%_0%,_var(--mi-p-tint),_transparent_70%),_var(--mi-fill4)]">
      <div class="mi:flex mi:items-center mi:justify-between mi:gap-3 mi:w-full mi:pt-1.5 mi:pr-1.5 mi:pb-1.5 mi:pl-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
        <MiText variant="footnote" tone="label2" weight="medium">{{ account.org }}</MiText>
        <button type="button" class="mi:grid mi:place-items-center mi:p-[3px] mi:[border:0] mi:rounded-[50%] mi:[background:none] mi:cursor-pointer mi:shadow-[0_0_0_3px_var(--mi-p-tint)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :aria-expanded="open" aria-controls="asm-panel" :aria-label="'Account menu, ' + account.name + ', ' + current.label" @click="open = !open">
          <MiBadge dot-only :tone="current.tone" placement="bottom-right" :dot-size="11" :aria-label="current.label">
            <template #target><MiAvatar :name="account.name" size="sm" :tone="account.tone" decorative /></template>
          </MiBadge>
        </button>
      </div>

      <!-- The menu, pinned open under its trigger. -->
      <div v-show="open" id="asm-panel" class="mi:grid mi:gap-2.5 mi:w-full mi:p-3.5 mi:rounded-xl mi:[background:var(--mi-elev)] mi:shadow-3 mi:@[480px]:w-85" role="group" aria-label="Account">
        <div class="mi:flex mi:items-center mi:gap-3">
          <MiAvatar :name="account.name" size="md" :tone="account.tone" decorative />
          <div class="mi:grid mi:min-w-0">
            <MiText variant="headline" as="h3" :lines="1">{{ account.name }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">{{ account.email }}</MiText>
          </div>
        </div>

        <div class="mi:grid mi:gap-2.5">
          <MiSegmented v-model="status" label="Presence" :options="statusOptions" class="mi:w-full!" />
          <MiInput v-model="note" size="sm" clearable placeholder="What are you working on?" aria-label="Status message">
            <template #leading><MiIcon name="chat" :size="15" /></template>
          </MiInput>
          <div class="mi:flex mi:items-center mi:justify-between mi:gap-2.5 mi:min-h-8">
            <MiText as="span" variant="footnote" tone="label2">Clear status</MiText>
            <MiMenu v-model="clearAfter" variant="popup" :items="clearItems" aria-label="Clear status after" placement="bottom-end" />
          </div>
          <div class="mi:flex mi:items-center mi:justify-between mi:gap-2.5 mi:min-h-8">
            <MiText id="asm-mute" as="span" variant="footnote" tone="label2">Pause notifications</MiText>
            <MiSwitch v-model="muted" size="compact" aria-labelledby="asm-mute" />
          </div>
        </div>

        <MiSeparator />
        <MiList :grouped="false" header="Switch account">
          <MiListItem
            v-for="a in accounts" :key="a.email" button :title="a.org" :subtitle="a.email"
            :aria-current="a.email === account.email ? 'true' : undefined" @click="accountId = a.email"
          >
            <template #leading><MiAvatar :name="a.name" size="xs" :tone="a.tone" decorative /></template>
            <template #trailing><MiIcon v-if="a.email === account.email" name="check" :size="16" class="mi:text-p" /></template>
          </MiListItem>
        </MiList>
        <MiSeparator />
        <MiList :grouped="false" label="Account actions">
          <MiListItem button title="Profile and preferences" @click="log = 'Opening profile and preferences.'">
            <template #leading><MiIcon name="person" :size="18" /></template>
          </MiListItem>
          <MiListItem button title="Sign out" destructive @click="log = `Signed out of ${account.org}.`" />
        </MiList>
      </div>
    </div>

    <p class="mi:m-0 mi:text-[13px] mi:text-label2" aria-live="polite">{{ log }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Presence = 'online' | 'focus' | 'away' | 'offline'
type Tone = 'success' | 'danger' | 'warning' | 'neutral'
interface Account { name: string, email: string, org: string, tone: 'primary' | 'teal' }

const presence: Record<Presence, { label: string, tone: Tone }> = {
  online: { label: 'Online', tone: 'success' }, focus: { label: 'Focusing', tone: 'danger' },
  away: { label: 'Away', tone: 'warning' }, offline: { label: 'Offline', tone: 'neutral' }
}
const order: Presence[] = ['online', 'focus', 'away', 'offline']
const statusOptions = order.map(value => ({ value, label: value === 'focus' ? 'Focus' : presence[value].label }))
const clearItems = [
  { value: 'never', label: 'Never' }, { value: '30m', label: 'In 30 minutes' }, { value: '1h', label: 'In 1 hour' }, { value: 'today', label: 'End of today' }
]

const accounts: Account[] = [
  { name: 'Clara Lindqvist', email: 'clara@tidewater.studio', org: 'Tidewater Studio', tone: 'primary' },
  { name: 'Clara Lindqvist', email: 'clara.l@northfold.org', org: 'Northfold Collective', tone: 'teal' }
]

const open = ref(true)
const accountId = ref(accounts[0]!.email)
const status = ref<string | number | null>('focus')
const note = ref('Writing the Q4 brand review')
const clearAfter = ref<string | number | undefined>('1h')
const muted = ref(true)
const log = ref('Change your presence; the dot on the avatar follows it.')

const account = computed(() => accounts.find(a => a.email === accountId.value) ?? accounts[0]!)
const current = computed(() => presence[(status.value ?? 'online') as Presence])
</script>

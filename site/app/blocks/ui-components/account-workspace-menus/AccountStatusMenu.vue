<template>
  <section class="asm" aria-labelledby="asm-title">
    <MiText id="asm-title" variant="headline" as="h2" class="asm__sr">Account and status menu</MiText>

    <!-- Faux top bar: the avatar trigger carries the live presence dot. -->
    <div class="asm__stage">
      <div class="asm__bar">
        <MiText variant="footnote" tone="label2" weight="medium">{{ account.org }}</MiText>
        <button type="button" class="asm__trigger" :aria-expanded="open" aria-controls="asm-panel" :aria-label="'Account menu, ' + account.name + ', ' + current.label" @click="open = !open">
          <MiBadge dot-only :tone="current.tone" placement="bottom-right" :dot-size="11" :aria-label="current.label">
            <template #target><MiAvatar :name="account.name" size="sm" :tone="account.tone" decorative /></template>
          </MiBadge>
        </button>
      </div>

      <!-- The menu, pinned open under its trigger. -->
      <div v-show="open" id="asm-panel" class="asm__panel" role="group" aria-label="Account">
        <div class="asm__me">
          <MiAvatar :name="account.name" size="md" :tone="account.tone" decorative />
          <div class="asm__me-text">
            <MiText variant="headline" as="h3" :lines="1">{{ account.name }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">{{ account.email }}</MiText>
          </div>
        </div>

        <div class="asm__status">
          <MiSegmented v-model="status" label="Presence" :options="statusOptions" />
          <MiInput v-model="note" size="sm" clearable placeholder="What are you working on?" aria-label="Status message">
            <template #leading><MiIcon name="chat" :size="15" /></template>
          </MiInput>
          <div class="asm__row">
            <MiText as="span" variant="footnote" tone="label2">Clear status</MiText>
            <MiMenu v-model="clearAfter" variant="popup" :items="clearItems" aria-label="Clear status after" placement="bottom-end" />
          </div>
          <div class="asm__row">
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
            <template #trailing><MiIcon v-if="a.email === account.email" name="check" :size="16" class="asm__check" /></template>
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

    <p class="asm__log" aria-live="polite">{{ log }}</p>
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

<style scoped>
.asm { container-type: inline-size; display: grid; align-content: start; gap: 12px; font-family: var(--mi-font); color: var(--mi-label); }
.asm__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* Faux backdrop so the open menu reads as floating over an app. */
.asm__stage {
  display: grid; justify-items: end; gap: 8px; padding: 12px 12px 20px; border-radius: var(--mi-radius-xl);
  background: radial-gradient(90% 70% at 100% 0%, var(--mi-p-tint), transparent 70%), var(--mi-fill4);
}
.asm__bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; padding: 6px 6px 6px 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.asm__trigger { display: grid; place-items: center; padding: 3px; border: 0; border-radius: 50%; background: none; cursor: pointer; box-shadow: 0 0 0 3px var(--mi-p-tint); }
.asm__trigger:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

.asm__panel { display: grid; gap: 10px; width: 100%; padding: 14px; border-radius: var(--mi-radius-xl); background: var(--mi-elev); box-shadow: var(--mi-sh3); }
@container (min-width: 480px) { .asm__panel { width: 340px; } }
.asm__me { display: flex; align-items: center; gap: 12px; }
.asm__me-text { display: grid; min-width: 0; }
.asm__status { display: grid; gap: 10px; }
.asm__status > :first-child { width: 100%; }
.asm__row { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 32px; }
.asm__check { color: var(--mi-p); }

.asm__log { margin: 0; font-size: 13px; color: var(--mi-label2); }
</style>

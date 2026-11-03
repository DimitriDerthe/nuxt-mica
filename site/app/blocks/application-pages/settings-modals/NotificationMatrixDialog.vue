<template>
  <section class="nm mi:@container mi:relative mi:grid mi:content-start mi:min-h-full mi:font-mi mi:text-label" aria-labelledby="nm-title">
    <!-- Faux app behind the modal: the inbox the settings were opened from. -->
    <div class="nm__page mi:grid mi:content-start mi:gap-3 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1" :inert="open || undefined">
      <div class="nm__page-head mi:flex mi:items-center mi:justify-between mi:gap-2">
        <MiText id="nm-title" as="h2" variant="headline" weight="semibold">Inbox</MiText>
        <MiIconButton label="Notification settings" variant="gray" size="small" @click="open = true"><MiIcon class="mi:[.nm__feed_li>div&]:min-w-0" name="bell" :size="16" /></MiIconButton>
      </div>
      <ul class="nm__feed mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
        <li class="mi:[.nm__feed_li&]:gap-3 mi:[.nm__feed_li&]:border-t mi:[.nm__feed_li&]:border-t-sep mi:[.nm__feed_li&]:min-w-0" v-for="n in feed" :key="n.title">
          <MiAvatar class="mi:[.nm__feed_li&]:gap-3 mi:[.nm__feed_li&]:border-t mi:[.nm__feed_li&]:border-t-sep mi:[.nm__feed_li&]:min-w-0 mi:[.nm__feed_li>div&]:min-w-0" :name="n.who" size="sm" tone="auto" decorative />
          <div class="mi:[.nm__feed_li>div&]:min-w-0"><MiText class="mi:[.nm__feed_li&]:gap-3 mi:[.nm__feed_li&]:border-t mi:[.nm__feed_li&]:border-t-sep mi:[.nm__feed_li&]:min-w-0" variant="subheadline" weight="medium" :lines="1">{{ n.title }}</MiText><MiText class="mi:[.nm__feed_li&]:gap-3 mi:[.nm__feed_li&]:border-t mi:[.nm__feed_li&]:border-t-sep mi:[.nm__feed_li&]:min-w-0" variant="caption" tone="label2">{{ n.when }}</MiText></div>
        </li>
      </ul>
    </div>

    <div v-if="open" class="nm__scrim mi:absolute mi:inset-0 mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:place-items-center mi:p-4 mi:rounded-xl mi:[background:color-mix(in_srgb,_var(--mi-scrim)_85%,_transparent)] mi:overflow-auto">
      <MiDialog v-model="open" inline variant="dialog" title="Notify me about" icon="bell" :close-on-action="false">
        <!-- Matrix: one row per event, one column per channel; column headers toggle the whole channel. -->
        <table class="nm__matrix mi:w-full mi:border-collapse mi:text-start mi:text-[14px]">
          <caption class="nm__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Notification channels per event</caption>
          <thead>
            <tr>
              <th scope="col" class="nm__event mi:font-normal">Event</th>
              <th v-for="c in channels" :key="c.id" scope="col">
                <span class="nm__ch mi:block mi:mb-1">{{ c.label }}</span>
                <div class="nm__cell mi:flex mi:justify-center"><MiCheckbox :model-value="colAll(c.id)" :indeterminate="colSome(c.id)" @update:model-value="setCol(c.id, $event)">
                  <span class="nm__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">All {{ c.label }}</span>
                </MiCheckbox></div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in events" :key="e.id">
              <th scope="row" class="nm__event mi:font-normal">
                <span class="nm__event-name mi:block mi:font-medium">{{ e.label }}</span>
                <span class="nm__event-sub mi:block mi:text-[12px] mi:text-label2">{{ e.sub }}</span>
              </th>
              <td v-for="c in channels" :key="c.id">
                <div class="nm__cell mi:flex mi:justify-center"><MiCheckbox v-model="prefs[e.id][c.id]">
                  <span class="nm__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">{{ e.label }} by {{ c.label }}</span>
                </MiCheckbox></div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="nm__quiet mi:[.nm__feed_li>div&]:min-w-0 mi:flex mi:items-center mi:justify-between mi:gap-3 mi:mt-3.5 mi:text-start">
          <div>
            <MiText id="nm-quiet" variant="subheadline" weight="medium">Quiet hours</MiText>
            <MiText variant="caption" tone="label2">No push 22:00–07:00, Europe/Berlin</MiText>
          </div>
          <MiSwitch v-model="quiet" size="compact" aria-labelledby="nm-quiet" />
        </div>

        <template #actions="{ close }">
          <div class="nm__actions mi:[.nm__feed_li>div&]:min-w-0 mi:grid mi:gap-2 mi:w-full mi:justify-items-center">
            <MiText variant="caption" tone="label2" aria-live="polite">{{ changes ? `${changes} unsaved ${changes === 1 ? 'change' : 'changes'}` : savedNote }}</MiText>
            <MiButton block :disabled="!changes" @click="save">Save</MiButton>
            <MiButton variant="plain" block @click="discard(); close()">Cancel</MiButton>
          </div>
        </template>
      </MiDialog>
    </div>
    <div v-else class="nm__reopen mi:absolute mi:left-1/2 mi:bottom-4.5 mi:transform-[translateX(-50%)]">
      <MiButton variant="tinted" size="small" @click="open = true">Open notification settings</MiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, toRaw } from 'vue'

type ChannelId = 'email' | 'push' | 'slack'
type EventId = 'mention' | 'reply' | 'assign' | 'status' | 'digest' | 'billing'
type Prefs = Record<EventId, Record<ChannelId, boolean>>

const channels: { id: ChannelId, label: string }[] = [{ id: 'email', label: 'Email' }, { id: 'push', label: 'Push' }, { id: 'slack', label: 'Slack' }]
const events: { id: EventId, label: string, sub: string }[] = [
  { id: 'mention', label: 'Mentions', sub: '@you in any thread' },
  { id: 'reply', label: 'Replies', sub: 'Threads you started' },
  { id: 'assign', label: 'Assigned to you', sub: 'Tasks and reviews' },
  { id: 'status', label: 'Status changes', sub: 'Projects you follow' },
  { id: 'digest', label: 'Weekly digest', sub: 'Mondays, 08:00' },
  { id: 'billing', label: 'Billing', sub: 'Invoices and limits' }
]

const row = (email: boolean, push: boolean, slack: boolean) => ({ email, push, slack })
const initial: Prefs = {
  mention: row(true, true, true), reply: row(true, true, false), assign: row(true, false, true),
  status: row(false, false, true), digest: row(true, false, false), billing: row(true, false, false)
}
// toRaw unwraps the reactive proxy so structuredClone can copy it.
const clone = (p: Prefs): Prefs => structuredClone(toRaw(p))
const saved = ref<Prefs>(clone(initial))
const prefs = reactive<Prefs>(clone(initial))
const quiet = ref(true)
const savedQuiet = ref(true)
const open = ref(true)
const savedNote = ref('All changes saved')

const colAll = (c: ChannelId) => events.every(e => prefs[e.id][c])
const colSome = (c: ChannelId) => !colAll(c) && events.some(e => prefs[e.id][c])
function setCol (c: ChannelId, on: boolean) { for (const e of events) prefs[e.id][c] = on }

const changes = computed(() => events.reduce((n, e) => n + channels.filter(c => prefs[e.id][c.id] !== saved.value[e.id][c.id]).length, 0)
  + (quiet.value !== savedQuiet.value ? 1 : 0))

function save () { saved.value = clone(prefs); savedQuiet.value = quiet.value; savedNote.value = 'Saved just now' }
function discard () { Object.assign(prefs, clone(saved.value)); quiet.value = savedQuiet.value }

const feed = [
  { who: 'Nadia Petrova', title: 'Nadia mentioned you in “Q4 pricing page”', when: '2 min ago' },
  { who: 'Theo Grant', title: 'Theo assigned you “Review Stripe webhook retries”', when: '18 min ago' },
  { who: 'Mei Lin', title: 'Mei replied to “Onboarding checklist v3”', when: '1 h ago' }
]
</script>

<style scoped>
.nm__feed li { display: flex; align-items: center; padding: 12px 0; }
.nm__feed li > div { display: grid; }

.nm__scrim {
  -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
}
.nm__matrix th, .nm__matrix td { padding: 8px 0; border-bottom: 1px solid var(--mi-sep); text-align: center; vertical-align: middle; }
.nm__matrix thead th { padding-top: 0; font-size: 11px; font-weight: 600; color: var(--mi-label2); }
.nm__matrix td, .nm__matrix thead th:not(.nm__event) { width: 52px; }
th.nm__event { text-align: start; }
thead th.nm__event { vertical-align: bottom; }
</style>

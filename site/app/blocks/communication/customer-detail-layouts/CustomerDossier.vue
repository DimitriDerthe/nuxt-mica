<template>
  <section class="cd mi:@container mi:h-170 mi:font-mi mi:text-label mi:[background:var(--mi-page)]" aria-labelledby="cd-title">
    <div class="cd__shell mi:grid mi:h-full mi:grid-cols-[minmax(0,_1fr)] mi:@[960px]:grid-cols-[minmax(0,_1fr)_360px]" :class="{ 'is-profile': showProfile }">
      <div class="cd__conv mi:[.cd__shell.is-profile_&]:hidden mi:@[960px]:[.cd__shell_&]:flex mi:@[960px]:[.cd__shell.is-profile_&]:flex mi:flex mi:flex-col mi:min-w-0 mi:min-h-0">
        <header class="cd__head mi:flex mi:items-center mi:gap-3 mi:py-3 mi:px-4 mi:border-b mi:border-b-sep mi:[background:var(--mi-card)]">
          <MiAvatar name="Hana Kobayashi" size="sm" tone="teal" decorative />
          <div class="cd__head-text mi:flex-1 mi:min-w-0">
            <MiText id="cd-title" as="h2" variant="headline" weight="semibold" :lines="1">Hana Kobayashi</MiText>
            <MiText variant="caption" tone="label2" :lines="1">Kestrel Logistics · ticket #8812 · open 2h</MiText>
          </div>
          <MiButton class="cd__profile-btn" variant="gray" size="small" @click="showProfile = true">Profile</MiButton>
        </header>

        <MiMessageScroller class="cd__log" label="Conversation with Hana Kobayashi">
          <MiMarker variant="separator">Today</MiMarker>
          <MiMessageScrollerItem v-for="m in feed" :key="m.id" :message-id="'cd-' + m.id">
            <div v-if="m.kind === 'note'" class="cd__note mi:flex mi:gap-2.5 mi:mx-auto mi:max-w-[min(92%,_36rem)] mi:py-2.5 mi:px-3.5 mi:rounded-md mi:[border:1px_dashed_color-mix(in_srgb,_var(--mi-orange)_55%,_transparent)] mi:[background:color-mix(in_srgb,_var(--mi-orange)_10%,_transparent)] mi:text-label" role="note">
              <MiIcon class="mi:[.cd__note_p&]:text-[13.5px] mi:[.cd__note_p&]:leading-normal mi:[.cd__note_p&]:wrap-anywhere" name="lock" :size="14" />
              <div class="cd__note-body mi:min-w-0">
                <span class="cd__note-who mi:text-[11.5px] mi:font-semibold mi:text-orange-t">{{ m.who }} · internal note · {{ m.time }}</span>
                <p class="mi:[.cd__note_p&]:text-[13.5px] mi:[.cd__note_p&]:leading-normal mi:[.cd__note_p&]:wrap-anywhere">{{ m.text }}</p>
              </div>
            </div>
            <MiMessage v-else :align="m.kind === 'agent' ? 'end' : 'start'" :label="m.who" class="cd__row" :class="{ 'is-end': m.kind === 'agent' }">
              <template #avatar><MiAvatar :name="m.who" size="sm" :tone="m.kind === 'agent' ? 'primary' : 'teal'" decorative /></template>
              <MiBubble :align="m.kind === 'agent' ? 'end' : 'start'" :variant="m.kind === 'agent' ? 'default' : 'secondary'" class="cd__bub">{{ m.text }}</MiBubble>
              <template #footer>{{ m.time }}</template>
            </MiMessage>
          </MiMessageScrollerItem>
        </MiMessageScroller>

        <form class="cd__composer mi:pt-3 mi:px-4 mi:pb-4 mi:border-t mi:border-t-sep mi:[background:var(--mi-card)] mi:[&.is-note]:[background:color-mix(in_srgb,_var(--mi-orange)_9%,_var(--mi-card))]" :class="{ 'is-note': mode === 'note' }" @submit.prevent="send">
          <MiInputGroup
            v-model="draft" multiline :rows="2"
            :aria-label="mode === 'note' ? 'Internal note' : 'Reply to Hana'"
            :placeholder="mode === 'note' ? 'Only your team sees this…' : 'Reply to Hana…'"
          >
            <template #block-start>
              <MiSegmented v-model="mode" label="Message type" :options="modes" />
            </template>
            <template #block-end>
              <div class="cd__bar mi:flex mi:items-center mi:justify-between mi:gap-2 mi:w-full">
                <MiText variant="caption" tone="label3">{{ mode === 'note' ? 'Notes are added to the timeline' : 'Sent by email and in-app' }}</MiText>
                <MiButton type="submit" size="small" :disabled="!draft.trim()">{{ mode === 'note' ? 'Add note' : 'Send' }}</MiButton>
              </div>
            </template>
          </MiInputGroup>
        </form>
      </div>

      <aside class="cd__dossier mi:hidden mi:[.cd__shell.is-profile_&]:flex mi:@[960px]:[.cd__shell_&]:flex mi:@[960px]:[.cd__shell_&]:border-l mi:@[960px]:[.cd__shell_&]:border-l-sep mi:flex-col mi:min-h-0 mi:min-w-0 mi:[background:var(--mi-card)]" aria-labelledby="cd-dossier-title">
        <header class="cd__dossier-head mi:flex mi:items-center mi:gap-2.5 mi:min-h-15 mi:py-0 mi:px-4 mi:border-b mi:border-b-sep mi:box-border">
          <MiIconButton class="cd__back" label="Back to conversation" variant="gray" size="regular" @click="showProfile = false">
            <MiIcon name="chevron-left" />
          </MiIconButton>
          <MiText id="cd-dossier-title" as="h3" variant="subheadline" weight="semibold">Customer</MiText>
        </header>
        <div class="cd__dossier-scroll mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:grid mi:content-start mi:gap-5 mi:p-5">
          <div class="cd__id mi:flex mi:items-center mi:gap-3.5 mi:min-w-0">
            <MiAvatar name="Hana Kobayashi" size="lg" tone="teal" decorative />
            <div class="cd__id-text mi:grid mi:gap-0.5 mi:min-w-0">
              <MiText variant="title3" weight="bold">Hana Kobayashi</MiText>
              <MiText variant="footnote" tone="label2">Head of Operations, Kestrel Logistics</MiText>
              <MiText variant="caption" tone="label3">Osaka · 23:41 local time</MiText>
            </div>
          </div>

          <!-- The one thing to know before replying: health against renewal. -->
          <div class="cd__health mi:flex mi:items-center mi:gap-3.5 mi:p-3.5 mi:rounded-lg mi:[background:linear-gradient(135deg,_var(--mi-p-tint),_transparent_70%),_var(--mi-page)]">
            <MiProgressRing :value="health" :size="64" label="Account health" />
            <div>
              <MiText variant="subheadline" weight="semibold">Healthy, renewal in 23 days</MiText>
              <MiText variant="caption" tone="label2">Usage up 18% this quarter. Seat cap is the only blocker.</MiText>
            </div>
          </div>

          <MiMeter :value="46" :max="50" label="Seats" caption="46 of 50 used" hint="4 left" size="sm" />

          <MiDetails :items="facts" label-width="112px" />

          <div class="cd__tl mi:grid mi:gap-3">
            <MiText as="h4" variant="footnote" weight="semibold" tone="label2">Relationship timeline</MiText>
            <MiTimeline :items="timeline" aria-label="Relationship timeline" />
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Kind = 'customer' | 'agent' | 'note'
interface Entry { id: string, kind: Kind, who: string, time: string, text: string }
type TimelineTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
interface Touch { title: string, description: string, time: string, tone: TimelineTone, icon: 'chat' | 'billing' | 'calendar' | 'lock' | 'people' }

const modes = [{ value: 'reply', label: 'Reply' }, { value: 'note', label: 'Internal note' }]
const mode = ref<string | number | null>('reply')
const draft = ref('')
const showProfile = ref(false)
const health = 82

// Sample conversation and account data; swap for your CRM.
const feed = ref<Entry[]>([
  { id: '1', kind: 'customer', who: 'Hana Kobayashi', time: '21:38', text: 'We are onboarding the Kobe warehouse next week. That is 9 more people, and we only have 4 seats left.' },
  { id: '2', kind: 'customer', who: 'Hana Kobayashi', time: '21:39', text: 'Also, can the new team sign in with our Okta? IT will not create separate passwords.' },
  { id: '3', kind: 'note', who: 'Marcus Webb', time: '21:52', text: 'SSO is on Growth annual already, they just never configured it. Seat bump can be prorated.' },
  { id: '4', kind: 'agent', who: 'Léa Fontaine', time: '22:04', text: 'Good news on both. SSO is already included in your plan, I will send the Okta setup guide. For seats, I can add 10 today, prorated to your renewal on 25 November.' },
  { id: '5', kind: 'customer', who: 'Hana Kobayashi', time: '23:40', text: 'Perfect. Please add the 10 seats. Does the price change at renewal?' }
])

const facts = [
  { key: 'plan', label: 'Plan', value: 'Growth, annual' },
  { key: 'mrr', label: 'MRR', value: '$2,400' },
  { key: 'since', label: 'Customer since', value: 'March 2023' },
  { key: 'owner', label: 'Account owner', value: 'Léa Fontaine' }
]

const notes = ref<Touch[]>([])
const timeline = computed<Touch[]>(() => [
  ...notes.value,
  { title: 'Asked for 9 more seats and SSO', description: 'This conversation', time: 'Today', tone: 'primary', icon: 'chat' },
  { title: 'Invoice paid', description: '$7,200 · Q3', time: 'Sep 30', tone: 'success', icon: 'billing' },
  { title: 'Quarterly review call', description: 'Wants route optimisation in 2025', time: 'Aug 14', tone: 'info', icon: 'calendar' },
  { title: 'Upgraded to Growth', description: 'From Starter, 30 to 50 seats', time: 'Mar 2024', tone: 'neutral', icon: 'people' }
])

let seq = 10
function send() {
  const text = draft.value.trim()
  if (!text) return
  if (mode.value === 'note') {
    feed.value.push({ id: String(++seq), kind: 'note', who: 'You', time: 'Now', text })
    notes.value.unshift({ title: 'Internal note', description: text, time: 'Now', tone: 'warning', icon: 'lock' })
  }
  else {
    feed.value.push({ id: String(++seq), kind: 'agent', who: 'Léa Fontaine', time: 'Now', text })
  }
  draft.value = ''
}
</script>

<style scoped>
@container (min-width: 960px) {
  .cd__profile-btn, .cd__back { display: none; }
}
.cd__log { flex: 1; min-height: 0; }
.cd__row { max-width: min(88%, 38rem); }
.cd__row.is-end { margin-inline-start: auto; }
.cd .cd__bub { max-width: 100%; }
.cd__note > :first-child { flex: none; margin-top: 2px; color: var(--mi-orange-t); }
.cd__note p { margin: 2px 0 0; }
</style>

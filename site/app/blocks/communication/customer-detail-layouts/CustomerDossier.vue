<template>
  <section class="cd" aria-labelledby="cd-title">
    <div class="cd__shell" :class="{ 'is-profile': showProfile }">
      <div class="cd__conv">
        <header class="cd__head">
          <MiAvatar name="Hana Kobayashi" size="sm" tone="teal" decorative />
          <div class="cd__head-text">
            <MiText id="cd-title" as="h2" variant="headline" weight="semibold" :lines="1">Hana Kobayashi</MiText>
            <MiText variant="caption" tone="label2" :lines="1">Kestrel Logistics · ticket #8812 · open 2h</MiText>
          </div>
          <MiButton class="cd__profile-btn" variant="gray" size="small" @click="showProfile = true">Profile</MiButton>
        </header>

        <MiMessageScroller class="cd__log" label="Conversation with Hana Kobayashi">
          <MiMarker variant="separator">Today</MiMarker>
          <MiMessageScrollerItem v-for="m in feed" :key="m.id" :message-id="'cd-' + m.id">
            <div v-if="m.kind === 'note'" class="cd__note" role="note">
              <MiIcon name="lock" :size="14" />
              <div class="cd__note-body">
                <span class="cd__note-who">{{ m.who }} · internal note · {{ m.time }}</span>
                <p>{{ m.text }}</p>
              </div>
            </div>
            <MiMessage v-else :align="m.kind === 'agent' ? 'end' : 'start'" :label="m.who" class="cd__row" :class="{ 'is-end': m.kind === 'agent' }">
              <template #avatar><MiAvatar :name="m.who" size="sm" :tone="m.kind === 'agent' ? 'primary' : 'teal'" decorative /></template>
              <MiBubble :align="m.kind === 'agent' ? 'end' : 'start'" :variant="m.kind === 'agent' ? 'default' : 'secondary'" class="cd__bub">{{ m.text }}</MiBubble>
              <template #footer>{{ m.time }}</template>
            </MiMessage>
          </MiMessageScrollerItem>
        </MiMessageScroller>

        <form class="cd__composer" :class="{ 'is-note': mode === 'note' }" @submit.prevent="send">
          <MiInputGroup
            v-model="draft" multiline :rows="2"
            :aria-label="mode === 'note' ? 'Internal note' : 'Reply to Hana'"
            :placeholder="mode === 'note' ? 'Only your team sees this…' : 'Reply to Hana…'"
          >
            <template #block-start>
              <MiSegmented v-model="mode" label="Message type" :options="modes" />
            </template>
            <template #block-end>
              <div class="cd__bar">
                <MiText variant="caption" tone="label3">{{ mode === 'note' ? 'Notes are added to the timeline' : 'Sent by email and in-app' }}</MiText>
                <MiButton type="submit" size="small" :disabled="!draft.trim()">{{ mode === 'note' ? 'Add note' : 'Send' }}</MiButton>
              </div>
            </template>
          </MiInputGroup>
        </form>
      </div>

      <aside class="cd__dossier" aria-labelledby="cd-dossier-title">
        <header class="cd__dossier-head">
          <MiIconButton class="cd__back" label="Back to conversation" variant="gray" size="regular" @click="showProfile = false">
            <MiIcon name="chevron-left" />
          </MiIconButton>
          <MiText id="cd-dossier-title" as="h3" variant="subheadline" weight="semibold">Customer</MiText>
        </header>
        <div class="cd__dossier-scroll">
          <div class="cd__id">
            <MiAvatar name="Hana Kobayashi" size="lg" tone="teal" decorative />
            <div class="cd__id-text">
              <MiText variant="title3" weight="bold">Hana Kobayashi</MiText>
              <MiText variant="footnote" tone="label2">Head of Operations, Kestrel Logistics</MiText>
              <MiText variant="caption" tone="label3">Osaka · 23:41 local time</MiText>
            </div>
          </div>

          <!-- The one thing to know before replying: health against renewal. -->
          <div class="cd__health">
            <MiProgressRing :value="health" :size="64" label="Account health" />
            <div>
              <MiText variant="subheadline" weight="semibold">Healthy, renewal in 23 days</MiText>
              <MiText variant="caption" tone="label2">Usage up 18% this quarter. Seat cap is the only blocker.</MiText>
            </div>
          </div>

          <MiMeter :value="46" :max="50" label="Seats" caption="46 of 50 used" hint="4 left" size="sm" />

          <MiDetails :items="facts" label-width="112px" />

          <div class="cd__tl">
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
.cd { container-type: inline-size; height: 680px; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.cd__shell { display: grid; height: 100%; grid-template-columns: minmax(0, 1fr); }
.cd__dossier { display: none; }
.cd__shell.is-profile .cd__conv { display: none; }
.cd__shell.is-profile .cd__dossier { display: flex; }

@container (min-width: 960px) {
  .cd__shell { grid-template-columns: minmax(0, 1fr) 360px; }
  .cd__shell .cd__conv, .cd__shell.is-profile .cd__conv { display: flex; }
  .cd__shell .cd__dossier { display: flex; border-left: 1px solid var(--mi-sep); }
  .cd__profile-btn, .cd__back { display: none; }
}

.cd__conv { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.cd__head { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--mi-sep); background: var(--mi-card); }
.cd__head-text { flex: 1; min-width: 0; }
.cd__log { flex: 1; min-height: 0; }
.cd__row { max-width: min(88%, 38rem); }
.cd__row.is-end { margin-inline-start: auto; }
.cd .cd__bub { max-width: 100%; }

/* Internal notes sit in the flow but read as paper, not chat. */
.cd__note { display: flex; gap: 10px; margin-inline: auto; max-width: min(92%, 36rem); padding: 10px 14px; border-radius: var(--mi-radius-m); border: 1px dashed color-mix(in srgb, var(--mi-orange) 55%, transparent); background: color-mix(in srgb, var(--mi-orange) 10%, transparent); color: var(--mi-label); }
.cd__note > :first-child { flex: none; margin-top: 2px; color: var(--mi-orange-t); }
.cd__note-body { min-width: 0; }
.cd__note-who { font-size: 11.5px; font-weight: 600; color: var(--mi-orange-t); }
.cd__note p { margin: 2px 0 0; font-size: 13.5px; line-height: 1.5; overflow-wrap: anywhere; }

.cd__composer { padding: 12px 16px 16px; border-top: 1px solid var(--mi-sep); background: var(--mi-card); }
.cd__composer.is-note { background: color-mix(in srgb, var(--mi-orange) 9%, var(--mi-card)); }
.cd__bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; }

.cd__dossier { flex-direction: column; min-height: 0; min-width: 0; background: var(--mi-card); }
.cd__dossier-head { display: flex; align-items: center; gap: 10px; min-height: 60px; padding: 0 16px; border-bottom: 1px solid var(--mi-sep); box-sizing: border-box; }
.cd__dossier-scroll { flex: 1; min-height: 0; overflow-y: auto; display: grid; align-content: start; gap: 20px; padding: 20px; }
.cd__id { display: flex; align-items: center; gap: 14px; min-width: 0; }
.cd__id-text { display: grid; gap: 2px; min-width: 0; }
.cd__health { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: var(--mi-radius-l); background: linear-gradient(135deg, var(--mi-p-tint), transparent 70%), var(--mi-page); }
.cd__tl { display: grid; gap: 12px; }
</style>

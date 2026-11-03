<template>
  <section class="rcf" aria-labelledby="rcf-title">
    <div class="rcf__grid">
      <form v-if="!ticket" class="rcf__form" novalidate @submit.prevent="submit">
        <header>
          <MiText id="rcf-title" variant="title3" as="h2" weight="semibold">Contact Tessera</MiText>
          <MiText variant="footnote" tone="label2">Tell us what it is about and we route it to the right people.</MiText>
        </header>

        <fieldset class="rcf__topics">
          <legend class="rcf__legend">What is it about?</legend>
          <label v-for="t in TOPICS" :key="t.id" class="rcf__topic" :class="{ 'is-on': topic === t.id }">
            <input v-model="topic" type="radio" name="rcf-topic" :value="t.id" class="rcf__radio">
            <MiIcon :name="t.icon" :size="18" />
            <span><b>{{ t.label }}</b><small>{{ t.blurb }}</small></span>
          </label>
        </fieldset>

        <div class="rcf__pair">
          <MiField label="Your name" required :error="err('name')"><MiInput v-model="form.name" autocomplete="name" /></MiField>
          <MiField label="Work email" required :error="err('email')"><MiInput v-model="form.email" type="email" autocomplete="email" /></MiField>
        </div>

        <!-- Fields that only this team needs. -->
        <div class="rcf__pair">
          <template v-if="topic === 'sales'">
            <MiField label="Company size"><MiNativeSelect v-model="form.size" :options="SIZES" /></MiField>
            <MiField label="Planned start" hint="Helps us book the right demo slot"><MiNativeSelect v-model="form.when" :options="WHEN" /></MiField>
          </template>
          <template v-else-if="topic === 'support'">
            <MiField label="Workspace URL" required :error="err('extra')"><MiInput v-model="form.extra" prefix="https://" suffix=".tessera.app" /></MiField>
            <MiField label="How blocked are you?"><MiNativeSelect v-model="form.urgency" :options="URGENCY" /></MiField>
          </template>
          <template v-else>
            <MiField label="Invoice number" required :error="err('extra')" hint="Starts with TS-, top right of the PDF"><MiInput v-model="form.extra" placeholder="TS-2026-0418" /></MiField>
          </template>
        </div>

        <MiField label="Message" required :error="err('message')">
          <MiTextarea v-model="form.message" :rows="4" :maxlength="1200" counter :placeholder="team.placeholder" />
        </MiField>

        <div class="rcf__actions">
          <MiText variant="caption" tone="label2">We only use your email to reply.</MiText>
          <MiButton type="submit" :loading="busy">Send to {{ team.team }}</MiButton>
        </div>
      </form>

      <div v-else class="rcf__form rcf__sent" role="status">
        <span class="rcf__sent-mark"><MiIcon name="check" :size="24" :weight="2.6" /></span>
        <MiText variant="title3" as="h2" weight="semibold">{{ team.team }} has it</MiText>
        <MiText variant="subheadline" tone="label2" align="center">Reference {{ ticket }}. {{ team.reply }}, at {{ form.email }}.</MiText>
        <MiButton variant="gray" @click="ticket = ''">Send another message</MiButton>
      </div>

      <aside class="rcf__side" aria-labelledby="rcf-who" aria-live="polite">
        <MiText variant="caption" tone="label2" weight="semibold">Who will answer</MiText>
        <MiText id="rcf-who" variant="headline" as="h3">{{ team.team }}</MiText>
        <MiAvatarGroup :items="team.people" :max="3" size="sm" />
        <dl class="rcf__facts">
          <div><dt>First reply</dt><dd>{{ urgent ? 'Within 1 hour' : team.reply }}</dd></div>
          <div><dt>Hours</dt><dd>{{ team.hours }}</dd></div>
        </dl>
        <MiBadge :tone="team.open ? 'success' : 'neutral'" dot :label="team.open ? 'Online now' : 'Back at 9:00 CET'" />
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

type TopicId = 'sales' | 'support' | 'billing'
interface Team { team: string, reply: string, hours: string, open: boolean, placeholder: string, people: { name: string, tone: 'auto' }[] }

const TOPICS: { id: TopicId, label: string, blurb: string, icon: 'people' | 'chat' | 'billing' }[] = [
  { id: 'sales', label: 'Buying Tessera', blurb: 'Demo, pricing, security review', icon: 'people' },
  { id: 'support', label: 'Something is broken', blurb: 'Errors, sync, access', icon: 'chat' },
  { id: 'billing', label: 'An invoice', blurb: 'Refunds, VAT, receipts', icon: 'billing' }
]
const TEAMS: Record<TopicId, Team> = {
  sales: { team: 'Sales', reply: 'Same business day', hours: 'Mon–Fri, 8:00–19:00 CET', open: true, placeholder: 'How many people would use it, and what are you using today?', people: [{ name: 'Clara Weiss', tone: 'auto' }, { name: 'Samir Haddad', tone: 'auto' }, { name: 'Ana Lucía Vega', tone: 'auto' }] },
  support: { team: 'Support', reply: 'Within 4 hours', hours: 'Every day, around the clock', open: true, placeholder: 'What did you expect, what happened instead, and when did it start?', people: [{ name: 'Jonas Berg', tone: 'auto' }, { name: 'Imani Cole', tone: 'auto' }, { name: 'Yuki Tanaka', tone: 'auto' }, { name: 'Rafael Costa', tone: 'auto' }, { name: 'Elif Demir', tone: 'auto' }] },
  billing: { team: 'Billing', reply: 'Within 2 business days', hours: 'Mon–Fri, 9:00–17:00 CET', open: false, placeholder: 'What needs changing on this invoice?', people: [{ name: 'Marta Nowak', tone: 'auto' }] }
}
const SIZES = [{ value: 's', label: '1–20 people' }, { value: 'm', label: '21–200 people' }, { value: 'l', label: '200+ people' }]
const WHEN = [{ value: 'now', label: 'This month' }, { value: 'q', label: 'This quarter' }, { value: 'later', label: 'Just exploring' }]
const URGENCY = [{ value: 'low', label: 'A question, no rush' }, { value: 'mid', label: 'Slowing my team down' }, { value: 'high', label: 'We cannot work' }]

const topic = ref<TopicId>('support')
const form = reactive({ name: 'Noor Al-Amin', email: '', size: 'm', when: 'q', urgency: 'mid', extra: '', message: '' })
const tried = ref(false)
const busy = ref(false)
const ticket = ref('')
let timer: ReturnType<typeof setTimeout> | undefined

const team = computed(() => TEAMS[topic.value])
const urgent = computed(() => topic.value === 'support' && form.urgency === 'high')
const errors = computed<Record<string, string>>(() => ({
  name: form.name.trim() ? '' : 'Tell us who you are.',
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '' : 'Enter an email we can reply to.',
  extra: topic.value === 'sales' || form.extra.trim() ? '' : topic.value === 'support' ? 'Which workspace is affected?' : 'Add the invoice number.',
  message: form.message.trim().length >= 20 ? '' : 'A few more words, at least 20 characters.'
}))
const err = (k: string) => (tried.value ? errors.value[k] : '')

watch(topic, () => { form.extra = ''; tried.value = false })
function submit() {
  tried.value = true
  if (Object.values(errors.value).some(Boolean) || busy.value) return
  busy.value = true
  timer = setTimeout(() => { busy.value = false; ticket.value = `${topic.value.slice(0, 2).toUpperCase()}-48213` }, 800)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.rcf { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.rcf__grid { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 820px) { .rcf__grid { grid-template-columns: minmax(0, 1fr) 280px; align-items: start; } }
.rcf__form { display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }

.rcf__topics { display: grid; gap: 8px; margin: 0; padding: 0; border: 0; min-width: 0; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 600px) { .rcf__topics { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.rcf__legend { margin-bottom: 8px; padding: 0; font-size: 13px; font-weight: 600; }
.rcf__topic {
  position: relative; display: flex; align-items: flex-start; gap: 10px; padding: 12px; border-radius: var(--mi-radius-l); cursor: pointer;
  box-shadow: 0 0 0 1px var(--mi-sep); transition: transform var(--mi-dur-2) var(--mi-ease);
}
.rcf__topic:hover { transform: translateY(-1px); }
.rcf__topic.is-on { box-shadow: 0 0 0 2px var(--mi-p); background: color-mix(in srgb, var(--mi-p) 5%, transparent); }
.rcf__topic:has(:focus-visible) { outline: 3px solid color-mix(in srgb, var(--mi-p) 45%, transparent); outline-offset: 2px; }
.rcf__topic > :first-of-type { flex: none; color: var(--mi-p-text); margin-top: 1px; }
.rcf__topic span { display: grid; font-size: 14px; }
.rcf__topic small { font-size: 12px; color: var(--mi-label2); }
.rcf__radio { position: absolute; opacity: 0; pointer-events: none; }

.rcf__pair { display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 600px) { .rcf__pair { grid-template-columns: 1fr 1fr; align-items: start; } }
.rcf__actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }

.rcf__sent { justify-items: center; padding-block: 40px; text-align: center; }
.rcf__sent-mark { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: var(--mi-green); color: var(--mi-card); }

.rcf__side { display: grid; justify-items: start; gap: 10px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-fill4); }
.rcf__facts { display: grid; gap: 8px; width: 100%; margin: 4px 0; font-size: 13px; }
.rcf__facts div { display: grid; gap: 2px; }
.rcf__facts dt { color: var(--mi-label2); font-size: 12px; }
.rcf__facts dd { margin: 0; font-weight: 500; }
</style>

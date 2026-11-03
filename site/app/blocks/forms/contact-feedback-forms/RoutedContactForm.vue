<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="rcf-title">
    <div class="mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:@[820px]:grid-cols-[minmax(0,_1fr)_280px] mi:@[820px]:items-start">
      <form v-if="!ticket" class="mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0" novalidate @submit.prevent="submit">
        <header>
          <MiText id="rcf-title" variant="title3" as="h2" weight="semibold">Contact Tessera</MiText>
          <MiText variant="footnote" tone="label2">Tell us what it is about and we route it to the right people.</MiText>
        </header>

        <fieldset class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0 mi:grid-cols-[minmax(0,_1fr)] mi:@[600px]:grid-cols-3">
          <legend class="mi:mb-2 mi:p-0 mi:text-[13px] mi:font-semibold">What is it about?</legend>
          <label v-for="t in TOPICS" :key="t.id" class="mi:relative mi:flex mi:[align-items:flex-start] mi:gap-2.5 mi:p-3 mi:rounded-lg mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)] mi:[&:has(:focus-visible)]:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_45%,_transparent)] mi:[&:has(:focus-visible)]:outline-offset-[2px]" :class="topic === t.id ? 'mi:shadow-[0_0_0_2px_var(--mi-p)] mi:[background:color-mix(in_srgb,_var(--mi-p)_5%,_transparent)]' : 'mi:shadow-[0_0_0_1px_var(--mi-sep)]'">
            <input v-model="topic" type="radio" name="rcf-topic" :value="t.id" class="mi:flex-[none] mi:text-p-text mi:mt-px mi:absolute mi:opacity-0 mi:pointer-events-none">
            <MiIcon :name="t.icon" :size="18" class="mi:flex-[none] mi:text-p-text mi:mt-px" />
            <span class="mi:flex-[none] mi:text-p-text mi:mt-px mi:grid mi:text-[14px]"><b>{{ t.label }}</b><small class="mi:text-[12px] mi:text-label2">{{ t.blurb }}</small></span>
          </label>
        </fieldset>

        <div class="mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[600px]:grid-cols-[1fr_1fr] mi:@[600px]:items-start">
          <MiField label="Your name" required :error="err('name')"><MiInput v-model="form.name" autocomplete="name" /></MiField>
          <MiField label="Work email" required :error="err('email')"><MiInput v-model="form.email" type="email" autocomplete="email" /></MiField>
        </div>

        <!-- Fields that only this team needs. -->
        <div class="mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[600px]:grid-cols-[1fr_1fr] mi:@[600px]:items-start">
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

        <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
          <MiText variant="caption" tone="label2">We only use your email to reply.</MiText>
          <MiButton type="submit" :loading="busy">Send to {{ team.team }}</MiButton>
        </div>
      </form>

      <div v-else class="mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0 mi:justify-items-center mi:py-10 mi:text-center" role="status">
        <span class="mi:grid mi:place-items-center mi:w-13 mi:h-13 mi:rounded-[50%] mi:bg-green mi:text-card"><MiIcon name="check" :size="24" :weight="2.6" /></span>
        <MiText variant="title3" as="h2" weight="semibold">{{ team.team }} has it</MiText>
        <MiText variant="subheadline" tone="label2" align="center">Reference {{ ticket }}. {{ team.reply }}, at {{ form.email }}.</MiText>
        <MiButton variant="gray" @click="ticket = ''">Send another message</MiButton>
      </div>

      <aside class="mi:grid mi:justify-items-start mi:gap-2.5 mi:p-5 mi:rounded-xl mi:bg-fill4" aria-labelledby="rcf-who" aria-live="polite">
        <MiText variant="caption" tone="label2" weight="semibold">Who will answer</MiText>
        <MiText id="rcf-who" variant="headline" as="h3">{{ team.team }}</MiText>
        <MiAvatarGroup :items="team.people" :max="3" size="sm" />
        <dl class="mi:grid mi:gap-2 mi:w-full mi:my-1 mi:mx-0 mi:text-[13px]">
          <div class="mi:grid mi:gap-0.5"><dt class="mi:text-label2 mi:text-[12px]">First reply</dt><dd class="mi:m-0 mi:font-medium">{{ urgent ? 'Within 1 hour' : team.reply }}</dd></div>
          <div class="mi:grid mi:gap-0.5"><dt class="mi:text-label2 mi:text-[12px]">Hours</dt><dd class="mi:m-0 mi:font-medium">{{ team.hours }}</dd></div>
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

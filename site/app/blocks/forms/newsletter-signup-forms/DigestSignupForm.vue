<template>
  <div class="dsf-cq mi:@container">
    <section class="dsf mi:grid mi:gap-6 mi:p-5.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:font-mi mi:text-label mi:overflow-hidden mi:@[780px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:@[780px]:gap-9 mi:@[780px]:p-7 mi:isolate" aria-labelledby="dsf-title">
      <div class="dsf__pitch mi:grid mi:gap-2.5 mi:content-start">
        <span class="dsf__mark mi:grid mi:place-items-center mi:w-10 mi:h-10 mi:rounded-[12px] mi:bg-label mi:text-card mi:[font:800_20px/1_Georgia,_'Times_New_Roman',_serif] mi:[&.is-sm]:w-5.5 mi:[&.is-sm]:h-5.5 mi:[&.is-sm]:rounded-[6px]" aria-hidden="true">M</span>
        <MiText id="dsf-title" variant="title2" as="h2" weight="bold" balance>The Margin</MiText>
        <MiText variant="subheadline" tone="label2">Product economics for people who ship. Pricing teardowns, unit economics and the numbers behind growth, from operators at 40+ companies.</MiText>

        <div v-if="joined" class="dsf__joined mi:grid mi:gap-3.5 mi:mt-2 mi:p-4 mi:rounded-lg mi:[background:color-mix(in_srgb,_var(--mi-green)_10%,_transparent)]" role="status">
          <MiText variant="headline" as="h3">Check your inbox</MiText>
          <MiText variant="footnote" tone="label2">We sent a confirmation link to {{ email }}. Your first {{ freqObj.noun }} arrives {{ nextLabel }}.</MiText>
          <MiButton variant="plain" size="small" @click="joined = false">Change preferences</MiButton>
        </div>

        <form v-else class="dsf__form mi:grid mi:gap-3.5 mi:mt-2" novalidate @submit.prevent="join">
          <MiField label="Work email" :error="tried && !emailOk ? 'Enter an email address like you@company.com.' : ''">
            <MiInput v-model="email" type="email" autocomplete="email" placeholder="you@company.com" />
          </MiField>
          <div class="dsf__row mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
            <MiText variant="subheadline" weight="semibold" aria-hidden="true">How often</MiText>
            <MiSegmented v-model="freq" label="How often" :options="FREQS.map(f => ({ value: f.id, label: f.label }))" />
          </div>
          <fieldset class="dsf__topics mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
            <legend>Topics <span>{{ topics.length }} of {{ TOPICS.length }}</span></legend>
            <div class="dsf__chips mi:flex mi:flex-wrap mi:gap-1.5">
              <MiChip
                v-for="t in TOPICS" :key="t" selectable size="small" :label="t" :model-value="topics.includes(t)"
                @update:model-value="on => (topics = on ? [...topics, t] : topics.filter(x => x !== t))"
              />
            </div>
            <MiText v-if="!topics.length" variant="caption" tone="red" role="alert">Keep at least one topic.</MiText>
          </fieldset>
          <MiButton type="submit" block :disabled="!topics.length">Subscribe, it’s free</MiButton>
          <MiText variant="caption2" tone="label3">18,402 readers · one click to unsubscribe · we never share your address</MiText>
        </form>
      </div>

      <!-- Preview of the very next issue, built from the choices on the left. -->
      <article class="dsf__mail mi:relative mi:grid mi:gap-3 mi:content-start mi:p-4.5 mi:rounded-lg mi:bg-elev mi:shadow-[var(--mi-sh2),_0_0_0_1px_var(--mi-sep)] mi:min-w-0 mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:-z-1 mi:before:rounded-[inherit] mi:before:bg-fill3 mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:-z-1 mi:after:rounded-[inherit] mi:after:bg-fill3 mi:before:transform-[translateY(8px)_scale(.96)] mi:before:opacity-70 mi:after:transform-[translateY(16px)_scale(.92)] mi:after:opacity-40" aria-label="Preview of your next issue">
        <div class="dsf__mail-head mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2 mi:text-[13px]">
          <span class="dsf__mail-from mi:inline-flex mi:items-center mi:gap-2"><span class="dsf__mark is-sm mi:grid mi:place-items-center mi:w-10 mi:h-10 mi:rounded-[12px] mi:bg-label mi:text-card mi:[font:800_20px/1_Georgia,_'Times_New_Roman',_serif] mi:[&.is-sm]:w-5.5 mi:[&.is-sm]:h-5.5 mi:[&.is-sm]:rounded-[6px]" aria-hidden="true">M</span><b>The Margin</b></span>
          <span class="dsf__mail-date mi:text-label3 mi:tabular-nums">{{ nextLabel }}</span>
        </div>
        <p class="dsf__subject mi:m-0 mi:[font:700_18px/1.3_Georgia,_'Times_New_Roman',_serif] mi:tracking-[-.01em]">{{ subject }}</p>
        <ol class="dsf__stories mi:relative mi:grid mi:gap-0 mi:m-0 mi:p-0 mi:[list-style:none]">
          <TransitionGroup name="dsf-story">
            <li class="mi:[.dsf__stories_&]:grid-cols-[minmax(0,_1fr)_auto] mi:[.dsf__stories_&]:gap-y-0.5 mi:[.dsf__stories_&]:gap-x-2.5 mi:[.dsf__stories_&]:border-t mi:[.dsf__stories_&]:border-t-sep" v-for="s in stories" :key="s.title">
              <span class="dsf__topic mi:col-span-full mi:text-[11px] mi:font-bold mi:tracking-[.06em] mi:uppercase mi:text-p-text">{{ s.topic }}</span>
              <span class="dsf__story-title mi:text-[14px] mi:font-medium">{{ s.title }}</span>
              <span class="dsf__story-meta mi:text-[12px] mi:text-label3">{{ s.mins }} min</span>
            </li>
          </TransitionGroup>
        </ol>
        <div class="dsf__mail-foot mi:flex mi:justify-between mi:pt-2.5 mi:border-t mi:border-t-sep mi:text-[12px] mi:text-label2">
          <span>{{ readMins }} min read</span>
          <span>{{ stories.length }} {{ stories.length === 1 ? 'story' : 'stories' }}</span>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const TOPICS = ['Pricing', 'Unit economics', 'Growth loops', 'Fundraising', 'Case studies']
const FREQS = [
  { id: 'daily', label: 'Daily', noun: 'brief', take: 2 },
  { id: 'weekly', label: 'Weekly', noun: 'digest', take: 4 },
  { id: 'monthly', label: 'Monthly', noun: 'deep dive', take: 6 }
]
const LIBRARY = [
  { topic: 'Pricing', title: 'Why Linear never discounts annual plans', mins: 4 },
  { topic: 'Unit economics', title: 'The CAC payback math behind a $9 plan', mins: 6 },
  { topic: 'Growth loops', title: 'How Loom turned every video into an invite', mins: 5 },
  { topic: 'Case studies', title: 'Inside Monzo’s first 100k customers', mins: 9 },
  { topic: 'Fundraising', title: 'What a seed deck needs in 2026, by the numbers', mins: 7 },
  { topic: 'Pricing', title: 'Usage-based pricing without bill shock', mins: 6 },
  { topic: 'Unit economics', title: 'Gross margin for AI products, line by line', mins: 8 },
  { topic: 'Growth loops', title: 'Templates as a distribution channel', mins: 4 },
  { topic: 'Case studies', title: 'Duolingo’s streak, measured', mins: 7 }
]

const email = ref('')
const freq = ref<string | number | null>('weekly')
const topics = ref<string[]>(['Pricing', 'Growth loops'])
const tried = ref(false)
const joined = ref(false)

const freqObj = computed(() => FREQS.find(f => f.id === freq.value) ?? FREQS[1]!)
const emailOk = computed(() => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.value))
const stories = computed(() => LIBRARY.filter(s => topics.value.includes(s.topic)).slice(0, freqObj.value.take))
const readMins = computed(() => stories.value.reduce((n, s) => n + s.mins, 0) + 1)
const subject = computed(() => {
  const lead = stories.value[0]
  if (!lead) return 'Pick a topic to see your next issue'
  return freq.value === 'daily' ? `Today: ${lead.title}` : freq.value === 'monthly' ? `The ${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(next.value)} deep dive: ${lead.topic.toLowerCase()}` : `This week: ${lead.title.toLowerCase()} and ${stories.value.length - 1} more`
})

// Next send date from a fixed "today" (Monday 2 November) so the sample reads the same everywhere.
const TODAY = new Date(2026, 10, 2)
const next = computed(() => {
  const d = new Date(TODAY)
  if (freq.value === 'daily') d.setDate(d.getDate() + 1)
  else if (freq.value === 'weekly') d.setDate(d.getDate() + ((9 - d.getDay()) % 7 || 7))
  else d.setMonth(d.getMonth() + 1, 1)
  return d
})
const nextLabel = computed(() => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(next.value) + ', 7:00')

function join() {
  tried.value = true
  if (emailOk.value && topics.value.length) joined.value = true
}
</script>

<style scoped>
.dsf__mark.is-sm { font-size: 12px; }
.dsf__topics legend { display: flex; justify-content: space-between; width: 100%; padding: 0; margin-bottom: 8px; font-size: 15px; font-weight: 600; }
.dsf__topics legend span { font-weight: 400; font-size: 13px; color: var(--mi-label3); }
.dsf__stories li { display: grid; padding: 10px 0; }
.dsf-story-enter-active, .dsf-story-leave-active { transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.dsf-story-enter-from, .dsf-story-leave-to { opacity: 0; transform: translateX(12px); }
.dsf-story-leave-active { position: absolute; left: 0; right: 0; }
.dsf-story-move { transition: transform var(--mi-dur-3) var(--mi-spring); }
</style>

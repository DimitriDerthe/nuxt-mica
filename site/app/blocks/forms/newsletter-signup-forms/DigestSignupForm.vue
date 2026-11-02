<template>
  <div class="dsf-cq">
    <section class="dsf" aria-labelledby="dsf-title">
      <div class="dsf__pitch">
        <span class="dsf__mark" aria-hidden="true">M</span>
        <MiText id="dsf-title" variant="title2" as="h2" weight="bold" balance>The Margin</MiText>
        <MiText variant="subheadline" tone="label2">Product economics for people who ship. Pricing teardowns, unit economics and the numbers behind growth, from operators at 40+ companies.</MiText>

        <div v-if="joined" class="dsf__joined" role="status">
          <MiText variant="headline" as="h3">Check your inbox</MiText>
          <MiText variant="footnote" tone="label2">We sent a confirmation link to {{ email }}. Your first {{ freqObj.noun }} arrives {{ nextLabel }}.</MiText>
          <MiButton variant="plain" size="small" @click="joined = false">Change preferences</MiButton>
        </div>

        <form v-else class="dsf__form" novalidate @submit.prevent="join">
          <MiField label="Work email" :error="tried && !emailOk ? 'Enter an email address like you@company.com.' : ''">
            <MiInput v-model="email" type="email" autocomplete="email" placeholder="you@company.com" />
          </MiField>
          <div class="dsf__row">
            <MiText variant="subheadline" weight="semibold" aria-hidden="true">How often</MiText>
            <MiSegmented v-model="freq" label="How often" :options="FREQS.map(f => ({ value: f.id, label: f.label }))" />
          </div>
          <fieldset class="dsf__topics">
            <legend>Topics <span>{{ topics.length }} of {{ TOPICS.length }}</span></legend>
            <div class="dsf__chips">
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
      <article class="dsf__mail" aria-label="Preview of your next issue">
        <div class="dsf__mail-head">
          <span class="dsf__mail-from"><span class="dsf__mark is-sm" aria-hidden="true">M</span><b>The Margin</b></span>
          <span class="dsf__mail-date">{{ nextLabel }}</span>
        </div>
        <p class="dsf__subject">{{ subject }}</p>
        <ol class="dsf__stories">
          <TransitionGroup name="dsf-story">
            <li v-for="s in stories" :key="s.title">
              <span class="dsf__topic">{{ s.topic }}</span>
              <span class="dsf__story-title">{{ s.title }}</span>
              <span class="dsf__story-meta">{{ s.mins }} min</span>
            </li>
          </TransitionGroup>
        </ol>
        <div class="dsf__mail-foot">
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
.dsf-cq { container-type: inline-size; }
.dsf { display: grid; gap: 24px; padding: 22px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); overflow: hidden; }
@container (min-width: 780px) { .dsf { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 36px; padding: 28px; } }
.dsf__pitch { display: grid; gap: 10px; align-content: start; }
.dsf__mark { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; background: var(--mi-label); color: var(--mi-card); font: 800 20px/1 Georgia, 'Times New Roman', serif; }
.dsf__mark.is-sm { width: 22px; height: 22px; border-radius: 6px; font-size: 12px; }
.dsf__form, .dsf__joined { display: grid; gap: 14px; margin-top: 8px; }
.dsf__row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.dsf__topics { display: grid; gap: 8px; margin: 0; padding: 0; border: 0; min-width: 0; }
.dsf__topics legend { display: flex; justify-content: space-between; width: 100%; padding: 0; margin-bottom: 8px; font-size: 15px; font-weight: 600; }
.dsf__topics legend span { font-weight: 400; font-size: 13px; color: var(--mi-label3); }
.dsf__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.dsf__joined { padding: 16px; border-radius: var(--mi-radius-l); background: color-mix(in srgb, var(--mi-green) 10%, transparent); }

/* The preview sits on a tilted paper stack. */
.dsf__mail {
  position: relative; display: grid; gap: 12px; align-content: start; padding: 18px; border-radius: var(--mi-radius-l);
  background: var(--mi-elev); box-shadow: var(--mi-sh2), 0 0 0 1px var(--mi-sep); min-width: 0;
}
.dsf__mail::before, .dsf__mail::after { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; background: var(--mi-fill3); }
.dsf__mail::before { transform: translateY(8px) scale(.96); opacity: .7; }
.dsf__mail::after { transform: translateY(16px) scale(.92); opacity: .4; }
.dsf { isolation: isolate; }
.dsf__mail-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; }
.dsf__mail-from { display: inline-flex; align-items: center; gap: 8px; }
.dsf__mail-date { color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.dsf__subject { margin: 0; font: 700 18px/1.3 Georgia, 'Times New Roman', serif; letter-spacing: -.01em; }
.dsf__stories { position: relative; display: grid; gap: 0; margin: 0; padding: 0; list-style: none; }
.dsf__stories li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 10px; padding: 10px 0; border-top: 1px solid var(--mi-sep); }
.dsf__topic { grid-column: 1 / -1; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--mi-p-text); }
.dsf__story-title { font-size: 14px; font-weight: 500; }
.dsf__story-meta { font-size: 12px; color: var(--mi-label3); }
.dsf__mail-foot { display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--mi-sep); font-size: 12px; color: var(--mi-label2); }
.dsf-story-enter-active, .dsf-story-leave-active { transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.dsf-story-enter-from, .dsf-story-leave-to { opacity: 0; transform: translateX(12px); }
.dsf-story-leave-active { position: absolute; left: 0; right: 0; }
.dsf-story-move { transition: transform var(--mi-dur-3) var(--mi-spring); }
</style>

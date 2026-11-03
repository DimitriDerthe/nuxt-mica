<template>
  <section class="ats" aria-labelledby="ats-title">
    <div class="ats__card">
      <div class="ats__pitch">
        <MiText variant="caption" tone="primary" weight="semibold" class="ats__kicker">Field Notes · every other Thursday</MiText>
        <MiText id="ats-title" as="h2" variant="title2" weight="bold" balance>One long read on how small software teams actually ship.</MiText>
        <div class="ats__proof">
          <MiAvatarGroup :items="readers" :max="4" size="sm" />
          <MiText variant="footnote" tone="label2">Read by 18,400 engineers and founders. 62% open rate.</MiText>
        </div>

        <form v-if="!joined" class="ats__form" novalidate @submit.prevent="submit">
          <MiField label="Work email" :error="error">
            <template #default="{ id, describedBy }">
              <MiInput :id="id" v-model="email" type="email" autocomplete="email" placeholder="you@company.com" :aria-describedby="describedBy" />
            </template>
          </MiField>
          <!-- Typo catcher: a near-miss of a common domain offers a one-tap fix instead of a bounce later. -->
          <p v-if="suggestion" class="ats__typo" role="status">
            Did you mean
            <button type="button" class="ats__fix" @click="email = suggestion">{{ suggestion }}</button>?
          </p>
          <MiButton type="submit" block :loading="sending">Subscribe, it's free</MiButton>
          <MiText variant="caption" tone="label3">No tracking pixels. Unsubscribe from any issue in one click.</MiText>
        </form>

        <div v-else class="ats__done" role="status">
          <MiIcon name="check-circle-fill" :size="28" />
          <div>
            <MiText as="h3" variant="headline" weight="semibold">Check {{ email }}</MiText>
            <MiText variant="footnote" tone="label2">Confirm your address and issue #49 lands on Thursday, Nov 6.</MiText>
          </div>
          <MiButton variant="plain" size="small" @click="joined = false">Use another address</MiButton>
        </div>
      </div>

      <div class="ats__archive">
        <MiText as="h3" variant="subheadline" weight="semibold" tone="label2">Recent issues</MiText>
        <ol class="ats__issues">
          <li v-for="i in issues" :key="i.no" class="ats__issue">
            <span class="ats__no">#{{ i.no }}</span>
            <div class="ats__issue-body">
              <a href="#" class="ats__link" @click.prevent>{{ i.title }}</a>
              <MiText variant="caption" tone="label3">{{ i.date }} · {{ i.minutes }} min read</MiText>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Issue { no: number, title: string, date: string, minutes: number }

const readers: { name: string, tone: 'auto' }[] = ['Priya Natarajan', 'Tom Becker', 'Lucía Fernández', 'Kwame Asante', 'Elin Berg', 'Yuki Mori'].map(name => ({ name, tone: 'auto' }))
const issues: Issue[] = [
  { no: 48, title: 'The four-person release train at a 40-person company', date: 'Oct 23', minutes: 9 },
  { no: 47, title: 'Why we deleted our staging environment', date: 'Oct 9', minutes: 7 },
  { no: 46, title: 'Feature flags as a product decision log', date: 'Sep 25', minutes: 11 },
  { no: 45, title: 'On-call for teams with no SRE', date: 'Sep 11', minutes: 8 }
]

const domains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'proton.me']
const email = ref('maya@gmial.com')
const tried = ref(false)
const sending = ref(false)
const joined = ref(false)

// Levenshtein distance, small inputs only (domain names).
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]!
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j]!
      row[j] = Math.min(cur + 1, row[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = cur
    }
  }
  return row[b.length]!
}

const valid = computed(() => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.value.trim()))
const suggestion = computed(() => {
  const [user, domain] = email.value.trim().toLowerCase().split('@')
  if (!user || !domain || domains.includes(domain)) return ''
  const near = domains.find(d => distance(domain, d) <= 2)
  return near ? `${user}@${near}` : ''
})
const error = computed(() => !tried.value || valid.value ? undefined : 'Enter an address like name@company.com.')

function submit() {
  tried.value = true
  if (!valid.value) return
  sending.value = true
  // Stand-in for the signup request.
  Promise.resolve().then(() => { sending.value = false; joined.value = true })
}
</script>

<style scoped>
.ats { container: ats / inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.ats__card { display: grid; gap: 24px; padding: 24px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
@container ats (min-width: 760px) { .ats__card { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 28px; } .ats__pitch { padding-inline-end: 28px; border-inline-end: 1px solid var(--mi-sep); } }

.ats__pitch { display: grid; align-content: start; gap: 14px; }
.ats__kicker { text-transform: uppercase; letter-spacing: .08em; }
.ats__proof { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.ats__form { display: grid; gap: 10px; max-width: 420px; }
.ats__typo { margin: -2px 0 0; font-size: 13px; color: var(--mi-label2); }
.ats__fix { padding: 0; border: 0; font: inherit; font-weight: 600; color: var(--mi-p-text); background: none; text-decoration: underline; text-underline-offset: 2px; cursor: pointer; }
.ats__done { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 12px; align-items: start; max-width: 420px; padding: 16px; border-radius: var(--mi-radius-l); background: color-mix(in srgb, var(--mi-green) 10%, transparent); animation: ats-in var(--mi-dur-3) var(--mi-ease); }
.ats__done > :first-child { color: var(--mi-green); }
.ats__done > :last-child { grid-column: 2; justify-self: start; }

.ats__archive { display: grid; align-content: start; gap: 10px; }
.ats__issues { display: grid; margin: 0; padding: 0; list-style: none; }
.ats__issue { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 10px; padding: 12px 0; }
.ats__issue + .ats__issue { border-top: 1px solid var(--mi-sep); }
.ats__no { font-size: 13px; font-weight: 700; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.ats__issue-body { display: grid; gap: 2px; }
.ats__link { font-size: 14.5px; font-weight: 600; line-height: 1.35; color: var(--mi-label); text-decoration: none; }
.ats__link:hover { color: var(--mi-p-text); }
.ats__link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; border-radius: 2px; }
@keyframes ats-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .ats__done { animation: none; } }
</style>

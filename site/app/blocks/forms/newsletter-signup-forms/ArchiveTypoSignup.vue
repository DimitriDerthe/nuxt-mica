<template>
  <section class="mi:@container/ats mi:font-mi mi:text-label" aria-labelledby="ats-title">
    <div class="mi:grid mi:gap-6 mi:p-6 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[760px]/ats:grid-cols-[minmax(0,_1.25fr)_minmax(0,_1fr)] mi:@[760px]/ats:gap-7">
      <div class="mi:@[760px]/ats:pe-7 mi:@[760px]/ats:[border-inline-end:1px_solid_var(--mi-sep)] mi:grid mi:content-start mi:gap-3.5">
        <MiText variant="caption" tone="primary" weight="semibold" class="mi:uppercase mi:tracking-[.08em]!">Field Notes · every other Thursday</MiText>
        <MiText id="ats-title" as="h2" variant="title2" weight="bold" balance>One long read on how small software teams actually ship.</MiText>
        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2.5">
          <MiAvatarGroup :items="readers" :max="4" size="sm" />
          <MiText variant="footnote" tone="label2">Read by 18,400 engineers and founders. 62% open rate.</MiText>
        </div>

        <form v-if="!joined" class="mi:grid mi:gap-2.5 mi:max-w-105" novalidate @submit.prevent="submit">
          <MiField label="Work email" :error="error">
            <template #default="{ id, describedBy }">
              <MiInput :id="id" v-model="email" type="email" autocomplete="email" placeholder="you@company.com" :aria-describedby="describedBy" />
            </template>
          </MiField>
          <!-- Typo catcher: a near-miss of a common domain offers a one-tap fix instead of a bounce later. -->
          <p v-if="suggestion" class="mi:-mt-0.5 mi:mx-0 mi:mb-0 mi:text-[13px] mi:text-label2" role="status">
            Did you mean
            <button type="button" class="mi:[font:inherit] mi:font-semibold mi:p-0 mi:[border:0] mi:text-p-text mi:[background:none] mi:[text-decoration:underline] mi:underline-offset-[2px] mi:cursor-pointer" @click="email = suggestion">{{ suggestion }}</button>?
          </p>
          <MiButton type="submit" block :loading="sending">Subscribe, it's free</MiButton>
          <MiText variant="caption" tone="label3">No tracking pixels. Unsubscribe from any issue in one click.</MiText>
        </form>

        <div v-else class="mi:[--mi-in-y:6px] mi:animate-[in_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:animate-none mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:gap-y-1 mi:gap-x-3 mi:items-start mi:max-w-105 mi:p-4 mi:rounded-lg mi:[background:color-mix(in_srgb,_var(--mi-green)_10%,_transparent)]" role="status">
          <MiIcon name="check-circle-fill" :size="28" class="mi:text-green" />
          <div>
            <MiText as="h3" variant="headline" weight="semibold">Check {{ email }}</MiText>
            <MiText variant="footnote" tone="label2">Confirm your address and issue #49 lands on Thursday, Nov 6.</MiText>
          </div>
          <MiButton variant="plain" size="small" class="mi:col-start-2 mi:justify-self-start" @click="joined = false">Use another address</MiButton>
        </div>
      </div>

      <div class="mi:grid mi:content-start mi:gap-2.5">
        <MiText as="h3" variant="subheadline" weight="semibold" tone="label2">Recent issues</MiText>
        <ol class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="i in issues" :key="i.no" class="mi:grid mi:grid-cols-[44px_minmax(0,_1fr)] mi:gap-2.5 mi:py-3 mi:px-0 mi:not-first:border-t mi:not-first:border-t-sep">
            <span class="mi:text-[13px] mi:font-bold mi:text-label3 mi:tabular-nums">#{{ i.no }}</span>
            <div class="mi:grid mi:gap-0.5">
              <a href="#" class="mi:hover:text-p-text mi:text-[14.5px] mi:font-semibold mi:leading-[1.35] mi:text-label mi:[text-decoration:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[2px]" @click.prevent>{{ i.title }}</a>
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

<template>
  <div class="mi:@container mi:grid mi:content-start mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]">
    <header class="mi:[background:var(--mi-card)]">
      <div class="mi:flex mi:items-center mi:gap-3.5 mi:min-h-15 mi:pt-2 mi:pr-3 mi:pb-2 mi:pl-3.5 mi:@[760px]:gap-7 mi:@[760px]:py-2.5 mi:@[760px]:px-5 mi:@[760px]:min-h-18">
        <a href="#" class="mi:grid mi:flex-[none] mi:rounded-[9px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[3px]" aria-label="Tidewater home" @click.prevent>
          <span class="mi:grid mi:place-items-center mi:w-7.5 mi:h-7.5 mi:rounded-[9px] mi:[background:var(--mi-p)]" aria-hidden="true"><svg class="mi:w-5 mi:h-5 mi:fill-[color:none] mi:stroke-p-on mi:[stroke-width:2.2] mi:[stroke-linecap:round]" viewBox="0 0 24 24"><path d="M3 15c3-3 6 3 9 0s6 3 9 0" /><path d="M3 10c3-3 6 3 9 0s6 3 9 0" /></svg></span>
        </a>

        <!-- Wide: the full step list. Narrow: one compact line with the same facts. -->
        <MiSteps class="mi:hidden! mi:@[760px]:block! mi:@[760px]:flex-1! mi:@[760px]:min-w-0! mi:@[760px]:max-w-140! mi:@[760px]:mx-auto!" :model-value="step" :steps="steps" orientation="horizontal" aria-label="Workspace setup" @update:model-value="goTo" />
        <div class="mi:grid mi:flex-1 mi:min-w-0 mi:leading-[1.2] mi:@[760px]:hidden">
          <MiText as="span" variant="caption" tone="label2" weight="semibold" tabular>Step {{ step + 1 }} of {{ steps.length }}</MiText>
          <MiText as="span" variant="subheadline" weight="semibold">{{ cur.label }}</MiText>
        </div>

        <div class="mi:flex mi:items-center mi:gap-2.5 mi:ml-auto mi:flex-[none] mi:@[760px]:ml-0">
          <MiText as="span" variant="caption" tone="label3" class="mi:hidden! mi:whitespace-nowrap! mi:@[520px]:inline!" tabular>{{ eta }}</MiText>
          <MiButton variant="plain" size="small">Save and exit</MiButton>
        </div>
      </div>
      <div class="mi:h-[3px] mi:[background:var(--mi-fill4)]" role="progressbar" aria-label="Setup progress" :aria-valuenow="step + 1" aria-valuemin="1" :aria-valuemax="steps.length">
        <span class="mi:block mi:h-full mi:[background:linear-gradient(90deg,_var(--mi-p),_var(--mi-s))] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${(step + 1) / steps.length})` }" />
      </div>
    </header>

    <main class="mi:grid mi:pt-6 mi:px-3.5 mi:pb-9 mi:@[760px]:pt-10 mi:@[760px]:px-5 mi:@[760px]:pb-12" aria-labelledby="fh-title">
      <form class="mi:grid mi:gap-2 mi:w-full mi:max-w-130 mi:my-0 mi:mx-auto mi:py-5.5 mi:px-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[760px]:py-7.5 mi:@[760px]:px-8" @submit.prevent="next">
        <MiText variant="caption" tone="primary" weight="semibold">{{ cur.description }}</MiText>
        <MiText id="fh-title" variant="title2" as="h2" weight="bold">{{ cur.title }}</MiText>
        <MiText variant="callout" tone="label2">{{ cur.text }}</MiText>

        <div class="mi:grid mi:gap-3.5 mi:mt-3.5 mi:mx-0 mi:mb-1.5">
          <template v-if="step === 0">
            <MiField label="Your name"><MiInput v-model="form.name" /></MiField>
            <MiField label="Role"><MiInput v-model="form.role" /></MiField>
          </template>
          <template v-else-if="step === 1">
            <MiField label="Workspace name"><MiInput v-model="form.workspace" /></MiField>
            <MiField label="Address" hint="You can change it later."><MiInput v-model="form.slug" prefix="tidewater.dev/" /></MiField>
          </template>
          <template v-else-if="step === 2">
            <MiField label="Invite by email" hint="Separate addresses with a comma."><MiInput v-model="form.invites" type="email" /></MiField>
          </template>
          <div v-else class="mi:grid mi:gap-2 mi:@[760px]:grid-cols-3" role="radiogroup" aria-label="Plan">
            <button
              v-for="p in plans" :key="p.id" type="button" role="radio" class="mi:grid mi:gap-0.5 mi:py-3 mi:px-3.5 mi:[border:0] mi:rounded-md mi:text-start mi:[font:inherit] mi:text-inherit mi:[background:var(--mi-fill4)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:cursor-pointer mi:aria-checked:[background:var(--mi-p-tint)] mi:aria-checked:shadow-[inset_0_0_0_2px_var(--mi-p)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :aria-checked="form.plan === p.id" @click="form.plan = p.id"
            >
              <MiText as="span" variant="subheadline" weight="semibold">{{ p.name }}</MiText>
              <MiText as="span" variant="footnote" tone="label2">{{ p.price }}</MiText>
            </button>
          </div>
        </div>

        <div class="mi:flex mi:justify-between mi:gap-2.5 mi:pt-2.5">
          <MiButton variant="gray" :disabled="step === 0" @click="step--">Back</MiButton>
          <MiButton type="submit">{{ step === steps.length - 1 ? 'Create workspace' : 'Continue' }}</MiButton>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const steps = [
  { label: 'You', description: 'About you' },
  { label: 'Workspace', description: 'Name and address' },
  { label: 'Team', description: 'Invite people' },
  { label: 'Plan', description: 'Pick a plan' }
]
const copy = [
  { title: 'Tell us who you are', text: 'Teammates see this next to your comments and assignments.' },
  { title: 'Name your workspace', text: 'Most teams use their company or product name.' },
  { title: 'Bring your team', text: 'Invites go out when you finish. Skip this if you would rather do it later.' },
  { title: 'Choose how to start', text: 'Every plan starts with 14 days of Growth features. No card needed.' }
]
const minutesPerStep = [3, 2, 1, 1]
const plans = [
  { id: 'free', name: 'Free', price: 'Up to 5 people' },
  { id: 'growth', name: 'Growth', price: '$9 per person a month' },
  { id: 'scale', name: 'Scale', price: '$18 per person a month' }
]

const step = ref(1)
const form = reactive({ name: 'Noor Haddad', role: 'Head of Operations', workspace: 'Harbor Freight', slug: 'harbor-freight', invites: '', plan: 'growth' })

const cur = computed(() => ({ ...steps[step.value]!, ...copy[step.value]! }))

const eta = computed(() => {
  const m = minutesPerStep.slice(step.value).reduce((a, b) => a + b, 0)
  return `About ${m} min left`
})

// Steps only jump backwards; going forward goes through Continue.
function goTo(i: number) { if (i < step.value) step.value = i }
function next() { if (step.value < steps.length - 1) step.value++ }
</script>

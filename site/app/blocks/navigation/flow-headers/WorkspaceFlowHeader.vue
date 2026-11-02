<template>
  <div class="fh">
    <header class="fh__header">
      <div class="fh__bar">
        <a href="#" class="fh__brand" aria-label="Tidewater home" @click.prevent>
          <span class="fh__mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 15c3-3 6 3 9 0s6 3 9 0" /><path d="M3 10c3-3 6 3 9 0s6 3 9 0" /></svg></span>
        </a>

        <!-- Wide: the full step list. Narrow: one compact line with the same facts. -->
        <MiSteps class="fh__steps" :model-value="step" :steps="steps" orientation="horizontal" aria-label="Workspace setup" @update:model-value="goTo" />
        <div class="fh__compact">
          <MiText as="span" variant="caption" tone="label2" weight="semibold" tabular>Step {{ step + 1 }} of {{ steps.length }}</MiText>
          <MiText as="span" variant="subheadline" weight="semibold">{{ cur.label }}</MiText>
        </div>

        <div class="fh__exit">
          <MiText as="span" variant="caption" tone="label3" class="fh__eta" tabular>{{ eta }}</MiText>
          <MiButton variant="plain" size="small">Save and exit</MiButton>
        </div>
      </div>
      <div class="fh__track" role="progressbar" aria-label="Setup progress" :aria-valuenow="step + 1" aria-valuemin="1" :aria-valuemax="steps.length">
        <span :style="{ transform: `scaleX(${(step + 1) / steps.length})` }" />
      </div>
    </header>

    <main class="fh__body" aria-labelledby="fh-title">
      <form class="fh__card" @submit.prevent="next">
        <MiText variant="caption" tone="primary" weight="semibold">{{ cur.description }}</MiText>
        <MiText id="fh-title" variant="title2" as="h2" weight="bold">{{ cur.title }}</MiText>
        <MiText variant="callout" tone="label2">{{ cur.text }}</MiText>

        <div class="fh__fields">
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
          <div v-else class="fh__plans" role="radiogroup" aria-label="Plan">
            <button
              v-for="p in plans" :key="p.id" type="button" role="radio" class="fh__plan" :aria-checked="form.plan === p.id" @click="form.plan = p.id"
            >
              <MiText as="span" variant="subheadline" weight="semibold">{{ p.name }}</MiText>
              <MiText as="span" variant="footnote" tone="label2">{{ p.price }}</MiText>
            </button>
          </div>
        </div>

        <div class="fh__nav">
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

<style scoped>
.fh { container-type: inline-size; display: grid; align-content: start; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.fh__header { background: var(--mi-card); }
.fh__bar { display: flex; align-items: center; gap: 14px; min-height: 60px; padding: 8px 12px 8px 14px; }
.fh__brand { display: grid; flex: none; border-radius: 9px; }
.fh__brand:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 3px; }
.fh__mark { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px; background: var(--mi-p); }
.fh__mark svg { width: 20px; height: 20px; fill: none; stroke: var(--mi-p-on); stroke-width: 2.2; stroke-linecap: round; }

.fh__steps { display: none; }
.fh__compact { display: grid; flex: 1; min-width: 0; line-height: 1.2; }
.fh__exit { display: flex; align-items: center; gap: 10px; margin-left: auto; flex: none; }
.fh__eta { display: none; white-space: nowrap; }

/* The hairline is the whole header's progress; it grows with a transform only. */
.fh__track { height: 3px; background: var(--mi-fill4); }
.fh__track span { display: block; height: 100%; background: linear-gradient(90deg, var(--mi-p), var(--mi-s)); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }

.fh__body { display: grid; padding: 24px 14px 36px; }
.fh__card { display: grid; gap: 8px; width: 100%; max-width: 520px; margin: 0 auto; padding: 22px 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.fh__fields { display: grid; gap: 14px; margin: 14px 0 6px; }
.fh__plans { display: grid; gap: 8px; }
.fh__plan {
  display: grid; gap: 2px; padding: 12px 14px; border: 0; border-radius: var(--mi-radius-m); text-align: start;
  font: inherit; color: inherit; background: var(--mi-fill4); box-shadow: inset 0 0 0 1px var(--mi-sep); cursor: pointer;
}
.fh__plan[aria-checked="true"] { background: var(--mi-p-tint); box-shadow: inset 0 0 0 2px var(--mi-p); }
.fh__plan:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.fh__nav { display: flex; justify-content: space-between; gap: 10px; padding-top: 10px; }

@container (min-width: 520px) { .fh__eta { display: inline; } }
@container (min-width: 760px) {
  .fh__bar { gap: 28px; padding: 10px 20px; min-height: 72px; }
  .fh__steps { display: block; flex: 1; min-width: 0; max-width: 560px; margin-inline: auto; }
  .fh__compact { display: none; }
  .fh__exit { margin-left: 0; }
  .fh__body { padding: 40px 20px 48px; }
  .fh__card { padding: 30px 32px; }
  .fh__plans { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>

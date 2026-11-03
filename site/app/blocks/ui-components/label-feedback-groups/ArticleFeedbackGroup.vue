<template>
  <div class="mi:@container">
    <section class="mi:grid mi:gap-4.5 mi:p-5 mi:rounded-xl mi:font-mi mi:text-label mi:bg-card mi:shadow-1 mi:@[640px]:py-6 mi:@[640px]:px-6.5" aria-labelledby="af-title">
      <!-- Label group: what the reader needs before trusting the page. -->
      <div class="mi:flex mi:flex-wrap mi:gap-1.5" aria-label="About this guide" role="group">
        <span class="mi:text-p-text mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6.5 mi:py-0 mi:px-2.5 mi:rounded-[8px] mi:text-[12px] mi:font-medium mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:bg-p-tint mi:shadow-none"><MiIcon name="document" :size="14" /> Guide</span>
        <span class="mi:text-label2 mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6.5 mi:py-0 mi:px-2.5 mi:rounded-[8px] mi:text-[12px] mi:font-medium mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]"><MiIcon :svg="icons.clock" :size="14" /> 6 min read</span>
        <span class="mi:text-label2 mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6.5 mi:py-0 mi:px-2.5 mi:rounded-[8px] mi:text-[12px] mi:font-medium mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]"><MiIcon :svg="icons.refresh" :size="14" /> Updated 3 days ago</span>
        <span class="mi:text-green-t mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6.5 mi:py-0 mi:px-2.5 mi:rounded-[8px] mi:text-[12px] mi:font-medium mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]"><MiIcon name="check-circle" :size="14" /> Tested on API v3</span>
      </div>

      <div class="mi:grid mi:gap-3.5 mi:pt-4 mi:border-t mi:border-t-sep mi:@[640px]:grid-cols-[minmax(0,_1fr)_auto] mi:@[640px]:items-center mi:@[640px]:gap-x-6 mi:@[900px]:grid-cols-[minmax(0,_1fr)_auto_220px]">
        <div class="mi:grid mi:gap-0.5">
          <MiText id="af-title" variant="headline" as="h2">Was this guide helpful?</MiText>
          <MiText variant="footnote" tone="label2">Rotating API keys without downtime</MiText>
        </div>

        <div v-if="!sent" class="mi:flex mi:flex-wrap mi:gap-2" role="group" aria-labelledby="af-title">
          <MiButton
            v-for="o in options" :key="o.value" size="small" :variant="vote === o.value ? 'tinted' : 'gray'"
            :pressed="vote === o.value" @click="choose(o.value)"
          >
            <template #leading><MiIcon :svg="o.icon" :size="16" /></template>
            {{ o.label }}
          </MiButton>
        </div>

        <div class="mi:grid mi:gap-1.5 mi:max-w-65 mi:@[640px]:col-span-full mi:@[900px]:col-[auto]" role="meter" aria-label="Readers who found this helpful" :aria-valuenow="yes" aria-valuemin="0" :aria-valuemax="total">
          <MiText variant="caption" tone="label2" tabular><strong class="mi:text-label mi:font-semibold">{{ pct }}%</strong> of {{ total }} readers</MiText>
          <span class="mi:block mi:h-1 mi:rounded-[2px] mi:overflow-hidden mi:bg-fill3"><span class="mi:block mi:h-full mi:rounded-[inherit] mi:bg-green mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${yes / total})` }" /></span>
        </div>
      </div>

      <!-- Follow-up group: appears in place once a vote is cast. -->
      <Transition enter-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)]" enter-from-class="mi:opacity-0 mi:transform-[translateY(-6px)]" leave-to-class="mi:opacity-0 mi:transform-[translateY(-6px)]">
        <form v-if="vote && !sent" class="mi:grid mi:gap-3 mi:p-4 mi:rounded-lg mi:bg-fill4" @submit.prevent="send">
          <MiText as="h3" variant="subheadline" weight="semibold">{{ vote === 'yes' ? 'What helped most?' : 'What went wrong?' }}</MiText>
          <div class="mi:flex mi:flex-wrap mi:gap-1.5" role="group" :aria-label="vote === 'yes' ? 'What helped' : 'What went wrong'">
            <MiChip
              v-for="r in reasons" :key="r" :model-value="picked.includes(r)" :label="r" selectable size="small"
              :tone="vote === 'yes' ? 'primary' : 'neutral'" @update:model-value="togglePick(r)"
            />
          </div>
          <MiTextarea v-if="vote === 'no'" v-model="note" :rows="2" :max-rows="4" :maxlength="280" counter aria-label="Tell us more" placeholder="Which step failed, and what did you expect? (optional)" />
          <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
            <MiText variant="caption" tone="label3">Read by the Developer Docs team, never shown publicly.</MiText>
            <MiButton type="submit" size="small" :disabled="vote === 'no' && !picked.length && !note.trim()">Send feedback</MiButton>
          </div>
        </form>
      </Transition>

      <div v-if="sent" class="mi:flex mi:flex-wrap mi:items-center mi:gap-2.5 mi:py-3 mi:px-3.5 mi:rounded-lg mi:[background:color-mix(in_srgb,_var(--mi-green)_10%,_transparent)]" role="status">
        <span class="mi:grid mi:place-items-center mi:w-6.5 mi:h-6.5 mi:rounded-[50%] mi:text-green-t mi:[background:color-mix(in_srgb,_var(--mi-green)_18%,_transparent)]" aria-hidden="true"><MiIcon name="check" :size="16" :weight="2.6" /></span>
        <MiText variant="footnote" class="mi:flex-[1_1_200px]!"><strong>Thanks, noted.</strong> {{ vote === 'no' ? 'We review every report within two working days.' : 'Glad it helped.' }}</MiText>
        <MiButton variant="plain" size="small" @click="reset">Undo</MiButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Vote = 'yes' | 'no'

const icons = {
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.8-3.6M4 4v4h4M4 13a8 8 0 0 0 14.8 3.6M20 20v-4h-4"/>',
  up: '<path d="M7 11v9H4v-9h3Zm0 0 4-7a2 2 0 0 1 3 1.7V9h5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7"/>',
  down: '<path d="M7 13V4H4v9h3Zm0 0 4 7a2 2 0 0 0 3-1.7V15h5a2 2 0 0 0 2-2.3l-1.2-7A2 2 0 0 0 17.8 4H7"/>'
}
const options = [{ value: 'yes' as Vote, label: 'Yes', icon: icons.up }, { value: 'no' as Vote, label: 'Not really', icon: icons.down }]
const reasonsBy: Record<Vote, string[]> = {
  yes: ['Clear steps', 'Code samples', 'The rollback section', 'Diagrams'],
  no: ['Outdated', 'Missing an example', 'Hard to follow', 'Commands failed']
}

const base = { yes: 214, total: 236 }
const vote = ref<Vote | null>(null)
const picked = ref<string[]>([])
const note = ref('')
const sent = ref(false)

const reasons = computed(() => (vote.value ? reasonsBy[vote.value] : []))
const yes = computed(() => base.yes + (vote.value === 'yes' ? 1 : 0))
const total = computed(() => base.total + (vote.value ? 1 : 0))
const pct = computed(() => Math.round((yes.value / total.value) * 100))

function choose(v: Vote) {
  if (vote.value !== v) picked.value = []
  vote.value = vote.value === v ? null : v
}
function togglePick(r: string) {
  picked.value = picked.value.includes(r) ? picked.value.filter(x => x !== r) : [...picked.value, r]
}
function send() { sent.value = true }
function reset() { sent.value = false; vote.value = null; picked.value = []; note.value = '' }
</script>


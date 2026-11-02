<template>
  <div class="af-cq">
    <section class="af" aria-labelledby="af-title">
      <!-- Label group: what the reader needs before trusting the page. -->
      <div class="af__labels" aria-label="About this guide" role="group">
        <span class="af__label af__label--brand"><MiIcon name="document" :size="14" /> Guide</span>
        <span class="af__label"><MiIcon :svg="icons.clock" :size="14" /> 6 min read</span>
        <span class="af__label"><MiIcon :svg="icons.refresh" :size="14" /> Updated 3 days ago</span>
        <span class="af__label af__label--ok"><MiIcon name="check-circle" :size="14" /> Tested on API v3</span>
      </div>

      <div class="af__body">
        <div class="af__ask">
          <MiText id="af-title" variant="headline" as="h2">Was this guide helpful?</MiText>
          <MiText variant="footnote" tone="label2">Rotating API keys without downtime</MiText>
        </div>

        <div v-if="!sent" class="af__vote" role="group" aria-labelledby="af-title">
          <MiButton
            v-for="o in options" :key="o.value" size="small" :variant="vote === o.value ? 'tinted' : 'gray'"
            :pressed="vote === o.value" @click="choose(o.value)"
          >
            <template #leading><MiIcon :svg="o.icon" :size="16" /></template>
            {{ o.label }}
          </MiButton>
        </div>

        <div class="af__score" role="meter" aria-label="Readers who found this helpful" :aria-valuenow="yes" aria-valuemin="0" :aria-valuemax="total">
          <MiText variant="caption" tone="label2" tabular><strong class="af__num">{{ pct }}%</strong> of {{ total }} readers</MiText>
          <span class="af__track"><span class="af__fill" :style="{ transform: `scaleX(${yes / total})` }" /></span>
        </div>
      </div>

      <!-- Follow-up group: appears in place once a vote is cast. -->
      <Transition name="af">
        <form v-if="vote && !sent" class="af__more" @submit.prevent="send">
          <MiText as="h3" variant="subheadline" weight="semibold">{{ vote === 'yes' ? 'What helped most?' : 'What went wrong?' }}</MiText>
          <div class="af__chips" role="group" :aria-label="vote === 'yes' ? 'What helped' : 'What went wrong'">
            <MiChip
              v-for="r in reasons" :key="r" :model-value="picked.includes(r)" :label="r" selectable size="small"
              :tone="vote === 'yes' ? 'primary' : 'neutral'" @update:model-value="togglePick(r)"
            />
          </div>
          <MiTextarea v-if="vote === 'no'" v-model="note" :rows="2" :max-rows="4" :maxlength="280" counter aria-label="Tell us more" placeholder="Which step failed, and what did you expect? (optional)" />
          <div class="af__send">
            <MiText variant="caption" tone="label3">Read by the Developer Docs team, never shown publicly.</MiText>
            <MiButton type="submit" size="small" :disabled="vote === 'no' && !picked.length && !note.trim()">Send feedback</MiButton>
          </div>
        </form>
      </Transition>

      <div v-if="sent" class="af__thanks" role="status">
        <span class="af__tick" aria-hidden="true"><MiIcon name="check" :size="16" :weight="2.6" /></span>
        <MiText variant="footnote"><strong>Thanks, noted.</strong> {{ vote === 'no' ? 'We review every report within two working days.' : 'Glad it helped.' }}</MiText>
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

<style scoped>
.af-cq { container-type: inline-size; }
.af {
  display: grid; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl);
  font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-card); box-shadow: var(--mi-sh1);
}
.af__labels { display: flex; flex-wrap: wrap; gap: 6px; }
.af__label {
  display: inline-flex; align-items: center; gap: 5px; height: 26px; padding: 0 10px; border-radius: 8px;
  font-size: 12px; font-weight: 500; color: var(--mi-label2); box-shadow: inset 0 0 0 1px var(--mi-sep);
}
.af__label--brand { color: var(--mi-p-text); background: var(--mi-p-tint); box-shadow: none; }
.af__label--ok { color: var(--mi-green-t); }

.af__body { display: grid; gap: 14px; padding-top: 16px; border-top: 1px solid var(--mi-sep); }
.af__ask { display: grid; gap: 2px; }
.af__vote { display: flex; flex-wrap: wrap; gap: 8px; }
.af__score { display: grid; gap: 6px; max-width: 260px; }
.af__num { color: var(--mi-label); font-weight: 600; }
.af__track { display: block; height: 4px; border-radius: 2px; overflow: hidden; background: var(--mi-fill3); }
.af__fill { display: block; height: 100%; border-radius: inherit; background: var(--mi-green); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }

.af__more { display: grid; gap: 12px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.af__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.af__send { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }

.af__thanks { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px 14px; border-radius: var(--mi-radius-l); background: color-mix(in srgb, var(--mi-green) 10%, transparent); }
.af__tick { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 18%, transparent); }
.af__thanks > :nth-child(2) { flex: 1 1 200px; }

.af-enter-active, .af-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.af-enter-from, .af-leave-to { opacity: 0; transform: translateY(-6px); }

@container (min-width: 640px) {
  .af { padding: 24px 26px; }
  .af__body { grid-template-columns: minmax(0, 1fr) auto; align-items: center; column-gap: 24px; }
  .af__score { grid-column: 1 / -1; }
}
@container (min-width: 900px) {
  .af__body { grid-template-columns: minmax(0, 1fr) auto 220px; }
  .af__score { grid-column: auto; }
}
</style>

<template>
  <section class="nps" aria-labelledby="nps-title">
    <form v-if="!sent" class="nps__card" :class="group && `is-${group}`" novalidate @submit.prevent="sent = true">
      <header class="nps__head">
        <MiText variant="caption" tone="label2" weight="medium">Quick question · 2 of 2</MiText>
        <MiText id="nps-title" as="h2" variant="title3" weight="semibold" balance>How likely are you to recommend Tidepool to a colleague?</MiText>
      </header>

      <!-- 0 to 10 as real radios; the band under the scale names the three NPS groups. -->
      <fieldset class="nps__scale">
        <legend class="nps__sr">Score from 0, not likely, to 10, extremely likely</legend>
        <div class="nps__cells">
          <label v-for="n in 11" :key="n" class="nps__cell" :class="[`is-${groupOf(n - 1)}`, { 'is-on': score === n - 1 }]">
            <input v-model="score" class="nps__sr" type="radio" name="nps-score" :value="n - 1">
            <span>{{ n - 1 }}</span>
          </label>
        </div>
        <div class="nps__ends" aria-hidden="true"><span>Not likely</span><span>Extremely likely</span></div>
      </fieldset>

      <div v-if="group" class="nps__follow">
        <MiText as="h3" variant="headline" weight="semibold">{{ copy[group].question }}</MiText>
        <div class="nps__chips" role="group" :aria-label="copy[group].question">
          <MiChip
            v-for="r in copy[group].reasons" :key="r" :label="r" size="small" selectable tone="neutral"
            :model-value="reasons.includes(r)" @update:model-value="toggle(r)"
          />
        </div>
        <MiTextarea v-model="note" :rows="2" :max-rows="5" :maxlength="400" aria-label="Anything else" placeholder="Anything else? (optional)" />
        <MiCheckbox v-if="group === 'detractor'" v-model="callback" label="A product manager can email me about this" />
      </div>

      <footer class="nps__foot">
        <MiButton variant="plain" size="small" @click="sent = true">Not now</MiButton>
        <MiButton type="submit" :disabled="score === null">Send feedback</MiButton>
      </footer>
    </form>

    <div v-else class="nps__card nps__done" role="status">
      <MiIcon name="check-circle-fill" :size="30" />
      <MiText as="h2" variant="title3" weight="semibold">{{ score === null ? 'No problem.' : copy[group ?? 'passive'].thanks }}</MiText>
      <MiText variant="footnote" tone="label2">We ask at most once a quarter.</MiText>
      <MiButton variant="plain" size="small" @click="reset">Change my answer</MiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Group = 'detractor' | 'passive' | 'promoter'
interface Copy { question: string, reasons: string[], thanks: string }

const copy: Record<Group, Copy> = {
  detractor: { question: 'What let you down most?', reasons: ['Sync is unreliable', 'Too expensive', 'Missing integrations', 'Slow support'], thanks: 'Thank you for being honest. We read every reply.' },
  passive: { question: 'What would make it a 10?', reasons: ['Faster search', 'Better mobile app', 'Offline mode', 'Clearer pricing'], thanks: 'Thanks. Your ideas go straight to the roadmap review.' },
  promoter: { question: 'What do you love about it?', reasons: ['Saves me hours', 'Clean design', 'Great integrations', 'Helpful support'], thanks: 'Thank you! That made the team’s day.' }
}

const score = ref<number | null>(null)
const reasons = ref<string[]>([])
const note = ref('')
const callback = ref(false)
const sent = ref(false)

const groupOf = (n: number): Group => n <= 6 ? 'detractor' : n <= 8 ? 'passive' : 'promoter'
const group = computed<Group | null>(() => score.value === null ? null : groupOf(score.value))

function toggle(r: string) {
  reasons.value = reasons.value.includes(r) ? reasons.value.filter(x => x !== r) : [...reasons.value, r]
}
function reset() { sent.value = false; reasons.value = [] }
</script>

<style scoped>
.nps { container: nps / inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.nps__card { position: relative; display: grid; gap: 18px; max-width: 620px; margin-inline: auto; padding: 22px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; isolation: isolate; }
/* Group tint: a static wash behind the card, changed by class (no animated color). */
.nps__card::before { content: ""; position: absolute; inset: 0; z-index: -1; opacity: 0; background: linear-gradient(180deg, var(--nps-tone), transparent 55%); transition: opacity var(--mi-dur-3) var(--mi-ease); }
.nps__card.is-detractor { --nps-tone: color-mix(in srgb, var(--mi-red) 10%, transparent); }
.nps__card.is-passive { --nps-tone: color-mix(in srgb, var(--mi-orange) 10%, transparent); }
.nps__card.is-promoter { --nps-tone: color-mix(in srgb, var(--mi-green) 12%, transparent); }
.nps__card[class*='is-']::before { opacity: 1; }
.nps__head { display: grid; gap: 6px; }

.nps__scale { margin: 0; padding: 0; border: 0; min-width: 0; }
.nps__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.nps__cells { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; }
@container nps (min-width: 520px) { .nps__cells { grid-template-columns: repeat(11, minmax(0, 1fr)); } }
.nps__cell { position: relative; display: grid; place-items: center; height: 42px; border-radius: var(--mi-radius-m); font-weight: 600; font-variant-numeric: tabular-nums; background: var(--mi-fill4); cursor: pointer; }
.nps__cell::after { content: ""; position: absolute; inset: auto 6px 4px; height: 3px; border-radius: 2px; background: var(--nps-band); opacity: .7; }
.nps__cell.is-detractor { --nps-band: var(--mi-red); }
.nps__cell.is-passive { --nps-band: var(--mi-orange); }
.nps__cell.is-promoter { --nps-band: var(--mi-green); }
.nps__cell span { transition: transform var(--mi-dur-2) var(--mi-spring); }
.nps__cell:hover span { transform: scale(1.12); }
.nps__cell.is-on { color: var(--mi-p-on); background: var(--mi-p); }
.nps__cell.is-on::after { background: var(--mi-p-on); }
.nps__cell:has(input:focus-visible) { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.nps__ends { display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: var(--mi-label3); }

.nps__follow { display: grid; gap: 10px; animation: nps-in var(--mi-dur-3) var(--mi-ease); }
.nps__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.nps__foot { display: flex; justify-content: flex-end; gap: 8px; }

.nps__done { justify-items: center; gap: 8px; text-align: center; }
.nps__done > :first-child { color: var(--mi-green); }
@keyframes nps-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .nps__follow { animation: none; } .nps__cell span { transition: none; } }
</style>

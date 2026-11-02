<template>
  <div class="aff-cq">
    <section class="aff" aria-labelledby="aff-title">
      <div class="aff__intro">
        <MiText variant="caption" weight="semibold" tone="label2">Ledgerly · week one check-in</MiText>
        <MiText id="aff-title" variant="title2" as="h2" weight="bold" balance>How is your first week going, Maya?</MiText>
        <MiText variant="subheadline" tone="label2">Two minutes, and it goes straight to the people who build the product. We read every reply on Friday.</MiText>
        <div class="aff__team">
          <MiAvatarGroup :items="team" :max="4" size="sm" />
          <MiText variant="caption" tone="label2">Jonas, Priya, Kenji and Rosa read these</MiText>
        </div>
      </div>

      <div v-if="sent" class="aff__done" role="status">
        <MiIcon :svg="face(score)" :size="48" class="aff__done-face" />
        <MiText variant="title3" as="h3" weight="semibold">Thank you, Maya</MiText>
        <MiText variant="subheadline" tone="label2" align="center">
          Saved as FB-2291.{{ contact ? ' Rosa from support will write to ' + email + ' within one working day.' : '' }}
        </MiText>
        <MiButton variant="gray" size="small" @click="restart">Send another note</MiButton>
      </div>

      <form v-else class="aff__form" novalidate @submit.prevent="submit">
        <fieldset class="aff__scale">
          <legend>Overall, how does Ledgerly feel so far?</legend>
          <div class="aff__faces">
            <label v-for="n in 5" :key="n" class="aff__face" :class="{ 'is-on': score === n, 'is-dim': score && score !== n }">
              <input v-model="score" type="radio" name="aff-score" :value="n" class="aff__radio">
              <MiIcon :svg="face(n)" :size="34" :weight="1.6" />
              <span>{{ WORDS[n - 1] }}</span>
            </label>
          </div>
          <MiText v-if="tried && !score" variant="caption" tone="red" role="alert">Pick the face that fits best.</MiText>
        </fieldset>

        <!-- The follow-up question and its suggestions change with the answer above. -->
        <template v-if="score">
          <fieldset class="aff__topics">
            <legend>{{ follow.q }}</legend>
            <div class="aff__chips">
              <MiChip
                v-for="t in follow.topics" :key="t" selectable size="small" :label="t"
                :model-value="topics.includes(t)" @update:model-value="on => (topics = on ? [...topics, t] : topics.filter(x => x !== t))"
              />
            </div>
          </fieldset>

          <MiField label="Tell us more" :error="tried && note.trim().length > 0 && note.trim().length < 12 ? 'A few more words help us act on it.' : ''">
            <MiTextarea v-model="note" :rows="3" :max-rows="6" :maxlength="500" counter :placeholder="follow.placeholder" />
          </MiField>

          <MiFileInput v-model="shot" accept="image/*" :max-size="5 * 1024 * 1024" label="Screenshot" button-label="Attach screenshot" placeholder="Optional, PNG or JPG up to 5 MB" />

          <div class="aff__contact">
            <div class="aff__contact-row">
              <div>
                <MiText id="aff-contact" variant="subheadline" weight="medium">{{ score <= 2 ? 'Have someone from support reach out' : 'You can follow up with me' }}</MiText>
                <MiText variant="caption" tone="label2">We reply within one working day</MiText>
              </div>
              <MiSwitch v-model="contact" aria-labelledby="aff-contact" />
            </div>
            <MiField v-if="contact" label="Email" :error="tried && !emailOk ? 'Enter an email we can reply to.' : ''">
              <MiInput v-model="email" type="email" autocomplete="email" />
            </MiField>
          </div>

          <div class="aff__foot">
            <MiCheckbox v-if="score >= 4" v-model="quote" label="You may quote me on the website" />
            <span v-else />
            <MiButton type="submit">Send feedback</MiButton>
          </div>
        </template>
        <MiButton v-else type="submit" variant="gray">Send feedback</MiButton>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const WORDS = ['Frustrating', 'Rocky', 'Okay', 'Good', 'Love it']
const team = ['Jonas Weber', 'Priya Raman', 'Kenji Mori', 'Rosa Lindqvist'].map(name => ({ name, tone: 'auto' as const }))

/** Face glyph on the 24 grid: the mouth curve goes from frown (1) to wide smile (5). */
function face(n: number) {
  const [y, c] = ([[16.6, 13.4], [16, 14.6], [15.4, 15.4], [14.8, 17], [14.2, 18.6]] as const)[Math.max(0, n - 1)] ?? [15.4, 15.4]
  return `<circle cx="12" cy="12" r="9"/><path d="M9 9.5v.5M15 9.5v.5" stroke-width="2.4"/><path d="M8.2 ${y}Q12 ${c} 15.8 ${y}"/>`
}

const FOLLOW = {
  low: { q: 'What got in the way?', placeholder: 'Where did you get stuck? What did you expect to happen?', topics: ['Bank sync failed', 'Setup took too long', 'Missing integration', 'Pricing is unclear', 'Something broke'] },
  mid: { q: 'What would make it a five?', placeholder: 'The one change that would make the biggest difference…', topics: ['More invoice templates', 'Faster sync', 'Better mobile app', 'Clearer reports'] },
  high: { q: 'What do you like most?', placeholder: 'What has it replaced for you, or what does it save you?', topics: ['Bank sync', 'Invoicing', 'Monthly reports', 'Mobile receipts', 'Support'] }
}

const score = ref(0)
const topics = ref<string[]>([])
const note = ref('')
const shot = ref<File | File[] | null>(null)
const contact = ref(false)
const email = ref('maya@cobaltfoods.co')
const quote = ref(false)
const tried = ref(false)
const sent = ref(false)

const follow = computed(() => (score.value <= 2 ? FOLLOW.low : score.value === 3 ? FOLLOW.mid : FOLLOW.high))
const emailOk = computed(() => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.value))

// A new mood resets the suggestions; a rough week turns on the offer of help.
watch(score, (n, old) => {
  if ((n <= 2) !== (old <= 2) || (n === 3) !== (old === 3)) topics.value = []
  contact.value = n > 0 && n <= 2
})

function submit() {
  tried.value = true
  if (!score.value) return
  if (note.value.trim().length > 0 && note.value.trim().length < 12) return
  if (contact.value && !emailOk.value) return
  sent.value = true
}
function restart() {
  score.value = 0
  note.value = ''
  topics.value = []
  shot.value = null
  tried.value = false
  sent.value = false
}
</script>

<style scoped>
.aff-cq { container-type: inline-size; }
.aff { display: grid; gap: 24px; padding: 22px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); }
@container (min-width: 800px) { .aff { grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: 36px; padding: 28px; } }
.aff__intro { display: grid; gap: 10px; align-content: start; }
.aff__team { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 6px; }

.aff__form { display: grid; gap: 18px; min-width: 0; }
.aff__scale, .aff__topics { margin: 0; padding: 0; border: 0; min-width: 0; display: grid; gap: 10px; }
.aff__scale legend, .aff__topics legend { padding: 0; margin-bottom: 10px; font-size: 15px; font-weight: 600; }
.aff__faces { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }
.aff__face {
  position: relative; display: grid; justify-items: center; gap: 4px; padding: 10px 2px 8px; border-radius: var(--mi-radius-m); cursor: pointer;
  color: var(--mi-label2); font-size: 11px; text-align: center; transition: transform var(--mi-dur-2) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease);
}
.aff__face:hover { transform: translateY(-2px); }
.aff__face.is-dim { opacity: .45; }
.aff__face.is-on { color: var(--mi-p-text); background: var(--mi-p-tint); transform: scale(1.04); }
.aff__face:has(:focus-visible) { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.aff__radio { position: absolute; opacity: 0; pointer-events: none; }
.aff__chips { display: flex; flex-wrap: wrap; gap: 6px; }

.aff__contact { display: grid; gap: 12px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.aff__contact-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.aff__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }

.aff__done { display: grid; justify-items: center; align-content: center; gap: 8px; padding: 24px 8px; text-align: center; }
.aff__done-face { color: var(--mi-p); }
</style>

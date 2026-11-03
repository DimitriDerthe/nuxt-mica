<template>
  <div class="aff-cq mi:@container">
    <section class="aff mi:grid mi:gap-6 mi:p-5.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:font-mi mi:text-label mi:@[800px]:grid-cols-[minmax(0,_.8fr)_minmax(0,_1.2fr)] mi:@[800px]:gap-9 mi:@[800px]:p-7" aria-labelledby="aff-title">
      <div class="aff__intro mi:grid mi:gap-2.5 mi:content-start">
        <MiText variant="caption" weight="semibold" tone="label2">Ledgerly · week one check-in</MiText>
        <MiText id="aff-title" variant="title2" as="h2" weight="bold" balance>How is your first week going, Maya?</MiText>
        <MiText variant="subheadline" tone="label2">Two minutes, and it goes straight to the people who build the product. We read every reply on Friday.</MiText>
        <div class="aff__team mi:flex mi:flex-wrap mi:items-center mi:gap-2.5 mi:mt-1.5">
          <MiAvatarGroup :items="team" :max="4" size="sm" />
          <MiText variant="caption" tone="label2">Jonas, Priya, Kenji and Rosa read these</MiText>
        </div>
      </div>

      <div v-if="sent" class="aff__done mi:grid mi:justify-items-center mi:content-center mi:gap-2 mi:py-6 mi:px-2 mi:text-center" role="status">
        <MiIcon :svg="face(score)" :size="48" class="aff__done-face mi:text-p" />
        <MiText variant="title3" as="h3" weight="semibold">Thank you, Maya</MiText>
        <MiText variant="subheadline" tone="label2" align="center">
          Saved as FB-2291.{{ contact ? ' Rosa from support will write to ' + email + ' within one working day.' : '' }}
        </MiText>
        <MiButton variant="gray" size="small" @click="restart">Send another note</MiButton>
      </div>

      <form v-else class="aff__form mi:grid mi:gap-4.5 mi:min-w-0" novalidate @submit.prevent="submit">
        <fieldset class="aff__scale mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0 mi:grid mi:gap-2.5">
          <legend>Overall, how does Ledgerly feel so far?</legend>
          <div class="aff__faces mi:grid mi:grid-cols-5 mi:gap-1.5">
            <label v-for="n in 5" :key="n" class="aff__face mi:relative mi:grid mi:justify-items-center mi:gap-1 mi:pt-2.5 mi:px-0.5 mi:pb-2 mi:rounded-md mi:cursor-pointer mi:text-label2 mi:text-[11px] mi:text-center mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring),_opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[&.is-dim]:opacity-45 mi:[&.is-on]:text-p-text mi:[&.is-on]:bg-p-tint mi:[&:has(:focus-visible)]:[outline:2px_solid_var(--mi-p)] mi:[&:has(:focus-visible)]:outline-offset-[2px]" :class="{ 'is-on': score === n, 'is-dim': score && score !== n }">
              <input v-model="score" type="radio" name="aff-score" :value="n" class="aff__radio mi:absolute mi:opacity-0 mi:pointer-events-none">
              <MiIcon :svg="face(n)" :size="34" :weight="1.6" />
              <span>{{ WORDS[n - 1] }}</span>
            </label>
          </div>
          <MiText v-if="tried && !score" variant="caption" tone="red" role="alert">Pick the face that fits best.</MiText>
        </fieldset>

        <!-- The follow-up question and its suggestions change with the answer above. -->
        <template v-if="score">
          <fieldset class="aff__topics mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0 mi:grid mi:gap-2.5">
            <legend>{{ follow.q }}</legend>
            <div class="aff__chips mi:flex mi:flex-wrap mi:gap-1.5">
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

          <div class="aff__contact mi:grid mi:gap-3 mi:p-3.5 mi:rounded-lg mi:bg-fill4">
            <div class="aff__contact-row mi:flex mi:items-center mi:justify-between mi:gap-3">
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

          <div class="aff__foot mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3">
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
.aff__scale legend, .aff__topics legend { padding: 0; margin-bottom: 10px; font-size: 15px; font-weight: 600; }
.aff__face:hover { transform: translateY(-2px); }
.aff__face.is-on { transform: scale(1.04); }
</style>

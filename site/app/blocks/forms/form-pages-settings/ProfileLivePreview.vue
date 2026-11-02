<template>
  <section class="plp" aria-labelledby="plp-title">
    <header class="plp__head">
      <MiText id="plp-title" as="h2" variant="title2" weight="bold">Public profile</MiText>
      <MiText variant="footnote" tone="label2">Visible to the 48 people in Northline Studio and to guests on shared boards.</MiText>
    </header>

    <div class="plp__layout">
      <form class="plp__form" novalidate @submit.prevent="save">
        <div class="plp__pair">
          <MiField label="Display name" required :error="nameError">
            <MiInput v-model="draft.name" autocomplete="name" />
          </MiField>

          <MiField label="Handle" required :error="handleError" :success="handleOk" hint="3 to 20 characters: letters, numbers, dots and underscores.">
            <MiInput v-model="draft.handle" prefix="@" autocomplete="off" spellcheck="false">
              <template #suffix>
                <span class="plp__check" aria-hidden="true">
                  <MiSpinner v-if="handleState === 'checking'" size="sm" label="" />
                  <MiIcon v-else-if="handleState === 'free' || handleState === 'yours'" name="check-circle-fill" :size="18" class="plp__ok" />
                  <MiIcon v-else-if="handleState === 'taken' || handleState === 'invalid'" name="x-circle-fill" :size="18" class="plp__bad" />
                </span>
              </template>
            </MiInput>
          </MiField>
        </div>

        <div v-if="handleState === 'taken'" class="plp__suggest" role="group" aria-label="Available handles">
          <MiText variant="caption" tone="label2">Free right now:</MiText>
          <button v-for="s in suggestions" :key="s" type="button" class="plp__chip" @click="draft.handle = s">@{{ s }}</button>
        </div>

        <MiField label="Bio" hint="Shown on your card and in hover previews.">
          <MiTextarea v-model="draft.bio" :rows="3" :max-rows="5" :maxlength="160" counter />
        </MiField>

        <div class="plp__pair">
          <div class="plp__group">
            <MiText as="span" variant="footnote" weight="semibold" class="plp__label">Pronouns</MiText>
            <MiSegmented v-model="draft.pronouns" label="Pronouns" :options="pronounOptions" />
          </div>
          <MiField label="Time zone" hint="Teammates see your local time before pinging you.">
            <MiSelect v-model="draft.tz" :options="zones" />
          </MiField>
        </div>

        <div class="plp__group">
          <MiSwatch v-model="draft.tone" label="Avatar colour" :options="tones" />
        </div>

        <div class="plp__bar" aria-live="polite">
          <MiText variant="footnote" :tone="dirty.length ? 'label' : 'label2'" :lines="1" class="plp__bar-text">
            <template v-if="dirty.length"><strong>{{ dirty.length }} unpublished</strong> · {{ dirty.join(', ') }}</template>
            <template v-else>{{ savedNote }}</template>
          </MiText>
          <div class="plp__bar-actions">
            <MiButton variant="gray" size="small" :disabled="!dirty.length" @click="revert">Revert</MiButton>
            <MiButton type="submit" size="small" :disabled="!dirty.length || !canSave" :loading="saving">Publish</MiButton>
          </div>
        </div>
      </form>

      <!-- Live preview: a full card when there is room, a compact sticky strip on narrow screens. -->
      <aside class="plp__preview" aria-labelledby="plp-preview-title">
        <MiText id="plp-preview-title" as="h3" variant="caption" weight="semibold" tone="label2" class="plp__preview-title">How others see you</MiText>
        <div class="plp__card" :style="{ '--plp-accent': `var(--mi-${draft.tone ?? 'indigo'})` }">
          <div class="plp__banner" aria-hidden="true" />
          <div class="plp__id">
            <MiAvatar :name="draft.name || 'New member'" :tone="avatarTone" size="lg" class="plp__avatar" :class="fresh('tone')" decorative />
            <div class="plp__who">
              <span class="plp__name plp__hl" :class="fresh('name')">{{ draft.name.trim() || 'Your name' }}</span>
              <span class="plp__handle">
                <span class="plp__hl" :class="fresh('handle')">@{{ draft.handle || 'handle' }}</span>
                <span v-if="pronounLabel" class="plp__hl plp__pron" :class="fresh('pronouns')">{{ pronounLabel }}</span>
              </span>
            </div>
            <span class="plp__time plp__hl" :class="fresh('tz')">
              <MiIcon name="globe" :size="14" />
              <span class="plp__clock">{{ localTime }}</span>
            </span>
          </div>
          <p class="plp__bio plp__hl" :class="[fresh('bio'), { 'is-empty': !draft.bio.trim() }]">{{ draft.bio.trim() || 'No bio yet.' }}</p>
          <p class="plp__meta">
            <span>{{ localTime }} for {{ zoneCity }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ offsetNote }}</span>
          </p>
          <div class="plp__fake-actions" aria-hidden="true">
            <span class="plp__fake is-solid">Message</span>
            <span class="plp__fake">View boards</span>
          </div>
        </div>
        <p class="plp__mention" aria-hidden="true">
          <MiAvatar name="Tomás Reyes" tone="orange" size="xs" decorative />
          <span>Thanks <span class="plp__at plp__hl" :class="fresh('handle')">@{{ draft.handle || 'handle' }}</span>, the onboarding flow ships Thursday.</span>
        </p>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

type Tone = 'indigo' | 'teal' | 'orange' | 'pink' | 'green' | 'purple'
const tones: { value: Tone, name: string, color: string }[] = [
  { value: 'indigo', name: 'Indigo', color: 'var(--mi-indigo)' },
  { value: 'teal', name: 'Teal', color: 'var(--mi-teal)' },
  { value: 'green', name: 'Green', color: 'var(--mi-green)' },
  { value: 'orange', name: 'Orange', color: 'var(--mi-orange)' },
  { value: 'pink', name: 'Pink', color: 'var(--mi-pink)' },
  { value: 'purple', name: 'Purple', color: 'var(--mi-purple)' }
]
const pronounOptions = [
  { value: 'she', label: 'she/her' },
  { value: 'he', label: 'he/him' },
  { value: 'they', label: 'they/them' },
  { value: 'none', label: 'Hide' }
]
const zones = [
  { value: 'Europe/Stockholm', label: 'Stockholm (UTC+1)' },
  { value: 'Europe/London', label: 'London (UTC+0)' },
  { value: 'Europe/Lisbon', label: 'Lisbon (UTC+0)' },
  { value: 'America/New_York', label: 'New York (UTC−5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC−8)' },
  { value: 'Asia/Singapore', label: 'Singapore (UTC+8)' }
]
// Handles already claimed in this workspace; swap for an API lookup.
const taken = ['maya', 'mayal', 'maya.l', 'design', 'admin', 'support', 'tomas', 'studio']

const initial = () => ({
  name: 'Maya Lindqvist',
  handle: 'maya.lindqvist',
  bio: 'Product designer on the onboarding squad. Ask me about empty states, forms and Swedish cinnamon buns.',
  pronouns: 'she' as string | number | null,
  tz: 'Europe/Stockholm' as string | number | null,
  tone: 'indigo' as string | null
})
type Profile = ReturnType<typeof initial>
const labels: Record<keyof Profile, string> = { name: 'name', handle: 'handle', bio: 'bio', pronouns: 'pronouns', tz: 'time zone', tone: 'avatar colour' }

const saved = ref<Profile>(initial())
const draft = reactive<Profile>(initial())

// Handle availability: debounced fake lookup.
type HandleState = 'yours' | 'checking' | 'free' | 'taken' | 'invalid'
const handleState = ref<HandleState>('yours')
let lookup: ReturnType<typeof setTimeout> | undefined
watch(() => draft.handle, (h) => {
  clearTimeout(lookup)
  const v = h.trim().toLowerCase()
  if (v === saved.value.handle) { handleState.value = 'yours'; return }
  if (!/^[a-z0-9_.]{3,20}$/.test(v)) { handleState.value = 'invalid'; return }
  handleState.value = 'checking'
  lookup = setTimeout(() => { handleState.value = taken.includes(v) ? 'taken' : 'free' }, 450)
})
const handleError = computed(() => {
  if (handleState.value === 'invalid') return draft.handle.length < 3 ? 'At least 3 characters.' : 'Only lowercase letters, numbers, dots and underscores.'
  if (handleState.value === 'taken') return `@${draft.handle} belongs to someone else.`
  return undefined
})
const handleOk = computed(() => (handleState.value === 'free' ? 'Available' : undefined))
const suggestions = computed(() => {
  const base = draft.handle.replace(/[^a-z0-9_.]/g, '').slice(0, 14) || 'maya'
  return [`${base}.design`, `${base}_nls`, `${base}.ux`].filter(s => !taken.includes(s))
})
const nameError = computed(() => (draft.name.trim() ? undefined : 'Add the name people know you by.'))
const canSave = computed(() => !nameError.value && (handleState.value === 'free' || handleState.value === 'yours'))

const avatarTone = computed(() => (draft.tone ?? 'indigo') as Tone)
const pronounLabel = computed(() => (draft.pronouns === 'none' ? '' : pronounOptions.find(p => p.value === draft.pronouns)?.label ?? ''))

// A fixed "now" keeps the preview deterministic (and identical on server and client).
const now = new Date('2026-11-02T13:40:00Z')
const fmtTime = (tz: string) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(now)
const offsetOf = (tz: string) => {
  const part = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(now).find(p => p.type === 'timeZoneName')?.value ?? 'GMT'
  const m = part.match(/GMT([+-]\d+)?/)
  return m?.[1] ? Number(m[1]) : 0
}
const tzId = computed(() => String(draft.tz ?? 'Europe/Stockholm'))
const localTime = computed(() => fmtTime(tzId.value))
const zoneCity = computed(() => (zones.find(z => z.value === tzId.value)?.label ?? '').replace(/\s*\(.*$/, ''))
const offsetNote = computed(() => {
  const diff = offsetOf(tzId.value) - offsetOf('Europe/Paris')
  if (diff === 0) return 'same time as you'
  return `${Math.abs(diff)} h ${diff > 0 ? 'ahead of' : 'behind'} you`
})

// Briefly mark the preview element that just changed.
const recent = reactive(new Set<keyof Profile>())
const timers = new Map<keyof Profile, ReturnType<typeof setTimeout>>()
for (const k of Object.keys(labels) as (keyof Profile)[]) {
  watch(() => draft[k], () => {
    recent.add(k)
    clearTimeout(timers.get(k))
    timers.set(k, setTimeout(() => recent.delete(k), 700))
  })
}
const fresh = (k: keyof Profile) => ({ 'is-fresh': recent.has(k) })
onBeforeUnmount(() => { clearTimeout(lookup); timers.forEach(t => clearTimeout(t)) })

const dirty = computed(() => (Object.keys(labels) as (keyof Profile)[]).filter(k => draft[k] !== saved.value[k]).map(k => labels[k]))
const saving = ref(false)
const savedNote = ref('Your profile is live. Changes publish to everyone at once.')

function save() {
  if (!dirty.value.length || !canSave.value) return
  saving.value = true
  setTimeout(() => {
    saved.value = { ...draft }
    handleState.value = 'yours'
    saving.value = false
    savedNote.value = 'Published. Teammates see the new card now.'
  }, 600)
}
function revert() {
  Object.assign(draft, saved.value)
}
</script>

<style scoped>
.plp { container: plp / inline-size; display: grid; align-content: start; gap: 20px; font-family: var(--mi-font); color: var(--mi-label); }
.plp__head { display: grid; gap: 4px; max-width: 560px; }
.plp__layout { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); align-items: start; }
@container plp (min-width: 780px) { .plp__layout { grid-template-columns: minmax(0, 1fr) 320px; gap: 32px; } }
@container plp (min-width: 1040px) { .plp__layout { grid-template-columns: minmax(0, 1fr) 360px; gap: 48px; } }

.plp__form { container: plp-form / inline-size; display: grid; gap: 18px; min-width: 0; }
.plp__pair { display: grid; gap: 18px; }
@container plp-form (min-width: 540px) { .plp__pair { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; } }
.plp__group { display: grid; gap: 8px; justify-items: start; min-width: 0; }
.plp__label { color: var(--mi-label); }
.plp__check { display: inline-grid; place-items: center; width: 28px; min-height: 20px; }
.plp__ok { color: var(--mi-green); }
.plp__bad { color: var(--mi-red); }

.plp__suggest { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; margin-top: -8px; }
.plp__chip {
  padding: 4px 10px; border: 0; border-radius: 999px; font: inherit; font-size: 12px; font-weight: 600; color: var(--mi-p-text);
  background: var(--mi-p-tint); cursor: pointer; transition: transform var(--mi-dur-2) var(--mi-spring);
}
.plp__chip:hover { transform: translateY(-1px); }
.plp__chip:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

.plp__bar {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 16px; margin-top: 4px; padding-top: 16px;
  border-top: 1px solid var(--mi-sep);
}
.plp__bar-text { flex: 1 1 220px; min-width: 0; }
.plp__bar-actions { display: flex; gap: 8px; }

/* Preview: compact sticky strip by default. */
.plp__preview { position: sticky; top: 8px; z-index: 2; order: -1; display: grid; gap: 10px; min-width: 0; }
.plp__preview-title { display: none; text-transform: uppercase; letter-spacing: .06em; }
.plp__card {
  position: relative; display: grid; gap: 0; padding: 10px 12px; border-radius: var(--mi-radius-l); overflow: hidden; isolation: isolate;
  background: color-mix(in srgb, var(--mi-card) 88%, transparent); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  box-shadow: var(--mi-sh2), inset 0 0 0 1px var(--mi-sep);
}
.plp__card::before {
  content: ""; position: absolute; inset: 0 auto 0 0; width: 3px; background: var(--plp-accent);
}
.plp__banner, .plp__bio, .plp__meta, .plp__fake-actions, .plp__mention { display: none; }
.plp__id { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; }
.plp__avatar { --plp-size: 40px; width: var(--plp-size); height: var(--plp-size); font-size: 15px; }
.plp__who { display: grid; gap: 1px; min-width: 0; }
.plp__name { justify-self: start; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; font-weight: 650; letter-spacing: -.01em; }
.plp__handle { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 8px; min-width: 0; font-size: 13px; color: var(--mi-label2); }
.plp__handle > :first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.plp__pron { font-size: 12px; color: var(--mi-label3); }
.plp__time {
  display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px; border-radius: 999px; font-size: 12px; font-weight: 600;
  color: var(--mi-label2); background: var(--mi-fill4);
}
.plp__clock { font-variant-numeric: tabular-nums; }

/* Flash behind the preview element that just changed. Opacity only. */
.plp__hl { position: relative; isolation: isolate; }
.plp__hl::after {
  content: ""; position: absolute; inset: -2px -5px; z-index: -1; border-radius: 6px; background: color-mix(in srgb, var(--plp-accent) 22%, transparent);
  opacity: 0; transition: opacity 900ms var(--mi-ease);
}
.plp__hl.is-fresh::after { opacity: 1; transition-duration: 80ms; }
.plp__avatar { transition: transform var(--mi-dur-3) var(--mi-spring); }
.plp__avatar.is-fresh { transform: scale(1.06); }

/* Full card when the container has room for a side column. */
@container plp (min-width: 780px) {
  .plp__preview { order: 0; top: 16px; gap: 12px; }
  .plp__preview-title { display: block; }
  .plp__card { padding: 0 0 18px; background: var(--mi-card); backdrop-filter: none; -webkit-backdrop-filter: none; box-shadow: var(--mi-sh2); }
  .plp__card::before { display: none; }
  .plp__banner {
    display: block; height: 84px;
    background:
      radial-gradient(120% 140% at 85% -20%, color-mix(in srgb, var(--plp-accent) 70%, transparent), transparent 60%),
      radial-gradient(90% 120% at 0% 120%, color-mix(in srgb, var(--plp-accent) 35%, transparent), transparent 70%),
      color-mix(in srgb, var(--plp-accent) 14%, var(--mi-card));
  }
  .plp__id { grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "av time" "who who"; align-items: end; gap: 10px 12px; padding: 0 18px; margin-top: -32px; }
  .plp__avatar { --plp-size: 68px; grid-area: av; font-size: 24px; box-shadow: 0 0 0 4px var(--mi-card); }
  .plp__time { grid-area: time; margin-bottom: 4px; }
  .plp__who { grid-area: who; gap: 3px; }
  .plp__name { font-size: 20px; letter-spacing: -.02em; }
  .plp__bio { display: block; margin: 12px 18px 0; font-size: 14px; line-height: 1.5; color: var(--mi-label); overflow-wrap: anywhere; }
  .plp__bio.is-empty { color: var(--mi-label3); font-style: italic; }
  .plp__meta { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 18px 0; font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
  .plp__fake-actions { display: flex; gap: 8px; margin: 16px 18px 0; }
  .plp__fake { flex: 1; padding: 8px 0; border-radius: 10px; text-align: center; font-size: 13px; font-weight: 600; color: var(--mi-label); background: var(--mi-fill3); }
  .plp__fake.is-solid { color: var(--mi-p-on); background: var(--mi-p); }
  .plp__mention {
    display: flex; align-items: flex-start; gap: 10px; margin: 0; padding: 12px 14px; border-radius: var(--mi-radius-m);
    font-size: 13px; line-height: 1.45; color: var(--mi-label2); background: var(--mi-fill4);
  }
  .plp__at { font-weight: 600; color: var(--mi-p-text); }
}
@media (prefers-reduced-motion: reduce) { .plp__hl::after, .plp__avatar { transition: none; } }
</style>

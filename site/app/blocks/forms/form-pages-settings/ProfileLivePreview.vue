<template>
  <section class="plp mi:@container/plp mi:grid mi:content-start mi:gap-5 mi:font-mi mi:text-label" aria-labelledby="plp-title">
    <header class="plp__head mi:grid mi:gap-1 mi:max-w-140">
      <MiText id="plp-title" as="h2" variant="title2" weight="bold">Public profile</MiText>
      <MiText variant="footnote" tone="label2">Visible to the 48 people in Northline Studio and to guests on shared boards.</MiText>
    </header>

    <div class="plp__layout mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:@[780px]/plp:grid-cols-[minmax(0,_1fr)_320px] mi:@[780px]/plp:gap-8 mi:@[1040px]/plp:grid-cols-[minmax(0,_1fr)_360px] mi:@[1040px]/plp:gap-12">
      <form class="plp__form mi:@container/plp-form mi:grid mi:gap-4.5 mi:min-w-0" novalidate @submit.prevent="save">
        <div class="plp__pair mi:grid mi:gap-4.5 mi:@[540px]/plp-form:grid-cols-2 mi:@[540px]/plp-form:items-start">
          <MiField label="Display name" required :error="nameError">
            <MiInput v-model="draft.name" autocomplete="name" />
          </MiField>

          <MiField label="Handle" required :error="handleError" :success="handleOk" hint="3 to 20 characters: letters, numbers, dots and underscores.">
            <MiInput v-model="draft.handle" prefix="@" autocomplete="off" spellcheck="false">
              <template #suffix>
                <span class="plp__check mi:inline-grid mi:place-items-center mi:w-7 mi:min-h-5" aria-hidden="true">
                  <MiSpinner v-if="handleState === 'checking'" size="sm" label="" />
                  <MiIcon v-else-if="handleState === 'free' || handleState === 'yours'" name="check-circle-fill" :size="18" class="plp__ok mi:text-green" />
                  <MiIcon v-else-if="handleState === 'taken' || handleState === 'invalid'" name="x-circle-fill" :size="18" class="plp__bad mi:text-red" />
                </span>
              </template>
            </MiInput>
          </MiField>
        </div>

        <div v-if="handleState === 'taken'" class="plp__suggest mi:flex mi:flex-wrap mi:items-center mi:gap-y-1.5 mi:gap-x-2 mi:-mt-2" role="group" aria-label="Available handles">
          <MiText variant="caption" tone="label2">Free right now:</MiText>
          <button v-for="s in suggestions" :key="s" type="button" class="plp__chip mi:py-1 mi:px-2.5 mi:[border:0] mi:rounded-[999px] mi:text-p-text mi:[background:var(--mi-p-tint)] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:hover:transform-[translateY(-1px)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="draft.handle = s">@{{ s }}</button>
        </div>

        <MiField label="Bio" hint="Shown on your card and in hover previews.">
          <MiTextarea v-model="draft.bio" :rows="3" :max-rows="5" :maxlength="160" counter />
        </MiField>

        <div class="plp__pair mi:grid mi:gap-4.5 mi:@[540px]/plp-form:grid-cols-2 mi:@[540px]/plp-form:items-start">
          <div class="plp__group mi:grid mi:gap-2 mi:justify-items-start mi:min-w-0">
            <MiText as="span" variant="footnote" weight="semibold" class="plp__label">Pronouns</MiText>
            <MiSegmented v-model="draft.pronouns" label="Pronouns" :options="pronounOptions" />
          </div>
          <MiField label="Time zone" hint="Teammates see your local time before pinging you.">
            <MiSelect v-model="draft.tz" :options="zones" />
          </MiField>
        </div>

        <div class="plp__group mi:grid mi:gap-2 mi:justify-items-start mi:min-w-0">
          <MiSwatch v-model="draft.tone" label="Avatar colour" :options="tones" />
        </div>

        <div class="plp__bar mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2.5 mi:gap-x-4 mi:mt-1 mi:pt-4 mi:border-t mi:border-t-sep" aria-live="polite">
          <MiText variant="footnote" :tone="dirty.length ? 'label' : 'label2'" :lines="1" class="plp__bar-text mi:flex-[1_1_220px] mi:min-w-0">
            <template v-if="dirty.length"><strong>{{ dirty.length }} unpublished</strong> · {{ dirty.join(', ') }}</template>
            <template v-else>{{ savedNote }}</template>
          </MiText>
          <div class="plp__bar-actions mi:flex mi:gap-2">
            <MiButton variant="gray" size="small" :disabled="!dirty.length" @click="revert">Revert</MiButton>
            <MiButton type="submit" size="small" :disabled="!dirty.length || !canSave" :loading="saving">Publish</MiButton>
          </div>
        </div>
      </form>

      <!-- Live preview: a full card when there is room, a compact sticky strip on narrow screens. -->
      <aside class="plp__preview mi:sticky mi:top-2 mi:z-2 mi:-order-1 mi:grid mi:gap-2.5 mi:min-w-0 mi:@[780px]/plp:order-0 mi:@[780px]/plp:top-4 mi:@[780px]/plp:gap-3" aria-labelledby="plp-preview-title">
        <MiText id="plp-preview-title" as="h3" variant="caption" weight="semibold" tone="label2" class="plp__preview-title">How others see you</MiText>
        <div class="plp__card mi:relative mi:grid mi:gap-0 mi:py-2.5 mi:px-3 mi:rounded-lg mi:overflow-hidden mi:isolate mi:[background:color-mix(in_srgb,_var(--mi-card)_88%,_transparent)] mi:shadow-[var(--mi-sh2),_inset_0_0_0_1px_var(--mi-sep)] mi:before:content-[''] mi:before:absolute mi:before:top-0 mi:before:right-auto mi:before:bottom-0 mi:before:left-0 mi:before:w-[3px] mi:before:[background:var(--plp-accent)] mi:@[780px]/plp:pt-0 mi:@[780px]/plp:px-0 mi:@[780px]/plp:pb-4.5 mi:@[780px]/plp:[background:var(--mi-card)] mi:@[780px]/plp:shadow-2 mi:@[780px]/plp:before:hidden" :style="{ '--plp-accent': `var(--mi-${draft.tone ?? 'indigo'})` }">
          <div class="plp__banner mi:hidden mi:@[780px]/plp:block mi:@[780px]/plp:h-21 mi:@[780px]/plp:[background:radial-gradient(120%_140%_at_85%_-20%,_color-mix(in_srgb,_var(--plp-accent)_70%,_transparent),_transparent_60%),_radial-gradient(90%_120%_at_0%_120%,_color-mix(in_srgb,_var(--plp-accent)_35%,_transparent),_transparent_70%),_color-mix(in_srgb,_var(--plp-accent)_14%,_var(--mi-card))]" aria-hidden="true" />
          <div class="plp__id mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:@[780px]/plp:grid-cols-[minmax(0,_1fr)_auto] mi:@[780px]/plp:[grid-template-areas:'av_time'_'who_who'] mi:@[780px]/plp:items-end mi:@[780px]/plp:gap-y-2.5 mi:@[780px]/plp:gap-x-3 mi:@[780px]/plp:py-0 mi:@[780px]/plp:px-4.5 mi:@[780px]/plp:-mt-8">
            <MiAvatar :name="draft.name || 'New member'" :tone="avatarTone" size="lg" class="plp__avatar mi:[--plp-size:40px] mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:[&.is-fresh]:transform-[scale(1.06)] mi:@[780px]/plp:[--plp-size:68px] mi:@[780px]/plp:[grid-area:av] mi:@[780px]/plp:shadow-[0_0_0_4px_var(--mi-card)] mi:motion-reduce:[transition:none]" :class="fresh('tone')" decorative />
            <div class="plp__who mi:grid mi:gap-px mi:min-w-0 mi:@[780px]/plp:[grid-area:who] mi:@[780px]/plp:gap-[3px]">
              <span class="plp__name plp__hl mi:justify-self-start mi:max-w-full mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[15px] mi:font-650 mi:tracking-[-.01em] mi:relative mi:isolate mi:after:content-[''] mi:after:absolute mi:after:-inset-y-0.5 mi:after:inset-x-[-5px] mi:after:-z-1 mi:after:rounded-[6px] mi:after:[background:color-mix(in_srgb,_var(--plp-accent)_22%,_transparent)] mi:after:opacity-0 mi:after:[transition:opacity_900ms_var(--mi-ease)] mi:[&.is-fresh]:after:opacity-100 mi:[&.is-fresh]:after:[transition-duration:80ms] mi:@[780px]/plp:text-[20px] mi:@[780px]/plp:tracking-[-.02em] mi:motion-reduce:after:[transition:none]" :class="fresh('name')">{{ draft.name.trim() || 'Your name' }}</span>
              <span class="plp__handle mi:flex mi:flex-wrap mi:items-baseline mi:gap-y-0.5 mi:gap-x-2 mi:min-w-0 mi:text-[13px] mi:text-label2">
                <span class="plp__hl mi:relative mi:isolate mi:after:content-[''] mi:after:absolute mi:after:-inset-y-0.5 mi:after:inset-x-[-5px] mi:after:-z-1 mi:after:rounded-[6px] mi:after:[background:color-mix(in_srgb,_var(--plp-accent)_22%,_transparent)] mi:after:opacity-0 mi:after:[transition:opacity_900ms_var(--mi-ease)] mi:[&.is-fresh]:after:opacity-100 mi:[&.is-fresh]:after:[transition-duration:80ms] mi:motion-reduce:after:[transition:none]" :class="fresh('handle')">@{{ draft.handle || 'handle' }}</span>
                <span v-if="pronounLabel" class="plp__hl plp__pron mi:text-[12px] mi:text-label3 mi:relative mi:isolate mi:after:content-[''] mi:after:absolute mi:after:-inset-y-0.5 mi:after:inset-x-[-5px] mi:after:-z-1 mi:after:rounded-[6px] mi:after:[background:color-mix(in_srgb,_var(--plp-accent)_22%,_transparent)] mi:after:opacity-0 mi:after:[transition:opacity_900ms_var(--mi-ease)] mi:[&.is-fresh]:after:opacity-100 mi:[&.is-fresh]:after:[transition-duration:80ms] mi:motion-reduce:after:[transition:none]" :class="fresh('pronouns')">{{ pronounLabel }}</span>
              </span>
            </div>
            <span class="plp__time plp__hl mi:inline-flex mi:items-center mi:gap-[5px] mi:py-1 mi:px-[9px] mi:rounded-[999px] mi:text-[12px] mi:font-semibold mi:text-label2 mi:[background:var(--mi-fill4)] mi:relative mi:isolate mi:after:content-[''] mi:after:absolute mi:after:-inset-y-0.5 mi:after:inset-x-[-5px] mi:after:-z-1 mi:after:rounded-[6px] mi:after:[background:color-mix(in_srgb,_var(--plp-accent)_22%,_transparent)] mi:after:opacity-0 mi:after:[transition:opacity_900ms_var(--mi-ease)] mi:[&.is-fresh]:after:opacity-100 mi:[&.is-fresh]:after:[transition-duration:80ms] mi:@[780px]/plp:[grid-area:time] mi:@[780px]/plp:mb-1 mi:motion-reduce:after:[transition:none]" :class="fresh('tz')">
              <MiIcon name="globe" :size="14" />
              <span class="plp__clock mi:tabular-nums">{{ localTime }}</span>
            </span>
          </div>
          <p class="plp__bio plp__hl mi:hidden mi:relative mi:isolate mi:after:content-[''] mi:after:absolute mi:after:-inset-y-0.5 mi:after:inset-x-[-5px] mi:after:-z-1 mi:after:rounded-[6px] mi:after:[background:color-mix(in_srgb,_var(--plp-accent)_22%,_transparent)] mi:after:opacity-0 mi:after:[transition:opacity_900ms_var(--mi-ease)] mi:[&.is-fresh]:after:opacity-100 mi:[&.is-fresh]:after:[transition-duration:80ms] mi:@[780px]/plp:block mi:@[780px]/plp:mt-3 mi:@[780px]/plp:mx-4.5 mi:@[780px]/plp:mb-0 mi:@[780px]/plp:text-[14px] mi:@[780px]/plp:leading-normal mi:@[780px]/plp:text-label mi:@[780px]/plp:wrap-anywhere mi:@[780px]/plp:[&.is-empty]:text-label3 mi:@[780px]/plp:[&.is-empty]:italic mi:motion-reduce:after:[transition:none]" :class="[fresh('bio'), { 'is-empty': !draft.bio.trim() }]">{{ draft.bio.trim() || 'No bio yet.' }}</p>
          <p class="plp__meta mi:hidden mi:@[780px]/plp:flex mi:@[780px]/plp:flex-wrap mi:@[780px]/plp:gap-1.5 mi:@[780px]/plp:mt-3 mi:@[780px]/plp:mx-4.5 mi:@[780px]/plp:mb-0 mi:@[780px]/plp:text-[12px] mi:@[780px]/plp:text-label2 mi:@[780px]/plp:tabular-nums">
            <span>{{ localTime }} for {{ zoneCity }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ offsetNote }}</span>
          </p>
          <div class="plp__fake-actions mi:hidden mi:@[780px]/plp:flex mi:@[780px]/plp:gap-2 mi:@[780px]/plp:mt-4 mi:@[780px]/plp:mx-4.5 mi:@[780px]/plp:mb-0" aria-hidden="true">
            <span class="plp__fake is-solid mi:@[780px]/plp:flex-1 mi:@[780px]/plp:py-2 mi:@[780px]/plp:px-0 mi:@[780px]/plp:rounded-[10px] mi:@[780px]/plp:text-center mi:@[780px]/plp:text-[13px] mi:@[780px]/plp:font-semibold mi:@[780px]/plp:text-label mi:@[780px]/plp:[background:var(--mi-fill3)] mi:@[780px]/plp:[&.is-solid]:text-p-on mi:@[780px]/plp:[&.is-solid]:[background:var(--mi-p)]">Message</span>
            <span class="plp__fake mi:@[780px]/plp:flex-1 mi:@[780px]/plp:py-2 mi:@[780px]/plp:px-0 mi:@[780px]/plp:rounded-[10px] mi:@[780px]/plp:text-center mi:@[780px]/plp:text-[13px] mi:@[780px]/plp:font-semibold mi:@[780px]/plp:text-label mi:@[780px]/plp:[background:var(--mi-fill3)] mi:@[780px]/plp:[&.is-solid]:text-p-on mi:@[780px]/plp:[&.is-solid]:[background:var(--mi-p)]">View boards</span>
          </div>
        </div>
        <p class="plp__mention mi:hidden mi:@[780px]/plp:flex mi:@[780px]/plp:[align-items:flex-start] mi:@[780px]/plp:gap-2.5 mi:@[780px]/plp:m-0 mi:@[780px]/plp:py-3 mi:@[780px]/plp:px-3.5 mi:@[780px]/plp:rounded-md mi:@[780px]/plp:text-[13px] mi:@[780px]/plp:leading-[1.45] mi:@[780px]/plp:text-label2 mi:@[780px]/plp:[background:var(--mi-fill4)]" aria-hidden="true">
          <MiAvatar name="Tomás Reyes" tone="orange" size="xs" decorative />
          <span>Thanks <span class="plp__at plp__hl mi:relative mi:isolate mi:after:content-[''] mi:after:absolute mi:after:-inset-y-0.5 mi:after:inset-x-[-5px] mi:after:-z-1 mi:after:rounded-[6px] mi:after:[background:color-mix(in_srgb,_var(--plp-accent)_22%,_transparent)] mi:after:opacity-0 mi:after:[transition:opacity_900ms_var(--mi-ease)] mi:[&.is-fresh]:after:opacity-100 mi:[&.is-fresh]:after:[transition-duration:80ms] mi:@[780px]/plp:font-semibold mi:@[780px]/plp:text-p-text mi:motion-reduce:after:[transition:none]" :class="fresh('handle')">@{{ draft.handle || 'handle' }}</span>, the onboarding flow ships Thursday.</span>
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
.plp__label { color: var(--mi-label); }
.plp__chip { font: inherit; font-size: 12px; font-weight: 600;
}
.plp__preview-title { display: none; text-transform: uppercase; letter-spacing: .06em; }
.plp__card { backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
}
.plp__avatar { width: var(--plp-size); height: var(--plp-size); font-size: 15px; }
.plp__handle > :first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }

/* Full card when the container has room for a side column. */
@container plp (min-width: 780px) {
  .plp__preview-title { display: block; }
  .plp__card { backdrop-filter: none; -webkit-backdrop-filter: none; }
  .plp__avatar { font-size: 24px; }
}
</style>

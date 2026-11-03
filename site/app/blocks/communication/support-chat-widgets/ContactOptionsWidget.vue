<template>
  <section class="cw mi:@container mi:font-mi mi:text-label" aria-labelledby="cw-title">
    <div class="cw__stage mi:relative mi:flex mi:flex-col mi:[align-items:flex-end] mi:[justify-content:flex-end] mi:gap-3 mi:min-h-155 mi:p-4 mi:overflow-hidden mi:[background:var(--mi-page)] mi:@[560px]:p-6">
      <!-- Faux storefront behind the widget. -->
      <div class="cw__page mi:absolute mi:inset-0 mi:grid mi:grid-cols-3 mi:content-start mi:gap-3.5 mi:p-6 mi:opacity-55" aria-hidden="true">
        <span class="cw__hero mi:col-span-full mi:h-45 mi:rounded-xl mi:[background:linear-gradient(135deg,_var(--mi-p-tint2),_var(--mi-s-tint))]" />
        <span v-for="n in 3" :key="n" class="cw__tile mi:h-37.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1" />
      </div>

      <div v-if="openWidget" id="cw-panel" class="cw__widget mi:relative mi:w-full mi:max-w-95 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-3 mi:overflow-hidden mi:origin-bottom-right">
        <header class="cw__head mi:grid mi:gap-2 mi:pt-5 mi:px-5 mi:pb-4 mi:[background:linear-gradient(160deg,_var(--mi-p-tint),_transparent_80%)]">
          <MiAvatarGroup :items="team" :max="3" size="sm" label="Support team: Ana, Felix and Grace" />
          <MiText id="cw-title" as="h2" variant="title3" weight="semibold">How can we reach you?</MiText>
          <MiText variant="footnote" class="cw__hours mi:items-center mi:gap-1.5"><span class="cw__dot mi:w-2 mi:h-2 mi:rounded-[50%] mi:[background:var(--mi-green)]" aria-hidden="true" />Team online until 20:00 · replies in about 4 min</MiText>
        </header>

        <div v-if="mode === 'menu'" class="cw__body mi:grid mi:gap-3">
          <a href="#" class="cw__opt mi:flex mi:items-center mi:gap-3 mi:w-full mi:py-3 mi:px-3.5 mi:border mi:border-sep mi:rounded-lg mi:[background:var(--mi-card)] mi:text-label2 mi:[font:inherit] mi:text-start mi:[text-decoration:none] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click.prevent>
            <MiIcon name="chat" :size="20" class="cw__opt-icon mi:text-p-text" />
            <span class="cw__opt-text mi:grid mi:flex-1 mi:min-w-0 mi:text-[12.5px]"><strong class="mi:[.cw__opt-text_&]:text-[14.5px]">Chat now</strong><span>Wait under 4 minutes</span></span>
            <MiIcon name="chevron-right" :size="16" />
          </a>
          <button type="button" class="cw__opt mi:flex mi:items-center mi:gap-3 mi:w-full mi:py-3 mi:px-3.5 mi:border mi:border-sep mi:rounded-lg mi:[background:var(--mi-card)] mi:text-label2 mi:[font:inherit] mi:text-start mi:[text-decoration:none] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="mode = 'callback'">
            <MiIcon name="speaker-wave" :size="20" class="cw__opt-icon mi:text-p-text" />
            <span class="cw__opt-text mi:grid mi:flex-1 mi:min-w-0 mi:text-[12.5px]"><strong class="mi:[.cw__opt-text_&]:text-[14.5px]">Call me back</strong><span>Pick a 15-minute slot</span></span>
            <MiIcon name="chevron-right" :size="16" />
          </button>
          <a href="#" class="cw__opt mi:flex mi:items-center mi:gap-3 mi:w-full mi:py-3 mi:px-3.5 mi:border mi:border-sep mi:rounded-lg mi:[background:var(--mi-card)] mi:text-label2 mi:[font:inherit] mi:text-start mi:[text-decoration:none] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click.prevent>
            <MiIcon name="tray" :size="20" class="cw__opt-icon mi:text-p-text" />
            <span class="cw__opt-text mi:grid mi:flex-1 mi:min-w-0 mi:text-[12.5px]"><strong class="mi:[.cw__opt-text_&]:text-[14.5px]">Email us</strong><span>Answer within one business day</span></span>
            <MiIcon name="chevron-right" :size="16" />
          </a>
        </div>

        <form v-else-if="mode === 'callback'" class="cw__body mi:grid mi:gap-3" @submit.prevent="book">
          <MiSegmented v-model="day" label="Day" :options="days" />
          <div class="cw__slots mi:grid mi:grid-cols-3 mi:gap-1.5" role="radiogroup" aria-label="Time slot">
            <button
              v-for="s in slots" :key="s" type="button" role="radio" class="cw__slot mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:py-2 mi:px-0 mi:border mi:border-sep mi:rounded-md mi:[background:var(--mi-card)] mi:text-label mi:cursor-pointer mi:[&.is-on]:border-p mi:[&.is-on]:[background:var(--mi-p)] mi:[&.is-on]:text-p-on"
              :aria-checked="slot === s" :class="{ 'is-on': slot === s }" @click="slot = s"
            >{{ s }}</button>
          </div>
          <MiField label="Phone number" :error="phoneError">
            <MiInput v-model="phone" type="tel" placeholder="+44 20 7946 0000" />
          </MiField>
          <div class="cw__row mi:flex mi:justify-between mi:items-center mi:gap-2">
            <MiButton variant="plain" size="small" @click="mode = 'menu'">Back</MiButton>
            <MiButton type="submit" :disabled="!slot">Book callback</MiButton>
          </div>
        </form>

        <div v-else class="cw__body cw__done mi:grid mi:gap-3 mi:justify-items-center mi:text-center" role="status">
          <MiIcon name="check-circle-fill" :size="36" class="cw__ok mi:text-green" />
          <MiText as="p" variant="headline" weight="semibold">Callback booked</MiText>
          <MiText variant="footnote" tone="label2">{{ dayLabel }} at {{ slot }}. We will call {{ phone }} from +44 20 3808 1100.</MiText>
          <MiButton variant="gray" size="small" @click="reset">Done</MiButton>
        </div>
      </div>

      <MiIconButton
        class="cw__launcher" :label="openWidget ? 'Close support' : 'Contact support'" size="large"
        aria-controls="cw-panel" :aria-expanded="openWidget" @click="openWidget = !openWidget"
      >
        <MiIcon :name="openWidget ? 'close' : 'chat'" />
      </MiIconButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const team: { name: string, tone: 'orange' | 'teal' | 'indigo' }[] = [
  { name: 'Ana Ribeiro', tone: 'orange' }, { name: 'Felix Brandt', tone: 'teal' }, { name: 'Grace Owusu', tone: 'indigo' }
]
const days = [{ value: 'today', label: 'Today' }, { value: 'tomorrow', label: 'Tomorrow' }]
// Free slots per day; swap for your scheduling API.
const free: Record<string, string[]> = {
  today: ['16:15', '16:45', '17:30', '18:00', '19:15'],
  tomorrow: ['09:00', '09:30', '10:15', '11:45', '14:00', '15:30']
}

const openWidget = ref(true)
const mode = ref<'menu' | 'callback' | 'done'>('menu')
const day = ref<string | number | null>('today')
const slot = ref<string | null>(null)
const phone = ref('')
const tried = ref(false)

const slots = computed(() => free[String(day.value)] ?? [])
const dayLabel = computed(() => (day.value === 'today' ? 'Today' : 'Tomorrow'))
const phoneOk = computed(() => phone.value.replace(/\D/g, '').length >= 8)
const phoneError = computed(() => (tried.value && !phoneOk.value ? 'Enter a number with at least 8 digits.' : undefined))

function book() {
  tried.value = true
  if (slot.value && phoneOk.value) mode.value = 'done'
}

function reset() {
  mode.value = 'menu'
  slot.value = null
  phone.value = ''
  tried.value = false
}
</script>

<style scoped>
.cw__widget { animation: cw-in var(--mi-dur-3) var(--mi-spring); }
@keyframes cw-in { from { opacity: 0; transform: translateY(8px) scale(.97); } }
.cw__hours { display: flex; color: var(--mi-label2); }

.cw__body { padding: 16px 20px 20px; }
.cw__opt-text strong { color: var(--mi-label); }
.cw__slot { font: inherit; font-size: 14px; font-variant-numeric: tabular-nums; }
.cw__slot.is-on { font-weight: 600; }
.cw__done { padding-block: 24px; }
.cw__launcher { position: relative; flex: none; }
@media (prefers-reduced-motion: reduce) { .cw__widget { animation: none; } }
</style>

<template>
  <section class="cw" aria-labelledby="cw-title">
    <div class="cw__stage">
      <!-- Faux storefront behind the widget. -->
      <div class="cw__page" aria-hidden="true">
        <span class="cw__hero" />
        <span v-for="n in 3" :key="n" class="cw__tile" />
      </div>

      <div v-if="openWidget" id="cw-panel" class="cw__widget">
        <header class="cw__head">
          <MiAvatarGroup :items="team" :max="3" size="sm" label="Support team: Ana, Felix and Grace" />
          <MiText id="cw-title" as="h2" variant="title3" weight="semibold">How can we reach you?</MiText>
          <MiText variant="footnote" class="cw__hours"><span class="cw__dot" aria-hidden="true" />Team online until 20:00 · replies in about 4 min</MiText>
        </header>

        <div v-if="mode === 'menu'" class="cw__body">
          <a href="#" class="cw__opt" @click.prevent>
            <MiIcon name="chat" :size="20" class="cw__opt-icon" />
            <span class="cw__opt-text"><strong>Chat now</strong><span>Wait under 4 minutes</span></span>
            <MiIcon name="chevron-right" :size="16" />
          </a>
          <button type="button" class="cw__opt" @click="mode = 'callback'">
            <MiIcon name="speaker-wave" :size="20" class="cw__opt-icon" />
            <span class="cw__opt-text"><strong>Call me back</strong><span>Pick a 15-minute slot</span></span>
            <MiIcon name="chevron-right" :size="16" />
          </button>
          <a href="#" class="cw__opt" @click.prevent>
            <MiIcon name="tray" :size="20" class="cw__opt-icon" />
            <span class="cw__opt-text"><strong>Email us</strong><span>Answer within one business day</span></span>
            <MiIcon name="chevron-right" :size="16" />
          </a>
        </div>

        <form v-else-if="mode === 'callback'" class="cw__body" @submit.prevent="book">
          <MiSegmented v-model="day" label="Day" :options="days" />
          <div class="cw__slots" role="radiogroup" aria-label="Time slot">
            <button
              v-for="s in slots" :key="s" type="button" role="radio" class="cw__slot"
              :aria-checked="slot === s" :class="{ 'is-on': slot === s }" @click="slot = s"
            >{{ s }}</button>
          </div>
          <MiField label="Phone number" :error="phoneError">
            <MiInput v-model="phone" type="tel" placeholder="+44 20 7946 0000" />
          </MiField>
          <div class="cw__row">
            <MiButton variant="plain" size="small" @click="mode = 'menu'">Back</MiButton>
            <MiButton type="submit" :disabled="!slot">Book callback</MiButton>
          </div>
        </form>

        <div v-else class="cw__body cw__done" role="status">
          <MiIcon name="check-circle-fill" :size="36" class="cw__ok" />
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
.cw { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.cw__stage { position: relative; display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end; gap: 12px; min-height: 620px; padding: 16px; overflow: hidden; background: var(--mi-page); }
.cw__page { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-content: start; gap: 14px; padding: 24px; opacity: .55; }
.cw__hero { grid-column: 1 / -1; height: 180px; border-radius: var(--mi-radius-xl); background: linear-gradient(135deg, var(--mi-p-tint2), var(--mi-s-tint)); }
.cw__tile { height: 150px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }

.cw__widget { position: relative; width: 100%; max-width: 380px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh3); overflow: hidden; transform-origin: bottom right; animation: cw-in var(--mi-dur-3) var(--mi-spring); }
@keyframes cw-in { from { opacity: 0; transform: translateY(8px) scale(.97); } }
.cw__head { display: grid; gap: 8px; padding: 20px 20px 16px; background: linear-gradient(160deg, var(--mi-p-tint), transparent 80%); }
.cw__hours { display: flex; align-items: center; gap: 6px; color: var(--mi-label2); }
.cw__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--mi-green); }

.cw__body { display: grid; gap: 12px; padding: 16px 20px 20px; }
.cw__opt { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 14px; border: 1px solid var(--mi-sep); border-radius: var(--mi-radius-l); background: var(--mi-card); color: var(--mi-label2); font: inherit; text-align: start; text-decoration: none; cursor: pointer; transition: transform var(--mi-dur-2) var(--mi-ease); }
.cw__opt:hover { transform: translateY(-1px); }
.cw__opt:focus-visible, .cw__slot:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.cw__opt-icon { color: var(--mi-p-text); }
.cw__opt-text { display: grid; flex: 1; min-width: 0; font-size: 12.5px; }
.cw__opt-text strong { font-size: 14.5px; color: var(--mi-label); }

.cw__slots { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.cw__slot { padding: 8px 0; border: 1px solid var(--mi-sep); border-radius: var(--mi-radius-m); background: var(--mi-card); color: var(--mi-label); font: inherit; font-size: 14px; font-variant-numeric: tabular-nums; cursor: pointer; }
.cw__slot.is-on { border-color: var(--mi-p); background: var(--mi-p); color: var(--mi-p-on); font-weight: 600; }
.cw__row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.cw__done { justify-items: center; text-align: center; padding-block: 24px; }
.cw__ok { color: var(--mi-green); }
.cw__launcher { position: relative; flex: none; }

@container (min-width: 560px) { .cw__stage { padding: 24px; } }
@media (prefers-reduced-motion: reduce) { .cw__widget { animation: none; } }
</style>

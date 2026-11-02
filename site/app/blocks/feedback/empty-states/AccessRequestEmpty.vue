<template>
  <div class="are-cq">
    <section class="are" aria-labelledby="are-title">
      <div class="are__info">
        <!-- A frosted glimpse of the sheet: you can tell what it is without reading it. -->
        <div class="are__art" aria-hidden="true">
          <span class="are__sheet">
            <i v-for="n in 24" :key="n" :class="cellClass(n)" />
          </span>
          <span class="are__lock"><MiIcon name="lock" :size="18" :weight="2.2" /></span>
        </div>

        <div class="are__lead">
          <MiText variant="caption" tone="label2" weight="medium">Finance · Spreadsheet</MiText>
          <MiText id="are-title" as="h2" variant="title3" weight="semibold" balance>You need access to “Q4 pricing model”</MiText>
          <MiText variant="footnote" tone="label2">
            You're signed in as sam.okafor@larkspur.io. <MiTextLink href="#">Switch account</MiTextLink>
          </MiText>
        </div>

        <div class="are__owner">
          <div class="are__owner-row">
            <span class="are__owner-av">
              <MiAvatar name="Hélène Marchetti" size="md" tone="auto" decorative />
              <i aria-hidden="true" />
            </span>
            <div class="are__owner-text">
              <MiText variant="subheadline" weight="semibold">Hélène Marchetti</MiText>
              <MiText variant="caption" tone="label2">Owner · Head of Finance</MiText>
            </div>
          </div>
          <!-- Her working day against a 24-hour band, so the wait is predictable. -->
          <div class="are__day">
            <div class="are__band" role="img" :aria-label="`Works 08:30 to 18:00 in Lyon; it is ${LOCAL} there now`">
              <span class="are__work" :style="{ left: pos(8.5), width: pos(18 - 8.5) }" />
              <span class="are__now" :style="{ left: pos(NOW_H) }" />
            </div>
            <div class="are__hours" aria-hidden="true"><span v-for="h in [0, 6, 12, 18, 24]" :key="h" :style="{ left: pos(h) }">{{ String(h).padStart(2, '0') }}</span></div>
            <MiText variant="caption" tone="label2" tabular>{{ LOCAL }} in Lyon, within her working hours. Usually replies in about 2 hours.</MiText>
          </div>
        </div>
      </div>

      <div class="are__action">
        <form v-if="!sent" class="are__form" @submit.prevent="request">
          <MiText as="h3" variant="headline" weight="semibold">Request access</MiText>
          <fieldset class="are__roles">
            <legend>Access level</legend>
            <label v-for="r in roles" :key="r.value" class="are__role" :class="{ 'is-on': role === r.value }">
              <input v-model="role" type="radio" name="are-role" :value="r.value">
              <MiIcon :name="r.icon" :size="17" />
              <span class="are__role-text">
                <strong>{{ r.label }}</strong>
                <span>{{ r.hint }}</span>
              </span>
              <MiIcon name="check-circle-fill" :size="18" class="are__role-check" />
            </label>
          </fieldset>
          <MiField label="Message (optional)">
            <template #default="{ id, describedBy }">
              <MiTextarea :id="id" v-model="message" :rows="2" size="sm" :maxlength="240" counter :aria-describedby="describedBy" placeholder="Why you need it, and by when" />
            </template>
          </MiField>
          <MiButton type="submit" block :loading="sending">Ask Hélène for {{ roleLabel.toLowerCase() }} access</MiButton>
        </form>

        <div v-else class="are__pending">
          <div class="are__pending-head">
            <MiText as="h3" variant="headline" weight="semibold">Request pending</MiText>
            <MiBadge tone="warning" dot :label="roleLabel" />
          </div>
          <MiTimeline :items="steps" aria-label="Request progress" />
          <blockquote v-if="message.trim()" class="are__quote">{{ message.trim() }}</blockquote>
          <MiText variant="caption" tone="label2">You'll get an email and the sheet will open here as soon as she decides. No need to keep this tab open.</MiText>
          <div class="are__pending-actions">
            <MiButton variant="destructive" soft size="small" @click="cancel">Cancel request</MiButton>
            <MiButton variant="gray" size="small" disabled>Nudge in 1 h</MiButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const NOW_H = 16 + 20 / 60
const LOCAL = '16:20'
const pos = (h: number) => `${(h / 24) * 100}%`

const roles = [
  { value: 'viewer', label: 'Viewer', hint: 'Read and export', icon: 'eye' as const },
  { value: 'commenter', label: 'Commenter', hint: 'Comment on cells', icon: 'chat' as const },
  { value: 'editor', label: 'Editor', hint: 'Change values and formulas', icon: 'pencil' as const }
]
const role = ref('commenter')
const roleLabel = computed(() => roles.find(r => r.value === role.value)!.label)
const message = ref('Checking the enterprise tier discounts before Thursday’s renewal call with Halden.')

const sent = ref(false)
const sending = ref(false)
const notified = ref(false)
let timers: ReturnType<typeof setTimeout>[] = []

function request() {
  sending.value = true
  timers.push(setTimeout(() => {
    sending.value = false
    sent.value = true
    timers.push(setTimeout(() => { notified.value = true }, 1400))
  }, 600))
}
function cancel() {
  timers.forEach(clearTimeout)
  timers = []
  sent.value = false
  notified.value = false
}
onBeforeUnmount(() => timers.forEach(clearTimeout))

const steps = computed(() => [
  { title: 'Request sent', description: `${roleLabel.value} access to Q4 pricing model`, time: '16:21', icon: 'check' as const, tone: 'success' as const, status: 'done' as const },
  notified.value
    ? { title: 'Hélène notified', description: 'By email and in Slack', time: '16:21', icon: 'bell' as const, tone: 'success' as const, status: 'done' as const }
    : { title: 'Notifying Hélène', description: 'Sending by email and in Slack', icon: 'bell' as const, tone: 'primary' as const, status: 'current' as const },
  { title: 'Awaiting her decision', description: 'Typical reply: about 2 hours', icon: 'person' as const, tone: 'warning' as const, status: notified.value ? 'current' as const : 'upcoming' as const }
])

// Frosted sheet cells: a header row, then a few highlighted figures.
const cellClass = (n: number) => (n <= 4 ? 'is-head' : [7, 14, 19].includes(n) ? 'is-mark' : n % 4 === 1 ? 'is-label' : '')
</script>

<style scoped>
.are-cq { container-type: inline-size; }
.are { display: grid; gap: 24px; max-width: 880px; margin-inline: auto; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); }

.are__info { display: grid; align-content: start; gap: 18px; min-width: 0; }

.are__art { position: relative; width: 168px; height: 108px; }
.are__sheet { position: absolute; inset: 0 14px 10px 0; display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; grid-auto-rows: 1fr; gap: 3px; padding: 10px; border-radius: 12px; background: var(--mi-elev); border: 1px solid var(--mi-sep); box-shadow: var(--mi-sh2); transform: rotate(-3deg); overflow: hidden; }
.are__sheet i { border-radius: 2px; background: var(--mi-fill3); filter: blur(1.2px); }
.are__sheet i.is-head { background: var(--mi-fill2); }
.are__sheet i.is-label { background: var(--mi-fill2); opacity: .7; }
.are__sheet i.is-mark { background: color-mix(in srgb, var(--mi-p) 55%, transparent); }
.are__lock { position: absolute; right: 0; bottom: 0; display: grid; place-items: center; width: 42px; height: 42px; border-radius: 14px; color: var(--mi-p-on); background: var(--mi-p); box-shadow: 0 0 0 4px var(--mi-card), var(--mi-sh2); }

.are__lead { display: grid; gap: 6px; }

.are__owner { display: grid; gap: 14px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.are__owner-row { display: flex; align-items: center; gap: 12px; }
.are__owner-av { position: relative; display: block; flex: none; }
.are__owner-av i { position: absolute; right: 0; bottom: 0; width: 12px; height: 12px; border-radius: 50%; background: var(--mi-green); box-shadow: 0 0 0 2.5px var(--mi-fill4), 0 0 0 4px var(--mi-card); }
.are__owner-text { display: grid; min-width: 0; }
.are__day { display: grid; gap: 6px; }
.are__band { position: relative; height: 10px; border-radius: 5px; background: var(--mi-fill3); }
.are__work { position: absolute; top: 0; bottom: 0; border-radius: 5px; background: color-mix(in srgb, var(--mi-green) 45%, transparent); }
.are__now { position: absolute; top: -4px; bottom: -4px; width: 3px; margin-left: -1.5px; border-radius: 2px; background: var(--mi-label); box-shadow: 0 0 0 2px var(--mi-fill4); }
.are__hours { position: relative; height: 13px; font-size: 10.5px; line-height: 13px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.are__hours span { position: absolute; top: 0; transform: translateX(-50%); }
.are__hours span:first-child { transform: none; }
.are__hours span:last-child { transform: translateX(-100%); }

.are__action { min-width: 0; }
.are__form, .are__pending { display: grid; align-content: start; gap: 16px; }

.are__roles { display: grid; gap: 8px; margin: 0; padding: 0; border: 0; min-width: 0; }
.are__roles legend { margin-bottom: 8px; padding: 0; font-size: 13px; font-weight: 600; }
.are__role { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 11px 12px; border: 1px solid var(--mi-sep); border-radius: var(--mi-radius-l); color: var(--mi-label2); cursor: pointer; transition: transform var(--mi-dur-2) var(--mi-ease); }
.are__role:hover { background: var(--mi-fill4); }
.are__role:active { transform: scale(.99); }
.are__role input { position: absolute; opacity: 0; pointer-events: none; }
.are__role:has(input:focus-visible) { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.are__role.is-on { border-color: var(--mi-p); color: var(--mi-p-text); background: color-mix(in srgb, var(--mi-p) 6%, transparent); }
.are__role-text { display: grid; gap: 1px; font-size: 12px; color: var(--mi-label2); }
.are__role-text strong { font-size: 14px; font-weight: 600; color: var(--mi-label); }
.are__role-check { opacity: 0; transform: scale(.6); transition: transform var(--mi-dur-2) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease); }
.are__role.is-on .are__role-check { opacity: 1; transform: none; }

.are__pending { animation: are-in var(--mi-dur-4) var(--mi-spring) both; }
.are__pending-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.are__quote { margin: 0; padding: 10px 14px; border-left: 3px solid var(--mi-p); border-radius: 0 var(--mi-radius-m) var(--mi-radius-m) 0; font-size: 13px; line-height: 1.45; color: var(--mi-label2); background: var(--mi-fill4); }
.are__pending-actions { display: flex; flex-wrap: wrap; gap: 8px; }
@keyframes are-in { from { opacity: 0; transform: translateY(8px); } }
@media (prefers-reduced-motion: reduce) { .are__pending { animation: none; } }

@container (min-width: 700px) {
  .are { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 40px; padding: 28px 32px; }
  .are__action { padding-left: 40px; margin-left: -1px; border-left: 1px solid var(--mi-sep); }
}
</style>

<template>
  <div class="are-cq mi:@container">
    <section class="are mi:grid mi:gap-6 mi:max-w-220 mi:mx-auto mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:font-mi mi:text-label mi:@[700px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:@[700px]:gap-10 mi:@[700px]:py-7 mi:@[700px]:px-8" aria-labelledby="are-title">
      <div class="are__info mi:grid mi:content-start mi:gap-4.5 mi:min-w-0">
        <!-- A frosted glimpse of the sheet: you can tell what it is without reading it. -->
        <div class="are__art mi:relative mi:w-42 mi:h-27" aria-hidden="true">
          <span class="are__sheet mi:absolute mi:top-0 mi:right-3.5 mi:bottom-2.5 mi:left-0 mi:grid mi:grid-cols-[1.4fr_1fr_1fr_1fr] mi:auto-rows-[1fr] mi:gap-[3px] mi:p-2.5 mi:rounded-[12px] mi:bg-elev mi:border mi:border-sep mi:shadow-2 mi:transform-[rotate(-3deg)] mi:overflow-hidden">
            <i class="mi:[.are__sheet_&]:rounded-[2px] mi:[.are__sheet_&]:bg-fill3 mi:[.are__sheet_&]:[filter:blur(1.2px)]" v-for="n in 24" :key="n" :class="cellClass(n)" />
          </span>
          <span class="are__lock mi:absolute mi:right-0 mi:bottom-0 mi:grid mi:place-items-center mi:w-10.5 mi:h-10.5 mi:rounded-[14px] mi:text-p-on mi:bg-p mi:shadow-[0_0_0_4px_var(--mi-card),_var(--mi-sh2)]"><MiIcon name="lock" :size="18" :weight="2.2" /></span>
        </div>

        <div class="are__lead mi:grid mi:gap-1.5">
          <MiText variant="caption" tone="label2" weight="medium">Finance · Spreadsheet</MiText>
          <MiText id="are-title" as="h2" variant="title3" weight="semibold" balance>You need access to “Q4 pricing model”</MiText>
          <MiText variant="footnote" tone="label2">
            You're signed in as sam.okafor@larkspur.io. <MiTextLink href="#">Switch account</MiTextLink>
          </MiText>
        </div>

        <div class="are__owner mi:grid mi:gap-3.5 mi:p-4 mi:rounded-lg mi:bg-fill4">
          <div class="are__owner-row mi:flex mi:items-center mi:gap-3">
            <span class="are__owner-av mi:relative mi:block mi:flex-[none]">
              <MiAvatar class="mi:[.are__owner-av_i&]:shadow-[0_0_0_2.5px_var(--mi-fill4),_0_0_0_4px_var(--mi-card)]" name="Hélène Marchetti" size="md" tone="auto" decorative />
              <i class="mi:[.are__owner-av_i&]:shadow-[0_0_0_2.5px_var(--mi-fill4),_0_0_0_4px_var(--mi-card)]" aria-hidden="true" />
            </span>
            <div class="are__owner-text mi:grid mi:min-w-0">
              <MiText variant="subheadline" weight="semibold">Hélène Marchetti</MiText>
              <MiText variant="caption" tone="label2">Owner · Head of Finance</MiText>
            </div>
          </div>
          <!-- Her working day against a 24-hour band, so the wait is predictable. -->
          <div class="are__day mi:grid mi:gap-1.5">
            <div class="are__band mi:relative mi:h-2.5 mi:rounded-[5px] mi:bg-fill3" role="img" :aria-label="`Works 08:30 to 18:00 in Lyon; it is ${LOCAL} there now`">
              <span class="are__work mi:absolute mi:top-0 mi:bottom-0 mi:rounded-[5px] mi:[background:color-mix(in_srgb,_var(--mi-green)_45%,_transparent)]" :style="{ left: pos(8.5), width: pos(18 - 8.5) }" />
              <span class="are__now mi:absolute mi:-top-1 mi:-bottom-1 mi:w-[3px] mi:ml-[-1.5px] mi:rounded-[2px] mi:bg-label mi:shadow-[0_0_0_2px_var(--mi-fill4)]" :style="{ left: pos(NOW_H) }" />
            </div>
            <div class="are__hours mi:relative mi:h-[13px] mi:text-[10.5px] mi:leading-[13px] mi:text-label3 mi:tabular-nums" aria-hidden="true"><span class="mi:[.are__hours_&]:top-0 mi:[.are__hours_&:first-child]:transform-none mi:[.are__hours_&:last-child]:transform-[translateX(-100%)]" v-for="h in [0, 6, 12, 18, 24]" :key="h" :style="{ left: pos(h) }">{{ String(h).padStart(2, '0') }}</span></div>
            <MiText variant="caption" tone="label2" tabular>{{ LOCAL }} in Lyon, within her working hours. Usually replies in about 2 hours.</MiText>
          </div>
        </div>
      </div>

      <div class="are__action mi:min-w-0 mi:@[700px]:pl-10 mi:@[700px]:-ml-px mi:@[700px]:border-l mi:@[700px]:border-l-sep">
        <form v-if="!sent" class="are__form mi:grid mi:content-start mi:gap-4" @submit.prevent="request">
          <MiText as="h3" variant="headline" weight="semibold">Request access</MiText>
          <fieldset class="are__roles mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
            <legend class="mi:[.are__roles_legend&]:mb-2 mi:[.are__roles_legend&]:p-0">Access level</legend>
            <label v-for="r in roles" :key="r.value" class="are__role mi:relative mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:py-[11px] mi:px-3 mi:border mi:border-sep mi:rounded-lg mi:text-label2 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:active:transform-[scale(.99)] mi:[&:has(input:focus-visible)]:[outline:2px_solid_var(--mi-p)] mi:[&:has(input:focus-visible)]:outline-offset-[2px] mi:[&.is-on]:border-p mi:[&.is-on]:text-p-text" :class="{ 'is-on': role === r.value }">
              <input class="mi:[.are__role_input&]:opacity-0 mi:[.are__role_input&]:pointer-events-none" v-model="role" type="radio" name="are-role" :value="r.value">
              <MiIcon class="mi:[.are__roles_legend&]:mb-2 mi:[.are__roles_legend&]:p-0 mi:[.are__role_input&]:opacity-0 mi:[.are__role_input&]:pointer-events-none" :name="r.icon" :size="17" />
              <span class="are__role-text mi:grid mi:gap-px mi:text-[12px] mi:text-label2">
                <strong class="mi:[.are__role-text_&]:text-label">{{ r.label }}</strong>
                <span>{{ r.hint }}</span>
              </span>
              <MiIcon name="check-circle-fill" :size="18" class="are__role-check mi:[.are__roles_legend&]:mb-2 mi:[.are__roles_legend&]:p-0 mi:[.are__role_input&]:opacity-0 mi:[.are__role_input&]:pointer-events-none mi:opacity-0 mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring),_opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[.are__role.is-on_&]:opacity-100" />
            </label>
          </fieldset>
          <MiField label="Message (optional)">
            <template #default="{ id, describedBy }">
              <MiTextarea :id="id" v-model="message" :rows="2" size="sm" :maxlength="240" counter :aria-describedby="describedBy" placeholder="Why you need it, and by when" />
            </template>
          </MiField>
          <MiButton type="submit" block :loading="sending">Ask Hélène for {{ roleLabel.toLowerCase() }} access</MiButton>
        </form>

        <div v-else class="are__pending mi:grid mi:content-start mi:gap-4">
          <div class="are__pending-head mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
            <MiText as="h3" variant="headline" weight="semibold">Request pending</MiText>
            <MiBadge tone="warning" dot :label="roleLabel" />
          </div>
          <MiTimeline :items="steps" aria-label="Request progress" />
          <blockquote v-if="message.trim()" class="are__quote mi:m-0 mi:py-2.5 mi:px-3.5 mi:border-l-3 mi:border-l-p mi:rounded-[0_var(--mi-radius-m)_var(--mi-radius-m)_0] mi:text-[13px] mi:leading-[1.45] mi:text-label2 mi:bg-fill4">{{ message.trim() }}</blockquote>
          <MiText variant="caption" tone="label2">You'll get an email and the sheet will open here as soon as she decides. No need to keep this tab open.</MiText>
          <div class="are__pending-actions mi:flex mi:flex-wrap mi:gap-2">
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
.are__sheet i.is-head { background: var(--mi-fill2); }
.are__sheet i.is-label { background: var(--mi-fill2); opacity: .7; }
.are__sheet i.is-mark { background: color-mix(in srgb, var(--mi-p) 55%, transparent); }
.are__owner-av i { position: absolute; right: 0; bottom: 0; width: 12px; height: 12px; border-radius: 50%; background: var(--mi-green); }
.are__hours span { position: absolute; transform: translateX(-50%); }
.are__roles legend { font-size: 13px; font-weight: 600; }
.are__role:hover { background: var(--mi-fill4); }
.are__role input { position: absolute; }
.are__role.is-on { background: color-mix(in srgb, var(--mi-p) 6%, transparent); }
.are__role-text strong { font-size: 14px; font-weight: 600; }
.are__role-check { transform: scale(.6); }
.are__role.is-on .are__role-check { transform: none; }

.are__pending { animation: are-in var(--mi-dur-4) var(--mi-spring) both; }
@keyframes are-in { from { opacity: 0; transform: translateY(8px); } }
@media (prefers-reduced-motion: reduce) { .are__pending { animation: none; } }
</style>

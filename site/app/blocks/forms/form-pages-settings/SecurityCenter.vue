<template>
  <section class="mi:@container/sec mi:grid mi:content-start mi:gap-5 mi:font-mi mi:text-label" aria-labelledby="sec-title">
    <header class="mi:grid mi:gap-1">
      <MiText id="sec-title" as="h2" variant="title2" weight="bold">Security</MiText>
      <MiText variant="footnote" tone="label2">ines.moreau@harbourline.eu · password changed 4 months ago</MiText>
    </header>

    <div class="mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:@[760px]/sec:grid-cols-[280px_minmax(0,_1fr)] mi:@[760px]/sec:gap-5">
      <!-- Score: every protection you add lights more of the meter. -->
      <aside class="mi:relative mi:grid mi:gap-2.5 mi:p-5 mi:rounded-xl mi:overflow-hidden mi:isolate mi:[background:var(--mi-card)] mi:shadow-1 mi:before:content-[''] mi:before:absolute mi:before:top-[-50%] mi:before:right-[-40%] mi:before:bottom-auto mi:before:left-auto mi:before:w-[80%] mi:before:aspect-[1] mi:before:-z-1 mi:before:rounded-[50%] mi:before:[background:radial-gradient(closest-side,_color-mix(in_srgb,_var(--sec-tone)_18%,_transparent),_transparent)]" :class="grade.tone === 'fair' ? 'mi:[--sec-tone:var(--mi-p)]' : grade.tone === 'good' ? 'mi:[--sec-tone:var(--mi-green)]' : 'mi:[--sec-tone:var(--mi-orange)]'" aria-labelledby="sec-score-title">
        <div class="mi:flex mi:items-center mi:justify-between mi:gap-2">
          <MiText id="sec-score-title" as="h3" variant="subheadline" weight="semibold" tone="label2">Account protection</MiText>
          <MiBadge :tone="grade.badge" :label="grade.label" />
        </div>
        <p class="mi:flex mi:items-baseline mi:gap-1 mi:mt-0.5 mi:mx-0 mi:mb-0 mi:tabular-nums"><span class="mi:font-bold mi:leading-none mi:text-[52px] mi:tracking-[-.045em]">{{ score }}</span><small class="mi:font-semibold mi:text-label3 mi:text-[15px]">/100</small></p>
        <div class="mi:grid mi:grid-cols-20 mi:gap-[3px] mi:h-5.5" role="meter" aria-label="Protection score" :aria-valuenow="score" aria-valuemin="0" aria-valuemax="100" :aria-valuetext="`${score} of 100, ${grade.label}`">
          <span class="mi:relative mi:rounded-[2px] mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:after:[background:var(--sec-tone)] mi:[background:var(--mi-fill3)] mi:after:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)] mi:after:[transition-delay:inherit] mi:motion-reduce:after:[transition:none]" v-for="i in 20" :key="i" :class="[i * 5 <= score ? 'mi:after:opacity-100 mi:after:[transform:none]' : 'mi:after:opacity-0 mi:after:transform-[scaleY(.5)]']" :style="{ transitionDelay: `${i * 18}ms` }" />
        </div>
        <ul class="mi:grid mi:gap-0.5 mi:mt-2 mi:mx-0 mi:mb-0 mi:pt-2.5 mi:px-0 mi:pb-0 mi:[list-style:none] mi:border-t mi:border-t-sep">
          <li class="mi:grid mi:text-[13px] mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-2.5 mi:py-[5px] mi:px-0 mi:text-label2" v-for="c in checks" :key="c.label" :class="c.done ? 'mi:text-label!' : ''">
            <span class="mi:grid mi:place-items-center mi:w-5 mi:h-5 mi:rounded-[50%]" :class="c.done ? 'mi:text-green-t mi:[background:color-mix(in_srgb,_var(--mi-green)_16%,_transparent)] mi:shadow-none' : 'mi:text-label3 mi:shadow-[inset_0_0_0_1.5px_var(--mi-fill2)]'" aria-hidden="true"><MiIcon :name="c.done ? 'check' : 'plus'" :size="12" :weight="2.8" /></span>
            <span>{{ c.label }}<span class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip:rect(0_0_0_0)] mi:whitespace-nowrap">{{ c.done ? ', done' : ', to do' }}</span></span>
            <span class="mi:text-[12px] mi:font-semibold mi:tabular-nums" :class="c.done ? 'mi:text-label2' : 'mi:text-label3'">+{{ c.points }}</span>
          </li>
        </ul>
      </aside>

      <div class="mi:grid mi:gap-4 mi:min-w-0">
        <!-- Two-step login -->
        <section class="mi:grid mi:gap-4 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="sec-2fa-title">
          <div class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3.5">
            <span class="mi:grid mi:place-items-center mi:w-9.5 mi:h-9.5 mi:rounded-[11px] " :class="mfa === 'on' ? 'mi:text-green-t mi:[background:color-mix(in_srgb,_var(--mi-green)_14%,_transparent)]' : 'mi:text-orange-t mi:[background:color-mix(in_srgb,_var(--mi-orange)_14%,_transparent)]'" aria-hidden="true"><MiIcon name="lock" :size="18" /></span>
            <div class="mi:grid mi:gap-0.5 mi:min-w-0">
              <MiText id="sec-2fa-title" as="h3" variant="headline">Two-step login</MiText>
              <MiText variant="footnote" tone="label2">
                {{ mfa === 'on' ? 'On · authenticator app, added just now' : 'A code from your phone on every new sign-in.' }}
              </MiText>
            </div>
            <MiButton v-if="mfa === 'off'" size="small" @click="mfa = 'setup'">Set up</MiButton>
            <MiButton v-else-if="mfa === 'on'" size="small" variant="plain" @click="turnOff">Turn off</MiButton>
          </div>

          <div v-if="mfa === 'setup' || mfa === 'verifying'" class="mi:grid mi:gap-4.5 mi:p-4 mi:rounded-lg mi:[background:var(--mi-fill4)] mi:@[560px]/sec:grid-cols-[132px_minmax(0,_1fr)] mi:@[560px]/sec:items-start">
            <svg class="mi:w-33 mi:h-33 mi:text-label" viewBox="-2 -2 25 25" role="img" aria-label="QR code for your authenticator app">
              <rect x="-2" y="-2" width="25" height="25" rx="2" class="mi:fill-card" />
              <path :d="qrPath" fill="currentColor" shape-rendering="crispEdges" />
            </svg>
            <div class="mi:grid mi:gap-2.5 mi:min-w-0">
              <MiText variant="footnote">1. Scan with 1Password, Authy or Google Authenticator, or enter the key:</MiText>
              <div class="mi:flex mi:items-center mi:justify-between mi:gap-2 mi:pt-1 mi:pr-1 mi:pb-1 mi:pl-3 mi:rounded-[10px] mi:[background:var(--mi-card)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]">
                <code class="mi:wrap-anywhere mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[13px] mi:tracking-[.06em]">{{ secret }}</code>
                <MiCopyButton :value="secret.replace(/\s/g, '')" variant="ghost" icon-only label="Copy setup key" />
              </div>
              <MiText variant="footnote">2. Type the 6-digit code it shows.</MiText>
              <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-3">
                <MiCodeInput v-model="code" :invalid="!!codeError || undefined" :disabled="mfa === 'verifying'" label="Authenticator code" @complete="verify" />
                <MiSpinner v-if="mfa === 'verifying'" size="sm" label="Checking code" />
              </div>
              <MiText v-if="codeError" variant="caption" tone="red" role="alert">{{ codeError }}</MiText>
              <div><MiButton size="small" variant="gray" @click="cancelSetup">Cancel</MiButton></div>
            </div>
          </div>

          <!-- Recovery codes exist once two-step login is on. -->
          <div class="mi:grid mi:gap-3 mi:pt-4 mi:border-t mi:border-t-sep " :class="mfa !== 'on' ? 'mi:opacity-75' : ''">
            <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
              <MiText as="h4" variant="subheadline" weight="semibold">Recovery codes</MiText>
              <div v-if="mfa === 'on'" class="mi:flex mi:gap-2">
                <MiButton size="small" variant="gray" :pressed="revealed" @click="revealed = !revealed">
                  <template #leading><MiIcon name="eye" :size="15" /></template>
                  {{ revealed ? 'Hide' : 'Reveal' }}
                </MiButton>
                <MiCopyButton :value="codes.join('\n')" label="Copy all" />
              </div>
            </div>
            <MiText v-if="mfa !== 'on'" variant="footnote" tone="label2">Ten single-use codes are generated when you turn on two-step login.</MiText>
            <template v-else>
              <ol class="mi:grid mi:grid-cols-2 mi:gap-y-1.5 mi:gap-x-4 mi:m-0 mi:py-3.5 mi:px-4 mi:[list-style:none] mi:[counter-reset:code] mi:rounded-md mi:[background:var(--mi-fill4)] mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[13px] mi:tabular-nums mi:@[1000px]/sec:grid-cols-5" :aria-hidden="!revealed || undefined">
                <li class="mi:[counter-increment:code] mi:before:content-[counter(code,_decimal-leading-zero)_'_'] mi:before:text-label3 mi:tracking-[.04em]" v-for="c in codes" :key="c" :class="revealed ? '' : 'mi:text-label3'">{{ revealed ? c : '•••• ••••' }}</li>
              </ol>
              <MiCheckbox v-model="codesSaved" label="I stored these codes somewhere safe" description="Each one signs you in once if you lose your phone." />
            </template>
          </div>
        </section>

        <!-- Sessions -->
        <section class="mi:grid mi:gap-4 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="sec-sessions-title">
          <div class="mi:flex mi:items-baseline mi:justify-between mi:gap-2.5">
            <MiText id="sec-sessions-title" as="h3" variant="headline">Signed-in devices</MiText>
            <MiText variant="caption" tone="label2">{{ sessions.length }} active</MiText>
          </div>
          <TransitionGroup tag="ul" leave-active-class="mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:[transition:none]" leave-to-class="mi:opacity-0 mi:transform-[translateX(16px)]" move-class="mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:motion-reduce:[transition:none]" class="mi:@container/sec-list mi:relative mi:grid mi:-mt-1 mi:mx-0 mi:mb-0 mi:p-0 mi:[list-style:none]">
            <li v-for="s in sessions" :key="s.id" class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-y-2.5 mi:gap-x-3.5 mi:py-3 mi:px-0 mi:not-first:border-t mi:not-first:border-t-sep">
              <span class="mi:grid mi:place-items-center mi:w-9 mi:h-9 mi:rounded-[10px]" :class="s.unfamiliar ? 'mi:text-orange-t mi:[background:color-mix(in_srgb,_var(--mi-orange)_14%,_transparent)]' : 'mi:text-label2 mi:[background:var(--mi-fill4)]'" aria-hidden="true"><MiIcon :name="s.icon" :size="18" /></span>
              <div class="mi:grid mi:gap-0.5 mi:min-w-0">
                <span class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-1 mi:gap-x-2 mi:text-[14px] mi:font-semibold">
                  {{ s.device }}
                  <MiBadge v-if="s.current" tone="success" label="This device" />
                  <MiBadge v-else-if="s.unfamiliar" tone="warning" label="Not recognised" />
                </span>
                <span class="mi:text-[12px] mi:text-label2">{{ s.where }} · <span class="mi:tabular-nums">{{ s.when }}</span></span>
              </div>
              <div v-if="confirming === s.id" class="mi:col-span-full mi:[justify-content:flex-end] mi:@[640px]/sec-list:col-[3] mi:flex mi:flex-wrap mi:items-center mi:gap-2 mi:pt-1.5 mi:pr-1.5 mi:pb-1.5 mi:pl-3 mi:rounded-[12px] mi:[background:color-mix(in_srgb,_var(--mi-red)_8%,_transparent)]" role="group" :aria-label="`Sign out ${s.device}?`">
                <MiText as="span" variant="caption" tone="label2">Sign out?</MiText>
                <MiButton size="small" variant="gray" @click="confirming = null">Cancel</MiButton>
                <MiButton size="small" variant="destructive" @click="revoke(s.id)">Sign out</MiButton>
              </div>
              <MiButton v-else-if="!s.current" size="small" variant="plain" @click="confirming = s.id">Revoke</MiButton>
            </li>
          </TransitionGroup>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })

type Mfa = 'off' | 'setup' | 'verifying' | 'on'
const mfa = ref<Mfa>('off')
const code = ref('')
const codeError = ref('')
const revealed = ref(false)
const codesSaved = ref(false)

const secret = 'JBSW Y3DP EHPK 3PXP Q4ZT'
const codes = ['7KQ2-M9XD', 'H4TR-2WNP', 'Z8LC-6VEB', 'P3FJ-QW7S', 'R5YN-K2HA', 'B9MD-4TXG', 'W6EQ-J8LR', 'C2VU-N5PK', 'T7GH-3ZQM', 'L4SB-X9WF']

interface Session { id: string, device: string, where: string, when: string, icon: 'desktop' | 'wifi' | 'globe', current?: boolean, unfamiliar?: boolean }
const sessions = ref<Session[]>([
  { id: 'mac', device: 'MacBook Air · Safari', where: 'Lyon, France', when: 'Active now', icon: 'desktop', current: true },
  { id: 'iphone', device: 'iPhone 15 · Harbourline app', where: 'Lyon, France', when: '2 h ago', icon: 'wifi' },
  { id: 'win', device: 'Windows · Chrome 129', where: 'Wrocław, Poland', when: 'Yesterday, 23:14', icon: 'globe', unfamiliar: true },
  { id: 'ipad', device: 'iPad · Safari', where: 'Annecy, France', when: '3 weeks ago', icon: 'desktop' }
])
const confirming = ref<string | null>(null)
function revoke(id: string) {
  sessions.value = sessions.value.filter(s => s.id !== id)
  confirming.value = null
}

function verify(value: string) {
  codeError.value = ''
  mfa.value = 'verifying'
  later(() => {
    // Sample rule: a code of zeros stands for an expired one.
    if (/^0+$/.test(value)) {
      codeError.value = 'That code has expired. Codes refresh every 30 seconds; try the new one.'
      mfa.value = 'setup'
      code.value = ''
      return
    }
    mfa.value = 'on'
    code.value = ''
  }, 700)
}
function cancelSetup() { mfa.value = 'off'; code.value = ''; codeError.value = '' }
function turnOff() { mfa.value = 'off'; revealed.value = false; codesSaved.value = false }

const checks = computed(() => [
  { label: 'Strong, unique password', points: 25, done: true },
  { label: 'Verified email address', points: 15, done: true },
  { label: 'Two-step login', points: 30, done: mfa.value === 'on' },
  { label: 'Recovery codes stored', points: 15, done: mfa.value === 'on' && codesSaved.value },
  { label: 'No unrecognised devices', points: 15, done: !sessions.value.some(s => s.unfamiliar) }
])
const score = computed(() => checks.value.reduce((sum, c) => sum + (c.done ? c.points : 0), 0))
const grade = computed(() => {
  if (score.value >= 85) return { label: 'Strong', tone: 'good', badge: 'success' as const }
  if (score.value >= 60) return { label: 'Fair', tone: 'fair', badge: 'primary' as const }
  return { label: 'At risk', tone: 'weak', badge: 'warning' as const }
})

// Decorative QR: finder squares in three corners, a deterministic pattern elsewhere.
const qrPath = (() => {
  const n = 21
  const finder = (x: number, y: number) => {
    for (const [fx, fy] of [[0, 0], [n - 7, 0], [0, n - 7]] as const) {
      const dx = x - fx, dy = y - fy
      if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) {
        if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return 0
        const ring = Math.min(dx, dy, 6 - dx, 6 - dy)
        return ring === 1 ? 0 : 1
      }
    }
    return -1
  }
  let seed = 20261102
  const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648 }
  let d = ''
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const f = finder(x, y)
    const on = f === -1 ? (x === 6 || y === 6 ? (x + y) % 2 === 0 : rand() > 0.52) : f === 1
    if (on) d += `M${x} ${y}h1v1h-1z`
  }
  return d
})()
</script>

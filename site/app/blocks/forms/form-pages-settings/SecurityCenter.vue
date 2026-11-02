<template>
  <section class="sec" aria-labelledby="sec-title">
    <header class="sec__head">
      <MiText id="sec-title" as="h2" variant="title2" weight="bold">Security</MiText>
      <MiText variant="footnote" tone="label2">ines.moreau@harbourline.eu · password changed 4 months ago</MiText>
    </header>

    <div class="sec__layout">
      <!-- Score: every protection you add lights more of the meter. -->
      <aside class="sec__score" :class="`is-${grade.tone}`" aria-labelledby="sec-score-title">
        <div class="sec__score-top">
          <MiText id="sec-score-title" as="h3" variant="subheadline" weight="semibold" tone="label2">Account protection</MiText>
          <MiBadge :tone="grade.badge" :label="grade.label" />
        </div>
        <p class="sec__num"><span>{{ score }}</span><small>/100</small></p>
        <div class="sec__meter" role="meter" aria-label="Protection score" :aria-valuenow="score" aria-valuemin="0" aria-valuemax="100" :aria-valuetext="`${score} of 100, ${grade.label}`">
          <span v-for="i in 20" :key="i" :class="{ 'is-lit': i * 5 <= score }" :style="{ transitionDelay: `${i * 18}ms` }" />
        </div>
        <ul class="sec__list">
          <li v-for="c in checks" :key="c.label" :class="{ 'is-done': c.done }">
            <span class="sec__tick" aria-hidden="true"><MiIcon :name="c.done ? 'check' : 'plus'" :size="12" :weight="2.8" /></span>
            <span class="sec__check-label">{{ c.label }}<span class="sec__sr">{{ c.done ? ', done' : ', to do' }}</span></span>
            <span class="sec__pts">+{{ c.points }}</span>
          </li>
        </ul>
      </aside>

      <div class="sec__main">
        <!-- Two-step login -->
        <section class="sec__card" aria-labelledby="sec-2fa-title">
          <div class="sec__row">
            <span class="sec__glyph" :class="{ 'is-good': mfa === 'on' }" aria-hidden="true"><MiIcon name="lock" :size="18" /></span>
            <div class="sec__row-text">
              <MiText id="sec-2fa-title" as="h3" variant="headline">Two-step login</MiText>
              <MiText variant="footnote" tone="label2">
                {{ mfa === 'on' ? 'On · authenticator app, added just now' : 'A code from your phone on every new sign-in.' }}
              </MiText>
            </div>
            <MiButton v-if="mfa === 'off'" size="small" @click="mfa = 'setup'">Set up</MiButton>
            <MiButton v-else-if="mfa === 'on'" size="small" variant="plain" @click="turnOff">Turn off</MiButton>
          </div>

          <div v-if="mfa === 'setup' || mfa === 'verifying'" class="sec__setup">
            <svg class="sec__qr" viewBox="-2 -2 25 25" role="img" aria-label="QR code for your authenticator app">
              <rect x="-2" y="-2" width="25" height="25" rx="2" class="sec__qr-bg" />
              <path :d="qrPath" fill="currentColor" shape-rendering="crispEdges" />
            </svg>
            <div class="sec__setup-body">
              <MiText variant="footnote">1. Scan with 1Password, Authy or Google Authenticator, or enter the key:</MiText>
              <div class="sec__key">
                <code>{{ secret }}</code>
                <MiCopyButton :value="secret.replace(/\s/g, '')" variant="ghost" icon-only label="Copy setup key" />
              </div>
              <MiText variant="footnote">2. Type the 6-digit code it shows.</MiText>
              <div class="sec__code">
                <MiCodeInput v-model="code" :invalid="!!codeError || undefined" :disabled="mfa === 'verifying'" label="Authenticator code" @complete="verify" />
                <MiSpinner v-if="mfa === 'verifying'" size="sm" label="Checking code" />
              </div>
              <MiText v-if="codeError" variant="caption" tone="red" role="alert">{{ codeError }}</MiText>
              <div><MiButton size="small" variant="gray" @click="cancelSetup">Cancel</MiButton></div>
            </div>
          </div>

          <!-- Recovery codes exist once two-step login is on. -->
          <div class="sec__recovery" :class="{ 'is-locked': mfa !== 'on' }">
            <div class="sec__recovery-head">
              <MiText as="h4" variant="subheadline" weight="semibold">Recovery codes</MiText>
              <div v-if="mfa === 'on'" class="sec__recovery-actions">
                <MiButton size="small" variant="gray" :pressed="revealed" @click="revealed = !revealed">
                  <template #leading><MiIcon name="eye" :size="15" /></template>
                  {{ revealed ? 'Hide' : 'Reveal' }}
                </MiButton>
                <MiCopyButton :value="codes.join('\n')" label="Copy all" />
              </div>
            </div>
            <MiText v-if="mfa !== 'on'" variant="footnote" tone="label2">Ten single-use codes are generated when you turn on two-step login.</MiText>
            <template v-else>
              <ol class="sec__codes" :class="{ 'is-hidden': !revealed }" :aria-hidden="!revealed || undefined">
                <li v-for="c in codes" :key="c">{{ revealed ? c : '•••• ••••' }}</li>
              </ol>
              <MiCheckbox v-model="codesSaved" label="I stored these codes somewhere safe" description="Each one signs you in once if you lose your phone." />
            </template>
          </div>
        </section>

        <!-- Sessions -->
        <section class="sec__card" aria-labelledby="sec-sessions-title">
          <div class="sec__sessions-head">
            <MiText id="sec-sessions-title" as="h3" variant="headline">Signed-in devices</MiText>
            <MiText variant="caption" tone="label2">{{ sessions.length }} active</MiText>
          </div>
          <TransitionGroup tag="ul" name="sec-out" class="sec__sessions">
            <li v-for="s in sessions" :key="s.id" class="sec__session" :class="{ 'is-flagged': s.unfamiliar }">
              <span class="sec__device" aria-hidden="true"><MiIcon :name="s.icon" :size="18" /></span>
              <div class="sec__session-text">
                <span class="sec__session-name">
                  {{ s.device }}
                  <MiBadge v-if="s.current" tone="success" label="This device" />
                  <MiBadge v-else-if="s.unfamiliar" tone="warning" label="Not recognised" />
                </span>
                <span class="sec__session-meta">{{ s.where }} · <span class="sec__tab">{{ s.when }}</span></span>
              </div>
              <div v-if="confirming === s.id" class="sec__confirm" role="group" :aria-label="`Sign out ${s.device}?`">
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
import { computed, ref } from 'vue'

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
  setTimeout(() => {
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

<style scoped>
.sec { container: sec / inline-size; display: grid; align-content: start; gap: 20px; font-family: var(--mi-font); color: var(--mi-label); }
.sec__head { display: grid; gap: 4px; }
.sec__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.sec__layout { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); align-items: start; }
@container sec (min-width: 760px) { .sec__layout { grid-template-columns: 280px minmax(0, 1fr); gap: 20px; } }

/* Score card */
.sec__score {
  --sec-tone: var(--mi-orange);
  position: relative; display: grid; gap: 10px; padding: 20px; border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate;
  background: var(--mi-card); box-shadow: var(--mi-sh1);
}
.sec__score.is-fair { --sec-tone: var(--mi-p); }
.sec__score.is-good { --sec-tone: var(--mi-green); }
.sec__score::before {
  content: ""; position: absolute; inset: -50% -40% auto auto; width: 80%; aspect-ratio: 1; z-index: -1; border-radius: 50%;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--sec-tone) 18%, transparent), transparent);
}
.sec__score-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.sec__num { display: flex; align-items: baseline; gap: 4px; margin: 2px 0 0; font-variant-numeric: tabular-nums; }
.sec__num span { font-size: 52px; font-weight: 700; line-height: 1; letter-spacing: -.045em; }
.sec__num small { font-size: 15px; font-weight: 600; color: var(--mi-label3); }
.sec__meter { display: grid; grid-template-columns: repeat(20, minmax(0, 1fr)); gap: 3px; height: 22px; }
.sec__meter span { position: relative; border-radius: 2px; background: var(--mi-fill3); }
.sec__meter span::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; background: var(--sec-tone);
  opacity: 0; transform: scaleY(.5); transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); transition-delay: inherit;
}
.sec__meter span.is-lit::after { opacity: 1; transform: none; }

.sec__list { display: grid; gap: 2px; margin: 8px 0 0; padding: 10px 0 0; list-style: none; border-top: 1px solid var(--mi-sep); }
.sec__list li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 5px 0; font-size: 13px; color: var(--mi-label2); }
.sec__list li.is-done { color: var(--mi-label); }
.sec__tick { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; color: var(--mi-label3); box-shadow: inset 0 0 0 1.5px var(--mi-fill2); }
.sec__list li.is-done .sec__tick { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 16%, transparent); box-shadow: none; }
.sec__pts { font-size: 12px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.sec__list li.is-done .sec__pts { color: var(--mi-label2); }

/* Main column */
.sec__main { display: grid; gap: 16px; min-width: 0; }
.sec__card { display: grid; gap: 16px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.sec__row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 14px; }
.sec__row-text { display: grid; gap: 2px; min-width: 0; }
.sec__glyph { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 11px; color: var(--mi-orange-t); background: color-mix(in srgb, var(--mi-orange) 14%, transparent); }
.sec__glyph.is-good { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 14%, transparent); }

.sec__setup { display: grid; gap: 18px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
@container sec (min-width: 560px) { .sec__setup { grid-template-columns: 132px minmax(0, 1fr); align-items: start; } }
.sec__qr { width: 132px; height: 132px; color: var(--mi-label); }
.sec__qr-bg { fill: var(--mi-card); }
.sec__setup-body { display: grid; gap: 10px; min-width: 0; }
.sec__key { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 4px 4px 4px 12px; border-radius: 10px; background: var(--mi-card); box-shadow: inset 0 0 0 1px var(--mi-sep); }
.sec__key code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; letter-spacing: .06em; overflow-wrap: anywhere; }
.sec__code { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }

.sec__recovery { display: grid; gap: 12px; padding-top: 16px; border-top: 1px solid var(--mi-sep); }
.sec__recovery.is-locked { opacity: .75; }
.sec__recovery-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.sec__recovery-actions { display: flex; gap: 8px; }
.sec__codes {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 16px; margin: 0; padding: 14px 16px; list-style: none; counter-reset: code;
  border-radius: var(--mi-radius-m); background: var(--mi-fill4); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; font-variant-numeric: tabular-nums;
}
@container sec (min-width: 1000px) { .sec__codes { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
.sec__codes li { counter-increment: code; letter-spacing: .04em; }
.sec__codes li::before { content: counter(code, decimal-leading-zero) "  "; color: var(--mi-label3); }
.sec__codes.is-hidden li { color: var(--mi-label3); }

.sec__sessions-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.sec__sessions { container: sec-list / inline-size; position: relative; display: grid; margin: -4px 0 0; padding: 0; list-style: none; }
.sec__session { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px 14px; padding: 12px 0; }
.sec__session + .sec__session { border-top: 1px solid var(--mi-sep); }
.sec__confirm { grid-column: 1 / -1; justify-content: flex-end; }
@container sec-list (min-width: 640px) { .sec__confirm { grid-column: 3; } }
.sec__device { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px; color: var(--mi-label2); background: var(--mi-fill4); }
.sec__session.is-flagged .sec__device { color: var(--mi-orange-t); background: color-mix(in srgb, var(--mi-orange) 14%, transparent); }
.sec__session-text { display: grid; gap: 2px; min-width: 0; }
.sec__session-name { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; font-size: 14px; font-weight: 600; }
.sec__session-meta { font-size: 12px; color: var(--mi-label2); }
.sec__tab { font-variant-numeric: tabular-nums; }
.sec__confirm { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 6px 6px 6px 12px; border-radius: 12px; background: color-mix(in srgb, var(--mi-red) 8%, transparent); }

.sec-out-leave-active { transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-ease); }
.sec-out-leave-to { opacity: 0; transform: translateX(16px); }
.sec-out-move { transition: transform var(--mi-dur-3) var(--mi-spring); }
@media (prefers-reduced-motion: reduce) { .sec__meter span::after, .sec-out-leave-active, .sec-out-move { transition: none; } }
</style>

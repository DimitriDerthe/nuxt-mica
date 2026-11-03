<template>
  <section class="sus" aria-labelledby="sus-title">
    <div class="sus__in">
      <header class="sus__bar">
        <div class="sus__brand">
          <MiIcon :svg="brandGlyph" :size="22" class="sus__brand-mark" />
          <MiText as="span" variant="headline" weight="semibold">Tidemark</MiText>
        </div>
        <MiText as="span" variant="footnote" tone="label2" class="sus__have">
          Have an account? <MiTextLink href="#" :chevron="false">Sign in</MiTextLink>
        </MiText>
      </header>

      <div class="sus__body">
        <form v-if="!created" class="sus__form" novalidate @submit.prevent="submit">
          <div class="sus__head">
            <MiText variant="caption" weight="semibold" tone="primary" class="sus__kicker">Free for teams up to 5</MiText>
            <MiText id="sus-title" as="h2" variant="title1" weight="bold" balance>Create your Tidemark account</MiText>
            <MiText variant="subheadline" tone="label2">Tide tables, crew rosters and harbour logs in one shared place.</MiText>
          </div>

          <div class="sus__sso" role="group" aria-label="Sign up with a provider">
            <button v-for="p in providers" :key="p.id" type="button" class="sus__sso-btn" :aria-label="`Sign up with ${p.id === 'saml' ? 'SAML single sign-on' : p.label}`" @click="sso(p.label)">
              <span class="sus__sso-mark" :class="'sus__sso-mark--' + p.id" aria-hidden="true">
                <MiIcon v-if="p.id === 'saml'" name="lock" :size="13" :weight="2.2" />
                <template v-else>{{ p.mark }}</template>
              </span>
              <span>{{ p.label }}</span>
            </button>
          </div>

          <div class="sus__or"><span>or with your work email</span></div>

          <div class="sus__pair">
            <MiField label="Full name" :error="errors.name">
              <template #default="{ id, describedBy }">
                <MiInput :id="id" v-model="name" autocomplete="name" :aria-describedby="describedBy" />
              </template>
            </MiField>
            <MiField label="Work email" :error="errors.email">
              <template #default="{ id, describedBy }">
                <MiInput :id="id" v-model="email" type="email" autocomplete="email" :aria-describedby="describedBy" placeholder="you@company.com" />
              </template>
            </MiField>
          </div>

          <MiField label="Password" :error="errors.password" class="sus__pw">
            <template #default="{ id, describedBy }">
              <MiInput
                :id="id" v-model="password" type="password" autocomplete="new-password"
                :aria-describedby="[describedBy, 'sus-rules'].filter(Boolean).join(' ')"
              />
            </template>
          </MiField>

          <!-- Strength as a shape: each rule is one facet that slides into place and fills. -->
          <div class="sus__strength" :class="{ 'is-set': metCount === rules.length }">
            <div
              class="sus__gem-wrap" role="meter" aria-label="Password strength" :aria-valuenow="metCount"
              aria-valuemin="0" :aria-valuemax="rules.length" :aria-valuetext="`${verdict}, ${metCount} of ${rules.length} rules met`"
            >
              <span class="sus__halo" aria-hidden="true" />
              <svg class="sus__gem" viewBox="0 0 200 200" aria-hidden="true">
                <g v-for="(f, i) in facets" :key="i" class="sus__facet" :class="{ 'is-met': checks[i] }" :style="{ '--dx': f.dx + 'px', '--dy': f.dy + 'px' }">
                  <path :d="f.d" class="sus__facet-line" />
                  <path :d="f.d" class="sus__facet-fill" :style="{ fill: f.fill }" />
                  <path :d="f.shine" class="sus__facet-shine" />
                </g>
              </svg>
            </div>
            <div class="sus__verdict" aria-live="polite">
              <MiText as="span" variant="headline" weight="semibold">{{ verdict }}</MiText>
              <MiText as="span" variant="caption" tone="label2" tabular>{{ metCount }} of {{ rules.length }} facets</MiText>
            </div>
            <ul id="sus-rules" class="sus__rules" aria-label="Password rules">
              <li v-for="(r, i) in rules" :key="r.id" :class="{ 'is-met': checks[i] }">
                <span class="sus__tick" aria-hidden="true"><MiIcon name="check" :size="11" :weight="3" /></span>
                <span>{{ r.label }}</span>
                <span class="sr-only">{{ checks[i] ? 'met' : 'not met' }}</span>
              </li>
            </ul>
          </div>

          <div class="sus__terms">
            <MiCheckbox v-model="terms">
              I agree to the <MiTextLink href="#" :chevron="false">Terms</MiTextLink> and <MiTextLink href="#" :chevron="false">Privacy notice</MiTextLink>
            </MiCheckbox>
            <MiText v-if="errors.terms" variant="footnote" tone="red" weight="medium" role="alert">{{ errors.terms }}</MiText>
          </div>

          <div class="sus__submit">
            <MiButton type="submit" size="large" block :loading="busy">Create account</MiButton>
            <MiText variant="caption" tone="label3" align="center">No card needed. Invite your crew after setup.</MiText>
          </div>
        </form>

        <div v-else class="sus__done" aria-live="polite">
          <span class="sus__done-glyph" aria-hidden="true"><MiIcon :svg="envelope" :size="26" /></span>
          <MiText id="sus-title" as="h2" variant="title2" weight="bold" align="center">Confirm your email</MiText>
          <MiText variant="subheadline" tone="label2" align="center" balance>
            {{ viaSso ? `Your ${viaSso} identity is linked.` : 'Account created.' }} We sent a confirmation link to <strong>{{ email }}</strong>; it stays valid for 24 hours.
          </MiText>
          <MiButton variant="plain" size="small" @click="reset">Start over</MiButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onBeforeUnmount } from 'vue'

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })

const brandGlyph = '<path d="M3 15c2.2 0 2.2-2 4.5-2s2.3 2 4.5 2 2.2-2 4.5-2 2.3 2 4.5 2"/><path d="M3 19c2.2 0 2.2-2 4.5-2s2.3 2 4.5 2 2.2-2 4.5-2 2.3 2 4.5 2"/><path d="M12 3v7M8.5 6.5 12 10l3.5-3.5"/>'
const envelope = '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>'

const providers = [
  { id: 'google', label: 'Google', mark: 'G' },
  { id: 'github', label: 'GitHub', mark: 'Gh' },
  { id: 'saml', label: 'SAML', mark: '' }
]

const name = ref('Maya Lindqvist')
const email = ref('maya@harbourline.io')
const password = ref('Tidewater-')
const terms = ref(false)
const busy = ref(false)
const created = ref(false)
const viaSso = ref('')
const errors = reactive({ name: '', email: '', password: '', terms: '' })

const personal = computed(() => [
  ...name.value.toLowerCase().split(/\s+/),
  email.value.toLowerCase().split('@')[0] ?? ''
].filter(w => w.length >= 3))

const rules = [
  { id: 'len', label: '12 or more characters', test: (p: string) => p.length >= 12 },
  { id: 'case', label: 'Upper and lower case', test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { id: 'num', label: 'A number', test: (p: string) => /\d/.test(p) },
  { id: 'sym', label: 'A symbol, like ! or #', test: (p: string) => /[^A-Za-z0-9\s]/.test(p) },
  { id: 'own', label: 'Not your name or email', test: (p: string) => p.length > 0 && !personal.value.some(w => p.toLowerCase().includes(w)) }
]
const checks = computed(() => rules.map(r => r.test(password.value)))
const metCount = computed(() => checks.value.filter(Boolean).length)
const verdict = computed(() => {
  const n = metCount.value
  if (!password.value) return 'Waiting for a password'
  if (n <= 1) return 'Loose pieces'
  if (n <= 3) return 'Taking shape'
  if (n === 4) return 'One facet to go'
  return 'Set and sealed'
})

// Brand shades only: alternating lighter and deeper cuts read as a faceted stone in both themes.
const shades = [
  'var(--mi-p)',
  'color-mix(in srgb, var(--mi-p) 70%, var(--mi-card))',
  'color-mix(in srgb, var(--mi-p) 82%, var(--mi-label))',
  'color-mix(in srgb, var(--mi-p) 52%, var(--mi-card))',
  'color-mix(in srgb, var(--mi-p) 66%, var(--mi-s))'
]

// A pentagon cut into five triangular facets. Unmet facets drift outward along their normal.
const facets = Array.from({ length: 5 }, (_, k) => {
  const c = 100
  const R = 80
  const a0 = (-90 + k * 72) * Math.PI / 180
  const a1 = (-90 + (k + 1) * 72) * Math.PI / 180
  const mid = (a0 + a1) / 2
  const p0 = [c + Math.cos(a0) * R, c + Math.sin(a0) * R]
  const p1 = [c + Math.cos(a1) * R, c + Math.sin(a1) * R]
  const f = (n: number) => n.toFixed(1)
  const d = `M${c},${c}L${f(p0[0]!)},${f(p0[1]!)}L${f(p1[0]!)},${f(p1[1]!)}Z`
  // Thin light sliver along the outer edge for a cut-stone highlight.
  const q0 = [c + Math.cos(a0) * R * 0.78, c + Math.sin(a0) * R * 0.78]
  const q1 = [c + Math.cos(a1) * R * 0.78, c + Math.sin(a1) * R * 0.78]
  const shine = `M${f(q0[0]!)},${f(q0[1]!)}L${f(p0[0]!)},${f(p0[1]!)}L${f(p1[0]!)},${f(p1[1]!)}L${f(q1[0]!)},${f(q1[1]!)}Z`
  return {
    d, shine,
    dx: +(Math.cos(mid) * 14).toFixed(1),
    dy: +(Math.sin(mid) * 14).toFixed(1),
    fill: shades[k]
  }
})

const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)

function submit() {
  errors.name = name.value.trim().length >= 2 ? '' : 'Tell us what your crew calls you.'
  errors.email = validEmail(email.value) ? '' : 'Enter a work email such as you@company.com.'
  errors.password = metCount.value === rules.length ? '' : `Fill the remaining ${rules.length - metCount.value} ${rules.length - metCount.value === 1 ? 'facet' : 'facets'} to continue.`
  errors.terms = terms.value ? '' : 'Accept the terms to create an account.'
  if (errors.name || errors.email || errors.password || errors.terms) return
  busy.value = true
  // UI demo only: nothing is sent anywhere.
  later(() => { busy.value = false; viaSso.value = ''; created.value = true }, 900)
}
function sso(label: string) {
  viaSso.value = label
  created.value = true
}
function reset() {
  created.value = false
  password.value = ''
  terms.value = false
  Object.assign(errors, { name: '', email: '', password: '', terms: '' })
}
</script>

<style scoped>
.sus {
  container-type: inline-size; display: grid; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label);
  background:
    radial-gradient(80% 50% at 100% 0%, color-mix(in srgb, var(--mi-s) 10%, transparent), transparent 70%),
    var(--mi-page);
}
.sus__in { display: grid; grid-template-rows: auto 1fr; min-height: 100%; }
.sus__bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px; padding: 18px 20px; }
.sus__brand { display: flex; align-items: center; gap: 9px; }
.sus__brand-mark { color: var(--mi-p); }
.sus__have { white-space: nowrap; }

.sus__body { display: grid; align-items: center; padding: 8px 20px 32px; }
.sus__form {
  display: grid; gap: 18px; width: 100%; max-width: 440px; margin-inline: auto;
  grid-template-areas: "head" "sso" "or" "pair" "pw" "strength" "terms" "submit";
}
.sus__head { grid-area: head; display: grid; gap: 6px; }
.sus__kicker { letter-spacing: .02em; }
.sus__sso { grid-area: sso; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.sus__sso-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px; min-width: 0; height: 42px; padding: 0 10px;
  border: 0; border-radius: var(--mi-radius-m); cursor: pointer; font: 600 13px/1 var(--mi-font); color: var(--mi-label);
  background: var(--mi-card); box-shadow: inset 0 0 0 1px var(--mi-sep), var(--mi-sh1);
  transition: transform var(--mi-dur-2) var(--mi-ease);
}
.sus__sso-btn span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sus__sso-btn:hover { transform: translateY(-1px); }
.sus__sso-btn:active { transform: translateY(0) scale(.98); }
.sus__sso-btn:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.sus__sso-mark {
  display: grid; place-items: center; flex: none; width: 20px; height: 20px; border-radius: 6px;
  font: 700 10px/1 var(--mi-font); letter-spacing: -.02em; color: var(--mi-label); background: var(--mi-fill3);
}
.sus__sso-mark--google { color: var(--mi-blue); background: color-mix(in srgb, var(--mi-blue) 14%, transparent); }
.sus__sso-mark--saml { color: var(--mi-p-text); background: var(--mi-p-tint); }

.sus__or { grid-area: or; display: flex; align-items: center; gap: 12px; color: var(--mi-label3); font-size: 12px; }
.sus__or::before, .sus__or::after { content: ""; flex: 1; height: 1px; background: var(--mi-sep); }
.sus__pair { grid-area: pair; display: grid; gap: 14px; }
.sus__pw { grid-area: pw; }

/* Strength panel */
.sus__strength {
  grid-area: strength; display: grid; grid-template-columns: 84px minmax(0, 1fr); grid-template-areas: "gem verdict" "gem rules";
  align-items: center; gap: 4px 16px; padding: 16px; border-radius: var(--mi-radius-xl);
  background:
    radial-gradient(90% 70% at 0% 0%, color-mix(in srgb, var(--mi-p) 9%, transparent), transparent 70%),
    var(--mi-card);
  box-shadow: inset 0 0 0 1px var(--mi-sep);
}
.sus__gem-wrap { grid-area: gem; position: relative; display: grid; place-items: center; aspect-ratio: 1; }
.sus__halo {
  position: absolute; inset: -6%; border-radius: 50%; opacity: 0; transform: scale(.7);
  background: radial-gradient(closest-side, color-mix(in srgb, var(--mi-p) 30%, transparent), transparent);
  transition: opacity var(--mi-dur-4) var(--mi-ease), transform var(--mi-dur-4) var(--mi-spring);
}
.sus__gem { position: relative; width: 100%; height: 100%; overflow: visible; transform: rotate(-14deg) scale(.9); transition: transform 700ms var(--mi-spring); }
.sus__strength.is-set .sus__gem { transform: rotate(0deg) scale(1); }
.sus__strength.is-set .sus__halo { opacity: 1; transform: scale(1); }
.sus__facet { transform: translate(var(--dx), var(--dy)); transition: transform 520ms var(--mi-spring); }
.sus__facet.is-met { transform: translate(0, 0); }
.sus__facet-line { fill: none; stroke: var(--mi-label3); stroke-width: 1.4; stroke-linejoin: round; stroke-dasharray: 3 4; }
.sus__facet-fill { stroke: var(--mi-card); stroke-width: 1.5; stroke-linejoin: round; opacity: 0; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.sus__facet-shine { fill: var(--mi-card); opacity: 0; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.sus__facet.is-met .sus__facet-fill { opacity: 1; }
.sus__facet.is-met .sus__facet-shine { opacity: .22; }

.sus__verdict { grid-area: verdict; display: grid; gap: 1px; align-self: end; }
.sus__rules { grid-area: rules; display: grid; gap: 5px; margin: 6px 0 0; padding: 0; list-style: none; align-self: start; }
.sus__rules li { display: flex; align-items: center; gap: 8px; font-size: 13px; line-height: 1.3; color: var(--mi-label2); }
.sus__rules li.is-met { color: var(--mi-label); }
.sus__tick {
  position: relative; display: grid; place-items: center; flex: none; width: 16px; height: 16px; border-radius: 50%;
  color: var(--mi-p-on, var(--mi-card)); box-shadow: inset 0 0 0 1.5px var(--mi-fill);
}
.sus__tick::before { content: ""; position: absolute; inset: 0; border-radius: 50%; background: var(--mi-p); opacity: 0; transform: scale(.4); transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.sus__tick :deep(svg) { position: relative; opacity: 0; transform: scale(.5); transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.sus__rules li.is-met .sus__tick::before, .sus__rules li.is-met .sus__tick :deep(svg) { opacity: 1; transform: scale(1); }

.sus__terms { grid-area: terms; display: grid; gap: 6px; }
.sus__submit { grid-area: submit; display: grid; gap: 10px; }

.sus__done { display: grid; justify-items: center; gap: 10px; width: 100%; max-width: 400px; margin-inline: auto; padding: 32px 0; }
.sus__done-glyph { display: grid; place-items: center; width: 56px; height: 56px; margin-bottom: 6px; border-radius: 18px; color: var(--mi-p-text); background: var(--mi-p-tint); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

@container (min-width: 560px) {
  .sus__bar { padding: 22px 32px; }
  .sus__pair { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .sus__form { max-width: 520px; }
  .sus__strength { grid-template-columns: 112px minmax(0, 1fr); padding: 18px 20px; }
}
@container (min-width: 860px) {
  .sus__body { padding: 8px 40px 40px; }
  .sus__form {
    max-width: 920px; column-gap: 48px; row-gap: 18px;
    grid-template-columns: minmax(0, 1fr) 300px;
    grid-template-areas: "head strength" "sso strength" "or strength" "pair strength" "pw strength" "terms strength" "submit strength";
  }
  .sus__strength {
    align-self: stretch; align-content: center; justify-items: center; text-align: center;
    grid-template-columns: minmax(0, 1fr); grid-template-areas: "gem" "verdict" "rules"; gap: 14px; padding: 32px 28px;
  }
  .sus__gem-wrap { width: 172px; margin-bottom: 6px; }
  .sus__verdict { justify-items: center; }
  .sus__rules { justify-self: stretch; gap: 9px; margin-top: 4px; padding-top: 18px; border-top: 1px solid var(--mi-sep); text-align: start; }
}
@container (min-width: 1080px) { .sus__form { column-gap: 72px; grid-template-columns: minmax(0, 1fr) 340px; } }
</style>

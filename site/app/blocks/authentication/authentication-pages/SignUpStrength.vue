<template>
  <section class="sus mi:@container mi:grid mi:min-h-full mi:font-mi mi:text-label mi:[background:radial-gradient(80%_50%_at_100%_0%,_color-mix(in_srgb,_var(--mi-s)_10%,_transparent),_transparent_70%),_var(--mi-page)]" aria-labelledby="sus-title">
    <div class="sus__in mi:grid mi:grid-rows-[auto_1fr] mi:min-h-full">
      <header class="sus__bar mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2 mi:gap-x-4 mi:py-4.5 mi:px-5 mi:@[560px]:py-5.5 mi:@[560px]:px-8">
        <div class="sus__brand mi:flex mi:items-center mi:gap-[9px]">
          <MiIcon :svg="brandGlyph" :size="22" class="sus__brand-mark mi:text-p" />
          <MiText as="span" variant="headline" weight="semibold">Tidemark</MiText>
        </div>
        <MiText as="span" variant="footnote" tone="label2" class="sus__have">
          Have an account? <MiTextLink href="#" :chevron="false">Sign in</MiTextLink>
        </MiText>
      </header>

      <div class="sus__body mi:grid mi:items-center mi:pt-2 mi:px-5 mi:pb-8 mi:@[860px]:pt-2 mi:@[860px]:px-10 mi:@[860px]:pb-10">
        <form v-if="!created" class="sus__form mi:grid mi:gap-4.5 mi:w-full mi:max-w-110 mi:mx-auto mi:[grid-template-areas:'head'_'sso'_'or'_'pair'_'pw'_'strength'_'terms'_'submit'] mi:@[560px]:max-w-130 mi:@[860px]:max-w-230 mi:@[860px]:gap-x-12 mi:@[860px]:gap-y-4.5 mi:@[860px]:grid-cols-[minmax(0,_1fr)_300px] mi:@[860px]:[grid-template-areas:'head_strength'_'sso_strength'_'or_strength'_'pair_strength'_'pw_strength'_'terms_strength'_'submit_strength'] mi:@[1080px]:gap-x-18 mi:@[1080px]:grid-cols-[minmax(0,_1fr)_340px]" novalidate @submit.prevent="submit">
          <div class="sus__head mi:[grid-area:head] mi:grid mi:gap-1.5">
            <MiText variant="caption" weight="semibold" tone="primary" class="sus__kicker">Free for teams up to 5</MiText>
            <MiText id="sus-title" as="h2" variant="title1" weight="bold" balance>Create your Tidemark account</MiText>
            <MiText variant="subheadline" tone="label2">Tide tables, crew rosters and harbour logs in one shared place.</MiText>
          </div>

          <div class="sus__sso mi:[grid-area:sso] mi:grid mi:grid-cols-3 mi:gap-2" role="group" aria-label="Sign up with a provider">
            <button v-for="p in providers" :key="p.id" type="button" class="sus__sso-btn mi:flex mi:items-center mi:justify-center mi:gap-2 mi:min-w-0 mi:h-10.5 mi:py-0 mi:px-2.5 mi:[border:0] mi:rounded-md mi:cursor-pointer mi:[font:600_13px/1_var(--mi-font)] mi:text-label mi:[background:var(--mi-card)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep),_var(--mi-sh1)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)] mi:active:transform-[translateY(0)_scale(.98)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :aria-label="`Sign up with ${p.id === 'saml' ? 'SAML single sign-on' : p.label}`" @click="sso(p.label)">
              <span class="sus__sso-mark mi:[.sus__sso-btn_span&:last-child]:text-ellipsis mi:[.sus__sso-btn_span&:last-child]:whitespace-nowrap mi:grid mi:place-items-center mi:flex-[none] mi:w-5 mi:h-5 mi:rounded-[6px] mi:[font:700_10px/1_var(--mi-font)] mi:tracking-[-.02em] mi:text-label mi:[background:var(--mi-fill3)]" :class="'sus__sso-mark--' + p.id" aria-hidden="true">
                <MiIcon class="mi:[.sus__sso-btn_span&:last-child]:text-ellipsis mi:[.sus__sso-btn_span&:last-child]:whitespace-nowrap" v-if="p.id === 'saml'" name="lock" :size="13" :weight="2.2" />
                <template v-else>{{ p.mark }}</template>
              </span>
              <span class="mi:[.sus__sso-btn_span&:last-child]:text-ellipsis mi:[.sus__sso-btn_span&:last-child]:whitespace-nowrap">{{ p.label }}</span>
            </button>
          </div>

          <div class="sus__or mi:[grid-area:or] mi:flex mi:items-center mi:gap-3 mi:text-label3 mi:text-[12px] mi:before:content-[''] mi:before:flex-1 mi:before:h-px mi:before:[background:var(--mi-sep)] mi:after:content-[''] mi:after:flex-1 mi:after:h-px mi:after:[background:var(--mi-sep)]"><span>or with your work email</span></div>

          <div class="sus__pair mi:[grid-area:pair] mi:grid mi:gap-3.5 mi:@[560px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)]">
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

          <MiField label="Password" :error="errors.password" class="sus__pw mi:[grid-area:pw]">
            <template #default="{ id, describedBy }">
              <MiInput
                :id="id" v-model="password" type="password" autocomplete="new-password"
                :aria-describedby="[describedBy, 'sus-rules'].filter(Boolean).join(' ')"
              />
            </template>
          </MiField>

          <!-- Strength as a shape: each rule is one facet that slides into place and fills. -->
          <div class="sus__strength mi:[grid-area:strength] mi:grid mi:grid-cols-[84px_minmax(0,_1fr)] mi:[grid-template-areas:'gem_verdict'_'gem_rules'] mi:items-center mi:gap-y-1 mi:gap-x-4 mi:p-4 mi:rounded-xl mi:[background:radial-gradient(90%_70%_at_0%_0%,_color-mix(in_srgb,_var(--mi-p)_9%,_transparent),_transparent_70%),_var(--mi-card)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:@[560px]:grid-cols-[112px_minmax(0,_1fr)] mi:@[560px]:py-4.5 mi:@[560px]:px-5 mi:@[860px]:self-stretch mi:@[860px]:content-center mi:@[860px]:justify-items-center mi:@[860px]:text-center mi:@[860px]:grid-cols-[minmax(0,_1fr)] mi:@[860px]:[grid-template-areas:'gem'_'verdict'_'rules'] mi:@[860px]:gap-3.5 mi:@[860px]:py-8 mi:@[860px]:px-7" :class="{ 'is-set': metCount === rules.length }">
            <div
              class="sus__gem-wrap mi:[grid-area:gem] mi:relative mi:grid mi:place-items-center mi:aspect-[1] mi:@[860px]:w-43 mi:@[860px]:mb-1.5" role="meter" aria-label="Password strength" :aria-valuenow="metCount"
              aria-valuemin="0" :aria-valuemax="rules.length" :aria-valuetext="`${verdict}, ${metCount} of ${rules.length} rules met`"
            >
              <span class="sus__halo mi:absolute mi:inset-[-6%] mi:rounded-[50%] mi:opacity-0 mi:transform-[scale(.7)] mi:[background:radial-gradient(closest-side,_color-mix(in_srgb,_var(--mi-p)_30%,_transparent),_transparent)] mi:[transition:opacity_var(--mi-dur-4)_var(--mi-ease),_transform_var(--mi-dur-4)_var(--mi-spring)]" aria-hidden="true" />
              <svg class="sus__gem mi:relative mi:w-full mi:h-full mi:overflow-visible mi:transform-[rotate(-14deg)_scale(.9)] mi:[transition:transform_700ms_var(--mi-spring)]" viewBox="0 0 200 200" aria-hidden="true">
                <g v-for="(f, i) in facets" :key="i" class="sus__facet mi:transform-[translate(var(--dx),_var(--dy))] mi:[transition:transform_520ms_var(--mi-spring)] mi:[&.is-met]:transform-[translate(0,_0)]" :class="{ 'is-met': checks[i] }" :style="{ '--dx': f.dx + 'px', '--dy': f.dy + 'px' }">
                  <path :d="f.d" class="sus__facet-line mi:fill-[color:none] mi:stroke-label3 mi:[stroke-width:1.4] mi:[stroke-linejoin:round] mi:[stroke-dasharray:3_4]" />
                  <path :d="f.d" class="sus__facet-fill mi:stroke-card mi:[stroke-width:1.5] mi:[stroke-linejoin:round] mi:opacity-0 mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" :style="{ fill: f.fill }" />
                  <path :d="f.shine" class="sus__facet-shine mi:fill-card mi:opacity-0 mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" />
                </g>
              </svg>
            </div>
            <div class="sus__verdict mi:[grid-area:verdict] mi:grid mi:gap-px mi:self-end mi:@[860px]:justify-items-center" aria-live="polite">
              <MiText as="span" variant="headline" weight="semibold">{{ verdict }}</MiText>
              <MiText as="span" variant="caption" tone="label2" tabular>{{ metCount }} of {{ rules.length }} facets</MiText>
            </div>
            <ul id="sus-rules" class="sus__rules mi:[grid-area:rules] mi:grid mi:gap-[5px] mi:mt-1.5 mi:mx-0 mi:mb-0 mi:p-0 mi:[list-style:none] mi:self-start mi:@[860px]:justify-self-stretch mi:@[860px]:gap-[9px] mi:@[860px]:mt-1 mi:@[860px]:pt-4.5 mi:@[860px]:border-t mi:@[860px]:border-t-sep mi:@[860px]:text-start" aria-label="Password rules">
              <li class="mi:[.sus__rules_li&]:items-center mi:[.sus__rules_li&]:gap-2 mi:[.sus__rules_li&]:text-[13px] mi:[.sus__rules_li&]:leading-[1.3] mi:[.sus__rules_li&]:text-label2" v-for="(r, i) in rules" :key="r.id" :class="{ 'is-met': checks[i] }">
                <span class="sus__tick mi:relative mi:grid mi:place-items-center mi:flex-[none] mi:w-4 mi:h-4 mi:rounded-[50%] mi:text-[color:var(--mi-p-on,_var(--mi-card))] mi:shadow-[inset_0_0_0_1.5px_var(--mi-fill)] mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[50%] mi:before:[background:var(--mi-p)] mi:before:opacity-0 mi:before:transform-[scale(.4)] mi:before:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)] mi:[.sus__rules_li.is-met_&]:before:opacity-100 mi:[.sus__rules_li.is-met_&]:before:transform-[scale(1)]" aria-hidden="true"><MiIcon class="mi:[.sus__rules_li&]:items-center mi:[.sus__rules_li&]:gap-2 mi:[.sus__rules_li&]:text-[13px] mi:[.sus__rules_li&]:leading-[1.3] mi:[.sus__rules_li&]:text-label2" name="check" :size="11" :weight="3" /></span>
                <span>{{ r.label }}</span>
                <span class="sr-only mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip:rect(0_0_0_0)] mi:whitespace-nowrap">{{ checks[i] ? 'met' : 'not met' }}</span>
              </li>
            </ul>
          </div>

          <div class="sus__terms mi:[grid-area:terms] mi:grid mi:gap-1.5">
            <MiCheckbox v-model="terms">
              I agree to the <MiTextLink href="#" :chevron="false">Terms</MiTextLink> and <MiTextLink href="#" :chevron="false">Privacy notice</MiTextLink>
            </MiCheckbox>
            <MiText v-if="errors.terms" variant="footnote" tone="red" weight="medium" role="alert">{{ errors.terms }}</MiText>
          </div>

          <div class="sus__submit mi:[grid-area:submit] mi:grid mi:gap-2.5">
            <MiButton type="submit" size="large" block :loading="busy">Create account</MiButton>
            <MiText variant="caption" tone="label3" align="center">No card needed. Invite your crew after setup.</MiText>
          </div>
        </form>

        <div v-else class="sus__done mi:grid mi:justify-items-center mi:gap-2.5 mi:w-full mi:max-w-100 mi:mx-auto mi:py-8 mi:px-0" aria-live="polite">
          <span class="sus__done-glyph mi:grid mi:place-items-center mi:w-14 mi:h-14 mi:mb-1.5 mi:rounded-[18px] mi:text-p-text mi:[background:var(--mi-p-tint)]" aria-hidden="true"><MiIcon :svg="envelope" :size="26" /></span>
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
.sus__have { white-space: nowrap; }
.sus__kicker { letter-spacing: .02em; }
.sus__sso-btn span:last-child { overflow: hidden; }
.sus__sso-mark--google { color: var(--mi-blue); background: color-mix(in srgb, var(--mi-blue) 14%, transparent); }
.sus__sso-mark--saml { color: var(--mi-p-text); background: var(--mi-p-tint); }
.sus__strength.is-set .sus__gem { transform: rotate(0deg) scale(1); }
.sus__strength.is-set .sus__halo { opacity: 1; transform: scale(1); }
.sus__facet.is-met .sus__facet-fill { opacity: 1; }
.sus__facet.is-met .sus__facet-shine { opacity: .22; }
.sus__rules li { display: flex; }
.sus__rules li.is-met { color: var(--mi-label); }
.sus__tick :deep(svg) { position: relative; opacity: 0; transform: scale(.5); transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.sus__rules li.is-met .sus__tick :deep(svg) { opacity: 1; transform: scale(1); }
</style>

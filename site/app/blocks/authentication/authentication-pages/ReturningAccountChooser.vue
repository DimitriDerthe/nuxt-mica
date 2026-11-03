<template>
  <section class="mi:@container mi:grid mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]" aria-labelledby="rac-title">
    <div class="mi:grid mi:grid-rows-[1fr_auto] mi:@[900px]:grid-cols-[minmax(0,_1fr)_340px] mi:@[900px]:grid-rows-[none] mi:@[900px]:min-h-full mi:@[1100px]:grid-cols-[minmax(0,_1fr)_380px]">
      <div class="mi:grid mi:grid-rows-[auto_1fr_auto] mi:gap-7 mi:pt-5.5 mi:px-4.5 mi:pb-6.5 mi:@[520px]:pt-6.5 mi:@[520px]:px-8 mi:@[520px]:pb-7.5 mi:@[900px]:pt-7.5 mi:@[900px]:px-12 mi:@[900px]:pb-7.5 mi:@[1100px]:px-18">
        <div class="mi:flex mi:items-center mi:gap-[9px]">
          <MiIcon :svg="brandGlyph" :size="22" class="mi:text-p" />
          <MiText as="span" variant="headline" weight="semibold">Quayside</MiText>
        </div>

        <div class="mi:grid mi:content-center mi:gap-4.5 mi:w-full mi:max-w-140 mi:justify-self-center">
          <div class="mi:grid mi:gap-1.5">
            <MiText id="rac-title" as="h2" variant="title1" weight="bold" balance>Welcome back</MiText>
            <MiText variant="subheadline" tone="label2">Pick an account saved on this device.</MiText>
          </div>

          <ul class="mi:grid mi:gap-2.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[520px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)]" aria-label="Saved accounts">
            <li v-for="a in accounts" :key="a.id" class="mi:bg-card mi:relative mi:rounded-xl mi:shadow-[inset_0_0_0_1px_var(--mi-sep),_var(--mi-sh1)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:after:pointer-events-none mi:after:shadow-[inset_0_0_0_2px_var(--mi-p),_0_0_0_4px_color-mix(in_srgb,_var(--mi-p)_16%,_transparent)] mi:after:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)]" :class="selected === a.id ? 'mi:group mi:after:opacity-100' : 'mi:group mi:after:opacity-0'">
              <button type="button" class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:items-center mi:gap-y-1 mi:gap-x-3 mi:w-full mi:pt-3.5 mi:pr-11 mi:pb-3.5 mi:pl-3.5 mi:[border:0] mi:rounded-[inherit] mi:text-start mi:cursor-pointer mi:[font:inherit] mi:text-inherit mi:[background:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[3px] mi:@[520px]:grid-cols-[minmax(0,_1fr)] mi:@[520px]:content-start mi:@[520px]:gap-2.5 mi:@[520px]:h-full mi:@[520px]:pt-4 mi:@[520px]:px-4 mi:@[520px]:pb-11.5" :aria-pressed="selected === a.id" @click="choose(a.id)">
                <MiAvatar :name="a.name" size="md" :tone="a.tone" decorative />
                <span class="mi:grid mi:gap-px mi:min-w-0">
                  <span class="mi:text-[15px] mi:font-semibold mi:tracking-[-.01em]">{{ a.name }}</span>
                  <span class="mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[13px] mi:text-label2">{{ a.email }}</span>
                </span>
                <span class="mi:col-[2] mi:flex mi:flex-wrap mi:items-center mi:gap-y-1 mi:gap-x-3 mi:mt-1.5 mi:text-[12px] mi:text-label2 mi:@[520px]:col-[1] mi:@[520px]:mt-0">
                  <span class="mi:inline-flex mi:items-center mi:gap-1.5 mi:font-medium mi:text-label"><span class="mi:w-[7px] mi:h-[7px] mi:rounded-[2px]" :style="{ background: a.color }" />{{ a.workspace }}</span>
                  <span class="mi:tabular-nums">{{ a.lastSeen }}</span>
                </span>
              </button>
              <span class="mi:flex mi:flex-wrap mi:gap-1.5 mi:-mt-1 mi:pt-0 mi:pr-3.5 mi:pb-3.5 mi:pl-17.5 mi:pointer-events-none mi:@[520px]:absolute mi:@[520px]:right-3.5 mi:@[520px]:bottom-3.5 mi:@[520px]:m-0 mi:@[520px]:p-0">
                <MiBadge v-if="a.id === accounts[0]?.id" tone="primary" label="Last used" />
                <MiBadge v-if="a.method === 'sso'" tone="neutral" variant="outline" :label="a.provider + ' SSO'" />
                <MiBadge v-if="a.method === 'passkey'" tone="success" label="Passkey" />
                <MiBadge v-if="a.method === 'password'" tone="neutral" label="Password" />
              </span>
              <MiIconButton :label="`Remove ${a.email} from this device`" variant="plain" size="small" class="mi:absolute! mi:top-2 mi:right-2 mi:opacity-55 mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)]! mi:group-hover:opacity-100 mi:focus-visible:opacity-100" @click="remove(a.id)">
                <MiIcon name="close" :size="14" />
              </MiIconButton>
            </li>
            <li class="mi:relative mi:rounded-xl mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:after:pointer-events-none mi:after:shadow-[inset_0_0_0_2px_var(--mi-p),_0_0_0_4px_color-mix(in_srgb,_var(--mi-p)_16%,_transparent)] mi:after:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)] mi:bg-transparent mi:shadow-none mi:[outline:1.5px_dashed_var(--mi-fill)] mi:outline-offset-[-1.5px]" :class="selected === 'other' ? 'mi:after:opacity-100' : 'mi:after:opacity-0'">
              <button type="button" class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:items-center mi:gap-y-1 mi:gap-x-3 mi:w-full mi:pt-3.5 mi:pr-3.5 mi:pb-3.5 mi:pl-3.5 mi:[border:0] mi:rounded-[inherit] mi:text-start mi:cursor-pointer mi:[font:inherit] mi:text-inherit mi:[background:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[3px] mi:@[520px]:grid-cols-[minmax(0,_1fr)] mi:@[520px]:content-center mi:@[520px]:justify-items-start mi:@[520px]:gap-2.5 mi:@[520px]:h-full mi:@[520px]:pt-4 mi:@[520px]:px-4 mi:@[520px]:pb-4 mi:@[520px]:pr-3.5" :aria-pressed="selected === 'other'" @click="choose('other')">
                <span class="mi:grid mi:place-items-center mi:w-11 mi:h-11 mi:rounded-[50%] mi:text-label2 mi:[background:var(--mi-fill4)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]" aria-hidden="true"><MiIcon name="plus" :size="18" /></span>
                <span class="mi:grid mi:gap-px mi:min-w-0">
                  <span class="mi:text-[15px] mi:font-semibold mi:tracking-[-.01em]">Use another account</span>
                  <span class="mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[13px] mi:text-label2">Email, SSO or an invite link</span>
                </span>
              </button>
            </li>
          </ul>

          <div class="mi:empty:hidden" aria-live="polite">
            <MiText v-if="removed" variant="footnote" tone="label2" class="mi:flex mi:flex-wrap mi:items-center mi:gap-1.5">
              {{ removed.email }} was removed from this device.
              <button type="button" class="mi:py-0.5 mi:px-1 mi:[border:0] mi:rounded-[6px] mi:cursor-pointer mi:[font:600_13px/1.2_var(--mi-font)] mi:text-p-text mi:[background:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)]" @click="undo">Undo</button>
            </MiText>
          </div>

          <!-- Continue area: the sign-in method follows the chosen account. -->
          <div class="mi:min-h-13">
            <template v-if="signedIn">
              <MiAlert tone="success" :title="`Signed in to ${current?.workspace ?? 'Quayside'}`" message="Picking up where you left off on the berth plan." />
            </template>
            <form v-else-if="selected === 'other'" class="mi:grid mi:gap-3" novalidate @submit.prevent="continueOther">
              <MiField label="Work email" :error="otherError">
                <template #default="{ id, describedBy }">
                  <MiInput :id="id" v-model="otherEmail" type="email" autocomplete="username" :aria-describedby="describedBy" placeholder="you@port-authority.com" />
                </template>
              </MiField>
              <MiButton type="submit" size="large" block :loading="busy">Continue</MiButton>
            </form>
            <form v-else-if="current?.method === 'password'" class="mi:grid mi:gap-3" novalidate @submit.prevent="continueAs">
              <MiField :label="`Password for ${current.email}`" :error="pwError">
                <template #label-end><MiTextLink href="#" :chevron="false">Forgot?</MiTextLink></template>
                <template #default="{ id, describedBy }">
                  <MiInput :id="id" v-model="password" type="password" autocomplete="current-password" :aria-describedby="describedBy" />
                </template>
              </MiField>
              <MiButton type="submit" size="large" block :loading="busy">Continue as {{ firstName }}</MiButton>
            </form>
            <div v-else-if="current" class="mi:grid mi:gap-3">
              <MiButton size="large" block :loading="busy" @click="continueAs">
                <template #leading><MiIcon :svg="current.method === 'sso' ? keyGlyph : fingerprint" :size="18" /></template>
                {{ current.method === 'sso' ? `Continue with ${current.provider}` : `Continue as ${firstName}` }}
              </MiButton>
              <MiText variant="caption" tone="label2" align="center">
                {{ current.method === 'sso' ? `${current.workspace} signs you in through ${current.provider}.` : 'Touch ID or your security key, no password needed.' }}
              </MiText>
            </div>
          </div>
        </div>

        <MiText variant="caption" tone="label3" class="mi:justify-self-center mi:text-center">
          On a shared computer? <MiTextLink href="#" :chevron="false">Forget all accounts</MiTextLink>
        </MiText>
      </div>

      <!-- Changelog scoped to the chosen account's last visit. -->
      <aside class="mi:grid mi:content-start mi:gap-4 mi:pt-6 mi:px-4.5 mi:pb-7 mi:border-t mi:border-t-sep mi:[background:radial-gradient(90%_40%_at_100%_0%,_color-mix(in_srgb,_var(--mi-p)_10%,_transparent),_transparent_70%),_var(--mi-fill4)] mi:@[520px]:pt-6.5 mi:@[520px]:px-8 mi:@[520px]:pb-7.5 mi:@[900px]:[border-top:0] mi:@[900px]:border-l mi:@[900px]:border-l-sep mi:@[900px]:py-7.5 mi:@[900px]:px-7 mi:@[900px]:content-center" aria-labelledby="rac-news-title">
        <div class="mi:grid mi:gap-[3px]">
          <MiText id="rac-news-title" as="h3" variant="headline" weight="semibold">What changed since you left</MiText>
          <MiText variant="footnote" tone="label2" aria-live="polite">
            <template v-if="sinceLabel">Since {{ sinceLabel }} · <span class="mi:tabular-nums">{{ news.length }}</span> {{ news.length === 1 ? 'update' : 'updates' }}</template>
            <template v-else>The last six weeks</template>
          </MiText>
        </div>
        <TransitionGroup tag="ol" enter-active-class="mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)] mi:absolute mi:inset-x-0" enter-from-class="mi:opacity-0 mi:transform-[translateY(-8px)_scale(.98)]" leave-to-class="mi:opacity-0 mi:transform-[translateY(-8px)_scale(.98)]" move-class="mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" class="mi:relative mi:grid mi:gap-2.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[520px]:grid-cols-[repeat(auto-fill,_minmax(220px,_1fr))] mi:@[900px]:grid-cols-[minmax(0,_1fr)]">
          <li v-for="n in news" :key="n.id" class="mi:grid mi:gap-1 mi:py-3.5 mi:px-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]">
            <div class="mi:flex mi:items-center mi:justify-between mi:gap-2 mi:mb-1">
              <span class="mi:py-[3px] mi:px-2 mi:rounded-[999px] mi:text-[11px] mi:font-semibold mi:tracking-[.02em]" :class="n.kind === 'new' ? 'mi:text-p-text mi:bg-p-tint' : n.kind === 'improved' ? 'mi:text-label mi:bg-fill3' : 'mi:text-[color:var(--mi-green-t,_var(--mi-green))] mi:bg-green/14'">{{ kindLabel[n.kind] }}</span>
              <time class="mi:text-[12px] mi:text-label3 mi:tabular-nums" :datetime="n.date">{{ n.day }}</time>
            </div>
            <p class="mi:m-0 mi:text-[14px] mi:font-semibold mi:tracking-[-.01em]">{{ n.title }}</p>
            <p class="mi:m-0 mi:text-[13px] mi:leading-[1.45] mi:text-label2">{{ n.text }}</p>
          </li>
        </TransitionGroup>
        <MiTextLink href="#" class="mi:justify-self-start mi:text-[13px]!">Full changelog</MiTextLink>
      </aside>
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

type Method = 'passkey' | 'sso' | 'password'
type Kind = 'new' | 'improved' | 'fixed'
interface Account { id: string, name: string, email: string, workspace: string, color: string, tone: 'primary' | 'teal' | 'orange', lastSeen: string, lastVisit: string, method: Method, provider?: string }

const brandGlyph = '<path d="M4 17h16M6 17V9l6-4 6 4v8"/><path d="M10 17v-4h4v4"/><path d="M3 20.5c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1"/>'
const fingerprint = '<path d="M12 11v3a8 8 0 0 1-1.2 4.2"/><path d="M8.5 13.5a3.5 3.5 0 0 1 7 0V15a12 12 0 0 1-.6 3.8"/><path d="M5.6 16A9 9 0 0 1 5 13a7 7 0 0 1 12.6-4.2"/><path d="M19 12.5V14a15 15 0 0 1-.4 3.4"/><path d="M8 4.3A9.5 9.5 0 0 1 20.5 9"/>'
const keyGlyph = '<circle cx="8" cy="15" r="4"/><path d="m11 12 8.5-8.5M16 7l3 3M14 9l2 2"/>'

const saved: Account[] = [
  { id: 'hl', name: 'Maya Lindqvist', email: 'maya@harbourline.io', workspace: 'Harbourline', color: 'var(--mi-p)', tone: 'primary', lastSeen: '3 days ago', lastVisit: '2026-10-30', method: 'passkey' },
  { id: 'nw', name: 'Maya Lindqvist', email: 'm.lindqvist@northwind-ports.com', workspace: 'Northwind Ports', color: 'var(--mi-teal)', tone: 'teal', lastSeen: '15 days ago', lastVisit: '2026-10-18', method: 'sso', provider: 'Okta' },
  { id: 'ro', name: 'Rafael Ortiz', email: 'rafa.ortiz@quaymail.net', workspace: 'Ortiz Marine', color: 'var(--mi-orange)', tone: 'orange', lastSeen: 'Sep 24', lastVisit: '2026-09-24', method: 'password' }
]

const changelog: { id: string, kind: Kind, date: string, day: string, title: string, text: string }[] = [
  { id: 'c1', kind: 'new', date: '2026-11-01', day: 'Nov 1', title: 'Berth timeline', text: 'Drag vessels between berths; clashes light up before you drop.' },
  { id: 'c2', kind: 'improved', date: '2026-10-27', day: 'Oct 27', title: 'Faster manifests', text: 'Manifests over 2,000 lines now open about three times faster.' },
  { id: 'c3', kind: 'new', date: '2026-10-21', day: 'Oct 21', title: 'Shared tide alerts', text: 'Subscribe a channel to the tide window of any berth.' },
  { id: 'c4', kind: 'fixed', date: '2026-10-09', day: 'Oct 9', title: 'Night shifts on rosters', text: 'Shifts that cross midnight now stay on the day they start.' },
  { id: 'c5', kind: 'new', date: '2026-09-30', day: 'Sep 30', title: 'Passkey sign-in', text: 'Use Touch ID, Face ID or a security key instead of a password.' }
]
const kindLabel: Record<Kind, string> = { new: 'New', improved: 'Improved', fixed: 'Fixed' }

const accounts = ref<Account[]>([...saved])
const selected = ref<string>('nw')
const removed = ref<Account | null>(null)
const removedAt = ref(0)
const password = ref('')
const pwError = ref('')
const otherEmail = ref('')
const otherError = ref('')
const busy = ref(false)
const signedIn = ref(false)

const current = computed(() => accounts.value.find(a => a.id === selected.value))
const firstName = computed(() => current.value?.name.split(' ')[0] ?? '')
const news = computed(() => current.value ? changelog.filter(c => c.date > current.value!.lastVisit) : changelog)
const sinceLabel = computed(() => {
  if (!current.value) return ''
  const d = new Date(current.value.lastVisit + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

function choose(id: string) {
  selected.value = id
  signedIn.value = false
  pwError.value = ''
  otherError.value = ''
}
function remove(id: string) {
  const i = accounts.value.findIndex(a => a.id === id)
  if (i < 0) return
  removed.value = accounts.value[i]!
  removedAt.value = i
  accounts.value.splice(i, 1)
  if (selected.value === id) choose(accounts.value[0]?.id ?? 'other')
}
function undo() {
  if (!removed.value) return
  accounts.value.splice(removedAt.value, 0, removed.value)
  removed.value = null
}
function finish() {
  busy.value = true
  // UI demo only: nothing is sent anywhere.
  later(() => { busy.value = false; signedIn.value = true }, 800)
}
function continueAs() {
  if (current.value?.method === 'password') {
    pwError.value = password.value.length >= 8 ? '' : 'Enter your password (at least 8 characters).'
    if (pwError.value) return
  }
  finish()
}
function continueOther() {
  otherError.value = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(otherEmail.value) ? '' : 'Enter the email you use at work.'
  if (!otherError.value) finish()
}
</script>


<template>
  <section class="rac" aria-labelledby="rac-title">
    <div class="rac__in">
      <div class="rac__main">
        <div class="rac__brand">
          <MiIcon :svg="brandGlyph" :size="22" class="rac__brand-mark" />
          <MiText as="span" variant="headline" weight="semibold">Quayside</MiText>
        </div>

        <div class="rac__body">
          <div class="rac__head">
            <MiText id="rac-title" as="h2" variant="title1" weight="bold" balance>Welcome back</MiText>
            <MiText variant="subheadline" tone="label2">Pick an account saved on this device.</MiText>
          </div>

          <ul class="rac__accounts" aria-label="Saved accounts">
            <li v-for="a in accounts" :key="a.id" class="rac__acct" :class="{ 'is-on': selected === a.id }">
              <button type="button" class="rac__pick" :aria-pressed="selected === a.id" @click="choose(a.id)">
                <MiAvatar :name="a.name" size="md" :tone="a.tone" decorative />
                <span class="rac__who">
                  <span class="rac__name">{{ a.name }}</span>
                  <span class="rac__email">{{ a.email }}</span>
                </span>
                <span class="rac__meta">
                  <span class="rac__ws"><span class="rac__ws-dot" :style="{ background: a.color }" />{{ a.workspace }}</span>
                  <span class="rac__when">{{ a.lastSeen }}</span>
                </span>
              </button>
              <span class="rac__badges">
                <MiBadge v-if="a.id === accounts[0]?.id" tone="primary" label="Last used" />
                <MiBadge v-if="a.method === 'sso'" tone="neutral" variant="outline" :label="a.provider + ' SSO'" />
                <MiBadge v-if="a.method === 'passkey'" tone="success" label="Passkey" />
                <MiBadge v-if="a.method === 'password'" tone="neutral" label="Password" />
              </span>
              <MiIconButton :label="`Remove ${a.email} from this device`" variant="plain" size="small" class="rac__remove" @click="remove(a.id)">
                <MiIcon name="close" :size="14" />
              </MiIconButton>
            </li>
            <li class="rac__acct rac__acct--other" :class="{ 'is-on': selected === 'other' }">
              <button type="button" class="rac__pick" :aria-pressed="selected === 'other'" @click="choose('other')">
                <span class="rac__plus" aria-hidden="true"><MiIcon name="plus" :size="18" /></span>
                <span class="rac__who">
                  <span class="rac__name">Use another account</span>
                  <span class="rac__email">Email, SSO or an invite link</span>
                </span>
              </button>
            </li>
          </ul>

          <div class="rac__live" aria-live="polite">
            <MiText v-if="removed" variant="footnote" tone="label2" class="rac__undo">
              {{ removed.email }} was removed from this device.
              <button type="button" class="rac__undo-btn" @click="undo">Undo</button>
            </MiText>
          </div>

          <!-- Continue area: the sign-in method follows the chosen account. -->
          <div class="rac__go">
            <template v-if="signedIn">
              <MiAlert tone="success" :title="`Signed in to ${current?.workspace ?? 'Quayside'}`" message="Picking up where you left off on the berth plan." />
            </template>
            <form v-else-if="selected === 'other'" class="rac__form" novalidate @submit.prevent="continueOther">
              <MiField label="Work email" :error="otherError">
                <template #default="{ id, describedBy }">
                  <MiInput :id="id" v-model="otherEmail" type="email" autocomplete="username" :aria-describedby="describedBy" placeholder="you@port-authority.com" />
                </template>
              </MiField>
              <MiButton type="submit" size="large" block :loading="busy">Continue</MiButton>
            </form>
            <form v-else-if="current?.method === 'password'" class="rac__form" novalidate @submit.prevent="continueAs">
              <MiField :label="`Password for ${current.email}`" :error="pwError">
                <template #label-end><MiTextLink href="#" :chevron="false">Forgot?</MiTextLink></template>
                <template #default="{ id, describedBy }">
                  <MiInput :id="id" v-model="password" type="password" autocomplete="current-password" :aria-describedby="describedBy" />
                </template>
              </MiField>
              <MiButton type="submit" size="large" block :loading="busy">Continue as {{ firstName }}</MiButton>
            </form>
            <div v-else-if="current" class="rac__form">
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

        <MiText variant="caption" tone="label3" class="rac__foot">
          On a shared computer? <MiTextLink href="#" :chevron="false">Forget all accounts</MiTextLink>
        </MiText>
      </div>

      <!-- Changelog scoped to the chosen account's last visit. -->
      <aside class="rac__news" aria-labelledby="rac-news-title">
        <div class="rac__news-head">
          <MiText id="rac-news-title" as="h3" variant="headline" weight="semibold">What changed since you left</MiText>
          <MiText variant="footnote" tone="label2" aria-live="polite">
            <template v-if="sinceLabel">Since {{ sinceLabel }} · <span class="rac__num">{{ news.length }}</span> {{ news.length === 1 ? 'update' : 'updates' }}</template>
            <template v-else>The last six weeks</template>
          </MiText>
        </div>
        <TransitionGroup name="rac-card" tag="ol" class="rac__cards">
          <li v-for="n in news" :key="n.id" class="rac__card">
            <div class="rac__card-top">
              <span class="rac__tag" :class="'rac__tag--' + n.kind">{{ kindLabel[n.kind] }}</span>
              <time class="rac__date" :datetime="n.date">{{ n.day }}</time>
            </div>
            <p class="rac__card-title">{{ n.title }}</p>
            <p class="rac__card-text">{{ n.text }}</p>
          </li>
        </TransitionGroup>
        <MiTextLink href="#" class="rac__all">Full changelog</MiTextLink>
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

<style scoped>
.rac { container-type: inline-size; display: grid; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.rac__in { display: grid; grid-template-rows: 1fr auto; }

.rac__main { display: grid; grid-template-rows: auto 1fr auto; gap: 28px; padding: 22px 18px 26px; }
.rac__brand { display: flex; align-items: center; gap: 9px; }
.rac__brand-mark { color: var(--mi-p); }
.rac__body { display: grid; align-content: center; gap: 18px; width: 100%; max-width: 560px; justify-self: center; }
.rac__head { display: grid; gap: 6px; }

.rac__accounts { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.rac__acct {
  position: relative; border-radius: var(--mi-radius-xl); background: var(--mi-card);
  box-shadow: inset 0 0 0 1px var(--mi-sep), var(--mi-sh1);
  transition: transform var(--mi-dur-2) var(--mi-ease);
}
.rac__acct::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  box-shadow: inset 0 0 0 2px var(--mi-p), 0 0 0 4px color-mix(in srgb, var(--mi-p) 16%, transparent);
  opacity: 0; transition: opacity var(--mi-dur-2) var(--mi-ease);
}
.rac__acct.is-on::after { opacity: 1; }
.rac__acct:hover { transform: translateY(-1px); }
.rac__pick {
  display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 4px 12px; width: 100%;
  padding: 14px 44px 14px 14px; border: 0; border-radius: inherit; text-align: start; cursor: pointer; font: inherit; color: inherit; background: none;
}
.rac__pick:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 3px; }
.rac__who { display: grid; gap: 1px; min-width: 0; }
.rac__name { font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
.rac__email { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: var(--mi-label2); }
.rac__meta { grid-column: 2; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; margin-top: 6px; font-size: 12px; color: var(--mi-label2); }
.rac__ws { display: inline-flex; align-items: center; gap: 6px; font-weight: 500; color: var(--mi-label); }
.rac__ws-dot { width: 7px; height: 7px; border-radius: 2px; }
.rac__when { font-variant-numeric: tabular-nums; }
.rac__badges { display: flex; flex-wrap: wrap; gap: 6px; margin-top: -4px; padding: 0 14px 14px 70px; pointer-events: none; }
.rac__remove { position: absolute; top: 8px; right: 8px; opacity: .55; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.rac__acct:hover .rac__remove, .rac__remove:focus-visible { opacity: 1; }
.rac__acct--other { background: transparent; box-shadow: none; outline: 1.5px dashed var(--mi-fill); outline-offset: -1.5px; }
.rac__acct--other .rac__pick { padding-right: 14px; }
.rac__plus { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; color: var(--mi-label2); background: var(--mi-fill4); box-shadow: inset 0 0 0 1px var(--mi-sep); }

.rac__live:empty { display: none; }
.rac__undo { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.rac__undo-btn { padding: 2px 4px; border: 0; border-radius: 6px; cursor: pointer; font: 600 13px/1.2 var(--mi-font); color: var(--mi-p-text); background: none; }
.rac__undo-btn:focus-visible { outline: 2px solid var(--mi-p); }

.rac__go { min-height: 52px; }
.rac__form { display: grid; gap: 12px; }
.rac__foot { justify-self: center; text-align: center; }

/* Changelog panel */
.rac__news {
  display: grid; align-content: start; gap: 16px; padding: 24px 18px 28px; border-top: 1px solid var(--mi-sep);
  background:
    radial-gradient(90% 40% at 100% 0%, color-mix(in srgb, var(--mi-p) 10%, transparent), transparent 70%),
    var(--mi-fill4);
}
.rac__news-head { display: grid; gap: 3px; }
.rac__num { font-variant-numeric: tabular-nums; }
.rac__cards { position: relative; display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.rac__card { display: grid; gap: 4px; padding: 14px 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: inset 0 0 0 1px var(--mi-sep); }
.rac__card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
.rac__tag { padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: .02em; }
.rac__tag--new { color: var(--mi-p-text); background: var(--mi-p-tint); }
.rac__tag--improved { color: var(--mi-label); background: var(--mi-fill3); }
.rac__tag--fixed { color: var(--mi-green-t, var(--mi-green)); background: color-mix(in srgb, var(--mi-green) 14%, transparent); }
.rac__date { font-size: 12px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.rac__card-title { margin: 0; font-size: 14px; font-weight: 600; letter-spacing: -.01em; }
.rac__card-text { margin: 0; font-size: 13px; line-height: 1.45; color: var(--mi-label2); }
.rac__all { justify-self: start; font-size: 13px; }

.rac-card-enter-active, .rac-card-leave-active { transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.rac-card-enter-from, .rac-card-leave-to { opacity: 0; transform: translateY(-8px) scale(.98); }
.rac-card-leave-active { position: absolute; left: 0; right: 0; }
.rac-card-move { transition: transform var(--mi-dur-3) var(--mi-spring); }

@container (min-width: 520px) {
  .rac__main { padding: 26px 32px 30px; }
  .rac__accounts { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .rac__pick { grid-template-columns: minmax(0, 1fr); align-content: start; gap: 10px; height: 100%; padding: 16px 16px 46px; }
  .rac__meta { grid-column: 1; margin-top: 0; }
  .rac__acct--other .rac__pick { padding-bottom: 16px; align-content: center; justify-items: start; }
  .rac__badges { position: absolute; right: 14px; bottom: 14px; margin: 0; padding: 0; }
  .rac__news { padding: 26px 32px 30px; }
  .rac__cards { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
}
@container (min-width: 900px) {
  .rac__in { grid-template-columns: minmax(0, 1fr) 340px; grid-template-rows: none; min-height: 100%; }
  .rac__main { padding: 30px 48px 30px; }
  .rac__news { border-top: 0; border-left: 1px solid var(--mi-sep); padding: 30px 28px; align-content: center; }
  .rac__cards { grid-template-columns: minmax(0, 1fr); }
}
@container (min-width: 1100px) { .rac__in { grid-template-columns: minmax(0, 1fr) 380px; } .rac__main { padding-inline: 72px; } }
</style>

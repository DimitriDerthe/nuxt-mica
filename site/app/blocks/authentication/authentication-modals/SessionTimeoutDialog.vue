<template>
  <section class="sto" aria-labelledby="sto-title">
    <!-- Faux page behind the modal: a document with unsaved work, which is why the timeout matters. -->
    <div class="sto__page" :inert="phase === 'warning' || phase === 'expired' || undefined">
      <div class="sto__page-head">
        <div>
          <MiText id="sto-title" as="h2" variant="headline" weight="semibold">Q4 board memo</MiText>
          <MiText variant="caption" tone="label2">Finance · edited by you</MiText>
        </div>
        <MiBadge :tone="pageBadge.tone" :label="pageBadge.label" dot />
      </div>
      <div class="sto__doc">
        <p>Revenue closed the quarter at $8.4M, 6% above plan, driven by the clinic tier launch in September.</p>
        <p>Gross margin held at 71% despite the hosting migration. We propose moving the Series B timeline to Q2 and…</p>
      </div>
    </div>

    <div v-if="phase === 'warning' || phase === 'expired'" class="sto__scrim">
      <MiDialog
        :model-value="true" inline persistent variant="dialog" :close-on-action="false"
        :title="phase === 'warning' ? 'Still there?' : 'Your session expired'" :icon="phase === 'warning' ? 'warning' : 'info'"
      >
        <div v-if="phase === 'warning'" class="sto__body">
          <MiProgressRing :value="left" :max="TOTAL" :size="84" tone="secondary" label="Time before sign-out">
            <span class="sto__count" aria-hidden="true">0:{{ String(left).padStart(2, '0') }}</span>
          </MiProgressRing>
          <MiText variant="footnote" tone="label2" align="center">
            For security, Ledgerly signs you out after 30 minutes without activity. Your draft stays on this device either way.
          </MiText>
          <p class="sto__sr" aria-live="assertive">{{ announce }}</p>
        </div>

        <form v-else id="sto-form" class="sto__body sto__form" novalidate @submit.prevent="signIn">
          <MiText variant="footnote" tone="label2">Sign in again to keep editing. Your unsaved changes to “Q4 board memo” are kept.</MiText>
          <MiField label="Password for ines@fernhill.health" :error="error">
            <template #default="{ id, describedBy }">
              <MiInput :id="id" v-model="password" type="password" autocomplete="current-password" :aria-describedby="describedBy" @update:model-value="error = ''" />
            </template>
          </MiField>
          <MiText variant="caption" tone="label3">Sample password: <span class="sto__mono">evergreen</span></MiText>
        </form>

        <template #actions>
          <div class="sto__actions">
            <template v-if="phase === 'warning'">
              <MiButton block @click="stay">Stay signed in</MiButton>
              <MiButton variant="plain" block @click="signOut">Sign out now</MiButton>
            </template>
            <template v-else>
              <MiButton type="submit" form="sto-form" block>Sign in and keep editing</MiButton>
              <MiButton variant="plain" block @click="signOut">Use a different account</MiButton>
            </template>
          </div>
        </template>
      </MiDialog>
    </div>
    <div v-else class="sto__reopen">
      <MiButton variant="tinted" size="small" @click="start">Simulate the timeout again</MiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type Phase = 'warning' | 'expired' | 'active' | 'signedOut'

// Demo countdown in seconds; a real app would start it after 29 idle minutes.
const TOTAL = 45
const phase = ref<Phase>('warning')
const left = ref(TOTAL)
const password = ref('')
const error = ref('')

let timer: ReturnType<typeof setInterval> | undefined
function stop () { clearInterval(timer); timer = undefined }
function start () {
  stop()
  phase.value = 'warning'
  left.value = TOTAL
  timer = setInterval(() => {
    left.value -= 1
    if (left.value <= 0) { stop(); phase.value = 'expired' }
  }, 1000)
}
onMounted(start)
onBeforeUnmount(stop)

// Announce only at a few marks so screen readers aren't flooded every second.
const announce = computed(() => ([30, 10].includes(left.value) ? `${left.value} seconds before you are signed out` : ''))

function stay () { stop(); phase.value = 'active' }
function signOut () { stop(); phase.value = 'signedOut' }
function signIn () {
  if (!password.value) { error.value = 'Enter your password to continue.'; return }
  if (password.value !== 'evergreen') { error.value = 'Incorrect password. Try again or reset it from the sign-in page.'; return }
  password.value = ''
  phase.value = 'active'
}

const pageBadge = computed(() => ({
  warning: { tone: 'warning', label: 'Idle 29 min' },
  expired: { tone: 'danger', label: 'Signed out · draft kept' },
  active: { tone: 'success', label: 'Session renewed' },
  signedOut: { tone: 'neutral', label: 'Signed out · draft kept' }
} as const)[phase.value])
</script>

<style scoped>
.sto { container-type: inline-size; position: relative; display: grid; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); }
.sto__sr { position: absolute; width: 1px; height: 1px; margin: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.sto__page { display: grid; align-content: start; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.sto__page-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.sto__doc { display: grid; gap: 12px; max-width: 62ch; font-size: 15px; line-height: 1.6; color: var(--mi-label2); }
.sto__doc p { margin: 0; }

.sto__scrim {
  position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr); place-items: center; padding: 16px; border-radius: var(--mi-radius-xl);
  background: color-mix(in srgb, var(--mi-scrim) 85%, transparent); overflow: auto;
  -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
}
.sto__body { display: grid; gap: 12px; justify-items: center; }
.sto__form { justify-items: stretch; text-align: start; }
.sto__count { font-size: 20px; font-weight: 700; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.sto__mono { padding: 1px 6px; border-radius: 6px; background: var(--mi-fill3); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.sto__actions { display: grid; gap: 8px; width: 100%; }
.sto__reopen { position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%); }
</style>

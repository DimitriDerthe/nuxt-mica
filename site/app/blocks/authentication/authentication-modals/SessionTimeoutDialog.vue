<template>
  <section class="mi:@container mi:relative mi:grid mi:content-start mi:min-h-full mi:font-mi mi:text-label" aria-labelledby="sto-title">
    <!-- Faux page behind the modal: a document with unsaved work, which is why the timeout matters. -->
    <div class="mi:grid mi:content-start mi:gap-4 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1" :inert="phase === 'warning' || phase === 'expired' || undefined">
      <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
        <div>
          <MiText id="sto-title" as="h2" variant="headline" weight="semibold">Q4 board memo</MiText>
          <MiText variant="caption" tone="label2">Finance · edited by you</MiText>
        </div>
        <MiBadge :tone="pageBadge.tone" :label="pageBadge.label" dot />
      </div>
      <div class="mi:grid mi:gap-3 mi:max-w-[62ch] mi:text-[15px] mi:leading-[1.6] mi:text-label2">
        <p class="mi:m-0">Revenue closed the quarter at $8.4M, 6% above plan, driven by the clinic tier launch in September.</p>
        <p class="mi:m-0">Gross margin held at 71% despite the hosting migration. We propose moving the Series B timeline to Q2 and…</p>
      </div>
    </div>

    <div v-if="phase === 'warning' || phase === 'expired'" class="mi:[-webkit-backdrop-filter:blur(3px)] mi:[backdrop-filter:blur(3px)] mi:absolute mi:inset-0 mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:place-items-center mi:p-4 mi:rounded-xl mi:[background:color-mix(in_srgb,_var(--mi-scrim)_85%,_transparent)] mi:overflow-auto">
      <MiDialog
        :model-value="true" inline persistent variant="dialog" :close-on-action="false"
        :title="phase === 'warning' ? 'Still there?' : 'Your session expired'" :icon="phase === 'warning' ? 'warning' : 'info'"
      >
        <div v-if="phase === 'warning'" class="mi:grid mi:gap-3 mi:justify-items-center">
          <MiProgressRing :value="left" :max="TOTAL" :size="84" tone="secondary" label="Time before sign-out">
            <span class="mi:text-[20px] mi:font-bold mi:tracking-[-.02em] mi:tabular-nums" aria-hidden="true">0:{{ String(left).padStart(2, '0') }}</span>
          </MiProgressRing>
          <MiText variant="footnote" tone="label2" align="center">
            For security, Ledgerly signs you out after 30 minutes without activity. Your draft stays on this device either way.
          </MiText>
          <p class="mi:absolute mi:w-px mi:h-px mi:m-0 mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" aria-live="assertive">{{ announce }}</p>
        </div>

        <form v-else id="sto-form" class="mi:grid mi:gap-3 mi:justify-items-stretch mi:text-start" novalidate @submit.prevent="signIn">
          <MiText variant="footnote" tone="label2">Sign in again to keep editing. Your unsaved changes to “Q4 board memo” are kept.</MiText>
          <MiField label="Password for ines@fernhill.health" :error="error">
            <template #default="{ id, describedBy }">
              <MiInput :id="id" v-model="password" type="password" autocomplete="current-password" :aria-describedby="describedBy" @update:model-value="error = ''" />
            </template>
          </MiField>
          <MiText variant="caption" tone="label3">Sample password: <span class="mi:py-px mi:px-1.5 mi:rounded-[6px] mi:bg-fill3 mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace]">evergreen</span></MiText>
        </form>

        <template #actions>
          <div class="mi:grid mi:gap-2 mi:w-full">
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
    <div v-else class="mi:absolute mi:left-1/2 mi:bottom-4.5 mi:transform-[translateX(-50%)]">
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


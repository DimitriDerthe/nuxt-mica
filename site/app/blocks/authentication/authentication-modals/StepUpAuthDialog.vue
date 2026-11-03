<template>
  <section class="mi:@container mi:relative mi:grid mi:content-start mi:min-h-full mi:font-mi mi:text-label" aria-labelledby="sua-title">
    <!-- Faux page behind the modal: the API keys screen that asked for re-authentication. -->
    <div class="mi:grid mi:content-start mi:gap-3.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1" :inert="open || undefined">
      <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
        <div>
          <MiText id="sua-title" as="h2" variant="headline" weight="semibold">API keys</MiText>
          <MiText variant="caption" tone="label2">Harbor Freight Ops · Production</MiText>
        </div>
        <MiBadge v-if="elevated" tone="success" label="Elevated for 10 min" dot />
      </div>
      <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
        <li v-for="k in keys" :key="k.name" class="mi:flex mi:items-center mi:justify-between mi:gap-3 mi:py-3 mi:px-0 mi:border-t mi:border-t-sep">
          <div class="mi:grid mi:gap-0.5 mi:min-w-0">
            <MiText variant="subheadline" weight="semibold">{{ k.name }}</MiText>
            <code class="mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:[font:500_12px/1.4_ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-label2">{{ elevated && k.reveal ? k.reveal : k.masked }}</code>
          </div>
          <MiButton v-if="k.reveal" variant="gray" size="small" :disabled="elevated" @click="open = true">{{ elevated ? 'Revealed' : 'Reveal' }}</MiButton>
          <MiText v-else variant="caption" tone="label3">{{ k.used }}</MiText>
        </li>
      </ul>
    </div>

    <div v-if="open" class="mi:[-webkit-backdrop-filter:blur(3px)] mi:[backdrop-filter:blur(3px)] mi:absolute mi:inset-0 mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:place-items-center mi:p-4 mi:rounded-xl mi:[background:color-mix(in_srgb,_var(--mi-scrim)_85%,_transparent)] mi:overflow-auto">
      <MiDialog v-model="open" inline variant="dialog" title="Confirm it's you" :close-on-action="false">
        <template #icon><MiIcon name="lock" :size="24" /></template>
        <div class="mi:grid mi:gap-3.5 mi:text-start">
          <MiText variant="footnote" tone="label2">
            Revealing <strong>Production · ingest</strong> needs a fresh sign-in. You won't be asked again for 10 minutes.
          </MiText>
          <form id="sua-form" class="mi:grid mi:gap-2" novalidate @submit.prevent="confirm">
            <MiField label="Password for maya.chen@harborops.io" :error="error">
              <template #default="{ id, describedBy }">
                <MiInput :id="id" v-model="password" type="password" autocomplete="current-password" :aria-describedby="describedBy" @update:model-value="error = ''" />
              </template>
            </MiField>
            <MiText variant="caption" tone="label3">Sample password: <span class="mi:py-px mi:px-1.5 mi:rounded-[6px] mi:bg-fill3 mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace]">tidewater</span></MiText>
          </form>
        </div>
        <template #actions="{ close }">
          <div class="mi:grid mi:gap-2 mi:w-full">
            <MiButton type="submit" form="sua-form" block :loading="busy">Confirm and reveal</MiButton>
            <MiButton variant="gray" block @click="usePasskey">
              <template #leading><MiIcon :svg="fingerprint" :size="16" /></template>
              Use passkey instead
            </MiButton>
            <MiButton variant="plain" block @click="close">Cancel</MiButton>
          </div>
        </template>
      </MiDialog>
    </div>
    <div v-else class="mi:absolute mi:left-1/2 mi:bottom-4.5 mi:transform-[translateX(-50%)]">
      <MiButton v-if="!elevated" variant="tinted" size="small" @click="open = true">Show the dialog again</MiButton>
      <MiButton v-else variant="tinted" size="small" @click="reset">Reset the demo</MiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const fingerprint = '<path d="M12 11v3a8 8 0 0 1-1.2 4.2"/><path d="M8.5 13.5a3.5 3.5 0 0 1 7 0V15a12 12 0 0 1-.6 3.8"/><path d="M5.6 16A9 9 0 0 1 5 13a7 7 0 0 1 12.6-4.2"/><path d="M19 12.5V14a15 15 0 0 1-.4 3.4"/><path d="M8 4.3A9.5 9.5 0 0 1 20.5 9"/>'

// Fake keys for the backdrop; nothing here is a real credential.
const keys = [
  { name: 'Production · ingest', masked: 'hfo_live_••••••••••••7Qx2', reveal: 'hfo_live_sample_3k9TzL0aW7Qx2', used: '' },
  { name: 'Staging · webhooks', masked: 'hfo_test_••••••••••••m81c', reveal: '', used: 'Used 2 h ago' },
  { name: 'Analytics export', masked: 'hfo_live_••••••••••••p0Ve', reveal: '', used: 'Never used' }
]

const open = ref(true)
const password = ref('')
const error = ref('')
const busy = ref(false)
const elevated = ref(false)

let timer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(timer))

function finish() { busy.value = false; elevated.value = true; open.value = false }
function confirm() {
  if (!password.value) { error.value = 'Enter your password to continue.'; return }
  busy.value = true
  timer = setTimeout(() => {
    if (password.value !== 'tidewater') { busy.value = false; error.value = 'Incorrect password. 4 attempts left before a 15-minute lock.'; return }
    finish()
  }, 650)
}
function usePasskey() { busy.value = true; timer = setTimeout(finish, 900) }
function reset() { elevated.value = false; password.value = ''; error.value = ''; open.value = true }
</script>


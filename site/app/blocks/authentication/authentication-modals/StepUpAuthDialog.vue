<template>
  <section class="sua" aria-labelledby="sua-title">
    <!-- Faux page behind the modal: the API keys screen that asked for re-authentication. -->
    <div class="sua__page" :inert="open || undefined">
      <div class="sua__page-head">
        <div>
          <MiText id="sua-title" as="h2" variant="headline" weight="semibold">API keys</MiText>
          <MiText variant="caption" tone="label2">Harbor Freight Ops · Production</MiText>
        </div>
        <MiBadge v-if="elevated" tone="success" label="Elevated for 10 min" dot />
      </div>
      <ul class="sua__keys">
        <li v-for="k in keys" :key="k.name" class="sua__key">
          <div class="sua__key-text">
            <MiText variant="subheadline" weight="semibold">{{ k.name }}</MiText>
            <code class="sua__secret">{{ elevated && k.reveal ? k.reveal : k.masked }}</code>
          </div>
          <MiButton v-if="k.reveal" variant="gray" size="small" :disabled="elevated" @click="open = true">{{ elevated ? 'Revealed' : 'Reveal' }}</MiButton>
          <MiText v-else variant="caption" tone="label3">{{ k.used }}</MiText>
        </li>
      </ul>
    </div>

    <div v-if="open" class="sua__scrim">
      <MiDialog v-model="open" inline variant="dialog" title="Confirm it's you" :close-on-action="false">
        <template #icon><MiIcon name="lock" :size="24" /></template>
        <div class="sua__body">
          <MiText variant="footnote" tone="label2">
            Revealing <strong>Production · ingest</strong> needs a fresh sign-in. You won't be asked again for 10 minutes.
          </MiText>
          <form id="sua-form" class="sua__form" novalidate @submit.prevent="confirm">
            <MiField label="Password for maya.chen@harborops.io" :error="error">
              <template #default="{ id, describedBy }">
                <MiInput :id="id" v-model="password" type="password" autocomplete="current-password" :aria-describedby="describedBy" @update:model-value="error = ''" />
              </template>
            </MiField>
            <MiText variant="caption" tone="label3">Sample password: <span class="sua__sample">tidewater</span></MiText>
          </form>
        </div>
        <template #actions="{ close }">
          <div class="sua__actions">
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
    <div v-else class="sua__reopen">
      <MiButton v-if="!elevated" variant="tinted" size="small" @click="open = true">Show the dialog again</MiButton>
      <MiButton v-else variant="tinted" size="small" @click="reset">Reset the demo</MiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

function finish() { busy.value = false; elevated.value = true; open.value = false }
function confirm() {
  if (!password.value) { error.value = 'Enter your password to continue.'; return }
  busy.value = true
  setTimeout(() => {
    if (password.value !== 'tidewater') { busy.value = false; error.value = 'Incorrect password. 4 attempts left before a 15-minute lock.'; return }
    finish()
  }, 650)
}
function usePasskey() { busy.value = true; setTimeout(finish, 900) }
function reset() { elevated.value = false; password.value = ''; error.value = ''; open.value = true }
</script>

<style scoped>
.sua { container-type: inline-size; position: relative; display: grid; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); }
.sua__page { display: grid; align-content: start; gap: 14px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.sua__page-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.sua__keys { display: grid; margin: 0; padding: 0; list-style: none; }
.sua__key { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-top: 1px solid var(--mi-sep); }
.sua__key-text { display: grid; gap: 2px; min-width: 0; }
.sua__secret { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 500 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--mi-label2); }

/* The scrim covers the faux page only; the dialog sits centred on it, in flow. */
.sua__scrim {
  position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr); place-items: center; padding: 16px; border-radius: var(--mi-radius-xl);
  background: color-mix(in srgb, var(--mi-scrim) 85%, transparent); overflow: auto;
  -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
}
.sua__body { display: grid; gap: 14px; text-align: start; }
.sua__form { display: grid; gap: 8px; }
.sua__sample { padding: 1px 6px; border-radius: 6px; background: var(--mi-fill3); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.sua__actions { display: grid; gap: 8px; width: 100%; }
.sua__reopen { position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%); }
</style>

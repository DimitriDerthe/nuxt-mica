<template>
  <div class="adp">
    <header class="adp__top">
      <span class="adp__brand"><span class="adp__brand-mark" aria-hidden="true" />Linework</span>
      <div class="adp__who">
        <MiText as="span" variant="caption" tone="label2" class="adp__email">sam.okafor@gmail.com</MiText>
        <MiButton variant="plain" size="small">Switch account</MiButton>
      </div>
    </header>

    <main class="adp__main" aria-labelledby="adp-title">
      <!-- Illustration: the document is there, behind a frosted pane with a lock on it. -->
      <svg class="adp__art" viewBox="0 0 220 150" aria-hidden="true">
        <rect x="52" y="14" width="116" height="128" rx="10" class="adp__doc" />
        <rect v-for="(w, i) in lines" :key="i" x="68" :y="34 + i * 14" :width="w" height="6" rx="3" class="adp__line" />
        <rect x="30" y="58" width="160" height="58" rx="14" class="adp__frost" />
        <rect x="96" y="80" width="28" height="22" rx="5" class="adp__lock" />
        <path d="M102 80v-6a8 8 0 0 1 16 0v6" class="adp__shackle" />
      </svg>

      <div class="adp__copy">
        <MiText variant="caption" tone="label2" weight="semibold" class="adp__code">Error 403 · Restricted document</MiText>
        <MiText id="adp-title" variant="title1" as="h2" weight="bold" balance>You need access to this document</MiText>
        <MiText variant="callout" tone="label2">
          It is shared with the Pricing team only. Ask the owner and you will get an email the moment they answer.
        </MiText>
      </div>

      <div class="adp__file">
        <span class="adp__file-icon" aria-hidden="true"><MiIcon name="document" :size="18" /></span>
        <div class="adp__file-text">
          <MiText variant="subheadline" weight="semibold" :lines="1">2027 pricing review: EMEA</MiText>
          <MiText variant="caption" tone="label2">Owned by Hana Ruiz · edited yesterday</MiText>
        </div>
        <MiAvatar name="Hana Ruiz" size="sm" tone="auto" decorative />
      </div>

      <!-- Request form; after sending it turns into a pending status you can withdraw. -->
      <form v-if="!sent" class="adp__form" aria-label="Request access" @submit.prevent="send">
        <div class="adp__role">
          <MiText as="span" variant="footnote" weight="semibold" aria-hidden="true">Access you need</MiText>
          <MiSegmented v-model="role" :options="roles" label="Access you need" />
        </div>
        <MiField label="Message to Hana" hint="Optional, but it helps the owner decide.">
          <MiTextarea v-model="message" :rows="2" :maxlength="240" counter />
        </MiField>
        <MiButton type="submit" block>Request {{ roleLabel.toLowerCase() }} access</MiButton>
      </form>

      <div v-else class="adp__sent" role="status">
        <span class="adp__sent-icon" aria-hidden="true"><MiIcon name="check" :size="16" :weight="2.6" /></span>
        <div>
          <MiText variant="subheadline" weight="semibold">Request sent to Hana Ruiz</MiText>
          <MiText variant="footnote" tone="label2">{{ roleLabel }} access · she usually answers within 2 hours.</MiText>
        </div>
        <MiButton variant="plain" size="small" class="adp__undo" @click="sent = false">Withdraw</MiButton>
      </div>

      <nav class="adp__links" aria-label="Other places">
        <MiTextLink href="#">Back to your documents</MiTextLink>
        <MiTextLink href="#">Why am I seeing this?</MiTextLink>
      </nav>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Role = 'view' | 'comment' | 'edit'
interface RoleOption { value: Role, label: string }

const roles: RoleOption[] = [
  { value: 'view', label: 'View' },
  { value: 'comment', label: 'Comment' },
  { value: 'edit', label: 'Edit' }
]
const lines = [84, 70, 88, 52, 76, 64, 80]

const role = ref<string | number | null>('comment')
const message = ref('I am preparing the Lisbon partner deck and need the new tier prices.')
const sent = ref(false)

const roleLabel = computed(() => roles.find(r => r.value === role.value)?.label ?? 'View')

function send() { sent.value = true }
</script>

<style scoped>
.adp { container-type: inline-size; display: grid; grid-template-rows: auto 1fr; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.adp__top { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; }
.adp__brand { display: flex; align-items: center; gap: 8px; font-weight: 700; letter-spacing: -.01em; }
.adp__brand-mark { width: 22px; height: 22px; border-radius: 6px; background: linear-gradient(135deg, var(--mi-p), var(--mi-s)); }
.adp__who { display: flex; align-items: center; gap: 4px; min-width: 0; }
.adp__email { display: none; }

.adp__main { display: grid; align-content: center; gap: 18px; width: 100%; max-width: 460px; margin: 0 auto; padding: 12px 16px 36px; }
.adp__art { width: 180px; justify-self: center; overflow: visible; }
.adp__doc { fill: var(--mi-card); stroke: var(--mi-sep); }
.adp__line { fill: var(--mi-fill3); }
.adp__frost { fill: color-mix(in srgb, var(--mi-card) 72%, transparent); stroke: var(--mi-sep); }
.adp__lock { fill: var(--mi-p); }
.adp__shackle { fill: none; stroke: var(--mi-p); stroke-width: 4; stroke-linecap: round; }

.adp__copy { display: grid; gap: 8px; text-align: center; }
.adp__code { font-variant-numeric: tabular-nums; }

.adp__file { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.adp__file-icon { display: grid; place-items: center; width: 36px; height: 36px; flex: none; border-radius: 10px; color: var(--mi-p-text); background: var(--mi-p-tint); }
.adp__file-text { flex: 1; min-width: 0; }

.adp__form { display: grid; gap: 14px; padding: 16px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.adp__role { display: grid; gap: 8px; }

.adp__sent { display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mi-green) 40%, transparent), var(--mi-sh1); animation: adp-in var(--mi-dur-3) var(--mi-spring); }
.adp__sent-icon { display: grid; place-items: center; width: 30px; height: 30px; flex: none; border-radius: 50%; color: var(--mi-card); background: var(--mi-green); }
.adp__undo { margin-inline-start: auto; }
@keyframes adp-in { from { opacity: 0; transform: translateY(4px); } }
@media (prefers-reduced-motion: reduce) { .adp__sent { animation: none; } }

.adp__links { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 20px; }

@container (min-width: 560px) {
  .adp__top { padding: 16px 24px; }
  .adp__email { display: inline; }
  .adp__art { width: 220px; }
  .adp__form { padding: 20px 22px; }
}
</style>

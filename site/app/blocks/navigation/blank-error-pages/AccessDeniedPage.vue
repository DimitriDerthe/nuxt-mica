<template>
  <div class="mi:@container mi:grid mi:grid-rows-[auto_1fr] mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]">
    <header class="mi:flex mi:items-center mi:justify-between mi:gap-3 mi:py-3 mi:px-4 mi:@[560px]:py-4 mi:@[560px]:px-6">
      <span class="mi:flex mi:items-center mi:gap-2 mi:font-bold mi:tracking-[-.01em]"><span class="mi:w-5.5 mi:h-5.5 mi:rounded-[6px] mi:[background:linear-gradient(135deg,_var(--mi-p),_var(--mi-s))]" aria-hidden="true" />Linework</span>
      <div class="mi:flex mi:items-center mi:gap-1 mi:min-w-0">
        <MiText as="span" variant="caption" tone="label2" class="mi:hidden mi:@[560px]:inline">sam.okafor@gmail.com</MiText>
        <MiButton variant="plain" size="small">Switch account</MiButton>
      </div>
    </header>

    <main class="mi:grid mi:content-center mi:gap-4.5 mi:w-full mi:max-w-115 mi:my-0 mi:mx-auto mi:pt-3 mi:px-4 mi:pb-9" aria-labelledby="adp-title">
      <!-- Illustration: the document is there, behind a frosted pane with a lock on it. -->
      <svg class="mi:w-45 mi:justify-self-center mi:overflow-visible mi:@[560px]:w-55" viewBox="0 0 220 150" aria-hidden="true">
        <rect x="52" y="14" width="116" height="128" rx="10" class="mi:fill-card mi:stroke-sep" />
        <rect v-for="(w, i) in lines" :key="i" x="68" :y="34 + i * 14" :width="w" height="6" rx="3" class="mi:fill-fill3" />
        <rect x="30" y="58" width="160" height="58" rx="14" class="mi:fill-card/72 mi:stroke-sep" />
        <rect x="96" y="80" width="28" height="22" rx="5" class="mi:fill-p" />
        <path d="M102 80v-6a8 8 0 0 1 16 0v6" class="mi:fill-[color:none] mi:stroke-p mi:[stroke-width:4] mi:[stroke-linecap:round]" />
      </svg>

      <div class="mi:grid mi:gap-2 mi:text-center">
        <MiText variant="caption" tone="label2" weight="semibold" class="mi:tabular-nums">Error 403 · Restricted document</MiText>
        <MiText id="adp-title" variant="title1" as="h2" weight="bold" balance>You need access to this document</MiText>
        <MiText variant="callout" tone="label2">
          It is shared with the Pricing team only. Ask the owner and you will get an email the moment they answer.
        </MiText>
      </div>

      <div class="mi:flex mi:items-center mi:gap-3 mi:py-3 mi:px-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
        <span class="mi:grid mi:place-items-center mi:w-9 mi:h-9 mi:flex-[none] mi:rounded-[10px] mi:text-p-text mi:[background:var(--mi-p-tint)]" aria-hidden="true"><MiIcon name="document" :size="18" /></span>
        <div class="mi:flex-1 mi:min-w-0">
          <MiText variant="subheadline" weight="semibold" :lines="1">2027 pricing review: EMEA</MiText>
          <MiText variant="caption" tone="label2">Owned by Hana Ruiz · edited yesterday</MiText>
        </div>
        <MiAvatar name="Hana Ruiz" size="sm" tone="auto" decorative />
      </div>

      <!-- Request form; after sending it turns into a pending status you can withdraw. -->
      <form v-if="!sent" class="mi:grid mi:gap-3.5 mi:p-4 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[560px]:py-5 mi:@[560px]:px-5.5" aria-label="Request access" @submit.prevent="send">
        <div class="mi:grid mi:gap-2">
          <MiText as="span" variant="footnote" weight="semibold" aria-hidden="true">Access you need</MiText>
          <MiSegmented v-model="role" :options="roles" label="Access you need" />
        </div>
        <MiField label="Message to Hana" hint="Optional, but it helps the owner decide.">
          <MiTextarea v-model="message" :rows="2" :maxlength="240" counter />
        </MiField>
        <MiButton type="submit" block>Request {{ roleLabel.toLowerCase() }} access</MiButton>
      </form>

      <div v-else class="mi:[--mi-in-y:4px] mi:animate-[in_var(--mi-dur-3)_var(--mi-spring)] mi:motion-reduce:animate-none mi:flex mi:items-center mi:gap-3 mi:p-4 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-green)_40%,_transparent),_var(--mi-sh1)]" role="status">
        <span class="mi:grid mi:place-items-center mi:w-7.5 mi:h-7.5 mi:flex-[none] mi:rounded-[50%] mi:text-card mi:[background:var(--mi-green)]" aria-hidden="true"><MiIcon name="check" :size="16" :weight="2.6" /></span>
        <div>
          <MiText variant="subheadline" weight="semibold">Request sent to Hana Ruiz</MiText>
          <MiText variant="footnote" tone="label2">{{ roleLabel }} access · she usually answers within 2 hours.</MiText>
        </div>
        <MiButton variant="plain" size="small" class="mi:ms-auto" @click="sent = false">Withdraw</MiButton>
      </div>

      <nav class="mi:flex mi:flex-wrap mi:justify-center mi:gap-y-2 mi:gap-x-5" aria-label="Other places">
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


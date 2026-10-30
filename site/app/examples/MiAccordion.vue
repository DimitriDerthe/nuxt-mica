<script lang="ts">
export const playground = {
  props: {
    items: [
      { value: 'billing', title: 'When am I billed?', content: 'Your card is charged on the first day of each billing period. Annual plans renew on the anniversary of your purchase, and you get a reminder email 7 days before.' },
      { value: 'seats', title: 'Can I add seats mid-cycle?', content: 'Yes. New seats are prorated for the rest of the current period and appear on your next invoice as a separate line.' },
      { value: 'export', title: 'How do I export my data?', content: 'Open Settings, then Workspace, then Export. You receive a ZIP with CSV and JSON files within a few minutes.' },
      { value: 'sso', title: 'Is single sign-on available?', content: 'SAML and OIDC single sign-on are included on the Business and Enterprise plans.', disabled: true }
    ]
  },
  controls: ['type', 'variant', 'collapsible', 'headingLevel'],
  height: 380
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ p: Record<string, unknown> }>()
const open = ref<string | string[] | null>('billing')
watch(() => props.p.type, t => { open.value = t === 'multiple' ? ['billing'] : 'billing' })
</script>

<template>
  <MiAccordion v-model="open" v-bind="p" class="ex-acc" />
</template>

<style scoped>
.ex-acc { width: min(100%, 520px); }
</style>

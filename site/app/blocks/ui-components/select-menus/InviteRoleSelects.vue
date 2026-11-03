<template>
  <div class="mi:@container mi:font-mi mi:text-label">
    <section class="mi:grid mi:gap-4.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[640px]:py-6 mi:@[640px]:px-7" aria-labelledby="irs-title">
      <header class="mi:grid mi:gap-1">
        <MiText id="irs-title" variant="title3" as="h2" weight="semibold">Invite to Harbor Analytics</MiText>
        <MiText variant="footnote" tone="label2">Each person gets a role; only Admin and Editor take a paid seat.</MiText>
      </header>

      <form class="mi:grid mi:gap-3 mi:@[640px]:grid-cols-[minmax(0,_1fr)_200px_auto] mi:@[640px]:items-start" novalidate @submit.prevent="add">
        <MiField label="Email address" :error="error">
          <MiInput v-model="email" type="email" placeholder="name@harbor.io" />
        </MiField>
        <MiField label="Role">
          <MiSelect v-model="newRole" :options="roles" />
        </MiField>
        <MiButton type="submit" variant="tinted" class="mi:justify-self-start mi:@[640px]:mt-6.5">Add</MiButton>
      </form>

      <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Pending invites">
        <li v-for="p in invites" :key="p.email" class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:[grid-template-areas:'av_email_x'_'role_role_role'] mi:items-center mi:gap-y-2 mi:gap-x-3 mi:py-3 mi:px-0 mi:border-t mi:border-t-sep mi:@[640px]:grid-cols-[auto_minmax(0,_1fr)_200px_auto] mi:@[640px]:[grid-template-areas:'av_email_role_x']">
          <MiAvatar :name="p.email" size="sm" tone="auto" :initials="p.email.slice(0, 2).toUpperCase()" decorative />
          <MiText variant="subheadline" weight="medium" :lines="1" class="mi:[grid-area:email] mi:min-w-0">{{ p.email }}</MiText>
          <!-- Per-row role select: the description under each option explains what the role can do. -->
          <MiSelect v-model="p.role" :options="roles" size="sm" class="mi:[grid-area:role]" :aria-label="`Role for ${p.email}`" />
          <MiIconButton :label="`Remove ${p.email}`" variant="plain" size="small" @click="remove(p.email)">
            <MiIcon name="close" :size="16" />
          </MiIconButton>
        </li>
      </ul>

      <div class="mi:grid mi:gap-2.5 mi:p-3.5 mi:rounded-md mi:bg-fill4">
        <MiMeter
          :value="paidAfter" :max="seatLimit" label="Paid seats after these invites"
          :caption="`${paidAfter} of ${seatLimit} seats`" :hint="seatHint" size="sm"
          :color="paidAfter > seatLimit ? 'var(--mi-red)' : undefined"
        />
        <ul class="mi:flex mi:flex-wrap mi:gap-1.5 mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Invites by role">
          <li v-for="r in mix" :key="r.value"><MiBadge variant="tint" :tone="r.paid ? 'primary' : 'neutral'" :label="`${r.count} ${r.label}`" /></li>
        </ul>
      </div>

      <footer class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2.5 mi:gap-x-4">
        <MiText variant="footnote" tone="label2" aria-live="polite">{{ sent ? `${sentCount} invites sent. Links expire in 7 days.` : costText }}</MiText>
        <MiButton :disabled="!invites.length || paidAfter > seatLimit" @click="send">Send {{ invites.length }} invites</MiButton>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Role = string | number | null
interface Invite { email: string, role: Role }

const roles = [
  { value: 'admin', label: 'Admin', description: 'Billing, members and every workspace setting' },
  { value: 'editor', label: 'Editor', description: 'Build dashboards and edit data sources' },
  { value: 'viewer', label: 'Viewer', description: 'Open shared dashboards, free' },
  { value: 'billing', label: 'Billing only', description: 'Invoices and payment methods, free' }
]
const paidRoles = ['admin', 'editor']
const seatLimit = 10
const seatsUsed = 6
const seatPrice = 18

const invites = ref<Invite[]>([
  { email: 'olga.petrova@harbor.io', role: 'editor' },
  { email: 'sam.okafor@harbor.io', role: 'viewer' },
  { email: 'finance@harbor.io', role: 'billing' }
])
const email = ref('')
const newRole = ref<Role>('editor')
const error = ref<string | undefined>()
const sent = ref(false)
const sentCount = ref(0)

const paidNew = computed(() => invites.value.filter(p => paidRoles.includes(String(p.role))).length)
const paidAfter = computed(() => seatsUsed + paidNew.value)
const seatHint = computed(() => (paidAfter.value > seatLimit ? `${paidAfter.value - seatLimit} over plan` : `${seatLimit - paidAfter.value} free`))
const costText = computed(() => (paidNew.value ? `Adds $${paidNew.value * seatPrice}/month from your next invoice` : 'No change to your bill'))
const mix = computed(() => roles.map(r => ({ ...r, paid: paidRoles.includes(r.value), count: invites.value.filter(p => p.role === r.value).length })).filter(r => r.count))

function add(): void {
  const value = email.value.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { error.value = 'Enter a valid email address'; return }
  if (invites.value.some(p => p.email === value)) { error.value = 'This person is already on the list'; return }
  invites.value.push({ email: value, role: newRole.value })
  email.value = ''
  error.value = undefined
  sent.value = false
}

function remove(address: string): void {
  invites.value = invites.value.filter(p => p.email !== address)
}

function send(): void {
  sentCount.value = invites.value.length
  invites.value = []
  sent.value = true
}
</script>


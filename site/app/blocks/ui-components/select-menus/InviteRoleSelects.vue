<template>
  <div class="irs">
    <section class="irs__card" aria-labelledby="irs-title">
      <header class="irs__head">
        <MiText id="irs-title" variant="title3" as="h2" weight="semibold">Invite to Harbor Analytics</MiText>
        <MiText variant="footnote" tone="label2">Each person gets a role; only Admin and Editor take a paid seat.</MiText>
      </header>

      <form class="irs__add" novalidate @submit.prevent="add">
        <MiField label="Email address" :error="error">
          <MiInput v-model="email" type="email" placeholder="name@harbor.io" />
        </MiField>
        <MiField label="Role">
          <MiSelect v-model="newRole" :options="roles" />
        </MiField>
        <MiButton type="submit" variant="tinted" class="irs__add-btn">Add</MiButton>
      </form>

      <ul class="irs__list" aria-label="Pending invites">
        <li v-for="p in invites" :key="p.email" class="irs__row">
          <MiAvatar :name="p.email" size="sm" tone="auto" :initials="p.email.slice(0, 2).toUpperCase()" decorative />
          <MiText variant="subheadline" weight="medium" :lines="1" class="irs__email">{{ p.email }}</MiText>
          <!-- Per-row role select: the description under each option explains what the role can do. -->
          <MiSelect v-model="p.role" :options="roles" size="sm" class="irs__role" :aria-label="`Role for ${p.email}`" />
          <MiIconButton :label="`Remove ${p.email}`" variant="plain" size="small" @click="remove(p.email)">
            <MiIcon name="close" :size="16" />
          </MiIconButton>
        </li>
      </ul>

      <div class="irs__seats">
        <MiMeter
          :value="paidAfter" :max="seatLimit" label="Paid seats after these invites"
          :caption="`${paidAfter} of ${seatLimit} seats`" :hint="seatHint" size="sm"
          :color="paidAfter > seatLimit ? 'var(--mi-red)' : undefined"
        />
        <ul class="irs__mix" aria-label="Invites by role">
          <li v-for="r in mix" :key="r.value"><MiBadge variant="tint" :tone="r.paid ? 'primary' : 'neutral'" :label="`${r.count} ${r.label}`" /></li>
        </ul>
      </div>

      <footer class="irs__foot">
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

<style scoped>
.irs { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.irs__card { display: grid; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.irs__head { display: grid; gap: 4px; }

.irs__add { display: grid; gap: 12px; }
.irs__add-btn { justify-self: start; }

.irs__list { display: grid; margin: 0; padding: 0; list-style: none; }
.irs__row {
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto; grid-template-areas: "av email x" "role role role";
  align-items: center; gap: 8px 12px; padding: 12px 0; border-top: 1px solid var(--mi-sep);
}
.irs__email { grid-area: email; min-width: 0; }
.irs__role { grid-area: role; }

.irs__seats { display: grid; gap: 10px; padding: 14px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.irs__mix { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }

.irs__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 16px; }

@container (min-width: 640px) {
  .irs__card { padding: 24px 28px; }
  .irs__add { grid-template-columns: minmax(0, 1fr) 200px auto; align-items: start; }
  .irs__add-btn { margin-top: 26px; }
  .irs__row { grid-template-columns: auto minmax(0, 1fr) 200px auto; grid-template-areas: "av email role x"; }
}
</style>

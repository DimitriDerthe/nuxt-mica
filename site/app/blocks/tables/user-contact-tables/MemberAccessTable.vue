<template>
  <section class="mat" aria-labelledby="mat-title">
    <header class="mat__head">
      <div>
        <MiText id="mat-title" variant="title3" as="h2" weight="semibold">Workspace members</MiText>
        <MiText variant="footnote" tone="label2">Northwind Studio · Business plan</MiText>
      </div>
      <!-- Seat ledger: the number admins actually manage, right above the list it comes from. -->
      <div class="mat__seats">
        <MiMeter :value="used" :max="SEATS" size="sm" aria-label="Seats used" :value-text="`${used} of ${SEATS} seats`" />
        <MiText variant="caption" tone="label2" tabular>{{ used }} of {{ SEATS }} seats · {{ invited }} pending</MiText>
      </div>
    </header>

    <div class="mat__toolbar">
      <MiSearch v-model="query" size="compact" placeholder="Name or email" aria-label="Search members" class="mat__search" />
      <MiSegmented v-model="role" label="Role" :options="roleFilters" />
    </div>

    <Transition name="mat-bulk">
      <div v-if="selected.length" class="mat__bulk" role="region" aria-label="Bulk actions">
        <MiText as="span" variant="subheadline" weight="semibold" tabular aria-live="polite">{{ selected.length }} selected</MiText>
        <div class="mat__bulk-actions">
          <MiMenu :items="roleItems" label="Change role" aria-label="Change role of selected members" @select="bulkRole" />
          <MiButton size="small" variant="destructive" soft @click="removeSelected">Remove</MiButton>
          <MiIconButton size="small" variant="plain" label="Clear selection" @click="selected = []"><MiIcon name="close" :size="16" /></MiIconButton>
        </div>
      </div>
    </Transition>

    <!-- Wide: a sortable table. Narrow: the same rows as cards; both share filters and selection. -->
    <div class="mat__table">
      <MiDataTable
        v-model:selected="selected" :columns="columns" :rows="rows" :filterable="false" selectable="multiple" :page-size="10"
        caption="Workspace members" empty-text="No member matches this search."
      >
        <template #cell-name="{ row }">
          <span class="mat__who">
            <MiAvatar :name="m(row).name" size="sm" tone="auto" decorative />
            <span class="mat__who-text">
              <span class="mat__name">{{ m(row).name }}<MiBadge v-if="m(row).status === 'invited'" tone="neutral" variant="outline" label="Invited" /></span>
              <span class="mat__email">{{ m(row).email }}</span>
            </span>
          </span>
        </template>
        <template #cell-role="{ row }">
          <MiNativeSelect
            :model-value="m(row).role" :options="roleOptions" size="sm" :aria-label="'Role of ' + m(row).name" :disabled="m(row).role === 'owner'"
            @update:model-value="setRole(m(row).id, $event)"
          />
        </template>
        <template #cell-active="{ row }">
          <span class="mat__active"><i :class="'is-' + recency(m(row))" aria-hidden="true" />{{ m(row).lastLabel }}</span>
        </template>
        <template #cell-mfa="{ row }">
          <span v-if="m(row).status === 'invited'" class="mat__mfa" aria-label="Not set up yet">–</span>
          <span v-else class="mat__mfa" :class="{ 'is-off': !m(row).mfa }">
            <MiIcon :name="m(row).mfa ? 'lock' : 'warning'" :size="14" />{{ m(row).mfa ? 'On' : 'Off' }}
          </span>
        </template>
        <template #cell-weeks="{ row }">
          <span class="mat__weeks" role="img" :aria-label="`${total(m(row))} sessions in 12 weeks`">
            <i v-for="(w, i) in m(row).weeks" :key="i" :style="{ opacity: w ? 0.18 + (w / 7) * 0.82 : 1 }" :class="{ 'is-zero': !w }" />
          </span>
        </template>
      </MiDataTable>
    </div>

    <ul class="mat__cards">
      <li v-for="mem in rows" :key="mem.id" class="mat__card" :class="{ 'is-sel': selected.includes(mem.id) }">
        <MiCheckbox :model-value="selected.includes(mem.id)" @update:model-value="toggle(mem.id)"><span class="mat__sr">Select {{ mem.name }}</span></MiCheckbox>
        <MiAvatar :name="mem.name" size="sm" tone="auto" decorative />
        <div class="mat__card-text">
          <MiText as="h3" variant="subheadline" weight="semibold" :lines="1">{{ mem.name }}</MiText>
          <MiText variant="caption" tone="label2" :lines="1">{{ mem.email }}</MiText>
          <span class="mat__card-meta">
            <MiBadge :tone="mem.role === 'owner' || mem.role === 'admin' ? 'primary' : 'neutral'" :label="roleName(mem.role)" />
            <span class="mat__active"><i :class="'is-' + recency(mem)" aria-hidden="true" />{{ mem.lastLabel }}</span>
            <span v-if="!mem.mfa && mem.status === 'active'" class="mat__mfa is-off"><MiIcon name="warning" :size="13" />No 2FA</span>
          </span>
        </div>
      </li>
      <li v-if="!rows.length" class="mat__none"><MiText variant="footnote" tone="label2">No member matches this search.</MiText></li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Role = 'owner' | 'admin' | 'editor' | 'viewer'
interface Member { id: string, name: string, email: string, role: Role, status: 'active' | 'invited', mins: number, lastLabel: string, mfa: boolean, weeks: number[] }

const SEATS = 20
const roleOptions = [{ value: 'owner', label: 'Owner', disabled: true }, { value: 'admin', label: 'Admin' }, { value: 'editor', label: 'Editor' }, { value: 'viewer', label: 'Viewer' }]
const roleName = (r: Role) => roleOptions.find(o => o.value === r)?.label ?? r

// `mins` is minutes since last activity (sorting key); `weeks` is sessions per week, oldest first.
const members = reactive<Member[]>([
  { id: 'u1', name: 'Inès Moreau', email: 'ines@northwind.studio', role: 'owner', status: 'active', mins: 3, lastLabel: 'Online now', mfa: true, weeks: [5, 6, 6, 7, 5, 6, 7, 7, 6, 7, 7, 6] },
  { id: 'u2', name: 'Kofi Mensah', email: 'kofi@northwind.studio', role: 'admin', status: 'active', mins: 42, lastLabel: '42 min ago', mfa: true, weeks: [4, 5, 5, 4, 6, 5, 5, 6, 4, 5, 6, 5] },
  { id: 'u3', name: 'Saoirse Byrne', email: 'saoirse@northwind.studio', role: 'editor', status: 'active', mins: 180, lastLabel: '3 h ago', mfa: true, weeks: [3, 4, 2, 5, 4, 3, 4, 5, 4, 3, 4, 4] },
  { id: 'u4', name: 'Tomás Ruiz', email: 'tomas@northwind.studio', role: 'editor', status: 'active', mins: 1_500, lastLabel: 'Yesterday', mfa: false, weeks: [2, 3, 3, 2, 4, 3, 2, 3, 3, 2, 3, 1] },
  { id: 'u5', name: 'Yuki Tanaka', email: 'yuki@northwind.studio', role: 'editor', status: 'active', mins: 2_900, lastLabel: '2 days ago', mfa: true, weeks: [5, 4, 5, 5, 4, 6, 5, 3, 2, 2, 1, 1] },
  { id: 'u6', name: 'Lena Vogel', email: 'lena.vogel@ledgerline.de', role: 'viewer', status: 'active', mins: 10_100, lastLabel: '7 days ago', mfa: false, weeks: [1, 0, 2, 1, 1, 0, 1, 2, 0, 1, 0, 0] },
  { id: 'u7', name: 'Arjun Mehta', email: 'arjun@northwind.studio', role: 'admin', status: 'active', mins: 95, lastLabel: '1 h ago', mfa: true, weeks: [6, 6, 5, 7, 6, 6, 7, 6, 7, 6, 7, 7] },
  { id: 'u8', name: 'Noor Haddad', email: 'noor@northwind.studio', role: 'viewer', status: 'active', mins: 46_000, lastLabel: '32 days ago', mfa: false, weeks: [2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: 'u9', name: 'Marta Kowalska', email: 'marta@pocketmeal.app', role: 'editor', status: 'invited', mins: 999_999, lastLabel: 'Invite sent Oct 30', mfa: false, weeks: Array(12).fill(0) },
  { id: 'u10', name: 'Ana Paula Souza', email: 'anapaula@northwind.studio', role: 'viewer', status: 'invited', mins: 999_998, lastLabel: 'Invite sent Nov 1', mfa: false, weeks: Array(12).fill(0) }
])

const m = (row: Record<string, unknown>) => row as unknown as Member
const total = (x: Member) => x.weeks.reduce((n, w) => n + w, 0)
const recency = (x: Member) => (x.status === 'invited' ? 'invited' : x.mins < 60 ? 'now' : x.mins < 4_320 ? 'recent' : x.mins < 20_000 ? 'idle' : 'dormant')

const columns = [
  { key: 'name', label: 'Member', sortable: true },
  { key: 'role', label: 'Role', sortable: true, width: '128px', sortBy: (r: Record<string, unknown>) => ['owner', 'admin', 'editor', 'viewer'].indexOf(String(r.role)) },
  { key: 'active', label: 'Last active', sortable: true, width: '150px', sortBy: (r: Record<string, unknown>) => m(r).mins },
  { key: 'mfa', label: '2FA', width: '70px' },
  { key: 'weeks', label: 'Last 12 weeks', sortable: true, align: 'end' as const, width: '140px', sortBy: (r: Record<string, unknown>) => total(m(r)) }
]

const roleFilters = [{ value: 'all', label: 'All' }, { value: 'admin', label: 'Admins' }, { value: 'editor', label: 'Editors' }, { value: 'viewer', label: 'Viewers' }]
const role = ref<string | number | null>('all')
const query = ref('')

const rows = computed(() => {
  const q = query.value.trim().toLowerCase()
  return members.filter(x => (role.value === 'all' || x.role === role.value || (role.value === 'admin' && x.role === 'owner'))
    && (!q || x.name.toLowerCase().includes(q) || x.email.includes(q)))
})
const used = computed(() => members.length)
const invited = computed(() => members.filter(x => x.status === 'invited').length)

const selected = ref<string[]>(['u6', 'u8'])
const toggle = (id: string) => { selected.value = selected.value.includes(id) ? selected.value.filter(x => x !== id) : [...selected.value, id] }
const setRole = (id: string, value: string | number | null) => {
  const x = members.find(y => y.id === id)
  if (x && x.role !== 'owner' && value) x.role = value as Role
}

const roleItems = [{ value: 'admin', label: 'Make admin' }, { value: 'editor', label: 'Make editor' }, { value: 'viewer', label: 'Make viewer' }]
const bulkRole = (item: { value?: string | number }) => { selected.value.forEach(id => setRole(id, item.value ?? null)) }
const removeSelected = () => {
  const drop = new Set(selected.value.filter(id => members.find(x => x.id === id)?.role !== 'owner'))
  members.splice(0, members.length, ...members.filter(x => !drop.has(x.id)))
  selected.value = []
}
</script>

<style scoped>
.mat { container-type: inline-size; position: relative; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.mat__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px 24px; }
.mat__seats { display: grid; gap: 4px; flex: 0 1 220px; min-width: 160px; }
.mat__toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.mat__search { flex: 1 1 200px; max-width: 300px; min-width: 0; }
.mat__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.mat__bulk { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; padding: 8px 8px 8px 14px; border-radius: var(--mi-radius-l); background: var(--mi-p-tint); }
.mat__bulk-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.mat-bulk-enter-active, .mat-bulk-leave-active { transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease); }
.mat-bulk-enter-from, .mat-bulk-leave-to { transform: translateY(-6px); opacity: 0; }

.mat__table { display: none; min-width: 0; overflow-x: auto; }
.mat__cards { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
@container (min-width: 760px) { .mat__table { display: block; } .mat__cards { display: none; } }

.mat__who { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 4px 0; }
.mat__who-text { display: grid; min-width: 0; }
.mat__name { display: flex; align-items: center; gap: 6px; font-weight: 600; white-space: nowrap; }
.mat__email { font-size: 12px; color: var(--mi-label2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mat__active { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--mi-label2); white-space: nowrap; }
.mat__active i { width: 7px; height: 7px; border-radius: 50%; background: var(--mi-label3); }
.mat__active i.is-now { background: var(--mi-green); box-shadow: 0 0 0 3px color-mix(in srgb, var(--mi-green) 22%, transparent); }
.mat__active i.is-recent { background: var(--mi-green); }
.mat__active i.is-idle { background: var(--mi-orange); }
.mat__active i.is-invited { background: transparent; box-shadow: inset 0 0 0 1.5px var(--mi-label3); }
.mat__mfa { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: var(--mi-label2); }
.mat__mfa.is-off { color: var(--mi-orange-t); font-weight: 600; }
/* Twelve squares, one per week, darker with more sessions: a dormant account fades out on its own. */
.mat__weeks { display: inline-grid; grid-template-columns: repeat(12, 8px); gap: 2px; }
.mat__weeks i { width: 8px; height: 14px; border-radius: 2px; background: var(--mi-p); }
.mat__weeks i.is-zero { background: var(--mi-fill3); }

.mat__card { display: grid; grid-template-columns: auto auto minmax(0, 1fr); align-items: start; gap: 10px; padding: 12px 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.mat__card.is-sel { box-shadow: 0 0 0 2px var(--mi-p), var(--mi-sh1); }
.mat__card > :first-child { padding-top: 6px; }
.mat__card-text { display: grid; gap: 2px; min-width: 0; }
.mat__card-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin-top: 6px; }
.mat__none { padding: 20px; text-align: center; }
</style>

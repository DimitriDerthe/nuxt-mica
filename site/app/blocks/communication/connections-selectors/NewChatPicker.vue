<template>
  <section class="nc" aria-labelledby="nc-title">
    <form class="nc__card" @submit.prevent="start">
      <header class="nc__head">
        <MiText id="nc-title" as="h2" variant="title3" weight="bold">New conversation</MiText>
        <MiText variant="footnote" tone="label2">Pick one person for a direct message, two or more for a group.</MiText>
      </header>

      <!-- "To" field: chips for picked people, then free text that filters the list. -->
      <div class="nc__to">
        <label for="nc-q" class="nc__to-label">To</label>
        <div class="nc__to-field">
          <TransitionGroup name="nc-chip">
            <MiChip
              v-for="p in picked" :key="p.id" :label="p.name.split(' ')[0]" removable size="small" :tone="p.guest ? 'secondary' : 'primary'"
              :remove-label="'Remove ' + p.name" @remove="toggle(p.id, false)"
            />
          </TransitionGroup>
          <input id="nc-q" v-model="query" class="nc__q" type="text" autocomplete="off" :placeholder="picked.length ? 'Add more…' : 'Name, team or email'">
        </div>
      </div>

      <div class="nc__list">
        <section v-for="g in groups" :key="g.label" :aria-labelledby="'nc-g-' + g.key">
          <h3 :id="'nc-g-' + g.key" class="nc__group">{{ g.label }}</h3>
          <ul class="nc__rows">
            <li v-for="p in g.items" :key="p.id" class="nc__row" :class="{ 'is-on': sel[p.id] }">
              <MiCheckbox :model-value="!!sel[p.id]" @update:model-value="toggle(p.id, $event)">
                <span class="nc__person">
                  <MiAvatar :name="p.name" size="sm" tone="auto" decorative />
                  <span class="nc__person-text">
                    <span class="nc__name">{{ p.name }}<MiBadge v-if="p.guest" tone="secondary" variant="outline" :label="'Guest · ' + p.org" class="nc__guest" /></span>
                    <span class="nc__sub">{{ p.title }}<template v-if="p.mutual"> · {{ p.mutual }} shared channels</template></span>
                  </span>
                </span>
              </MiCheckbox>
            </li>
          </ul>
        </section>
        <MiText v-if="!groups.length" variant="footnote" tone="label2" class="nc__none">Nobody matches “{{ query }}”. Invite them by email instead.</MiText>
      </div>

      <!-- The group takes shape as people are picked: stacked faces and a suggested name. -->
      <Transition name="nc-rise">
        <div v-if="picked.length > 1" class="nc__group-card">
          <MiAvatarGroup :items="groupItems" :max="4" :size="36" />
          <div class="nc__group-name">
            <label for="nc-name" class="nc__to-label">Group name</label>
            <MiInput id="nc-name" v-model="groupName" size="sm" :placeholder="suggested" />
          </div>
        </div>
      </Transition>
      <MiAlert v-if="guests.length" tone="warning" :message="guestNote" />

      <footer class="nc__foot">
        <MiText variant="caption" tone="label3" aria-live="polite">{{ picked.length ? picked.length + ' selected' : 'Nobody selected' }}</MiText>
        <MiButton type="submit" :disabled="!picked.length">{{ cta }}</MiButton>
      </footer>
      <p v-if="started" class="nc__done" role="status">{{ started }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

interface Person { id: string, name: string, title: string, team: 'suggested' | 'team' | 'guest', mutual?: number, guest?: boolean, org?: string }

// Sample directory; swap for your people search.
const people: Person[] = [
  { id: 'amara', name: 'Amara Diallo', title: 'Ops lead', team: 'suggested', mutual: 6 },
  { id: 'jonas', name: 'Jonas Weber', title: 'Pricing analyst', team: 'suggested', mutual: 4 },
  { id: 'priya', name: 'Priya Raman', title: 'Support lead', team: 'team', mutual: 3 },
  { id: 'tomas', name: 'Tomás Ruiz', title: 'Merchandising', team: 'team', mutual: 5 },
  { id: 'yuki', name: 'Yuki Tanaka', title: 'Product designer', team: 'team', mutual: 2 },
  { id: 'grace', name: 'Grace Mwangi', title: 'Solutions engineer', team: 'guest', guest: true, org: 'savanna.io' },
  { id: 'mateo', name: 'Mateo Silva', title: 'Engineering manager', team: 'guest', guest: true, org: 'pagaflow.com.br' }
]
const labels = { suggested: 'Suggested', team: 'Halden Studio', guest: 'External' }

const sel = reactive<Record<string, boolean>>({ amara: true, grace: true })
const order = ref<string[]>(['amara', 'grace'])
const query = ref('')
const groupName = ref('')
const started = ref('')

const picked = computed(() => order.value.map(id => people.find(p => p.id === id)).filter((p): p is Person => !!p))
const groupItems = computed(() => picked.value.map(p => ({ name: p.name, tone: 'auto' as const })))
const guests = computed(() => picked.value.filter(p => p.guest))
const groups = computed(() => {
  const q = query.value.trim().toLowerCase()
  return (['suggested', 'team', 'guest'] as const)
    .map(key => ({ key, label: labels[key], items: people.filter(p => p.team === key && (!q || (p.name + ' ' + p.title + ' ' + (p.org ?? '')).toLowerCase().includes(q))) }))
    .filter(g => g.items.length)
})

const firstNames = computed(() => picked.value.map(p => p.name.split(' ')[0] ?? p.name))
const suggested = computed(() => {
  const n = firstNames.value
  if (n.length <= 3) return n.slice(0, -1).join(', ') + ' & ' + n[n.length - 1]
  return n.slice(0, 2).join(', ') + ' & ' + (n.length - 2) + ' others'
})
const guestNote = computed(() => {
  const orgs = [...new Set(guests.value.map(g => g.org))].join(' and ')
  return `Guests from ${orgs} will only see this conversation, not your channels.`
})
const cta = computed(() => (picked.value.length > 1 ? `Create group of ${picked.value.length + 1}` : 'Start chat'))

watch(() => picked.value.length, () => { started.value = '' })

function toggle(id: string, on: boolean) {
  sel[id] = on
  order.value = on ? [...order.value.filter(x => x !== id), id] : order.value.filter(x => x !== id)
  if (on) query.value = ''
}

function start() {
  if (!picked.value.length) return
  started.value = picked.value.length > 1
    ? `Group “${groupName.value.trim() || suggested.value}” created with ${picked.value.length} people.`
    : `Direct message with ${picked.value[0]?.name} opened.`
}
</script>

<style scoped>
.nc { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.nc__card { display: grid; gap: 16px; max-width: 560px; margin-inline: auto; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2); }
@container (min-width: 520px) { .nc__card { padding: 22px 24px; } }
.nc__head { display: grid; gap: 2px; }

.nc__to { display: flex; align-items: flex-start; gap: 10px; padding: 8px 10px; border-radius: var(--mi-radius-m); background: var(--mi-field); box-shadow: inset 0 0 0 1px var(--mi-sep); }
.nc__to:focus-within { box-shadow: inset 0 0 0 2px var(--mi-p); }
.nc__to-label { flex: none; padding-top: 5px; font-size: 13px; font-weight: 600; color: var(--mi-label2); }
.nc__to-field { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.nc__q { flex: 1; min-width: 120px; height: 28px; border: 0; outline: 0; background: transparent; color: var(--mi-label); font: inherit; font-size: 14.5px; }
.nc__q::placeholder { color: var(--mi-label3); }

.nc__list { max-height: 300px; overflow-y: auto; margin-inline: -6px; padding-inline: 6px; }
.nc__group { margin: 10px 4px 6px; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--mi-label3); }
.nc__rows { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.nc__row { padding: 8px 10px; border-radius: var(--mi-radius-m); }
.nc__row:hover { background: var(--mi-fill4); }
.nc__row.is-on { background: var(--mi-p-tint); }
.nc__person { display: flex; align-items: center; gap: 10px; min-width: 0; }
.nc__person-text { display: grid; gap: 1px; min-width: 0; }
.nc__name { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 14.5px; font-weight: 600; }
.nc__sub { font-size: 12.5px; color: var(--mi-label2); }
.nc__none { padding: 12px 4px; }

.nc__group-card { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 14px; padding: 14px; border-radius: var(--mi-radius-l); background: linear-gradient(135deg, var(--mi-p-tint), transparent 80%), var(--mi-page); }
.nc__group-name { flex: 1; min-width: 180px; display: grid; gap: 6px; }
.nc__group-name .nc__to-label { padding: 0; }

.nc__foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 14px; border-top: 1px solid var(--mi-sep); }
.nc__done { margin: 0; font-size: 13px; color: var(--mi-green-t); }

.nc-chip-enter-active, .nc-chip-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-spring); }
.nc-chip-enter-from, .nc-chip-leave-to { opacity: 0; transform: scale(.8); }
.nc-rise-enter-active, .nc-rise-leave-active { transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-ease); }
.nc-rise-enter-from, .nc-rise-leave-to { opacity: 0; transform: translateY(8px); }
</style>

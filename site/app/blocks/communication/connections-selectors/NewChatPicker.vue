<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="nc-title">
    <form class="mi:grid mi:gap-4 mi:max-w-140 mi:mx-auto mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-2 mi:@[520px]:py-5.5 mi:@[520px]:px-6" @submit.prevent="start">
      <header class="mi:grid mi:gap-0.5">
        <MiText id="nc-title" as="h2" variant="title3" weight="bold">New conversation</MiText>
        <MiText variant="footnote" tone="label2">Pick one person for a direct message, two or more for a group.</MiText>
      </header>

      <!-- "To" field: chips for picked people, then free text that filters the list. -->
      <div class="mi:flex mi:[align-items:flex-start] mi:gap-2.5 mi:py-2 mi:px-2.5 mi:rounded-md mi:[background:var(--mi-field)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:focus-within:shadow-[inset_0_0_0_2px_var(--mi-p)]">
        <label for="nc-q" class="mi:flex-[none] mi:pt-[5px] mi:text-[13px] mi:font-semibold mi:text-label2">To</label>
        <div class="mi:flex-1 mi:min-w-0 mi:flex mi:flex-wrap mi:items-center mi:gap-1.5">
          <TransitionGroup enter-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-spring)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-spring)]" enter-from-class="mi:opacity-0 mi:transform-[scale(.8)]" leave-to-class="mi:opacity-0 mi:transform-[scale(.8)]">
            <MiChip
              v-for="p in picked" :key="p.id" :label="p.name.split(' ')[0]" removable size="small" :tone="p.guest ? 'secondary' : 'primary'"
              :remove-label="'Remove ' + p.name" @remove="toggle(p.id, false)"
            />
          </TransitionGroup>
          <input id="nc-q" v-model="query" class="mi:[font:inherit] mi:text-[14.5px] mi:flex-1 mi:min-w-30 mi:h-7 mi:[border:0] mi:[outline:0] mi:[background:transparent] mi:text-label mi:placeholder:text-label3" type="text" autocomplete="off" :placeholder="picked.length ? 'Add more…' : 'Name, team or email'">
        </div>
      </div>

      <div class="mi:max-h-75 mi:overflow-y-auto mi:-mx-1.5 mi:px-1.5">
        <section v-for="g in groups" :key="g.label" :aria-labelledby="'nc-g-' + g.key">
          <h3 :id="'nc-g-' + g.key" class="mi:mt-2.5 mi:mx-1 mi:mb-1.5 mi:text-[11px] mi:font-semibold mi:tracking-[.06em] mi:uppercase mi:text-label3">{{ g.label }}</h3>
          <ul class="mi:[list-style:none] mi:m-0 mi:p-0 mi:grid mi:gap-0.5">
            <li v-for="p in g.items" :key="p.id" class="mi:py-2 mi:px-2.5 mi:rounded-md" :class="sel[p.id] ? 'mi:bg-p-tint' : 'mi:hover:bg-fill4'">
              <MiCheckbox :model-value="!!sel[p.id]" @update:model-value="toggle(p.id, $event)">
                <span class="mi:flex mi:items-center mi:gap-2.5 mi:min-w-0">
                  <MiAvatar :name="p.name" size="sm" tone="auto" decorative />
                  <span class="mi:grid mi:gap-px mi:min-w-0">
                    <span class="mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:text-[14.5px] mi:font-semibold">{{ p.name }}<MiBadge v-if="p.guest" tone="secondary" variant="outline" :label="'Guest · ' + p.org" /></span>
                    <span class="mi:text-[12.5px] mi:text-label2">{{ p.title }}<template v-if="p.mutual"> · {{ p.mutual }} shared channels</template></span>
                  </span>
                </span>
              </MiCheckbox>
            </li>
          </ul>
        </section>
        <MiText v-if="!groups.length" variant="footnote" tone="label2" class="mi:py-3 mi:px-1">Nobody matches “{{ query }}”. Invite them by email instead.</MiText>
      </div>

      <!-- The group takes shape as people are picked: stacked faces and a suggested name. -->
      <Transition enter-active-class="mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-ease)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-ease)]" enter-from-class="mi:opacity-0 mi:transform-[translateY(8px)]" leave-to-class="mi:opacity-0 mi:transform-[translateY(8px)]">
        <div v-if="picked.length > 1" class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:gap-3.5 mi:p-3.5 mi:rounded-lg mi:[background:linear-gradient(135deg,_var(--mi-p-tint),_transparent_80%),_var(--mi-page)]">
          <MiAvatarGroup :items="groupItems" :max="4" :size="36" />
          <div class="mi:flex-1 mi:min-w-45 mi:grid mi:gap-1.5">
            <label for="nc-name" class="mi:flex-[none] mi:text-[13px] mi:font-semibold mi:text-label2 mi:p-0">Group name</label>
            <MiInput id="nc-name" v-model="groupName" size="sm" :placeholder="suggested" />
          </div>
        </div>
      </Transition>
      <MiAlert v-if="guests.length" tone="warning" :message="guestNote" />

      <footer class="mi:flex mi:items-center mi:justify-between mi:gap-3 mi:pt-3.5 mi:border-t mi:border-t-sep">
        <MiText variant="caption" tone="label3" aria-live="polite">{{ picked.length ? picked.length + ' selected' : 'Nobody selected' }}</MiText>
        <MiButton type="submit" :disabled="!picked.length">{{ cta }}</MiButton>
      </footer>
      <p v-if="started" class="mi:m-0 mi:text-[13px] mi:text-green-t" role="status">{{ started }}</p>
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

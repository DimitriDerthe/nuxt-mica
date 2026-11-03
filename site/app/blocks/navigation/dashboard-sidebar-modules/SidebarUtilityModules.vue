<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="sum-title">
    <header class="mi:grid mi:gap-0.5">
      <MiText id="sum-title" variant="title3" as="h2" weight="semibold">Sidebar utility modules</MiText>
      <MiText variant="footnote" tone="label2">Four small modules that sit between the nav and the account row; each slice is sidebar width.</MiText>
    </header>

    <div class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-3.5 mi:@[560px]:grid-cols-2 mi:@[1040px]:grid-cols-4">
      <!-- Pinned views: reorder with the arrow button, unpin with the cross. -->
      <article class="mi:[background:var(--mi-side,_var(--mi-card))] mi:grid mi:content-start mi:gap-2.5 mi:p-3.5 mi:rounded-lg mi:shadow-[var(--mi-sh1),_inset_0_0_0_1px_var(--mi-sep)]" aria-labelledby="sum-pins">
        <div class="mi:flex mi:items-center mi:justify-between mi:gap-2">
          <MiText id="sum-pins" variant="caption" tone="label2" weight="semibold" as="h3">Pinned</MiText>
          <MiText as="span" variant="caption2" tone="label3" tabular>{{ pins.length }}/5</MiText>
        </div>
        <TransitionGroup tag="ul" move-class="mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:absolute" leave-to-class="mi:opacity-0" class="mi:relative mi:grid mi:gap-0.5 mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="(p, i) in pins" :key="p.id" class="mi:flex mi:items-center mi:gap-2 mi:min-h-8 mi:ps-1.5 mi:rounded-[8px] mi:hover:[background:var(--mi-fill4)]">
            <span class="mi:w-2 mi:h-2 mi:flex-[none] mi:rounded-[3px]" :style="{ background: `var(--mi-${p.color})` }" aria-hidden="true" />
            <a href="#" class="mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:text-[13px] mi:font-medium mi:text-inherit mi:[text-decoration:none] mi:whitespace-nowrap mi:text-ellipsis mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px]" @click.prevent>{{ p.label }}</a>
            <MiIconButton :label="`Move ${p.label} up`" variant="plain" size="small" :disabled="i === 0" @click="up(i)"><MiIcon name="arrow-up" :size="13" /></MiIconButton>
            <MiIconButton :label="`Unpin ${p.label}`" variant="plain" size="small" @click="unpin(p.id)"><MiIcon name="close" :size="13" /></MiIconButton>
          </li>
        </TransitionGroup>
        <MiText v-if="!pins.length" variant="caption" tone="label3">Pin a view from its ··· menu.</MiText>
      </article>

      <!-- Up next: the coming meeting, with a join button that only lights up close to the start. -->
      <article class="mi:[background:var(--mi-side,_var(--mi-card))] mi:grid mi:content-start mi:gap-2.5 mi:p-3.5 mi:rounded-lg mi:shadow-[var(--mi-sh1),_inset_0_0_0_1px_var(--mi-sep)]" aria-labelledby="sum-next">
        <MiText id="sum-next" variant="caption" tone="label2" weight="semibold" as="h3">Up next</MiText>
        <ol class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="m in meetings" :key="m.id" class="mi:flex mi:items-center mi:gap-2.5 mi:py-2 mi:px-2.5 mi:rounded-[10px]" :class="m.soon ? 'mi:[background:var(--mi-p-tint)] mi:shadow-[inset_3px_0_0_var(--mi-p)]' : 'mi:[background:var(--mi-fill4)]'">
            <span class="mi:grid mi:flex-[none] mi:tabular-nums mi:leading-[1.2]"><b class="mi:text-[13px]">{{ m.time }}</b><small class="mi:text-[11px] mi:text-label2">{{ m.length }}</small></span>
            <span class="mi:grid mi:gap-1 mi:flex-1 mi:min-w-0">
              <MiText as="span" variant="footnote" weight="semibold" :lines="1">{{ m.title }}</MiText>
              <MiAvatarGroup :items="m.people" :max="3" size="xs" :label="`${m.people.length} attendees`" />
            </span>
            <MiButton v-if="m.soon" size="mini" :aria-label="`Join ${m.title}`">Join</MiButton>
          </li>
        </ol>
      </article>

      <!-- Quick capture: a note goes to the inbox without leaving the page. -->
      <article class="mi:[background:var(--mi-side,_var(--mi-card))] mi:grid mi:content-start mi:gap-2.5 mi:p-3.5 mi:rounded-lg mi:shadow-[var(--mi-sh1),_inset_0_0_0_1px_var(--mi-sep)]" aria-labelledby="sum-cap">
        <MiText id="sum-cap" variant="caption" tone="label2" weight="semibold" as="h3">Quick capture</MiText>
        <form class="mi:flex mi:items-center mi:gap-1.5" @submit.prevent="capture">
          <MiInput v-model="note" size="sm" placeholder="Jot something down" aria-label="Note" class="mi:flex-1! mi:min-w-0!" />
          <MiIconButton label="Save to inbox" variant="tinted" size="small" type="submit" :disabled="!note.trim()"><MiIcon name="plus" :size="14" /></MiIconButton>
        </form>
        <p class="mi:flex mi:items-center mi:gap-1.5 mi:m-0 mi:text-[12px] mi:text-label2" aria-live="polite">
          <MiIcon name="tray" :size="14" />
          <span class="mi:overflow-hidden mi:min-w-0 mi:whitespace-nowrap mi:text-ellipsis">{{ inbox }} in inbox<template v-if="last"> · added “{{ last }}”</template></span>
        </p>
      </article>

      <!-- Trial: days left as a meter, the seats in use, one upgrade action. -->
      <article class="mi:[background:linear-gradient(160deg,_var(--mi-p-tint),_var(--mi-card)_70%)] mi:grid mi:content-start mi:gap-2.5 mi:p-3.5 mi:rounded-lg mi:shadow-[var(--mi-sh1),_inset_0_0_0_1px_var(--mi-sep)]" aria-labelledby="sum-trial">
        <div class="mi:flex mi:items-center mi:justify-between mi:gap-2">
          <MiText id="sum-trial" variant="caption" weight="semibold" as="h3">Team trial</MiText>
          <MiBadge :label="`${daysLeft} days left`" tone="primary" variant="solid" />
        </div>
        <div class="mi:grid mi:grid-cols-[repeat(14,_1fr)] mi:gap-[3px]" role="meter" aria-label="Trial days used" :aria-valuenow="trialDays - daysLeft" aria-valuemin="0" :aria-valuemax="trialDays">
          <span class="mi:h-3.5 mi:rounded-[3px]" v-for="d in trialDays" :key="d" :class="d <= trialDays - daysLeft ? 'mi:[background:var(--mi-p)]' : 'mi:[background:var(--mi-fill3)]'" />
        </div>
        <MiText variant="caption" tone="label2">7 of 10 seats used · ends Friday 19 November</MiText>
        <MiButton size="small" block>Choose a plan</MiButton>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type Dot = 'blue' | 'orange' | 'green' | 'purple' | 'pink'
interface Pin { id: string, label: string, color: Dot }
interface Meeting { id: string, time: string, length: string, title: string, soon: boolean, people: { name: string, tone: 'auto' }[] }

const people = (...names: string[]): Meeting['people'] => names.map(name => ({ name, tone: 'auto' }))

const pins = ref<Pin[]>([
  { id: 'p1', label: 'Q4 launch board', color: 'orange' },
  { id: 'p2', label: 'Bugs assigned to me', color: 'pink' },
  { id: 'p3', label: 'Design review queue', color: 'purple' },
  { id: 'p4', label: 'Customer interviews', color: 'green' }
])
const meetings: Meeting[] = [
  { id: 'm1', time: '14:30', length: '25 min', title: 'Pricing page critique', soon: true, people: people('Aiko Tanaka', 'Rafael Costa', 'Mira Patel', 'Jonas Weber') },
  { id: 'm2', time: '16:00', length: '45 min', title: 'Sprint 42 planning', soon: false, people: people('Lea Fischer', 'Omar Haddad') }
]
const trialDays = 14
const daysLeft = 5

const note = ref('')
const last = ref('')
const inbox = ref(12)

function up(i: number) {
  const list = pins.value
  if (i > 0) [list[i - 1], list[i]] = [list[i]!, list[i - 1]!]
}
function unpin(id: string) { pins.value = pins.value.filter(p => p.id !== id) }
function capture() {
  const text = note.value.trim()
  if (!text) return
  inbox.value++
  last.value = text.length > 28 ? text.slice(0, 27) + '…' : text
  note.value = ''
}
</script>


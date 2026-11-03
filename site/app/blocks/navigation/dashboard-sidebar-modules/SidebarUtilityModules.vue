<template>
  <section class="sum" aria-labelledby="sum-title">
    <header class="sum__head">
      <MiText id="sum-title" variant="title3" as="h2" weight="semibold">Sidebar utility modules</MiText>
      <MiText variant="footnote" tone="label2">Four small modules that sit between the nav and the account row; each slice is sidebar width.</MiText>
    </header>

    <div class="sum__rack">
      <!-- Pinned views: reorder with the arrow button, unpin with the cross. -->
      <article class="sum__slice" aria-labelledby="sum-pins">
        <div class="sum__slice-head">
          <MiText id="sum-pins" variant="caption" tone="label2" weight="semibold" as="h3">Pinned</MiText>
          <MiText as="span" variant="caption2" tone="label3" tabular>{{ pins.length }}/5</MiText>
        </div>
        <TransitionGroup tag="ul" name="sum-move" class="sum__pins">
          <li v-for="(p, i) in pins" :key="p.id" class="sum__pin">
            <span class="sum__dot" :style="{ background: `var(--mi-${p.color})` }" aria-hidden="true" />
            <a href="#" class="sum__pin-link" @click.prevent>{{ p.label }}</a>
            <MiIconButton :label="`Move ${p.label} up`" variant="plain" size="small" :disabled="i === 0" @click="up(i)"><MiIcon name="arrow-up" :size="13" /></MiIconButton>
            <MiIconButton :label="`Unpin ${p.label}`" variant="plain" size="small" @click="unpin(p.id)"><MiIcon name="close" :size="13" /></MiIconButton>
          </li>
        </TransitionGroup>
        <MiText v-if="!pins.length" variant="caption" tone="label3">Pin a view from its ··· menu.</MiText>
      </article>

      <!-- Up next: the coming meeting, with a join button that only lights up close to the start. -->
      <article class="sum__slice" aria-labelledby="sum-next">
        <MiText id="sum-next" variant="caption" tone="label2" weight="semibold" as="h3">Up next</MiText>
        <ol class="sum__agenda">
          <li v-for="m in meetings" :key="m.id" class="sum__meet" :class="{ 'is-soon': m.soon }">
            <span class="sum__when"><b>{{ m.time }}</b><small>{{ m.length }}</small></span>
            <span class="sum__what">
              <MiText as="span" variant="footnote" weight="semibold" :lines="1">{{ m.title }}</MiText>
              <MiAvatarGroup :items="m.people" :max="3" size="xs" :label="`${m.people.length} attendees`" />
            </span>
            <MiButton v-if="m.soon" size="mini" :aria-label="`Join ${m.title}`">Join</MiButton>
          </li>
        </ol>
      </article>

      <!-- Quick capture: a note goes to the inbox without leaving the page. -->
      <article class="sum__slice" aria-labelledby="sum-cap">
        <MiText id="sum-cap" variant="caption" tone="label2" weight="semibold" as="h3">Quick capture</MiText>
        <form class="sum__cap" @submit.prevent="capture">
          <MiInput v-model="note" size="sm" placeholder="Jot something down" aria-label="Note" />
          <MiIconButton label="Save to inbox" variant="tinted" size="small" type="submit" :disabled="!note.trim()"><MiIcon name="plus" :size="14" /></MiIconButton>
        </form>
        <p class="sum__saved" aria-live="polite">
          <MiIcon name="tray" :size="14" />
          <span>{{ inbox }} in inbox<template v-if="last"> · added “{{ last }}”</template></span>
        </p>
      </article>

      <!-- Trial: days left as a meter, the seats in use, one upgrade action. -->
      <article class="sum__slice sum__trial" aria-labelledby="sum-trial">
        <div class="sum__slice-head">
          <MiText id="sum-trial" variant="caption" weight="semibold" as="h3">Team trial</MiText>
          <MiBadge :label="`${daysLeft} days left`" tone="primary" variant="solid" />
        </div>
        <div class="sum__days" role="meter" aria-label="Trial days used" :aria-valuenow="trialDays - daysLeft" aria-valuemin="0" :aria-valuemax="trialDays">
          <span v-for="d in trialDays" :key="d" :class="{ 'is-used': d <= trialDays - daysLeft }" />
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

<style scoped>
.sum { container-type: inline-size; display: grid; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }
.sum__head { display: grid; gap: 2px; }
.sum__rack { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
.sum__slice { display: grid; align-content: start; gap: 10px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-side, var(--mi-card)); box-shadow: var(--mi-sh1), inset 0 0 0 1px var(--mi-sep); }
.sum__slice-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }

.sum__pins { position: relative; display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }
.sum__pin { display: flex; align-items: center; gap: 8px; min-height: 32px; padding-inline-start: 6px; border-radius: 8px; }
.sum__pin:hover { background: var(--mi-fill4); }
.sum__dot { width: 8px; height: 8px; flex: none; border-radius: 3px; }
.sum__pin-link { flex: 1; min-width: 0; overflow: hidden; font-size: 13px; font-weight: 500; color: inherit; text-decoration: none; white-space: nowrap; text-overflow: ellipsis; }
.sum__pin-link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; border-radius: 4px; }
.sum-move-move { transition: transform var(--mi-dur-3) var(--mi-spring); }
.sum-move-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease); position: absolute; }
.sum-move-leave-to { opacity: 0; }

.sum__agenda { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.sum__meet { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; background: var(--mi-fill4); }
.sum__meet.is-soon { background: var(--mi-p-tint); box-shadow: inset 3px 0 0 var(--mi-p); }
.sum__when { display: grid; flex: none; font-variant-numeric: tabular-nums; line-height: 1.2; }
.sum__when b { font-size: 13px; }
.sum__when small { font-size: 11px; color: var(--mi-label2); }
.sum__what { display: grid; gap: 4px; flex: 1; min-width: 0; }

.sum__cap { display: flex; align-items: center; gap: 6px; }
.sum__cap > :first-child { flex: 1; min-width: 0; }
.sum__saved { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 12px; color: var(--mi-label2); }
.sum__saved span { min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

.sum__trial { background: linear-gradient(160deg, var(--mi-p-tint), var(--mi-card) 70%); }
.sum__days { display: grid; grid-template-columns: repeat(14, 1fr); gap: 3px; }
.sum__days span { height: 14px; border-radius: 3px; background: var(--mi-fill3); }
.sum__days span.is-used { background: var(--mi-p); }

@container (min-width: 560px) { .sum__rack { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 1040px) { .sum__rack { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
</style>

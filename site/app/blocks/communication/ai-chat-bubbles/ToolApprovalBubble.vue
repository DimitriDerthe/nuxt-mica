<template>
  <section class="tab" aria-labelledby="tab-title">
    <h2 id="tab-title" class="tab__sr">Assistant action awaiting approval</h2>
    <div class="tab__thread">
      <MiMessage align="end" label="You">
        <MiBubble align="end" variant="secondary">Move tomorrow's 1:1s with my reports to Thursday afternoon and let them know.</MiBubble>
      </MiMessage>

      <article class="tab__answer" aria-labelledby="tab-who" :aria-busy="state === 'running' ? 'true' : undefined">
        <header class="tab__who">
          <span class="tab__mark" aria-hidden="true"><MiIcon name="calendar" :size="15" /></span>
          <MiText id="tab-who" variant="subheadline" weight="semibold">Assistant</MiText>
          <MiBadge v-if="state === 'pending'" tone="warning" label="Needs your OK" />
        </header>
        <p class="tab__p">I found 3 one-on-ones tomorrow. Thursday 14:00 to 16:30 is free for everyone. Here is what I'll change:</p>

        <!-- The proposed tool call, shown as a reviewable diff of calendar slots. -->
        <div class="tab__action" :class="'is-' + state">
          <div class="tab__action-head">
            <MiText variant="caption" tone="label2" weight="semibold">calendar.reschedule · {{ included.length }} of {{ events.length }} events</MiText>
          </div>
          <ul class="tab__events">
            <li v-for="e in events" :key="e.id" class="tab__event" :class="{ 'is-off': !picked[e.id] }">
              <MiCheckbox v-model="picked[e.id]" :label="e.who" :disabled="state !== 'pending'" />
              <span class="tab__slots">
                <s>{{ e.from }}</s>
                <MiIcon name="arrow-right" :size="13" />
                <strong>{{ e.to }}</strong>
              </span>
            </li>
          </ul>
          <MiCheckbox v-model="notify" label="Send each person a short note" description="“Moving our 1:1 to Thursday, same agenda. Shout if it clashes.”" :disabled="state !== 'pending'" />
        </div>

        <div class="tab__status" aria-live="polite">
          <div v-if="state === 'pending'" class="tab__buttons">
            <MiButton variant="gray" size="small" @click="state = 'denied'">Don't change anything</MiButton>
            <MiButton size="small" :disabled="!included.length" @click="approve">Approve {{ included.length }} {{ included.length === 1 ? 'change' : 'changes' }}</MiButton>
          </div>
          <MiShimmerText v-else-if="state === 'running'" :text="`Moving ${included.length} events…`" class="tab__shimmer" />
          <div v-else-if="state === 'done'" class="tab__result">
            <MiIcon name="check-circle-fill" :size="18" class="tab__ok" />
            <MiText variant="footnote">Moved {{ included.length }} {{ included.length === 1 ? 'event' : 'events' }} to Thursday{{ notify ? ' and notified attendees' : '' }}.</MiText>
            <MiButton variant="plain" size="small" @click="reset">Undo</MiButton>
          </div>
          <div v-else class="tab__result">
            <MiText variant="footnote" tone="label2">Okay, your calendar is unchanged.</MiText>
            <MiButton variant="plain" size="small" @click="reset">Review again</MiButton>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'

interface CalEvent { id: string, who: string, from: string, to: string }
type State = 'pending' | 'running' | 'done' | 'denied'

const events: CalEvent[] = [
  { id: 'ak', who: 'Amara Kone', from: 'Wed 10:00', to: 'Thu 14:00' },
  { id: 'lb', who: 'Luca Bianchi', from: 'Wed 11:30', to: 'Thu 14:45' },
  { id: 'sy', who: 'Sora Yamada', from: 'Wed 16:00', to: 'Thu 15:30' }
]
const picked = reactive<Record<string, boolean>>({ ak: true, lb: true, sy: true })
const notify = ref(true)
const state = ref<State>('pending')
const included = computed(() => events.filter(e => picked[e.id]))

// Stand-in for the real tool call; cleared if the block unmounts mid-run.
let timer: ReturnType<typeof setTimeout> | undefined
function approve() {
  state.value = 'running'
  timer = setTimeout(() => { state.value = 'done' }, 1400)
}
function reset() { clearTimeout(timer); state.value = 'pending' }
onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.tab { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.tab__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.tab__thread { display: grid; gap: 18px; max-width: 680px; margin-inline: auto; }
.tab__answer { display: grid; gap: 12px; min-width: 0; }
.tab__who { display: flex; align-items: center; gap: 8px; }
.tab__mark { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 8px; color: var(--mi-p-on); background: linear-gradient(135deg, var(--mi-p), var(--mi-s)); }
.tab__p { margin: 0; font-size: 15px; line-height: 1.55; }

.tab__action { display: grid; gap: 12px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: inset 0 0 0 1px var(--mi-sep), var(--mi-sh1); }
.tab__action.is-pending { box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--mi-orange) 55%, transparent), var(--mi-sh1); }
.tab__action-head { display: flex; align-items: center; gap: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.tab__events { display: grid; margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.tab__event { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px 12px; padding: 10px 12px; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.tab__event + .tab__event { border-top: 1px solid var(--mi-sep); }
.tab__event.is-off { opacity: .55; }
.tab__slots { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-variant-numeric: tabular-nums; }
.tab__slots s { color: var(--mi-label3); }
.tab__slots strong { color: var(--mi-p-text); font-weight: 600; }

.tab__status { min-height: 36px; }
.tab__buttons { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.tab__shimmer { font-size: 14px; color: var(--mi-label2); }
.tab__result { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.tab__ok { color: var(--mi-green); }
</style>

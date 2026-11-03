<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="tab-title">
    <h2 id="tab-title" class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Assistant action awaiting approval</h2>
    <div class="mi:grid mi:gap-4.5 mi:max-w-170 mi:mx-auto">
      <MiMessage align="end" label="You">
        <MiBubble align="end" variant="secondary">Move tomorrow's 1:1s with my reports to Thursday afternoon and let them know.</MiBubble>
      </MiMessage>

      <article class="mi:grid mi:gap-3 mi:min-w-0" aria-labelledby="tab-who" :aria-busy="state === 'running' ? 'true' : undefined">
        <header class="mi:flex mi:items-center mi:gap-2">
          <span class="mi:grid mi:place-items-center mi:w-6.5 mi:h-6.5 mi:rounded-[8px] mi:text-p-on mi:[background:linear-gradient(135deg,_var(--mi-p),_var(--mi-s))]" aria-hidden="true"><MiIcon name="calendar" :size="15" /></span>
          <MiText id="tab-who" variant="subheadline" weight="semibold">Assistant</MiText>
          <MiBadge v-if="state === 'pending'" tone="warning" label="Needs your OK" />
        </header>
        <p class="mi:m-0 mi:text-[15px] mi:leading-[1.55]">I found 3 one-on-ones tomorrow. Thursday 14:00 to 16:30 is free for everyone. Here is what I'll change:</p>

        <!-- The proposed tool call, shown as a reviewable diff of calendar slots. -->
        <div class="mi:grid mi:gap-3 mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-card)]" :class="state === 'pending' ? 'mi:shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,_var(--mi-orange)_55%,_transparent),_var(--mi-sh1)]' : 'mi:shadow-[inset_0_0_0_1px_var(--mi-sep),_var(--mi-sh1)]'">
          <div class="mi:flex mi:items-center mi:gap-2 mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace]">
            <MiText variant="caption" tone="label2" weight="semibold">calendar.reschedule · {{ included.length }} of {{ events.length }} events</MiText>
          </div>
          <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:rounded-md mi:[background:var(--mi-fill4)]">
            <li v-for="e in events" :key="e.id" class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-1 mi:gap-x-3 mi:py-2.5 mi:px-3 mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:not-first:border-t mi:not-first:border-t-sep" :class="picked[e.id] ? '' : 'mi:opacity-55'">
              <MiCheckbox v-model="picked[e.id]" :label="e.who" :disabled="state !== 'pending'" />
              <span class="mi:inline-flex mi:items-center mi:gap-1.5 mi:text-[13px] mi:tabular-nums">
                <s class="mi:text-label3">{{ e.from }}</s>
                <MiIcon name="arrow-right" :size="13" />
                <strong class="mi:text-p-text mi:font-semibold">{{ e.to }}</strong>
              </span>
            </li>
          </ul>
          <MiCheckbox v-model="notify" label="Send each person a short note" description="“Moving our 1:1 to Thursday, same agenda. Shout if it clashes.”" :disabled="state !== 'pending'" />
        </div>

        <div class="mi:min-h-9" aria-live="polite">
          <div v-if="state === 'pending'" class="mi:flex mi:flex-wrap mi:[justify-content:flex-end] mi:gap-2">
            <MiButton variant="gray" size="small" @click="state = 'denied'">Don't change anything</MiButton>
            <MiButton size="small" :disabled="!included.length" @click="approve">Approve {{ included.length }} {{ included.length === 1 ? 'change' : 'changes' }}</MiButton>
          </div>
          <MiShimmerText v-else-if="state === 'running'" :text="`Moving ${included.length} events…`" class="mi:text-[14px] mi:text-label2!" />
          <div v-else-if="state === 'done'" class="mi:flex mi:flex-wrap mi:items-center mi:gap-2">
            <MiIcon name="check-circle-fill" :size="18" class="mi:text-green" />
            <MiText variant="footnote">Moved {{ included.length }} {{ included.length === 1 ? 'event' : 'events' }} to Thursday{{ notify ? ' and notified attendees' : '' }}.</MiText>
            <MiButton variant="plain" size="small" @click="reset">Undo</MiButton>
          </div>
          <div v-else class="mi:flex mi:flex-wrap mi:items-center mi:gap-2">
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

<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="cvo-title">
    <div class="mi:grid mi:gap-5 mi:@[820px]:grid-cols-[220px_minmax(0,_1fr)] mi:@[820px]:gap-7 mi:@[820px]:items-start mi:@[1080px]:grid-cols-[260px_minmax(0,_760px)] mi:@[1080px]:justify-center">
      <!-- Topic rail: every answer stays one click from being changed. -->
      <aside class="mi:hidden mi:@[820px]:grid mi:@[820px]:gap-3 mi:@[820px]:pt-1.5" aria-label="Setup topics">
        <MiText as="p" variant="caption" weight="semibold" tone="label2" class="mi:@[820px]:mt-0! mi:@[820px]:mr-0! mi:@[820px]:mb-0.5! mi:@[820px]:ml-2.5! mi:@[820px]:uppercase mi:@[820px]:tracking-[.06em]! mi:@[820px]:text-[11px]!">Your setup</MiText>
        <ol class="mi:@[820px]:grid mi:@[820px]:gap-0.5 mi:@[820px]:m-0 mi:@[820px]:p-0 mi:@[820px]:[list-style:none]">
          <li v-for="(q, i) in questions" :key="q.id">
            <button
              type="button" class="mi:@[820px]:grid mi:@[820px]:grid-cols-[auto_minmax(0,_1fr)] mi:@[820px]:items-start mi:@[820px]:gap-2.5 mi:@[820px]:w-full mi:@[820px]:p-2.5 mi:@[820px]:[border:0] mi:@[820px]:rounded-[12px] mi:@[820px]:text-start mi:@[820px]:cursor-pointer mi:@[820px]:[font:inherit] mi:@[820px]:text-inherit mi:@[820px]:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:@[820px]:disabled:cursor-default mi:@[820px]:[&:not(:disabled):hover]:[background:var(--mi-fill4)] mi:@[820px]:focus-visible:[outline:2px_solid_var(--mi-p)] mi:@[820px]:focus-visible:outline-offset-[-2px] " :class="activeIndex === i ? 'mi:@[820px]:[background:var(--mi-p-tint)]' : 'mi:@[820px]:[background:none]'"
              :disabled="!hasAnswer(q.id)" @click="edit(i)"
            >
              <span class="mi:@[820px]:grid mi:@[820px]:place-items-center mi:@[820px]:w-5 mi:@[820px]:h-5 mi:@[820px]:mt-px mi:@[820px]:rounded-[50%] mi:@[820px]:text-[11px] mi:@[820px]:font-semibold mi:@[820px]:tabular-nums" :class="activeIndex === i ? 'mi:@[820px]:text-p-text mi:@[820px]:shadow-[inset_0_0_0_1.5px_var(--mi-p)] mi:@[820px]:[background:none]' : hasAnswer(q.id) ? 'mi:@[820px]:text-[color:var(--mi-p-on,_var(--mi-card))] mi:@[820px]:[background:var(--mi-p)] mi:@[820px]:shadow-none' : 'mi:@[820px]:text-label3 mi:@[820px]:shadow-[inset_0_0_0_1.5px_var(--mi-fill)]'" aria-hidden="true">
                <MiIcon v-if="hasAnswer(q.id)" name="check" :size="11" :weight="3" />
                <template v-else>{{ i + 1 }}</template>
              </span>
              <span class="mi:@[820px]:grid mi:@[820px]:gap-px mi:@[820px]:min-w-0">
                <span class="mi:@[820px]:text-[14px] mi:@[820px]:font-semibold">{{ q.topic }}</span>
                <span class="mi:@[820px]:overflow-hidden mi:@[820px]:text-ellipsis mi:@[820px]:whitespace-nowrap mi:@[820px]:text-[12px] mi:@[820px]:text-label2">{{ hasAnswer(q.id) ? replyText(q) : (activeIndex === i ? 'Answering now' : 'Not yet') }}</span>
              </span>
            </button>
          </li>
        </ol>
        <MiButton variant="plain" size="small" class="mi:@[820px]:justify-self-start mi:@[820px]:ml-0.5" @click="restart">Start over</MiButton>
      </aside>

      <div class="mi:grid mi:grid-rows-[auto_minmax(0,_1fr)] mi:h-150 mi:overflow-hidden mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep),_var(--mi-sh2)] mi:@[820px]:h-155">
        <header class="mi:relative mi:flex mi:items-center mi:gap-3 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep mi:@[820px]:py-4 mi:@[820px]:px-5.5">
          <MiAvatar name="Wren" initials="W" size="sm" tone="primary" decorative />
          <div class="mi:grid mi:gap-px mi:flex-1 mi:min-w-0">
            <MiText id="cvo-title" as="h2" variant="headline" weight="semibold">Set up Fernway with Wren</MiText>
            <MiText variant="caption" tone="label2" class="mi:tabular-nums">{{ answeredCount }} of {{ questions.length }} answered · about a minute</MiText>
          </div>
          <MiIconButton label="Start over" variant="gray" size="small" class="mi:@[820px]:hidden!" @click="restart">
            <MiIcon name="arrow-left" :size="14" />
          </MiIconButton>
          <span class="mi:absolute mi:left-0 mi:right-0 mi:-bottom-px mi:h-0.5 mi:overflow-hidden" aria-hidden="true"><span class="mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:block mi:h-full mi:[background:linear-gradient(90deg,_var(--mi-p),_var(--mi-s))]" :style="{ transform: `scaleX(${answeredCount / questions.length})` }" /></span>
        </header>

        <MiMessageScroller class="mi:min-h-0 mi:h-full" label="Setup conversation" :busy="typing">
          <template v-for="(q, i) in visible" :key="q.id">
            <MiMessageScrollerItem :message-id="'cvo-q-' + q.id">
              <MiMessage align="start" :label="'Wren'">
                <template #avatar><MiAvatar name="Wren" initials="W" size="xs" tone="primary" decorative /></template>
                <MiBubble variant="muted">{{ promptText(q, i) }}</MiBubble>
              </MiMessage>
            </MiMessageScrollerItem>

            <!-- The answer: a reply bubble, or the tappable chips while this question is open. -->
            <MiMessageScrollerItem v-if="hasAnswer(q.id) && activeIndex !== i" :message-id="'cvo-a-' + q.id" scroll-anchor>
              <MiMessage align="end" label="You">
                <MiBubble align="end" class="mi:max-w-full! mi:font-medium">{{ replyText(q) }}</MiBubble>
                <template #footer>
                  <button type="button" class="mi:inline-flex mi:items-center mi:gap-1 mi:py-0.5 mi:px-1.5 mi:[border:0] mi:rounded-[6px] mi:cursor-pointer mi:[font:500_12px/1.2_var(--mi-font)] mi:text-label2 mi:[background:none] mi:hover:text-p-text mi:focus-visible:[outline:2px_solid_var(--mi-p)]" :aria-label="`Change answer: ${q.topic}`" @click="edit(i)">
                    <MiIcon name="pencil" :size="12" /> Edit
                  </button>
                </template>
              </MiMessage>
            </MiMessageScrollerItem>
            <MiMessageScrollerItem v-else-if="activeIndex === i" :message-id="'cvo-c-' + q.id">
              <div class="mi:[--mi-in-y:8px] mi:animate-[in_420ms_var(--mi-spring)_both] mi:motion-reduce:animate-none mi:flex mi:flex-wrap mi:[justify-content:flex-end] mi:items-center mi:gap-2 mi:mt-1 mi:mr-0 mi:mb-2 mi:ml-auto mi:max-w-[92%]" role="group" :aria-label="q.topic + ' options'">
                <MiChip
                  v-for="c in q.choices" :key="c" selectable :label="c" tone="primary"
                  :model-value="q.multi ? draft.includes(c) : answers[q.id] === c"
                  @update:model-value="choose(q, c)"
                />
                <MiButton v-if="q.multi" size="small" class="mi:ml-1" @click="commitMulti(q)">
                  {{ draft.length ? `Send ${draft.length}` : 'None for now' }}
                  <template #trailing><MiIcon name="arrow-up" :size="13" /></template>
                </MiButton>
              </div>
            </MiMessageScrollerItem>
          </template>

          <MiMessageScrollerItem v-if="typing" message-id="cvo-typing">
            <MiMessage align="start" label="Wren is typing">
              <template #avatar><MiAvatar name="Wren" initials="W" size="xs" tone="primary" decorative /></template>
              <MiBubble variant="muted"><span class="mi:inline-flex mi:gap-1 mi:py-1 mi:px-0.5" aria-label="Wren is typing"><i class="mi:w-1.5 mi:rounded-[50%] mi:opacity-35 mi:[&:nth-child(2)]:[animation-delay:.15s] mi:[&:nth-child(3)]:[animation-delay:.3s] mi:h-1.5 mi:[background:currentColor] mi:[--mi-float:-2px] mi:animate-[float_1s_var(--mi-ease)_infinite] mi:motion-reduce:animate-none" /><i class="mi:w-1.5 mi:rounded-[50%] mi:opacity-35 mi:[&:nth-child(2)]:[animation-delay:.15s] mi:[&:nth-child(3)]:[animation-delay:.3s] mi:h-1.5 mi:[background:currentColor] mi:[--mi-float:-2px] mi:animate-[float_1s_var(--mi-ease)_infinite] mi:motion-reduce:animate-none" /><i class="mi:w-1.5 mi:rounded-[50%] mi:opacity-35 mi:[&:nth-child(2)]:[animation-delay:.15s] mi:[&:nth-child(3)]:[animation-delay:.3s] mi:h-1.5 mi:[background:currentColor] mi:[--mi-float:-2px] mi:animate-[float_1s_var(--mi-ease)_infinite] mi:motion-reduce:animate-none" /></span></MiBubble>
            </MiMessage>
          </MiMessageScrollerItem>

          <MiMessageScrollerItem v-if="complete" message-id="cvo-summary">
            <div class="mi:[--mi-in-y:8px] mi:animate-[in_480ms_var(--mi-spring)_both] mi:motion-reduce:animate-none mi:grid mi:gap-3.5 mi:mt-2 mi:mx-0 mi:mb-3 mi:p-4.5 mi:rounded-lg mi:[background:radial-gradient(100%_80%_at_0%_0%,_var(--mi-p-tint),_transparent_60%),_var(--mi-page)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:@[820px]:py-5 mi:@[820px]:px-5.5">
              <div class="mi:grid mi:gap-0.5">
                <MiText as="h3" variant="headline" weight="semibold">{{ created ? 'Your workspace is ready' : "Here's what I'll set up" }}</MiText>
                <MiText variant="footnote" tone="label2">{{ created ? 'Opening the launch board with three starter milestones.' : 'Change anything before I build it.' }}</MiText>
              </div>
              <dl class="mi:grid mi:m-0">
                <div v-for="(q, i) in questions" :key="q.id" class="mi:grid mi:grid-cols-[96px_minmax(0,_1fr)_auto] mi:items-baseline mi:gap-2.5 mi:py-[9px] mi:px-0 mi:border-t mi:border-t-sep mi:@[820px]:grid-cols-[120px_minmax(0,_1fr)_auto]">
                  <dt class="mi:text-label2 mi:text-[12px] mi:font-medium">{{ q.topic }}</dt>
                  <dd class="mi:min-w-0 mi:m-0 mi:text-[14px] mi:font-semibold">{{ replyText(q) }}</dd>
                  <button v-if="!created" type="button" class="mi:py-0.5 mi:px-1 mi:[border:0] mi:rounded-[6px] mi:cursor-pointer mi:[font:600_12px/1.2_var(--mi-font)] mi:text-p-text mi:[background:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)]" :aria-label="`Change ${q.topic}`" @click="edit(i)">Change</button>
                </div>
              </dl>
              <MiButton v-if="!created" block :loading="building" @click="build">Create my workspace</MiButton>
            </div>
          </MiMessageScrollerItem>
        </MiMessageScroller>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'

interface Question { id: 'goal' | 'team' | 'tools' | 'digest', topic: string, choices: string[], multi?: boolean }

const questions: Question[] = [
  { id: 'goal', topic: 'Goal', choices: ['A product launch', 'Sprint work', 'Customer feedback', 'Just exploring'] },
  { id: 'team', topic: 'Team', choices: ['Just me', '2–10 people', '11–50 people', 'More than 50'] },
  { id: 'tools', topic: 'Tools', choices: ['Slack', 'GitHub', 'Linear', 'Figma', 'Notion'], multi: true },
  { id: 'digest', topic: 'Weekly digest', choices: ['Monday 9:00', 'Friday 16:00', 'No digest'] }
]

const answers = reactive<Record<string, string | string[] | undefined>>({ goal: 'A product launch', team: '2–10 people' })
const revealed = ref(3)
const editing = ref<number | null>(null)
const draft = ref<string[]>(['Slack', 'Figma'])
const typing = ref(false)
const building = ref(false)
const created = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const hasAnswer = (id: string) => answers[id] !== undefined
const visible = computed(() => questions.slice(0, revealed.value))
const answeredCount = computed(() => questions.filter(q => hasAnswer(q.id)).length)
const complete = computed(() => answeredCount.value === questions.length && !typing.value)
const activeIndex = computed(() => {
  if (editing.value !== null) return editing.value
  const i = revealed.value - 1
  return !typing.value && questions[i] && !hasAnswer(questions[i].id) ? i : -1
})

function list(items: string[]) {
  if (items.length <= 1) return items[0] ?? ''
  return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]
}
function replyText(q: Question) {
  const a = answers[q.id]
  if (Array.isArray(a)) return a.length ? list(a) : 'None for now'
  return a ?? ''
}
// Wren's next line reacts to the previous answer.
function promptText(q: Question, i: number) {
  const prev = i > 0 ? answers[questions[i - 1]!.id] : undefined
  switch (q.id) {
    case 'goal': return "Hi Amara, I'm Wren. I'll shape Fernway around how you work. What are you here to plan first?"
    case 'team': return `${prev === 'Just exploring' ? 'Happy to show you around.' : 'Good choice to start with.'} Who's planning it with you?`
    case 'tools': return `${prev === 'Just me' ? 'A solo space, then.' : 'I\'ll make room for the team.'} Which tools should Fernway talk to? Pick any.`
    default: return 'Last one. When should I send the weekly digest of what moved?'
  }
}

function advance() {
  if (editing.value !== null) { editing.value = null; return }
  if (revealed.value >= questions.length) return
  typing.value = true
  clearTimeout(timer)
  timer = setTimeout(() => { typing.value = false; revealed.value++ }, 750)
}
function choose(q: Question, c: string) {
  if (q.multi) {
    draft.value = draft.value.includes(c) ? draft.value.filter(x => x !== c) : [...draft.value, c]
    return
  }
  answers[q.id] = c
  if (revealed.value >= questions.length && editing.value === null) { typing.value = true; timer = setTimeout(() => { typing.value = false }, 600); return }
  advance()
}
function commitMulti(q: Question) {
  answers[q.id] = q.choices.filter(c => draft.value.includes(c))
  advance()
}
function edit(i: number) {
  const q = questions[i]!
  if (q.multi) draft.value = [...((answers[q.id] as string[] | undefined) ?? [])]
  editing.value = i
}
function build() {
  building.value = true
  // UI demo only: nothing is sent anywhere.
  setTimeout(() => { building.value = false; created.value = true }, 900)
}
function restart() {
  clearTimeout(timer)
  for (const q of questions) answers[q.id] = undefined
  draft.value = []
  editing.value = null
  typing.value = false
  created.value = false
  revealed.value = 1
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

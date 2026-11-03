<template>
  <section class="cvo mi:@container mi:font-mi mi:text-label" aria-labelledby="cvo-title">
    <div class="cvo__in mi:grid mi:gap-5 mi:@[820px]:grid-cols-[220px_minmax(0,_1fr)] mi:@[820px]:gap-7 mi:@[820px]:items-start mi:@[1080px]:grid-cols-[260px_minmax(0,_760px)] mi:@[1080px]:justify-center">
      <!-- Topic rail: every answer stays one click from being changed. -->
      <aside class="cvo__rail mi:hidden mi:@[820px]:grid mi:@[820px]:gap-3 mi:@[820px]:pt-1.5" aria-label="Setup topics">
        <MiText as="p" variant="caption" weight="semibold" tone="label2" class="cvo__rail-title">Your setup</MiText>
        <ol class="cvo__topics mi:@[820px]:grid mi:@[820px]:gap-0.5 mi:@[820px]:m-0 mi:@[820px]:p-0 mi:@[820px]:[list-style:none]">
          <li v-for="(q, i) in questions" :key="q.id">
            <button
              type="button" class="cvo__topic mi:@[820px]:grid mi:@[820px]:grid-cols-[auto_minmax(0,_1fr)] mi:@[820px]:items-start mi:@[820px]:gap-2.5 mi:@[820px]:w-full mi:@[820px]:p-2.5 mi:@[820px]:[border:0] mi:@[820px]:rounded-[12px] mi:@[820px]:text-start mi:@[820px]:cursor-pointer mi:@[820px]:[font:inherit] mi:@[820px]:text-inherit mi:@[820px]:[background:none] mi:@[820px]:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:@[820px]:disabled:cursor-default mi:@[820px]:[&:not(:disabled):hover]:[background:var(--mi-fill4)] mi:@[820px]:focus-visible:[outline:2px_solid_var(--mi-p)] mi:@[820px]:focus-visible:outline-offset-[-2px] mi:@[820px]:[&.is-active]:[background:var(--mi-p-tint)]" :class="{ 'is-done': hasAnswer(q.id), 'is-active': activeIndex === i }"
              :disabled="!hasAnswer(q.id)" @click="edit(i)"
            >
              <span class="cvo__topic-mark mi:@[820px]:grid mi:@[820px]:place-items-center mi:@[820px]:w-5 mi:@[820px]:h-5 mi:@[820px]:mt-px mi:@[820px]:rounded-[50%] mi:@[820px]:text-[11px] mi:@[820px]:font-semibold mi:@[820px]:text-label3 mi:@[820px]:shadow-[inset_0_0_0_1.5px_var(--mi-fill)] mi:@[820px]:tabular-nums" aria-hidden="true">
                <MiIcon v-if="hasAnswer(q.id)" name="check" :size="11" :weight="3" />
                <template v-else>{{ i + 1 }}</template>
              </span>
              <span class="cvo__topic-copy mi:@[820px]:grid mi:@[820px]:gap-px mi:@[820px]:min-w-0">
                <span class="cvo__topic-name mi:@[820px]:text-[14px] mi:@[820px]:font-semibold">{{ q.topic }}</span>
                <span class="cvo__topic-val mi:@[820px]:overflow-hidden mi:@[820px]:text-ellipsis mi:@[820px]:whitespace-nowrap mi:@[820px]:text-[12px] mi:@[820px]:text-label2">{{ hasAnswer(q.id) ? replyText(q) : (activeIndex === i ? 'Answering now' : 'Not yet') }}</span>
              </span>
            </button>
          </li>
        </ol>
        <MiButton variant="plain" size="small" class="cvo__restart mi:@[820px]:justify-self-start mi:@[820px]:ml-0.5" @click="restart">Start over</MiButton>
      </aside>

      <div class="cvo__chat mi:grid mi:grid-rows-[auto_minmax(0,_1fr)] mi:h-150 mi:overflow-hidden mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep),_var(--mi-sh2)] mi:@[820px]:h-155">
        <header class="cvo__head mi:relative mi:flex mi:items-center mi:gap-3 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep mi:@[820px]:py-4 mi:@[820px]:px-5.5">
          <MiAvatar name="Wren" initials="W" size="sm" tone="primary" decorative />
          <div class="cvo__head-copy mi:grid mi:gap-px mi:flex-1 mi:min-w-0">
            <MiText id="cvo-title" as="h2" variant="headline" weight="semibold">Set up Fernway with Wren</MiText>
            <MiText variant="caption" tone="label2" class="cvo__num">{{ answeredCount }} of {{ questions.length }} answered · about a minute</MiText>
          </div>
          <MiIconButton label="Start over" variant="gray" size="small" class="cvo__head-restart" @click="restart">
            <MiIcon name="arrow-left" :size="14" />
          </MiIconButton>
          <span class="cvo__progress mi:absolute mi:left-0 mi:right-0 mi:-bottom-px mi:h-0.5 mi:overflow-hidden" aria-hidden="true"><span class="mi:[.cvo__progress_&]:origin-left mi:[.cvo__progress_&]:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${answeredCount / questions.length})` }" /></span>
        </header>

        <MiMessageScroller class="cvo__scroller" label="Setup conversation" :busy="typing">
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
                <MiBubble align="end" class="cvo__reply">{{ replyText(q) }}</MiBubble>
                <template #footer>
                  <button type="button" class="cvo__edit mi:inline-flex mi:items-center mi:gap-1 mi:py-0.5 mi:px-1.5 mi:[border:0] mi:rounded-[6px] mi:cursor-pointer mi:[font:500_12px/1.2_var(--mi-font)] mi:text-label2 mi:[background:none] mi:hover:text-p-text mi:focus-visible:[outline:2px_solid_var(--mi-p)]" :aria-label="`Change answer: ${q.topic}`" @click="edit(i)">
                    <MiIcon name="pencil" :size="12" /> Edit
                  </button>
                </template>
              </MiMessage>
            </MiMessageScrollerItem>
            <MiMessageScrollerItem v-else-if="activeIndex === i" :message-id="'cvo-c-' + q.id">
              <div class="cvo__choices mi:flex mi:flex-wrap mi:[justify-content:flex-end] mi:items-center mi:gap-2 mi:mt-1 mi:mr-0 mi:mb-2 mi:ml-auto mi:max-w-[92%]" role="group" :aria-label="q.topic + ' options'">
                <MiChip
                  v-for="c in q.choices" :key="c" selectable :label="c" tone="primary"
                  :model-value="q.multi ? draft.includes(c) : answers[q.id] === c"
                  @update:model-value="choose(q, c)"
                />
                <MiButton v-if="q.multi" size="small" class="cvo__send mi:ml-1" @click="commitMulti(q)">
                  {{ draft.length ? `Send ${draft.length}` : 'None for now' }}
                  <template #trailing><MiIcon name="arrow-up" :size="13" /></template>
                </MiButton>
              </div>
            </MiMessageScrollerItem>
          </template>

          <MiMessageScrollerItem v-if="typing" message-id="cvo-typing">
            <MiMessage align="start" label="Wren is typing">
              <template #avatar><MiAvatar name="Wren" initials="W" size="xs" tone="primary" decorative /></template>
              <MiBubble variant="muted"><span class="cvo__dots mi:inline-flex mi:gap-1 mi:py-1 mi:px-0.5" aria-label="Wren is typing"><i class="mi:[.cvo__dots_&]:w-1.5 mi:[.cvo__dots_&]:rounded-[50%] mi:[.cvo__dots_&]:opacity-35 mi:[.cvo__dots_&:nth-child(2)]:[animation-delay:.15s] mi:[.cvo__dots_&:nth-child(3)]:[animation-delay:.3s]" /><i class="mi:[.cvo__dots_&]:w-1.5 mi:[.cvo__dots_&]:rounded-[50%] mi:[.cvo__dots_&]:opacity-35 mi:[.cvo__dots_&:nth-child(2)]:[animation-delay:.15s] mi:[.cvo__dots_&:nth-child(3)]:[animation-delay:.3s]" /><i class="mi:[.cvo__dots_&]:w-1.5 mi:[.cvo__dots_&]:rounded-[50%] mi:[.cvo__dots_&]:opacity-35 mi:[.cvo__dots_&:nth-child(2)]:[animation-delay:.15s] mi:[.cvo__dots_&:nth-child(3)]:[animation-delay:.3s]" /></span></MiBubble>
            </MiMessage>
          </MiMessageScrollerItem>

          <MiMessageScrollerItem v-if="complete" message-id="cvo-summary">
            <div class="cvo__summary mi:grid mi:gap-3.5 mi:mt-2 mi:mx-0 mi:mb-3 mi:p-4.5 mi:rounded-lg mi:[background:radial-gradient(100%_80%_at_0%_0%,_var(--mi-p-tint),_transparent_60%),_var(--mi-page)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:@[820px]:py-5 mi:@[820px]:px-5.5">
              <div class="cvo__summary-head mi:grid mi:gap-0.5">
                <MiText as="h3" variant="headline" weight="semibold">{{ created ? 'Your workspace is ready' : "Here's what I'll set up" }}</MiText>
                <MiText variant="footnote" tone="label2">{{ created ? 'Opening the launch board with three starter milestones.' : 'Change anything before I build it.' }}</MiText>
              </div>
              <dl class="cvo__facts mi:grid mi:m-0">
                <div v-for="(q, i) in questions" :key="q.id" class="cvo__fact mi:grid mi:grid-cols-[96px_minmax(0,_1fr)_auto] mi:items-baseline mi:gap-2.5 mi:py-[9px] mi:px-0 mi:border-t mi:border-t-sep mi:@[820px]:grid-cols-[120px_minmax(0,_1fr)_auto]">
                  <dt class="mi:[.cvo__fact_&]:text-label2">{{ q.topic }}</dt>
                  <dd class="mi:[.cvo__fact_&]:min-w-0">{{ replyText(q) }}</dd>
                  <button v-if="!created" type="button" class="cvo__change mi:py-0.5 mi:px-1 mi:[border:0] mi:rounded-[6px] mi:cursor-pointer mi:[font:600_12px/1.2_var(--mi-font)] mi:text-p-text mi:[background:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)]" :aria-label="`Change ${q.topic}`" @click="edit(i)">Change</button>
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

<style scoped>
.cvo__num { font-variant-numeric: tabular-nums; }
.cvo__progress span { display: block; height: 100%; background: linear-gradient(90deg, var(--mi-p), var(--mi-s)); }
.cvo__scroller { min-height: 0; height: 100%; }

/* The bubble's own max-width is a share of a shrink-wrapped column; let it take its full text width. */
.cvo__reply { max-width: 100%; font-weight: 500; }

.cvo__choices {
  animation: cvo-rise 420ms var(--mi-spring) both;
}
@keyframes cvo-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.cvo__dots i { height: 6px; background: currentColor; animation: cvo-dot 1s var(--mi-ease) infinite; }
@keyframes cvo-dot { 0%, 100% { opacity: .3; transform: translateY(0); } 40% { opacity: .9; transform: translateY(-2px); } }

/* Summary card */
.cvo__summary {
  animation: cvo-rise 480ms var(--mi-spring) both;
}
.cvo__fact dt { font-size: 12px; font-weight: 500; }
.cvo__fact dd { margin: 0; font-size: 14px; font-weight: 600; }

@container (min-width: 820px) {
  .cvo__head-restart { display: none; }
  .cvo__rail-title { margin: 0 0 2px 10px; text-transform: uppercase; letter-spacing: .06em; font-size: 11px; }
  .cvo__topic.is-done .cvo__topic-mark { color: var(--mi-p-on, var(--mi-card)); background: var(--mi-p); box-shadow: none; }
  .cvo__topic.is-active .cvo__topic-mark { color: var(--mi-p-text); box-shadow: inset 0 0 0 1.5px var(--mi-p); background: none; }
}
@media (prefers-reduced-motion: reduce) { .cvo__choices, .cvo__summary, .cvo__dots i { animation: none; } }
</style>

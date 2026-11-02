<template>
  <section class="cvo" aria-labelledby="cvo-title">
    <div class="cvo__in">
      <!-- Topic rail: every answer stays one click from being changed. -->
      <aside class="cvo__rail" aria-label="Setup topics">
        <MiText as="p" variant="caption" weight="semibold" tone="label2" class="cvo__rail-title">Your setup</MiText>
        <ol class="cvo__topics">
          <li v-for="(q, i) in questions" :key="q.id">
            <button
              type="button" class="cvo__topic" :class="{ 'is-done': hasAnswer(q.id), 'is-active': activeIndex === i }"
              :disabled="!hasAnswer(q.id)" @click="edit(i)"
            >
              <span class="cvo__topic-mark" aria-hidden="true">
                <MiIcon v-if="hasAnswer(q.id)" name="check" :size="11" :weight="3" />
                <template v-else>{{ i + 1 }}</template>
              </span>
              <span class="cvo__topic-copy">
                <span class="cvo__topic-name">{{ q.topic }}</span>
                <span class="cvo__topic-val">{{ hasAnswer(q.id) ? replyText(q) : (activeIndex === i ? 'Answering now' : 'Not yet') }}</span>
              </span>
            </button>
          </li>
        </ol>
        <MiButton variant="plain" size="small" class="cvo__restart" @click="restart">Start over</MiButton>
      </aside>

      <div class="cvo__chat">
        <header class="cvo__head">
          <MiAvatar name="Wren" initials="W" size="sm" tone="primary" decorative />
          <div class="cvo__head-copy">
            <MiText id="cvo-title" as="h2" variant="headline" weight="semibold">Set up Fernway with Wren</MiText>
            <MiText variant="caption" tone="label2" class="cvo__num">{{ answeredCount }} of {{ questions.length }} answered · about a minute</MiText>
          </div>
          <MiIconButton label="Start over" variant="gray" size="small" class="cvo__head-restart" @click="restart">
            <MiIcon name="arrow-left" :size="14" />
          </MiIconButton>
          <span class="cvo__progress" aria-hidden="true"><span :style="{ transform: `scaleX(${answeredCount / questions.length})` }" /></span>
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
                  <button type="button" class="cvo__edit" :aria-label="`Change answer: ${q.topic}`" @click="edit(i)">
                    <MiIcon name="pencil" :size="12" /> Edit
                  </button>
                </template>
              </MiMessage>
            </MiMessageScrollerItem>
            <MiMessageScrollerItem v-else-if="activeIndex === i" :message-id="'cvo-c-' + q.id">
              <div class="cvo__choices" role="group" :aria-label="q.topic + ' options'">
                <MiChip
                  v-for="c in q.choices" :key="c" selectable :label="c" tone="primary"
                  :model-value="q.multi ? draft.includes(c) : answers[q.id] === c"
                  @update:model-value="choose(q, c)"
                />
                <MiButton v-if="q.multi" size="small" class="cvo__send" @click="commitMulti(q)">
                  {{ draft.length ? `Send ${draft.length}` : 'None for now' }}
                  <template #trailing><MiIcon name="arrow-up" :size="13" /></template>
                </MiButton>
              </div>
            </MiMessageScrollerItem>
          </template>

          <MiMessageScrollerItem v-if="typing" message-id="cvo-typing">
            <MiMessage align="start" label="Wren is typing">
              <template #avatar><MiAvatar name="Wren" initials="W" size="xs" tone="primary" decorative /></template>
              <MiBubble variant="muted"><span class="cvo__dots" aria-label="Wren is typing"><i /><i /><i /></span></MiBubble>
            </MiMessage>
          </MiMessageScrollerItem>

          <MiMessageScrollerItem v-if="complete" message-id="cvo-summary">
            <div class="cvo__summary">
              <div class="cvo__summary-head">
                <MiText as="h3" variant="headline" weight="semibold">{{ created ? 'Your workspace is ready' : "Here's what I'll set up" }}</MiText>
                <MiText variant="footnote" tone="label2">{{ created ? 'Opening the launch board with three starter milestones.' : 'Change anything before I build it.' }}</MiText>
              </div>
              <dl class="cvo__facts">
                <div v-for="(q, i) in questions" :key="q.id" class="cvo__fact">
                  <dt>{{ q.topic }}</dt>
                  <dd>{{ replyText(q) }}</dd>
                  <button v-if="!created" type="button" class="cvo__change" :aria-label="`Change ${q.topic}`" @click="edit(i)">Change</button>
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
.cvo { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.cvo__in { display: grid; gap: 20px; }
.cvo__num { font-variant-numeric: tabular-nums; }

/* Rail (wide only) */
.cvo__rail { display: none; }

/* Chat window */
.cvo__chat {
  display: grid; grid-template-rows: auto minmax(0, 1fr); height: 600px; overflow: hidden;
  border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep), var(--mi-sh2);
}
.cvo__head { position: relative; display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--mi-sep); }
.cvo__head-copy { display: grid; gap: 1px; flex: 1; min-width: 0; }
.cvo__progress { position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; overflow: hidden; }
.cvo__progress span { display: block; height: 100%; background: linear-gradient(90deg, var(--mi-p), var(--mi-s)); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.cvo__scroller { min-height: 0; height: 100%; }

/* The bubble's own max-width is a share of a shrink-wrapped column; let it take its full text width. */
.cvo__reply { max-width: 100%; font-weight: 500; }
.cvo__edit {
  display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border: 0; border-radius: 6px; cursor: pointer;
  font: 500 12px/1.2 var(--mi-font); color: var(--mi-label2); background: none;
}
.cvo__edit:hover { color: var(--mi-p-text); }
.cvo__edit:focus-visible { outline: 2px solid var(--mi-p); }

.cvo__choices {
  display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 8px; margin: 4px 0 8px auto; max-width: 92%;
  animation: cvo-rise 420ms var(--mi-spring) both;
}
.cvo__send { margin-left: 4px; }
@keyframes cvo-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

.cvo__dots { display: inline-flex; gap: 4px; padding: 4px 2px; }
.cvo__dots i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: .35; animation: cvo-dot 1s var(--mi-ease) infinite; }
.cvo__dots i:nth-child(2) { animation-delay: .15s; }
.cvo__dots i:nth-child(3) { animation-delay: .3s; }
@keyframes cvo-dot { 0%, 100% { opacity: .3; transform: translateY(0); } 40% { opacity: .9; transform: translateY(-2px); } }

/* Summary card */
.cvo__summary {
  display: grid; gap: 14px; margin: 8px 0 12px; padding: 18px; border-radius: var(--mi-radius-l);
  background: radial-gradient(100% 80% at 0% 0%, var(--mi-p-tint), transparent 60%), var(--mi-page);
  box-shadow: inset 0 0 0 1px var(--mi-sep);
  animation: cvo-rise 480ms var(--mi-spring) both;
}
.cvo__summary-head { display: grid; gap: 2px; }
.cvo__facts { display: grid; margin: 0; }
.cvo__fact { display: grid; grid-template-columns: 96px minmax(0, 1fr) auto; align-items: baseline; gap: 10px; padding: 9px 0; border-top: 1px solid var(--mi-sep); }
.cvo__fact dt { font-size: 12px; font-weight: 500; color: var(--mi-label2); }
.cvo__fact dd { margin: 0; font-size: 14px; font-weight: 600; min-width: 0; }
.cvo__change { padding: 2px 4px; border: 0; border-radius: 6px; cursor: pointer; font: 600 12px/1.2 var(--mi-font); color: var(--mi-p-text); background: none; }
.cvo__change:focus-visible { outline: 2px solid var(--mi-p); }

@container (min-width: 820px) {
  .cvo__in { grid-template-columns: 220px minmax(0, 1fr); gap: 28px; align-items: start; }
  .cvo__head-restart { display: none; }
  .cvo__rail { display: grid; gap: 12px; padding-top: 6px; }
  .cvo__rail-title { margin: 0 0 2px 10px; text-transform: uppercase; letter-spacing: .06em; font-size: 11px; }
  .cvo__topics { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }
  .cvo__topic {
    display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: start; gap: 10px; width: 100%; padding: 10px; border: 0; border-radius: 12px;
    text-align: start; cursor: pointer; font: inherit; color: inherit; background: none; transition: transform var(--mi-dur-2) var(--mi-ease);
  }
  .cvo__topic:disabled { cursor: default; }
  .cvo__topic:not(:disabled):hover { background: var(--mi-fill4); }
  .cvo__topic:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
  .cvo__topic.is-active { background: var(--mi-p-tint); }
  .cvo__topic-mark {
    display: grid; place-items: center; width: 20px; height: 20px; margin-top: 1px; border-radius: 50%;
    font-size: 11px; font-weight: 600; color: var(--mi-label3); box-shadow: inset 0 0 0 1.5px var(--mi-fill); font-variant-numeric: tabular-nums;
  }
  .cvo__topic.is-done .cvo__topic-mark { color: var(--mi-p-on, var(--mi-card)); background: var(--mi-p); box-shadow: none; }
  .cvo__topic.is-active .cvo__topic-mark { color: var(--mi-p-text); box-shadow: inset 0 0 0 1.5px var(--mi-p); background: none; }
  .cvo__topic-copy { display: grid; gap: 1px; min-width: 0; }
  .cvo__topic-name { font-size: 14px; font-weight: 600; }
  .cvo__topic-val { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: var(--mi-label2); }
  .cvo__restart { justify-self: start; margin-left: 2px; }
  .cvo__chat { height: 620px; }
  .cvo__head { padding: 16px 22px; }
  .cvo__summary { padding: 20px 22px; }
  .cvo__fact { grid-template-columns: 120px minmax(0, 1fr) auto; }
}
@container (min-width: 1080px) { .cvo__in { grid-template-columns: 260px minmax(0, 760px); justify-content: center; } }
@media (prefers-reduced-motion: reduce) { .cvo__choices, .cvo__summary, .cvo__dots i { animation: none; } }
</style>

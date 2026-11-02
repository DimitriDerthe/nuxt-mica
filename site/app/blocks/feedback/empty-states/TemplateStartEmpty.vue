<template>
  <div class="tse-cq">
    <section class="tse" aria-labelledby="tse-title">
      <header class="tse__head">
        <div>
          <MiText id="tse-title" as="h2" variant="headline" weight="semibold">Projects</MiText>
          <MiText variant="caption" tone="label2">Harbour Studio · {{ created ? 1 : 0 }} {{ created ? 'project' : 'projects' }}</MiText>
        </div>
        <MiButton v-if="picked" variant="plain" size="small" @click="back">
          <template #leading><MiIcon name="chevron-left" :size="15" /></template>
          All templates
        </MiButton>
      </header>

      <!-- Step 1: nothing yet, so the page is a gallery of starting points. -->
      <div v-if="!picked" class="tse__start">
        <div class="tse__intro">
          <MiText as="h3" variant="title3" weight="semibold" balance>Start your first project from a shape that fits</MiText>
          <MiText variant="footnote" tone="label2">Templates bring their views, fields and a few sample tasks. Everything can be renamed or removed later.</MiText>
        </div>

        <ul class="tse__gallery" aria-label="Templates">
          <li v-for="t in templates" :key="t.id">
            <button type="button" class="tse__tpl" @click="pick(t.id)">
              <span class="tse__art-frame" aria-hidden="true">
                <TemplateArt :kind="t.id" :samples="true" />
              </span>
              <span class="tse__tpl-text">
                <strong>{{ t.name }}</strong>
                <span>{{ t.meta }}</span>
              </span>
            </button>
          </li>
          <li>
            <button type="button" class="tse__tpl tse__blank" @click="pick('blank')">
              <span class="tse__plus" aria-hidden="true"><MiIcon name="plus" :size="20" /></span>
              <span class="tse__tpl-text">
                <strong>Blank project</strong>
                <span>One list view, no fields</span>
              </span>
            </button>
          </li>
        </ul>

        <div class="tse__import">
          <span class="tse__import-icon" aria-hidden="true"><MiIcon name="arrow-down" :size="16" /></span>
          <MiText variant="footnote" tone="label2" class="tse__import-text">Moving from another tool? Import keeps assignees, due dates and comments.</MiText>
          <div class="tse__import-btns" role="group" aria-label="Import from">
            <MiButton v-for="s in sources" :key="s" variant="gray" size="mini">{{ s }}</MiButton>
          </div>
        </div>
      </div>

      <!-- Step 2: the chosen template, previewed with the name you type and the sample switch. -->
      <div v-else-if="!created" class="tse__preview">
        <div class="tse__stage" aria-hidden="true">
          <div class="tse__window">
            <div class="tse__window-bar">
              <i /><i /><i />
              <span>{{ name.trim() || 'Untitled project' }}</span>
            </div>
            <div class="tse__window-tabs"><span v-for="(v, n) in current.views" :key="v" :class="{ 'is-on': n === 0 }">{{ v }}</span></div>
            <div class="tse__window-body">
              <TemplateArt :kind="current.id" :samples="samples" large />
            </div>
          </div>
        </div>

        <form class="tse__form" @submit.prevent="create">
          <div class="tse__form-head">
            <MiText as="h3" variant="title3" weight="semibold">{{ current.name }}</MiText>
            <MiText variant="footnote" tone="label2">{{ current.blurb }}</MiText>
          </div>
          <MiField label="Project name" :error="name.trim() ? undefined : 'Give the project a name'">
            <template #default="{ id, describedBy }">
              <MiInput :id="id" v-model="name" :aria-describedby="describedBy" />
            </template>
          </MiField>
          <dl class="tse__includes">
            <div><dt>Views</dt><dd>{{ current.views.join(', ') }}</dd></div>
            <div><dt>Fields</dt><dd>{{ current.fields }}</dd></div>
          </dl>
          <div v-if="current.id !== 'blank'" class="tse__switch">
            <span id="tse-samples" class="tse__switch-text">
              <strong>Include sample tasks</strong>
              <span>{{ current.tasks }} tasks to show how it works</span>
            </span>
            <MiSwitch v-model="samples" size="compact" aria-labelledby="tse-samples" />
          </div>
          <MiButton type="submit" :disabled="!name.trim()" block>Create project</MiButton>
        </form>
      </div>

      <!-- Step 3: done. -->
      <div v-else class="tse__done" role="status">
        <span class="tse__done-mark" aria-hidden="true"><MiIcon name="check" :size="22" :weight="2.4" /></span>
        <MiText as="h3" variant="title3" weight="semibold" align="center">{{ name.trim() }} is ready</MiText>
        <MiText variant="footnote" tone="label2" align="center">
          {{ current.views.length }} {{ current.views.length === 1 ? 'view' : 'views' }}{{ current.id !== 'blank' && samples ? `, ${current.tasks} sample tasks` : '' }}. Invite your team from the project header.
        </MiText>
        <div class="tse__done-actions">
          <MiButton>Open project</MiButton>
          <MiButton variant="gray" @click="reset">Start over</MiButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'

type Kind = 'roadmap' | 'board' | 'calendar' | 'research' | 'blank'

const templates = [
  { id: 'roadmap' as const, name: 'Product roadmap', meta: 'Timeline · 4 views', blurb: 'Quarters on a timeline, grouped by team, with effort and confidence fields.', views: ['Timeline', 'Board', 'Table', 'Releases'], fields: 'Owner, Quarter, Effort, Confidence', tasks: 14, sample: 'Q1 roadmap' },
  { id: 'board' as const, name: 'Sprint board', meta: 'Board · 3 views', blurb: 'Two-week sprints with a board per status and a burndown.', views: ['Board', 'Backlog', 'Burndown'], fields: 'Points, Sprint, Assignee', tasks: 18, sample: 'Sprint 24' },
  { id: 'calendar' as const, name: 'Content calendar', meta: 'Calendar · 3 views', blurb: 'Posts and newsletters on a month grid, by channel.', views: ['Calendar', 'Pipeline', 'Table'], fields: 'Channel, Publish date, Writer', tasks: 12, sample: 'Spring campaign' },
  { id: 'research' as const, name: 'Customer research', meta: 'Notes · 2 views', blurb: 'Interview notes that cluster into insights you can link to work.', views: ['Insights', 'Interviews'], fields: 'Segment, Theme, Evidence', tasks: 9, sample: 'Checkout interviews' }
]
const blank = { id: 'blank' as const, name: 'Blank project', meta: '', blurb: 'One list, no custom fields. Add views when you need them.', views: ['List'], fields: 'None yet', tasks: 0, sample: 'New project' }
const sources = ['CSV', 'Trello', 'Asana', 'Jira']

const picked = ref<Kind | null>(null)
const created = ref(false)
const name = ref('')
const samples = ref(true)
const current = computed(() => templates.find(t => t.id === picked.value) ?? blank)

function pick(id: Kind) {
  picked.value = id
  name.value = (templates.find(t => t.id === id) ?? blank).sample
  samples.value = true
}
const back = () => { picked.value = null; created.value = false }
const create = () => { if (name.value.trim()) created.value = true }
const reset = () => { back(); name.value = '' }

// Miniature previews drawn with plain elements; the same art is reused at card and preview size.
// `samples` off swaps filled items for dashed placeholders.
const TemplateArt = defineComponent({
  props: { kind: { type: String, required: true }, samples: Boolean, large: Boolean },
  setup(props) {
    const i = (cls: string, style?: Record<string, string>) => h('i', { class: cls, style })
    return () => {
      const cls = ['tse-art', `tse-art--${props.kind}`, { 'is-large': props.large, 'is-empty': !props.samples }]
      if (props.kind === 'roadmap') {
        const bars = [[4, 38, 'p'], [30, 34, 's'], [12, 46, 'p'], [52, 30, 'n'], [40, 44, 's'], [64, 30, 'p']] as const
        return h('span', { class: cls }, [
          h('span', { class: 'tse-art__grid' }, [1, 2, 3].map(() => i('tse-art__q'))),
          ...bars.map(([x, w, t], n) => i(`tse-art__bar is-${t}`, { left: x + '%', width: w + '%', top: 14 + n * 14 + '%' }))
        ])
      }
      if (props.kind === 'board') {
        return h('span', { class: cls }, [3, 2, 2].map((n, c) => h('span', { class: 'tse-art__col' }, [
          i('tse-art__col-head'),
          ...Array.from({ length: n }, (_, k) => i(`tse-art__card${c === 2 ? ' is-done' : ''}`, { height: 18 + ((k + c) % 2) * 7 + '%' }))
        ])))
      }
      if (props.kind === 'calendar') {
        const marks: Record<number, string> = { 2: 'p', 6: 's', 9: 'p', 15: 'n', 17: 's', 22: 'p', 24: 'p', 30: 's' }
        return h('span', { class: cls }, Array.from({ length: 35 }, (_, d) => h('span', { class: 'tse-art__day' }, marks[d] ? [i(`tse-art__pill is-${marks[d]}`)] : [])))
      }
      if (props.kind === 'research') {
        return h('span', { class: cls }, [
          h('span', { class: 'tse-art__doc' }, [76, 92, 64, 88, 52].map(w => i('tse-art__line', { width: w + '%' }))),
          h('span', { class: 'tse-art__notes' }, ['p', 's', 'n', 'p'].map(t => i(`tse-art__note is-${t}`)))
        ])
      }
      return h('span', { class: cls }, [1, 2, 3, 4].map(() => i('tse-art__row')))
    }
  }
})
</script>

<style scoped>
.tse-cq { container-type: inline-size; }
.tse { display: grid; gap: 20px; max-width: 980px; margin-inline: auto; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); }
.tse__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 44px; padding-bottom: 14px; border-bottom: 1px solid var(--mi-sep); }

.tse__start { display: grid; gap: 20px; }
.tse__intro { display: grid; gap: 6px; max-width: 54ch; }

.tse__gallery { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 0; padding: 0; list-style: none; }
.tse__tpl { display: grid; gap: 10px; width: 100%; height: 100%; padding: 8px 8px 12px; border: 1px solid var(--mi-sep); border-radius: var(--mi-radius-l); background: var(--mi-card); color: inherit; font: inherit; text-align: start; cursor: pointer; transition: transform var(--mi-dur-2) var(--mi-spring); }
.tse__tpl:hover { transform: translateY(-2px); background: var(--mi-fill4); }
.tse__tpl:active { transform: translateY(0) scale(.985); }
.tse__tpl:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.tse__art-frame { display: block; aspect-ratio: 16 / 10; border-radius: calc(var(--mi-radius-l) - 4px); background: var(--mi-fill4); overflow: hidden; }
.tse__tpl-text { display: grid; gap: 2px; padding-inline: 4px; font-size: 12px; color: var(--mi-label2); }
.tse__tpl-text strong { font-size: 14px; font-weight: 600; color: var(--mi-label); }
.tse__blank { align-content: start; border-style: dashed; }
.tse__plus { display: grid; place-items: center; aspect-ratio: 16 / 10; border-radius: calc(var(--mi-radius-l) - 4px); color: var(--mi-label2); background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--mi-fill4) 70%, transparent) 0 6px, transparent 6px 12px); }

.tse__import { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 10px 12px; padding: 12px 14px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.tse__import-icon { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; color: var(--mi-label2); background: var(--mi-card); }
.tse__import-btns { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 6px; }

/* Preview */
.tse__preview { display: grid; gap: 20px; animation: tse-in var(--mi-dur-4) var(--mi-spring) both; }
.tse__stage { padding: 18px; border-radius: var(--mi-radius-l); background: radial-gradient(120% 90% at 0% 0%, var(--mi-p-tint), transparent 60%), var(--mi-fill4); }
.tse__window { display: grid; border-radius: 12px; background: var(--mi-card); box-shadow: var(--mi-sh2); overflow: hidden; }
.tse__window-bar { display: flex; align-items: center; gap: 5px; padding: 9px 12px; border-bottom: 1px solid var(--mi-sep); }
.tse__window-bar i { width: 8px; height: 8px; border-radius: 50%; background: var(--mi-fill2); }
.tse__window-bar span { margin-left: 8px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 600; }
.tse__window-tabs { display: flex; gap: 14px; padding: 8px 14px 0; border-bottom: 1px solid var(--mi-sep); font-size: 11.5px; color: var(--mi-label3); overflow: hidden; }
.tse__window-tabs span { padding-bottom: 7px; white-space: nowrap; }
.tse__window-tabs .is-on { color: var(--mi-label); font-weight: 600; box-shadow: inset 0 -2px 0 var(--mi-p); }
.tse__window-body { aspect-ratio: 16 / 9; padding: 6px; background: var(--mi-fill4); }

.tse__form { display: grid; align-content: start; gap: 16px; }
.tse__form-head { display: grid; gap: 4px; }
.tse__includes { display: grid; gap: 8px; margin: 0; padding: 12px 14px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); font-size: 13px; }
.tse__includes div { display: grid; grid-template-columns: 56px minmax(0, 1fr); gap: 8px; }
.tse__includes dt { color: var(--mi-label2); }
.tse__includes dd { margin: 0; font-weight: 500; }
.tse__switch { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.tse__switch-text { display: grid; gap: 1px; font-size: 12px; color: var(--mi-label2); }
.tse__switch-text strong { font-size: 14px; font-weight: 600; color: var(--mi-label); }

.tse__done { display: grid; justify-items: center; gap: 8px; padding: 36px 8px 28px; animation: tse-in var(--mi-dur-4) var(--mi-spring) both; }
.tse__done-mark { display: grid; place-items: center; width: 52px; height: 52px; margin-bottom: 6px; border-radius: 50%; color: var(--mi-p-on); background: var(--mi-p); box-shadow: 0 0 0 8px var(--mi-p-tint); }
.tse__done-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 10px; }
@keyframes tse-in { from { opacity: 0; transform: translateY(8px); } }
@media (prefers-reduced-motion: reduce) { .tse__preview, .tse__done { animation: none; } }

/* Template art. The art is rendered by a child component, so it is styled through :deep. */
.tse :deep(.tse-art) { position: relative; display: block; width: 100%; height: 100%; padding: 8%; }
.tse :deep(.is-p) { background: var(--mi-p); }
.tse :deep(.is-s) { background: var(--mi-s); }
.tse :deep(.is-n) { background: var(--mi-label3); }
.tse :deep(.tse-art.is-empty) .tse-art__bar,
.tse :deep(.tse-art.is-empty) .tse-art__card,
.tse :deep(.tse-art.is-empty) .tse-art__pill,
.tse :deep(.tse-art.is-empty) .tse-art__note { background: transparent; outline: 1.5px dashed var(--mi-sep2); outline-offset: -1.5px; opacity: .9; }

.tse :deep(.tse-art--roadmap) { padding: 0; }
.tse :deep(.tse-art__grid) { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(3, 1fr); }
.tse :deep(.tse-art__q) { border-right: 1px dashed var(--mi-sep); }
.tse :deep(.tse-art__q:last-child) { border-right: 0; }
.tse :deep(.tse-art__bar) { position: absolute; height: 9%; border-radius: 99px; opacity: .85; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.tse :deep(.tse-art__bar.is-n) { opacity: .5; }
.tse :deep(.tse-art.is-large .tse-art__bar) { height: 7%; }

.tse :deep(.tse-art--board) { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6%; padding: 7%; }
.tse :deep(.tse-art__col) { display: flex; flex-direction: column; gap: 5%; min-width: 0; min-height: 0; }
.tse :deep(.tse-art__col-head) { height: 6%; width: 60%; border-radius: 99px; background: var(--mi-label3); opacity: .5; }
.tse :deep(.tse-art__card) { flex: none; border-radius: 4px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.tse :deep(.tse-art__card.is-done) { background: color-mix(in srgb, var(--mi-green) 22%, var(--mi-card)); }

.tse :deep(.tse-art--calendar) { display: grid; grid-template-columns: repeat(7, 1fr); grid-auto-rows: 1fr; gap: 3px; padding: 7%; }
.tse :deep(.tse-art__day) { display: flex; align-items: flex-end; padding: 2px; border-radius: 3px; background: var(--mi-card); }
.tse :deep(.tse-art__pill) { display: block; width: 100%; height: 26%; min-height: 3px; border-radius: 99px; opacity: .85; }

.tse :deep(.tse-art--research) { display: grid; grid-template-columns: 1fr 1.1fr; gap: 8%; }
.tse :deep(.tse-art__doc) { display: flex; flex-direction: column; justify-content: center; gap: 10%; padding: 10%; border-radius: 4px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.tse :deep(.tse-art__line) { display: block; height: 4px; border-radius: 2px; background: var(--mi-fill2); }
.tse :deep(.tse-art__notes) { display: grid; grid-template-columns: 1fr 1fr; gap: 10%; align-content: center; padding: 4%; }
.tse :deep(.tse-art__note) { aspect-ratio: 1; border-radius: 3px; opacity: .55; }
.tse :deep(.tse-art__note:nth-child(2)) { transform: rotate(4deg); }
.tse :deep(.tse-art__note:nth-child(3)) { transform: rotate(-5deg); }

.tse :deep(.tse-art--blank) { display: grid; align-content: start; gap: 6%; padding: 8%; }
.tse :deep(.tse-art__row) { display: block; height: 14%; min-height: 10px; border-radius: 4px; outline: 1.5px dashed var(--mi-sep2); outline-offset: -1.5px; }

@container (min-width: 560px) {
  .tse { padding: 24px 28px; }
  .tse__gallery { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .tse__import { grid-template-columns: auto minmax(0, 1fr) auto; }
  .tse__import-btns { grid-column: auto; }
}
@container (min-width: 740px) {
  .tse__gallery { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .tse__preview { grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); gap: 28px; align-items: start; }
}
</style>

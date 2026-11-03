<template>
  <div class="tse-cq mi:@container">
    <section class="tse mi:grid mi:gap-5 mi:max-w-245 mi:mx-auto mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:font-mi mi:text-label mi:@[560px]:py-6 mi:@[560px]:px-7" aria-labelledby="tse-title">
      <header class="tse__head mi:flex mi:items-center mi:justify-between mi:gap-3 mi:min-h-11 mi:pb-3.5 mi:border-b mi:border-b-sep">
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
      <div v-if="!picked" class="tse__start mi:grid mi:gap-5">
        <div class="tse__intro mi:grid mi:gap-1.5 mi:max-w-[54ch]">
          <MiText as="h3" variant="title3" weight="semibold" balance>Start your first project from a shape that fits</MiText>
          <MiText variant="footnote" tone="label2">Templates bring their views, fields and a few sample tasks. Everything can be renamed or removed later.</MiText>
        </div>

        <ul class="tse__gallery mi:grid mi:grid-cols-2 mi:gap-2.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[560px]:grid-cols-3 mi:@[560px]:gap-3 mi:@[740px]:grid-cols-5" aria-label="Templates">
          <li v-for="t in templates" :key="t.id">
            <button type="button" class="tse__tpl mi:grid mi:gap-2.5 mi:w-full mi:h-full mi:pt-2 mi:px-2 mi:pb-3 mi:border mi:border-sep mi:rounded-lg mi:[background:var(--mi-card)] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:hover:transform-[translateY(-2px)] mi:hover:[background:var(--mi-fill4)] mi:active:transform-[translateY(0)_scale(.985)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="pick(t.id)">
              <span class="tse__art-frame mi:block mi:aspect-[16_/_10] mi:rounded-[calc(var(--mi-radius-l)_-_4px)] mi:[background:var(--mi-fill4)] mi:overflow-hidden" aria-hidden="true">
                <TemplateArt :kind="t.id" :samples="true" />
              </span>
              <span class="tse__tpl-text mi:grid mi:gap-0.5 mi:px-1 mi:text-[12px] mi:text-label2">
                <strong>{{ t.name }}</strong>
                <span>{{ t.meta }}</span>
              </span>
            </button>
          </li>
          <li>
            <button type="button" class="tse__tpl tse__blank mi:grid mi:gap-2.5 mi:w-full mi:h-full mi:pt-2 mi:px-2 mi:pb-3 mi:border mi:border-sep mi:rounded-lg mi:[background:var(--mi-card)] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:hover:transform-[translateY(-2px)] mi:hover:[background:var(--mi-fill4)] mi:active:transform-[translateY(0)_scale(.985)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:content-start mi:[border-style:dashed]" @click="pick('blank')">
              <span class="tse__plus mi:grid mi:place-items-center mi:aspect-[16_/_10] mi:rounded-[calc(var(--mi-radius-l)_-_4px)] mi:text-label2 mi:[background:repeating-linear-gradient(135deg,_color-mix(in_srgb,_var(--mi-fill4)_70%,_transparent)_0_6px,_transparent_6px_12px)]" aria-hidden="true"><MiIcon name="plus" :size="20" /></span>
              <span class="tse__tpl-text mi:grid mi:gap-0.5 mi:px-1 mi:text-[12px] mi:text-label2">
                <strong>Blank project</strong>
                <span>One list view, no fields</span>
              </span>
            </button>
          </li>
        </ul>

        <div class="tse__import mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:items-center mi:gap-y-2.5 mi:gap-x-3 mi:py-3 mi:px-3.5 mi:rounded-lg mi:[background:var(--mi-fill4)] mi:@[560px]:grid-cols-[auto_minmax(0,_1fr)_auto]">
          <span class="tse__import-icon mi:grid mi:place-items-center mi:w-7.5 mi:h-7.5 mi:rounded-[50%] mi:text-label2 mi:[background:var(--mi-card)]" aria-hidden="true"><MiIcon name="arrow-down" :size="16" /></span>
          <MiText variant="footnote" tone="label2" class="tse__import-text">Moving from another tool? Import keeps assignees, due dates and comments.</MiText>
          <div class="tse__import-btns mi:col-span-full mi:flex mi:flex-wrap mi:gap-1.5 mi:@[560px]:col-[auto]" role="group" aria-label="Import from">
            <MiButton v-for="s in sources" :key="s" variant="gray" size="mini">{{ s }}</MiButton>
          </div>
        </div>
      </div>

      <!-- Step 2: the chosen template, previewed with the name you type and the sample switch. -->
      <div v-else-if="!created" class="tse__preview mi:grid mi:gap-5 mi:@[740px]:grid-cols-[minmax(0,_1.35fr)_minmax(0,_1fr)] mi:@[740px]:gap-7 mi:@[740px]:items-start">
        <div class="tse__stage mi:p-4.5 mi:rounded-lg mi:[background:radial-gradient(120%_90%_at_0%_0%,_var(--mi-p-tint),_transparent_60%),_var(--mi-fill4)]" aria-hidden="true">
          <div class="tse__window mi:grid mi:rounded-[12px] mi:[background:var(--mi-card)] mi:shadow-2 mi:overflow-hidden">
            <div class="tse__window-bar mi:flex mi:items-center mi:gap-[5px] mi:py-[9px] mi:px-3 mi:border-b mi:border-b-sep">
              <i class="mi:[.tse__window-bar_&]:w-2 mi:[.tse__window-bar_&]:h-2 mi:[.tse__window-bar_&]:rounded-[50%] mi:[.tse__window-bar_&]:[background:var(--mi-fill2)]" /><i class="mi:[.tse__window-bar_&]:w-2 mi:[.tse__window-bar_&]:h-2 mi:[.tse__window-bar_&]:rounded-[50%] mi:[.tse__window-bar_&]:[background:var(--mi-fill2)]" /><i class="mi:[.tse__window-bar_&]:w-2 mi:[.tse__window-bar_&]:h-2 mi:[.tse__window-bar_&]:rounded-[50%] mi:[.tse__window-bar_&]:[background:var(--mi-fill2)]" />
              <span class="mi:[.tse__window-bar_&]:min-w-0 mi:[.tse__window-bar_&]:overflow-hidden mi:[.tse__window-bar_&]:text-ellipsis mi:[.tse__window-bar_&]:whitespace-nowrap">{{ name.trim() || 'Untitled project' }}</span>
            </div>
            <div class="tse__window-tabs mi:flex mi:gap-3.5 mi:pt-2 mi:px-3.5 mi:pb-0 mi:border-b mi:border-b-sep mi:text-[11.5px] mi:text-label3 mi:overflow-hidden"><span class="mi:[.tse__window-tabs_&]:pb-[7px] mi:[.tse__window-tabs_&]:whitespace-nowrap" v-for="(v, n) in current.views" :key="v" :class="{ 'is-on mi:[.tse__window-tabs_&]:text-label mi:[.tse__window-tabs_&]:shadow-[inset_0_-2px_0_var(--mi-p)]': n === 0 }">{{ v }}</span></div>
            <div class="tse__window-body mi:aspect-[16_/_9] mi:p-1.5 mi:[background:var(--mi-fill4)]">
              <TemplateArt :kind="current.id" :samples="samples" large />
            </div>
          </div>
        </div>

        <form class="tse__form mi:grid mi:content-start mi:gap-4" @submit.prevent="create">
          <div class="tse__form-head mi:grid mi:gap-1">
            <MiText as="h3" variant="title3" weight="semibold">{{ current.name }}</MiText>
            <MiText variant="footnote" tone="label2">{{ current.blurb }}</MiText>
          </div>
          <MiField label="Project name" :error="name.trim() ? undefined : 'Give the project a name'">
            <template #default="{ id, describedBy }">
              <MiInput :id="id" v-model="name" :aria-describedby="describedBy" />
            </template>
          </MiField>
          <dl class="tse__includes mi:grid mi:gap-2 mi:m-0 mi:py-3 mi:px-3.5 mi:rounded-lg mi:[background:var(--mi-fill4)] mi:text-[13px]">
            <div class="mi:[.tse__includes_&]:grid mi:[.tse__includes_&]:grid-cols-[56px_minmax(0,_1fr)] mi:[.tse__includes_&]:gap-2"><dt>Views</dt><dd>{{ current.views.join(', ') }}</dd></div>
            <div class="mi:[.tse__includes_&]:grid mi:[.tse__includes_&]:grid-cols-[56px_minmax(0,_1fr)] mi:[.tse__includes_&]:gap-2"><dt>Fields</dt><dd>{{ current.fields }}</dd></div>
          </dl>
          <div v-if="current.id !== 'blank'" class="tse__switch mi:flex mi:items-center mi:justify-between mi:gap-3">
            <span id="tse-samples" class="tse__switch-text mi:grid mi:gap-px mi:text-[12px] mi:text-label2">
              <strong>Include sample tasks</strong>
              <span>{{ current.tasks }} tasks to show how it works</span>
            </span>
            <MiSwitch v-model="samples" size="compact" aria-labelledby="tse-samples" />
          </div>
          <MiButton type="submit" :disabled="!name.trim()" block>Create project</MiButton>
        </form>
      </div>

      <!-- Step 3: done. -->
      <div v-else class="tse__done mi:grid mi:justify-items-center mi:gap-2 mi:pt-9 mi:px-2 mi:pb-7" role="status">
        <span class="tse__done-mark mi:grid mi:place-items-center mi:w-13 mi:h-13 mi:mb-1.5 mi:rounded-[50%] mi:text-p-on mi:[background:var(--mi-p)] mi:shadow-[0_0_0_8px_var(--mi-p-tint)]" aria-hidden="true"><MiIcon name="check" :size="22" :weight="2.4" /></span>
        <MiText as="h3" variant="title3" weight="semibold" align="center">{{ name.trim() }} is ready</MiText>
        <MiText variant="footnote" tone="label2" align="center">
          {{ current.views.length }} {{ current.views.length === 1 ? 'view' : 'views' }}{{ current.id !== 'blank' && samples ? `, ${current.tasks} sample tasks` : '' }}. Invite your team from the project header.
        </MiText>
        <div class="tse__done-actions mi:flex mi:flex-wrap mi:justify-center mi:gap-2.5 mi:mt-2.5">
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
.tse__tpl-text strong { font-size: 14px; font-weight: 600; color: var(--mi-label); }

/* Preview */
.tse__preview { animation: tse-in var(--mi-dur-4) var(--mi-spring) both; }
.tse__window-bar span { margin-left: 8px; font-size: 13px; font-weight: 600; }
.tse__window-tabs .is-on { font-weight: 600; }
.tse__includes dt { color: var(--mi-label2); }
.tse__includes dd { margin: 0; font-weight: 500; }
.tse__switch-text strong { font-size: 14px; font-weight: 600; color: var(--mi-label); }

.tse__done { animation: tse-in var(--mi-dur-4) var(--mi-spring) both; }
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
</style>

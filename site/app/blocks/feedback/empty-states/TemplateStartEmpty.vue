<template>
  <div class="mi:@container">
    <section class="mi:grid mi:gap-5 mi:max-w-245 mi:mx-auto mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:font-mi mi:text-label mi:@[560px]:py-6 mi:@[560px]:px-7" aria-labelledby="tse-title">
      <header class="mi:flex mi:items-center mi:justify-between mi:gap-3 mi:min-h-11 mi:pb-3.5 mi:border-b mi:border-b-sep">
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
      <div v-if="!picked" class="mi:grid mi:gap-5">
        <div class="mi:grid mi:gap-1.5 mi:max-w-[54ch]">
          <MiText as="h3" variant="title3" weight="semibold" balance>Start your first project from a shape that fits</MiText>
          <MiText variant="footnote" tone="label2">Templates bring their views, fields and a few sample tasks. Everything can be renamed or removed later.</MiText>
        </div>

        <ul class="mi:grid mi:grid-cols-2 mi:gap-2.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[560px]:grid-cols-3 mi:@[560px]:gap-3 mi:@[740px]:grid-cols-5" aria-label="Templates">
          <li v-for="t in templates" :key="t.id">
            <button type="button" class="mi:grid mi:gap-2.5 mi:w-full mi:h-full mi:pt-2 mi:px-2 mi:pb-3 mi:border mi:border-sep mi:rounded-lg mi:[background:var(--mi-card)] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:hover:transform-[translateY(-2px)] mi:hover:[background:var(--mi-fill4)] mi:active:transform-[translateY(0)_scale(.985)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="pick(t.id)">
              <span class="mi:block mi:aspect-[16_/_10] mi:rounded-[calc(var(--mi-radius-l)_-_4px)] mi:[background:var(--mi-fill4)] mi:overflow-hidden" aria-hidden="true">
                <TemplateArt :kind="t.id" :samples="true" />
              </span>
              <span class="mi:grid mi:gap-0.5 mi:px-1 mi:text-[12px] mi:text-label2">
                <strong class="mi:text-[14px] mi:font-semibold mi:text-label">{{ t.name }}</strong>
                <span>{{ t.meta }}</span>
              </span>
            </button>
          </li>
          <li>
            <button type="button" class="mi:grid mi:gap-2.5 mi:w-full mi:h-full mi:pt-2 mi:px-2 mi:pb-3 mi:border mi:border-sep mi:rounded-lg mi:[background:var(--mi-card)] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:hover:transform-[translateY(-2px)] mi:hover:[background:var(--mi-fill4)] mi:active:transform-[translateY(0)_scale(.985)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:content-start mi:[border-style:dashed]" @click="pick('blank')">
              <span class="mi:grid mi:place-items-center mi:aspect-[16_/_10] mi:rounded-[calc(var(--mi-radius-l)_-_4px)] mi:text-label2 mi:[background:repeating-linear-gradient(135deg,_color-mix(in_srgb,_var(--mi-fill4)_70%,_transparent)_0_6px,_transparent_6px_12px)]" aria-hidden="true"><MiIcon name="plus" :size="20" /></span>
              <span class="mi:grid mi:gap-0.5 mi:px-1 mi:text-[12px] mi:text-label2">
                <strong class="mi:text-[14px] mi:font-semibold mi:text-label">Blank project</strong>
                <span>One list view, no fields</span>
              </span>
            </button>
          </li>
        </ul>

        <div class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:items-center mi:gap-y-2.5 mi:gap-x-3 mi:py-3 mi:px-3.5 mi:rounded-lg mi:[background:var(--mi-fill4)] mi:@[560px]:grid-cols-[auto_minmax(0,_1fr)_auto]">
          <span class="mi:grid mi:place-items-center mi:w-7.5 mi:h-7.5 mi:rounded-[50%] mi:text-label2 mi:[background:var(--mi-card)]" aria-hidden="true"><MiIcon name="arrow-down" :size="16" /></span>
          <MiText variant="footnote" tone="label2">Moving from another tool? Import keeps assignees, due dates and comments.</MiText>
          <div class="mi:col-span-full mi:flex mi:flex-wrap mi:gap-1.5 mi:@[560px]:col-[auto]" role="group" aria-label="Import from">
            <MiButton v-for="s in sources" :key="s" variant="gray" size="mini">{{ s }}</MiButton>
          </div>
        </div>
      </div>

      <!-- Step 2: the chosen template, previewed with the name you type and the sample switch. -->
      <div v-else-if="!created" class="mi:[--mi-in-y:8px] mi:animate-[in_var(--mi-dur-4)_var(--mi-spring)_both] mi:motion-reduce:animate-none mi:grid mi:gap-5 mi:@[740px]:grid-cols-[minmax(0,_1.35fr)_minmax(0,_1fr)] mi:@[740px]:gap-7 mi:@[740px]:items-start">
        <div class="mi:p-4.5 mi:rounded-lg mi:[background:radial-gradient(120%_90%_at_0%_0%,_var(--mi-p-tint),_transparent_60%),_var(--mi-fill4)]" aria-hidden="true">
          <div class="mi:grid mi:rounded-[12px] mi:[background:var(--mi-card)] mi:shadow-2 mi:overflow-hidden">
            <div class="mi:flex mi:items-center mi:gap-[5px] mi:py-[9px] mi:px-3 mi:border-b mi:border-b-sep">
              <i class="mi:w-2 mi:h-2 mi:rounded-[50%] mi:[background:var(--mi-fill2)]" /><i class="mi:w-2 mi:h-2 mi:rounded-[50%] mi:[background:var(--mi-fill2)]" /><i class="mi:w-2 mi:h-2 mi:rounded-[50%] mi:[background:var(--mi-fill2)]" />
              <span class="mi:ml-2 mi:text-[13px] mi:font-semibold mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ name.trim() || 'Untitled project' }}</span>
            </div>
            <div class="mi:flex mi:gap-3.5 mi:pt-2 mi:px-3.5 mi:pb-0 mi:border-b mi:border-b-sep mi:text-[11.5px] mi:text-label3 mi:overflow-hidden"><span class="mi:pb-[7px] mi:whitespace-nowrap" v-for="(v, n) in current.views" :key="v" :class="n === 0 ? 'mi:font-semibold mi:text-label mi:shadow-[inset_0_-2px_0_var(--mi-p)]' : ''">{{ v }}</span></div>
            <div class="mi:aspect-[16_/_9] mi:p-1.5 mi:[background:var(--mi-fill4)]">
              <TemplateArt :kind="current.id" :samples="samples" large />
            </div>
          </div>
        </div>

        <form class="mi:grid mi:content-start mi:gap-4" @submit.prevent="create">
          <div class="mi:grid mi:gap-1">
            <MiText as="h3" variant="title3" weight="semibold">{{ current.name }}</MiText>
            <MiText variant="footnote" tone="label2">{{ current.blurb }}</MiText>
          </div>
          <MiField label="Project name" :error="name.trim() ? undefined : 'Give the project a name'">
            <template #default="{ id, describedBy }">
              <MiInput :id="id" v-model="name" :aria-describedby="describedBy" />
            </template>
          </MiField>
          <dl class="mi:grid mi:gap-2 mi:m-0 mi:py-3 mi:px-3.5 mi:rounded-lg mi:[background:var(--mi-fill4)] mi:text-[13px]">
            <div class="mi:grid mi:grid-cols-[56px_minmax(0,_1fr)] mi:gap-2"><dt class="mi:text-label2">Views</dt><dd class="mi:m-0 mi:font-medium">{{ current.views.join(', ') }}</dd></div>
            <div class="mi:grid mi:grid-cols-[56px_minmax(0,_1fr)] mi:gap-2"><dt class="mi:text-label2">Fields</dt><dd class="mi:m-0 mi:font-medium">{{ current.fields }}</dd></div>
          </dl>
          <div v-if="current.id !== 'blank'" class="mi:flex mi:items-center mi:justify-between mi:gap-3">
            <span id="tse-samples" class="mi:grid mi:gap-px mi:text-[12px] mi:text-label2">
              <strong class="mi:text-[14px] mi:font-semibold mi:text-label">Include sample tasks</strong>
              <span>{{ current.tasks }} tasks to show how it works</span>
            </span>
            <MiSwitch v-model="samples" size="compact" aria-labelledby="tse-samples" />
          </div>
          <MiButton type="submit" :disabled="!name.trim()" block>Create project</MiButton>
        </form>
      </div>

      <!-- Step 3: done. -->
      <div v-else class="mi:[--mi-in-y:8px] mi:animate-[in_var(--mi-dur-4)_var(--mi-spring)_both] mi:motion-reduce:animate-none mi:grid mi:justify-items-center mi:gap-2 mi:pt-9 mi:px-2 mi:pb-7" role="status">
        <span class="mi:grid mi:place-items-center mi:w-13 mi:h-13 mi:mb-1.5 mi:rounded-[50%] mi:text-p-on mi:[background:var(--mi-p)] mi:shadow-[0_0_0_8px_var(--mi-p-tint)]" aria-hidden="true"><MiIcon name="check" :size="22" :weight="2.4" /></span>
        <MiText as="h3" variant="title3" weight="semibold" align="center">{{ name.trim() }} is ready</MiText>
        <MiText variant="footnote" tone="label2" align="center">
          {{ current.views.length }} {{ current.views.length === 1 ? 'view' : 'views' }}{{ current.id !== 'blank' && samples ? `, ${current.tasks} sample tasks` : '' }}. Invite your team from the project header.
        </MiText>
        <div class="mi:flex mi:flex-wrap mi:justify-center mi:gap-2.5 mi:mt-2.5">
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
    // Utility classes of the art, per kind and tone; the dashed "empty" look replaces the filled one.
    const ROOT: Record<string, string> = {
      roadmap: 'mi:block mi:p-0',
      board: 'mi:grid mi:grid-cols-[repeat(3,1fr)] mi:gap-[6%] mi:p-[7%]',
      calendar: 'mi:grid mi:grid-cols-[repeat(7,1fr)] mi:auto-rows-[1fr] mi:gap-[3px] mi:p-[7%]',
      research: 'mi:grid mi:grid-cols-[1fr_1.1fr] mi:gap-[8%] mi:p-[8%]',
      blank: 'mi:grid mi:content-start mi:gap-[6%] mi:p-[8%]'
    }
    const TONE: Record<string, string> = { p: 'mi:bg-p', s: 'mi:bg-s', n: 'mi:bg-label3' }
    const EMPTY = 'mi:bg-transparent mi:[outline:1.5px_dashed_var(--mi-sep2)] mi:outline-offset-[-1.5px] mi:opacity-90'
    const fill = (t: string, filled: string) => (props.samples ? `${TONE[t]} ${filled}` : EMPTY)
    return () => {
      const cls = ['mi:relative mi:w-full mi:h-full', ROOT[props.kind]]
      if (props.kind === 'roadmap') {
        const bars = [[4, 38, 'p'], [30, 34, 's'], [12, 46, 'p'], [52, 30, 'n'], [40, 44, 's'], [64, 30, 'p']] as const
        const bar = `mi:absolute mi:rounded-[99px] mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] ${props.large ? 'mi:h-[7%]' : 'mi:h-[9%]'}`
        return h('span', { class: cls }, [
          h('span', { class: 'mi:absolute mi:inset-0 mi:grid mi:grid-cols-[repeat(3,1fr)]' }, [1, 2, 3].map(n => i(n === 3 ? '' : 'mi:[border-right:1px_dashed_var(--mi-sep)]'))),
          ...bars.map(([x, w, t], n) => i(`${bar} ${fill(t, t === 'n' ? 'mi:opacity-50' : 'mi:opacity-85')}`, { left: x + '%', width: w + '%', top: 14 + n * 14 + '%' }))
        ])
      }
      if (props.kind === 'board') {
        const card = 'mi:flex-[none] mi:rounded-[4px] mi:shadow-1'
        return h('span', { class: cls }, [3, 2, 2].map((n, c) => h('span', { class: 'mi:flex mi:flex-col mi:gap-[5%] mi:min-w-0 mi:min-h-0' }, [
          i('mi:h-[6%] mi:w-[60%] mi:rounded-[99px] mi:bg-label3 mi:opacity-50'),
          ...Array.from({ length: n }, (_, k) => i(`${card} ${props.samples ? (c === 2 ? 'mi:bg-[color-mix(in_srgb,_var(--mi-green)_22%,_var(--mi-card))]' : 'mi:bg-card') : EMPTY}`, { height: 18 + ((k + c) % 2) * 7 + '%' }))
        ])))
      }
      if (props.kind === 'calendar') {
        const marks: Record<number, string> = { 2: 'p', 6: 's', 9: 'p', 15: 'n', 17: 's', 22: 'p', 24: 'p', 30: 's' }
        return h('span', { class: cls }, Array.from({ length: 35 }, (_, d) => h('span', { class: 'mi:flex mi:items-flex-end mi:p-0.5 mi:rounded-[3px] mi:bg-card' }, marks[d] ? [i(`mi:block mi:w-full mi:h-[26%] mi:min-h-[3px] mi:rounded-[99px] ${fill(marks[d]!, 'mi:opacity-85')}`)] : [])))
      }
      if (props.kind === 'research') {
        const tilt = ['', 'mi:transform-[rotate(4deg)]', 'mi:transform-[rotate(-5deg)]', '']
        return h('span', { class: cls }, [
          h('span', { class: 'mi:flex mi:flex-col mi:justify-center mi:gap-[10%] mi:p-[10%] mi:rounded-[4px] mi:bg-card mi:shadow-1' }, [76, 92, 64, 88, 52].map(w => i('mi:block mi:h-1 mi:rounded-[2px] mi:bg-fill2', { width: w + '%' }))),
          h('span', { class: 'mi:grid mi:grid-cols-[1fr_1fr] mi:gap-[10%] mi:content-center mi:p-[4%]' }, ['p', 's', 'n', 'p'].map((t, n) => i(`mi:aspect-square mi:rounded-[3px] ${tilt[n]} ${fill(t, 'mi:opacity-55')}`)))
        ])
      }
      return h('span', { class: cls }, [1, 2, 3, 4].map(() => i('mi:block mi:h-[14%] mi:min-h-2.5 mi:rounded-[4px] mi:[outline:1.5px_dashed_var(--mi-sep2)] mi:outline-offset-[-1.5px]')))
    }
  }
})
</script>

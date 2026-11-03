<template>
  <section class="olp mi:@container mi:font-mi mi:text-label" aria-labelledby="olp-title">
    <div class="olp__in mi:grid mi:gap-5 mi:@[880px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:@[880px]:gap-8 mi:@[880px]:items-center">
    <div class="olp__ask mi:grid mi:gap-5.5">
      <div class="olp__intro mi:grid mi:gap-2">
        <MiText variant="caption" weight="semibold" tone="primary" class="olp__kicker">Step 2 of 3 · Shape your space</MiText>
        <MiText id="olp-title" as="h2" variant="title1" weight="bold" balance>Hi Amara, what will you plan in Loomline?</MiText>
        <MiText variant="subheadline" tone="label2">Pick a few things. The preview builds itself as you go, and you can change all of it later.</MiText>
      </div>

      <fieldset class="olp__set mi:grid mi:gap-2.5 mi:min-w-0 mi:m-0 mi:p-0 mi:[border:0]">
        <legend><MiText as="span" variant="subheadline" weight="semibold">Your role</MiText></legend>
        <div class="olp__roles mi:grid mi:grid-cols-2 mi:gap-2 mi:[@container_(min-width:_560px)_and_(max-width:_879px)]:grid-cols-4">
          <button
            v-for="r in roles" :key="r.id" type="button" class="olp__role mi:grid mi:justify-items-start mi:gap-0.5 mi:p-3 mi:[border:0] mi:rounded-lg mi:text-start mi:cursor-pointer mi:[font:inherit] mi:text-label mi:[background:var(--mi-card)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:active:transform-[scale(.98)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:[&.is-on]:[background:var(--mi-p-tint)] mi:[&.is-on]:shadow-[inset_0_0_0_1.5px_var(--mi-p)]" :class="{ 'is-on': role === r.id }"
            :aria-pressed="role === r.id" @click="role = r.id"
          >
            <MiIcon :svg="r.svg" :size="20" />
            <span class="olp__role-name mi:text-[14px] mi:font-semibold">{{ r.label }}</span>
            <span class="olp__role-sub mi:text-[12px] mi:text-label2">{{ r.sub }}</span>
          </button>
        </div>
      </fieldset>

      <fieldset class="olp__set mi:grid mi:gap-2.5 mi:min-w-0 mi:m-0 mi:p-0 mi:[border:0]">
        <legend><MiText as="span" variant="subheadline" weight="semibold">Start with these spaces</MiText></legend>
        <div class="olp__chips mi:flex mi:flex-wrap mi:gap-2">
          <MiChip
            v-for="s in spaces" :key="s.id" v-model="picked[s.id]" selectable :label="s.label" />
        </div>
      </fieldset>

      <div class="olp__set mi:grid mi:gap-2.5 mi:min-w-0 mi:m-0 mi:p-0 mi:[border:0]">
        <MiText as="span" variant="subheadline" weight="semibold">Team size</MiText>
        <MiSegmented v-model="size" label="Team size" :options="sizes" class="olp__seg mi:justify-self-start mi:max-w-full" />
      </div>

      <div class="olp__actions mi:flex mi:flex-wrap mi:[justify-content:flex-end] mi:gap-2.5 mi:border-t mi:border-t-sep mi:pt-4">
        <MiButton variant="plain">Skip for now</MiButton>
        <MiButton size="large" :disabled="!canCreate" @click="created = true">
          {{ created ? 'Workspace ready' : 'Create workspace' }}
          <template #trailing><MiIcon :name="created ? 'check' : 'arrow-right'" :size="16" /></template>
        </MiButton>
      </div>
      <MiText v-if="!canCreate" variant="caption" tone="label3" aria-live="polite">Pick a role and at least one space to continue.</MiText>
    </div>

    <!-- Live preview: a miniature of the workspace, assembled from the answers. -->
    <div class="olp__preview mi:p-4.5 mi:rounded-[24px] mi:[background:radial-gradient(120%_90%_at_0%_0%,_var(--mi-p-tint),_transparent_60%),_radial-gradient(100%_90%_at_100%_100%,_var(--mi-s-tint),_transparent_60%),_var(--mi-fill4)]" aria-label="Workspace preview" role="img">
      <div class="olp__window mi:rounded-[14px] mi:[background:var(--mi-page)] mi:shadow-[0_0_0_1px_var(--mi-sep),_var(--mi-sh3)] mi:overflow-hidden mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:[&.is-created]:transform-[translateY(-4px)_scale(1.01)]" :class="{ 'is-created': created }">
        <div class="olp__bar mi:flex mi:items-center mi:gap-[5px] mi:py-2 mi:px-2.5 mi:border-b mi:border-b-sep mi:[background:var(--mi-card)]"><i class="mi:[.olp__bar_&]:w-[7px] mi:[.olp__bar_&]:h-[7px] mi:[.olp__bar_&]:rounded-[50%] mi:[.olp__bar_&]:[background:var(--mi-fill)]" /><i class="mi:[.olp__bar_&]:w-[7px] mi:[.olp__bar_&]:h-[7px] mi:[.olp__bar_&]:rounded-[50%] mi:[.olp__bar_&]:[background:var(--mi-fill)]" /><i class="mi:[.olp__bar_&]:w-[7px] mi:[.olp__bar_&]:h-[7px] mi:[.olp__bar_&]:rounded-[50%] mi:[.olp__bar_&]:[background:var(--mi-fill)]" /><span class="mi:[.olp__bar_&]:flex-1 mi:[.olp__bar_&]:min-w-0 mi:[.olp__bar_&]:ml-1.5 mi:[.olp__bar_&]:overflow-hidden mi:[.olp__bar_&]:text-ellipsis mi:[.olp__bar_&]:whitespace-nowrap mi:[.olp__bar_&]:text-[10px] mi:[.olp__bar_&]:text-center">{{ slug }}.loomline.app</span></div>
        <div class="olp__app mi:grid mi:grid-cols-[108px_minmax(0,_1fr)] mi:min-h-65 mi:text-[11px]">
          <aside class="olp__side mi:py-2.5 mi:px-2 mi:border-r mi:border-r-sep mi:[background:var(--mi-card)]">
            <div class="olp__ws mi:flex mi:items-center mi:gap-1.5 mi:font-bold mi:text-[11px]"><span class="olp__ws-mark mi:w-3.5 mi:h-3.5 mi:rounded-[4px] mi:[background:linear-gradient(135deg,_var(--mi-p),_var(--mi-s))] mi:flex-[none]" />{{ teamName }}</div>
            <p class="olp__side-label mi:mt-3.5 mi:mx-0 mi:mb-1.5 mi:text-[9px] mi:font-semibold mi:tracking-[.06em] mi:uppercase mi:text-label3">Spaces</p>
            <TransitionGroup name="olp-item" tag="ul" class="olp__side-list mi:grid mi:gap-0.5 mi:m-0 mi:p-0 mi:[list-style:none]">
              <li class="mi:[.olp__side-list_&]:flex mi:[.olp__side-list_&]:items-center mi:[.olp__side-list_&]:gap-1.5 mi:[.olp__side-list_&]:rounded-[6px] mi:[.olp__side-list_&:first-child]:[background:var(--mi-fill3)] mi:[.olp__side-list_&:first-child]:font-semibold" v-for="s in chosen" :key="s.id"><span class="olp__swatch mi:w-1.5 mi:h-1.5 mi:rounded-[2px] mi:flex-[none]" :style="{ background: s.color }" />{{ s.label }}</li>
            </TransitionGroup>
            <p v-if="!chosen.length" class="olp__empty mi:m-0 mi:text-label3">No spaces yet</p>
          </aside>
          <div class="olp__main mi:grid mi:content-start mi:gap-1 mi:p-3 mi:min-w-0">
            <p class="olp__greet mi:m-0 mi:text-[14px] mi:font-bold mi:tracking-[-.01em]">Good morning, Amara</p>
            <p class="olp__sub mi:mt-0 mi:mx-0 mi:mb-2 mi:text-label2">{{ roleCopy }}</p>
            <TransitionGroup name="olp-item" tag="div" class="olp__cards mi:grid mi:grid-cols-2 mi:gap-1.5">
              <div v-for="s in chosen.slice(0, 4)" :key="s.id" class="olp__card mi:grid mi:gap-0.5 mi:p-2 mi:rounded-[8px] mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:min-w-0">
                <span class="olp__card-top mi:h-[3px] mi:w-5.5 mi:rounded-[2px] mi:mb-1 mi:[.olp__card_&:last-child]:text-[10px]" :style="{ background: s.color }" />
                <b class="mi:[.olp__card_&]:font-semibold">{{ s.label }}</b>
                <span class="mi:[.olp__card_&:last-child]:text-[10px]">{{ s.hint }}</span>
              </div>
            </TransitionGroup>
            <div class="olp__seats mi:flex mi:items-center mi:gap-[3px] mi:mt-2.5">
              <span v-for="n in seatDots" :key="n" class="olp__seat mi:w-3 mi:h-3 mi:rounded-[50%] mi:[background:color-mix(in_srgb,_var(--mi-p)_55%,_var(--mi-card))] mi:shadow-[0_0_0_2px_var(--mi-page)] mi:[.olp__seat+&]:-ml-1.5" />
              <em class="mi:[.olp__seats_&]:ml-2 mi:[.olp__seats_&]:not-italic">{{ sizeCopy }}</em>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const roles = [
  { id: 'product', label: 'Product', sub: 'Roadmaps, specs', svg: '<path d="M4 18 10 6l4 8 2-4 4 8"/>' },
  { id: 'design', label: 'Design', sub: 'Reviews, systems', svg: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16"/>' },
  { id: 'eng', label: 'Engineering', sub: 'Sprints, triage', svg: '<path d="m9 8-4 4 4 4M15 8l4 4-4 4"/>' },
  { id: 'ops', label: 'Operations', sub: 'Launches, hiring', svg: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>' }
]
const spaces = [
  { id: 'roadmap', label: 'Roadmap', hint: 'Now, next, later', color: 'var(--mi-p)' },
  { id: 'sprint', label: 'Sprint board', hint: '2-week cycles', color: 'var(--mi-s)' },
  { id: 'bugs', label: 'Bug triage', hint: 'Severity queue', color: 'var(--mi-red)' },
  { id: 'reviews', label: 'Design reviews', hint: 'Weekly crit', color: 'var(--mi-purple)' },
  { id: 'okrs', label: 'OKRs', hint: 'Q1 objectives', color: 'var(--mi-green)' },
  { id: 'launch', label: 'Launch calendar', hint: 'Dates and owners', color: 'var(--mi-orange)' },
  { id: 'hiring', label: 'Hiring', hint: 'Open roles', color: 'var(--mi-teal)' }
]
const sizes = [{ value: 1, label: 'Just me' }, { value: 8, label: '2–10' }, { value: 30, label: '11–50' }, { value: 60, label: '51+' }]

const role = ref<string>('product')
const picked = reactive<Record<string, boolean>>({ roadmap: true, okrs: true })
const size = ref<string | number | null>(8)
const created = ref(false)

const chosen = computed(() => spaces.filter(s => picked[s.id]))
const canCreate = computed(() => !!role.value && chosen.value.length > 0)
const teamName = 'Kestrel Labs'
const slug = 'kestrel'
const roleCopy = computed(() => ({
  product: 'Three roadmap items need a decision this week.',
  design: 'Two files are waiting for your review.',
  eng: 'Sprint 14 ends Friday · 6 issues open.',
  ops: 'The spring launch is 18 days out.'
} as Record<string, string>)[role.value] ?? '')
const seatDots = computed(() => Math.min(8, Math.max(1, Math.round(Number(size.value) / 4) || 1)))
const sizeCopy = computed(() => (Number(size.value) === 1 ? 'Solo workspace' : `Room for ${sizes.find(s => s.value === size.value)?.label ?? ''} people`))
</script>

<style scoped>
.olp__kicker { letter-spacing: .02em; }
.olp__set legend { padding: 0; margin-bottom: 10px; }
.olp__role svg, .olp__role :deep(svg) { color: var(--mi-label2); margin-bottom: 6px; }
.olp__role.is-on :deep(svg) { color: var(--mi-p-text); }
.olp__bar span { color: var(--mi-label2); }
.olp__side-list li { padding: 4px 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.olp__card b { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.olp__card span:last-child { color: var(--mi-label2); }
.olp__seats em { color: var(--mi-label2); }

.olp-item-enter-active, .olp-item-leave-active { transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.olp-item-enter-from, .olp-item-leave-to { opacity: 0; transform: translateY(6px) scale(.97); }
.olp-item-leave-active { position: absolute; }
.olp-item-move { transition: transform var(--mi-dur-3) var(--mi-spring); }
</style>

<template>
  <section class="olp" aria-labelledby="olp-title">
    <div class="olp__in">
    <div class="olp__ask">
      <div class="olp__intro">
        <MiText variant="caption" weight="semibold" tone="primary" class="olp__kicker">Step 2 of 3 · Shape your space</MiText>
        <MiText id="olp-title" as="h2" variant="title1" weight="bold" balance>Hi Amara, what will you plan in Loomline?</MiText>
        <MiText variant="subheadline" tone="label2">Pick a few things. The preview builds itself as you go, and you can change all of it later.</MiText>
      </div>

      <fieldset class="olp__set">
        <legend><MiText as="span" variant="subheadline" weight="semibold">Your role</MiText></legend>
        <div class="olp__roles">
          <button
            v-for="r in roles" :key="r.id" type="button" class="olp__role" :class="{ 'is-on': role === r.id }"
            :aria-pressed="role === r.id" @click="role = r.id"
          >
            <MiIcon :svg="r.svg" :size="20" />
            <span class="olp__role-name">{{ r.label }}</span>
            <span class="olp__role-sub">{{ r.sub }}</span>
          </button>
        </div>
      </fieldset>

      <fieldset class="olp__set">
        <legend><MiText as="span" variant="subheadline" weight="semibold">Start with these spaces</MiText></legend>
        <div class="olp__chips">
          <MiChip
            v-for="s in spaces" :key="s.id" v-model="picked[s.id]" selectable :label="s.label" />
        </div>
      </fieldset>

      <div class="olp__set">
        <MiText as="span" variant="subheadline" weight="semibold">Team size</MiText>
        <MiSegmented v-model="size" label="Team size" :options="sizes" class="olp__seg" />
      </div>

      <div class="olp__actions">
        <MiButton variant="plain">Skip for now</MiButton>
        <MiButton size="large" :disabled="!canCreate" @click="created = true">
          {{ created ? 'Workspace ready' : 'Create workspace' }}
          <template #trailing><MiIcon :name="created ? 'check' : 'arrow-right'" :size="16" /></template>
        </MiButton>
      </div>
      <MiText v-if="!canCreate" variant="caption" tone="label3" aria-live="polite">Pick a role and at least one space to continue.</MiText>
    </div>

    <!-- Live preview: a miniature of the workspace, assembled from the answers. -->
    <div class="olp__preview" aria-label="Workspace preview" role="img">
      <div class="olp__window" :class="{ 'is-created': created }">
        <div class="olp__bar"><i /><i /><i /><span>{{ slug }}.loomline.app</span></div>
        <div class="olp__app">
          <aside class="olp__side">
            <div class="olp__ws"><span class="olp__ws-mark" />{{ teamName }}</div>
            <p class="olp__side-label">Spaces</p>
            <TransitionGroup name="olp-item" tag="ul" class="olp__side-list">
              <li v-for="s in chosen" :key="s.id"><span class="olp__swatch" :style="{ background: s.color }" />{{ s.label }}</li>
            </TransitionGroup>
            <p v-if="!chosen.length" class="olp__empty">No spaces yet</p>
          </aside>
          <div class="olp__main">
            <p class="olp__greet">Good morning, Amara</p>
            <p class="olp__sub">{{ roleCopy }}</p>
            <TransitionGroup name="olp-item" tag="div" class="olp__cards">
              <div v-for="s in chosen.slice(0, 4)" :key="s.id" class="olp__card">
                <span class="olp__card-top" :style="{ background: s.color }" />
                <b>{{ s.label }}</b>
                <span>{{ s.hint }}</span>
              </div>
            </TransitionGroup>
            <div class="olp__seats">
              <span v-for="n in seatDots" :key="n" class="olp__seat" />
              <em>{{ sizeCopy }}</em>
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
.olp { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.olp__in { display: grid; gap: 20px; }
@container (min-width: 880px) { .olp__in { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 32px; align-items: center; } }

.olp__ask { display: grid; gap: 22px; }
.olp__intro { display: grid; gap: 8px; }
.olp__kicker { letter-spacing: .02em; }
.olp__set { display: grid; gap: 10px; min-width: 0; margin: 0; padding: 0; border: 0; }
.olp__set legend { padding: 0; margin-bottom: 10px; }
.olp__roles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
@container (min-width: 560px) and (max-width: 879px) { .olp__roles { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.olp__role {
  display: grid; justify-items: start; gap: 2px; padding: 12px; border: 0; border-radius: var(--mi-radius-l); text-align: start; cursor: pointer;
  font: inherit; color: var(--mi-label); background: var(--mi-card); box-shadow: inset 0 0 0 1px var(--mi-sep);
  transition: transform var(--mi-dur-2) var(--mi-ease);
}
.olp__role svg, .olp__role :deep(svg) { color: var(--mi-label2); margin-bottom: 6px; }
.olp__role:active { transform: scale(.98); }
.olp__role:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.olp__role.is-on { background: var(--mi-p-tint); box-shadow: inset 0 0 0 1.5px var(--mi-p); }
.olp__role.is-on :deep(svg) { color: var(--mi-p-text); }
.olp__role-name { font-size: 14px; font-weight: 600; }
.olp__role-sub { font-size: 12px; color: var(--mi-label2); }
.olp__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.olp__seg { justify-self: start; max-width: 100%; }
.olp__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--mi-sep); padding-top: 16px; }

/* Preview window */
.olp__preview { padding: 18px; border-radius: 24px; background: radial-gradient(120% 90% at 0% 0%, var(--mi-p-tint), transparent 60%), radial-gradient(100% 90% at 100% 100%, var(--mi-s-tint), transparent 60%), var(--mi-fill4); }
.olp__window { border-radius: 14px; background: var(--mi-page); box-shadow: 0 0 0 1px var(--mi-sep), var(--mi-sh3); overflow: hidden; transition: transform var(--mi-dur-4) var(--mi-spring); }
.olp__window.is-created { transform: translateY(-4px) scale(1.01); }
.olp__bar { display: flex; align-items: center; gap: 5px; padding: 8px 10px; border-bottom: 1px solid var(--mi-sep); background: var(--mi-card); }
.olp__bar i { width: 7px; height: 7px; border-radius: 50%; background: var(--mi-fill); }
.olp__bar span { flex: 1; min-width: 0; margin-left: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; color: var(--mi-label2); text-align: center; }
.olp__app { display: grid; grid-template-columns: 108px minmax(0, 1fr); min-height: 260px; font-size: 11px; }
.olp__side { padding: 10px 8px; border-right: 1px solid var(--mi-sep); background: var(--mi-card); }
.olp__ws { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 11px; }
.olp__ws-mark { width: 14px; height: 14px; border-radius: 4px; background: linear-gradient(135deg, var(--mi-p), var(--mi-s)); flex: none; }
.olp__side-label { margin: 14px 0 6px; font-size: 9px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--mi-label3); }
.olp__side-list { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }
.olp__side-list li { display: flex; align-items: center; gap: 6px; padding: 4px 6px; border-radius: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.olp__side-list li:first-child { background: var(--mi-fill3); font-weight: 600; }
.olp__swatch { width: 6px; height: 6px; border-radius: 2px; flex: none; }
.olp__empty { margin: 0; color: var(--mi-label3); }
.olp__main { display: grid; align-content: start; gap: 4px; padding: 12px; min-width: 0; }
.olp__greet { margin: 0; font-size: 14px; font-weight: 700; letter-spacing: -.01em; }
.olp__sub { margin: 0 0 8px; color: var(--mi-label2); }
.olp__cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.olp__card { display: grid; gap: 2px; padding: 8px; border-radius: 8px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); min-width: 0; }
.olp__card-top { height: 3px; width: 22px; border-radius: 2px; margin-bottom: 4px; }
.olp__card b { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.olp__card span:last-child { color: var(--mi-label2); font-size: 10px; }
.olp__seats { display: flex; align-items: center; gap: 3px; margin-top: 10px; }
.olp__seat { width: 12px; height: 12px; border-radius: 50%; background: color-mix(in srgb, var(--mi-p) 55%, var(--mi-card)); box-shadow: 0 0 0 2px var(--mi-page); }
.olp__seat + .olp__seat { margin-left: -6px; }
.olp__seats em { margin-left: 8px; font-style: normal; color: var(--mi-label2); }

.olp-item-enter-active, .olp-item-leave-active { transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.olp-item-enter-from, .olp-item-leave-to { opacity: 0; transform: translateY(6px) scale(.97); }
.olp-item-leave-active { position: absolute; }
.olp-item-move { transition: transform var(--mi-dur-3) var(--mi-spring); }
</style>

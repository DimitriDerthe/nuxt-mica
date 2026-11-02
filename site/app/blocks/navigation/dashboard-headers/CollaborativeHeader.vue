<template>
  <div class="ch">
    <div ref="scrollEl" class="ch__scroll" @keydown.esc="following = null">
      <!-- Sticky, translucent: the document scrolls underneath it. -->
      <header class="ch__header">
        <div class="ch__row">
          <span class="ch__tile" aria-hidden="true"><MiIcon name="document" :size="16" /></span>

          <nav class="ch__crumbs" aria-label="Location">
            <ol>
              <li v-for="(c, i) in trail" :key="c" class="ch__crumb" :class="crumbClass(i)">
                <a href="#" @click.prevent>{{ c }}</a>
              </li>
              <!-- One "…" per width step, each listing only the folders hidden at that step. -->
              <li v-for="fold in folds" :key="fold.size" class="ch__crumb ch__crumb--more" :class="'is-' + fold.size">
                <MiMenu :items="fold.items" aria-label="Show hidden folders">
                  <template #trigger="{ props }">
                    <button v-bind="props" type="button" class="ch__more" aria-label="Show hidden folders">…</button>
                  </template>
                </MiMenu>
              </li>
              <li class="ch__crumb ch__crumb--title">
                <input v-model="title" class="ch__title" aria-label="Document title" spellcheck="false" :size="Math.max(8, title.length)">
              </li>
            </ol>
          </nav>

          <div class="ch__status" role="status" aria-live="polite">
            <MiSpinner v-if="syncing" :size="14" label="" />
            <MiIcon v-else name="check" :size="14" class="ch__ok" />
            <span class="ch__status-text">{{ syncing ? 'Syncing…' : 'Saved' }}</span>
          </div>

          <div class="ch__end">
            <!-- Presence: each ring wears the colour of that person's cursor; click to follow. -->
            <ul class="ch__people" aria-label="People in this document">
              <li v-for="(p, i) in people" :key="p.name" :class="{ 'is-extra': i >= 1 }">
                <button
                  type="button" class="ch__face" :class="{ 'is-following': following === p.name }" :style="{ '--c': `var(--mi-${p.color})` }"
                  :aria-pressed="following === p.name" :title="p.name + ' · ' + p.where" @click="follow(p.name)"
                >
                  <MiAvatar :name="p.name" :size="26" tone="auto" decorative />
                  <span class="ch__sr">{{ following === p.name ? 'Stop following ' : 'Follow ' }}{{ p.name }}, {{ p.where }}</span>
                </button>
              </li>
              <li class="ch__extra" aria-hidden="true">+{{ people.length - 1 }}</li>
            </ul>
            <span class="ch__comments"><MiBadge :count="comments" placement="top-right" :offset="1" count-noun="open comments" tone="primary">
              <template #target>
                <MiIconButton size="toolbar" variant="plain" label="Comments"><MiIcon name="chat" :size="18" /></MiIconButton>
              </template>
            </MiBadge></span>
            <MiButton size="small" class="ch__share" aria-label="Share document">
              <template #leading><MiIcon name="lock" :size="14" /></template>
              <span class="ch__share-label">Share</span>
            </MiButton>
          </div>
        </div>

        <Transition name="ch-follow">
          <div v-if="following" class="ch__follow" :style="{ '--c': `var(--mi-${followed!.color})` }">
            <span class="ch__follow-dot" aria-hidden="true" />
            <span>Following <strong>{{ followed!.name.split(' ')[0] }}</strong> · {{ followed!.where }}</span>
            <button type="button" class="ch__follow-stop" @click="following = null">Stop <MiKbd>Esc</MiKbd></button>
          </div>
        </Transition>
      </header>

      <article class="ch__doc" :class="{ 'is-following': following }" aria-labelledby="ch-doc-title">
        <MiText as="p" variant="footnote" tone="label2" tabular>Last edited by Mara Lindqvist · {{ editedText }}</MiText>
        <MiText id="ch-doc-title" as="h2" variant="title1" weight="bold" balance>{{ title || 'Untitled' }}</MiText>
        <section v-for="(b, bi) in blocks" :key="b.h" class="ch__block">
          <MiText as="h3" variant="headline" weight="semibold">{{ b.h }}</MiText>
          <p class="ch__p">
            {{ b.before }}<mark v-if="b.mark" class="ch__sel" :style="{ '--c': `var(--mi-${b.mark.color})` }">{{ b.mark.text }}</mark>{{ b.after }}
          </p>
          <span
            v-for="p in people.filter(x => x.block === bi)" :key="p.name" class="ch__cursor" :class="{ 'is-on': following === p.name }"
            :style="{ '--c': `var(--mi-${p.color})`, '--x': p.x, '--y': p.y + 'px', '--d': p.delay }" aria-hidden="true"
          >
            <svg viewBox="0 0 16 16" class="ch__arrow"><path d="M2 1.5 13.5 7 8 8.4 5.6 14z" /></svg>
            <span class="ch__tag">{{ p.name.split(' ')[0] }}</span>
          </span>
        </section>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const trail = ['Halyard', 'Product', 'Specs', 'Q1 2027']
const title = ref('Pricing page rewrite')
const comments = 6

interface Person { name: string, color: string, where: string, block: number, x: string, y: number, delay: string }
const people: Person[] = [
  { name: 'Mara Lindqvist', color: 'purple', where: 'editing Proposal', block: 1, x: '64%', y: 52, delay: '0s' },
  { name: 'Kofi Mensah', color: 'orange', where: 'selecting in Problem', block: 0, x: '38%', y: 74, delay: '-2.4s' },
  { name: 'Ana Sobral', color: 'teal', where: 'reading Open questions', block: 2, x: '22%', y: 36, delay: '-1.1s' },
  { name: 'Lou Perrin', color: 'pink', where: 'idle for 4 min', block: 1, x: '12%', y: 96, delay: '-3.2s' }
]

const blocks = [
  {
    h: 'Problem',
    before: 'Visitors compare plans on a table they cannot read on a phone. ',
    mark: { text: 'Six in ten mobile sessions leave the page without opening a plan', color: 'orange' },
    after: ', and support answers the same seat-pricing question about forty times a week.'
  },
  {
    h: 'Proposal',
    before: 'Replace the table with three stacked plan cards and a seat slider that shows the monthly total as you drag. Annual billing becomes the default, with the saving written in euros rather than as a percentage.',
    after: ''
  },
  {
    h: 'Open questions',
    before: 'Do we keep the Enterprise column, or route it to a contact form? Legal needs to confirm how VAT is shown for customers outside the EU before we ship the slider.',
    after: ''
  }
]

// Following someone dims the other cursors and brings theirs into view.
const following = ref<string | null>(null)
const followed = computed(() => people.find(p => p.name === following.value))
const scrollEl = ref<HTMLElement>()
function follow(name: string) {
  following.value = following.value === name ? null : name
  if (!following.value) return
  const p = followed.value!
  const block = scrollEl.value?.querySelectorAll('.ch__block')[p.block]
  block?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// Editing the title shows a short sync, then "Saved".
const syncing = ref(false)
const editedText = ref('2 min ago')
let syncTimer: ReturnType<typeof setTimeout> | undefined
watch(title, () => {
  syncing.value = true
  clearTimeout(syncTimer)
  syncTimer = setTimeout(() => { syncing.value = false; editedText.value = 'just now' }, 900)
})
onBeforeUnmount(() => clearTimeout(syncTimer))

/** Folders behind "…": everything on phones, then all but the root, then only the middle ones. */
const folds = [
  { size: 'xs', items: trail },
  { size: 'sm', items: trail.slice(1) },
  { size: 'md', items: trail.slice(1, -1) }
].map(f => ({ size: f.size, items: f.items.map(c => ({ value: c, label: c })) }))

/** Breadcrumb collapse: the root always shows, the middle folds into "…" on narrow widths. */
function crumbClass(i: number) {
  if (i === 0) return 'is-root'
  return i === trail.length - 1 ? 'is-near' : 'is-mid'
}
</script>

<style scoped>
.ch { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.ch__scroll { position: relative; height: 460px; overflow-y: auto; background: var(--mi-card); scroll-padding-top: 80px; }

.ch__header {
  position: sticky; top: 0; z-index: 3; display: grid; gap: 8px; padding: 10px 12px;
  background: var(--mi-mat); backdrop-filter: saturate(1.6) blur(18px); -webkit-backdrop-filter: saturate(1.6) blur(18px);
  box-shadow: 0 1px 0 var(--mi-sep);
}
.ch__row { display: flex; align-items: center; gap: 10px; min-width: 0; }
.ch__tile { display: grid; place-items: center; flex: none; width: 28px; height: 28px; border-radius: 8px; color: var(--mi-p-text); background: var(--mi-p-tint); }

.ch__crumbs { flex: 1; min-width: 0; }
.ch__crumbs ol { display: flex; align-items: center; min-width: 0; margin: 0; padding: 0; list-style: none; }
.ch__crumb { display: flex; align-items: center; flex: none; min-width: 0; font-size: 13.5px; color: var(--mi-label2); }
.ch__crumb + .ch__crumb::before { content: "/"; padding: 0 6px; color: var(--mi-label3); }
.ch__crumb a { color: inherit; text-decoration: none; border-radius: 5px; padding: 2px 3px; white-space: nowrap; }
.ch__crumb a:hover { color: var(--mi-label); background: var(--mi-fill4); }
.ch__crumb a:focus-visible, .ch__more:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.ch__crumb.is-mid, .ch__crumb.is-near, .ch__crumb.is-root { display: none; }
.ch__crumb--more::before { display: none; }
.ch__crumb--more.is-sm, .ch__crumb--more.is-md { display: none; }
.ch__more { height: 24px; min-width: 26px; padding: 0 6px; border: 0; border-radius: 6px; font: inherit; font-weight: 700; color: var(--mi-label2); background: var(--mi-fill4); cursor: pointer; }
.ch__more:hover { color: var(--mi-label); background: var(--mi-fill3); }
.ch__crumb--title { flex: 1 1 auto; min-width: 0; }
.ch__title {
  width: 100%; max-width: 100%; min-width: 0; padding: 3px 6px; margin-left: -3px; border: 0; border-radius: 6px; outline: none;
  font: inherit; font-size: 14px; font-weight: 650; color: var(--mi-label); background: none; text-overflow: ellipsis;
}
.ch__title:hover { background: var(--mi-fill4); }
.ch__title:focus { background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-p), 0 0 0 4px color-mix(in srgb, var(--mi-p) 20%, transparent); }

.ch__status { display: none; align-items: center; gap: 5px; flex: none; font-size: 12px; color: var(--mi-label2); }
.ch__ok { color: var(--mi-green); }

.ch__end { display: flex; align-items: center; gap: 6px; flex: none; }
.ch__people { display: flex; align-items: center; margin: 0 4px 0 0; padding: 0; list-style: none; }
.ch__people li + li { margin-left: -4px; }
.ch__people .is-extra { display: none; }
.ch__face {
  position: relative; display: grid; place-items: center; padding: 0; border: 0; border-radius: 50%; background: none; cursor: pointer;
  box-shadow: 0 0 0 2px var(--mi-card), 0 0 0 3.5px var(--c); transition: transform var(--mi-dur-2) var(--mi-spring);
}
.ch__face:hover { transform: translateY(-2px); z-index: 1; }
.ch__face.is-following { transform: scale(1.12); z-index: 2; }
.ch__face:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 4px; }
.ch__extra { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; font-size: 10.5px; font-weight: 650; color: var(--mi-label2); background: var(--mi-fill3); box-shadow: 0 0 0 2px var(--mi-card); }
.ch__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.ch__share { flex: none; }
.ch__comments { display: none; }
.ch__share-label { display: none; }

.ch__follow {
  justify-self: start; display: inline-flex; align-items: center; gap: 8px; padding: 4px 4px 4px 10px; border-radius: 999px; font-size: 12.5px;
  color: var(--mi-label); background: color-mix(in srgb, var(--c) 14%, var(--mi-card)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 40%, transparent);
}
.ch__follow strong { font-weight: 650; }
.ch__follow-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--c); }
.ch__follow-stop { display: inline-flex; align-items: center; gap: 6px; height: 24px; padding: 0 4px 0 10px; border: 0; border-radius: 999px; font: inherit; font-size: 12px; color: var(--mi-label2); background: var(--mi-card); cursor: pointer; }
.ch__follow-stop:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.ch-follow-enter-active, .ch-follow-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.ch-follow-enter-from, .ch-follow-leave-to { opacity: 0; transform: translateY(-4px); }

/* Document */
.ch__doc { display: grid; gap: 10px; max-width: 640px; margin: 0 auto; padding: 28px 18px 80px; }
.ch__block { position: relative; display: grid; gap: 6px; margin-top: 18px; }
.ch__p { margin: 0; font-size: 16px; line-height: 1.7; color: var(--mi-label); }
.ch__sel { color: inherit; border-radius: 3px; background: color-mix(in srgb, var(--c) 22%, transparent); box-shadow: 0 0 0 1px color-mix(in srgb, var(--c) 30%, transparent); }

.ch__cursor {
  position: absolute; left: var(--x); top: var(--y); z-index: 1; display: flex; align-items: flex-start; pointer-events: none;
  animation: ch-drift 7s var(--mi-ease-in-out) var(--d) infinite; transition: opacity var(--mi-dur-3) var(--mi-ease);
}
.ch__arrow { width: 16px; height: 16px; fill: var(--c); stroke: var(--mi-card); stroke-width: 1.2; filter: drop-shadow(0 1px 1px color-mix(in srgb, var(--mi-label) 25%, transparent)); }
.ch__tag { margin: 12px 0 0 -3px; padding: 2px 7px; border-radius: 6px 9px 9px 9px; font-size: 11px; font-weight: 650; line-height: 15px; color: var(--mi-card); background: var(--c); white-space: nowrap; }
.is-following .ch__cursor { opacity: .2; }
.is-following .ch__cursor.is-on { opacity: 1; }
.ch__cursor.is-on .ch__tag { box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 28%, transparent); }
@keyframes ch-drift {
  0%, 100% { transform: translate(0, 0); }
  30% { transform: translate(18px, 4px); }
  55% { transform: translate(6px, -6px); }
  80% { transform: translate(-10px, 2px); }
}
@media (prefers-reduced-motion: reduce) { .ch__cursor { animation: none; } }

@container (min-width: 520px) {
  .ch__header { padding: 10px 16px; }
  .ch__crumb.is-root { display: flex; }
  .ch__crumb--more::before { display: inline; }
  .ch__crumb--more.is-xs { display: none; }
  .ch__crumb--more.is-sm { display: flex; }
  .ch__status { display: inline-flex; }
  .ch__share-label { display: inline; }
  .ch__comments { display: inline-flex; }
  .ch__status-text { display: none; }
  .ch__people .is-extra { display: list-item; }
  .ch__extra { display: none; }
}
@container (min-width: 760px) {
  .ch__crumb.is-near { display: flex; }
  .ch__crumb--more.is-sm { display: none; }
  .ch__crumb--more.is-md { display: flex; }
  .ch__status-text { display: inline; }
}
@container (min-width: 980px) {
  .ch__crumb.is-mid { display: flex; }
  .ch__crumb--more.is-md { display: none; }
  .ch__header { padding: 10px 20px; }
  .ch__doc { padding-top: 40px; }
}
</style>

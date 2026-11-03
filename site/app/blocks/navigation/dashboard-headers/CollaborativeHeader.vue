<template>
  <div class="ch mi:@container mi:font-mi mi:text-label">
    <div ref="scrollEl" class="ch__scroll mi:relative mi:h-115 mi:overflow-y-auto mi:[background:var(--mi-card)] mi:[scroll-padding-top:80px]" @keydown.esc="following = null">
      <!-- Sticky, translucent: the document scrolls underneath it. -->
      <header class="ch__header mi:sticky mi:top-0 mi:z-3 mi:grid mi:gap-2 mi:py-2.5 mi:px-3 mi:[background:var(--mi-mat)] mi:shadow-[0_1px_0_var(--mi-sep)] mi:@[520px]:py-2.5 mi:@[520px]:px-4 mi:@[980px]:py-2.5 mi:@[980px]:px-5">
        <div class="ch__row mi:flex mi:items-center mi:gap-2.5 mi:min-w-0">
          <span class="ch__tile mi:grid mi:place-items-center mi:flex-[none] mi:w-7 mi:h-7 mi:rounded-[8px] mi:text-p-text mi:[background:var(--mi-p-tint)]" aria-hidden="true"><MiIcon name="document" :size="16" /></span>

          <nav class="ch__crumbs mi:flex-1 mi:min-w-0" aria-label="Location">
            <ol class="mi:[.ch__crumbs_ol&]:[list-style:none]">
              <li v-for="(c, i) in trail" :key="c" class="ch__crumb mi:flex mi:items-center mi:text-[13.5px] mi:text-label2 mi:[.ch__crumb+&]:before:content-['/'] mi:[.ch__crumb+&]:before:py-0 mi:[.ch__crumb+&]:before:px-1.5 mi:[.ch__crumb+&]:before:text-label3 mi:[&.is-root]:hidden" :class="crumbClass(i)">
                <a class="mi:[.ch__crumb_a&]:[text-decoration:none]" href="#" @click.prevent>{{ c }}</a>
              </li>
              <!-- One "…" per width step, each listing only the folders hidden at that step. -->
              <li v-for="fold in folds" :key="fold.size" class="ch__crumb ch__crumb--more mi:flex mi:items-center mi:text-[13.5px] mi:text-label2 mi:[.ch__crumb+&]:before:content-['/'] mi:[.ch__crumb+&]:before:py-0 mi:[.ch__crumb+&]:before:px-1.5 mi:[.ch__crumb+&]:before:text-label3 mi:[&.is-root]:hidden mi:before:hidden mi:@[520px]:before:inline" :class="'is-' + fold.size">
                <MiMenu class="mi:[.ch__crumbs_ol&]:[list-style:none] mi:[.ch__crumb_a&]:[text-decoration:none]" :items="fold.items" aria-label="Show hidden folders">
                  <template #trigger="{ props }">
                    <button v-bind="props" type="button" class="ch__more mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:h-6 mi:min-w-6.5 mi:py-0 mi:px-1.5 mi:[border:0] mi:rounded-[6px] mi:text-label2 mi:[background:var(--mi-fill4)] mi:cursor-pointer mi:hover:text-label mi:hover:[background:var(--mi-fill3)]" aria-label="Show hidden folders">…</button>
                  </template>
                </MiMenu>
              </li>
              <li class="ch__crumb ch__crumb--title mi:flex mi:items-center mi:text-[13.5px] mi:text-label2 mi:[.ch__crumb+&]:before:content-['/'] mi:[.ch__crumb+&]:before:py-0 mi:[.ch__crumb+&]:before:px-1.5 mi:[.ch__crumb+&]:before:text-label3 mi:[&.is-root]:hidden">
                <input v-model="title" class="ch__title mi:w-full mi:max-w-full mi:min-w-0 mi:py-[3px] mi:px-1.5 mi:ml-[-3px] mi:[border:0] mi:rounded-[6px] mi:[outline:none] mi:text-label mi:[background:none] mi:text-ellipsis mi:hover:[background:var(--mi-fill4)] mi:focus:[background:var(--mi-card)] mi:focus:shadow-[0_0_0_1px_var(--mi-p),_0_0_0_4px_color-mix(in_srgb,_var(--mi-p)_20%,_transparent)]" aria-label="Document title" spellcheck="false" :size="Math.max(8, title.length)">
              </li>
            </ol>
          </nav>

          <div class="ch__status mi:hidden mi:items-center mi:gap-[5px] mi:flex-[none] mi:text-[12px] mi:text-label2 mi:@[520px]:inline-flex" role="status" aria-live="polite">
            <MiSpinner v-if="syncing" :size="14" label="" />
            <MiIcon v-else name="check" :size="14" class="ch__ok mi:text-green" />
            <span class="ch__status-text mi:@[520px]:hidden mi:@[760px]:inline">{{ syncing ? 'Syncing…' : 'Saved' }}</span>
          </div>

          <div class="ch__end mi:flex mi:items-center mi:gap-1.5 mi:flex-[none]">
            <!-- Presence: each ring wears the colour of that person's cursor; click to follow. -->
            <ul class="ch__people mi:flex mi:items-center mi:mt-0 mi:mr-1 mi:mb-0 mi:ml-0 mi:p-0 mi:[list-style:none]" aria-label="People in this document">
              <li v-for="(p, i) in people" :key="p.name" :class="{ 'is-extra': i >= 1 }">
                <button
                  type="button" class="ch__face mi:relative mi:grid mi:place-items-center mi:p-0 mi:[border:0] mi:rounded-[50%] mi:[background:none] mi:cursor-pointer mi:shadow-[0_0_0_2px_var(--mi-card),_0_0_0_3.5px_var(--c)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[4px]" :class="{ 'is-following': following === p.name }" :style="{ '--c': `var(--mi-${p.color})` }"
                  :aria-pressed="following === p.name" :title="p.name + ' · ' + p.where" @click="follow(p.name)"
                >
                  <MiAvatar :name="p.name" :size="26" tone="auto" decorative />
                  <span class="ch__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">{{ following === p.name ? 'Stop following ' : 'Follow ' }}{{ p.name }}, {{ p.where }}</span>
                </button>
              </li>
              <li class="ch__extra mi:grid mi:place-items-center mi:w-6.5 mi:h-6.5 mi:rounded-[50%] mi:text-[10.5px] mi:font-650 mi:text-label2 mi:[background:var(--mi-fill3)] mi:shadow-[0_0_0_2px_var(--mi-card)] mi:@[520px]:hidden" aria-hidden="true">+{{ people.length - 1 }}</li>
            </ul>
            <span class="ch__comments mi:hidden mi:@[520px]:inline-flex"><MiBadge :count="comments" placement="top-right" :offset="1" count-noun="open comments" tone="primary">
              <template #target>
                <MiIconButton size="toolbar" variant="plain" label="Comments"><MiIcon name="chat" :size="18" /></MiIconButton>
              </template>
            </MiBadge></span>
            <MiButton size="small" class="ch__share" aria-label="Share document">
              <template #leading><MiIcon name="lock" :size="14" /></template>
              <span class="ch__share-label mi:hidden mi:@[520px]:inline">Share</span>
            </MiButton>
          </div>
        </div>

        <Transition name="ch-follow">
          <div v-if="following" class="ch__follow mi:justify-self-start mi:inline-flex mi:items-center mi:gap-2 mi:pt-1 mi:pr-1 mi:pb-1 mi:pl-2.5 mi:rounded-[999px] mi:text-[12.5px] mi:text-label mi:[background:color-mix(in_srgb,_var(--c)_14%,_var(--mi-card))] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--c)_40%,_transparent)]" :style="{ '--c': `var(--mi-${followed!.color})` }">
            <span class="ch__follow-dot mi:w-[7px] mi:h-[7px] mi:rounded-[50%] mi:[background:var(--c)]" aria-hidden="true" />
            <span>Following <strong>{{ followed!.name.split(' ')[0] }}</strong> · {{ followed!.where }}</span>
            <button type="button" class="ch__follow-stop mi:inline-flex mi:items-center mi:gap-1.5 mi:h-6 mi:pt-0 mi:pr-1 mi:pb-0 mi:pl-2.5 mi:[border:0] mi:rounded-[999px] mi:text-label2 mi:[background:var(--mi-card)] mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" @click="following = null">Stop <MiKbd>Esc</MiKbd></button>
          </div>
        </Transition>
      </header>

      <article class="ch__doc mi:grid mi:gap-2.5 mi:max-w-160 mi:my-0 mi:mx-auto mi:pt-7 mi:px-4.5 mi:pb-20 mi:@[980px]:pt-10" :class="{ 'is-following': following }" aria-labelledby="ch-doc-title">
        <MiText as="p" variant="footnote" tone="label2" tabular>Last edited by Mara Lindqvist · {{ editedText }}</MiText>
        <MiText id="ch-doc-title" as="h2" variant="title1" weight="bold" balance>{{ title || 'Untitled' }}</MiText>
        <section v-for="(b, bi) in blocks" :key="b.h" class="ch__block mi:relative mi:grid mi:gap-1.5 mi:mt-4.5">
          <MiText as="h3" variant="headline" weight="semibold">{{ b.h }}</MiText>
          <p class="ch__p mi:m-0 mi:text-[16px] mi:leading-[1.7] mi:text-label">
            {{ b.before }}<mark v-if="b.mark" class="ch__sel mi:text-inherit mi:rounded-[3px] mi:[background:color-mix(in_srgb,_var(--c)_22%,_transparent)] mi:shadow-[0_0_0_1px_color-mix(in_srgb,_var(--c)_30%,_transparent)]" :style="{ '--c': `var(--mi-${b.mark.color})` }">{{ b.mark.text }}</mark>{{ b.after }}
          </p>
          <span
            v-for="p in people.filter(x => x.block === bi)" :key="p.name" class="ch__cursor mi:absolute mi:left-(--x) mi:top-(--y) mi:z-1 mi:flex mi:[align-items:flex-start] mi:pointer-events-none mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:[.is-following_&]:opacity-20 mi:[.is-following_&.is-on]:opacity-100" :class="{ 'is-on': following === p.name }"
            :style="{ '--c': `var(--mi-${p.color})`, '--x': p.x, '--y': p.y + 'px', '--d': p.delay }" aria-hidden="true"
          >
            <svg viewBox="0 0 16 16" class="ch__arrow mi:w-4 mi:h-4 mi:fill-(--c) mi:stroke-card mi:[stroke-width:1.2] mi:[filter:drop-shadow(0_1px_1px_color-mix(in_srgb,_var(--mi-label)_25%,_transparent))]"><path d="M2 1.5 13.5 7 8 8.4 5.6 14z" /></svg>
            <span class="ch__tag mi:mt-3 mi:mr-0 mi:mb-0 mi:ml-[-3px] mi:py-0.5 mi:px-[7px] mi:rounded-[6px_9px_9px_9px] mi:text-[11px] mi:font-650 mi:leading-[15px] mi:text-card mi:[background:var(--c)] mi:whitespace-nowrap mi:[.ch__cursor.is-on_&]:shadow-[0_0_0_3px_color-mix(in_srgb,_var(--c)_28%,_transparent)]">{{ p.name.split(' ')[0] }}</span>
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
.ch__header { backdrop-filter: saturate(1.6) blur(18px); -webkit-backdrop-filter: saturate(1.6) blur(18px);
}
.ch__crumbs ol { display: flex; align-items: center; min-width: 0; margin: 0; padding: 0; }
.ch__crumb { flex: none; min-width: 0; }
.ch__crumb a { color: inherit; border-radius: 5px; padding: 2px 3px; white-space: nowrap; }
.ch__crumb a:hover { color: var(--mi-label); background: var(--mi-fill4); }
.ch__crumb a:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.ch__crumb.is-mid, .ch__crumb.is-near { display: none; }
.ch__crumb--more.is-sm, .ch__crumb--more.is-md { display: none; }
.ch__more { font: inherit; font-weight: 700; }
.ch__crumb--title { flex: 1 1 auto; min-width: 0; }
.ch__title {
  font: inherit; font-size: 14px; font-weight: 650;
}
.ch__people li + li { margin-left: -4px; }
.ch__people .is-extra { display: none; }
.ch__face:hover { transform: translateY(-2px); z-index: 1; }
.ch__face.is-following { transform: scale(1.12); z-index: 2; }
.ch__share { flex: none; }
.ch__follow strong { font-weight: 650; }
.ch__follow-stop { font: inherit; font-size: 12px; }
.ch-follow-enter-active, .ch-follow-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.ch-follow-enter-from, .ch-follow-leave-to { opacity: 0; transform: translateY(-4px); }

.ch__cursor {
  animation: ch-drift 7s var(--mi-ease-in-out) var(--d) infinite;
}
@keyframes ch-drift {
  0%, 100% { transform: translate(0, 0); }
  30% { transform: translate(18px, 4px); }
  55% { transform: translate(6px, -6px); }
  80% { transform: translate(-10px, 2px); }
}
@media (prefers-reduced-motion: reduce) { .ch__cursor { animation: none; } }

@container (min-width: 520px) {
  .ch__crumb.is-root { display: flex; }
  .ch__crumb--more.is-xs { display: none; }
  .ch__crumb--more.is-sm { display: flex; }
  .ch__people .is-extra { display: list-item; }
}
@container (min-width: 760px) {
  .ch__crumb.is-near { display: flex; }
  .ch__crumb--more.is-sm { display: none; }
  .ch__crumb--more.is-md { display: flex; }
}
@container (min-width: 980px) {
  .ch__crumb.is-mid { display: flex; }
  .ch__crumb--more.is-md { display: none; }
}
</style>

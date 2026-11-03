<template>
  <div class="mi:@container mi:font-mi mi:text-label">
    <div ref="scrollEl" class="mi:relative mi:h-115 mi:overflow-y-auto mi:[background:var(--mi-card)] mi:[scroll-padding-top:80px]" @keydown.esc="following = null">
      <!-- Sticky, translucent: the document scrolls underneath it. -->
      <header class="mi:sticky mi:top-0 mi:z-3 mi:grid mi:gap-2 mi:py-2.5 mi:px-3 mi:[background:var(--mi-mat)] mi:shadow-[0_1px_0_var(--mi-sep)] mi:@[520px]:py-2.5 mi:@[520px]:px-4 mi:@[980px]:py-2.5 mi:@[980px]:px-5">
        <div class="mi:flex mi:items-center mi:gap-2.5 mi:min-w-0">
          <span class="mi:grid mi:place-items-center mi:flex-[none] mi:w-7 mi:h-7 mi:rounded-[8px] mi:text-p-text mi:[background:var(--mi-p-tint)]" aria-hidden="true"><MiIcon name="document" :size="16" /></span>

          <nav class="mi:flex-1 mi:min-w-0" aria-label="Location">
            <ol class="mi:[list-style:none] mi:flex mi:items-center mi:min-w-0 mi:m-0 mi:p-0">
              <li v-for="(c, i) in trail" :key="c" class="mi:flex-[none] mi:min-w-0 mi:items-center mi:text-[13.5px] mi:text-label2 mi:not-first:before:content-['/'] mi:not-first:before:py-0 mi:not-first:before:px-1.5 mi:not-first:before:text-label3" :class="crumbClass(i)">
                <a class="mi:[text-decoration:none] mi:text-inherit mi:rounded-[5px] mi:py-0.5 mi:px-[3px] mi:whitespace-nowrap mi:hover:text-label mi:hover:bg-fill4 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" href="#" @click.prevent>{{ c }}</a>
              </li>
              <!-- One "…" per width step, each listing only the folders hidden at that step. -->
              <li v-for="fold in folds" :key="fold.size" class="mi:flex-[none] mi:min-w-0 mi:items-center mi:text-[13.5px] mi:text-label2 mi:not-first:before:content-['/'] mi:not-first:before:py-0 mi:not-first:before:px-1.5 mi:not-first:before:text-label3 mi:before:hidden mi:@[520px]:before:inline" :class="{ xs: 'mi:flex mi:@[520px]:hidden', sm: 'mi:hidden mi:@[520px]:flex mi:@[760px]:hidden', md: 'mi:hidden mi:@[760px]:flex mi:@[980px]:hidden' }[fold.size]">
                <MiMenu class="" :items="fold.items" aria-label="Show hidden folders">
                  <template #trigger="{ props }">
                    <button v-bind="props" type="button" class="mi:[font:inherit] mi:font-bold mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:h-6 mi:min-w-6.5 mi:py-0 mi:px-1.5 mi:[border:0] mi:rounded-[6px] mi:text-label2 mi:[background:var(--mi-fill4)] mi:cursor-pointer mi:hover:text-label mi:hover:[background:var(--mi-fill3)]" aria-label="Show hidden folders">…</button>
                  </template>
                </MiMenu>
              </li>
              <li class="mi:flex mi:flex-[1_1_auto] mi:min-w-0 mi:items-center mi:text-[13.5px] mi:text-label2 mi:not-first:before:content-['/'] mi:not-first:before:py-0 mi:not-first:before:px-1.5 mi:not-first:before:text-label3">
                <input v-model="title" class="mi:[font:inherit] mi:text-[14px] mi:font-650 mi:w-full mi:max-w-full mi:min-w-0 mi:py-[3px] mi:px-1.5 mi:ml-[-3px] mi:[border:0] mi:rounded-[6px] mi:[outline:none] mi:text-label mi:[background:none] mi:text-ellipsis mi:hover:[background:var(--mi-fill4)] mi:focus:[background:var(--mi-card)] mi:focus:shadow-[0_0_0_1px_var(--mi-p),_0_0_0_4px_color-mix(in_srgb,_var(--mi-p)_20%,_transparent)]" aria-label="Document title" spellcheck="false" :size="Math.max(8, title.length)">
              </li>
            </ol>
          </nav>

          <div class="mi:hidden mi:items-center mi:gap-[5px] mi:flex-[none] mi:text-[12px] mi:text-label2 mi:@[520px]:inline-flex" role="status" aria-live="polite">
            <MiSpinner v-if="syncing" :size="14" label="" />
            <MiIcon v-else name="check" :size="14" class="mi:text-green" />
            <span class="mi:@[520px]:hidden mi:@[760px]:inline">{{ syncing ? 'Syncing…' : 'Saved' }}</span>
          </div>

          <div class="mi:flex mi:items-center mi:gap-1.5 mi:flex-[none]">
            <!-- Presence: each ring wears the colour of that person's cursor; click to follow. -->
            <ul class="mi:flex mi:items-center mi:mt-0 mi:mr-1 mi:mb-0 mi:ml-0 mi:p-0 mi:[list-style:none]" aria-label="People in this document">
              <li v-for="(p, i) in people" :key="p.name" class="mi:not-first:-ml-1" :class="i >= 1 ? 'mi:hidden mi:@[520px]:[display:list-item]' : ''">
                <button
                  type="button" class="mi:relative mi:grid mi:place-items-center mi:p-0 mi:[border:0] mi:rounded-[50%] mi:[background:none] mi:cursor-pointer mi:shadow-[0_0_0_2px_var(--mi-card),_0_0_0_3.5px_var(--c)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[4px]" :class="following === p.name ? 'mi:transform-[scale(1.12)] mi:z-2' : 'mi:hover:transform-[translateY(-2px)] mi:hover:z-1'" :style="{ '--c': `var(--mi-${p.color})` }"
                  :aria-pressed="following === p.name" :title="p.name + ' · ' + p.where" @click="follow(p.name)"
                >
                  <MiAvatar :name="p.name" :size="26" tone="auto" decorative />
                  <span class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">{{ following === p.name ? 'Stop following ' : 'Follow ' }}{{ p.name }}, {{ p.where }}</span>
                </button>
              </li>
              <li class="mi:not-first:-ml-1 mi:grid mi:place-items-center mi:w-6.5 mi:h-6.5 mi:rounded-[50%] mi:text-[10.5px] mi:font-650 mi:text-label2 mi:[background:var(--mi-fill3)] mi:shadow-[0_0_0_2px_var(--mi-card)] mi:@[520px]:hidden" aria-hidden="true">+{{ people.length - 1 }}</li>
            </ul>
            <span class="mi:hidden mi:@[520px]:inline-flex"><MiBadge :count="comments" placement="top-right" :offset="1" count-noun="open comments" tone="primary">
              <template #target>
                <MiIconButton size="toolbar" variant="plain" label="Comments"><MiIcon name="chat" :size="18" /></MiIconButton>
              </template>
            </MiBadge></span>
            <MiButton size="small" class="mi:flex-[none]" aria-label="Share document">
              <template #leading><MiIcon name="lock" :size="14" /></template>
              <span class="mi:hidden mi:@[520px]:inline">Share</span>
            </MiButton>
          </div>
        </div>

        <Transition enter-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),transform_var(--mi-dur-2)_var(--mi-ease)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),transform_var(--mi-dur-2)_var(--mi-ease)]" enter-from-class="mi:opacity-0 mi:transform-[translateY(-4px)]" leave-to-class="mi:opacity-0 mi:transform-[translateY(-4px)]">
          <div v-if="following" class="mi:justify-self-start mi:inline-flex mi:items-center mi:gap-2 mi:pt-1 mi:pr-1 mi:pb-1 mi:pl-2.5 mi:rounded-[999px] mi:text-[12.5px] mi:text-label mi:[background:color-mix(in_srgb,_var(--c)_14%,_var(--mi-card))] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--c)_40%,_transparent)]" :style="{ '--c': `var(--mi-${followed!.color})` }">
            <span class="mi:w-[7px] mi:h-[7px] mi:rounded-[50%] mi:[background:var(--c)]" aria-hidden="true" />
            <span>Following <strong class="mi:font-650">{{ followed!.name.split(' ')[0] }}</strong> · {{ followed!.where }}</span>
            <button type="button" class="mi:[font:inherit] mi:text-[12px] mi:inline-flex mi:items-center mi:gap-1.5 mi:h-6 mi:pt-0 mi:pr-1 mi:pb-0 mi:pl-2.5 mi:[border:0] mi:rounded-[999px] mi:text-label2 mi:[background:var(--mi-card)] mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" @click="following = null">Stop <MiKbd>Esc</MiKbd></button>
          </div>
        </Transition>
      </header>

      <article class="mi:group mi:grid mi:gap-2.5 mi:max-w-160 mi:my-0 mi:mx-auto mi:pt-7 mi:px-4.5 mi:pb-20 mi:@[980px]:pt-10" :data-following="following ? 'true' : undefined" aria-labelledby="ch-doc-title">
        <MiText as="p" variant="footnote" tone="label2" tabular>Last edited by Mara Lindqvist · {{ editedText }}</MiText>
        <MiText id="ch-doc-title" as="h2" variant="title1" weight="bold" balance>{{ title || 'Untitled' }}</MiText>
        <section v-for="(b, bi) in blocks" :key="b.h" data-block class="mi:relative mi:grid mi:gap-1.5 mi:mt-4.5">
          <MiText as="h3" variant="headline" weight="semibold">{{ b.h }}</MiText>
          <p class="mi:m-0 mi:text-[16px] mi:leading-[1.7] mi:text-label">
            {{ b.before }}<mark v-if="b.mark" class="mi:text-inherit mi:rounded-[3px] mi:[background:color-mix(in_srgb,_var(--c)_22%,_transparent)] mi:shadow-[0_0_0_1px_color-mix(in_srgb,_var(--c)_30%,_transparent)]" :style="{ '--c': `var(--mi-${b.mark.color})` }">{{ b.mark.text }}</mark>{{ b.after }}
          </p>
          <span
            v-for="p in people.filter(x => x.block === bi)" :key="p.name" class="mi:[--mi-float-x:18px] mi:[--mi-float:4px] mi:animate-[float_7s_var(--mi-ease-in-out)_var(--d)_infinite] mi:motion-reduce:animate-none mi:absolute mi:left-(--x) mi:top-(--y) mi:z-1 mi:flex mi:[align-items:flex-start] mi:pointer-events-none mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" :class="following === p.name ? 'mi:group-data-[following]:opacity-100' : 'mi:group-data-[following]:opacity-20'"
            :style="{ '--c': `var(--mi-${p.color})`, '--x': p.x, '--y': p.y + 'px', '--d': p.delay }" aria-hidden="true"
          >
            <svg viewBox="0 0 16 16" class="mi:w-4 mi:h-4 mi:fill-(--c) mi:stroke-card mi:[stroke-width:1.2] mi:[filter:drop-shadow(0_1px_1px_color-mix(in_srgb,_var(--mi-label)_25%,_transparent))]"><path d="M2 1.5 13.5 7 8 8.4 5.6 14z" /></svg>
            <span class="mi:mt-3 mi:mr-0 mi:mb-0 mi:ml-[-3px] mi:py-0.5 mi:px-[7px] mi:rounded-[6px_9px_9px_9px] mi:text-[11px] mi:font-650 mi:leading-[15px] mi:text-card mi:[background:var(--c)] mi:whitespace-nowrap" :class="following === p.name ? 'mi:shadow-[0_0_0_3px_color-mix(in_srgb,_var(--c)_28%,_transparent)]' : ''">{{ p.name.split(' ')[0] }}</span>
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
  const block = scrollEl.value?.querySelectorAll('[data-block]')[p.block]
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
  if (i === 0) return 'mi:hidden mi:@[520px]:flex'
  return i === trail.length - 1 ? 'mi:hidden mi:@[760px]:flex' : 'mi:hidden mi:@[980px]:flex'
}
</script>

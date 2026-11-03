<template>
  <div class="mi:@container mi:min-h-full mi:font-mi mi:text-label mi:[background:radial-gradient(120%_80%_at_0%_0%,_var(--mi-p-tint),_transparent_60%),_var(--mi-page)]">
    <div class="mi:grid mi:gap-3 mi:p-3 mi:@[640px]:grid-cols-[minmax(0,_1fr)_260px] mi:@[640px]:p-4 mi:@[640px]:gap-4 mi:@[960px]:grid-cols-[220px_minmax(0,_1fr)_280px] mi:@[960px]:items-start">
      <!-- Island 1: navigation. A floating column when wide, a floating pill strip when narrow. -->
      <nav class="mi:rounded-[999px] mi:@[960px]:rounded-xl mi:min-w-0 mi:[background:var(--mi-card)] mi:shadow-[var(--mi-sh2),_inset_0_0_0_1px_var(--mi-sep)] mi:flex mi:items-center mi:gap-2.5 mi:pt-1.5 mi:pr-1.5 mi:pb-1.5 mi:pl-3 mi:@[640px]:col-span-full mi:@[960px]:col-[auto] mi:@[960px]:flex-col mi:@[960px]:items-stretch mi:@[960px]:gap-3 mi:@[960px]:py-3.5 mi:@[960px]:px-2.5" aria-label="Review files">
        <div class="mi:flex mi:items-center mi:gap-2 mi:flex-[none] mi:@[960px]:py-0 mi:@[960px]:px-1.5">
          <span class="mi:w-5.5 mi:h-5.5 mi:rounded-[50%] mi:[background:conic-gradient(from_90deg,_var(--mi-p),_var(--mi-s),_var(--mi-p))]" aria-hidden="true" />
          <MiText as="span" variant="subheadline" weight="bold" class="mi:hidden! mi:@[960px]:inline!">Proofroom</MiText>
        </div>
        <MiText as="span" variant="caption2" tone="label3" weight="semibold" class="mi:hidden! mi:@[960px]:inline! mi:@[960px]:uppercase! mi:@[960px]:tracking-[.06em]! mi:@[960px]:py-0 mi:@[960px]:px-2">Spring campaign</MiText>
        <ul class="mi:flex mi:gap-1 mi:flex-1 mi:min-w-0 mi:m-0 mi:p-0 mi:[list-style:none] mi:overflow-x-auto mi:[scrollbar-width:none] mi:@[960px]:flex-col mi:@[960px]:overflow-visible">
          <li v-for="f in files" :key="f.id">
            <button type="button" class="mi:[font:inherit] mi:text-[13px] mi:font-medium mi:hover:bg-fill4 mi:[&[aria-current='page']]:bg-fill3 mi:flex mi:items-center mi:gap-2 mi:w-full mi:pt-1.5 mi:pr-2.5 mi:pb-1.5 mi:pl-1.5 mi:[border:0] mi:rounded-[999px] mi:text-label2 mi:[background:transparent] mi:whitespace-nowrap mi:cursor-pointer mi:[&[aria-current='page']]:text-label mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:@[960px]:rounded-[10px]" :aria-current="f.id === fileId ? 'page' : undefined" @click="openFile(f.id)">
              <span class="mi:w-5.5 mi:h-5.5 mi:flex-[none] mi:rounded-[7px] mi:[background:linear-gradient(135deg,_var(--a),_color-mix(in_srgb,_var(--a)_30%,_var(--mi-card)))]" :style="{ '--a': `var(--mi-${f.hue})` }" aria-hidden="true" />
              <span class="mi:flex-1 mi:text-start">{{ f.name }}</span>
              <MiBadge v-if="openCount(f) > 0" :count="openCount(f)" tone="primary" count-noun="open comments" />
            </button>
          </li>
        </ul>
      </nav>

      <!-- Island 2: the canvas, with numbered pins tied to the comments. -->
      <main class="mi:min-w-0 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-[var(--mi-sh2),_inset_0_0_0_1px_var(--mi-sep)] mi:grid mi:gap-3 mi:p-3.5" aria-labelledby="irl-title">
        <div class="mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-y-1 mi:gap-x-3">
          <MiText id="irl-title" variant="headline" as="h2">{{ file.name }}</MiText>
          <MiText as="span" variant="caption" tone="label2">v{{ file.version }} · by {{ file.author }}</MiText>
        </div>
        <div class="mi:relative mi:aspect-[16_/_10] mi:rounded-lg mi:overflow-hidden mi:[background:linear-gradient(170deg,_color-mix(in_srgb,_var(--a)_28%,_var(--mi-card)),_color-mix(in_srgb,_var(--a)_8%,_var(--mi-page)))]" :style="{ '--a': `var(--mi-${file.hue})` }">
          <span class="mi:absolute mi:right-[14%] mi:top-[14%] mi:w-[22%] mi:aspect-[1] mi:rounded-[50%] mi:[background:radial-gradient(circle_at_35%_35%,_color-mix(in_srgb,_var(--a)_60%,_var(--mi-card)),_var(--a))]" aria-hidden="true" />
          <span class="mi:absolute mi:left-[8%] mi:bottom-[22%] mi:max-w-[70%] mi:text-[clamp(22px,_7cqi,_48px)] mi:font-extrabold mi:tracking-[-.04em] mi:leading-none mi:text-label" aria-hidden="true">{{ file.headline }}</span>
          <button
            v-for="(c, i) in file.comments" :key="c.id" type="button" class="mi:[font:inherit] mi:text-[12px] mi:font-bold mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:absolute mi:grid mi:place-items-center mi:w-6.5 mi:h-6.5 mi:border-2 mi:border-card mi:rounded-[50%_50%_50%_4px] mi:[translate:-50%_-100%] mi:text-p-on mi:[background:var(--mi-p)] mi:shadow-2 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring),_opacity_var(--mi-dur-2)_var(--mi-ease)]" :class="[c.id === focus ? 'mi:transform-[scale(1.18)]' : '', c.resolved ? 'mi:opacity-45' : '']"
            :style="{ left: c.x + '%', top: c.y + '%' }" :aria-label="`Comment ${i + 1} by ${c.who}`" :aria-pressed="c.id === focus" @click="focus = c.id"
          >{{ i + 1 }}</button>
        </div>
      </main>

      <!-- Island 3: comments. Selecting a pin highlights its thread; resolve dims the pin. -->
      <aside class="mi:min-w-0 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-[var(--mi-sh2),_inset_0_0_0_1px_var(--mi-sep)] mi:grid mi:content-start mi:gap-2 mi:p-3.5" aria-labelledby="irl-notes">
        <div class="mi:flex mi:items-baseline mi:justify-between mi:gap-2">
          <MiText id="irl-notes" variant="headline" as="h3">Comments</MiText>
          <MiText as="span" variant="caption" tone="label2" tabular>{{ openCount(file) }} open</MiText>
        </div>
        <ol class="mi:grid mi:gap-1 mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="(c, i) in file.comments" :key="c.id" class="mi:group mi:flex mi:[align-items:flex-start] mi:gap-1 mi:p-1 mi:rounded-[12px] mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)]" :data-on="c.id === focus || undefined" :class="[c.id === focus ? 'mi:[background:var(--mi-p-tint)]' : '', c.resolved ? 'mi:opacity-60' : '']">
            <button type="button" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:flex mi:[align-items:flex-start] mi:gap-2.5 mi:flex-1 mi:min-w-0 mi:p-1.5 mi:[border:0] mi:rounded-[9px] mi:[font:inherit] mi:text-start mi:text-inherit mi:[background:transparent] mi:cursor-pointer" @click="focus = c.id">
              <span class="mi:grid mi:place-items-center mi:w-5.5 mi:h-5.5 mi:flex-[none] mi:rounded-[50%] mi:text-[11px] mi:font-bold mi:text-p-text mi:[background:var(--mi-p-tint)] mi:group-data-[on]:text-p-on mi:group-data-[on]:[background:var(--mi-p)]" aria-hidden="true">{{ i + 1 }}</span>
              <span class="mi:grid mi:gap-0.5 mi:min-w-0">
                <MiText as="span" variant="footnote" weight="semibold">{{ c.who }}</MiText>
                <MiText as="span" variant="footnote" tone="label2">{{ c.text }}</MiText>
              </span>
            </button>
            <MiButton variant="plain" size="mini" :aria-pressed="c.resolved" @click="c.resolved = !c.resolved">{{ c.resolved ? 'Reopen' : 'Resolve' }}</MiButton>
          </li>
        </ol>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Hue = 'orange' | 'teal' | 'pink'
interface Comment { id: string, who: string, text: string, x: number, y: number, resolved: boolean }
interface ReviewFile { id: string, name: string, hue: Hue, version: number, author: string, headline: string, comments: Comment[] }

const files = reactive<ReviewFile[]>([
  {
    id: 'hero', name: 'Homepage hero', hue: 'orange', version: 4, author: 'Camille Roux', headline: 'Bloom season',
    comments: [
      { id: 'c1', who: 'Dev Malhotra', text: 'Headline wraps on 360px. Try the condensed cut.', x: 30, y: 58, resolved: false },
      { id: 'c2', who: 'Sofia Lind', text: 'Sun feels too saturated next to the logo.', x: 74, y: 26, resolved: false },
      { id: 'c3', who: 'Camille Roux', text: 'Swapped the CTA to the brand colour.', x: 52, y: 82, resolved: true }
    ]
  },
  {
    id: 'email', name: 'Launch email', hue: 'teal', version: 2, author: 'Noah Becker', headline: 'New in store',
    comments: [{ id: 'c4', who: 'Sofia Lind', text: 'Preheader text is missing.', x: 22, y: 20, resolved: false }]
  },
  { id: 'social', name: 'Social square', hue: 'pink', version: 7, author: 'Camille Roux', headline: '20% off', comments: [] }
])

const fileId = ref('hero')
const focus = ref('c1')

const file = computed(() => files.find(f => f.id === fileId.value) ?? files[0]!)

function openCount(f: ReviewFile) { return f.comments.filter(c => !c.resolved).length }
function openFile(id: string) {
  fileId.value = id
  focus.value = file.value.comments[0]?.id ?? ''
}
</script>

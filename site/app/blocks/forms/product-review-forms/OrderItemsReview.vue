<template>
  <section class="mi:@container/oir mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="oir-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="oir-title" as="h2" variant="title3" weight="semibold">How was your order?</MiText>
        <MiText variant="footnote" tone="label2">Order #HB-58214 · delivered Thursday, Oct 30 · 20 points per review</MiText>
      </div>
      <MiBadge :tone="rated.length ? 'primary' : 'neutral'" :label="`${rated.length} of ${items.length} rated`" />
    </header>

    <ul class="mi:m-0 mi:p-0 mi:[list-style:none] mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
      <li v-for="it in items" :key="it.sku" class="mi:grid mi:gap-3 mi:py-4 mi:px-4.5 mi:not-first:border-t mi:not-first:border-t-sep">
        <div class="mi:grid mi:grid-cols-[52px_minmax(0,_1fr)] mi:gap-y-2.5 mi:gap-x-3.5 mi:items-center mi:@[560px]/oir:grid-cols-[52px_minmax(0,_1fr)_auto]">
          <span :class="it.skipped ? 'mi:opacity-45' : ''" class="mi:w-13 mi:aspect-[1] mi:rounded-md mi:[background:radial-gradient(circle_at_35%_30%,_color-mix(in_srgb,_var(--oir-tint)_35%,_var(--mi-card)),_color-mix(in_srgb,_var(--oir-tint)_75%,_var(--mi-label)))]" :style="{ '--oir-tint': it.tint }" aria-hidden="true" />
          <div class="mi:grid mi:gap-0.5 mi:min-w-0" :class="it.skipped ? 'mi:opacity-45' : ''">
            <MiText as="h3" variant="subheadline" weight="semibold">{{ it.name }}</MiText>
            <MiText variant="caption" tone="label2">{{ it.variant }}</MiText>
          </div>
          <div class="mi:col-span-full mi:flex mi:flex-wrap mi:items-center mi:gap-2.5 mi:@[560px]/oir:col-[auto] mi:@[560px]/oir:[justify-content:flex-end]">
            <MiRating v-model="it.stars" :label="`Rate ${it.name}`" :disabled="it.skipped || sent" />
            <MiButton v-if="!it.stars && !sent" variant="plain" size="mini" @click="it.skipped = !it.skipped">
              {{ it.skipped ? 'Undo skip' : 'Skip' }}
            </MiButton>
          </div>
        </div>

        <!-- Rating an item opens prompts tuned to the score; the text stays optional. -->
        <div v-if="it.stars && !sent" class="mi:[--mi-in-y:-4px] mi:animate-[in_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:animate-none mi:@[560px]/oir:ps-16.5 mi:grid mi:gap-2.5">
          <div class="mi:flex mi:flex-wrap mi:gap-1.5" role="group" :aria-label="`What stood out about ${it.name}`">
            <MiChip
              v-for="c in promptsFor(it.stars)" :key="c" :label="c" size="small" selectable
              :model-value="it.tags.includes(c)" @update:model-value="toggle(it, c)"
            />
          </div>
          <MiTextarea v-model="it.note" :rows="2" :max-rows="5" :maxlength="500" :aria-label="`Review of ${it.name}`" :placeholder="placeholderFor(it.stars)" />
        </div>
      </li>
    </ul>

    <footer class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3">
      <p class="mi:flex-[1_1_220px] mi:m-0 mi:text-[13px] mi:text-label2" role="status" aria-live="polite">{{ status }}</p>
      <MiButton :disabled="!rated.length || sent" @click="sent = true">
        {{ sent ? 'Reviews posted' : rated.length > 1 ? `Post ${rated.length} reviews` : 'Post review' }}
      </MiButton>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface Item { sku: string, name: string, variant: string, tint: string, stars: number, tags: string[], note: string, skipped: boolean }

const items = reactive<Item[]>([
  { sku: 'mug', name: 'Stoneware mug, set of 2', variant: 'Fog glaze · 350 ml', tint: 'var(--mi-s)', stars: 5, tags: ['Great quality'], note: 'Holds heat far longer than my old ones.', skipped: false },
  { sku: 'throw', name: 'Waffle cotton throw', variant: 'Oat · 130 × 170 cm', tint: 'var(--mi-orange)', stars: 0, tags: [], note: '', skipped: false },
  { sku: 'lamp', name: 'Arc reading lamp', variant: 'Matte black · E27', tint: 'var(--mi-p)', stars: 0, tags: [], note: '', skipped: false }
])
const sent = ref(false)

const prompts = {
  low: ['Arrived damaged', 'Not as pictured', 'Poor quality', 'Hard to assemble'],
  mid: ['Does the job', 'Color slightly off', 'Smaller than expected', 'Good value'],
  high: ['Great quality', 'Looks like the photos', 'Well packaged', 'Would buy again']
}
const promptsFor = (stars: number) => stars <= 2 ? prompts.low : stars === 3 ? prompts.mid : prompts.high
const placeholderFor = (stars: number) => stars <= 2 ? 'What went wrong? We read every one of these.' : 'Anything other shoppers should know? (optional)'

const rated = computed(() => items.filter(i => i.stars > 0))
const status = computed(() => {
  if (sent.value) return `Thanks! ${rated.value.length * 20} points added to your account.`
  const left = items.filter(i => !i.stars && !i.skipped).length
  return left ? `${left} item${left > 1 ? 's' : ''} left to rate, or skip them.` : 'All set. Post when you are ready.'
})

function toggle(it: Item, tag: string) {
  it.tags = it.tags.includes(tag) ? it.tags.filter(t => t !== tag) : [...it.tags, tag]
}
</script>

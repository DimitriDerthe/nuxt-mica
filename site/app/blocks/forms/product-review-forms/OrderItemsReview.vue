<template>
  <section class="oir" aria-labelledby="oir-title">
    <header class="oir__head">
      <div>
        <MiText id="oir-title" as="h2" variant="title3" weight="semibold">How was your order?</MiText>
        <MiText variant="footnote" tone="label2">Order #HB-58214 · delivered Thursday, Oct 30 · 20 points per review</MiText>
      </div>
      <MiBadge :tone="rated.length ? 'primary' : 'neutral'" :label="`${rated.length} of ${items.length} rated`" />
    </header>

    <ul class="oir__list">
      <li v-for="it in items" :key="it.sku" class="oir__item" :class="{ 'is-skipped': it.skipped }">
        <div class="oir__row">
          <span class="oir__thumb" :style="{ '--oir-tint': it.tint }" aria-hidden="true" />
          <div class="oir__info">
            <MiText as="h3" variant="subheadline" weight="semibold">{{ it.name }}</MiText>
            <MiText variant="caption" tone="label2">{{ it.variant }}</MiText>
          </div>
          <div class="oir__rate">
            <MiRating v-model="it.stars" :label="`Rate ${it.name}`" :disabled="it.skipped || sent" />
            <MiButton v-if="!it.stars && !sent" variant="plain" size="mini" @click="it.skipped = !it.skipped">
              {{ it.skipped ? 'Undo skip' : 'Skip' }}
            </MiButton>
          </div>
        </div>

        <!-- Rating an item opens prompts tuned to the score; the text stays optional. -->
        <div v-if="it.stars && !sent" class="oir__more">
          <div class="oir__chips" role="group" :aria-label="`What stood out about ${it.name}`">
            <MiChip
              v-for="c in promptsFor(it.stars)" :key="c" :label="c" size="small" selectable
              :model-value="it.tags.includes(c)" @update:model-value="toggle(it, c)"
            />
          </div>
          <MiTextarea v-model="it.note" :rows="2" :max-rows="5" :maxlength="500" :aria-label="`Review of ${it.name}`" :placeholder="placeholderFor(it.stars)" />
        </div>
      </li>
    </ul>

    <footer class="oir__foot">
      <p class="oir__status" role="status" aria-live="polite">{{ status }}</p>
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

<style scoped>
.oir { container: oir / inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.oir__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }

.oir__list { margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.oir__item { display: grid; gap: 12px; padding: 16px 18px; }
.oir__item + .oir__item { border-top: 1px solid var(--mi-sep); }
.oir__item.is-skipped .oir__row > :not(.oir__rate) { opacity: .45; }

.oir__row { display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: 10px 14px; align-items: center; }
.oir__thumb { width: 52px; aspect-ratio: 1; border-radius: var(--mi-radius-m); background: radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--oir-tint) 35%, var(--mi-card)), color-mix(in srgb, var(--oir-tint) 75%, var(--mi-label))); }
.oir__info { display: grid; gap: 2px; min-width: 0; }
.oir__rate { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
@container oir (min-width: 560px) {
  .oir__row { grid-template-columns: 52px minmax(0, 1fr) auto; }
  .oir__rate { grid-column: auto; justify-content: flex-end; }
  .oir__more { padding-inline-start: 66px; }
}

.oir__more { display: grid; gap: 10px; animation: oir-in var(--mi-dur-3) var(--mi-ease); }
.oir__chips { display: flex; flex-wrap: wrap; gap: 6px; }

.oir__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
.oir__status { flex: 1 1 220px; margin: 0; font-size: 13px; color: var(--mi-label2); }
@keyframes oir-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .oir__more { animation: none; } }
</style>

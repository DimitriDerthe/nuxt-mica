<template>
  <section class="rfl mi:@container mi:grid mi:content-start mi:gap-5 mi:font-mi mi:text-label" aria-labelledby="rfl-title">
    <header class="rfl__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="rfl-title" variant="title3" as="h2" weight="semibold">Reviews</MiText>
        <MiText variant="footnote" tone="label2">Kestrel Trail 3 · men’s and women’s</MiText>
      </div>
      <MiButton variant="tinted">Write a review</MiButton>
    </header>

    <div class="rfl__layout mi:grid mi:gap-6 mi:@[820px]:grid-cols-[290px_minmax(0,_1fr)] mi:@[820px]:gap-8 mi:@[820px]:items-start">
      <aside class="rfl__summary mi:grid mi:gap-5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-label="Rating summary">
        <div class="rfl__score mi:flex mi:items-center mi:gap-3.5">
          <p class="rfl__big mi:m-0 mi:text-[56px] mi:leading-none mi:font-bold mi:tracking-[-.045em] mi:tabular-nums">4.5</p>
          <div>
            <MiRating :model-value="4.5" half readonly size="sm" label="Average rating, 4.5 out of 5" />
            <MiText variant="caption" tone="label2">{{ total.toLocaleString('en-US') }} reviews</MiText>
          </div>
        </div>

        <!-- Each bar is also a filter: pick a star level to read only those reviews. -->
        <div class="rfl__dist mi:grid mi:gap-0.5" role="group" aria-label="Filter by rating">
          <button
            v-for="d in distribution" :key="d.stars" type="button" class="rfl__bar-row mi:grid mi:grid-cols-[30px_minmax(0,_1fr)_36px] mi:items-center mi:gap-2.5 mi:py-[5px] mi:px-1.5 mi:my-0 mi:-mx-1.5 mi:[border:0] mi:rounded-sm mi:[background:transparent] mi:text-label2 mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:aria-pressed:text-p-text"
            :aria-pressed="stars === d.stars" :aria-label="`${d.stars} stars, ${d.count} reviews`"
            @click="stars = stars === d.stars ? null : d.stars"
          >
            <span class="rfl__bar-label mi:inline-flex mi:items-center mi:gap-[3px] mi:font-semibold mi:text-label">{{ d.stars }}<MiIcon name="star" :size="12" filled /></span>
            <span class="rfl__bar mi:h-2 mi:rounded-[4px] mi:[background:var(--mi-fill3)] mi:overflow-hidden"><span class="mi:[.rfl__bar_&]:block mi:[.rfl__bar_&]:h-full mi:[.rfl__bar_&]:rounded-[inherit] mi:[.rfl__bar_&]:[background:var(--mi-orange)] mi:[.rfl__bar_&]:origin-left mi:[.rfl__bar_&]:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${d.count / maxCount})` }" /></span>
            <span class="rfl__bar-n mi:text-end mi:tabular-nums">{{ d.count }}</span>
          </button>
        </div>

        <!-- Fit meter: where 1,040 sizing answers land between small and large. -->
        <div class="rfl__fit mi:grid mi:gap-2 mi:pt-4 mi:border-t mi:border-t-sep mi:overflow-clip">
          <div class="rfl__fit-top mi:flex mi:justify-between mi:items-baseline">
            <MiText variant="footnote" weight="semibold">Fit</MiText>
            <MiText variant="caption" tone="label2">1,040 answers</MiText>
          </div>
          <div class="rfl__fit-track mi:relative mi:h-2.5 mi:rounded-[5px] mi:[background:linear-gradient(90deg,_color-mix(in_srgb,_var(--mi-p)_30%,_var(--mi-fill3)),_var(--mi-fill3)_50%,_color-mix(in_srgb,_var(--mi-s)_30%,_var(--mi-fill3)))]" role="meter" aria-label="Fit, from runs small to runs large" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="fit" aria-valuetext="Runs slightly small">
            <span class="rfl__fit-mid mi:absolute mi:left-1/2 mi:top-[-3px] mi:bottom-[-3px] mi:w-0.5 mi:-ml-px mi:[background:var(--mi-label3)] mi:rounded-[1px]" />
            <span class="rfl__fit-pos mi:absolute mi:inset-0 mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `translateX(${fit}%)` }"><i class="mi:[.rfl__fit-pos_&]:absolute mi:[.rfl__fit-pos_&]:-left-2 mi:[.rfl__fit-pos_&]:-top-1 mi:[.rfl__fit-pos_&]:w-4.5 mi:[.rfl__fit-pos_&]:h-4.5 mi:[.rfl__fit-pos_&]:border-3 mi:[.rfl__fit-pos_&]:border-p mi:[.rfl__fit-pos_&]:box-border mi:[.rfl__fit-pos_&]:shadow-1" /></span>
          </div>
          <div class="rfl__fit-scale mi:flex mi:justify-between mi:gap-1.5 mi:text-[11px] mi:text-label3"><span>Runs small</span><span>True to size</span><span>Runs large</span></div>
          <MiText variant="caption" tone="label2">Most runners order half a size up.</MiText>
        </div>

        <div class="rfl__rec mi:flex mi:items-baseline mi:gap-2 mi:pt-4 mi:border-t mi:border-t-sep">
          <span class="rfl__rec-n mi:text-[24px] mi:font-bold mi:tracking-[-.03em] mi:text-green-t">92%</span>
          <MiText variant="caption" tone="label2">would recommend them to a friend</MiText>
        </div>
      </aside>

      <div class="rfl__main mi:grid mi:gap-3.5 mi:min-w-0">
        <div class="rfl__filters mi:grid mi:gap-3 mi:@[1040px]:grid-cols-[minmax(0,_1fr)_auto] mi:@[1040px]:items-center">
          <div class="rfl__tags mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Filter by topic">
            <MiChip
              v-for="t in tags" :key="t" :label="t" size="small" tone="neutral" selectable
              :model-value="picked.includes(t)" @update:model-value="toggle(t)"
            />
          </div>
          <MiSegmented v-model="sort" label="Sort reviews" :options="sorts" />
        </div>

        <p class="rfl__status mi:flex mi:flex-wrap mi:items-center mi:gap-y-1 mi:gap-x-2.5 mi:m-0 mi:text-[13px] mi:text-label2" role="status" aria-live="polite">
          Showing {{ shown.length }} of {{ stars || picked.length ? matching : total.toLocaleString('en-US') }}
          <template v-if="stars"> · {{ stars }}-star</template>
          <button v-if="stars || picked.length" type="button" class="rfl__clear mi:p-0 mi:[border:0] mi:[background:none] mi:text-p-text mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[3px]" @click="clear">Clear filters</button>
        </p>

        <ul class="rfl__list mi:[list-style:none] mi:m-0 mi:p-0 mi:grid">
          <li v-for="r in shown" :key="r.id" class="rfl__review mi:grid mi:gap-2 mi:py-4.5 mi:px-0 mi:[.rfl__review+&]:border-t mi:[.rfl__review+&]:border-t-sep mi:first:pt-1">
            <div class="rfl__review-top mi:flex mi:items-center mi:justify-between mi:gap-2">
              <MiRating :model-value="r.rating" readonly size="sm" :label="`${r.rating} out of 5`" />
              <MiText variant="caption" tone="label3">{{ r.date }}</MiText>
            </div>
            <MiText variant="headline" as="h3">{{ r.title }}</MiText>
            <MiText variant="footnote" tone="label2" class="rfl__body mi:max-w-[68ch]">{{ r.body }}</MiText>
            <dl class="rfl__facts mi:flex mi:flex-wrap mi:gap-1.5 mi:mt-0.5 mi:mx-0 mi:mb-0">
              <div class="mi:[.rfl__facts_&]:inline-flex mi:[.rfl__facts_&]:gap-[5px] mi:[.rfl__facts_&]:py-[3px] mi:[.rfl__facts_&]:px-[9px] mi:[.rfl__facts_&]:text-[12px]"><dt class="mi:[.rfl__facts_&]:text-label3">Size bought</dt><dd class="mi:[.rfl__facts_&]:m-0 mi:[.rfl__facts_&]:font-medium">{{ r.size }}</dd></div>
              <div class="mi:[.rfl__facts_&]:inline-flex mi:[.rfl__facts_&]:gap-[5px] mi:[.rfl__facts_&]:py-[3px] mi:[.rfl__facts_&]:px-[9px] mi:[.rfl__facts_&]:text-[12px]"><dt class="mi:[.rfl__facts_&]:text-label3">Fit</dt><dd class="mi:[.rfl__facts_&]:m-0 mi:[.rfl__facts_&]:font-medium">{{ r.fit }}</dd></div>
              <div class="mi:[.rfl__facts_&]:inline-flex mi:[.rfl__facts_&]:gap-[5px] mi:[.rfl__facts_&]:py-[3px] mi:[.rfl__facts_&]:px-[9px] mi:[.rfl__facts_&]:text-[12px]"><dt class="mi:[.rfl__facts_&]:text-label3">Distance</dt><dd class="mi:[.rfl__facts_&]:m-0 mi:[.rfl__facts_&]:font-medium">{{ r.km }} km</dd></div>
            </dl>
            <div class="rfl__review-foot mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5 mi:mt-1">
              <div class="rfl__who mi:flex mi:flex-wrap mi:items-center mi:gap-y-1.5 mi:gap-x-2">
                <MiAvatar :name="r.name" size="xs" tone="auto" decorative />
                <MiText variant="caption" weight="medium">{{ r.name }}</MiText>
                <MiText variant="caption" tone="label3">{{ r.place }}</MiText>
                <MiBadge v-if="r.verified" label="Verified buyer" tone="success" variant="tint" />
              </div>
              <button type="button" class="rfl__helpful mi:inline-flex mi:items-center mi:gap-1.5 mi:min-h-7.5 mi:py-0 mi:px-3 mi:border mi:border-sep mi:rounded-[999px] mi:[background:transparent] mi:text-label2 mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:aria-pressed:border-transparent mi:aria-pressed:[background:var(--mi-p-tint)]" :aria-pressed="voted.includes(r.id)" @click="vote(r.id)">
                <MiIcon :svg="thumb" :size="15" />
                Helpful · {{ r.helpful + (voted.includes(r.id) ? 1 : 0) }}
              </button>
            </div>
          </li>
        </ul>
        <MiEmptyState v-if="!shown.length" icon="comment" title="No reviews match" description="Try another star level or fewer topics." secondary-label="Clear filters" @secondary="clear" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Review { id: number, rating: number, title: string, body: string, name: string, place: string, date: string, days: number, size: string, fit: string, km: number, helpful: number, verified: boolean, tags: string[] }

// Sample reviews; swap for your reviews API.
const distribution = [{ stars: 5, count: 912 }, { stars: 4, count: 238 }, { stars: 3, count: 76 }, { stars: 2, count: 34 }, { stars: 1, count: 24 }]
const total = distribution.reduce((s, d) => s + d.count, 0)
const maxCount = Math.max(...distribution.map(d => d.count))
const fit = 36
const tags = ['Grip in wet', 'Cushioning', 'Durability', 'Wide feet', 'Sizing']

const reviews: Review[] = [
  { id: 1, rating: 5, title: 'Finally, grip on wet limestone', body: 'Ran the Calanques loop after a night of rain and never slipped once. The lugs shed mud quickly and the toe cap took a few rock kicks without a mark.', name: 'Camille Roux', place: 'Marseille', date: '3 days ago', days: 3, size: 'EU 42.5', fit: 'Half size small', km: 180, helpful: 48, verified: true, tags: ['Grip in wet', 'Durability', 'Sizing'] },
  { id: 2, rating: 4, title: 'Plush for long days, a bit warm', body: 'Cushioning stays lively past 30 km, which is why I bought them. The upper runs warm in August; fine the rest of the year.', name: 'Tomás Herrera', place: 'Granada', date: '2 weeks ago', days: 14, size: 'EU 44', fit: 'True to size', km: 420, helpful: 31, verified: true, tags: ['Cushioning'] },
  { id: 3, rating: 5, title: 'Wide toe box that actually is wide', body: 'I have wide feet and usually size up a full number. Here half a size was enough and nothing rubs on descents.', name: 'Aiko Tanaka', place: 'Grenoble', date: '1 month ago', days: 30, size: 'EU 39', fit: 'Half size small', km: 95, helpful: 27, verified: false, tags: ['Wide feet', 'Sizing'] },
  { id: 4, rating: 2, title: 'Outsole wore fast on asphalt', body: 'Great on trails, but my commute is half road and the heel lugs were flat after 250 km. Buy them for dirt only.', name: 'Jonas Berg', place: 'Oslo', date: '5 days ago', days: 5, size: 'EU 45', fit: 'True to size', km: 250, helpful: 22, verified: true, tags: ['Durability'] },
  { id: 5, rating: 4, title: 'Stable, if a little firm at first', body: 'Felt stiff for the first 40 km, then softened up nicely. Lacing holds the heel well on steep switchbacks.', name: 'Priya Natarajan', place: 'Bristol', date: '3 weeks ago', days: 21, size: 'UK 6', fit: 'True to size', km: 160, helpful: 9, verified: true, tags: ['Cushioning'] },
  { id: 6, rating: 3, title: 'Order up, the toe is short', body: 'Comfortable, but my usual size bruised a toenail on a long descent. Exchanged for half a size up and they are fine now.', name: 'Lukas Meier', place: 'Zurich', date: '2 months ago', days: 60, size: 'EU 43', fit: 'Half size small', km: 70, helpful: 15, verified: true, tags: ['Sizing'] }
]

const sorts = [{ value: 'helpful', label: 'Helpful' }, { value: 'new', label: 'Newest' }, { value: 'low', label: 'Lowest' }]
const sort = ref<string | number | null>('helpful')
const stars = ref<number | null>(null)
const picked = ref<string[]>([])
const voted = ref<number[]>([])

const filtered = computed(() => reviews.filter(r =>
  (!stars.value || r.rating === stars.value) && picked.value.every(t => r.tags.includes(t))))
// Of the full catalogue only the sample is loaded here; the count is what the filter matched in it.
const matching = computed(() => filtered.value.length)
const shown = computed(() => [...filtered.value].sort((a, b) =>
  sort.value === 'new' ? a.days - b.days : sort.value === 'low' ? a.rating - b.rating : b.helpful - a.helpful))

const thumb = '<path d="M7 11v9H4v-9zM7 11l4-7c1.3 0 2.2 1 2 2.3L12.5 10H18a2 2 0 0 1 2 2.3l-1.1 6A2 2 0 0 1 17 20H7"/>'

function toggle(t: string) {
  picked.value = picked.value.includes(t) ? picked.value.filter(x => x !== t) : [...picked.value, t]
}
function vote(id: number) {
  voted.value = voted.value.includes(id) ? voted.value.filter(x => x !== id) : [...voted.value, id]
}
function clear() {
  stars.value = null
  picked.value = []
}
</script>

<style scoped>
.rfl__bar-row { font: inherit; font-size: 13px;
}
.rfl__bar-row:hover { background: var(--mi-fill4); }
.rfl__bar-row[aria-pressed="true"] { background: var(--mi-p-tint); }
.rfl__bar-label :deep(svg) { color: var(--mi-orange); }
.rfl__fit-pos i { border-radius: 50%; background: var(--mi-card); }
.rfl__clear { font: inherit; font-weight: 500; }
.rfl__body { line-height: 1.55; }
.rfl__facts div { border-radius: 999px; background: var(--mi-fill4); }
.rfl__helpful { font: inherit; font-size: 12px; font-weight: 500; font-variant-numeric: tabular-nums;
}
.rfl__helpful:hover { color: var(--mi-label); }
.rfl__helpful[aria-pressed="true"] { color: var(--mi-p-text); }
.rfl__helpful[aria-pressed="true"] :deep(svg) { transform: rotate(-12deg) scale(1.1); }
.rfl__helpful :deep(svg) { transition: transform var(--mi-dur-2) var(--mi-spring); }
</style>

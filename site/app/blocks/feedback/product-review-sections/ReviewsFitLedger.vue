<template>
  <section class="rfl" aria-labelledby="rfl-title">
    <header class="rfl__head">
      <div>
        <MiText id="rfl-title" variant="title3" as="h2" weight="semibold">Reviews</MiText>
        <MiText variant="footnote" tone="label2">Kestrel Trail 3 · men’s and women’s</MiText>
      </div>
      <MiButton variant="tinted">Write a review</MiButton>
    </header>

    <div class="rfl__layout">
      <aside class="rfl__summary" aria-label="Rating summary">
        <div class="rfl__score">
          <p class="rfl__big">4.5</p>
          <div>
            <MiRating :model-value="4.5" half readonly size="sm" label="Average rating, 4.5 out of 5" />
            <MiText variant="caption" tone="label2">{{ total.toLocaleString('en-US') }} reviews</MiText>
          </div>
        </div>

        <!-- Each bar is also a filter: pick a star level to read only those reviews. -->
        <div class="rfl__dist" role="group" aria-label="Filter by rating">
          <button
            v-for="d in distribution" :key="d.stars" type="button" class="rfl__bar-row"
            :aria-pressed="stars === d.stars" :aria-label="`${d.stars} stars, ${d.count} reviews`"
            @click="stars = stars === d.stars ? null : d.stars"
          >
            <span class="rfl__bar-label">{{ d.stars }}<MiIcon name="star" :size="12" filled /></span>
            <span class="rfl__bar"><span :style="{ transform: `scaleX(${d.count / maxCount})` }" /></span>
            <span class="rfl__bar-n">{{ d.count }}</span>
          </button>
        </div>

        <!-- Fit meter: where 1,040 sizing answers land between small and large. -->
        <div class="rfl__fit">
          <div class="rfl__fit-top">
            <MiText variant="footnote" weight="semibold">Fit</MiText>
            <MiText variant="caption" tone="label2">1,040 answers</MiText>
          </div>
          <div class="rfl__fit-track" role="meter" aria-label="Fit, from runs small to runs large" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="fit" aria-valuetext="Runs slightly small">
            <span class="rfl__fit-mid" />
            <span class="rfl__fit-pos" :style="{ transform: `translateX(${fit}%)` }"><i /></span>
          </div>
          <div class="rfl__fit-scale"><span>Runs small</span><span>True to size</span><span>Runs large</span></div>
          <MiText variant="caption" tone="label2">Most runners order half a size up.</MiText>
        </div>

        <div class="rfl__rec">
          <span class="rfl__rec-n">92%</span>
          <MiText variant="caption" tone="label2">would recommend them to a friend</MiText>
        </div>
      </aside>

      <div class="rfl__main">
        <div class="rfl__filters">
          <div class="rfl__tags" role="group" aria-label="Filter by topic">
            <MiChip
              v-for="t in tags" :key="t" :label="t" size="small" tone="neutral" selectable
              :model-value="picked.includes(t)" @update:model-value="toggle(t)"
            />
          </div>
          <MiSegmented v-model="sort" label="Sort reviews" :options="sorts" />
        </div>

        <p class="rfl__status" role="status" aria-live="polite">
          Showing {{ shown.length }} of {{ stars || picked.length ? matching : total.toLocaleString('en-US') }}
          <template v-if="stars"> · {{ stars }}-star</template>
          <button v-if="stars || picked.length" type="button" class="rfl__clear" @click="clear">Clear filters</button>
        </p>

        <ul class="rfl__list">
          <li v-for="r in shown" :key="r.id" class="rfl__review">
            <div class="rfl__review-top">
              <MiRating :model-value="r.rating" readonly size="sm" :label="`${r.rating} out of 5`" />
              <MiText variant="caption" tone="label3">{{ r.date }}</MiText>
            </div>
            <MiText variant="headline" as="h3">{{ r.title }}</MiText>
            <MiText variant="footnote" tone="label2" class="rfl__body">{{ r.body }}</MiText>
            <dl class="rfl__facts">
              <div><dt>Size bought</dt><dd>{{ r.size }}</dd></div>
              <div><dt>Fit</dt><dd>{{ r.fit }}</dd></div>
              <div><dt>Distance</dt><dd>{{ r.km }} km</dd></div>
            </dl>
            <div class="rfl__review-foot">
              <div class="rfl__who">
                <MiAvatar :name="r.name" size="xs" tone="auto" decorative />
                <MiText variant="caption" weight="medium">{{ r.name }}</MiText>
                <MiText variant="caption" tone="label3">{{ r.place }}</MiText>
                <MiBadge v-if="r.verified" label="Verified buyer" tone="success" variant="tint" />
              </div>
              <button type="button" class="rfl__helpful" :aria-pressed="voted.includes(r.id)" @click="vote(r.id)">
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
.rfl { container-type: inline-size; display: grid; gap: 20px; font-family: var(--mi-font); color: var(--mi-label); }
.rfl__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.rfl__layout { display: grid; gap: 24px; }
@container (min-width: 820px) { .rfl__layout { grid-template-columns: 290px minmax(0, 1fr); gap: 32px; align-items: start; } }

.rfl__summary { display: grid; gap: 20px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.rfl__score { display: flex; align-items: center; gap: 14px; }
.rfl__big { margin: 0; font-size: 56px; line-height: 1; font-weight: 700; letter-spacing: -.045em; font-variant-numeric: tabular-nums; }

.rfl__dist { display: grid; gap: 2px; }
.rfl__bar-row {
  display: grid; grid-template-columns: 30px minmax(0, 1fr) 36px; align-items: center; gap: 10px; padding: 5px 6px; margin: 0 -6px;
  border: 0; border-radius: var(--mi-radius-s); background: transparent; color: var(--mi-label2); font: inherit; font-size: 13px; cursor: pointer;
}
.rfl__bar-row:hover { background: var(--mi-fill4); }
.rfl__bar-row:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.rfl__bar-row[aria-pressed="true"] { background: var(--mi-p-tint); color: var(--mi-p-text); }
.rfl__bar-label { display: inline-flex; align-items: center; gap: 3px; font-weight: 600; color: var(--mi-label); }
.rfl__bar-label :deep(svg) { color: var(--mi-orange); }
.rfl__bar { height: 8px; border-radius: 4px; background: var(--mi-fill3); overflow: hidden; }
.rfl__bar span { display: block; height: 100%; border-radius: inherit; background: var(--mi-orange); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.rfl__bar-n { text-align: end; font-variant-numeric: tabular-nums; }

.rfl__fit { display: grid; gap: 8px; padding-top: 16px; border-top: 1px solid var(--mi-sep); overflow: clip; }
.rfl__fit-top { display: flex; justify-content: space-between; align-items: baseline; }
.rfl__fit-track { position: relative; height: 10px; border-radius: 5px; background: linear-gradient(90deg, color-mix(in srgb, var(--mi-p) 30%, var(--mi-fill3)), var(--mi-fill3) 50%, color-mix(in srgb, var(--mi-s) 30%, var(--mi-fill3))); }
.rfl__fit-mid { position: absolute; left: 50%; top: -3px; bottom: -3px; width: 2px; margin-left: -1px; background: var(--mi-label3); border-radius: 1px; }
/* A full-width layer translated by a percentage of itself puts the marker at that point of the track. */
.rfl__fit-pos { position: absolute; inset: 0; transition: transform var(--mi-dur-4) var(--mi-spring); }
.rfl__fit-pos i { position: absolute; left: -8px; top: -4px; width: 18px; height: 18px; border-radius: 50%; background: var(--mi-card); border: 3px solid var(--mi-p); box-sizing: border-box; box-shadow: var(--mi-sh1); }
.rfl__fit-scale { display: flex; justify-content: space-between; gap: 6px; font-size: 11px; color: var(--mi-label3); }
.rfl__rec { display: flex; align-items: baseline; gap: 8px; padding-top: 16px; border-top: 1px solid var(--mi-sep); }
.rfl__rec-n { font-size: 24px; font-weight: 700; letter-spacing: -.03em; color: var(--mi-green-t); }

.rfl__main { display: grid; gap: 14px; min-width: 0; }
.rfl__filters { display: grid; gap: 12px; }
@container (min-width: 1040px) { .rfl__filters { grid-template-columns: minmax(0, 1fr) auto; align-items: center; } }
.rfl__tags { display: flex; flex-wrap: wrap; gap: 6px; }
.rfl__status { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; margin: 0; font-size: 13px; color: var(--mi-label2); }
.rfl__clear { padding: 0; border: 0; background: none; color: var(--mi-p-text); font: inherit; font-weight: 500; cursor: pointer; }
.rfl__clear:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; border-radius: 3px; }

.rfl__list { list-style: none; margin: 0; padding: 0; display: grid; }
.rfl__review { display: grid; gap: 8px; padding: 18px 0; }
.rfl__review + .rfl__review { border-top: 1px solid var(--mi-sep); }
.rfl__review:first-child { padding-top: 4px; }
.rfl__review-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.rfl__body { max-width: 68ch; line-height: 1.55; }
.rfl__facts { display: flex; flex-wrap: wrap; gap: 6px; margin: 2px 0 0; }
.rfl__facts div { display: inline-flex; gap: 5px; padding: 3px 9px; border-radius: 999px; background: var(--mi-fill4); font-size: 12px; }
.rfl__facts dt { color: var(--mi-label3); }
.rfl__facts dd { margin: 0; font-weight: 500; }
.rfl__review-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-top: 4px; }
.rfl__who { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; }
.rfl__helpful {
  display: inline-flex; align-items: center; gap: 6px; min-height: 30px; padding: 0 12px; border: 1px solid var(--mi-sep); border-radius: 999px;
  background: transparent; color: var(--mi-label2); font: inherit; font-size: 12px; font-weight: 500; font-variant-numeric: tabular-nums; cursor: pointer;
}
.rfl__helpful:hover { color: var(--mi-label); }
.rfl__helpful:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.rfl__helpful[aria-pressed="true"] { border-color: transparent; background: var(--mi-p-tint); color: var(--mi-p-text); }
.rfl__helpful[aria-pressed="true"] :deep(svg) { transform: rotate(-12deg) scale(1.1); }
.rfl__helpful :deep(svg) { transition: transform var(--mi-dur-2) var(--mi-spring); }
</style>

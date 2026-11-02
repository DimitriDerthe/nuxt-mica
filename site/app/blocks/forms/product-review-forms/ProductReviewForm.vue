<template>
  <section class="prf" aria-labelledby="prf-title">
    <header class="prf__product">
      <!-- Product thumbnail drawn with gradients: a trail shoe silhouette. -->
      <span class="prf__thumb" aria-hidden="true"><i class="prf__sole" /><i class="prf__upper" /><i class="prf__lace" /></span>
      <div>
        <MiText variant="caption" tone="label2">Delivered 12 days ago · size EU 42</MiText>
        <MiText id="prf-title" variant="title3" as="h2" weight="semibold">Review the Ridgeline Trail 3</MiText>
      </div>
    </header>

    <div v-if="posted" class="prf__done" role="status">
      <MiText variant="headline" as="h3">Thanks, your review is live</MiText>
      <MiText variant="footnote" tone="label2">It helps 1,240 people a month choose a size. We sent you a 10% code for your next order.</MiText>
      <MiButton variant="plain" size="small" @click="posted = false">Edit review</MiButton>
    </div>

    <div v-else class="prf__grid">
      <form class="prf__form" novalidate @submit.prevent="post">
        <div class="prf__overall">
          <MiText id="prf-overall" variant="subheadline" weight="semibold">Overall</MiText>
          <MiRating v-model="rating" size="lg" label="Overall rating" />
          <MiText variant="footnote" :tone="rating ? 'label' : 'label3'" weight="medium">{{ rating ? WORDS[rating - 1] : 'Tap a star' }}</MiText>
        </div>
        <MiText v-if="tried && !rating" variant="caption" tone="red" role="alert">Choose a star rating.</MiText>

        <!-- Fit as a bipolar scale: the most useful thing for a shoe review. -->
        <fieldset class="prf__fit">
          <legend>How does it fit?</legend>
          <div class="prf__fit-scale">
            <label v-for="(f, i) in FIT" :key="f" :class="{ 'is-on': fit === i }">
              <input v-model="fit" type="radio" name="prf-fit" :value="i" class="prf__radio">
              <span class="prf__fit-dot" aria-hidden="true" />
              <span class="prf__fit-label">{{ f }}</span>
            </label>
          </div>
        </fieldset>

        <div class="prf__aspects">
          <div v-for="a in aspects" :key="a.id" class="prf__aspect">
            <MiText variant="footnote" weight="medium">{{ a.label }}</MiText>
            <MiRating v-model="a.value" size="sm" :label="a.label + ' rating'" />
          </div>
        </div>

        <MiField label="Headline" :error="tried && headline.trim().length < 4 ? 'Add a short headline.' : ''">
          <MiInput v-model="headline" maxlength="80" placeholder="Grippy on wet rock, half a size small" />
        </MiField>
        <MiField label="Your review" :error="tried && body.trim().length < MIN ? `Write at least ${MIN} characters (${MIN - body.trim().length} to go).` : ''">
          <MiTextarea v-model="body" :rows="4" :max-rows="8" :maxlength="1200" placeholder="Where did you run, how long, and how did they feel after 10 km?" />
        </MiField>
        <div class="prf__len" role="meter" aria-label="Review length" :aria-valuenow="Math.min(body.trim().length, MIN)" aria-valuemin="0" :aria-valuemax="MIN">
          <span :class="{ 'is-ok': body.trim().length >= MIN }" :style="{ transform: `scaleX(${Math.min(1, body.trim().length / MIN)})` }" />
        </div>

        <div class="prf__pair">
          <MiField label="Pros"><MiTagInput v-model="pros" :max="4" placeholder="Add, press Return" /></MiField>
          <MiField label="Cons"><MiTagInput v-model="cons" :max="4" placeholder="Add, press Return" /></MiField>
        </div>
        <MiFileUpload v-model="photos" multiple :max-files="4" accept="image/*" :max-size="10 * 1024 * 1024" label="Add photos from the trail" hint="Up to 4 images, 10 MB each" />

        <div class="prf__foot">
          <div class="prf__rec">
            <MiSwitch v-model="recommend" aria-labelledby="prf-rec" />
            <MiText id="prf-rec" variant="subheadline">I’d recommend this shoe</MiText>
          </div>
          <MiButton type="submit">Post review</MiButton>
        </div>
      </form>

      <!-- Live preview of the review card as other shoppers will see it. -->
      <aside class="prf__preview" aria-label="Preview">
        <MiText variant="caption" weight="semibold" tone="label2" as="h3">Preview</MiText>
        <article class="prf__card">
          <div class="prf__card-top">
            <MiRating :model-value="rating" readonly size="sm" label="Overall rating" />
            <MiBadge v-if="fit !== null" :tone="fit === 2 ? 'success' : 'warning'" :label="FIT[fit ?? 2] ?? ''" />
          </div>
          <MiText variant="headline" as="p">{{ headline || 'Your headline' }}</MiText>
          <MiText variant="footnote" :tone="body ? 'label' : 'label3'" :lines="5">{{ body || 'Your review will appear here.' }}</MiText>
          <ul v-if="pros.length || cons.length" class="prf__pc">
            <li v-for="p in pros" :key="'p' + p" class="is-pro">{{ p }}</li>
            <li v-for="c in cons" :key="'c' + c" class="is-con">{{ c }}</li>
          </ul>
          <div class="prf__by">
            <MiAvatar name="Sven Aalto" size="xs" tone="teal" decorative />
            <span>Sven A. · Verified buyer{{ recommend ? ' · Recommends' : '' }}</span>
          </div>
        </article>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const MIN = 60
const WORDS = ['Poor', 'Below average', 'Decent', 'Great', 'Outstanding']
const FIT = ['Runs small', 'Slightly small', 'True to size', 'Slightly large', 'Runs large']

const rating = ref(4)
const fit = ref<number | null>(1)
const aspects = reactive([
  { id: 'grip', label: 'Grip', value: 5 },
  { id: 'comfort', label: 'Comfort', value: 4 },
  { id: 'durability', label: 'Durability', value: 0 }
])
const headline = ref('Grippy on wet rock, half a size small')
const body = ref('Took them up the Serra da Estrela twice in the rain.')
const pros = ref<string[]>(['Wet grip', 'Light'])
const cons = ref<string[]>(['Narrow toe box'])
const photos = ref<File[]>([])
const recommend = ref(true)
const tried = ref(false)
const posted = ref(false)

function post() {
  tried.value = true
  if (!rating.value || headline.value.trim().length < 4 || body.value.trim().length < MIN) return
  posted.value = true
}
</script>

<style scoped>
.prf { container-type: inline-size; display: grid; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); }
.prf__product { display: flex; align-items: center; gap: 14px; }
.prf__thumb { position: relative; flex: none; width: 64px; height: 64px; border-radius: var(--mi-radius-m); overflow: hidden; background: linear-gradient(160deg, var(--mi-fill4), var(--mi-fill2)); }
.prf__thumb i { position: absolute; display: block; }
.prf__sole { left: 8px; right: 6px; bottom: 16px; height: 7px; border-radius: 2px 6px 6px 3px; background: var(--mi-label); }
.prf__upper { left: 10px; right: 8px; bottom: 22px; height: 18px; border-radius: 14px 18px 2px 2px; background: linear-gradient(90deg, var(--mi-orange), var(--mi-p)); transform: skewX(-12deg); }
.prf__lace { left: 22px; width: 16px; bottom: 34px; height: 3px; border-radius: 2px; background: var(--mi-card); transform: rotate(-14deg); }

.prf__grid { display: grid; gap: 20px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 820px) { .prf__grid { grid-template-columns: minmax(0, 1fr) 300px; align-items: start; } }
.prf__form { display: grid; gap: 16px; min-width: 0; }
.prf__overall { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; }

.prf__fit { margin: 0; padding: 0; border: 0; min-width: 0; }
.prf__fit legend { padding: 0; margin-bottom: 10px; font-size: 15px; font-weight: 600; }
.prf__fit-scale { position: relative; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); }
.prf__fit-scale::before { content: ""; position: absolute; top: 9px; left: 10%; right: 10%; height: 2px; background: var(--mi-fill2); }
.prf__fit-scale label { position: relative; display: grid; justify-items: center; gap: 6px; cursor: pointer; text-align: center; }
.prf__fit-dot { width: 20px; height: 20px; border-radius: 50%; background: var(--mi-card); box-shadow: inset 0 0 0 2px var(--mi-fill); transition: transform var(--mi-dur-2) var(--mi-spring); }
.prf__fit-scale label:hover .prf__fit-dot { transform: scale(1.12); }
.prf__fit-scale .is-on .prf__fit-dot { box-shadow: inset 0 0 0 6px var(--mi-p); transform: scale(1.15); }
.prf__fit-scale label:has(:focus-visible) .prf__fit-dot { outline: 2px solid var(--mi-p); outline-offset: 3px; }
.prf__fit-label { font-size: 11px; line-height: 1.25; color: var(--mi-label2); }
.prf__fit-scale .is-on .prf__fit-label { color: var(--mi-label); font-weight: 600; }
.prf__radio { position: absolute; opacity: 0; pointer-events: none; }

.prf__aspects { display: grid; gap: 8px; grid-template-columns: minmax(0, 1fr); padding: 12px 14px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.prf__aspect { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
@container (min-width: 560px) { .prf__aspects { grid-template-columns: repeat(3, minmax(0, 1fr)); } .prf__aspect { display: grid; justify-content: start; gap: 4px; } }

.prf__len { height: 4px; margin-top: -10px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.prf__len span { display: block; height: 100%; background: var(--mi-orange); transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-spring); }
.prf__len span.is-ok { background: var(--mi-green); }
.prf__pair { display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 560px) { .prf__pair { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
.prf__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding-top: 12px; border-top: 1px solid var(--mi-sep); }
.prf__rec { display: flex; align-items: center; gap: 10px; }

.prf__preview { display: grid; gap: 8px; }
@container (min-width: 820px) { .prf__preview { position: sticky; top: 16px; } }
.prf__card { display: grid; gap: 8px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-elev); box-shadow: var(--mi-sh2); overflow-wrap: anywhere; }
.prf__card-top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.prf__pc { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; font-size: 12px; }
.prf__pc li { padding: 2px 8px; border-radius: 999px; }
.prf__pc .is-pro { background: color-mix(in srgb, var(--mi-green) 14%, transparent); color: var(--mi-green-t); }
.prf__pc .is-con { background: color-mix(in srgb, var(--mi-red) 12%, transparent); color: var(--mi-red-t); }
.prf__pc .is-pro::before { content: "+ "; }
.prf__pc .is-con::before { content: "− "; }
.prf__by { display: flex; align-items: center; gap: 8px; padding-top: 8px; border-top: 1px solid var(--mi-sep); font-size: 12px; color: var(--mi-label2); }
.prf__done { display: grid; gap: 6px; padding: 20px; border-radius: var(--mi-radius-l); background: color-mix(in srgb, var(--mi-green) 10%, transparent); }
</style>

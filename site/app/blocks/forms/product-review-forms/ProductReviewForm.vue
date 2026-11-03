<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4.5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:font-mi mi:text-label" aria-labelledby="prf-title">
    <header class="mi:flex mi:items-center mi:gap-3.5">
      <!-- Product thumbnail drawn with gradients: a trail shoe silhouette. -->
      <span class="mi:relative mi:flex-[none] mi:w-16 mi:h-16 mi:rounded-md mi:overflow-hidden mi:[background:linear-gradient(160deg,_var(--mi-fill4),_var(--mi-fill2))]" aria-hidden="true"><i class="mi:absolute mi:block mi:left-2 mi:right-1.5 mi:bottom-4 mi:h-[7px] mi:rounded-[2px_6px_6px_3px] mi:[background:var(--mi-label)]" /><i class="mi:absolute mi:block mi:left-2.5 mi:right-2 mi:bottom-5.5 mi:h-4.5 mi:rounded-[14px_18px_2px_2px] mi:[background:linear-gradient(90deg,_var(--mi-orange),_var(--mi-p))] mi:transform-[skewX(-12deg)]" /><i class="mi:absolute mi:block mi:left-5.5 mi:w-4 mi:bottom-8.5 mi:h-[3px] mi:rounded-[2px] mi:[background:var(--mi-card)] mi:transform-[rotate(-14deg)]" /></span>
      <div>
        <MiText variant="caption" tone="label2">Delivered 12 days ago · size EU 42</MiText>
        <MiText id="prf-title" variant="title3" as="h2" weight="semibold">Review the Ridgeline Trail 3</MiText>
      </div>
    </header>

    <div v-if="posted" class="mi:grid mi:gap-1.5 mi:p-5 mi:rounded-lg mi:[background:color-mix(in_srgb,_var(--mi-green)_10%,_transparent)]" role="status">
      <MiText variant="headline" as="h3">Thanks, your review is live</MiText>
      <MiText variant="footnote" tone="label2">It helps 1,240 people a month choose a size. We sent you a 10% code for your next order.</MiText>
      <MiButton variant="plain" size="small" @click="posted = false">Edit review</MiButton>
    </div>

    <div v-else class="mi:grid mi:gap-5 mi:grid-cols-[minmax(0,_1fr)] mi:@[820px]:grid-cols-[minmax(0,_1fr)_300px] mi:@[820px]:items-start">
      <form class="mi:grid mi:gap-4 mi:min-w-0" novalidate @submit.prevent="post">
        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-2.5 mi:gap-x-3.5">
          <MiText id="prf-overall" variant="subheadline" weight="semibold">Overall</MiText>
          <MiRating v-model="rating" size="lg" label="Overall rating" />
          <MiText variant="footnote" :tone="rating ? 'label' : 'label3'" weight="medium">{{ rating ? WORDS[rating - 1] : 'Tap a star' }}</MiText>
        </div>
        <MiText v-if="tried && !rating" variant="caption" tone="red" role="alert">Choose a star rating.</MiText>

        <!-- Fit as a bipolar scale: the most useful thing for a shoe review. -->
        <fieldset class="mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
          <legend class="mi:p-0 mi:mb-2.5 mi:text-[15px] mi:font-semibold">How does it fit?</legend>
          <div class="mi:relative mi:grid mi:grid-cols-5 mi:before:content-[''] mi:before:absolute mi:before:top-[9px] mi:before:left-[10%] mi:before:right-[10%] mi:before:h-0.5 mi:before:[background:var(--mi-fill2)]">
            <label class="mi:group mi:relative mi:grid mi:justify-items-center mi:gap-1.5 mi:cursor-pointer mi:text-center" v-for="(f, i) in FIT" :key="f">
              <input v-model="fit" type="radio" name="prf-fit" :value="i" class="mi:peer mi:absolute mi:opacity-0 mi:pointer-events-none">
              <span class="mi:w-5 mi:h-5 mi:rounded-[50%] mi:[background:var(--mi-card)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:group-hover:transform-[scale(1.12)] mi:peer-focus-visible:[outline:2px_solid_var(--mi-p)] mi:peer-focus-visible:outline-offset-[3px]" :class="fit === i ? 'mi:shadow-[inset_0_0_0_6px_var(--mi-p)] mi:transform-[scale(1.15)]' : 'mi:shadow-[inset_0_0_0_2px_var(--mi-fill)]'" aria-hidden="true" />
              <span class="mi:text-[11px] mi:leading-tight" :class="fit === i ? 'mi:text-label mi:font-semibold' : 'mi:text-label2'">{{ f }}</span>
            </label>
          </div>
        </fieldset>

        <div class="mi:grid mi:gap-2 mi:grid-cols-[minmax(0,_1fr)] mi:py-3 mi:px-3.5 mi:rounded-lg mi:[background:var(--mi-fill4)] mi:@[560px]:grid-cols-3">
          <div v-for="a in aspects" :key="a.id" class="mi:flex mi:items-center mi:justify-between mi:gap-2.5 mi:@[560px]:grid mi:@[560px]:justify-start mi:@[560px]:gap-1">
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
        <div class="mi:h-1 mi:-mt-2.5 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" aria-label="Review length" :aria-valuenow="Math.min(body.trim().length, MIN)" aria-valuemin="0" :aria-valuemax="MIN">
          <span class="mi:block mi:h-full mi:origin-left mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :class="body.trim().length >= MIN ? 'mi:[background:var(--mi-green)]' : 'mi:[background:var(--mi-orange)]'" :style="{ transform: `scaleX(${Math.min(1, body.trim().length / MIN)})` }" />
        </div>

        <div class="mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[560px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)]">
          <MiField label="Pros"><MiTagInput v-model="pros" :max="4" placeholder="Add, press Return" /></MiField>
          <MiField label="Cons"><MiTagInput v-model="cons" :max="4" placeholder="Add, press Return" /></MiField>
        </div>
        <MiFileUpload v-model="photos" multiple :max-files="4" accept="image/*" :max-size="10 * 1024 * 1024" label="Add photos from the trail" hint="Up to 4 images, 10 MB each" />

        <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:pt-3 mi:border-t mi:border-t-sep">
          <div class="mi:flex mi:items-center mi:gap-2.5">
            <MiSwitch v-model="recommend" aria-labelledby="prf-rec" />
            <MiText id="prf-rec" variant="subheadline">I’d recommend this shoe</MiText>
          </div>
          <MiButton type="submit">Post review</MiButton>
        </div>
      </form>

      <!-- Live preview of the review card as other shoppers will see it. -->
      <aside class="mi:grid mi:gap-2 mi:@[820px]:sticky mi:@[820px]:top-4" aria-label="Preview">
        <MiText variant="caption" weight="semibold" tone="label2" as="h3">Preview</MiText>
        <article class="mi:grid mi:gap-2 mi:p-4 mi:rounded-lg mi:[background:var(--mi-elev)] mi:shadow-2 mi:wrap-anywhere">
          <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
            <MiRating :model-value="rating" readonly size="sm" label="Overall rating" />
            <MiBadge v-if="fit !== null" :tone="fit === 2 ? 'success' : 'warning'" :label="FIT[fit ?? 2] ?? ''" />
          </div>
          <MiText variant="headline" as="p">{{ headline || 'Your headline' }}</MiText>
          <MiText variant="footnote" :tone="body ? 'label' : 'label3'" :lines="5">{{ body || 'Your review will appear here.' }}</MiText>
          <ul v-if="pros.length || cons.length" class="mi:flex mi:flex-wrap mi:gap-1.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[12px]">
            <li v-for="p in pros" :key="'p' + p" class="mi:py-0.5 mi:px-2 mi:rounded-[999px] mi:[background:color-mix(in_srgb,_var(--mi-green)_14%,_transparent)] mi:text-green-t mi:before:content-['+_']">{{ p }}</li>
            <li v-for="c in cons" :key="'c' + c" class="mi:py-0.5 mi:px-2 mi:rounded-[999px] mi:[background:color-mix(in_srgb,_var(--mi-red)_12%,_transparent)] mi:text-red-t mi:before:content-['−_']">{{ c }}</li>
          </ul>
          <div class="mi:flex mi:items-center mi:gap-2 mi:pt-2 mi:border-t mi:border-t-sep mi:text-[12px] mi:text-label2">
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

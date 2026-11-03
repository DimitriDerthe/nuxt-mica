<template>
  <section class="mi:@container/lpc mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="lpc-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="lpc-title" as="h2" variant="title3" weight="semibold">Listing photos</MiText>
        <MiText variant="footnote" tone="label2">Loft on Rue Oberkampf · guests decide in the first five photos</MiText>
      </div>
      <MiBadge :tone="ready ? 'success' : 'warning'" :label="`${requiredDone} of ${requiredCount} required`" dot />
    </header>

    <div class="mi:h-1.5 mi:rounded-[3px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" aria-label="Required shots uploaded" :aria-valuenow="requiredDone" aria-valuemin="0" :aria-valuemax="requiredCount">
      <span class="mi:block mi:h-full mi:rounded-[inherit] mi:[background:linear-gradient(90deg,_var(--mi-p),_var(--mi-s))] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${requiredDone / requiredCount})` }" />
    </div>

    <ul class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[540px]/lpc:grid-cols-2 mi:@[860px]/lpc:grid-cols-3">
      <li v-for="s in shots" :key="s.id" class="mi:grid mi:grid-rows-[auto_1fr] mi:rounded-lg mi:[background:var(--mi-card)] mi:overflow-hidden" :class="cover === s.id ? 'mi:shadow-[0_0_0_2px_var(--mi-p),_var(--mi-sh1)]' : 'mi:shadow-1'">
        <!-- Drawn frame: a tinted gradient stands in for the photo, the shot guide shows while empty. -->
        <div class="mi:relative mi:grid mi:place-content-center mi:justify-items-center mi:gap-1.5 mi:aspect-[16_/_9] mi:overflow-hidden mi:text-label3" :class="s.file ? 'mi:[background:linear-gradient(160deg,_color-mix(in_srgb,_var(--lpc-tint)_30%,_var(--mi-card)),_color-mix(in_srgb,_var(--lpc-tint)_70%,_var(--mi-label)))] mi:[border-bottom:0]' : 'mi:[background:repeating-linear-gradient(135deg,_var(--mi-fill4)_0_10px,_transparent_10px_20px)] mi:[border-bottom:1px_dashed_var(--mi-sep)]'" :style="{ '--lpc-tint': s.tint }" aria-hidden="true">
          <template v-if="s.file">
            <span class="mi:absolute mi:top-[18%] mi:right-[18%] mi:w-[18%] mi:aspect-[1] mi:rounded-[50%] mi:[background:color-mix(in_srgb,_var(--mi-card)_80%,_transparent)]" /><span class="mi:absolute mi:top-[58%] mi:right-[-10%] mi:bottom-[-40%] mi:left-[-10%] mi:rounded-[50%_50%_0_0] mi:[background:color-mix(in_srgb,_var(--mi-label)_30%,_transparent)]" />
          </template>
          <template v-else>
            <MiIcon name="image" :size="26" />
            <span class="mi:text-[12px] mi:font-medium">{{ s.guide }}</span>
          </template>
          <span v-if="cover === s.id" class="mi:absolute mi:top-2.5 mi:left-2.5 mi:py-0.5 mi:px-[9px] mi:rounded-[999px] mi:text-[11px] mi:font-bold mi:text-p-on mi:[background:var(--mi-p)]">Cover</span>
        </div>

        <div class="mi:grid mi:content-start mi:gap-2 mi:p-3.5">
          <div class="mi:flex mi:items-baseline mi:justify-between mi:gap-2">
            <MiText :id="`lpc-${s.id}`" as="h3" variant="subheadline" weight="semibold">{{ s.name }}</MiText>
            <MiText v-if="!s.required" variant="caption" tone="label3">Optional</MiText>
          </div>
          <MiText v-if="s.file" variant="caption" tone="label2" :lines="1">{{ s.file.name }} · {{ s.file.size }}</MiText>
          <MiText v-else-if="s.error" variant="caption" tone="red">{{ s.error }}</MiText>
          <MiText v-else variant="caption" tone="label3">JPG or PNG, 10 MB max</MiText>

          <MiFileInput
            accept="image/jpeg,image/png" :max-size="maxBytes" :label="`${s.name} photo`"
            :button-label="s.file ? 'Replace' : 'Choose photo'" :placeholder="s.file ? s.file.name : 'No photo yet'"
            :model-value="null" @update:model-value="pick(s, $event)" @reject="s.error = rejectText($event)"
          />
          <MiButton
            v-if="s.file" class="mi:justify-self-start" size="small" :variant="cover === s.id ? 'tinted' : 'plain'" :pressed="cover === s.id"
            :aria-describedby="`lpc-${s.id}`" @click="cover = s.id"
          >
            <template #leading><MiIcon name="star" :size="14" :filled="cover === s.id" /></template>
            {{ cover === s.id ? 'Cover photo' : 'Use as cover' }}
          </MiButton>
        </div>
      </li>
    </ul>

    <footer class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3">
      <p class="mi:flex-[1_1_240px] mi:m-0 mi:text-[13px] mi:text-label2" role="status" aria-live="polite">{{ status }}</p>
      <MiButton :disabled="!ready" @click="saved = true">Save photos</MiButton>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface Picked { name: string, size: string }
interface Shot { id: string, name: string, guide: string, tint: string, required: boolean, file: Picked | null, error: string }
interface Rejection { file: File, reason: 'type' | 'size' | 'count' }

const maxBytes = 10 * 1024 * 1024
// The shot list a host is asked for; three photos are already in place.
const shots = reactive<Shot[]>([
  { id: 'living', name: 'Living room', guide: 'Wide, from the doorway', tint: 'var(--mi-p)', required: true, file: { name: 'living-wide.jpg', size: '4.2 MB' }, error: '' },
  { id: 'kitchen', name: 'Kitchen', guide: 'Counters clear, lights on', tint: 'var(--mi-orange)', required: true, file: { name: 'kitchen.jpg', size: '3.1 MB' }, error: '' },
  { id: 'bedroom', name: 'Bedroom', guide: 'Bed made, from a corner', tint: 'var(--mi-s)', required: true, file: null, error: '' },
  { id: 'bath', name: 'Bathroom', guide: 'Straight on, lid down', tint: 'var(--mi-green)', required: true, file: null, error: '' },
  { id: 'view', name: 'View or balcony', guide: 'Daylight, horizon level', tint: 'var(--mi-p)', required: false, file: { name: 'balcony-dusk.png', size: '6.8 MB' }, error: '' },
  { id: 'street', name: 'Building entrance', guide: 'Helps guests find you', tint: 'var(--mi-label2)', required: false, file: null, error: '' }
])
const cover = ref('living')
const saved = ref(false)

const requiredCount = shots.filter(s => s.required).length
const requiredDone = computed(() => shots.filter(s => s.required && s.file).length)
const ready = computed(() => requiredDone.value === requiredCount)
const status = computed(() => {
  if (saved.value) return 'Photos saved. They appear on your listing within a minute.'
  if (ready.value) return 'All required shots are in. Pick the cover guests see first.'
  const missing = shots.filter(s => s.required && !s.file).map(s => s.name.toLowerCase())
  return `Still needed: ${missing.join(', ')}.`
})

const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`
function pick(s: Shot, value: File | File[] | null) {
  const file = Array.isArray(value) ? value[0] : value
  if (!file) return
  s.file = { name: file.name, size: formatSize(file.size) }
  s.error = ''
  saved.value = false
}
function rejectText(list: Rejection[]) {
  return list[0]?.reason === 'size' ? 'Over 10 MB. Export at a smaller size.' : 'Only JPG or PNG photos.'
}
</script>

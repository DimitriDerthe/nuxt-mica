<template>
  <section class="lpc" aria-labelledby="lpc-title">
    <header class="lpc__head">
      <div>
        <MiText id="lpc-title" as="h2" variant="title3" weight="semibold">Listing photos</MiText>
        <MiText variant="footnote" tone="label2">Loft on Rue Oberkampf · guests decide in the first five photos</MiText>
      </div>
      <MiBadge :tone="ready ? 'success' : 'warning'" :label="`${requiredDone} of ${requiredCount} required`" dot />
    </header>

    <div class="lpc__meter" role="meter" aria-label="Required shots uploaded" :aria-valuenow="requiredDone" aria-valuemin="0" :aria-valuemax="requiredCount">
      <span :style="{ transform: `scaleX(${requiredDone / requiredCount})` }" />
    </div>

    <ul class="lpc__grid">
      <li v-for="s in shots" :key="s.id" class="lpc__shot" :class="{ 'is-filled': s.file, 'is-cover': cover === s.id }">
        <!-- Drawn frame: a tinted gradient stands in for the photo, the shot guide shows while empty. -->
        <div class="lpc__frame" :style="{ '--lpc-tint': s.tint }" aria-hidden="true">
          <template v-if="s.file">
            <span class="lpc__sun" /><span class="lpc__hill" />
          </template>
          <template v-else>
            <MiIcon name="image" :size="26" />
            <span class="lpc__guide">{{ s.guide }}</span>
          </template>
          <span v-if="cover === s.id" class="lpc__cover-tag">Cover</span>
        </div>

        <div class="lpc__body">
          <div class="lpc__title">
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
            v-if="s.file" class="lpc__cover-btn" size="small" :variant="cover === s.id ? 'tinted' : 'plain'" :pressed="cover === s.id"
            :aria-describedby="`lpc-${s.id}`" @click="cover = s.id"
          >
            <template #leading><MiIcon name="star" :size="14" :filled="cover === s.id" /></template>
            {{ cover === s.id ? 'Cover photo' : 'Use as cover' }}
          </MiButton>
        </div>
      </li>
    </ul>

    <footer class="lpc__foot">
      <p class="lpc__status" role="status" aria-live="polite">{{ status }}</p>
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

<style scoped>
.lpc { container: lpc / inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.lpc__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.lpc__meter { height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.lpc__meter span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--mi-p), var(--mi-s)); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }

.lpc__grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin: 0; padding: 0; list-style: none; }
@container lpc (min-width: 540px) { .lpc__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container lpc (min-width: 860px) { .lpc__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.lpc__shot { display: grid; grid-template-rows: auto 1fr; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
.lpc__shot.is-cover { box-shadow: 0 0 0 2px var(--mi-p), var(--mi-sh1); }
.lpc__frame {
  position: relative; display: grid; place-content: center; justify-items: center; gap: 6px; aspect-ratio: 16 / 9; overflow: hidden;
  color: var(--mi-label3); background: repeating-linear-gradient(135deg, var(--mi-fill4) 0 10px, transparent 10px 20px); border-bottom: 1px dashed var(--mi-sep);
}
.is-filled .lpc__frame { border-bottom: 0; background: linear-gradient(160deg, color-mix(in srgb, var(--lpc-tint) 30%, var(--mi-card)), color-mix(in srgb, var(--lpc-tint) 70%, var(--mi-label))); }
.lpc__sun { position: absolute; top: 18%; right: 18%; width: 18%; aspect-ratio: 1; border-radius: 50%; background: color-mix(in srgb, var(--mi-card) 80%, transparent); }
.lpc__hill { position: absolute; inset: 58% -10% -40% -10%; border-radius: 50% 50% 0 0; background: color-mix(in srgb, var(--mi-label) 30%, transparent); }
.lpc__guide { font-size: 12px; font-weight: 500; }
.lpc__cover-tag { position: absolute; top: 10px; left: 10px; padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; color: var(--mi-p-on); background: var(--mi-p); }

.lpc__body { display: grid; align-content: start; gap: 8px; padding: 14px; }
.lpc__title { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.lpc__cover-btn { justify-self: start; }

.lpc__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
.lpc__status { flex: 1 1 240px; margin: 0; font-size: 13px; color: var(--mi-label2); }
</style>

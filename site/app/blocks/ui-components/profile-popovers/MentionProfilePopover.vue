<template>
  <div class="mpp-cq">
    <section class="mpp" aria-labelledby="mpp-title">
      <div class="mpp__thread">
        <MiText id="mpp-title" variant="headline" as="h2">PAY-1187 · Retry budget for card captures</MiText>
        <article v-for="c in comments" :key="c.id" class="mpp__comment">
          <MiAvatar :name="c.author" size="sm" tone="auto" decorative />
          <div class="mpp__comment-body">
            <p class="mpp__meta"><strong>{{ c.author }}</strong> <span>{{ c.time }}</span></p>
            <p class="mpp__text">
              <template v-for="(part, i) in c.parts" :key="i">
                <MiPopover v-if="part.person" placement="top-start" :width="260" :label="who(part).name" @update:model-value="(o) => o && pin(who(part).key)">
                  <template #trigger="{ attrs }">
                    <button v-bind="attrs" type="button" class="mpp__mention">@{{ who(part).handle }}</button>
                  </template>
                  <div class="mpp__mini">
                    <MiAvatar :name="who(part).name" size="sm" tone="auto" decorative />
                    <div>
                      <MiText variant="subheadline" weight="semibold">{{ who(part).name }}</MiText>
                      <MiText variant="caption" tone="label2">{{ who(part).role }} · {{ localTime(who(part).offset) }}</MiText>
                    </div>
                  </div>
                </MiPopover>
                <template v-else>{{ part.text }}</template>
              </template>
            </p>
          </div>
        </article>
        <MiText variant="caption" tone="label3">Tap a mention for a quick card; the full card pins on the right.</MiText>
      </div>

      <!-- Full profile card, open in place under its mention. -->
      <MiPopover v-model="open" inline trigger="manual" :width="280" :arrow-offset="34" :label="person.name + ' profile'" class="mpp__pop">
        <template #trigger="{ attrs, toggle }">
          <button v-bind="attrs" type="button" class="mpp__mention mpp__mention--pinned" @click="toggle">@{{ person.handle }}</button>
        </template>

        <div class="mpp__card">
          <div class="mpp__who">
            <MiBadge dot-only :tone="person.available ? 'success' : 'warning'" placement="bottom-right" :dot-size="12" :aria-label="person.available ? 'Available' : 'Busy'">
              <template #target><MiAvatar :name="person.name" size="lg" tone="auto" decorative /></template>
            </MiBadge>
            <div class="mpp__id">
              <MiText variant="headline" as="h3">{{ person.name }}</MiText>
              <MiText variant="footnote" tone="label2">{{ person.role }}</MiText>
              <MiText variant="caption" :tone="person.available ? 'green' : 'orange'" weight="medium">{{ person.status }}</MiText>
            </div>
          </div>

          <!-- Their day on one track: working hours band and a "now" tick. -->
          <div class="mpp__day">
            <div class="mpp__day-row">
              <MiText variant="caption" weight="semibold" tabular>{{ localTime(person.offset) }} in {{ person.city }}</MiText>
              <MiText variant="caption" tone="label2">{{ gap(person.offset) }}</MiText>
            </div>
            <div class="mpp__track" role="img" :aria-label="dayLabel">
              <span class="mpp__band" :style="{ left: '37.5%', width: '37.5%' }" />
              <span class="mpp__now" :style="{ left: (hour(person.offset) / 24) * 100 + '%' }" />
            </div>
            <MiText variant="caption2" tone="label3">{{ advice }}</MiText>
          </div>

          <dl class="mpp__stats">
            <div><dt>Reviews</dt><dd>{{ person.reviews }}</dd></div>
            <div><dt>Replies in</dt><dd>{{ person.reply }}</dd></div>
            <div><dt>Shared</dt><dd>{{ person.shared }} channels</dd></div>
          </dl>

          <div class="mpp__actions">
            <MiButton size="small" block>Message</MiButton>
            <MiButton size="small" variant="gray" block :pressed="following[person.key]" @click="following[person.key] = !following[person.key]">
              {{ following[person.key] ? 'Following' : 'Follow' }}
            </MiButton>
          </div>
        </div>
      </MiPopover>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Key = 'kenji' | 'sofia' | 'ruth'
interface Person { key: Key, name: string, handle: string, role: string, city: string, offset: number, available: boolean, status: string, reviews: number, reply: string, shared: number }

const people: Record<Key, Person> = {
  kenji: { key: 'kenji', name: 'Kenji Watanabe', handle: 'kenji', role: 'Staff engineer · Payments', city: 'Osaka', offset: 9, available: false, status: 'Focus mode until 18:00', reviews: 38, reply: '~2 h', shared: 4 },
  sofia: { key: 'sofia', name: 'Sofia Lindqvist', handle: 'sofia.l', role: 'Ledger lead · Finance platform', city: 'Stockholm', offset: 1, available: true, status: 'Available', reviews: 21, reply: '~20 min', shared: 6 },
  ruth: { key: 'ruth', name: 'Ruth Abebe', handle: 'ruth', role: 'Engineering manager', city: 'Addis Ababa', offset: 3, available: true, status: 'Available', reviews: 9, reply: '~1 h', shared: 7 }
}

type Part = { text?: string, person?: Key }
const who = (part: Part) => people[part.person ?? 'kenji']
const comments: { id: number, author: string, time: string, parts: Part[] }[] = [
  { id: 1, author: 'Ruth Abebe', time: '09:12', parts: [{ text: 'Can ' }, { person: 'kenji' }, { text: ' sanity-check the retry budget before Friday? ' }, { person: 'sofia' }, { text: ' already signed off on the ledger side.' }] },
  { id: 2, author: 'Sofia Lindqvist', time: '09:20', parts: [{ text: 'Yes, ledger is fine at 3 retries. ' }, { person: 'kenji' }, { text: ', the open question is the jitter window.' }] }
]

const nowUtc = 8.7 // 08:42 UTC, fixed for the demo
const viewerOffset = 1 // the reader is in Paris
const hour = (offset: number) => (((nowUtc + offset) % 24) + 24) % 24
const localTime = (offset: number) => { const h = hour(offset); return `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}` }
const gap = (offset: number) => { const d = offset - viewerOffset; return d === 0 ? 'Same time as you' : `${Math.abs(d)} h ${d > 0 ? 'ahead' : 'behind'}` }

const open = ref(true)
const pinned = ref<Key>('kenji')
const person = computed(() => people[pinned.value])
function pin(key: Key) { pinned.value = key }

const following = reactive<Record<Key, boolean>>({ kenji: false, sofia: true, ruth: false })

const dayLabel = computed(() => `Working hours 09:00 to 18:00, it is ${localTime(person.value.offset)} now`)
const advice = computed(() => {
  const h = hour(person.value.offset)
  if (h < 9) return `Starts in ${Math.ceil(9 - h)} h · a message now waits until morning`
  if (h >= 18) return 'Day is over · expect a reply tomorrow morning'
  if (h >= 17) return 'Last hour of their day · keep it short'
  return 'Inside working hours'
})
</script>

<style scoped>
.mpp-cq { container-type: inline-size; }
.mpp { display: grid; gap: 22px; grid-template-columns: minmax(0, 1fr); align-items: start; font-family: var(--mi-font); color: var(--mi-label); }
@container (min-width: 760px) { .mpp { grid-template-columns: minmax(0, 1fr) 296px; gap: 32px; } }

.mpp__thread { display: grid; gap: 14px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.mpp__comment { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 12px; padding-top: 14px; border-top: .5px solid var(--mi-sep); }
.mpp__comment-body { display: grid; gap: 2px; min-width: 0; }
.mpp__meta { margin: 0; font-size: 14px; }
.mpp__meta span { margin-inline-start: 6px; font-size: 12px; color: var(--mi-label3); }
.mpp__text { margin: 0; font-size: 15px; line-height: 1.6; color: var(--mi-label); }
.mpp__text :deep(.mi-pop-anchor) { display: inline; }

.mpp__mention { display: inline; padding: 1px 5px; border: 0; border-radius: 6px; background: var(--mi-p-tint); color: var(--mi-p-text); font: inherit; font-weight: 600; cursor: pointer; }
.mpp__mention:hover { background: var(--mi-p-tint2); }
.mpp__mention:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.mpp__mention--pinned { padding: 4px 10px; font-size: 15px; }
.mpp__mini { display: flex; align-items: center; gap: 10px; }

.mpp__card { display: grid; gap: 16px; }
.mpp__who { display: flex; align-items: center; gap: 14px; }
.mpp__id { display: grid; gap: 1px; min-width: 0; }

.mpp__day { display: grid; gap: 6px; padding: 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.mpp__day-row { display: flex; justify-content: space-between; gap: 8px; }
.mpp__track { position: relative; height: 8px; border-radius: 4px; background: var(--mi-fill3); }
.mpp__band { position: absolute; top: 0; bottom: 0; border-radius: inherit; background: color-mix(in srgb, var(--mi-p) 45%, transparent); }
.mpp__now { position: absolute; top: -4px; width: 2px; height: 16px; margin-left: -1px; border-radius: 1px; background: var(--mi-label); }

.mpp__stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0; }
.mpp__stats div { display: grid; gap: 2px; }
.mpp__stats dt { font-size: 11px; color: var(--mi-label2); }
.mpp__stats dd { margin: 0; font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
.mpp__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
</style>

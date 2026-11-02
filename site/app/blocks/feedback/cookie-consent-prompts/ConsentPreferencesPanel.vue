<template>
  <section class="cpp" aria-labelledby="cpp-title">
    <div class="cpp__stage">
      <div class="cpp__backdrop" aria-hidden="true"><i v-for="n in 7" :key="n" /></div>

      <div v-if="open" class="cpp__panel" role="dialog" aria-modal="false" aria-labelledby="cpp-title">
        <header class="cpp__head">
          <div>
            <MiText id="cpp-title" variant="title3" as="h2" weight="semibold">Privacy preferences</MiText>
            <MiText variant="footnote" tone="label2">Fernhall Journal · choices are kept for 6 months</MiText>
          </div>
          <MiIconButton label="Close preferences" variant="gray" size="small" @click="open = false">
            <MiIcon name="close" :size="16" />
          </MiIconButton>
        </header>

        <MiAlert v-if="gpc" tone="info" title="Global Privacy Control detected">
          Your browser asks sites not to sell or share data, so advertising starts switched off.
        </MiAlert>

        <div class="cpp__body">
          <ul class="cpp__list">
            <li v-for="c in categories" :key="c.id" class="cpp__cat">
              <div class="cpp__cat-head">
                <div class="cpp__cat-title">
                  <MiText :id="'cpp-c-' + c.id" variant="subheadline" weight="semibold" as="h3">{{ c.label }}</MiText>
                  <MiText variant="caption" tone="label2">{{ c.desc }}</MiText>
                </div>
                <MiBadge v-if="c.locked" label="Always on" tone="neutral" variant="outline" />
                <MiSwitch v-else v-model="c.on" :aria-labelledby="'cpp-c-' + c.id" />
              </div>
              <MiCollapsible :title="`${c.partners.length} ${c.partners.length === 1 ? 'service' : 'services'} · kept up to ${c.longest}`">
                <ul class="cpp__partners">
                  <li v-for="p in c.partners" :key="p.name">
                    <span class="cpp__p-name">{{ p.name }}</span>
                    <span class="cpp__p-why">{{ p.why }}</span>
                    <span class="cpp__p-keep">{{ p.keep }}</span>
                  </li>
                </ul>
              </MiCollapsible>
            </li>
          </ul>

          <!-- Plain-language receipt of what the current switches mean, updated as you toggle. -->
          <aside class="cpp__plain" aria-labelledby="cpp-plain">
            <MiText id="cpp-plain" variant="caption" tone="label3" weight="semibold" class="cpp__caps">In plain words</MiText>
            <ul class="cpp__says" aria-live="polite">
              <li v-for="c in categories" :key="c.id" :data-on="c.on">
                <MiIcon :name="c.on ? 'check' : 'close'" :size="14" :weight="2.4" />
                <span>{{ c.on ? c.yes : c.no }}</span>
              </li>
            </ul>
          </aside>
        </div>

        <footer class="cpp__foot">
          <MiButton variant="gray" @click="setAll(false)">Reject all</MiButton>
          <MiButton variant="gray" @click="setAll(true)">Accept all</MiButton>
          <MiButton class="cpp__save" @click="save">Save my choices</MiButton>
        </footer>
      </div>

      <div v-else class="cpp__closed">
        <MiText variant="footnote" tone="label2" role="status">{{ status }}</MiText>
        <MiButton variant="tinted" size="small" @click="open = true">Privacy preferences</MiButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface Partner { name: string, why: string, keep: string }

// Sample categories and services; swap for your consent manager's vendor list.
const categories = reactive([
  {
    id: 'essential', label: 'Essential', desc: 'Sign-in, subscription paywall and security.', on: true, locked: true, longest: '30 days',
    yes: 'Keeps you signed in and your subscription working.', no: '',
    partners: [{ name: 'Fernhall session', why: 'Sign-in', keep: '30 days' }, { name: 'Edge shield', why: 'Bot and abuse checks', keep: '24 hours' }] as Partner[]
  },
  {
    id: 'reading', label: 'Reading preferences', desc: 'Text size, saved articles and dark mode on this device.', on: true, locked: false, longest: '1 year',
    yes: 'Remembers text size and saved articles here.', no: 'Forgets your text size and saved articles on each visit.',
    partners: [{ name: 'Fernhall preferences', why: 'Display settings', keep: '1 year' }] as Partner[]
  },
  {
    id: 'audience', label: 'Audience measurement', desc: 'Counts readers per article, without building a profile of you.', on: false, locked: false, longest: '13 months',
    yes: 'Counts your visits anonymously to rank articles.', no: 'Does not count your visits.',
    partners: [{ name: 'Tallyhouse Analytics', why: 'Page counts', keep: '13 months' }, { name: 'Scroll depth', why: 'Reading time', keep: '30 days' }] as Partner[]
  },
  {
    id: 'ads', label: 'Personalised advertising', desc: 'Lets partners choose ads from your reading on other sites.', on: false, locked: false, longest: '6 months',
    yes: 'Shares reading interests with 4 ad partners.', no: 'Shows ads, but none chosen from your reading.',
    partners: [{ name: 'Brightline Ads', why: 'Ad selection', keep: '6 months' }, { name: 'Marlow Exchange', why: 'Ad auction', keep: '90 days' }, { name: 'Quayside Retarget', why: 'Follow-up ads', keep: '6 months' }, { name: 'Tern Attribution', why: 'Campaign reports', keep: '30 days' }] as Partner[]
  }
])

const gpc = true
const open = ref(true)
const status = ref('Preferences closed without changes.')

function setAll(on: boolean) {
  categories.forEach((c) => { c.on = c.locked || on })
  save()
}
function save() {
  const n = categories.filter(c => c.on).length
  status.value = `Saved: ${n} of ${categories.length} categories on.`
  open.value = false
}
</script>

<style scoped>
.cpp { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.cpp__stage { position: relative; display: grid; place-items: center; min-height: 520px; padding: 20px 12px; border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate; background: color-mix(in srgb, var(--mi-label) 22%, var(--mi-page)); }
@container (min-width: 640px) { .cpp__stage { padding: 40px 28px; } }

/* Faux article columns under the scrim. */
.cpp__backdrop { position: absolute; inset: 0; z-index: -1; display: grid; align-content: start; gap: 12px; padding: 28px; opacity: .35; }
.cpp__backdrop i { display: block; height: 12px; border-radius: 6px; background: var(--mi-card); }
.cpp__backdrop i:first-child { width: 55%; height: 26px; margin-bottom: 10px; }
.cpp__backdrop i:nth-child(3n) { width: 82%; }

.cpp__panel { display: grid; gap: 16px; width: 100%; max-width: 860px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-elev); box-shadow: var(--mi-sh3); animation: cpp-in var(--mi-dur-4) var(--mi-spring) both; }
@container (min-width: 640px) { .cpp__panel { padding: 24px; } }
@keyframes cpp-in { from { opacity: 0; transform: translateY(12px) scale(.98); } }
.cpp__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }

.cpp__body { display: grid; gap: 16px; }
@container (min-width: 780px) { .cpp__body { grid-template-columns: minmax(0, 1fr) 240px; align-items: start; } }
.cpp__list { list-style: none; margin: 0; padding: 0; display: grid; border-radius: var(--mi-radius-l); border: 1px solid var(--mi-sep); }
.cpp__cat { display: grid; gap: 4px; padding: 14px 14px 8px; }
.cpp__cat + .cpp__cat { border-top: 1px solid var(--mi-sep); }
.cpp__cat-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.cpp__cat-title { display: grid; gap: 2px; min-width: 0; }

.cpp__partners { list-style: none; margin: 0; padding: 4px 0 6px; display: grid; gap: 6px; }
.cpp__partners li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0 12px; font-size: 13px; }
.cpp__p-name { font-weight: 500; }
.cpp__p-why { grid-row: 2; color: var(--mi-label2); font-size: 12px; }
.cpp__p-keep { grid-row: span 2; align-self: center; color: var(--mi-label3); font-size: 12px; font-variant-numeric: tabular-nums; }

.cpp__plain { display: grid; gap: 10px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.cpp__caps { text-transform: uppercase; letter-spacing: .06em; }
.cpp__says { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; font-size: 13px; line-height: 1.4; }
.cpp__says li { display: grid; grid-template-columns: 20px 1fr; gap: 8px; align-items: start; }
.cpp__says li :deep(svg) { margin-top: 1px; padding: 3px; box-sizing: content-box; border-radius: 50%; }
.cpp__says li[data-on="true"] :deep(svg) { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 16%, transparent); }
.cpp__says li[data-on="false"] { color: var(--mi-label2); }
.cpp__says li[data-on="false"] :deep(svg) { color: var(--mi-label3); background: var(--mi-fill3); }

.cpp__foot { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding-top: 16px; border-top: 1px solid var(--mi-sep); }
.cpp__save { grid-column: 1 / -1; }
@container (min-width: 560px) { .cpp__foot { display: flex; justify-content: flex-end; } }

.cpp__closed { display: grid; justify-items: center; gap: 10px; padding: 20px 24px; border-radius: var(--mi-radius-xl); background: var(--mi-elev); box-shadow: var(--mi-sh2); text-align: center; }
@media (prefers-reduced-motion: reduce) { .cpp__panel { animation: none; } }
</style>

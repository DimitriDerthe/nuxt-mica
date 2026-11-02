<template>
  <div class="otm">
    <div class="otm__page">
      <header class="otm__top">
        <span class="otm__brand"><span class="otm__brand-mark" aria-hidden="true" />Ridgeline</span>
        <MiTextLink href="#" :chevron="false">Help centre</MiTextLink>
      </header>

      <main class="otm__main" aria-labelledby="otm-title">
        <!-- Illustration: a contour map whose trail runs off the torn edge, and the reader's pin beyond it. -->
        <svg class="otm__art" viewBox="0 0 400 300" aria-hidden="true">
          <g class="otm__sheet" transform="rotate(-3 180 150)">
            <path d="M30 40h262l-8 22 10 18-9 24 11 20-10 26 9 22-11 24 10 22-8 22H30a8 8 0 0 1-8-8V48a8 8 0 0 1 8-8z" class="otm__paper" />
            <g transform="translate(150 140)" class="otm__contours">
              <path :d="blob" />
              <path :d="blob" transform="scale(.76)" />
              <path :d="blob" transform="translate(6 -4) scale(.52)" />
              <path :d="blob" transform="translate(12 -8) scale(.28)" class="is-peak" />
            </g>
            <path d="M44 226c30-6 40-34 70-40s52 14 78-10 20-62 52-74 44 2 50-6" class="otm__trail" />
            <circle cx="44" cy="226" r="5" class="otm__start" />
            <g transform="translate(66 76)" class="otm__compass">
              <circle r="16" />
              <path d="M0-11 4 0H-4z" class="is-n" />
              <path d="M0 11 4 0H-4z" />
              <text y="-20" text-anchor="middle">N</text>
            </g>
          </g>
          <g class="otm__lost">
            <ellipse cx="346" cy="214" rx="18" ry="5" class="otm__shadow" />
            <g class="otm__pin">
              <path d="M346 196c-16-18-24-30-24-42a24 24 0 0 1 48 0c0 12-8 24-24 42z" class="otm__pin-body" />
              <circle cx="346" cy="154" r="12" class="otm__pin-dot" />
              <text x="346" y="159" text-anchor="middle" class="otm__pin-q">?</text>
            </g>
          </g>
        </svg>

        <div class="otm__copy">
          <MiText variant="caption" tone="label2" weight="semibold" class="otm__code">Error 404 · ref 7Q2-K9</MiText>
          <MiText id="otm-title" variant="largeTitle" as="h2" weight="bold" balance>You've walked off the map</MiText>
          <MiText variant="body" tone="label2">
            Nothing lives at <code class="otm__path">/routes/cairngorms-loop-2019</code>. The route may have been renamed when it was updated. Let's get you back on the trail.
          </MiText>

          <div class="otm__find">
            <MiSearch v-model="query" placeholder="Search routes and pages" aria-label="Search routes and pages" :cancelable="false" />
            <ul class="otm__hits" aria-label="Suggested pages">
              <li v-for="p in hits" :key="p.label">
                <a href="#" class="otm__hit">
                  <MiIcon :name="p.icon" :size="16" class="otm__hit-icon" />
                  <span class="otm__hit-text"><b>{{ p.label }}</b><span>{{ p.hint }}</span></span>
                  <MiIcon name="chevron-right" :size="14" class="otm__hit-go" />
                </a>
              </li>
              <li v-if="!hits.length" class="otm__none">No page matches “{{ query }}”. Try a place name.</li>
            </ul>
          </div>

          <div class="otm__actions">
            <MiButton href="#">
              <template #leading><MiIcon name="arrow-left" :size="16" /></template>
              Back to my routes
            </MiButton>
            <MiButton variant="plain" :disabled="reported" @click="reported = true">{{ reported ? 'Thanks, we will fix that link' : 'Report a broken link' }}</MiButton>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const blob = 'M-110-10C-105-70-40-95 20-85S120-40 115 10 60 95 0 90-115 50-110-10z'

const pages = [
  { label: 'Cairngorms loop', hint: '2024 edition · 38 km · 2 days', icon: 'globe' as const },
  { label: 'Saved routes', hint: '12 routes in your library', icon: 'bookmark' as const },
  { label: 'Offline maps', hint: 'Download areas for no signal', icon: 'archive' as const },
  { label: 'Trail conditions', hint: 'Reports from the last 7 days', icon: 'info-circle' as const },
  { label: 'Help centre', hint: 'Guides and contact', icon: 'chat' as const }
]
const query = ref('')
const reported = ref(false)
const hits = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = q ? pages.filter(p => (p.label + ' ' + p.hint).toLowerCase().includes(q)) : pages
  return list.slice(0, 3)
})
</script>

<style scoped>
.otm { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.otm__page { display: grid; grid-template-rows: auto minmax(0, 1fr); min-height: 620px; background: radial-gradient(80% 60% at 20% 30%, var(--mi-p-tint), transparent 70%), var(--mi-page); }

.otm__top { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; }
.otm__brand { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; letter-spacing: -.02em; }
.otm__brand-mark { width: 22px; height: 22px; border-radius: 6px; background: linear-gradient(160deg, var(--mi-p) 0 50%, var(--mi-s) 50% 100%); clip-path: polygon(50% 8%, 100% 92%, 0 92%); }

.otm__main { display: grid; align-content: center; gap: 8px; padding: 0 20px 28px; }
.otm__art { width: 100%; max-width: 420px; height: auto; justify-self: center; overflow: visible; }

.otm__paper { fill: var(--mi-card); stroke: var(--mi-sep); stroke-width: 1; filter: drop-shadow(0 6px 14px color-mix(in srgb, var(--mi-label) 10%, transparent)); }
.otm__contours path { fill: none; stroke: var(--mi-sep2); stroke-width: 1.2; vector-effect: non-scaling-stroke; }
.otm__contours path.is-peak { fill: var(--mi-p-tint); stroke: var(--mi-p); }
.otm__trail { fill: none; stroke: var(--mi-p); stroke-width: 2.5; stroke-linecap: round; stroke-dasharray: 1 7; }
.otm__start { fill: var(--mi-card); stroke: var(--mi-p); stroke-width: 2.5; }
.otm__compass circle { fill: none; stroke: var(--mi-sep2); }
.otm__compass path { fill: var(--mi-label3); }
.otm__compass path.is-n { fill: var(--mi-red); }
.otm__compass text { font: 700 9px var(--mi-font); fill: var(--mi-label2); }
.otm__shadow { fill: var(--mi-label); opacity: .1; transform-box: fill-box; transform-origin: center; animation: otm-shadow 2.8s var(--mi-ease-in-out) infinite; }
.otm__pin { animation: otm-bob 2.8s var(--mi-ease-in-out) infinite; }
.otm__pin-body { fill: var(--mi-p); }
.otm__pin-dot { fill: var(--mi-p-on); }
.otm__pin-q { font: 800 15px var(--mi-font); fill: var(--mi-p); }
@keyframes otm-bob { 50% { transform: translateY(-8px); } }
@keyframes otm-shadow { 50% { transform: scale(.75); opacity: .05; } }
@media (prefers-reduced-motion: reduce) { .otm__pin, .otm__shadow { animation: none; } }

.otm__copy { display: grid; gap: 12px; max-width: 520px; }
.otm__code { letter-spacing: .08em; text-transform: uppercase; }
.otm__path { padding: 1px 6px; border-radius: 5px; background: var(--mi-fill4); color: var(--mi-label); font: 500 .88em ui-monospace, SFMono-Regular, Menlo, monospace; overflow-wrap: anywhere; }

.otm__find { display: grid; gap: 8px; margin-top: 4px; }
.otm__hits { display: grid; margin: 0; padding: 4px; list-style: none; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.otm__hit { display: flex; align-items: center; gap: 12px; padding: 9px 10px; border-radius: var(--mi-radius-m); color: inherit; text-decoration: none; }
.otm__hit:hover { background: var(--mi-fill4); }
.otm__hit:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.otm__hit-icon { flex: none; color: var(--mi-p-text); }
.otm__hit-text { display: grid; flex: 1; min-width: 0; }
.otm__hit-text b { font-size: 14px; font-weight: 600; }
.otm__hit-text span { font-size: 12px; color: var(--mi-label2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.otm__hit-go { flex: none; color: var(--mi-label3); transition: transform var(--mi-dur-2) var(--mi-ease); }
.otm__hit:hover .otm__hit-go { transform: translateX(3px); }
.otm__none { padding: 12px 10px; font-size: 13px; color: var(--mi-label2); }

.otm__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }

@container (min-width: 760px) {
  .otm__top { padding: 20px 32px; }
  .otm__main { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: 40px; padding: 0 40px 40px; }
  .otm__art { order: 2; max-width: 480px; }
}
</style>

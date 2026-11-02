<template>
  <div class="rb-cq">
    <section class="rb" aria-labelledby="rb-title">
      <header class="rb__top">
        <div class="rb__id">
          <span class="rb__tile" aria-hidden="true"><MiIcon :svg="icons.box" :size="22" /></span>
          <div class="rb__name">
            <MiText variant="caption" tone="label2" weight="medium">Release candidate · payments squad</MiText>
            <MiText id="rb-title" variant="title3" as="h2" weight="semibold">checkout-api <span class="rb__ver">v2.14.0</span></MiText>
          </div>
        </div>

        <!-- Icon-only buttons: one pressed toggle, one copy, one menu. -->
        <div class="rb__tools">
          <MiIconButton
            size="toolbar" variant="plain" :label="watching ? 'Stop watching release' : 'Watch release'" :pressed="watching" @click="watching = !watching"
          >
            <MiIcon name="bell" :filled="watching" />
          </MiIconButton>
          <MiCopyButton :value="sha" label="Copy commit SHA" copied-label="SHA copied" variant="ghost" icon-only />
          <MiIconButton size="toolbar" variant="plain" label="Open pull request on GitHub">
            <MiIcon :svg="icons.external" />
          </MiIconButton>
          <MiMenu :items="moreItems" aria-label="Release actions" placement="bottom-end" @select="onMore">
            <template #trigger="{ props }">
              <MiIconButton v-bind="props" size="toolbar" variant="gray" label="More release actions">
                <MiIcon name="more" />
              </MiIconButton>
            </template>
          </MiMenu>
        </div>
      </header>

      <div class="rb__meta">
        <MiBadge :tone="phase.tone" :label="phase.label" dot />
        <span class="rb__pill"><MiIcon :svg="icons.branch" :size="14" /> main</span>
        <span class="rb__pill rb__mono">{{ sha.slice(0, 7) }}</span>
        <span class="rb__pill">14 commits · 2 migrations</span>
      </div>

      <ol class="rb__checks" aria-label="Release checks">
        <li v-for="c in checks" :key="c.label" class="rb__check">
          <span class="rb__ok" aria-hidden="true"><MiIcon name="check" :size="14" :weight="2.6" /></span>
          <div>
            <MiText variant="subheadline" weight="semibold">{{ c.label }}</MiText>
            <MiText variant="footnote" tone="label2">{{ c.detail }}</MiText>
          </div>
        </li>
      </ol>

      <!-- The action ladder: tertiary on the left, emphasis grows to the right. -->
      <footer class="rb__actions">
        <div class="rb__quiet">
          <MiButton variant="plain">View changelog</MiButton>
          <MiButton variant="bordered">
            <template #leading><MiIcon :svg="icons.download" :size="18" /></template>
            Build artifacts
          </MiButton>
        </div>
        <div class="rb__loud">
          <MiButton variant="gray">Compare with v2.13.4</MiButton>
          <MiButton variant="tinted" brand="secondary">
            <template #leading><MiIcon name="chat" :size="18" /></template>
            Notify #payments-eng
          </MiButton>
          <MiButton size="large" :loading="promoting" :disabled="shipped" @click="promote">
            <template v-if="!promoting" #leading><MiIcon :svg="shipped ? icons.checkCircle : icons.rocket" :size="18" /></template>
            {{ shipped ? 'Live on production' : promoting ? 'Promoting…' : 'Promote to production' }}
          </MiButton>
        </div>
      </footer>

      <!-- Danger zone: the destructive action asks for a deliberate press-and-hold. -->
      <div class="rb__danger">
        <div class="rb__danger-text">
          <MiText as="h3" variant="headline">Roll back to v2.13.4</MiText>
          <MiText variant="footnote" tone="label2">Restores the previous image on all 6 pods. Database migrations stay applied.</MiText>
        </div>
        <div class="rb__danger-actions">
          <MiButton variant="destructive" size="small" disabled>Delete release</MiButton>
          <div
            class="rb__hold" :class="{ 'is-holding': holding }"
            @pointerdown="startHold" @pointerup="cancelHold" @pointerleave="cancelHold" @pointercancel="cancelHold"
            @keydown.space.prevent="startHold" @keydown.enter.prevent="startHold" @keyup.space="cancelHold" @keyup.enter="cancelHold"
          >
            <MiButton variant="destructive" soft size="small" :disabled="!shipped" :aria-describedby="'rb-hold-hint'">
              <template #leading><MiIcon :svg="icons.undo" :size="16" /></template>
              <span class="rb__hold-label">Hold to roll back<span class="rb__hold-fill" aria-hidden="true" /></span>
            </MiButton>
          </div>
        </div>
        <MiText id="rb-hold-hint" variant="caption" tone="label3" class="rb__hint">
          {{ shipped ? 'Press and hold for 1.5 seconds.' : 'Available once the release is live.' }}
        </MiText>
      </div>

      <p class="rb__sr" aria-live="polite">{{ announce }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const sha = '3f9c2e18b7a04d1c95e6aa20f1b3c7d8e4920b61'
const icons = {
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  branch: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="7" r="2"/><path d="M6 7v10M18 9c0 5-6 4-11 8"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  rocket: '<path d="M5 15c-1.5 1.3-2 4-2 6 2 0 4.7-.5 6-2M14 4c3-1 6-1 6-1s0 3-1 6l-6 6-4-4 5-7Z"/><path d="M9 11 5 11l2-3h4M13 15v4l3-2v-4"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.6 2.5L16 9.5"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'
}

const checks = [
  { label: 'Tests', detail: '412 passed in 3 min 08 s' },
  { label: 'Canary at 5 %', detail: '30 min, error rate 0.02 %' },
  { label: 'Approvals', detail: 'Inès Moreau and Kofi Mensah' }
]

const moreItems = [
  { value: 'notes', label: 'Edit release notes', shortcut: '⌘E' },
  { value: 'pin', label: 'Pin to environment' },
  { separator: true },
  { value: 'archive', label: 'Archive candidate', destructive: true }
]

const watching = ref(true)
const promoting = ref(false)
const shipped = ref(false)
const holding = ref(false)
const announce = ref('')

const phase = computed(() => shipped.value
  ? { tone: 'success' as const, label: 'Live · 100 % traffic' }
  : { tone: 'primary' as const, label: 'Ready to ship' })

let promoteTimer: ReturnType<typeof setTimeout> | undefined
let holdTimer: ReturnType<typeof setTimeout> | undefined

function promote() {
  promoting.value = true
  announce.value = 'Promoting v2.14.0 to production.'
  promoteTimer = setTimeout(() => {
    promoting.value = false
    shipped.value = true
    announce.value = 'v2.14.0 is live on production.'
  }, 1600)
}

function startHold() {
  if (!shipped.value || holding.value) return
  holding.value = true
  holdTimer = setTimeout(() => {
    holding.value = false
    shipped.value = false
    announce.value = 'Rolled back to v2.13.4. v2.14.0 is ready to ship again.'
  }, 1500)
}

function cancelHold() {
  holding.value = false
  clearTimeout(holdTimer)
}

function onMore(item: { label?: string }) {
  announce.value = `${item.label ?? 'Action'} selected.`
}

onBeforeUnmount(() => { clearTimeout(promoteTimer); clearTimeout(holdTimer) })
</script>

<style scoped>
.rb-cq { container-type: inline-size; }
.rb {
  display: grid; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl);
  font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-card); box-shadow: var(--mi-sh1);
}
.rb__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.rb__id { display: flex; align-items: center; gap: 12px; min-width: 0; }
.rb__tile {
  display: grid; place-items: center; flex: none; width: 44px; height: 44px; border-radius: 12px;
  color: var(--mi-p-text); background: linear-gradient(145deg, var(--mi-p-tint2), var(--mi-p-tint));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mi-p) 22%, transparent);
}
.rb__name { display: grid; gap: 2px; min-width: 0; }
.rb__ver { font: 600 .82em/1 ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label2); letter-spacing: 0; }
.rb__tools { display: flex; align-items: center; gap: 2px; flex: none; }

.rb__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.rb__pill {
  display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 9px; border-radius: 999px;
  font-size: 12px; font-weight: 500; color: var(--mi-label2); background: var(--mi-fill3);
}
.rb__mono { font-family: ui-monospace, "SF Mono", Menlo, monospace; }

.rb__checks { display: grid; gap: 10px; margin: 0; padding: 14px; list-style: none; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.rb__check { display: flex; gap: 10px; align-items: flex-start; }
.rb__ok { display: grid; place-items: center; flex: none; width: 22px; height: 22px; margin-top: 1px; border-radius: 50%; color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 16%, transparent); }

.rb__actions { display: grid; gap: 10px; padding-top: 16px; border-top: 1px solid var(--mi-sep); }
.rb__quiet, .rb__loud { display: grid; gap: 8px; }
.rb__loud > :last-child { order: -1; }

.rb__danger {
  display: grid; gap: 12px; padding: 14px 16px; border-radius: var(--mi-radius-l);
  border: 1px dashed color-mix(in srgb, var(--mi-red) 45%, transparent); background: color-mix(in srgb, var(--mi-red) 5%, transparent);
}
.rb__danger-text { display: grid; gap: 2px; }
.rb__danger-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.rb__hint { margin-top: -6px; }
.rb__hold { display: inline-flex; touch-action: none; user-select: none; -webkit-user-select: none; }
.rb__hold-label { position: relative; display: inline-block; }
.rb__hold-fill {
  position: absolute; left: 0; right: 0; bottom: -3px; height: 2px; border-radius: 1px; background: currentColor;
  transform: scaleX(0); transform-origin: left; transition: transform 180ms var(--mi-ease);
}
.rb__hold.is-holding .rb__hold-fill { transform: scaleX(1); transition: transform 1500ms linear; }

.rb__sr { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

@container (min-width: 640px) {
  .rb { padding: 24px 26px; gap: 20px; }
  .rb__checks { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .rb__actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; }
  .rb__quiet, .rb__loud { display: flex; flex-wrap: wrap; align-items: center; }
  .rb__loud > :last-child { order: 0; }
  .rb__danger { grid-template-columns: minmax(0, 1fr) auto; align-items: center; }
  .rb__hint { grid-column: 1 / -1; }
}
</style>

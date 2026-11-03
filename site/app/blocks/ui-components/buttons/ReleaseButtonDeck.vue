<template>
  <div class="mi:@container">
    <section class="mi:grid mi:gap-4.5 mi:p-5 mi:rounded-xl mi:font-mi mi:text-label mi:[background:var(--mi-card)] mi:shadow-1 mi:@[640px]:py-6 mi:@[640px]:px-6.5 mi:@[640px]:gap-5" aria-labelledby="rb-title">
      <header class="mi:flex mi:[align-items:flex-start] mi:justify-between mi:gap-3">
        <div class="mi:flex mi:items-center mi:gap-3 mi:min-w-0">
          <span class="mi:grid mi:place-items-center mi:flex-[none] mi:w-11 mi:h-11 mi:rounded-[12px] mi:text-p-text mi:[background:linear-gradient(145deg,_var(--mi-p-tint2),_var(--mi-p-tint))] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-p)_22%,_transparent)]" aria-hidden="true"><MiIcon :svg="icons.box" :size="22" /></span>
          <div class="mi:grid mi:gap-0.5 mi:min-w-0">
            <MiText variant="caption" tone="label2" weight="medium">Release candidate · payments squad</MiText>
            <MiText id="rb-title" variant="title3" as="h2" weight="semibold">checkout-api <span class="mi:[font:600_.82em/1_ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:text-label2 mi:tracking-[0]">v2.14.0</span></MiText>
          </div>
        </div>

        <!-- Icon-only buttons: one pressed toggle, one copy, one menu. -->
        <div class="mi:flex mi:items-center mi:gap-0.5 mi:flex-[none]">
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

      <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-1.5">
        <MiBadge :tone="phase.tone" :label="phase.label" dot />
        <span class="mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6 mi:py-0 mi:px-[9px] mi:rounded-[999px] mi:text-[12px] mi:font-medium mi:text-label2 mi:[background:var(--mi-fill3)]"><MiIcon :svg="icons.branch" :size="14" /> main</span>
        <span class="mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6 mi:py-0 mi:px-[9px] mi:rounded-[999px] mi:text-[12px] mi:font-medium mi:text-label2 mi:[background:var(--mi-fill3)] mi:font-[ui-monospace,_'SF_Mono',_Menlo,_monospace]">{{ sha.slice(0, 7) }}</span>
        <span class="mi:inline-flex mi:items-center mi:gap-[5px] mi:h-6 mi:py-0 mi:px-[9px] mi:rounded-[999px] mi:text-[12px] mi:font-medium mi:text-label2 mi:[background:var(--mi-fill3)]">14 commits · 2 migrations</span>
      </div>

      <ol class="mi:grid mi:gap-2.5 mi:m-0 mi:p-3.5 mi:[list-style:none] mi:rounded-lg mi:[background:var(--mi-fill4)] mi:@[640px]:grid-cols-3" aria-label="Release checks">
        <li v-for="c in checks" :key="c.label" class="mi:flex mi:gap-2.5 mi:[align-items:flex-start]">
          <span class="mi:grid mi:place-items-center mi:flex-[none] mi:w-5.5 mi:h-5.5 mi:mt-px mi:rounded-[50%] mi:text-green-t mi:[background:color-mix(in_srgb,_var(--mi-green)_16%,_transparent)]" aria-hidden="true"><MiIcon name="check" :size="14" :weight="2.6" /></span>
          <div>
            <MiText variant="subheadline" weight="semibold">{{ c.label }}</MiText>
            <MiText variant="footnote" tone="label2">{{ c.detail }}</MiText>
          </div>
        </li>
      </ol>

      <!-- The action ladder: tertiary on the left, emphasis grows to the right. -->
      <footer class="mi:grid mi:gap-2.5 mi:pt-4 mi:border-t mi:border-t-sep mi:@[640px]:flex mi:@[640px]:flex-wrap mi:@[640px]:items-center mi:@[640px]:justify-between">
        <div class="mi:grid mi:gap-2 mi:@[640px]:flex mi:@[640px]:flex-wrap mi:@[640px]:items-center">
          <MiButton variant="plain">View changelog</MiButton>
          <MiButton variant="bordered">
            <template #leading><MiIcon :svg="icons.download" :size="18" /></template>
            Build artifacts
          </MiButton>
        </div>
        <div class="mi:grid mi:gap-2 mi:@[640px]:flex mi:@[640px]:flex-wrap mi:@[640px]:items-center">
          <MiButton variant="gray">Compare with v2.13.4</MiButton>
          <MiButton variant="tinted" brand="secondary">
            <template #leading><MiIcon name="chat" :size="18" /></template>
            Notify #payments-eng
          </MiButton>
          <MiButton size="large" :loading="promoting" :disabled="shipped" class="mi:-order-1 mi:@[640px]:order-0" @click="promote">
            <template v-if="!promoting" #leading><MiIcon :svg="shipped ? icons.checkCircle : icons.rocket" :size="18" /></template>
            {{ shipped ? 'Live on production' : promoting ? 'Promoting…' : 'Promote to production' }}
          </MiButton>
        </div>
      </footer>

      <!-- Danger zone: the destructive action asks for a deliberate press-and-hold. -->
      <div class="mi:grid mi:gap-3 mi:py-3.5 mi:px-4 mi:rounded-lg mi:[border:1px_dashed_color-mix(in_srgb,_var(--mi-red)_45%,_transparent)] mi:[background:color-mix(in_srgb,_var(--mi-red)_5%,_transparent)] mi:@[640px]:grid-cols-[minmax(0,_1fr)_auto] mi:@[640px]:items-center">
        <div class="mi:grid mi:gap-0.5">
          <MiText as="h3" variant="headline">Roll back to v2.13.4</MiText>
          <MiText variant="footnote" tone="label2">Restores the previous image on all 6 pods. Database migrations stay applied.</MiText>
        </div>
        <div class="mi:flex mi:flex-wrap mi:gap-2">
          <MiButton variant="destructive" size="small" disabled>Delete release</MiButton>
          <div
            class="mi:select-none mi:[-webkit-user-select:none] mi:inline-flex mi:touch-none""
            @pointerdown="startHold" @pointerup="cancelHold" @pointerleave="cancelHold" @pointercancel="cancelHold"
            @keydown.space.prevent="startHold" @keydown.enter.prevent="startHold" @keyup.space="cancelHold" @keyup.enter="cancelHold"
          >
            <MiButton variant="destructive" soft size="small" :disabled="!shipped" :aria-describedby="'rb-hold-hint'">
              <template #leading><MiIcon :svg="icons.undo" :size="16" /></template>
              <span class="mi:relative mi:inline-block">Hold to roll back<span class="mi:absolute mi:left-0 mi:right-0 mi:bottom-[-3px] mi:h-0.5 mi:rounded-[1px] mi:[background:currentColor] mi:origin-left" :class="holding ? 'mi:transform-[scaleX(1)] mi:[transition:transform_1500ms_linear]' : 'mi:transform-[scaleX(0)] mi:[transition:transform_180ms_var(--mi-ease)]'" aria-hidden="true" /></span>
            </MiButton>
          </div>
        </div>
        <MiText id="rb-hold-hint" variant="caption" tone="label3" class="mi:-mt-1.5! mi:@[640px]:col-span-full">
          {{ shipped ? 'Press and hold for 1.5 seconds.' : 'Available once the release is live.' }}
        </MiText>
      </div>

      <p class="mi:absolute mi:w-px mi:h-px mi:-m-px mi:overflow-hidden mi:[clip:rect(0_0_0_0)] mi:whitespace-nowrap" aria-live="polite">{{ announce }}</p>
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


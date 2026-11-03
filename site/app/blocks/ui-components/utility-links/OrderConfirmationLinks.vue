<template>
  <div class="ocl mi:@container mi:font-mi mi:text-label">
    <section class="ocl__card mi:grid mi:gap-4.5 mi:max-w-160 mi:mx-auto mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[600px]:py-7 mi:@[600px]:px-8" aria-labelledby="ocl-title">
      <a href="#" class="ocl__back mi:inline-flex mi:items-center mi:gap-0.5 mi:justify-self-start mi:text-[14px] mi:font-medium" @click.prevent>
        <MiIcon name="chevron-left" :size="16" />Continue shopping
      </a>

      <header class="ocl__head mi:flex mi:[align-items:flex-start] mi:gap-3.5">
        <span class="ocl__done mi:grid mi:place-items-center mi:flex-[none] mi:w-11 mi:h-11 mi:rounded-[50%] mi:[background:color-mix(in_srgb,_var(--mi-green)_18%,_transparent)] mi:text-green-t" aria-hidden="true"><MiIcon name="check" :size="22" :weight="2.4" /></span>
        <div class="ocl__headline mi:grid mi:gap-1 mi:min-w-0">
          <MiText id="ocl-title" variant="title2" as="h2" weight="bold">Order confirmed</MiText>
          <MiText variant="footnote" tone="label2">
            A receipt is on its way to <a href="#" class="ocl__inline mi:underline-offset-[3px] mi:wrap-anywhere" @click.prevent>m.dubois@fastmail.com</a>.
            Wrong address? <a href="#" class="ocl__inline mi:underline-offset-[3px] mi:wrap-anywhere" @click.prevent>Change it</a>.
          </MiText>
        </div>
      </header>

      <div class="ocl__order mi:flex mi:items-center mi:justify-between mi:gap-3 mi:py-3 mi:px-3.5 mi:rounded-md mi:bg-fill4">
        <div>
          <MiText variant="caption" tone="label2">Order number</MiText>
          <p class="ocl__num mi:mt-0.5 mi:mx-0 mi:mb-0 mi:text-[17px] mi:font-semibold mi:tracking-[.04em] mi:tabular-nums">TRL-58210-K</p>
        </div>
        <MiCopyButton value="TRL-58210-K" label="Copy" variant="outline" />
      </div>

      <!-- Next steps: each link names where it leads, and its glyph says how (page, file, calendar). -->
      <ul class="ocl__steps mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
        <li v-for="s in steps" :key="s.id">
          <a href="#" class="ocl__step mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:py-3 mi:px-1 mi:border-t mi:border-t-sep mi:[.ocl__steps_li:first-child_&]:[border-top:0]" :aria-describedby="`ocl-${s.id}`" @click.prevent="last = s.done">
            <span class="ocl__icon mi:grid mi:place-items-center mi:w-9 mi:h-9 mi:rounded-md mi:bg-p-tint mi:text-p-text" aria-hidden="true"><MiIcon :name="s.icon" :size="18" /></span>
            <span class="ocl__text mi:grid mi:min-w-0">
              <span class="ocl__label mi:text-[15px] mi:font-semibold">{{ s.label }}</span>
              <span :id="`ocl-${s.id}`" class="ocl__sub mi:text-[12px] mi:text-label2">{{ s.sub }}</span>
            </span>
            <MiIcon :name="s.glyph" :size="16" class="ocl__glyph mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)]" :class="'ocl__glyph--' + s.glyph" />
          </a>
        </li>
      </ul>
      <MiText variant="caption" tone="label3" aria-live="polite" class="ocl__status mi:min-h-[1em]">{{ last }}</MiText>

      <MiText variant="footnote" tone="label2">
        Need to change the delivery slot? <MiTextLink href="#" @click.prevent>Manage delivery</MiTextLink>
      </MiText>

      <footer class="ocl__foot mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2 mi:gap-x-4 mi:pt-3.5 mi:border-t mi:border-t-sep">
        <nav class="mi:[.ocl__foot_nav&]:flex-wrap mi:[.ocl__foot_nav&]:gap-y-1 mi:[.ocl__foot_nav&]:gap-x-3.5" aria-label="Store policies">
          <a v-for="l in policies" :key="l" href="#" class="ocl__foot-link mi:text-[12px]" @click.prevent>{{ l }}</a>
        </nav>
        <MiText class="mi:[.ocl__foot_nav&]:flex-wrap mi:[.ocl__foot_nav&]:gap-y-1 mi:[.ocl__foot_nav&]:gap-x-3.5" as="span" variant="caption2" tone="label3">Trailside Outfitters · SIRET 852 114 690</MiText>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type Icon = 'globe' | 'document' | 'calendar' | 'arrow-left' | 'chat' | 'arrow-right' | 'arrow-down' | 'chevron-right' | 'plus'
interface Step { id: string, label: string, sub: string, icon: Icon, glyph: Icon, done: string }

const steps: Step[] = [
  { id: 'track', label: 'Track your parcel', sub: 'Colissimo · arrives Thu 14 Nov', icon: 'globe', glyph: 'arrow-right', done: 'Opening the carrier tracking page…' },
  { id: 'invoice', label: 'Download invoice', sub: 'PDF · 84 KB, VAT included', icon: 'document', glyph: 'arrow-down', done: 'Invoice TRL-58210-K.pdf downloaded' },
  { id: 'calendar', label: 'Add delivery to calendar', sub: 'Thu 14 Nov, 08:00 – 13:00', icon: 'calendar', glyph: 'plus', done: 'Delivery window added to your calendar' },
  { id: 'returns', label: 'Start a return', sub: 'Free within 30 days', icon: 'arrow-left', glyph: 'chevron-right', done: 'Opening returns…' },
  { id: 'support', label: 'Ask about this order', sub: 'Replies in about 2 hours', icon: 'chat', glyph: 'chevron-right', done: 'Opening a chat with support…' }
]
const policies = ['Shipping', 'Returns', 'Warranty', 'Privacy']
const last = ref('')
</script>

<style scoped>
a { color: inherit; text-decoration: none; }
a:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; border-radius: var(--mi-radius-s); }

.ocl__back { color: var(--mi-p-text); }
.ocl__back :deep(svg) { transition: transform var(--mi-dur-2) var(--mi-ease); }
.ocl__back:hover :deep(svg) { transform: translateX(-3px); }
.ocl__inline { color: var(--mi-p-text); text-decoration: underline; text-decoration-color: color-mix(in srgb, var(--mi-p) 40%, transparent); }
.ocl__glyph { color: var(--mi-label3); }
/* Each glyph nudges toward its destination: forward, down into the file, or growing for an added event. */
.ocl__step:hover .ocl__glyph--arrow-right, .ocl__step:hover .ocl__glyph--chevron-right { transform: translateX(3px); }
.ocl__step:hover .ocl__glyph--arrow-down { transform: translateY(3px); }
.ocl__step:hover .ocl__glyph--plus { transform: scale(1.25); }
.ocl__status { margin-top: -10px; }
.ocl__foot nav { display: flex; }
.ocl__foot-link { color: var(--mi-label2); }
.ocl__foot-link:hover { color: var(--mi-label); }
</style>

<template>
  <div class="ocl">
    <section class="ocl__card" aria-labelledby="ocl-title">
      <a href="#" class="ocl__back" @click.prevent>
        <MiIcon name="chevron-left" :size="16" />Continue shopping
      </a>

      <header class="ocl__head">
        <span class="ocl__done" aria-hidden="true"><MiIcon name="check" :size="22" :weight="2.4" /></span>
        <div class="ocl__headline">
          <MiText id="ocl-title" variant="title2" as="h2" weight="bold">Order confirmed</MiText>
          <MiText variant="footnote" tone="label2">
            A receipt is on its way to <a href="#" class="ocl__inline" @click.prevent>m.dubois@fastmail.com</a>.
            Wrong address? <a href="#" class="ocl__inline" @click.prevent>Change it</a>.
          </MiText>
        </div>
      </header>

      <div class="ocl__order">
        <div>
          <MiText variant="caption" tone="label2">Order number</MiText>
          <p class="ocl__num">TRL-58210-K</p>
        </div>
        <MiCopyButton value="TRL-58210-K" label="Copy" variant="outline" />
      </div>

      <!-- Next steps: each link names where it leads, and its glyph says how (page, file, calendar). -->
      <ul class="ocl__steps">
        <li v-for="s in steps" :key="s.id">
          <a href="#" class="ocl__step" :aria-describedby="`ocl-${s.id}`" @click.prevent="last = s.done">
            <span class="ocl__icon" aria-hidden="true"><MiIcon :name="s.icon" :size="18" /></span>
            <span class="ocl__text">
              <span class="ocl__label">{{ s.label }}</span>
              <span :id="`ocl-${s.id}`" class="ocl__sub">{{ s.sub }}</span>
            </span>
            <MiIcon :name="s.glyph" :size="16" class="ocl__glyph" :class="'ocl__glyph--' + s.glyph" />
          </a>
        </li>
      </ul>
      <MiText variant="caption" tone="label3" aria-live="polite" class="ocl__status">{{ last }}</MiText>

      <MiText variant="footnote" tone="label2">
        Need to change the delivery slot? <MiTextLink href="#" @click.prevent>Manage delivery</MiTextLink>
      </MiText>

      <footer class="ocl__foot">
        <nav aria-label="Store policies">
          <a v-for="l in policies" :key="l" href="#" class="ocl__foot-link" @click.prevent>{{ l }}</a>
        </nav>
        <MiText as="span" variant="caption2" tone="label3">Trailside Outfitters · SIRET 852 114 690</MiText>
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
.ocl { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.ocl__card { display: grid; gap: 18px; max-width: 640px; margin-inline: auto; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }

a { color: inherit; text-decoration: none; }
a:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; border-radius: var(--mi-radius-s); }

.ocl__back { display: inline-flex; align-items: center; gap: 2px; justify-self: start; font-size: 14px; font-weight: 500; color: var(--mi-p-text); }
.ocl__back :deep(svg) { transition: transform var(--mi-dur-2) var(--mi-ease); }
.ocl__back:hover :deep(svg) { transform: translateX(-3px); }

.ocl__head { display: flex; align-items: flex-start; gap: 14px; }
.ocl__done { display: grid; place-items: center; flex: none; width: 44px; height: 44px; border-radius: 50%; background: color-mix(in srgb, var(--mi-green) 18%, transparent); color: var(--mi-green-t); }
.ocl__headline { display: grid; gap: 4px; min-width: 0; }
.ocl__inline { color: var(--mi-p-text); text-decoration: underline; text-decoration-color: color-mix(in srgb, var(--mi-p) 40%, transparent); text-underline-offset: 3px; overflow-wrap: anywhere; }

.ocl__order { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.ocl__num { margin: 2px 0 0; font-size: 17px; font-weight: 600; letter-spacing: .04em; font-variant-numeric: tabular-nums; }

.ocl__steps { display: grid; margin: 0; padding: 0; list-style: none; }
.ocl__step { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 12px 4px; border-top: 1px solid var(--mi-sep); }
.ocl__steps li:first-child .ocl__step { border-top: 0; }
.ocl__icon { display: grid; place-items: center; width: 36px; height: 36px; border-radius: var(--mi-radius-m); background: var(--mi-p-tint); color: var(--mi-p-text); }
.ocl__text { display: grid; min-width: 0; }
.ocl__label { font-size: 15px; font-weight: 600; }
.ocl__sub { font-size: 12px; color: var(--mi-label2); }
.ocl__glyph { color: var(--mi-label3); transition: transform var(--mi-dur-2) var(--mi-spring); }
/* Each glyph nudges toward its destination: forward, down into the file, or growing for an added event. */
.ocl__step:hover .ocl__glyph--arrow-right, .ocl__step:hover .ocl__glyph--chevron-right { transform: translateX(3px); }
.ocl__step:hover .ocl__glyph--arrow-down { transform: translateY(3px); }
.ocl__step:hover .ocl__glyph--plus { transform: scale(1.25); }
.ocl__status { min-height: 1em; margin-top: -10px; }

.ocl__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px; padding-top: 14px; border-top: 1px solid var(--mi-sep); }
.ocl__foot nav { display: flex; flex-wrap: wrap; gap: 4px 14px; }
.ocl__foot-link { font-size: 12px; color: var(--mi-label2); }
.ocl__foot-link:hover { color: var(--mi-label); }

@container (min-width: 600px) {
  .ocl__card { padding: 28px 32px; }
}
</style>

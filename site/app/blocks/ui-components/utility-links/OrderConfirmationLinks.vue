<template>
  <div class="mi:@container mi:font-mi mi:text-label">
    <section class="mi:grid mi:gap-4.5 mi:max-w-160 mi:mx-auto mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[600px]:py-7 mi:@[600px]:px-8" aria-labelledby="ocl-title">
      <a href="#" class="mi:inline-flex mi:items-center mi:gap-0.5 mi:justify-self-start mi:text-[14px] mi:font-medium mi:text-p-text mi:[text-decoration:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-sm mi:[&_svg]:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:[&_svg]:transform-[translateX(-3px)]" @click.prevent>
        <MiIcon name="chevron-left" :size="16" />Continue shopping
      </a>

      <header class="mi:flex mi:[align-items:flex-start] mi:gap-3.5">
        <span class="mi:grid mi:place-items-center mi:flex-[none] mi:w-11 mi:h-11 mi:rounded-[50%] mi:[background:color-mix(in_srgb,_var(--mi-green)_18%,_transparent)] mi:text-green-t" aria-hidden="true"><MiIcon name="check" :size="22" :weight="2.4" /></span>
        <div class="mi:grid mi:gap-1 mi:min-w-0">
          <MiText id="ocl-title" variant="title2" as="h2" weight="bold">Order confirmed</MiText>
          <MiText variant="footnote" tone="label2">
            A receipt is on its way to <a href="#" class="mi:underline-offset-[3px] mi:wrap-anywhere mi:text-p-text mi:underline mi:decoration-p/40 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-sm" @click.prevent>m.dubois@fastmail.com</a>.
            Wrong address? <a href="#" class="mi:underline-offset-[3px] mi:wrap-anywhere mi:text-p-text mi:underline mi:decoration-p/40 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-sm" @click.prevent>Change it</a>.
          </MiText>
        </div>
      </header>

      <div class="mi:flex mi:items-center mi:justify-between mi:gap-3 mi:py-3 mi:px-3.5 mi:rounded-md mi:bg-fill4">
        <div>
          <MiText variant="caption" tone="label2">Order number</MiText>
          <p class="mi:mt-0.5 mi:mx-0 mi:mb-0 mi:text-[17px] mi:font-semibold mi:tracking-[.04em] mi:tabular-nums">TRL-58210-K</p>
        </div>
        <MiCopyButton value="TRL-58210-K" label="Copy" variant="outline" />
      </div>

      <!-- Next steps: each link names where it leads, and its glyph says how (page, file, calendar). -->
      <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
        <li v-for="s in steps" :key="s.id">
          <a href="#" class="mi:group mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:py-3 mi:px-1 mi:border-t mi:border-t-sep mi:[li:first-child_&]:[border-top:0] mi:text-inherit mi:[text-decoration:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-sm" :aria-describedby="`ocl-${s.id}`" @click.prevent="last = s.done">
            <span class="mi:grid mi:place-items-center mi:w-9 mi:h-9 mi:rounded-md mi:bg-p-tint mi:text-p-text" aria-hidden="true"><MiIcon :name="s.icon" :size="18" /></span>
            <span class="mi:grid mi:min-w-0">
              <span class="mi:text-[15px] mi:font-semibold">{{ s.label }}</span>
              <span :id="`ocl-${s.id}`" class="mi:text-[12px] mi:text-label2">{{ s.sub }}</span>
            </span>
            <MiIcon :name="s.glyph" :size="16" class="mi:text-label3! mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)]" :class="s.glyph === 'arrow-down' ? 'mi:group-hover:transform-[translateY(3px)]' : s.glyph === 'plus' ? 'mi:group-hover:transform-[scale(1.25)]' : s.glyph === 'arrow-right' ? 'mi:group-hover:transform-[translateX(3px)]' : 'mi:group-hover:transform-[translateX(3px)]'" />
          </a>
        </li>
      </ul>
      <MiText variant="caption" tone="label3" aria-live="polite" class="mi:min-h-[1em] mi:-mt-2.5!">{{ last }}</MiText>

      <MiText variant="footnote" tone="label2">
        Need to change the delivery slot? <MiTextLink href="#" @click.prevent>Manage delivery</MiTextLink>
      </MiText>

      <footer class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2 mi:gap-x-4 mi:pt-3.5 mi:border-t mi:border-t-sep">
        <nav class="mi:flex mi:flex-wrap mi:gap-y-1 mi:gap-x-3.5" aria-label="Store policies">
          <a v-for="l in policies" :key="l" href="#" class="mi:text-[12px] mi:text-label2 mi:hover:text-label mi:[text-decoration:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-sm" @click.prevent>{{ l }}</a>
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

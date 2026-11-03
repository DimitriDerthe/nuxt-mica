<template>
  <div class="eif-cq mi:@container">
    <section class="eif mi:grid mi:gap-5 mi:max-w-220 mi:mx-auto mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:font-mi mi:text-label mi:@[640px]:py-6 mi:@[640px]:px-7" aria-labelledby="eif-title">
      <header class="eif__bar mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2 mi:pb-3.5 mi:border-b mi:border-b-sep">
        <div class="eif__bar-title mi:flex mi:items-center mi:gap-2">
          <MiText id="eif-title" variant="headline" as="h2">Support inbox</MiText>
          <MiBadge :count="conversations.length" show-zero tone="neutral" count-noun="conversations" />
        </div>
        <MiText variant="caption" tone="label2">{{ connected.length }} of 3 channels connected</MiText>
      </header>

      <!-- Once a channel delivers, the empty state steps aside for the real list. -->
      <ul v-if="conversations.length" class="eif__list mi:[list-style:none] mi:m-0 mi:p-0 mi:grid" aria-label="Conversations">
        <li v-for="c in conversations" :key="c.id" class="eif__row mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:py-3 mi:px-1 mi:[.eif__row+&]:border-t mi:[.eif__row+&]:border-t-sep">
          <MiAvatar :name="c.from" size="sm" tone="auto" decorative />
          <div class="eif__row-body mi:grid mi:min-w-0">
            <div class="eif__row-top mi:flex mi:justify-between mi:gap-2">
              <MiText variant="subheadline" weight="semibold" :lines="1">{{ c.from }}</MiText>
              <MiText variant="caption2" tone="label3">{{ c.time }}</MiText>
            </div>
            <MiText variant="footnote" tone="label2" :lines="1">{{ c.subject }}</MiText>
          </div>
          <MiBadge :label="c.via" tone="primary" />
        </li>
      </ul>

      <div v-else class="eif__empty mi:grid mi:justify-items-center mi:gap-2 mi:py-2 mi:px-0">
        <!-- Token-drawn artwork: three fanned envelopes waiting on a soft halo. -->
        <div class="eif__art mi:relative mi:w-45 mi:h-30 mi:mb-2" aria-hidden="true">
          <span class="eif__halo mi:absolute mi:inset-y-[-10%] mi:inset-x-[5%] mi:rounded-[50%] mi:[background:radial-gradient(closest-side,_var(--mi-p-tint),_transparent)]" />
          <span class="eif__env eif__env--l mi:absolute mi:left-1/2 mi:top-5.5 mi:w-26 mi:h-18 mi:-ml-13 mi:rounded-[12px] mi:[background:var(--mi-elev)] mi:shadow-2 mi:border mi:border-sep mi:transform-[translate(-34px,_10px)_rotate(-12deg)] mi:[background:var(--mi-fill3)] mi:shadow-none" />
          <span class="eif__env eif__env--r mi:absolute mi:left-1/2 mi:top-5.5 mi:w-26 mi:h-18 mi:-ml-13 mi:rounded-[12px] mi:[background:var(--mi-elev)] mi:shadow-2 mi:border mi:border-sep mi:transform-[translate(34px,_10px)_rotate(12deg)] mi:[background:var(--mi-fill3)] mi:shadow-none" />
          <span class="eif__env eif__env--c mi:absolute mi:left-1/2 mi:top-5.5 mi:w-26 mi:h-18 mi:-ml-13 mi:rounded-[12px] mi:[background:var(--mi-elev)] mi:shadow-2 mi:border mi:border-sep mi:grid mi:content-center mi:gap-[7px] mi:py-0 mi:px-4.5"><i class="mi:[.eif__env--c_&]:block mi:[.eif__env--c_&]:h-[7px] mi:[.eif__env--c_&]:rounded-[4px] mi:[.eif__env--c_&]:[background:var(--mi-fill2)] mi:[.eif__env--c_&:first-child]:w-[70%] mi:[.eif__env--c_&:first-child]:[background:var(--mi-p)] mi:[.eif__env--c_&:first-child]:opacity-70" /><i class="mi:[.eif__env--c_&]:block mi:[.eif__env--c_&]:h-[7px] mi:[.eif__env--c_&]:rounded-[4px] mi:[.eif__env--c_&]:[background:var(--mi-fill2)] mi:[.eif__env--c_&:first-child]:w-[70%] mi:[.eif__env--c_&:first-child]:[background:var(--mi-p)] mi:[.eif__env--c_&:first-child]:opacity-70" /></span>
          <span class="eif__ping mi:absolute mi:right-7.5 mi:top-3.5 mi:w-3.5 mi:h-3.5 mi:rounded-[50%] mi:[background:var(--mi-s)] mi:shadow-[0_0_0_3px_var(--mi-card)]" />
        </div>
        <MiText variant="title3" as="h3" weight="semibold" align="center" balance>
          Your inbox is ready for its first conversation
        </MiText>
        <MiText variant="footnote" tone="label2" align="center" class="eif__lead mi:max-w-[46ch]">
          Connect one channel to start. Customers will never see this screen; they just write to you.
        </MiText>
      </div>

      <div class="eif__paths mi:grid mi:gap-2 mi:@[620px]:grid-cols-3" role="group" aria-label="Ways to start">
        <button
          v-for="p in paths" :key="p.id" type="button" class="eif__path mi:relative mi:flex mi:[align-items:flex-start] mi:gap-3 mi:p-3.5 mi:text-start mi:border mi:border-sep mi:rounded-lg mi:[background:transparent] mi:text-inherit mi:[font:inherit] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:active:transform-[scale(.985)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:aria-pressed:border-p"
          :aria-pressed="path === p.id" @click="path = p.id"
        >
          <span class="eif__path-icon mi:grid mi:place-items-center mi:flex-[none] mi:w-8.5 mi:h-8.5 mi:rounded-md mi:[background:var(--mi-p-tint)] mi:text-p-text"><MiIcon :svg="p.glyph" :size="18" /></span>
          <span class="eif__path-text mi:grid mi:gap-0.5 mi:min-w-0 mi:text-[13px] mi:text-label2">
            <strong class="mi:[.eif__path-text_&]:text-[15px] mi:[.eif__path-text_&]:font-semibold mi:[.eif__path-text_&]:text-label">{{ p.title }}</strong>
            <span>{{ p.blurb }}</span>
          </span>
          <MiIcon v-if="connected.includes(p.id)" name="check-circle-fill" :size="18" class="eif__done mi:absolute mi:top-2.5 mi:right-2.5 mi:text-green" label="Connected" />
        </button>
      </div>

      <div class="eif__step mi:grid mi:gap-2 mi:p-4 mi:rounded-lg mi:[background:var(--mi-fill4)]" aria-live="polite">
        <template v-if="path === 'email'">
          <MiText variant="subheadline" weight="semibold" as="h4">Forward your support address</MiText>
          <MiText variant="footnote" tone="label2">Add a forwarding rule from help@northwind.studio to this address, then send a test.</MiText>
          <div class="eif__code mi:flex mi:items-center mi:gap-2 mi:min-w-0 mi:pt-1.5 mi:pr-1.5 mi:pb-1.5 mi:pl-3 mi:rounded-md mi:[background:var(--mi-card)] mi:border mi:border-sep">
            <code class="mi:[.eif__code_code&]:min-w-0 mi:[.eif__code_code&]:[scrollbar-width:none]">northwind-7f3k@in.relaymail.io</code>
            <MiCopyButton class="mi:[.eif__code_code&]:min-w-0 mi:[.eif__code_code&]:[scrollbar-width:none]" value="northwind-7f3k@in.relaymail.io" variant="ghost" icon-only label="Copy forwarding address" />
          </div>
        </template>
        <template v-else-if="path === 'widget'">
          <MiText variant="subheadline" weight="semibold" as="h4">Add the chat widget</MiText>
          <MiText variant="footnote" tone="label2">Paste this before the closing body tag. It loads in 9 kB and waits for the page to be idle.</MiText>
          <div class="eif__code mi:flex mi:items-center mi:gap-2 mi:min-w-0 mi:pt-1.5 mi:pr-1.5 mi:pb-1.5 mi:pl-3 mi:rounded-md mi:[background:var(--mi-card)] mi:border mi:border-sep">
            <code class="mi:[.eif__code_code&]:min-w-0 mi:[.eif__code_code&]:[scrollbar-width:none]">&lt;script src="https://cdn.relaymail.io/w.js" data-inbox="7f3k" defer&gt;&lt;/script&gt;</code>
            <MiCopyButton class="mi:[.eif__code_code&]:min-w-0 mi:[.eif__code_code&]:[scrollbar-width:none]" :value="snippet" variant="ghost" icon-only label="Copy snippet" />
          </div>
        </template>
        <template v-else>
          <MiText variant="subheadline" weight="semibold" as="h4">Bring your history</MiText>
          <MiText variant="footnote" tone="label2">Import a CSV export of past tickets. Threads, tags and customer names are kept; up to 50,000 rows.</MiText>
        </template>

        <div class="eif__actions mi:flex mi:flex-wrap mi:items-center mi:gap-y-2.5 mi:gap-x-3.5 mi:mt-1.5">
          <MiButton :loading="waiting" :disabled="connected.includes(path)" @click="connect">
            {{ connected.includes(path) ? 'Connected' : current.action }}
          </MiButton>
          <MiText v-if="waiting" variant="caption" tone="label2">{{ current.waiting }}</MiText>
          <MiButton v-if="conversations.length" variant="plain" size="small" @click="reset">Reset demo</MiButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

type PathId = 'email' | 'widget' | 'import'
interface Conversation { id: number, from: string, subject: string, time: string, via: string }

const snippet = '<script src="https://cdn.relaymail.io/w.js" data-inbox="7f3k" defer><\/script>'

const paths = [
  { id: 'email' as const, title: 'Forward email', blurb: 'Keep your address, route it here', action: 'Send a test email', waiting: 'Waiting for the test to land…', glyph: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>' },
  { id: 'widget' as const, title: 'Chat widget', blurb: 'Live chat on your site in one line', action: 'Open a preview chat', waiting: 'Starting a preview chat…', glyph: '<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>' },
  { id: 'import' as const, title: 'Import history', blurb: 'Bring past tickets from a CSV', action: 'Import sample CSV', waiting: 'Reading 1,284 rows…', glyph: '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/>' }
]

// What each channel delivers once connected; sample data.
const arrivals: Record<PathId, Conversation[]> = {
  email: [{ id: 1, from: 'You (test)', subject: 'Test: is this thing on?', time: 'Just now', via: 'Email' }],
  widget: [{ id: 2, from: 'Visitor from Lyon', subject: 'Do you ship the oak desk to Belgium?', time: 'Just now', via: 'Chat' }],
  import: [
    { id: 3, from: 'Hana Okafor', subject: 'Invoice 2291 shows the wrong VAT number', time: 'Oct 30', via: 'Import' },
    { id: 4, from: 'Teodor Brandt', subject: 'Replacement hinge for the Linden cabinet', time: 'Oct 29', via: 'Import' }
  ]
}

const path = ref<PathId>('email')
const connected = ref<PathId[]>([])
const conversations = ref<Conversation[]>([])
const waiting = ref(false)
const current = computed(() => paths.find(p => p.id === path.value)!)
let timer: ReturnType<typeof setTimeout> | undefined

function connect() {
  waiting.value = true
  const id = path.value
  timer = setTimeout(() => {
    waiting.value = false
    connected.value = [...connected.value, id]
    conversations.value = [...arrivals[id], ...conversations.value]
  }, 1400)
}

function reset() {
  clearTimeout(timer)
  waiting.value = false
  connected.value = []
  conversations.value = []
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.eif__env--c { animation: eif-bob 4.8s var(--mi-ease-in-out) infinite; }
@keyframes eif-bob { 50% { transform: translateY(-6px); } }
@media (prefers-reduced-motion: reduce) { .eif__env--c { animation: none; } }
.eif__row { animation: eif-in var(--mi-dur-4) var(--mi-spring) both; }
@keyframes eif-in { from { opacity: 0; transform: translateY(8px); } }
.eif__path:hover { background: var(--mi-fill4); }
.eif__path[aria-pressed="true"] { background: color-mix(in srgb, var(--mi-p) 6%, transparent); }
.eif__code code { flex: 1; overflow-x: auto; white-space: nowrap; font-size: 13px; }
</style>

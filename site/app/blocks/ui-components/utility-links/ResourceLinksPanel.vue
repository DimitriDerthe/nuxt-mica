<template>
  <div class="rl-cq mi:@container">
    <section class="rl mi:grid mi:gap-4.5 mi:font-mi mi:text-label mi:@[760px]:grid-cols-[minmax(0,_1fr)_minmax(320px,_400px)] mi:@[760px]:gap-x-10 mi:@[760px]:items-start" aria-labelledby="rl-title">
      <div class="rl__intro mi:grid mi:justify-items-start mi:gap-2.5 mi:py-1 mi:px-0.5 mi:@[760px]:pt-3">
        <a href="#developers" class="rl__back mi:inline-flex mi:items-center mi:gap-0.5 mi:-ml-1 mi:pt-1 mi:pr-2 mi:pb-1 mi:pl-1 mi:rounded-[8px] mi:text-[14px] mi:font-medium mi:text-label2 mi:[text-decoration:none] mi:hover:text-label mi:hover:bg-fill4 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click.prevent>
          <MiIcon name="chevron-left" :size="16" :weight="2.2" /> Developers
        </a>
        <MiText id="rl-title" variant="title2" as="h2" weight="bold">API keys</MiText>
        <MiText variant="callout" tone="label2" class="rl__lead mi:max-w-[52ch]">
          Keys are scoped to one environment and inherit the role of the person who made them.
          Before revoking one, read the <MiTextLink href="#rotation" :chevron="false">rotation guide</MiTextLink> so live traffic keeps flowing.
        </MiText>
        <MiTextLink href="#keys">View all 14 keys</MiTextLink>
      </div>

      <!-- Each link says where it leads: the trailing glyph moves toward its destination on hover. -->
      <nav class="rl__panel mi:grid mi:gap-2 mi:p-2 mi:rounded-xl mi:bg-card mi:shadow-1" aria-labelledby="rl-res">
        <MiText id="rl-res" variant="caption" tone="label2" weight="semibold" as="h3" class="rl__cap mi:pt-2 mi:px-2.5 mi:pb-0.5">Resources</MiText>
        <ul class="rl__list mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="l in links" :key="l.label">
            <a
              :href="l.href" class="rl__link mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:min-h-14 mi:py-2 mi:px-2.5 mi:rounded-md mi:text-inherit mi:[text-decoration:none] mi:hover:bg-fill4 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :class="'rl__link--' + l.kind" :target="l.kind === 'external' ? '_blank' : undefined"
              :rel="l.kind === 'external' ? 'noopener' : undefined" :download="l.kind === 'download' ? l.file : undefined" @click.prevent
            >
              <span class="rl__icon mi:grid mi:place-items-center mi:w-9 mi:h-9 mi:rounded-[10px] mi:text-label2 mi:bg-fill4" aria-hidden="true"><MiIcon :svg="l.icon" :size="18" /></span>
              <span class="rl__text mi:grid mi:min-w-0">
                <span class="rl__label mi:text-[15px] mi:font-medium">{{ l.label }}</span>
                <span class="rl__meta mi:overflow-hidden mi:text-[12px] mi:text-label3 mi:whitespace-nowrap mi:text-ellipsis">{{ l.meta }}</span>
              </span>
              <span class="rl__go mi:grid mi:place-items-center mi:w-7 mi:h-7 mi:rounded-[50%] mi:text-label3 mi:[.rl__link:hover_&]:text-p-text" aria-hidden="true"><MiIcon :svg="go[l.kind]" :size="16" :weight="2.1" /></span>
              <span v-if="l.kind === 'external'" class="rl__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip:rect(0_0_0_0)] mi:whitespace-nowrap">(opens in a new tab)</span>
            </a>
          </li>
          <li class="rl__row mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:min-h-14 mi:py-2 mi:px-2.5 mi:rounded-md mi:text-inherit mi:[text-decoration:none]">
            <span class="rl__icon mi:grid mi:place-items-center mi:w-9 mi:h-9 mi:rounded-[10px] mi:text-label2 mi:bg-fill4" aria-hidden="true"><MiIcon :svg="icons.link" :size="18" /></span>
            <span class="rl__text mi:grid mi:min-w-0">
              <span class="rl__label mi:text-[15px] mi:font-medium">Base URL</span>
              <span class="rl__meta rl__mono mi:overflow-hidden mi:text-[12px] mi:text-label3 mi:whitespace-nowrap mi:text-ellipsis mi:font-[ui-monospace,_'SF_Mono',_Menlo,_monospace]">{{ baseUrl }}</span>
            </span>
            <MiCopyButton :value="baseUrl" label="Copy" copied-label="Copied" variant="ghost" icon-only />
          </li>
          <li class="rl__row mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:min-h-14 mi:py-2 mi:px-2.5 mi:rounded-md mi:text-inherit mi:[text-decoration:none]">
            <span class="rl__icon mi:grid mi:place-items-center mi:w-9 mi:h-9 mi:rounded-[10px] mi:text-label2 mi:bg-fill4" aria-hidden="true"><MiIcon name="search" :size="18" /></span>
            <span class="rl__text mi:grid mi:min-w-0">
              <span class="rl__label mi:text-[15px] mi:font-medium">Jump to any setting</span>
              <span class="rl__meta mi:overflow-hidden mi:text-[12px] mi:text-label3 mi:whitespace-nowrap mi:text-ellipsis">Command palette</span>
            </span>
            <MiKbdGroup><MiKbd>⌘</MiKbd><MiKbd>K</MiKbd></MiKbdGroup>
          </li>
        </ul>

        <a href="#leak" class="rl__alert mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:flex mi:items-center mi:gap-2 mi:mt-1 mi:mx-0.5 mi:mb-0.5 mi:py-2.5 mi:px-3 mi:rounded-md mi:text-[13px] mi:text-red-t mi:[text-decoration:none] mi:[background:color-mix(in_srgb,_var(--mi-red)_8%,_transparent)]" @click.prevent>
          <MiIcon name="warning" :size="16" />
          <span>Think a key leaked? <strong>Revoke it now</strong></span>
          <MiIcon name="chevron-right" :size="14" :weight="2.2" class="rl__alert-go mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" />
        </a>
      </nav>

      <footer class="rl__foot mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2.5 mi:gap-x-4 mi:py-1 mi:px-0.5 mi:@[760px]:col-span-full mi:@[760px]:pt-3.5 mi:@[760px]:border-t mi:@[760px]:border-t-sep">
        <nav class="mi:[.rl__foot_&]:flex mi:[.rl__foot_&]:flex-wrap mi:[.rl__foot_&]:gap-y-1 mi:[.rl__foot_&]:gap-x-0" aria-label="Platform links">
          <a v-for="f in footer" :key="f" :href="'#' + f.toLowerCase()" class="rl__foot-link mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:py-0.5 mi:px-0 mi:text-[13px] mi:text-label2 mi:[text-decoration:none] mi:[.rl__foot-link+&]:before:content-['·'] mi:[.rl__foot-link+&]:before:my-0 mi:[.rl__foot-link+&]:before:mx-2.5 mi:[.rl__foot-link+&]:before:text-label3 mi:hover:text-label mi:hover:[text-decoration:underline] mi:hover:underline-offset-[3px]" @click.prevent>{{ f }}</a>
        </nav>
        <span class="rl__status mi:inline-flex mi:items-center mi:gap-1.5 mi:text-[12px] mi:text-label2"><i class="mi:[.rl__status_&]:w-[7px] mi:[.rl__status_&]:h-[7px] mi:[.rl__status_&]:rounded-[50%] mi:[.rl__status_&]:bg-green" aria-hidden="true" /> All systems normal</span>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
type Kind = 'external' | 'download' | 'internal'

const baseUrl = 'https://api.tidewater.dev/v3'
const icons = {
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  webhook: '<circle cx="12" cy="6" r="2.5"/><circle cx="5.5" cy="17" r="2.5"/><circle cx="18.5" cy="17" r="2.5"/><path d="m11 8.3-4.3 6.5M8 17h8M13 8.3l4.2 6.5"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
}
const go: Record<Kind, string> = {
  external: '<path d="M8 16 16 8M9 8h7v7"/>',
  download: '<path d="M12 5v12M7 12l5 5 5-5"/>',
  internal: '<path d="M5 12h13M13 7l5 5-5 5"/>'
}

const links: { label: string, meta: string, href: string, kind: Kind, icon: string, file?: string }[] = [
  { label: 'API reference', meta: 'docs.tidewater.dev', href: 'https://docs.tidewater.dev', kind: 'external', icon: icons.book },
  { label: 'Postman collection', meta: 'JSON · 48 KB', href: '#postman', kind: 'download', icon: icons.box, file: 'tidewater-v3.postman.json' },
  { label: 'Webhook signing secrets', meta: 'Settings › Webhooks', href: '#webhooks', kind: 'internal', icon: icons.webhook }
]
const footer = ['Status', 'Changelog', 'Security', 'Terms']
</script>

<style scoped>
.rl__back :deep(svg) { transition: transform var(--mi-dur-2) var(--mi-ease); }
.rl__back:hover :deep(svg) { transform: translateX(-3px); }
.rl__go :deep(svg) { transition: transform var(--mi-dur-2) var(--mi-spring); }
.rl__link--external:hover .rl__go :deep(svg) { transform: translate(2px, -2px); }
.rl__link--download:hover .rl__go :deep(svg) { transform: translateY(2px); }
.rl__link--internal:hover .rl__go :deep(svg) { transform: translateX(3px); }
.rl__alert span { flex: 1; }
.rl__alert:hover .rl__alert-go { transform: translateX(3px); }
</style>

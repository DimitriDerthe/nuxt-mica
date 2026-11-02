<template>
  <div class="rl-cq">
    <section class="rl" aria-labelledby="rl-title">
      <div class="rl__intro">
        <a href="#developers" class="rl__back" @click.prevent>
          <MiIcon name="chevron-left" :size="16" :weight="2.2" /> Developers
        </a>
        <MiText id="rl-title" variant="title2" as="h2" weight="bold">API keys</MiText>
        <MiText variant="callout" tone="label2" class="rl__lead">
          Keys are scoped to one environment and inherit the role of the person who made them.
          Before revoking one, read the <MiTextLink href="#rotation" :chevron="false">rotation guide</MiTextLink> so live traffic keeps flowing.
        </MiText>
        <MiTextLink href="#keys">View all 14 keys</MiTextLink>
      </div>

      <!-- Each link says where it leads: the trailing glyph moves toward its destination on hover. -->
      <nav class="rl__panel" aria-labelledby="rl-res">
        <MiText id="rl-res" variant="caption" tone="label2" weight="semibold" as="h3" class="rl__cap">Resources</MiText>
        <ul class="rl__list">
          <li v-for="l in links" :key="l.label">
            <a
              :href="l.href" class="rl__link" :class="'rl__link--' + l.kind" :target="l.kind === 'external' ? '_blank' : undefined"
              :rel="l.kind === 'external' ? 'noopener' : undefined" :download="l.kind === 'download' ? l.file : undefined" @click.prevent
            >
              <span class="rl__icon" aria-hidden="true"><MiIcon :svg="l.icon" :size="18" /></span>
              <span class="rl__text">
                <span class="rl__label">{{ l.label }}</span>
                <span class="rl__meta">{{ l.meta }}</span>
              </span>
              <span class="rl__go" aria-hidden="true"><MiIcon :svg="go[l.kind]" :size="16" :weight="2.1" /></span>
              <span v-if="l.kind === 'external'" class="rl__sr">(opens in a new tab)</span>
            </a>
          </li>
          <li class="rl__row">
            <span class="rl__icon" aria-hidden="true"><MiIcon :svg="icons.link" :size="18" /></span>
            <span class="rl__text">
              <span class="rl__label">Base URL</span>
              <span class="rl__meta rl__mono">{{ baseUrl }}</span>
            </span>
            <MiCopyButton :value="baseUrl" label="Copy" copied-label="Copied" variant="ghost" icon-only />
          </li>
          <li class="rl__row">
            <span class="rl__icon" aria-hidden="true"><MiIcon name="search" :size="18" /></span>
            <span class="rl__text">
              <span class="rl__label">Jump to any setting</span>
              <span class="rl__meta">Command palette</span>
            </span>
            <MiKbdGroup><MiKbd>⌘</MiKbd><MiKbd>K</MiKbd></MiKbdGroup>
          </li>
        </ul>

        <a href="#leak" class="rl__alert" @click.prevent>
          <MiIcon name="warning" :size="16" />
          <span>Think a key leaked? <strong>Revoke it now</strong></span>
          <MiIcon name="chevron-right" :size="14" :weight="2.2" class="rl__alert-go" />
        </a>
      </nav>

      <footer class="rl__foot">
        <nav aria-label="Platform links">
          <a v-for="f in footer" :key="f" :href="'#' + f.toLowerCase()" class="rl__foot-link" @click.prevent>{{ f }}</a>
        </nav>
        <span class="rl__status"><i aria-hidden="true" /> All systems normal</span>
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
.rl-cq { container-type: inline-size; }
.rl { display: grid; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }

.rl__intro { display: grid; justify-items: start; gap: 10px; padding: 4px 2px; }
.rl__back {
  display: inline-flex; align-items: center; gap: 2px; margin-left: -4px; padding: 4px 8px 4px 4px; border-radius: 8px;
  font-size: 14px; font-weight: 500; color: var(--mi-label2); text-decoration: none;
}
.rl__back:hover { color: var(--mi-label); background: var(--mi-fill4); }
.rl__back :deep(svg) { transition: transform var(--mi-dur-2) var(--mi-ease); }
.rl__back:hover :deep(svg) { transform: translateX(-3px); }
.rl__lead { max-width: 52ch; }

.rl__panel { display: grid; gap: 8px; padding: 8px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.rl__cap { padding: 8px 10px 2px; }
.rl__list { display: grid; margin: 0; padding: 0; list-style: none; }
.rl__link, .rl__row {
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; min-height: 56px; padding: 8px 10px;
  border-radius: var(--mi-radius-m); color: inherit; text-decoration: none;
}
.rl__link:hover { background: var(--mi-fill4); }
.rl__link:focus-visible, .rl__back:focus-visible, .rl__alert:focus-visible, .rl__foot-link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.rl__icon { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px; color: var(--mi-label2); background: var(--mi-fill4); }
.rl__text { display: grid; min-width: 0; }
.rl__label { font-size: 15px; font-weight: 500; }
.rl__meta { overflow: hidden; font-size: 12px; color: var(--mi-label3); white-space: nowrap; text-overflow: ellipsis; }
.rl__mono { font-family: ui-monospace, "SF Mono", Menlo, monospace; }
.rl__go { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; color: var(--mi-label3); }
.rl__go :deep(svg) { transition: transform var(--mi-dur-2) var(--mi-spring); }
.rl__link:hover .rl__go { color: var(--mi-p-text); }
.rl__link--external:hover .rl__go :deep(svg) { transform: translate(2px, -2px); }
.rl__link--download:hover .rl__go :deep(svg) { transform: translateY(2px); }
.rl__link--internal:hover .rl__go :deep(svg) { transform: translateX(3px); }

.rl__alert {
  display: flex; align-items: center; gap: 8px; margin: 4px 2px 2px; padding: 10px 12px; border-radius: var(--mi-radius-m);
  font-size: 13px; color: var(--mi-red-t); text-decoration: none; background: color-mix(in srgb, var(--mi-red) 8%, transparent);
}
.rl__alert span { flex: 1; }
.rl__alert-go { transition: transform var(--mi-dur-2) var(--mi-ease); }
.rl__alert:hover .rl__alert-go { transform: translateX(3px); }

.rl__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 16px; padding: 4px 2px; }
.rl__foot nav { display: flex; flex-wrap: wrap; gap: 4px 0; }
.rl__foot-link { padding: 2px 0; font-size: 13px; color: var(--mi-label2); text-decoration: none; }
.rl__foot-link + .rl__foot-link::before { content: "·"; margin: 0 10px; color: var(--mi-label3); }
.rl__foot-link:hover { color: var(--mi-label); text-decoration: underline; text-underline-offset: 3px; }
.rl__status { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--mi-label2); }
.rl__status i { width: 7px; height: 7px; border-radius: 50%; background: var(--mi-green); }
.rl__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

@container (min-width: 760px) {
  .rl { grid-template-columns: minmax(0, 1fr) minmax(320px, 400px); column-gap: 40px; align-items: start; }
  .rl__intro { padding-top: 12px; }
  .rl__foot { grid-column: 1 / -1; padding-top: 14px; border-top: 1px solid var(--mi-sep); }
}
</style>

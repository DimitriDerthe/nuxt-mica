<template>
  <div class="sc">
    <div class="sc__aura" aria-hidden="true" />

    <header class="sc__head">
      <MiText variant="footnote" tone="primary" weight="semibold" class="sc__eyebrow">Showcase</MiText>
      <MiText variant="largeTitle" as="h1" class="sc__title" balance>Four products. One kit.</MiText>
      <MiText variant="body" tone="label2" class="sc__lead">
        Complete, working screens assembled only from Mica components and tokens. Open one, switch the theme,
        resize the window, or change the brand colors below: every demo follows.
      </MiText>
      <dl class="sc__facts">
        <div v-for="f in facts" :key="f.label"><dt>{{ f.label }}</dt><dd>{{ f.value }}</dd></div>
      </dl>
    </header>

    <ul class="sc__grid">
      <li v-for="(d, i) in demos" :key="d.to" class="sc__item" :class="'sc__item--' + d.art" :style="{ '--i': i }">
        <MiCard :to="d.to" variant="outlined" :media-height="280" class="sc__card">
          <template #media>
            <div class="stage" :class="'stage--' + d.art" aria-hidden="true">
              <div class="frame">
                <div class="frame__bar"><i /><i /><i /><span>{{ d.url }}</span></div>
                <div class="frame__body">
                  <template v-if="d.art === 'landing'">
                    <div class="l-nav"><b /><span /><span /><span /><em /></div>
                    <div class="l-hero">
                      <div class="l-copy">
                        <p class="l-h">Know your runway before the month begins.</p>
                        <span class="l-sub" /><span class="l-sub l-sub--s" />
                        <div class="l-ctas"><em /><span /></div>
                      </div>
                      <div class="l-mock">
                        <svg viewBox="0 0 100 40" preserveAspectRatio="none"><path class="fill" d="M0 30 C15 28 22 18 38 20 S62 30 74 16 S92 8 100 6 V40 H0Z" /><path d="M0 30 C15 28 22 18 38 20 S62 30 74 16 S92 8 100 6" /></svg>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="d.art === 'dashboard'">
                    <div class="d-shell">
                      <div class="d-side"><b /><span v-for="n in 5" :key="n" :class="{ on: n === 1 }" /></div>
                      <div class="d-main">
                        <div class="d-kpis">
                          <div v-for="k in kpis" :key="k.l" class="d-kpi"><small>{{ k.l }}</small><strong>{{ k.v }}</strong><em>{{ k.d }}</em></div>
                        </div>
                        <div class="d-chart">
                          <svg viewBox="0 0 100 36" preserveAspectRatio="none"><path class="fill" d="M0 28 C10 26 16 20 26 22 S42 14 52 16 S70 8 80 10 S94 4 100 3 V36 H0Z" /><path d="M0 28 C10 26 16 20 26 22 S42 14 52 16 S70 8 80 10 S94 4 100 3" /><path class="prev" d="M0 31 C12 30 20 26 30 27 S48 22 58 23 S76 18 86 19 S96 16 100 15" /></svg>
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="d.art === 'status'">
                    <div class="s-hero"><span class="s-dot"><i /></span><div><p>All systems operational</p><small>Updated 2 minutes ago · 99.98% uptime</small></div></div>
                    <div v-for="row in statusRows" :key="row.name" class="s-row">
                      <span class="s-name">{{ row.name }}</span>
                      <span class="s-bars"><i v-for="(b, j) in row.bars" :key="j" :class="b" /></span>
                    </div>
                  </template>

                  <template v-else>
                    <div class="b-mast"><span>No. 42</span><p>The Lantern Review</p><span>Oct 2026</span></div>
                    <div class="b-front">
                      <div class="b-cover"><i class="b-arc b-arc--1" /><i class="b-arc b-arc--2" /><i class="b-sun" /></div>
                      <div class="b-copy">
                        <small>Essay · Design</small>
                        <p>The case for boring interfaces</p>
                        <span /><span /><span class="s" />
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </template>

          <div class="sc__body">
            <div class="sc__meta">
              <span class="sc__num">0{{ i + 1 }}</span>
              <MiText variant="caption2" tone="label2">{{ d.eyebrow }}</MiText>
            </div>
            <div class="sc__titlerow">
              <MiText variant="title2" as="h2">{{ d.title }}</MiText>
              <span class="sc__go"><MiIcon name="arrow-right" :size="18" /></span>
            </div>
            <MiText variant="subheadline" tone="label2">{{ d.description }}</MiText>
          </div>
          <template #footer>
            <span class="sc__tags">
              <MiBadge v-for="t in d.tags" :key="t" tone="neutral" variant="tint" :label="t" />
            </span>
          </template>
        </MiCard>
      </li>
    </ul>

    <section class="sc__tune" aria-labelledby="tune-title">
      <div class="sc__tune-copy">
        <MiText id="tune-title" variant="title3" as="h2">Make it yours</MiText>
        <MiText variant="subheadline" tone="label2">
          Pick a primary and a secondary color and an appearance. Tints, readable text shades and dark-mode variants
          are derived for you, then every demo picks them up.
        </MiText>
      </div>
      <div class="sc__tune-ctl">
        <MiColorPicker target="primary" label="Primary" />
        <MiColorPicker target="secondary" label="Secondary" />
        <MiThemeSwitcher />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const facts = [
  { label: 'Demos', value: '4' },
  { label: 'Components', value: '80' },
  { label: 'Appearances', value: 'Light & dark' },
  { label: 'Dependencies', value: '0' }
]

const demos = [
  { to: '/showcase/landing', art: 'landing', url: 'tidewell.app', eyebrow: 'Marketing site', title: 'Landing page', description: 'A cinematic product launch: hero mockup, bento features, pricing with a billing toggle and a closing call to action.', tags: ['Card', 'Segmented', 'Accordion', 'Charts'] },
  { to: '/showcase/dashboard', art: 'dashboard', url: 'app.tideline.io', eyebrow: 'SaaS product', title: 'Analytics dashboard', description: 'An app shell with KPIs, interactive charts, a sortable table, bulk actions and undo toasts.', tags: ['Sidebar', 'Table', 'Charts', 'Toasts'] },
  { to: '/showcase/status', art: 'status', url: 'status.meridian.cloud', eyebrow: 'Operations', title: 'Status page', description: 'Live service health that reacts to incidents, 90-day uptime, regional latency and an incident timeline.', tags: ['Banner', 'Line chart', 'Tooltip', 'Form'] },
  { to: '/showcase/blog', art: 'blog', url: 'lanternreview.com', eyebrow: 'Publishing', title: 'Editorial magazine', description: 'A reading-first front page and article view with progress, table of contents, comments and a newsletter.', tags: ['Chips', 'Search', 'Avatar', 'Textarea'] }
]

const kpis = [
  { l: 'Revenue', v: '$191k', d: '+9.6%' },
  { l: 'Accounts', v: '2,418', d: '+7.4%' },
  { l: 'Churn', v: '2.1%', d: '−0.2' }
]

// Deterministic pseudo-random uptime strips: mostly up, a few degraded / down days.
const strip = (seed: number) => Array.from({ length: 36 }, (_, j) => {
  const v = (j * 37 + seed * 101) % 53
  return v === 7 ? 'down' : v % 17 === 3 ? 'warn' : 'up'
})
const statusRows = [
  { name: 'API', bars: strip(1) },
  { name: 'Dashboard', bars: strip(2) },
  { name: 'Storage', bars: strip(5) }
]
</script>

<style scoped>
.sc { position: relative; max-width: 1180px; margin: 0 auto; padding: clamp(40px, 8vw, 112px) 16px 96px; font-family: var(--mi-font); isolation: isolate; }
.sc__aura {
  position: absolute; inset: -40px 0 auto; height: 560px; z-index: -1; pointer-events: none;
  /* fade every edge so the wash never shows a hard border at the container limit */
  -webkit-mask-image: radial-gradient(closest-side, #000 55%, transparent); mask-image: radial-gradient(closest-side, #000 55%, transparent);
  -webkit-mask-size: 100% 100%; mask-size: 100% 100%;
  background:
    radial-gradient(40% 60% at 18% 20%, color-mix(in oklab, var(--mi-p) 16%, transparent), transparent 70%),
    radial-gradient(34% 50% at 62% 8%, color-mix(in oklab, var(--mi-s) 12%, transparent), transparent 70%);
}

.sc__head { display: grid; gap: 14px; max-width: 760px; margin-bottom: clamp(40px, 7vw, 80px); animation: sc-in var(--mi-dur-4) var(--mi-ease) backwards; }
.sc__eyebrow { letter-spacing: .02em; }
.sc__title.mi-text { font-size: clamp(40px, 6.4vw, 76px); line-height: 1.02; letter-spacing: -.045em; }
.sc__lead { max-width: 58ch; font-size: clamp(17px, 1.6vw, 19px); line-height: 1.5; }
.sc__facts { display: flex; flex-wrap: wrap; gap: 12px 32px; margin: 14px 0 0; padding: 18px 0 0; border-top: 1px solid var(--mi-sep); }
.sc__facts div { display: grid; gap: 2px; }
.sc__facts dt { font-size: 12px; color: var(--mi-label3); }
.sc__facts dd { margin: 0; font-size: 17px; font-weight: 600; letter-spacing: -.01em; color: var(--mi-label); font-variant-numeric: tabular-nums; }

/* Asymmetric bento: wide / narrow, then narrow / wide. */
.sc__grid { display: grid; gap: 20px; grid-template-columns: minmax(0, 1fr); list-style: none; margin: 0; padding: 0; }
@media (min-width: 700px) { .sc__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1024px) {
  .sc__grid { grid-template-columns: repeat(12, minmax(0, 1fr)); }
  .sc__item--landing, .sc__item--blog { grid-column: span 7; }
  .sc__item--dashboard, .sc__item--status { grid-column: span 5; }
}
.sc__item { display: flex; animation: sc-in var(--mi-dur-4) var(--mi-ease) calc(var(--i) * 80ms + 140ms) backwards; }
.sc__card { flex: 1; min-width: 0; transition: transform var(--mi-dur-3) var(--mi-spring); }
.sc__card:hover { transform: translate3d(0, -4px, 0); }
.sc__body { display: grid; gap: 8px; }
.sc__meta { display: flex; align-items: center; gap: 10px; }
.sc__num { font-size: 12px; font-weight: 600; color: var(--mi-p-text); font-variant-numeric: tabular-nums; }
.sc__titlerow { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.sc__go { display: grid; place-items: center; flex: none; width: 34px; height: 34px; border-radius: 50%; background: var(--mi-fill4); color: var(--mi-label); transition: transform var(--mi-dur-2) var(--mi-ease); }
.sc__card:hover .sc__go { transform: translate3d(3px, 0, 0); }
.sc__tags { display: flex; flex-wrap: wrap; gap: 6px; }
@keyframes sc-in { from { opacity: 0; transform: translate3d(0, 18px, 0); } }

/* Stage: a brand-washed backdrop with a miniature browser window rising from the lower edge. */
.stage { position: relative; width: 100%; height: 100%; overflow: hidden; padding: 28px 28px 0; box-sizing: border-box; background: radial-gradient(90% 120% at 0% 0%, var(--mi-p-tint2), transparent 60%), radial-gradient(70% 100% at 100% 100%, color-mix(in oklab, var(--mi-s) 14%, transparent), transparent 70%), var(--mi-fill4); }
.stage--status { background: radial-gradient(90% 120% at 0% 0%, color-mix(in oklab, var(--mi-green) 16%, transparent), transparent 60%), var(--mi-fill4); }
.stage--blog { background: radial-gradient(90% 120% at 100% 0%, color-mix(in oklab, var(--mi-s) 16%, transparent), transparent 60%), var(--mi-fill4); }
.frame { height: calc(100% + 12px); border-radius: 12px 12px 0 0; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep), var(--mi-sh2); overflow: hidden; transition: transform var(--mi-dur-3) var(--mi-spring); }
.sc__card:hover .frame { transform: translate3d(0, -8px, 0); }
.frame__bar { display: flex; align-items: center; gap: 5px; height: 26px; padding: 0 10px; border-bottom: 1px solid var(--mi-sep); background: var(--mi-elev); }
.frame__bar i { width: 7px; height: 7px; border-radius: 50%; background: var(--mi-fill); }
.frame__bar span { margin: 0 auto; padding: 2px 10px; border-radius: 6px; background: var(--mi-fill4); font-size: 9.5px; color: var(--mi-label3); transform: translateX(-12px); }
.frame__body { position: relative; padding: 14px 16px; height: calc(100% - 26px); box-sizing: border-box; }
.frame p { margin: 0; }
.fill { fill: var(--mi-p-tint); stroke: none; }
svg path { fill: none; stroke: var(--mi-p); stroke-width: 2; vector-effect: non-scaling-stroke; stroke-linecap: round; }
svg path.fill { fill: var(--mi-p-tint); stroke: none; }

/* Landing */
.l-nav { display: flex; align-items: center; gap: 10px; margin-bottom: 22px; }
.l-nav b { width: 14px; height: 14px; border-radius: 4px; background: linear-gradient(135deg, var(--mi-p), var(--mi-s)); }
.l-nav span { width: 28px; height: 5px; border-radius: 3px; background: var(--mi-fill); }
.l-nav span:first-of-type { margin-left: auto; }
.l-nav em { width: 46px; height: 16px; border-radius: 8px; background: var(--mi-p); }
.l-hero { display: grid; grid-template-columns: 1.1fr 1fr; gap: 16px; align-items: center; }
.l-h { font-size: clamp(15px, 1.9vw, 21px); line-height: 1.05; font-weight: 700; letter-spacing: -.035em; color: var(--mi-label); text-wrap: balance; }
.l-sub { display: block; height: 5px; margin-top: 8px; border-radius: 3px; background: var(--mi-fill); width: 92%; }
.l-sub--s { width: 64%; }
.l-ctas { display: flex; gap: 6px; margin-top: 14px; }
.l-ctas em { width: 58px; height: 18px; border-radius: 9px; background: var(--mi-p); }
.l-ctas span { width: 50px; height: 18px; border-radius: 9px; background: var(--mi-fill2); }
.l-mock { height: 110px; border-radius: 10px; background: var(--mi-page); box-shadow: 0 0 0 1px var(--mi-sep); padding: 12px 8px 0; box-sizing: border-box; display: flex; align-items: flex-end; overflow: hidden; }
.l-mock svg { width: 100%; height: 72px; }

/* Dashboard */
.d-shell { display: grid; grid-template-columns: 46px 1fr; gap: 12px; height: 100%; margin: -14px -16px; }
.d-side { display: flex; flex-direction: column; gap: 9px; padding: 14px 10px; border-right: 1px solid var(--mi-sep); background: var(--mi-elev); }
.d-side b { width: 16px; height: 16px; border-radius: 5px; background: var(--mi-p); margin-bottom: 6px; }
.d-side span { height: 6px; border-radius: 3px; background: var(--mi-fill2); }
.d-side span.on { background: var(--mi-p-tint); box-shadow: inset 3px 0 0 var(--mi-p); }
.d-main { padding: 14px 16px 0 0; display: grid; gap: 10px; align-content: start; }
.d-kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.d-kpi { display: grid; gap: 1px; padding: 8px 9px; border-radius: 8px; background: var(--mi-page); box-shadow: 0 0 0 1px var(--mi-sep); }
.d-kpi small { font-size: 8.5px; color: var(--mi-label3); }
.d-kpi strong { font-size: 14px; letter-spacing: -.02em; color: var(--mi-label); font-variant-numeric: tabular-nums; }
.d-kpi em { font-style: normal; font-size: 8.5px; font-weight: 600; color: var(--mi-green-t); }
.d-chart { height: 110px; border-radius: 8px; background: var(--mi-page); box-shadow: 0 0 0 1px var(--mi-sep); padding: 10px 8px 0; box-sizing: border-box; display: flex; align-items: flex-end; overflow: hidden; }
.d-chart svg { width: 100%; height: 84px; }
.d-chart path.prev { stroke: var(--mi-s); stroke-dasharray: 3 3; opacity: .7; }

/* Status */
.s-hero { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 14px; border-radius: 10px; background: color-mix(in oklab, var(--mi-green) 12%, transparent); }
.s-dot { position: relative; display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--mi-green); }
.s-dot i { width: 8px; height: 5px; margin-top: -2px; border: solid var(--mi-card); border-width: 0 0 2px 2px; transform: rotate(-45deg); }
.s-hero p { font-size: 13px; font-weight: 650; letter-spacing: -.01em; color: var(--mi-label); }
.s-hero small { font-size: 9.5px; color: var(--mi-label2); }
.s-row { display: grid; grid-template-columns: 62px 1fr; align-items: center; gap: 10px; padding: 7px 0; border-top: 1px solid var(--mi-sep); }
.s-name { font-size: 10px; font-weight: 600; color: var(--mi-label2); }
.s-bars { display: flex; align-items: flex-end; gap: 2px; height: 18px; }
.s-bars i { flex: 1; height: 100%; border-radius: 2px; background: color-mix(in oklab, var(--mi-green) 70%, var(--mi-card)); }
.s-bars i.warn { background: var(--mi-orange); height: 78%; }
.s-bars i.down { background: var(--mi-red); height: 62%; }

/* Blog */
.b-mast { display: flex; align-items: baseline; justify-content: space-between; padding-bottom: 8px; margin-bottom: 12px; border-bottom: 1px solid var(--mi-label); font-size: 9px; color: var(--mi-label2); letter-spacing: .06em; text-transform: uppercase; }
.b-mast p { font-family: ui-serif, "New York", "Iowan Old Style", Georgia, serif; font-size: 17px; font-weight: 600; letter-spacing: -.01em; text-transform: none; color: var(--mi-label); }
.b-front { display: grid; grid-template-columns: 1.15fr 1fr; gap: 14px; }
.b-cover { position: relative; height: 128px; border-radius: 8px; overflow: hidden; background: linear-gradient(160deg, color-mix(in oklab, var(--mi-s) 30%, var(--mi-card)), color-mix(in oklab, var(--mi-p) 26%, var(--mi-card))); }
.b-arc { position: absolute; border-radius: 50%; border: 2px solid var(--mi-card); opacity: .8; }
.b-arc--1 { width: 150px; height: 150px; left: -40px; bottom: -90px; }
.b-arc--2 { width: 220px; height: 220px; left: -75px; bottom: -125px; opacity: .45; }
.b-sun { position: absolute; width: 34px; height: 34px; right: 22px; top: 20px; border-radius: 50%; background: var(--mi-s); }
.b-copy small { display: block; font-size: 8.5px; letter-spacing: .06em; text-transform: uppercase; color: var(--mi-s-text); margin-bottom: 6px; }
.b-copy p { font-family: ui-serif, "New York", "Iowan Old Style", Georgia, serif; font-size: clamp(14px, 1.6vw, 19px); line-height: 1.1; font-weight: 600; letter-spacing: -.015em; color: var(--mi-label); margin-bottom: 10px; text-wrap: balance; }
.b-copy span { display: block; height: 4px; margin-top: 6px; border-radius: 2px; background: var(--mi-fill); }
.b-copy span.s { width: 60%; }

/* Make it yours */
.sc__tune { display: grid; gap: 24px; margin-top: clamp(48px, 8vw, 96px); padding: clamp(22px, 4vw, 36px); border-radius: 24px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); }
@media (min-width: 900px) { .sc__tune { grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); align-items: center; gap: 40px; } }
.sc__tune-copy { display: grid; gap: 8px; max-width: 46ch; }
.sc__tune-ctl > :last-child { grid-column: 1 / -1; justify-self: start; }
.sc__tune-ctl { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); align-items: end; }

@media (max-width: 480px) {
  .stage { padding: 18px 16px 0; }
  .l-hero, .b-front { grid-template-columns: 1fr; }
  .l-nav { margin-bottom: 14px; }
  .l-mock { height: 76px; padding-top: 8px; }
  .l-mock svg { height: 52px; }
  .b-cover { height: 64px; }
}
@media (prefers-reduced-motion: reduce) {
  .sc__head, .sc__item { animation: none; }
  .sc__card:hover, .sc__card:hover .frame, .sc__card:hover .sc__go { transform: none; }
}
</style>

<template>
  <div ref="root" class="lp">
    <div class="wrap back">
      <NuxtLink to="/showcase" class="backlink">
        <MiIcon name="arrow-left" :size="16" /> Back to showcase
      </NuxtLink>
    </div>

    <!-- Site header -->
    <header class="wrap site">
      <a href="#top" class="brandmark" aria-label="Tidewell home">
        <svg class="mark" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="9" fill="var(--mi-p)" />
          <path d="M6 18.5c3.2 0 3.2-3 6.4-3s3.2 3 6.4 3 3.2-3 6.4-3" fill="none" stroke="var(--mi-p-on)" stroke-width="2.4" stroke-linecap="round" />
          <path d="M6 23c3.2 0 3.2-3 6.4-3s3.2 3 6.4 3 3.2-3 6.4-3" fill="none" stroke="var(--mi-p-on)" stroke-width="2.4" stroke-linecap="round" opacity=".55" />
          <circle cx="22.5" cy="10" r="2.6" fill="var(--mi-p-on)" />
        </svg>
        <span class="wordmark">Tidewell</span>
      </a>
      <nav class="sitenav" aria-label="Primary">
        <a href="#features">Product</a>
        <a href="#how">How it works</a>
        <a href="#customers">Customers</a>
        <a href="#pricing">Pricing</a>
      </nav>
      <div class="siteact">
        <MiButton variant="plain" size="small" class="signin">Sign in</MiButton>
        <MiButton size="small">Start free</MiButton>
      </div>
    </header>

    <!-- Hero -->
    <section id="top" class="hero">
      <div class="aura" aria-hidden="true" />
      <div class="wrap hero-copy">
        <a href="#features" class="announce">
          <MiBadge label="New" tone="primary" variant="solid" shape="pill" />
          <span>Scenario layers for hiring plans</span>
          <MiIcon name="chevron-right" :size="14" />
        </a>
        <h1 class="h1">Know your runway <em>before the month</em> begins.</h1>
        <p class="lede">
          Tidewell turns bank feeds, invoices and hiring plans into one calm, nightly-updated forecast, so every spending decision is made with the whole year in view.
        </p>
        <div class="ctas">
          <MiButton size="large">Start forecasting free</MiButton>
          <MiButton size="large" variant="gray">
            <template #leading><MiIcon name="eye" :size="18" /></template>
            Watch the 2-minute tour
          </MiButton>
        </div>
        <div class="trust">
          <span class="stack" aria-hidden="true"><MiAvatar v-for="t in trustPeople" :key="t.name" :name="t.name" tone="auto" size="sm" decorative /></span>
          <p>
            <span class="stars" aria-hidden="true"><MiIcon v-for="n in 5" :key="n" name="star" filled :size="13" /></span>
            <span class="trust-t"><b>4.9/5</b> from 1,180 finance leads</span>
            <span class="sep" aria-hidden="true" />
            <span class="trust-t">No card required</span>
          </p>
        </div>
      </div>

      <!-- Signature: product window -->
      <div class="wrap stage">
        <p class="sr-only">Product preview: the Tidewell forecast workspace with cash, runway and burn figures, a 12-month projection and upcoming payments.</p>
        <div class="win" inert>
          <div class="chrome">
            <span class="dots"><i /><i /><i /></span>
            <span class="url"><MiIcon name="lock" :size="11" /> app.tidewell.com/harbor/forecast</span>
            <span class="chrome-r"><MiIcon name="share" :size="15" /></span>
          </div>
          <div class="app">
            <aside class="rail">
              <span class="rail-mark" />
              <span v-for="r in railIcons" :key="r" class="rail-i" :class="{ on: r === 'sliders' }"><MiIcon :name="r" :size="18" /></span>
            </aside>
            <div class="appmain">
              <div class="apphead">
                <div>
                  <MiText variant="caption" tone="label2">Harbor Ceramics &middot; Updated 06:02 today</MiText>
                  <MiText variant="title3" as="p" weight="semibold">Cash forecast</MiText>
                </div>
                <div class="apphead-r">
                  <MiSegmented v-model="range" :options="rangeOptions" label="Range" />
                  <MiButton size="small" class="hide-s">Share</MiButton>
                </div>
              </div>
              <div class="kpis">
                <MiStatTile v-for="k in heroKpis" :key="k.label" v-bind="k" />
              </div>
              <div class="appbody">
                <MiSurface variant="card" radius="lg" padding="md" class="appchart">
                  <MiLineChart
                    :categories="months"
                    :series="heroSeries"
                    :card="false"
                    :toolbar="false"
                    :end-labels="false"
                    unit="K"
                    :min="380"
                    :max="580"
                    :ticks="4"
                    :height="210"
                    aria-label="Projected cash balance, next 12 months"
                  />
                </MiSurface>
                <MiSurface variant="card" radius="lg" padding="sm" class="applist">
                  <MiText variant="footnote" weight="semibold" class="applist-h">Next 30 days</MiText>
                  <MiList :grouped="false" label="Upcoming cash events">
                    <MiListItem v-for="u in upcoming" :key="u.title" :title="u.title" :subtitle="u.date" :tile="u.tile">
                      <template #leading><MiIcon :name="u.icon" :size="15" /></template>
                      <template #trailing>
                        <MiText variant="subheadline" weight="semibold" tabular :tone="u.amount.startsWith('+') ? 'green' : 'label'">{{ u.amount }}</MiText>
                      </template>
                    </MiListItem>
                  </MiList>
                </MiSurface>
              </div>
            </div>
          </div>
        </div>

        <MiSurface variant="elevated" radius="lg" padding="md" class="float f1" aria-hidden="true">
          <span class="f-ico"><MiIcon name="check-circle-fill" :size="18" /></span>
          <span>
            <MiText variant="caption" tone="label2" as="span" class="blk">Runway extended</MiText>
            <MiText variant="headline" tabular as="span" class="blk">+2.1 months</MiText>
          </span>
        </MiSurface>
        <MiSurface variant="elevated" radius="lg" padding="md" class="float f2" aria-hidden="true">
          <MiMeter :value="82" label="Q4 tax reserve" caption="82% funded" hint="$9,140 to go" size="sm" color="var(--mi-s)" />
        </MiSurface>
      </div>
    </section>

    <!-- Trust floor: wordmarks + numbers -->
    <section class="floor">
      <div class="wrap">
        <p class="floor-k" data-rv>Finance runs calmer at 3,200 small teams</p>
        <ul class="marks" aria-label="Customers" data-rv>
          <li class="wm wm-serif">Harbor Ceramics</li>
          <li class="wm wm-caps">Brightline</li>
          <li class="wm wm-heavy">northwind</li>
          <li class="wm wm-ring">Arcwell</li>
          <li class="wm wm-mono">Kettle&amp;Co</li>
          <li class="wm wm-serif2">Fieldnote.</li>
          <li class="wm wm-light">LUMEN<b>dental</b></li>
        </ul>
        <dl class="stats" data-rv>
          <div v-for="s in stats" :key="s.k" class="stat">
            <dt>{{ s.k }}</dt>
            <dd>{{ s.v }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- Features bento -->
    <section id="features" class="wrap sec">
      <header class="shead split-head" data-rv>
        <div>
          <p class="eyebrow">The product</p>
          <h2 class="h2">Everything finance needs, nothing it has to babysit.</h2>
        </div>
        <p class="shead-p">Tidewell rebuilds your forecast every night from real transactions. You spend the morning deciding, not reconciling.</p>
      </header>

      <div class="bento">
        <article class="tile t-a" data-rv>
          <div class="tile-copy">
            <h3>A rolling 18-month forecast</h3>
            <p>Actuals lock in as months close; the projection ahead adjusts to what really happened.</p>
          </div>
          <div class="tile-ui ta-ui">
            <div class="ta-side">
              <div>
                <MiText variant="caption" tone="label2">Projected cash, Oct 2027</MiText>
                <p class="ta-num">$548,200</p>
                <MiBadge label="&plusmn;6% error band at 90 days" tone="success" shape="pill" />
              </div>
              <dl class="ta-facts">
                <div><dt>Inflows, next 90 days</dt><dd>$286.4k</dd></div>
                <div><dt>Outflows, next 90 days</dt><dd>$241.9k</dd></div>
              </dl>
            </div>
            <div class="ta-chart">
              <MiBarChart
                :data="netFlow"
                :card="false"
                unit="K"
                :height="220"
                :max-bar-width="26"
                value-labels="peak"
                aria-label="Net cash flow by month, actual and forecast"
              />
              <div class="ta-leg">
                <span><i class="sw sw-a" /> Actual</span>
                <span><i class="sw sw-f" /> Forecast</span>
              </div>
            </div>
          </div>
        </article>

        <article class="tile t-b" data-rv>
          <div class="tile-copy">
            <h3>Scenario layers</h3>
            <p>Switch plans on and off. The runway answers instantly.</p>
          </div>
          <div class="tile-ui tb-ui">
            <div class="tb-run">
              <MiText variant="caption" tone="label2">Runway</MiText>
              <p class="tb-num" aria-live="polite">{{ layerRunway }} <span>months</span></p>
            </div>
            <div class="tb-rows">
              <label v-for="l in layers" :key="l.id" class="tb-row">
                <span>
                  <span class="tb-l">{{ l.label }}</span>
                  <span class="tb-d" :class="l.delta > 0 ? 'pos' : 'neg'">{{ l.delta > 0 ? '+' : '' }}{{ l.delta.toFixed(1) }} mo</span>
                </span>
                <MiSwitch v-model="layerOn[l.id]" size="compact" :label="l.label" />
              </label>
            </div>
          </div>
        </article>

        <article class="tile t-c" data-rv>
          <div class="tile-copy">
            <h3>Quiet alerts</h3>
            <p>One note when a threshold is at risk. Never a stream.</p>
          </div>
          <div class="tile-ui tc-ui">
            <MiNotification
              title="Runway dips under 12 months in August"
              message="Only if Northwind does not renew. Tap to compare both paths."
              time="Mon 8:02"
              icon="warning"
              tone="warning"
              live="off"
            />
          </div>
        </article>

        <article class="tile t-d" data-rv>
          <div class="tile-copy">
            <h3>Shared with your board</h3>
            <p>Read-only links with comments pinned to the exact month.</p>
          </div>
          <div class="tile-ui td-ui">
            <div class="td-top">
              <span class="stack" role="img" aria-label="5 board members have access"><MiAvatar v-for="b in board.slice(0, 4)" :key="b.name" :name="b.name" tone="auto" size="sm" decorative /><span class="stack-more">+1</span></span>
              <MiChip label="View only" tone="neutral" size="small" />
            </div>
            <div class="td-comment">
              <MiAvatar name="Avi Sandler" tone="auto" size="sm" decorative />
              <div>
                <p class="td-who"><b>Avi Sandler</b> on <span>Jul 2027</span> &middot; 2h</p>
                <p class="td-msg">Can we see this with the second hire pushed to September?</p>
              </div>
            </div>
          </div>
        </article>

        <article class="tile t-e" data-rv>
          <div class="tile-copy">
            <h3>Where the money goes</h3>
            <p>Every transaction categorised, recurring costs surfaced.</p>
          </div>
          <div class="tile-ui">
            <MiStackedBar :segments="spend" :height="22" :legend-columns="2" aria-label="Spend by category, last 90 days" />
          </div>
        </article>

        <article class="tile t-f" data-rv>
          <div class="tf-copy">
            <MiIcon name="lock" :size="20" class="tf-ico" />
            <div>
              <h3>Read-only by design</h3>
              <p>Tidewell can see your money. It can never move it.</p>
            </div>
          </div>
          <ul class="tf-chips" aria-label="Security">
            <li v-for="c in security" :key="c"><MiIcon name="check" :size="14" /> {{ c }}</li>
          </ul>
        </article>
      </div>
    </section>

    <!-- How it works -->
    <section id="how" class="wrap sec">
      <header class="shead" data-rv>
        <p class="eyebrow">How it works</p>
        <h2 class="h2">From first login to first forecast in eleven minutes.</h2>
      </header>
      <ol class="steps" data-rv>
        <li v-for="(s, i) in steps" :key="s.title" class="step">
          <span class="step-n" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          <div class="step-b">
            <h3>{{ s.title }}</h3>
            <p>{{ s.text }}</p>
            <span class="step-t"><MiIcon name="spinner-arc" :size="12" /> {{ s.time }}</span>
          </div>
        </li>
      </ol>
    </section>

    <!-- Live scenarios -->
    <section class="wrap sec">
      <div class="live" data-rv>
        <div class="live-copy">
          <p class="eyebrow">Live scenarios</p>
          <h2 class="h2">Change the plan. Watch the future move.</h2>
          <p class="shead-p">Pick a scenario. The forecast, runway and burn redraw against your base plan.</p>
          <div class="segwrap">
            <MiSegmented v-model="scenario" :options="scenarios" label="Scenario" variant="tinted" />
          </div>
          <div class="tiles">
            <MiStatTile v-for="t in tiles" :key="t.label" v-bind="t" />
          </div>
        </div>
        <MiSurface variant="card" radius="xl" padding="lg" class="live-chart">
          <MiLineChart
            :categories="months"
            :series="chartSeries"
            title="Projected cash balance"
            subtitle="Thousands of dollars, Nov 2026 to Oct 2027"
            :card="false"
            unit="K"
            :min="380"
            :max="640"
            :height="300"
            :end-labels="false"
            :animate="false"
          />
        </MiSurface>
      </div>
    </section>

    <!-- Quote -->
    <section id="customers" class="wrap sec">
      <figure class="quote" data-rv>
        <svg class="qmark" viewBox="0 0 48 36" aria-hidden="true"><path d="M0 36V22C0 9.5 6.6 2.2 19.6 0l2 5.2C14.4 7.4 11 11.6 10.6 17.6H20V36H0Zm28 0V22C28 9.5 34.6 2.2 47.6 0l2 5.2c-7.2 2.2-10.6 6.4-11 12.4H48V36H28Z" fill="currentColor" /></svg>
        <blockquote>
          <p>We used to close the month and hope. Now I know in March what October looks like, and so does our bank.</p>
        </blockquote>
        <figcaption class="who">
          <MiAvatar name="Marta Lindqvist" tone="auto" size="md" decorative />
          <span>
            <span class="who-n">Marta Lindqvist</span>
            <span class="who-r">Cofounder &amp; CEO, Harbor Ceramics</span>
          </span>
        </figcaption>
        <dl class="qstats">
          <div><dt>Runway visibility</dt><dd>4 &rarr; 18 mo</dd></div>
          <div><dt>Month-end close</dt><dd>3 days &rarr; 40 min</dd></div>
          <div><dt>Hiring decision</dt><dd>3 weeks &rarr; 1 call</dd></div>
        </dl>
      </figure>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="wrap sec">
      <header class="shead center" data-rv>
        <p class="eyebrow">Pricing</p>
        <h2 class="h2">Simple plans that grow with the team.</h2>
        <div class="billing">
          <MiSegmented v-model="billing" :options="billingOptions" label="Billing period" />
          <MiBadge label="2 months free yearly" tone="success" shape="pill" />
        </div>
      </header>
      <div class="plans">
        <article v-for="p in plans" :key="p.name" class="plan" :class="{ pop: p.popular }" data-rv>
          <div class="phead">
            <h3>{{ p.name }}</h3>
            <MiBadge v-if="p.popular" label="Most popular" tone="primary" variant="solid" shape="pill" />
          </div>
          <p class="pblurb">{{ p.blurb }}</p>
          <div class="price">
            <span class="pcur">$</span>
            <span class="pnum">
              <Transition name="tick">
                <span :key="String(billing)" class="pval">{{ billing === 'yearly' ? p.yearly : p.monthly }}</span>
              </Transition>
            </span>
            <span class="pper">per month</span>
          </div>
          <p class="pbill">{{ billing === 'yearly' ? `Billed $${(p.yearly * 12).toLocaleString('en-US')} once a year` : 'Billed monthly, cancel anytime' }}</p>
          <MiButton :variant="p.popular ? 'filled' : 'gray'" block size="large">{{ p.cta }}</MiButton>
          <ul class="incl">
            <li v-for="i in p.items" :key="i">
              <MiIcon name="check" :size="15" class="tick" />
              <span>{{ i }}</span>
            </li>
          </ul>
        </article>
      </div>
      <p class="plans-note" data-rv>All plans include read-only bank connections, nightly refresh and CSV export. Prices in USD, excluding VAT.</p>
    </section>

    <!-- FAQ -->
    <section class="wrap sec faq">
      <div class="faq-side" data-rv>
        <p class="eyebrow">FAQ</p>
        <h2 class="h2">Questions, answered.</h2>
        <div class="faq-help">
          <MiAvatar name="Ana Ferreira" tone="auto" size="sm" decorative />
          <p>Still unsure? Ana from our finance team replies within a working day. <MiTextLink href="#">Ask Ana</MiTextLink></p>
        </div>
      </div>
      <div data-rv>
        <MiAccordion v-model="faqOpen" :heading-level="3">
          <MiAccordionItem v-for="f in faqs" :key="f.q" :value="f.q" :title="f.q">
            <MiText variant="callout" tone="label2">{{ f.a }}</MiText>
          </MiAccordionItem>
        </MiAccordion>
      </div>
    </section>

    <!-- Closing band (dark surface in both modes) -->
    <section class="bandwrap">
      <div class="band mi-dark" data-rv>
        <div class="band-aura" aria-hidden="true" />
        <svg class="band-lines" viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 190 C 200 182, 330 120, 520 128 S 860 170, 1010 96 S 1160 40, 1200 34" fill="none" stroke="var(--mi-p)" stroke-width="2" vector-effect="non-scaling-stroke" />
          <path d="M0 204 C 220 198, 360 160, 560 164 S 880 196, 1040 140 S 1170 104, 1200 100" fill="none" stroke="var(--mi-s)" stroke-width="1.5" stroke-dasharray="3 6" vector-effect="non-scaling-stroke" opacity=".7" />
        </svg>
        <div class="band-in">
          <h2 class="band-t">Give next quarter a clear horizon.</h2>
          <p class="band-p">Join 3,200 teams who open Tidewell on Monday and already know how the month ends.</p>
          <div class="ctas center">
            <MiButton size="large">Start forecasting free</MiButton>
            <MiButton size="large" variant="gray">Talk to our team</MiButton>
          </div>
          <p class="band-k">14-day trial on every plan &middot; Setup in 11 minutes &middot; Cancel anytime</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="wrap foot">
      <div class="fbrand">
        <a href="#top" class="brandmark" aria-label="Tidewell home">
          <svg class="mark" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="9" fill="var(--mi-p)" />
            <path d="M6 18.5c3.2 0 3.2-3 6.4-3s3.2 3 6.4 3 3.2-3 6.4-3" fill="none" stroke="var(--mi-p-on)" stroke-width="2.4" stroke-linecap="round" />
            <path d="M6 23c3.2 0 3.2-3 6.4-3s3.2 3 6.4 3 3.2-3 6.4-3" fill="none" stroke="var(--mi-p-on)" stroke-width="2.4" stroke-linecap="round" opacity=".55" />
            <circle cx="22.5" cy="10" r="2.6" fill="var(--mi-p-on)" />
          </svg>
          <span class="wordmark">Tidewell</span>
        </a>
        <p>Calm cash-flow planning for small teams. Made in Lisbon and Toronto.</p>
        <span class="fstatus"><i /> All systems normal</span>
      </div>
      <nav v-for="c in footCols" :key="c.h" class="fcol" :aria-label="c.h">
        <p class="fcol-h">{{ c.h }}</p>
        <ul>
          <li v-for="l in c.links" :key="l"><a href="#">{{ l }}</a></li>
        </ul>
      </nav>
      <div class="fbase">
        <span>&copy; 2026 Tidewell Labs, Inc.</span>
        <span class="fbase-r"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Tidewell: cash-flow forecasting for small teams' })

const root = ref<HTMLElement>()

const trustPeople = [
  { name: 'Marta Lindqvist', tone: 'auto' as const },
  { name: 'Joel Okafor', tone: 'auto' as const },
  { name: 'Priya Raman', tone: 'auto' as const },
  { name: 'Tomás Villa', tone: 'auto' as const }
]

/* hero product window */
const railIcons = ['home', 'sliders', 'calendar', 'people', 'document'] as const
const range = ref<string | number | null>('12m')
const rangeOptions = [{ value: '3m', label: '3M' }, { value: '12m', label: '12M' }, { value: '18m', label: '18M' }]
const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
const baseCash = [412, 424, 431, 440, 452, 463, 475, 489, 502, 518, 531, 548]
const heroSeries = [
  { name: 'Forecast', data: baseCash, color: 'var(--mi-p)', area: true },
  { name: 'Last year', data: [396, 401, 398, 404, 411, 409, 418, 421, 427, 425, 433, 438], color: 'var(--mi-label3)', area: false }
]
const heroKpis = [
  { label: 'Cash on hand', value: '$412,800', delta: '4.2%', trend: 'up' as const, tone: 'good' as const, comparison: 'vs Sep', spark: [380, 386, 384, 395, 399, 404, 412] },
  { label: 'Runway', value: '19.4 mo', delta: '2.1 mo', trend: 'up' as const, tone: 'good' as const, comparison: 'vs Sep', spark: [15, 15.6, 16.2, 16.9, 17.8, 18.6, 19.4] },
  { label: 'Net burn', value: '$21.3k', delta: '2%', trend: 'down' as const, tone: 'good' as const, comparison: 'vs Sep', spark: [26, 25, 24.4, 23, 22.6, 21.8, 21.3] }
]
const upcoming = [
  { title: 'Payroll, 14 people', date: 'Fri, Nov 1', amount: '−$48,200', icon: 'people', tile: 'indigo' },
  { title: 'Northwind Studio', date: 'Invoice INV-2291 · Nov 4', amount: '+$18,400', icon: 'document', tile: 'green' },
  { title: 'Kiln lease', date: 'Nov 5', amount: '−$6,750', icon: 'home', tile: 'orange' },
  { title: 'Quarterly VAT', date: 'Nov 15', amount: '−$12,950', icon: 'calendar', tile: 'red' }
] as const

const stats = [
  { v: '3,200+', k: 'teams planning weekly' },
  { v: '$4.1B', k: 'cash forecast each quarter' },
  { v: '94%', k: 'accuracy at 90 days' },
  { v: '11 min', k: 'median time to first forecast' }
]

/* bento */
const actual = 'var(--mi-p)'
const forecast = 'color-mix(in oklab, var(--mi-p) 38%, transparent)'
const netFlow = [
  { label: 'Jun', value: 9, color: actual },
  { label: 'Jul', value: 14, color: actual },
  { label: 'Aug', value: 6, color: actual },
  { label: 'Sep', value: 11, color: actual },
  { label: 'Oct', value: 17, color: actual },
  { label: 'Nov', value: 12, color: forecast },
  { label: 'Dec', value: 7, color: forecast },
  { label: 'Jan', value: 9, color: forecast },
  { label: 'Feb', value: 12, color: forecast },
  { label: 'Mar', value: 15, color: forecast }
]
const layers = [
  { id: 'hire', label: 'Hire two engineers in Q1', delta: -3.3 },
  { id: 'price', label: 'Raise prices 8% in January', delta: 5.4 },
  { id: 'churn', label: 'Northwind does not renew', delta: -4.1 }
]
const layerOn = reactive<Record<string, boolean>>({ hire: true, price: true, churn: false })
const layerRunway = computed(() => (19.4 + layers.reduce((s, l) => s + (layerOn[l.id] ? l.delta : 0), 0)).toFixed(1))
const board = [
  { name: 'Avi Sandler', tone: 'auto' as const },
  { name: 'Hana Mori', tone: 'auto' as const },
  { name: 'Lucas Brandt', tone: 'auto' as const },
  { name: 'Ines Duarte', tone: 'auto' as const },
  { name: 'Ruth Abara', tone: 'auto' as const }
]
const spend = [
  { label: 'Payroll', value: 62, color: 'var(--mi-p)' },
  { label: 'Contractors', value: 12, color: 'var(--mi-s)' },
  { label: 'Rent', value: 11, color: 'color-mix(in oklab, var(--mi-p) 45%, var(--mi-card))' },
  { label: 'Software', value: 9, color: 'color-mix(in oklab, var(--mi-s) 45%, var(--mi-card))' },
  { label: 'Other', value: 6, color: 'var(--mi-label3)' }
]
const security = ['Read-only bank access', 'SOC 2 Type II', 'AES-256 at rest', 'SSO and SCIM', 'EU and US data residency']

const steps = [
  { title: 'Connect your accounts', text: 'Link banks, cards and your invoicing tool with read-only access. Twelve months of history imports on its own.', time: 'About 4 minutes' },
  { title: 'Review the baseline', text: 'Every transaction is categorised and recurring revenue and costs are surfaced. Fix anything odd in a single pass.', time: 'About 5 minutes' },
  { title: 'Layer your plans', text: 'Add hires, launches and big purchases as switchable layers, then send your board a live, read-only link.', time: 'About 2 minutes' }
]

/* live scenarios */
const scenario = ref<string | number | null>('base')
const scenarios = [
  { value: 'base', label: 'Base plan' },
  { value: 'hire', label: 'Hire two' },
  { value: 'raise', label: 'Raise prices' }
]
const curves: Record<string, number[]> = {
  base: baseCash,
  hire: [412, 418, 420, 421, 424, 427, 431, 435, 440, 446, 451, 458],
  raise: [412, 428, 440, 455, 472, 489, 507, 527, 548, 571, 592, 616]
}
type Tile = { value: string, delta: string, trend: 'up' | 'down', tone: 'good' | 'bad' | 'neutral', value2: string, delta2: string, trend2: 'up' | 'down', tone2: 'good' | 'bad' | 'neutral' }
const tileData: Record<string, Tile> = {
  base: { value: '19.4 mo', delta: '0.0', trend: 'up', tone: 'neutral', value2: '$21.3k', delta2: '0%', trend2: 'down', tone2: 'neutral' },
  hire: { value: '16.1 mo', delta: '3.3 mo', trend: 'down', tone: 'bad', value2: '$34.8k', delta2: '63%', trend2: 'up', tone2: 'bad' },
  raise: { value: '24.8 mo', delta: '5.4 mo', trend: 'up', tone: 'good', value2: '$9.6k', delta2: '55%', trend2: 'down', tone2: 'good' }
}
const cur = computed(() => curves[String(scenario.value)] ?? baseCash)
const chartSeries = computed(() => [
  { name: 'Scenario', data: cur.value, color: 'var(--mi-p)', area: true },
  { name: 'Base plan', data: baseCash, color: 'var(--mi-label3)', area: false }
])
const tiles = computed(() => {
  const t = tileData[String(scenario.value)] ?? tileData.base!
  return [
    { label: 'Runway', value: t.value, delta: t.delta, trend: t.trend, tone: t.tone, comparison: 'vs base', spark: cur.value },
    { label: 'Net burn', value: t.value2, delta: t.delta2, trend: t.trend2, tone: t.tone2, comparison: 'vs base', spark: [...cur.value].reverse() }
  ]
})

/* pricing */
const billing = ref<string | number | null>('yearly')
const billingOptions = [{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }]
const plans = [
  { name: 'Starter', blurb: 'For founders running the numbers solo.', monthly: 24, yearly: 19, cta: 'Start free', items: ['1 workspace', '3 connected accounts', '6-month forecast', 'Email support'] },
  { name: 'Studio', popular: true, blurb: 'For teams making hiring and pricing calls.', monthly: 79, yearly: 63, cta: 'Start 14-day trial', items: ['Unlimited accounts', '18-month rolling forecast', 'Unlimited scenario layers', 'Board sharing and comments', 'Investor update drafts'] },
  { name: 'Scale', blurb: 'For finance teams with several entities.', monthly: 189, yearly: 151, cta: 'Talk to sales', items: ['Multi-entity consolidation', 'SSO, SCIM and audit log', 'API and warehouse sync', 'Dedicated success manager'] }
]

/* faq */
const faqOpen = ref<string | null>('Can Tidewell move money or change anything in my bank?')
const faqs = [
  { q: 'Can Tidewell move money or change anything in my bank?', a: 'No. Connections are read-only and we never store bank credentials. You can revoke access from your bank at any time.' },
  { q: 'How accurate is the forecast?', a: 'Across customers, 90-day projections land within 6 percent of actual cash. Every chart shows its own error band, so you always know how much to trust it.' },
  { q: 'Can I import my existing spreadsheet?', a: 'Yes. Upload a CSV or paste from a sheet, and we map columns and categories for you. Your old model keeps working as a scenario layer.' },
  { q: 'Which banks and tools do you support?', a: 'Over 4,000 banks in North America and Europe, plus Stripe, QuickBooks, Xero, Gusto and Rippling. New connectors ship most weeks.' },
  { q: 'What happens when the trial ends?', a: 'Your workspace turns read-only. Pick a plan to continue, or export everything to CSV, no questions asked.' }
]

const footCols = [
  { h: 'Product', links: ['Forecasting', 'Scenario layers', 'Board sharing', 'Integrations', 'Changelog'] },
  { h: 'Company', links: ['About', 'Customers', 'Careers', 'Press kit'] },
  { h: 'Resources', links: ['Runway calculator', 'Forecast templates', 'Guides', 'Help center'] },
  { h: 'Trust', links: ['Security', 'Status', 'DPA', 'Sub-processors'] }
]

/*
 * Reveal on scroll. SSR markup is always visible. The hidden state is only added after the
 * user's first scroll, and only to blocks that are still entirely below the viewport, so a
 * no-JS view or a full-page screenshot never shows blank sections.
 */
let revealIo: IntersectionObserver | undefined
let driftIo: IntersectionObserver | undefined
let armReveal: (() => void) | undefined
onMounted(() => {
  const el = root.value
  if (!el || !('IntersectionObserver' in window)) return
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return

  const stage = el.querySelector<HTMLElement>('.stage')
  if (stage) {
    driftIo = new IntersectionObserver(([e]) => { stage.classList.toggle('drift', !!e?.isIntersecting) })
    driftIo.observe(stage)
  }

  armReveal = () => {
    armReveal = undefined
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target) }
    }, { rootMargin: '0px 0px -6% 0px' })
    revealIo = io
    const limit = window.innerHeight + 32
    el.querySelectorAll<HTMLElement>('[data-rv]').forEach((t) => {
      if (t.getBoundingClientRect().top < limit) return
      t.classList.add('rv')
      io.observe(t)
    })
  }
  window.addEventListener('scroll', armReveal, { passive: true, once: true })
})
onBeforeUnmount(() => {
  if (armReveal) window.removeEventListener('scroll', armReveal)
  revealIo?.disconnect()
  driftIo?.disconnect()
})
</script>

<style scoped>
.lp {
  --gut: 16px;
  --sec: clamp(72px, 11vw, 152px);
  --serif: ui-serif, "New York", "Iowan Old Style", Georgia, serif;
  --hair: 1px solid var(--mi-sep);
  overflow-x: clip;
  padding-bottom: 24px;
  font-family: var(--mi-font);
  color: var(--mi-label);
}
.wrap { width: min(1200px, 100% - 2 * var(--gut)); margin-inline: auto; }
.blk { display: block; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.lp :where(h1, h2, h3, p, dl, dd, ol, ul, figure, blockquote) { margin: 0; }
.lp :where(ol, ul) { padding: 0; list-style: none; }

.back { padding-top: 12px; }
.backlink { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: var(--mi-p-text); text-decoration: none; padding: 6px 0; }
.backlink:hover { text-decoration: underline; }

/* ---------- site header ---------- */
.site { display: flex; align-items: center; gap: 24px; padding-block: 14px; }
.brandmark { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: var(--mi-label); border-radius: 8px; }
.mark { width: 28px; height: 28px; flex: none; }
.wordmark { font-size: 18px; font-weight: 680; letter-spacing: -0.03em; }
.sitenav { display: none; gap: 28px; margin-inline: auto; }
.sitenav a { font-size: 14px; color: var(--mi-label2); text-decoration: none; }
.sitenav a:hover { color: var(--mi-label); }
.siteact { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.signin { display: none; }

/* ---------- hero ---------- */
.hero { position: relative; isolation: isolate; padding-top: clamp(40px, 7vw, 96px); }
.aura { position: absolute; inset: -120px 0 18% 0; z-index: -1; pointer-events: none; }
.aura::before {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(42% 46% at 28% 30%, color-mix(in oklab, var(--mi-p) 26%, transparent), transparent 72%),
    radial-gradient(36% 40% at 74% 26%, color-mix(in oklab, var(--mi-s) 22%, transparent), transparent 74%),
    radial-gradient(60% 50% at 50% 78%, color-mix(in oklab, var(--mi-p) 12%, transparent), transparent 70%);
}
.aura::after {
  content: ''; position: absolute; inset: 0;
  background-image: linear-gradient(var(--mi-sep) 1px, transparent 1px), linear-gradient(90deg, var(--mi-sep) 1px, transparent 1px);
  background-size: 72px 72px; background-position: center top;
  opacity: .55;
  -webkit-mask-image: radial-gradient(60% 55% at 50% 38%, #000, transparent 78%);
  mask-image: radial-gradient(60% 55% at 50% 38%, #000, transparent 78%);
}
.hero-copy { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 22px; }
.announce {
  display: inline-flex; align-items: center; gap: 10px; padding: 5px 12px 5px 5px; border-radius: 999px;
  background: color-mix(in oklab, var(--mi-card) 80%, transparent); border: var(--hair); box-shadow: var(--mi-sh1);
  font-size: 13px; font-weight: 500; color: var(--mi-label); text-decoration: none; max-width: 100%;
}
.announce > span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.announce :deep(svg) { color: var(--mi-label3); flex: none; transition: transform var(--mi-dur-2) var(--mi-ease); }
.announce:hover :deep(svg) { transform: translateX(2px); }
.h1 {
  font-size: clamp(2.6rem, 8.6vw, 5.5rem); line-height: .98; letter-spacing: -0.048em; font-weight: 680;
  text-wrap: balance; max-width: 13.5em;
}
.h1 em { font-family: var(--serif); font-style: italic; font-weight: 500; letter-spacing: -0.03em; color: var(--mi-p-text); }
.lede { max-width: 36em; font-size: clamp(1.0625rem, 1.6vw, 1.25rem); line-height: 1.55; color: var(--mi-label2); text-wrap: pretty; }
.ctas { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.trust { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-top: 6px; }
.trust p { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 6px 10px; font-size: 13px; color: var(--mi-label2); }
.trust b { color: var(--mi-label); font-weight: 600; font-variant-numeric: tabular-nums; }
.stars { display: inline-flex; gap: 1px; color: var(--mi-orange); }
.stack { display: inline-flex; align-items: center; }
.stack > * { box-shadow: 0 0 0 2px var(--mi-card); border-radius: 50%; }
.stack > * + * { margin-left: -6px; }
.stack-more { display: grid; place-items: center; width: 32px; height: 32px; font-size: 12px; font-weight: 600; color: var(--mi-label2); background: var(--mi-fill3); }
.sep { width: 3px; height: 3px; border-radius: 50%; background: var(--mi-label3); }

/* product window */
.stage { position: relative; margin-top: clamp(44px, 6vw, 72px); margin-bottom: calc(-1 * clamp(96px, 14vw, 200px)); z-index: 2; max-width: 1120px; }
.win {
  position: relative; border-radius: 18px; overflow: hidden; background: var(--mi-page);
  border: var(--hair);
  box-shadow: 0 1px 0 color-mix(in oklab, var(--mi-label) 6%, transparent) inset, var(--mi-sh3), 0 40px 120px -40px color-mix(in oklab, var(--mi-p) 45%, transparent);
}
.chrome { display: flex; align-items: center; gap: 12px; height: 40px; padding: 0 14px; background: var(--mi-card); border-bottom: var(--hair); }
.dots { display: inline-flex; gap: 7px; }
.dots i { width: 11px; height: 11px; border-radius: 50%; background: var(--mi-fill); }
.url { margin-inline: auto; display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 7px; background: var(--mi-fill4); font-size: 12px; color: var(--mi-label2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.chrome-r { color: var(--mi-label3); display: inline-flex; }
.app { display: grid; grid-template-columns: 1fr; }
.rail { display: none; }
.appmain { display: flex; flex-direction: column; gap: 14px; padding: 16px; min-width: 0; }
.apphead { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.apphead-r { display: flex; align-items: center; gap: 10px; }
.hide-s { display: none; }
.kpis { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; }
@media (max-width: 479px) { .kpis > :nth-child(n+2) { display: none; } }
@media (max-width: 639px) { .kpis > :nth-child(3) { display: none; } }
.appbody { display: grid; gap: 12px; }
.appchart { min-width: 0; }
.applist { display: none; }
.applist-h { padding: 4px 6px 6px; }

/* floating cards: drift only while the stage is on screen */
.float { position: absolute; z-index: 3; display: none; }
.f1 { top: -30px; right: -24px; align-items: center; gap: 12px; }
.f2 { bottom: 18%; left: -128px; width: 220px; }
.f-ico { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: var(--mi-green); color: var(--mi-page); }
.drift .float { animation: drift 9s var(--mi-ease-in-out) infinite alternate; }
.drift .f2 { animation-duration: 11s; animation-delay: -4s; }
@keyframes drift { from { transform: translate3d(0, -6px, 0); } to { transform: translate3d(0, 8px, 0); } }

/* ---------- trust floor ---------- */
.floor { background: var(--mi-card); border-top: var(--hair); border-bottom: var(--hair); padding-top: calc(clamp(96px, 14vw, 200px) + clamp(48px, 6vw, 80px)); padding-bottom: clamp(56px, 7vw, 96px); }
.floor-k { text-align: center; font-size: 13px; color: var(--mi-label2); letter-spacing: .01em; }
.marks { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 18px 40px; margin-top: 24px; color: var(--mi-label2); }
.wm { line-height: 1; white-space: nowrap; opacity: .85; }
.wm-serif { font-family: var(--serif); font-style: italic; font-size: 22px; letter-spacing: -0.01em; }
.wm-caps { font-size: 13px; font-weight: 700; letter-spacing: .32em; text-transform: uppercase; }
.wm-heavy { font-size: 23px; font-weight: 800; letter-spacing: -0.06em; }
.wm-ring { font-size: 21px; font-weight: 400; letter-spacing: .01em; display: inline-flex; align-items: center; gap: 7px; }
.wm-ring::before { content: ''; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid currentColor; border-right-color: transparent; }
.wm-mono { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 15px; text-transform: uppercase; letter-spacing: .04em; }
.wm-serif2 { font-family: var(--serif); font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
.wm-light { font-size: 15px; font-weight: 300; letter-spacing: .2em; }
.wm-light b { font-weight: 700; letter-spacing: 0; text-transform: lowercase; margin-left: 2px; }
.stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 16px; margin-top: clamp(48px, 6vw, 80px); padding-top: clamp(32px, 4vw, 48px); border-top: var(--hair); }
.stat { display: flex; flex-direction: column-reverse; gap: 6px; }
.stat dd { font-size: clamp(2.25rem, 4.6vw, 3.5rem); font-weight: 650; letter-spacing: -0.045em; line-height: 1; font-variant-numeric: tabular-nums; }
.stat dt { font-size: 14px; color: var(--mi-label2); }

/* ---------- sections ---------- */
.sec { padding-top: var(--sec); }
.shead { display: flex; flex-direction: column; gap: 14px; max-width: 46rem; margin-bottom: clamp(32px, 4.5vw, 56px); }
.shead.center { align-items: center; text-align: center; margin-inline: auto; }
.split-head { max-width: none; }
.eyebrow { font-size: 12px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--mi-p-text); }
.h2 { font-size: clamp(2rem, 4.6vw, 3.4rem); line-height: 1.04; letter-spacing: -0.04em; font-weight: 660; text-wrap: balance; }
.shead-p { font-size: 17px; line-height: 1.55; color: var(--mi-label2); max-width: 34em; text-wrap: pretty; }

/* ---------- bento ---------- */
.bento { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
.tile {
  position: relative; display: flex; flex-direction: column; gap: 20px; min-width: 0;
  padding: 22px; border-radius: 22px; background: var(--mi-card); border: var(--hair);
  box-shadow: inset 0 1px 0 color-mix(in oklab, var(--mi-label) 5%, transparent), var(--mi-sh1);
}
.tile-copy h3, .tf-copy h3 { font-size: 18px; font-weight: 640; letter-spacing: -0.02em; }
.tile-copy p, .tf-copy p { margin-top: 6px; font-size: 15px; line-height: 1.5; color: var(--mi-label2); max-width: 32em; }
.tile-ui { margin-top: auto; min-width: 0; }
.t-a { overflow: hidden; }
.t-a::before { content: ''; position: absolute; inset: auto -20% -40% 20%; height: 70%; background: radial-gradient(closest-side, color-mix(in oklab, var(--mi-p) 14%, transparent), transparent); pointer-events: none; }
.ta-ui { display: grid; gap: 24px; position: relative; }
.ta-side { display: flex; flex-direction: column; justify-content: space-between; gap: 20px; }
.ta-num { font-size: clamp(2rem, 3.4vw, 2.75rem); font-weight: 660; letter-spacing: -0.045em; font-variant-numeric: tabular-nums; margin: 2px 0 10px; line-height: 1.05; }
.ta-facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.ta-facts > div { display: flex; flex-direction: column-reverse; gap: 2px; padding-top: 12px; border-top: var(--hair); }
.ta-facts dt { font-size: 12px; color: var(--mi-label2); }
.ta-facts dd { font-size: 18px; font-weight: 620; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.ta-chart { min-width: 0; max-width: 460px; width: 100%; justify-self: end; }
.ta-leg { display: flex; justify-content: flex-end; gap: 16px; margin-top: 6px; font-size: 12px; color: var(--mi-label2); position: relative; }
.ta-leg span { display: inline-flex; align-items: center; gap: 6px; }
.sw { width: 10px; height: 10px; border-radius: 3px; }
.sw-a { background: var(--mi-p); }
.sw-f { background: color-mix(in oklab, var(--mi-p) 38%, transparent); }

.tb-ui { display: flex; flex-direction: column; gap: 14px; }
.tb-run { padding: 14px 16px; border-radius: 14px; background: var(--mi-p-tint); }
.tb-num { font-size: 34px; font-weight: 660; letter-spacing: -0.04em; font-variant-numeric: tabular-nums; color: var(--mi-p-text); line-height: 1.1; }
.tb-num span { font-size: 15px; font-weight: 500; letter-spacing: 0; color: var(--mi-label2); }
.tb-rows { display: flex; flex-direction: column; }
.tb-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-top: var(--hair); cursor: pointer; }
.tb-row > span { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.tb-l { font-size: 14px; font-weight: 500; }
.tb-d { font-size: 12px; font-variant-numeric: tabular-nums; }
.tb-d.pos { color: var(--mi-green-t); }
.tb-d.neg { color: var(--mi-red-t); }

.tc-ui { margin-inline: -6px; }

.td-ui { display: flex; flex-direction: column; gap: 14px; }
.td-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.td-comment { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 16px; border-top-left-radius: 6px; background: var(--mi-page); border: var(--hair); }
.td-who { font-size: 12px; color: var(--mi-label2); }
.td-who b { color: var(--mi-label); font-weight: 600; }
.td-who span { color: var(--mi-p-text); font-weight: 500; }
.td-msg { font-size: 14px; line-height: 1.45; margin-top: 3px; }

.t-f { flex-direction: column; gap: 18px; background: var(--mi-page); }
.tf-copy { display: flex; gap: 14px; align-items: flex-start; }
.tf-ico { flex: none; color: var(--mi-p-text); margin-top: 2px; }
.tf-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.tf-chips li { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 999px; border: var(--hair); background: var(--mi-card); font-size: 13px; font-weight: 500; white-space: nowrap; }
.tf-chips :deep(svg) { color: var(--mi-green-t); }

/* ---------- steps ---------- */
.steps { position: relative; display: grid; gap: 36px; --n: 48px; }
.steps::before {
  content: ''; position: absolute; left: calc(var(--n) / 2 - .5px); top: 8px; bottom: 8px; width: 1px;
  background: linear-gradient(var(--mi-p), var(--mi-s) 70%, transparent);
}
.step { position: relative; display: grid; align-content: start; grid-template-columns: var(--n) minmax(0, 1fr); gap: 20px; align-items: start; }
.step-n {
  position: relative; z-index: 1; display: grid; place-items: center; width: var(--n); height: var(--n); border-radius: 50%;
  background: var(--mi-card); border: 1px solid color-mix(in oklab, var(--mi-p) 45%, var(--mi-sep));
  box-shadow: 0 0 0 6px var(--mi-page), 0 8px 24px -8px color-mix(in oklab, var(--mi-p) 50%, transparent);
  font-size: 14px; font-weight: 650; font-variant-numeric: tabular-nums; color: var(--mi-p-text);
}
.step-b { display: flex; flex-direction: column; gap: 8px; padding-top: 10px; }
.step-b h3 { font-size: 20px; font-weight: 640; letter-spacing: -0.025em; }
.step-b p { font-size: 15px; line-height: 1.55; color: var(--mi-label2); max-width: 30em; }
.step-t { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--mi-label2); margin-top: 4px; }

/* ---------- live ---------- */
.live { display: grid; gap: 28px; align-items: center; }
.live-copy { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.segwrap { max-width: 100%; overflow-x: auto; margin-top: 8px; }
.tiles { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; }
.live-chart { min-width: 0; box-shadow: var(--mi-sh2), 0 30px 80px -40px color-mix(in oklab, var(--mi-p) 40%, transparent); }

/* ---------- quote ---------- */
.quote { position: relative; max-width: 980px; margin-inline: auto; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 28px; }
.qmark { width: 44px; color: var(--mi-p); opacity: .9; }
.quote blockquote p {
  font-family: var(--serif); font-size: clamp(1.75rem, 4.2vw, 3.1rem); line-height: 1.16; letter-spacing: -0.02em;
  font-weight: 450; text-wrap: balance;
}
.who { display: flex; align-items: center; gap: 12px; text-align: left; }
.who-n { display: block; font-size: 15px; font-weight: 600; }
.who-r { display: block; font-size: 13px; color: var(--mi-label2); }
.qstats { display: grid; grid-template-columns: minmax(0, 1fr); width: 100%; margin-top: 12px; border-top: var(--hair); }
.qstats > div { padding: 18px 8px; display: flex; flex-direction: column-reverse; gap: 4px; border-bottom: var(--hair); }
.qstats dd { font-size: 22px; font-weight: 640; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.qstats dt { font-size: 13px; color: var(--mi-label2); }

/* ---------- pricing ---------- */
.billing { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; margin-top: 10px; }
.plans { display: grid; gap: 16px; align-items: stretch; }
.plan {
  position: relative; display: flex; flex-direction: column; gap: 14px; padding: 28px 24px; border-radius: 24px;
  background: var(--mi-card); border: var(--hair);
  box-shadow: inset 0 1px 0 color-mix(in oklab, var(--mi-label) 5%, transparent), var(--mi-sh1);
}
.plan.pop {
  border-color: color-mix(in oklab, var(--mi-p) 70%, transparent);
  box-shadow: 0 0 0 1px color-mix(in oklab, var(--mi-p) 40%, transparent), 0 30px 80px -30px color-mix(in oklab, var(--mi-p) 55%, transparent), var(--mi-sh2);
  background:
    radial-gradient(120% 60% at 50% 0%, color-mix(in oklab, var(--mi-p) 10%, transparent), transparent 70%),
    var(--mi-card);
}
.phead { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 26px; }
.phead h3 { font-size: 19px; font-weight: 640; letter-spacing: -0.02em; }
.pblurb { font-size: 15px; color: var(--mi-label2); line-height: 1.45; }
.price { display: flex; align-items: baseline; gap: 2px; margin-top: 8px; }
.pcur { font-size: 26px; font-weight: 600; color: var(--mi-label2); align-self: flex-start; margin-top: 6px; }
.pnum { display: inline-grid; overflow: clip; overflow-clip-margin: 4px; padding-block: 2px; }
.pval { grid-area: 1 / 1; font-size: clamp(3rem, 5vw, 3.75rem); font-weight: 680; letter-spacing: -0.05em; line-height: 1; font-variant-numeric: tabular-nums; }
.pper { margin-left: 8px; font-size: 14px; color: var(--mi-label2); }
.pbill { font-size: 13px; color: var(--mi-label2); margin-bottom: 8px; min-height: 1.4em; }
.tick-enter-active, .tick-leave-active { transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease); }
.tick-enter-from { opacity: 0; transform: translate3d(0, 70%, 0); }
.tick-leave-to { opacity: 0; transform: translate3d(0, -70%, 0); }
.incl { display: flex; flex-direction: column; gap: 11px; margin-top: 10px; padding-top: 20px; border-top: var(--hair); }
.incl li { display: flex; gap: 10px; align-items: center; font-size: 14px; }
.tick { color: var(--mi-p-text); flex: none; }
.plans-note { margin-top: 48px; text-align: center; font-size: 13px; color: var(--mi-label2); }

/* ---------- faq ---------- */
.faq { display: grid; gap: 32px; }
.faq-side { display: flex; flex-direction: column; gap: 14px; }
.faq-help { display: flex; gap: 12px; align-items: flex-start; margin-top: 10px; max-width: 24rem; }
.faq-help p { font-size: 14px; line-height: 1.5; color: var(--mi-label2); }

/* ---------- closing band ---------- */
.bandwrap { padding: var(--sec) var(--gut) 0; }
.band {
  position: relative; isolation: isolate; overflow: hidden; max-width: 1400px; margin-inline: auto;
  border-radius: 28px; background: var(--mi-card); color: var(--mi-label);
  border: 1px solid var(--mi-sep);
  box-shadow: inset 0 1px 0 color-mix(in oklab, var(--mi-label) 10%, transparent);
}
.band-aura { position: absolute; inset: 0; z-index: -1; background:
  radial-gradient(50% 70% at 18% 0%, color-mix(in oklab, var(--mi-p) 40%, transparent), transparent 70%),
  radial-gradient(40% 60% at 92% 100%, color-mix(in oklab, var(--mi-s) 34%, transparent), transparent 70%); }
.band-lines { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 22%; z-index: -1; opacity: .55; }
.band-in { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 18px; padding: clamp(64px, 10vw, 136px) 20px; }
.band-t { font-size: clamp(2.25rem, 6vw, 4.5rem); line-height: 1; letter-spacing: -0.045em; font-weight: 680; text-wrap: balance; max-width: 12em; }
.band-p { font-size: 17px; line-height: 1.55; color: var(--mi-label2); max-width: 30em; }
.band .ctas { margin-top: 8px; }
.band-k { font-size: 13px; color: var(--mi-label2); }

/* ---------- footer ---------- */
.foot { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 36px 20px; padding-top: clamp(56px, 7vw, 96px); }
.fbrand { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
.fbrand p { font-size: 14px; line-height: 1.5; color: var(--mi-label2); max-width: 22rem; }
.fstatus { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: var(--mi-label2); padding: 5px 10px; border-radius: 999px; border: var(--hair); }
.fstatus i { width: 7px; height: 7px; border-radius: 50%; background: var(--mi-green); }
.fcol-h { font-size: 13px; font-weight: 600; margin-bottom: 14px; }
.fcol ul { display: flex; flex-direction: column; gap: 10px; }
.fcol a, .fbase a { font-size: 14px; color: var(--mi-label2); text-decoration: none; }
.fcol a:hover, .fbase a:hover { color: var(--mi-label); }
.fbase { grid-column: 1 / -1; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; padding-top: 24px; margin-top: 12px; border-top: var(--hair); font-size: 13px; color: var(--mi-label2); }
.fbase-r { display: flex; gap: 20px; }
.fbase a { font-size: 13px; }

.lp a:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 3px; }

/* ---------- reveal (classes only added by JS after first scroll) ---------- */
.rv { opacity: 0; transform: translate3d(0, 22px, 0); }
.rv.rv-in { opacity: 1; transform: none; transition: opacity 800ms var(--mi-ease) var(--d, 0ms), transform 800ms var(--mi-ease) var(--d, 0ms); }
.bento > .rv:nth-child(2), .plans > .rv:nth-child(2) { --d: 80ms; }
.bento > .rv:nth-child(3), .plans > .rv:nth-child(3) { --d: 160ms; }
.bento > .rv:nth-child(5) { --d: 80ms; }

/* ---------- breakpoints ---------- */
@media (min-width: 480px) {
  .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 640px) {
  .kpis { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .band-lines { height: 46%; }
  .signin { display: inline-flex; }
  .hide-s { display: inline-flex; }
  .stats { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .stat { padding-left: 20px; border-left: var(--hair); }
  .stat:first-child { padding-left: 0; border-left: 0; }
  .bento { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .t-a, .t-f { grid-column: 1 / -1; }
  .qstats { grid-template-columns: repeat(3, minmax(0, 1fr)); border-bottom: var(--hair); }
  .qstats > div { border-bottom: 0; }
  .qstats > div + div { border-left: var(--hair); }
  .foot { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .appmain { padding: 20px; }
}
@media (min-width: 640px) {
  .ta-ui { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); align-items: end; }
}
@media (min-width: 900px) {
  .appbody { grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr); align-items: stretch; }
  .applist { display: block; }
}
@media (min-width: 1100px) {
  .t-f { flex-direction: row; align-items: center; justify-content: space-between; }
  .tf-chips { justify-content: flex-end; max-width: 68%; }
}
@media (min-width: 900px) {
  .sitenav { display: flex; }
  .siteact { margin-left: 0; }
  .app { grid-template-columns: 60px minmax(0, 1fr); }
  .rail { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 0; background: var(--mi-card); border-right: var(--hair); }
  .rail-mark { width: 26px; height: 26px; border-radius: 8px; background: var(--mi-p); margin-bottom: 14px; }
  .rail-i { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 10px; color: var(--mi-label2); }
  .rail-i.on { background: var(--mi-p-tint); color: var(--mi-p-text); }
  .appmain { padding: 24px; gap: 16px; }
  .bento { grid-template-columns: repeat(6, minmax(0, 1fr)); grid-auto-flow: dense; }
  .t-a { grid-column: span 4; grid-row: span 2; padding: 28px; }
  .t-f { grid-column: 1 / -1; }
  .split-head { flex-direction: row; justify-content: space-between; align-items: flex-end; gap: 48px; }
  .split-head > div { max-width: 40rem; }
  .split-head .shead-p { max-width: 24rem; }
  .steps { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px; }
  .steps::before { left: calc(var(--n) / 2); right: 0; top: calc(var(--n) / 2 - .5px); bottom: auto; width: auto; height: 1px; background: linear-gradient(90deg, var(--mi-p), var(--mi-s) 75%, transparent); }
  .step { grid-template-columns: minmax(0, 1fr); gap: 22px; }
  .step-b { padding-top: 0; padding-right: 12px; }
  .live { grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); gap: 56px; }
  .plans { grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: center; }
  .plan.pop { padding-block: 40px; }
  .faq { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: 72px; align-items: start; }
  .faq-side { position: sticky; top: 96px; }
  .foot { grid-template-columns: 1.6fr repeat(4, minmax(0, 1fr)); }
  .fbrand { grid-column: auto; }
}
/* t-b spans 2 rows next to t-a; t-c goes in the next band so the grid has no holes */
@media (min-width: 900px) {
  .t-b { grid-row: 1 / span 2; grid-column: 5 / span 2; }
  .t-c { grid-column: 1 / span 2; }
  .t-d { grid-column: 3 / span 2; }
  .t-e { grid-column: 5 / span 2; }
}
@media (min-width: 1100px) {
  .f1 { display: flex; }
}
@media (min-width: 1420px) {
  .f1 { right: -96px; }
  .f2 { display: block; }
}
@media (prefers-reduced-motion: reduce) {
  .drift .float { animation: none; }
  .rv { opacity: 1; transform: none; }
}
</style>

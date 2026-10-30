<template>
  <main class="lp">
    <!-- Hero -->
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__aura" aria-hidden="true" />
      <div class="hero__grid wrap">
        <div class="hero__copy">
          <a href="#start" class="pill rise" style="--d: 0ms">
            <span class="pill__tag">{{ t('hero.badge') }}</span>
            <span class="pill__note">{{ t('hero.badgeNote') }}</span>
            <MiIcon name="chevron-right" :size="14" />
          </a>
          <h1 id="hero-title" class="hero__title rise" style="--d: 60ms">
            {{ t('hero.title') }} <span class="hero__accent">{{ t('hero.titleAccent') }}</span>
          </h1>
          <p class="hero__lead rise" style="--d: 120ms">{{ t('hero.lead', { n: total, tag: '<MiButton>' }) }}</p>
          <div class="hero__ctas rise" style="--d: 180ms">
            <MiButton size="large" href="#start">{{ t('hero.primary') }}</MiButton>
            <MiButton size="large" variant="gray" :href="siteHref('/components')">{{ t('hero.secondary') }}</MiButton>
          </div>
          <div class="install rise" style="--d: 240ms">
            <code>{{ extendsLine }}</code>
            <MiIconButton size="small" variant="plain" :label="t('hero.copy')" @click="copy(extendsLine)">
              <MiIcon :name="copied ? 'check' : 'copy'" :size="15" />
            </MiIconButton>
          </div>
        </div>

        <div
          ref="stage" class="stage rise" style="--d: 200ms" role="img" :aria-label="t('hero.stageLabel')"
          @pointermove="onMove" @pointerleave="onLeave"
        >
          <div class="rig">
            <div class="sheet sheet--chart" style="--z: 0px">
              <div class="sheet__head">
                <MiText variant="footnote" weight="semibold">{{ t('sample.chart') }}</MiText>
                <MiBadge tone="success" variant="tint" dot label="+18.4%" />
              </div>
              <MiLineChart
                :categories="weeks" :series="usersSeries" :card="false" :toolbar="false" :toggle="false"
                :end-labels="false" :height="150" :ticks="3" unit="k" aria-label="Weekly active users"
              />
            </div>
            <div class="sheet sheet--stat" style="--z: 50px">
              <MiStatTile :label="t('sample.revenue')" value="$48.2k" delta="12.6%" :comparison="t('sample.vsLast')" :spark="[18, 22, 21, 27, 26, 31, 35, 34, 41, 48]" />
            </div>
            <div class="sheet sheet--settings" style="--z: 80px">
              <MiText variant="headline" as="p">{{ t('sample.settings') }}</MiText>
              <div class="row"><span id="s-sync">{{ t('sample.sync') }}</span><MiSwitch v-model="sync" size="compact" aria-labelledby="s-sync" /></div>
              <div class="row"><span id="s-alerts">{{ t('sample.alerts') }}</span><MiSwitch v-model="alerts" size="compact" tone="secondary" aria-labelledby="s-alerts" /></div>
              <MiSlider v-model="radius" :min="0" :max="24" :label="t('sample.radius')" unit=" px" />
              <div class="radius-demo" :style="{ borderRadius: radius + 'px' }" aria-hidden="true" />
            </div>
            <div class="sheet sheet--notif" style="--z: 110px">
              <MiNotification :title="t('sample.notifTitle')" :message="t('sample.notifBody')" :time="t('sample.now')" icon="success" tone="success" live="off" />
            </div>
          </div>
        </div>
      </div>

      <dl class="stats wrap">
        <div v-for="s in stats" :key="s.key" class="stats__item">
          <dt>{{ t('stats.' + s.key) }}</dt>
          <dd>{{ s.value }}</dd>
        </div>
      </dl>
    </section>

    <!-- Get started -->
    <section id="start" class="sec wrap" aria-labelledby="start-title">
      <header class="sec__head">
        <p class="eyebrow">{{ t('start.eyebrow') }}</p>
        <h2 id="start-title" class="sec__title">{{ t('start.title') }}</h2>
        <p class="sec__lead">{{ t('start.lead') }}</p>
      </header>
      <ol class="steps">
        <li class="step">
          <span class="step__n">1</span>
          <MiText variant="headline" as="h3">{{ t('start.s1') }}</MiText>
          <SiteCode file="nuxt.config.ts" :text="configCode" :copy-label="t('start.copy')" :copied-label="t('start.copied')" />
        </li>
        <li class="step">
          <span class="step__n">2</span>
          <MiText variant="headline" as="h3">{{ t('start.s2') }}</MiText>
          <SiteCode file="app.vue" :text="usageCode" :copy-label="t('start.copy')" :copied-label="t('start.copied')" />
          <div class="step__live"><MiButton size="large" @click="copy(extendsLine)">Ship it</MiButton></div>
        </li>
      </ol>
    </section>

    <!-- Components -->
    <section id="components" class="sec wrap" aria-labelledby="comp-title">
      <header class="sec__head">
        <p class="eyebrow">{{ t('components.eyebrow') }}</p>
        <h2 id="comp-title" class="sec__title">{{ t('components.title', { n: total }) }}</h2>
        <p class="sec__lead">{{ t('components.lead') }}</p>
      </header>
      <ul class="groups">
        <li v-for="g in groups" :key="g.name" class="group">
          <div class="group__specimen">
            <template v-if="g.name === 'Base'">
              <MiLogo :size="30" /><MiLogo variant="short" :size="30" dot="secondary" />
            </template>
            <template v-else-if="g.name === 'Buttons'">
              <MiButton size="small">Continue</MiButton><MiButton size="small" variant="gray">Cancel</MiButton>
            </template>
            <template v-else-if="g.name === 'Controls'">
              <MiSwitch v-model="specSwitch" label="Sample switch" />
              <MiSegmented v-model="specSeg" :options="segOptions" label="Sample segmented control" />
            </template>
            <template v-else-if="g.name === 'Inputs'">
              <MiSearch v-model="specSearch" size="compact" placeholder="Search" shortcut="⌘K" class="spec-search" />
            </template>
            <template v-else-if="g.name === 'Navigation'">
              <MiPageControl v-model="specPage" :count="5" aria-label="Sample pager" />
            </template>
            <template v-else-if="g.name === 'Feedback'">
              <MiProgress :value="64" size="sm" class="spec-progress" /><MiBadge :label="t('theming.new')" tone="secondary" />
            </template>
            <template v-else-if="g.name === 'Content'">
              <MiAvatarGroup :items="people" :max="4" size="sm" />
            </template>
            <template v-else-if="g.name === 'Chat'">
              <MiChip label="Message" tone="primary" /><MiChip label="Bubble" tone="neutral" />
            </template>
            <template v-else-if="g.name === 'Ai'">
              <MiChip label="Attachment" tone="secondary" /><MiChip label="CodeBlock" tone="neutral" />
            </template>
            <template v-else>
              <MiSparkline :values="[4, 7, 6, 9, 8, 12, 11, 15]" :width="120" :height="34" />
            </template>
          </div>
          <div class="group__body">
            <div class="group__title">
              <MiText variant="headline" as="h3"><NuxtLink :to="localePath('/components') + '?group=' + g.name" class="group__link">{{ t('explorer.groups.' + g.name) }}</NuxtLink></MiText>
              <span class="group__count">{{ t('components.count', { n: g.components.length }) }}</span>
            </div>
            <MiText variant="footnote" tone="label2">{{ t('components.groups.' + g.name) }}</MiText>
            <p class="group__names">
              <template v-for="(n, j) in g.components" :key="n"><NuxtLink :to="localePath('/components/' + toSlug(n))">{{ n.replace(/^Mi/, '') }}</NuxtLink><span v-if="j < g.components.length - 1" aria-hidden="true"> · </span></template>
            </p>
          </div>
        </li>
      </ul>
      <div class="groups__more">
        <MiButton variant="tinted" size="large" :href="siteHref('/components')">{{ t('components.explore') }}</MiButton>
      </div>
    </section>

    <!-- Theming -->
    <section id="theming" class="sec wrap" aria-labelledby="theme-title">
      <div class="theming">
        <div class="theming__copy">
          <p class="eyebrow">{{ t('theming.eyebrow') }}</p>
          <h2 id="theme-title" class="sec__title">{{ t('theming.title') }}</h2>
          <p class="sec__lead">{{ t('theming.lead') }}</p>
          <div class="theming__ctl">
            <MiColorPicker target="primary" :label="t('theming.primary')" />
            <MiColorPicker target="secondary" :label="t('theming.secondary')" />
            <div class="theming__mode">
              <MiText variant="subheadline" weight="semibold" as="span">{{ t('theming.appearance') }}</MiText>
              <MiThemeSwitcher :label="t('theme.label')" :labels="{ light: t('theme.light'), dark: t('theme.dark'), system: t('theme.system') }" />
            </div>
          </div>
        </div>
        <div class="preview">
          <div class="preview__card">
            <div class="preview__head">
              <span class="preview__mark" aria-hidden="true"><MiLogo variant="short" :size="18" tone="on-primary" dot="inherit" decorative /></span>
              <div>
                <MiText variant="headline" as="p">{{ t('theming.previewTitle') }} <MiBadge :label="t('theming.new')" tone="secondary" class="preview__badge" /></MiText>
                <MiText variant="footnote" tone="label2">{{ t('theming.previewSub') }}</MiText>
              </div>
            </div>
            <MiProgress :value="72" :label="t('theming.seats')" value-text="18 / 25" />
            <div class="row"><span id="p-auto">{{ t('theming.autopay') }}</span><MiSwitch v-model="autopay" aria-labelledby="p-auto" /></div>
            <div class="preview__chips">
              <MiChip v-for="(c, i) in chips" :key="c" v-model="chipOn[i]" selectable :tone="i === 1 ? 'secondary' : 'primary'" :label="c" />
            </div>
            <div class="preview__actions">
              <MiButton>{{ t('theming.upgrade') }}</MiButton>
              <MiButton variant="tinted" brand="secondary">{{ t('theming.manage') }}</MiButton>
            </div>
            <MiTextLink href="#theming">{{ t('theming.invoices') }}</MiTextLink>
          </div>
          <SiteCode file="app.vue" :text="themeCode" :copy-label="t('start.copy')" :copied-label="t('start.copied')" />
        </div>
      </div>
    </section>

    <!-- Craft -->
    <section id="craft" class="sec wrap" aria-labelledby="craft-title">
      <header class="sec__head">
        <p class="eyebrow">{{ t('craft.eyebrow') }}</p>
        <h2 id="craft-title" class="sec__title">{{ t('craft.title') }}</h2>
      </header>
      <div class="bento">
        <article class="tile tile--motion">
          <div class="tile__text">
            <MiText variant="title3" as="h3">{{ t('craft.motionTitle') }}</MiText>
            <MiText variant="subheadline" tone="label2">{{ t('craft.motionBody') }}</MiText>
          </div>
          <div class="spring">
            <div class="spring__track"><span class="spring__knob" :class="{ on: springOn }" /></div>
            <div class="spring__meta">
              <MiButton variant="tinted" size="small" @click="springOn = !springOn">{{ t('craft.motionTry') }}</MiButton>
              <span class="spring__fig"><b>16.7</b> ms</span>
            </div>
          </div>
        </article>
        <article class="tile tile--a11y">
          <div class="keys" aria-hidden="true"><kbd>Tab</kbd><kbd>←</kbd><kbd>→</kbd><kbd>Esc</kbd></div>
          <MiText variant="headline" as="h3">{{ t('craft.a11yTitle') }}</MiText>
          <MiText variant="footnote" tone="label2">{{ t('craft.a11yBody') }}</MiText>
        </article>
        <article class="tile tile--dark">
          <div class="duo" aria-hidden="true">
            <div class="duo__half mi-light"><span /><i /></div>
            <div class="duo__half mi-dark"><span /><i /></div>
          </div>
          <MiText variant="headline" as="h3">{{ t('craft.darkTitle') }}</MiText>
          <MiText variant="footnote" tone="label2">{{ t('craft.darkBody') }}</MiText>
        </article>
        <article class="tile">
          <div class="tile__glyph" aria-hidden="true"><MiIcon name="eye" :size="20" /></div>
          <MiText variant="headline" as="h3">{{ t('craft.ssrTitle') }}</MiText>
          <MiText variant="footnote" tone="label2">{{ t('craft.ssrBody') }}</MiText>
        </article>
        <article class="tile">
          <div class="tile__glyph" aria-hidden="true"><MiIcon name="document" :size="20" /></div>
          <MiText variant="headline" as="h3">{{ t('craft.typedTitle') }}</MiText>
          <MiText variant="footnote" tone="label2">{{ t('craft.typedBody') }}</MiText>
        </article>
        <article class="tile tile--zero">
          <span class="zero" aria-hidden="true">0</span>
          <MiText variant="headline" as="h3">{{ t('craft.zeroTitle') }}</MiText>
          <MiText variant="footnote" tone="label2">{{ t('craft.zeroBody') }}</MiText>
        </article>
      </div>
    </section>

    <!-- AI -->
    <section id="ai" class="sec wrap" aria-labelledby="ai-title">
      <div class="ai">
        <div class="ai__copy">
          <p class="eyebrow">{{ t('ai.eyebrow') }}</p>
          <h2 id="ai-title" class="sec__title">{{ t('ai.title') }}</h2>
          <p class="sec__lead">{{ t('ai.lead', { n: catalog?.all ?? 0 }) }}</p>
          <ul class="ai__points">
            <li v-for="n in 3" :key="n">
              <a v-if="aiLinks[n]" :href="aiLinks[n]" class="ai__link"><code>{{ t('ai.p' + n + 't') }}</code></a>
              <code v-else>{{ t('ai.p' + n + 't') }}</code>
              <MiText variant="subheadline" tone="label2" as="span">{{ t('ai.p' + n) }}</MiText>
            </li>
          </ul>
        </div>
        <SiteCode class="ai__file" :file="t('ai.file')" :text="catalog?.llms ?? ''" :copy-label="t('start.copy')" :copied-label="t('start.copied')" plain />
      </div>
    </section>

    <!-- Showcase -->
    <section id="showcase" class="sec wrap" aria-labelledby="show-title">
      <header class="sec__head">
        <p class="eyebrow">{{ t('showcase.eyebrow') }}</p>
        <h2 id="show-title" class="sec__title">{{ t('showcase.title') }}</h2>
        <p class="sec__lead">{{ t('showcase.lead') }}</p>
      </header>
      <ul class="demos">
        <li v-for="(d, i) in demos" :key="d">
          <a :href="config.public.showcaseUrl + '/' + d" class="demo" :class="'demo--' + d">
            <span class="demo__art" aria-hidden="true"><i /><i /><i /></span>
            <span class="demo__n">0{{ i + 1 }}</span>
            <MiText variant="title3" as="h3">{{ t('showcase.demos.' + d + '.title') }}</MiText>
            <MiText variant="footnote" tone="label2">{{ t('showcase.demos.' + d + '.body') }}</MiText>
            <span class="demo__open">{{ t('showcase.open') }} <MiIcon name="arrow-right" :size="15" /></span>
          </a>
        </li>
      </ul>
    </section>

    <!-- Closing CTA -->
    <section class="cta mi-dark" aria-labelledby="cta-title">
      <div class="cta__glow" aria-hidden="true" />
      <div class="cta__in wrap">
        <MiLogo variant="dot" :size="44" decorative />
        <h2 id="cta-title" class="cta__title">{{ t('cta.title') }}</h2>
        <code class="cta__code">{{ extendsLine }}</code>
        <p class="cta__lead">{{ t('cta.lead') }}</p>
        <div class="hero__ctas">
          <MiButton size="large" href="#start">{{ t('cta.primary') }}</MiButton>
          <MiButton size="large" variant="gray" :href="config.public.repoUrl">{{ t('cta.secondary') }}</MiButton>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { toSlug } from '~/utils/explorer'

const { t } = useI18n()
const localePath = useLocalePath()
const siteHref = useSiteHref()
const config = useRuntimeConfig()
const theme = useMiTheme()
const toast = useMiToast()
const { data: catalog } = await useFetch('/api/catalog')

// llms.txt is served by the site itself; docs/api has no index page, so it opens the folder on GitHub.
const aiLinks: Record<number, string> = {
  1: `${config.app.baseURL}llms.txt`,
  2: `${config.public.repoUrl}/tree/main/docs/api`
}
const extendsLine = "extends: ['github:DimitriDerthe/nuxt-mica']"
const configCode = "export default defineNuxtConfig({\n  extends: ['github:DimitriDerthe/nuxt-mica#v0.2.0']\n})"
const usageCode = '<MiButton size="large">\n  Ship it\n</MiButton>'
const themeCode = computed(() => `const { setPrimary, setMode } = useMiTheme()\nsetPrimary('${theme.primary.value}')\nsetMode('${theme.mode.value}')`)

const stats = computed(() => [
  { key: 'components', value: String(total.value) },
  { key: 'deps', value: '0' },
  { key: 'colors', value: '2' },
  { key: 'fps', value: '60' }
])
const total = computed(() => catalog.value?.total ?? 0)
const groups = computed(() => catalog.value?.groups ?? [])

// Hero sample state
const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10']
const usersSeries = [{ name: 'Active users', data: [12.4, 13.1, 12.8, 14.6, 15.2, 14.9, 16.8, 17.5, 18.1, 19.6], area: true }]
const sync = ref(true)
const alerts = ref(false)
const radius = ref(14)

// Component specimens
const specSwitch = ref(true)
const specSeg = ref('day')
const segOptions = [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }]
const specSearch = ref('')
const specPage = ref(1)
const people = [{ name: 'Ines Duarte' }, { name: 'Kenji Mori' }, { name: 'Ama Owusu' }, { name: 'Lars Berg' }, { name: 'Noa Levi' }, { name: 'Sami Haddad' }]

// Theming preview
const autopay = ref(true)
const chips = computed(() => [t('theming.chip1'), t('theming.chip2'), t('theming.chip3')])
const chipOn = ref([true, true, false])

const springOn = ref(false)
const demos = ['landing', 'dashboard', 'status', 'blog']

const copied = ref(false)
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    toast.success(t('hero.copied'))
    setTimeout(() => { copied.value = false }, 1600)
  } catch { /* clipboard denied */ }
}

// Pointer tilt for the hero sample: rAF-throttled, writes two custom properties used by a transform.
const stage = ref<HTMLElement>()
let raf = 0
let px = 0
let py = 0
const still = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
function apply() {
  raf = 0
  stage.value?.style.setProperty('--rx', `${(-py * 6).toFixed(2)}deg`)
  stage.value?.style.setProperty('--ry', `${(px * 9).toFixed(2)}deg`)
}
function onMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || !stage.value || still()) return
  const r = stage.value.getBoundingClientRect()
  px = (e.clientX - r.left) / r.width - 0.5
  py = (e.clientY - r.top) / r.height - 0.5
  if (!raf) raf = requestAnimationFrame(apply)
}
function onLeave() { px = 0; py = 0; if (!raf) raf = requestAnimationFrame(apply) }
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<style scoped>
.wrap { max-width: 1200px; margin: 0 auto; padding-left: 24px; padding-right: 24px; box-sizing: border-box; }
@media (max-width: 480px) { .wrap { padding-left: 16px; padding-right: 16px; } }

/* Entrance: transform + opacity only, staggered with --d. */
.rise { animation: lp-rise var(--mi-dur-4) var(--mi-ease) var(--d, 0ms) backwards; }
@keyframes lp-rise { from { opacity: 0; transform: translate3d(0, 18px, 0); } }

/* Hero */
.hero { position: relative; isolation: isolate; padding: clamp(48px, 9vw, 120px) 0 0; }
.hero__aura {
  position: absolute; inset: -120px 0 auto; height: 900px; z-index: -1; pointer-events: none;
  background:
    radial-gradient(38% 42% at 22% 30%, color-mix(in oklab, var(--mi-p) 20%, transparent), transparent 70%),
    radial-gradient(30% 36% at 78% 26%, color-mix(in oklab, var(--mi-s) 16%, transparent), transparent 70%),
    radial-gradient(40% 30% at 60% 70%, color-mix(in oklab, var(--mi-p) 10%, transparent), transparent 70%);
}
.hero__grid { display: grid; gap: clamp(40px, 6vw, 64px); align-items: center; }
@media (min-width: 1040px) { .hero__grid { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); } }
.hero__copy { display: grid; justify-items: start; gap: 22px; }
.pill { display: inline-flex; align-items: center; gap: 8px; padding: 4px 10px 4px 4px; border-radius: 999px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); font-size: 13px; color: var(--mi-label2); text-decoration: none; transition: transform var(--mi-dur-2) var(--mi-ease); }
.pill:hover { transform: translate3d(0, -1px, 0); }
.pill__tag { padding: 3px 9px; border-radius: 999px; background: var(--mi-p-tint); color: var(--mi-p-text); font-weight: 600; }
.hero__title { margin: 0; font-size: clamp(44px, 7.2vw, 92px); line-height: .98; letter-spacing: -.05em; font-weight: 700; text-wrap: balance; }
.hero__accent { display: block; background: linear-gradient(100deg, var(--mi-p-text) 10%, var(--mi-s-text) 90%); -webkit-background-clip: text; background-clip: text; color: transparent; padding-bottom: .06em; }
.hero__lead { margin: 0; max-width: 52ch; font-size: clamp(17px, 1.7vw, 20px); line-height: 1.5; color: var(--mi-label2); text-wrap: pretty; }
.hero__ctas { display: flex; flex-wrap: wrap; gap: 10px; }
.install { display: inline-flex; align-items: center; gap: 10px; padding: 4px 4px 4px 14px; border-radius: 12px; background: var(--mi-fill4); }
.install code { font: 13px/1 ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label); }

/* Hero stage: sheets of real components on a tilting rig (no overlap; depth via translateZ). */
.stage { perspective: 1600px; --rx: 0deg; --ry: 0deg; }
.rig {
  display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-areas: "chart chart" "stat settings" "notif settings";
  transform-style: preserve-3d; transform: rotateX(calc(4deg + var(--rx))) rotateY(calc(-7deg + var(--ry)));
  transition: transform 700ms var(--mi-ease);
}
.sheet { transform: translateZ(var(--z)); border-radius: 20px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep), var(--mi-sh2); padding: 16px; box-sizing: border-box; min-width: 0; }
.sheet--chart { grid-area: chart; padding-bottom: 6px; }
.sheet--stat { grid-area: stat; padding: 0; overflow: hidden; }
.sheet--stat > :deep(*) { height: 100%; box-shadow: none; }
.sheet--settings { grid-area: settings; display: grid; gap: 12px; align-content: start; }
.sheet--notif { grid-area: notif; padding: 0; background: none; box-shadow: none; }
.sheet--notif > :deep(*) { height: 100%; box-sizing: border-box; box-shadow: 0 0 0 1px var(--mi-sep), var(--mi-sh2); }
.sheet__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 15px; }
.radius-demo { height: 44px; background: linear-gradient(135deg, var(--mi-p-tint), var(--mi-s-tint)); box-shadow: inset 0 0 0 1px var(--mi-sep); }
@media (max-width: 1039px) { .rig { transform: none; } .sheet { transform: none; } }
@media (max-width: 560px) {
  .rig { grid-template-columns: minmax(0, 1fr); grid-template-areas: "chart" "stat" "notif" "settings"; }
}

.stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 16px; margin-top: clamp(56px, 8vw, 96px); padding-top: 28px; padding-bottom: 8px; }
@media (min-width: 820px) { .stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.stats__item { display: grid; grid-template-areas: "v" "l"; align-content: start; gap: 6px; padding-top: 16px; border-top: 1px solid var(--mi-sep); }
.stats__item dd { grid-area: v; }
.stats__item dt { grid-area: l; }
.stats dd { margin: 0; font-size: clamp(34px, 4vw, 48px); font-weight: 700; letter-spacing: -.04em; line-height: 1; font-variant-numeric: tabular-nums; }
.stats dt { font-size: 14px; color: var(--mi-label2); max-width: 22ch; }

/* Sections */
.sec { padding-top: clamp(88px, 12vw, 160px); }
/* Skip style/layout/paint of off-screen sections; the browser remembers each real height after first render. */
.sec:not(#start) { content-visibility: auto; contain-intrinsic-size: auto 900px; }
.sec__head { display: grid; gap: 14px; max-width: 760px; margin-bottom: clamp(36px, 5vw, 56px); }
.eyebrow { margin: 0; font-size: 14px; font-weight: 600; color: var(--mi-p-text); }
.sec__title { margin: 0; font-size: clamp(32px, 4.6vw, 56px); line-height: 1.04; letter-spacing: -.04em; font-weight: 700; text-wrap: balance; }
.sec__lead { margin: 0; max-width: 60ch; font-size: clamp(16px, 1.5vw, 19px); line-height: 1.55; color: var(--mi-label2); text-wrap: pretty; }

/* Steps */
.steps { display: grid; gap: 16px; list-style: none; margin: 0; padding: 0; }
@media (min-width: 900px) { .steps { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.step { position: relative; display: flex; flex-direction: column; gap: 14px; padding: 22px; border-radius: 22px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); min-width: 0; }
.step__n { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--mi-p); color: var(--mi-p-on); font-size: 14px; font-weight: 700; }
.step :deep(.code) { background: var(--mi-page); }
.step__live { display: flex; justify-content: center; padding: 18px; border-radius: 14px; border: 1px dashed var(--mi-sep); }

/* Component groups */
.groups { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); list-style: none; margin: 0; padding: 0; }
.group { position: relative; cursor: pointer; display: flex; flex-direction: column; border-radius: 22px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); overflow: hidden; transition: transform var(--mi-dur-3) var(--mi-spring); }
.group:hover { transform: translate3d(0, -3px, 0); }
.group__specimen { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 12px; min-height: 120px; padding: 20px; box-sizing: border-box; background: radial-gradient(120% 120% at 0% 0%, var(--mi-p-tint2), transparent 60%), var(--mi-fill4); border-bottom: 1px solid var(--mi-sep); }
.spec-search { width: 100%; max-width: 220px; }
.spec-progress { width: 140px; }
.group__body { display: grid; gap: 6px; padding: 18px 20px 20px; }
.group__title { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.group__link { color: inherit; text-decoration: none; }
.group__link::after { content: ""; position: absolute; inset: 0; border-radius: inherit; }
.group__link:focus-visible { outline: none; }
.group:has(.group__link:focus-visible) { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.group__count { font-size: 12px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums; white-space: nowrap; }
.group__names { margin: 6px 0 0; font-size: 12px; line-height: 1.6; color: var(--mi-label3); }
.group__names { position: relative; z-index: 1; }
.group__names a { color: var(--mi-label2); text-decoration: none; }
.group__names a:hover { color: var(--mi-p-text); text-decoration: underline; }
.groups__more { display: flex; justify-content: center; margin-top: 28px; }

/* Theming */
.theming { display: grid; gap: 40px; align-items: center; }
@media (min-width: 1000px) { .theming { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 64px; } }
.theming__copy { display: grid; gap: 14px; }
.theming__ctl { display: grid; gap: 18px; margin-top: 12px; padding: 20px; border-radius: 22px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); }
.theming__mode { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
.preview { position: relative; display: grid; gap: 14px; padding: clamp(16px, 3vw, 28px); border-radius: 28px; background: radial-gradient(80% 80% at 100% 0%, var(--mi-s-tint2), transparent 60%), radial-gradient(80% 80% at 0% 100%, var(--mi-p-tint2), transparent 60%), var(--mi-fill4); }
.preview__card { display: grid; gap: 18px; padding: 22px; border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh2); }
.preview__head { display: flex; align-items: center; gap: 14px; }
.preview__mark { display: grid; place-items: center; flex: none; width: 44px; height: 44px; border-radius: 12px; background: var(--mi-p); }
.preview__badge { vertical-align: 2px; margin-left: 6px; }
.preview__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.preview__actions { display: flex; flex-wrap: wrap; gap: 10px; }

/* Craft bento */
.bento { display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 720px) { .bento { grid-template-columns: repeat(2, minmax(0, 1fr)); } .tile--motion, .tile--zero { grid-column: 1 / -1; } }
@media (min-width: 1040px) {
  .bento { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .tile--motion { grid-column: span 2; grid-row: span 2; }
  .tile--zero { grid-column: 1 / -1; display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; column-gap: 28px; align-items: center; }
  .tile--zero .zero { grid-row: span 2; margin: 0; font-size: 96px; }
}
.tile { display: flex; flex-direction: column; gap: 8px; padding: 24px; border-radius: 22px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); min-width: 0; }
.tile__glyph { display: grid; place-items: center; width: 40px; height: 40px; margin-bottom: 10px; border-radius: 12px; background: var(--mi-p-tint); color: var(--mi-p-text); }
.tile--motion { justify-content: space-between; gap: 28px; background: radial-gradient(90% 90% at 100% 100%, var(--mi-p-tint2), transparent 60%), var(--mi-card); }
.tile__text { display: grid; gap: 10px; max-width: 46ch; }
.spring { display: grid; gap: 16px; }
.spring__track { position: relative; height: 72px; border-radius: 22px; background: var(--mi-fill4); box-shadow: inset 0 0 0 1px var(--mi-sep); overflow: hidden; container-type: inline-size; }
.spring__knob { position: absolute; left: 8px; top: 8px; width: 56px; height: 56px; border-radius: 16px; background: var(--mi-p); box-shadow: var(--mi-sh2); transition: transform 900ms var(--mi-spring); }
.spring__knob.on { transform: translate3d(calc(100cqw - 72px), 0, 0) rotate(90deg); }
.spring__meta { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.spring__fig { font-size: 13px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.spring__fig b { font-size: 22px; letter-spacing: -.02em; color: var(--mi-label); }
.keys { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.keys kbd { min-width: 22px; padding: 5px 8px; border-radius: 8px; background: var(--mi-fill4); box-shadow: inset 0 -1px 0 var(--mi-sep), 0 0 0 1px var(--mi-sep); font: 600 12px/1 var(--mi-font); color: var(--mi-label); text-align: center; }
.duo { display: grid; grid-template-columns: 1fr 1fr; height: 64px; margin-bottom: 10px; border-radius: 14px; overflow: hidden; box-shadow: 0 0 0 1px var(--mi-sep); }
.duo__half { position: relative; background: var(--mi-page); }
.duo__half span { position: absolute; left: 10px; right: 10px; top: 10px; height: 26px; border-radius: 8px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.duo__half i { position: absolute; left: 10px; bottom: 10px; width: 40%; height: 6px; border-radius: 3px; background: var(--mi-label2); }
.zero { font-size: 64px; line-height: .9; font-weight: 700; letter-spacing: -.05em; margin-bottom: 6px; background: linear-gradient(160deg, var(--mi-p-text), var(--mi-s-text)); -webkit-background-clip: text; background-clip: text; color: transparent; width: fit-content; }

/* AI */
.ai { display: grid; gap: 40px; align-items: center; }
@media (min-width: 1000px) { .ai { grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 64px; } }
.ai__copy { display: grid; gap: 14px; }
.ai__points { display: grid; gap: 14px; list-style: none; margin: 12px 0 0; padding: 0; }
.ai__points li { display: grid; grid-template-columns: 96px 1fr; gap: 14px; align-items: baseline; padding-top: 14px; border-top: 1px solid var(--mi-sep); }
.ai__link { text-decoration: none; border-radius: 4px; }
.ai__link:hover code { text-decoration: underline; text-underline-offset: 3px; }
.ai__link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.ai__points code { font: 600 13px/1.4 ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-p-text); }
.ai__file :deep(.code__pre) { max-height: 420px; font-size: 12px; white-space: pre-wrap; overflow-wrap: anywhere; }
@media (max-width: 480px) { .ai__points li { grid-template-columns: 1fr; gap: 4px; } }

/* Showcase */
.demos { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr)); list-style: none; margin: 0; padding: 0; }
.demo { position: relative; display: flex; flex-direction: column; gap: 8px; height: 100%; box-sizing: border-box; padding: 22px; border-radius: 22px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); color: inherit; text-decoration: none; overflow: hidden; transition: transform var(--mi-dur-3) var(--mi-spring); }
.demo:hover { transform: translate3d(0, -4px, 0); }
.demo:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 3px; }
.demo__art { position: relative; height: 120px; margin: -22px -22px 12px; background: var(--mi-fill4); overflow: hidden; }
.demo__art i { position: absolute; border-radius: 10px; background: var(--mi-card); box-shadow: var(--mi-sh1); transition: transform var(--mi-dur-3) var(--mi-spring); }
.demo:hover .demo__art i:nth-child(2) { transform: translate3d(0, -6px, 0); }
.demo--landing .demo__art { background: radial-gradient(90% 120% at 0% 0%, var(--mi-p-tint), transparent 70%), var(--mi-fill4); }
.demo--landing .demo__art i:nth-child(1) { left: 22px; top: 26px; width: 55%; height: 14px; background: var(--mi-label); opacity: .8; border-radius: 7px; }
.demo--landing .demo__art i:nth-child(2) { left: 22px; top: 52px; width: 70px; height: 24px; background: var(--mi-p); border-radius: 12px; }
.demo--landing .demo__art i:nth-child(3) { right: -20px; bottom: -30px; width: 110px; height: 110px; border-radius: 50%; background: linear-gradient(135deg, var(--mi-p), var(--mi-s)); }
.demo--dashboard .demo__art { background: radial-gradient(90% 120% at 100% 0%, var(--mi-s-tint), transparent 70%), var(--mi-fill4); }
.demo--dashboard .demo__art i:nth-child(1) { left: 0; top: 0; bottom: 0; width: 40px; border-radius: 0; }
.demo--dashboard .demo__art i:nth-child(2) { left: 56px; top: 20px; right: 20px; height: 36px; }
.demo--dashboard .demo__art i:nth-child(3) { left: 56px; top: 66px; right: 20px; height: 40px; background: linear-gradient(180deg, var(--mi-p-tint), var(--mi-card)); }
.demo--status .demo__art { background: radial-gradient(90% 120% at 0% 0%, color-mix(in oklab, var(--mi-green) 20%, transparent), transparent 70%), var(--mi-fill4); }
.demo--status .demo__art i:nth-child(1) { left: 22px; top: 24px; width: 30px; height: 30px; border-radius: 50%; background: var(--mi-green); }
.demo--status .demo__art i:nth-child(2) { left: 62px; top: 32px; width: 50%; height: 14px; border-radius: 7px; }
.demo--status .demo__art i:nth-child(3) { left: 22px; right: 22px; bottom: 22px; height: 20px; border-radius: 4px; background: repeating-linear-gradient(90deg, color-mix(in oklab, var(--mi-green) 70%, var(--mi-card)) 0 6px, transparent 6px 9px); box-shadow: none; }
.demo--blog .demo__art { background: radial-gradient(90% 120% at 100% 100%, var(--mi-s-tint), transparent 70%), var(--mi-fill4); }
.demo--blog .demo__art i:nth-child(1) { left: 22px; top: 22px; width: 84px; height: 76px; background: linear-gradient(160deg, var(--mi-s-tint), var(--mi-p-tint)); }
.demo--blog .demo__art i:nth-child(2) { left: 120px; top: 28px; right: 22px; height: 16px; border-radius: 4px; }
.demo--blog .demo__art i:nth-child(3) { left: 120px; top: 54px; width: 30%; height: 8px; border-radius: 4px; background: var(--mi-label3); box-shadow: none; }
.demo__n { font-size: 12px; font-weight: 600; color: var(--mi-p-text); font-variant-numeric: tabular-nums; }
.demo__open { display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 10px; font-size: 14px; font-weight: 600; color: var(--mi-p-text); }

/* Closing CTA: dark surface in both appearances, through the layer's .mi-dark token class. */
.cta { position: relative; isolation: isolate; overflow: hidden; margin-top: clamp(96px, 12vw, 160px); padding: clamp(72px, 10vw, 128px) 0; background: var(--mi-page); color: var(--mi-label); text-align: center; }
.cta__glow { position: absolute; inset: 0; z-index: -1; background: radial-gradient(40% 60% at 50% 0%, color-mix(in oklab, var(--mi-p) 34%, transparent), transparent 70%), radial-gradient(30% 40% at 85% 100%, color-mix(in oklab, var(--mi-s) 22%, transparent), transparent 70%); }
.cta__in { display: grid; justify-items: center; gap: 20px; }
.cta__title { margin: 0; font-size: clamp(40px, 6vw, 76px); line-height: 1; letter-spacing: -.05em; font-weight: 700; }
.cta__code { padding: 10px 16px; border-radius: 12px; background: var(--mi-fill4); box-shadow: 0 0 0 1px var(--mi-sep); font: 15px/1 ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label); }
.cta__lead { margin: 0; color: var(--mi-label2); font-size: 17px; }
.cta .hero__ctas { justify-content: center; }

@media (prefers-reduced-motion: reduce) {
  .rise { animation: none; }
  .rig { transition: none; }
  .pill:hover, .group:hover, .demo:hover, .demo:hover .demo__art i { transform: none; }
  .spring__knob { transition-duration: 1ms; }
}
</style>

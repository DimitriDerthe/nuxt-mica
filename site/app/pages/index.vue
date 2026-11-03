<template>
  <main class="lp">
    <!-- Hero -->
    <section class="hero mi:relative mi:isolate mi:pt-[clamp(48px,_9vw,_120px)] mi:px-0 mi:pb-0" aria-labelledby="hero-title">
      <div class="hero__aura mi:absolute mi:-top-30 mi:right-0 mi:bottom-auto mi:left-0 mi:h-225 mi:-z-1 mi:pointer-events-none mi:[background:radial-gradient(38%_42%_at_22%_30%,_color-mix(in_oklab,_var(--mi-p)_20%,_transparent),_transparent_70%),_radial-gradient(30%_36%_at_78%_26%,_color-mix(in_oklab,_var(--mi-s)_16%,_transparent),_transparent_70%),_radial-gradient(40%_30%_at_60%_70%,_color-mix(in_oklab,_var(--mi-p)_10%,_transparent),_transparent_70%)]" aria-hidden="true" />
      <div class="hero__grid wrap mi:max-w-300 mi:my-0 mi:mx-auto mi:pl-6 mi:pr-6 mi:box-border mi:max-[480px]:pl-4 mi:max-[480px]:pr-4 mi:grid mi:gap-[clamp(40px,_6vw,_64px)] mi:items-center mi:min-[1040px]:grid-cols-[minmax(0,_1.05fr)_minmax(0,_1fr)]">
        <div class="hero__copy mi:grid mi:justify-items-start mi:gap-5.5">
          <a href="#start" class="pill rise mi:inline-flex mi:items-center mi:gap-2 mi:pt-1 mi:pr-2.5 mi:pb-1 mi:pl-1 mi:rounded-[999px] mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:text-[13px] mi:text-label2 mi:[text-decoration:none] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translate3d(0,_-1px,_0)] mi:motion-reduce:hover:transform-none" style="--d: 0ms">
            <span class="pill__tag mi:py-[3px] mi:px-[9px] mi:rounded-[999px] mi:[background:var(--mi-p-tint)] mi:text-p-text mi:font-semibold">{{ t('hero.badge') }}</span>
            <span class="pill__note">{{ t('hero.badgeNote', { v: config.public.version }) }}</span>
            <MiIcon name="chevron-right" :size="14" />
          </a>
          <h1 id="hero-title" class="hero__title rise mi:m-0 mi:text-[clamp(44px,_7.2vw,_92px)] mi:leading-[.98] mi:tracking-[-.05em] mi:font-bold mi:text-balance" style="--d: 60ms">
            {{ t('hero.title') }} <span class="hero__accent mi:block mi:text-transparent mi:pb-[.06em]">{{ t('hero.titleAccent') }}</span>
          </h1>
          <p class="hero__lead rise mi:m-0 mi:max-w-[52ch] mi:text-[clamp(17px,_1.7vw,_20px)] mi:leading-normal mi:text-label2 mi:text-pretty" style="--d: 120ms">{{ t('hero.lead', { n: total, tag: '<MiButton>' }) }}</p>
          <div class="hero__ctas rise mi:flex mi:flex-wrap mi:gap-2.5 mi:[.cta_&]:justify-center" style="--d: 180ms">
            <MiButton size="large" href="#start">{{ t('hero.primary') }}</MiButton>
            <MiButton size="large" variant="gray" :href="siteHref('/components')">{{ t('hero.secondary') }}</MiButton>
          </div>
          <div class="install rise mi:inline-flex mi:items-center mi:gap-2.5 mi:pt-1 mi:pr-1 mi:pb-1 mi:pl-3.5 mi:rounded-[12px] mi:[background:var(--mi-fill4)]" style="--d: 240ms">
            <code>{{ extendsLine }}</code>
            <MiIconButton size="small" variant="plain" :label="t('hero.copy')" @click="copy(extendsLine)">
              <MiIcon :name="copied ? 'check' : 'copy'" :size="15" />
            </MiIconButton>
          </div>
        </div>

        <div
          ref="stage" class="stage rise mi:[perspective:1600px] mi:[--rx:0deg] mi:[--ry:0deg]" style="--d: 200ms" role="img" :aria-label="t('hero.stageLabel')"
          @pointermove="onMove" @pointerleave="onLeave"
        >
          <div class="rig mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:[grid-template-areas:'chart_chart'_'stat_settings'_'notif_settings'] mi:[transform-style:preserve-3d] mi:transform-[rotateX(calc(4deg_+_var(--rx)))_rotateY(calc(-7deg_+_var(--ry)))] mi:[transition:transform_700ms_var(--mi-ease)] mi:max-[1039px]:transform-none mi:max-[560px]:grid-cols-[minmax(0,_1fr)] mi:max-[560px]:[grid-template-areas:'chart'_'stat'_'notif'_'settings'] mi:motion-reduce:[transition:none]">
            <div class="sheet sheet--chart mi:transform-[translateZ(var(--z))] mi:rounded-[20px] mi:shadow-[0_0_0_1px_var(--mi-sep),_var(--mi-sh2)] mi:box-border mi:min-w-0 mi:[grid-area:chart] mi:max-[1039px]:transform-none" style="--z: 0px">
              <div class="sheet__head mi:flex mi:items-center mi:justify-between mi:gap-2 mi:mb-1">
                <MiText variant="footnote" weight="semibold">{{ t('sample.chart') }}</MiText>
                <MiBadge tone="success" variant="tint" dot label="+18.4%" />
              </div>
              <MiLineChart
                :categories="weeks" :series="usersSeries" :card="false" :toolbar="false" :toggle="false"
                :end-labels="false" :height="150" :ticks="3" unit="k" aria-label="Weekly active users"
              />
            </div>
            <div class="sheet sheet--stat mi:transform-[translateZ(var(--z))] mi:rounded-[20px] mi:shadow-[0_0_0_1px_var(--mi-sep),_var(--mi-sh2)] mi:box-border mi:min-w-0 mi:[grid-area:stat] mi:overflow-hidden mi:max-[1039px]:transform-none" style="--z: 50px">
              <MiStatTile :label="t('sample.revenue')" value="$48.2k" delta="12.6%" :comparison="t('sample.vsLast')" :spark="[18, 22, 21, 27, 26, 31, 35, 34, 41, 48]" />
            </div>
            <div class="sheet sheet--settings mi:transform-[translateZ(var(--z))] mi:rounded-[20px] mi:shadow-[0_0_0_1px_var(--mi-sep),_var(--mi-sh2)] mi:box-border mi:min-w-0 mi:[grid-area:settings] mi:grid mi:gap-3 mi:content-start mi:max-[1039px]:transform-none" style="--z: 80px">
              <MiText variant="headline" as="p">{{ t('sample.settings') }}</MiText>
              <div class="row mi:flex mi:items-center mi:justify-between mi:gap-3 mi:text-[15px]"><span id="s-sync">{{ t('sample.sync') }}</span><MiSwitch v-model="sync" size="compact" aria-labelledby="s-sync" /></div>
              <div class="row mi:flex mi:items-center mi:justify-between mi:gap-3 mi:text-[15px]"><span id="s-alerts">{{ t('sample.alerts') }}</span><MiSwitch v-model="alerts" size="compact" tone="secondary" aria-labelledby="s-alerts" /></div>
              <MiSlider v-model="radius" :min="0" :max="24" :label="t('sample.radius')" unit=" px" />
              <div class="radius-demo mi:h-11 mi:[background:linear-gradient(135deg,_var(--mi-p-tint),_var(--mi-s-tint))] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]" :style="{ borderRadius: radius + 'px' }" aria-hidden="true" />
            </div>
            <div class="sheet sheet--notif mi:transform-[translateZ(var(--z))] mi:rounded-[20px] mi:shadow-[0_0_0_1px_var(--mi-sep),_var(--mi-sh2)] mi:box-border mi:min-w-0 mi:[grid-area:notif] mi:shadow-none mi:max-[1039px]:transform-none" style="--z: 110px">
              <MiNotification :title="t('sample.notifTitle')" :message="t('sample.notifBody')" :time="t('sample.now')" icon="success" tone="success" live="off" />
            </div>
          </div>
        </div>
      </div>

      <dl class="stats wrap mi:max-w-300 mi:my-0 mi:mx-auto mi:pl-6 mi:pr-6 mi:box-border mi:max-[480px]:pl-4 mi:max-[480px]:pr-4 mi:grid mi:grid-cols-2 mi:gap-y-6 mi:gap-x-4 mi:mt-[clamp(56px,_8vw,_96px)] mi:pt-7 mi:pb-2 mi:min-[820px]:grid-cols-4">
        <div v-for="s in stats" :key="s.key" class="stats__item mi:grid mi:[grid-template-areas:'v'_'l'] mi:content-start mi:gap-1.5 mi:pt-4 mi:border-t mi:border-t-sep">
          <dt>{{ t('stats.' + s.key) }}</dt>
          <dd>{{ s.value }}</dd>
        </div>
      </dl>
    </section>

    <!-- Get started -->
    <section id="start" class="sec wrap mi:max-w-300 mi:my-0 mi:mx-auto mi:pl-6 mi:pr-6 mi:box-border mi:max-[480px]:pl-4 mi:max-[480px]:pr-4 mi:pt-[clamp(88px,_12vw,_160px)] mi:[&:not(#start)]:[content-visibility:auto] mi:[&:not(#start)]:[contain-intrinsic-size:auto_900px]" aria-labelledby="start-title">
      <header class="sec__head mi:grid mi:gap-3.5 mi:max-w-190 mi:mb-[clamp(36px,_5vw,_56px)]">
        <p class="eyebrow mi:m-0 mi:text-[14px] mi:font-semibold mi:text-p-text">{{ t('start.eyebrow') }}</p>
        <h2 id="start-title" class="sec__title mi:m-0 mi:text-[clamp(32px,_4.6vw,_56px)] mi:leading-[1.04] mi:tracking-[-.04em] mi:font-bold mi:text-balance">{{ t('start.title') }}</h2>
        <p class="sec__lead mi:m-0 mi:max-w-[60ch] mi:text-[clamp(16px,_1.5vw,_19px)] mi:leading-[1.55] mi:text-label2 mi:text-pretty">{{ t('start.lead') }}</p>
      </header>
      <ol class="steps mi:grid mi:gap-4 mi:[list-style:none] mi:m-0 mi:p-0 mi:min-[900px]:grid-cols-2">
        <li class="step mi:relative mi:flex mi:flex-col mi:gap-3.5 mi:p-5.5 mi:rounded-[22px] mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:min-w-0">
          <span class="step__n mi:grid mi:place-items-center mi:w-7 mi:h-7 mi:rounded-[50%] mi:[background:var(--mi-p)] mi:text-p-on mi:text-[14px] mi:font-bold">1</span>
          <MiText variant="headline" as="h3">{{ t('start.s1') }}</MiText>
          <SiteCode file="nuxt.config.ts" :text="configCode" :copy-label="t('start.copy')" :copied-label="t('start.copied')" />
        </li>
        <li class="step mi:relative mi:flex mi:flex-col mi:gap-3.5 mi:p-5.5 mi:rounded-[22px] mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:min-w-0">
          <span class="step__n mi:grid mi:place-items-center mi:w-7 mi:h-7 mi:rounded-[50%] mi:[background:var(--mi-p)] mi:text-p-on mi:text-[14px] mi:font-bold">2</span>
          <MiText variant="headline" as="h3">{{ t('start.s2') }}</MiText>
          <SiteCode file="app.vue" :text="usageCode" :copy-label="t('start.copy')" :copied-label="t('start.copied')" />
          <div class="step__live mi:flex mi:justify-center mi:p-4.5 mi:rounded-[14px] mi:[border:1px_dashed_var(--mi-sep)]"><MiButton size="large" @click="copy(extendsLine)">Ship it</MiButton></div>
        </li>
      </ol>
    </section>

    <!-- Components -->
    <section id="components" class="sec wrap mi:max-w-300 mi:my-0 mi:mx-auto mi:pl-6 mi:pr-6 mi:box-border mi:max-[480px]:pl-4 mi:max-[480px]:pr-4 mi:pt-[clamp(88px,_12vw,_160px)] mi:[&:not(#start)]:[content-visibility:auto] mi:[&:not(#start)]:[contain-intrinsic-size:auto_900px]" aria-labelledby="comp-title">
      <header class="sec__head mi:grid mi:gap-3.5 mi:max-w-190 mi:mb-[clamp(36px,_5vw,_56px)]">
        <p class="eyebrow mi:m-0 mi:text-[14px] mi:font-semibold mi:text-p-text">{{ t('components.eyebrow') }}</p>
        <h2 id="comp-title" class="sec__title mi:m-0 mi:text-[clamp(32px,_4.6vw,_56px)] mi:leading-[1.04] mi:tracking-[-.04em] mi:font-bold mi:text-balance">{{ t('components.title', { n: total }) }}</h2>
        <p class="sec__lead mi:m-0 mi:max-w-[60ch] mi:text-[clamp(16px,_1.5vw,_19px)] mi:leading-[1.55] mi:text-label2 mi:text-pretty">{{ t('components.lead') }}</p>
      </header>
      <ul class="groups mi:grid mi:gap-3.5 mi:grid-cols-[repeat(auto-fill,_minmax(min(100%,_260px),_1fr))] mi:[list-style:none] mi:m-0 mi:p-0">
        <li v-for="g in groups" :key="g.name" class="group mi:relative mi:cursor-pointer mi:flex mi:flex-col mi:rounded-[22px] mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:overflow-hidden mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:hover:transform-[translate3d(0,_-3px,_0)] mi:[&:has(.group__link:focus-visible)]:[outline:2px_solid_var(--mi-p)] mi:[&:has(.group__link:focus-visible)]:outline-offset-[2px] mi:motion-reduce:hover:transform-none">
          <div class="group__specimen mi:flex mi:items-center mi:justify-center mi:flex-wrap mi:gap-3 mi:min-h-30 mi:p-5 mi:box-border mi:[background:radial-gradient(120%_120%_at_0%_0%,_var(--mi-p-tint2),_transparent_60%),_var(--mi-fill4)] mi:border-b mi:border-b-sep">
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
          <div class="group__body mi:grid mi:gap-1.5 mi:pt-4.5 mi:px-5 mi:pb-5">
            <div class="group__title mi:flex mi:items-baseline mi:justify-between mi:gap-2">
              <MiText variant="headline" as="h3"><NuxtLink :to="localePath('/components') + '?group=' + g.name" class="group__link mi:text-inherit mi:[text-decoration:none] mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:focus-visible:[outline:none]">{{ t('explorer.groups.' + g.name) }}</NuxtLink></MiText>
              <span class="group__count mi:text-[12px] mi:font-semibold mi:text-label3 mi:tabular-nums mi:whitespace-nowrap">{{ t('components.count', { n: g.components.length }) }}</span>
            </div>
            <MiText variant="footnote" tone="label2">{{ t('components.groups.' + g.name) }}</MiText>
            <p class="group__names mi:mt-1.5 mi:mx-0 mi:mb-0 mi:text-[12px] mi:leading-[1.6] mi:text-label3 mi:relative mi:z-1">
              <template v-for="(n, j) in g.components" :key="n"><NuxtLink class="mi:[.group__names_a&]:[text-decoration:none] mi:[.group__names_a&:hover]:text-p-text" :to="localePath('/components/' + toSlug(n))">{{ n.replace(/^Mi/, '') }}</NuxtLink><span v-if="j < g.components.length - 1" aria-hidden="true"> · </span></template>
            </p>
          </div>
        </li>
      </ul>
      <div class="groups__more mi:flex mi:justify-center mi:mt-7">
        <MiButton variant="tinted" size="large" :href="siteHref('/components')">{{ t('components.explore') }}</MiButton>
      </div>
    </section>

    <!-- Theming -->
    <section id="theming" class="sec wrap mi:max-w-300 mi:my-0 mi:mx-auto mi:pl-6 mi:pr-6 mi:box-border mi:max-[480px]:pl-4 mi:max-[480px]:pr-4 mi:pt-[clamp(88px,_12vw,_160px)] mi:[&:not(#start)]:[content-visibility:auto] mi:[&:not(#start)]:[contain-intrinsic-size:auto_900px]" aria-labelledby="theme-title">
      <div class="theming mi:grid mi:gap-10 mi:items-center mi:min-[1000px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:min-[1000px]:gap-16">
        <div class="theming__copy mi:grid mi:gap-3.5">
          <p class="eyebrow mi:m-0 mi:text-[14px] mi:font-semibold mi:text-p-text">{{ t('theming.eyebrow') }}</p>
          <h2 id="theme-title" class="sec__title mi:m-0 mi:text-[clamp(32px,_4.6vw,_56px)] mi:leading-[1.04] mi:tracking-[-.04em] mi:font-bold mi:text-balance">{{ t('theming.title') }}</h2>
          <p class="sec__lead mi:m-0 mi:max-w-[60ch] mi:text-[clamp(16px,_1.5vw,_19px)] mi:leading-[1.55] mi:text-label2 mi:text-pretty">{{ t('theming.lead') }}</p>
          <div class="theming__ctl mi:grid mi:gap-4.5 mi:mt-3 mi:p-5 mi:rounded-[22px] mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)]">
            <MiColorPicker target="primary" :label="t('theming.primary')" />
            <MiColorPicker target="secondary" :label="t('theming.secondary')" />
            <div class="theming__mode mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3">
              <MiText variant="subheadline" weight="semibold" as="span">{{ t('theming.appearance') }}</MiText>
              <MiThemeSwitcher :label="t('theme.label')" :labels="{ light: t('theme.light'), dark: t('theme.dark'), system: t('theme.system') }" />
            </div>
          </div>
        </div>
        <div class="preview mi:relative mi:grid mi:gap-3.5 mi:p-[clamp(16px,_3vw,_28px)] mi:rounded-[28px] mi:[background:radial-gradient(80%_80%_at_100%_0%,_var(--mi-s-tint2),_transparent_60%),_radial-gradient(80%_80%_at_0%_100%,_var(--mi-p-tint2),_transparent_60%),_var(--mi-fill4)]">
          <div class="preview__card mi:grid mi:gap-4.5 mi:p-5.5 mi:rounded-[20px] mi:[background:var(--mi-card)] mi:shadow-2">
            <div class="preview__head mi:flex mi:items-center mi:gap-3.5">
              <span class="preview__mark mi:grid mi:place-items-center mi:flex-[none] mi:w-11 mi:h-11 mi:rounded-[12px] mi:[background:var(--mi-p)]" aria-hidden="true"><MiLogo variant="short" :size="18" tone="on-primary" dot="inherit" decorative /></span>
              <div>
                <MiText variant="headline" as="p">{{ t('theming.previewTitle') }} <MiBadge :label="t('theming.new')" tone="secondary" class="preview__badge" /></MiText>
                <MiText variant="footnote" tone="label2">{{ t('theming.previewSub') }}</MiText>
              </div>
            </div>
            <MiProgress :value="72" :label="t('theming.seats')" value-text="18 / 25" />
            <div class="row mi:flex mi:items-center mi:justify-between mi:gap-3 mi:text-[15px]"><span id="p-auto">{{ t('theming.autopay') }}</span><MiSwitch v-model="autopay" aria-labelledby="p-auto" /></div>
            <div class="preview__chips mi:flex mi:flex-wrap mi:gap-2">
              <MiChip v-for="(c, i) in chips" :key="c" v-model="chipOn[i]" selectable :tone="i === 1 ? 'secondary' : 'primary'" :label="c" />
            </div>
            <div class="preview__actions mi:flex mi:flex-wrap mi:gap-2.5">
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
    <section id="craft" class="sec wrap mi:max-w-300 mi:my-0 mi:mx-auto mi:pl-6 mi:pr-6 mi:box-border mi:max-[480px]:pl-4 mi:max-[480px]:pr-4 mi:pt-[clamp(88px,_12vw,_160px)] mi:[&:not(#start)]:[content-visibility:auto] mi:[&:not(#start)]:[contain-intrinsic-size:auto_900px]" aria-labelledby="craft-title">
      <header class="sec__head mi:grid mi:gap-3.5 mi:max-w-190 mi:mb-[clamp(36px,_5vw,_56px)]">
        <p class="eyebrow mi:m-0 mi:text-[14px] mi:font-semibold mi:text-p-text">{{ t('craft.eyebrow') }}</p>
        <h2 id="craft-title" class="sec__title mi:m-0 mi:text-[clamp(32px,_4.6vw,_56px)] mi:leading-[1.04] mi:tracking-[-.04em] mi:font-bold mi:text-balance">{{ t('craft.title') }}</h2>
      </header>
      <div class="bento mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)] mi:min-[720px]:grid-cols-2 mi:min-[1040px]:grid-cols-4">
        <article class="tile tile--motion mi:min-[720px]:col-span-full mi:min-[1040px]:col-[span_2] mi:min-[1040px]:row-[span_2] mi:flex-col mi:p-6 mi:rounded-[22px] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:min-w-0 mi:justify-between">
          <div class="tile__text mi:grid mi:gap-2.5 mi:max-w-[46ch]">
            <MiText variant="title3" as="h3">{{ t('craft.motionTitle') }}</MiText>
            <MiText variant="subheadline" tone="label2">{{ t('craft.motionBody') }}</MiText>
          </div>
          <div class="spring mi:grid mi:gap-4">
            <div class="spring__track mi:relative mi:h-18 mi:rounded-[22px] mi:[background:var(--mi-fill4)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:overflow-hidden mi:@container"><span class="spring__knob mi:absolute mi:left-2 mi:top-2 mi:w-14 mi:h-14 mi:rounded-[16px] mi:[background:var(--mi-p)] mi:shadow-2 mi:[transition:transform_900ms_var(--mi-spring)] mi:[&.on]:transform-[translate3d(calc(100cqw_-_72px),_0,_0)_rotate(90deg)] mi:motion-reduce:[transition-duration:1ms]" :class="{ on: springOn }" /></div>
            <div class="spring__meta mi:flex mi:items-center mi:justify-between mi:gap-3">
              <MiButton variant="tinted" size="small" @click="springOn = !springOn">{{ t('craft.motionTry') }}</MiButton>
              <span class="spring__fig mi:text-[13px] mi:text-label2 mi:tabular-nums"><b>16.7</b> ms</span>
            </div>
          </div>
        </article>
        <article class="tile tile--a11y mi:flex-col mi:p-6 mi:rounded-[22px] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:min-w-0">
          <div class="keys mi:flex mi:flex-wrap mi:gap-1.5 mi:mb-2.5" aria-hidden="true"><kbd class="mi:[.keys_&]:min-w-5.5 mi:[.keys_&]:py-[5px] mi:[.keys_&]:px-2 mi:[.keys_&]:text-center">Tab</kbd><kbd class="mi:[.keys_&]:min-w-5.5 mi:[.keys_&]:py-[5px] mi:[.keys_&]:px-2 mi:[.keys_&]:text-center">←</kbd><kbd class="mi:[.keys_&]:min-w-5.5 mi:[.keys_&]:py-[5px] mi:[.keys_&]:px-2 mi:[.keys_&]:text-center">→</kbd><kbd class="mi:[.keys_&]:min-w-5.5 mi:[.keys_&]:py-[5px] mi:[.keys_&]:px-2 mi:[.keys_&]:text-center">Esc</kbd></div>
          <MiText variant="headline" as="h3">{{ t('craft.a11yTitle') }}</MiText>
          <MiText variant="footnote" tone="label2">{{ t('craft.a11yBody') }}</MiText>
        </article>
        <article class="tile tile--dark mi:flex-col mi:p-6 mi:rounded-[22px] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:min-w-0">
          <div class="duo mi:grid mi:grid-cols-[1fr_1fr] mi:h-16 mi:mb-2.5 mi:rounded-[14px] mi:overflow-hidden mi:shadow-[0_0_0_1px_var(--mi-sep)]" aria-hidden="true">
            <div class="duo__half mi-light mi:relative mi:[background:var(--mi-page)]"><span class="mi:[.duo__half_&]:right-2.5 mi:[.duo__half_&]:top-2.5" /><i class="mi:[.duo__half_&]:bottom-2.5" /></div>
            <div class="duo__half mi-dark mi:relative mi:[background:var(--mi-page)]"><span class="mi:[.duo__half_&]:right-2.5 mi:[.duo__half_&]:top-2.5" /><i class="mi:[.duo__half_&]:bottom-2.5" /></div>
          </div>
          <MiText variant="headline" as="h3">{{ t('craft.darkTitle') }}</MiText>
          <MiText variant="footnote" tone="label2">{{ t('craft.darkBody') }}</MiText>
        </article>
        <article class="tile mi:flex-col mi:p-6 mi:rounded-[22px] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:min-w-0">
          <div class="tile__glyph mi:grid mi:place-items-center mi:w-10 mi:h-10 mi:mb-2.5 mi:rounded-[12px] mi:[background:var(--mi-p-tint)] mi:text-p-text" aria-hidden="true"><MiIcon name="eye" :size="20" /></div>
          <MiText variant="headline" as="h3">{{ t('craft.ssrTitle') }}</MiText>
          <MiText variant="footnote" tone="label2">{{ t('craft.ssrBody') }}</MiText>
        </article>
        <article class="tile mi:flex-col mi:p-6 mi:rounded-[22px] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:min-w-0">
          <div class="tile__glyph mi:grid mi:place-items-center mi:w-10 mi:h-10 mi:mb-2.5 mi:rounded-[12px] mi:[background:var(--mi-p-tint)] mi:text-p-text" aria-hidden="true"><MiIcon name="document" :size="20" /></div>
          <MiText variant="headline" as="h3">{{ t('craft.typedTitle') }}</MiText>
          <MiText variant="footnote" tone="label2">{{ t('craft.typedBody') }}</MiText>
        </article>
        <article class="tile tile--zero mi:min-[720px]:col-span-full mi:min-[1040px]:col-span-full mi:min-[1040px]:grid-cols-[auto_1fr] mi:min-[1040px]:grid-rows-[auto_auto] mi:min-[1040px]:items-center mi:flex-col mi:p-6 mi:rounded-[22px] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:min-w-0">
          <span class="zero mi:min-[1040px]:[.tile--zero_&]:row-[span_2] mi:min-[1040px]:[.tile--zero_&]:m-0 mi:min-[1040px]:[.tile--zero_&]:text-[96px] mi:text-[64px] mi:leading-[.9] mi:font-bold mi:tracking-[-.05em] mi:mb-1.5 mi:text-transparent mi:w-fit" aria-hidden="true">0</span>
          <MiText variant="headline" as="h3">{{ t('craft.zeroTitle') }}</MiText>
          <MiText variant="footnote" tone="label2">{{ t('craft.zeroBody') }}</MiText>
        </article>
      </div>
    </section>

    <!-- AI -->
    <section id="ai" class="sec wrap mi:max-w-300 mi:my-0 mi:mx-auto mi:pl-6 mi:pr-6 mi:box-border mi:max-[480px]:pl-4 mi:max-[480px]:pr-4 mi:pt-[clamp(88px,_12vw,_160px)] mi:[&:not(#start)]:[content-visibility:auto] mi:[&:not(#start)]:[contain-intrinsic-size:auto_900px]" aria-labelledby="ai-title">
      <div class="ai mi:grid mi:gap-10 mi:items-center mi:min-[1000px]:grid-cols-[minmax(0,_.9fr)_minmax(0,_1.1fr)] mi:min-[1000px]:gap-16">
        <div class="ai__copy mi:grid mi:gap-3.5">
          <p class="eyebrow mi:m-0 mi:text-[14px] mi:font-semibold mi:text-p-text">{{ t('ai.eyebrow') }}</p>
          <h2 id="ai-title" class="sec__title mi:m-0 mi:text-[clamp(32px,_4.6vw,_56px)] mi:leading-[1.04] mi:tracking-[-.04em] mi:font-bold mi:text-balance">{{ t('ai.title') }}</h2>
          <p class="sec__lead mi:m-0 mi:max-w-[60ch] mi:text-[clamp(16px,_1.5vw,_19px)] mi:leading-[1.55] mi:text-label2 mi:text-pretty">{{ t('ai.lead', { n: catalog?.all ?? 0 }) }}</p>
          <ul class="ai__points mi:grid mi:gap-3.5 mi:[list-style:none] mi:mt-3 mi:mx-0 mi:mb-0 mi:p-0">
            <li class="mi:[.ai__points_li&]:grid-cols-[96px_1fr] mi:[.ai__points_li&]:gap-3.5 mi:[.ai__points_li&]:items-baseline mi:[.ai__points_li&]:pt-3.5 mi:[.ai__points_li&]:border-t mi:[.ai__points_li&]:border-t-sep mi:max-[480px]:[.ai__points_li&]:grid-cols-[1fr] mi:max-[480px]:[.ai__points_li&]:gap-1" v-for="n in 3" :key="n">
              <a v-if="aiLinks[n]" :href="aiLinks[n]" class="ai__link mi:[text-decoration:none] mi:rounded-[4px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]"><code class="mi:[.ai__link:hover_&]:underline-offset-[3px]">{{ t('ai.p' + n + 't') }}</code></a>
              <code v-else>{{ t('ai.p' + n + 't') }}</code>
              <MiText class="mi:[.ai__points_li&]:grid-cols-[96px_1fr] mi:[.ai__points_li&]:gap-3.5 mi:[.ai__points_li&]:items-baseline mi:[.ai__points_li&]:pt-3.5 mi:[.ai__points_li&]:border-t mi:[.ai__points_li&]:border-t-sep mi:max-[480px]:[.ai__points_li&]:grid-cols-[1fr] mi:max-[480px]:[.ai__points_li&]:gap-1" variant="subheadline" tone="label2" as="span">{{ t('ai.p' + n) }}</MiText>
            </li>
          </ul>
        </div>
        <SiteCode class="ai__file" :file="t('ai.file')" :text="catalog?.llms ?? ''" :copy-label="t('start.copy')" :copied-label="t('start.copied')" plain />
      </div>
    </section>

    <!-- Showcase -->
    <section id="showcase" class="sec wrap mi:max-w-300 mi:my-0 mi:mx-auto mi:pl-6 mi:pr-6 mi:box-border mi:max-[480px]:pl-4 mi:max-[480px]:pr-4 mi:pt-[clamp(88px,_12vw,_160px)] mi:[&:not(#start)]:[content-visibility:auto] mi:[&:not(#start)]:[contain-intrinsic-size:auto_900px]" aria-labelledby="show-title">
      <header class="sec__head mi:grid mi:gap-3.5 mi:max-w-190 mi:mb-[clamp(36px,_5vw,_56px)]">
        <p class="eyebrow mi:m-0 mi:text-[14px] mi:font-semibold mi:text-p-text">{{ t('showcase.eyebrow') }}</p>
        <h2 id="show-title" class="sec__title mi:m-0 mi:text-[clamp(32px,_4.6vw,_56px)] mi:leading-[1.04] mi:tracking-[-.04em] mi:font-bold mi:text-balance">{{ t('showcase.title') }}</h2>
        <p class="sec__lead mi:m-0 mi:max-w-[60ch] mi:text-[clamp(16px,_1.5vw,_19px)] mi:leading-[1.55] mi:text-label2 mi:text-pretty">{{ t('showcase.lead') }}</p>
      </header>
      <ul class="demos mi:grid mi:gap-3.5 mi:grid-cols-[repeat(auto-fill,_minmax(min(100%,_250px),_1fr))] mi:[list-style:none] mi:m-0 mi:p-0">
        <li v-for="(d, i) in demos" :key="d">
          <a :href="config.public.showcaseUrl + '/' + d" class="demo mi:relative mi:flex mi:flex-col mi:gap-2 mi:h-full mi:box-border mi:p-5.5 mi:rounded-[22px] mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:text-inherit mi:[text-decoration:none] mi:overflow-hidden mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:hover:transform-[translate3d(0,_-4px,_0)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[3px] mi:motion-reduce:hover:transform-none" :class="'demo--' + d">
            <span class="demo__art mi:relative mi:h-30 mi:-mt-5.5 mi:-mx-5.5 mi:mb-3 mi:[background:var(--mi-fill4)] mi:overflow-hidden" aria-hidden="true"><i class="mi:[.demo__art_&]:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:[.demo:hover_.demo__art_&:nth-child(2)]:transform-[translate3d(0,_-6px,_0)] mi:[.demo--landing_.demo__art_&:nth-child(1)]:opacity-80 mi:motion-reduce:[.demo:hover_.demo__art_&]:transform-none" /><i class="mi:[.demo__art_&]:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:[.demo:hover_.demo__art_&:nth-child(2)]:transform-[translate3d(0,_-6px,_0)] mi:[.demo--landing_.demo__art_&:nth-child(1)]:opacity-80 mi:motion-reduce:[.demo:hover_.demo__art_&]:transform-none" /><i class="mi:[.demo__art_&]:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:[.demo:hover_.demo__art_&:nth-child(2)]:transform-[translate3d(0,_-6px,_0)] mi:[.demo--landing_.demo__art_&:nth-child(1)]:opacity-80 mi:motion-reduce:[.demo:hover_.demo__art_&]:transform-none" /></span>
            <span class="demo__n mi:text-[12px] mi:font-semibold mi:text-p-text mi:tabular-nums">0{{ i + 1 }}</span>
            <MiText variant="title3" as="h3">{{ t('showcase.demos.' + d + '.title') }}</MiText>
            <MiText variant="footnote" tone="label2">{{ t('showcase.demos.' + d + '.body') }}</MiText>
            <span class="demo__open mi:inline-flex mi:items-center mi:gap-1.5 mi:mt-auto mi:pt-2.5 mi:text-[14px] mi:font-semibold mi:text-p-text">{{ t('showcase.open') }} <MiIcon name="arrow-right" :size="15" /></span>
          </a>
        </li>
      </ul>
    </section>

    <!-- Closing CTA -->
    <section class="cta mi-dark mi:relative mi:isolate mi:overflow-hidden mi:mt-[clamp(96px,_12vw,_160px)] mi:py-[clamp(72px,_10vw,_128px)] mi:px-0 mi:[background:var(--mi-page)] mi:text-label mi:text-center" aria-labelledby="cta-title">
      <div class="cta__glow mi:absolute mi:inset-0 mi:-z-1 mi:[background:radial-gradient(40%_60%_at_50%_0%,_color-mix(in_oklab,_var(--mi-p)_34%,_transparent),_transparent_70%),_radial-gradient(30%_40%_at_85%_100%,_color-mix(in_oklab,_var(--mi-s)_22%,_transparent),_transparent_70%)]" aria-hidden="true" />
      <div class="cta__in wrap mi:max-w-300 mi:my-0 mi:mx-auto mi:pl-6 mi:pr-6 mi:box-border mi:max-[480px]:pl-4 mi:max-[480px]:pr-4 mi:grid mi:justify-items-center mi:gap-5">
        <MiLogo variant="dot" :size="44" decorative />
        <h2 id="cta-title" class="cta__title mi:m-0 mi:text-[clamp(40px,_6vw,_76px)] mi:leading-none mi:tracking-[-.05em] mi:font-bold">{{ t('cta.title') }}</h2>
        <code class="cta__code mi:py-2.5 mi:px-4 mi:rounded-[12px] mi:[background:var(--mi-fill4)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:[font:15px/1_ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:text-label">{{ extendsLine }}</code>
        <p class="cta__lead mi:m-0 mi:text-label2 mi:text-[17px]">{{ t('cta.lead') }}</p>
        <div class="hero__ctas mi:flex mi:flex-wrap mi:gap-2.5 mi:[.cta_&]:justify-center">
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
const configCode = `export default defineNuxtConfig({\n  extends: ['github:DimitriDerthe/nuxt-mica#v${config.public.version}']\n})`
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
/* Entrance: transform + opacity only, staggered with --d. */
.rise { animation: lp-rise var(--mi-dur-4) var(--mi-ease) var(--d, 0ms) backwards; }
@keyframes lp-rise { from { opacity: 0; transform: translate3d(0, 18px, 0); } }
.hero__accent { background: linear-gradient(100deg, var(--mi-p-text) 10%, var(--mi-s-text) 90%); -webkit-background-clip: text; background-clip: text; }
.install code { font: 13px/1 ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label); }
.sheet { background: var(--mi-card); padding: 16px; }
.sheet--chart { padding-bottom: 6px; }
.sheet--stat { padding: 0; }
.sheet--stat > :deep(*) { height: 100%; box-shadow: none; }
.sheet--notif { padding: 0; background: none; }
.sheet--notif > :deep(*) { height: 100%; box-sizing: border-box; box-shadow: 0 0 0 1px var(--mi-sep), var(--mi-sh2); }
.stats__item dd { grid-area: v; }
.stats__item dt { grid-area: l; }
.stats dd { margin: 0; font-size: clamp(34px, 4vw, 48px); font-weight: 700; letter-spacing: -.04em; line-height: 1; font-variant-numeric: tabular-nums; }
.stats dt { font-size: 14px; color: var(--mi-label2); max-width: 22ch; }
.step :deep(.code) { background: var(--mi-page); }
.spec-search { width: 100%; max-width: 220px; }
.spec-progress { width: 140px; }
.group__names a { color: var(--mi-label2); }
.group__names a:hover { text-decoration: underline; }
.preview__badge { vertical-align: 2px; margin-left: 6px; }
@media (min-width: 1040px) {
  .tile--zero { display: grid; column-gap: 28px; }
}
.tile { display: flex; gap: 8px; background: var(--mi-card); }
.tile--motion { gap: 28px; background: radial-gradient(90% 90% at 100% 100%, var(--mi-p-tint2), transparent 60%), var(--mi-card); }
.spring__fig b { font-size: 22px; letter-spacing: -.02em; color: var(--mi-label); }
.keys kbd { border-radius: 8px; background: var(--mi-fill4); box-shadow: inset 0 -1px 0 var(--mi-sep), 0 0 0 1px var(--mi-sep); font: 600 12px/1 var(--mi-font); color: var(--mi-label); }
.duo__half span { position: absolute; left: 10px; height: 26px; border-radius: 8px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.duo__half i { position: absolute; left: 10px; width: 40%; height: 6px; border-radius: 3px; background: var(--mi-label2); }
.zero { background: linear-gradient(160deg, var(--mi-p-text), var(--mi-s-text)); -webkit-background-clip: text; background-clip: text; }
.ai__points li { display: grid; }
.ai__link:hover code { text-decoration: underline; }
.ai__points code { font: 600 13px/1.4 ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-p-text); }
.ai__file :deep(.code__pre) { max-height: 420px; font-size: 12px; white-space: pre-wrap; overflow-wrap: anywhere; }
.demo__art i { position: absolute; border-radius: 10px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.demo--landing .demo__art { background: radial-gradient(90% 120% at 0% 0%, var(--mi-p-tint), transparent 70%), var(--mi-fill4); }
.demo--landing .demo__art i:nth-child(1) { left: 22px; top: 26px; width: 55%; height: 14px; background: var(--mi-label); border-radius: 7px; }
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

@media (prefers-reduced-motion: reduce) {
  .rise { animation: none; }
}
</style>

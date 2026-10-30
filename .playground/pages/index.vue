<script setup lang="ts">
import MiIcon from '../../app/components/Base/MiIcon.vue'
import MiText from '../../app/components/Base/MiText.vue'
import MiSurface from '../../app/components/Base/MiSurface.vue'
import MiThemeSwitcher from '../../app/components/Base/MiThemeSwitcher.vue'
import MiColorPicker from '../../app/components/Base/MiColorPicker.vue'
import MiColorRamp from '../../app/components/Base/MiColorRamp.vue'
import MiLogo from '../../app/components/Base/MiLogo.vue'
const theme = useMiTheme()
const view = ref<'current' | 'both'>('current')

const names = ['Red', 'Orange', 'Yellow', 'Green', 'Mint', 'Teal', 'Blue', 'Indigo', 'Purple', 'Pink']
const sysL = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#30B0C7', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55']
const sysD = ['#FF453A', '#FF9F0A', '#FFD60A', '#30D158', '#63E6E2', '#40C8E0', '#0A84FF', '#5E5CE6', '#BF5AF2', '#FF375F']
const grayL = ['#8E8E93', '#AEAEB2', '#C7C7CC', '#D1D1D6', '#E5E5EA', '#F2F2F7']
const grayD = ['#8E8E93', '#636366', '#48484A', '#3A3A3C', '#2C2C2E', '#1C1C1E']
const space = [4, 8, 12, 16, 20, 24, 32, 44, 64]
const radii = [
  { key: 'xs · 6', r: 6, note: 'Badges, mini controls' },
  { key: 'sm · 10', r: 10, note: 'Buttons, fields' },
  { key: 'md · 14', r: 14, note: 'Menus, list groups' },
  { key: 'lg · 20', r: 20, note: 'Cards' },
  { key: 'xl · 28', r: 28, note: 'Sheets, dialogs' },
  { key: 'capsule', r: 999, note: 'Pills, CTAs, switches' }
]
const mats = [
  { name: 'Ultra thin', value: 'ultra-thin', alpha: '30% + blur 24' },
  { name: 'Thin', value: 'thin', alpha: '50% + blur 24' },
  { name: 'Regular', value: 'regular', alpha: '72% + blur 24' },
  { name: 'Thick', value: 'thick', alpha: '88% + blur 24' }
] as const
const semantic = [
  { title: 'Backgrounds', rows: [['page', 'Window background', 'var(--mi-page)'], ['card', 'Grouped content, cards', 'var(--mi-card)'], ['elevated', 'Menus, popovers, sheets', 'var(--mi-elev)']] },
  { title: 'Labels', rows: [['label', 'Primary text', 'var(--mi-label)'], ['label-2', 'Secondary text, placeholders', 'var(--mi-label2)'], ['label-3', 'Disabled and decorative only', 'var(--mi-label3)']] },
  { title: 'Fills & separators', rows: [['fill', 'Slider tracks, thick shapes', 'var(--mi-fill)'], ['fill-3', 'Search, segmented, gray buttons', 'var(--mi-fill3)'], ['separator', 'Hairlines between rows', 'var(--mi-sep2)']] }
]
const scale = [
  ['largeTitle', 'Large Title', '34 / 41 · Bold'], ['title1', 'Title 1', '28 / 34 · Bold'], ['title2', 'Title 2', '22 / 28 · Bold'],
  ['title3', 'Title 3', '20 / 25 · Semibold'], ['headline', 'Headline', '17 / 22 · Semibold'], ['body', 'Body', '17 / 22 · Regular'],
  ['callout', 'Callout', '16 / 21 · Regular'], ['subheadline', 'Subheadline', '15 / 20 · Regular'], ['footnote', 'Footnote', '13 / 18 · Regular'],
  ['caption', 'Caption', '12 / 16 · Regular'], ['caption2', 'Caption 2', '11 / 13 · Medium']
] as const

const sample = (v: string) => (v === 'caption2' ? 'Precision in every pixel' : v.startsWith('large') || v.startsWith('title') || v === 'headline' ? 'Precision in every pixel' : 'Precision in every pixel, with room to breathe.')

const panels = computed(() => {
  const list = view.value === 'both' ? [false, true] : [theme.isDark.value]
  return list.map((dark) => {
    const brand = (hex: string, name: string, role: string) => ({ name, role, hex, ...miTone(hex, dark) })
    return {
      key: dark ? 'dark' : 'light',
      title: dark ? 'Dark' : 'Light',
      cls: view.value === 'both' ? (dark ? 'mi-dark' : 'mi-light') : '',
      dark,
      brands: [
        brand(theme.primary.value, 'Primary', 'Actions, links, selection and focus'),
        brand(theme.secondary.value, 'Secondary', 'Highlights, badges and promotional accents')
      ],
      sys: names.map((n, i) => ({ name: n, hex: (dark ? sysD : sysL)[i]! })),
      grays: (dark ? grayD : grayL).map((hex, i) => ({ name: i ? `Gray ${i + 1}` : 'Gray', hex, on: miOn(hex) }))
    }
  })
})
</script>

<template>
  <main class="pg">
    <header class="pg__top">
      <div class="pg__intro">
        <MiText variant="subheadline" weight="semibold" tone="primary">Mica UI Kit · 01</MiText>
        <MiText variant="largeTitle" as="h1" class="pg__h1">Foundations</MiText>
        <MiText variant="callout" tone="label2">Color, type, spacing, depth and materials for calm, precise web apps. Every accent follows the primary and secondary colors below.</MiText>
      </div>
      <MiSurface class="pg__controls" padding="lg" radius="lg">
        <div class="pg__row">
          <MiText variant="headline">Appearance</MiText>
          <MiThemeSwitcher />
        </div>
        <div class="pg__row">
          <MiText variant="headline">Layout</MiText>
          <div class="pg__seg" role="radiogroup" aria-label="Preview layout">
            <button type="button" role="radio" :aria-checked="view === 'current'" @click="view = 'current'">Current</button>
            <button type="button" role="radio" :aria-checked="view === 'both'" @click="view = 'both'">Light and dark</button>
          </div>
        </div>
        <MiColorPicker target="primary" />
        <MiColorPicker target="secondary" />
      </MiSurface>
    </header>

    <div class="pg__panels" :class="{ 'pg__panels--both': view === 'both' }">
      <section v-for="p in panels" :key="p.key" class="pg__panel" :class="p.cls">
        <MiText variant="footnote" weight="semibold" class="pg__badge"><span class="pg__dot" />{{ p.title }} appearance</MiText>

        <div class="pg__sec">
          <MiText variant="title1" as="h2">Logo</MiText>
          <MiText variant="subheadline" tone="label2">The full stop takes the primary color, so the logo follows the theme.</MiText>
          <div class="pg__logos">
            <MiSurface radius="lg" class="pg__logo"><MiLogo :size="56" /></MiSurface>
            <MiSurface radius="lg" class="pg__logo pg__logo--brand"><MiLogo :size="40" tone="on-primary" dot="inherit" /></MiSurface>
            <MiSurface radius="lg" class="pg__logo"><MiLogo :size="40" dot="inherit" /></MiSurface>
            <MiSurface radius="lg" class="pg__logo pg__logo--row">
              <MiLogo variant="short" :size="40" />
              <MiLogo variant="dot" :size="20" label="Mica dot" />
              <MiLogo :size="28" pulse label="Mica, loading" />
            </MiSurface>
          </div>
        </div>

        <div class="pg__sec">
          <MiText variant="title1" as="h2">Brand colors</MiText>
          <MiText variant="subheadline" tone="label2">Two customizable accents. Hover, tint and text shades are derived automatically and kept at 4.5:1 contrast.</MiText>
          <div class="pg__brands">
            <MiSurface v-for="b in p.brands" :key="b.name" radius="lg" class="pg__brand">
              <div class="pg__hero" :style="{ background: b.solid, color: b.on }">
                <div class="pg__between"><MiText variant="title2" as="span">{{ b.name }}</MiText><MiText variant="footnote" as="span" weight="semibold" tabular>{{ b.solid }}</MiText></div>
                <MiText variant="subheadline" as="span">{{ b.role }}</MiText>
              </div>
              <div class="pg__tones">
                <div class="pg__tone"><span class="pg__sw" :style="{ background: b.hover }" /><MiText variant="caption" weight="semibold">Hover</MiText></div>
                <div class="pg__tone"><span class="pg__sw" :style="{ background: b.tint, color: b.text }">Aa</span><MiText variant="caption" weight="semibold">Tint</MiText></div>
                <div class="pg__tone"><span class="pg__sw pg__sw--line" :style="{ color: b.text }">Aa</span><MiText variant="caption" weight="semibold">Text</MiText></div>
                <div class="pg__tone"><span class="pg__sw" :style="{ background: b.solid, color: b.on }">Aa</span><MiText variant="caption" weight="semibold">On color</MiText></div>
              </div>
              <MiColorRamp :color="b.hex" :label="`${b.name} ramp`" />
            </MiSurface>
          </div>
        </div>

        <div class="pg__sec">
          <MiText variant="title1" as="h2">System colors</MiText>
          <MiText variant="subheadline" tone="label2">Semantic hues for status, charts and tags. Each one shifts brighter in dark appearance.</MiText>
          <div class="pg__sys">
            <MiSurface v-for="c in p.sys" :key="c.name" radius="md" class="pg__sysitem">
              <span class="pg__chip" :style="{ background: c.hex }" />
              <span class="pg__col"><MiText variant="subheadline" as="span" weight="semibold">{{ c.name }}</MiText><MiText variant="caption" as="span" tone="label2" tabular>{{ c.hex }}</MiText></span>
            </MiSurface>
          </div>
          <div class="pg__grays">
            <div v-for="g in p.grays" :key="g.name" class="pg__gray" :style="{ background: g.hex, color: g.on }">
              <MiText variant="footnote" as="span" weight="semibold">{{ g.name }}</MiText><MiText variant="caption" as="span" tabular>{{ g.hex }}</MiText>
            </div>
          </div>
        </div>

        <div class="pg__sec">
          <MiText variant="title1" as="h2">Semantic tokens</MiText>
          <MiText variant="subheadline" tone="label2">Use roles, never raw hex. The same token resolves to the right value in each appearance.</MiText>
          <div class="pg__sem">
            <MiSurface v-for="g in semantic" :key="g.title" radius="md" padding="sm" class="pg__semcard">
              <MiText variant="footnote" weight="semibold" tone="label2" class="pg__semtitle">{{ g.title }}</MiText>
              <div v-for="r in g.rows" :key="r[0]" class="pg__semrow">
                <span v-if="g.title === 'Labels'" class="pg__aa" :style="{ color: r[2] }">Aa</span>
                <span v-else-if="r[0] === 'separator'" class="pg__sepline"><i /></span>
                <span v-else class="pg__tok" :style="{ background: r[2] }" />
                <span class="pg__col"><MiText variant="subheadline" as="span" weight="semibold">{{ r[0] }}</MiText><MiText variant="caption" as="span" tone="label2">{{ r[1] }}</MiText></span>
              </div>
            </MiSurface>
          </div>
        </div>

        <div class="pg__sec">
          <MiText variant="title1" as="h2">Typography</MiText>
          <MiText variant="subheadline" tone="label2">The native system UI font on each platform, Inter as fallback. Tight tracking on display sizes, open tracking below 15 px.</MiText>
          <MiSurface radius="lg" class="pg__types">
            <div v-for="t in scale" :key="t[0]" class="pg__type">
              <span class="pg__col"><MiText variant="subheadline" as="span" weight="semibold">{{ t[1] }}</MiText><MiText variant="caption" as="span" tone="label2">{{ t[2] }}</MiText></span>
              <MiText :variant="t[0]" as="span">{{ sample(t[0]) }}</MiText>
            </div>
          </MiSurface>
        </div>

        <div class="pg__grid2">
          <MiSurface radius="lg" padding="lg" class="pg__box">
            <MiText variant="title3" as="h3">Spacing</MiText>
            <MiText variant="footnote" tone="label2">4-point scale. 44 px is the minimum touch target.</MiText>
            <div class="pg__spaces">
              <div v-for="s in space" :key="s" class="pg__space"><MiText variant="footnote" as="span" weight="semibold" tone="label2" tabular>{{ s }}</MiText><span class="pg__bar" :style="{ width: s + 'px' }" /></div>
            </div>
          </MiSurface>
          <MiSurface radius="lg" padding="lg" class="pg__box">
            <MiText variant="title3" as="h3">Corner radius</MiText>
            <MiText variant="footnote" tone="label2">Smooth, concentric corners: inner radius = outer radius − padding.</MiText>
            <div class="pg__radii">
              <div v-for="r in radii" :key="r.key" class="pg__radius"><span class="pg__rbox" :style="{ borderRadius: r.r + 'px' }" /><MiText variant="footnote" weight="semibold">{{ r.key }}</MiText><MiText variant="caption" tone="label2">{{ r.note }}</MiText></div>
            </div>
          </MiSurface>
          <MiSurface radius="lg" padding="lg" class="pg__box">
            <MiText variant="title3" as="h3">Elevation</MiText>
            <MiText variant="footnote" tone="label2">Soft, layered shadows in light. Hairline borders carry depth in dark.</MiText>
            <div class="pg__stage">
              <MiSurface v-for="(e, i) in [['Resting', 'sh-1 · cards'], ['Raised', 'sh-2 · menus'], ['Overlay', 'sh-3 · dialogs']]" :key="e[0]" variant="elevated" :elevation="(i + 1) as 1 | 2 | 3" radius="md" padding="sm" class="pg__elev">
                <MiText variant="footnote" weight="semibold">{{ e[0] }}</MiText><MiText variant="caption" tone="label2">{{ e[1] }}</MiText>
              </MiSurface>
            </div>
          </MiSurface>
          <MiSurface radius="lg" padding="lg" class="pg__box">
            <MiText variant="title3" as="h3">Materials</MiText>
            <MiText variant="footnote" tone="label2">Translucent layers with background blur for bars, sidebars and popovers.</MiText>
            <div class="pg__backdrop">
              <span class="pg__orb" /><span class="pg__sq" />
              <div class="pg__mats">
                <MiSurface v-for="m in mats" :key="m.value" variant="material" :material="m.value" radius="sm" padding="sm" class="pg__mat">
                  <MiText variant="footnote" weight="semibold">{{ m.name }}</MiText><MiText variant="caption" tone="label2">{{ m.alpha }}</MiText>
                </MiSurface>
              </div>
            </div>
          </MiSurface>
        </div>

        <div class="pg__sec">
          <MiText variant="title1" as="h2">Icons</MiText>
          <MiText variant="subheadline" tone="label2">Stroke icons on a 24 px grid, tree-shakeable by name.</MiText>
          <MiSurface radius="lg" padding="md" class="pg__icons">
            <div v-for="n in miIconNames" :key="n" class="pg__icon"><MiIcon :name="n" :size="22" :spin="n === 'spinner'" /><MiText variant="caption2" as="span" tone="label2">{{ n }}</MiText></div>
          </MiSurface>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.pg{display:flex;flex-direction:column;gap:48px;padding:32px 16px 80px;max-width:1920px;margin:0 auto;font-family:var(--mi-font);color:var(--mi-label)}
.pg__top{display:grid;gap:24px;align-items:start}
.pg__intro{display:flex;flex-direction:column;gap:10px;max-width:640px}
.pg__h1{font-size:44px;line-height:48px}
.pg__controls{display:flex;flex-direction:column;gap:18px;max-width:460px}
.pg__row,.pg__between{display:flex;align-items:center;justify-content:space-between;gap:12px}
.pg__seg{display:inline-grid;grid-auto-flow:column;gap:2px;padding:2px;border-radius:9px;background:var(--mi-fill3)}
.pg__seg button{height:30px;padding:0 12px;border:0;border-radius:7px;background:transparent;color:var(--mi-label2);font-size:13px}
.pg__seg button[aria-checked=true]{background:var(--mi-seg);color:var(--mi-label);font-weight:600;box-shadow:0 3px 8px rgba(0,0,0,.12),0 3px 1px rgba(0,0,0,.04)}
.pg__panels{display:grid;gap:0}
.pg__panels--both{gap:24px}
.pg__panel{display:flex;flex-direction:column;gap:48px;padding:24px 16px;border-radius:24px;background:var(--mi-page);color:var(--mi-label)}
.pg__badge{display:inline-flex;align-items:center;gap:8px;align-self:flex-start;height:32px;padding:0 14px;border-radius:999px;background:var(--mi-fill3)}
.pg__dot{width:8px;height:8px;border-radius:50%;background:var(--mi-p)}
.pg__sec{display:flex;flex-direction:column;gap:10px}
.pg__sec>.mi-text--title1{margin-top:4px}
.pg__brands{display:grid;gap:20px;margin-top:14px}
.pg__logos{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:16px;margin-top:14px}
.pg__logo{display:flex;align-items:center;justify-content:center;gap:28px;min-height:140px;padding:24px}
.pg__logo--brand{background:var(--mi-p)}
.pg__brand{overflow:hidden;display:flex;flex-direction:column}
.pg__hero{min-height:150px;padding:22px 24px;display:flex;flex-direction:column;justify-content:space-between;gap:16px}
.pg__tones{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;padding:18px 24px 20px}
.pg__tone{display:flex;flex-direction:column;gap:8px;min-width:0}
.pg__sw{height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600}
.pg__sw--line{box-shadow:inset 0 0 0 1px var(--mi-sep)}
.pg__sys{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}
.pg__sysitem{display:flex;align-items:center;gap:12px;padding:14px;min-width:0}
.pg__chip{width:40px;height:40px;flex:none;border-radius:12px}
.pg__col{display:flex;flex-direction:column;gap:2px;min-width:0}
.pg__grays{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-radius:16px;overflow:hidden;box-shadow:var(--mi-sh1)}
.pg__gray{min-height:92px;padding:12px 14px;display:flex;flex-direction:column;justify-content:flex-end;gap:2px}
.pg__sem{display:grid;gap:20px;margin-top:14px}
.pg__semtitle{padding:8px 6px 6px}
.pg__semrow{display:flex;align-items:center;gap:12px;padding:10px 6px;border-top:.5px solid var(--mi-sep)}
.pg__tok{width:28px;height:28px;border-radius:8px;box-shadow:inset 0 0 0 1px var(--mi-sep)}
.pg__aa{width:28px;font-size:20px;font-weight:700}
.pg__sepline{width:28px;display:flex;align-items:center}
.pg__sepline i{display:block;width:28px;height:1px;background:var(--mi-sep2)}
.pg__types{padding:6px 16px;margin-top:14px}
.pg__type{display:grid;grid-template-columns:minmax(96px,200px) minmax(0,1fr);align-items:center;gap:16px;padding:16px 0;border-top:.5px solid var(--mi-sep)}
.pg__type:first-child{border-top:0}
.pg__grid2{display:grid;gap:20px}
.pg__box{display:flex;flex-direction:column;gap:6px}
.pg__spaces{display:flex;flex-direction:column;gap:10px;margin-top:14px}
.pg__space{display:grid;grid-template-columns:40px minmax(0,1fr);align-items:center;gap:12px}
.pg__bar{height:14px;border-radius:4px;background:var(--mi-p)}
.pg__radii{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:14px}
.pg__radius{display:flex;flex-direction:column;gap:6px}
.pg__rbox{height:72px;background:var(--mi-p-tint);border:1.5px solid var(--mi-p)}
.pg__stage{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;padding:20px;margin-top:14px;border-radius:14px;background:var(--mi-page)}
.pg__elev{min-height:120px;display:flex;flex-direction:column;justify-content:flex-end}
.pg__backdrop{position:relative;min-height:188px;margin-top:14px;border-radius:14px;overflow:hidden;background:var(--mi-page)}
.pg__orb{position:absolute;left:6%;top:20px;width:150px;height:150px;border-radius:50%;background:var(--mi-p)}
.pg__sq{position:absolute;right:8%;top:36px;width:120px;height:120px;border-radius:32px;background:var(--mi-s)}
.pg__mats{position:absolute;inset:14px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.pg__mat{display:flex;flex-direction:column;justify-content:flex-end;gap:2px;min-width:0}
.pg__icons{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:14px;margin-top:14px}
.pg__icon{display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px 4px;text-align:center;color:var(--mi-label)}
.pg__icon .mi-text{text-transform:none;word-break:break-word}
@media (min-width:768px){
  .pg{padding:48px 32px 96px}
  .pg__brands,.pg__sem{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pg__sem{grid-template-columns:repeat(3,minmax(0,1fr))}
  .pg__grid2{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pg__sys{grid-template-columns:repeat(5,minmax(0,1fr))}
  .pg__grays{grid-template-columns:repeat(6,minmax(0,1fr))}
  .pg__radii{grid-template-columns:repeat(3,minmax(0,1fr))}
  .pg__panel{padding:48px 40px}
}
@media (min-width:1100px){
  .pg__top{grid-template-columns:minmax(0,1fr) 460px}
  .pg__panels--both{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pg__panels--both .pg__brands,.pg__panels--both .pg__grid2{grid-template-columns:1fr}
  .pg__panels--both .pg__sys{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pg__panels--both .pg__sem{grid-template-columns:1fr}
}
@media (max-width:520px){
  .pg__mats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pg__backdrop{min-height:260px}
  .pg__type{grid-template-columns:1fr;gap:6px}
  .pg__stage{grid-template-columns:1fr}
  .pg__elev{min-height:84px}
  .pg__row{flex-wrap:wrap}
}
</style>

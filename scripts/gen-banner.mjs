// README banner, light and dark: node scripts/gen-banner.mjs
// Counts come from the README sentence (checked against the manifest by tests/counts.spec.ts) and docs/blocks.md.
import { readFileSync, writeFileSync } from 'node:fs'

const out = '.github/assets'
const components = readFileSync('README.md', 'utf8').match(/shipping (\d+) SSR-safe/)[1]
const blocks = readFileSync('docs/blocks.md', 'utf8').match(/^(\d+) blocks in/m)[1]

const themes = {
  dark: {
    page: '#0A0A0C', glow: '#0A84FF', glowOp: 0.34, glow2: '#BF4800', glow2Op: 0.16,
    grid: '#FFFFFF', gridOp: 0.06, label: '#F5F5F7', label2: '#A1A1A6', label3: '#6E6E73',
    card: '#1C1C1F', cardStroke: '#FFFFFF', cardStrokeOp: 0.08, fill: '#2C2C30', p: '#0A84FF',
    green: '#30D158', codeBg: '#161618', codeKey: '#FF9F5A', codeStr: '#64B5FF', shadowOp: 0.55
  },
  light: {
    page: '#F5F5F7', glow: '#0071E3', glowOp: 0.18, glow2: '#BF4800', glow2Op: 0.08,
    grid: '#000000', gridOp: 0.06, label: '#1D1D1F', label2: '#515154', label3: '#86868B',
    card: '#FFFFFF', cardStroke: '#000000', cardStrokeOp: 0.06, fill: '#E8E8ED', p: '#0071E3',
    green: '#248A3D', codeBg: '#FFFFFF', codeKey: '#BF4800', codeStr: '#0066CC', shadowOp: 0.12
  }
}

const sans = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
const mono = `ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace`

// Mica wordmark, drawn on the MiLogo grid (viewBox 0 -8 218 68).
const wordmark = (c, p) => `
    <g fill="none" stroke="${c}" stroke-width="11">
      <path d="M5.5 60V28a13 12.5 0 0 1 26 0V60M31.5 28a13 12.5 0 0 1 26 0V60"/>
      <path d="M75.5 10V60"/>
      <path d="M126.79 21.21A19.5 19.5 0 1 0 126.79 48.79"/>
      <circle cx="165" cy="35" r="19.5"/>
      <path d="M184.5 10V60"/>
    </g>
    <circle cx="75.5" cy="-1.5" r="6.5" fill="${c}"/>
    <circle cx="207" cy="49" r="11" fill="${p}"/>`

const card = (t, x, y, w, h, body, rot = 0) => `
  <g transform="translate(${x} ${y}) rotate(${rot})" filter="url(#shadow)">
    <rect width="${w}" height="${h}" rx="18" fill="${t.card}"/>
    <rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="17.5" fill="none" stroke="${t.cardStroke}" stroke-opacity="${t.cardStrokeOp}"/>
    ${body}
  </g>`

const sw = (t, x, y, on) => `
    <rect x="${x}" y="${y}" width="44" height="26" rx="13" fill="${on ? t.p : t.fill}"/>
    <circle cx="${on ? x + 31 : x + 13}" cy="${y + 13}" r="11" fill="#FFFFFF"/>`

const banner = t => {
  const spark = [0, 14, 8, 22, 18, 30, 26, 40, 34, 48, 44, 58]
  const pts = spark.map((v, i) => `${24 + i * 22},${118 - v}`).join(' ')
  const bars = [38, 52, 30, 64, 46, 72, 58]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="480" viewBox="0 0 1280 480" role="img" aria-label="mica. Native calm, for every Nuxt app. A Nuxt 4 UI layer.">
  <defs>
    <radialGradient id="g1" cx="1040" cy="200" r="520" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${t.glow}" stop-opacity="${t.glowOp}"/>
      <stop offset="1" stop-color="${t.glow}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="140" cy="520" r="420" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${t.glow2}" stop-opacity="${t.glow2Op}"/>
      <stop offset="1" stop-color="${t.glow2}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orb" cx=".35" cy=".3" r=".8">
      <stop offset="0" stop-color="#5AB0FF"/>
      <stop offset=".55" stop-color="${t.p}"/>
      <stop offset="1" stop-color="#003E99"/>
    </radialGradient>
    <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.1" fill="${t.grid}" fill-opacity="${t.gridOp}"/>
    </pattern>
    <linearGradient id="fade" x1="0" x2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".45" stop-color="#fff" stop-opacity="1"/>
    </linearGradient>
    <mask id="gridMask"><rect width="1280" height="480" fill="url(#fade)"/></mask>
    <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${t.p}" stop-opacity=".28"/>
      <stop offset="1" stop-color="${t.p}" stop-opacity="0"/>
    </linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#000" flood-opacity="${t.shadowOp}"/>
    </filter>
    <clipPath id="frame"><rect width="1280" height="480" rx="28"/></clipPath>
  </defs>

  <g clip-path="url(#frame)">
  <rect width="1280" height="480" fill="${t.page}"/>
  <rect width="1280" height="480" fill="url(#dots)" mask="url(#gridMask)"/>
  <rect width="1280" height="480" fill="url(#g1)"/>
  <rect width="1280" height="480" fill="url(#g2)"/>

  <!-- the brand dot, oversized -->
  <circle cx="1190" cy="440" r="140" fill="url(#orb)"/>

  <!-- copy -->
  <g transform="translate(80 78) scale(.62)">${wordmark(t.label, t.p)}
  </g>
  <text x="80" y="188" font-family="${sans}" font-size="56" font-weight="700" letter-spacing="-2" fill="${t.label}">Native calm,</text>
  <text x="80" y="252" font-family="${sans}" font-size="56" font-weight="700" letter-spacing="-2" fill="${t.p}">for every Nuxt app.</text>
  <text x="80" y="300" font-family="${sans}" font-size="20" fill="${t.label2}">${components} SSR-safe components · ${blocks} blocks · light &amp; dark · 60 fps</text>

  <g transform="translate(80 336)">
    <rect width="500" height="56" rx="14" fill="${t.codeBg}"/>
    <rect x=".5" y=".5" width="499" height="55" rx="13.5" fill="none" stroke="${t.cardStroke}" stroke-opacity="${t.cardStrokeOp * 1.5}"/>
    <text x="22" y="35" font-family="${mono}" font-size="17" fill="${t.label}"><tspan fill="${t.codeKey}">extends</tspan>: [<tspan fill="${t.codeStr}">'github:DimitriDerthe/nuxt-mica'</tspan>]</text>
  </g>
  <text x="80" y="428" font-family="${sans}" font-size="14" font-weight="600" letter-spacing="2" fill="${t.label3}">NUXT 4 LAYER  ·  ZERO RUNTIME DEPENDENCIES  ·  AI-READY DOCS</text>

  <!-- live-looking sample stage -->
  ${card(t, 700, 60, 300, 150, `
    <text x="24" y="38" font-family="${sans}" font-size="14" fill="${t.label2}">Monthly revenue</text>
    <text x="24" y="76" font-family="${sans}" font-size="34" font-weight="700" letter-spacing="-1" fill="${t.label}">€48.2k</text>
    <rect x="186" y="20" width="90" height="26" rx="13" fill="${t.green}" fill-opacity=".14"/>
    <text x="231" y="38" text-anchor="middle" font-family="${sans}" font-size="13" font-weight="600" fill="${t.green}">+12.4%</text>
    <polygon points="24,118 ${pts} 266,118" fill="url(#area)" transform="translate(0 14)"/>
    <polyline points="${pts}" fill="none" stroke="${t.p}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 14)"/>`, -1.5)}

  ${card(t, 1028, 64, 190, 176, `
    <text x="22" y="36" font-family="${sans}" font-size="14" fill="${t.label2}">Weekly users</text>
    ${bars.map((b, i) => `<rect x="${20 + i * 22}" y="${156 - b * 1.4}" width="14" height="${b * 1.4}" rx="5" fill="${t.p}" fill-opacity="${i === 5 ? 1 : 0.32}"/>`).join('')}`, 1.5)}

  ${card(t, 704, 238, 296, 136, `
    <text x="22" y="34" font-family="${sans}" font-size="15" font-weight="600" fill="${t.label}">Settings</text>
    <text x="22" y="72" font-family="${sans}" font-size="15" fill="${t.label}">Cloud sync</text>${sw(t, 224, 54, true)}
    <rect x="22" y="90" width="246" height="1" fill="${t.cardStroke}" fill-opacity="${t.cardStrokeOp * 1.5}"/>
    <text x="22" y="118" font-family="${sans}" font-size="15" fill="${t.label}">Release alerts</text>${sw(t, 224, 100, false)}`, 0)}

  ${card(t, 700, 398, 330, 60, `
    <rect x="12" y="12" width="36" height="36" rx="10" fill="${t.p}"/>
    <circle cx="36" cy="36" r="5" fill="#FFFFFF"/>
    <text x="62" y="27" font-family="${sans}" font-size="14" font-weight="600" fill="${t.label}">Deploy finished</text>
    <text x="62" y="46" font-family="${sans}" font-size="13" fill="${t.label2}">mica-site is live on 3 regions in 41 s.</text>
    <text x="312" y="27" text-anchor="end" font-family="${sans}" font-size="12" fill="${t.label3}">now</text>`, 0)}
  </g>
</svg>
`
}

for (const [name, t] of Object.entries(themes)) writeFileSync(`${out}/banner-${name}.svg`, banner(t))

export interface MiTone {
  solid: string
  on: string
  hover: string
  tint: string
  tint2: string
  text: string
}

export function miHex(h: unknown, fallback: string): string {
  let s = String(h ?? '').trim().replace('#', '')
  if (s.length === 3) s = s.replace(/./g, '$&$&')
  return /^[0-9a-f]{6}$/i.test(s) ? '#' + s.toUpperCase() : fallback
}

const rgb = (h: string): number[] => {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const lum = (h: string): number =>
  rgb(h).reduce((a, c, i) => {
    const v = c / 255
    return a + [0.2126, 0.7152, 0.0722][i]! * (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  }, 0)

export function miContrast(a: string, b: string): number {
  const x = lum(a) + 0.05
  const y = lum(b) + 0.05
  return x > y ? x / y : y / x
}

export function miMix(a: string, b: string, t: number): string {
  const B = rgb(b)
  return '#' + rgb(a).map((c, i) => ('0' + Math.round(c + (B[i]! - c) * t).toString(16)).slice(-2)).join('').toUpperCase()
}

export const miRgba = (h: string, a: number): string => `rgba(${rgb(h).join(',')},${a})`

export function miOn(h: string): string {
  const w = miContrast(h, '#FFFFFF')
  return w >= 4.5 || w >= miContrast(h, '#000000') ? '#FFFFFF' : '#000000'
}

/** Derive every brand shade used by components from one hex, for one appearance. */
export function miTone(h: string, dark: boolean): MiTone {
  const bg = dark ? '#1C1C1E' : '#F5F5F7'
  const to = dark ? '#FFFFFF' : '#000000'
  let text = h
  for (let i = 1; i <= 10 && miContrast(text, bg) < 4.5; i++) text = miMix(h, to, i * 0.08)
  return {
    solid: h,
    on: miOn(h),
    hover: miMix(h, to, 0.1),
    tint: miRgba(h, dark ? 0.24 : 0.12),
    tint2: miRgba(h, dark ? 0.34 : 0.2),
    text
  }
}

export function miBrandCss(prefix: 'p' | 's', hex: string, dark: boolean): string {
  const t = miTone(hex, dark)
  return `--mi-${prefix}:${t.solid};--mi-${prefix}-on:${t.on};--mi-${prefix}-hover:${t.hover};--mi-${prefix}-tint:${t.tint};--mi-${prefix}-tint2:${t.tint2};--mi-${prefix}-text:${t.text};`
}

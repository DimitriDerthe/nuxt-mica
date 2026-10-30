import { miMix, miOn } from './color'

export interface MiRampStop {
  label: string
  color: string
  on: string
}

const STOPS: ReadonlyArray<readonly [number, string]> = [
  [0.86, '50'], [0.7, '100'], [0.5, '200'], [0.3, '300'], [0.14, '400'], [0, '500'], [-0.16, '600'], [-0.32, '700'], [-0.5, '800']
]

/** Nine-step brand ramp: tints toward white above 500, shades toward black below. */
export function miRamp(hex: string): MiRampStop[] {
  return STOPS.map(([t, label]) => {
    const color = t > 0 ? miMix(hex, '#FFFFFF', t) : t < 0 ? miMix(hex, '#000000', -t) : hex
    return { label, color, on: miOn(color) }
  })
}

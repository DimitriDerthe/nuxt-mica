export type MiPasswordRequirement = 'length' | 'upper' | 'lower' | 'number' | 'symbol'

export interface MiPasswordOptions {
  /** Minimum length for the `length` requirement and for scores above 1. Defaults to 8. */
  minLength?: number
}

export interface MiPasswordResult {
  /** 0 for an empty value, then 1 (weak) to 4 (strong). */
  score: 0 | 1 | 2 | 3 | 4
  /** Which requirements the value satisfies. */
  checks: Record<MiPasswordRequirement, boolean>
}

const COMMON = ['password', 'passw0rd', '12345678', '123456789', 'qwertyui', 'qwerty123', 'azertyui', 'letmein1', 'iloveyou', 'admin123']

/** Scores a password from 0 (empty) to 4 (strong) using length, character variety and a few obvious weaknesses. */
export function miPasswordScore(value: string, opts: MiPasswordOptions = {}): MiPasswordResult {
  const minLength = opts.minLength ?? 8
  const v = value ?? ''
  const checks: Record<MiPasswordRequirement, boolean> = {
    length: v.length >= minLength,
    upper: /\p{Lu}/u.test(v),
    lower: /\p{Ll}/u.test(v),
    number: /\d/.test(v),
    symbol: /[^\p{L}\d\s]|\s/u.test(v)
  }
  if (!v) return { score: 0, checks }

  const classes = (['upper', 'lower', 'number', 'symbol'] as const).filter(k => checks[k]).length
  const unique = new Set(v).size
  const lowered = v.toLowerCase()
  const weak = unique <= 2 || COMMON.some(c => lowered.includes(c)) || /^(.{1,3})\1+$/.test(v)

  let raw = 1
  if (checks.length) raw += 1
  if (v.length >= Math.max(minLength + 4, 12)) raw += 1
  if (classes >= 3) raw += 1
  if (classes < 2) raw = Math.min(raw, 2)
  if (!checks.length) raw = Math.min(raw, 1)
  if (weak) raw = 1
  return { score: Math.min(4, Math.max(1, raw)) as 1 | 2 | 3 | 4, checks }
}

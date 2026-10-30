import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'

describe('AI manifest', () => {
  it('generated files are up to date', () => {
    expect(() => execFileSync('node', ['scripts/gen-manifest.mjs', '--check'], { stdio: 'pipe' })).not.toThrow()
  }, 120000)
})

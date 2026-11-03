import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { components, rootOf } from '../site/server/utils/manifest'

const readme = readFileSync('README.md', 'utf8')

describe('component counts quoted in the docs', () => {
  it('README states the standalone and total component counts from the manifest', () => {
    const standalone = components.filter(c => !rootOf(c.name)).length
    expect(readme).toContain(`shipping ${standalone} SSR-safe UI components, ${components.length} \`<Mi…>\` tags`)
  })
})

describe('version', () => {
  it('package.json, the README pin and any tag on HEAD agree', () => {
    expect(() => execFileSync('node', ['scripts/release.mjs', '--check'], { stdio: 'pipe' })).not.toThrow()
  })
})

describe('README banner', () => {
  it('quotes the current component and block counts', () => {
    const standalone = components.filter(c => !rootOf(c.name)).length
    const blocks = readFileSync('docs/blocks.md', 'utf8').match(/^(\d+) blocks in/m)?.[1]
    for (const theme of ['light', 'dark']) {
      expect(readFileSync(`.github/assets/banner-${theme}.svg`, 'utf8')).toContain(`${standalone} SSR-safe components · ${blocks} blocks`)
    }
    expect(readme).toContain(`badge/components-${standalone}-`)
    expect(readme).toContain(`badge/blocks-${blocks}-`)
  })
})

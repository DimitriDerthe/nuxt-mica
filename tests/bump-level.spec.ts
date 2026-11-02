import { describe, it, expect } from 'vitest'
import { parseCommit, bumpLevel, releaseLevel, nextVersion, releaseNotes } from '../scripts/bump-level.mjs'

describe('release level detection', () => {
  it('parses type, scope, subject and the breaking marker', () => {
    expect(parseCommit('feat(site): add variants')).toEqual({ type: 'feat', scope: 'site', breaking: false, subject: 'add variants' })
    expect(parseCommit('fix!: drop the old prop')).toMatchObject({ type: 'fix', scope: null, breaking: true })
    expect(parseCommit('refactor(table): new API\n\nBREAKING CHANGE: rows is now required')).toMatchObject({ breaking: true })
    expect(parseCommit('chore: x\n\nBREAKING-CHANGE: y')).toMatchObject({ breaking: true })
    expect(parseCommit('Update README')).toMatchObject({ type: null, subject: 'Update README' })
  })

  it('does not treat a breaking mention in prose as a footer', () => {
    expect(parseCommit('fix: handle text that says BREAKING CHANGE: inline')).toMatchObject({ breaking: false })
  })

  it('takes the highest level across commits', () => {
    expect(bumpLevel(['fix: a', 'docs: b'])).toBe('patch')
    expect(bumpLevel(['fix: a', 'feat(x): b', 'chore: c'])).toBe('minor')
    expect(bumpLevel(['feat: a', 'feat!: b'])).toBe('major')
    expect(bumpLevel(['perf: a'])).toBe('patch')
    expect(bumpLevel(['refactor: a'])).toBe('patch')
    expect(bumpLevel(['Some non-conventional commit'])).toBe('patch')
  })

  it('skips the release when only docs, chore, ci, test or build commits landed', () => {
    expect(bumpLevel(['docs: a', 'chore(deps): b', 'ci(pages): c', 'test: d', 'build: e'])).toBeNull()
    expect(bumpLevel([])).toBeNull()
  })

  it('still releases a breaking change hidden behind a silent type', () => {
    expect(bumpLevel(['chore!: drop Node 24'])).toBe('major')
  })

  it('maps breaking changes to a minor bump before 1.0', () => {
    expect(releaseLevel(['feat!: a'], '0.3.0')).toBe('minor')
    expect(releaseLevel(['feat!: a'], '1.2.3')).toBe('major')
    expect(releaseLevel(['fix: a'], '0.3.0')).toBe('patch')
    expect(releaseLevel(['docs: a'], '0.3.0')).toBeNull()
  })

  it('computes the next version', () => {
    expect(nextVersion('0.3.0', 'patch')).toBe('0.3.1')
    expect(nextVersion('0.3.1', 'minor')).toBe('0.4.0')
    expect(nextVersion('1.4.2', 'major')).toBe('2.0.0')
  })

  it('groups release notes by impact and leaves silent commits out', () => {
    expect(releaseNotes(['feat(site): add x', 'fix: y', 'docs: z', 'refactor!: w'])).toBe(
      '## Breaking changes\n\n- w\n\n## Features\n\n- **site:** add x\n\n## Fixes\n\n- y\n'
    )
  })
})

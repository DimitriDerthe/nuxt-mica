import { describe, expect, it } from 'vitest'
import { isSafeMarkdownFileName } from '../site/server/utils/docs'

describe('site markdown filenames', () => {
  it('accepts hyphenated guide names', () => {
    expect(isSafeMarkdownFileName('content.md')).toBe(true)
  })

  it('rejects paths and non-markdown filenames', () => {
    expect(isSafeMarkdownFileName('../content.md')).toBe(false)
    expect(isSafeMarkdownFileName('content.txt')).toBe(false)
  })
})

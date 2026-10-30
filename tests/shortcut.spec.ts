import { describe, it, expect } from 'vitest'
import { isNavigationShortcut, matchShortcut, parseShortcut } from '~/utils/miShortcut'

const key = (k: string, init: KeyboardEventInit = {}) => new KeyboardEvent('keydown', { key: k, ...init })

describe('parseShortcut', () => {
  it('reads symbols, words and mixes', () => {
    expect(parseShortcut('⌘D')).toEqual({ mod: true, ctrl: false, alt: false, shift: false, key: 'd' })
    expect(parseShortcut('⇧⌘M')).toMatchObject({ mod: true, shift: true, key: 'm' })
    expect(parseShortcut('⌘⌫')).toMatchObject({ mod: true, key: 'backspace' })
    expect(parseShortcut('Cmd N')).toMatchObject({ mod: true, key: 'n' })
    expect(parseShortcut('Shift Cmd Z')).toMatchObject({ mod: true, shift: true, key: 'z' })
    expect(parseShortcut('Ctrl+K')).toMatchObject({ ctrl: true, mod: false, key: 'k' })
    expect(parseShortcut('Esc')).toMatchObject({ key: 'escape' })
    expect(parseShortcut('E')).toMatchObject({ key: 'e' })
  })
  it('rejects empty text and modifier-only hints', () => {
    expect(parseShortcut('')).toBeNull()
    expect(parseShortcut(undefined)).toBeNull()
    expect(parseShortcut('⌘')).toBeNull()
  })
  it('flags bare navigation keys', () => {
    expect(isNavigationShortcut(parseShortcut('⏎')!)).toBe(true)
    expect(isNavigationShortcut(parseShortcut('↩')!)).toBe(true)
    expect(isNavigationShortcut(parseShortcut('⌘⏎')!)).toBe(false)
    expect(isNavigationShortcut(parseShortcut('E')!)).toBe(false)
  })
})

describe('matchShortcut', () => {
  it('maps the command key to Cmd on macOS and Ctrl elsewhere', () => {
    const s = parseShortcut('⌘D')!
    expect(matchShortcut(key('d', { metaKey: true }), s, true)).toBe(true)
    expect(matchShortcut(key('d', { ctrlKey: true }), s, true)).toBe(false)
    expect(matchShortcut(key('d', { ctrlKey: true }), s, false)).toBe(true)
  })
  it('requires every modifier to agree', () => {
    const s = parseShortcut('⇧⌘M')!
    expect(matchShortcut(key('M', { metaKey: true, shiftKey: true }), s, true)).toBe(true)
    expect(matchShortcut(key('m', { metaKey: true }), s, true)).toBe(false)
    expect(matchShortcut(key('m', { metaKey: true, shiftKey: true, altKey: true }), s, true)).toBe(false)
  })
  it('matches special keys, falls back to the physical key under Option, ignores repeats', () => {
    expect(matchShortcut(key('Backspace', { metaKey: true }), parseShortcut('⌘⌫')!, true)).toBe(true)
    expect(matchShortcut(key('∂', { altKey: true, code: 'KeyD' }), parseShortcut('⌥D')!, true)).toBe(true)
    expect(matchShortcut(key('e', { repeat: true }), parseShortcut('E')!, true)).toBe(false)
  })
})

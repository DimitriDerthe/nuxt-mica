import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick, h } from 'vue'
import MiMenu from '~/components/Buttons/MiMenu.vue'
import MiTooltip from '~/components/Feedback/MiTooltip.vue'
import MiKbdGroup from '~/components/Base/MiKbdGroup.vue'
import type { MiMenuItem } from '~/utils/miMenu'

const wrappers: VueWrapper[] = []
const track = <T extends VueWrapper>(w: T): T => { wrappers.push(w); return w }
afterEach(() => { wrappers.splice(0).forEach(w => w.unmount()); document.body.innerHTML = '' })

// Control+D everywhere: the same test runs on any platform ("⌘" maps to Ctrl off macOS, so use Ctrl-based hints).
const press = (init: KeyboardEventInit & { key: string }) => document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }))

describe('item shortcuts in MiMenu', () => {
  const items: MiMenuItem[] = [
    { value: 'dup', label: 'Duplicate', shortcut: 'Ctrl D' },
    { value: 'rename', label: 'Rename', shortcut: '⏎' },
    { value: 'gone', label: 'Archive', shortcut: 'Ctrl A', disabled: true }
  ]
  const open = async (w: VueWrapper) => { await w.find('[data-mi-menu-trigger]').trigger('click', { detail: 0 }); await nextTick(); await nextTick() }

  it('selects the item and closes while the menu is open', async () => {
    const w = track(mount(MiMenu, { attachTo: document.body, props: { items, label: 'Actions' } }))
    await open(w)
    press({ key: 'd', ctrlKey: true })
    await nextTick()
    expect(w.emitted('select')?.[0]?.[0]).toMatchObject({ value: 'dup' })
    expect(w.find('[data-mi-menu-trigger]').attributes('aria-expanded')).toBe('false')
  })

  it('does nothing while closed, unless globalShortcuts is set', async () => {
    const closed = track(mount(MiMenu, { attachTo: document.body, props: { items, label: 'Actions' } }))
    press({ key: 'd', ctrlKey: true })
    expect(closed.emitted('select')).toBeUndefined()
    const global = track(mount(MiMenu, { attachTo: document.body, props: { items, label: 'Actions', globalShortcuts: true } }))
    press({ key: 'd', ctrlKey: true })
    expect(global.emitted('select')?.[0]?.[0]).toMatchObject({ value: 'dup' })
  })

  it('ignores disabled items and bare navigation keys', async () => {
    const w = track(mount(MiMenu, { attachTo: document.body, props: { items, label: 'Actions', globalShortcuts: true } }))
    press({ key: 'a', ctrlKey: true })
    press({ key: 'Enter' })
    expect(w.emitted('select')).toBeUndefined()
  })
})

describe('MiTooltip shortcut', () => {
  it('clicks the trigger when the shortcut is pressed, but not while typing', async () => {
    let clicks = 0
    const w = track(mount(MiTooltip, {
      attachTo: document.body,
      props: { content: 'Edit', shortcut: 'E' },
      slots: { default: () => h('button', { type: 'button', onClick: () => { clicks++ } }, 'Edit') }
    }))
    expect(w.exists()).toBe(true)
    const input = document.body.appendChild(document.createElement('input'))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', bubbles: true }))
    expect(clicks).toBe(0)
    press({ key: 'e' })
    expect(clicks).toBe(1)
  })
})

describe('MiKbdGroup shortcut', () => {
  it('emits press and shows the pressed state', async () => {
    const w = track(mount(MiKbdGroup, { props: { shortcut: 'Ctrl K' }, slots: { default: 'Ctrl K' } }))
    press({ key: 'k', ctrlKey: true })
    await nextTick()
    expect(w.emitted('press')).toHaveLength(1)
    expect(w.classes()).toContain('is-pressed')
  })
})

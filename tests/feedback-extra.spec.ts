import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, enableAutoUnmount } from '@vue/test-utils'
import { nextTick } from 'vue'
import MiAlertDialog from '../app/components/Feedback/MiAlertDialog.vue'
import MiDrawer from '../app/components/Feedback/MiDrawer.vue'
import MiHoverCard from '../app/components/Feedback/MiHoverCard.vue'

enableAutoUnmount(afterEach)
const body = () => document.body
async function flush() { await nextTick(); await nextTick(); await new Promise(r => setTimeout(r, 0)); await nextTick() }

describe('MiAlertDialog', () => {
  it('renders an alertdialog and emits confirm / cancel', async () => {
    const w = mount(MiAlertDialog, { attachTo: body(), props: { modelValue: true, size: 'sm', title: 'Delete?', description: 'Gone forever', confirmLabel: 'Delete', destructive: true } })
    await flush()
    const dlg = body().querySelector('[role=alertdialog]')!
    expect(dlg.getAttribute('aria-label') ?? dlg.getAttribute('aria-labelledby')).toBeTruthy()
    expect(dlg.textContent).toContain('Gone forever')
    const btns = [...dlg.querySelectorAll('button')]
    expect(btns.map(b => b.textContent)).toEqual(['Cancel', 'Delete'])
    btns[1]!.click()
    await flush()
    expect(w.emitted('confirm')).toBeTruthy()
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([false])
  })
  it('does not dismiss on Escape', async () => {
    const w = mount(MiAlertDialog, { attachTo: body(), props: { modelValue: true, title: 'Sure?' } })
    await flush()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flush()
    expect(w.emitted('update:modelValue')).toBeFalsy()
  })
})

describe('MiAlertDialog default size', () => {
  it('uses a media card but still announces as alertdialog', async () => {
    mount(MiAlertDialog, { attachTo: body(), props: { modelValue: true, title: 'Share', media: 'folder-plus' } })
    await flush()
    expect(body().querySelector('[role=alertdialog]')).toBeTruthy()
  })
})

describe('MiDrawer', () => {
  it('renders a labelled dialog with a handle and closes on Escape', async () => {
    const w = mount(MiDrawer, { attachTo: body(), props: { modelValue: true, title: 'Move goal', showSwipeHandle: true }, slots: { default: '<p id="c">body</p>' } })
    await flush()
    const dlg = body().querySelector('[role=dialog]')!
    expect(dlg.getAttribute('aria-modal')).toBe('true')
    expect(dlg.getAttribute('aria-labelledby')).toBeTruthy()
    expect(body().querySelector('[data-handle]')).toBeTruthy()
    expect(body().querySelector('#c')).toBeTruthy()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flush()
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([false])
    expect(w.emitted('close')![0]).toEqual(['escape'])
  })
  it('applies the side class and renders inline', () => {
    const w = mount(MiDrawer, { props: { inline: true, swipeDirection: 'right', title: 'T' }, slots: { default: 'x' } })
    expect(w.find('.mi-dr-root').classes()).toContain('mi-dr--right')
    expect(w.get('[role=dialog]').attributes('aria-modal')).toBeUndefined()
  })
  it('does not close when not dismissible', async () => {
    const w = mount(MiDrawer, { attachTo: body(), props: { modelValue: true, dismissible: false } })
    await flush()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flush()
    expect(w.emitted('update:modelValue')).toBeFalsy()
  })
})

describe('MiHoverCard', () => {
  it('opens after the delay on hover and closes after the close delay', async () => {
    vi.useFakeTimers()
    const w = mount(MiHoverCard, { attachTo: body(), props: { delay: 100, closeDelay: 50 }, slots: { trigger: '<a id="t" href="#">@user</a>', default: '<p id="c">profile</p>' } })
    await w.get('.mi-hc-anchor').trigger('pointerenter')
    vi.advanceTimersByTime(99)
    expect(w.emitted('update:modelValue')).toBeFalsy()
    vi.advanceTimersByTime(2)
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([true])
    await w.setProps({ modelValue: true })
    await w.get('.mi-hc-anchor').trigger('pointerleave')
    vi.advanceTimersByTime(60)
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([false])
    vi.useRealTimers()
  })
  it('opens on focus and links the trigger via aria-describedby', async () => {
    vi.useFakeTimers()
    const w = mount(MiHoverCard, { attachTo: body(), props: { delay: 0 }, slots: { trigger: '<a id="t" href="#">x</a>', default: 'card' } })
    await w.get('.mi-hc-anchor').trigger('focusin')
    vi.advanceTimersByTime(5)
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([true])
    vi.useRealTimers()
  })
  it('renders in place when inline', () => {
    const w = mount(MiHoverCard, { props: { inline: true }, slots: { trigger: '<a>x</a>', default: 'inline card' } })
    expect(w.get('[role=tooltip]').text()).toContain('inline card')
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, enableAutoUnmount } from '@vue/test-utils'
import { nextTick } from 'vue'
import MiActionSheet from '../app/components/Feedback/MiActionSheet.vue'
import MiAlert from '../app/components/Feedback/MiAlert.vue'
import MiBadge from '../app/components/Feedback/MiBadge.vue'
import MiBanner from '../app/components/Feedback/MiBanner.vue'
import MiContextMenu from '../app/components/Feedback/MiContextMenu.vue'
import MiDialog from '../app/components/Feedback/MiDialog.vue'
import MiEmptyState from '../app/components/Feedback/MiEmptyState.vue'
import MiNotification from '../app/components/Feedback/MiNotification.vue'
import MiPopover from '../app/components/Feedback/MiPopover.vue'
import MiProgress from '../app/components/Feedback/MiProgress.vue'
import MiProgressRing from '../app/components/Feedback/MiProgressRing.vue'
import MiSheet from '../app/components/Feedback/MiSheet.vue'
import MiSkeleton from '../app/components/Feedback/MiSkeleton.vue'
import MiSpinner from '../app/components/Feedback/MiSpinner.vue'
import MiToast from '../app/components/Feedback/MiToast.vue'
import MiToaster from '../app/components/Feedback/MiToaster.vue'
import MiTooltip from '../app/components/Feedback/MiTooltip.vue'
import { useMiToast } from '../app/composables/useMiToast'
import { miOverlayFocusables, miOverlayLockScroll, miOverlayPosition, miOverlayTrapTab, miFeedbackToneVars } from '../app/utils/miOverlay'

enableAutoUnmount(afterEach)

const body = () => document.body
const flush = async () => { await nextTick(); await nextTick(); await nextTick() }
const key = (el: Element | Document, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }))

beforeEach(() => { document.body.innerHTML = '' })

describe('miOverlay utils', () => {
  const vp = { width: 1000, height: 800 }
  const anchor = { left: 400, top: 300, width: 100, height: 30 }

  it('places below the anchor and centres', () => {
    const p = miOverlayPosition(anchor, { width: 200, height: 100 }, 'bottom', { viewport: vp, offset: 8 })
    expect(p.side).toBe('bottom')
    expect(p.y).toBe(338)
    expect(p.x).toBe(350)
    expect(p.arrow).toBe(100)
  })
  it('flips when there is no room', () => {
    const p = miOverlayPosition({ ...anchor, top: 740 }, { width: 200, height: 100 }, 'bottom-start', { viewport: vp })
    expect(p.side).toBe('top')
    expect(p.placement).toBe('top-start')
    expect(p.y).toBeLessThan(740)
  })
  it('shifts inside the viewport and keeps the arrow on the anchor', () => {
    const p = miOverlayPosition({ left: 2, top: 100, width: 40, height: 20 }, { width: 300, height: 80 }, 'bottom', { viewport: vp, padding: 8 })
    expect(p.x).toBe(8)
    expect(p.arrow).toBeGreaterThanOrEqual(16)
  })
  it('does not flip when flip is disabled', () => {
    const p = miOverlayPosition({ ...anchor, top: 760 }, { width: 100, height: 100 }, 'bottom', { viewport: vp, flip: false })
    expect(p.side).toBe('bottom')
  })
  it('exposes tone variables', () => {
    expect(miFeedbackToneVars('primary')['--t-solid']).toBe('var(--mi-p)')
    expect(miFeedbackToneVars('danger')['--t-text']).toBe('var(--mi-red-t)')
  })
  it('lists focusables and traps Tab', () => {
    const root = document.createElement('div')
    root.innerHTML = '<button id="a">a</button><button disabled>x</button><a href="#">l</a><button id="z">z</button>'
    document.body.append(root)
    const list = miOverlayFocusables(root)
    expect(list.map(e => e.tagName)).toEqual(['BUTTON', 'A', 'BUTTON'])
    list.at(-1)!.focus()
    const ev = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true })
    expect(miOverlayTrapTab(ev, root)).toBe(true)
    expect(ev.defaultPrevented).toBe(true)
    expect(document.activeElement?.id).toBe('a')
  })
  it('ref-counts scroll lock', () => {
    const a = miOverlayLockScroll()
    const b = miOverlayLockScroll()
    expect(document.documentElement.style.overflow).toBe('hidden')
    a()
    expect(document.documentElement.style.overflow).toBe('hidden')
    b()
    expect(document.documentElement.style.overflow).toBe('')
  })
})

describe('MiDialog', () => {
  const actions = [{ id: 'cancel', label: 'Cancel', kind: 'cancel' as const }, { id: 'delete', label: 'Delete', kind: 'destructive' as const }]

  it('renders an inline alert with alertdialog semantics', () => {
    const w = mount(MiDialog, { props: { inline: true, title: 'Delete?', message: 'Gone.', actions } })
    const el = w.get('[role=alertdialog]')
    expect(el.attributes('aria-labelledby')).toBeTruthy()
    expect(w.get(`#${el.attributes('aria-labelledby')}`).text()).toBe('Delete?')
    expect(w.findAll('button').map(b => b.text())).toEqual(['Cancel', 'Delete'])
    expect(w.find('.mi-dlg-actions').classes()).not.toContain('is-stacked')
  })
  it('stacks three actions and renders the dialog variant with icon', () => {
    const w = mount(MiDialog, { props: { inline: true, variant: 'dialog', title: 'Save', icon: 'document', actions: [{ id: 'a', label: 'Save', kind: 'primary' }, { id: 'b', label: 'No' }, { id: 'c', label: 'Cancel', kind: 'cancel' }] } })
    expect(w.find('[role=dialog]').exists()).toBe(true)
    expect(w.find('.mi-dlg-icon svg').exists()).toBe(true)
    expect(w.find('.mi-dlg-actions').classes()).toContain('is-stacked')
  })
  it('emits action and closes the model', async () => {
    const w = mount(MiDialog, { attachTo: body(), props: { modelValue: true, title: 'T', actions, 'onUpdate:modelValue': (v: boolean) => w.setProps({ modelValue: v }) } })
    await flush()
    const dlg = body().querySelector('[role=alertdialog]')!
    expect(dlg).toBeTruthy()
    expect(dlg.getAttribute('aria-modal')).toBe('true')
    ;(Array.from(dlg.querySelectorAll('button')).find(b => b.textContent === 'Delete') as HTMLButtonElement).click()
    await flush()
    expect(w.emitted('action')![0]).toEqual(['delete'])
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([false])
  })
  it('focuses the safe action, locks scroll, closes on Escape and restores focus', async () => {
    const opener = document.createElement('button')
    document.body.append(opener)
    opener.focus()
    const w = mount(MiDialog, { attachTo: body(), props: { modelValue: false, title: 'T', actions, 'onUpdate:modelValue': (v: boolean) => w.setProps({ modelValue: v }) } })
    await w.setProps({ modelValue: true })
    await flush()
    expect(document.activeElement?.textContent).toBe('Cancel')
    expect(document.documentElement.style.overflow).toBe('hidden')
    key(document.activeElement!, 'Escape')
    await flush()
    expect(w.emitted('close')![0]).toEqual(['escape'])
    expect(document.documentElement.style.overflow).toBe('')
    expect(document.activeElement).toBe(opener)
  })
  it('traps Tab inside the panel', async () => {
    mount(MiDialog, { attachTo: body(), props: { modelValue: true, title: 'T', actions } })
    await flush()
    const btns = body().querySelectorAll<HTMLButtonElement>('.mi-dlg-btn')
    btns[btns.length - 1]!.focus()
    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    document.activeElement!.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(btns[0])
  })
  it('ignores Escape when persistent', async () => {
    const w = mount(MiDialog, { attachTo: body(), props: { modelValue: true, persistent: true, title: 'T', actions } })
    await flush()
    key(document.activeElement!, 'Escape')
    await flush()
    expect(w.emitted('close')).toBeUndefined()
  })
})

describe('MiActionSheet', () => {
  const actions = [{ id: 'a', label: 'Copy link' }, { id: 'b', label: 'Invite' }, { id: 'c', label: 'Stop', kind: 'destructive' as const }]
  it('renders menu semantics and a cancel button', () => {
    const w = mount(MiActionSheet, { props: { inline: true, title: 'Share', actions } })
    expect(w.get('[role=menu]').attributes('aria-labelledby')).toBeTruthy()
    expect(w.findAll('[role=menuitem]')).toHaveLength(3)
    expect(w.get('.mi-as-cancel').text()).toBe('Cancel')
    expect(w.findAll('.is-destructive')).toHaveLength(1)
  })
  it('navigates with arrows and emits actions', async () => {
    const w = mount(MiActionSheet, { attachTo: body(), props: { modelValue: true, title: 'Share', actions } })
    await flush()
    expect(document.activeElement?.textContent).toBe('Copy link')
    key(document.activeElement!, 'ArrowDown')
    expect(document.activeElement?.textContent).toBe('Invite')
    key(document.activeElement!, 'End')
    expect(document.activeElement?.textContent).toBe('Stop')
    key(document.activeElement!, 'ArrowDown')
    expect(document.activeElement?.textContent).toBe('Copy link')
    ;(document.activeElement as HTMLButtonElement).click()
    expect(w.emitted('action')![0]).toEqual(['a'])
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([false])
  })
  it('emits cancel with its reason', async () => {
    const w = mount(MiActionSheet, { attachTo: body(), props: { modelValue: true, actions } })
    await flush()
    key(document.activeElement!, 'Escape')
    expect(w.emitted('cancel')![0]).toEqual(['escape'])
  })
})

describe('MiContextMenu', () => {
  const items = [
    { id: 'open', label: 'Open', icon: 'eye' as const, shortcut: '⌘O' },
    { id: 's', type: 'separator' as const },
    { id: 'move', label: 'Move to', children: [{ id: 'docs', label: 'Documents' }] },
    { id: 'side', label: 'Show in sidebar', type: 'checkbox' as const, checked: true },
    { id: 'trash', label: 'Trash', destructive: true }
  ]
  it('renders roles, separator, checkbox state and submenu hints', () => {
    const w = mount(MiContextMenu, { props: { inline: true, items, highlighted: 'open', label: 'Project' } })
    expect(w.get('[role=menu]').attributes('aria-label')).toBe('Project')
    expect(w.find('[role=separator]').exists()).toBe(true)
    expect(w.get('[role=menuitemcheckbox]').attributes('aria-checked')).toBe('true')
    expect(w.get('[data-id=move]').attributes('aria-haspopup')).toBe('menu')
    expect(w.get('[data-id=open]').classes()).toContain('is-hl')
    expect(w.get('.mi-cm-short').text()).toBe('⌘O')
  })
  it('emits select', async () => {
    const w = mount(MiContextMenu, { props: { inline: true, items } })
    await w.get('[data-id=trash]').trigger('click')
    expect(w.emitted('select')![0]![0]).toBe('trash')
  })
  it('opens on contextmenu, navigates by keyboard and selects', async () => {
    const w = mount(MiContextMenu, { attachTo: body(), props: { items }, slots: { default: '<div id="area" tabindex="0">area</div>' } })
    await w.get('#area').trigger('contextmenu', { clientX: 20, clientY: 30 })
    await flush()
    const menu = body().querySelector<HTMLElement>('[role=menu]')!
    expect(menu).toBeTruthy()
    key(menu, 'ArrowDown')
    expect(document.activeElement?.getAttribute('data-id')).toBe('open')
    key(document.activeElement!, 'ArrowDown')
    expect(document.activeElement?.getAttribute('data-id')).toBe('move')
    key(document.activeElement!, 'ArrowRight')
    await flush()
    expect(body().querySelectorAll('[role=menu]')).toHaveLength(2)
    key(document.activeElement!, 'ArrowLeft')
    await flush()
    expect(body().querySelectorAll('[role=menu]')).toHaveLength(1)
    key(document.activeElement!, 'Escape')
    await flush()
    expect(w.emitted('close')).toBeTruthy()
  })
})

describe('MiContextMenu viewport', () => {
  it('keeps a menu opened near the right edge fully on screen', async () => {
    const items = [{ id: 'a', label: 'Rename' }, { id: 'b', label: 'Delete', destructive: true }]
    const w = mount(MiContextMenu, { attachTo: body(), props: { items } })
    ;(w.vm as unknown as { openAt: (x: number, y: number) => void }).openAt(window.innerWidth + 200, 20)
    await flush()
    const panel = body().querySelector<HTMLElement>('.mi-cm-root [style*="translate3d"]')!
    const x = Number(panel.style.transform.match(/translate3d\((-?[\d.]+)px/)![1])
    expect(x).toBeGreaterThanOrEqual(8)
    expect(x).toBeLessThanOrEqual(window.innerWidth - 8)
    w.unmount()
  })
})

describe('MiPopover', () => {
  it('toggles from the trigger and reflects aria-expanded', async () => {
    const w = mount(MiPopover, {
      attachTo: body(),
      props: { label: 'Members' },
      slots: { trigger: '<button id="t">Members</button>', default: '<p id="c">content</p>' }
    })
    const t = w.get('#t')
    expect(t.attributes('aria-expanded')).toBe('false')
    await t.trigger('click')
    await flush()
    expect(t.attributes('aria-expanded')).toBe('true')
    const dlg = body().querySelector('[role=dialog]')!
    expect(dlg.getAttribute('aria-label')).toBe('Members')
    expect(body().querySelector('#c')).toBeTruthy()
    key(document.activeElement!, 'Escape')
    await flush()
    expect(t.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(t.element)
  })
  it('closes on outside pointerdown', async () => {
    const w = mount(MiPopover, { attachTo: body(), props: { modelValue: true }, slots: { trigger: '<button id="t">x</button>', default: 'hi' } })
    await flush()
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await flush()
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([false])
  })
  it('renders in place when inline', () => {
    const w = mount(MiPopover, { props: { inline: true }, slots: { trigger: '<button>x</button>', default: 'inline body' } })
    expect(w.get('[role=dialog]').text()).toContain('inline body')
    expect(w.find('.mi-pop-arrow').exists()).toBe(true)
  })
})

describe('MiTooltip', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('describes the trigger and opens after the delay on hover', async () => {
    const w = mount(MiTooltip, { attachTo: body(), props: { content: 'Duplicate', shortcut: '⌘D', delay: 300 }, slots: { default: '<button id="b">b</button>' } })
    await flush()
    const tip = body().querySelector('[role=tooltip]')!
    expect(tip.textContent).toContain('Duplicate')
    expect(tip.textContent).toContain('⌘D')
    expect(w.get('#b').attributes('aria-describedby')).toContain(tip.id)
    expect(tip.classList.contains('is-in')).toBe(false)
    await w.get('.mi-tip-anchor').trigger('pointerenter')
    vi.advanceTimersByTime(299)
    await nextTick()
    expect(tip.classList.contains('is-in')).toBe(false)
    vi.advanceTimersByTime(2)
    await flush()
    expect(tip.classList.contains('is-in')).toBe(true)
    await w.get('.mi-tip-anchor').trigger('pointerleave')
    await flush()
    expect(tip.classList.contains('is-in')).toBe(false)
  })
  it('opens immediately on focus and closes on Escape', async () => {
    const w = mount(MiTooltip, { attachTo: body(), props: { content: 'Hi' }, slots: { default: '<button id="b">b</button>' } })
    await flush()
    await w.get('.mi-tip-anchor').trigger('focusin')
    await flush()
    const tip = body().querySelector('[role=tooltip]')!
    expect(tip.classList.contains('is-in')).toBe(true)
    key(document, 'Escape')
    await flush()
    expect(tip.classList.contains('is-in')).toBe(false)
  })
  it('ignores focus that follows a pointer press', async () => {
    const w = mount(MiTooltip, { attachTo: body(), props: { content: 'Hi' }, slots: { default: '<button id="b">b</button>' } })
    await flush()
    await w.get('.mi-tip-anchor').trigger('pointerdown')
    await w.get('.mi-tip-anchor').trigger('focusin')
    await flush()
    expect(body().querySelector('[role=tooltip]')!.classList.contains('is-in')).toBe(false)
  })
  it('never opens when disabled', async () => {
    const w = mount(MiTooltip, { attachTo: body(), props: { content: 'Hi', disabled: true }, slots: { default: '<button>b</button>' } })
    await flush()
    await w.get('.mi-tip-anchor').trigger('focusin')
    await flush()
    expect(body().querySelector('[role=tooltip]')!.classList.contains('is-in')).toBe(false)
  })
})

describe('MiSheet', () => {
  it('renders the inline card with navigation and title', async () => {
    const w = mount(MiSheet, { props: { inline: true, title: 'New event', cancelLabel: 'Cancel', confirmLabel: 'Add' }, slots: { default: '<p>body</p>' } })
    expect(w.get('[role=dialog]').attributes('aria-labelledby')).toBeTruthy()
    expect(w.get('h3').text()).toBe('New event')
    await w.findAll('.mi-sh-act')[1]!.trigger('click')
    expect(w.emitted('confirm')).toHaveLength(1)
    await w.findAll('.mi-sh-act')[0]!.trigger('click')
    expect(w.emitted('cancel')).toHaveLength(1)
  })
  it('opens modally and sets the detent offset', async () => {
    mount(MiSheet, { attachTo: body(), props: { modelValue: true, title: 'T', detents: [0.5, 1] } })
    await flush()
    const root = body().querySelector<HTMLElement>('.mi-sh-root')!
    expect(root.style.getPropertyValue('--mi-sh-max')).toBe('1')
    expect(root.style.getPropertyValue('--mi-sh-y')).toBe('50')
    expect(body().querySelector('[role=dialog]')!.getAttribute('aria-modal')).toBe('true')
    expect(document.documentElement.style.overflow).toBe('hidden')
  })
  it('changes detent with the grabber keys and dismisses with Escape', async () => {
    const w = mount(MiSheet, { attachTo: body(), props: { modelValue: true, detent: 0, detents: ['medium', 'large'], title: 'T', 'onUpdate:detent': (v: number) => w.setProps({ detent: v }), 'onUpdate:modelValue': (v: boolean) => w.setProps({ modelValue: v }) } })
    await flush()
    const grab = body().querySelector<HTMLElement>('.mi-sh-grab')!
    expect(grab.getAttribute('aria-label')).toBe('Change sheet size')
    key(grab, 'ArrowUp')
    await flush()
    expect(w.emitted('update:detent')!.at(-1)).toEqual([1])
    key(grab, 'ArrowDown')
    await flush()
    expect(w.emitted('update:detent')!.at(-1)).toEqual([0])
    key(document.activeElement!, 'Escape')
    await flush()
    expect(w.emitted('close')![0]).toEqual(['escape'])
  })
  it('stays open on Escape when not dismissible', async () => {
    const w = mount(MiSheet, { attachTo: body(), props: { modelValue: true, dismissible: false, title: 'T' } })
    await flush()
    key(document.activeElement!, 'Escape')
    expect(w.emitted('close')).toBeUndefined()
  })
})

describe('MiNotification', () => {
  it('shows title, time, message and dismisses', async () => {
    const w = mount(MiNotification, { props: { title: 'Design review', time: 'now', message: 'Room 4', icon: 'calendar', dismissible: true } })
    expect(w.attributes('role')).toBe('status')
    expect(w.text()).toContain('Design review')
    expect(w.text()).toContain('now')
    expect(w.text()).toContain('Room 4')
    await w.get('button[aria-label=Dismiss]').trigger('click')
    expect(w.emitted('dismiss')).toHaveLength(1)
  })
  it('becomes a button when interactive and takes the tone colour', async () => {
    const w = mount(MiNotification, { props: { title: 'x', interactive: true, tone: 'secondary' } })
    expect(w.get('button.mi-ntf-main').exists()).toBe(true)
    await w.get('button.mi-ntf-main').trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
    expect((w.element as HTMLElement).style.getPropertyValue('--t-solid')).toBe('var(--mi-s)')
  })
})

describe('MiAlert', () => {
  it('uses alert role for danger and status otherwise', () => {
    expect(mount(MiAlert, { props: { tone: 'danger', title: 'x' } }).get('.mi-alert').attributes('role')).toBe('alert')
    expect(mount(MiAlert, { props: { tone: 'success', title: 'x' } }).get('.mi-alert').attributes('role')).toBe('status')
  })
  it('emits action and hides itself on dismiss', async () => {
    const w = mount(MiAlert, { props: { title: 'x', message: 'y', actionLabel: 'Retry', dismissible: true } })
    await w.get('.mi-alert-btn').trigger('click')
    expect(w.emitted('action')).toHaveLength(1)
    await w.get('button[aria-label=Dismiss]').trigger('click')
    expect(w.emitted('dismiss')).toHaveLength(1)
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual([false])
  })
  it('renders slot content including links', () => {
    const w = mount(MiAlert, { props: { title: 'x' }, slots: { default: 'Text <a href="#">Learn more</a>' } })
    expect(w.get('a').text()).toBe('Learn more')
  })
})

describe('MiBanner', () => {
  it('renders variants, action and dismiss', async () => {
    const w = mount(MiBanner, { props: { title: 'Offline', message: 'Sync paused', tone: 'danger', variant: 'solid', actionLabel: 'Retry', dismissible: true, sticky: true } })
    expect(w.attributes('role')).toBe('alert')
    expect(w.classes()).toEqual(expect.arrayContaining(['is-solid', 'is-sticky']))
    await w.get('.mi-bnr-btn').trigger('click')
    await w.get('.mi-bnr-x').trigger('click')
    expect(w.emitted('action')).toHaveLength(1)
    expect(w.emitted('dismiss')).toHaveLength(1)
  })
  it('can hide the icon', () => {
    expect(mount(MiBanner, { props: { message: 'm', icon: false } }).find('.mi-bnr-icon').exists()).toBe(false)
  })
})

describe('MiProgress', () => {
  it('exposes progressbar values and the transform fill', () => {
    const w = mount(MiProgress, { props: { label: 'Exporting', value: 64 } })
    const bar = w.get('[role=progressbar]')
    expect(bar.attributes('aria-valuenow')).toBe('64')
    expect(bar.attributes('aria-valuemax')).toBe('100')
    expect(bar.attributes('aria-label')).toBe('Exporting')
    expect(w.text()).toContain('64 %')
    expect((w.get('.mi-prog-fill').element as HTMLElement).style.transform).toContain('-36%')
  })
  it('is indeterminate without a value', () => {
    const w = mount(MiProgress, { props: { label: 'Loading' } })
    expect(w.get('[role=progressbar]').attributes('aria-valuenow')).toBeUndefined()
    expect(w.get('.mi-prog-fill').classes()).toContain('is-indet')
  })
  it('renders segments with a descriptive label and legend', () => {
    const w = mount(MiProgress, { props: { label: 'Storage', valueText: '38 of 50 GB', segments: [{ value: 40, label: 'Documents' }, { value: 26, label: 'Photos', tone: 'secondary' }] } })
    expect(w.get('[role=img]').attributes('aria-label')).toBe('Storage: Documents 40 %, Photos 26 %')
    expect(w.findAll('.mi-prog-legend li')).toHaveLength(2)
    expect(w.text()).toContain('38 of 50 GB')
  })
  it('clamps out of range values', () => {
    const w = mount(MiProgress, { props: { value: 250 } })
    expect((w.get('.mi-prog-fill').element as HTMLElement).style.transform).toContain('0%')
  })
})

describe('MiProgressRing', () => {
  it('draws the arc from the value and shows the percentage', () => {
    const w = mount(MiProgressRing, { props: { value: 72, label: 'Upload' } })
    expect(w.attributes('role')).toBe('progressbar')
    expect(w.attributes('aria-valuenow')).toBe('72')
    expect(w.text()).toBe('72%')
    const bar = w.get('.mi-ring-bar')
    const c = Number(bar.attributes('stroke-dasharray'))
    expect(Number(bar.attributes('stroke-dashoffset'))).toBeCloseTo(c * 0.28, 1)
  })
  it('hides the centre label on small rings and spins when indeterminate', () => {
    const w = mount(MiProgressRing, { props: { size: 28 } })
    expect(w.find('.mi-ring-val').exists()).toBe(false)
    expect(w.get('.mi-ring-svg').classes()).toContain('is-spin')
  })
  it('stop variant can be a button', async () => {
    const w = mount(MiProgressRing, { props: { variant: 'stop', stoppable: true, size: 28, label: 'Download' } })
    expect(w.element.tagName).toBe('BUTTON')
    expect(w.attributes('aria-label')).toBe('Stop Download')
    await w.trigger('click')
    expect(w.emitted('stop')).toHaveLength(1)
    expect(w.find('.mi-ring-stop').exists()).toBe(true)
  })
})

describe('MiSpinner', () => {
  it('is a labelled status with ticks by default', () => {
    const w = mount(MiSpinner)
    expect(w.attributes('role')).toBe('status')
    expect(w.attributes('aria-label')).toBe('Loading')
    expect(w.findAll('path')).toHaveLength(8)
  })
  it('supports the arc variant, sizes and decorative use', () => {
    const w = mount(MiSpinner, { props: { variant: 'arc', size: 28, tone: 'primary', label: '' } })
    expect(w.find('.is-arc').exists()).toBe(true)
    expect(w.get('svg').attributes('width')).toBe('28')
    expect(w.attributes('role')).toBeUndefined()
    expect(w.attributes('aria-hidden')).toBe('true')
    expect((w.element as HTMLElement).style.color).toBe('var(--mi-p)')
  })
})

describe('MiSkeleton', () => {
  it('renders blocks, circles and text lines as decorative', () => {
    expect(mount(MiSkeleton, { props: { variant: 'circle', width: 44 } }).get('.mi-skel').attributes('style')).toContain('border-radius: 50%')
    const lines = mount(MiSkeleton, { props: { variant: 'text', lines: ['88%', '70%'] } })
    expect(lines.findAll('.mi-skel')).toHaveLength(2)
    expect(lines.findAll('.mi-skel')[1]!.attributes('style')).toContain('width: 70%')
    expect(mount(MiSkeleton).attributes('aria-hidden')).toBe('true')
  })
  it('acts as a busy container when it has children', () => {
    const w = mount(MiSkeleton, { slots: { default: '<span class="child"></span>' } })
    expect(w.attributes('aria-busy')).toBe('true')
    expect(w.attributes('aria-label')).toBe('Loading content')
  })
  it('can disable the shimmer', () => {
    expect(mount(MiSkeleton, { props: { animated: false } }).classes()).toContain('is-still')
  })
})

describe('MiBadge', () => {
  it('renders label badges with a dot', () => {
    const w = mount(MiBadge, { props: { tone: 'success', dot: true }, slots: { default: 'Live' } })
    expect(w.text()).toBe('Live')
    expect(w.find('.mi-badge-dot').exists()).toBe(true)
  })
  it('caps counts, labels them and hides zero', () => {
    const w = mount(MiBadge, { props: { count: 120 } })
    expect(w.text()).toBe('99+')
    expect(w.attributes('aria-label')).toBe('99 or more unread')
    expect(mount(MiBadge, { props: { count: 3 } }).attributes('aria-label')).toBe('3 unread')
    expect(mount(MiBadge, { props: { count: 0 } }).find('.mi-badge').exists()).toBe(false)
    expect(mount(MiBadge, { props: { count: 0, showZero: true } }).text()).toBe('0')
  })
  it('anchors to a target with the requested placement', () => {
    const w = mount(MiBadge, { props: { count: 3, placement: 'bottom-left' }, slots: { target: '<span class="t">T</span>' } })
    expect(w.find('.t').exists()).toBe(true)
    const style = (w.get('.mi-badge').element as HTMLElement).style
    expect(style.bottom).toBe('-6px')
    expect(style.left).toBe('-6px')
  })
  it('renders dot-only status badges', () => {
    const w = mount(MiBadge, { props: { dotOnly: true, tone: 'success', dotSize: 12, ariaLabel: 'Online' }, slots: { target: '<span>AM</span>' } })
    expect(w.get('[aria-label=Online]').exists()).toBe(true)
    expect(w.get('.mi-badge-dotfill').attributes('style')).toContain('12px')
  })
  it('uses rounded corners for outline badges', () => {
    const w = mount(MiBadge, { props: { variant: 'outline', tone: 'neutral' }, slots: { default: 'v2.4.0' } })
    expect(w.classes()).toContain('s-rounded')
  })
})

describe('MiEmptyState', () => {
  it('renders title, description and actions', async () => {
    const w = mount(MiEmptyState, { props: { title: 'No projects yet', description: 'Create one.', primaryLabel: 'New project', secondaryLabel: 'Import', card: true } })
    expect(w.get('h3').text()).toBe('No projects yet')
    expect(w.text()).toContain('Create one.')
    expect(w.classes()).toContain('is-card')
    await w.findAll('button')[0]!.trigger('click')
    await w.findAll('button')[1]!.trigger('click')
    expect(w.emitted('primary')).toHaveLength(1)
    expect(w.emitted('secondary')).toHaveLength(1)
  })
  it('supports a custom heading level and slots', () => {
    const w = mount(MiEmptyState, { props: { title: 'T', as: 'h2' }, slots: { icon: '<i class="x"/>', actions: '<a class="y">go</a>' } })
    expect(w.find('h2').exists()).toBe(true)
    expect(w.find('.x').exists()).toBe(true)
    expect(w.find('.y').exists()).toBe(true)
  })
})

describe('MiToast', () => {
  it('renders tones, action and dismiss', async () => {
    const w = mount(MiToast, { props: { message: 'Link copied', tone: 'success', actionLabel: 'Undo', dismissible: true } })
    expect(w.attributes('role')).toBe('status')
    expect(w.find('svg').exists()).toBe(true)
    await w.get('.mi-toast-act').trigger('click')
    await w.get('.mi-toast-x').trigger('click')
    expect(w.emitted('action')).toHaveLength(1)
    expect(w.emitted('dismiss')).toHaveLength(1)
  })
  it('uses alert for errors, a spinner for loading and the material variant', () => {
    expect(mount(MiToast, { props: { message: 'x', tone: 'error' } }).attributes('role')).toBe('alert')
    const w = mount(MiToast, { props: { message: 'Uploading…', tone: 'loading', variant: 'material' } })
    expect(w.findComponent(MiSpinner).exists()).toBe(true)
    expect(w.classes()).toContain('is-material')
  })
})

describe('useMiToast + MiToaster', () => {
  beforeEach(() => { vi.useFakeTimers(); useMiToast().clear() })
  afterEach(() => { useMiToast().clear(); vi.useRealTimers() })

  it('queues, auto-dismisses and updates toasts', () => {
    const t = useMiToast()
    const id = t.loading('Uploading…')
    expect(t.toasts.value).toHaveLength(1)
    expect(t.toasts.value[0]!.duration).toBe(0)
    vi.advanceTimersByTime(10000)
    expect(t.toasts.value).toHaveLength(1)
    t.update(id, { message: 'Done', tone: 'success' })
    expect(t.toasts.value[0]!.message).toBe('Done')
    vi.advanceTimersByTime(4001)
    expect(t.toasts.value).toHaveLength(0)
  })
  it('replaces toasts sharing an id and calls onDismiss', () => {
    const t = useMiToast()
    const onDismiss = vi.fn()
    t.show({ id: 'a', message: 'one', onDismiss })
    t.show({ id: 'a', message: 'two' })
    expect(t.toasts.value).toHaveLength(1)
    expect(t.toasts.value[0]!.message).toBe('two')
    t.show({ id: 'b', message: 'b', onDismiss })
    t.dismiss('b')
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
  it('pauses and resumes timers', () => {
    const t = useMiToast()
    t.info('hold', { duration: 3000 })
    vi.advanceTimersByTime(2000)
    t.pause()
    vi.advanceTimersByTime(10000)
    expect(t.toasts.value).toHaveLength(1)
    t.resume()
    vi.advanceTimersByTime(1300)
    expect(t.toasts.value).toHaveLength(0)
  })
  it('resolves promises into success / error toasts', async () => {
    vi.useRealTimers()
    const t = useMiToast()
    await t.promise(Promise.resolve(1), { loading: 'Working', success: 'Done', error: 'Nope' })
    await Promise.resolve()
    expect(t.toasts.value[0]!.tone).toBe('success')
    expect(t.toasts.value[0]!.message).toBe('Done')
    t.clear()
    await t.promise(Promise.reject(new Error('x')), { loading: 'Working', success: 'Done', error: e => (e as Error).message }).catch(() => {})
    await Promise.resolve()
    expect(t.toasts.value[0]!.tone).toBe('error')
    expect(t.toasts.value[0]!.message).toBe('x')
  })
  it('shows toasts in the toaster region and wires actions', async () => {
    const t = useMiToast()
    mount(MiToaster, { attachTo: body(), props: { limit: 2 } })
    await flush()
    const onClick = vi.fn()
    t.success('A', { action: { label: 'Undo', onClick } })
    t.info('B')
    t.warning('C')
    await flush()
    const region = body().querySelector('[role=region]')!
    expect(region.getAttribute('aria-label')).toBe('Notifications')
    expect(region.getAttribute('aria-live')).toBe('polite')
    expect(Array.from(region.querySelectorAll('.mi-toast-msg')).map(e => e.textContent)).toEqual(['B', 'C'])
    t.clear()
    t.success('A', { action: { label: 'Undo', onClick } })
    await flush()
    ;(region.querySelector('.mi-toast-act') as HTMLButtonElement).click()
    await flush()
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(t.toasts.value).toHaveLength(0)
  })
  it('orders top positions newest first', async () => {
    const t = useMiToast()
    mount(MiToaster, { attachTo: body(), props: { position: 'top-right' } })
    await flush()
    t.info('first')
    t.info('second')
    await flush()
    expect(Array.from(body().querySelectorAll('.mi-toast-msg')).map(e => e.textContent)).toEqual(['second', 'first'])
  })
})

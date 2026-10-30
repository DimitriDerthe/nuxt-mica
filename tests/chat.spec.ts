import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MiBubble from '~/components/Chat/MiBubble.vue'
import MiMessage from '~/components/Chat/MiMessage.vue'
import MiMarker from '~/components/Chat/MiMarker.vue'
import MiMessageScroller from '~/components/Chat/MiMessageScroller.vue'

describe('MiBubble', () => {
  it('renders variant, align and reactions', () => {
    const w = mount(MiBubble, { props: { variant: 'muted', align: 'end' }, slots: { default: 'Hi', reactions: '<span>x</span>' } })
    expect(w.classes()).toContain('mi-bub--muted')
    expect(w.classes()).toContain('mi-bub--end')
    expect(w.find('.mi-bub__rx').exists()).toBe(true)
  })
  it('renders a real button or link when actionable', () => {
    expect(mount(MiBubble, { props: { as: 'button' }, slots: { default: 'Go' } }).find('button').attributes('type')).toBe('button')
    expect(mount(MiBubble, { props: { href: '/x' }, slots: { default: 'Go' } }).find('a').attributes('href')).toBe('/x')
  })
})

describe('MiMessage', () => {
  it('lays out avatar, header and footer slots', () => {
    const w = mount(MiMessage, { props: { align: 'end', label: 'Me' }, slots: { avatar: 'A', header: 'H', default: 'B', footer: 'F' } })
    expect(w.classes()).toContain('mi-msg--end')
    expect(w.attributes('aria-label')).toBe('Me')
    expect(w.find('.mi-msg__av').text()).toBe('A')
    expect(w.find('.mi-msg__h').text()).toBe('H')
    expect(w.find('.mi-msg__f').text()).toBe('F')
  })
  it('omits empty slots', () => {
    const w = mount(MiMessage, { slots: { default: 'B' } })
    expect(w.find('.mi-msg__av').exists()).toBe(false)
  })
})

describe('MiMarker', () => {
  it('renders separator variant with label and icon', () => {
    const w = mount(MiMarker, { props: { variant: 'separator' }, slots: { default: 'Today', icon: '<i/>' } })
    expect(w.classes()).toContain('mi-mk--separator')
    expect(w.text()).toBe('Today')
    expect(w.find('.mi-mk__i').attributes('aria-hidden')).toBe('true')
  })
  it('supports status role and link', () => {
    expect(mount(MiMarker, { props: { role: 'status' }, slots: { default: 'Thinking' } }).attributes('role')).toBe('status')
    expect(mount(MiMarker, { props: { href: '/pr' }, slots: { default: 'PR' } }).element.tagName).toBe('A')
  })
})

describe('MiMessageScroller', () => {
  it('exposes region and log roles and busy state', () => {
    const w = mount(MiMessageScroller, { props: { busy: true, label: 'Chat' }, slots: { default: '<p>m</p>' } })
    expect(w.find('[role=region]').attributes('aria-label')).toBe('Chat')
    expect(w.find('[role=log]').attributes('aria-busy')).toBe('true')
    expect(w.find('.mi-ms__jump').exists()).toBe(false)
  })
  it('shows the jump button when scrolled away from the bottom and scrolls on click', async () => {
    const w = mount(MiMessageScroller, { slots: { default: '<p>m</p>' } })
    const vp = w.find('.mi-ms__vp').element as HTMLElement
    Object.defineProperty(vp, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(vp, 'clientHeight', { value: 200, configurable: true })
    vp.scrollTop = 0
    await w.find('.mi-ms__vp').trigger('scroll')
    const btn = w.find('.mi-ms__jump')
    expect(btn.exists()).toBe(true)
    expect(w.emitted('update:atEnd')?.[0]).toEqual([false])
    vp.scrollTo = (() => {}) as never
    await btn.trigger('click')
  })
})

import MiMessageScrollerItem from '~/components/Chat/MiMessageScrollerItem.vue'
import MiMessageGroup from '~/components/Chat/MiMessageGroup.vue'
import MiBubbleGroup from '~/components/Chat/MiBubbleGroup.vue'
import { defineComponent, h } from 'vue'
import { useMiMessageScroller } from '~/composables/useMiMessageScroller'

describe('MiMessageScrollerItem / composable / groups', () => {
  it('tags rows with id and anchor', () => {
    const w = mount(MiMessageScrollerItem, { props: { messageId: 'a', scrollAnchor: true }, slots: { default: 'x' } })
    expect(w.attributes('data-message-id')).toBe('a')
    expect(w.attributes('data-scroll-anchor')).toBeDefined()
  })
  it('scrollToMessage finds rows by id and returns false for unknown ids', () => {
    let api: ReturnType<typeof useMiMessageScroller> | undefined
    const Probe = defineComponent({ setup() { api = useMiMessageScroller(); return () => h('i') } })
    mount(MiMessageScroller, {
      slots: { default: () => [h(MiMessageScrollerItem, { messageId: 'm1' }, () => 'x'), h(Probe)] },
      attachTo: document.body
    })
    const vp = document.querySelector('.mi-ms__vp') as HTMLElement
    vp.scrollTo = (() => {}) as never
    expect(api!.scrollToMessage('m1')).toBe(true)
    expect(api!.scrollToMessage('nope')).toBe(false)
  })
  it('opens on last-anchor without throwing and renders groups', () => {
    const w = mount(MiMessageScroller, { props: { initialPosition: 'last-anchor', scrollPreviousItemPeek: 20 }, slots: { default: () => h(MiMessageScrollerItem, { messageId: 'u', scrollAnchor: true }, () => 'q') } })
    expect(w.find('[data-scroll-anchor]').exists()).toBe(true)
    expect(mount(MiMessageGroup, { slots: { default: 'a' } }).classes()).toContain('mi-mg')
    expect(mount(MiBubbleGroup, { slots: { default: 'a' } }).classes()).toContain('mi-bg')
  })
})

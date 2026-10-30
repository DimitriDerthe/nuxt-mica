import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import MiAttachment from '~/components/Ai/MiAttachment.vue'
import MiAttachmentMedia from '~/components/Ai/MiAttachmentMedia.vue'
import MiAttachmentContent from '~/components/Ai/MiAttachmentContent.vue'
import MiAttachmentTitle from '~/components/Ai/MiAttachmentTitle.vue'
import MiAttachmentActions from '~/components/Ai/MiAttachmentActions.vue'
import MiAttachmentAction from '~/components/Ai/MiAttachmentAction.vue'
import MiTrace from '~/components/Ai/MiTrace.vue'
import MiTraceLine from '~/components/Ai/MiTraceLine.vue'
import MiTraceTitle from '~/components/Ai/MiTraceTitle.vue'
import MiTraceCollapsible from '~/components/Ai/MiTraceCollapsible.vue'
import MiTraceCollapsibleTrigger from '~/components/Ai/MiTraceCollapsibleTrigger.vue'
import MiTraceCollapsibleContent from '~/components/Ai/MiTraceCollapsibleContent.vue'
import MiQuestionnaire from '~/components/Ai/MiQuestionnaire.vue'
import MiQuestionnaireProgress from '~/components/Ai/MiQuestionnaireProgress.vue'
import MiQuestionnaireItem from '~/components/Ai/MiQuestionnaireItem.vue'
import MiQuestionnaireTitle from '~/components/Ai/MiQuestionnaireTitle.vue'
import MiQuestionnaireChoices from '~/components/Ai/MiQuestionnaireChoices.vue'
import MiQuestionnaireChoice from '~/components/Ai/MiQuestionnaireChoice.vue'
import MiQuestionnaireError from '~/components/Ai/MiQuestionnaireError.vue'
import MiQuestionnaireActions from '~/components/Ai/MiQuestionnaireActions.vue'
import MiQuestionnaireNext from '~/components/Ai/MiQuestionnaireNext.vue'
import MiQuestionnaireSkip from '~/components/Ai/MiQuestionnaireSkip.vue'
import MiQuestionnaireSubmit from '~/components/Ai/MiQuestionnaireSubmit.vue'
import MiCodeBlock from '~/components/Ai/MiCodeBlock.vue'
import MiCodeBlockHeader from '~/components/Ai/MiCodeBlockHeader.vue'
import MiCodeBlockTitle from '~/components/Ai/MiCodeBlockTitle.vue'
import MiCodeBlockContent from '~/components/Ai/MiCodeBlockContent.vue'
import MiCodeBlockLine from '~/components/Ai/MiCodeBlockLine.vue'
import MiCodeBlockCopyButton from '~/components/Ai/MiCodeBlockCopyButton.vue'

describe('MiAttachment', () => {
  it('shortcut props render name, size, progress and emit remove', async () => {
    const w = mount(MiAttachment, { props: { name: 'a.pdf', fileSize: 2048, progress: 40 } })
    expect(w.text()).toContain('a.pdf')
    expect(w.text()).toContain('Uploading · 40%')
    expect(w.attributes('data-state')).toBe('uploading')
    await w.find('button').trigger('click')
    expect(w.emitted('remove')).toHaveLength(1)
  })
  it('composes parts with state, size and orientation', async () => {
    const w = mount(MiAttachment, {
      props: { state: 'error', size: 'lg', orientation: 'vertical' },
      slots: { default: () => [h(MiAttachmentMedia, { variant: 'image' }), h(MiAttachmentContent, () => h(MiAttachmentTitle, () => 'x.png')), h(MiAttachmentActions, () => h(MiAttachmentAction, { 'aria-label': 'Remove x.png' }))] }
    })
    expect(w.classes()).toEqual(expect.arrayContaining(['is-error', 'is-lg', 'is-vertical']))
    expect(w.find('.mi-att__media').classes()).toContain('is-image')
    expect(w.find('button').attributes('aria-label')).toBe('Remove x.png')
  })
})

describe('MiTrace', () => {
  it('steps shortcut shows status, duration and toggles details', async () => {
    const w = mount(MiTrace, { props: { steps: [{ title: 'Search', duration: 1500, detail: 'out' }, { title: 'Next', status: 'pending' }] } })
    expect(w.text()).toContain('1.5 s')
    expect(w.findAll('[role=listitem]')).toHaveLength(2)
    const btn = w.find('button')
    expect(btn.attributes('aria-expanded')).toBe('false')
    await btn.trigger('click')
    expect(btn.attributes('aria-expanded')).toBe('true')
    expect(w.text()).toContain('out')
  })
  it('composable parts: line status, collapsible default/controlled, keepMounted', async () => {
    const w = mount(MiTrace, {
      attachTo: document.body,
      slots: {
        default: () => [
          h(MiTraceLine, { status: 'error' }, () => h(MiTraceTitle, () => 'Failed')),
          h(MiTraceCollapsible, { defaultOpen: true }, () => [h(MiTraceCollapsibleTrigger, () => 'T'), h(MiTraceCollapsibleContent, () => 'body')]),
          h(MiTraceCollapsible, () => [h(MiTraceCollapsibleTrigger, () => 'U'), h(MiTraceCollapsibleContent, { keepMounted: true }, () => 'kept')])
        ]
      }
    })
    expect(w.find('.mi-tr__line').classes()).toContain('is-error')
    expect(w.text()).toContain('body')
    const kept = w.findAll('.mi-tr__content')[1]!
    expect(kept.text()).toBe('kept')
    expect(kept.isVisible()).toBe(false)
    w.unmount()
  })
  it('controlled open', async () => {
    const w = mount(MiTraceCollapsible, { props: { open: false }, slots: { default: () => [h(MiTraceCollapsibleTrigger, () => 'T'), h(MiTraceCollapsibleContent, () => 'c')] } })
    await w.find('button').trigger('click')
    expect(w.emitted('update:open')![0]).toEqual([true])
  })
})

describe('MiQuestionnaire', () => {
  const questions = [
    { name: 'a', title: 'Pick', required: true, choices: [{ value: 'x', label: 'X' }, { value: 'y', label: 'Y' }] },
    { name: 'b', title: 'Tags', multiple: true, choices: [{ value: 't', label: 'T' }, { value: 'u', label: 'U' }] },
    { name: 'c', title: 'Why', required: true, choices: [], input: { label: 'Why', placeholder: '...' } }
  ]
  it('shortcut: validates required, walks steps, skips, v-model and submit', async () => {
    const w = mount(MiQuestionnaire, { props: { questions, 'onUpdate:modelValue': (v: unknown) => w.setProps({ modelValue: v as Record<string, string> }) } })
    await nextTick()
    expect(w.find('[role=progressbar]').attributes('aria-valuenow')).toBe('1')
    expect(w.find('button[type=submit]').text()).toBe('Next')
    await w.find('form').trigger('submit')
    expect(w.find('[role=alert]').text()).toContain('required')
    await w.find('fieldset:not([hidden]) input[value=y]').setValue(true)
    await w.find('form').trigger('submit')
    expect(w.find('[role=progressbar]').attributes('aria-valuenow')).toBe('2')
    const skip = w.findAll('button').find(b => b.text() === 'Skip')!
    await w.find('fieldset:not([hidden]) input[value=t]').setValue(true)
    await skip.trigger('click')
    expect(w.find('[role=progressbar]').attributes('aria-valuenow')).toBe('3')
    expect(w.findAll('button').some(b => b.text() === 'Skip')).toBe(false)
    await w.find('fieldset:not([hidden]) input[type=text]').setValue('because')
    await w.find('form').trigger('submit')
    expect(w.emitted('submit')![0]![0]).toEqual({ a: 'y', b: ['t'], c: 'because' })
  })
  it('letter shortcut selects a choice; composable parts work', async () => {
    const w = mount(MiQuestionnaire, {
      attachTo: document.body,
      slots: {
        default: () => [
          h(MiQuestionnaireProgress),
          h(MiQuestionnaireItem, { name: 'q', required: true }, () => [h(MiQuestionnaireTitle, () => 'Q'), h(MiQuestionnaireChoices, () => [h(MiQuestionnaireChoice, { value: 'a' }, () => 'A'), h(MiQuestionnaireChoice, { value: 'b' }, () => 'B')]), h(MiQuestionnaireError)]),
          h(MiQuestionnaireActions, () => [h(MiQuestionnaireSkip), h(MiQuestionnaireNext), h(MiQuestionnaireSubmit)])
        ]
      }
    })
    await w.find('form').trigger('keydown', { key: 'b' })
    await nextTick()
    expect((w.find('input[value=b]').element as HTMLInputElement).checked).toBe(true)
    await w.find('form').trigger('submit')
    expect(w.emitted('submit')![0]![0]).toEqual({ q: 'b' })
    w.unmount()
  })
})

describe('MiCodeBlock', () => {
  it('shortcut renders title, numbered lines and copies', async () => {
    let got = ''
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (s: string) => { got = s } }, configurable: true })
    const w = mount(MiCodeBlock, { props: { code: 'a\nb\n', filename: 'x.ts' } })
    expect(w.text()).toContain('x.ts')
    expect(w.findAll('.mi-cb__line')).toHaveLength(2)
    expect(w.find('.mi-cb__content').classes()).toContain('has-ln')
    await w.find('.mi-cb__copy').trigger('click')
    await nextTick()
    expect(got).toBe('a\nb\n')
  })
  it('composable parts: string content, line variants, size and variant', () => {
    const w = mount(MiCodeBlock, {
      props: { size: 'sm', variant: 'destructive' },
      slots: {
        default: () => [
          h(MiCodeBlockHeader, () => [h(MiCodeBlockTitle, () => 'Terminal'), h(MiCodeBlockCopyButton, { value: 'z' })]),
          h(MiCodeBlockContent, { wrap: true }, () => 'one\ntwo'),
          h(MiCodeBlockContent, () => h(MiCodeBlockLine, { variant: 'added' }, () => '+x'))
        ]
      }
    })
    expect(w.classes()).toEqual(expect.arrayContaining(['is-sm', 'is-destructive']))
    const c = w.findAll('.mi-cb__content')
    expect(c[0]!.classes()).toContain('is-wrap')
    expect(c[0]!.findAll('.mi-cb__line')).toHaveLength(2)
    expect(c[1]!.find('.mi-cb__line').classes()).toContain('is-added')
  })
})

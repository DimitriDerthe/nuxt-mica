import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import MiFileUpload from '~/components/Inputs/MiFileUpload.vue'
import MiFileInput from '~/components/Inputs/MiFileInput.vue'
import MiTimePicker from '~/components/Inputs/MiTimePicker.vue'
import MiRating from '~/components/Controls/MiRating.vue'
import MiPasswordStrength from '~/components/Inputs/MiPasswordStrength.vue'
import MiRepeater from '~/components/Inputs/MiRepeater.vue'
import { miPasswordScore } from '~/utils/miPassword'

const wrappers: VueWrapper[] = []
function track<T extends VueWrapper>(w: T): T { wrappers.push(w); return w }
afterEach(() => { wrappers.splice(0).forEach(w => w.unmount()); document.body.innerHTML = '' })

const file = (name: string, size = 10, type = 'text/plain') => {
  const f = new File(['x'.repeat(size)], name, { type })
  return f
}
async function pick(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, 'files', { value: files, configurable: true })
  input.dispatchEvent(new Event('change', { bubbles: true }))
  await nextTick()
}

describe('MiFileUpload', () => {
  it('renders an accessible dropzone and an empty list', () => {
    const w = track(mount(MiFileUpload, { props: { label: 'Attachments', hint: 'PDF up to 5 MB' } }))
    const zone = w.find('[role=button]')
    expect(zone.attributes('aria-label')).toBe('Attachments')
    expect(zone.attributes('tabindex')).toBe('0')
    expect(w.text()).toContain('PDF up to 5 MB')
    expect(w.find('ul.mi-fu__list').exists()).toBe(false)
  })

  it('adds files to the v-model and removes them', async () => {
    const w = track(mount(MiFileUpload, { props: { multiple: true, modelValue: [] } }))
    await pick(w.find('input').element, [file('a.txt'), file('b.txt')])
    const emitted = w.emitted('update:modelValue')!.at(-1)![0] as File[]
    expect(emitted.map(f => f.name)).toEqual(['a.txt', 'b.txt'])
    await w.setProps({ modelValue: emitted })
    expect(w.findAll('.mi-fu__file')).toHaveLength(2)
    await w.find('button[aria-label="Remove a.txt"]').trigger('click')
    expect((w.emitted('update:modelValue')!.at(-1)![0] as File[]).map(f => f.name)).toEqual(['b.txt'])
  })

  it('replaces the file in single mode', async () => {
    const w = track(mount(MiFileUpload, { props: { modelValue: [file('old.txt')] } }))
    await pick(w.find('input').element, [file('new.txt'), file('extra.txt')])
    expect((w.emitted('update:modelValue')!.at(-1)![0] as File[]).map(f => f.name)).toEqual(['new.txt'])
    const rej = w.emitted('reject')![0]![0] as { reason: string }[]
    expect(rej[0]!.reason).toBe('count')
  })

  it('rejects by type, size and count with inline errors', async () => {
    const w = track(mount(MiFileUpload, { props: { multiple: true, accept: 'image/*,.pdf', maxSize: 100, maxFiles: 2, modelValue: [] } }))
    await pick(w.find('input').element, [
      file('ok.png', 10, 'image/png'), file('doc.pdf', 10, 'application/pdf'),
      file('bad.exe', 10, 'application/x-msdownload'), file('big.png', 500, 'image/png'), file('third.png', 10, 'image/png')
    ])
    const rej = w.emitted('reject')![0]![0] as { file: File, reason: string }[]
    expect(rej.map(r => `${r.file.name}:${r.reason}`)).toEqual(['bad.exe:type', 'big.png:size', 'third.png:count'])
    expect((w.emitted('update:modelValue')!.at(-1)![0] as File[]).map(f => f.name)).toEqual(['ok.png', 'doc.pdf'])
    const alert = w.find('[role=alert]')
    expect(alert.text()).toContain('bad.exe: file type not allowed')
    expect(alert.text()).toContain('big.png is larger than 100 B')
    expect(alert.text()).toContain('too many files (max 2)')
  })

  it('ignores duplicates and does not emit reject when all is valid', async () => {
    const f = file('a.txt')
    const w = track(mount(MiFileUpload, { props: { multiple: true, modelValue: [f] } }))
    await pick(w.find('input').element, [f])
    expect(w.emitted('update:modelValue')).toBeUndefined()
    expect(w.emitted('reject')).toBeUndefined()
  })

  it('opens the hidden input from keyboard and click', async () => {
    const w = track(mount(MiFileUpload, { attachTo: document.body }))
    let clicks = 0
    w.find('input').element.addEventListener('click', () => clicks++)
    await w.find('[role=button]').trigger('keydown', { key: 'Enter' })
    await w.find('[role=button]').trigger('keydown', { key: ' ' })
    await w.find('[role=button]').trigger('click')
    expect(clicks).toBe(3)
  })

  it('shows drag-over state and accepts dropped files', async () => {
    const w = track(mount(MiFileUpload, { props: { multiple: true, modelValue: [] } }))
    const zone = w.find('[role=button]')
    await zone.trigger('dragenter')
    expect(zone.classes()).toContain('is-drag')
    await zone.trigger('dragleave')
    expect(zone.classes()).not.toContain('is-drag')
    const ev = new Event('drop', { bubbles: true, cancelable: true }) as Event & { dataTransfer?: unknown }
    ev.dataTransfer = { files: [file('d.txt')] }
    zone.element.dispatchEvent(ev)
    await nextTick()
    expect((w.emitted('update:modelValue')!.at(-1)![0] as File[])[0]!.name).toBe('d.txt')
  })

  it('does nothing when disabled', async () => {
    const w = track(mount(MiFileUpload, { props: { disabled: true, modelValue: [] } }))
    expect(w.find('[role=button]').attributes('aria-disabled')).toBe('true')
    expect(w.find('[role=button]').attributes('tabindex')).toBe('-1')
    await pick(w.find('input').element, [file('a.txt')])
    expect(w.emitted('update:modelValue')).toBeUndefined()
  })

  it('shows per-file progress', () => {
    const w = track(mount(MiFileUpload, { props: { modelValue: [file('a.txt'), file('b.txt')], multiple: true, progress: { 'a.txt': 0.4 } } }))
    const bars = w.findAll('[role=progressbar]')
    expect(bars).toHaveLength(1)
    expect(bars[0]!.attributes('aria-valuenow')).toBe('40')
    expect(w.text()).toContain('40 %')
  })
})

describe('MiFileInput', () => {
  it('shows the placeholder, then the chosen file name', async () => {
    const w = track(mount(MiFileInput, { props: { modelValue: null } }))
    expect(w.text()).toContain('No file chosen')
    await pick(w.find('input').element, [file('cv.pdf')])
    expect((w.emitted('update:modelValue')!.at(-1)![0] as File).name).toBe('cv.pdf')
    await w.setProps({ modelValue: file('cv.pdf', 2048) })
    expect(w.text()).toContain('cv.pdf (2 KB)')
  })

  it('uses arrays in multiple mode and clears', async () => {
    const w = track(mount(MiFileInput, { props: { multiple: true, modelValue: [] } }))
    await pick(w.find('input').element, [file('a.txt'), file('b.txt')])
    const val = w.emitted('update:modelValue')!.at(-1)![0] as File[]
    expect(val).toHaveLength(2)
    await w.setProps({ modelValue: val })
    expect(w.text()).toContain('2 files')
    await w.find('button[aria-label="Clear"]').trigger('click')
    expect(w.emitted('update:modelValue')!.at(-1)![0]).toEqual([])
  })

  it('clears to null in single mode', async () => {
    const w = track(mount(MiFileInput, { props: { modelValue: file('a.txt') } }))
    await w.find('button[aria-label="Clear"]').trigger('click')
    expect(w.emitted('update:modelValue')!.at(-1)![0]).toBeNull()
  })

  it('rejects invalid files with an alert', async () => {
    const w = track(mount(MiFileInput, { props: { modelValue: null, accept: '.pdf', maxSize: 5 } }))
    await pick(w.find('input').element, [file('a.txt', 3, 'text/plain')])
    expect(w.emitted('update:modelValue')).toBeUndefined()
    expect((w.emitted('reject')![0]![0] as { reason: string }[])[0]!.reason).toBe('type')
    expect(w.find('[role=alert]').text()).toContain('not allowed')
    expect(w.find('input').attributes('aria-invalid')).toBe('true')
    await pick(w.find('input').element, [file('big.pdf', 50, 'application/pdf')])
    expect((w.emitted('reject')![1]![0] as { reason: string }[])[0]!.reason).toBe('size')
  })

  it('links the label to the input and honours disabled', () => {
    const w = track(mount(MiFileInput, { props: { disabled: true, label: 'Avatar' } }))
    const input = w.find('input')
    expect(input.attributes('aria-label')).toBe('Avatar')
    expect(w.find('label').attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('disabled')).toBeDefined()
  })
})

describe('MiTimePicker', () => {
  const seg = (w: VueWrapper, name: string) => w.find(`[role=spinbutton][aria-label="${name}"]`)
  const last = (w: VueWrapper) => w.emitted('update:modelValue')!.at(-1)![0]
  /** Presses a key on a segment, then feeds the emitted value back like a parent v-model would. */
  const press = async (w: VueWrapper, name: string, key: string) => {
    await seg(w, name).trigger('keydown', { key })
    await w.setProps({ modelValue: last(w) as string | null })
  }

  it('renders spinbuttons with empty placeholders', () => {
    const w = track(mount(MiTimePicker, { props: { modelValue: null } }))
    expect(w.attributes('role')).toBe('group')
    expect(seg(w, 'Hours').text()).toBe('--')
    expect(seg(w, 'Hours').attributes('aria-valuemax')).toBe('23')
    expect(seg(w, 'Minutes').attributes('aria-valuemax')).toBe('59')
    expect(w.find('.mi-tp__period').exists()).toBe(false)
  })

  it('displays the model and steps hours and minutes with arrows', async () => {
    const w = track(mount(MiTimePicker, { props: { modelValue: '09:30', minuteStep: 15 } }))
    expect(seg(w, 'Hours').text()).toBe('09')
    await press(w, 'Minutes', 'ArrowUp')
    expect(last(w)).toBe('09:45')
    await press(w, 'Minutes', 'ArrowUp')
    expect(last(w)).toBe('09:00')
    await press(w, 'Hours', 'ArrowDown')
    expect(last(w)).toBe('08:00')
  })

  it('wraps hours, supports PageUp/Down and Home/End', async () => {
    const w = track(mount(MiTimePicker, { props: { modelValue: '23:10' } }))
    await press(w, 'Hours', 'ArrowUp')
    expect(last(w)).toBe('00:10')
    await press(w, 'Hours', 'ArrowDown')
    await press(w, 'Minutes', 'PageUp')
    expect(last(w)).toBe('23:20')
    await press(w, 'Minutes', 'End')
    expect(last(w)).toBe('23:59')
    await press(w, 'Hours', 'Home')
    expect(last(w)).toBe('00:59')
  })

  it('starts from 00:00 on the first arrow press when empty', async () => {
    const w = track(mount(MiTimePicker, { props: { modelValue: null } }))
    await seg(w, 'Hours').trigger('keydown', { key: 'ArrowUp' })
    expect(last(w)).toBe('00:00')
  })

  it('types digits and moves to the next segment', async () => {
    const w = track(mount(MiTimePicker, { attachTo: document.body, props: { modelValue: null } }))
    const h = seg(w, 'Hours')
    await h.trigger('keydown', { key: '1' })
    expect(last(w)).toBe('01:00')
    await h.trigger('keydown', { key: '4' })
    expect(last(w)).toBe('14:00')
    expect(document.activeElement).toBe(seg(w, 'Minutes').element)
    await w.setProps({ modelValue: '14:00' })
    await seg(w, 'Minutes').trigger('keydown', { key: '7' })
    expect(last(w)).toBe('14:07')
  })

  it('handles 12 hour mode with an AM/PM toggle', async () => {
    const w = track(mount(MiTimePicker, { props: { modelValue: '15:20', hour12: true } }))
    expect(seg(w, 'Hours').text()).toBe('03')
    expect(seg(w, 'Hours').attributes('aria-valuemax')).toBe('12')
    const period = w.find('.mi-tp__period')
    expect(period.attributes('aria-label')).toContain('PM')
    await period.trigger('click')
    expect(last(w)).toBe('03:20')
    await w.setProps({ modelValue: '03:20' })
    await w.find('.mi-tp__period').trigger('click')
    await w.setProps({ modelValue: last(w) as string })
    expect(last(w)).toBe('15:20')
    await press(w, 'Hours', 'End')
    expect(last(w)).toBe('12:20')
    expect(seg(w, 'Hours').text()).toBe('12')
    await press(w, 'Hours', 'ArrowUp')
    expect(last(w)).toBe('13:20')
  })

  it('clamps to min and max', async () => {
    const w = track(mount(MiTimePicker, { props: { modelValue: '09:00', min: '08:30', max: '09:10', minuteStep: 5 } }))
    await seg(w, 'Minutes').trigger('keydown', { key: 'PageUp' })
    expect(last(w)).toBe('09:10')
    await w.setProps({ modelValue: '09:00' })
    await seg(w, 'Hours').trigger('keydown', { key: 'ArrowDown' })
    expect(last(w)).toBe('08:30')
  })

  it('supports seconds and clearing', async () => {
    const w = track(mount(MiTimePicker, { props: { modelValue: '10:00:58', seconds: true } }))
    expect(seg(w, 'Seconds').text()).toBe('58')
    await press(w, 'Seconds', 'ArrowUp')
    expect(last(w)).toBe('10:00:59')
    await press(w, 'Seconds', 'ArrowUp')
    expect(last(w)).toBe('10:00:00')
    await seg(w, 'Hours').trigger('keydown', { key: 'Backspace' })
    expect(last(w)).toBeNull()
  })

  it('ignores keys when disabled', async () => {
    const w = track(mount(MiTimePicker, { props: { modelValue: '09:00', disabled: true } }))
    await seg(w, 'Hours').trigger('keydown', { key: 'ArrowUp' })
    expect(w.emitted('update:modelValue')).toBeUndefined()
    expect(seg(w, 'Hours').attributes('tabindex')).toBe('-1')
  })

  it('writes a hidden input when named', () => {
    const w = track(mount(MiTimePicker, { props: { modelValue: '07:05', name: 'start' } }))
    expect((w.find('input[type=hidden]').element as HTMLInputElement).value).toBe('07:05')
  })
})

describe('MiRating', () => {
  const last = (w: VueWrapper) => w.emitted('update:modelValue')!.at(-1)![0]

  it('exposes slider semantics', () => {
    const w = track(mount(MiRating, { props: { modelValue: 3, label: 'Quality' } }))
    expect(w.attributes('role')).toBe('slider')
    expect(w.attributes('aria-valuenow')).toBe('3')
    expect(w.attributes('aria-valuemax')).toBe('5')
    expect(w.attributes('aria-valuetext')).toBe('3 out of 5')
    expect(w.findAll('[data-star]')).toHaveLength(5)
  })

  it('sets the value on click and clears on re-click only when clearable', async () => {
    const w = track(mount(MiRating, { props: { modelValue: 0 } }))
    await w.findAll('[data-star]')[3]!.trigger('click')
    expect(last(w)).toBe(4)
    await w.setProps({ modelValue: 4 })
    await w.findAll('[data-star]')[3]!.trigger('click')
    expect(w.emitted('update:modelValue')).toHaveLength(1)
    await w.setProps({ clearable: true })
    await w.findAll('[data-star]')[3]!.trigger('click')
    expect(last(w)).toBe(0)
  })

  it('supports keyboard control with half steps', async () => {
    const w = track(mount(MiRating, { props: { modelValue: 2, half: true, max: 4 } }))
    await w.trigger('keydown', { key: 'ArrowRight' })
    expect(last(w)).toBe(2.5)
    await w.setProps({ modelValue: 0 })
    await w.trigger('keydown', { key: 'ArrowLeft' })
    expect(w.emitted('update:modelValue')).toHaveLength(1)
    await w.trigger('keydown', { key: 'End' })
    expect(last(w)).toBe(4)
    await w.setProps({ modelValue: 4 })
    await w.trigger('keydown', { key: 'Home' })
    expect(last(w)).toBe(0)
    await w.trigger('keydown', { key: 'ArrowUp' })
    expect(last(w)).toBe(0.5)
  })

  it('never exceeds max', async () => {
    const w = track(mount(MiRating, { props: { modelValue: 5 } }))
    await w.trigger('keydown', { key: 'ArrowRight' })
    expect(w.emitted('update:modelValue')).toBeUndefined()
  })

  it('previews on hover and fills partially for half values', async () => {
    const w = track(mount(MiRating, { props: { modelValue: 1 } }))
    await w.findAll('[data-star]')[2]!.trigger('pointermove')
    expect(w.findAll('.mi-rating__clip:not([data-empty])')[2]!.attributes('style')).toContain('inset(0 0%')
    await w.trigger('pointerleave')
    expect(w.findAll('.mi-rating__clip:not([data-empty])')[2]!.attributes('style')).toContain('inset(0 100%')
    await w.setProps({ modelValue: 2.5 })
    expect(w.findAll('.mi-rating__clip:not([data-empty])')[2]!.attributes('style')).toContain('inset(0 50%')
  })

  it('is inert when readonly or disabled', async () => {
    const ro = track(mount(MiRating, { props: { modelValue: 2, readonly: true } }))
    await ro.trigger('keydown', { key: 'ArrowRight' })
    await ro.findAll('[data-star]')[4]!.trigger('click')
    expect(ro.emitted('update:modelValue')).toBeUndefined()
    expect(ro.attributes('aria-readonly')).toBe('true')
    expect(ro.attributes('tabindex')).toBe('0')
    const dis = track(mount(MiRating, { props: { modelValue: 2, disabled: true } }))
    await dis.trigger('keydown', { key: 'ArrowRight' })
    expect(dis.emitted('update:modelValue')).toBeUndefined()
    expect(dis.attributes('tabindex')).toBe('-1')
  })
})

describe('miPasswordScore', () => {
  it('scores empty, short, medium and strong values', () => {
    expect(miPasswordScore('').score).toBe(0)
    expect(miPasswordScore('abc').score).toBe(1)
    expect(miPasswordScore('abcdefgh').score).toBe(2)
    expect(miPasswordScore('Abcdefg1').score).toBe(3)
    expect(miPasswordScore('Abcdefg1!xyz9').score).toBe(4)
  })

  it('penalises repeats and common passwords', () => {
    expect(miPasswordScore('aaaaaaaaaaaa').score).toBe(1)
    expect(miPasswordScore('Password123!').score).toBe(1)
    expect(miPasswordScore('abababababab').score).toBe(1)
  })

  it('reports checks and honours minLength', () => {
    const r = miPasswordScore('Hello 1', { minLength: 6 })
    expect(r.checks).toEqual({ length: true, upper: true, lower: true, number: true, symbol: true })
    expect(miPasswordScore('Hello1', { minLength: 12 }).checks.length).toBe(false)
    expect(miPasswordScore('Hello1', { minLength: 12 }).score).toBe(1)
    expect(miPasswordScore('éÉ1!').checks.upper).toBe(true)
  })
})

describe('MiPasswordStrength', () => {
  it('renders segments, a polite status and the label', async () => {
    const w = track(mount(MiPasswordStrength, { props: { value: '' } }))
    expect(w.find('[role=status]').attributes('aria-live')).toBe('polite')
    expect(w.text()).toContain('Enter a password')
    expect(w.findAll('.mi-pws__seg.is-on')).toHaveLength(0)
    await w.setProps({ value: 'Abcdefg1!xyz9' })
    expect(w.findAll('.mi-pws__seg.is-on')).toHaveLength(4)
    expect(w.text()).toContain('Strong')
    expect(w.attributes('data-score')).toBe('4')
  })

  it('emits score on change', async () => {
    const w = track(mount(MiPasswordStrength, { props: { value: '' } }))
    expect(w.emitted('score')![0]).toEqual([0])
    await w.setProps({ value: 'abc' })
    await w.setProps({ value: 'abcd' })
    await w.setProps({ value: 'Abcdefg1' })
    expect(w.emitted('score')!.map(e => e[0])).toEqual([0, 1, 3])
  })

  it('shows a requirements checklist with met state', async () => {
    const w = track(mount(MiPasswordStrength, { props: { value: 'abc', requirements: ['length', 'upper', 'number'], minLength: 6 } }))
    const items = w.findAll('li')
    expect(items).toHaveLength(3)
    expect(items.every(i => !i.classes().includes('is-met'))).toBe(true)
    await w.setProps({ value: 'Abcdef1' })
    expect(w.findAll('li.is-met')).toHaveLength(3)
    expect(w.text()).toContain('At least 6 characters')
  })

  it('hides the checklist by default and accepts custom labels', () => {
    const w = track(mount(MiPasswordStrength, { props: { value: 'abcdefgh', labels: ['Faible', 'Moyen', 'Bon', 'Fort'] } }))
    expect(w.find('ul').exists()).toBe(false)
    expect(w.text()).toContain('Moyen')
  })
})

describe('MiRepeater', () => {
  const Host = defineComponent({
    props: { initial: { type: Array, default: () => [{ name: 'a' }] }, min: Number, max: Number, template: Function },
    setup(p) {
      const rows = ref(p.initial as Record<string, unknown>[])
      return () => h(MiRepeater, { modelValue: rows.value, 'onUpdate:modelValue': (v: Record<string, unknown>[]) => (rows.value = v), min: p.min, max: p.max, template: p.template as never, label: 'Contact' }, {
        default: ({ row, index, update }: { row: Record<string, unknown>, index: number, update: (p: object) => void }) =>
          h('input', { class: 'f', 'data-i': index, value: row.name as string, onInput: (e: Event) => update({ name: (e.target as HTMLInputElement).value }) })
      })
    }
  })

  it('renders rows through the scoped slot with group names', () => {
    const w = track(mount(Host, { props: { initial: [{ name: 'a' }, { name: 'b' }] } }))
    const rows = w.findAll('li')
    expect(rows).toHaveLength(2)
    expect(rows[1]!.attributes('aria-label')).toBe('Contact 2')
    expect((w.findAll('input.f')[1]!.element as HTMLInputElement).value).toBe('b')
    expect(w.find('button[aria-label="Remove row 1"]').exists()).toBe(true)
  })

  it('adds rows from the template and removes them', async () => {
    const w = track(mount(Host, { props: { template: () => ({ name: 'new' }) } }))
    await w.find('.mi-rep__add').trigger('click')
    await nextTick()
    expect(w.findAll('li')).toHaveLength(2)
    expect((w.findAll('input.f')[1]!.element as HTMLInputElement).value).toBe('new')
    await w.find('button[aria-label="Remove row 1"]').trigger('click')
    await nextTick()
    expect(w.findAll('li')).toHaveLength(1)
    expect((w.find('input.f').element as HTMLInputElement).value).toBe('new')
  })

  it('updates a row without touching the others and keeps array identity semantics', async () => {
    const w = track(mount(Host, { props: { initial: [{ name: 'a' }, { name: 'b' }] } }))
    await w.findAll('input.f')[1]!.setValue('z')
    expect((w.findAll('input.f')[0]!.element as HTMLInputElement).value).toBe('a')
    expect((w.findAll('input.f')[1]!.element as HTMLInputElement).value).toBe('z')
  })

  it('enforces min and max', async () => {
    const w = track(mount(Host, { props: { initial: [{ name: 'a' }, { name: 'b' }], min: 2, max: 3 } }))
    expect(w.find('button[aria-label="Remove row 1"]').attributes('disabled')).toBeDefined()
    await w.find('.mi-rep__add').trigger('click')
    await nextTick()
    expect(w.findAll('li')).toHaveLength(3)
    expect(w.find('.mi-rep__add').attributes('disabled')).toBeDefined()
    await w.find('.mi-rep__add').trigger('click')
    expect(w.findAll('li')).toHaveLength(3)
  })

  it('creates missing rows up to min on mount', async () => {
    const w = track(mount(Host, { props: { initial: [], min: 2 } }))
    await nextTick()
    expect(w.findAll('li')).toHaveLength(2)
  })

  it('moves focus to the new row, then to a neighbour after removal', async () => {
    const w = track(mount(Host, { attachTo: document.body }))
    await w.find('.mi-rep__add').trigger('click')
    await nextTick(); await nextTick()
    expect(document.activeElement).toBe(w.findAll('input.f')[1]!.element)
    await w.find('button[aria-label="Remove row 2"]').trigger('click')
    await nextTick(); await nextTick()
    expect(document.activeElement).toBe(w.find('button[aria-label="Remove row 1"]').element)
  })

  it('emits add and remove events and keeps stable keys', async () => {
    const w = track(mount(MiRepeater, { props: { modelValue: [{ a: 1 }, { a: 2 }] }, slots: { default: ({ row }: { row: { a: number } }) => h('span', { class: 'cell' }, String(row.a)) } }))
    await w.find('.mi-rep__add').trigger('click')
    expect(w.emitted('add')![0]).toEqual([2])
    await w.setProps({ modelValue: [{ a: 1 }, { a: 2 }, {}] })
    await w.find('button[aria-label="Remove row 1"]').trigger('click')
    expect(w.emitted('remove')![0]).toEqual([0, { a: 1 }])
    const ids = (w.vm as unknown as { $: { setupState: { ids: number[] } } }).$.setupState.ids
    expect(ids).toEqual([2, 3])
  })
})

import { mount } from '@vue/test-utils'
import { BVTransition } from './bv-transition'

describe('BVTransition', () => {
  it('should not leak component props to rendered output', () => {
    const wrapper = mount(BVTransition, {
      propsData: {
        noFade: true,
        appear: false
      },
      slots: {
        default: '<div>content</div>'
      }
    })

    const html = wrapper.html()
    // Component's own props should be consumed, not passed through as attributes
    expect(html).not.toContain('nofade')
    expect(html).not.toContain('noFade')
    expect(html).not.toContain('no-fade')
    expect(html).not.toContain('transprops')
    expect(html).not.toContain('transProps')
    expect(html).not.toContain('trans-props')
  })
})

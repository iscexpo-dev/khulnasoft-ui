import { createWrapper, mount } from '@vue/test-utils'
import { ensureEventEmitted, waitNT, waitRAF } from '../../../tests/utils'
import { BTooltip } from './tooltip'

const MODAL_CLOSE_EVENT = 'bv::modal::hidden'

// Our test application
const App = {
  props: [
    'target',
    'triggers',
    'show',
    'noninteractive',
    'disabled',
    'noFade',
    'title',
    'titleAttr',
    'btnDisabled',
    'variant',
    'customClass',
    'delay',
    'isModal'
  ],
  render(h) {
    const tipProps = {
      target: this.target || 'foo',
      triggers: this.triggers,
      show: this.show,
      noninteractive: this.noninteractive || false,
      disabled: this.disabled,
      noFade: this.noFade || false,
      title: this.title || null,
      variant: this.variant,
      customClass: this.customClass,
      delay: this.delay
    }
    const wrapperData = {
      attrs: { id: 'wrapper' },
      // Class to simulate being in a modal
      class: { 'modal-content': !!this.isModal }
    }
    return h('article', wrapperData, [
      h(
        'button',
        {
          attrs: {
            id: 'foo',
            type: 'button',
            disabled: this.btnDisabled || null,
            title: this.titleAttr || null
          },
          ref: 'target'
        },
        'text'
      ),
      typeof this.$slots.default === `undefined` || !this.$slots.default
        ? h(BTooltip, { props: tipProps })
        : h(BTooltip, { props: tipProps }, this.$slots.default)
    ])
  }
}

/**
 * @khulnasoft/ui Note: These specs have been rewritten to be working with jest >= 29
 * Instead of relying on an arcane mix of nextTick and waiting on requestAnimationFrame
 * we are now waiting for certain events to happen
 */
describe('b-tooltip', () => {
  const originalCreateRange = document.createRange
  const origGetBCR = Element.prototype.getBoundingClientRect
  let wrapper

  beforeEach(() => {
    // https://github.com/FezVrasta/popper.js/issues/478#issuecomment-407422016
    // Hack to make Popper not bork out during tests
    // Note popper still does not do any positioning calculation in JSDOM though
    // So we cannot test actual positioning, just detect when it is open
    document.createRange = () => ({
      setStart: () => {},
      setEnd: () => {},
      commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document
      }
    })
    // Mock `getBoundingClientRect()` so that the `isVisible(el)` test returns `true`
    // Needed for visibility checks of trigger element, etc
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 24,
      height: 24,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    }))
  })

  afterEach(async () => {
    // Reset overrides
    document.createRange = originalCreateRange
    Element.prototype.getBoundingClientRect = origGetBCR
    await waitRAF()
    return wrapper.destroy()
  })

  it('has expected default structure', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        triggers: 'click'
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')
    expect(wrapper.classes()).not.toContain('modal-content')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)
    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('title')).toBeUndefined()
    expect($button.attributes('data-original-title')).toBeUndefined()
    expect($button.attributes('aria-describedby')).toBeUndefined()

    // <b-tooltip> wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)
    expect($tipHolder.element.nodeType).toEqual(Node.COMMENT_NODE)
  })

  it('initially open has expected structure', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        triggers: 'click',
        show: true
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)
    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('title')).toBeUndefined()
    expect($button.attributes('data-original-title')).toBeUndefined()
    expect($button.attributes('aria-describedby')).toBeDefined()
    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')

    // <b-tooltip> wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)
    expect($tipHolder.element.nodeType).toEqual(Node.COMMENT_NODE)

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)
    expect(tip.classList.contains('b-tooltip')).toBe(true)
    expect(tip.classList.contains('interactive')).toBe(false)

    // Hide the tooltip
    await wrapper.setProps({ show: false })
    await ensureEventEmitted($tipHolder, 'hidden')

    expect($button.attributes('aria-describedby')).toBeUndefined()

    // Tooltip element should not be in the document
    expect(document.body.contains(tip)).toBe(false)
    expect(document.querySelector(adb)).toBe(null)

    // Show the tooltip
    await wrapper.setProps({ show: true })
    await waitNT(wrapper.vm)

    expect($button.attributes('aria-describedby')).toBeDefined()

    // Note tip always has the same ID
    const tip2 = document.getElementById(adb)
    expect(tip2).not.toBe(null)
    expect(tip2).toBeInstanceOf(HTMLElement)
    expect(tip2.tagName).toEqual('DIV')
    expect(tip2.classList.contains('tooltip')).toBe(true)
    expect(tip2.classList.contains('b-tooltip')).toBe(true)
  })

  it('title prop is reactive', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        triggers: 'click',
        show: true,
        title: 'hello'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)
    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('title')).toBeUndefined()
    expect($button.attributes('data-original-title')).toBeUndefined()
    expect($button.attributes('aria-describedby')).toBeDefined()
    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')

    // <b-tooltip> wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)
    expect($tipHolder.element.nodeType).toEqual(Node.COMMENT_NODE)

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    const $tip = createWrapper(tip)
    expect($tip.element.tagName).toBe('DIV')
    expect($tip.classes()).toContain('tooltip')
    expect($tip.classes()).toContain('b-tooltip')
    // Should contain our title prop value
    expect($tip.text()).toContain('hello')

    // Change the title prop
    await wrapper.setProps({ title: 'world' })
    await waitNT(wrapper.vm)
    await waitRAF()

    // Tooltip element should still be in the document
    expect(document.body.contains(tip)).toBe(true)
    expect($tip.classes()).toContain('tooltip')
    expect($tip.classes()).toContain('b-tooltip')
    // Should contain the new updated content
    expect($tip.text()).toContain('world')
  })

  it('providing the trigger element by function works', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        target: () => wrapper.vm.$refs.target,
        triggers: 'click',
        show: false
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)
    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('aria-describedby')).toBeUndefined()

    // <b-tooltip> wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)

    // Activate tooltip by trigger
    await $button.trigger('click')
    await ensureEventEmitted($tipHolder, 'shown')

    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('aria-describedby')).toBeDefined()
    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)
    expect(tip.classList.contains('b-tooltip')).toBe(true)
  })

  it('providing the trigger element by function returning a Vue component instance works', async () => {
    const TriggerButton = {
      render(h) {
        return h('button', { attrs: { id: 'foo', type: 'button' } }, 'text')
      }
    }

    const ComponentTargetApp = {
      components: { TriggerButton },
      props: ['target'],
      render(h) {
        return h('article', { attrs: { id: 'wrapper' } }, [
          h(TriggerButton, { ref: 'target' }),
          h(BTooltip, { props: { target: this.target, triggers: 'click', show: false } }, ['title'])
        ])
      }
    }

    wrapper = mount(ComponentTargetApp, {
      attachTo: document.body,
      propsData: {
        target: () => wrapper.vm.$refs.target
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    // The trigger button (root element of the target component)
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('aria-describedby')).toBeUndefined()

    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)

    // Activate tooltip by trigger
    await $button.trigger('click')
    await ensureEventEmitted($tipHolder, 'shown')

    // The tooltip resolved the component instance to its root element
    expect($button.attributes('aria-describedby')).toBeDefined()
    const adb = $button.attributes('aria-describedby')

    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.classList.contains('tooltip')).toBe(true)
    expect(tip.classList.contains('b-tooltip')).toBe(true)
  })

  it('activating trigger element (click) opens tooltip', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        triggers: 'click',
        show: false
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)
    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('aria-describedby')).toBeUndefined()

    // <b-tooltip> wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)

    // Activate tooltip by trigger
    await $button.trigger('click')
    await ensureEventEmitted($tipHolder, 'shown')

    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('aria-describedby')).toBeDefined()
    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)
    expect(tip.classList.contains('b-tooltip')).toBe(true)
  })

  it('activating trigger element (focus) opens tooltip', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        triggers: 'focus',
        show: false,
        delay: 0
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)
    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('aria-describedby')).toBeUndefined()

    // <b-tooltip> wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)

    // Activate tooltip by trigger
    // Focus the element for real, as the tooltip only opens for `:focus-visible` focus
    $button.element.focus()
    await ensureEventEmitted($tipHolder, 'shown')

    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('aria-describedby')).toBeDefined()
    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)
    expect(tip.classList.contains('b-tooltip')).toBe(true)

    // Deactivate tooltip by trigger
    expect($tipHolder.emitted('hidden')).toBeFalsy()
    await $button.trigger('focusout', { relatedTarget: document.body })
    await ensureEventEmitted($tipHolder, 'hidden')

    // Tooltip element should not be in the document
    expect($button.attributes('aria-describedby')).toBeUndefined()
    expect(document.body.contains(tip)).toBe(false)
    expect(document.getElementById(adb)).toBe(null)
  })

  it('focusing trigger element that is not `:focus-visible` does not open tooltip', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        triggers: 'focus',
        show: false,
        delay: 0
      },
      slots: {
        default: 'title'
      }
    })

    await waitNT(wrapper.vm)
    await waitRAF()

    const $button = wrapper.find('button')
    const $tipHolder = wrapper.findComponent(BTooltip)

    // A `focusin` on an element that is not `:focus-visible`, as happens when the
    // element is focused by a mouse click
    await $button.trigger('focusin')
    await waitNT(wrapper.vm)
    await waitRAF()

    expect($tipHolder.emitted('shown')).toBeFalsy()
    expect($button.attributes('aria-describedby')).toBeUndefined()
  })

  it('activating trigger element (hover) opens tooltip', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        triggers: 'hover',
        show: false,
        // Add no fade for coverage
        noFade: true
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)
    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('aria-describedby')).toBeUndefined()

    // <b-tooltip> wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)

    // Activate tooltip by trigger
    await $button.trigger('mouseenter')
    await ensureEventEmitted($tipHolder, 'shown')

    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('aria-describedby')).toBeDefined()
    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)
    expect(tip.classList.contains('b-tooltip')).toBe(true)

    // Deactivate tooltip by trigger
    await $button.trigger('mouseleave', { relatedTarget: document.body })
    await ensureEventEmitted($tipHolder, 'hidden')

    // Tooltip element should not be in the document
    expect($button.attributes('aria-describedby')).toBeUndefined()
    expect(document.body.contains(tip)).toBe(false)
    expect(document.getElementById(adb)).toBe(null)
  })

  it('disabled tooltip does not open on trigger', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        triggers: 'click',
        show: false,
        disabled: true
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)
    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('aria-describedby')).toBeUndefined()

    // b-tooltip wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)
    expect($tipHolder.emitted('enabled')).toBeUndefined()

    // Try to activate tooltip by trigger
    await $button.trigger('click')
    await waitNT(wrapper.vm)
    await waitRAF()

    // Tooltip should not have opened
    expect($button.attributes('aria-describedby')).toBeUndefined()
    expect($tipHolder.emitted('shown')).toBeUndefined()

    // Now enable the tooltip
    await wrapper.setProps({ disabled: false })
    expect($tipHolder.emitted('enabled').length).toBe(1)

    // Try to activate tooltip by trigger
    await $button.trigger('click')
    await ensureEventEmitted($tipHolder, 'shown')

    expect($button.attributes('aria-describedby')).toBeDefined()
    const adb = $button.attributes('aria-describedby')

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)

    // Now disable the tooltip
    expect($tipHolder.emitted('disabled').length).toBe(2)
    await wrapper.setProps({ disabled: true })
    expect($tipHolder.emitted('disabled').length).toBe(3)
  })

  it('closes/opens on instance methods', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        triggers: 'click',
        show: true,
        disabled: false,
        titleAttr: 'ignored'
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)
    const adb = $button.attributes('aria-describedby')

    // <b-tooltip> wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)
    expect(tip.classList.contains('b-tooltip')).toBe(true)

    expect($tipHolder.emitted('hidden')).toBeFalsy()
    $tipHolder.vm.close()

    await ensureEventEmitted($tipHolder, 'hidden')
    expect($button.attributes('aria-describedby')).toBeUndefined()

    // Tooltip element should not be in the document
    expect(document.body.contains(tip)).toBe(false)
    expect(document.getElementById(adb)).toBe(null)

    // Show the tooltip by calling method on instance
    $tipHolder.vm.open()
    await ensureEventEmitted($tipHolder, 'shown')

    // Tooltip element should be in the document
    expect($button.attributes('aria-describedby')).toBeDefined()
    expect(document.getElementById(adb)).not.toBe(null)
  })

  it('closes on $root close specific ID event', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        triggers: 'click',
        show: false,
        disabled: false,
        titleAttr: 'ignored'
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)

    // <b-tooltip> wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)

    // Show tooltip
    await wrapper.setProps({ show: true })
    await ensureEventEmitted($tipHolder, 'shown')

    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('title')).toBeDefined()
    expect($button.attributes('title')).toEqual('')
    expect($button.attributes('data-original-title')).toBeDefined()
    expect($button.attributes('data-original-title')).toEqual('ignored')
    expect($button.attributes('aria-describedby')).toBeDefined()
    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)
    expect(tip.classList.contains('b-tooltip')).toBe(true)

    // Hide the tooltip by emitting root event with correct ID (forceHide)
    wrapper.vm.$root.$emit('bv::hide::tooltip', 'foo')
    await ensureEventEmitted($tipHolder, 'hidden')

    expect($button.attributes('aria-describedby')).toBeUndefined()

    // Tooltip element should not be in the document
    expect(document.body.contains(tip)).toBe(false)
    expect(document.getElementById(adb)).toBe(null)
  })

  it('does not close on $root close specific other ID event', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        triggers: 'click',
        show: false,
        disabled: false,
        titleAttr: 'ignored'
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)

    // b-tooltip wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)

    // Show tooltip
    await wrapper.setProps({ show: true })
    await ensureEventEmitted($tipHolder, 'shown')

    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('title')).toBeDefined()
    expect($button.attributes('title')).toEqual('')
    expect($button.attributes('data-original-title')).toBeDefined()
    expect($button.attributes('data-original-title')).toEqual('ignored')
    expect($button.attributes('aria-describedby')).toBeDefined()
    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)

    // Tooltip should ignore when ID is not its own
    wrapper.vm.$root.$emit('bv::hide::tooltip', 'wrong-id')
    // No event expected - tooltip should stay open
    await waitNT(wrapper.vm)
    await waitRAF()

    expect($button.attributes('aria-describedby')).toBeDefined()

    // Tooltip element should still be in the document
    expect(document.body.contains(tip)).toBe(true)
    expect(document.getElementById(adb)).not.toBe(null)
  })

  it('closes on $root close all event', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        triggers: 'click',
        show: false,
        disabled: false,
        titleAttr: 'ignored'
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)

    // <b-tooltip> wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)

    // Show tooltip
    await wrapper.setProps({ show: true })
    await ensureEventEmitted($tipHolder, 'shown')

    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('title')).toBeDefined()
    expect($button.attributes('title')).toEqual('')
    expect($button.attributes('data-original-title')).toBeDefined()
    expect($button.attributes('data-original-title')).toEqual('ignored')
    expect($button.attributes('aria-describedby')).toBeDefined()

    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)
    expect(tip.classList.contains('b-tooltip')).toBe(true)

    // Hide the tooltip by emitting root event with no ID (forceHide)
    wrapper.vm.$root.$emit('bv::hide::tooltip')
    await ensureEventEmitted($tipHolder, 'hidden')

    expect($button.attributes('aria-describedby')).toBeUndefined()

    // Tooltip element should not be in the document
    expect(document.body.contains(tip)).toBe(false)
    expect(document.getElementById(adb)).toBe(null)
  })

  it('does not close on $root modal hidden event by default', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        triggers: 'click',
        show: false,
        disabled: false,
        titleAttr: 'ignored'
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')
    expect(wrapper.classes()).not.toContain('modal-content')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)

    // b-tooltip wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)

    // Show tooltip
    await wrapper.setProps({ show: true })
    await ensureEventEmitted($tipHolder, 'shown')

    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('title')).toBeDefined()
    expect($button.attributes('title')).toEqual('')
    expect($button.attributes('data-original-title')).toBeDefined()
    expect($button.attributes('data-original-title')).toEqual('ignored')
    expect($button.attributes('aria-describedby')).toBeDefined()
    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)

    // Tooltip should stay open - not inside a modal
    wrapper.vm.$root.$emit(MODAL_CLOSE_EVENT, 'some-modal')
    // No event expected - tooltip should stay open
    await waitNT(wrapper.vm)
    await waitRAF()

    expect($button.attributes('aria-describedby')).toBeDefined()

    // Tooltip element should still be in the document
    expect(document.body.contains(tip)).toBe(true)
    expect(document.getElementById(adb)).not.toBe(null)
  })

  it('closes on $root modal hidden event when inside a modal', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        triggers: 'click',
        show: false,
        disabled: false,
        titleAttr: 'ignored',
        isModal: true
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')
    expect(wrapper.classes()).toContain('modal-content')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)

    // b-tooltip wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)

    // Show tooltip
    await wrapper.setProps({ show: true })
    await ensureEventEmitted($tipHolder, 'shown')

    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('title')).toBeDefined()
    expect($button.attributes('title')).toEqual('')
    expect($button.attributes('data-original-title')).toBeDefined()
    expect($button.attributes('data-original-title')).toEqual('ignored')
    expect($button.attributes('aria-describedby')).toBeDefined()
    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)

    // Tooltip inside modal should close on modal hidden event
    wrapper.vm.$root.$emit(MODAL_CLOSE_EVENT, 'some-modal')
    await ensureEventEmitted($tipHolder, 'hidden')

    // Tooltip element should not be in the document
    expect(document.body.contains(tip)).toBe(false)
    expect(document.getElementById(adb)).toBe(null)
  })

  it('closes when trigger element is no longer visible', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        triggers: 'click',
        show: true,
        disabled: false
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)
    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('aria-describedby')).toBeDefined()

    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')

    // b-tooltip wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)

    // Hide the tooltip by removing the trigger button from DOM
    $button.element.parentNode.removeChild($button.element)
    await ensureEventEmitted($tipHolder, 'hidden')

    // Tooltip element should not be in the document
    expect(document.body.contains(tip)).toBe(false)
    expect(document.getElementById('adb')).toBe(null)

    // Try and show element via root event (using show all)
    wrapper.vm.$root.$emit('bv::show::tooltip')
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()
    await waitNT(wrapper.vm)
    await waitRAF()

    // Tooltip element should not be in the document
    expect(document.getElementById(adb)).toBe(null)
  })

  it('closes when title is set to empty', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        show: true,
        title: 'hello'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)
    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('title')).toBeUndefined()
    expect($button.attributes('data-original-title')).toBeUndefined()
    expect($button.attributes('aria-describedby')).toBeDefined()
    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')

    // <b-tooltip> wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)
    expect($tipHolder.element.nodeType).toEqual(Node.COMMENT_NODE)

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    const $tip = createWrapper(tip)
    expect($tip.element.tagName).toBe('DIV')
    expect($tip.classes()).toContain('tooltip')
    expect($tip.classes()).toContain('b-tooltip')
    // Should contain our title prop value
    expect($tip.text()).toContain('hello')

    // Change the title prop
    await wrapper.setProps({ title: '' })
    await ensureEventEmitted($tipHolder, 'hidden')

    // Tooltip element should not be in the document
    expect(document.body.contains(tip)).toBe(false)
    expect(document.getElementById('adb')).toBe(null)
  })

  it('applies noninteractive class based on noninteractive prop', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        show: true
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)

    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')
    expect(adb).toBeDefined()
    expect(adb).not.toBe('')
    expect(adb).not.toBe(null)

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)
    expect(tip.classList.contains('b-tooltip')).toBe(true)
    expect(tip.classList.contains('noninteractive')).toBe(false)

    // Enable 'noninteractive'. Should be reactive
    await wrapper.setProps({ noninteractive: true })
    await waitNT(wrapper.vm)
    expect(tip.classList.contains('tooltip')).toBe(true)
    expect(tip.classList.contains('b-tooltip')).toBe(true)
    expect(tip.classList.contains('noninteractive')).toBe(true)
  })

  it('applies variant class', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        show: true,
        variant: 'danger'
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)

    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')
    expect(adb).not.toBe(null)

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)
    expect(tip.classList.contains('b-tooltip-danger')).toBe(true)

    // Change variant type. Should be reactive
    await wrapper.setProps({ variant: 'success' })
    await waitNT(wrapper.vm)

    expect(tip.classList.contains('tooltip')).toBe(true)
    expect(tip.classList.contains('b-tooltip-success')).toBe(true)
    expect(tip.classList.contains('b-tooltip-danger')).toBe(false)
  })

  it('applies custom class', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        show: true,
        customClass: 'foobar-class'
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)

    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')
    expect(adb).toBeDefined()
    expect(adb).not.toBe('')
    expect(adb).not.toBe(null)

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)
    expect(tip.classList.contains('b-tooltip')).toBe(true)
    expect(tip.classList.contains('foobar-class')).toBe(true)

    // Change custom class. Should be reactive
    await wrapper.setProps({ customClass: 'barbaz-class' })
    await waitNT(wrapper.vm)
    expect(tip.classList.contains('tooltip')).toBe(true)
    expect(tip.classList.contains('barbaz-class')).toBe(true)
    expect(tip.classList.contains('foobar-class')).toBe(false)
  })

  it('applies attributes set on the component', async () => {
    const AttrsApp = {
      render(h) {
        return h('article', { attrs: { id: 'wrapper' } }, [
          h('button', { attrs: { id: 'foo', type: 'button' } }, 'text'),
          h(
            BTooltip,
            { props: { target: 'foo', show: true }, attrs: { 'data-testid': 'my-tooltip' } },
            'title'
          )
        ])
      }
    }

    wrapper = mount(AttrsApp, {
      attachTo: document.body
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    const adb = wrapper.find('button').attributes('aria-describedby')
    expect(adb).toBeDefined()

    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip.getAttribute('data-testid')).toEqual('my-tooltip')
  })

  it('saves title in data attribute on open and adds to back on hide', async () => {
    wrapper = mount(App, {
      attachTo: document.body,
      propsData: {
        triggers: 'click',
        show: false,
        titleAttr: 'bar'
      },
      slots: {
        default: 'title'
      }
    })

    expect(wrapper.vm).toBeDefined()
    await waitNT(wrapper.vm)
    await waitRAF()

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.attributes('id')).toBeDefined()
    expect(wrapper.attributes('id')).toEqual('wrapper')

    // The trigger button
    const $button = wrapper.find('button')
    expect($button.exists()).toBe(true)
    expect($button.attributes('id')).toBeDefined()
    expect($button.attributes('id')).toEqual('foo')
    expect($button.attributes('title')).toBeDefined()
    expect($button.attributes('title')).toEqual('bar')
    expect($button.attributes('data-original-title')).toBeUndefined()
    expect($button.attributes('aria-describedby')).toBeUndefined()

    // <b-tooltip> wrapper
    const $tipHolder = wrapper.findComponent(BTooltip)
    expect($tipHolder.exists()).toBe(true)
    expect($tipHolder.element.nodeType).toEqual(Node.COMMENT_NODE)

    // Show tooltip
    await wrapper.setProps({ show: true })
    await ensureEventEmitted($tipHolder, 'shown')

    expect($button.attributes('title')).toBeDefined()
    expect($button.attributes('title')).toEqual('')
    expect($button.attributes('data-original-title')).toBeDefined()
    expect($button.attributes('data-original-title')).toEqual('bar')
    expect($button.attributes('aria-describedby')).toBeDefined()
    // ID of the tooltip that will be in the body
    const adb = $button.attributes('aria-describedby')

    // Find the tooltip element in the document
    const tip = document.getElementById(adb)
    expect(tip).not.toBe(null)
    expect(tip).toBeInstanceOf(HTMLElement)
    expect(tip.tagName).toEqual('DIV')
    expect(tip.classList.contains('tooltip')).toBe(true)
    expect(tip.classList.contains('b-tooltip')).toBe(true)
    expect(tip.classList.contains('interactive')).toBe(false)
    expect(tip.textContent).toEqual('title')

    // Hide the tooltip
    await wrapper.setProps({ show: false })
    await ensureEventEmitted($tipHolder, 'hidden')

    expect($button.attributes('title')).toBeDefined()
    expect($button.attributes('title')).toEqual('bar')
    expect($button.attributes('data-original-title')).toBeUndefined()
    expect($button.attributes('aria-describedby')).toBeUndefined()

    // Tooltip element should not be in the document
    expect(document.body.contains(tip)).toBe(false)
    expect(document.querySelector(adb)).toBe(null)
  })
})

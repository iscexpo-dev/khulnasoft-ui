import Vue from 'vue'
import { extend } from '../vue'
import { createNewChildComponent } from './create-new-child-component'

describe('utils/create-new-child-component', () => {
  const Helper = extend({
    name: 'Helper',
    render(h) {
      return h()
    },
    methods: {
      show() {
        return 'shown'
      }
    }
  })

  let root
  let child

  afterEach(() => {
    child.$destroy()
    root.$destroy()
  })

  it('keeps helper methods when the root is a `Vue.extend()` subclass with a same-named prop', () => {
    const Root = Vue.extend({
      name: 'Root',
      props: { show: { type: Boolean, default: false } },
      data() {
        return { fromRoot: true }
      },
      render(h) {
        return h('div')
      }
    })
    root = new Root({ propsData: { show: true } }).$mount()

    child = createNewChildComponent(root, Helper)

    expect(child.show()).toBe('shown')
    expect(child.fromRoot).toBeUndefined()
  })
})

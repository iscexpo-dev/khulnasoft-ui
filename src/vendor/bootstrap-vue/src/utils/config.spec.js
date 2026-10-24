import { createLocalVue } from '@vue/test-utils'
import { isGlobalVue3 } from '../../src/vue'
import { BVConfigPlugin } from '../../src/bv-config'
import { setConfig, resetConfig } from './config-set'
import {
  getBreakpoints,
  getBreakpointsDown,
  getBreakpointsUp,
  getComponentConfig,
  getConfig,
  getConfigValue
} from './config'

describe('utils/config', () => {
  afterEach(() => {
    resetConfig()
  })

  /**
   * We needed to adjust this test to have it reflect the @khulnasoft/ui defaults
   */
  it('getConfig() works and has @khulnasoft/ui defaults', async () => {
    // Ensure defaults are set regardless of test order
    // (setConfigs() in jest_setup only runs once due to configured flag)
    const expectedDefaults = {
      BPopover: {
        delay: {
          hide: 150,
          show: 50
        }
      },
      BTooltip: {
        boundaryPadding: 5,
        customClass: 'gl-tooltip',
        delay: {
          hide: 0,
          show: 500
        }
      }
    }
    setConfig(expectedDefaults)
    expect(getConfig()).toEqual(expectedDefaults)
  })

  it('setConfig() works', async () => {
    // Ensure we start with empty config regardless of test order
    resetConfig()

    const config = {
      BButton: { variant: 'danger' }
    }
    const breakpointsConfig = {
      breakpoints: ['aa', 'bb', 'cc', 'dd', 'ee']
    }
    expect(getConfig()).toEqual({})

    // Try a component config
    setConfig(config)
    expect(getConfig()).toEqual(config)
    expect(getConfig()).not.toBe(config)
    expect(getComponentConfig('BButton')).toEqual(config.BButton)
    expect(getComponentConfig('BButton')).not.toBe(config.BButton)
    expect(getComponentConfig('BButton', 'variant')).toEqual('danger')

    // Try breakpoint config (should merge)
    setConfig(breakpointsConfig)
    expect(getBreakpoints()).toEqual(breakpointsConfig.breakpoints)
    expect(getBreakpoints()).not.toBe(breakpointsConfig.breakpoints)
    expect(getConfigValue('breakpoints')).toEqual(breakpointsConfig.breakpoints)
    // should leave previous config
    expect(getComponentConfig('BButton', 'variant')).toEqual('danger')
    // Should merge config
    expect(getConfig()).toEqual({ ...config, ...breakpointsConfig })

    // Reset the configuration
    resetConfig()
    expect(getConfig()).toEqual({})
  })

  if (!isGlobalVue3) {
    // This originally used ToastPlugin (a pluginFactory component plugin) to
    // verify that component plugins pass config through. ToastPlugin was removed
    // in the BSV toast migration, so we use BVConfigPlugin here instead.
    it('config via Vue.use(ComponentPlugin) works', async () => {
      // Ensure we start with empty config regardless of test order
      resetConfig()

      const localVue = createLocalVue()
      const config = {
        BButton: { variant: 'foobar' }
      }

      expect(getConfig()).toEqual({})

      localVue.use(BVConfigPlugin, config)
      expect(getConfig()).toEqual(config)

      // Reset the configuration
      resetConfig()
      expect(getConfig()).toEqual({})
    })

    it('config via Vue.use(BVConfig) works', async () => {
      // Ensure we start with empty config regardless of test order
      resetConfig()

      const localVue = createLocalVue()
      const config = {
        BButton: { variant: 'foobar' }
      }

      expect(getConfig()).toEqual({})

      localVue.use(BVConfigPlugin, config)
      expect(getConfig()).toEqual(config)

      // Reset the configuration
      resetConfig()
      expect(getConfig()).toEqual({})
    })
  }

  it('getConfigValue() works', async () => {
    const config = {
      formControls: { size: 'sm' }
    }
    setConfig(config)

    expect(getConfigValue('formControls')).toEqual(config.formControls)
    // Should return a deep clone
    expect(getConfigValue('formControls')).not.toBe(config.formControls)
    // Shape of returned value should be the same each call
    expect(getConfigValue('formControls')).toEqual(getConfigValue('formControls'))
    // Should return undefined for not found
    expect(getConfigValue('foo.bar[1].baz')).toBeUndefined()
  })

  it('getComponentConfig() works', async () => {
    const config = {
      BButton: { variant: 'info' }
    }
    setConfig(config)

    // Specific component config key
    expect(getComponentConfig('BButton', 'variant')).toEqual('info')
    // Component's full config
    expect(getComponentConfig('BButton')).toEqual(config.BButton)
    // Should return a deep clone for full config
    expect(getComponentConfig('BButton')).not.toBe(config.BButton)
    // Should return empty object for not found component
    expect(getComponentConfig('foobar')).toEqual({})
    // Should return undefined for not found component key
    expect(getComponentConfig('BButton', 'foobar')).toBeUndefined()
  })

  it('getBreakpoints() works', async () => {
    const breakpointsConfig = {
      breakpoints: ['aa', 'bb', 'cc', 'dd', 'ee']
    }

    expect(getBreakpoints()).toEqual(['xs', 'sm', 'md', 'lg', 'xl'])
    // Should return a deep clone
    expect(getBreakpoints()).not.toBe(getBreakpoints())

    // Set new breakpoints
    setConfig(breakpointsConfig)
    expect(getBreakpoints()).toEqual(breakpointsConfig.breakpoints)
    // Should return a deep clone
    expect(getBreakpoints()).not.toBe(getBreakpoints())
    expect(getBreakpoints()).not.toBe(breakpointsConfig.breakpoints)
  })

  it('getBreakpointsUp() works', async () => {
    expect(getBreakpointsUp()).toEqual(['', 'sm', 'md', 'lg', 'xl'])
    // Should return a deep clone
    expect(getBreakpointsUp()).not.toBe(getBreakpointsUp())
  })

  it('getBreakpointsDown() works', async () => {
    expect(getBreakpointsDown()).toEqual(['xs', 'sm', 'md', 'lg', ''])
    // Should return a deep clone
    expect(getBreakpointsDown()).not.toBe(getBreakpointsDown())
  })
})

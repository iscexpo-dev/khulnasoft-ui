import { NAME } from '../constants/config'
import { cloneDeep } from './clone-deep'
import { getRaw } from './get'
import { isArray, isPlainObject, isString, isUndefined } from './inspect'
import { getOwnPropertyNames } from './object'
import { warn } from './warn'

// Config manager class
class BvConfig {
  constructor() {
    this.$_config = {}
  }

  // Method to merge in user config parameters
  setConfig(config = {}) {
    /* istanbul ignore next */
    if (!isPlainObject(config)) {
      return
    }
    const configKeys = getOwnPropertyNames(config)
    configKeys.forEach(key => {
      /* istanbul ignore next */
      const subConfig = config[key]
      if (key === 'breakpoints') {
        /* istanbul ignore if */
        if (
          !isArray(subConfig) ||
          subConfig.length < 2 ||
          subConfig.some(b => !isString(b) || b.length === 0)
        ) {
          warn('"breakpoints" must be an array of at least 2 breakpoint names', NAME)
        } else {
          this.$_config[key] = cloneDeep(subConfig)
        }
      } else if (isPlainObject(subConfig)) {
        // Component prop defaults
        this.$_config[key] = getOwnPropertyNames(subConfig).reduce((config, prop) => {
          if (!isUndefined(subConfig[prop])) {
            config[prop] = cloneDeep(subConfig[prop])
          }
          return config
        }, this.$_config[key] || {})
      }
    })
  }

  // Clear the config
  resetConfig() {
    this.$_config = {}
  }

  // Returns a deep copy of the user config
  getConfig() {
    return cloneDeep(this.$_config)
  }

  // Returns a deep copy of the config value
  getConfigValue(key, defaultValue = undefined) {
    return cloneDeep(getRaw(this.$_config, key, defaultValue))
  }
}

// Module-level singleton instance
let bvConfig = null

// Get or create the config instance
export const getConfigInstance = () => {
  if (!bvConfig) {
    bvConfig = new BvConfig()
  }
  return bvConfig
}

// Method for applying a global config
export const setConfig = (config = {}) => {
  getConfigInstance().setConfig(config)
}

// Method for resetting the user config
// Exported for testing purposes only
export const resetConfig = () => {
  if (bvConfig) {
    bvConfig.resetConfig()
  }
}

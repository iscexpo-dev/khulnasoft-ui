#!/usr/bin/env node

import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import fs from 'node:fs'
import assert from 'node:assert'
import startCase from 'lodash/startCase.js'

const baseDir = path.resolve(import.meta.dirname, '..')
const componentsDir = path.resolve(baseDir, 'src/components')

async function readJSON(path) {
  const content = await readFile(path, 'utf-8')
  return JSON.parse(content)
}

const verbose = process.argv.includes('-v')

const PLUGIN_NAME_MAP = { image: 'img' }
const UNPREFIXED_PLUGINS = ['layout', 'tabs']

const getPluginName = p => PLUGIN_NAME_MAP[p] || p

const isComponentModule = f => f !== 'index.js' && f.endsWith('.js') && !f.includes('.spec.')

const getComponentName = n => `B${startCase(n.replace(/-/g, '_')).replace(/ /g, '')}`

const getComponentModuleName = n =>
  n.replace(/([A-Z])/g, (str, $1) => `-${$1.toLowerCase()}`).substr(3)

const checkPluginMeta = async plugin => {
  const pluginDir = path.resolve(componentsDir, plugin)
  const stats = await stat(pluginDir)

  if (!stats.isDirectory()) {
    return
  }

  const pluginName = getPluginName(plugin)
  const files = await readdir(pluginDir)
  const componentModules = files.filter(f => isComponentModule(f)).map(file => {
    if (verbose && !UNPREFIXED_PLUGINS.includes(pluginName) && !file.startsWith(pluginName)) {
      console.warn(`Found unexpected unprefixed module ${file} for plugin ${plugin}`)
    }
    return file.replace(/\.js/, '')
  })

  if (!fs.existsSync(`${pluginDir}/package.json`)) {
    return
  }

  const { private: isPrivate, meta } = await readJSON(`${pluginDir}/package.json`)
  if (isPrivate || !meta) {
    return
  }

  // Check if all component modules are defined in the meta section
  // of the plugin's package.json
  const components = meta.components || []
  if (componentModules.length > 1) {
    componentModules
      .filter(c => c !== plugin)
      .forEach(component => {
        const componentName = getComponentName(component)
        const componentMeta = components.find(
          c => c === componentName || c.component === componentName
        )

        assert.ok(
          componentMeta,
          `Expected ${componentName} to be listed in meta section of ${plugin}'s package.json`
        )
      })
  }

  // Check if for all components defined in the plugin's
  // package.json a module exists
  if (components.length) {
    components.forEach(component => {
      const componentName = typeof component === 'string' ? component : component.component

      const moduleName = getComponentModuleName(componentName)
      assert.ok(
        componentModules.includes(moduleName),
        `Component ${componentName} was defined in ${plugin}'s pck.meta but no module with name ${moduleName} was found`
      )
    })
  }
}

async function main() {
  const plugins = await readdir(componentsDir)
  await Promise.all(plugins.map(plugin => checkPluginMeta(plugin)))
}

main().catch(e => {
  console.error(`${e.name}: ${e.message}`)
  process.exitCode = 1
})

import Vue from 'vue'
import { mergeData as originalMergeData } from 'vue-functional-data-merge'

// --- Constants ---
const COMPONENT_UID_KEY = '_uid'

const isGlobalVue3 = Vue.version.startsWith('3')

export const REF_FOR_KEY = isGlobalVue3 ? 'ref_for' : 'refInFor'

if (isGlobalVue3) {
  const originalVModelDynamicCreated = Vue.vModelDynamic.created
  const originalVModelDynamicBeforeUpdate = Vue.vModelDynamic.beforeUpdate

  let assignSymbol

  // See https://github.com/vuejs/vue-next/pull/4121 for details
  Vue.vModelDynamic.created = function(el, binding, vnode) {
    originalVModelDynamicCreated.call(this, el, binding, vnode)
    if (!el._assign) {
      el._assign = () => {}
    }

    // Added check for Symbol('_assign') to fix in compat 3.3.5+ based on https://github.com/bootstrap-vue/bootstrap-vue/issues/7181
    if (!assignSymbol) {
      assignSymbol = Object.getOwnPropertySymbols(el).find(s => s.description === '_assign')
    }
    if (!el[assignSymbol]) {
      el[assignSymbol] = function() {}
    }
  }
  Vue.vModelDynamic.beforeUpdate = function(el, binding, vnode) {
    originalVModelDynamicBeforeUpdate.call(this, el, binding, vnode)
    if (!el._assign) {
      el._assign = () => {}
    }

    // Added check for Symbol('_assign') to fix in 3.3.5+ based on https://github.com/bootstrap-vue/bootstrap-vue/issues/7181
    if (!assignSymbol) {
      assignSymbol = Object.getOwnPropertySymbols(el).find(s => s.description === '_assign')
    }
    if (!el[assignSymbol]) {
      el[assignSymbol] = function() {}
    }
  }
}

const isVue3 = instance => Boolean(instance.$)

// Roots created with `new (Vue.extend(Comp))()` expose `Comp`, not `Vue`, as the
// constructor. Walk up to the base so its options are never merged into helpers.
const getVue3Constructor = instance => {
  let Ctor = instance.$.appContext.config.globalProperties.constructor
  while (Ctor.super) {
    Ctor = Ctor.super
  }
  return Ctor
}

const extend = Vue.extend.bind(Vue)

function mergeData(...data) {
  const result = originalMergeData(...data)
  return { ...result, ...(result.attrs ?? {}), ...(result.props ?? {}) }
}

export { COMPONENT_UID_KEY, mergeData, isGlobalVue3, isVue3, getVue3Constructor, extend }

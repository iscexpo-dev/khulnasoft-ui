import Vue from 'vue';

// Fragment will be available only in Vue.js 3
const { Fragment, Comment, Text } = Vue;

export function isVnodeEmpty(vnode) {
  if (!vnode || (Comment && vnode.type === Comment)) {
    return true;
  }

  if (Text && vnode.type === Text && !vnode.children.trim()) {
    // Vue.js 3 text string is located in the children
    return true;
  }

  if (Array.isArray(vnode)) {
    // eslint-disable-next-line unicorn/no-array-callback-reference
    return vnode.every(isVnodeEmpty);
  }

  if (Fragment && vnode.type === Fragment) {
    // Vue.js 3 fragment, check children
    // eslint-disable-next-line unicorn/no-array-callback-reference
    return vnode.children.every(isVnodeEmpty);
  }

  return false;
}

export function isSlotEmpty(vueInstance, slot, slotArgs) {
  const slotContent = vueInstance.$scopedSlots[slot]?.(slotArgs);

  return isVnodeEmpty(slotContent);
}

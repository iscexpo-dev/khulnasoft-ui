import Vue from 'vue';
import { isFunction } from 'lodash-es';
import { DISCLOSURE_DROPDOWN_ITEM_NAME, DISCLOSURE_DROPDOWN_GROUP_NAME } from './constants';

const itemValidator = (item) => item?.text?.length > 0 && !Array.isArray(item?.items);

const isItem = (item) => Boolean(item) && itemValidator(item);

const isGroup = (group) =>
  Boolean(group) &&
  Array.isArray(group.items) &&
  Boolean(group.items.length) &&
  // eslint-disable-next-line unicorn/no-array-callback-reference
  group.items.every(isItem);

// eslint-disable-next-line unicorn/no-array-callback-reference
const itemsValidator = (items) => items.every(isItem) || items.every(isGroup);

const doSomeItemsHaveIcon = (items) => {
  return items.some((item) => item && typeof item === 'object' && 'icon' in item);
};

const isListItem = (tag) =>
  ['gl-disclosure-dropdown-group', 'gl-disclosure-dropdown-item', 'li'].includes(tag);

const isValidSlotTagVue2 = (vNode) => {
  if (!vNode) return false;
  const tag = vNode.componentOptions?.tag || vNode.tag;
  if (isListItem(tag)) return true;
  const componentName = vNode.componentOptions?.Ctor?.options?.name;
  return [DISCLOSURE_DROPDOWN_ITEM_NAME, DISCLOSURE_DROPDOWN_GROUP_NAME].includes(componentName);
};

const isValidSlotTagVue3 = (vNode) => {
  if (!vNode) return false;
  return (
    [DISCLOSURE_DROPDOWN_ITEM_NAME, DISCLOSURE_DROPDOWN_GROUP_NAME].includes(vNode.type?.name) ||
    vNode.type === 'li'
  );
};

const isSkippableVue2 = (vNode) => {
  if (!vNode) return true;
  if (vNode.isComment) return true;
  if (!vNode.tag && typeof vNode.text === 'string' && !vNode.text.trim()) return true;
  return false;
};

const hasOnlyListItemsVue2 = (defaultSlot) => {
  const nodes = defaultSlot();

  if (!Array.isArray(nodes)) {
    return false;
  }

  const candidateNodes = nodes.filter((vNode) => !isSkippableVue2(vNode));

  if (candidateNodes.length === 0) return true;

  return candidateNodes.every((vNode) => isValidSlotTagVue2(vNode));
};

const isSkippableVue3 = (vNode) => {
  if (!vNode) return true;
  if (vNode.type === Vue.Comment) return true;
  if (vNode.type === Vue.Text && !vNode.children?.trim()) return true;
  if (vNode.type === Vue.Fragment && (!vNode.children || vNode.children.length === 0)) return true;
  return false;
};

const validateNodesRecursiveVue3 = (nodes) => {
  if (!Array.isArray(nodes) || nodes.length === 0) return true;

  const candidateNodes = nodes.filter((vNode) => !isSkippableVue3(vNode));

  if (candidateNodes.length === 0) return true;

  return candidateNodes.every((vNode) => {
    if (isValidSlotTagVue3(vNode)) return true;
    if (vNode.type === Vue.Fragment && Array.isArray(vNode.children)) {
      return validateNodesRecursiveVue3(vNode.children);
    }
    return false;
  });
};

const hasOnlyListItemsVue3 = (defaultSlot) => {
  const nodes = defaultSlot();
  const fragment = nodes.find((node) => Array.isArray(node.children) && node.children.length);
  const targetNodes = fragment ? fragment.children : nodes;

  return validateNodesRecursiveVue3(targetNodes);
};

const hasOnlyListItems = (defaultSlot) => {
  if (!isFunction(defaultSlot)) {
    return false;
  }

  if (Vue.version.startsWith('3')) {
    return hasOnlyListItemsVue3(defaultSlot);
  }

  return hasOnlyListItemsVue2(defaultSlot);
};

export { itemsValidator, isItem, isGroup, hasOnlyListItems, doSomeItemsHaveIcon };

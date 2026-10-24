<script>
import Vue from 'vue';
import { intersperse, insert } from '../../../utils/data_utils';
import { isVnodeEmpty } from '../../../utils/is_slot_empty';

const filterEmptyNodesVue2 = (vNodes) =>
  vNodes.filter((vNode) => typeof vNode.tag === 'string' || vNode.text.trim() !== '');

const { Fragment } = Vue;
const filterEmptyNodesVue3 = (vNode) => {
  return vNode
    .reduce((acc, node) => {
      if (Fragment && node.type === Fragment && Array.isArray(node.children)) {
        acc.push(...node.children);
      } else {
        acc.push(node);
      }
      return acc;
    }, [])
    .filter((node) => !isVnodeEmpty(node));
};

const filterEmptyNodes = Vue.version.startsWith('3') ? filterEmptyNodesVue3 : filterEmptyNodesVue2;

// handles the addition of the lastSeparator in these two cases:
// item1, item2, item3 => item1, item2, and item3
// item1, item2 => item1 and item2
const addLastSeparator = (lastSeparator, items) => {
  if (!lastSeparator) {
    return items;
  }

  if (items.length > 3) {
    return insert(-1, lastSeparator, items);
  }

  // Replace the second-to-last item with lastSeparator
  const result = [...items];
  result[result.length - 2] = lastSeparator;
  return result;
};

export default {
  name: 'GlIntersperse',
  functional: true,
  props: {
    /**
     * The separator content to place between items.
     */
    separator: {
      type: String,
      default: ', ',
      required: false,
    },
    /**
     * The separator content to place before the last item.
     */
    lastSeparator: {
      type: String,
      default: '',
      required: false,
    },
  },
  render(createElement, context) {
    const {
      props: { separator, lastSeparator },
      slots,
      data,
    } = context;

    const slotContent = slots().default || [];
    const filtered = filterEmptyNodes(slotContent);
    const separated = intersperse(separator, filtered);
    const withLastSeparator = addLastSeparator(lastSeparator, separated);

    return createElement('span', data, withLastSeparator);
  },
};
</script>

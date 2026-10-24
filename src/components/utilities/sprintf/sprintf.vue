<script>
import { has, isString } from 'lodash-es';

const PREFIX = '%{';
const SUFFIX = '}';
const START_SUFFIX = 'Start';
const END_SUFFIX = 'End';
const PLACE_HOLDER_REGEX = new RegExp(`(${PREFIX}[a-z]+[\\w-]*[a-z0-9]+${SUFFIX})`, 'gi');

function groupPlaceholdersByStartTag(placeholders = {}) {
  return Object.entries(placeholders).reduce((acc, [slotName, [startTag, endTag]]) => {
    acc[startTag] = { slotName, endTag };
    return acc;
  }, {});
}

function getPlaceholderDefinition(chunk, placeholdersByStartTag) {
  const tagName = chunk.slice(PREFIX.length, -SUFFIX.length);

  if (has(placeholdersByStartTag, tagName)) {
    // Use provided custom placeholder definition
    return {
      ...placeholdersByStartTag[tagName],
      tagName,
    };
  }

  if (tagName.endsWith(START_SUFFIX)) {
    // Tag conforms to default start/end tag naming convention
    const slotName = tagName.slice(0, -START_SUFFIX.length);

    return {
      slotName,
      endTag: `${slotName}${END_SUFFIX}`,
      tagName,
    };
  }

  return {
    slotName: tagName,
    endTag: undefined,
    tagName,
  };
}

export default {
  name: 'GlSprintf',
  functional: true,
  props: {
    /**
     * A translated string with named placeholders, e.g., "Written by %{author}".
     */
    message: {
      type: String,
      required: true,
    },
    /**
     * An object mapping slot names to custom start/end placeholders. Use this
     * to avoid changing an existing message, and in turn invalidating existing
     * translations, in the case it uses non-default placeholders.
     */
    placeholders: {
      type: Object,
      required: false,
      default: undefined,
      validator: (value) =>
        Object.values(value).every(
          // eslint-disable-next-line unicorn/no-array-callback-reference
          (tagPair) => Array.isArray(tagPair) && tagPair.length === 2 && tagPair.every(isString),
        ),
    },
  },
  /**
   * Available slots are determined by the placeholders in the provided
   * message prop. For example, a message of "Written by %{author}" has
   * a slot called "author", and its content is used to replace "%{author}"
   * in the rendered output. When two placeholders indicate a start and an
   * end region in the message, e.g., "%{linkStart}foo%{linkEnd}", the common
   * base name can be used as a scoped slot, where the content between the
   * placeholders is passed via the `content` scoped slot prop.
   * @slot * (arbitrary)
   * @binding {string} content The content to place between start and end placeholders.
   */
  render(createElement, context) {
    // While a functional style is generally preferred, an imperative style is
    // used here, as it lends itself better to the message parsing algorithm.
    // This approach is also more performant, as it minimizes (relatively) object
    // creation/garbage collection, which is important given how frequently this
    // code may run on a given page.

    let i = 0;
    const vnodes = [];
    const slots = context.scopedSlots;
    const chunks = context.props.message.split(PLACE_HOLDER_REGEX);
    const placeholdersByStartTag = groupPlaceholdersByStartTag(context.props.placeholders);

    while (i < chunks.length) {
      const chunk = chunks[i];
      // Skip past this chunk now we have it
      i += 1;

      if (!PLACE_HOLDER_REGEX.test(chunk)) {
        // Not a placeholder, so pass through as-is
        vnodes.push(chunk);
        continue;
      }

      const { slotName, endTag, tagName } = getPlaceholderDefinition(chunk, placeholdersByStartTag);

      if (endTag) {
        // Peek ahead to find end placeholder, if any
        const indexOfEnd = chunks.indexOf(`${PREFIX}${endTag}${SUFFIX}`, i);
        if (indexOfEnd > -1) {
          // We have a valid start/end placeholder pair! Extract the content
          // between them and skip past the end placeholder
          const content = chunks.slice(i, indexOfEnd);
          i = indexOfEnd + 1;

          if (!has(slots, slotName)) {
            // Slot hasn't been provided; return placeholders and content as-is
            vnodes.push(chunk, ...content, chunks[indexOfEnd]);
            continue;
          }

          // Provide content to provided scoped slot
          vnodes.push(slots[slotName]({ content: content.join('') }));
          continue;
        }
      }

      // By process of elimination, chunk must be a plain placeholder
      // Pass an empty object as slot props so scoped slots never receive `undefined`
      vnodes.push(has(slots, tagName) ? slots[tagName]({}) : chunk);
      continue;
    }

    return vnodes;
  },
};
</script>

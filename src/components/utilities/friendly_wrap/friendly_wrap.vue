<script>
import { intersperse } from '../../../utils/data_utils';
import { splitAfterSymbols } from '../../../utils/string_utils';

export default {
  name: 'GlFriendlyWrap',
  functional: true,
  props: {
    /**
     * Text to be wrapped.
     */
    text: {
      type: String,
      required: true,
    },
    /**
     * A list of strings representing the break-words.
     */
    symbols: {
      type: Array,
      required: false,
      default: () => ['/'],
    },
  },
  render(createElement, { props }) {
    const { symbols, text } = props;
    const textParts = splitAfterSymbols(symbols, text ?? '');
    const content = intersperse(() => createElement('wbr'), textParts);

    return createElement('span', { class: 'gl-break-words' }, content);
  },
};
</script>

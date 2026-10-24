import { propDefaultFactory } from '../../../utils/stories_utils';
import GlFriendlyWrap from './friendly_wrap.vue';

const components = {
  GlFriendlyWrap,
};

const defaultValue = propDefaultFactory(GlFriendlyWrap);

const generateProps = ({ text = '', symbols = defaultValue('symbols') } = {}) => ({
  text,
  symbols,
});

const makeStory =
  (options = {}) =>
  (args, { argTypes }) => ({
    components,
    props: Object.keys(argTypes),
    ...options,
  });

export const Default = makeStory({
  template: `<gl-friendly-wrap :text="text" :symbols="symbols" />`,
});
Default.args = generateProps({
  text: '/lorem/ipsum/dolor/sit/amet/consectetur/adipiscing/elit/Aenean/tincidunt/urna/ac/tellus/cursus/laoreet/aenean/blandit/erat/vel/est/maximus/porta/Sed/id/nunc/non/sapien/cursus/ullamcorper',
});

export const BreakWord = makeStory({
  template: `<gl-friendly-wrap :text="text" :symbols="symbols" />`,
});
BreakWord.args = generateProps({
  text: 'LoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitamet',
  symbols: ['dolor'],
});

export const MultipleSymbols = makeStory({
  template: `<gl-friendly-wrap :text="text" :symbols="symbols" />`,
});
MultipleSymbols.args = generateProps({
  text: 'LoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitametLoremipsumdolorsitamet',
  symbols: ['e', 'o'],
});

export default {
  title: 'utilities/friendly-wrap',
  component: GlFriendlyWrap,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/utility-friendly-wrap) for usage and implementation details.',
      },
    },
  },
};

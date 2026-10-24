import iconSpriteInfo from '@gitlab/svgs/dist/icons.json';
import { GlSingleStat } from '../../../charts';
import GlProgressBar from '../../base/progress_bar/progress_bar.vue';
import { badgeVariantOptions } from '../../../utils/constants';
import { makeContainer } from '../../../utils/story_decorators/container';

const generateProps = ({
  variant = GlSingleStat.props.variant.default,
  title = 'Single stat',
  value = '100',
  unit = '',
  useDelimiters = false,
  metaText = '',
  metaIcon = null,
  metaTooltip = '',
  titleIcon = null,
  shouldAnimate = false,
  animationDecimalPlaces = 0,
  titleIconClass = '',
  description = '',
} = {}) => ({
  variant,
  title,
  value,
  unit,
  useDelimiters,
  metaText,
  metaIcon,
  metaTooltip,
  titleIcon,
  shouldAnimate,
  animationDecimalPlaces,
  titleIconClass,
  description,
});

const metaText = 'Super fast';
const metaIcon = 'check-circle';
const titleIcon = 'hourglass';

const template = (content = '') => `<gl-single-stat
    :title="title"
    :value="value"
    :unit="unit"
    :use-delimiters="useDelimiters"
    :variant="variant"
    :meta-text="metaText"
    :meta-icon="metaIcon"
    :title-icon="titleIcon"
    :should-animate="shouldAnimate"
    :animation-decimal-places="animationDecimalPlaces"
    :title-icon-class="titleIconClass"
    :meta-tooltip="metaTooltip"
    :description="description"
  >${content}</gl-single-stat>`;

const makeStory = ({ args, decorators, tags, ...options } = {}) =>
  Object.assign(
    (storyArgs, { argTypes }) => ({
      props: Object.keys(argTypes),
      components: { GlSingleStat },
      template: template(),
      ...options,
    }),
    { args: generateProps(args), decorators, tags },
  );

export const Default = makeStory();

export const WithBadge = makeStory({ args: { metaText, metaIcon } });

export const WithBadgeTooltip = makeStory({
  args: {
    metaText: '20%',
    metaIcon: 'trend-up',
    metaTooltip: 'Percentage change compared to the previous time period',
    variant: 'success',
  },
  tags: ['skip-visual-test'],
});

export const WithMetaIcon = makeStory({ args: { metaIcon } });

export const WithTitleIcon = makeStory({ args: { titleIcon } });

export const WithDelimiters = makeStory({
  args: { value: '10000', useDelimiters: true },
});

export const WithDescription = makeStory({
  args: { description: 'Additional text' },
});

export const WithLongDescription = makeStory({
  args: {
    description:
      'This is a very long description that will be truncated when it exceeds the available width',
  },
  decorators: [makeContainer({ maxWidth: '17rem' })],
});

export const WithSupplementaryContent = makeStory({
  components: { GlSingleStat, GlProgressBar },
  template: template(`<gl-progress-bar :value="25" height="8px" />`),
  decorators: [makeContainer({ maxWidth: '17rem' })],
});

export const WithSupplementaryContentAndDescription = makeStory({
  components: { GlSingleStat, GlProgressBar },
  template: template(`<gl-progress-bar :value="25" height="8px" />`),
  args: { description: '25 out of 100 items' },
  decorators: [makeContainer({ maxWidth: '17rem' })],
});

export default {
  title: 'charts/single-stat',
  component: GlSingleStat,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/data-visualization/single-stat) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    variant: {
      options: Object.values(badgeVariantOptions),
      control: 'select',
    },
    metaIcon: {
      options: iconSpriteInfo.icons,
      control: 'select',
    },
    titleIcon: {
      options: iconSpriteInfo.icons,
      control: 'select',
    },
    unit: {
      control: 'text',
    },
    metaTooltip: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    useDelimiters: {
      control: 'boolean',
      description: 'Requires the `value` property to be a valid Number or convertable to one',
    },
  },
};

import { userEvent, within, waitFor, expect } from '@storybook/test';
import { GlTooltipDirective } from '../../../directives/tooltip/tooltip';
import GlButton from '../button/button.vue';
import BVueReadme from '../../../vendor/bootstrap-vue/src/components/tooltip/README.md';
import BVueReadmeAccessibility from '../../../vendor/bootstrap-vue/docs/markdown/reference/accessibility/README.md';
import GlTooltip from './tooltip.vue';

function makeTooltip(modifier = '') {
  return {
    components: { GlTooltip, GlButton },
    directives: {
      GlTooltip: GlTooltipDirective,
    },
    template: `
    <div class="gl-flex gl-items-center gl-justify-center gl-p-7 gl-m-7">
      <gl-button
        v-gl-tooltip${modifier}
        title="some tooltip text"
      >
          Tooltip
      </gl-button>
    </div>
  `,
  };
}

const play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');
  await userEvent.click(button);
  await waitFor(() => expect(button).toHaveFocus());
  await waitFor(() => expect(within(document).getByRole('tooltip')).toBeVisible());
};

export const TopDefault = (args, argTypes) => ({
  ...makeTooltip(),
  props: Object.keys(argTypes),
});
TopDefault.play = play;

export const Right = (args, argTypes) => ({
  ...makeTooltip('.right'),
  props: Object.keys(argTypes),
});
Right.play = play;

export const Bottom = (args, argTypes) => ({
  ...makeTooltip('.bottom'),
  props: Object.keys(argTypes),
});
Bottom.play = play;

export const Left = (args, argTypes) => ({
  ...makeTooltip('.left'),
  props: Object.keys(argTypes),
});
Left.play = play;

// A default export contains higher-level info about the component and the stories' settings.
export default {
  title: 'base/tooltip',
  component: GlTooltip,
  parameters: {
    bootstrapComponent: 'b-tooltip',
    bootstrapDocs: BVueReadme + BVueReadmeAccessibility,
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/tooltip) for usage and implementation details.',
      },
    },
  },
};

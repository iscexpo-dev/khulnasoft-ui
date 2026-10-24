import { GlChartSeriesLabel } from '../../../charts';
import { colorPaletteDefault } from '../../../utils/charts/theme';
import {
  SERIES_NAME,
  SERIES_NAME_SHORT,
  SERIES_NAME_LONG,
  SERIES_NAME_LONG_WITHOUT_SPACES,
} from '../../../utils/stories_constants';

const generateProps = ({
  color = colorPaletteDefault[0],
  type = 'solid',
  text = SERIES_NAME[SERIES_NAME_SHORT],
} = {}) => ({
  color,
  type,
  text,
});

const template = `
  <gl-chart-series-label
    :color="color"
    :type="type"
  >
    {{ text }}
  </gl-chart-series-label>`;

const Template = (_args, { argTypes }) => ({
  components: {
    GlChartSeriesLabel,
  },
  props: Object.keys(argTypes),
  template,
});

export const Default = Template.bind({});
Default.args = generateProps({ color: '' });

export const WithLongName = Template.bind({});
WithLongName.args = generateProps({ color: '', text: SERIES_NAME[SERIES_NAME_LONG] });

export const WithLongNameWithNoSpaces = Template.bind({});
WithLongNameWithNoSpaces.args = generateProps({
  color: '',
  text: SERIES_NAME[SERIES_NAME_LONG_WITHOUT_SPACES],
});

export const WithColorDashed = Template.bind({});
WithColorDashed.args = generateProps({ type: 'dashed', text: SERIES_NAME[SERIES_NAME_SHORT] });

export const WithColor = Template.bind({});
WithColor.args = generateProps({ text: SERIES_NAME[SERIES_NAME_SHORT] });

export const WithColorAndLongName = Template.bind({});
WithColorAndLongName.args = generateProps({ text: SERIES_NAME[SERIES_NAME_LONG] });

export const WithColorAndLongNameWithNoSpaces = Template.bind({});
WithColorAndLongNameWithNoSpaces.args = generateProps({
  text: SERIES_NAME[SERIES_NAME_LONG_WITHOUT_SPACES],
});

export default {
  title: 'charts/chart-series-label',
  component: GlChartSeriesLabel,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/data-visualization/charts) for usage and implementation details.',
      },
    },
  },
  argTypes: {
    color: {
      control: 'color',
    },
  },
};

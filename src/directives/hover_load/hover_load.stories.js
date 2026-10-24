import { HoverLoadDirective } from './hover_load';

const generateProps = ({ endpoint = 'some/endpoint' } = {}) => ({
  endpoint,
});

export const Default = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  directives: {
    hoverLoad: HoverLoadDirective,
  },
  data: () => ({
    isPreloaded: false,
  }),
  methods: {
    handlePreload() {
      fetch(this.endpoint);
      this.isPreloaded = true;
    },
  },
  template: `
  <div>
    <a
      :href="endpoint"
      v-hover-load="handlePreload"
    >
        Hover me to preload
    </a>

    <span>(Preloaded: {{isPreloaded}})</span>
    </div>
    `,
});
Default.args = generateProps();

export default {
  title: 'directives/hover-load-directive',
  component: HoverLoadDirective,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/directives/hover-load) for usage and implementation details.',
      },
    },
  },
  tags: ['skip-visual-test'],
};

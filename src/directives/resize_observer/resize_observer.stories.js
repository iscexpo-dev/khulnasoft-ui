import { GlResizeObserverDirective } from './resize_observer';

const generateProps = ({ elementWidth = '100%', elementHeight = '100%' } = {}) => ({
  elementWidth,
  elementHeight,
});

export const Default = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  directives: {
    resizeObserver: GlResizeObserverDirective,
  },
  data() {
    return {
      width: 0,
      height: 0,
    };
  },
  computed: {
    wrapperStyles() {
      return {
        height: '400px',
      };
    },
    elementStyles() {
      return {
        height: this.elementHeight,
        width: this.elementWidth,
      };
    },
  },
  methods: {
    handleResize({ contentRect: { width, height } }) {
      this.width = Math.round(width);
      this.height = Math.round(height);
    },
  },
  template: `
    <div
      :style="wrapperStyles"
      class="gl-flex gl-justify-center gl-items-center">
      <div
        v-resize-observer="handleResize"
        :style="elementStyles"
        class="gl-flex gl-relative gl-justify-center gl-items-center gl-bg-status-neutral gl-text-default">
          <span class="gl-inline-block gl-p-3">
            I am {{ width }}px wide and {{ height }}px high.
          </span>
      </div>
    </div>
  `,
});
Default.args = generateProps();

const makeControl = () => ({
  options: ['100%', '75%', '50%'],
  control: 'select',
});

export default {
  title: 'directives/resize-observer-directive',
  component: GlResizeObserverDirective,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/directives/resize-observer) for usage and implementation details.',
      },
    },
  },
  tags: ['skip-visual-test'],
  argTypes: {
    elementWidth: makeControl(),
    elementHeight: makeControl(),
  },
};

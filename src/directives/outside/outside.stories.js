import GlButton from '../../components/base/button/button.vue';
import { OutsideDirective } from './outside';

export const Default = () => ({
  components: {
    GlButton,
  },
  directives: {
    outside: OutsideDirective,
  },
  data: () => ({
    clicks: 0,
  }),
  methods: {
    onClick() {
      this.clicks += 1;
    },
  },
  template: `<gl-button v-outside="onClick">Clicks outside me: {{ clicks }}</gl-button>`,
});

Default.tags = ['skip-visual-test'];

export default {
  title: 'directives/outside-directive',
  component: OutsideDirective,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/directives/outside) for usage and implementation details.',
      },
    },
  },
};

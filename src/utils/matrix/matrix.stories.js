import GlButton from '../../components/base/button/button.vue';
import GlCard from '../../components/base/card/card.vue';
import { matrix } from './matrix';

const rainHost = {
  data() {
    return {
      stop: null,
    };
  },
  beforeDestroy() {
    this.cancel();
  },
  computed: {
    options() {
      return {
        duration: this.duration,
        ...(this.colors ? { colors: this.colors.split(',').map((entry) => entry.trim()) } : {}),
      };
    },
  },
  methods: {
    rain(options) {
      const running = this.stop;
      const stop = matrix(options);

      this.stop = () => {
        running?.();
        stop();
      };
    },
    cancel() {
      this.stop?.();
      this.stop = null;
    },
  },
};

const generateProps = ({ duration = 6000, colors = '' } = {}) => ({ duration, colors });

export const Default = (args, { argTypes }) => ({
  components: { GlButton },
  mixins: [rainHost],
  props: Object.keys(argTypes),
  template: `
    <div class="gl-flex gl-gap-3">
      <gl-button variant="confirm" @click="rain(options)">Start matrix</gl-button>
      <gl-button @click="cancel">Stop</gl-button>
    </div>
  `,
});
Default.args = generateProps();

export const ConfinedToAnElement = (args, { argTypes }) => ({
  components: { GlButton, GlCard },
  mixins: [rainHost],
  props: Object.keys(argTypes),
  template: `
    <div class="gl-flex gl-flex-col gl-items-start gl-gap-5">
      <p>In this example, the matrix text is confined just to the card body:</p>
      
      <gl-card ref="card" class="gl-h-62 gl-w-88" body-class="js-rain-target">
      <template #header>Matrix example</template>
      <div class="gl-flex gl-flex-col gl-w-full gl-h-full gl-items-center gl-justify-center">
      <p>
        Card content
      </p>
      <gl-button variant="confirm" @click="rain({ ...options, boundary: $refs.card.$el.querySelector('.js-rain-target') })">Start matrix</gl-button>
        </div>
      </gl-card>
    </div>
  `,
});
ConfinedToAnElement.args = generateProps();

export default {
  title: 'utilities/effects/matrix',
  component: matrix,
  parameters: {
    docs: {
      description: {
        component: `\`matrix()\` rains \`G\` and \`L\` glyphs down the screen, then removes its own canvas. It is deliberately absent from the Pajamas documentation and lives only here.

Every argument is optional, so \`matrix()\` on its own rains over the whole viewport in the brand colors. Pass \`boundary\` to keep the rain inside an element. Each column falls at its own speed in one color, led by a head glyph in the default text color, and the trail behind it fades out. The returned function stops the rain early. Only one run happens at a time, so a call made while another is still on screen does nothing. Nothing happens when the user prefers reduced motion.`,
      },
    },
  },
  argTypes: {
    duration: {
      control: 'number',
      description: 'How long the rain runs, in milliseconds.',
    },
    colors: {
      control: 'text',
      description:
        'Comma separated CSS colors. Each column picks one at random. Leave empty for the brand colors.',
    },
  },
  tags: ['skip-visual-test'],
};

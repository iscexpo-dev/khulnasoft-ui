import GlAvatar from '../../components/base/avatar/avatar.vue';
import GlButton from '../../components/base/button/button.vue';
import GlCard from '../../components/base/card/card.vue';
import GlDrawer from '../../components/base/drawer/drawer.vue';
import GlModal from '../../components/base/modal/modal.vue';
import GlTableLite from '../../components/base/table_lite/table_lite.vue';
import { confetti } from './confetti';

const TARGETS = ['none', 'button', 'avatar', 'card', 'table'];

const TABLE_ITEMS = [
  { pipeline: '#1138', stage: 'deploy', status: 'passed' },
  { pipeline: '#1139', stage: 'test', status: 'passed' },
  { pipeline: '#1140', stage: 'build', status: 'passed' },
  { pipeline: '#1141', stage: 'deploy', status: 'passed' },
];

const burstHost = {
  data() {
    return {
      stop: null,
    };
  },
  beforeDestroy() {
    this.cancel();
  },
  methods: {
    burst(options) {
      const running = this.stop;
      const stop = confetti(options);

      this.stop = () => {
        running?.();
        stop();
      };
    },
    cancel() {
      this.stop?.();
      this.stop = null;
    },
    resolve(name) {
      const reference = this.$refs[name];

      return reference?.$el ?? reference;
    },
  },
};

const scenarioControls = { controls: { exclude: ['origin', 'boundary'] } };

const MODAL_ID = 'confetti-modal';

const generateProps = ({
  count = null,
  duration = 3000,
  colors = '',
  origin = 'none',
  boundary = 'none',
} = {}) => ({
  count,
  duration,
  colors,
  origin,
  boundary,
});

const burstOptions = {
  computed: {
    options() {
      return {
        duration: this.duration,
        ...(this.count ? { count: Number(this.count) } : {}),
        ...(this.colors ? { colors: this.colors.split(',').map((entry) => entry.trim()) } : {}),
      };
    },
  },
};

export const Default = (args, { argTypes }) => ({
  components: { GlAvatar, GlButton, GlCard, GlTableLite },
  mixins: [burstHost, burstOptions],
  props: Object.keys(argTypes),
  methods: {
    fire() {
      this.burst({
        ...this.options,
        ...(this.origin === 'none' ? {} : { origin: this.resolve(this.origin) }),
        ...(this.boundary === 'none' ? {} : { boundary: this.resolve(this.boundary) }),
      });
    },
  },
  template: `
    <div class="gl-flex gl-flex-col gl-items-start gl-gap-5">
      <div class="gl-flex gl-gap-3">
        <gl-button ref="button" variant="confirm" @click="fire">Fire confetti</gl-button>
        <gl-button @click="cancel">Stop</gl-button>
      </div>

      <p class="gl-mb-0 gl-text-subtle">Pick an <code>origin</code> and a <code>boundary</code> from the controls, then fire. An origin that sits outside the boundary is clipped away, so nothing shows.</p>

      <div class="gl-flex gl-flex-wrap gl-items-start gl-gap-5">
        <gl-avatar ref="avatar" :size="96" shape="rect" entity-name="KhulnaSoft" />

        <gl-card ref="card" class="gl-w-62">
          <template #header>Deploy</template>
          Everything shipped.
        </gl-card>

        <gl-table-lite ref="table" :items="items" class="gl-w-88" />
      </div>
    </div>
  `,
  data() {
    return {
      items: TABLE_ITEMS,
    };
  },
});
Default.args = generateProps();

export const FromAnAvatar = (args, { argTypes }) => ({
  components: { GlAvatar, GlButton },
  mixins: [burstHost, burstOptions],
  props: Object.keys(argTypes),
  template: `
    <div class="gl-flex gl-h-screen gl-flex-col gl-items-center gl-justify-center gl-gap-5">
      <gl-avatar ref="avatar" :size="64" shape="circle" entity-name="Ada" />
      <gl-button variant="confirm" @click="burst({ ...options, origin: resolve('avatar') })">Congratulate Ada</gl-button>
    </div>
  `,
});
FromAnAvatar.args = generateProps();
FromAnAvatar.parameters = scenarioControls;

export const InsideAModal = (args, { argTypes }) => ({
  components: { GlButton, GlModal },
  mixins: [burstHost, burstOptions],
  props: Object.keys(argTypes),
  data() {
    return {
      visible: false,
      modalId: MODAL_ID,
    };
  },
  methods: {
    celebrate() {
      this.burst({
        ...this.options,
        boundary: document.querySelector(`#${MODAL_ID} .modal-content`),
      });
    },
  },
  template: `
    <div>
      <gl-button variant="confirm" @click="visible = true">Open modal</gl-button>

      <gl-modal v-model="visible" :modal-id="modalId" title="Your trial is live" :action-primary="{ text: 'Done' }" @hidden="cancel">
        <p>Fourteen days of everything, starting now.</p>
        <gl-button variant="confirm" @click="celebrate">Celebrate</gl-button>
      </gl-modal>
    </div>
  `,
});
InsideAModal.args = generateProps();
InsideAModal.parameters = scenarioControls;

export const InsideADrawer = (args, { argTypes }) => ({
  components: { GlButton, GlDrawer },
  mixins: [burstHost, burstOptions],
  props: Object.keys(argTypes),
  data() {
    return {
      open: false,
    };
  },
  methods: {
    close() {
      this.open = false;
      this.cancel();
    },
  },
  template: `
    <div>
      <gl-button variant="confirm" @click="open = true">Open drawer</gl-button>

      <gl-drawer ref="drawer" :open="open" @close="close">
        <template #title><h3 class="gl-heading-3 gl-mb-0">Review complete</h3></template>
        <div class="gl-flex gl-flex-col gl-items-start gl-gap-4">
          <p class="gl-mb-0">Every thread resolved.</p>
          <gl-button variant="confirm" @click="burst({ ...options, boundary: resolve('drawer') })">Celebrate</gl-button>
        </div>
      </gl-drawer>
    </div>
  `,
});
InsideADrawer.args = generateProps();
InsideADrawer.parameters = scenarioControls;

export const InsideATable = (args, { argTypes }) => ({
  components: { GlButton, GlTableLite },
  mixins: [burstHost, burstOptions],
  props: Object.keys(argTypes),
  data() {
    return {
      items: TABLE_ITEMS,
    };
  },
  template: `
    <div class="gl-flex gl-flex-col gl-items-start gl-gap-5">
      <gl-button variant="confirm" @click="burst({ ...options, boundary: resolve('table') })">All green</gl-button>
      <gl-table-lite ref="table" :items="items" />
    </div>
  `,
});
InsideATable.args = generateProps();
InsideATable.parameters = scenarioControls;

export default {
  title: 'utilities/effects/confetti',
  component: confetti,
  parameters: {
    docs: {
      description: {
        component: `\`confetti()\` bursts a field of dithered pixel blocks, lets it fall, then removes its own canvas. It is deliberately absent from the Pajamas documentation and lives only here.

Every argument is optional, so \`confetti()\` on its own fires from the bottom corners of the viewport in the brand colors. Pass \`origin\` to burst from an element's center instead, \`boundary\` to confine the confetti to an element, or both. The blocks shrink as they fall and as they fade, and the ones furthest back start smaller, which gives the field its depth. The returned function stops the animation early. Only one burst runs at a time, so a call made while another is still on screen does nothing. Nothing happens when the user prefers reduced motion.

\`origin\` and \`boundary\` take elements, so the stories below pass a component's \`$el\`. The scenario stories show that against real components: bursting from an avatar, and confining a burst to a modal, a drawer, or a table.`,
      },
    },
  },
  argTypes: {
    count: {
      control: 'number',
      description: 'Number of pieces. Leave empty to scale the count to the area it plays in.',
    },
    duration: {
      control: 'number',
      description: 'How long the animation runs, in milliseconds.',
    },
    colors: {
      control: 'text',
      description:
        'Comma separated CSS colors for the coverage ramp, sparse to dense. The fringe colors are taken from it too. Leave empty for the brand ramp.',
    },
    origin: {
      control: 'select',
      options: TARGETS,
      description: 'Element to burst from. `none` fires from the bottom corners instead.',
    },
    boundary: {
      control: 'select',
      options: TARGETS,
      description: 'Element to confine the confetti to. `none` uses the whole viewport.',
    },
  },
  tags: ['skip-visual-test'],
};

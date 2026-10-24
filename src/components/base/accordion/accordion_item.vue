<script>
import { uniqueId } from 'lodash-es';
import GlCollapse from '../collapse/collapse.vue';
import GlAnimatedChevronRightDownIcon from '../animated_icon/animated_chevron_right_down_icon.vue';
import GlButton from '../button/button.vue';
import { COLLAPSE_EVENT } from './constants';

export default {
  name: 'GlAccordionItem',
  components: {
    GlCollapse,
    GlButton,
    GlAnimatedChevronRightDownIcon,
  },
  inject: ['defaultHeaderLevel', 'autoCollapse'],
  inheritAttrs: false,
  model: {
    prop: 'visible',
    event: 'input',
  },
  props: {
    /**
     * Used to set the title of accordion link
     */
    title: {
      type: String,
      required: true,
    },
    /**
     * Used to set the title of accordion link when the content is visible
     * */
    titleVisible: {
      type: String,
      default: null,
      required: false,
    },
    /**
     * When set, it will ensure the accordion item is initially visible
     */
    visible: {
      type: Boolean,
      default: false,
      required: false,
    },
    /**
     * The header tag used in the accordion (h1/h2/h3/h4/h5/h6). This overrides the value provided by GlAccordion. For accessibility this should be set to an appropriate value in the context where the accordion is used.,
     */
    headerLevel: {
      type: Number,
      required: false,
      default: null,
      validator(value) {
        return value > 0 && value <= 6;
      },
    },
    /**
     * Additional CSS class(es) to be applied to the header
     */
    headerClass: {
      type: [String, Object, Array],
      required: false,
      default: '',
    },
  },
  data() {
    return {
      accordionItemId: uniqueId('accordion-item-'),
      localVisible: this.visible,
    };
  },
  computed: {
    headerComponent() {
      const level = this.headerLevel || this.defaultHeaderLevel;
      return `h${level}`;
    },
    buttonTitle() {
      return this.localVisible && this.titleVisible ? this.titleVisible : this.title;
    },
  },

  watch: {
    visible: {
      handler(newVisible) {
        this.localVisible = newVisible;

        this.checkAndCollapseSiblingAccordionItems(newVisible);
      },
    },
  },
  created() {
    this.$emit('input', this.localVisible);
  },
  mounted() {
    this.$parent.$el.addEventListener(COLLAPSE_EVENT, this.onParentCollapse);
  },
  beforeDestroy() {
    this.$parent.$el.removeEventListener(COLLAPSE_EVENT, this.onParentCollapse);
  },
  methods: {
    onParentCollapse({ detail: accordionItemId }) {
      if (accordionItemId === this.accordionItemId) {
        return;
      }

      this.$emit('input', false);
      this.localVisible = false;
    },
    onButtonClick() {
      const newLocalVisible = !this.localVisible;

      this.$emit('input', newLocalVisible);
      this.localVisible = newLocalVisible;

      this.checkAndCollapseSiblingAccordionItems(newLocalVisible);
    },
    checkAndCollapseSiblingAccordionItems(newVisible) {
      if (this.autoCollapse && newVisible) {
        this.$parent.$el.dispatchEvent(
          new CustomEvent(COLLAPSE_EVENT, { detail: this.accordionItemId }),
        );
      }
    },
  },
};
</script>

<template>
  <div class="gl-accordion-item">
    <component :is="headerComponent" class="gl-accordion-item-header" :class="headerClass">
      <gl-button
        class="gl-max-w-full"
        variant="link"
        button-text-classes="gl-flex gl-items-start gl-gap-2"
        :aria-expanded="localVisible ? 'true' : 'false'"
        :aria-controls="accordionItemId"
        @click="onButtonClick"
      >
        <gl-animated-chevron-right-down-icon :is-on="localVisible" class="gl-shrink-0" />
        <span class="gl-min-w-0 gl-text-wrap gl-break-words gl-text-left">
          {{ buttonTitle }}
        </span>
      </gl-button>
    </component>
    <gl-collapse
      :id="accordionItemId"
      v-model="localVisible"
      :data-testid="`accordion-item-collapse-${accordionItemId}`"
    >
      <div class="gl-mt-3 gl-text-base">
        <!-- @slot Item content -->
        <slot></slot>
      </div>
    </gl-collapse>
  </div>
</template>

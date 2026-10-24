import { propDefaultFactory } from "../../../utils/stories_utils";
import GlTruncate from "./truncate.vue";
import { POSITION } from "./constants";

const template = `
  <gl-truncate
    :text="text"
    :position="position"
    :with-tooltip="withTooltip"
  />
`;

const propDefault = propDefaultFactory(GlTruncate);

const generateProps = ({
  text = "src/thisIs/AVeryLongFilePath/that/needs/to/be/smartly/truncated/from/the/middle/so/we/dont/lose/important/information/here.vue",
  position = propDefault("position"),
  withTooltip = propDefault("withTooltip"),
} = {}) => ({
  text,
  position,
  withTooltip,
});

const makeStory =
  (options) =>
  (args, { argTypes }) => ({
    components: {
      GlTruncate,
    },
    props: Object.keys(argTypes),
    template,
    ...options,
  });

export const Default = makeStory();
Default.args = generateProps();

export const PositionStart = makeStory();
PositionStart.args = generateProps({ position: POSITION.START });

export const PositionMiddle = makeStory();
PositionMiddle.args = generateProps({ position: POSITION.MIDDLE });

// This is a regression test against https://github.com/khulnasoft/khulnasoft/issues/515533
// Correct rendering in both cases should be "Gap here" (single space).
// Incorrect rendering would be anything else, like "Gaphere" (no space) or
// "Gap  here" (double space).
export const WhitespacePreservation = makeStory({
  template: `
  <div>
    <gl-truncate
      text="Gap here"
      position="middle"
    />
    <br>
    <gl-truncate
      text="Gap       here"
      position="middle"
    />
  </div>
`,
});
WhitespacePreservation.parameters = {
  controls: {
    // Hide all controls, as this story is used as a visual test only.
    exclude: /.*/,
  },
};

export default {
  title: "utilities/truncate",
  component: GlTruncate,
  parameters: {
    viewport: {
      defaultViewport: "breakpointSmall",
    },
    docs: {
      description: {
        component:
          "See [Pajamas Design System documentation](https://design.khulnasoft.com/components/utility-truncate) for usage and implementation details.",
      },
    },
  },
  argTypes: {
    text: {
      control: "text",
    },
    position: {
      options: Object.values(POSITION),
      control: "select",
    },
    withTooltip: {
      control: "boolean",
    },
  },
};

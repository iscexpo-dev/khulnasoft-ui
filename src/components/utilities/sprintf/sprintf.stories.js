import GlButton from '../../base/button/button.vue';
import GlLink from '../../base/link/link.vue';
import GlSprintf from './sprintf.vue';

const generateProps = ({ message = 'Written by %{author}', placeholders } = {}) => ({
  message,
  placeholders,
});

const makeStory =
  (options) =>
  (args, { argTypes }) => ({
    components: {
      GlSprintf,
      GlButton,
      GlLink,
    },
    props: Object.keys(argTypes),
    ...options,
  });

export const SentenceWithLink = makeStory({
  template: `
    <div class="gl-text-base">
      <gl-sprintf :message="message" :placeholders="placeholders">
        <template #link="{ content }">
          <gl-link href="#" target="_blank">{{ content }}</gl-link>
        </template>
      </gl-sprintf>
    </div>
  `,
});
Object.assign(SentenceWithLink, {
  args: generateProps({
    message: 'Click %{linkStart}here%{linkEnd} to reticulate splines.',
  }),
  tags: ['skip-visual-test'],
});

export const SentenceWithLinkWithCustomPlaceholders = makeStory({
  template: `
    <div class="gl-text-base">
      <gl-sprintf :message="message" :placeholders="placeholders">
        <template #link="{ content }">
          <gl-link href="#" target="_blank">{{ content }}</gl-link>
        </template>
      </gl-sprintf>
    </div>
  `,
});
Object.assign(SentenceWithLinkWithCustomPlaceholders, {
  args: generateProps({
    message: 'Click %{my_custom_start}here%{my_custom_end} to reticulate splines.',
    placeholders: { link: ['my_custom_start', 'my_custom_end'] },
  }),
  tags: ['skip-visual-test'],
});

export const BasicPlaceholder = makeStory({
  data: () => ({ authorName: 'Some author' }),
  template: `
    <div class="gl-text-base">
      <gl-sprintf :message="message" :placeholders="placeholders">
        <template #author>
          <span class="gl-font-bold">{{ authorName }}</span>
        </template>
      </gl-sprintf>
    </div>
  `,
});
Object.assign(BasicPlaceholder, {
  args: generateProps(),
  tags: ['skip-visual-test'],
});

export const BasicButtonPlaceholder = makeStory({
  data: () => ({ authorName: 'Some author' }),
  template: `
    <div class="gl-text-base">
      <gl-sprintf :message="message" :placeholders="placeholders">
        <template #author>
          <gl-button>{{ authorName }}</gl-button>
        </template>
      </gl-sprintf>
    </div>
  `,
});
Object.assign(BasicButtonPlaceholder, {
  args: generateProps(),
  tags: ['skip-visual-test'],
});

export default {
  title: 'utilities/sprintf',
  component: GlSprintf,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/components/utility-sprintf) for usage and implementation details.',
      },
    },
  },
};

import figma, { html } from '@figma/code-connect/html';

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=120518-1489',
  {
    variant: { 'Has sub-label': 'false' },
    props: {
      label: figma.string('Label'),
      inlineLabels: figma.enum('Is stacked', { true: '', false: 'inline-labels' }),
      avatar: figma.nestedProps('Avatar', {
        size: figma.enum('Size', {
          '16': 16,
          '24': 24,
          '32': 32,
          '48': 48,
          '64': 64,
          '96': 96,
        }),
        shape: figma.enum('Variant', {
          circle: 'circle',
          square: 'rect',
        }),
      }),
    },
    example: ({ label, inlineLabels, avatar }) => html`
      <gl-avatar-labeled
        src="https://example.com/avatar.jpg"
        :size="${avatar.size}"
        shape="${avatar.shape}"
        label="${label}"
        ${inlineLabels}
      />
    `,
    imports: ["import { GlAvatarLabeled } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=120518-1489',
  {
    variant: { 'Has sub-label': 'true' },
    props: {
      label: figma.string('Label'),
      subLabel: figma.string('↳ Sub-label'),
      inlineLabels: figma.enum('Is stacked', { true: '', false: 'inline-labels' }),
      avatar: figma.nestedProps('Avatar', {
        size: figma.enum('Size', {
          '16': 16,
          '24': 24,
          '32': 32,
          '48': 48,
          '64': 64,
          '96': 96,
        }),
        shape: figma.enum('Variant', {
          circle: 'circle',
          square: 'rect',
        }),
      }),
    },
    example: ({ label, subLabel, inlineLabels, avatar }) => html`
      <gl-avatar-labeled
        src="https://example.com/avatar.jpg"
        :size="${avatar.size}"
        shape="${avatar.shape}"
        label="${label}"
        sub-label="${subLabel}"
        ${inlineLabels}
      />
    `,
    imports: ["import { GlAvatarLabeled } from '@khulnasoft/ui'"],
  },
);

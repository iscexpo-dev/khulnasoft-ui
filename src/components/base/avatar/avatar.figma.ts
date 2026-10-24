import figma, { html } from '@figma/code-connect/html';

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=120518-1434',
  {
    variant: { 'Is fallback': 'false' },
    props: {
      shape: figma.enum('Variant', {
        circle: 'circle',
        square: 'rect',
      }),
      size: figma.enum('Size', {
        '16': 16,
        '24': 24,
        '32': 32,
        '48': 48,
        '64': 64,
        '96': 96,
      }),
    },
    example: ({ shape, size }) => html`
      <gl-avatar src="https://example.com/avatar.jpg" :size="${size}" shape="${shape}" />
    `,
    imports: ["import { GlAvatar } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=120518-1434',
  {
    variant: { 'Is fallback': 'true', Variant: 'square' },
    props: {
      size: figma.enum('Size', {
        '16': 16,
        '24': 24,
        '32': 32,
        '48': 48,
        '64': 64,
        '96': 96,
      }),
    },
    example: ({ size }) => html`
      <gl-avatar entity-name="KhulnaSoft" :entity-id="1" :size="${size}" shape="rect" />
    `,
    imports: ["import { GlAvatar } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=120518-1434',
  {
    variant: { 'Is fallback': 'true', Variant: 'circle' },
    props: {
      size: figma.enum('Size', {
        '16': 16,
        '24': 24,
        '32': 32,
        '48': 48,
        '64': 64,
        '96': 96,
      }),
    },
    example: ({ size }) => html`
      <gl-avatar src="https://example.com/avatar.jpg" :size="${size}" shape="circle" />
    `,
    imports: ["import { GlAvatar } from '@khulnasoft/ui'"],
  },
);
